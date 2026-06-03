# Darrow Code — CORE PDF v4.1 Render-Only QA Report

**Date:** 2026-06-03
**Phase:** B4 — CORE PDF v4.1 Render-Only Diagnostic
**Commit before changes:** `d4593ec` (seo: update home metadata and footer social links)

---

## 1. What the v4.1 render-only path does

`renderCoreV4HtmlSafe(core, clientName)` — a new exported function in `src/lib/pdf/template.ts` that:

- Accepts a CoreV4Schema object (`schema_version: "core_v4"`) and a client name
- Renders a complete standalone A4 HTML document with:
  - Full-bleed dark cover page with tagline
  - Method & Orientation page
  - 17 body sections in the v4 order (all correctly field-mapped)
  - Full-bleed dark closing page (no trailing blank page)
- Handles all v4 special section shapes:
  - Standard sections: `opening_line` → `prose` → `key_insight` → `protocols` → `warning_signals`
  - `before_after`: renders `before_after_pairs` as labelled Before/After card pairs
  - `executive_summary`: renders `executive_summary_blocks` as 6 gold-labelled callout boxes
  - `next_step`: renders `closing_pillars` as 4 titled pillar blocks
  - `vitality_baseline`: appends disclaimer if present
- Uses the same layout invariants as v3: `BODY_PAGE_STYLE`, `BODY_PAGE_BREAK_BEFORE`, proof-in-last-callout, no `break-inside:avoid` at section level

Does NOT call AI generation, Stripe, email, Supabase, or any production pipeline.

---

## 2. Files changed

| File | Change |
|---|---|
| `src/lib/pdf/template.ts` | Added `renderCoreV4HtmlSafe()` export + v4 internal section helpers + fixed broken v4 fallback branch in `renderReportHtmlSafe()` |
| `src/routes/api/public/debug/core-v4-render.ts` | New render-only diagnostic route (render_html + render_pdf modes) |
| `src/routeTree.gen.ts` | Registered new `/api/public/debug/core-v4-render` route |
| `src/lib/pdf/template.v4.test.ts` | 69 new tests for v4 renderer + route safety guards |
| `src/lib/pdf/generate-v4-artifact.test.ts` | HTML artifact generator (run standalone, not in standard suite) |
| `scripts/generate-v4-diagnostic.ts` | Alternate generator script (documentation only; use Vitest path) |
| `.gitignore` | Added `outputs/` to prevent accidental commit of diagnostic artifacts |
| `docs/pdf-v4.1-render-qa-2026-06-03.md` | This report |

---

## 3. What the broken v4 fallback fix does

The old fallback in `renderReportHtmlSafe()` for non-v3 cores used wrong field names:
```ts
// BEFORE (broken):
safeSection("Opening", safePara(String(core.opening ?? ""))),   // 'opening' doesn't exist in v4
safeSection("Mechanic", safePara(String(core.mechanic ?? ""))), // 'mechanic' doesn't exist in v4
```

The new fallback routes v4 data through the correct v4 section helpers:
```ts
// AFTER (fixed):
for (const key of V4_BODY_KEYS) {
  if (key === "before_after") sections.push(v4BeforeAfterSection(field));
  else if (key === "executive_summary") sections.push(v4ExecutiveSummarySection(field));
  // ... etc.
}
```

The v3 path (`core.schema_version === "core_v3"`) is completely unchanged.

---

## 4. Diagnostic route

**Route:** `POST /api/public/debug/core-v4-render`
**Auth:** `Authorization: Bearer <JOB_DISPATCH_SECRET>`

### render_html mode
```json
{
  "mode": "render_html",
  "client_name": "Alex",
  "core_json": { "schema_version": "core_v4", ... }
}
```
Returns JSON with `html` field (string).

### render_pdf mode
```json
{
  "mode": "render_pdf",
  "client_name": "Alex",
  "core_json": { "schema_version": "core_v4", ... }
}
```
Returns binary PDF (`Content-Type: application/pdf`).

---

## 5. Diagnostic HTML artifact

**Path:** `outputs/pdf-v4.1-core-diagnostic.html`
**Size:** 49,948 bytes
**Status:** Generated locally. `outputs/` is gitignored — not committed.

**To regenerate:**
```bash
npx vitest run src/lib/pdf/generate-v4-artifact.test.ts
```
Output: `outputs/pdf-v4.1-core-diagnostic.html`

**To get a PDF:** POST to `/api/public/debug/core-v4-render` with `mode: "render_pdf"` and a valid v4 core_json.

---

