// Async dispatcher for the generation pipeline.
// Called fire-and-forget from the Stripe webhook AND polled by pg_cron as a
// safety net. Authenticated by JOB_DISPATCH_SECRET.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { runFullGenerationPipeline } from "@/lib/generation/pipeline.server";

let _sb: any = null;
function sb(): any {
  if (!_sb) {
    _sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  return _sb;
}

const STUCK_PROCESSING_MS = 4 * 60 * 1000; // 4 min

function isAuthorized(request: Request): boolean {
  const secret = process.env.JOB_DISPATCH_SECRET;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const auth = request.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : request.headers.get("x-job-secret") ?? "";
  const apikey = request.headers.get("apikey") ?? "";
  return (!!secret && provided === secret) || (!!publishableKey && apikey === publishableKey);
}

async function pickOrderId(body: any): Promise<string | null> {
  if (typeof body?.order_id === "string" && body.order_id.length > 0) {
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
    if (j.status === "queued") return j.order_id;
    const ageMs = Date.now() - new Date(j.updated_at).getTime();
    if (j.status === "processing" && ageMs > STUCK_PROCESSING_MS) return j.order_id;
  }
  return null;
}

async function dispatchGeneration(order_id: string): Promise<Response> {
  const run = runFullGenerationPipeline(order_id);
  try {
    await run;
    return Response.json({ ok: true, order_id, status: "complete" });
  } catch (e: any) {
    return Response.json(
      { ok: false, order_id, error: String(e?.message ?? e).slice(0, 500) },
      { status: 500 },
    );
  }
}

export const Route = createFileRoute("/api/public/jobs/process-generation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!process.env.JOB_DISPATCH_SECRET) return new Response("not configured", { status: 500 });
        if (!isAuthorized(request)) return new Response("Unauthorized", { status: 401 });

        let body: any = {};
        try { body = await request.json(); } catch {}

        const order_id = await pickOrderId(body);
        if (!order_id) return Response.json({ ok: true, picked: null });
        return dispatchGeneration(order_id);
      },
      GET: async ({ request }) => {
        if (!process.env.JOB_DISPATCH_SECRET) return new Response("not configured", { status: 500 });
        if (!isAuthorized(request)) return new Response("Unauthorized", { status: 401 });

        const order_id = await pickOrderId({});
        if (!order_id) return Response.json({ ok: true, picked: null });
        return dispatchGeneration(order_id);
      },
    },
  },
});
