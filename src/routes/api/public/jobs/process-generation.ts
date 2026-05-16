// Async dispatcher for the generation pipeline.
// Called by the Stripe webhook and polled by pg_cron as a safety net.
// Authenticated by JOB_DISPATCH_SECRET / publishable apikey.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { runFullGenerationPipeline } from "@/lib/generation/pipeline.server";
import { reportReadyEmail, sendEmail } from "@/lib/email/resend.server";

let _sb: any = null;
function sb(): any {
  if (!_sb) {
    _sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  return _sb;
}

const STUCK_PROCESSING_MS = 4 * 60 * 1000; // 4 min
const QUEUED_GRACE_MS = 30 * 1000;

function appBaseUrl(): string {
  const u = process.env.APP_BASE_URL;
  if (!u) throw new Error("APP_BASE_URL is not configured");
  return u.replace(/\/$/, "");
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.JOB_DISPATCH_SECRET;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const auth = request.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : request.headers.get("x-job-secret") ?? "";
  const apikey = request.headers.get("apikey") ?? "";
  return (!!secret && provided === secret) || (!!publishableKey && apikey === publishableKey) || isProjectAnonKey(apikey);
}

function isProjectAnonKey(apikey: string): boolean {
  if (!apikey.includes(".")) return false;
  try {
    const [, payload] = apikey.split(".");
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    const expectedRef =
      process.env.SUPABASE_PROJECT_ID ??
      process.env.VITE_SUPABASE_PROJECT_ID ??
      process.env.SUPABASE_URL?.match(/^https:\/\/([^.]+)\./)?.[1];
    return !!expectedRef && json?.role === "anon" && json?.ref === expectedRef;
  } catch {
    return false;
  }
}

async function pickOrderId(body: any): Promise<string | null> {
  if (typeof body?.order_id === "string" && body.order_id.length > 0) {
    console.log("[dispatcher] explicit dispatch requested", { order_id: body.order_id });
    return body.order_id;
  }
  // Sweeper: pick the oldest queued job, or stuck processing.
  const { data: queued } = await sb()
    .from("generation_jobs")
    .select("order_id, status, updated_at")
    .in("status", ["queued", "processing"])
    .order("created_at", { ascending: true })
    .limit(10);
  if (!queued || queued.length === 0) return null;
  for (const j of queued) {
    const ageMs = Date.now() - new Date(j.updated_at).getTime();
    if (j.status === "queued" && ageMs > QUEUED_GRACE_MS) {
      console.log("[dispatcher] picked queued job", { order_id: j.order_id, age_ms: ageMs });
      return j.order_id;
    }
    if (j.status === "processing" && ageMs > STUCK_PROCESSING_MS) {
      console.log("[dispatcher] picked stuck processing job", { order_id: j.order_id, age_ms: ageMs });
      return j.order_id;
    }
  }
  return null;
}

async function dispatchGeneration(order_id: string): Promise<Response> {
  try {
    console.log("[dispatcher] generation dispatch started", { order_id });
    await runFullGenerationPipeline(order_id);
    console.log("[dispatcher] generation dispatch finished", { order_id });
    return Response.json({ ok: true, order_id, status: "complete" });
  } catch (e: any) {
    console.error("[dispatcher] generation dispatch failed", { order_id, error: e?.message ?? e });
    return Response.json(
      { ok: false, order_id, error: String(e?.message ?? e).slice(0, 500) },
      { status: 500 },
    );
  }
}

async function repairPaidOrdersWithoutJobs(): Promise<number> {
  const s = sb();
  const { data: orders } = await s
    .from("orders")
    .select("id, intake_id, status")
    .in("status", ["paid", "processing"])
    .order("created_at", { ascending: true })
    .limit(50);
  let repaired = 0;
  for (const order of orders ?? []) {
    const { data: job } = await s.from("generation_jobs").select("id").eq("order_id", order.id).maybeSingle();
    if (job) continue;

    const { data: completeReport } = await s
      .from("reports")
      .select("id, pdf_url")
      .eq("intake_id", order.intake_id)
      .eq("generation_status", "complete")
      .not("pdf_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const status = completeReport ? "complete" : "queued";
    const { error } = await s.from("generation_jobs").insert({ order_id: order.id, status });
    if (error) console.error("[dispatcher] missing-job repair failed", { order_id: order.id, error });
    else {
      repaired += 1;
      console.log("[dispatcher] missing generation job repaired", { order_id: order.id, status });
      if (completeReport) await s.from("orders").update({ status: "complete" }).eq("id", order.id);
    }
  }
  return repaired;
}

async function sendOneMissingReadyEmail(): Promise<boolean> {
  const s = sb();
  const { data: rep } = await s
    .from("reports")
    .select("id, intake_id, download_token, modules_array")
    .eq("generation_status", "complete")
    .not("pdf_url", "is", null)
    .is("ready_email_sent_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!rep) return false;

  const { data: intake } = await s.from("intakes").select("customer_id").eq("id", rep.intake_id).single();
  const { data: customer } = await s.from("customers").select("email, first_name").eq("id", intake.customer_id).single();
  if (!customer?.email) return false;

  const modulesArray: string[] = Array.isArray(rep.modules_array) ? rep.modules_array : [];
  const downloadUrl = `${appBaseUrl()}/download/${rep.download_token}`;
  const resultUrl = `${appBaseUrl()}/result/${rep.download_token}`;
  const { subject, html } = reportReadyEmail({
    first_name: customer.first_name ?? null,
    download_url: downloadUrl,
    result_url: resultUrl,
    assets_base_url: appBaseUrl(),
    has_core: modulesArray.includes("CORE"),
    chapter_count: modulesArray.filter((m) => m !== "CORE").length,
  });
  await sendEmail({ to: customer.email, subject, html });
  await s.from("reports").update({ ready_email_sent_at: new Date().toISOString() }).eq("id", rep.id);
  console.log("[dispatcher] missing ready email sent", { report_id: rep.id, to: customer.email });
  return true;
}

export const Route = createFileRoute("/api/public/jobs/process-generation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!process.env.JOB_DISPATCH_SECRET) return new Response("not configured", { status: 500 });
        if (!isAuthorized(request)) return new Response("Unauthorized", { status: 401 });

        let body: any = {};
        try { body = await request.json(); } catch {}
        await repairPaidOrdersWithoutJobs();

        const order_id = await pickOrderId(body);
        if (!order_id) return Response.json({ ok: true, picked: null, email_recovery: await sendOneMissingReadyEmail() });
        return dispatchGeneration(order_id);
      },
      GET: async ({ request }) => {
        if (!process.env.JOB_DISPATCH_SECRET) return new Response("not configured", { status: 500 });
        if (!isAuthorized(request)) return new Response("Unauthorized", { status: 401 });

        await repairPaidOrdersWithoutJobs();
        const order_id = await pickOrderId({});
        if (!order_id) return Response.json({ ok: true, picked: null, email_recovery: await sendOneMissingReadyEmail() });
        return dispatchGeneration(order_id);
      },
    },
  },
});
