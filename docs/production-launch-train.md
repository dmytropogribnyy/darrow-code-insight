# Production Launch Train

**Mode:** launch-train · **Updated:** 2026-06-06 · **Type:** planning doc (docs-only)

The single practical plan to ship Darrow Code with **CORE + LOVE + MONEY + BODY + YEAR + STYLE +
PLACE + CORE Complete**. Organizes remaining work into the fewest coherent phases with clear
acceptance gates. Preserves safety, secrets, and production constraints.

## Source of truth (locked)

- Provider/raw-data layer **verified** (DATA-AUDIT-1) · per-module contracts authored
  (MODULE-PATTERN-1, [`module-content-contracts.md`](module-content-contracts.md)).
- Production = **CORE v3**. CORE v4.1 is **staged only** (no production switch in this train).
- **BUNDLE-B/C is the main P0 delivery blocker** (separate PDFs per module).
- Colors/stones = **gated / do_not_claim**; Japanese astrology / astrocartography /
  compatibility = **not_implemented** — unchanged unless a verified source + approval is added.
- Out of scope for this train: Darrow Companion, subscriptions, new products, CORE v4.1 prod switch.

## 🚦 Public-sale gate (non-negotiable)

**CORE Complete / any bundle must NOT be sold publicly until:** BUNDLE-B + BUNDLE-C are shipped
**and** STRIPE-E2E-1 passes **and** the add-on content track passes — **MATERIAL-PACK-1**
(production material packets) → MODULE-PROMPT-1 → MODULE-DIAG-1 → ANCHOR-AUDIT-1. **Single-report**
purchases (CORE only, or one chapter) may go live earlier once Phase 1–2 + secrets are verified.

**Module work order:** MODULE-PATTERN-1 ✅ done → **MATERIAL-PACK-1** (per-module report
context/material builder) → MODULE-PROMPT-1 (staged prompts/schemas consume packets) →
MODULE-DIAG-1 (real generation + PDF QA) → ANCHOR-AUDIT-1 (validate output vs packets/anchors).

## Critical path & parallelization

```
P1 OPS-LEGAL-2-live ─┐
P2 STRIPE-E2E-1 ─────┴─► (single-report launch OK) ─► P3 BUNDLE-B ─► P4 BUNDLE-C ─► P5 BUNDLE-D
                                                          │
P6 MATERIAL-PACK-1 ─► P7 MODULE-PROMPT-1 ─► P8 MODULE-DIAG-1 ─► P9 ANCHOR-AUDIT-1  (content track)
                                                          │
                          P3..P9 complete ─► P10 Final launch hardening ─► PUBLIC LAUNCH (bundles)
```
- **Parallel A (delivery):** P1, P2 → P3 → P4 → P5.
- **Parallel B (content quality):** P6 → P7 → P8 → P9 (touches material builder / prompts / schema
  / diagnostics — mostly different files than the delivery track, so it can run alongside P3–P5).
  **The module material/raw layer (P6) must be production-ready before module prompts (P7) are
  trusted.**
- P10 depends on both tracks.

---

## Phase 1 — OPS-LEGAL-2-live (support verification)

- **Objective:** confirm the `report_ref` migration applied in Supabase and `support:report`
  works on a real/test order.
- **Type:** verification-only (no code change expected).
- **Files likely touched:** none (verification); at most a docs note.
- **Implementation notes:** confirm in Supabase dashboard — `reports.report_ref` column, unique
  index `reports_report_ref_key`, `set_report_ref()` function, `trg_set_report_ref` trigger,
  backfill. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (user-side). Run
  `SUPPORT_EMAIL=… npm run support:report`.
- **Acceptance:** support summary returns a real/test order with payment/generation/PDF/email
  status + recommended action; `report_ref` present.
- **Tests/checks:** `npm run support:report` (read-only); existing support tests green.
- **Rollback/safety:** read-only; nothing to roll back. Never print/commit the service-role key.
- **Dependencies:** needs a real/test order (overlaps P2). **Parallel with P2.**
- **Must NOT change:** schema, pipeline, checkout, prompts.

---

## Phase 2 — STRIPE-E2E-1 (test-mode end-to-end)

- **Objective:** prove checkout → generation → email → download works end-to-end in **Stripe
  test mode** for a single-report purchase (CORE-only) and one focused chapter.
- **Type:** verification-only (approved Stripe **test-mode** + real generation allowed here).
- **Files likely touched:** none expected; bug fixes only if a break is found (then it becomes a
  scoped code phase with its own review).
- **Implementation notes:** use Stripe **test** keys; place a test order to a controlled email;
  confirm `orders.status=paid` → generation `complete` → `pdf_url` set → report-ready email sent
  (Reply-To = thedarrowcode@gmail.com) → download link works. Verify against `support:report`.
