// Diagnostic-only AI runner for CORE v3.
//
// Bypasses Zod superRefine length checks so a short section produces a
// WARN_UNDER_TARGET line instead of triggering a costly retry cascade.
// Used ONLY by /api/public/debug/core-v3-run. Production paid pipeline
// still uses generateDarrowReport() with strict validation.

import { darrowReportJsonSchema, getCoreSectionProse, CORE_V4_BODY_SECTION_KEYS } from "./schema";
import { DARROW_SYSTEM_PROMPT } from "./system-prompt";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const TOOL_NAME = "emit_darrow_report";
const MAX_TOKENS = 12000;
const MODEL_TIMEOUT_MS = 10 * 60 * 1000;

// CORE v3.1 targets — richer reads, structured callouts.
// min_chars applies to prose only (callouts are extra).
export const CORE_V3_TARGETS: Record<
  string,
  { min_chars: number; word_lo: number; word_hi: number }
> = {
  cover_tagline: { min_chars: 50, word_lo: 15, word_hi: 25 },
  orientation: { min_chars: 800, word_lo: 200, word_hi: 250 },
  core_architecture: { min_chars: 1100, word_lo: 300, word_hi: 380 },
  battery: { min_chars: 900, word_lo: 250, word_hi: 300 },
  social_interface: { min_chars: 800, word_lo: 220, word_hi: 260 },
  numerology_code: { min_chars: 1000, word_lo: 280, word_hi: 320 },
  cognitive_style: { min_chars: 800, word_lo: 220, word_hi: 260 },
  drive_and_rhythm: { min_chars: 800, word_lo: 220, word_hi: 260 },
  professional_archetype: { min_chars: 900, word_lo: 240, word_hi: 280 },
  money_and_value: { min_chars: 800, word_lo: 220, word_hi: 260 },
  relationship_baseline: { min_chars: 800, word_lo: 220, word_hi: 260 },
  vitality_baseline: { min_chars: 750, word_lo: 200, word_hi: 240 },
  environment_and_resonance: { min_chars: 750, word_lo: 200, word_hi: 240 },
  shadow_and_friction: { min_chars: 1000, word_lo: 280, word_hi: 340 },
  before_after: { min_chars: 500, word_lo: 140, word_hi: 180 },
  executive_summary: { min_chars: 1100, word_lo: 300, word_hi: 360 },
  next_step: { min_chars: 350, word_lo: 100, word_hi: 130 },
};

export const CORE_V3_KEYS = Object.keys(CORE_V3_TARGETS);
export const CORE_V3_WORD_TARGET_RANGE: [number, number] = [3800, 4600];
export const CORE_V3_WORD_HARD_CAP = 5000;

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
    const v = getCoreSectionProse(coreMod?.[key]);
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
    else {
      const prose = getCoreSectionProse(core[k]);
      if (!prose || prose.trim().length === 0) issues.push({ code: "EMPTY_SECTION", detail: k });
    }
  }
  return issues;
}

export interface DiagAiResult {
  raw_report: any;
  model_used: string;
  api_call_count: number;
  ms_total: number;
}

