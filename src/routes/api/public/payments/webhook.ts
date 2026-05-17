// Stripe webhook — THIN.
// Verifies signature, dedupes via stripe_events, marks order paid,
// records purchased modules and enqueues a generation_jobs row.
// pg_cron is the durable worker that runs the long generation request.
// pg_cron sweeps queued/stuck jobs as a safety net.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";
import { MODULE_CODES, type ModuleCode } from "@/lib/modules";
import { logStage } from "@/lib/observability/pipeline-log";

// All values that can land in modules_purchased.module_code (DB enum).
const ALL_MODULE_VALUES: string[] = ["CORE", ...MODULE_CODES];
type AnyModule = "CORE" | ModuleCode;

let _sb: any = null;
function sb(): any {
  if (!_sb) {
    _sb = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _sb;
}

function parseModules(raw: string | undefined): AnyModule[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((m) => m.trim().toUpperCase())
    .filter((m): m is AnyModule => ALL_MODULE_VALUES.includes(m));
}

async function handleCheckoutCompleted(session: any) {
  const meta = session?.metadata ?? {};
  const order_id = meta.order_id as string | undefined;
  const customer_id = meta.customer_id as string | undefined;
  const intake_id = meta.intake_id as string | undefined;
  const order_type = (meta.order_type as string | undefined) ?? "CORE";
  const modules_raw = meta.modules_to_purchase as string | undefined;

  if (!order_id || !customer_id || !intake_id) {
    console.error("[webhook] missing metadata", meta);
    return;
  }

  console.log("[webhook] checkout.session.completed received", {
    session_id: session.id,
    order_id,
    order_type,
    modules_raw,
  });
  logStage({
    stage: "webhook_received",
    result: "success",
    order_id,
    stripe_session_id: session.id,
    extra: { order_type },
  });

  const { data: existingOrder } = await sb()
    .from("orders")
    .select("status")
    .eq("id", order_id)
    .maybeSingle();

  if (!existingOrder) {
    console.error("[webhook] order not found", { order_id, session_id: session.id });
    return;
  }

  if (existingOrder.status !== "complete") {
    await sb()
    .from("orders")
    .update({ status: "paid", stripe_session_id: session.id })
    .eq("id", order_id);
    console.log("[webhook] order marked paid", { order_id });
  } else {
    console.log("[webhook] order already complete; not downgrading", { order_id });
  }

  // Determine modules to write to modules_purchased.
  // Accept both legacy (CORE/ADDONS/FULL_CODE_UPGRADE) and new canonical
  // (core/core_plus_modules/core_complete/core_complete_upgrade/addon) values.
  const type = order_type.toLowerCase();
  let modules: AnyModule[];
  if (type === "full_code_upgrade" || type === "core_complete_upgrade") {
    // Upgrade existing CORE-only customer to all 6 chapters (CORE row already exists implicitly).
    modules = [...MODULE_CODES];
  } else if (type === "core_complete") {
    // First-purchase CORE Complete: CORE + all 6 chapters.
    modules = ["CORE", ...MODULE_CODES];
  } else if (
    type === "addons" ||
    type === "addon" ||
    type === "focused" ||
    type === "core_plus_modules" ||
    type === "core_plus_addons"
  ) {
    modules = parseModules(modules_raw);
  } else if (type === "core") {
    // Explicit CORE row for new flows; legacy CORE orders left implicit.
    modules = parseModules(modules_raw);
    if (modules.length === 0) modules = ["CORE"];
  } else {
    modules = parseModules(modules_raw);
  }

  if (modules.length > 0) {
    const rows = modules.map((m) => ({
      customer_id,
      intake_id,
      order_id,
      module_code: m,
    }));
    const { error } = await sb()
      .from("modules_purchased")
      .upsert(rows, {
        onConflict: "customer_id,intake_id,module_code",
        ignoreDuplicates: true,
      });
    if (error) console.error("[webhook] modules upsert", error);
    else console.log("[webhook] modules recorded", { order_id, modules });
  }

  await ensureGenerationJob(order_id, intake_id);
}

async function ensureGenerationJob(order_id: string, intake_id: string) {
  const s = sb();
  const { data: completeReport } = await s
    .from("reports")
    .select("id, pdf_url, generation_status, modules_array")
    .eq("intake_id", intake_id)
    .eq("generation_status", "complete")
    .not("pdf_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: existingJob } = await s
    .from("generation_jobs")
    .select("id, status, attempt_count")
    .eq("order_id", order_id)
    .maybeSingle();

  if (completeReport) {
    const { data: ownedRows } = await s
      .from("modules_purchased")
      .select("module_code")
      .eq("intake_id", intake_id);
    const owned = new Set<string>(["CORE", ...((ownedRows ?? []).map((r: any) => r.module_code))]);
    const reportModules = new Set<string>(Array.isArray(completeReport.modules_array) ? completeReport.modules_array : []);
    const reportAlreadyCoversOwnedModules = Array.from(owned).every((m) => reportModules.has(m));

    if (!reportAlreadyCoversOwnedModules) {
      console.log("[webhook] existing report needs regeneration for newly purchased modules", {
        order_id,
        report_id: completeReport.id,
        owned: Array.from(owned),
        report_modules: Array.from(reportModules),
      });
    } else {
    if (existingJob?.status !== "complete") {
      await s.from("generation_jobs").upsert(
        { order_id, status: "complete", last_error: null, updated_at: new Date().toISOString() },
        { onConflict: "order_id" },
      );
    }
    console.log("[webhook] report already complete; job reconciled", { order_id, report_id: completeReport.id });
    return;
    }
  }

  if (existingJob) {
    console.log("[webhook] generation job already exists; keeping state", {
      order_id,
      status: existingJob.status,
      attempt_count: existingJob.attempt_count,
    });
    return;
  }

  const { error } = await s.from("generation_jobs").insert({
    order_id,
    status: "queued",
    last_error: null,
  });
  if (error) {
    console.error("[webhook] job create failed", { order_id, error });
    logStage({ stage: "job_enqueued", result: "failed", order_id, error: error.message });
  } else {
    console.log("[webhook] generation job created", { order_id });
    logStage({ stage: "job_enqueued", result: "success", order_id });
  }
}

async function handleEvent(
  event: { id: string; type: string; data: { object: any } },
) {
  console.log("[webhook] event received", { event_id: event.id, type: event.type });
  const { error: eventErr } = await sb()
    .from("stripe_events")
    .insert({ stripe_event_id: event.id });
  const duplicate = !!eventErr;
  if (eventErr) {
    console.log("[webhook] duplicate event or event insert issue; continuing idempotent handling", {
      event_id: event.id,
      code: eventErr.code,
      message: eventErr.message,
    });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;
    default:
      console.log("[webhook] unhandled", event.type);
  }

  await sb()
    .from("stripe_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("stripe_event_id", event.id);
  if (!duplicate) console.log("[webhook] event processed", { event_id: event.id });
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);
          await handleEvent(event);
          return Response.json({ received: true });
        } catch (e) {
          console.error("[webhook] error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
