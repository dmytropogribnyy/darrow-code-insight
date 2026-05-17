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
        temperature: 0.75,
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
  return modules.length > 0 ? modules : ["CORE"];
}

function promptForModules(userPrompt: string, modules: string[]): string {
  const replaced = userPrompt.replace(
    /Modules to include \(in order\):\s*.+/,
    `Modules to include (in order): ${modules.join(", ")}`,
  );
  const isCoreComplete = modules.length === 7;
  const focusLine = isCoreComplete
    ? `Generation scope for this call: CORE Complete — return generated_modules exactly ${modules.join(", ")}. Apply the CORE COMPLETE assembly rules AND every PER-MODULE EXECUTION CHECKLIST entry for all 7 modules. Include closing.grand_synthesis (300-400 words).`
    : `Generation scope for this call: return generated_modules exactly ${modules.join(", ")}. Do not include paid modules outside this scope. Apply the PER-MODULE EXECUTION CHECKLIST entries for ${modules.join(" and ")} strictly — required data references, tradition anchor, synthesis requirement, mandatory output extras (module_snapshot, color_palette/color_names for STYLE), name-usage limits, forbidden phrases, and module-specific disclaimers (especially BODY soft disclaimer).`;
  return `${replaced}\n\n${focusLine}`;
}

const MAX_DEFAULT_ATTEMPTS = 3; // exp backoff 1s / 3s / 9s on retryable errors
const BACKOFF_MS = [1000, 3000, 9000];

function isRetryable(e: any): boolean {
  const status = e?.status as number | undefined;
  if (!status) return true; // network/abort/timeout — retry
  return status >= 500 || status === 429 || status === 408;
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function callWithFallback(userPrompt: string, firstModel: string, fallbackModel?: string): Promise<GenerateResult> {
  // 1) Up to MAX_DEFAULT_ATTEMPTS against the default model with exponential backoff.
  let lastErr: any;
  for (let attempt = 0; attempt < MAX_DEFAULT_ATTEMPTS; attempt++) {
    try {
      const report = await callAnthropic({ userPrompt, model: firstModel });
      return { report, model_used: firstModel };
    } catch (e: any) {
      lastErr = e;
      if (!isRetryable(e) || attempt === MAX_DEFAULT_ATTEMPTS - 1) break;
      const wait = BACKOFF_MS[attempt] ?? 9000;
      console.warn(`[anthropic] ${firstModel} attempt ${attempt + 1}/${MAX_DEFAULT_ATTEMPTS} failed (${e?.status ?? "net"}); retrying in ${wait}ms`);
      await sleep(wait);
    }
  }

  // 2) One last attempt on the fallback model, if configured + error was retryable.
  if (fallbackModel && fallbackModel !== firstModel && isRetryable(lastErr)) {
    console.warn(`[anthropic] ${firstModel} exhausted, falling back to ${fallbackModel}:`, lastErr?.message);
    try {
      const report = await callAnthropic({ userPrompt, model: fallbackModel });
      return { report, model_used: fallbackModel };
    } catch (fbErr) {
      throw fbErr;
    }
  }
  throw lastErr;
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
  const hasCore = modules.includes("CORE");
  // First call: CORE if present, otherwise the first chapter — it carries
  // client_snapshot + closing for the merged report.
  const firstModule = hasCore ? "CORE" : modules[0];
  const first = await callWithFallback(promptForModules(userPrompt, [firstModule]), model, fallbackModel);
  const rest = modules.filter((m) => m !== firstModule);
  const restResults = await mapWithConcurrency(rest, 2, async (moduleCode) => {
    // Include the first module as context so Claude keeps voice + pattern coherent.
    const result = await callWithFallback(promptForModules(userPrompt, [firstModule, moduleCode]), model, fallbackModel);
    const moduleBody = result.report.modules?.[moduleCode];
    if (!moduleBody) throw new Error(`Anthropic chunk returned no ${moduleCode} module`);
    return { moduleCode, moduleBody, model_used: result.model_used };
  });

  const firstBody = first.report.modules?.[firstModule];
  if (!firstBody) throw new Error(`Anthropic first chunk returned no ${firstModule} module`);
  const mergedModules: Record<string, any> = { [firstModule]: firstBody };
  for (const chunk of restResults) mergedModules[chunk.moduleCode] = chunk.moduleBody;

  const merged: DarrowReport = {
    ...first.report,
    generated_modules: modules,
    modules: mergedModules,
    closing: {
      ...first.report.closing,
      grand_synthesis: first.report.closing.grand_synthesis ?? first.report.closing.executive_summary,
    },
  };
  const parsed = DarrowReportSchema.safeParse(merged);
  if (!parsed.success) throw new Error(`Merged Anthropic chunks failed schema: ${parsed.error.message.slice(0, 400)}`);
  return { report: parsed.data, model_used: Array.from(new Set([first.model_used, ...restResults.map((r) => r.model_used)])).join("+") };
}

export async function generateDarrowReport(userPrompt: string): Promise<GenerateResult> {
  const def = process.env.ANTHROPIC_MODEL_DEFAULT;
  const fb = process.env.ANTHROPIC_MODEL_FALLBACK;
  const premium = process.env.ANTHROPIC_MODEL_PREMIUM;
  if (!def) throw new Error("ANTHROPIC_MODEL_DEFAULT is not configured");
  const modules = requestedModules(userPrompt);
  if (modules.length >= 4) return generateChunkedReport(userPrompt, modules, def, fb);

  const firstModel = modules.length >= 3 && premium ? premium : def;
  return callWithFallback(promptForModules(userPrompt, modules), firstModel, fb);
}
