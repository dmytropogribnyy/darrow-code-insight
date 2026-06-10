// PHASE 5 — Continuum generation handler (flag-gated, thin). Dispatched from runFullGeneration
// when orders.continuum_type is set. One report unit per Continuum purchase (one PDF). Injectable
// hooks => fully testable with mocks; buildDefaultContinuumHooks builds the real Supabase/AI/PDF
// deps (runs only flag-ON in production). No live email/Stripe in tests.

import type { DarrowChartData } from "@/lib/astro/types";
import type { ContinuumType } from "./continuum-config";
import { buildContinuumArtifact, type ContinuumArtifact } from "./generate-continuum";

export interface ContinuumGenContext {
  type: ContinuumType;
  chart: Partial<DarrowChartData>;
  first_name: string | null;
  generatedAt: Date;
}

export interface ContinuumResult {
  status: "complete" | "failed_generation";
  report_ref?: string;
  download_token?: string;
  pdf_bytes?: number;
  error?: string;
}

export interface ContinuumHooks {
  loadContext: (order_id: string) => Promise<ContinuumGenContext>;
  generateArtifact: (ctx: ContinuumGenContext) => Promise<ContinuumArtifact>;
  renderPdf: (html: string, type: ContinuumType) => Promise<Uint8Array>;
  persistReport: (input: { artifact: ContinuumArtifact; pdf: Uint8Array }) => Promise<{
    report_ref: string;
    download_token: string;
  }>;
  finalize: (order_id: string, result: ContinuumResult) => Promise<void>;
}

export async function runContinuumGeneration(
  order_id: string,
  hooks: ContinuumHooks,
): Promise<ContinuumResult> {
  let result: ContinuumResult;
  try {
    const ctx = await hooks.loadContext(order_id);
    const artifact = await hooks.generateArtifact(ctx);
    const pdf = await hooks.renderPdf(artifact.html, ctx.type);
    if (!pdf || pdf.byteLength === 0) throw new Error("empty PDF");
    const { report_ref, download_token } = await hooks.persistReport({ artifact, pdf });
    result = { status: "complete", report_ref, download_token, pdf_bytes: pdf.byteLength };
  } catch (e: any) {
    result = { status: "failed_generation", error: String(e?.message ?? e) };
  }
  await hooks.finalize(order_id, result);
  return result;
}

// ── Real default hooks (Supabase + AI + PDF). Runs only when dispatched (flag-ON, paid). ──
export function buildDefaultContinuumHooks(sb: any): ContinuumHooks {
  const MODEL = "claude-sonnet-4-6";
  const ctxRef: {
    customer_id?: string;
    intake_id?: string;
    email?: string | null;
    first_name?: string | null;
    type?: ContinuumType;
  } = {};

  return {
    loadContext: async (order_id) => {
      const { data: order } = await sb
        .from("orders")
        .select("id, customer_id, intake_id, continuum_type, status")
        .eq("id", order_id)
        .single();
      if (!order) throw new Error(`order ${order_id} not found`);
      if (!order.continuum_type) throw new Error(`order ${order_id} is not a continuum order`);
      const { data: intake } = await sb
        .from("intakes")
        .select("*")
        .eq("id", order.intake_id)
        .single();
      const { data: customer } = await sb
        .from("customers")
        .select("id, first_name, email")
        .eq("id", order.customer_id)
        .single();
      ctxRef.customer_id = order.customer_id;
      ctxRef.intake_id = order.intake_id;
      ctxRef.email = customer?.email ?? null;
      ctxRef.first_name = customer?.first_name ?? null;
      ctxRef.type = order.continuum_type as ContinuumType;

      const { getAstroProvider } = await import("@/lib/astro/provider");
      const provider = await getAstroProvider();
      const chart = await provider.computeNatal({
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
      });
      return {
        type: order.continuum_type as ContinuumType,
        chart,
        first_name: customer?.first_name ?? null,
        generatedAt: new Date(),
      };
    },

    generateArtifact: async (ctx) => {
      const { createAnthropicContinuumCall } = await import("./generate-continuum");
      return buildContinuumArtifact(ctx.type, ctx.chart, {
        call: createAnthropicContinuumCall(ctx.type),
        generatedAt: ctx.generatedAt,
        model: MODEL,
        first_name: ctx.first_name,
        clientName: ctx.first_name ?? "you",
      });
    },

    renderPdf: async (html) => {
      const { renderHtmlToPdf } = await import("@/lib/pdf/apitemplate.server");
      return renderHtmlToPdf(html, { modules: [] as string[] });
    },

    persistReport: async ({ artifact, pdf }) => {
      // One Continuum report row per intake+continuum_type (idempotent upsert).
      let { data: row } = await sb
        .from("reports")
        .select("id, download_token, report_ref")
        .eq("intake_id", ctxRef.intake_id)
        .eq("continuum_type", artifact.type)
        .maybeSingle();
      if (!row) {
        const { data: created, error } = await sb
          .from("reports")
          .insert({
            customer_id: ctxRef.customer_id,
            intake_id: ctxRef.intake_id,
            continuum_type: artifact.type,
            modules_array: [],
            generation_status: "processing",
          })
          .select("id, download_token, report_ref")
          .single();
        if (error || !created)
          throw new Error(`could not create continuum report: ${error?.message}`);
        row = created;
      }
      const path = `${row.download_token}.pdf`;
      const up = await sb.storage
        .from("reports")
        .upload(path, pdf, { contentType: "application/pdf", upsert: true });
      if (up.error) throw new Error(`pdf upload failed: ${up.error.message}`);
      await sb
        .from("reports")
        .update({
          ai_content_json: artifact.payload,
          pdf_url: path,
          model_used: MODEL,
          generation_status: "complete",
          generation_error: null,
        })
        .eq("id", row.id);
      return { report_ref: row.report_ref, download_token: row.download_token };
    },

    finalize: async (order_id, result) => {
      const complete = result.status === "complete";
      await sb
        .from("orders")
        .update({ status: complete ? "complete" : "failed_generation" })
        .eq("id", order_id);
      await sb
        .from("generation_jobs")
        .update({
          status: complete ? "complete" : "failed",
          last_error: complete ? null : (result.error ?? "failed"),
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", order_id);
      // Delivery email (single link) — only when complete + email present + not already sent.
      if (!complete || !ctxRef.email || !result.download_token) return;
      const appBaseUrl = (process.env.APP_BASE_URL ?? "").replace(/\/$/, "");
      const { data: rep } = await sb
        .from("reports")
        .select("ready_email_sent_at")
        .eq("download_token", result.download_token)
        .maybeSingle();
      if (rep?.ready_email_sent_at) return;
      const { reportReadyEmail, sendEmail } = await import("@/lib/email/resend.server");
      const { CONTINUUM_PRODUCTS } = await import("./continuum-config");
      const product = ctxRef.type ? CONTINUUM_PRODUCTS[ctxRef.type] : null;
      const label = product ? product.label : "CONTINUUM";
      const { subject, html } = reportReadyEmail({
        first_name: ctxRef.first_name ?? null,
        download_url: `${appBaseUrl}/download/${result.download_token}`,
        result_url: `${appBaseUrl}/#product-selector`,
        report_label: label,
      });
      await sendEmail({ to: ctxRef.email, subject, html });
      await sb
        .from("reports")
        .update({ ready_email_sent_at: new Date().toISOString() })
        .eq("download_token", result.download_token);
    },
  };
}
