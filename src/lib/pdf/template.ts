import type { DarrowReport, DarrowModule } from "@/lib/ai/schema";
import {
  getCoreSectionProse,
  getCoreSectionProtocols,
  getCoreSectionWarnings,
} from "@/lib/ai/schema";
// Inline the brand symbol as a base64 data URL so PDF renderers (APITemplate.io)
// never have to fetch it from an external host. The PNG asset itself is kept
// small (256x256, ~6KB) to keep total HTML well under APITemplate's payload
// tolerance; oversized base64 data URLs in the body+CSS reliably trigger the
// generic 400 "Internal error unable to generate PDF" from their renderer.
// Previously we relied on
// `${APP_BASE_URL}/brand/darrow-symbol-*.png`, which broke whenever the
// configured base URL did not actually serve `/public` assets (e.g. preview
// builds, unpublished domains), producing broken-image placeholders on the
// cover and closing pages.
import symbolDataUrl from "@/assets/darrow-symbol-small.png?inline";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const para = (s: string) =>
  s.split(/\n{2,}/).map((p) => `<p>${escape(p).replace(/\n/g, "<br/>")}</p>`).join("\n");

// Defensive normalization of common AI typos of the PROTOCOL label.
// Catches: PROTECOL, PROTOCAL, PROTOKOL, PROTCOL, PROTOCO (followed by a
// colon or punctuation), case-insensitive. Does NOT touch surrounding copy.
const PROTOCOL_TYPO_RE = /\b(PROTECOL|PROTOCAL|PROTOKOL|PROTCOL|PROTOCO)(?=\s*[:\d\s])/gi;
function normalizeProtocolLabels(input: string): string {
  if (!input) return input;
  let fired = false;
  const out = input.replace(PROTOCOL_TYPO_RE, (m) => {
    fired = true;
    return m === m.toLowerCase() ? "protocol" : "PROTOCOL";
  });
  if (fired) {
    console.warn("[pdf-template] normalized PROTOCOL typo variant", {
      sample: input.match(PROTOCOL_TYPO_RE)?.slice(0, 3),
    });
  }
  return out;
}

function normalizeReport<T>(report: T): T {
  // Walk strings, normalize PROTOCOL typos. Returns a deep-cloned report.
  const walk = (v: any): any => {
    if (typeof v === "string") return normalizeProtocolLabels(v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const o: any = {};
      for (const k of Object.keys(v)) o[k] = walk(v[k]);
      return o;
    }
    return v;
  };
  return walk(report);
}

// Render protocols block — split on "PROTOCOL:" markers if present.
function renderProtocols(text: string): string {
  const parts = text.split(/(?=PROTOCOL:)/g).map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 1) return para(text);
  return parts
    .map((p) => {
      const cleaned = p.replace(/^PROTOCOL:\s*/, "");
      return `<div class="protocol"><div class="protocol-label">PROTOCOL</div>${para(cleaned)}</div>`;
    })
    .join("\n");
}

const MODULE_NAMES: Record<string, string> = {
  CORE: "Core Architecture",
  LOVE: "Love Pattern",
  MONEY: "Money Mechanism",
  BODY: "Body & Recovery",
  YEAR: "The Year Ahead",
  STYLE: "Personal Style",
  PLACE: "Place & Geography",
};

const ADDONS: Array<{ code: string; tagline: string }> = [
  { code: "LOVE", tagline: "Relationship pattern & attraction logic" },
  { code: "MONEY", tagline: "Wealth pattern & income mechanism" },
  { code: "BODY", tagline: "Stress signature & recovery rhythm" },
  { code: "YEAR", tagline: "12-month forecast & active transits" },
  { code: "STYLE", tagline: "Personal aesthetic & visual signature" },
  { code: "PLACE", tagline: "Geographic & environmental energy" },
];

function renderCoreChapter(core: DarrowModule, snapshot: DarrowReport["client_snapshot"], closing: DarrowReport["closing"]): string {
  return `
    <section class="page page-snapshot">
      <div class="brand">Darrow Code</div>
      <h2 class="snapshot-title">Client Snapshot</h2>
      <div class="pattern-name">${escape(snapshot.pattern_name)}</div>
      <p class="core-pattern">${escape(snapshot.core_pattern)}</p>

      <div class="signature-block">
        <div class="block-label">Unique Signature</div>
        <p>${escape(snapshot.unique_signature)}</p>
      </div>

      <div class="snapshot-grid">
        <div><div class="cell-label">Primary Strength</div><p>${escape(snapshot.primary_strength)}</p></div>
        <div><div class="cell-label">Pressure Point</div><p>${escape(snapshot.pressure_point)}</p></div>
        <div><div class="cell-label">Best Operating Rhythm</div><p>${escape(snapshot.best_operating_rhythm)}</p></div>
        <div><div class="cell-label">Current Timing Theme</div><p>${escape(snapshot.current_timing_theme)}</p></div>
      </div>

      <div class="practical-card">
        <div class="block-label">Practical Focus</div>
        <p>${escape(snapshot.practical_focus)}</p>
      </div>
    </section>

    <section class="page">
      <h2>Opening</h2>
      ${para(core.opening)}
      <h2 class="sub">Architecture</h2>
      ${para(core.architecture)}
    </section>

    <section class="page">
      <h2>Mechanic</h2>
      ${para(core.mechanic)}
    </section>

    <section class="page">
      <h2>Timing</h2>
      ${para(core.timing)}
    </section>

    <section class="page">
      <h2>Protocols</h2>
      ${renderProtocols(core.protocols)}
    </section>

    <section class="page">
      <h2>Warning Signal</h2>
      <div class="shadow-box">
        ${para(core.shadow)}
      </div>
    </section>

    <section class="page">
      <h2>Before / After</h2>
      ${para(core.before_after)}
    </section>

    <section class="page">
      <h2>Next Step</h2>
      ${para(core.next)}
      <h2 class="sub">Executive Summary</h2>
      ${para(closing.executive_summary)}
      ${core.proof_tags?.length ? `
        <div class="proof-tags">
          <div class="block-label">Anchored in</div>
          <ul>${core.proof_tags.map((t) => `<li>${escape(t)}</li>`).join("")}</ul>
        </div>` : ""}
    </section>
  `;
}

