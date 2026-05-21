// Diagnostic-only CORE v3 generation route.
//
// Auth: JOB_DISPATCH_SECRET (Bearer) — same as other /api/public/jobs/* routes.
// Does NOT touch any customer reports, orders, generation_jobs, or send any email.
// Does NOT charge.
// Uploads PDF (if produced) to `reports/diagnostic/{timestamp}.pdf` so a
// time-bound signed URL can be shared with the maintainer.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { checkWorkerAuth, unauthorizedResponse } from "@/lib/jobs/auth";
import { getAstroProvider } from "@/lib/astro/provider";
import type { NatalInput } from "@/lib/astro/types";
import { buildUserPrompt } from "@/lib/ai/user-prompt";
import { renderReportHtmlSafe } from "@/lib/pdf/template";
import { renderHtmlToPdf } from "@/lib/pdf/apitemplate.server";
import {
  CORE_V3_KEYS,
  CORE_V3_WORD_TARGET_RANGE,
  CORE_V3_WORD_HARD_CAP,
  evaluateCoreV3Lengths,
  evaluateStructure,
  wordCount,
} from "@/lib/ai/diagnostic.server";
import { generateCoreV3Split } from "@/lib/ai/core-split.server";
import { getCoreSectionProse } from "@/lib/ai/schema";
import { evaluateQualityGate } from "@/lib/ai/quality-gate.server";
import { BUILD_MARKER } from "./build-marker";

let _sb: any = null;
function admin(): any {
  if (!_sb) _sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  return _sb;
}

function snippet(s: string | undefined | null, sentences = 4): string {
  if (!s) return "";
  const parts = String(s).trim().split(/(?<=[.!?])\s+/).slice(0, sentences);
  return parts.join(" ").slice(0, 1200);
}

