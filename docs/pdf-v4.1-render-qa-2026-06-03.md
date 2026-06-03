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

## B4.1-R — Reference Baseline (correction)

**Date:** 2026-06-03
**Phase:** B4.1-R — realign the diagnostic to the correct Darrow baseline.

### Primary baseline

The **primary Darrow visual + content-density baseline** is the previous Darrow
render-only report:

> `render-only-2026-06-02T09-20-00-731Z.pdf`

This is a real Darrow report produced by the **same renderer family** as the diagnostic.
It is the target. It establishes:

- Darrow Code branded cover.
- Method & Orientation as page 2.
- Client Snapshot page (archetype, primary strength, pressure point, best rhythm, current timing, practical focus).
- Rich CORE sections — 4–5 full paragraphs each, not thin placeholders.
- **Per-section proof anchors** rendered as a thin grey evidence line at the tail of each section (the existing `PROOF_EVIDENCE_STYLE`), with **specific** chart data (placements, house numbers, orbs, BaZi pillars, numerology numbers).
- Descriptive protocol titles (e.g. `PROTOCOL · ENVIRONMENT BEFORE STRATEGY`).
- Scenario-based warning signals.
- Darrow footer numbering (`Darrow Code · NN`).
- No browser print headers/footers, no `file://` footer, no Chrome page counter, no blank pages.

### phe.pdf is demoted

`phe.pdf` (a third-party Liz Greene report) is **only an optional external benchmark**
for generic density/completeness feeling. It is **not** the Darrow pattern. Its text,
structure, and design are **not** copied or followed. It is **not** committed and **not**
persisted to Supabase.

### Key realisation

The renderer was already capable — the primary baseline proves it. The gap is purely
**content** (density + anchor specificity), which belongs to **B5**. Two earlier B4.1-R
additions were modelled on `phe.pdf` and **diverged** from the true Darrow baseline, so
they were **reverted**:

| Reverted | Why |
|---|---|
| "ANCHORED IN" chip strip (`PROOF_STANDALONE_STYLE` + helper) | The baseline uses the thin grey per-section evidence line, not chips. Restored `PROOF_EVIDENCE_STYLE` for standalone proof. |
| "Data & Reference Anchors" appendix page (`DiagnosticAnchors` + 4th param) | The baseline has **no** data-appendix page; it distributes anchors per-section instead. Removed. |

### What B4.1-R keeps (small, diagnostic-only)

| Kept | Where |
|---|---|
| `@page { size: A4; margin: 0 }` + Puppeteer PDF path (no print artifacts, no blank pages) | `src/lib/pdf/template.ts`, `scripts/generate-v4-pdf.mjs` |
| Optional `clientSnapshot` param + Client Snapshot page | `src/lib/pdf/template.ts` |
| `proof_tags` populated in all standard fixture sections (rendered as the baseline grey evidence line) | `src/lib/pdf/generate-v4-artifact.test.ts` |
| Tests realigned to baseline (grey anchor line; no chips; no appendix) | `src/lib/pdf/template.v4.test.ts` |

### Updated artifact (B4.1-R, realigned)

| Property | Value |
|---|---|
| Path | `outputs/pdf-v4.1-core-diagnostic.pdf` |
| Pages | 21 (appendix removed) |
| Size | ~135 KB |
| Browser headers/footers | None |
| Blank pages | None |
| Proof anchors | Thin grey per-section evidence line (baseline style) |
| Footer numbering | `Darrow Code · NN` (pages 2..20) |

> Anchor **specificity** (real placements/orbs/pillars) and **section depth** are still
> placeholder-level in the fixture. Calibrating those to the primary baseline is **B5**.

---

## B4.1-R — Representative section enrichment

**Date:** 2026-06-03

### Root cause (confirmed): fixture-only