- **Acceptance:** one CORE test order + one chapter test order each reach `complete` + delivered;
  `support:report` shows green; PDF opens.
- **Tests/checks:** `support:report`; manual PDF open; webhook/event log clean.
- **Rollback/safety:** **test mode only** — no live charges, no real customer data. Do not issue
  real refunds. Do not commit secrets.
- **Dependencies:** secrets present (Anthropic/Resend/Supabase/FreeAstroAPI confirmed in Lovable).
  **Parallel with P1.**
- **Must NOT change:** prices, checkout UX, prompts (unless fixing a confirmed break, reviewed
  separately).

---

## Phase 3 — BUNDLE-B (separate report units / one PDF per module) **[P0]**

- **Objective:** one paid purchase → **N report units**, one PDF + download_token + report_ref
  per selected module; grouped by Stripe session. (See
  [`bundle-separate-reports-plan.md`](bundle-separate-reports-plan.md).)
- **Type:** **schema + pipeline (production-affecting)** — the core of the train.
- **Files likely touched:** `supabase/migrations/<new>.sql` (add `reports.module_code`
  nullable + per-module rows); `src/lib/generation/pipeline.server.ts` (loop per module: render →
  PDF → upload → row + status); `src/lib/pdf/template.ts` (per-module render, split out of
  `renderReportHtmlSafe`); `src/lib/ai/user-prompt.ts` (per-module call vs single emit — staged
  prompts from P6 land here); `src/lib/support/*` (report_ref per module, list N per purchase);
  `scripts/generate-*` as needed.
- **Implementation notes:** keep legacy combined reports valid (do not retro-split). New purchases
  create one `reports` row per `module_code` with own pdf/token/status/report_ref
  (`DC-YYYYMMDD-####-MODULE`). Build behind a flag / alongside the current flow until verified.
  `generation_jobs`: per-module job or one job tracking N reports.
- **Acceptance:** a bundle purchase creates N report rows + N PDFs + N tokens; CORE-only purchase
  unchanged; legacy combined reports still download; `support:report` lists all N.
- **Tests/checks:** new unit/integration tests (per-module creation, grouping, back-compat) with
  **mocks** (no real AI/Stripe); `npx tsc --noEmit`; full vitest.
- **Rollback/safety:** flag-gated; legacy path intact; migration is additive (nullable column).
  Roll back = disable flag. No price/checkout change.
- **Dependencies:** P1/P2 verified. Per-module generation consumes **P6 material packets + P7
  staged prompts** (can stub first).
- **Must NOT change:** prices, checkout UX, the combined-PDF legacy behavior, CORE v3 generation
  logic beyond per-module wiring.

---

## Phase 4 — BUNDLE-C (email + result/download page lists all PDFs) **[P0]**

- **Objective:** one report-ready email lists **all** generated PDFs (separate secure links); the
  result/download page lists every report for the purchase.
- **Type:** code (production-affecting; email + routes).
- **Files likely touched:** `src/lib/email/resend.server.ts` (`reportReadyEmail` → multi-link);
  `src/routes/api/public/jobs/process-generation.ts` / `resend-ready-email.ts`;
  download/result route components.
- **Implementation notes:** group by `orders.stripe_session_id` / `intake_id`; one email with N
  links (or per-report links); result page enumerates reports + report_refs. Reuse existing
  Reply-To/from config.
- **Acceptance:** a bundle delivers one email listing all chapter PDFs; result page shows all
  reports with report_ref; single-report path unchanged.
- **Tests/checks:** email-render unit tests (no send); route tests; manual test-mode send to a
  controlled address (no real customers).
- **Rollback/safety:** revert to single-link email; no live customer sends during testing.
- **Dependencies:** **P3** (needs per-module reports).
- **Must NOT change:** prices, checkout, refund FAQ; do not email real customers in testing.

---

## Phase 5 — BUNDLE-D (per-report support regenerate/resend)

- **Objective:** support can regenerate/resend a single module report by `report_ref`, no re-pay.
- **Type:** code (support tooling + existing job routes).
- **Files likely touched:** `src/lib/support/*` (per-report actions); reuse
  `/api/public/jobs/resend-ready-email` + generation retry; optional `support:report` action flags.
- **Implementation notes:** regenerate one module (new attempt, preserve history), update its PDF
  on success, resend its link; never re-charge.
- **Acceptance:** regenerate `DC-…-MODULE` affects only that module; resend works without
  regeneration when PDF exists; attempt history preserved.
