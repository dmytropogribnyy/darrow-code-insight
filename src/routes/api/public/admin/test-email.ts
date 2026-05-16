import { createFileRoute } from "@tanstack/react-router";
import { sendEmail } from "@/lib/email/resend.server";

export const Route = createFileRoute("/api/public/admin/test-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // TEMP: unauthenticated test endpoint — DELETE after Step 1 verification.
        const body = (await request.json().catch(() => ({}))) as { to?: string };
        if (!body.to) return new Response("missing 'to'", { status: 400 });
        try {
          const res = await sendEmail({
            to: body.to,
            subject: "Darrow Code — deliverability test",
            html: `<!doctype html><html><body style="font-family:Georgia,serif;background:#F6F4EF;padding:32px">
              <h1 style="font-family:'Cormorant Garamond',Georgia,serif;color:#4A402D">Deliverability test</h1>
              <p>This is a one-off test from Darrow Code to verify the new sender domain (hello@darrowcode.com).</p>
              <p style="color:#9CA3AF;font-size:12px">Sent at ${new Date().toISOString()}</p>
            </body></html>`,
          });
          return Response.json({ ok: true, message_id: res?.id ?? null, from: process.env.EMAIL_FROM });
        } catch (e: any) {
          return Response.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
        }
      },
    },
  },
});
