// CORE v4.1 render-only diagnostic route — B4.
//
// NON-MUTATING. Guaranteed by design:
//   – no customer records, orders, generation_jobs, or tokens created/mutated
//   – no Stripe / payment calls
//   – no email sent
//   – no AI generation (requires pre-generated core_json in request body)
//   – no production pipeline used (generateDarrowReport stays v3)
//   – no Supabase access (no read or write)
//   – no token/download routes touched
//
// Auth: JOB_DISPATCH_SECRET (Bearer) — same guard as core-v4-run.ts.
//
// Supported POST modes:
//   render_html  — renders v4.1 CORE to HTML; returns JSON with html field
//   render_pdf   — renders HTML → APITemplate → pruneBlankPages → stampPageNumbers
//                  → returns binary PDF for visual review
//
// Request body:
//   {
//     mode: "render_html" | "render_pdf",
//     core_json: <CoreV4Schema object with schema_version "core_v4">,
//     client_name?: string   (default: "Diagnostic User")
//   }

import { createFileRoute } from "@tanstack/react-router";
import { checkWorkerAuth, unauthorizedResponse } from "@/lib/jobs/auth";
import { renderCoreV4HtmlSafe } from "@/lib/pdf/template";
import { renderHtmlToPdf } from "@/lib/pdf/apitemplate.server";

const SAFETY_NOTES = [
  "No paid customer records created or mutated.",
  "No orders, generation_jobs, or tokens written.",
  "No Stripe / payment calls.",
  "No email sent.",
  "No AI generation — requires pre-generated core_json in request body.",
  "No production pipeline used (v3 pipeline unchanged).",
  "No Supabase access (read or write).",
  "No token/download routes used.",
];

export const Route = createFileRoute("/api/public/debug/core-v4-render")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!process.env.JOB_DISPATCH_SECRET)
          return new Response("not configured", { status: 500 });
        const auth = checkWorkerAuth(request.headers);
        if (!auth.ok) return unauthorizedResponse(auth);
        return Response.json({
          ok: true,
          route: "/api/public/debug/core-v4-render",
          stage: "B4-render-only",
          supported_modes: ["render_html", "render_pdf"],
          safety_notes: SAFETY_NOTES,
          notes: [
            "POST with { mode, core_json, client_name? } to render.",
            "render_html returns the HTML string for inspection.",
            "render_pdf calls APITemplate and returns a binary PDF.",
            "core_json must be a valid CoreV4Schema object (schema_version: 'core_v4').",
            "No AI generation is triggered — supply pre-generated core_json.",
          ],
        });
      },
      POST: async ({ request }) => {
        if (!process.env.JOB_DISPATCH_SECRET)
          return new Response("not configured", { status: 500 });
        const auth = checkWorkerAuth(request.headers);
        if (!auth.ok) return unauthorizedResponse(auth);

        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
        }

        const mode: string = typeof body?.mode === "string" ? body.mode : "render_html";
        const coreJson = body?.core_json ?? null;
        const clientName: string =
          typeof body?.client_name === "string" && body.client_name.trim()
            ? body.client_name.trim()
            : "Diagnostic User";

        if (!coreJson || typeof coreJson !== "object") {
          return Response.json(
            {
              ok: false,
              error:
                "core_json (CoreV4Schema object) is required in request body. " +
                "It must have schema_version: 'core_v4' and all 17 body section keys.",
              example_shape: {
                mode: "render_html",
                client_name: "Alex",
                core_json: {
                  schema_version: "core_v4",
                  cover_tagline: "Your personal architecture, decoded.",
                  orientation: { prose: "..." },
                  core_architecture: { prose: "..." },
                  "...": "17 body keys total",
                },
              },
            },
            { status: 400 },
          );
        }

        if (!["render_html", "render_pdf"].includes(mode)) {
          return Response.json(
            {
              ok: false,
              error: `Unknown mode "${mode}". Supported: render_html, render_pdf`,
            },
            { status: 400 },
          );
        }

        let html: string;
        try {
          html = renderCoreV4HtmlSafe(coreJson, clientName);
        } catch (e: any) {
          return Response.json(
            {
              ok: false,
              error: `v4.1 render failed: ${String(e?.message ?? e).slice(0, 500)}`,
            },
            { status: 500 },
          );
        }

        if (mode === "render_html") {
          return Response.json({
            ok: true,
            mode: "render_html",
            stage: "B4-render-only",
            client_name: clientName,
            html_bytes: html.length,
            safety_notes: SAFETY_NOTES,
            html,
          });
        }

        // render_pdf — calls APITemplate; returns binary PDF for visual review
        if (!process.env.APITEMPLATE_API_KEY) {
          return Response.json(
            { ok: false, error: "APITEMPLATE_API_KEY is not configured" },
            { status: 500 },
          );
        }

        try {
          const pdf = await renderHtmlToPdf(html, {
            report_id: "v4-diagnostic",
          });
          // pdf-lib always returns a plain ArrayBuffer; cast required because
          // TypeScript types Uint8Array.buffer as ArrayBufferLike (too conservative).
          return new Response(pdf as unknown as BodyInit, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": 'attachment; filename="darrow-core-v4-diagnostic.pdf"',
              "X-Stage": "B4-render-only",
              "X-Safety": "no-stripe-no-email-no-supabase-no-ai",
            },
          });
        } catch (e: any) {
          return Response.json(
            {
              ok: false,
              error: `APITemplate render failed: ${String(e?.message ?? e).slice(0, 500)}`,
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
