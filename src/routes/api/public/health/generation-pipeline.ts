// Public, no-auth health check for the paid-order generation pipeline.
// Designed for an external uptime monitor. Returns no PII.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

let _sb: any = null;
function sb(): any {
  if (!_sb) _sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  return _sb;
}

async function countPaidOrdersWithoutJob24h(s: any): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: orders } = await s
    .from("orders")
    .select("id")
    .in("status", ["paid", "processing"])
    .gte("created_at", since);
  if (!orders || orders.length === 0) return 0;
  const ids = orders.map((o: any) => o.id);
  const { data: jobs } = await s.from("generation_jobs").select("order_id").in("order_id", ids);
  const have = new Set<string>((jobs ?? []).map((j: any) => j.order_id));
  return ids.filter((id: string) => !have.has(id)).length;
}

async function countByStatusOlderThan(s: any, status: string, ms: number): Promise<number> {
  const cutoff = new Date(Date.now() - ms).toISOString();
  const { count } = await s
    .from("generation_jobs")
    .select("id", { count: "exact", head: true })
    .eq("status", status)
    .lt("updated_at", cutoff);
  return count ?? 0;
}

async function countFailedReports24h(s: any): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await s
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("generation_status", "failed_generation")
    .gte("created_at", since);
  return count ?? 0;
}

async function lastSuccessfulGenerationAt(s: any): Promise<string | null> {
  const { data } = await s
    .from("generation_jobs")
    .select("updated_at")
    .eq("status", "complete")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.updated_at ?? null;
}

async function lastSweeperRunAt(s: any): Promise<string | null> {
  try {
    const { data } = await s.rpc("last_sweeper_run_at");
    return data ? String(data) : null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/public/health/generation-pipeline")({
  server: {
    handlers: {
      GET: async () => {
        const s = sb();
        try {
          const [paid_no_job, queued_5m, processing_10m, failed_24h, last_ok, last_sweep] = await Promise.all([
            countPaidOrdersWithoutJob24h(s),
            countByStatusOlderThan(s, "queued", 5 * 60 * 1000),
            countByStatusOlderThan(s, "processing", 10 * 60 * 1000),
            countFailedReports24h(s),
            lastSuccessfulGenerationAt(s),
            lastSweeperRunAt(s),
          ]);
          const sweepFresh =
            !!last_sweep && Date.now() - Date.parse(last_sweep) < 15 * 60 * 1000;
          const healthy = paid_no_job === 0 && queued_5m === 0 && processing_10m === 0 && sweepFresh;
          return Response.json(
            {
              healthy,
              checked_at: new Date().toISOString(),
              paid_orders_without_job_24h: paid_no_job,
              queued_older_than_5m: queued_5m,
              processing_older_than_10m: processing_10m,
              failed_generation_24h: failed_24h,
              last_successful_generation_at: last_ok,
              last_sweeper_run_at: last_sweep,
            },
            { status: healthy ? 200 : 503 },
          );
        } catch (e: any) {
          return Response.json(
            { healthy: false, error: String(e?.message ?? e).slice(0, 200) },
            { status: 500 },
          );
        }
      },
    },
  },
});