function renderAddon(code: string, mod: DarrowModule, clientName: string): string {
  const title = MODULE_NAMES[code] ?? code;
  const snap = mod.module_snapshot;
  const styleSwatches = code === "STYLE" && mod.color_palette?.length
    ? `<div class="palette">${mod.color_palette.map((hex, i) => {
        const name = mod.color_names?.[i] ?? "";
        return `<div class="swatch"><span style="background:${escape(hex)}"></span><div>${escape(hex)}${name ? ` · ${escape(name)}` : ""}</div></div>`;
      }).join("")}</div>`
    : "";

  return `
    <section class="page page-cover module-cover">
      <div class="brand">Darrow Code · Module</div>
      <h1 class="module-title">${escape(title)}</h1>
      <div class="prepared">Prepared for ${escape(clientName)}</div>
    </section>

    <section class="page">
      <h2>Opening</h2>
      ${para(mod.opening)}
      <h2 class="sub">Architecture</h2>
      ${para(mod.architecture)}
    </section>

    <section class="page">
      <h2>Mechanic</h2>
      ${para(mod.mechanic)}
      <h2 class="sub">Timing</h2>
      ${para(mod.timing)}
    </section>

    <section class="page">
      <h2>Protocols</h2>
      ${renderProtocols(mod.protocols)}
    </section>

    <section class="page">
      <h2>Warning Signal</h2>
      <div class="shadow-box">${para(mod.shadow)}</div>
      <h2 class="sub">Before / After</h2>
      ${para(mod.before_after)}
    </section>

    <section class="page">
      <h2>Next Step</h2>
      ${para(mod.next)}
      ${styleSwatches}
      ${snap ? `
        <div class="module-snapshot">
          <div class="block-label">Module Snapshot</div>
          <div class="snapshot-row"><span>Main Pattern</span><p>${escape(snap.main_pattern)}</p></div>
          <div class="snapshot-row"><span>Main Strength</span><p>${escape(snap.main_strength)}</p></div>
          <div class="snapshot-row"><span>Main Risk</span><p>${escape(snap.main_risk)}</p></div>
          <div class="snapshot-row"><span>Practical Protocol</span><p>${escape(snap.practical_protocol)}</p></div>
          <div class="snapshot-row"><span>Next Step</span><p>${escape(snap.next_step)}</p></div>
        </div>` : ""}
    </section>
  `;
}

function renderCrossSell(generated: string[], symbolSmall: string): string {
  const remaining = ADDONS.filter((a) => !generated.includes(a.code));
  const closing = `
    <section class="page page-closing">
      <img class="closing-symbol" src="${symbolSmall}" alt="" />
      <div class="brand">Darrow Code</div>
      <p class="watermark-note">More than a horoscope. Your private birth code.</p>
    </section>
  `;
  if (!remaining.length) return closing;
  return `
    <section class="page page-crosssell">
      <div class="brand">Darrow Code · Ecosystem</div>
      <h2>The Other Modules</h2>
      <p class="crosssell-intro">CORE shows your foundational architecture. Each module below opens a specific operational layer.</p>
      <div class="addon-list">
        ${remaining.map((a) => `
          <div class="addon-item">
            <div class="addon-code">${escape(a.code)}</div>
            <div class="addon-name">${escape(MODULE_NAMES[a.code] ?? a.code)}</div>
            <div class="addon-tag">${escape(a.tagline)}</div>
          </div>
        `).join("")}
      </div>
    </section>
    ${closing}
  `;
}

