// PHASE 5 — Continuum standalone checkout (in-repo TanStack server fn, mirrors createCheckout).
//
// Continuum is a SEPARATE one-time product (7d/30d), not a module, not a bundle, not in CORE
// Complete. Fresh intake (birth data) per purchase. Gated by CONTINUUM_ENABLED — when OFF the
// server fn refuses, so legacy checkout is bit-for-bit unchanged. No mutable cart; one session
// created at submit. Uses the Lovable-managed Stripe via createStripeClient + lookup_keys.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createStripeClient } from "@/lib/stripe.server";
import { CONTINUUM_PRODUCTS, continuumEnabled } from "@/lib/continuum/continuum-config";

let _sb: any = null;
function admin(): any {
  if (!_sb) _sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  return _sb;
}

async function geocodeCity(city: string) {
  const { geocodeCityGeoapify } = await import("@/lib/geocoding.server");
  return geocodeCityGeoapify(city);
}

async function resolveStripeLineItems(
  stripe: ReturnType<typeof createStripeClient>,
  lookupKeys: string[],
): Promise<{ price: string; quantity: number }[]> {
  const uniq = Array.from(new Set(lookupKeys));
  const prices = await stripe.prices.list({ lookup_keys: uniq });
  const byKey = new Map(prices.data.map((p) => [p.lookup_key as string, p.id]));
  return lookupKeys.map((lk) => {
    const id = byKey.get(lk);
    if (!id) throw new Error(`Price not found: ${lk}`);
    return { price: id, quantity: 1 };
  });
}

export const createContinuumCheckout = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      continuum_type: z.enum(["7d", "30d"]),
      first_name: z.string().trim().min(1).max(100),
      email: z.string().trim().email().max(255),
      date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      birth_time: z
        .string()
        .regex(/^\d{2}:\d{2}(:\d{2})?$/)
        .optional()
        .or(z.literal("")),
      birth_city: z.string().trim().min(1).max(255),
      full_name_for_numerology: z.string().trim().max(255).optional().or(z.literal("")),
      bazi_sex: z.enum(["M", "F"]),
      origin: z.string().url(),
      environment: z.enum(["sandbox", "live"]),
      resolved_place: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
          timezone: z.string().min(1),
          resolved_name: z.string().min(1),
          country: z.string().nullable().optional(),
        })
        .optional(),
    }).parse,
  )
  .handler(async ({ data }) => {
    if (!continuumEnabled()) {
      throw new Error("Continuum is not available yet.");
    }
    const sb = admin();
    const product = CONTINUUM_PRODUCTS[data.continuum_type];

    const geo = data.resolved_place
      ? {
          latitude: data.resolved_place.latitude,
          longitude: data.resolved_place.longitude,
          timezone: data.resolved_place.timezone,
          resolved_name: data.resolved_place.resolved_name,
          country: data.resolved_place.country ?? null,
        }
      : await geocodeCity(data.birth_city);
    if (!geo) {
      throw new Error(
        "Please select your birth city from the list so we can calculate your chart accurately.",
      );
    }

    const { data: existing } = await sb
      .from("customers")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();
    let customer_id: string;
    if (existing) {
      customer_id = existing.id as string;
      await sb.from("customers").update({ first_name: data.first_name }).eq("id", customer_id);
    } else {
      const { data: created, error } = await sb
        .from("customers")
        .insert({ email: data.email, first_name: data.first_name })
        .select("id")
        .single();
      if (error) throw new Error("Could not create customer");
      customer_id = created.id as string;
    }

    const { data: intake, error: intakeErr } = await sb
      .from("intakes")
      .insert({
        customer_id,
        date_of_birth: data.date_of_birth,
        birth_time: data.birth_time || null,
        birth_time_known: !!data.birth_time,
        birth_city: data.birth_city,
        latitude: geo.latitude,
        longitude: geo.longitude,
        timezone: geo.timezone,
        resolved_birth_place_name: geo.resolved_name,
        birth_country: geo.country,
        timezone_source: "geoapify",
        geocoding_provider: "geoapify",
        full_name_for_numerology: data.full_name_for_numerology || null,
        bazi_sex: data.bazi_sex,
      })
      .select("id")
      .single();
    if (intakeErr) throw new Error("Could not create intake");
    const intake_id = intake.id as string;

    const order_type = `continuum_${data.continuum_type}`; // continuum_7d | continuum_30d
    const { data: order, error: orderErr } = await sb
      .from("orders")
      .insert({
        customer_id,
        intake_id,
        amount_cents: product.price_cents,
        status: "pending",
        continuum_type: data.continuum_type,
      })
      .select("id")
      .single();
    if (orderErr) throw new Error("Could not create order");
    const order_id = order.id as string;

    const stripe = createStripeClient(data.environment);
    const line_items = await resolveStripeLineItems(stripe, [product.price_id]);

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: `${data.origin}/generating?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: data.email,
      metadata: {
        customer_id,
        intake_id,
        order_id,
        order_type,
        continuum_type: data.continuum_type,
        // No modules for Continuum.
        modules_to_purchase: "",
      },
    });

    await sb.from("orders").update({ stripe_session_id: session.id }).eq("id", order_id);
    return { client_secret: session.client_secret!, session_id: session.id };
  });
