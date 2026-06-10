// Safe re-send of the "report ready" email for an already-completed report.
// Authenticated by JOB_DISPATCH_SECRET or SUPABASE_PUBLISHABLE_KEY apikey.
// Duplicate-protected via reports.ready_email_sent_at unless { force: true } is passed.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, reportReadyEmail } from "@/lib/email/resend.server";
import { checkWorkerAuth, unauthorizedResponse } from "@/lib/jobs/auth";
function appBaseUrl(): string {
  const u = process.env.APP_BASE_URL;
  if (!u) throw new Error("APP_BASE_URL is not configured");
  return u.replace(/\/$/, "");
}

let _sb: any = null;
function sb(): any {
  if (!_sb) _sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  return _sb;
}

export const Route = createFileRoute("/api/public/jobs/resend-ready-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = checkWorkerAuth(request.headers);
        if (!auth.ok) return unauthorizedResponse(auth);
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          // ignore: request body may be absent or non-JSON
        }
        const orderId: string | undefined = body?.order_id;
        const reportId: string | undefined = body?.report_id;
        const token: string | undefined = body?.download_token;
        const force: boolean = !!body?.force;
        if (!orderId && !reportId && !token) {
          return new Response(
            JSON.stringify({ ok: false, error: "order_id, report_id or download_token required" }),
            { status: 400, headers: { "content-type": "application/json" } },
          );
        }

        const s = sb();
        let q = s
          .from("reports")
          .select(
            "id, intake_id, generation_status, pdf_url, download_token, ready_email_sent_at, modules_array, module_code, continuum_type",
          )
          .limit(1);
        if (reportId) q = q.eq("id", reportId);
        else if (token) q = q.eq("download_token", token);
        else {
          const { data: ord } = await s
            .from("orders")
            .select("intake_id")
            .eq("id", orderId)
            .single();
          if (!ord)
            return new Response(JSON.stringify({ ok: false, error: "order not found" }), {
              status: 404,
              headers: { "content-type": "application/json" },
            });
          q = q.eq("intake_id", ord.intake_id);
        }
        const { data: rep, error: repErr } = await q.maybeSingle();
        if (repErr || !rep)
          return new Response(JSON.stringify({ ok: false, error: "report not found" }), {
            status: 404,
            headers: { "content-type": "application/json" },
          });
        if (rep.generation_status !== "complete" || !rep.pdf_url) {
          return new Response(JSON.stringify({ ok: false, error: "report not complete" }), {
            status: 409,
            headers: { "content-type": "application/json" },
          });
        }
        if (rep.ready_email_sent_at && !force) {
          return new Response(
            JSON.stringify({ ok: true, skipped: "already_sent", sent_at: rep.ready_email_sent_at }),
            { headers: { "content-type": "application/json" } },
          );
        }

        const { data: intake } = await s
          .from("intakes")
          .select("customer_id")
          .eq("id", rep.intake_id)
          .single();
        const { data: customer } = await s
          .from("customers")
          .select("email, first_name")
          .eq("id", intake.customer_id)
          .single();
        if (!customer?.email)
          return new Response(JSON.stringify({ ok: false, error: "no customer email" }), {
            status: 422,
            headers: { "content-type": "application/json" },
          });

        const downloadUrl = `${appBaseUrl()}/download/${rep.download_token}`;
        const resultUrl = `${appBaseUrl()}/result/${rep.download_token}`;
        const modulesArray: string[] = Array.isArray(rep.modules_array) ? rep.modules_array : [];
        const hasCore = modulesArray.includes("CORE");
        const chapterCount = modulesArray.filter((m) => m !== "CORE").length;
        const { subject, html } = reportReadyEmail({
          first_name: customer.first_name ?? null,
          download_url: downloadUrl,
          result_url: resultUrl,
          assets_base_url: appBaseUrl(),
          has_core: hasCore,
          chapter_count: chapterCount,
          modules: modulesArray,
        });
        try {
          const result = await sendEmail({ to: customer.email, subject, html });
          await s
            .from("reports")
            .update({ ready_email_sent_at: new Date().toISOString() })
            .eq("id", rep.id);
          return new Response(
            JSON.stringify({ ok: true, sent_to: customer.email, resend_id: result?.id ?? null }),
            { headers: { "content-type": "application/json" } },
          );
        } catch (e: any) {
          console.error("[resend-ready-email] failed", e);
          return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), {
            status: 502,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
