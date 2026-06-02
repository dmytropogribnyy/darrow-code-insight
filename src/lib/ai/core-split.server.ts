// CORE v3 split generation — two Anthropic calls, each emitting half of
// the 17 CORE v3 sections, merged into a single production-compatible
// DarrowReport object.
//
// Why split: a single 17-section CORE v3 generation pushes Anthropic past
// ~8 min wall time and hits Cloudflare 524 between Anthropic and the
// Worker. Splitting into two ~5-6k-token calls drops each call well
// under that threshold. The two calls run in parallel.
//
// Used by:
//   - generateDarrowReport()      — production paid path (CORE)
//   - generateCoreV3SplitDiagnostic() — diagnostic route (warn-only lengths)

import { DARROW_SYSTEM_PROMPT } from "./system-prompt";
// Staged v4.1 runtime prompt — imported here for the v4 split path only.
// system-prompt.ts is NOT changed; production stays on the active v3 prompt.
// This raw import becomes active only when generateCoreV4Split() is called
// by the future v4 diagnostic route (B3+). Until then nothing calls it.
import darrowV4Prompt from "./darrowcode_ai_system_prompt_v4_1.md?raw";
import {
  coreSectionJsonSchemaFor,
  CORE_V4_BODY_SECTION_KEYS,
  EXECUTIVE_SUMMARY_LABELS,
  CLOSING_PILLAR_TITLES,
  CoreV4Schema,
} from "./schema";

// Exported so tests can assert the v4 path uses exactly this text.
export const DARROW_V4_SYSTEM_PROMPT: string = darrowV4Prompt;

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const TOOL_NAME_A = "emit_darrow_core_a";
const TOOL_NAME_B = "emit_darrow_core_b";
const MAX_TOKENS = 8000; // each half is ~5-6k tokens of content
const MODEL_TIMEOUT_MS = 6 * 60 * 1000;

// ─── Section partition ───────────────────────────────────────────────
export const CORE_V3_SECTIONS_A = [
  "cover_tagline",
  "orientation",
  "core_architecture",
  "battery",
  "social_interface",
  "numerology_code",
  "cognitive_style",
  "drive_and_rhythm",
  "professional_archetype",
] as const;

export const CORE_V3_SECTIONS_B = [
  "money_and_value",
  "relationship_baseline",
  "vitality_baseline",
  "environment_and_resonance",
  "shadow_and_friction",
  "before_after",
  "executive_summary",
  "next_step",
] as const;

// ─── Tool input JSON schemas ─────────────────────────────────────────
const stringProp = { type: "string" } as const;

function sectionProps(keys: readonly string[]): Record<string, any> {
  const out: Record<string, any> = {};
  for (const k of keys) out[k] = coreSectionJsonSchemaFor(k);
  return out;
}

const coreSplitASchema = {
  type: "object",
  required: ["client_name", "core_sections_a"],
  properties: {
    client_name: { type: "string" },
    core_sections_a: {
      type: "object",
      required: ["schema_version", ...CORE_V3_SECTIONS_A],
      properties: {
        schema_version: { type: "string", enum: ["core_v3"] },
        ...sectionProps(CORE_V3_SECTIONS_A),
        proof_tags: { type: "array", items: { type: "string" } },
      },
    },
  },
} as const;

const clientSnapshotSchema = {
  type: "object",
  required: [
    "pattern_name",
    "core_pattern",
    "unique_signature",
    "primary_strength",
    "pressure_point",
    "best_operating_rhythm",
    "current_timing_theme",
    "practical_focus",
    "recommended_next_module",
  ],
  properties: {
    pattern_name: stringProp,
    core_pattern: stringProp,
    unique_signature: stringProp,
    primary_strength: stringProp,
    pressure_point: stringProp,
    best_operating_rhythm: stringProp,
    current_timing_theme: stringProp,
    practical_focus: stringProp,
    recommended_next_module: stringProp,
  },
} as const;