export async function generateCoreV3Diagnostic(
  userPrompt: string,
  model: string,
): Promise<DiagAiResult> {
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
        system: [
          { type: "text", text: DARROW_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
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
  const toolBlock = (data?.content ?? []).find(
    (b: any) => b?.type === "tool_use" && b?.name === TOOL_NAME,
  );
  if (!toolBlock) throw new Error("Anthropic returned no tool_use block");
  return {
    raw_report: toolBlock.input,
    model_used: model,
    api_call_count: 1,
    ms_total: Date.now() - started,
  };
}

// ═════════════════════════════════════════════════════════════════════
// CORE v4.1 — STAGED diagnostic config + evaluators (NOT active).
//
// These targets, version markers, and evaluators support a future v4
// diagnostic route (created in a later phase). They do NOT create a route,
// call any API, or run generation here. The active v3 diagnostic above is
// unchanged. No build marker or pipeline change.
// ═════════════════════════════════════════════════════════════════════

export const CORE_V4_SCHEMA_VERSION = "core_v4" as const;
export const CORE_V4_REPORT_VERSION = "v4.1" as const;
export const CORE_V4_WORD_TARGET_RANGE: [number, number] = [4350, 5250];
export const CORE_V4_WORD_HARD_CAP = 6000;

// 17 generated body keys (cover_tagline is a cover sub-field, not counted here).
export const CORE_V4_KEYS: readonly string[] = CORE_V4_BODY_SECTION_KEYS;

// Per-section v4 word targets (from darrowcode_core_module_spec_v4_1.md §7).
// min_chars is a warn-only floor (≈ word_lo × 3.6); callouts/special shapes are extra.
export const CORE_V4_TARGETS: Record<
  string,
  { min_chars: number; word_lo: number; word_hi: number }
> = {
  orientation: { min_chars: 790, word_lo: 220, word_hi: 270 },
  core_architecture: { min_chars: 1370, word_lo: 380, word_hi: 460 },
  operating_mode: { min_chars: 935, word_lo: 260, word_hi: 310 },
  battery: { min_chars: 1045, word_lo: 290, word_hi: 340 },
  social_interface: { min_chars: 830, word_lo: 230, word_hi: 270 },
  numerology_code: { min_chars: 1225, word_lo: 340, word_hi: 400 },
  cognitive_style: { min_chars: 830, word_lo: 230, word_hi: 270 },
  drive_and_rhythm: { min_chars: 830, word_lo: 230, word_hi: 270 },
  professional_archetype: { min_chars: 1080, word_lo: 300, word_hi: 360 },
  money_and_value: { min_chars: 830, word_lo: 230, word_hi: 270 },
  relationship_baseline: { min_chars: 830, word_lo: 230, word_hi: 270 },
  vitality_baseline: { min_chars: 755, word_lo: 210, word_hi: 250 },
  environment_and_resonance: { min_chars: 755, word_lo: 210, word_hi: 250 },
  shadow_and_friction: { min_chars: 1225, word_lo: 340, word_hi: 400 },
  before_after: { min_chars: 575, word_lo: 160, word_hi: 200 },
  executive_summary: { min_chars: 1225, word_lo: 340, word_hi: 400 },
  next_step: { min_chars: 470, word_lo: 130, word_hi: 160 },
};

// v4-aware text extractor for word counting. Handles standard sections
// (prose + opening_line/scenario/key_insight) and the special shapes
// (before_after_pairs / executive_summary_blocks / closing_pillars).
export function getCoreV4SectionText(field: unknown): string {
  if (typeof field === "string") return field;
  if (!field || typeof field !== "object") return "";
  const f = field as any;
  const parts: string[] = [];
  for (const k of ["opening_line", "scenario", "prose", "key_insight"]) {
    if (typeof f[k] === "string") parts.push(f[k]);
  }
  if (Array.isArray(f.before_after_pairs)) {
    for (const p of f.before_after_pairs) {
      if (p && typeof p === "object") parts.push(String(p.before ?? ""), String(p.after ?? ""));
    }
  }
  if (Array.isArray(f.executive_summary_blocks)) {
    for (const b of f.executive_summary_blocks) {
      if (b && typeof b === "object") parts.push(String(b.content ?? ""));
    }
  }
  if (Array.isArray(f.closing_pillars)) {
    for (const p of f.closing_pillars) {
      if (p && typeof p === "object") parts.push(String(p.prose ?? ""));
    }
  }
  return parts.filter(Boolean).join(" ");
}

export function evaluateCoreV4Lengths(coreMod: any): LengthDiag[] {
  const diags: LengthDiag[] = [];
  for (const [key, t] of Object.entries(CORE_V4_TARGETS)) {
    const v = getCoreV4SectionText(coreMod?.[key]);
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

// v4 structural check. Recognizes schema_version "core_v4", the 17 body keys,
// and cover_tagline as a required cover sub-field. Does not require the v3
// closing / client_snapshot report shape.
export function evaluateCoreV4Structure(report: any): StructuralIssue[] {
  const issues: StructuralIssue[] = [];
  if (!report || typeof report !== "object") {
    issues.push({ code: "INVALID_JSON" });
    return issues;
  }
  if (!Array.isArray(report.generated_modules) || report.generated_modules.length === 0) {
    issues.push({ code: "MISSING_GENERATED_MODULES" });
  }
  const core = report?.modules?.CORE;
  if (!core) {
    issues.push({ code: "MISSING_CORE_MODULE" });
    return issues;
  }
  if (!core.schema_version) issues.push({ code: "MISSING_SCHEMA_VERSION" });
  else if (core.schema_version !== CORE_V4_SCHEMA_VERSION)
    issues.push({ code: "WRONG_SCHEMA_VERSION", detail: String(core.schema_version) });
  if (!core.cover_tagline || String(core.cover_tagline).trim().length === 0)
    issues.push({ code: "MISSING_SECTION_KEY", detail: "cover_tagline" });
  for (const k of CORE_V4_KEYS) {
    if (!(k in core)) issues.push({ code: "MISSING_SECTION_KEY", detail: k });
    else {
      const text = getCoreV4SectionText(core[k]);
      if (!text || text.trim().length === 0) issues.push({ code: "EMPTY_SECTION", detail: k });
    }
  }
  return issues;
}
