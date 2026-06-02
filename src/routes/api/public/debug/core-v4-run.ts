// CORE v4.1 diagnostic JSON route — B3.
//
// NON-MUTATING. Guaranteed by design:
//   – no customer records, orders, generation_jobs, or tokens created/mutated
//   – no PDF rendered or uploaded
//   – no Stripe / payment calls
//   – no email sent
//   – no production pipeline used (generateDarrowReport stays v3)
//   – Supabase access is read-only (intake lookup), only in generate_json mode
//
// Auth: JOB_DISPATCH_SECRET (Bearer) — same guard as core-v3-run.ts.
// Both GET and POST are supported; GET always returns plan_only.
//
// Supported POST modes (body.mode):
//   plan_only          — no API calls; returns capabilities + config
//   generate_json      — calls FreeAstroAPI + staged v4 Claude split; returns JSON
//   validate_cached_json — validates a provided core_json; no API calls

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { checkWorkerAuth, unauthorizedResponse } from "@/lib/jobs/auth";
import { getAstroProvider } from "@/lib/astro/provider";
import type { NatalInput } from "@/lib/astro/types";
import { buildCoreV4UserPrompt } from "@/lib/ai/user-prompt";
import { generateCoreV4Split } from "@/lib/ai/core-split.server";
import {
  evaluateCoreV4Structure,
  evaluateCoreV4Lengths,
  getCoreV4SectionText,
  CORE_V4_KEYS,
  CORE_V4_WORD_TARGET_RANGE,
  CORE_V4_WORD_HARD_CAP,
  CORE_V4_SCHEMA_VERSION,
  CORE_V4_REPORT_VERSION,
  CORE_V4_TARGETS,
  wordCount,
} from "@/lib/ai/diagnostic.server";
import { BUILD_MARKER } from "./build-marker";

// ─── Supabase admin (read-only in this route; created lazily) ────────
let _sb: any = null;
function admin(): any {
  if (!_sb) _sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  return _sb;
}

// ─── Safety notes included in every response ────────────────────────
const SAFETY_NOTES = [
  "No paid customer records created or mutated.",
  "No orders, generation_jobs, or tokens written.",
  "No PDF rendered.",
  "No Stripe / payment calls.",
  "No email sent.",
  "No production pipeline used (v3 pipeline unchanged).",
  "No astrocartography — CORE uses environmental resonance only.",
  "Uses staged v4 prompt (DARROW_V4_SYSTEM_PROMPT) — not the active v3 prompt.",
  "FreeAstroAPI is the calculated data provider (API key in CF Workers env only).",
];

// ─── plan_only ────────────────────────────────────────────────────────
function planOnlyPayload() {
  return {
    ok: true,
    mode: "plan_only",
    build_marker: BUILD_MARKER,
    stage: "B3-diagnostic-json",
    schema_version: CORE_V4_SCHEMA_VERSION,
    report_version: CORE_V4_REPORT_VERSION,
    expected_body_keys: [...CORE_V4_KEYS],
    word_target_range: CORE_V4_WORD_TARGET_RANGE,
    word_hard_cap: CORE_V4_WORD_HARD_CAP,
    per_section_targets: CORE_V4_TARGETS,
    supported_modes: ["plan_only", "generate_json", "validate_cached_json"],
    safety_notes: SAFETY_NOTES,
    notes: [
      "No API calls made in plan_only mode.",
      "generate_json requires test_input OR intake_id in request body.",
      "validate_cached_json requires core_json (the CORE module object) in request body.",
    ],
  };
}

// ─── Text/word helpers ────────────────────────────────────────────────
function snippet(s: string, sentences = 3): string {
  if (!s) return "";
  return s
    .trim()
    .split(/(?<=[.!?])\s+/)
    .slice(0, sentences)
    .join(" ")
    .slice(0, 800);
}

function buildPerSectionMap(
  core: any,
  underTarget: Array<{ section: string }>,
): Record<string, { chars: number; words: number; status: string }> {
  const map: Record<string, { chars: number; words: number; status: string }> = {};
  for (const k of CORE_V4_KEYS) {
    const text = getCoreV4SectionText(core?.[k]);
    map[k] = {
      chars: text.length,
      words: text ? wordCount(text) : 0,
      status: underTarget.find((w) => w.section === k) ? "WARN_UNDER_TARGET" : "OK",
    };
  }
  return map;
}

function wordTotalStatus(total: number): string {
  if (total > CORE_V4_WORD_HARD_CAP) return "OVER_HARD_CAP";
  if (total < CORE_V4_WORD_TARGET_RANGE[0]) return "UNDER_TARGET";
  if (total > CORE_V4_WORD_TARGET_RANGE[1]) return "OVER_TARGET";
  return "OK";
}