## 6. Confirmations

| Guardrail | Status |
|---|---|
| v3 production path (`renderReportHtmlSafe` v3 branch) | ✅ Untouched |
| `system-prompt.ts` | ✅ Untouched |
| `generateDarrowReport` production pipeline | ✅ Untouched |
| Stripe / checkout / prices | ✅ Untouched |
| Email sending / Resend | ✅ Untouched |
| Supabase schema / migrations / RLS | ✅ Untouched |
| Token / download routes | ✅ Untouched |
| AI generation (Anthropic calls) | ✅ Not called |
| SEO metadata / footer / favicon / brand assets | ✅ Untouched |
| Production NOT switched to v4.1 | ✅ Confirmed |
| `core-v4-run.ts` remains JSON-only | ✅ Confirmed (separate render route created) |

---

## 7. Commands run

| Command | Result |
|---|---|
| `npx tsc --noEmit` | ✅ Clean (0 errors) |
| `npx vitest run` (all 8 test files) | ✅ 248/248 passed |
| `npx vitest run src/lib/pdf/template.v4.test.ts` | ✅ 69/69 passed |
| `npx vitest run src/lib/pdf/generate-v4-artifact.test.ts` | ✅ HTML artifact generated |
| `npm run build` | ❌ Node.js 20.12.2 < required 20.19+ (pre-existing, unrelated) |

---

## 8. Visual QA checklist for the user

Open `outputs/pdf-v4.1-core-diagnostic.html` in a browser (Chrome/Edge recommended for print preview).

**Cover page**
- [ ] Dark background fills edge-to-edge (no cream strip visible)
- [ ] Gold diamond visible
- [ ] "The Personal Architecture Report" in gold
- [ ] "Prepared for Alex" in light text
- [ ] Cover tagline in italic below
- [ ] No body text visible on cover

**Body pages**
- [ ] Readable font size (11pt body, 22pt headings)
- [ ] Safe margins on all four sides
- [ ] Section headings visible: Orientation, Core Architecture, Operating Mode, The Battery, etc.
- [ ] All 17 sections present
- [ ] Opening lines render in italic (larger, above prose)
- [ ] Key insights render in gold-border callout boxes
- [ ] Protocol boxes visible with PROTOCOL label
- [ ] Warning Signal boxes visible
- [ ] Proof tags visible as compact footnote
- [ ] No text clipped at page edges
- [ ] No text hidden behind footer zone
- [ ] Page numbers in correct position (bottom-right)
- [ ] No overlapping sections

**Before / After page**
- [ ] Two pairs of Before/After cards visible
- [ ] "Before" label in muted grey, "After" label in gold
- [ ] Both cards readable, not clipped

**Executive Summary page**
- [ ] 6 labelled blocks visible: YOUR CORE ADVANTAGE through THE NEXT LEVEL
- [ ] Gold left-border on each block
- [ ] Content prose readable in each block

**Next Step page**
- [ ] 4 closing pillars visible: TRUST THE SIGNAL, BUILD THE BASE, RESPECT THE CYCLE, HONOR THE SPACE
- [ ] Gold title on each pillar
- [ ] Pillar prose readable

**Closing page**
- [ ] Dark background fills edge-to-edge
- [ ] Gold diamond visible
- [ ] "More than a horoscope. Your private birth code." in italic
- [ ] No blank page after closing

---

## 9. Known limitations

- Local build (`npm run build`) fails due to Node.js 20.12.2 vs required 20.19+ (pre-existing)
- `render_pdf` mode requires `APITEMPLATE_API_KEY` env var and network access to APITemplate.io
- The HTML artifact opens in browser but does not have PDF-lib page number stamps (stamps are applied post-APITemplate)
- Chinese BaZi / Numerology sections in the fixture use placeholder prose; real v4 output will use AI-generated content
- `outputs/` is gitignored; artifact must be regenerated locally with the Vitest command above

---

---

## B4.1 — Visual Regression Patch

**Date:** 2026-06-03
**Phase:** B4.1 — PDF v4.1 Visual Regression Patch

---

### B4.1.1 — What was wrong with the B4 artifact

