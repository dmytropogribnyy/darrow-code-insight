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
  const base = (args.assets_base_url ?? "").replace(/\/$/, "");
  const symbol = `${base}/brand/darrow-symbol-small.png`;
  const resultUrl = args.result_url ?? args.download_url;
  const hasCore = args.has_core ?? true;
  const chapters = args.chapter_count ?? 0;

  // Module codes for the chip row (CORE first, then add-ons in canonical order)
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

  // In-body "what's inside" label
  const insideLabel = hasCore && chapters === 0
    ? "CORE Report"
    : hasCore && chapters === 6
      ? "CORE Complete · all chapters"
      : hasCore
        ? `CORE + ${orderedModules.filter((m) => m !== "CORE").join(" · ")}`
        : orderedModules.join(" · ");

  const chipRow = orderedModules.map((m) => `
    <span style="display:inline-block;border:1px solid #D4AF37;color:#D4AF37;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;padding:5px 10px;margin:0 4px 6px 0;border-radius:2px">${m}</span>
  `).join("");

  return {
    subject,
    html: `<!doctype html><html><body style="font-family:Georgia,'Times New Roman',serif;color:#151922;background:#EFEAE0;margin:0;padding:0;-webkit-font-smoothing:antialiased">
      <!-- preheader (hidden) -->
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#EFEAE0">Your private Darrow Code reading — ${insideLabel}.</div>
      <div style="max-width:600px;margin:0 auto;background:#F6F4EF">

        <!-- Gold wordmark bar (always visible, no image dependency) -->
        <div style="background:#0A0F1E;padding:22px 0;text-align:center">
          <a href="${base}" style="text-decoration:none">
            <img src="${symbol}" alt="" width="22" height="22" style="display:inline-block;border:0;vertical-align:middle;margin-right:10px;opacity:0.95" />
            <span style="font-family:Georgia,'Times New Roman',serif;font-size:12px;letter-spacing:6px;color:#D4AF37;text-transform:uppercase;vertical-align:middle">Darrow Code</span>
          </a>
        </div>

        <!-- Body -->
        <div style="padding:44px 36px 36px">

          <!-- Eyebrow -->
          <div style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#D4AF37;text-transform:uppercase;font-weight:600;margin:0 0 14px">Your report is ready</div>

          <!-- Headline -->
          <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:28px;line-height:1.25;color:#0A0F1E;margin:0 0 14px">${name ? `${name},&nbsp;your` : "Your"} Darrow Code reading is prepared.</h1>

          <!-- Gold divider -->
          <div style="width:48px;height:1px;background:#D4AF37;margin:0 0 22px"></div>

          <!-- Intro -->
          <p style="font-size:15px;line-height:1.65;color:#3A3528;margin:0 0 24px">Quietly written, individually produced. Open it when you have a few minutes to read carefully.</p>

          <!-- What's inside -->
          <div style="margin:0 0 28px">
            <div style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:2.5px;color:#7A6F58;text-transform:uppercase;margin:0 0 10px">Included in this report</div>
            <div>${chipRow}</div>
          </div>

          <!-- Primary CTA -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 14px">
            <tr><td style="background:#0A0F1E;border-radius:2px">
              <a href="${args.download_url}" style="display:inline-block;color:#D4AF37;text-decoration:none;padding:16px 32px;letter-spacing:3px;font-size:12px;text-transform:uppercase;font-family:'Inter',Helvetica,Arial,sans-serif;font-weight:600">Open your report &rarr;</a>
            </td></tr>
          </table>
          <p style="font-size:12px;color:#7A6F58;margin:0 0 36px">Opens your private PDF · no account required</p>

          <!-- Save for later (muted, secondary) -->
          <div style="border-top:1px solid #E0D9C9;padding-top:22px;margin:0 0 26px">
            <div style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:2.5px;color:#7A6F58;text-transform:uppercase;margin:0 0 10px">Save these private links</div>
            <p style="font-size:12px;line-height:1.6;color:#7A6F58;margin:0 0 8px">Bookmark them — they grant permanent access to this report.</p>
            <p style="font-size:11px;line-height:1.6;margin:6px 0 4px;color:#7A6F58"><strong style="color:#4A402D">PDF:</strong> <a href="${args.download_url}" style="color:#4A402D;word-break:break-all;text-decoration:underline">${args.download_url}</a></p>
            <p style="font-size:11px;line-height:1.6;margin:0;color:#7A6F58"><strong style="color:#4A402D">Web:</strong> <a href="${resultUrl}" style="color:#4A402D;word-break:break-all;text-decoration:underline">${resultUrl}</a></p>
          </div>

          <!-- Reply signature -->
          <p style="font-size:12px;line-height:1.6;color:#7A6F58;margin:0 0 28px">If anything looks off — just reply to this email.</p>

          <!-- Footer mark -->
          <div style="text-align:center;border-top:1px solid #E0D9C9;padding-top:24px">
            <img src="${symbol}" alt="" width="26" height="26" style="display:inline-block;border:0;opacity:0.85" />
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:12px;letter-spacing:5px;color:#4A402D;text-transform:uppercase;margin:8px 0 6px">Darrow Code</div>
            <p style="color:#9A8F76;font-size:11px;margin:6px 0 0;font-style:italic">More than a horoscope. Your private birth code.</p>
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
