import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createStripeClient, type StripeEnv } from "@/lib/stripe.server";
import {
  CORE_PRICE_ID,
  CORE_PRICE_CENTS,
  FULL_CODE_UPGRADE_PRICE_ID,
  FULL_CODE_UPGRADE_CENTS,
  MODULE_CODES,
  priceForModules,
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
const ModuleCodeSchema = z.enum(MODULE_CODES as [ModuleCode, ...ModuleCode[]]);
const STUCK_PROCESSING_MS = 4 * 60 * 1000;

async function geocodeCity(city: string) {
  const { geocodeCityGeoapify } = await import("@/lib/geocoding.server");
  return geocodeCityGeoapify(city);
}

async function resolveStripeLineItems(
  stripe: ReturnType<typeof createStripeClient>,
  lookupKeys: string[],
): Promise<{ price: string; quantity: number }[]> {
  // Stripe lookup_keys are unique → list with the set returns each once.
  const uniq = Array.from(new Set(lookupKeys));
  const prices = await stripe.prices.list({ lookup_keys: uniq });
  const byKey = new Map(prices.data.map((p) => [p.lookup_key as string, p.id]));
  return lookupKeys.map((lk) => {
    const id = byKey.get(lk);
    if (!id) throw new Error(`Price not found: ${lk}`);
    return { price: id, quantity: 1 };
  });
}

// ============================================================
// NEW: Flexible first-purchase checkout (CORE-inclusive flows only — Phase A)
// modules = chapters selected (LOVE..PLACE); CORE is always included.
// ============================================================
export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      first_name: z.string().trim().min(1).max(100),
      email: z.string().trim().email().max(255),
      date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      birth_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().or(z.literal("")),
      birth_city: z.string().trim().min(1).max(255),
      full_name_for_numerology: z.string().trim().max(255).optional().or(z.literal("")),
      modules: z.array(ModuleCodeSchema).max(6).default([]),
      bazi_sex: z.enum(["M", "F"]),
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

    // Phase A: CORE is always included for first-purchase flows.
    const quote = priceForModules(data.modules, true);

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

    const { data: order, error: orderErr } = await sb
      .from("orders")
      .insert({
        customer_id,
        intake_id,
        amount_cents: quote.cents,
        status: "pending",
      })
      .select("id")
      .single();
    if (orderErr) throw new Error("Could not create order");
    const order_id = order.id as string;

    const stripe = createStripeClient(data.environment);
    const line_items = await resolveStripeLineItems(stripe, quote.lookup_keys);

    // Determine canonical order_type for the webhook
    let order_type: string;
    if (data.modules.length === 0) order_type = "core";
    else if (data.modules.length === 6) order_type = "core_complete";
    else order_type = "core_plus_modules";

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
        // CSV that webhook will write to modules_purchased
        modules_to_purchase: quote.modules_owned_on_success.join(","),
      },
    });

    await sb.from("orders").update({ stripe_session_id: session.id }).eq("id", order_id);

    return { client_secret: session.client_secret!, session_id: session.id };
  });

// ============================================================
// LEGACY: thin wrapper for any in-flight code paths that still call createCoreCheckout.
// New code should use createCheckout({ modules: [] }).
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
    // Reuse the path above with no chapters selected. Legacy callers default to "M" for bazi sex.
    return createCheckout({ data: { ...data, modules: [], bazi_sex: "M" } });
  });