- **Tests/checks:** unit tests with mocks; no real AI/Stripe.
- **Rollback/safety:** support-triggered only; no public route; idempotent; no auto-refunds.
- **Dependencies:** **P3** (per-module reports).
- **Must NOT change:** add a public admin route; auto-refund.

---

## Phase 6 — MATERIAL-PACK-1 (per-module Report Context / material builder) **[required before P7]**

- **Objective:** a **production-grade per-module material packet system** so every module receives
  *only* the raw/derived data, interpretive material, availability flags, fallback rules,
  proof-anchor candidates, and safety boundaries allowed by
  [`module-content-contracts.md`](module-content-contracts.md). **Prompts/schemas alone are not
  enough — the raw/material layer must be production-ready first.**
- **Type:** code (production builder; may be wired in P10 / per-module generation). Reuses the
  diagnostic prototype but production use must be explicit, tested, and safe.
- **Files likely touched:** new `src/lib/report-context/` (e.g. `buildReportContextForModule.ts`)
  reusing `src/lib/diagnostics/material-context/*` (`availability.ts`, `material-readiness.ts`);
  `src/lib/numerology/numerology-meanings.ts` (read); tests alongside. **Not** wired into the
  active pipeline in this phase unless explicitly gated + tested.
- **Per-module packet (CORE, LOVE, MONEY, BODY, YEAR, STYLE, PLACE) must define:**
  selected module · customer basics · birth data · normalized `DarrowChartData` / FreeAstroAPI
  output · required raw data · optional enrichment **only when available** · missing-data /
  fallback status · allowed proof-anchor candidates · forbidden anchors · forbidden claims ·
  numerology meanings when applicable · **BaZi only when `bazi.available=true`** · **houses/angles
  only when `birth_time_known=true`** · **name numerology only when full name present** · **YEAR
  timing only when available and `personal_year` matches** · **colors/stones excluded** unless a
  verified dictionary is approved · **Japanese astrology / astrocartography / compatibility remain
  `not_implemented`**.
- **Implementation notes:** deterministic assembly from the verified provider layer + contracts;
  emit a debuggable record of exactly which material packet was used per report (for logs/QA).
  Do not invent data; do not add unsupported dictionaries.
- **Acceptance:** no module prompt receives unsupported data · no module can cite anchors absent
  from the chart · explicit fallback for missing birth time / full name / `bazi_sex` / unavailable
  transits/solar/BaZi-flow · generation can log/debug the packet used.
- **Tests/checks:** ≥6 cases — (1) full data, (2) no birth time, (3) no full name, (4) missing
  `bazi_sex`, (5) module-specific forbidden claims, (6) YEAR timing mismatch / unavailable timing.
  `npx tsc --noEmit`; full vitest. **No AI/Stripe/FreeAstroAPI call** (uses synthetic/normalized input).
- **Rollback/safety:** builder is pure + isolated; not wired to production until explicitly gated.
  Roll back = remove the module wiring. Do not invent colors/stones/Japanese/astrocartography/
  compatibility data; keep gated sources gated.
- **Dependencies:** MODULE-PATTERN-1 (done) + DATA-AUDIT-1 (done). **Parallel with P3–P5.**
  **Feeds P7** (prompts consume packets) and per-module generation in P3.
- **Must NOT change:** production `buildUserPrompt`/pipeline (no live wiring here); gated sources;
  add unsupported dictionaries.

---

## Phase 7 — MODULE-PROMPT-1 (staged add-on prompts/schemas)

- **Objective:** convert [`module-content-contracts.md`](module-content-contracts.md) into
  **staged** prompts + schemas for LOVE/MONEY/BODY/YEAR/STYLE/PLACE that **consume the
  MATERIAL-PACK-1 packets**, mirroring CORE v4.1's per-section structured fields.
- **Type:** code (**staged**, NOT wired to production generation).
- **Files likely touched:** `src/lib/ai/user-prompt.ts` (per-module builders, staged),
  `src/lib/ai/schema.ts` (per-module Zod schemas), `src/lib/ai/diagnostics/*`.
- **Implementation notes:** follow the contracts exactly — allowed/forbidden data, fallbacks,
  proof anchors, safety, do-not-claim. Keep colors/stones gated. Staged builders only; production
  path untouched until MODULE-DIAG-1 approval.
- **Acceptance:** each module has a staged prompt builder + schema; schema/lints pass; no
  production prompt changed.
- **Tests/checks:** schema unit tests; structure/lints; `npx tsc --noEmit`. **No AI call.**
- **Rollback/safety:** staged/isolated; production generation unaffected. Roll back = delete staged
  builders.
