# PHASE 7 — Stripe test-mode E2E checklist (staging only)

Run in **preview/staging only**: Stripe TEST mode, `BUNDLE_SEPARATE_REPORTS=1` + `CONTINUUM_ENABLED=1`
+ `VITE_CONTINUUM_ENABLED=1` in staging, no live charges, no live customer email. **Production flags
stay OFF.** Goal: prove the commercial paths AND exercise production failure modes (schema, pricing,
flags, timing, emails, tokens, retry/idempotency, support, quota, cron, rollback).

## Step 0 — Pre-E2E gates (MANDATORY before any test card)

- [ ] **`GET /api/public/health/generation-pipeline`** → `200` + `"schema_ready": true`,
      `"schema_missing": []`. **If 503 / schema_ready:false → STOP**, apply the listed migration first.
- [ ] PDF renderer reachable: `POST /api/public/debug/apitemplate-account` (token-gated) → correct
      account (Starter+), quota remaining ≥ expected. (No render call — just account check.)
- [ ] Staging flags ON: `BUNDLE_SEPARATE_REPORTS=1`, `CONTINUUM_ENABLED=1`, `VITE_CONTINUUM_ENABLED=1`.
- [ ] **Production flags OFF** (confirmed separately).
- [ ] Stripe TEST products resolve: `core_499`, `module_*_299`, `bundle_modules_2_499`/`3_699`/`4_899`/
      `5_999`/`6_1000`, `core_complete_1499`, `continuum_7d_199`, `continuum_30d_399`.

## E2E A — CORE Complete (CORE + 6 chapters) — capture TIMINGS

Checkout all 6 chapters + CORE → Stripe test card `4242 4242 4242 4242`.

**Record timestamps** (these feed FAQ/support expectations):
- [ ] `checkout.session.completed` time
- [ ] `generation_jobs` queued time
- [ ] first report row `complete` time → **time_to_first_pdf**
- [ ] last module `complete` time → **time_to_all_7_pdfs**
- [ ] email sent time → **time_to_email**

**Verify:**
- [ ] One order, `order_type = core_complete`, amount **$14.99** (`core_complete_1499`).
- [ ] **7 report rows**: CORE + LOVE + MONEY + BODY + YEAR + STYLE + PLACE, all `complete`, all `pdf_url`.
- [ ] Unique `download_token` per row; unique storage path per row.
- [ ] `report_ref`: CORE canonical; add-ons with `-MODULE` suffix (`…-LOVE`, `…-MONEY`, …).
- [ ] One **multi-link** report-ready email lists all 7 PDFs; `/result` lists all; each `/download` opens.
- [ ] `support:report` shows the purchase with all 7 rows + per-module actions.
- [ ] Async resume is expected (job may span sweeps; `attempt_count` ≥ 1) — that's by design.

## E2E A2 — Idempotency / no duplicates (controlled retry, right after A)

- [ ] Re-enqueue / re-trigger the SAME order →
  - [ ] **no duplicate report rows**, no duplicate tokens, no duplicate storage paths
  - [ ] already-complete modules **skipped** (`skipped_existing`)
  - [ ] **no second customer email** (unless an explicit resend is requested)
  - [ ] order not marked `complete` if any module failed; a simulated single-module failure retries
        only that module

## E2E B — CONTINUUM · Next 7 Days (standalone)

Continuum section (gated) → 7-day card → IntakeForm → `createContinuumCheckout` → test card.

- [ ] Order `continuum_7d`, amount **$1.99** (`continuum_7d_199`); standalone, **not** in CORE Complete.
- [ ] One report row: `continuum_type = 7d`, PDF rendered, `complete`, token set.
- [ ] `period_start = generated_at`, `period_end = generated_at + 7 days`.
- [ ] PDF **and** email show the exact `Covers: …–…` window; **no "this week"**, no calendar-week framing.
- [ ] `/result` + `/download` work; `support:report` shows `CONTINUUM · Next 7 Days` / `CONT-7d`.

## E2E C — CONTINUUM · Next 30 Days (standalone)

- [ ] Order `continuum_30d`, amount **$3.99** (`continuum_30d_399`).
- [ ] `continuum_type = 30d`; `period_end = generated_at + 30 days`; `Covers:` spans 30 days.
- [ ] **No "this month"**, no calendar-month framing. PDF/email/download/support all work.

## E2E D — Negative gates (trust + flag isolation)

- [ ] `createContinuumCheckout` when `CONTINUUM_ENABLED=0` (server) → **refused**.
- [ ] Continuum UI hidden when `VITE_CONTINUUM_ENABLED=0` (client).
- [ ] `BUNDLE_SEPARATE_REPORTS=0` → **legacy combined path still works** (regression).
- [ ] **Token isolation:** an invalid/old token cannot list sibling reports; one customer's token cannot
      expose another customer's reports (same-intake grouping only).

## E2E E — Stripe amount checks (before generation, from the session/order)

- [ ] CORE Complete = **$14.99** (NOT $14.99 + $10.00 — Continuum never folded in).
- [ ] CORE + all 6 = **$14.99** (`core_complete_1499`, not core + bundle_6).
- [ ] 6 chapters **without** CORE = **$10.00** (`bundle_modules_6_1000`).
- [ ] Continuum 7d = **$1.99**, 30d = **$3.99**.

## E2E F — Email content checks (not just "an email arrived")

- [ ] CORE Complete email: 7 report links, no broken/duplicate links, soft upsell ≤ 2 recs, no
      aggressive sales / scarcity copy.
- [ ] Continuum email: exact period label visible; no unsupported claims.

## If anything fails
Isolate the smallest failing component; capture the per-module `generation_error` (now logged in
`orchestrate-reports`); fix with a test; re-run the failing path, then the full E2E. **Rollback** =
`BUNDLE_SEPARATE_REPORTS=0` / `CONTINUUM_ENABLED=0` (legacy path resumes; no rows deleted).

## Deliver
Per product: PASS/FAIL · Stripe test session id · order id · report_refs (with suffixes) · the timing
numbers (time_to_first_pdf / all_7 / email) · email status · download/result check · support output.
Then → PHASE 8 (hardening + timing optimization) and finalize PHASE 9.
