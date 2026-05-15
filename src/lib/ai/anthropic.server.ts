// Anthropic client (fetch-based, Workers-compatible).
// - Uses Messages API with tool_use to force structured JSON output.
// - Model selection driven by ANTHROPIC_MODEL_DEFAULT / FALLBACK env vars.
// - Caches the system prompt via cache_control.
// - Retries with the fallback model on retryable failures.

import { DarrowReportSchema, darrowReportJsonSchema, type DarrowReport } from "./schema";
import { DARROW_SYSTEM_PROMPT } from "./system-prompt";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MAX_TOKENS = 12000;
const TOOL_NAME = "emit_darrow_report";

interface CallArgs {
  userPrompt: string;
  model: string;
}

async function callAnthropic({ userPrompt, model }: CallArgs): Promise<DarrowReport> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: "text",
          text: DARROW_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [
        {
          name: TOOL_NAME,
          description: "Emit the final Darrow report as structured JSON.",
          input_schema: darrowReportJsonSchema,
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAME },
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Anthropic ${res.status}: ${text.slice(0, 500)}`);
    (err as any).status = res.status;
    throw err;
  }

  const data = (await res.json()) as any;
  const toolBlock = (data?.content ?? []).find(
    (b: any) => b?.type === "tool_use" && b?.name === TOOL_NAME,
  );
  if (!toolBlock) throw new Error("Anthropic returned no tool_use block");

  const parsed = DarrowReportSchema.safeParse(toolBlock.input);
  if (!parsed.success) {
    throw new Error(`Anthropic output failed schema: ${parsed.error.message.slice(0, 400)}`);
  }
  return parsed.data;
}

export interface GenerateResult {
  report: DarrowReport;
  model_used: string;
}

export async function generateDarrowReport(userPrompt: string): Promise<GenerateResult> {
  const def = process.env.ANTHROPIC_MODEL_DEFAULT;
  const fb = process.env.ANTHROPIC_MODEL_FALLBACK;
  if (!def) throw new Error("ANTHROPIC_MODEL_DEFAULT is not configured");

  try {
    const report = await callAnthropic({ userPrompt, model: def });
    return { report, model_used: def };
  } catch (e: any) {
    const status = e?.status as number | undefined;
    const retryable = !status || status >= 500 || status === 429 || status === 408;
    if (!fb || !retryable) throw e;
    console.warn(`[anthropic] default model failed, falling back to ${fb}:`, e?.message);
    const report = await callAnthropic({ userPrompt, model: fb });
    return { report, model_used: fb };
  }
}
