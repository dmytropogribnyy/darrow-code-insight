import type { DarrowReport, DarrowModule } from "@/lib/ai/schema";
// Inline the brand symbol as a base64 data URL so PDF renderers (APITemplate.io)
// never have to fetch it from an external host. Previously we relied on
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

export function renderReportHtml(report: DarrowReport, opts: { assetsBaseUrl?: string } = {}): string {
  // Defensive: normalize known AI typos of "PROTOCOL" across all string fields
  // before any rendering. Does not modify AI prompts or generation logic.
  report = normalizeReport(report);
  const core = report.modules.CORE;
  const generated = report.generated_modules ?? Object.keys(report.modules);
  const addonCodes = generated.filter((c) => c !== "CORE");
  const clientName = report.client_name || "you";
  // Note: `assetsBaseUrl` is intentionally unused for brand imagery — the
  // symbol is inlined as a base64 data URL above so it always renders, even
  // when the PDF service can't reach the configured public host.
  void opts.assetsBaseUrl;
  const symbolGold = symbolDataUrl;
  const symbolSmall = symbolDataUrl;

  const cover = `
    <section class="page page-cover">
      <div class="cover-inner">
        <img class="cover-symbol" src="${symbolGold}" alt="" />
        <div class="brand-cover">Darrow Code</div>
        <h1 class="cover-title">The Personal Architecture Report</h1>
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
  ${renderCoreChapter(core, report.client_snapshot, report.closing)}
  ${addonCodes.map((c) => report.modules[c] ? renderAddon(c, report.modules[c]!, clientName) : "").join("")}
  ${renderCrossSell(generated, symbolSmall)}
</body></html>`;
}