- **Dependencies:** **P6 (MATERIAL-PACK-1)** + MODULE-PATTERN-1 (done). **Parallel with P3–P5.**
  Feeds P3 (per-module gen).
- **Must NOT change:** production `buildUserPrompt`, CORE v3/v4 active behavior, gated sources.

---

## Phase 8 — MODULE-DIAG-1 (real generation + PDF QA for add-ons)

- **Objective:** generate each add-on once via an **approved** diagnostic run; visual PDF QA;
  calibrate length/tone.
- **Type:** verification (approved AI diagnostic, like B5.2 CORE diagnostic).
- **Files likely touched:** `src/lib/ai/diagnostics/*` (per-module diagnostic runners),
  fixtures; outputs to gitignored `outputs/`.
- **Implementation notes:** reuse the CORE diagnostic CLI pattern (plan-only default; approved run
  with explicit flag + key). Synthetic/controlled input. Anchor checks per module (from P8).
- **Acceptance:** each add-on produces a schema-valid, on-length, on-tone report + a clean PDF;
  no forbidden claims; gating respected.
- **Tests/checks:** diagnostic runners; PDF visual review; no real customer data.
- **Rollback/safety:** diagnostic-only; outputs gitignored; uses tokens (approved). No production
  change.
- **Dependencies:** **P7** (and P6 packets). **Parallel with delivery track.**
- **Must NOT change:** production pipeline/prompts; do not switch add-ons live here.

---

## Phase 9 — ANCHOR-AUDIT-1 (per-module proof/data validation)

- **Objective:** extend B5.3-A anchor validation to every module (positive + forbidden checks).
- **Type:** code (diagnostic/validation, like core-v4-anchors).
- **Files likely touched:** `src/lib/ai/diagnostics/core-v4-anchors.ts` → per-module anchor rules;
  per-module validation tests.
- **Implementation notes:** per module — validate generated output **against the MATERIAL-PACK-1
  packet** (only allowed anchors used; no anchor absent from the chart): forbidden BaZi when
  unavailable, forbidden house/angle without birth time, forbidden name-numerology without name,
  Personal-Year match (YEAR), no city names (PLACE), no colors/stones (STYLE), no medical (BODY),
  no compatibility (LOVE).
- **Acceptance:** each module's generated diagnostic passes its anchor validation against its
  packet; violations fail loud.
- **Tests/checks:** anchor unit tests per module; runs against P8 outputs. No AI call in tests.
- **Rollback/safety:** validation layer only; no production behavior change.
- **Dependencies:** **P6/P7/P8**.
- **Must NOT change:** production generation.

---

## Phase 10 — Final launch hardening / production checklist

- **Objective:** flip add-ons + bundles to production safely; final pre-launch checklist.
- **Type:** production-affecting (the actual go-live).
- **Files likely touched:** feature-flag/config to enable per-module delivery + add-on generation
  in production; final copy/QA; monitoring/alerts (`alerts.server.ts`).
- **Implementation notes:** verify all gates (🚦 above); enable bundle delivery; confirm secrets,
  email deliverability (SPF/DKIM/DMARC + verified `EMAIL_FROM` domain), rate limits, error alerts;
  smoke-test in test mode; then enable live.
- **Acceptance:** full test-mode E2E for CORE Complete (N PDFs, N links, support visibility);
  all anchor/diagnostic QA green; legal copy live; secrets verified; monitoring active.
- **Tests/checks:** full vitest; `npx tsc --noEmit`; build; final Stripe test-mode E2E.
- **Rollback/safety:** feature-flag rollback; keep single-report path independent; documented
  refund-via-Stripe-dashboard runbook.
- **Dependencies:** P3–P9 complete.
- **Must NOT change:** ship unsupported claims; sell bundles before the 🚦 gate; switch CORE v4.1.

---

## Global guardrails (every phase)

Do not modify production code unless the phase explicitly requires it · no real AI/Stripe/
FreeAstroAPI unless the phase says approved diagnostic/E2E (test-mode) · no printed/committed
secrets · no unsupported claims · keep colors/stones/Japanese/astrocartography/compatibility
gated or not_implemented · no price/checkout-UX change · no CORE v4.1 production switch ·
no Darrow Companion / subscriptions / new products in this train.

## Cross-links

[`launch-readiness-map.md`](launch-readiness-map.md) ·
[`bundle-separate-reports-plan.md`](bundle-separate-reports-plan.md) ·
[`module-content-contracts.md`](module-content-contracts.md) ·
[`data-source-map-by-module.md`](data-source-map-by-module.md) ·
[`material-assembly-readiness.md`](material-assembly-readiness.md) ·
[`support-runbook-report-recovery.md`](support-runbook-report-recovery.md)
