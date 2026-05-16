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
  result_url?: string;
  assets_base_url?: string;
  /** Whether the report includes CORE. Defaults to true (CORE-first MVP). */
  has_core?: boolean;
  /** Number of focused chapters (excluding CORE) in the report. */
  chapter_count?: number;
}): { subject: string; html: string } {
  const name = args.first_name ?? "";
  const base = (args.assets_base_url ?? "").replace(/\/$/, "");
  const header = `${base}/brand/email-header.png`;
  const symbol = `${base}/brand/darrow-symbol-small.png`;
  const resultUrl = args.result_url ?? args.download_url;
  const hasCore = args.has_core ?? true;
  const chapters = args.chapter_count ?? 0;

  // Subject variants (Phase A: CORE-inclusive only; chapter-only kept for forward compat)
  let subject: string;
  if (hasCore && chapters === 0) subject = "Your Darrow Code CORE Report is ready";
  else if (hasCore && chapters === 6) subject = "Your Darrow Code Complete reading is ready";
  else if (hasCore) subject = "Your Darrow Code Report is ready";
  else if (chapters === 1) subject = "Your Darrow Code Focused Chapter is ready";
  else subject = "Your Darrow Code Focused Chapters are ready";

  return {
    subject,
    html: `<!doctype html><html><body style="font-family:Georgia,serif;color:#151922;background:#F6F4EF;margin:0;padding:0">
      <div style="max-width:600px;margin:0 auto;background:#F6F4EF">
        <a href="${base}" style="display:block;background:#0A0F1E;text-decoration:none">
          <img src="${header}" alt="Darrow Code — Personal orientation for a better quality of life" width="600" style="display:block;width:100%;height:auto;border:0;outline:none" />
        </a>
        <div style="background:#0A0F1E;padding:14px 0;text-align:center;mso-hide:all">
          <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:11px;letter-spacing:6px;color:#D4AF37;text-transform:uppercase">Darrow Code</div>
        </div>
        <div style="padding:36px 32px">
          <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:26px;color:#4A402D;margin:0 0 18px">Your report is ready${name ? `, ${name}` : ""}.</h1>
          <p style="font-size:14px;line-height:1.6;color:#151922;margin:0 0 14px">Quietly written, individually produced. Open it when you have a few minutes to read carefully.</p>
          <p style="margin:28px 0 24px">
            <a href="${args.download_url}" style="display:inline-block;background:#0A0F1E;color:#D4AF37;text-decoration:none;padding:14px 26px;letter-spacing:2px;font-size:12px;text-transform:uppercase">Open your report</a>
          </p>
          <p style="font-size:13px;line-height:1.6;color:#151922;margin:0 0 10px">You can return any time using these private links:</p>
          <p style="font-size:13px;line-height:1.7;color:#151922;margin:0 0 6px"><strong>Download PDF:</strong> <a href="${args.download_url}" style="color:#4A402D;word-break:break-all">${args.download_url}</a></p>
          <p style="font-size:13px;line-height:1.7;color:#151922;margin:0 0 18px"><strong>Result page:</strong> <a href="${resultUrl}" style="color:#4A402D;word-break:break-all">${resultUrl}</a></p>
          <p style="color:#6B6B6B;font-size:12px;margin:0 0 32px">No account required. You can return to these links anytime.</p>
          <hr style="border:0;border-top:1px solid #E5E7EB;margin:0 0 20px" />
          <div style="text-align:center">
            <img src="${symbol}" alt="" width="28" height="28" style="display:inline-block;border:0;opacity:0.8" />
            <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:14px;letter-spacing:4px;color:#4A402D;text-transform:uppercase;margin-top:10px">Darrow Code</div>
            <p style="color:#9CA3AF;font-size:11px;margin:10px 0 0;font-style:italic;font-family:'Cormorant Garamond',Georgia,serif">More than a horoscope. Your private birth code.</p>
          </div>
        </div>
      </div>
    </body></html>`,
  };
}

export function reportDelayEmail(args: {
  first_name: string | null;
  assets_base_url?: string;
}): { subject: string; html: string } {
  const name = args.first_name ?? "";
  const base = (args.assets_base_url ?? "").replace(/\/$/, "");
  const header = `${base}/brand/email-header.png`;
  return {
    subject: "A small delay on your Darrow Code report",
    html: `<!doctype html><html><body style="font-family:Georgia,serif;color:#151922;background:#F6F4EF;margin:0;padding:0">
      <div style="max-width:600px;margin:0 auto;background:#F6F4EF">
        <img src="${header}" alt="Darrow Code" width="600" style="display:block;width:100%;height:auto;border:0" />
        <div style="padding:32px 28px">
          <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:22px;color:#4A402D;margin:0 0 14px">A short delay${name ? `, ${name}` : ""}.</h1>
          <p style="font-size:14px;line-height:1.6;color:#151922;margin:0 0 14px">Your report didn't render on the first pass. We've been notified and will send it as soon as it's ready — usually within a few hours. No action needed from you.</p>
          <p style="color:#9CA3AF;font-size:11px;margin-top:32px;font-style:italic;font-family:'Cormorant Garamond',Georgia,serif">More than a horoscope. Your private birth code.</p>
        </div>
      </div>
    </body></html>`,
  };
}
