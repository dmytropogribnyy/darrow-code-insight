import type { DarrowReport, DarrowModule } from "@/lib/ai/schema";
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

const safePageStyle = "page-break-after:always;min-height:245mm;padding:0 0 12mm 0;box-sizing:border-box;";
const safeH2Style = "font-family:Georgia,'Times New Roman',serif;color:#4A402D;font-size:24pt;font-weight:400;margin:0 0 14pt;line-height:1.2;";
const safePStyle = "font-family:Arial,Helvetica,sans-serif;color:#151922;font-size:11pt;line-height:1.62;margin:0 0 9pt;";
const safeBrandStyle = "font-family:Arial,Helvetica,sans-serif;color:#D4AF37;font-size:9pt;letter-spacing:3pt;text-transform:uppercase;margin:0 0 18pt;";

function safePara(s: string): string {
  return s.split(/\n{2,}/).map((p) => `<p style="${safePStyle}">${escape(p).replace(/\n/g, "<br/>")}</p>`).join("\n");
}

function safeSection(title: string, body: string): string {
  return `<section style="${safePageStyle}"><div style="${safeBrandStyle}">Darrow Code</div><h2 style="${safeH2Style}">${escape(title)}</h2>${body}</section>`;
}

// ─────────────────────────────────────────────────────────────
// v3 CORE-aware renderer (APITemplate-safe).
// Inline CSS only, no @page rules, no base64 in CSS, no external fonts,
// no header/footer.
// ─────────────────────────────────────────────────────────────

const PROTOCOL_BORDER =
  "border-left:2pt solid #D4AF37;padding:6pt 0 6pt 12pt;margin:8pt 0 12pt;-webkit-print-color-adjust:exact;print-color-adjust:exact;";
const PROOF_STYLE =
  "font-family:Arial,Helvetica,sans-serif;color:#9CA3AF;font-size:9pt;font-style:italic;margin-top:10pt;";

