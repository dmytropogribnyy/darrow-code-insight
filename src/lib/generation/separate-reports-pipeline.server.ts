// BUNDLE-B — separate per-module pipeline (flag-gated, thin).
//
// Invoked by runFullGenerationPipeline ONLY when BUNDLE_SEPARATE_REPORTS=1. Default OFF =>
// this is never called and the legacy combined path runs unchanged. The orchestration is
// injectable (hooks) so flag-ON behaviour is fully testable with mocks; buildDefaultSeparateHooks
// builds the REAL Supabase/AI/PDF deps and only runs in production when the flag is enabled
// (a later, reviewed step). No live email here (multi-link delivery belongs to BUNDLE-C).

import type { DarrowChartData, NatalInput } from "@/lib/astro/types";
import type { ReportModule } from "./bundle-reports";
import {
  orchestrateReports,
  type ModuleReportResult,
  type OrchestratorDeps,
} from "./orchestrate-reports";

export interface SeparateContext {
  modules: ReportModule[];
  chart: Partial<DarrowChartData>;
  first_name: string | null;
}

export interface SeparatePipelineHooks {
  loadContext: (order_id: string) => Promise<SeparateContext>;
  buildDeps: (ctx: SeparateContext, order_id: string) => OrchestratorDeps;
  finalize: (
    order_id: string,
    results: ModuleReportResult[],
    outcome: OrderOutcome,
  ) => Promise<void>;
}

export interface OrderOutcome {
  order_status: "complete" | "failed_generation";
  job_status: "complete" | "failed";
  total: number;
  delivered: number;
  failed: number;
  allComplete: boolean;
}

// Pure status rules: order/job are 'complete' ONLY when every module delivered (complete or
// already-complete/skipped). Any failure -> failed_generation / failed (retryable; idempotent
// skip protects the modules that already succeeded).
export function summarizeOrderOutcome(results: ModuleReportResult[]): OrderOutcome {
  const total = results.length;
  const failed = results.filter((r) => r.status === "failed_generation").length;
  const delivered = results.filter(
    (r) => r.status === "complete" || r.status === "skipped_existing",
  ).length;
  const allComplete = total > 0 && failed === 0;
  return {
    order_status: allComplete ? "complete" : "failed_generation",
    job_status: allComplete ? "complete" : "failed",
    total,
    delivered,
    failed,
    allComplete,
  };
}

// Runs the separate per-module pipeline via injected hooks. Returns the per-module results +
// the overall outcome. Pure of any direct Supabase/AI dependency (those live in the hooks).
export async function runSeparateReportsPipeline(
  order_id: string,
  hooks: SeparatePipelineHooks,
): Promise<{ results: ModuleReportResult[]; outcome: OrderOutcome }> {
  const ctx = await hooks.loadContext(order_id);
  const deps = hooks.buildDeps(ctx, order_id);
  const results = await orchestrateReports(
    ctx.modules,
    ctx.chart,
    { first_name: ctx.first_name, clientName: ctx.first_name ?? "you" },
    deps,
  );
  const outcome = summarizeOrderOutcome(results);
  await hooks.finalize(order_id, results, outcome);
  return { results, outcome };
}

