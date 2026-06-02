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

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function reportReadyEmail(args: {
  first_name: string | null;
  download_url: string;
  result_url?: string;
  assets_base_url?: string;
  has_core?: boolean;
  chapter_count?: number;
  modules?: string[];
}): { subject: string; html: string } {
  const name = args.first_name ?? "";
  const resultUrl = args.result_url ?? args.download_url;

  const subject = "Your premium Darrow Code report is ready";
  const greeting = name ? `Hi ${escape(name)},` : "Hi,";

  return {
    subject,
    html: `<!doctype html><html><body style="font-family:Georgia,'Times New Roman',serif;color:#151922;background:#EFEAE0;margin:0;padding:0;-webkit-font-smoothing:antialiased">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#EFEAE0">Your premium Darrow Code report is ready.</div>
      <div style="max-width:600px;margin:0 auto;background:#F6F4EF">

        <div style="background:#0A0F1E;padding:28px 0;text-align:center">
          <img src="${symbolDataUrl}" alt="" width="40" height="40" style="display:inline-block;border:0;margin:0 auto 10px" />
          <div style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:5px;color:#D4AF37;text-transform:uppercase;font-weight:600">Darrow Code</div>
        </div>

        <div style="padding:44px 36px 36px">
          <p style="font-size:15px;line-height:1.65;color:#3A3528;margin:0 0 18px">${greeting}</p>
          <p style="font-size:15px;line-height:1.65;color:#3A3528;margin:0 0 24px">Your premium Darrow Code report is ready.</p>

          <p style="font-size:14px;line-height:1.65;color:#3A3528;margin:0 0 8px">Download your PDF:</p>
          <p style="font-size:14px;line-height:1.65;margin:0 0 28px">
            <a href="${args.download_url}" style="color:#D4AF37;text-decoration:none;font-family:'Inter',Helvetica,Arial,sans-serif;word-break:break-all">${args.download_url}</a>
          </p>

          <p style="font-size:14px;line-height:1.65;color:#3A3528;margin:0 0 28px">You can return to this link anytime. No account required.</p>

          <p style="font-size:14px;line-height:1.65;color:#3A3528;margin:0 0 8px">Want to go deeper?<br/>You can add more chapters here:</p>
          <p style="font-size:14px;line-height:1.65;margin:0 0 32px">
            <a href="${resultUrl}" style="color:#D4AF37;text-decoration:none;font-family:'Inter',Helvetica,Arial,sans-serif;word-break:break-all">${resultUrl}</a>
          </p>

          <div style="border-top:1px solid #E0D9C9;padding-top:22px">
            <p style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:4px;color:#9CA3AF;text-transform:uppercase;font-weight:600;margin:0 0 8px">Darrow Code</p>
            <p style="color:#7A6F58;font-size:12px;margin:0 0 4px;font-style:italic;font-family:Georgia,serif">For self-reflection and personal insight.</p>
            <p style="color:#9CA3AF;font-size:11px;margin:0;font-family:Georgia,serif">Not medical, legal or financial advice.</p>
          </div>
        </div>
      </div>
    </body></html>`,
  };
}

export function reportDelayEmail(args: { first_name: string | null; assets_base_url?: string }): {
  subject: string;
  html: string;
} {
  const name = args.first_name ?? "";
  const greeting = name ? `Hi ${escape(name)},` : "Hi,";
  return {
    subject: "Your premium Darrow Code report is being prepared",
    html: `<!doctype html><html><body style="font-family:Georgia,serif;color:#151922;background:#F6F4EF;margin:0;padding:0">
      <div style="max-width:600px;margin:0 auto;background:#F6F4EF">
        <div style="background:#0A0F1E;padding:28px 0;text-align:center">
          <img src="${symbolDataUrl}" alt="" width="40" height="40" style="display:inline-block;border:0;margin:0 auto 10px" />
          <div style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:5px;color:#D4AF37;text-transform:uppercase;font-weight:600">Darrow Code</div>
        </div>
        <div style="padding:36px 32px">
          <p style="font-size:15px;line-height:1.65;color:#3A3528;margin:0 0 18px">${greeting}</p>
          <p style="font-size:15px;line-height:1.65;color:#3A3528;margin:0 0 18px">Your payment was successful. Your premium Darrow Code report is being prepared, and we'll send it to you as soon as it's ready.</p>
          <p style="font-size:14px;line-height:1.65;color:#3A3528;margin:0 0 28px">You do not need to pay again.</p>
          <div style="border-top:1px solid #E0D9C9;padding-top:18px">
            <p style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:4px;color:#9CA3AF;text-transform:uppercase;font-weight:600;margin:0">Darrow Code</p>
          </div>
        </div>
      </div>
    </body></html>`,
  };
}
