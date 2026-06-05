# Bundle Delivery — Separate Reports Plan

**Status:** Phase A (documentation lock). No code/schema/pipeline change in this phase.
**Date:** 2026-06-05
**See also:** [`launch-readiness-map.md`](launch-readiness-map.md) (overall launch status).

> **Business rule (must preserve):** Bundles / CORE Complete are **discounted collections
> of separate reports/PDFs**, not one merged combined PDF. The discount is for buying
> multiple separate reports together.

---

## 1 · Current product promise (customer-facing — correct, keep it)

The site already promises **separate focused PDFs** per module (`src/components/FaqBlock.tsx`):

- "You receive a polished private PDF report — or, for bundles, **separate focused PDF
  reports** — delivered by email with secure download links."
- "your order can include your CORE Report and any selected Focused Chapters as
  **separate readings**."
- "If you choose a bundle, **each Focused Chapter is delivered as its own PDF**."

This copy is **correct** and must continue to promise separate focused PDFs. Do **not**
realign it to a combined-PDF model.

---

## 2 · Current technical architecture (the mismatch source)

One purchase produces **one combined PDF** (`src/lib/generation/pipeline.server.ts`,
`supabase/migrations/…`):

- 1 Stripe checkout → **1 `orders` row** (`stripe_session_id`, `status`)
- per-module purchase rows in `modules_purchased` (`module_code`)
- **1 `reports` row** with `modules_array = [CORE, LOVE, …]`
- **1** `renderReportHtmlSafe(report)` → merges CORE + all chapters into **one document**
- **1** `renderHtmlToPdf` → **1** `pdf_url` (storage object) → **1** `download_token`
- **1** report-ready email with **1** download link

So: **1 purchase → 1 reports row → 1 combined PDF / 1 token / 1 email.**

---

## 3 · Exact mismatch / launch risk

- **Promise:** N separate focused PDFs (one per selected module).
- **Reality:** 1 combined PDF containing all modules.
- **Risk:** A customer who buys CORE Complete (or any bundle) is told they will receive
  separate focused reports, but receives a single merged PDF. This is a
  **misrepresentation / delivery-mismatch risk** → complaints, chargebacks, refunds, and
  a Terms/refund exposure (Terms promise "purchased report or reports").
- The OPS-LEGAL-1 `report_ref` + support summary layer (commit `cafa241`) was built on the
  **current** one-report-per-purchase reality; it works today but must be extended in
  Phase B/D to be per-report.

> ⚠️ **Do not publicly launch bundle / CORE Complete sales until this mismatch is resolved
> (Phase B–C) or explicitly accepted as a known limitation with copy adjusted accordingly.**
> Single-report (CORE-only, or one chapter) purchases are not affected by this mismatch.

---

## 4 · Target architecture (separate report units)

- **One Stripe checkout / one paid purchase** (unchanged — still one discounted payment).
- **Multiple report units** — one report record per selected module.
- **One PDF per selected module** (own storage object + `download_token`).
- **One `report_ref` per individual report/module** — format `DC-YYYYMMDD-####-MODULE`
  (e.g. `DC-20260605-0001-CORE`, `DC-20260605-0001-LOVE`).
- **Grouped by `purchase_ref` / Stripe checkout session** — the existing
  `orders.stripe_session_id` (+ `intake_id`) groups the included reports.
- **Delivery:** one report-ready email **listing all generated PDFs** (separate secure
  links), and/or a result page that lists every report for the purchase.
- **Support lookup** by purchase / email / Stripe id shows **all included reports** with
  per-report status.
- **Regenerate / resend per individual report** (not the whole bundle).

---

## 5 · Migration / backward compatibility

- **Existing combined reports remain valid** — they were already generated as one PDF and
  must keep working (download link + email unchanged). They are **not** retroactively split.
- **New purchases after migration** generate **separate report units** (one row + PDF +
  token + `report_ref` per module).
- **`report_ref` coexistence:** legacy combined reports keep `DC-YYYYMMDD-####` (no module
  suffix); new per-module reports use `DC-YYYYMMDD-####-MODULE`. Support tooling must handle
  both shapes.
- A `reports.module_code` (nullable) distinguishes new per-module rows from legacy combined
  rows (`module_code IS NULL` + populated `modules_array` = legacy combined).

---

## 6 · Phased implementation

### Phase A — Documentation lock (this doc) ✅
- Record the intended promise, the current architecture, the mismatch/risk, target
  architecture, migration, phasing, tests, and the launch warning.
- No schema / pipeline / checkout / price / AI / Stripe / CORE-v4 changes.

### Phase B — Schema + pipeline for separate report units
- **Schema:** add `reports.module_code public.module_code` (nullable); per-module rows get
  own `pdf_url`, `download_token`, `generation_status`, `generation_error`, `report_ref`.
  Keep `modules_array` for legacy back-compat. Group via `intake_id` + `orders.stripe_session_id`.
- **Pipeline:** loop over selected modules → for each module: render that module → PDF →
  upload → create/update its report row + status. `generation_jobs`: per-module job or one
  job tracking N reports.
- **Render:** per-module rendering. CORE is already isolated (`renderCoreV4HtmlSafe`); addon
  modules need a per-module legacy render (split out of `renderReportHtmlSafe`).
- Behind/alongside the current flow until verified; do not break legacy combined reports.

### Phase C — Bundle delivery (email + download)
- Report-ready email lists **all** generated PDFs (separate secure links).
- Result/download page lists every report for the purchase.

### Phase D — Per-report support recovery
- Extend the support summary/CLI to list **N reports per purchase** and act per report:
  `regenerate DC-…-MODULE`, `resend DC-…-MODULE`. `recommendedAction` per report.

---

## 7 · Tests needed (Phase B–D)

1. A bundle purchase creates **separate report rows** (one per selected module).
2. Each report unit gets its **own** PDF, `download_token`, and `report_ref` (with module).
3. `report_ref` for per-module reports = `DC-YYYYMMDD-####-MODULE`; legacy = `DC-YYYYMMDD-####`.
4. Reports are **grouped** by email / Stripe session (support lookup shows all).
5. Search by individual `report_ref` returns the single module report.
6. One email lists all generated PDFs (or separate links per report).
7. Per-report **regenerate** creates an attempt for that module only; others untouched.
8. Per-report **resend** does not regenerate when that PDF exists.
9. **Back-compat:** existing combined reports still resolve (download + support) unchanged.
10. Single-report purchases (CORE-only / one chapter) behave identically before/after.

---

## 8 · Launch warning

⚠️ **Do not publicly launch bundle / CORE Complete sales until this mismatch is resolved
(Phase B–C) or explicitly accepted** with copy adjusted to match. Selling "separate focused
PDFs" while delivering one combined PDF is a delivery-mismatch / refund risk.

Single-report purchases (CORE only, or a single chapter) are safe to sell today.

---

## 9 · Constraints (all phases until approved)

Do not change prices · do not change checkout · do not switch production to CORE v4.1 ·
do not call real AI / Stripe · do not add a refund FAQ · do not implement Phase B–D without
explicit approval.
