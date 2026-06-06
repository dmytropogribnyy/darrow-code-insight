// PHASE 6 — separate-pipeline dry run (diagnostic-only, gated, ASYNC like production).
//
// Mirrors the real flow: enqueue a generation_jobs row for a clearly-marked SYNTHETIC test order,
// let the existing pg_cron worker run runFullGenerationPipeline async (with BUNDLE_SEPARATE_REPORTS=1
// → the separate per-module pipeline). A separate fast "inspect" call reads the resulting rows and
// returns PASS/FAIL. This avoids generating inside one HTTP request (which exceeds the serverless
// timeout). No Stripe, no charge. Email is NOT sent for the dry run (BUNDLE-C delivery is exercised
// separately in PHASE 7). Runs in preview/staging where SUPABASE_SERVICE_ROLE_KEY is injected.
//
// Auth: JOB_DISPATCH_SECRET (Bearer) OR a self-set PHASE6_DRYRUN_TOKEN (Bearer).
//
//   1) POST { "action":"enqueue", "test_email":"you+phase6@…", "modules":["CORE","LOVE"] }
//        → { order_id, intake_id, status:"queued" }   (returns instantly)
//   2) wait ~1–4 min for the worker, then:
//      POST { "action":"inspect", "intake_id":"<from step 1>" }
//        → { pending|PASS, modules:[…], checks:{…} }
//   3) (optional idempotency) POST { "action":"reenqueue", "order_id":"…" } then inspect again —
//        row count must not grow.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { checkWorkerAuth, unauthorizedResponse } from "@/lib/jobs/auth";
import { MODULE_CODES } from "@/lib/modules";
import { separateReportsEnabled } from "@/lib/generation/bundle-reports";

let _sb: any = null;
function admin(): any {
  if (!_sb) _sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  return _sb;
}

const SYNTHETIC_BIRTH = {
  date_of_birth: "1990-01-12",
  birth_time: "09:30",
  birth_time_known: true,
  birth_city: "London, United Kingdom",
  latitude: 51.5074,
  longitude: -0.1278,
  timezone: "Europe/London",
  birth_country: "United Kingdom",
  bazi_sex: "F" as const,
};

async function ensureTestIntake(sb: any, test_email: string, first_name: string) {
  const { data: existing } = await sb
    .from("customers")
    .select("id")
    .eq("email", test_email)
    .maybeSingle();
  let customer_id: string;
  if (existing) {
    customer_id = existing.id;
    await sb.from("customers").update({ first_name }).eq("id", customer_id);
  } else {
    const { data: c, error } = await sb
      .from("customers")
      .insert({ email: test_email, first_name })
      .select("id")
      .single();
    if (error) throw new Error(`create test customer: ${error.message}`);
    customer_id = c.id;
  }
  const { data: intake, error: ie } = await sb
    .from("intakes")
    .insert({
      customer_id,
      date_of_birth: SYNTHETIC_BIRTH.date_of_birth,
      birth_time: SYNTHETIC_BIRTH.birth_time,
      birth_time_known: SYNTHETIC_BIRTH.birth_time_known,
      birth_city: SYNTHETIC_BIRTH.birth_city,
      latitude: SYNTHETIC_BIRTH.latitude,
      longitude: SYNTHETIC_BIRTH.longitude,
      timezone: SYNTHETIC_BIRTH.timezone,
      resolved_birth_place_name: SYNTHETIC_BIRTH.birth_city,
      birth_country: SYNTHETIC_BIRTH.birth_country,
      timezone_source: "phase6-dryrun",
      geocoding_provider: "phase6-dryrun",
      full_name_for_numerology: first_name,
      bazi_sex: SYNTHETIC_BIRTH.bazi_sex,
    })
    .select("id, customer_id")
    .single();
  if (ie) throw new Error(`create test intake: ${ie.message}`);
  return { intake_id: intake.id as string, customer_id };
}

// Create a synthetic test order + modules_purchased + a queued generation job. Returns instantly.
async function enqueue(body: any) {
  const sb = admin();
  const test_email = typeof body?.test_email === "string" ? body.test_email : null;
  const modules: string[] =
    Array.isArray(body?.modules) && body.modules.length ? body.modules : ["CORE", ...MODULE_CODES];

  let intake_id: string;
  let customer_id: string;
  let customer_email: string | null;
  if (typeof body?.intake_id === "string" && body.intake_id) {
    const { data: intake } = await sb
      .from("intakes")
      .select("id, customer_id")
      .eq("id", body.intake_id)
      .single();
    if (!intake) throw new Error(`intake ${body.intake_id} not found`);
    intake_id = intake.id;
    customer_id = intake.customer_id;
    const { data: cust } = await sb
      .from("customers")
      .select("email")
      .eq("id", customer_id)
      .maybeSingle();
    customer_email = cust?.email ?? null;
  } else {
    if (!test_email) throw new Error("Provide test_email or an existing intake_id.");
    const made = await ensureTestIntake(sb, test_email, "Phase6");
    intake_id = made.intake_id;
    customer_id = made.customer_id;
    customer_email = test_email;
  }

  const { data: order, error: oe } = await sb
    .from("orders")
    .insert({ customer_id, intake_id, amount_cents: 0, status: "paid" })
    .select("id")
    .single();
  if (oe) throw new Error(`create test order: ${oe.message}`);
  const order_id = order.id as string;
  await sb.from("modules_purchased").upsert(
    modules.map((m) => ({ customer_id, intake_id, order_id, module_code: m })),
    { onConflict: "customer_id,intake_id,module_code", ignoreDuplicates: true },
  );
  const { error: je } = await sb
    .from("generation_jobs")
    .insert({ order_id, status: "queued", last_error: null });
  if (je) throw new Error(`enqueue job: ${je.message}`);

  return {
    ok: true,
    mode: "enqueue",
    flag_BUNDLE_SEPARATE_REPORTS: separateReportsEnabled(process.env),
    order_id,
    intake_id,
    customer_email,
    modules,
    note:
      "Queued. The pg_cron worker will generate async (separate pipeline if the flag is ON). " +
      "Poll with { action: 'inspect', intake_id }. No email is sent for the dry run.",
  };
}

