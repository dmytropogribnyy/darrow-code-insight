// Diagnostic: confirm which APITemplate account the APITEMPLATE_API_KEY belongs to.
// NON-MUTATING: only calls /v2/account-information (read-only).
//
// Auth: JOB_DISPATCH_SECRET (Bearer) — same guard as other debug routes.

import { createFileRoute } from "@tanstack/react-router";
import { checkWorkerAuth, unauthorizedResponse } from "@/lib/jobs/auth";
import { createHash } from "node:crypto";

export const Route = createFileRoute("/api/public/debug/apitemplate-account")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!process.env.JOB_DISPATCH_SECRET)
          return new Response("not configured", { status: 500 });
        const auth = checkWorkerAuth(request.headers);
        if (!auth.ok) return unauthorizedResponse(auth);

        const apiKey = process.env.APITEMPLATE_API_KEY;
        if (!apiKey) {
          return Response.json(
            { ok: false, error: "APITEMPLATE_API_KEY is not configured" },
            { status: 500 },
          );
        }

        const fingerprint = createHash("sha256").update(apiKey).digest("hex").slice(0, 12);
        const keyTail = apiKey.slice(-6);

        let res: Response;
        try {
          res = await fetch("https://rest.apitemplate.io/v2/account-information", {
            method: "GET",
            headers: { "X-API-KEY": apiKey },
          });
        } catch (e: any) {
          return Response.json(
            {
              ok: false,
              error: `Network error: ${String(e?.message ?? e)}`,
              key_fingerprint: fingerprint,
              key_tail: keyTail,
            },
            { status: 502 },
          );
        }

        const text = await res.text();
        let body: any = null;
        try {
          body = JSON.parse(text);
        } catch {
          body = { raw: text.slice(0, 500) };
        }

        return Response.json({
          ok: res.ok,
          status: res.status,
          key_fingerprint: fingerprint,
          key_tail: keyTail,
          email: body?.email ?? null,
          account_name: body?.account_name ?? null,
          subscription_name: body?.subscription_name ?? null,
          images_pdfs_generated_this_month: body?.images_pdfs_generated_this_month ?? null,
          images_pdfs_limit: body?.images_pdfs_limit ?? null,
          raw: body,
        });
      },
    },
  },
});
