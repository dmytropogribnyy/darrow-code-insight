// Resend email gateway client (via Lovable connector gateway).

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export interface SendEmailArgs {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  reply_to?: string;
}

export async function sendEmail(args: SendEmailArgs): Promise<{ id?: string }> {
  const lovable = process.env.LOVABLE_API_KEY;
  if (!lovable) throw new Error("LOVABLE_API_KEY is not configured");
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) throw new Error("RESEND_API_KEY is not configured");
  const from = args.from ?? process.env.EMAIL_FROM ?? "Darrow Code <onboarding@resend.dev>";

  const res = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovable}`,
      "X-Connection-Api-Key": resendKey,
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(args.to) ? args.to : [args.to],
      subject: args.subject,
      html: args.html,
      reply_to: args.reply_to,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Resend ${res.status}: ${t.slice(0, 300)}`);
  }
  return (await res.json()) as { id?: string };
}

export function reportReadyEmail(args: {
  first_name: string | null;
  download_url: string;
}): { subject: string; html: string } {
  const name = args.first_name ?? "";
  return {
    subject: "Your Darrow Code report is ready",
    html: `<!doctype html><html><body style="font-family:Georgia,serif;color:#222;max-width:560px;margin:0 auto;padding:24px">
      <div style="font-size:11px;letter-spacing:3px;color:#c9a84c;text-transform:uppercase">Darrow Code</div>
      <h1 style="font-weight:500;font-size:22px;margin:8px 0 18px">Your report is ready${name ? `, ${name}` : ""}.</h1>
      <p>Quietly written, individually produced. Open it when you have a few minutes to read carefully.</p>
      <p style="margin:28px 0">
        <a href="${args.download_url}" style="display:inline-block;background:#1a1a1f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:2px;letter-spacing:1px;font-size:13px">Open your report</a>
      </p>
      <p style="color:#888;font-size:12px">This link is private to you. Save the PDF if you'd like a copy.</p>
      <p style="color:#aaa;font-size:11px;margin-top:32px;font-style:italic">More than a horoscope. Less than a consultation.</p>
    </body></html>`,
  };
}

export function reportDelayEmail(args: { first_name: string | null }): { subject: string; html: string } {
  const name = args.first_name ?? "";
  return {
    subject: "A small delay on your Darrow Code report",
    html: `<!doctype html><html><body style="font-family:Georgia,serif;color:#222;max-width:560px;margin:0 auto;padding:24px">
      <div style="font-size:11px;letter-spacing:3px;color:#c9a84c;text-transform:uppercase">Darrow Code</div>
      <h1 style="font-weight:500;font-size:20px">A short delay${name ? `, ${name}` : ""}.</h1>
      <p>Your report didn't render on the first pass. We've been notified and will send it as soon as it's ready — usually within a few hours. No action needed from you.</p>
      <p style="color:#aaa;font-size:11px;margin-top:32px;font-style:italic">More than a horoscope. Less than a consultation.</p>
    </body></html>`,
  };
}
