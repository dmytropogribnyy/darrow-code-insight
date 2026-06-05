// CORE v4 manual diagnostic — pure logic (options, plan, validation, snapshot).
//
// DIAGNOSTIC-ONLY · NOT production. No AI call lives here. No pipeline / Supabase /
// email / Stripe / route. The CLI runner orchestrates these helpers; tests cover
// them with no real AI. Validation reuses the EXISTING staged v4 contract:
//   CoreV4Schema · evaluateCoreV4Structure · evaluateCoreV4Lengths
// Nothing is reimplemented.

import {
  CoreV4Schema,
  CORE_V4_BODY_SECTION_KEYS,
  EXECUTIVE_SUMMARY_LABELS,
  CLOSING_PILLAR_TITLES,
} from "@/lib/ai/schema";
import {
  evaluateCoreV4Structure,
  evaluateCoreV4Lengths,
  CORE_V4_KEYS,
} from "@/lib/ai/diagnostic.server";
import {
  validateAnchors,
  formatAnchorReport,
  type AnchorAvailability,
  type AnchorValidationResult,
} from "./core-v4-anchors";

export const CORE_V4_DIAGNOSTIC_DEFAULT_MODEL = "claude-sonnet-4-6";
export const CORE_V4_DIAGNOSTIC_DEFAULT_OUT_DIR = "outputs/core-v4-diagnostic";

export interface DiagnosticOptions {
  /** Real Anthropic call enabled. Default false (plan-only). */
  approveAiCall: boolean;
  /** Convenience: true when approveAiCall is false. */
  planOnly: boolean;
  model: string;
  fallbackModel?: string;
  mode: "sequential" | "parallel";
  outDir: string;
  renderHtml: boolean;
  renderPdf: boolean;
  /** Path to an existing report/core JSON to re-render WITHOUT any AI call. */
  fromJson?: string;
}

// Env-driven options (the CLI runs under Vitest, which has no argv flags, so the
// "flags" are environment variables). Plan-only is the safe default.
export function parseDiagnosticOptionsFromEnv(
  env: Record<string, string | undefined>,
): DiagnosticOptions {
  const truthy = (v: string | undefined) => v === "1" || v?.toLowerCase() === "true";
  const approveAiCall = truthy(env.CORE_V4_APPROVE_AI);
  const render = (env.CORE_V4_RENDER ?? "")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    approveAiCall,
    planOnly: !approveAiCall,
    model: env.CORE_V4_MODEL?.trim() || CORE_V4_DIAGNOSTIC_DEFAULT_MODEL,
    fallbackModel: env.CORE_V4_FALLBACK_MODEL?.trim() || undefined,
    mode: env.CORE_V4_MODE === "parallel" ? "parallel" : "sequential",
    outDir: env.CORE_V4_OUT_DIR?.trim() || CORE_V4_DIAGNOSTIC_DEFAULT_OUT_DIR,
    renderHtml: render.includes("html") || render.includes("all"),
    renderPdf: render.includes("pdf") || render.includes("all"),
    fromJson: env.CORE_V4_FROM_JSON?.trim() || undefined,
  };
}

// Accepts either a full report ({ modules: { CORE } }) or a bare CORE module and
// returns the CORE module. Used by the re-render-from-JSON path (no AI).
export function extractCoreModule(loaded: any): any {
  if (loaded?.modules?.CORE) return loaded.modules.CORE;
  return loaded;
}

export function buildPlan(options: DiagnosticOptions): string {
  const lines = [
    "── CORE v4 manual diagnostic — PLAN ─────────────────────────────",
    `  mode:           ${options.mode}`,
    `  model:          ${options.model}`,
    `  fallback model: ${options.fallbackModel ?? "(none)"}`,
    `  out dir:        ${options.outDir}`,
    `  render html:    ${options.renderHtml ? "yes" : "no"}`,
    `  render pdf:     ${options.renderPdf ? "yes" : "no"}`,
    `  AI call:        ${options.approveAiCall ? "APPROVED (will call Anthropic)" : "NOT approved — plan-only"}`,
    "",
  ];
  if (options.planOnly) {
    lines.push(
      "  PLAN-ONLY: no Anthropic call, no FreeAstroAPI call, no files written.",
      "  To run the real generation (uses tokens), set:",
      "    CORE_V4_APPROVE_AI=1   (and ANTHROPIC_API_KEY must be present)",
      "    e.g. CORE_V4_APPROVE_AI=1 CORE_V4_RENDER=html,pdf npm run diagnostic:core-v4",
    );
  } else {
    lines.push(
      "  APPROVED: will call Anthropic via generateCoreV4Split(), validate with",
      "  CoreV4Schema + evaluateCoreV4Structure + evaluateCoreV4Lengths, and write",
      "  artifacts to the out dir. No Supabase, no email, no checkout, no route.",
    );
  }
  return lines.join("\n");
}