A full trace of `renderCoreV4HtmlSafe` / `v4StandardSection` / `renderProseBlocks`
confirmed the renderer does **not** truncate, slice, summarise, or drop content. Every
`slice` only separates the first paragraph to keep it with the heading; all prose blocks
render and paginate naturally (sections carry no `break-inside:avoid`). The compression
was entirely the **fixture**: ~100 words/section vs the baseline's ~400–500.

> If real production CORE content were passed, the renderer would preserve it in full.

### What was enriched (4 representative sections only)

To prove the renderer handles baseline-density Darrow content, **4** sections were
enriched using the canonical internal sample **`docs/DARROW_CORE_SAMPLE_REPORT_v4_1.md`**
(the "GOLD REFERENCE" Dmitry sample behind `render-only-2026-06-02T09-20-00-731Z.pdf`):

1. **Client Snapshot** — "Deep Water Architect" archetype + richer core pattern / unique signature + 5 labelled bullets.
2. **Core Architecture** — opening_line + 5 paragraphs + `PROTOCOL · Read the Room First` + specific anchors (`Sun conjunct ASC 0°43' · Moon conjunct ASC 7°13' · Gui Water DM Peak · Water Dominant 59% · Cancer Stellium`). Spans 2 pages — pagination verified.
3. **The Battery** — longer prose + one protocol + one warning + specific anchors.
4. **Executive Summary** — canonical 6-block synthesis (no proof tags, matching the baseline).

The remaining **13** sections keep their thin placeholder prose and generic anchors
(`Saturn`/`Earth`/`Capricorn` frame), which are **inconsistent** with the canonical
Cancer/Gui-Water frame of the 4 enriched sections. **Aligning all 17 to one chart and
to baseline density is B5** — not done here.

### Repeated-label rule (fixture presentation only)

To avoid identical stacked block labels on one page (the "schema-fields-dumped" look),
applied at the **fixture** level (renderer untouched — it is shared with production v3):
- Battery folds the baseline's three "Recharge" protocols into prose + **one** protocol block.
- `shadow_and_friction` trimmed from two warning blocks to one.
- Result: across the whole document, no page stacks two identical `PROTOCOL` or `Warning Signal` labels.

### Artifact (B4.1-R enriched)

| Property | Value |
|---|---|
| Path | `outputs/pdf-v4.1-core-diagnostic.pdf` |
| Pages | 23 (enriched Core Architecture + Battery paginate across pages) |
| Size | ~154 KB |
| Browser headers/footers | None |
| Blank pages | None |
| Content | No truncation/summarisation/dropping — renderer preserves full input |
| Proof anchors | Visible thin grey per-section evidence line; now specific in enriched sections |
| Footer numbering | `Darrow Code · NN` (pages 2..22) |

Source `render-only-2026-06-02T09-20-00-731Z.pdf` is the **primary internal Darrow
baseline**; `phe.pdf` remains a generic external benchmark only. Neither is committed.

---

## B5 — CORE Content Pattern Calibration (planning)

B4.1-R is intentionally limited to the diagnostic renderer + fixture. The real
production-quality work is **B5**, which must address:

Target = the primary baseline `render-only-2026-06-02T09-20-00-731Z.pdf`.

- **Production CORE text depth** — calibrate generated sections to ~4–5 paragraphs each, matching the baseline (not the thin fixture).
- **Minimum section density** — define a floor (target word range) per section type.
- **Specific per-section proof anchors** — populate `proof_tags` with **real** chart data (placements, house numbers, orbs, BaZi pillars, numerology numbers), as the baseline does — not generic tags. Rendered as the existing thin grey evidence line.
- **Descriptive protocol titles + scenario-based warnings** — match the baseline's `PROTOCOL · NAME` titles and concrete "you notice X" warning scenarios.
- **Reduced repetition** — vary structural treatment so sections do not all look identical.
- **Stronger human-readable recognition effect** — prioritise the "this is clearly about me" feeling the baseline achieves.

B5 hard constraints (unchanged):

- No overpromising.
- No medical / legal / financial claims.
- No copying from reference reports. The Darrow target is the prior Darrow render-only report; `phe.pdf` is only a generic external benchmark and must not be copied.
- B5 is where `system-prompt.ts` / AI prompt changes happen — **not** before.