// ─────────────────────────────────────────────────────────────
// v3.1 CORE-aware renderer (APITemplate-safe).
//
// Layout strategy (post 2026-05-20 render-fix patch):
//   • APITemplate margins are 0 — we own the printable area in HTML.
//   • Cover and closing pages are full A4 (210mm × 297mm), no surrounding
//     cream strip, no leftover bottom band.
//   • Body sections are full-width A4 sections with safe internal padding
//     (22mm top/bottom, 20mm sides, 26mm bottom to clear the stamped page
//     number). Padding lives inside the section box, so there is no
//     "fixed width + margin" combo that could push content past the
//     printable area. Global box-sizing + overflow-wrap prevent any
//     horizontal clipping even from long unbroken tokens.
//   • Page numbers are stamped via pdf-lib AFTER APITemplate returns — see
//     stamp-page-numbers.server.ts. We no longer rely on CSS @page counters
//     or APITemplate's displayHeaderFooter (both failed in prod before).
//   • Premium pacing: every major v3 section starts on a new page
//     (page-break-before:always). With 17 prose sections + cover + method +
//     snapshot + closing this gives ~20 pages without any blank pages.
// ─────────────────────────────────────────────────────────────

const PROTOCOL_BOX =
  // page-break-before:avoid keeps the callout with the preceding prose
  // so we don't get orphan callout-only pages.
  "border-left:3pt solid #D4AF37;padding:9pt 14pt;margin:10pt 0;background:#FBF6E5;-webkit-print-color-adjust:exact;print-color-adjust:exact;page-break-inside:avoid;break-inside:avoid;page-break-before:avoid;break-before:avoid;overflow-wrap:break-word;word-wrap:break-word;";
const PROTOCOL_LABEL =
  "font-family:Georgia,'Times New Roman',serif;font-size:9pt;letter-spacing:2pt;color:#A8841F;text-transform:uppercase;margin-bottom:6pt;";
const WARNING_BOX =
  "border-left:3pt solid #9CA3AF;padding:9pt 14pt;margin:10pt 0;background:#F2F2F0;-webkit-print-color-adjust:exact;print-color-adjust:exact;page-break-inside:avoid;break-inside:avoid;page-break-before:avoid;break-before:avoid;overflow-wrap:break-word;word-wrap:break-word;";
const WARNING_LABEL =
  "font-family:Georgia,'Times New Roman',serif;font-size:9pt;letter-spacing:2pt;color:#6B6B6B;text-transform:uppercase;margin-bottom:6pt;";
const PROOF_STYLE =
  "font-family:Arial,Helvetica,sans-serif;color:#9CA3AF;font-size:9pt;font-style:italic;margin-top:10pt;padding-top:6pt;border-top:0.5pt solid #E5E7EB;page-break-before:avoid;break-before:avoid;page-break-inside:avoid;break-inside:avoid;overflow-wrap:break-word;word-wrap:break-word;";

// A4 = 210mm × 297mm. Internal padding gives a safe content area of
// 170mm × 249mm (with extra 4mm bottom for the stamped page number).
// page-break-after:always ensures each section starts fresh; min-height
// keeps short sections visually substantial without forcing blank fills.
// Stub-page fix (v7): we previously forced page-break-before:always +
// page-break-after:always on every v3 section. Short sections then pushed
// the next section's forced break, leaving 3–4 essentially blank stub
// pages that only carried the stamped page number. Switch to a flow-based
// model: sections live in document flow with break-inside:avoid (so a
// section won't be split mid-paragraph when it fits), and we let the
// renderer decide when to break. The first section after cover/method
// /snapshot still opts in via BODY_PAGE_BREAK_BEFORE for the wrapper that
// passes breakBefore:true; subsequent ones inherit auto.
const BODY_PAGE_STYLE =
  "width:210mm;padding:22mm 20mm 26mm;background:#FAF7F2;color:#151922;box-sizing:border-box;break-inside:avoid;page-break-inside:avoid;-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow-wrap:break-word;word-wrap:break-word;";
const BODY_PAGE_BREAK_BEFORE = "page-break-before:auto;break-before:auto;";

const safeH2Style =
  "font-family:Georgia,'Times New Roman',serif;color:#4A402D;font-size:22pt;font-weight:400;margin:0 0 12pt;line-height:1.25;overflow-wrap:break-word;word-wrap:break-word;";
const safePStyle =
  "font-family:Arial,Helvetica,sans-serif;color:#151922;font-size:11pt;line-height:1.6;margin:0 0 9pt;overflow-wrap:break-word;word-wrap:break-word;";
const safeBrandStyle =
  "font-family:Arial,Helvetica,sans-serif;color:#D4AF37;font-size:9pt;letter-spacing:3pt;text-transform:uppercase;margin:0 0 14pt;";
// Wraps heading + first paragraph so the heading never orphans at the
// bottom of the previous page.
const HEADING_KEEP_STYLE =
  "page-break-inside:avoid;break-inside:avoid;page-break-after:avoid;break-after:avoid;";

