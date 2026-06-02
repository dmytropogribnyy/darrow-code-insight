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
import { coreSectionJsonSchemaFor } from "./schema";

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
        system: [
          { type: "text", text: DARROW_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
        ],
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
