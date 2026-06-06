import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/debug/apitemplate-account")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = request.headers.get("authorization");
        const expected = `Bearer ${process.env.PHASE6_DRYRUN_TOKEN ?? ""}`;
        if (!process.env.PHASE6_DRYRUN_TOKEN || token !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        const apiKey = process.env.APITEMPLATE_API_KEY;
        if (!apiKey) {
          return Response.json({ error: "APITEMPLATE_API_KEY not set" }, { status: 500 });
        }
        // /v2/account-information returns account email + plan + quota.
        const res = await fetch("https://rest.apitemplate.io/v2/account-information", {
          headers: { "X-API-KEY": apiKey },
        });
        const text = await res.text();
        let body: unknown;
        try { body = JSON.parse(text); } catch { body = text; }
        return Response.json({
          status: res.status,
          ok: res.ok,
          key_fingerprint: `${apiKey.slice(0, 6)}…${apiKey.slice(-4)} (len=${apiKey.length})`,
          body,
        });
      },
    },
  },
});