async function runDiagnostic(intake_id: string, mode: "sequential" | "parallel" = "sequential") {
  const sb = admin();
  const t0 = Date.now();

  const { data: intake, error: intakeErr } = await sb
    .from("intakes")
    .select("id, customer_id, date_of_birth, birth_time, birth_time_known, birth_city, latitude, longitude, timezone, full_name_for_numerology, bazi_sex")
    .eq("id", intake_id)
    .maybeSingle();
  if (intakeErr || !intake) throw new Error(`intake ${intake_id} not found`);

  const { data: customer } = await sb
    .from("customers")
    .select("id, first_name, email")
    .eq("id", intake.customer_id)
    .maybeSingle();

  // 1) Astro — real provider
  const provider = await getAstroProvider();
  const natal: NatalInput = {
    date_of_birth: intake.date_of_birth,
    birth_time: intake.birth_time,
    birth_time_known: !!intake.birth_time_known,
    latitude: intake.latitude ?? 0,
    longitude: intake.longitude ?? 0,
    timezone: intake.timezone ?? "UTC",
    full_name_for_numerology: intake.full_name_for_numerology ?? customer?.first_name ?? null,
    first_name: customer?.first_name ?? null,
    birth_city: intake.birth_city ?? null,
    bazi_sex: (intake.bazi_sex as "M" | "F" | null) ?? null,
  };
  const tAstro = Date.now();
  const chart = await provider.computeNatal(natal);
  const astro_ms = Date.now() - tAstro;

  // 2) AI — diagnostic mode (warn-only length validation, ONE call)
  const userPrompt = buildUserPrompt({
    first_name: customer?.first_name ?? null,
    date_of_birth: intake.date_of_birth,
    birth_city: intake.birth_city,
    modules: ["CORE"],
    chart,
  });
  const model = process.env.ANTHROPIC_MODEL_DEFAULT;
  if (!model) throw new Error("ANTHROPIC_MODEL_DEFAULT is not configured");
  const fallback = process.env.ANTHROPIC_MODEL_FALLBACK;
  const ai = await generateCoreV3Split(userPrompt, model, fallback, { mode });

  // 3) Structural validation (hard) + length evaluation (warn)
  const structural_issues = evaluateStructure(ai.report);
  const core = ai.report?.modules?.CORE ?? {};
  const length_diagnostics = evaluateCoreV3Lengths(core);
  const warnings_under_target = length_diagnostics.filter((d) => d.status === "WARN_UNDER_TARGET");

  // Per-section word + char map (prose-only)
  const per_section: Record<string, { chars: number; words: number; status: string }> = {};
  for (const k of CORE_V3_KEYS) {
    const v = getCoreSectionProse(core?.[k]);
    per_section[k] = {
      chars: v.length,
      words: v ? wordCount(v) : 0,
      status: warnings_under_target.find((w) => w.section === k) ? "WARN_UNDER_TARGET" : "OK",
    };
  }
  const total_words = Object.values(per_section).reduce((sum, s) => sum + s.words, 0);
  const word_total_status =
    total_words > CORE_V3_WORD_HARD_CAP
      ? "OVER_HARD_CAP"
      : total_words < CORE_V3_WORD_TARGET_RANGE[0]
        ? "UNDER_TARGET"
        : total_words > CORE_V3_WORD_TARGET_RANGE[1]
          ? "OVER_TARGET"
          : "OK";

  // Provider-interpretation leak check (basic substring scan in CORE body)
  const leakProbes = [
    "interpretation provided by",
    "horoscope.com",
    "astro-seek",
    "provider says",
  ];
  const coreText = Object.values(core)
    .map((v) => getCoreSectionProse(v) || (typeof v === "string" ? v : ""))
    .join("\n")
    .toLowerCase();
  const provider_interpretation_leak = leakProbes.filter((p) => coreText.includes(p));

  // 4) PDF render (only if structurally valid enough to render)
  let pdf_status: "skipped" | "ok" | "failed" = "skipped";
  let pdf_bytes_len: number | null = null;
  let pdf_storage_path: string | null = null;
  let pdf_signed_url: string | null = null;
  let pdf_error: string | null = null;
  const blockingStructural = structural_issues.filter(
    (i) =>
      i.code !== "WRONG_SCHEMA_VERSION" &&
      i.code !== "MISSING_SCHEMA_VERSION" &&
      i.code !== "MISSING_GENERATED_MODULES",
  );
  const canRender = blockingStructural.length === 0;
  if (canRender) {
    try {
      const html = renderReportHtmlSafe(ai.report as any, {});
      const pdf = await renderHtmlToPdf(html, { order_id: "diagnostic", report_id: "diagnostic", modules: ["CORE"] });
      pdf_bytes_len = pdf.byteLength;
      pdf_status = "ok";
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      const path = `diagnostic/core-v3-${ts}.pdf`;
      const up = await sb.storage.from("reports").upload(path, pdf, { contentType: "application/pdf", upsert: true });
      if (up.error) throw new Error(`pdf upload failed: ${up.error.message}`);
      pdf_storage_path = path;
      const signed = await sb.storage.from("reports").createSignedUrl(path, 3600);
      pdf_signed_url = signed?.data?.signedUrl ?? null;
    } catch (e: any) {
      pdf_status = "failed";
      pdf_error = String(e?.message ?? e).slice(0, 500);
    }
  }

  return {
    build_marker: BUILD_MARKER,
    step_timeout_ms_live: 15 * 60 * 1000,
    length_validation_mode: "warn_only",
    elapsed_ms: Date.now() - t0,
    intake_id,
    astro: {
      provider_name: chart.meta.provider_name,
      provider_version: chart.meta.provider_version,
      timezone_used: chart.meta.timezone_used,
      birth_time_source: chart.meta.birth_time_source,
      api_call_count: 1,
      ms: astro_ms,
      used_mock: chart.meta.provider_name?.toLowerCase().includes("mock") ?? false,
    },
    ai: {
      model_used: ai.model_used,
      api_call_count: ai.api_call_count,
      ms: ai.ms_total,
      split_mode: ai.mode,
      split: ai.per_call,
    },
    schema_version: core?.schema_version ?? null,
    structural_issues,
    structural_ok: structural_issues.length === 0,
    sections_present_count: CORE_V3_KEYS.filter((k) => getCoreSectionProse(core?.[k]).length > 0).length,
    expected_section_count: CORE_V3_KEYS.length,
    sections_per_target: per_section,
    warnings_under_target,
    total_word_count: total_words,
    word_target_range: CORE_V3_WORD_TARGET_RANGE,
    word_hard_cap: CORE_V3_WORD_HARD_CAP,
    word_total_status,
    provider_interpretation_leak,
    client_snapshot: ai.report?.client_snapshot ?? null,
    generated_modules: ai.report?.generated_modules ?? null,
    proof_tags_top_level: Array.isArray(core?.proof_tags) ? core.proof_tags.slice(0, 8) : [],
    pdf: {
      status: pdf_status,
      bytes: pdf_bytes_len,
      storage_path: pdf_storage_path,
      signed_url: pdf_signed_url,
      error: pdf_error,
    },
    excerpts: {
      orientation: snippet(getCoreSectionProse(core?.orientation), 5),
      core_architecture: snippet(getCoreSectionProse(core?.core_architecture), 5),
      battery: snippet(getCoreSectionProse(core?.battery), 5),
      shadow_and_friction: snippet(getCoreSectionProse(core?.shadow_and_friction), 5),
      executive_summary: snippet(getCoreSectionProse(core?.executive_summary), 5),
    },
  };
}

export const Route = createFileRoute("/api/public/debug/core-v3-run")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!process.env.JOB_DISPATCH_SECRET) return new Response("not configured", { status: 500 });
        const auth = checkWorkerAuth(request.headers);
        if (!auth.ok) return unauthorizedResponse(auth);
        let body: any = {};
        try {
          body = await request.json();
        } catch {}
        const intake_id = typeof body?.intake_id === "string" ? body.intake_id : null;
        if (!intake_id) return Response.json({ ok: false, error: "intake_id required" }, { status: 400 });
        const requestedMode = body?.mode === "parallel" ? "parallel" : "sequential";
        try {
          const result = await runDiagnostic(intake_id, requestedMode);
          return Response.json({ ok: true, build_marker: BUILD_MARKER, result });
        } catch (e: any) {
          return Response.json(
            { ok: false, build_marker: BUILD_MARKER, error: String(e?.message ?? e).slice(0, 1000) },
            { status: 500 },
          );
        }
      },
    },
  },
});
