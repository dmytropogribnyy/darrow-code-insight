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
const MODEL_TIMEOUT_MS = 6 * 60 * 1000;
const KNOWN_MODULES = ["CORE", "LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"];

interface CallArgs {
  userPrompt: string;
  model: string;
}

async function callAnthropic({ userPrompt, model }: CallArgs): Promise<DarrowReport> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      signal: controller.signal,
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
  } catch (e: any) {
    if (controller.signal.aborted) {
      throw new Error(`Anthropic ${model} timed out after ${Math.round(MODEL_TIMEOUT_MS / 1000)}s`);
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }

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

function requestedModules(userPrompt: string): string[] {
  const modulesLine = userPrompt.match(/Modules to include \(in order\):\s*(.+)/)?.[1] ?? "CORE";
  const modules = modulesLine
    .split(",")
    .map((m) => m.trim().toUpperCase())
    .filter((m) => KNOWN_MODULES.includes(m));
  return modules.includes("CORE") ? modules : ["CORE", ...modules];
}

function promptForModules(userPrompt: string, modules: string[]): string {
  const replaced = userPrompt.replace(
    /Modules to include \(in order\):\s*.+/,
    `Modules to include (in order): ${modules.join(", ")}`,
  );
  return `${replaced}\n\nGeneration scope for this call: return generated_modules exactly ${modules.join(", ")}. Do not include paid modules outside this scope.`;
}

async function callWithFallback(userPrompt: string, firstModel: string, fallbackModel?: string): Promise<GenerateResult> {
  try {
    const report = await callAnthropic({ userPrompt, model: firstModel });
    return { report, model_used: firstModel };
  } catch (e: any) {
    const status = e?.status as number | undefined;
    const retryable = !status || status >= 500 || status === 429 || status === 408;
    if (!fallbackModel || fallbackModel === firstModel || !retryable) throw e;
    console.warn(`[anthropic] ${firstModel} failed, falling back to ${fallbackModel}:`, e?.message);
    const report = await callAnthropic({ userPrompt, model: fallbackModel });
    return { report, model_used: fallbackModel };
  }
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function generateChunkedReport(userPrompt: string, modules: string[], model: string, fallbackModel?: string): Promise<GenerateResult> {
  console.log("[anthropic] using chunked generation", { modules });
  const core = await callWithFallback(promptForModules(userPrompt, ["CORE"]), model, fallbackModel);
  const addons = modules.filter((m) => m !== "CORE");
  const addonResults = await mapWithConcurrency(addons, 2, async (moduleCode) => {
    const result = await callWithFallback(promptForModules(userPrompt, ["CORE", moduleCode]), model, fallbackModel);
    const moduleBody = result.report.modules?.[moduleCode];
    if (!moduleBody) throw new Error(`Anthropic chunk returned no ${moduleCode} module`);
    return { moduleCode, moduleBody, model_used: result.model_used };
  });

  const merged: DarrowReport = {
    ...core.report,
    generated_modules: modules,
    modules: { CORE: core.report.modules.CORE },
    closing: {
      ...core.report.closing,
      grand_synthesis: core.report.closing.grand_synthesis ?? core.report.closing.executive_summary,
    },
  };
  for (const chunk of addonResults) merged.modules[chunk.moduleCode] = chunk.moduleBody;
  const parsed = DarrowReportSchema.safeParse(merged);
  if (!parsed.success) throw new Error(`Merged Anthropic chunks failed schema: ${parsed.error.message.slice(0, 400)}`);
  return { report: parsed.data, model_used: Array.from(new Set([core.model_used, ...addonResults.map((r) => r.model_used)])).join("+") };
}

export async function generateDarrowReport(userPrompt: string): Promise<GenerateResult> {
  const def = process.env.ANTHROPIC_MODEL_DEFAULT;
  const fb = process.env.ANTHROPIC_MODEL_FALLBACK;
  const premium = process.env.ANTHROPIC_MODEL_PREMIUM;
  if (!def) throw new Error("ANTHROPIC_MODEL_DEFAULT is not configured");
  const modules = requestedModules(userPrompt);
  if (modules.length >= 4) return generateChunkedReport(userPrompt, modules, def, fb);

  const firstModel = modules.length >= 3 && premium ? premium : def;
  return callWithFallback(userPrompt, firstModel, fb);
}