export class AiCallNotApprovedError extends Error {}
export class MissingApiKeyError extends Error {}

// Guard for the real-generation path. Throws clearly when prerequisites are unmet.
export function assertCanRunAi(
  options: DiagnosticOptions,
  env: Record<string, string | undefined>,
): void {
  if (!options.approveAiCall) {
    throw new AiCallNotApprovedError(
      "AI call not approved. Set CORE_V4_APPROVE_AI=1 to run a real v4 generation.",
    );
  }
  if (!env.ANTHROPIC_API_KEY) {
    throw new MissingApiKeyError("ANTHROPIC_API_KEY is not set — cannot run an approved AI call.");
  }
}

export interface CoreV4ValidationResult {
  schemaPass: boolean;
  schemaIssues: string[];
  structuralIssues: Array<{ code: string; detail?: string }>;
  lengthDiags: ReturnType<typeof evaluateCoreV4Lengths>;
  checks: {
    beforeAfterPairs: number | null;
    execLabelOrderOk: boolean;
    closingPillarOrderOk: boolean;
    proofTagsMaxOk: boolean;
    missingSections: string[];
    underTargetSections: string[];
  };
  /** Anchor / data-availability validation (present only when availability supplied). */
  anchors?: AnchorValidationResult;
}

// Runs the full staged validation stack against a generated CORE module. When
// `availability` is supplied (derived from the run's input chart), anchor /
// data-availability validation is included.
export function runCoreV4Validation(
  coreModule: any,
  availability?: AnchorAvailability,
): CoreV4ValidationResult {
  const parsed = CoreV4Schema.safeParse(coreModule);
  const schemaIssues = parsed.success
    ? []
    : parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);

  const report = { generated_modules: ["CORE"], modules: { CORE: coreModule } };
  const structuralIssues = evaluateCoreV4Structure(report);
  const lengthDiags = evaluateCoreV4Lengths(coreModule);

  const execBlocks = coreModule?.executive_summary?.executive_summary_blocks;
  const execLabelOrderOk =
    Array.isArray(execBlocks) &&
    execBlocks.length === EXECUTIVE_SUMMARY_LABELS.length &&
    execBlocks.every((b: any, i: number) => b?.label === EXECUTIVE_SUMMARY_LABELS[i]);

  const pillars = coreModule?.next_step?.closing_pillars;
  const closingPillarOrderOk =
    Array.isArray(pillars) &&
    pillars.length === CLOSING_PILLAR_TITLES.length &&
    pillars.every((p: any, i: number) => p?.title === CLOSING_PILLAR_TITLES[i]);

  const proofTagsMaxOk = CORE_V4_BODY_SECTION_KEYS.every((k) => {
    const tags = coreModule?.[k]?.proof_tags;
    return !Array.isArray(tags) || tags.length <= 5;
  });

  const missingSections = CORE_V4_KEYS.filter((k) => !coreModule || !(k in coreModule));
  const underTargetSections = lengthDiags
    .filter((d) => d.status === "WARN_UNDER_TARGET")
    .map((d) => d.section);

  const anchors = availability ? validateAnchors(coreModule, availability) : undefined;

  return {
    schemaPass: parsed.success,
    schemaIssues,
    structuralIssues,
    lengthDiags,
    checks: {
      beforeAfterPairs: Array.isArray(coreModule?.before_after?.before_after_pairs)
        ? coreModule.before_after.before_after_pairs.length
        : null,
      execLabelOrderOk,
      closingPillarOrderOk,
      proofTagsMaxOk,
      missingSections,
      underTargetSections,
    },
    anchors,
  };
}