// Render a section body: split paragraphs on \n\n, give PROTOCOL: /
// Warning Signal: lines a left-border treatment, and split out a trailing
// proof-tag bracket if present.
function v3Body(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  // Pull out trailing proof tag: a final line wrapped in [ ... ].
  let proof = "";
  let body = trimmed;
  const proofMatch = trimmed.match(/\n*\[([^\[\]]+)\]\s*$/);
  if (proofMatch) {
    proof = proofMatch[1].trim();
    body = trimmed.slice(0, proofMatch.index ?? trimmed.length).trim();
  }
  const blocks = body.split(/\n{2,}/);
  const html = blocks
    .map((blk) => {
      const trimmedBlk = blk.trim();
      if (/^(PROTOCOL|Warning Signal)\s*:/i.test(trimmedBlk)) {
        return `<div style="${PROTOCOL_BORDER}"><p style="${safePStyle}">${escape(trimmedBlk).replace(/\n/g, "<br/>")}</p></div>`;
      }
      return `<p style="${safePStyle}">${escape(trimmedBlk).replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");
  const proofHtml = proof
    ? `<div style="${PROOF_STYLE}">${escape(proof)}</div>`
    : "";
  return html + proofHtml;
}

function v3Section(title: string, body: string): string {
  return `<section style="${safePageStyle}"><div style="${safeBrandStyle}">Darrow Code</div><h2 style="${safeH2Style}">${escape(title)}</h2>${v3Body(body)}</section>`;
}

export function renderReportHtmlSafe(report: DarrowReport, opts: { assetsBaseUrl?: string } = {}): string {
  report = normalizeReport(report);
  void opts.assetsBaseUrl;
  const core = report.modules.CORE as any;
  const clientName = report.client_name || "you";
  const darkBleed =
    "margin:-22mm -20mm;padding:40mm 30mm;min-height:297mm;-webkit-print-color-adjust:exact;print-color-adjust:exact;page-break-after:always;box-sizing:border-box;text-align:center;";
  const goldMark = `<div style="width:36pt;height:36pt;margin:0 auto 28pt;transform:rotate(45deg);background:#D4AF37;-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div>`;

  const snap = report.client_snapshot;
  const sections: string[] = [];

  // Page 1 — Cover
  const tagline = core?.cover_tagline ? escape(String(core.cover_tagline)) : "";
  sections.push(
    `<section style="${darkBleed}background:#0A0F1E;color:#F6F4EF;padding-top:60mm;">${goldMark}<div style="font-family:Arial,Helvetica,sans-serif;color:#D4AF37;font-size:11pt;letter-spacing:6pt;text-transform:uppercase;margin-bottom:36pt;-webkit-print-color-adjust:exact;print-color-adjust:exact;">Darrow Code</div><h1 style="font-family:Georgia,'Times New Roman',serif;color:#D4AF37;font-size:34pt;font-weight:400;line-height:1.2;margin:0 0 18pt;-webkit-print-color-adjust:exact;print-color-adjust:exact;">The Personal Architecture Report</h1><div style="width:60pt;height:1pt;background:#D4AF37;margin:24pt auto;-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div><div style="font-family:Arial,Helvetica,sans-serif;color:#9CA3AF;font-size:10pt;letter-spacing:3pt;text-transform:uppercase;margin-bottom:10pt;">Prepared for</div><div style="font-family:Georgia,'Times New Roman',serif;color:#F6F4EF;font-size:22pt;">${escape(clientName)}</div>${tagline ? `<p style="font-family:Georgia,'Times New Roman',serif;font-style:italic;color:#E5E7EB;font-size:13pt;margin:36pt auto 0;max-width:120mm;line-height:1.5;">${tagline}</p>` : ""}</section>`,
  );

  // Page 2 — Method / Disclaimer
  sections.push(
    safeSection(
      "Method & Disclaimer",
      `<p style="${safePStyle}"><strong>What this is.</strong> A structural reading drawing on Western natal astrology, Pythagorean numerology and Chinese Bazi, blended into one interpretive layer. The aim is orientation, not prediction.</p><p style="${safePStyle}"><strong>What this is not.</strong> Not medical, legal, financial or psychiatric advice. Not destiny. Not a personality test. No outcomes are promised.</p><p style="${safePStyle}"><strong>How to read it.</strong> Each section names a structural pattern, then offers protocols — concrete behavioural anchors — connected to your specific configuration.</p>`,
    ),
  );

  // Page 3 — Client Snapshot + Orientation
  const snapshotBlock =
    `<h3 style="font-family:Georgia,'Times New Roman',serif;color:#D4AF37;font-size:22pt;font-weight:400;margin:0 0 10pt;">${escape(snap.pattern_name)}</h3>` +
    safePara(snap.core_pattern) +
    safePara(snap.unique_signature) +
    `<div style="margin-top:10pt;border-top:1pt solid #D4AF37;padding-top:10pt;">` +
    `<p style="${safePStyle}"><strong>Primary Strength.</strong> ${escape(snap.primary_strength)}</p>` +
    `<p style="${safePStyle}"><strong>Pressure Point.</strong> ${escape(snap.pressure_point)}</p>` +
    `<p style="${safePStyle}"><strong>Best Operating Rhythm.</strong> ${escape(snap.best_operating_rhythm)}</p>` +
    `<p style="${safePStyle}"><strong>Current Timing Theme.</strong> ${escape(snap.current_timing_theme)}</p>` +
    `<p style="${safePStyle}"><strong>Practical Focus.</strong> ${escape(snap.practical_focus)}</p>` +
    `</div>`;
  const orientationBody = core?.orientation
    ? `<h2 style="${safeH2Style};margin-top:18pt;">Orientation</h2>${v3Body(String(core.orientation))}`
    : "";
  sections.push(
    `<section style="${safePageStyle}"><div style="${safeBrandStyle}">Darrow Code</div><h2 style="${safeH2Style}">Client Snapshot</h2>${snapshotBlock}${orientationBody}</section>`,
  );

  if (core && core.schema_version === "core_v3") {
    // Page 4–5 — Core Architecture (2 pages: split on paragraph midpoint)
    const ca = String(core.core_architecture ?? "");
    const caParas = ca.split(/\n{2,}/);
    const mid = Math.ceil(caParas.length / 2);
    const caA = caParas.slice(0, mid).join("\n\n");
    const caB = caParas.slice(mid).join("\n\n");
    sections.push(v3Section("Core Architecture", caA));
    if (caB.trim()) sections.push(v3Section("Core Architecture (continued)", caB));

    sections.push(v3Section("The Battery — Emotional Needs & Internal Fuel", String(core.battery ?? "")));
    sections.push(v3Section("Social Interface", String(core.social_interface ?? "")));
    sections.push(v3Section("Numerology Code", String(core.numerology_code ?? "")));
    sections.push(v3Section("Cognitive Style", String(core.cognitive_style ?? "")));
    sections.push(v3Section("Drive & Rhythm", String(core.drive_and_rhythm ?? "")));
    sections.push(v3Section("Professional Archetype", String(core.professional_archetype ?? "")));
    sections.push(v3Section("Money & Value Mechanics", String(core.money_and_value ?? "")));
    sections.push(v3Section("Relationship Baseline", String(core.relationship_baseline ?? "")));
    sections.push(v3Section("Vitality Baseline", String(core.vitality_baseline ?? "")));
    sections.push(v3Section("Environment & Resonance", String(core.environment_and_resonance ?? "")));

    // Page 16–17 — Shadow & Friction (2 pages)
    const sh = String(core.shadow_and_friction ?? "");
    const shParas = sh.split(/\n{2,}/);
    const shMid = Math.ceil(shParas.length / 2);
    const shA = shParas.slice(0, shMid).join("\n\n");
    const shB = shParas.slice(shMid).join("\n\n");
    sections.push(v3Section("Shadow & Friction", shA));
    if (shB.trim()) sections.push(v3Section("Shadow & Friction (continued)", shB));

    sections.push(v3Section("Before / After", String(core.before_after ?? "")));
    sections.push(v3Section("Executive Summary", String(core.executive_summary ?? "")));
    sections.push(v3Section("Next Step", String(core.next_step ?? "")));
  } else if (core) {
    // Legacy fallback (kept temporarily so a stale legacy CORE renders rather
    // than crashing — pipeline should regenerate stale content via PART 8).
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

  // Closing dark page
  const darkBleedClosing =
    "margin:-22mm -20mm;padding:80mm 30mm 60mm;-webkit-print-color-adjust:exact;print-color-adjust:exact;page-break-after:auto;box-sizing:border-box;text-align:center;";
  sections.push(
    `<section style="${darkBleedClosing}background:#0A0F1E;color:#E5E7EB;">${goldMark}<div style="font-family:Arial,Helvetica,sans-serif;color:#D4AF37;font-size:11pt;letter-spacing:6pt;text-transform:uppercase;margin-bottom:28pt;-webkit-print-color-adjust:exact;print-color-adjust:exact;">Darrow Code</div><p style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:15pt;color:#E5E7EB;margin:0;">More than a horoscope. Your private birth code.</p></section>`,
  );

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>Darrow Code — Prepared for ${escape(clientName)}</title></head><body style="margin:0;background:#F6F4EF;padding:22mm 20mm;font-family:Arial,Helvetica,sans-serif;">${sections.join("\n")}</body></html>`;
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
  ${addonCodes.map((c) => report.modules[c] ? renderAddon(c, report.modules[c]!, clientName) : "").join("")}
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
