// Report recovery support — read-only Supabase fetch (server-only).
//
// SUPPORT/DIAGNOSTIC only. Performs SELECTs against the EXISTING tables and maps
// them to SupportReportFacts via the pure toSupportFacts(). No writes, no AI, no
// Stripe, no email. Used by the support CLI; never wired into customer flows.

import { createClient } from "@supabase/supabase-js";
import { toSupportFacts, type SupportReportFacts } from "./report-support";

const REPORT_COLS =
  "id, report_ref, module_code, continuum_type, customer_id, intake_id, modules_array, pdf_url, generation_status, " +
  "generation_error, download_token, ready_email_sent_at, model_used, created_at";

function sb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for support lookups.");
  }
  return createClient(url, key);
}

async function withContext(s: any, report: any): Promise<SupportReportFacts> {
  const [{ data: customer }, { data: order }] = await Promise.all([
    s.from("customers").select("email, first_name").eq("id", report.customer_id).maybeSingle(),
    s
      .from("orders")
      .select("id, status, stripe_session_id, amount_cents, created_at")
      .eq("intake_id", report.intake_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  let job: any = null;
  if (order?.id) {
    const { data } = await s
      .from("generation_jobs")
      .select("attempt_count, last_error, status")
      .eq("order_id", order.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    job = data;
  }
  return toSupportFacts({ report, customer, order, job });
}

export interface SupportQuery {
  ref?: string;
  email?: string;
  stripe?: string;
}

// Returns one or more report support summaries. ref → single report; email →
// all reports for that customer; stripe → reports for that order's intake.
export async function fetchSupportFacts(q: SupportQuery): Promise<SupportReportFacts[]> {
  const s = sb();
  let reports: any[] = [];

  if (q.ref) {
    const { data } = await s.from("reports").select(REPORT_COLS).eq("report_ref", q.ref).limit(1);
    reports = data ?? [];
  } else if (q.email) {
    const { data: cust } = await s
      .from("customers")
      .select("id")
      .eq("email", q.email)
      .maybeSingle();
    if (cust?.id) {
      const { data } = await s
        .from("reports")
        .select(REPORT_COLS)
        .eq("customer_id", cust.id)
        .order("created_at", { ascending: false });
      reports = data ?? [];
    }
  } else if (q.stripe) {
    const { data: ord } = await s
      .from("orders")
      .select("intake_id")
      .eq("stripe_session_id", q.stripe)
      .maybeSingle();
    if (ord?.intake_id) {
      const { data } = await s
        .from("reports")
        .select(REPORT_COLS)
        .eq("intake_id", ord.intake_id)
        .order("created_at", { ascending: false });
      reports = data ?? [];
    }
  } else {
    throw new Error("Provide one of: ref, email, stripe.");
  }

  return Promise.all(reports.map((r) => withContext(s, r)));
}

// BUNDLE-D — purchase-level lookup: returns ALL sibling reports for the purchase.
// ref / stripe -> resolve the intake then list every module report for it (so a per-module
// report_ref like DC-…-LOVE returns that module PLUS its purchase context); email -> all of the
// customer's reports. Same-intake grouping only; never exposes another customer's reports.
export async function fetchPurchaseSupportFacts(q: SupportQuery): Promise<SupportReportFacts[]> {
  const s = sb();
  let intake_id: string | null = null;

  if (q.ref) {
    const { data } = await s
      .from("reports")
      .select("intake_id")
      .eq("report_ref", q.ref)
      .maybeSingle();
    intake_id = data?.intake_id ?? null;
  } else if (q.stripe) {
    const { data } = await s
      .from("orders")
      .select("intake_id")
      .eq("stripe_session_id", q.stripe)
      .maybeSingle();
    intake_id = data?.intake_id ?? null;
  } else if (q.email) {
    // Email spans all the customer's reports (possibly multiple purchases) — reuse base fetch.
    return fetchSupportFacts(q);
  } else {
    throw new Error("Provide one of: ref, email, stripe.");
  }

  if (!intake_id) return [];
  const { data: reports } = await s
    .from("reports")
    .select(REPORT_COLS)
    .eq("intake_id", intake_id)
    .order("created_at", { ascending: true });
  return Promise.all((reports ?? []).map((r) => withContext(s, r)));
}
