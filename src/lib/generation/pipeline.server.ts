// Async pipeline for paid orders.
// Webhook only enqueues; the dispatcher route invokes runFullGenerationPipeline.

import { createClient } from "@supabase/supabase-js";
import { MODULE_CODES, type ModuleCode } from "@/lib/modules";
import { getAstroProvider } from "@/lib/astro/provider";
import type { NatalInput } from "@/lib/astro/types";
import { generateDarrowReport } from "@/lib/ai/anthropic.server";
import { buildUserPrompt } from "@/lib/ai/user-prompt";
import { renderReportHtmlSafe } from "@/lib/pdf/template";
import { renderHtmlToPdf } from "@/lib/pdf/apitemplate.server";
import { sendEmail, reportReadyEmail, reportDelayEmail } from "@/lib/email/resend.server";
import { logStage } from "@/lib/observability/pipeline-log";

const STUCK_PROCESSING_MS = 4 * 60 * 1000; // 4 min
// CORE v3 produces 3000–3600 words (~5000 tokens), and Zod superRefine word-count rejections
// can force AI retries with backoff. Give the AI step enough room for retries + fallback model.
const STEP_TIMEOUT_MS = 15 * 60 * 1000;
const MAX_GENERATION_ATTEMPTS = 2;

let _sb: any = null;
function admin(): any {
  if (!_sb) {
    _sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  return _sb;
}

function appBaseUrl(): string {
  const u = process.env.APP_BASE_URL;
  if (!u) throw new Error("APP_BASE_URL is not configured");
  return u.replace(/\/$/, "");
}

async function withTimeout<T>(
  label: string,
  promise: Promise<T>,
  ms = STEP_TIMEOUT_MS,
  onTick?: () => Promise<void>,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let interval: ReturnType<typeof setInterval> | undefined;
  try {
    if (onTick) {
      interval = setInterval(() => {
        onTick().catch((e) => console.error(`[pipeline] ${label} heartbeat failed`, e));
      }, 30 * 1000);
    }
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)),
          ms,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
    if (interval) clearInterval(interval);
  }
}

async function heartbeat(order_id: string): Promise<void> {
  await admin()
    .from("generation_jobs")
    .update({ updated_at: new Date().toISOString() })
    .eq("order_id", order_id)
    .eq("status", "processing");
}

async function loadOrderContext(order_id: string) {
  const sb = admin();
  const { data: order } = await sb
    .from("orders")
    .select("id, customer_id, intake_id, status")
    .eq("id", order_id)
    .single();
  if (!order) throw new Error(`order ${order_id} not found`);

  const { data: intake } = await sb
    .from("intakes")
    .select(
      "id, date_of_birth, birth_time, birth_time_known, birth_city, latitude, longitude, timezone, full_name_for_numerology, bazi_sex",
    )
    .eq("id", order.intake_id)
    .single();
  if (!intake) throw new Error(`intake ${order.intake_id} not found`);

  const { data: customer } = await sb
    .from("customers")
    .select("id, first_name, email")
    .eq("id", order.customer_id)
    .single();

  const { data: ownedRows } = await sb
    .from("modules_purchased")
    .select("module_code")
    .eq("intake_id", order.intake_id);
  const owned = new Set<string>((ownedRows ?? []).map((r: any) => r.module_code));
  const hasCore = owned.has("CORE");
  const addons = MODULE_CODES.filter((m) => owned.has(m)) as ModuleCode[];
  const modules: Array<"CORE" | ModuleCode> = hasCore ? ["CORE", ...addons] : [...addons];

  return { order, intake, customer, modules };
}

async function upsertReportProcessing(intake_id: string, customer_id: string, modules: any[]) {
  const sb = admin();
  const { data: existing } = await sb
    .from("reports")
    .select("id, download_token, ai_content_json, model_used")
    .eq("intake_id", intake_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    await sb
      .from("reports")
      .update({
        modules_array: modules,
        generation_status: "processing",
        generation_error: null,
      })
      .eq("id", existing.id);
    return existing as {
      id: string;
      download_token: string;
      ai_content_json: any;
      model_used: string | null;
    };
  }

  const { data: created, error } = await sb
    .from("reports")
    .insert({
      customer_id,
      intake_id,
      modules_array: modules,
      generation_status: "processing",
    })
    .select("id, download_token, ai_content_json, model_used")
    .single();
  if (error || !created) throw new Error(`could not create report: ${error?.message}`);
  return created as {
    id: string;
    download_token: string;
    ai_content_json: any;
    model_used: string | null;
  };
}