// ============================================================
// Add-on / CORE Complete upgrade checkout (returning customer from /result)
// Now bundle-priced via priceForModules.
// ============================================================
export const createUpsellCheckout = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      report_token: z.string().min(8).max(255),
      modules: z.array(ModuleCodeSchema).min(1).max(6),
      order_type: z.enum(["ADDONS", "FULL_CODE_UPGRADE"]),
      origin: z.string().url(),
      environment: StripeEnvSchema,
    }).parse,
  )
  .handler(async ({ data }) => {
    const sb = admin();

    const { data: report } = await sb
      .from("reports")
      .select("intake_id, customer_id")
      .eq("download_token", data.report_token)
      .maybeSingle();
    if (!report) throw new Error("Report not found");
    const intake_id = report.intake_id as string;
    const customer_id = report.customer_id as string;

    const { data: customer } = await sb
      .from("customers")
      .select("email")
      .eq("id", customer_id)
      .single();

    const { data: ownedRows } = await sb
      .from("modules_purchased")
      .select("module_code")
      .eq("intake_id", intake_id);
    const owned = new Set<string>((ownedRows ?? []).map((r: any) => r.module_code));

    const stripe = createStripeClient(data.environment);
    let modules: ModuleCode[];
    let amount_cents: number;
    let line_items: { price: string; quantity: number }[];
    let canonical_order_type: string;

    if (data.order_type === "FULL_CODE_UPGRADE") {
      // CORE-only customer completing to CORE Complete. Single fixed SKU at $10.
      modules = MODULE_CODES.filter((m) => !owned.has(m));
      if (modules.length === 0) throw new Error("All chapters already purchased");
      amount_cents = FULL_CODE_UPGRADE_CENTS;
      line_items = await resolveStripeLineItems(stripe, [FULL_CODE_UPGRADE_PRICE_ID]);
      canonical_order_type = "core_complete_upgrade";
    } else {
      const requested = data.modules.filter((m) => !owned.has(m));
      if (requested.length === 0) throw new Error("All requested chapters already purchased");
      modules = requested;
      const quote = priceForModules(requested, false);
      amount_cents = quote.cents;
      line_items = await resolveStripeLineItems(stripe, quote.lookup_keys);
      canonical_order_type = "addon";
    }

    const { data: order, error: orderErr } = await sb
      .from("orders")
      .insert({
        customer_id,
        intake_id,
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
        intake_id,
        order_id,
        order_type: canonical_order_type,
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

    let { data: job } = await sb
      .from("generation_jobs")
      .select("status, attempt_count, last_error, updated_at")
      .eq("order_id", order.id)
      .maybeSingle();

    if ((order.status === "paid" || order.status === "processing") && !job) {
      const { data: createdJob } = await sb
        .from("generation_jobs")
        .insert({ order_id: order.id, status: "queued" })
        .select("status, attempt_count, last_error, updated_at")
        .single();
      job = createdJob;
      console.log("[generation-status] recreated missing job", { order_id: order.id });
    }

    const jobAgeMs = job?.updated_at ? Date.now() - new Date(job.updated_at).getTime() : null;
    const jobLooksStuck =
      (job?.status === "queued" && jobAgeMs !== null && jobAgeMs > 60 * 1000) ||
      (job?.status === "processing" && jobAgeMs !== null && jobAgeMs > STUCK_PROCESSING_MS);

    const { data: report } = await sb
      .from("reports")
      .select("download_token, generation_status, generation_error")
      .eq("intake_id", order.intake_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      order_status: order.status as string,
      generation_status: (report?.generation_status as string) ?? null,
      generation_error: (report?.generation_error as string | null) ?? null,
      job_status: (job?.status as string | null) ?? null,
      job_attempt_count: (job?.attempt_count as number | null) ?? null,
      job_last_error: (job?.last_error as string | null) ?? null,
      job_age_ms: jobAgeMs,
      job_recovery_pending: jobLooksStuck,
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

    // CORE is always implicitly owned when a report row exists (legacy).
    // New orders write an explicit CORE row; we union both so the UI is consistent.
    const ownedSet = new Set<string>(["CORE", ...(owned ?? []).map((r: any) => r.module_code)]);

    // All sibling reports for the same intake — each is its own PDF.
    const { data: siblings } = await sb
      .from("reports")
      .select("download_token, modules_array, generation_status, generation_error, created_at")
      .eq("intake_id", report.intake_id)
      .order("created_at", { ascending: false });

    return {
      generation_status: report.generation_status as string,
      owned_modules: Array.from(ownedSet),
      reports: (siblings ?? []).map((r: any) => ({
        report_token: r.download_token as string,
        modules: (r.modules_array ?? []) as string[],
        status: r.generation_status as string,
        error: (r.generation_error as string | null) ?? null,
        created_at: r.created_at as string,
        is_current: (r.download_token as string) === data.report_token,
      })),
    };
  });