const coreSplitBSchema = {
  type: "object",
  required: ["core_sections_b", "client_snapshot", "closing"],
  properties: {
    core_sections_b: {
      type: "object",
      required: [...CORE_V3_SECTIONS_B],
      properties: sectionProps(CORE_V3_SECTIONS_B),
    },
    client_snapshot: clientSnapshotSchema,
    closing: {
      type: "object",
      required: ["executive_summary", "recommended_next_module"],
      properties: {
        executive_summary: stringProp,
        recommended_next_module: stringProp,
        grand_synthesis: stringProp,
      },
    },
  },
} as const;

// ─── Anthropic call wrapper ──────────────────────────────────────────
interface SubCallArgs {
  userPrompt: string;
  model: string;
  toolName: string;
  inputSchema: any;
  toolDescription: string;
  // Optional override — defaults to DARROW_SYSTEM_PROMPT (v3 active prompt).
  // generateCoreV4Split passes DARROW_V4_SYSTEM_PROMPT; v3 paths pass nothing.
  systemPrompt?: string;
}

interface SubCallResult {
  input: any;
  model_used: string;
  ms: number;
}

async function callAnthropicSub({
  userPrompt,
  model,
  toolName,
  inputSchema,
  toolDescription,
  systemPrompt = DARROW_SYSTEM_PROMPT,
}: SubCallArgs): Promise<SubCallResult> {
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
        system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
        tools: [{ name: toolName, description: toolDescription, input_schema: inputSchema }],
        tool_choice: { type: "tool", name: toolName },
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
  } catch (e: any) {
    if (controller.signal.aborted)
      throw new Error(
        `Anthropic ${model} (${toolName}) timed out after ${Math.round(MODEL_TIMEOUT_MS / 1000)}s`,
      );
    throw e;
  } finally {
    clearTimeout(t);
  }
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Anthropic ${res.status} (${toolName}): ${text.slice(0, 400)}`);
    (err as any).status = res.status;
    throw err;
  }
  const data = (await res.json()) as any;
  const tool = (data?.content ?? []).find(
    (b: any) => b?.type === "tool_use" && b?.name === toolName,
  );
  if (!tool) throw new Error(`Anthropic returned no tool_use block for ${toolName}`);
  return { input: tool.input, model_used: model, ms: Date.now() - started };
}

function isRetryable(e: any): boolean {
  const status = e?.status as number | undefined;
  if (!status) return true;
  return status >= 500 || status === 429 || status === 408;
}

async function callSubWithFallback(
  args: SubCallArgs,
  fallbackModel?: string,
): Promise<SubCallResult> {
  try {
    return await callAnthropicSub(args);
  } catch (e: any) {
    if (fallbackModel && fallbackModel !== args.model && isRetryable(e)) {
      console.warn(
        `[core-split] ${args.toolName} on ${args.model} failed (${e?.status ?? "net"}): ${e?.message?.slice(0, 200)}; falling back to ${fallbackModel}`,
      );
      return await callAnthropicSub({ ...args, model: fallbackModel });
    }
    throw e;
  }
}

// ─── Per-half user-prompt suffixes ───────────────────────────────────
function suffixA(): string {
  return [
    "",
    "SPLIT GENERATION — CALL A (sections 1–9 of CORE v3.1).",
    "Return the tool payload `emit_darrow_core_a` with:",
    "  - client_name",
    "  - core_sections_a containing schema_version='core_v3' and EXACTLY these 9 sections:",
    `      ${CORE_V3_SECTIONS_A.join(", ")}`,
    "Do NOT return any other CORE sections — they will be generated in Call B.",
    "",
    "STRUCTURED CALLOUTS — read carefully:",
    "  cover_tagline + orientation → emit as a plain string (prose only).",
    "  core_architecture, battery, social_interface, numerology_code,",
    "  cognitive_style, drive_and_rhythm, professional_archetype →",
    "  emit as an OBJECT: { prose: string, protocols: [{title, body}], warning_signals?: [string] }.",
    "  battery and professional_archetype MUST include 1 warning_signals[] entry.",
    "  Other sections in this list MUST include 1 PROTOCOL.",
    "  Do NOT embed PROTOCOL: or Warning Signal: lines inside the prose anymore.",
    "  Each protocol.title is 3–5 words. Each protocol.body is 2–4 sentences.",
    "  Each warning_signal string is 2–3 sentences of observable behaviour.",
    "",
    "Per-section word target applies to the PROSE field only.",
    "Keep voice, tradition anchors, and proof_tags consistent — Call B will continue the same client.",
  ].join("\n");
}

// Compact, model-readable digest of Call A's content. Used in sequential
// mode so Call B can synthesise client_snapshot, executive_summary,
// shadow_and_friction continuity, etc. from the ACTUAL CORE v1–9 text
// rather than guessing from the chart alone.
function proseOf(v: any): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && typeof v.prose === "string") return v.prose;
  return "";
}

function buildCallASummary(client_name: string, sectionsA: any): string {
  function head(s: string | undefined, chars: number): string {
    if (!s) return "";
    const t = String(s).replace(/\s+/g, " ").trim();
    return t.length > chars ? t.slice(0, chars).trimEnd() + "…" : t;
  }
  const budgets: Record<string, number> = {
    cover_tagline: 200,
    orientation: 700,
    core_architecture: 1000,
    battery: 700,
    social_interface: 600,
    numerology_code: 600,
    cognitive_style: 600,
    drive_and_rhythm: 600,
    professional_archetype: 700,
  };
  const lines: string[] = [
    "CALL-A SUMMARY (verbatim excerpts from CORE v3.1 sections 1–9 just produced for this client).",
    "Use this as ground truth when writing sections 10–17, client_snapshot, and closing.",
    "Do NOT contradict the language, pattern names, or tradition anchors established below.",
    `client_name: ${client_name}`,
  ];
  for (const key of CORE_V3_SECTIONS_A) {
    lines.push(`--- ${key} (prose excerpt) ---`);
    lines.push(head(proseOf(sectionsA[key]), budgets[key] ?? 500));
  }
  if (Array.isArray(sectionsA.proof_tags) && sectionsA.proof_tags.length > 0) {
    lines.push("--- proof_tags (Call A) ---");
    lines.push(
      sectionsA.proof_tags
        .slice(0, 12)
        .map((t: any) => `- ${String(t)}`)
        .join("\n"),
    );
  }
  return lines.join("\n");
}

function suffixB(callASummary?: string): string {
  const base = [
    "",
    "SPLIT GENERATION — CALL B (sections 10–17 of CORE v3.1 + snapshot + closing).",
    "Return the tool payload `emit_darrow_core_b` with:",
    "  - core_sections_b containing EXACTLY these 8 sections:",
    `      ${CORE_V3_SECTIONS_B.join(", ")}`,
    "  - client_snapshot (full 9-field structure, synthesized from ALL 17 CORE v3.1 sections — sections 1–9 are provided below)",
    "  - closing.executive_summary (must integrate insights from BOTH halves; ≥ 40 chars)",
    "  - closing.recommended_next_module",
    "",
    "STRUCTURED CALLOUTS:",
    "  money_and_value, relationship_baseline, vitality_baseline,",
    "  environment_and_resonance → emit OBJECT { prose, protocols:[{title,body}] } with 1 PROTOCOL each.",
    "  shadow_and_friction → emit OBJECT { prose, warning_signals:[string] } with 1 Warning Signal, NO protocols.",
    "  before_after, executive_summary, next_step → plain string (prose only).",
    "  Do NOT embed PROTOCOL: or Warning Signal: lines inside the prose.",
    "",
    "Per-section word target applies to the PROSE field only.",
    "Keep voice, pattern naming, and tradition anchors consistent with Call A.",
    "shadow_and_friction MUST reference the architectural patterns from core_architecture / battery / drive_and_rhythm in Call A.",
    "next_step MUST be coherent with professional_archetype, drive_and_rhythm, and core_architecture in Call A.",
  ];
  if (callASummary) {
    base.push("");
    base.push("============ CALL-A CONTEXT (READ FIRST) ============");
    base.push(callASummary);
    base.push("=====================================================");
  }
  return base.join("\n");
}

// ─── Public: split generator ─────────────────────────────────────────
export type SplitMode = "sequential" | "parallel";

export interface CoreSplitResult {
  report: any;
  model_used: string;
  api_call_count: number;
  ms_total: number;
  mode: SplitMode;
  per_call: {
    a: { tool: "emit_darrow_core_a"; model: string; ms: number };
    b: { tool: "emit_darrow_core_b"; model: string; ms: number; received_call_a_context: boolean };
  };
}

export interface GenerateCoreV3SplitOptions {
  mode?: SplitMode;
}

function sectionPresent(v: any): boolean {
  if (typeof v === "string") return v.trim().length > 0;
  if (v && typeof v === "object" && typeof v.prose === "string") return v.prose.trim().length > 0;
  return false;
}

function validateCallA(aInput: any) {
  const sectionsA = aInput?.core_sections_a ?? {};
  if (!aInput?.client_name) throw new Error("[core-split] Call A missing client_name");
  // Tool schema requires schema_version="core_v3"; if Claude omits it, default
  // to core_v3 rather than hard-fail (the partition itself defines the version).
  if (!sectionsA.schema_version) {
    console.warn("[core-split] Call A omitted schema_version; defaulting to core_v3");
    sectionsA.schema_version = "core_v3";
  }
  if (sectionsA.schema_version !== "core_v3")
    throw new Error(`[core-split] Call A wrong schema_version: ${sectionsA.schema_version}`);
  for (const k of CORE_V3_SECTIONS_A) {
    if (!sectionPresent(sectionsA[k]))
      throw new Error(`[core-split] Call A missing or empty section: ${k}`);
  }
  return sectionsA;
}

function validateCallB(bInput: any) {
  const sectionsB = bInput?.core_sections_b ?? {};
  for (const k of CORE_V3_SECTIONS_B) {
    if (!sectionPresent(sectionsB[k]))
      throw new Error(`[core-split] Call B missing or empty section: ${k}`);
  }
  if (!bInput?.client_snapshot) throw new Error("[core-split] Call B missing client_snapshot");
  if (!bInput?.closing) throw new Error("[core-split] Call B missing closing");
  return sectionsB;
}

export async function generateCoreV3Split(
  userPrompt: string,
  model: string,
  fallbackModel?: string,
  opts: GenerateCoreV3SplitOptions = {},
): Promise<CoreSplitResult> {
  const mode: SplitMode = opts.mode ?? "sequential";
  const started = Date.now();
  console.log(`[core-split] starting ${mode} split CORE v3 generation`, { model });

  let a: SubCallResult;
  let b: SubCallResult;
  let bReceivedContext = false;

  if (mode === "sequential") {
    // Production quality: A → summarise → B
    a = await callSubWithFallback(
      {
        userPrompt: `${userPrompt}\n${suffixA()}`,
        model,
        toolName: TOOL_NAME_A,
        inputSchema: coreSplitASchema,
        toolDescription: "Emit CORE v3 sections 1–9 plus client_name.",
      },
      fallbackModel,
    );
    const sectionsA = validateCallA(a.input);
    const summary = buildCallASummary(a.input.client_name, sectionsA);
    bReceivedContext = true;
    b = await callSubWithFallback(
      {
        userPrompt: `${userPrompt}\n${suffixB(summary)}`,
        model,
        toolName: TOOL_NAME_B,
        inputSchema: coreSplitBSchema,
        toolDescription:
          "Emit CORE v3 sections 10–17 plus client_snapshot and closing, grounded in Call-A context.",
      },
      fallbackModel,
    );
  } else {
    // Diagnostic only: fire both in parallel, Call B blind.
    const both = await Promise.all([
      callSubWithFallback(
        {
          userPrompt: `${userPrompt}\n${suffixA()}`,
          model,
          toolName: TOOL_NAME_A,
          inputSchema: coreSplitASchema,
          toolDescription: "Emit CORE v3 sections 1–9 plus client_name.",
        },
        fallbackModel,
      ),
      callSubWithFallback(
        {
          userPrompt: `${userPrompt}\n${suffixB()}`,
          model,
          toolName: TOOL_NAME_B,
          inputSchema: coreSplitBSchema,
          toolDescription:
            "Emit CORE v3 sections 10–17 plus client_snapshot and closing (no Call-A context — diagnostic only).",
        },
        fallbackModel,
      ),
    ]);
    a = both[0];
    b = both[1];
    validateCallA(a.input);
  }

  const sectionsA = a.input.core_sections_a ?? {};
  const sectionsB = validateCallB(b.input);

  const coreModule = {
    schema_version: "core_v3" as const,
    ...Object.fromEntries(CORE_V3_SECTIONS_A.map((k) => [k, sectionsA[k]])),
    ...Object.fromEntries(CORE_V3_SECTIONS_B.map((k) => [k, sectionsB[k]])),
    ...(Array.isArray(sectionsA.proof_tags) ? { proof_tags: sectionsA.proof_tags } : {}),
  };

  const merged = {
    client_name: a.input.client_name,
    generated_modules: ["CORE"],
    client_snapshot: b.input.client_snapshot,
    modules: { CORE: coreModule },
    closing: b.input.closing,
  };

  const usedModels = Array.from(new Set([a.model_used, b.model_used]));
  console.log("[core-split] merged report built", {
    mode,
    model_used: usedModels.join("+"),
    ms_total: Date.now() - started,
    a_ms: a.ms,
    b_ms: b.ms,
    b_received_call_a_context: bReceivedContext,
  });

  return {
    report: merged,
    model_used: usedModels.join("+"),
    api_call_count: 2,
    ms_total: Date.now() - started,
    mode,
    per_call: {
      a: { tool: "emit_darrow_core_a", model: a.model_used, ms: a.ms },
      b: {
        tool: "emit_darrow_core_b",
        model: b.model_used,
        ms: b.ms,
        received_call_a_context: bReceivedContext,
      },
    },
  };
}

// ═════════════════════════════════════════════════════════════════════
// CORE v4.1 — STAGED split generation (NOT active in production).
//
// generateCoreV4Split() and the v4 tool schemas below prepare the v4.1
// split-generation path. They are NOT wired into the production paid pipeline
// or any active route, and are NOT used until a later authorized phase (B6+),
// after the v4 diagnostic JSON + PDF are approved. The active production path
// continues to use generateCoreV3Split() above. system-prompt.ts stays v3.
//
// v4 split partition (exact 17-body-key coverage, each key once):
//   Call A body (9): orientation … professional_archetype  (+ cover_tagline sub-field)
//   Call B body (8): money_and_value … next_step
// cover_tagline is a cover sub-field, NOT one of the 17 body keys.
// v4 has no `closing` object and no `recommended_next_module`.
// ═════════════════════════════════════════════════════════════════════

const TOOL_NAME_V4_A = "emit_darrow_core_v4_a";
const TOOL_NAME_V4_B = "emit_darrow_core_v4_b";

// First 9 body keys (positions 1–9 of CORE_V4_BODY_SECTION_KEYS).
export const CORE_V4_SECTIONS_A = CORE_V4_BODY_SECTION_KEYS.slice(0, 9) as readonly string[];
// Remaining 8 body keys (positions 10–17).
export const CORE_V4_SECTIONS_B = CORE_V4_BODY_SECTION_KEYS.slice(9) as readonly string[];

const protocolV4JsonSchema = {
  type: "object",
  required: ["title", "body"],
  properties: { title: { type: "string" }, body: { type: "string" } },
} as const;

// JSON schema for a regular v4 section. prose required; structured fields optional.
function coreV4StandardSectionJsonSchema() {
  return {
    type: "object",
    required: ["prose"],
    properties: {
      opening_line: { type: "string", maxLength: 120 },
      scenario: { type: "string" },
      prose: { type: "string" },
      key_insight: { type: "string" },
      protocols: { type: "array", items: protocolV4JsonSchema },
      warning_signals: { type: "array", items: { type: "string" } },
      proof_tags: { type: "array", items: { type: "string" }, maxItems: 5 },
    },
  } as const;
}

// Per-key v4 section JSON schema (special shapes for before_after /
// executive_summary / next_step; all others use the standard shape).
function coreV4SectionJsonSchemaFor(key: string): any {
  if (key === "before_after") {
    return {
      type: "object",
      required: ["before_after_pairs"],
      properties: {
        opening_line: { type: "string", maxLength: 120 },
        scenario: { type: "string" },
        prose: { type: "string" },
        key_insight: { type: "string" },
        before_after_pairs: {
          type: "array",
          minItems: 2,
          maxItems: 2,
          items: {
            type: "object",
            required: ["before", "after"],
            properties: { before: { type: "string" }, after: { type: "string" } },
          },
        },
        proof_tags: { type: "array", items: { type: "string" }, maxItems: 5 },
      },
    };
  }
  if (key === "executive_summary") {
    return {
      type: "object",
      required: ["executive_summary_blocks"],
      properties: {
        opening_line: { type: "string", maxLength: 120 },
        prose: { type: "string" },
        key_insight: { type: "string" },
        executive_summary_blocks: {
          type: "array",
          minItems: 6,
          maxItems: 6,
          items: {
            type: "object",
            required: ["label", "content"],
            properties: {
              label: { type: "string", enum: [...EXECUTIVE_SUMMARY_LABELS] },
              content: { type: "string" },
            },
          },
        },
        proof_tags: { type: "array", items: { type: "string" }, maxItems: 5 },
      },
    };
  }
  if (key === "next_step") {
    return {
      type: "object",
      required: ["closing_pillars"],
      properties: {
        opening_line: { type: "string", maxLength: 120 },
        prose: { type: "string" },
        key_insight: { type: "string" },
        closing_pillars: {
          type: "array",
          minItems: 4,
          maxItems: 4,
          items: {
            type: "object",
            required: ["title", "prose"],
            properties: {
              title: { type: "string", enum: [...CLOSING_PILLAR_TITLES] },
              prose: { type: "string" },
            },
          },
        },
        proof_tags: { type: "array", items: { type: "string" }, maxItems: 5 },
      },
    };
  }
  // vitality_baseline + all other regular sections use the standard shape.
  // The verbatim disclaimer is template-injected, so it is not requested here.
  return coreV4StandardSectionJsonSchema();
}

function sectionV4Props(keys: readonly string[]): Record<string, any> {
  const out: Record<string, any> = {};
  for (const k of keys) out[k] = coreV4SectionJsonSchemaFor(k);
  return out;
}

const coreV4SplitASchema = {
  type: "object",
  required: ["client_name", "cover_tagline", "core_sections_a"],
  properties: {
    client_name: { type: "string" },
    cover_tagline: { type: "string" },
    core_sections_a: {
      type: "object",
      required: ["schema_version", ...CORE_V4_SECTIONS_A],
      properties: {
        schema_version: { type: "string", enum: ["core_v4"] },
        ...sectionV4Props(CORE_V4_SECTIONS_A),
      },
    },
  },
} as const;

const coreV4SplitBSchema = {
  type: "object",
  required: ["core_sections_b"],
  properties: {
    core_sections_b: {
      type: "object",
      required: [...CORE_V4_SECTIONS_B],
      properties: sectionV4Props(CORE_V4_SECTIONS_B),
    },
  },
} as const;

// Exported for staging/inspection + tests. These are the v4 tool schemas the
// future authorized v4 generator will hand to Anthropic.
//
// ⚠️  The Anthropic tool schema is a first-pass shape guard only. It enforces
// field presence, basic types, and enum membership, but it cannot enforce
// z.tuple exact positional order (e.g. executive_summary_blocks must be in
// the precise label sequence, closing_pillars must use exact title order).
// CoreV4Schema.safeParse() is therefore run on the merged CORE module after
// both API calls complete — it is the authoritative final contract validator.
export const coreV4ToolSchemas = {
  toolNameA: TOOL_NAME_V4_A,
  toolNameB: TOOL_NAME_V4_B,
  splitASchema: coreV4SplitASchema,
  splitBSchema: coreV4SplitBSchema,
} as const;

function sectionV4Present(v: any): boolean {
  if (v && typeof v === "object") {
    if (typeof v.prose === "string" && v.prose.trim().length > 0) return true;
    if (Array.isArray(v.before_after_pairs) && v.before_after_pairs.length > 0) return true;
    if (Array.isArray(v.executive_summary_blocks) && v.executive_summary_blocks.length > 0)
      return true;
    if (Array.isArray(v.closing_pillars) && v.closing_pillars.length > 0) return true;
  }
  return false;
}

function validateCallV4A(aInput: any) {
  const sectionsA = aInput?.core_sections_a ?? {};
  if (!aInput?.client_name) throw new Error("[core-split-v4] Call A missing client_name");
  if (!aInput?.cover_tagline) throw new Error("[core-split-v4] Call A missing cover_tagline");
  if (!sectionsA.schema_version) {
    console.warn("[core-split-v4] Call A omitted schema_version; defaulting to core_v4");
    sectionsA.schema_version = "core_v4";
  }
  if (sectionsA.schema_version !== "core_v4")
    throw new Error(`[core-split-v4] Call A wrong schema_version: ${sectionsA.schema_version}`);
  for (const k of CORE_V4_SECTIONS_A) {
    if (!sectionV4Present(sectionsA[k]))
      throw new Error(`[core-split-v4] Call A missing or empty section: ${k}`);
  }
  return sectionsA;
}

function validateCallV4B(bInput: any) {
  const sectionsB = bInput?.core_sections_b ?? {};
  for (const k of CORE_V4_SECTIONS_B) {
    if (!sectionV4Present(sectionsB[k]))
      throw new Error(`[core-split-v4] Call B missing or empty section: ${k}`);
  }
  return sectionsB;
}

export interface CoreV4SplitResult {
  report: any;
  model_used: string;
  api_call_count: number;
  ms_total: number;
  mode: SplitMode;
  per_call: {
    a: { tool: typeof TOOL_NAME_V4_A; model: string; ms: number };
    b: {
      tool: typeof TOOL_NAME_V4_B;
      model: string;
      ms: number;
      received_call_a_context: boolean;
    };
  };
}

// STAGED v4 split generator. Mirrors the v3 two-call structure but emits the
// v4 contract (cover_tagline sub-field + 17 body keys, no closing, no
// recommended_next_module). Not called by production until B6+ authorization.
export async function generateCoreV4Split(
  userPrompt: string,
  model: string,
  fallbackModel?: string,
  opts: GenerateCoreV3SplitOptions = {},
): Promise<CoreV4SplitResult> {
  const mode: SplitMode = opts.mode ?? "sequential";
  const started = Date.now();
  console.log(`[core-split-v4] starting ${mode} split CORE v4 generation`, { model });

  let a: SubCallResult;
  let b: SubCallResult;
  let bReceivedContext = false;

  if (mode === "sequential") {
    a = await callSubWithFallback(
      {
        userPrompt: `${userPrompt}\n${suffixV4A()}`,
        model,
        toolName: TOOL_NAME_V4_A,
        inputSchema: coreV4SplitASchema,
        toolDescription: "Emit CORE v4 cover_tagline + body sections 1–9 plus client_name.",
        systemPrompt: DARROW_V4_SYSTEM_PROMPT,
      },
      fallbackModel,
    );
    const sectionsA = validateCallV4A(a.input);
    const summary = buildCallASummary(a.input.client_name, sectionsA);
    bReceivedContext = true;
    b = await callSubWithFallback(
      {
        userPrompt: `${userPrompt}\n${suffixV4B(summary)}`,
        model,
        toolName: TOOL_NAME_V4_B,
        inputSchema: coreV4SplitBSchema,
        toolDescription: "Emit CORE v4 body sections 10–17, grounded in Call-A context.",
        systemPrompt: DARROW_V4_SYSTEM_PROMPT,
      },
      fallbackModel,
    );
  } else {
    const both = await Promise.all([
      callSubWithFallback(
        {
          userPrompt: `${userPrompt}\n${suffixV4A()}`,
          model,
          toolName: TOOL_NAME_V4_A,
          inputSchema: coreV4SplitASchema,
          toolDescription: "Emit CORE v4 cover_tagline + body sections 1–9 plus client_name.",
          systemPrompt: DARROW_V4_SYSTEM_PROMPT,
        },
        fallbackModel,
      ),
      callSubWithFallback(
        {
          userPrompt: `${userPrompt}\n${suffixV4B()}`,
          model,
          toolName: TOOL_NAME_V4_B,
          inputSchema: coreV4SplitBSchema,
          toolDescription:
            "Emit CORE v4 body sections 10–17 (no Call-A context — diagnostic only).",
          systemPrompt: DARROW_V4_SYSTEM_PROMPT,
        },
        fallbackModel,
      ),
    ]);
    a = both[0];
    b = both[1];
    validateCallV4A(a.input);
  }

  const sectionsA = a.input.core_sections_a ?? {};
  const sectionsB = validateCallV4B(b.input);

  const coreModule = {
    schema_version: "core_v4" as const,
    cover_tagline: a.input.cover_tagline,
    ...Object.fromEntries(CORE_V4_SECTIONS_A.map((k) => [k, sectionsA[k]])),
    ...Object.fromEntries(CORE_V4_SECTIONS_B.map((k) => [k, sectionsB[k]])),
  };

  // Final contract validation: CoreV4Schema enforces exact tuple label/title
  // order, strict top-level keys, proof_tags ≤ 5, and all special shapes.
  // The Anthropic tool schema is only a first-pass guard — this is the truth.
  // Fail loud; do NOT coerce or silently accept a malformed module.
  const v4Validation = CoreV4Schema.safeParse(coreModule);
  if (!v4Validation.success) {
    const detail = v4Validation.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    console.error("[core-split-v4] merged CORE module failed CoreV4Schema validation", {
      issues: detail,
    });
    throw new Error(`[core-split-v4] merged CORE module failed CoreV4Schema validation: ${detail}`);
  }

  const merged = {
    client_name: a.input.client_name,
    generated_modules: ["CORE"],
    modules: { CORE: coreModule },
  };

  const usedModels = Array.from(new Set([a.model_used, b.model_used]));
  console.log("[core-split-v4] merged report built", {
    mode,
    model_used: usedModels.join("+"),
    ms_total: Date.now() - started,
  });

  return {
    report: merged,
    model_used: usedModels.join("+"),
    api_call_count: 2,
    ms_total: Date.now() - started,
    mode,
    per_call: {
      a: { tool: TOOL_NAME_V4_A, model: a.model_used, ms: a.ms },
      b: {
        tool: TOOL_NAME_V4_B,
        model: b.model_used,
        ms: b.ms,
        received_call_a_context: bReceivedContext,
      },
    },
  };
}

function suffixV4A(): string {
  return [
    "",
    "SPLIT GENERATION — CALL A (CORE v4.1: cover_tagline + body sections 1–9).",
    `Return the tool payload \`${TOOL_NAME_V4_A}\` with:`,
    "  - client_name",
    "  - cover_tagline (15–30 words, a single string — cover sub-field, NOT a body key)",
    "  - core_sections_a containing schema_version='core_v4' and EXACTLY these 9 body sections:",
    `      ${CORE_V4_SECTIONS_A.join(", ")}`,
    "Do NOT return any other CORE sections — they will be generated in Call B.",
    "Do NOT emit a closing object or recommended_next_module.",
    "Each regular section is an object { opening_line?, scenario?, prose, key_insight?,",
    "protocols?:[{title,body}], warning_signals?:[string], proof_tags?:[string ≤5] }.",
    "operating_mode is required at position 3.",
  ].join("\n");
}

