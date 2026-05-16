// Stripe webhook — THIN.
// Verifies signature, dedupes via stripe_events, marks order paid,
// records purchased modules, enqueues a generation_jobs row, then
// best-effort fires the async dispatcher and returns 200 immediately.
// pg_cron sweeps queued/stuck jobs as a safety net.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";
import { MODULE_CODES, type ModuleCode } from "@/lib/modules";

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

function dispatcherUrl(): string | null {
  const base = process.env.APP_BASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/api/public/jobs/process-generation`;
}

type HandlerContext = {
  executionCtx?: {
    waitUntil?: (promise: Promise<unknown>) => void;
  };
};

function waitUntilFrom(context?: HandlerContext): ((promise: Promise<unknown>) => void) | undefined {
  if (context?.executionCtx?.waitUntil) return context.executionCtx.waitUntil.bind(context.executionCtx);
  const ctx = (globalThis as { __executionCtx?: { waitUntil?: (p: Promise<unknown>) => void } }).__executionCtx;
  return ctx?.waitUntil?.bind(ctx);
}

function fireDispatch(order_id: string, _context?: HandlerContext) {
  const url = dispatcherUrl();
  const secret = process.env.JOB_DISPATCH_SECRET;
  if (!url || !secret) return;
  const dispatch = fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
    body: JSON.stringify({ order_id }),
  }).catch((e) => console.error("[webhook] dispatch fire-and-forget failed", e));
  const waitUntil = waitUntilFrom(_context);
  waitUntil?.(dispatch);
}

async function handleCheckoutCompleted(session: any, context?: HandlerContext) {
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

  await sb()
    .from("orders")
    .update({ status: "paid", stripe_session_id: session.id })
    .eq("id", order_id);

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
  } else if (type === "addons" || type === "addon" || type === "core_plus_modules") {
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
  }

  // Enqueue (or reset) the generation job. Pipeline runs asynchronously.
  await sb()
    .from("generation_jobs")
    .upsert(
      { order_id, status: "queued", last_error: null, updated_at: new Date().toISOString() },
      { onConflict: "order_id" },
    );

  fireDispatch(order_id, context);
}

async function handleEvent(
  event: { id: string; type: string; data: { object: any } },
  context?: HandlerContext,
) {
  const { error: dupErr } = await sb()
    .from("stripe_events")
    .insert({ stripe_event_id: event.id });
  if (dupErr) return;

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object, context);
      break;
    default:
      console.log("[webhook] unhandled", event.type);
  }

  await sb()
    .from("stripe_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("stripe_event_id", event.id);
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);
          await handleEvent(event, context as unknown as HandlerContext);
          return Response.json({ received: true });
        } catch (e) {
          console.error("[webhook] error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