| Issue | Root Cause |
|---|---|
| Browser date/time header at top | PDF was generated via Chrome Ctrl+P → Save as PDF, not via APITemplate or Puppeteer |
| Document title header at top | Same — Chrome interactive print adds title header by default |
| `file:///...` path at footer | Chrome interactive print footer |
| Browser page counter `2/22` | Chrome interactive print footer |
| Blank page 2 | Chrome's interactive print uses ~12.7mm top/bottom margins → printable area ~271mm. Cover section is `height:297mm` — taller than Chrome's printable area → Chromium double-breaks → blank page 2 |
| Blank/near-empty final page | Same margin issue on closing page |
| No `@page` CSS rule | Without `@page { size: A4; margin: 0 }`, Puppeteer/headless Chromium cannot reliably use `preferCSSPageSize: true` |
| No Client Snapshot page | `renderCoreV4HtmlSafe` did not accept a snapshot argument; fixture had no snapshot data |

**Summary:** The B4 PDF was a manual browser-print artifact, not a headless-rendered PDF. It was never passed through the correct render path (APITemplate or Puppeteer with zero margins + `displayHeaderFooter: false`).

---

### B4.1.2 — What was fixed

| Fix | Files changed |
|---|---|
| Added `@page { size: A4; margin: 0 }` to `globalCss` in `renderCoreV4HtmlSafe` | `src/lib/pdf/template.ts` |
| Added optional `clientSnapshot` parameter to `renderCoreV4HtmlSafe` | `src/lib/pdf/template.ts` |
| Added Client Snapshot page rendering (matches v3 snapshot design) | `src/lib/pdf/template.ts` |
| Added `V4ClientSnapshot` interface | `src/lib/pdf/template.ts` |
| Updated fixture: client name → "Dmitry", added `FIXTURE_CLIENT_SNAPSHOT` | `src/lib/pdf/generate-v4-artifact.test.ts` |
| Updated artifact generator to pass snapshot to renderer | `src/lib/pdf/generate-v4-artifact.test.ts` |
| Created Puppeteer-based PDF generator script | `scripts/generate-v4-pdf.mjs` |
| Added `generate:html` and `generate:pdf` npm scripts | `package.json` |
| Added 10 new B4.1 tests (snapshot, @page, blank-page guard) | `src/lib/pdf/template.v4.test.ts` |
| Installed `puppeteer-core` as devDependency | `package.json` |

---

### B4.1.3 — How the new PDF was generated

**Step 1 — Generate HTML:**
```bash
npx vitest run src/lib/pdf/generate-v4-artifact.test.ts
# or: npm run generate:html
```
Output: `outputs/pdf-v4.1-core-diagnostic.html`

**Step 2 — Generate PDF:**
```bash
node scripts/generate-v4-pdf.mjs
# or: npm run generate:pdf
```
Output: `outputs/pdf-v4.1-core-diagnostic.pdf`

The PDF generator uses:
- `puppeteer-core` pointing to system Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`)
- `page.setContent(html)` — no `file://` URL in the PDF
- `page.pdf({ printBackground: true, displayHeaderFooter: false, preferCSSPageSize: true, margin: {0} })`
- `pdf-lib` to stamp `Darrow Code · NN` on pages 2..N-1 after print

---

### B4.1.4 — B4.1 artifact summary

| Property | Value |
|---|---|
| Path | `outputs/pdf-v4.1-core-diagnostic.pdf` |
| Size | 134.6 KB |
| Pages | 21 |
| Browser date/time header | **NONE** (`displayHeaderFooter: false`) |
| Browser title header | **NONE** |
| `file:///` footer | **NONE** (`setContent` not file path) |
| Browser page counter | **NONE** |
| Page 1 | Cover (dark, gold) |
| Page 2 | Method & Orientation (content page, not blank) |
| Page 3 | Client Snapshot |
| Pages 4–19 | 17 body sections (Orientation through Next Step) |
| Page 20 | Closing pillar (Next Step continued or closing section) |
| Page 21 | Closing dark page |
| Trailing blank page | **NONE** |
| Footer stamps | `Darrow Code · NN` on pages 2..20 |

---

### B4.1.5 — Visual baseline comparison

| Dimension | Old reference PDF (render-only-2026-06-02) | Rejected B4 PDF | New B4.1 PDF |
|---|---|---|---|
| Browser headers/footers | None | ❌ Present | ✅ None |
| Date/time at top | None | ❌ Present | ✅ None |
| File path at bottom | None | ❌ Present | ✅ None |
| Browser page counter | None | ❌ Present | ✅ None |
| Page 2 | Method & Orientation (content) | ❌ Blank | ✅ Method & Orientation |
| Client Snapshot | Page 3 (present) | ❌ Missing | ✅ Page 3 (present) |
| Darrow footer numbering | `Darrow Code · NN` | ❌ Browser counter | ✅ `Darrow Code · NN` |
| Cover | Full-bleed dark | Distorted by margins | ✅ Full-bleed dark |
| Closing page | Full-bleed dark | Distorted + extra blank | ✅ Full-bleed dark |
| Trailing blank | None | ❌ Present | ✅ None |
| Content density | Rich | Degraded by blank pages | ✅ Restored |
| Generation path | APITemplate (server) | ❌ Chrome Ctrl+P | ✅ Puppeteer (local) |

