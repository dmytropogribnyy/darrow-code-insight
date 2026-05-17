// Resend email gateway client (via Lovable connector gateway).
import symbolDataUrl from "@/assets/darrow-symbol-small.png?inline";

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

const MODULE_LABELS: Record<string, string> = {
  CORE: "CORE",
  LOVE: "LOVE",
  MONEY: "MONEY",
  BODY: "BODY",
  YEAR: "YEAR",
  STYLE: "STYLE",
  PLACE: "PLACE",
};

export function reportReadyEmail(args: {
  first_name: string | null;
  download_url: string;
  result_url?: string;
  assets_base_url?: string;
  /** Whether the report includes CORE. Defaults to true (CORE-first MVP). */
  has_core?: boolean;
  /** Number of focused chapters (excluding CORE) in the report. */
  chapter_count?: number;
  /** Full module codes in this report (preferred over has_core/chapter_count for labeling). */
  modules?: string[];
}): { subject: string; html: string } {
  const name = args.first_name ?? "";
  const resultUrl = args.result_url ?? args.download_url;
  const hasCore = args.has_core ?? true;
  const chapters = args.chapter_count ?? 0;

  // Module codes (for subject + body label only — no chip image row)
  const order = ["CORE", "LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"];
  const moduleCodes = (args.modules && args.modules.length > 0)
    ? args.modules.filter((m) => MODULE_LABELS[m])
    : (hasCore ? ["CORE"] : []);
  const orderedModules = order.filter((m) => moduleCodes.includes(m));

  // Subject — explicit about what's inside
  let subject: string;
  if (hasCore && chapters === 0) subject = "Your Darrow Code CORE Report is ready";
  else if (hasCore && chapters === 6) subject = "Your Darrow Code Complete reading is ready";
  else if (hasCore) subject = `Your Darrow Code Report is ready (CORE + ${chapters} chapter${chapters === 1 ? "" : "s"})`;
  else if (chapters === 1) subject = `Your Darrow Code ${orderedModules[0] ?? "Focused"} Chapter is ready`;
  else subject = `Your Darrow Code Focused Chapters are ready (${orderedModules.join(" · ")})`;

  const insideLabel = hasCore && chapters === 0
    ? "CORE Report"
    : hasCore && chapters === 6
      ? "CORE Complete · all chapters"
      : hasCore
        ? `CORE + ${orderedModules.filter((m) => m !== "CORE").join(" · ")}`
        : orderedModules.join(" · ");

  const greeting = name ? `Your report is ready, ${name}.` : "Your report is ready.";

  return {
    subject,
    html: `<!doctype html><html><body style="font-family:Georgia,'Times New Roman',serif;color:#151922;background:#EFEAE0;margin:0;padding:0;-webkit-font-smoothing:antialiased">
      <!-- preheader (hidden) -->
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#EFEAE0">Your private Darrow Code reading — ${insideLabel}.</div>
      <div style="max-width:600px;margin:0 auto;background:#F6F4EF">

        <!-- HEADER — pure CSS, inline base64 symbol -->
        <div style="background:#0A0F1E;padding:28px 0;text-align:center">
          <img src="${symbolDataUrl}" alt="" width="40" height="40" style="display:inline-block;border:0;margin:0 auto 10px" />
          <div style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:5px;color:#D4AF37;text-transform:uppercase;font-weight:600">Darrow Code</div>
        </div>

        <!-- BODY -->
        <div style="padding:44px 36px 36px">

          <!-- Headline -->
          <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:28px;line-height:1.25;color:#0A0F1E;margin:0 0 18px">${greeting}</h1>

          <!-- Intro -->
          <p style="font-size:15px;line-height:1.65;color:#3A3528;margin:0 0 30px">Quietly written, individually produced. Open it when you have a few minutes to read carefully.</p>

          <!-- Primary CTA -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 36px">
            <tr><td style="background:#0A0F1E;border-radius:2px">
              <a href="${args.download_url}" style="display:inline-block;color:#D4AF37;text-decoration:none;padding:16px 32px;letter-spacing:3px;font-size:12px;text-transform:uppercase;font-family:'Inter',Helvetica,Arial,sans-serif;font-weight:600">Open your report</a>
            </td></tr>
          </table>

          <!-- LINKS SECTION -->
          <div style="border-top:1px solid #E0D9C9;padding-top:22px;margin:0 0 26px">
            <div style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:2.5px;color:#7A6F58;text-transform:uppercase;margin:0 0 12px">Your private links</div>
            <p style="font-size:14px;line-height:1.8;margin:0 0 4px">
              <a href="${args.download_url}" style="color:#D4AF37;text-decoration:none;font-family:'Inter',Helvetica,Arial,sans-serif">Download PDF &rarr;</a>
            </p>
            <p style="font-size:14px;line-height:1.8;margin:0 0 12px">
              <a href="${resultUrl}" style="color:#D4AF37;text-decoration:none;font-family:'Inter',Helvetica,Arial,sans-serif">View your result page &rarr;</a>
            </p>
            <p style="font-size:12px;line-height:1.6;color:#7A6F58;margin:0">No account required. These links are yours forever.</p>
          </div>

          <!-- Reply signature -->
          <p style="font-size:12px;line-height:1.6;color:#7A6F58;margin:0 0 28px">If anything looks off — just reply to this email.</p>

          <!-- FOOTER — text only, no images -->
          <div style="text-align:center;border-top:1px solid #E0D9C9;padding-top:24px">
            <div style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:5px;color:#9CA3AF;text-transform:uppercase;font-weight:600;margin:0 0 8px">Darrow Code</div>
            <p style="color:#9CA3AF;font-size:11px;margin:0;font-style:italic;font-family:Georgia,'Times New Roman',serif">More than a horoscope. Your private birth code.</p>
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
          <p style="font-size:14px;line-height:1.6;color:#151922;margin:0 0 14px"><strong>Your payment is safe.</strong> You have <strong>not</strong> been charged a second time and you will not be. The original charge already covers the report we are about to deliver.</p>
          <p style="font-size:13px;line-height:1.6;color:#6B6B6B;margin:0 0 14px">If you'd like to reach us directly, just reply to this email.</p>
          <p style="color:#9CA3AF;font-size:11px;margin-top:32px;font-style:italic;font-family:'Cormorant Garamond',Georgia,serif">More than a horoscope. Your private birth code.</p>
        </div>
      </div>
    </body></html>`,
  };
}