export function formatValidationReport(v: CoreV4ValidationResult): string {
  const ok = (b: boolean) => (b ? "PASS" : "FAIL");
  const lines = [
    "── CORE v4 validation ───────────────────────────────────────────",
    `  CoreV4Schema:           ${ok(v.schemaPass)}`,
    `  structural issues:      ${v.structuralIssues.length === 0 ? "none" : v.structuralIssues.map((i) => i.code + (i.detail ? `(${i.detail})` : "")).join(", ")}`,
    `  before_after pairs:     ${v.checks.beforeAfterPairs ?? "n/a"} (expected 2)`,
    `  exec label order:       ${ok(v.checks.execLabelOrderOk)}`,
    `  closing pillar order:   ${ok(v.checks.closingPillarOrderOk)}`,
    `  proof_tags ≤ 5:         ${ok(v.checks.proofTagsMaxOk)}`,
    `  missing sections:       ${v.checks.missingSections.length === 0 ? "none" : v.checks.missingSections.join(", ")}`,
    `  under word target:      ${v.checks.underTargetSections.length === 0 ? "none" : v.checks.underTargetSections.join(", ")}`,
    `  anchor validation:      ${v.anchors ? (v.anchors.pass ? "PASS" : `FAIL (${v.anchors.violations.length} violation${v.anchors.violations.length === 1 ? "" : "s"})`) : "not run (no availability)"}`,
  ];
  if (v.anchors && !v.anchors.pass) {
    lines.push("");
    lines.push(formatAnchorReport(v.anchors));
  }
  if (v.schemaIssues.length > 0) {
    lines.push("  schema issues:");
    for (const s of v.schemaIssues.slice(0, 8)) lines.push(`    - ${s}`);
  }
  lines.push("  word counts by section:");
  for (const d of v.lengthDiags) {
    const flag = d.status === "WARN_UNDER_TARGET" ? " ⚠" : "";
    lines.push(
      `    ${d.section.padEnd(26)} ${String(d.actual_words).padStart(4)}w (target ${d.target_word_lo}-${d.target_word_hi})${flag}`,
    );
  }
  return lines.join("\n");
}

// ── Local diagnostic Client Snapshot (Personal Orientation System) ────────────
//
// NOT a generated body key and NOT an identity_card key — `CoreV4Schema.strict()`
// rejects those. This is render-only metadata, assembled locally from the generated
// CORE content so the diagnostic PDF can show the Client Snapshot page. The
// production bridge (computing this from chart/numerology/BaZi metadata) is deferred
// to B6 — see docs/b5.1-core-v4-ai-prompt-hardening.md §7.

export interface DiagnosticClientSnapshot {
  pattern_name: string;
  core_pattern: string;
  unique_signature: string;
  primary_strength: string;
  pressure_point: string;
  best_operating_rhythm: string;
  current_timing_theme: string;
  practical_focus: string;
}

function firstSentence(s: unknown, fallback: string): string {
  if (typeof s !== "string" || !s.trim()) return fallback;
  return s.trim();
}

function execBlockContent(core: any, label: string, fallback: string): string {
  const blocks = core?.executive_summary?.executive_summary_blocks;
  if (Array.isArray(blocks)) {
    const b = blocks.find((x: any) => x?.label === label);
    if (b && typeof b.content === "string" && b.content.trim()) return b.content.trim();
  }
  return fallback;
}

// Assembles a render-only snapshot from the generated CORE. Does NOT mutate the
// core module and does NOT add any body/identity key to it.
export function buildCoreV4DiagnosticClientSnapshot(
  clientName: string,
  generatedCore: any,
): DiagnosticClientSnapshot {
  return {
    pattern_name: firstSentence(
      generatedCore?.professional_archetype?.opening_line,
      `${clientName} — Diagnostic Architecture`,
    ),
    core_pattern: firstSentence(
      generatedCore?.core_architecture?.opening_line ?? generatedCore?.cover_tagline,
      "Diagnostic core pattern.",
    ),
    unique_signature: firstSentence(
      generatedCore?.orientation?.opening_line,
      "Diagnostic unique signature.",
    ),
    primary_strength: execBlockContent(generatedCore, "YOUR CORE ADVANTAGE", "—"),
    pressure_point: execBlockContent(generatedCore, "YOUR PRIMARY SENSITIVITY", "—"),
    best_operating_rhythm: firstSentence(
      generatedCore?.operating_mode?.opening_line ?? generatedCore?.drive_and_rhythm?.opening_line,
      "—",
    ),
    current_timing_theme: execBlockContent(generatedCore, "CURRENT CYCLE", "—"),
    practical_focus: execBlockContent(generatedCore, "THE NEXT LEVEL", "—"),
  };
}
