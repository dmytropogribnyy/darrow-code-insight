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

function sectionProps(keys: readonly string[]): Record<string, { type: "string" }> {
  const out: Record<string, { type: "string" }> = {};
  for (const k of keys) out[k] = stringProp;
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
      throw new Error(`Anthropic ${model} (${toolName}) timed out after ${Math.round(MODEL_TIMEOUT_MS / 1000)}s`);
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
  const tool = (data?.content ?? []).find((b: any) => b?.type === "tool_use" && b?.name === toolName);
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
    "SPLIT GENERATION — CALL A (sections 1–9 of CORE v3).",
    "Return the tool payload `emit_darrow_core_a` with:",
    "  - client_name",
    "  - core_sections_a containing schema_version='core_v3' and EXACTLY these 9 sections:",
    `      ${CORE_V3_SECTIONS_A.join(", ")}`,
    "Do NOT return any other CORE sections — they will be generated in Call B.",
    "Treat each section's word-count target from the system prompt as REQUIRED.",
    "Keep voice, tradition anchors, and proof_tags consistent — call B will continue the same client.",
  ].join("\n");
}

function suffixB(): string {
  return [
    "",
    "SPLIT GENERATION — CALL B (sections 10–17 of CORE v3 + snapshot + closing).",
    "Return the tool payload `emit_darrow_core_b` with:",
    "  - core_sections_b containing EXACTLY these 8 sections:",
    `      ${CORE_V3_SECTIONS_B.join(", ")}`,
    "  - client_snapshot (full 9-field structure, synthesized from ALL 17 CORE v3 sections)",
    "  - closing.executive_summary (mirror of core executive_summary, ≥ 40 chars)",
    "  - closing.recommended_next_module",
    "Treat each section's word-count target from the system prompt as REQUIRED.",
    "Keep voice and tradition anchors consistent with the same client's Call A.",
  ].join("\n");
}

// ─── Public: split generator ─────────────────────────────────────────
export interface CoreSplitResult {
  // Production-compatible DarrowReport-shaped object (modules.CORE = full 17 sections).
  report: any;
  model_used: string; // e.g. "claude-sonnet-4-6" or "claude-sonnet-4-6+claude-sonnet-4-5"
  api_call_count: number;
  ms_total: number;
  per_call: {
    a: { tool: "emit_darrow_core_a"; model: string; ms: number };
    b: { tool: "emit_darrow_core_b"; model: string; ms: number };
  };
}

export async function generateCoreV3Split(
  userPrompt: string,
  model: string,
  fallbackModel?: string,
): Promise<CoreSplitResult> {
  const started = Date.now();
  console.log("[core-split] starting parallel split CORE v3 generation", { model });

  const [a, b] = await Promise.all([
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
        toolDescription: "Emit CORE v3 sections 10–17 plus client_snapshot and closing.",
      },
      fallbackModel,
    ),
  ]);

  const aIn = a.input ?? {};
  const bIn = b.input ?? {};
  const sectionsA = aIn.core_sections_a ?? {};
  const sectionsB = bIn.core_sections_b ?? {};

  // Hard structural checks (warn-only on length is enforced upstream).
  if (!aIn.client_name) throw new Error("[core-split] Call A missing client_name");
  if (!sectionsA.schema_version) throw new Error("[core-split] Call A missing schema_version");
  if (sectionsA.schema_version !== "core_v3")
    throw new Error(`[core-split] Call A wrong schema_version: ${sectionsA.schema_version}`);
  for (const k of CORE_V3_SECTIONS_A) {
    if (typeof sectionsA[k] !== "string" || sectionsA[k].trim().length === 0)
      throw new Error(`[core-split] Call A missing or empty section: ${k}`);
  }
  for (const k of CORE_V3_SECTIONS_B) {
    if (typeof sectionsB[k] !== "string" || sectionsB[k].trim().length === 0)
      throw new Error(`[core-split] Call B missing or empty section: ${k}`);
  }
  if (!bIn.client_snapshot) throw new Error("[core-split] Call B missing client_snapshot");
  if (!bIn.closing) throw new Error("[core-split] Call B missing closing");

  // Merge into production-shaped DarrowReport.
  const coreModule = {
    schema_version: "core_v3" as const,
    ...Object.fromEntries(CORE_V3_SECTIONS_A.map((k) => [k, sectionsA[k]])),
    ...Object.fromEntries(CORE_V3_SECTIONS_B.map((k) => [k, sectionsB[k]])),
    ...(Array.isArray(sectionsA.proof_tags) ? { proof_tags: sectionsA.proof_tags } : {}),
  };

  const merged = {
    client_name: aIn.client_name,
    generated_modules: ["CORE"],
    client_snapshot: bIn.client_snapshot,
    modules: { CORE: coreModule },
    closing: bIn.closing,
  };

  const usedModels = Array.from(new Set([a.model_used, b.model_used]));
  console.log("[core-split] merged report built", {
    model_used: usedModels.join("+"),
    ms_total: Date.now() - started,
    a_ms: a.ms,
    b_ms: b.ms,
  });

  return {
    report: merged,
    model_used: usedModels.join("+"),
    api_call_count: 2,
    ms_total: Date.now() - started,
    per_call: {
      a: { tool: "emit_darrow_core_a", model: a.model_used, ms: a.ms },
      b: { tool: "emit_darrow_core_b", model: b.model_used, ms: b.ms },
    },
  };
}