// ─── validate_cached_json ────────────────────────────────────────────
function validateCachedJson(body: any): Response {
  const core_json = body?.core_json ?? body?.core ?? null;
  if (!core_json || typeof core_json !== "object") {
    return Response.json(
      {
        ok: false,
        error:
          "validate_cached_json requires core_json (the CORE module object) in the " +
          "request body. Example: { mode: 'validate_cached_json', core_json: { schema_version: 'core_v4', ... } }",
      },
      { status: 400 },
    );
  }

  const report = { generated_modules: ["CORE"], modules: { CORE: core_json } };
  const structural_issues = evaluateCoreV4Structure(report);
  const length_diags = evaluateCoreV4Lengths(core_json);
  const warnings_under_target = length_diags.filter((d) => d.status === "WARN_UNDER_TARGET");
  const per_section = buildPerSectionMap(core_json, warnings_under_target);
  const total_words = Object.values(per_section).reduce((s, v) => s + v.words, 0);

  return Response.json({
    ok: true,
    mode: "validate_cached_json",
    build_marker: BUILD_MARKER,
    stage: "B3-diagnostic-json",
    schema_version: core_json?.schema_version ?? null,
    structural_issues,
    structural_ok: structural_issues.length === 0,
    sections_per_target: per_section,
    warnings_under_target,
    total_word_count: total_words,
    word_target_range: CORE_V4_WORD_TARGET_RANGE,
    word_hard_cap: CORE_V4_WORD_HARD_CAP,
    word_total_status: wordTotalStatus(total_words),
    safety_notes: ["No API calls made. Validation only."],
  });
}

