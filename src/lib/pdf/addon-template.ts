// ADDON-RENDERER-1 — production-safe per-module (standalone) renderer.
//
// Renders ONE add-on module (LOVE/MONEY/BODY/YEAR/STYLE/PLACE) to a complete standalone HTML
// document → one PDF per module. Self-contained: does NOT touch renderReportHtmlSafe and does
// NOT reactivate the deprecated renderReportHtml. Consumes the addon_v1 module shape
// (MODULE-PROMPT-1 schema). No empty / CORE-only output — every section renders its own content.

import type { ModuleCode } from "@/lib/modules";
import { ADDON_SECTION_KEYS, ADDON_DISCLAIMER } from "@/lib/ai/addon-modules/addon-schema";

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

const MODULE_TITLE: Record<ModuleCode, string> = {
  LOVE: "LOVE — Relationship Pattern",
  MONEY: "MONEY — Value & Work Pattern",
  BODY: "BODY — Energy & Recovery Pattern",
  YEAR: "YEAR — Annual Timing",
  STYLE: "STYLE — Aesthetic Signature",
  PLACE: "PLACE — Environment Fit",
};

interface AddonSection {
  opening_line?: string;
  scenario?: string;
  prose?: string;
  key_insight?: string;
  protocols?: Array<{ title: string; body: string }>;
  warning_signals?: string[];
  proof_tags?: string[];
}
interface AddonModulePayload {
  schema_version?: string;
  module_code?: string;
  cover_tagline?: string;
  sections?: Record<string, AddonSection>;
}

const COVER = `width:210mm;height:297mm;padding:0 30mm;background:#0A0F1E;color:#F6F4EF;-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;text-align:center;display:flex;flex-direction:column;justify-content:center;align-items:center;overflow:hidden;page-break-after:always;break-after:page;`;
const BODY_PAGE = `width:210mm;min-height:297mm;padding:24mm 26mm;background:#FAF7F2;color:#151922;box-sizing:border-box;page-break-before:always;break-before:page;`;
const CLOSING = `width:210mm;height:297mm;padding:0 30mm;background:#0A0F1E;color:#F6F4EF;-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;text-align:center;display:flex;flex-direction:column;justify-content:center;align-items:center;overflow:hidden;page-break-before:always;break-before:page;page-break-after:auto;break-after:auto;`;
const GOLD_MARK = `<div style="width:34pt;height:34pt;margin:0 auto 26pt;transform:rotate(45deg);background:#D4AF37;-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div>`;
const BRAND = `font-family:Arial,Helvetica,sans-serif;color:#D4AF37;font-size:11pt;letter-spacing:6pt;text-transform:uppercase;`;
const H2 = `font-family:Georgia,'Times New Roman',serif;color:#4A402D;font-size:20pt;font-weight:400;margin:0 0 12pt;`;
const P = `font-family:Georgia,'Times New Roman',serif;color:#2B2A26;font-size:12pt;line-height:1.6;margin:0 0 12pt;overflow-wrap:break-word;word-wrap:break-word;`;
const EYEBROW = `font-family:Arial,Helvetica,sans-serif;color:#A8841F;font-size:9pt;letter-spacing:2pt;text-transform:uppercase;margin:0 0 4pt;`;
const PROOF = `font-family:Arial,Helvetica,sans-serif;color:#8A7A55;font-size:9pt;letter-spacing:1pt;border-top:0.5pt solid #D4AF37;padding-top:6pt;margin-top:10pt;`;

function renderSection(title: string, sec: AddonSection): string {
  const parts: string[] = [
    `<div style="${EYEBROW}">Darrow Code</div>`,
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
      `<div style="background:#FBF3E8;border-left:2pt solid #B4791F;padding:10pt 14pt;margin:10pt 0;page-break-inside:avoid;break-inside:avoid;"><div style="${EYEBROW}">Warning Signals</div><ul style="margin:4pt 0 0;padding-left:16pt;">${(sec.warning_signals ?? []).map((w) => `<li style="${P}margin:0 0 4pt;">${escape(w)}</li>`).join("")}</ul></div>`,
    );
  }
  if ((sec.proof_tags ?? []).length) {
    parts.push(`<div style="${PROOF}">${(sec.proof_tags ?? []).map(escape).join(" · ")}</div>`);
  }
  return `<section style="${BODY_PAGE}">${parts.join("\n")}</section>`;
}

