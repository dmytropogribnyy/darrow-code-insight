// BUNDLE-B orchestrator — one report unit per selected module (CORE + add-ons).
//
// Pure orchestration with INJECTED dependencies (model call, CORE artifact builder, PDF render,
// persistence, existing-report lookup) so it is fully testable with mocks and does NOT touch
// Supabase / the live pipeline / real AI / Stripe / FreeAstroAPI. Feature flag defaults OFF.
//
// Behaviour:
//  - one report unit per selected module (CORE-first ordering); CORE uses the injected CORE
//    artifact path, add-ons use the addon chain (MATERIAL-PACK-1 -> prompt -> generate -> render);
//  - per-module status; partial failure does NOT abort the others;
//  - idempotent retry: a module already complete (via loadExisting) is skipped, not re-rendered.
//  The live pipeline wires real deps behind BUNDLE_SEPARATE_REPORTS in a thin, separate step.

import type { DarrowChartData } from "@/lib/astro/types";
import type { ModuleCode } from "@/lib/modules";
import { orderModules, separateReportsEnabled, type ReportModule } from "./bundle-reports";
import { buildAddonArtifact, type AddonModelCall } from "@/lib/ai/addon-modules/generate-addon";

export interface ModuleArtifact {
  html: string;
  payload?: unknown;
}

export interface PersistInput {
  module: ReportModule;
  html: string;
  pdf: Uint8Array;
  payload?: unknown;
}

export interface ExistingReport {
  status: string;
  report_ref: string;
  download_token: string;
}

export interface OrchestratorDeps {
  /** Model call for add-on generation (injected; real default is key-guarded). */
  call: AddonModelCall;
  /** CORE artifact via the existing CORE render path (injected — not reimplemented here). */
  buildCoreArtifact?: (
    chart: Partial<DarrowChartData>,
    customer: { first_name?: string | null; clientName?: string },
  ) => Promise<ModuleArtifact>;
  /** HTML -> PDF bytes (injected; the real renderHtmlToPdf in production). */
  renderPdf: (html: string, meta: { module: ReportModule }) => Promise<Uint8Array>;
  /** Upload + create/update the per-module report row; returns its identifiers. */
  persistReport: (input: PersistInput) => Promise<{ report_ref: string; download_token: string }>;
  /** Idempotency: return an existing report unit for this module (or null). */
  loadExisting?: (module: ReportModule) => Promise<ExistingReport | null>;
  model?: string;
}

export interface ModuleReportResult {
  module: ReportModule;
  status: "complete" | "failed_generation" | "skipped_existing";
  report_ref?: string;
  download_token?: string;
  pdf_bytes?: number;
  error?: string;
}

// Chooses the delivery mode from the flag (default OFF -> legacy combined path).
export function deliveryMode(
  env: Record<string, string | undefined> = process.env,
): "separate" | "combined" {
  return separateReportsEnabled(env) ? "separate" : "combined";
}

// Orchestrates per-module generation + render + persistence for a purchase's selected modules.
export async function orchestrateReports(
  modules: ReportModule[],
  chart: Partial<DarrowChartData>,
  customer: { first_name?: string | null; clientName?: string },
  deps: OrchestratorDeps,
): Promise<ModuleReportResult[]> {
  const ordered = orderModules(modules); // CORE first, then chapters in catalog order
  const results: ModuleReportResult[] = [];

  for (const module of ordered) {
    try {
      // Idempotent retry: skip a module that already completed successfully.
      if (deps.loadExisting) {
        const existing = await deps.loadExisting(module);
        if (existing && existing.status === "complete" && existing.download_token) {
          results.push({
            module,
            status: "skipped_existing",
            report_ref: existing.report_ref,
            download_token: existing.download_token,
          });
          continue;
        }
      }

      // Build the per-module artifact.
      let artifact: ModuleArtifact;
      if (module === "CORE") {
        if (!deps.buildCoreArtifact) throw new Error("no CORE artifact builder provided");
        artifact = await deps.buildCoreArtifact(chart, customer);
      } else {
        artifact = await buildAddonArtifact(module as ModuleCode, chart, {
          call: deps.call,
          model: deps.model,
          first_name: customer.first_name ?? null,
          clientName: customer.clientName ?? customer.first_name ?? "you",
        });
      }

      const pdf = await deps.renderPdf(artifact.html, { module });
      if (!pdf || pdf.byteLength === 0) throw new Error("empty PDF");

      const { report_ref, download_token } = await deps.persistReport({
        module,
        html: artifact.html,
        pdf,
        payload: artifact.payload,
      });
      results.push({
        module,
        status: "complete",
        report_ref,
        download_token,
        pdf_bytes: pdf.byteLength,
      });
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      console.error(`[orchestrate-reports] module ${module} failed:`, msg, e?.stack ?? "");
      results.push({ module, status: "failed_generation", error: msg });
    }
  }
  return results;
}
