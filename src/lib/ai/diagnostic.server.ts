// Diagnostic-only AI runner for CORE v3.
//
// Bypasses Zod superRefine length checks so a short section produces a
// WARN_UNDER_TARGET line instead of triggering a costly retry cascade.
// Used ONLY by /api/public/debug/core-v3-run. Production paid pipeline
// still uses generateDarrowReport() with strict validation.

import { darrowReportJsonSchema } from "./schema";
import { DARROW_SYSTEM_PROMPT } from "./system-prompt";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const TOOL_NAME = "emit_darrow_report";
const MAX_TOKENS = 12000;
const MODEL_TIMEOUT_MS = 10 * 60 * 1000;

// 17 CORE v3 keys with character minimum + word target (lo, hi).
export const CORE_V3_TARGETS: Record<string, { min_chars: number; word_lo: number; word_hi: number }> = {
  cover_tagline: { min_chars: 50, word_lo: 10, word_hi: 20 },
  orientation: { min_chars: 700, word_lo: 180, word_hi: 220 },
  core_architecture: { min_chars: 1000, word_lo: 280, word_hi: 340 },
  battery: { min_chars: 800, word_lo: 220, word_hi: 260 },
  social_interface: { min_chars: 750, word_lo: 200, word_hi: 240 },
  numerology_code: { min_chars: 900, word_lo: 260, word_hi: 300 },
  cognitive_style: { min_chars: 750, word_lo: 200, word_hi: 240 },
  drive_and_rhythm: { min_chars: 750, word_lo: 200, word_hi: 240 },
  professional_archetype: { min_chars: 800, word_lo: 220, word_hi: 260 },
  money_and_value: { min_chars: 750, word_lo: 200, word_hi: 240 },
  relationship_baseline: { min_chars: 750, word_lo: 200, word_hi: 240 },
  vitality_baseline: { min_chars: 650, word_lo: 180, word_hi: 220 },
  environment_and_resonance: { min_chars: 650, word_lo: 180, word_hi: 220 },
  shadow_and_friction: { min_chars: 900, word_lo: 240, word_hi: 280 },
  before_after: { min_chars: 450, word_lo: 120, word_hi: 160 },
  executive_summary: { min_chars: 1000, word_lo: 280, word_hi: 320 },
  next_step: { min_chars: 300, word_lo: 80, word_hi: 120 },
};

export const CORE_V3_KEYS = Object.keys(CORE_V3_TARGETS);

export interface LengthDiag {
  section: string;
  actual_chars: number;
  expected_min_chars: number;
  actual_words: number;
  target_word_lo: number;
  target_word_hi: number;
  status: "OK" | "WARN_UNDER_TARGET";
}

export function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function evaluateCoreV3Lengths(coreMod: any): LengthDiag[] {
  const diags: LengthDiag[] = [];
  for (const [key, t] of Object.entries(CORE_V3_TARGETS)) {
    const v = typeof coreMod?.[key] === "string" ? (coreMod[key] as string) : "";
    const actual_chars = v.length;
    const actual_words = v ? wordCount(v) : 0;
    const under = actual_chars < t.min_chars || actual_words < t.word_lo;
    diags.push({
      section: key,
      actual_chars,
      expected_min_chars: t.min_chars,
      actual_words,
      target_word_lo: t.word_lo,
      target_word_hi: t.word_hi,
      status: under ? "WARN_UNDER_TARGET" : "OK",
    });
  }
  return diags;
}

export interface StructuralIssue {
  code:
    | "MISSING_SCHEMA_VERSION"
    | "WRONG_SCHEMA_VERSION"
    | "MISSING_CORE_MODULE"
    | "MISSING_SECTION_KEY"
    | "EMPTY_SECTION"
    | "MISSING_CLIENT_SNAPSHOT"
    | "MISSING_GENERATED_MODULES"
    | "INVALID_JSON";
  detail?: string;
}

export function evaluateStructure(report: any): StructuralIssue[] {
  const issues: StructuralIssue[] = [];
  if (!report || typeof report !== "object") {
    issues.push({ code: "INVALID_JSON" });
    return issues;
  }
  if (!Array.isArray(report.generated_modules) || report.generated_modules.length === 0) {
    issues.push({ code: "MISSING_GENERATED_MODULES" });
  }
  if (!report.client_snapshot || typeof report.client_snapshot !== "object") {
    issues.push({ code: "MISSING_CLIENT_SNAPSHOT" });
  }
  const core = report?.modules?.CORE;
  if (!core) {
    issues.push({ code: "MISSING_CORE_MODULE" });
    return issues;
  }
  if (!core.schema_version) issues.push({ code: "MISSING_SCHEMA_VERSION" });
  else if (core.schema_version !== "core_v3")
    issues.push({ code: "WRONG_SCHEMA_VERSION", detail: String(core.schema_version) });
  for (const k of CORE_V3_KEYS) {
    if (!(k in core)) issues.push({ code: "MISSING_SECTION_KEY", detail: k });
    else if (typeof core[k] !== "string" || core[k].trim().length === 0)
      issues.push({ code: "EMPTY_SECTION", detail: k });
  }
  return issues;
}

export interface DiagAiResult {
  raw_report: any;
  model_used: string;
  api_call_count: number;
  ms_total: number;
}

export async function generateCoreV3Diagnostic(userPrompt: string, model: string): Promise<DiagAiResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  const started = Date.now();

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
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
        system: [{ type: "text", text: DARROW_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        tools: [
          { name: TOOL_NAME, description: "Emit the final Darrow report as structured JSON.", input_schema: darrowReportJsonSchema },
        ],
        tool_choice: { type: "tool", name: TOOL_NAME },
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
  } catch (e: any) {
    if (controller.signal.aborted)
      throw new Error(`Anthropic ${model} timed out after ${Math.round(MODEL_TIMEOUT_MS / 1000)}s`);
    throw e;
  } finally {
    clearTimeout(t);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = (await res.json()) as any;
  const toolBlock = (data?.content ?? []).find((b: any) => b?.type === "tool_use" && b?.name === TOOL_NAME);
  if (!toolBlock) throw new Error("Anthropic returned no tool_use block");
  return {
    raw_report: toolBlock.input,
    model_used: model,
    api_call_count: 1,
    ms_total: Date.now() - started,
  };
}