function safePara(s: string): string {
  return s
    .split(/\n{2,}/)
    .map((p) => `<p style="${safePStyle}">${escape(p).replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}

function safeSection(title: string, body: string, opts: { breakBefore?: boolean } = {}): string {
  const breakBefore = opts.breakBefore !== false ? BODY_PAGE_BREAK_BEFORE : "";
  return `<section style="${BODY_PAGE_STYLE}${breakBefore}"><div style="${HEADING_KEEP_STYLE}"><div style="${safeBrandStyle}">Darrow Code</div><h2 style="${safeH2Style}">${escape(title)}</h2></div>${body}</section>`;
}

function renderProseBlocks(text: string): { html: string; proof: string } {
  if (!text) return { html: "", proof: "" };
  const trimmed = text.trim();
  let proof = "";
  let body = trimmed;
  const proofMatch = trimmed.match(/\n*\[([^\[\]]+)\]\s*$/);
  if (proofMatch) {
    proof = proofMatch[1].trim();
    body = trimmed.slice(0, proofMatch.index ?? trimmed.length).trim();
  }
  const blocks = body
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b && !/^(PROTOCOL|Warning Signal)\s*:/i.test(b));
  const html = blocks
    .map((blk, i) => {
      const style = i === 0
        ? `${safePStyle}page-break-before:avoid;break-before:avoid;`
        : safePStyle;
      return `<p style="${style}">${escape(blk).replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");
  return { html, proof };
}

function renderProtocolBlocks(protocols: Array<{ title: string; body: string }>): string {
  if (!protocols.length) return "";
  return protocols
    .map(
      (p) =>
        `<div style="${PROTOCOL_BOX}"><div style="${PROTOCOL_LABEL}">PROTOCOL · ${escape(p.title)}</div><div style="${safePStyle}">${escape(p.body).replace(/\n/g, "<br/>")}</div></div>`,
    )
    .join("\n");
}

function renderWarningBlocks(warnings: string[]): string {
  if (!warnings.length) return "";
  return warnings
    .map(
      (w) =>
        `<div style="${WARNING_BOX}"><div style="${WARNING_LABEL}">Warning Signal</div><div style="${safePStyle}">${escape(w).replace(/\n/g, "<br/>")}</div></div>`,
    )
    .join("\n");
}

function v3Section(title: string, field: unknown): string {
  const prose = getCoreSectionProse(field);
  const { html, proof } = renderProseBlocks(prose);
  const protocols = renderProtocolBlocks(getCoreSectionProtocols(field));
  const warnings = renderWarningBlocks(getCoreSectionWarnings(field));
  const proofHtml = proof ? `<div style="${PROOF_STYLE}">${escape(proof)}</div>` : "";
  // Each callout block (WARNING_BOX, PROTOCOL_BOX) already carries its own
  // break-inside:avoid + page-break-before:avoid, so it won't be split or
  // orphaned as a heading without body. PROOF_STYLE adds page-break-before:avoid
  // + break-inside:avoid so the proof line stays attached to the preceding
  // warning. We do NOT wrap warnings+proof in a shared break-inside:avoid
  // container: doing so creates an oversized keep-together block that gets
  // pushed to the next page as one unit, leaving a near-empty gap on the
  // current page when there is not enough room for the combined block.
  // Pull the first <p> out of html and bind it to the heading so the
  // heading can never orphan at the bottom of the previous page.
  const firstParaMatch = html.match(/^<p [^>]*>[\s\S]*?<\/p>/);
  const firstPara = firstParaMatch ? firstParaMatch[0] : "";
  const restHtml = firstParaMatch ? html.slice(firstParaMatch[0].length) : html;
  const headerBlock =
    `<div style="${HEADING_KEEP_STYLE}"><div style="${safeBrandStyle}">Darrow Code</div><h2 style="${safeH2Style}">${escape(title)}</h2>${firstPara}</div>`;
  return `<section style="${BODY_PAGE_STYLE}${BODY_PAGE_BREAK_BEFORE}">${headerBlock}${restHtml}${protocols}${warnings}${proofHtml}</section>`;
}

export function renderReportHtmlSafe(report: DarrowReport, opts: { assetsBaseUrl?: string } = {}): string {
  report = normalizeReport(report);
  void opts.assetsBaseUrl;
  const core = report.modules.CORE as any;
  const clientName = report.client_name || "you";

  // Full-bleed dark page (cover / closing). APITemplate margins are 0, so
  // a section sized exactly 210mm × 297mm fills the entire sheet edge to
  // edge with no cream strip leakage.
  const fullDark =
    "width:210mm;height:297mm;padding:0 30mm;background:#0A0F1E;color:#F6F4EF;-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;text-align:center;display:block;overflow:hidden;page-break-after:always;break-after:page;";
  const goldMark = `<div style="width:36pt;height:36pt;margin:0 auto 28pt;transform:rotate(45deg);background:#D4AF37;-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div>`;

  const snap = report.client_snapshot;
  const sections: string[] = [];

  // ── Page 1 — Cover ───────────────────────────────────────────
  const tagline = core?.cover_tagline ? escape(getCoreSectionProse(core.cover_tagline)) : "";
  sections.push(
    `<section style="${fullDark}padding-top:80mm;">${goldMark}<div style="font-family:Arial,Helvetica,sans-serif;color:#D4AF37;font-size:11pt;letter-spacing:6pt;text-transform:uppercase;margin-bottom:36pt;-webkit-print-color-adjust:exact;print-color-adjust:exact;">Darrow Code</div><h1 style="font-family:Georgia,'Times New Roman',serif;color:#D4AF37;font-size:34pt;font-weight:400;line-height:1.2;margin:0 0 18pt;-webkit-print-color-adjust:exact;print-color-adjust:exact;">The Personal Architecture Report</h1><div style="width:60pt;height:1pt;background:#D4AF37;margin:24pt auto;-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div><div style="font-family:Arial,Helvetica,sans-serif;color:#9CA3AF;font-size:10pt;letter-spacing:3pt;text-transform:uppercase;margin-bottom:10pt;">Prepared for</div><div style="font-family:Georgia,'Times New Roman',serif;color:#F6F4EF;font-size:22pt;">${escape(clientName)}</div>${tagline ? `<p style="font-family:Georgia,'Times New Roman',serif;font-style:italic;color:#E5E7EB;font-size:13pt;margin:36pt auto 0;max-width:120mm;line-height:1.5;overflow-wrap:break-word;word-wrap:break-word;">${tagline}</p>` : ""}</section>`,
  );

  // ── Page 2 — Method & Orientation ────────────────────────────
  sections.push(
    `<section style="${BODY_PAGE_STYLE}">` +
      `<div style="${HEADING_KEEP_STYLE}">` +
        `<div style="${safeBrandStyle}">Darrow Code</div>` +
        `<h2 style="${safeH2Style}">Method &amp; Orientation</h2>` +
        `<p style="font-family:Georgia,'Times New Roman',serif;font-style:italic;color:#4A402D;font-size:13pt;line-height:1.5;margin:0 0 14pt;overflow-wrap:break-word;word-wrap:break-word;">Clarity before action. Orientation over prediction.</p>` +
      `</div>` +
      `<p style="${safePStyle}">This report is a private orientation map built from your birth data and name. It brings Western astrology, Chinese BaZi, numerology and pattern psychology into one clear reading — not to tell you what will happen, but to help you recognize how your system works.</p>` +
      `<p style="${safePStyle}">Read it for recognition, not instruction. When a line feels familiar, pause. Familiarity is data.</p>` +
      `<p style="${safePStyle}color:#6B6B6B;font-size:10pt;font-style:italic;margin-top:18pt;">This is not medical, legal, financial or psychiatric advice. It does not replace your judgment. It gives language to patterns you may have felt for years.</p>` +
    `</section>`,
  );

  // ── Page 3 — Client Snapshot ─────────────────────────────────
  const snapBullet = (label: string, body: string) =>
    `<div style="margin:0 0 10pt;page-break-inside:avoid;break-inside:avoid;">` +
      `<div style="font-family:Arial,Helvetica,sans-serif;color:#A8841F;font-size:9pt;letter-spacing:2pt;text-transform:uppercase;margin-bottom:3pt;">${escape(label)}</div>` +
      `<p style="${safePStyle}margin:0;">${escape(body)}</p>` +
    `</div>`;
  const snapshotBlock =
    `<div style="${HEADING_KEEP_STYLE}">` +
      `<div style="${safeBrandStyle}">Darrow Code</div>` +
      `<h2 style="${safeH2Style}">Client Snapshot</h2>` +
      `<h3 style="font-family:Georgia,'Times New Roman',serif;color:#D4AF37;font-size:22pt;font-weight:400;margin:0 0 12pt;-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow-wrap:break-word;word-wrap:break-word;">${escape(snap.pattern_name)}</h3>` +
      `<p style="font-family:Georgia,'Times New Roman',serif;font-size:13pt;color:#4A402D;font-style:italic;line-height:1.55;margin:0 0 14pt;overflow-wrap:break-word;word-wrap:break-word;">${escape(snap.core_pattern)}</p>` +
    `</div>` +
    `<p style="${safePStyle}">${escape(snap.unique_signature)}</p>` +
    `<div style="margin-top:14pt;border-top:0.5pt solid #D4AF37;padding-top:12pt;-webkit-print-color-adjust:exact;print-color-adjust:exact;">` +
      snapBullet("Primary Strength", snap.primary_strength) +
      snapBullet("Pressure Point", snap.pressure_point) +
      snapBullet("Best Rhythm", snap.best_operating_rhythm) +
      snapBullet("Current Timing", snap.current_timing_theme) +
      snapBullet("Practical Focus", snap.practical_focus) +
    `</div>` +
    `<div style="${PROOF_STYLE}">Proof anchors drawn from your natal chart, BaZi pillars and numerology code (see sections that follow).</div>`;
  sections.push(`<section style="${BODY_PAGE_STYLE}${BODY_PAGE_BREAK_BEFORE}">${snapshotBlock}</section>`);

  if (core && core.schema_version === "core_v3") {
    sections.push(v3Section("Orientation", core.orientation));
    sections.push(v3Section("Core Architecture", core.core_architecture));
    sections.push(v3Section("The Battery — Emotional Needs & Internal Fuel", core.battery));
    sections.push(v3Section("Social Interface", core.social_interface));
    sections.push(v3Section("Numerology Code", core.numerology_code));
    sections.push(v3Section("Cognitive Style", core.cognitive_style));
    sections.push(v3Section("Drive & Rhythm", core.drive_and_rhythm));
    sections.push(v3Section("Professional Archetype", core.professional_archetype));
    sections.push(v3Section("Money & Value Mechanics", core.money_and_value));
    sections.push(v3Section("Relationship Baseline", core.relationship_baseline));
    sections.push(v3Section("Vitality Baseline", core.vitality_baseline));
    sections.push(v3Section("Environment & Resonance", core.environment_and_resonance));
    sections.push(v3Section("Shadow & Friction", core.shadow_and_friction));
    sections.push(v3Section("Before / After", core.before_after));
    sections.push(v3Section("Executive Summary", core.executive_summary));
    sections.push(v3Section("Next Step", core.next_step));
  } else if (core) {
    sections.push(
      safeSection("Opening", safePara(String(core.opening ?? "")) + safePara(String(core.architecture ?? ""))),
      safeSection("Mechanic", safePara(String(core.mechanic ?? ""))),
      safeSection("Timing", safePara(String(core.timing ?? ""))),
      safeSection("Protocols", safePara(String(core.protocols ?? ""))),
      safeSection("Warning Signal", safePara(String(core.shadow ?? ""))),
      safeSection("Before / After", safePara(String(core.before_after ?? ""))),
      safeSection("Next Step", safePara(String(core.next ?? "")) + safePara(report.closing.executive_summary)),
    );
  }

  // ── Closing — full dark bleed, content vertically centred via flex,
  // page-break-before:always for a clean page start, page-break-after:auto
  // so no trailing blank page is appended after the closing.
  const closingStyle =
    "width:210mm;height:297mm;padding:0 30mm;background:#0A0F1E;color:#F6F4EF;" +
    "-webkit-print-color-adjust:exact;print-color-adjust:exact;" +
    "box-sizing:border-box;text-align:center;" +
    "display:flex;flex-direction:column;justify-content:center;align-items:center;" +
    "overflow:hidden;page-break-before:always;break-before:page;page-break-after:auto;break-after:auto;";
  sections.push(
    `<section style="${closingStyle}">${goldMark}<div style="font-family:Arial,Helvetica,sans-serif;color:#D4AF37;font-size:11pt;letter-spacing:6pt;text-transform:uppercase;margin-bottom:28pt;-webkit-print-color-adjust:exact;print-color-adjust:exact;">Darrow Code</div><p style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:15pt;color:#E5E7EB;margin:0 auto;max-width:120mm;line-height:1.5;overflow-wrap:break-word;word-wrap:break-word;">More than a horoscope. Your private birth code.</p></section>`,
  );

  // Global reset: box-sizing on every element + safe word wrapping kills
  // any horizontal clipping from long unbroken tokens (URLs, brand strings
  // with letter-spacing, technical anchors). Body has no margin so
  // sections sit edge-to-edge — full-bleed cover/closing depend on this.
  const globalCss = `
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #FAF7F2; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: Arial, Helvetica, sans-serif; color: #151922; overflow-wrap: break-word; word-wrap: break-word; }
    p, h1, h2, h3, div { overflow-wrap: break-word; word-wrap: break-word; }
    img { max-width: 100%; height: auto; }
    section { max-width: 210mm; }
  `;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>Darrow Code — Prepared for ${escape(clientName)}</title><style>${globalCss}</style></head><body>${sections.join("\n")}</body></html>`;
}

// DEPRECATED — NOT USED BY PIPELINE. Do not modify or reactivate.
// Legacy field names (opening/architecture/mechanic/...) remain here for
// historical reference only. The active renderer is `renderReportHtmlSafe`
// above; that is what `pipeline.server.ts` calls.
export function renderReportHtml(report: DarrowReport, opts: { assetsBaseUrl?: string } = {}): string {
  report = normalizeReport(report);
  const core = report.modules.CORE as any;
  const generated = report.generated_modules ?? Object.keys(report.modules);
  const hasCore = !!core && generated.includes("CORE");
  const addonCodes = generated.filter((c) => c !== "CORE");
  const clientName = report.client_name || "you";
  // Note: `assetsBaseUrl` is intentionally unused for brand imagery — the
  // symbol is inlined as a base64 data URL above so it always renders, even
  // when the PDF service can't reach the configured public host.
  void opts.assetsBaseUrl;
  const symbolGold = symbolDataUrl;
  const symbolSmall = symbolDataUrl;

  // Dynamic cover title based on purchased modules
  let coverTitle: string;
  if (hasCore && addonCodes.length === 6) {
    coverTitle = "The Personal Architecture Report";
  } else if (hasCore) {
    coverTitle = "The Personal Architecture Report";
  } else if (addonCodes.length === 1) {
    coverTitle = `${addonCodes[0]} Report`;
  } else {
    coverTitle = "Darrow Code Selected Chapters";
  }

  const cover = `
    <section class="page page-cover">
      <div class="cover-inner">
        <img class="cover-symbol" src="${symbolGold}" alt="" />
        <div class="brand-cover">Darrow Code</div>
        <h1 class="cover-title">${escape(coverTitle)}</h1>
        <div class="cover-divider"></div>
        <div class="cover-prepared">Prepared for</div>
        <div class="cover-name">${escape(clientName)}</div>
      </div>
    </section>

    <section class="page page-disclaimer">
      <div class="brand">Darrow Code</div>
      <h2>Method &amp; Disclaimer</h2>
      <p><strong>What this is.</strong> A structural reading drawing on Western natal astrology, Pythagorean numerology and Chinese Bazi, blended into one interpretive layer. The aim is orientation, not prediction.</p>
      <p><strong>What this is not.</strong> Not medical, legal, financial or psychiatric advice. Not destiny. Not a personality test. No outcomes are promised.</p>
      <p><strong>How to read it.</strong> Each section names a structural pattern, then offers protocols — concrete behavioural anchors — connected to your specific configuration. Read once for orientation, return when something the report described actually shows up.</p>
      
    </section>
  `;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<title>Darrow Code — Prepared for ${escape(clientName)}</title>
<style>
  @page {
    size: A4;
    margin: 22mm 20mm;
    @bottom-right {
      content: counter(page);
      font-family: 'Cormorant Garamond', 'Times New Roman', serif;
      font-size: 10pt;
      color: #D4AF37;
      letter-spacing: 1.5pt;
    }
    @bottom-left {
      content: "";
      background-image: url("${symbolDataUrl}");
      background-repeat: no-repeat;
      background-size: contain;
      background-position: left center;
      width: 14pt;
      height: 14pt;
      opacity: 0.07;
    }
  }
  @page :first { margin-bottom: 0; @bottom-right { content: ""; } @bottom-left { background-image: none; } }
  body { font-family: 'Inter', 'Helvetica', sans-serif; color: #151922; font-size: 11pt; line-height: 1.6; background: #F6F4EF; margin: 0; }
  .page { page-break-after: always; min-height: 240mm; }
  .page:last-child { page-break-after: auto; }
  h1, h2, h3 { font-family: 'Cormorant Garamond', 'Times New Roman', serif; color: #4A402D; font-weight: 500; }
  h2 { font-size: 22pt; margin: 0 0 12pt; letter-spacing: 0.3px; }
  h2.sub { margin-top: 20pt; font-size: 18pt; }
  p { margin: 0 0 9pt; text-align: justify; }
  .muted { color: #6B6B6B; font-size: 9pt; }
  .brand { font-family: 'Inter', sans-serif; letter-spacing: 4px; font-size: 9pt; color: #D4AF37; text-transform: uppercase; margin-bottom: 18pt; }

  /* Cover */
  .page-cover { box-sizing: border-box; background: #0A0F1E; color: #E5E7EB; height: 297mm; display: flex; align-items: center; justify-content: center; margin: -22mm -20mm; padding: 40mm 30mm; overflow: hidden; }
  .cover-inner { text-align: center; }
  .brand-cover { font-family: 'Inter', sans-serif; letter-spacing: 6px; font-size: 11pt; color: #D4AF37; text-transform: uppercase; margin-bottom: 36pt; }
  .cover-title { font-family: 'Cormorant SC', 'Cormorant Garamond', serif; font-size: 36pt; color: #D4AF37; margin: 0; line-height: 1.2; font-weight: 400; }
  .cover-divider { width: 60pt; height: 1pt; background: #D4AF37; margin: 28pt auto; }
  .cover-prepared { font-size: 10pt; letter-spacing: 3px; text-transform: uppercase; color: #9CA3AF; margin-bottom: 8pt; }
  .cover-name { font-family: 'Cormorant Garamond', serif; font-size: 22pt; color: #F6F4EF; }
  .cover-symbol { display: block; width: 90pt; height: auto; margin: 0 auto 28pt; opacity: 0.95; }
  .closing-symbol { display: block; width: 56pt; height: auto; margin: 0 auto 28pt; opacity: 0.9; }

  /* Module covers */
  .module-cover { box-sizing: border-box; background: #0A0F1E; color: #E5E7EB; margin: -22mm -20mm; padding: 60mm 30mm; height: 297mm; overflow: hidden; }
  .module-title { font-family: 'Cormorant SC', serif; font-size: 30pt; color: #D4AF37; margin: 24pt 0 16pt; font-weight: 400; }
  .module-cover .brand { color: #D4AF37; }
  .prepared { color: #9CA3AF; font-size: 10pt; letter-spacing: 2px; text-transform: uppercase; }

  /* Disclaimer */
  .page-disclaimer p { margin-bottom: 12pt; }

  /* Snapshot page */
  .snapshot-title { color: #4A402D; }
  .pattern-name { font-family: 'Cormorant SC', serif; font-size: 26pt; color: #D4AF37; margin: 8pt 0 14pt; letter-spacing: 0.5px; }
  .core-pattern { font-family: 'Cormorant Garamond', serif; font-size: 14pt; font-style: italic; color: #4A402D; margin-bottom: 22pt; }
  .signature-block { background: #fff; border-left: 2pt solid #D4AF37; padding: 14pt 18pt; margin-bottom: 22pt; }
  .block-label { font-size: 8pt; letter-spacing: 3px; color: #D4AF37; text-transform: uppercase; margin-bottom: 6pt; }
  .cell-label { font-size: 8pt; letter-spacing: 2px; color: #6B6B6B; text-transform: uppercase; margin-bottom: 4pt; }
  .snapshot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14pt 22pt; margin-bottom: 22pt; }
  .practical-card { background: #fff; padding: 14pt 18pt; border: 0.5pt solid #E5E7EB; }

  /* Protocols */
  .protocol { background: #fff; border-left: 2pt solid #D4AF37; padding: 12pt 16pt; margin-bottom: 14pt; }
  .protocol-label { font-size: 8pt; letter-spacing: 3px; color: #D4AF37; text-transform: uppercase; margin-bottom: 6pt; }

  /* Shadow */
  .shadow-box { background: #fff; border: 0.5pt solid #4A402D; padding: 14pt 18pt; }

  /* Proof tags */
  .proof-tags { margin-top: 18pt; padding-top: 12pt; border-top: 0.5pt solid #E5E7EB; }
  .proof-tags ul { margin: 0; padding-left: 18pt; color: #6B6B6B; font-size: 9pt; }
  .proof-tags li { margin-bottom: 3pt; }

  /* Module snapshot */
  .module-snapshot { margin-top: 20pt; background: #fff; padding: 14pt 18pt; border: 0.5pt solid #E5E7EB; }
  .snapshot-row { display: grid; grid-template-columns: 90pt 1fr; gap: 12pt; margin-bottom: 8pt; align-items: baseline; }
  .snapshot-row span { font-size: 8pt; letter-spacing: 2px; color: #6B6B6B; text-transform: uppercase; }
  .snapshot-row p { margin: 0; }

  /* Style palette */
  .palette { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8pt; margin: 18pt 0; }
  .swatch span { display: block; height: 40pt; border: 0.5pt solid #E5E7EB; margin-bottom: 4pt; }
  .swatch div { font-size: 8pt; color: #6B6B6B; }

  /* Cross-sell */
  .page-crosssell .crosssell-intro { color: #6B6B6B; margin-bottom: 22pt; }
  .addon-list { display: grid; gap: 10pt; }
  .addon-item { background: #fff; padding: 12pt 16pt; border-left: 2pt solid #D4AF37; }
  .addon-code { font-size: 8pt; letter-spacing: 3px; color: #D4AF37; text-transform: uppercase; }
  .addon-name { font-family: 'Cormorant Garamond', serif; font-size: 16pt; color: #4A402D; margin: 2pt 0 4pt; }
  .addon-tag { color: #6B6B6B; font-size: 10pt; }

  .page-closing { box-sizing: border-box; background: #0A0F1E; color: #E5E7EB; margin: -22mm -20mm; padding: 80mm 30mm; height: 297mm; text-align: center; overflow: hidden; }
  .page-closing .brand { color: #D4AF37; margin-bottom: 28pt; }
  .watermark-note { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 14pt; color: #9CA3AF; }
</style></head>
<body>
  ${cover}
  ${hasCore && core
    ? renderCoreChapter(core, report.client_snapshot, report.closing)
    : renderSnapshotOnly(report.client_snapshot)}
  ${addonCodes.map((c) => report.modules[c] ? renderAddon(c, report.modules[c] as any, clientName) : "").join("")}
  ${renderCrossSell(generated, symbolSmall)}
</body></html>`;
}

function renderSnapshotOnly(snapshot: DarrowReport["client_snapshot"]): string {
  return `
    <section class="page page-snapshot">
      <div class="brand">Darrow Code</div>
      <h2 class="snapshot-title">Client Snapshot</h2>
      <div class="pattern-name">${escape(snapshot.pattern_name)}</div>
      <p class="core-pattern">${escape(snapshot.core_pattern)}</p>
      <div class="signature-block">
        <div class="block-label">Unique Signature</div>
        <p>${escape(snapshot.unique_signature)}</p>
      </div>
      <div class="snapshot-grid">
        <div><div class="cell-label">Primary Strength</div><p>${escape(snapshot.primary_strength)}</p></div>
        <div><div class="cell-label">Pressure Point</div><p>${escape(snapshot.pressure_point)}</p></div>
        <div><div class="cell-label">Best Operating Rhythm</div><p>${escape(snapshot.best_operating_rhythm)}</p></div>
        <div><div class="cell-label">Current Timing Theme</div><p>${escape(snapshot.current_timing_theme)}</p></div>
      </div>
      <div class="practical-card">
        <div class="block-label">Practical Focus</div>
        <p>${escape(snapshot.practical_focus)}</p>
      </div>
    </section>
  `;
}
