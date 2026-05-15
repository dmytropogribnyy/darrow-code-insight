import type { DarrowReport } from "@/lib/ai/schema";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const para = (s: string) =>
  s.split(/\n{2,}/).map((p) => `<p>${escape(p).replace(/\n/g, "<br/>")}</p>`).join("\n");

export function renderReportHtml(report: DarrowReport): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<title>${escape(report.meta.title)}</title>
<style>
  @page { size: A4; margin: 22mm 20mm; }
  body { font-family: 'Cormorant Garamond', 'Times New Roman', serif; color: #1f1f24; font-size: 12pt; line-height: 1.55; }
  h1, h2, h3 { font-family: 'Cormorant Garamond', 'Times New Roman', serif; color: #1a1a1f; font-weight: 500; }
  h1 { font-size: 28pt; margin: 0 0 8pt; letter-spacing: 0.5px; }
  h2 { font-size: 20pt; margin: 24pt 0 6pt; border-top: 0.5pt solid #c9a84c; padding-top: 14pt; }
  h3 { font-size: 13pt; margin: 14pt 0 4pt; color: #555; font-style: italic; font-weight: 400; }
  .brand { font-family: 'Helvetica', sans-serif; letter-spacing: 3px; font-size: 9pt; color: #c9a84c; text-transform: uppercase; }
  .subtitle { color: #555; font-style: italic; font-size: 13pt; margin: 0 0 4pt; }
  .voice { color: #777; font-size: 10pt; margin: 6pt 0 18pt; }
  .prepared { color: #888; font-size: 10pt; margin-bottom: 22pt; }
  p { margin: 0 0 9pt; text-align: justify; }
  .closing { margin-top: 26pt; border-top: 0.5pt solid #c9a84c; padding-top: 14pt; font-style: italic; }
  .footer { margin-top: 30pt; text-align: center; font-size: 9pt; color: #999; }
</style></head>
<body>
  <div class="brand">Darrow Code</div>
  <h1>${escape(report.meta.title)}</h1>
  <div class="subtitle">${escape(report.meta.subtitle)}</div>
  <div class="prepared">Prepared for ${escape(report.meta.prepared_for)}</div>
  <div class="voice">${escape(report.meta.voice_note)}</div>
  ${para(report.opening.body)}
  ${report.chapters.map((c) => `
    <h2>${escape(c.title)}</h2>
    ${c.sections.map((s) => `
      <h3>${escape(s.heading)}</h3>
      ${para(s.body)}
    `).join("")}
  `).join("")}
  <div class="closing">${para(report.closing.body)}</div>
  <div class="footer">More than a horoscope. Less than a consultation.</div>
</body></html>`;
}