// ── Real default hooks (Supabase + AI + PDF). Only runs when the flag is enabled. ──
// Imports are dynamic to keep this server-only module out of any client bundle path and to
// avoid a static import cycle with pipeline.server.ts.
export function buildDefaultSeparateHooks(sb: any): SeparatePipelineHooks {
  const ADDON_MODEL = "claude-sonnet-4-6";

  const loadContext = async (order_id: string): Promise<SeparateContext> => {
    const { data: order } = await sb
      .from("orders")
      .select("id, customer_id, intake_id, status")
      .eq("id", order_id)
      .single();
    if (!order) throw new Error(`order ${order_id} not found`);
    const { data: intake } = await sb
      .from("intakes")
      .select("*")
      .eq("id", order.intake_id)
      .single();
    const { data: customer } = await sb
      .from("customers")
      .select("id, first_name")
      .eq("id", order.customer_id)
      .single();
    const { data: ownedRows } = await sb
      .from("modules_purchased")
      .select("module_code")
      .eq("intake_id", order.intake_id);
    const owned = new Set<string>((ownedRows ?? []).map((x: any) => x.module_code));
    const { MODULE_CODES } = await import("@/lib/modules");
    const modules: ReportModule[] = [
      ...(owned.has("CORE") ? (["CORE"] as ReportModule[]) : []),
      ...MODULE_CODES.filter((m) => owned.has(m)),
    ];

    const { getAstroProvider } = await import("@/lib/astro/provider");
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
    const chart = await provider.computeNatal(natal);
    // stash ids for persistence
    (chart as any)._ctx = { customer_id: order.customer_id, intake_id: order.intake_id };
    return { modules, chart, first_name: customer?.first_name ?? null };
  };

  const buildDeps = (ctx: SeparateContext): OrchestratorDeps => {
    const ids = (ctx.chart as any)._ctx ?? {};
    return {
      model: ADDON_MODEL,
      call: async (args) => {
        const { createAnthropicAddonCall } = await import("@/lib/ai/addon-modules/generate-addon");
        return createAnthropicAddonCall()(args);
      },
      buildCoreArtifact: async (chart, customer) => {
        const { buildUserPrompt } = await import("@/lib/ai/user-prompt");
        const { generateDarrowReport } = await import("@/lib/ai/anthropic.server");
        const { renderReportHtmlSafe } = await import("@/lib/pdf/template");
        const prompt = buildUserPrompt({
          first_name: customer.first_name ?? null,
          date_of_birth: (chart as any)._birth?.date_of_birth ?? "",
          birth_city: null,
          modules: ["CORE"],
          chart: chart as DarrowChartData,
        });
        const ai = await generateDarrowReport(prompt);
        return { html: renderReportHtmlSafe(ai.report, {}), payload: ai.report };
      },
      renderPdf: async (html, meta) => {
        const { renderHtmlToPdf } = await import("@/lib/pdf/apitemplate.server");
        return renderHtmlToPdf(html, { modules: [meta.module] as string[] });
      },
      loadExisting: async (module) => {
        const { data } = await sb
          .from("reports")
          .select("generation_status, report_ref, download_token")
          .eq("intake_id", ids.intake_id)
          .eq("module_code", module)
          .maybeSingle();
        if (data && data.generation_status === "complete" && data.download_token) {
          return {
            status: "complete",
            report_ref: data.report_ref,
            download_token: data.download_token,
          };
        }
        return null;
      },
      persistReport: async ({ module, pdf, payload }) => {
        let { data: row } = await sb
          .from("reports")
          .select("id, download_token, report_ref")
          .eq("intake_id", ids.intake_id)
          .eq("module_code", module)
          .maybeSingle();
        if (!row) {
          const { data: created, error } = await sb
            .from("reports")
            .insert({
              customer_id: ids.customer_id,
              intake_id: ids.intake_id,
              module_code: module,
              modules_array: [module],
              generation_status: "processing",
            })
            .select("id, download_token, report_ref")
            .single();
          if (error || !created)
            throw new Error(`could not create ${module} report: ${error?.message}`);
          row = created;
        }
        const path = `${row.download_token}.pdf`;
        const up = await sb.storage
          .from("reports")
          .upload(path, pdf, { contentType: "application/pdf", upsert: true });
        if (up.error) throw new Error(`pdf upload failed (${module}): ${up.error.message}`);
        await sb
          .from("reports")
          .update({
            ai_content_json: payload ?? null,
            pdf_url: path,
            model_used: ADDON_MODEL,
            generation_status: "complete",
            generation_error: null,
          })
          .eq("id", row.id);
        return { report_ref: row.report_ref, download_token: row.download_token };
      },
    };
  };

  const finalize = async (
    order_id: string,
    results: ModuleReportResult[],
    outcome: OrderOutcome,
  ) => {
    // Mark failed modules' rows (best-effort) so support sees the error.
    for (const r of results) {
      if (r.status === "failed_generation") {
        await sb
          .from("reports")
          .update({ generation_status: "failed_generation", generation_error: r.error ?? "failed" })
          .eq("intake_id", (results as any)._intake_id ?? "")
          .eq("module_code", r.module);
      }
    }
    await sb.from("orders").update({ status: outcome.order_status }).eq("id", order_id);
    await sb
      .from("generation_jobs")
      .update({
        status: outcome.job_status,
        last_error: outcome.failed ? `${outcome.failed} module(s) failed generation` : null,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", order_id);
  };

  return { loadContext, buildDeps, finalize };
}