**Note:** The reference PDF was used as a visual baseline only. It was not committed and no personal content was copied from it.

---

### B4.1.6 — Guardrail confirmations

| Guardrail | Status |
|---|---|
| v3 production path (`renderReportHtmlSafe` v3 branch) | ✅ Untouched |
| `system-prompt.ts` | ✅ Untouched |
| `generateDarrowReport` production pipeline | ✅ Untouched |
| Stripe / checkout / prices | ✅ Untouched |
| Email sending / Resend | ✅ Untouched |
| Supabase schema / migrations / RLS | ✅ Untouched |
| Token / download routes | ✅ Untouched |
| AI generation (Anthropic calls) | ✅ Not called |
| SEO metadata / footer / favicon / brand assets | ✅ Untouched |
| Production NOT switched to v4.1 | ✅ Confirmed |
| Reference PDF committed | ✅ NOT committed |
| Diagnostic PDF persisted to Supabase | ✅ NOT persisted |

---

### B4.1.7 — Test results

| Command | Result |
|---|---|
| `npx tsc --noEmit` | ✅ Clean (0 errors) |
| `npx vitest run` (all 8 test files) | ✅ 258/258 passed (+10 new B4.1 tests) |
| `npx vitest run src/lib/pdf/` | ✅ 115/115 passed |
| `npm run generate:html` | ✅ HTML artifact generated |
| `npm run generate:pdf` | ✅ PDF generated (21 pages, 134.6 KB) |
| `npm run build` | ❌ Node.js 20.12.2 < required 20.19+ (pre-existing, unrelated) |

---

### B4.1.8 — Known limitations