function suffixV4B(callASummary?: string): string {
  const base = [
    "",
    "SPLIT GENERATION — CALL B (CORE v4.1: body sections 10–17).",
    `Return the tool payload \`${TOOL_NAME_V4_B}\` with:`,
    "  - core_sections_b containing EXACTLY these 8 body sections:",
    `      ${CORE_V4_SECTIONS_B.join(", ")}`,
    "Do NOT emit a closing object, client_snapshot, or recommended_next_module.",
    "",
    "SPECIAL SHAPES:",
    "  before_after → { before_after_pairs: EXACTLY 2 × {before, after} }.",
    "  executive_summary → { executive_summary_blocks: EXACTLY 6 × {label, content} }",
    "    with locked labels in order: YOUR CORE ADVANTAGE, YOUR PRIMARY SENSITIVITY,",
    "    YOUR DECISION FORMULA, THE CORE CONCLUSION, CURRENT CYCLE, THE NEXT LEVEL.",
    "  next_step → { closing_pillars: EXACTLY 4 × {title, prose} } with locked titles",
    "    in order: TRUST THE SIGNAL, BUILD THE BASE, RESPECT THE CYCLE, HONOR THE SPACE.",
    "  vitality_baseline → standard object; do NOT generate the disclaimer (template injects it).",
  ];
  if (callASummary) {
    base.push("");
    base.push("============ CALL-A CONTEXT (READ FIRST) ============");
    base.push(callASummary);
    base.push("=====================================================");
  }
  return base.join("\n");
}
