// APITemplate.io HTML → PDF rendering.
// Uses the create-pdf-from-html endpoint so we own the HTML template.

const APITEMPLATE_URL = "https://rest.apitemplate.io/v2/create-pdf-from-html";

export async function renderHtmlToPdf(html: string): Promise<Uint8Array> {
  const apiKey = process.env.APITEMPLATE_API_KEY;
  if (!apiKey) throw new Error("APITEMPLATE_API_KEY is not configured");

  // Step 1: ask APITemplate to render. It returns a download_url to the generated PDF.
  const res = await fetch(APITEMPLATE_URL + "?export_type=json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify({ body: html, settings: { paper_size: "A4", orientation: "1" } }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`APITemplate ${res.status}: ${t.slice(0, 400)}`);
  }
  const data = (await res.json()) as any;
  const url = data?.download_url;
  if (!url) throw new Error(`APITemplate: missing download_url (${JSON.stringify(data).slice(0, 200)})`);

  // Step 2: fetch the rendered PDF bytes.
  const pdfRes = await fetch(url);
  if (!pdfRes.ok) throw new Error(`APITemplate PDF fetch failed: ${pdfRes.status}`);
  return new Uint8Array(await pdfRes.arrayBuffer());
}