// ─── generate_json ───────────────────────────────────────────────────
async function generateAndValidate(body: any): Promise<Response> {
  const t0 = Date.now();
  let natal: NatalInput;
  let firstName: string | null = null;
  let birthCity: string | null = null;

  if (body?.test_input) {
    // Direct test input — no Supabase required.
    const ti = body.test_input;
    firstName = (ti.first_name as string | null) ?? null;
    birthCity = (ti.birth_city as string | null) ?? null;
    natal = {
      date_of_birth: String(ti.date_of_birth ?? ""),
      birth_time: (ti.birth_time as string | null) ?? null,
      birth_time_known: !!ti.birth_time_known,
      latitude: Number(ti.latitude ?? 0),
      longitude: Number(ti.longitude ?? 0),
      timezone: String(ti.timezone ?? "UTC"),
      full_name_for_numerology: (ti.full_name_for_numerology as string | null) ?? null,
      first_name: firstName,
      birth_city: birthCity,
      bazi_sex: (ti.bazi_sex as "M" | "F" | null) ?? null,
    };
  } else if (body?.intake_id) {
    // Read-only Supabase lookup — no writes.
    const sb = admin();
    const { data: intake, error: intakeErr } = await sb
      .from("intakes")
      .select(
        "id, customer_id, date_of_birth, birth_time, birth_time_known, birth_city, latitude, longitude, timezone, full_name_for_numerology, bazi_sex",
      )
      .eq("id", body.intake_id)
      .maybeSingle();
    if (intakeErr || !intake) {
      return Response.json(
        { ok: false, error: `intake ${body.intake_id} not found` },
        { status: 404 },
      );
    }
    const { data: customer } = await sb
      .from("customers")
      .select("id, first_name")
      .eq("id", intake.customer_id)
      .maybeSingle();
    firstName = customer?.first_name ?? null;
    birthCity = intake.birth_city ?? null;
    natal = {
      date_of_birth: intake.date_of_birth,
      birth_time: intake.birth_time ?? null,
      birth_time_known: !!intake.birth_time_known,
      latitude: intake.latitude ?? 0,
      longitude: intake.longitude ?? 0,
      timezone: intake.timezone ?? "UTC",
      full_name_for_numerology: intake.full_name_for_numerology ?? firstName,
      first_name: firstName,
      birth_city: birthCity,
      bazi_sex: (intake.bazi_sex as "M" | "F" | null) ?? null,
    };
  } else {
    return Response.json(
      {
        ok: false,
        error:
          "generate_json requires test_input OR intake_id. " +
          "test_input example: { first_name, date_of_birth, birth_time, birth_time_known, " +
          "latitude, longitude, timezone, birth_city, full_name_for_numerology, bazi_sex }",
      },
      { status: 400 },
    );
  }

  if (!natal.date_of_birth) {
    return Response.json(
      { ok: false, error: "date_of_birth required in test_input" },
      { status: 400 },
    );
  }

  const model = process.env.ANTHROPIC_MODEL_DEFAULT;
  if (!model) {
    return Response.json(
      { ok: false, error: "ANTHROPIC_MODEL_DEFAULT is not configured" },
      { status: 500 },
    );
  }

  // 1) Astro — FreeAstroAPI (read-only, no storage writes)
  const tAstro = Date.now();
  const provider = await getAstroProvider();
  const chart = await provider.computeNatal(natal);
  const astro_ms = Date.now() - tAstro;

  // 2) CORE v4.1 AI generation (staged v4 prompt + generateCoreV4Split)
  const userPrompt = buildCoreV4UserPrompt({
    first_name: firstName,
    date_of_birth: natal.date_of_birth,
    birth_city: birthCity,
    modules: ["CORE"],
    chart,
  });
  const fallback = process.env.ANTHROPIC_MODEL_FALLBACK;
  const splitMode = body?.split_mode === "parallel" ? "parallel" : "sequential";
  const ai = await generateCoreV4Split(userPrompt, model, fallback, { mode: splitMode });

  // 3) Validation
  const structural_issues = evaluateCoreV4Structure(ai.report);
  const core = ai.report?.modules?.CORE ?? {};
  const length_diags = evaluateCoreV4Lengths(core);
  const warnings_under_target = length_diags.filter((d) => d.status === "WARN_UNDER_TARGET");
  const per_section = buildPerSectionMap(core, warnings_under_target);
  const total_words = Object.values(per_section).reduce((s, v) => s + v.words, 0);

  // Section excerpts for quick review
  const excerpts: Record<string, string> = {};
  for (const k of [
    "orientation",
    "core_architecture",
    "operating_mode",
    "shadow_and_friction",
    "executive_summary",
  ]) {
    if (k in core) excerpts[k] = snippet(getCoreV4SectionText(core[k]));
  }

  return Response.json({
    ok: true,
    mode: "generate_json",
    build_marker: BUILD_MARKER,
    stage: "B3-diagnostic-json",
    elapsed_ms: Date.now() - t0,
    safety_notes: SAFETY_NOTES,
    astro: {
      provider_name: chart.meta.provider_name,
      provider_version: chart.meta.provider_version,
      birth_time_source: chart.meta.birth_time_source,
      api_call_count: 1,
      ms: astro_ms,
    },
    ai: {
      model_used: ai.model_used,
      api_call_count: ai.api_call_count,
      ms: ai.ms_total,
      split_mode: ai.mode,
      split: ai.per_call,
    },
    schema_version: core?.schema_version ?? null,
    cover_tagline: core?.cover_tagline ?? null,
    structural_issues,
    structural_ok: structural_issues.length === 0,
    sections_present_count: CORE_V4_KEYS.filter((k) => getCoreV4SectionText(core?.[k]).length > 0)
      .length,
    expected_section_count: CORE_V4_KEYS.length,
    sections_per_target: per_section,
    warnings_under_target,
    total_word_count: total_words,
    word_target_range: CORE_V4_WORD_TARGET_RANGE,
    word_hard_cap: CORE_V4_WORD_HARD_CAP,
    word_total_status: wordTotalStatus(total_words),
    excerpts,
    raw_report: ai.report,
  });
}

// ─── Route ────────────────────────────────────────────────────────────
export const Route = createFileRoute("/api/public/debug/core-v4-run")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!process.env.JOB_DISPATCH_SECRET)
          return new Response("not configured", { status: 500 });
        const auth = checkWorkerAuth(request.headers);
        if (!auth.ok) return unauthorizedResponse(auth);
        return Response.json(planOnlyPayload());
      },
      POST: async ({ request }) => {
        if (!process.env.JOB_DISPATCH_SECRET)
          return new Response("not configured", { status: 500 });
        const auth = checkWorkerAuth(request.headers);
        if (!auth.ok) return unauthorizedResponse(auth);
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          // ignore: request body may be absent or non-JSON
        }
        const mode: string = typeof body?.mode === "string" ? body.mode : "plan_only";
        if (mode === "plan_only") {
          return Response.json(planOnlyPayload());
        }
        if (mode === "validate_cached_json") {
          return validateCachedJson(body);
        }
        if (mode === "generate_json") {
          try {
            return await generateAndValidate(body);
          } catch (e: any) {
            return Response.json(
              {
                ok: false,
                build_marker: BUILD_MARKER,
                mode: "generate_json",
                error: String(e?.message ?? e).slice(0, 1000),
              },
              { status: 500 },
            );
          }
        }
        return Response.json(
          {
            ok: false,
            error: `Unknown mode: "${mode}". Supported: plan_only, generate_json, validate_cached_json`,
          },
          { status: 400 },
        );
      },
    },
  },
});