---

## B5.0 — Knowledge/Docs Audit + Full Diagnostic Fixture Alignment

**Date:** 2026-06-03

### Knowledge / docs audit — completed (no blockers)

Audited the canonical v4.1 package and knowledge base. The source of truth is
**coherent**: `SOURCE_OF_TRUTH_v4_1.md` (+ `DARROW_DOCS_AUDIT_AND_PLAN`) governs;
`MASTER_PATTERN` + `module_spec` define structure; `CONTENT_STANDARD` is the quality
layer; `SAMPLE_REPORT` is the gold text; `schema_template_patch` (future planning)
confirms the renderer's field model + locked labels. The committed render-only PDF is
an internal **visual/density baseline only**, not the structural authority.

### Source-of-truth map + content contract — created

- `docs/core-v4.1-source-of-truth-map.md` — canonical/reference/legacy classification,
  per-concern authority table, **conflicts + resolutions**, and a **Data Layer /
  FreeAstroAPI Availability Map** (Western / BaZi / numerology availability, POS
  identity payload, future/deferred, must-not-use, proof-anchor + birth-time rules).
- `docs/core-content-pattern-v4.1.md` — concise operational content contract
  (structure, per-section density, anchor rules, block rules, voice, safety, locked
  labels, B5.1 note).

### All 17 diagnostic sections aligned — completed

`src/lib/pdf/generate-v4-artifact.test.ts` was rewritten so **all 17 generated CORE
sections** follow **one coherent chart** (the canonical gold-sample Dmitry frame:
Cancer Sun/Moon/Mercury/rising · Gui Water Day Master · Bundle shape). The previous
mixed rich/thin hybrid (4 rich Cancer sections + 13 thin generic Saturn/Earth
placeholders) is gone. Text is transcribed from the internal gold sample
`DARROW_CORE_SAMPLE_REPORT_v4_1.md` (safe internal diagnostic data).

Conflicts resolved (see source-of-truth map §7): gold MD (Cancer ASC) wins over
render-only PDF (Gemini ASC) as text authority; Client Snapshot = POS identity-card
payload (supplied metadata, **not** an 18th key); Battery folds 3 recharge protocols
into prose + 1 block per the repeated-label rule.

### Artifact (B5.0)

| Property | Value |
|---|---|
| Path | `outputs/pdf-v4.1-core-diagnostic.pdf` |
| Pages | 25 |
| Size | ~185 KB |
| Rendered words (incl. snapshot/method/closing) | ~5,860 |
| Browser headers/footers | None |
| Blank pages | None |
| Truncation / dropped content | None (renderer preserves full input) |
| Proof anchors | Visible, specific, one coherent chart; ≤5 per section |
| Repeated identical labels stacked on a page | None (each section ≤1 protocol; 3 warnings across 3 separate sections) |
| Footer numbering | `Darrow Code · NN` (pages 2..24) |

### Scope confirmations

- Renderer **untouched** (it was confirmed not the bottleneck in B4.1-R).
- Production remains **v3**, untouched. Not switched to v4.1.
- `system-prompt.ts`, AI prompts, Stripe, checkout, prices, email, Supabase, token
  routes, SEO/footer/favicon — **untouched**.
- `operating_mode` remains migration-gated for production; included in the
  **diagnostic** fixture only, consistent with the gold sample.
- Reference PDFs not modified. No FreeAstroAPI call, no provider/runtime change.

### Known limitations / next

- The diagnostic represents the **full-quality case** (`birth_time_known=true`, full
  name, BaZi available). Production must drop house/angle anchors when birth time is
  unknown (rule recorded in the data-layer map §9.6–9.7).
- The diagnostic renders the 17 generated sections + Cover + Method/Orientation +
  Closing (~25pp); the full 26-page production layout (static Library + Back Cover
  pages) is a later **template** phase, not B5.0.

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
