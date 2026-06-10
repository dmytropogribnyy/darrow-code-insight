// CONTINUUM renderer (standalone HTML -> PDF). Self-contained; does NOT touch report renderers.
// Cover carries the period labels (Generated / Covers). STAGED.

import { CONTINUUM_SECTION_KEYS, type ContinuumPayload } from "./continuum-schema";
import { CONTINUUM_PRODUCTS, type ContinuumType, type ContinuumPeriod } from "./continuum-config";

function escape(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function humanize(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const COVER = `width:210mm;height:297mm;padding:0 30mm;background:#0A0F1E;color:#F6F4EF;-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;text-align:center;display:flex;flex-direction:column;justify-content:center;align-items:center;overflow:hidden;page-break-after:always;break-after:page;`;
const CLOSING = COVER.replace(
  "page-break-after:always;break-after:page;",
  "page-break-before:always;break-before:page;page-break-after:auto;break-after:auto;",
);
const BODY_PAGE = `width:210mm;min-height:297mm;padding:24mm 26mm 32mm;background:#FAF7F2;color:#151922;box-sizing:border-box;page-break-before:always;break-before:page;`;
const GOLD_MARK = `<div style="width:34pt;height:34pt;margin:0 auto 24pt;transform:rotate(45deg);background:#D4AF37;-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div>`;
const BRAND = `font-family:Arial,Helvetica,sans-serif;color:#D4AF37;font-size:11pt;letter-spacing:6pt;text-transform:uppercase;`;
const H2 = `font-family:Georgia,'Times New Roman',serif;color:#4A402D;font-size:20pt;font-weight:400;margin:0 0 12pt;`;
const P = `font-family:Georgia,'Times New Roman',serif;color:#2B2A26;font-size:12pt;line-height:1.6;margin:0 0 12pt;overflow-wrap:break-word;word-wrap:break-word;`;
const EYEBROW = `font-family:Arial,Helvetica,sans-serif;color:#A8841F;font-size:9pt;letter-spacing:2pt;text-transform:uppercase;margin:0 0 4pt;`;
const PROOF = `font-family:Arial,Helvetica,sans-serif;color:#8A7A55;font-size:9pt;letter-spacing:1pt;border-top:0.5pt solid #D4AF37;padding-top:6pt;margin-top:10pt;`;

function renderSection(title: string, sec: any): string {
  const parts = [
    `<div style="${EYEBROW}">Darrow Code · Continuum</div>`,
    `<h2 style="${H2}">${escape(title)}</h2>`,
  ];
  if (sec.opening_line)
    parts.push(`<p style="${P}font-style:italic;color:#4A402D;">${escape(sec.opening_line)}</p>`);
  if (sec.scenario) parts.push(`<p style="${P}">${escape(sec.scenario)}</p>`);
  if (sec.prose) parts.push(`<p style="${P}">${escape(sec.prose)}</p>`);
  if (sec.key_insight)
    parts.push(`<p style="${P}font-weight:600;color:#1F1A10;">${escape(sec.key_insight)}</p>`);
  for (const pr of sec.protocols ?? []) {
    parts.push(
      `<div style="background:#fff;border-left:2pt solid #D4AF37;padding:10pt 14pt;margin:10pt 0;page-break-inside:avoid;break-inside:avoid;"><div style="${EYEBROW}">Protocol — ${escape(pr.title)}</div><p style="${P}margin:0;">${escape(pr.body)}</p></div>`,
    );
  }
  if ((sec.warning_signals ?? []).length) {
    parts.push(
      `<div style="background:#FBF3E8;border-left:2pt solid #B4791F;padding:10pt 14pt;margin:10pt 0;page-break-inside:avoid;break-inside:avoid;"><div style="${EYEBROW}">Watch</div><ul style="margin:4pt 0 0;padding-left:16pt;">${(sec.warning_signals ?? []).map((w: string) => `<li style="${P}margin:0 0 4pt;">${escape(w)}</li>`).join("")}</ul></div>`,
    );
  }
  if ((sec.proof_tags ?? []).length)
    parts.push(`<div style="${PROOF}">${(sec.proof_tags ?? []).map(escape).join(" · ")}</div>`);
  return `<section style="${BODY_PAGE}">${parts.join("\n")}</section>`;
}

export function renderContinuumHtmlSafe(
  type: ContinuumType,
  payload: ContinuumPayload,
  period: ContinuumPeriod,
  clientName = "you",
): string {
  const product = CONTINUUM_PRODUCTS[type];
  const sections = (payload as any).sections ?? {};
  const keys = CONTINUUM_SECTION_KEYS[type];
  const out: string[] = [];

  out.push(
    `<section style="${COVER}">${GOLD_MARK}<div style="${BRAND}margin-bottom:22pt;">Darrow Code · Continuum</div>` +
      `<h1 style="font-family:Georgia,'Times New Roman',serif;color:#D4AF37;font-size:30pt;font-weight:400;margin:0 0 14pt;">${escape(product.label)}</h1>` +
      `<div style="font-family:Arial,Helvetica,sans-serif;color:#9CA3AF;font-size:10pt;letter-spacing:2pt;text-transform:uppercase;margin-bottom:6pt;">${escape(period.generated_label)}</div>` +
      `<div style="font-family:Arial,Helvetica,sans-serif;color:#E5E7EB;font-size:11pt;letter-spacing:1pt;margin-bottom:18pt;">${escape(period.covers_label)}</div>` +
      `<div style="width:60pt;height:1pt;background:#D4AF37;margin:14pt auto;"></div>` +
      `<div style="font-family:Arial,Helvetica,sans-serif;color:#9CA3AF;font-size:10pt;letter-spacing:3pt;text-transform:uppercase;margin-bottom:8pt;">Prepared for</div>` +
      `<div style="font-family:Georgia,'Times New Roman',serif;color:#F6F4EF;font-size:20pt;">${escape(clientName)}</div>` +
      ((payload as any).cover_tagline
        ? `<p style="font-family:Georgia,'Times New Roman',serif;font-style:italic;color:#E5E7EB;font-size:13pt;margin:24pt auto 0;max-width:120mm;line-height:1.5;">${escape((payload as any).cover_tagline)}</p>`
        : "") +
      `</section>`,
  );

  let rendered = 0;
  for (const k of keys) {
    const sec = sections[k];
    if (!sec || !(sec.prose || sec.scenario || sec.opening_line)) continue;
    if (k === "closing_signal") {
      const raw = String(sec.prose || sec.opening_line || "");
      const paragraphs = raw
        .split(/\n{2,}|(?<=\.)\s+(?=[A-Z])/)
        .map((p) => p.trim())
        .filter(Boolean);
      // Group sentences into ~2-3 sentence paragraphs for easier reading.
      const grouped: string[] = [];
      for (let i = 0; i < paragraphs.length; i += 3) {
        grouped.push(paragraphs.slice(i, i + 3).join(" "));
      }
      const bodyHtml = (grouped.length ? grouped : [raw])
        .map(
          (p) =>
            `<p style="font-family:Georgia,'Times New Roman',serif;font-size:13pt;color:#F1ECE0;margin:0 0 14pt;line-height:1.75;text-align:left;">${escape(p)}</p>`,
        )
        .join("");
      out.push(
        `<section style="${CLOSING}"><div style="max-width:150mm;width:100%;margin:0 auto;text-align:left;">${GOLD_MARK}<div style="${BRAND}margin-bottom:22pt;text-align:center;">Darrow Code · Continuum</div>${bodyHtml}</div></section>`,
      );
    } else {
      out.push(renderSection(humanize(k), sec));
    }
    rendered++;
  }
  if (rendered === 0) throw new Error(`renderContinuumHtmlSafe(${type}): no sections to render`);

  const css = `* { box-sizing: border-box; } html, body { margin:0; padding:0; background:#FAF7F2; -webkit-print-color-adjust:exact; print-color-adjust:exact; } body { font-family: Georgia, serif; } section { max-width:210mm; } p,h1,h2,div,li { overflow-wrap:break-word; word-wrap:break-word; }`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>Darrow Code — ${escape(product.label)} — ${escape(clientName)}</title><style>${css}</style></head><body>${out.join("\n")}</body></html>`;
}