async function claimGenerationJob(sb: any, order_id: string): Promise<boolean> {
  const { data: job, error } = await sb
    .from("generation_jobs")
    .select("id, status, attempt_count, updated_at")
    .eq("order_id", order_id)
    .maybeSingle();
  if (error) throw new Error(`could not load generation job: ${error.message}`);
  if (!job) throw new Error(`generation job for order ${order_id} not found`);
  if (job.status === "complete") {
    console.log("[pipeline] job already complete; skipping", { order_id });
    return false;
  }

  const updatedAtMs = Date.parse(job.updated_at ?? "");
  const isStuckProcessing =
    job.status === "processing" &&
    Number.isFinite(updatedAtMs) &&
    Date.now() - updatedAtMs > STUCK_PROCESSING_MS;
  if (job.status !== "queued" && !isStuckProcessing) return false;

  if ((job.attempt_count ?? 0) >= MAX_GENERATION_ATTEMPTS) {
    const msg = `Generation timed out after ${MAX_GENERATION_ATTEMPTS} attempts`;
    const { data: order } = await sb
      .from("orders")
      .select("intake_id")
      .eq("id", order_id)
      .maybeSingle();
    if (order?.intake_id) {
      await sb
        .from("reports")
        .update({
          generation_status: "failed_generation",
          generation_error: msg,
        })
        .eq("intake_id", order.intake_id)
        .neq("generation_status", "complete");
    }
    await sb
      .from("generation_jobs")
      .update({
        status: "failed",
        last_error: msg,
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);
    console.error("[pipeline] max attempts exhausted", {
      order_id,
      attempts: job.attempt_count,
      error: msg,
    });
    return false;
  }

  const { data: claimed, error: claimErr } = await sb
    .from("generation_jobs")
    .update({
      status: "processing",
      attempt_count: (job.attempt_count ?? 0) + 1,
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", job.id)
    .eq("updated_at", job.updated_at)
    .select("id")
    .maybeSingle();
  if (claimErr) throw new Error(`could not claim generation job: ${claimErr.message}`);
  if (claimed) {
    console.log("[pipeline] job claimed", { order_id, attempt: (job.attempt_count ?? 0) + 1 });
    logStage({
      stage: "worker_claimed",
      result: "success",
      order_id,
      generation_job_id: job.id,
      extra: { attempt: (job.attempt_count ?? 0) + 1 },
    });
  }
  return !!claimed;
}

export async function runFullGenerationPipeline(order_id: string): Promise<void> {
  const sb = admin();
  let report_id: string | null = null;
  let download_token: string | null = null;
  let firstName: string | null = null;
  let customerEmail: string | null = null;

  try {
    // Atomically claim the queued/stuck job so duplicate dispatches do not run paid AI/PDF work twice.
    const claimed = await claimGenerationJob(sb, order_id);
    if (!claimed) return;

    const { order, intake, customer, modules } = await loadOrderContext(order_id);
    if (order.status === "pending") throw new Error(`order ${order_id} is not paid yet`);
    firstName = customer?.first_name ?? null;
    customerEmail = customer?.email ?? null;
    console.log("[pipeline] generation started", { order_id, intake_id: intake.id, modules });

    // Pre-create reports row in 'processing' so polling UI sees it.
    const r = await upsertReportProcessing(intake.id, order.customer_id, modules);
    report_id = r.id;
    download_token = r.download_token;

    // If a previous attempt already produced AI content, skip astro + AI
    // and go straight to PDF rendering. This makes PDF-only retries cheap
    // and avoids re-billing Claude when only the renderer failed.
    // Stale-content guard (PART 8 of v3 migration).
    // Only reuse stored ai_content_json when it matches the active renderer.
    // Authoritative check: modules.CORE.schema_version === "core_v3".
    // Fallback: presence of "core_architecture" key on modules.CORE.
    // Anything else (legacy/stale) is discarded so we never feed a legacy
    // payload into the v3 renderer.
    const includesCore = (modules as string[]).includes("CORE");
    const stored = r.ai_content_json ?? null;
    const storedCore = stored?.modules?.CORE ?? null;
    const isV3 =
      !!storedCore &&
      (storedCore.schema_version === "core_v3" || storedCore.core_architecture != null);
    let report: any = stored && (!includesCore || isV3) ? stored : null;
    let model_used: string = report ? (r.model_used ?? "reused") : "reused";

    if (report) {
      console.log("[pipeline] reusing existing ai_content_json", {
        order_id,
        report_id,
        model_used,
        schema: storedCore?.schema_version ?? "(unset)",
      });
      logStage({
        stage: "ai_generation_completed",
        result: "success",
        order_id,
        extra: { model_used, reused: true },
      });
      await heartbeat(order_id);
    } else if (stored && includesCore) {
      console.warn("[pipeline] discarding stale legacy ai_content_json — will regenerate", {
        order_id,
        report_id,
      });
      await sb.from("reports").update({ ai_content_json: null }).eq("id", report_id);
    } else {
      // 1) Astro data — persist normalized JSON.
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
      const chart = await withTimeout(
        "Astro calculation",
        provider.computeNatal(natal),
        30 * 1000,
        () => heartbeat(order_id),
      );
      await heartbeat(order_id);

      const tAstro = Date.now();
      await sb.from("astro_data").insert({
        intake_id: intake.id,
        provider_name: chart.meta.provider_name,
        provider_version: chart.meta.provider_version,
        birth_time_source: chart.meta.birth_time_source,
        timezone_used: chart.meta.timezone_used,
        calculation_date: new Date().toISOString().slice(0, 10),
        generated_at: chart.meta.generated_at,
        normalized_json: chart,
        raw_json: null,
      });
      logStage({
        stage: "astro_data_generated",
        result: "success",
        order_id,
        duration_ms: Date.now() - tAstro,
      });

      // 2) AI generation via Anthropic.
      const userPrompt = buildUserPrompt({
        first_name: firstName,
        date_of_birth: intake.date_of_birth,
        birth_city: intake.birth_city,
        modules,
        chart,
      });
      logStage({ stage: "ai_generation_started", result: "success", order_id, extra: { modules } });
      const tAi = Date.now();
      const ai = await withTimeout(
        "AI report generation",
        generateDarrowReport(userPrompt),
        STEP_TIMEOUT_MS,
        () => heartbeat(order_id),
      );
      report = ai.report;
      model_used = ai.model_used;
      await heartbeat(order_id);
      // Persist immediately so PDF-only retries can skip this step on the next attempt.
      await sb.from("reports").update({ ai_content_json: report, model_used }).eq("id", report_id);
      console.log("[pipeline] AI done", { order_id, report_id, model_used });
      logStage({
        stage: "ai_generation_completed",
        result: "success",
        order_id,
        duration_ms: Date.now() - tAi,
        extra: { model_used },
      });
    }

    // 3) HTML → PDF.
    const html = renderReportHtmlSafe(report, { assetsBaseUrl: appBaseUrl() });
    const tPdf = Date.now();
    const pdfBytes = await withTimeout(
      "PDF rendering",
      renderHtmlToPdf(html, { order_id, report_id, modules: modules as string[] }),
      3 * 60 * 1000,
      () => heartbeat(order_id),
    );
    await heartbeat(order_id);
    console.log("[pipeline] PDF done", { order_id, report_id, bytes: pdfBytes.byteLength });
    logStage({
      stage: "pdf_generated",
      result: "success",
      order_id,
      duration_ms: Date.now() - tPdf,
      extra: { bytes: pdfBytes.byteLength },
    });

    // 4) Upload PDF.
    const path = `${download_token}.pdf`;
    const upload = await sb.storage.from("reports").upload(path, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (upload.error) throw new Error(`pdf upload failed: ${upload.error.message}`);

    // 5) Save final state.
    await sb
      .from("reports")
      .update({
        ai_content_json: report,
        pdf_url: path,
        model_used,
        generation_status: "complete",
        generation_error: null,
      })
      .eq("id", report_id);
    await sb.from("orders").update({ status: "complete" }).eq("id", order_id);
    await sb
      .from("generation_jobs")
      .update({
        status: "complete",
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", order_id);
    logStage({
      stage: "status_updated",
      result: "success",
      order_id,
      extra: { status: "complete" },
    });

    // 6) Send "report ready" email — only if not already sent for this
    // report+token. This makes PDF-only retries idempotent and prevents
    // duplicate ready-emails on cosmetic re-renders.
    const { data: existingMail } = await sb
      .from("reports")
      .select("ready_email_sent_at")
      .eq("id", report_id)
      .maybeSingle();
    const alreadyEmailed = !!existingMail?.ready_email_sent_at;
    if (customerEmail && !alreadyEmailed) {
      const downloadUrl = `${appBaseUrl()}/download/${download_token}`;
      const resultUrl = `${appBaseUrl()}/result/${download_token}`;
      const chapterCount = modules.filter((m) => m !== "CORE").length;
      const { subject, html } = reportReadyEmail({
        first_name: firstName,
        download_url: downloadUrl,
        result_url: resultUrl,
        assets_base_url: appBaseUrl(),
        has_core: modules.includes("CORE" as any),
        chapter_count: chapterCount,
        modules: modules as string[],
      });
      const tMail = Date.now();
      try {
        await sendEmail({ to: customerEmail, subject, html });
        await sb
          .from("reports")
          .update({ ready_email_sent_at: new Date().toISOString() })
          .eq("id", report_id);
        console.log("[pipeline] email sent", { order_id, report_id, to: customerEmail });
        logStage({
          stage: "email_sent",
          result: "success",
          order_id,
          duration_ms: Date.now() - tMail,
        });
      } catch (mailErr: any) {
        console.error("[pipeline] report-ready email failed", mailErr);
        logStage({
          stage: "email_sent",
          result: "failed",
          order_id,
          duration_ms: Date.now() - tMail,
          error: mailErr?.message,
        });
      }
    }
    console.log("[pipeline] job completed", { order_id, report_id, download_token });
  } catch (e: any) {
    const msg = String(e?.message ?? e).slice(0, 1000);
    console.error("[pipeline] failed for order", order_id, msg);

    const { data: failedJob } = await sb
      .from("generation_jobs")
      .select("attempt_count")
      .eq("order_id", order_id)
      .maybeSingle();
    const shouldRetry = (failedJob?.attempt_count ?? 0) < 2;

    if (report_id) {
      await sb
        .from("reports")
        .update({
          generation_status: shouldRetry ? "processing" : "failed_generation",
          generation_error: msg,
        })
        .eq("id", report_id);
    }
    await sb.from("orders").update({ status: "paid" }).eq("id", order_id);
    await sb
      .from("generation_jobs")
      .update({
        status: shouldRetry ? "queued" : "failed",
        last_error: msg,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", order_id);
    console.error("[pipeline] job failure recorded", {
      order_id,
      should_retry: shouldRetry,
      error: msg,
    });
    logStage({
      stage: "status_updated",
      result: shouldRetry ? "retry" : "failed",
      order_id,
      error: msg,
      extra: { attempt_count: failedJob?.attempt_count ?? 0 },
    });

    if (shouldRetry) return;

    // Delay email + admin alert.
    if (customerEmail) {
      try {
        const m = reportDelayEmail({ first_name: firstName, assets_base_url: appBaseUrl() });
        await sendEmail({ to: customerEmail, subject: m.subject, html: m.html });
      } catch (err) {
        console.error("[pipeline] delay email failed", err);
      }
    }
    const adminTo = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminTo) {
      try {
        await sendEmail({
          to: adminTo,
          subject: `[Darrow] generation failed for order ${order_id}`,
          html: `<pre style="font-family:monospace;white-space:pre-wrap">order_id: ${order_id}\nreport_id: ${report_id ?? "(none)"}\ncustomer: ${customerEmail ?? "(unknown)"}\n\n${msg}</pre>`,
        });
      } catch (err) {
        console.error("[pipeline] admin alert email failed", err);
      }
    }
    throw e;
  }
}
