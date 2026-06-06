# PHASE 7 — Stripe test-mode E2E checklist (staging only)

Run in **preview/staging only**: Stripe TEST mode, `BUNDLE_SEPARATE_REPORTS=1` + `CONTINUUM_ENABLED=1`
in staging, no live charges, no live customer email. Production flags stay OFF.

## Step 0 — Preconditions (do this FIRST, every time)

PHASE 6 proved the deploy pipeline does **not** auto-apply migrations, and a missing column breaks
ALL generation. So before any order:

- [ ] **`GET /api/public/health/generation-pipeline`** → `"schema_ready": true`, `"schema_missing": []`.
      If false, apply the listed migration(s) first — do not proceed.
- [ ] Staging flags on: `BUNDLE_SEPARATE_REPORTS=1`, `CONTINUUM_ENABLED=1`, `VITE_CONTINUUM_ENABLED=1`.
- [ ] APITemplate on a paid plan with quota (CORE Complete = 7 PDFs/order).
- [ ] Stripe TEST products resolve: `core_499`, `module_*_299`, `bundle_modules_2_499`/`3_699`/`4_899`/
      `5_999`/`6_1000`, `core_complete_1499`, `continuum_7d_199`, `continuum_30d_399`.

## E2E A — CORE Complete (CORE + 6 chapters)

Checkout via IntakeForm with all 6 chapters + CORE → Stripe test card `4242 4242 4242 4242`.

- [ ] One order, `order_type = core_complete`, amount **$14.99** (`core_complete_1499`).
- [ ] Webhook `checkout.session.completed` received; order → `paid`; `generation_jobs` row queued.
- [ ] Worker (pg_cron) generates async; may span multiple sweeps (idempotent resume) — that's expected.
- [ ] **7 report rows** for the intake: CORE + LOVE + MONEY + BODY + YEAR + STYLE + PLACE.
- [ ] Each row: `generation_status = complete`, `pdf_url` set, unique `download_token`, unique storage path.
- [ ] `report_ref`: CORE has the canonical ref; add-ons have the **`-MODULE`** suffix
      (`DC-YYYYMMDD-####-LOVE`, `…-MONEY`, …).
- [ ] One **multi-link** report-ready email (all 7 download links) + the soft "recommended next" block.
- [ ] Result/download page exposes only this purchase's PDFs; links open.
- [ ] `support:report` shows the purchase with per-module rows + actions.
- [ ] Retry safety: re-trigger the job → **no duplicate rows** (skipped_existing); order not marked
      complete if any module failed.

## E2E B — CONTINUUM · Next 7 Days (standalone)

Continuum section (gated) → 7-day card → IntakeForm → `createContinuumCheckout` → test card.

- [ ] Order `continuum_7d`, amount **$1.99** (`continuum_7d_199`); not bundled, not in CORE Complete.
- [ ] One report row: `continuum_type = 7d`, PDF rendered, `generation_status = complete`, token set.
- [ ] PDF cover shows rolling-period labels: `Generated: …` + `Covers: …–…` (next 7 days from generation).
- [ ] Report-ready email + download/result page work.
- [ ] `support:report` shows `CONTINUUM · Next 7 Days` / `CONT-7d`.

## E2E C — CONTINUUM · Next 30 Days (standalone)

Same as B with the 30-day card.

- [ ] Order `continuum_30d`, amount **$3.99** (`continuum_30d_399`).
- [ ] `continuum_type = 30d`; `Covers:` spans 30 days; PDF/email/download/support all work.

## Global verification

- [ ] No cross-customer exposure (each result/download scoped to its intake).
- [ ] Flags OFF → legacy combined path still works (regression check).
- [ ] No unsupported content in any generated report (forbidden-claim scans already green in PHASE 4).

## If anything fails
Isolate the smallest failing component, capture the per-module `generation_error` (now logged in
`orchestrate-reports`), fix with a test, re-run the failing path, then re-run the full E2E. Rollback =
set `BUNDLE_SEPARATE_REPORTS=0` / `CONTINUUM_ENABLED=0` (legacy path resumes; no rows deleted).

## Deliver
Per product: PASS/FAIL · Stripe test session id · order id · report_refs (with suffixes) · email status ·
download/result check · support output. Then → PHASE 8 hardening + finalize PHASE 9.
