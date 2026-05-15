// Stripe webhook — fast path only.
// Verifies signature, dedupes via stripe_events, marks order paid,
// records purchased modules, enqueues a generation_jobs row.
// The actual pipeline runs in PROMPT 1C.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";
import { MODULE_CODES, type ModuleCode } from "@/lib/modules";

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

function parseModules(raw: string | undefined): ModuleCode[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((m) => m.trim().toUpperCase())
    .filter((m): m is ModuleCode => (MODULE_CODES as string[]).includes(m));
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

  // Mark order paid
  await sb()
    .from("orders")
    .update({ status: "paid", stripe_session_id: session.id })
    .eq("id", order_id);

  // Record purchased modules
  let modules: ModuleCode[];
  if (order_type === "CORE") {
    modules = []; // CORE is implicit on the report; no module rows
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
    await sb().from("modules_purchased").insert(rows);
  }

  // Enqueue generation job (one per order)
  await sb().from("generation_jobs").insert({ order_id, status: "queued" });
}

async function handleEvent(event: { id: string; type: string; data: { object: any } }) {
  // Idempotency — record event id
  const { error: dupErr } = await sb()
    .from("stripe_events")
    .insert({ stripe_event_id: event.id });
  if (dupErr) {
    // unique violation = already processed
    return;
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "transaction.completed":
      await handleCheckoutCompleted(event.data.object);
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
