// APITemplate.io HTML → PDF rendering.
// Uses the create-pdf-from-html endpoint so we own the HTML template.
// Retries transient failures (5xx, 429, 408, network/timeouts, and the
// generic 400 "Internal error unable to generate PDF") with exponential
// backoff: 0s → 2s → 5s, 3 attempts total.

const APITEMPLATE_URL = "https://rest.apitemplate.io/v2/create-pdf-from-html";
const APITEMPLATE_TIMEOUT_MS = 150 * 1000;
const BACKOFF_MS = [0, 2000, 5000];

export interface RenderDiagnostics {
  report_id?: string | null;
  order_id?: string | null;
  modules?: readonly string[] | null;
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), APITEMPLATE_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (e: any) {
    if (controller.signal.aborted) {
      throw new Error(`APITemplate timed out after ${Math.round(APITEMPLATE_TIMEOUT_MS / 1000)}s`);
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

function isTransientStatus(status: number, body: string): boolean {
  if (status >= 500 || status === 429 || status === 408) return true;
  // APITemplate frequently returns 400 with this generic message for transient
  // renderer-side hiccups (load, image fetch flakes, sandbox restarts).
  if (status === 400 && /unable to generate pdf/i.test(body)) return true;
  return false;
}

async function attemptRender(html: string, apiKey: string): Promise<{ pdf?: Uint8Array; transient: boolean; error?: string; status?: number; body?: string }> {
  let res: Response;
  try {
    res = await fetchWithTimeout(APITEMPLATE_URL + "?export_type=json", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
      body: JSON.stringify({
        body: html,
        settings: {
          paper_size: "A4",
          orientation: "1",
          margin_top: "22mm",
          margin_bottom: "22mm",
          margin_left: "20mm",
          margin_right: "20mm",
          displayHeaderFooter: "true",
          header: "<span></span>",
          footer:
            "<div style=\"font-family:'Cormorant Garamond',Georgia,serif;font-size:9pt;color:#D4AF37;width:100%;padding:0 20mm;letter-spacing:1.5pt;text-align:right;\"><span class=\"pageNumber\"></span></div>",
        },
      }),
    });
  } catch (e: any) {
    return { transient: true, error: e?.message ?? String(e) };
  }

  if (!res.ok) {
    const body = await res.text();
    return { transient: isTransientStatus(res.status, body), status: res.status, body, error: `APITemplate ${res.status}: ${body.slice(0, 400)}` };
  }

  const data = (await res.json()) as any;
  const url = data?.download_url;
  if (!url) return { transient: true, error: `APITemplate: missing download_url (${JSON.stringify(data).slice(0, 200)})` };

  try {
    const pdfRes = await fetchWithTimeout(url);
    if (!pdfRes.ok) return { transient: pdfRes.status >= 500, status: pdfRes.status, error: `APITemplate PDF fetch failed: ${pdfRes.status}` };
    return { pdf: new Uint8Array(await pdfRes.arrayBuffer()), transient: false };
  } catch (e: any) {
    return { transient: true, error: e?.message ?? String(e) };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function renderHtmlToPdf(html: string, diag: RenderDiagnostics = {}): Promise<Uint8Array> {
  const apiKey = process.env.APITEMPLATE_API_KEY;
  if (!apiKey) throw new Error("APITEMPLATE_API_KEY is not configured");

  const htmlBytes = html.length;
  let lastError = "unknown error";

  for (let attempt = 1; attempt <= BACKOFF_MS.length; attempt++) {
    const wait = BACKOFF_MS[attempt - 1];
    if (wait > 0) await sleep(wait);

    const result = await attemptRender(html, apiKey);
    if (result.pdf) {
      if (attempt > 1) {
        console.log("[apitemplate] render succeeded after retry", {
          attempt, order_id: diag.order_id, report_id: diag.report_id, modules: diag.modules, html_bytes: htmlBytes,
        });
      }
      return result.pdf;
    }

    lastError = result.error ?? "unknown error";
    console.error("[apitemplate] render attempt failed", {
      attempt,
      max_attempts: BACKOFF_MS.length,
      status: result.status,
      response_body: result.body?.slice(0, 400),
      error: lastError,
      transient: result.transient,
      html_bytes: htmlBytes,
      order_id: diag.order_id,
      report_id: diag.report_id,
      modules: diag.modules,
    });

    if (!result.transient) break; // permanent failure — don't waste attempts
  }

  throw new Error(lastError);
}
