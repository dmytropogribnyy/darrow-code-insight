// PHASE 6 — separate-pipeline dry run (diagnostic-only, gated).
//
// Exercises the REAL separate per-module pipeline (buildDefaultSeparateHooks: Supabase + AI + PDF
// + storage) end-to-end in the preview/staging env, where SUPABASE_SERVICE_ROLE_KEY is already
// injected — so no local key is needed. Auth: JOB_DISPATCH_SECRET (Bearer), same as the other
// /api/public/debug/* routes. Default = NO email (finalize overridden to status-only). Creates a
// CLEARLY-MARKED synthetic test order/intake (or uses a provided test intake_id). No Stripe, no
// charge. Returns structured PASS/FAIL diagnostics.
//
//   POST /api/public/debug/separate-pipeline-dryrun
//   Authorization: Bearer <JOB_DISPATCH_SECRET>
//   { "test_email": "you+phase6@…", "send_email": false, "idempotency": true }
//   (optional) "intake_id": "<existing test intake>"  — else a synthetic intake is created
//   (optional) "modules": ["CORE","LOVE",…]           — default CORE + all 6

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { checkWorkerAuth, unauthorizedResponse } from "@/lib/jobs/auth";
import { MODULE_CODES } from "@/lib/modules";
import {
  runSeparateReportsPipeline,
  buildDefaultSeparateHooks,
  type SeparatePipelineHooks,
} from "@/lib/generation/separate-reports-pipeline.server";
import { separateReportsEnabled } from "@/lib/generation/bundle-reports";

let _sb: any = null;
function admin(): any {
  if (!_sb) _sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  return _sb;
}

// Synthetic, non-customer birth data (London, time known). Used when no intake_id is supplied.
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

async function readModuleRows(sb: any, intake_id: string) {
  const { data } = await sb
    .from("reports")
    .select("module_code, report_ref, download_token, pdf_url, generation_status, modules_array")
    .eq("intake_id", intake_id)
    .order("created_at", { ascending: true });
  return (data ?? []) as any[];
}

async function runDryRun(body: any) {
  const sb = admin();
  const test_email = typeof body?.test_email === "string" ? body.test_email : null;
  const send_email = body?.send_email === true;
  const idempotency = body?.idempotency === true;
  const modules: string[] =
    Array.isArray(body?.modules) && body.modules.length ? body.modules : ["CORE", ...MODULE_CODES];

  // 1) Resolve / create the test intake.
  let intake_id: string;
  let customer_id: string;
  let customer_email: string | null = null;
  if (typeof body?.intake_id === "string" && body.intake_id) {
    intake_id = body.intake_id;
    const { data: intake } = await sb
      .from("intakes")
      .select("id, customer_id")
      .eq("id", intake_id)
      .single();
    if (!intake) throw new Error(`intake ${intake_id} not found`);
    customer_id = intake.customer_id;
    const { data: cust } = await sb
      .from("customers")
      .select("email")
      .eq("id", customer_id)
      .maybeSingle();
    customer_email = cust?.email ?? null;
  } else {
    if (!test_email)
      throw new Error("Provide test_email (controlled address) or an existing intake_id.");
    const made = await ensureTestIntake(sb, test_email, "Phase6");
    intake_id = made.intake_id;
    customer_id = made.customer_id;
    customer_email = test_email;
  }

  // Safety: never email an address that wasn't explicitly confirmed for this run.
  if (send_email && customer_email !== test_email) {
    throw new Error("send_email requires test_email to match the intake's customer email.");
  }

  // 2) Create a clearly-marked TEST order + modules_purchased.
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

  // 3) Hooks — default NO email (finalize overridden to status-only). send_email=true uses real finalize.
  const realHooks = buildDefaultSeparateHooks(sb);
  const hooks: SeparatePipelineHooks = send_email
    ? realHooks
    : {
        ...realHooks,
        finalize: async (oid, _results, outcome) => {
          await sb.from("orders").update({ status: outcome.order_status }).eq("id", oid);
          await sb
            .from("generation_jobs")
            .update({ status: outcome.job_status, updated_at: new Date().toISOString() })
            .eq("order_id", oid);
        },
      };

  // 4) Run the real pipeline.
  const first = await runSeparateReportsPipeline(order_id, hooks);
  const rowsAfter1 = await readModuleRows(sb, intake_id);

  // 5) Idempotency — re-run; row count must not grow and every module should skip.
  let idem: any = null;
  if (idempotency) {
    const second = await runSeparateReportsPipeline(order_id, hooks);
    const rowsAfter2 = await readModuleRows(sb, intake_id);
    idem = {
      ran: true,
      row_count_before: rowsAfter1.length,
      row_count_after: rowsAfter2.length,
      no_duplicate_rows: rowsAfter2.length === rowsAfter1.length,
      all_skipped_on_rerun: second.results.every(
        (r: any) => r.status === "skipped_existing" || r.status === "complete",
      ),
    };
  }

  const rows = await readModuleRows(sb, intake_id);
  const moduleReport = rows.map((r) => ({
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

  const tokens = moduleReport.map((m) => m.download_token).filter(Boolean);
  const paths = moduleReport.map((m) => m.storage_path).filter(Boolean);
  const addonRows = moduleReport.filter((m) => m.module_code && m.module_code !== "CORE");
  const checks = {
    modules_expected: modules.length,
    rows_created: moduleReport.length,
    all_complete: moduleReport.length > 0 && moduleReport.every((m) => m.status === "complete"),
    all_have_pdf: moduleReport.every((m) => m.pdf_exists),
    unique_download_tokens:
      new Set(tokens).size === tokens.length && tokens.length === moduleReport.length,
    unique_storage_paths:
      new Set(paths).size === paths.length && paths.length === moduleReport.length,
    addon_refs_have_suffix: addonRows.every((m) => m.ref_has_module_suffix === true),
    core_ref_present: moduleReport.some((m) => m.module_code === "CORE" && !!m.report_ref),
    outcome_consistent: first.outcome.allComplete === (first.outcome.failed === 0),
    order_not_complete_when_failed:
      first.outcome.failed === 0 ? true : first.outcome.order_status === "failed_generation",
  };
  const PASS =
    checks.all_complete &&
    checks.all_have_pdf &&
    checks.unique_download_tokens &&
    checks.unique_storage_paths &&
    checks.addon_refs_have_suffix &&
    checks.core_ref_present &&
    (!idem || idem.no_duplicate_rows);

  return {
    ok: true,
    mode: "separate-pipeline-dryrun",
    flag_BUNDLE_SEPARATE_REPORTS: separateReportsEnabled(process.env),
    order_id,
    intake_id,
    customer_email,
    email_sent: send_email,
    outcome: first.outcome,
    modules: moduleReport,
    idempotency: idem,
    checks,
    PASS,
    note: "Diagnostic test records left in place for support:report verification. No Stripe, no charge.",
  };
}

export const Route = createFileRoute("/api/public/debug/separate-pipeline-dryrun")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!process.env.JOB_DISPATCH_SECRET)
          return new Response("not configured", { status: 500 });
        const auth = checkWorkerAuth(request.headers);
        if (!auth.ok) return unauthorizedResponse(auth);
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          // body optional
        }
        try {
          return Response.json(await runDryRun(body));
        } catch (e: any) {
          return Response.json(
            {
              ok: false,
              mode: "separate-pipeline-dryrun",
              error: String(e?.message ?? e).slice(0, 1000),
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
