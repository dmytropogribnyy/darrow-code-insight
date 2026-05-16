// Throttled admin email alerts for pipeline health conditions.
// Called from the sweeper route once per cron tick (every minute).
// One email per alert kind per 30 minutes — admin_alerts table holds last_sent_at.

import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/resend.server";
import { logStage } from "./pipeline-log";

const THROTTLE_MS = 30 * 60 * 1000;

export type AlertKind =
  | "paid_no_job_3m"
  | "queued_5m"
  | "processing_10m"
  | "failed_generation"
  | "sweeper_stale_15m";

let _sb: any = null;
function sb(): any {
  if (!_sb) _sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  return _sb;
}

async function shouldSend(kind: AlertKind): Promise<boolean> {
  const s = sb();
  const { data } = await s.from("admin_alerts").select("last_sent_at").eq("kind", kind).maybeSingle();
  if (!data) return true;
  const last = Date.parse(data.last_sent_at);
  if (!Number.isFinite(last)) return true;
  return Date.now() - last > THROTTLE_MS;
}

async function markSent(kind: AlertKind): Promise<void> {
  await sb()
    .from("admin_alerts")
    .upsert({ kind, last_sent_at: new Date().toISOString() }, { onConflict: "kind" });
}

async function emit(kind: AlertKind, subject: string, body: string): Promise<void> {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!to) return;
  if (!(await shouldSend(kind))) return;
  try {
    await sendEmail({
      to,
      subject: `[Darrow] ${subject}`,
      html: `<pre style="font-family:monospace;white-space:pre-wrap;font-size:13px">${body}</pre>`,
    });
    await markSent(kind);
    logStage({ stage: "alert_sent", result: "success", extra: { kind } });
  } catch (e: any) {
    logStage({ stage: "alert_sent", result: "failed", error: e?.message, extra: { kind } });
  }
}

export async function checkAlertConditions(): Promise<void> {
  const s = sb();
  const now = Date.now();

  // 1) Paid orders sitting > 3 min with no generation_job row.
  const threeMinAgo = new Date(now - 3 * 60 * 1000).toISOString();
  const { data: orphanOrders } = await s
    .from("orders")
    .select("id, created_at, intake_id")
    .in("status", ["paid", "processing"])
    .lt("created_at", threeMinAgo)
    .limit(20);
  const orphans: any[] = [];
  for (const o of orphanOrders ?? []) {
    const { data: j } = await s.from("generation_jobs").select("id").eq("order_id", o.id).maybeSingle();
    if (!j) orphans.push(o);
  }
  if (orphans.length > 0) {
    await emit(
      "paid_no_job_3m",
      `${orphans.length} paid order(s) without a generation job (>3 min)`,
      `Orders missing generation_jobs row:\n\n${orphans.map((o) => `- ${o.id}  (paid ${o.created_at})`).join("\n")}\n\nThe sweeper auto-repairs these; this alert means repair is lagging.`,
    );
  }

  // 2) Queued > 5 min.
  const fiveMinAgo = new Date(now - 5 * 60 * 1000).toISOString();
  const { data: queuedOld } = await s
    .from("generation_jobs")
    .select("id, order_id, updated_at, attempt_count")
    .eq("status", "queued")
    .lt("updated_at", fiveMinAgo)
    .limit(20);
  if ((queuedOld ?? []).length > 0) {
    await emit(
      "queued_5m",
      `${queuedOld!.length} generation job(s) queued >5 min`,
      queuedOld!.map((j: any) => `- order=${j.order_id}  attempts=${j.attempt_count}  updated=${j.updated_at}`).join("\n"),
    );
  }

  // 3) Processing > 10 min.
  const tenMinAgo = new Date(now - 10 * 60 * 1000).toISOString();
  const { data: procOld } = await s
    .from("generation_jobs")
    .select("id, order_id, updated_at, attempt_count, last_error")
    .eq("status", "processing")
    .lt("updated_at", tenMinAgo)
    .limit(20);
  if ((procOld ?? []).length > 0) {
    await emit(
      "processing_10m",
      `${procOld!.length} generation job(s) stuck processing >10 min`,
      procOld!
        .map((j: any) => `- order=${j.order_id}  attempts=${j.attempt_count}  updated=${j.updated_at}\n  last_error=${j.last_error ?? "(none)"}`)
        .join("\n\n"),
    );
  }

  // 4) failed_generation reports that appeared SINCE the last alert we sent for this kind.
  // Prevents re-sending the same failure every 30 min for 24h.
  const { data: lastAlert } = await s
    .from("admin_alerts")
    .select("last_sent_at")
    .eq("kind", "failed_generation")
    .maybeSingle();
  // First-ever alert: look back 24h. Otherwise: only reports created after last alert.
  const sinceIso = lastAlert?.last_sent_at
    ? new Date(lastAlert.last_sent_at).toISOString()
    : new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const { data: failed } = await s
    .from("reports")
    .select("id, intake_id, generation_error, created_at")
    .eq("generation_status", "failed_generation")
    .gt("created_at", sinceIso)
    .limit(20);
  if ((failed ?? []).length > 0) {
    await emit(
      "failed_generation",
      `${failed!.length} new report(s) marked failed_generation since ${sinceIso}`,
      failed!.map((r: any) => `- report=${r.id}  intake=${r.intake_id}  at=${r.created_at}\n  error=${r.generation_error ?? "(none)"}`).join("\n\n"),
    );
  }

  // 5) Sweeper hasn't run successfully in 15 min.
  try {
    const { data: rpc } = await s.rpc("last_sweeper_run_at");
    const last = rpc ? Date.parse(String(rpc)) : NaN;
    if (Number.isFinite(last) && now - last > 15 * 60 * 1000) {
      await emit(
        "sweeper_stale_15m",
        "Generation sweeper cron has not run in >15 min",
        `Last successful sweeper run: ${new Date(last).toISOString()}\nCheck Supabase cron job darrow-generation-sweeper-v2.`,
      );
    }
  } catch (e: any) {
    // Non-fatal: missing RPC just means we cannot check.
    console.warn("[alerts] last_sweeper_run_at rpc failed:", e?.message);
  }
}
