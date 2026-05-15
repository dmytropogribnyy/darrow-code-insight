import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createStripeClient, type StripeEnv } from "@/lib/stripe.server";
import {
  CORE_PRICE_ID,
  CORE_PRICE_CENTS,
  FULL_CODE_UPGRADE_PRICE_ID,
  FULL_CODE_UPGRADE_CENTS,
  MODULE_PRICE_ID,
  MODULE_PRICE_CENTS,
  MODULE_CODES,
  type ModuleCode,
} from "@/lib/modules";

let _supabase: any = null;
function admin(): any {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

const StripeEnvSchema = z.enum(["sandbox", "live"]);

// ---------- Geocoding (Geoapify) ----------
async function geocodeCity(city: string) {
  const { geocodeCityGeoapify } = await import("@/lib/geocoding.server");
  return geocodeCityGeoapify(city);
}

// ============================================================
// CORE checkout — submits intake + opens $4.99 Stripe checkout
// ============================================================
export const createCoreCheckout = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      first_name: z.string().trim().min(1).max(100),
      email: z.string().trim().email().max(255),
      date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      birth_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().or(z.literal("")),
      birth_city: z.string().trim().min(1).max(255),
      full_name_for_numerology: z.string().trim().max(255).optional().or(z.literal("")),
      origin: z.string().url(),
      environment: StripeEnvSchema,
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
    const sb = admin();

    // 1. Use pre-resolved place from autocomplete if present, otherwise geocode the freeform input.
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

    // 2. Upsert customer by email
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

    // 3. Insert intake
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
      })
      .select("id")
      .single();
    if (intakeErr) throw new Error("Could not create intake");
    const intake_id = intake.id as string;

    // 4. Create pending order
    const { data: order, error: orderErr } = await sb
      .from("orders")
      .insert({
        customer_id,
        intake_id,
        amount_cents: CORE_PRICE_CENTS,
        status: "pending",
      })
      .select("id")
      .single();
    if (orderErr) throw new Error("Could not create order");
    const order_id = order.id as string;

    // 5. Create Stripe checkout session
    const stripe = createStripeClient(data.environment);
    const prices = await stripe.prices.list({ lookup_keys: [CORE_PRICE_ID] });
    if (!prices.data.length) throw new Error("Core price not found");
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: prices.data[0].id, quantity: 1 }],
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: `${data.origin}/generating?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: data.email,
      metadata: {
        customer_id,
        intake_id,
        order_id,
        order_type: "CORE",
        modules_to_purchase: "CORE",
      },
    });

    // 6. Stamp session id on order
    await sb.from("orders").update({ stripe_session_id: session.id }).eq("id", order_id);

    return { client_secret: session.client_secret!, session_id: session.id };
  });

// ============================================================
// Add-on / FULL CODE upgrade checkout
// ============================================================
export const createUpsellCheckout = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      intake_id: z.string().uuid(),
      modules: z.array(z.enum(MODULE_CODES as [ModuleCode, ...ModuleCode[]])).min(1).max(6),
      order_type: z.enum(["ADDONS", "FULL_CODE_UPGRADE"]),
      origin: z.string().url(),
      environment: StripeEnvSchema,
    }).parse,
  )
  .handler(async ({ data }) => {
    const sb = admin();

    // Resolve customer
    const { data: intake, error: intakeErr } = await sb
      .from("intakes")
      .select("id, customer_id")
      .eq("id", data.intake_id)
      .single();
    if (intakeErr || !intake) throw new Error("Intake not found");
    const customer_id = intake.customer_id as string;

    const { data: customer } = await sb
      .from("customers")
      .select("email")
      .eq("id", customer_id)
      .single();

    // Determine modules + amount
    let modules: ModuleCode[];
    let amount_cents: number;
    let line_items: { price: string; quantity: number }[];
    const stripe = createStripeClient(data.environment);

    if (data.order_type === "FULL_CODE_UPGRADE") {
      modules = [...MODULE_CODES];
      amount_cents = FULL_CODE_UPGRADE_CENTS;
      const prices = await stripe.prices.list({
        lookup_keys: [FULL_CODE_UPGRADE_PRICE_ID],
      });
      if (!prices.data.length) throw new Error("Upgrade price not found");
      line_items = [{ price: prices.data[0].id, quantity: 1 }];
    } else {
      modules = data.modules;
      amount_cents = modules.length * MODULE_PRICE_CENTS;
      const prices = await stripe.prices.list({
        lookup_keys: modules.map((m) => MODULE_PRICE_ID[m]),
      });
      // Build line_items in correct order
      line_items = modules.map((m) => {
        const lk = MODULE_PRICE_ID[m];
        const p = prices.data.find((pr) => pr.lookup_key === lk);
        if (!p) throw new Error(`Price not found: ${lk}`);
        return { price: p.id, quantity: 1 };
      });
    }

    // Pending order
    const { data: order, error: orderErr } = await sb
      .from("orders")
      .insert({
        customer_id,
        intake_id: data.intake_id,
        amount_cents,
        status: "pending",
      })
      .select("id")
      .single();
    if (orderErr) throw new Error("Could not create order");
    const order_id = order.id as string;

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: `${data.origin}/generating?session_id={CHECKOUT_SESSION_ID}`,
      ...(customer?.email && { customer_email: customer.email as string }),
      metadata: {
        customer_id,
        intake_id: data.intake_id,
        order_id,
        order_type: data.order_type,
        modules_to_purchase: modules.join(","),
      },
    });

    await sb.from("orders").update({ stripe_session_id: session.id }).eq("id", order_id);

    return { client_secret: session.client_secret!, session_id: session.id };
  });

// ============================================================
// Polled by /generating to know when the report is ready
// ============================================================
export const getGenerationStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ session_id: z.string().min(1).max(255) }).parse)
  .handler(async ({ data }) => {
    const sb = admin();
    const { data: order } = await sb
      .from("orders")
      .select("id, status, intake_id")
      .eq("stripe_session_id", data.session_id)
      .maybeSingle();

    if (!order) {
      return { order_status: "pending" as const, generation_status: null, report_token: null };
    }

    // Latest report for this intake
    const { data: report } = await sb
      .from("reports")
      .select("download_token, generation_status")
      .eq("intake_id", order.intake_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      order_status: order.status as string,
      generation_status: (report?.generation_status as string) ?? null,
      report_token:
        report?.generation_status === "complete" ? (report.download_token as string) : null,
    };
  });

// ============================================================
// Read by /result page to know which modules to offer / hide
// ============================================================
export const getReportContext = createServerFn({ method: "POST" })
  .inputValidator(z.object({ report_token: z.string().min(1).max(255) }).parse)
  .handler(async ({ data }) => {
    const sb = admin();
    const { data: report } = await sb
      .from("reports")
      .select("id, intake_id, customer_id, modules_array, generation_status")
      .eq("download_token", data.report_token)
      .maybeSingle();
    if (!report) return null;

    const { data: owned } = await sb
      .from("modules_purchased")
      .select("module_code")
      .eq("intake_id", report.intake_id);

    return {
      intake_id: report.intake_id as string,
      generation_status: report.generation_status as string,
      owned_modules: ((owned ?? []).map((r: any) => r.module_code)) as string[],
    };
  });