// Warm dark closing/integration page (sample DNA: a calm integration note, not a sell).
function renderClosing(sec: AddonSection): string {
  const raw = String(sec.prose || sec.scenario || sec.opening_line || "");
  const insight = sec.key_insight ? escape(sec.key_insight) : "";
  const sentences = raw
    .split(/\n{2,}|(?<=\.)\s+(?=[A-Z])/)
    .map((p) => p.trim())
    .filter(Boolean);
  const grouped: string[] = [];
  for (let i = 0; i < sentences.length; i += 3) {
    grouped.push(sentences.slice(i, i + 3).join(" "));
  }
  const bodyHtml = (grouped.length ? grouped : [raw])
    .map(
      (p) =>
        `<p style="font-family:Georgia,'Times New Roman',serif;font-size:13pt;color:#F1ECE0;margin:0 0 14pt;line-height:1.75;text-align:left;">${escape(p)}</p>`,
    )
    .join("");
  return (
    `<section style="${CLOSING}"><div style="max-width:150mm;width:100%;margin:0 auto;text-align:left;">${GOLD_MARK}` +
    `<div style="${BRAND}margin-bottom:20pt;text-align:center;">Darrow Code</div>` +
    `<h2 style="font-family:Georgia,'Times New Roman',serif;color:#D4AF37;font-size:22pt;font-weight:400;margin:0 0 18pt;text-align:center;">Integration</h2>` +
    bodyHtml +
    (insight
      ? `<p style="font-family:Georgia,'Times New Roman',serif;color:#F6F4EF;font-size:13pt;font-weight:600;margin:18pt 0 0;line-height:1.6;text-align:left;border-top:0.5pt solid #3a4256;padding-top:14pt;">${insight}</p>`
      : "") +
    `</div></section>`
  );
}

export function renderAddonModuleHtmlSafe(
  module: ModuleCode,
  payload: AddonModulePayload,
  clientName = "you",
  // PLACE-GEO v1: variant renderers (e.g. geo PLACE) pass their own section keys/disclaimer/
  // title; default behaviour for all existing modules is unchanged.
  opts: { sectionKeys?: readonly string[]; disclaimer?: string; title?: string } = {},
): string {
  const title = opts.title ?? MODULE_TITLE[module];
  const sections = payload.sections ?? {};
  const keys = opts.sectionKeys ?? ADDON_SECTION_KEYS[module];
  const disclaimer = opts.disclaimer ?? ADDON_DISCLAIMER[module];

  const out: string[] = [];

  // Cover
  out.push(
    `<section style="${COVER}">${GOLD_MARK}<div style="${BRAND}margin-bottom:24pt;">Darrow Code</div>` +
      `<h1 style="font-family:Georgia,'Times New Roman',serif;color:#D4AF37;font-size:32pt;font-weight:400;line-height:1.2;margin:0 0 16pt;">${escape(title)}</h1>` +
      `<div style="width:60pt;height:1pt;background:#D4AF37;margin:18pt auto;"></div>` +
      `<div style="font-family:Arial,Helvetica,sans-serif;color:#9CA3AF;font-size:10pt;letter-spacing:3pt;text-transform:uppercase;margin-bottom:8pt;">Prepared for</div>` +
      `<div style="font-family:Georgia,'Times New Roman',serif;color:#F6F4EF;font-size:20pt;">${escape(clientName)}</div>` +
      (payload.cover_tagline
        ? `<p style="font-family:Georgia,'Times New Roman',serif;font-style:italic;color:#E5E7EB;font-size:13pt;margin:28pt auto 0;max-width:120mm;line-height:1.5;">${escape(payload.cover_tagline)}</p>`
        : "") +
      `</section>`,
  );

  // Sections (in contract order; only render keys that have content).
  // closing_integration renders as a warm dark closing page (sample DNA).
  let rendered = 0;
  for (const k of keys) {
    const sec = sections[k];
    if (!sec || !(sec.prose || sec.scenario || sec.opening_line)) continue;
    if (k === "closing_integration") {
      out.push(renderClosing(sec));
    } else {
      out.push(renderSection(humanize(k), sec));
    }
    rendered++;
  }
  if (rendered === 0) {
    // Fail loud rather than ship an empty/CORE-only PDF.
    throw new Error(`renderAddonModuleHtmlSafe(${module}): no module sections to render`);
  }

  // Disclaimer (BODY/MONEY/YEAR)
  if (disclaimer) {
    out.push(
      `<section style="${BODY_PAGE}"><div style="${EYEBROW}">Important</div><p style="${P}color:#6B6B6B;font-style:italic;">${escape(disclaimer)}</p></section>`,
    );
  }

  const css = `* { box-sizing: border-box; } html, body { margin:0; padding:0; background:#FAF7F2; -webkit-print-color-adjust:exact; print-color-adjust:exact; } body { font-family: Georgia, serif; } section { max-width:210mm; } p,h1,h2,div,li { overflow-wrap:break-word; word-wrap:break-word; }`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>Darrow Code — ${escape(title)} — ${escape(clientName)}</title><style>${css}</style></head><body>${out.join("\n")}</body></html>`;
}