- `npm run build` still fails due to Node.js 20.12.2 vs required 20.19+ (pre-existing)
- The Puppeteer script requires system Chrome; if Chrome is not at the expected path, set `CHROME_PATH` env var
- PDF page number stamps are applied locally (not via APITemplate); visual result is identical to production stamping
- The `outputs/` directory is gitignored — artifacts must be regenerated locally
- No page count validation after prune (the local script does not run `pruneBlankPages` — APITemplate's production path handles that server-side; locally the HTML produces no blank overflow pages with zero-margin Puppeteer rendering)

---

### B4.1.9 — Next visual QA checklist

Open `outputs/pdf-v4.1-core-diagnostic.pdf` (not the HTML) for final visual check.

- [ ] No date/time or file path visible on any page
- [ ] No browser page counter visible on any page
- [ ] Page 1: dark cover, gold diamond, "The Personal Architecture Report", "Prepared for Dmitry"
- [ ] Page 2: Method & Orientation — content page, not blank
- [ ] Page 3: Client Snapshot — pattern name, core pattern, 5 bullet labels
- [ ] Pages 4+: 17 body sections with correct headings
- [ ] Footer stamp `Darrow Code · NN` visible bottom-right on pages 2..20
- [ ] No stamp on page 1 (cover) or page 21 (closing)
- [ ] Page 21: dark closing page, gold diamond, italic tagline
- [ ] No blank page after page 21
- [ ] Protocol boxes visible (gold left border)
- [ ] Warning Signal boxes visible (grey left border)
- [ ] Before/After pairs visible with labels
- [ ] Executive Summary: 6 gold-bordered blocks
- [ ] Next Step: 4 titled pillar blocks

---

---

## B4.1 Reference Comparison — phe.pdf

**Date:** 2026-06-03
**Phase:** B4.1-R — diagnostic baseline calibration against a stronger reference report.

A third-party psychological astrology report (`phe.pdf`) was used as a **density /
completeness / professional-feel benchmark only**. It was **not** committed, **not**
persisted to Supabase, **not** used in production, and **none of its text, structure,
or design was copied**. It is referenced here solely to describe the quality gap.

### What phe.pdf does better

- Dense, professional finished-report feeling (~4× the text of the current v4.1 diagnostic for a similar page count).
- A Contents / section map up front.
- Rich multi-paragraph sections — each chapter is several full paragraphs.
- Many named subheadings inside each chapter (e.g. one chapter carries 8 distinct subsections).
- A visible "Astrological Data Used for the Analysis" appendix (planets, houses, aspects) that signals the reading is based on real calculated data.
- Strong page economy — pages are consistently filled.

### What the current v4.1 diagnostic lacked (before this patch)

- Too little content per section (often 1–3 paragraphs / ~150 words).
- Sparse proof anchors — `proof_tags` populated in only 2 of 17 sections.
- No equivalent of a "data used for analysis" appendix.
- Repetitive callout/box style — every section reused the same gold box treatment.
- Not enough section-level visual variation.
- Not enough perceived analytical depth / "based on real calculated data" feeling.

### Updated diagnosis

This is **not only** a weak-fixture problem. It is **also** a CORE content-pattern
requirement that belongs to **B5**. B4.1-R improves the diagnostic fixture and adds
renderer support (visible anchors + a diagnostic data appendix) so the layout can be
tested at realistic density — but the real production content calibration (section
depth, subsection strategy, per-section proof pattern) is deferred to B5.

> **phe.pdf is a benchmark only, not a copy source.**

### What B4.1-R changed (small, diagnostic-only)

| Change | Where |
|---|---|
| `PROOF_STANDALONE_STYLE` + `renderProofAnchorStrip` — visible "ANCHORED IN" chip strip replacing the near-invisible 8pt grey proof line | `src/lib/pdf/template.ts` |
| `DiagnosticAnchors` interface + optional 4th param to `renderCoreV4HtmlSafe` + "Data & Reference Anchors" appendix page (render-only) | `src/lib/pdf/template.ts` |
| `proof_tags` added to all standard sections (no prose rewrite) | `src/lib/pdf/generate-v4-artifact.test.ts` |
| `FIXTURE_DIAGNOSTIC_ANCHORS` sample (birth data, systems, anchors, disclaimer) | `src/lib/pdf/generate-v4-artifact.test.ts` |
| 8 new tests (anchor strip + appendix) | `src/lib/pdf/template.v4.test.ts` |

The "Data & Reference Anchors" page is **diagnostic-only**: it is not part of the
production CoreV4 schema, never produced by AI, and uses clearly-labelled sample data.

### Updated artifact (B4.1-R)

| Property | Value |
|---|---|
| Path | `outputs/pdf-v4.1-core-diagnostic.pdf` |
| Pages | 22 (added the Data & Reference Anchors appendix) |
| Size | ~156 KB |
| Browser headers/footers | None |
| Blank pages | None |
| Proof anchors | Visible in every applicable section + appendix |
| Footer numbering | `Darrow Code · NN` (pages 2..21) |

---

## B5 — CORE Content Pattern Calibration (planning)

B4.1-R is intentionally limited to the diagnostic renderer + fixture. The real
production-quality work is **B5**, which must address:

- **Production CORE text depth** — calibrate the actual generated section length, not just the fixture.
- **Minimum section density** — define a floor (e.g. target word range) per section type.
- **Subsection strategy** — allow longer chapters to carry named subsections (closer to phe.pdf's structure, without copying it).
- **Proof / reference anchors in every section** — make `proof_tags` (or equivalent) a required, populated field in production output.
- **Data appendix / reference page** — decide whether a real "Data & Reference Anchors" page enters the production schema, sourced from genuine calculated inputs.
- **Reduced repetition** — vary visual + structural treatment so sections do not all look identical.
- **Stronger human-readable recognition effect** — prioritise the "this is clearly about me" feeling.

B5 hard constraints (unchanged):

- No overpromising.
- No medical / legal / financial claims.
- No copying from reference reports (phe.pdf or any other).
- B5 is where `system-prompt.ts` / AI prompt changes happen — **not** before.

---

## 10. Next recommended steps

**A) Inspect generated HTML artifact**
Open `outputs/pdf-v4.1-core-diagnostic.html` in Chrome or Edge. Use print preview to simulate A4 layout. Check the visual QA checklist above.

**B) Request render_pdf if visual check passes**
POST to `/api/public/debug/core-v4-render` with `mode: "render_pdf"` and a real v4 `core_json` from the generate_json mode of `/api/public/debug/core-v4-run`. This will produce a PDF via APITemplate with full page number stamps and blank-page pruning.

**C) Patch if layout issues found**
If any rendering issues are visible (clipping, blank pages, wrong background), open a targeted B4-patch request describing the exact issue and which page/section it occurs on.

**D) Production switch in a separate explicit phase**
After the PDF renders cleanly and is approved visually, switch production from v3 to v4.1 in a separate phase with explicit approval. That phase will update `system-prompt.ts` and the production pipeline. Do not do this in B4.