// Re-enqueue an existing test order (idempotency check: row count must not grow after a 2nd run).
async function reenqueue(body: any) {
  const sb = admin();
  const order_id = body?.order_id;
  if (typeof order_id !== "string" || !order_id) throw new Error("order_id required");
  await sb
    .from("generation_jobs")
    .upsert({ order_id, status: "queued", last_error: null }, { onConflict: "order_id" });
  return {
    ok: true,
    mode: "reenqueue",
    order_id,
    note: "Re-queued. Inspect again after the worker runs.",
  };
}

// Read the rows for a test intake and compute PASS/FAIL (fast; no generation).
async function inspect(body: any) {
  const sb = admin();
  const intake_id = body?.intake_id;
  if (typeof intake_id !== "string" || !intake_id) throw new Error("intake_id required");

  const { data: ownedRows } = await sb
    .from("modules_purchased")
    .select("module_code")
    .eq("intake_id", intake_id);
  const modules_expected = new Set<string>((ownedRows ?? []).map((r: any) => r.module_code)).size;

  const { data: order } = await sb
    .from("orders")
    .select("id, status")
    .eq("intake_id", intake_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  let job_status: string | null = null;
  if (order?.id) {
    const { data: job } = await sb
      .from("generation_jobs")
      .select("status, last_error")
      .eq("order_id", order.id)
      .maybeSingle();
    job_status = job?.status ?? null;
  }

  const { data: rows } = await sb
    .from("reports")
    .select("module_code, report_ref, download_token, pdf_url, generation_status")
    .eq("intake_id", intake_id)
    .order("created_at", { ascending: true });
  const moduleReport = (rows ?? []).map((r: any) => ({
    module_code: r.module_code,
    status: r.generation_status,
    report_ref: r.report_ref,
    ref_has_module_suffix:
      r.module_code && r.module_code !== "CORE"
        ? !!r.report_ref?.endsWith(`-${r.module_code}`)
        : null,
    download_token: r.download_token,
    storage_path: r.pdf_url,
    pdf_exists: !!r.pdf_url,
  }));

  const allComplete =
    moduleReport.length >= modules_expected &&
    moduleReport.length > 0 &&
    moduleReport.every((m: any) => m.status === "complete");
  const pending = !allComplete && job_status !== "failed";
  if (pending) {
    return {
      ok: true,
      mode: "inspect",
      pending: true,
      job_status,
      order_status: order?.status ?? null,
      modules_expected,
      rows_so_far: moduleReport.length,
      rows: moduleReport,
      note: "Still generating (or worker not swept yet). Poll again in ~30–60s.",
    };
  }

  const tokens = moduleReport.map((m: any) => m.download_token).filter(Boolean);
  const paths = moduleReport.map((m: any) => m.storage_path).filter(Boolean);
  const addonRows = moduleReport.filter((m: any) => m.module_code && m.module_code !== "CORE");
  const checks = {
    modules_expected,
    rows_created: moduleReport.length,
    all_complete: moduleReport.every((m: any) => m.status === "complete"),
    all_have_pdf: moduleReport.every((m: any) => m.pdf_exists),
    unique_download_tokens:
      new Set(tokens).size === tokens.length && tokens.length === moduleReport.length,
    unique_storage_paths:
      new Set(paths).size === paths.length && paths.length === moduleReport.length,
    addon_refs_have_suffix: addonRows.every((m: any) => m.ref_has_module_suffix === true),
    core_ref_present: moduleReport.some((m: any) => m.module_code === "CORE" && !!m.report_ref),
  };
  const PASS =
    checks.all_complete &&
    checks.all_have_pdf &&
    checks.unique_download_tokens &&
    checks.unique_storage_paths &&
    checks.addon_refs_have_suffix &&
    checks.core_ref_present;

  return {
    ok: true,
    mode: "inspect",
    pending: false,
    PASS,
    job_status,
    order_status: order?.status ?? null,
    modules: moduleReport,
    checks,
    note: "Diagnostic test records left in place for support:report verification. No Stripe, no charge.",
  };
}

export const Route = createFileRoute("/api/public/debug/separate-pipeline-dryrun")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const dryToken = process.env.PHASE6_DRYRUN_TOKEN;
        if (!process.env.JOB_DISPATCH_SECRET && !dryToken)
          return new Response("not configured", { status: 500 });
        const bearer = (request.headers.get("authorization") ?? "")
          .replace(/^Bearer\s+/i, "")
          .trim();
        const okByDryToken = !!dryToken && bearer === dryToken;
        if (!okByDryToken) {
          const auth = checkWorkerAuth(request.headers);
          if (!auth.ok) return unauthorizedResponse(auth);
        }
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          // body optional
        }
        const action = body?.action ?? "enqueue";
        try {
          const result =
            action === "inspect"
              ? await inspect(body)
              : action === "reenqueue"
                ? await reenqueue(body)
                : await enqueue(body);
          return Response.json(result);
        } catch (e: any) {
          return Response.json(
            {
              ok: false,
              mode: action,
              error: String(e?.message ?? e).slice(0, 1000),
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
