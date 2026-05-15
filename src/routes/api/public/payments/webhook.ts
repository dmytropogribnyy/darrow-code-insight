// Stripe webhook — fast path.
// Verifies signature, dedupes via stripe_events, marks order paid,
// records purchased modules (idempotent), and runs the placeholder
// generation pipeline so /generating can progress to /result.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";
import { MODULE_CODES, type ModuleCode } from "@/lib/modules";
import { runPlaceholderGeneration } from "@/utils/generation.functions";

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

  await sb()
    .from("orders")
    .update({ status: "paid", stripe_session_id: session.id })
    .eq("id", order_id);

  const modules: ModuleCode[] =
    order_type === "FULL_CODE_UPGRADE"
      ? [...MODULE_CODES]
      : order_type === "ADDONS"
        ? parseModules(modules_raw)
        : []; // CORE — implicit on the report

  if (modules.length > 0) {
    const rows = modules.map((m) => ({
      customer_id,
      intake_id,
      order_id,
      module_code: m,
    }));
    // Ignore duplicates (e.g. FULL_CODE upgrade after some add-ons already owned)
    const { error } = await sb()
      .from("modules_purchased")
      .upsert(rows, {
        onConflict: "customer_id,intake_id,module_code",
        ignoreDuplicates: true,
      });
    if (error) console.error("[webhook] modules upsert", error);
  }

  // Track job for observability; not strictly required by the polling flow.
  await sb().from("generation_jobs").insert({ order_id, status: "processing" });

  try {
    await runPlaceholderGeneration(order_id);
    await sb()
      .from("generation_jobs")
      .update({ status: "complete", updated_at: new Date().toISOString() })
      .eq("order_id", order_id);
  } catch (e: any) {
    console.error("[webhook] generation failed", e);
    await sb()
      .from("generation_jobs")
      .update({
        status: "failed",
        last_error: String(e?.message ?? e),
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", order_id);
    await sb().from("orders").update({ status: "failed_generation" }).eq("id", order_id);
  }
}

async function handleEvent(event: { id: string; type: string; data: { object: any } }) {
  const { error: dupErr } = await sb()
    .from("stripe_events")
    .insert({ stripe_event_id: event.id });
  if (dupErr) return; // already processed

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
