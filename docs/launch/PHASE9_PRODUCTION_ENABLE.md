# PHASE 9 — Production Enable Proposal (DRAFT, docs-only)

**Status:** proposal only. **No flags flipped, no live Stripe, no live email, no production action taken by this document.**
Backend ready as of commit `7183a1a` (PHASES 2–5). Full suite green, `tsc` clean, all flags default **OFF**.

This is the runbook to turn production on **after** PHASE 7 (Stripe test-mode E2E) is green and the human approves. It does not authorize any live action by itself.

---

## 0. Hard stops (require explicit human approval every time)

Do **not** do any of these without a fresh, explicit go from the product owner:

- Enable `BUNDLE_SEPARATE_REPORTS=1` in **production**
- Enable `CONTINUUM_ENABLED=1` / `VITE_CONTINUUM_ENABLED=1` in **production**
- Any **live** Stripe charge or live customer payment
- Any **live** customer email send
- Production data mutation / backfill / delete
- CORE v4.1 production switch (stays **staged**; CORE v3 remains production)
- Adding any unsupported claim/source (see content rules)

---

## 1. Pre-enable checks (all must be ✅ before any flag flip)

### Secrets / env (production)
- [ ] `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` present
- [ ] `ANTHROPIC_API_KEY` present
- [ ] `FREEASTROAPI_KEY` present
- [ ] `APITEMPLATE_API_KEY` present — the **PDF render engine** (`rest.apitemplate.io`). Confirm the
      key is from a **paid** account with enough monthly quota: each report = 1 PDF and **CORE
      Complete (separate mode) = 7 PDFs/order** (free tier is 50/mo → throttles after ~7 orders →
      generation fails with no PDF). Currently on Starter (1,500/mo).
- [ ] `RESEND_API_KEY` present
- [ ] `GEOAPIFY_API_KEY` present
- [ ] `STRIPE_LIVE_API_KEY` + `PAYMENTS_LIVE_WEBHOOK_SECRET` present (live webhook verified)
- [ ] `APP_BASE_URL` = production URL (`https://darrowcode.com`)
- [ ] Client publishable token present for production
- [ ] No secrets committed to the repo (verified)

### Stripe live Products/Prices (lookup keys — config only until go-live)
- [ ] `core_499` ($4.99)
- [ ] `module_love_299` … `module_place_299` ($2.99 each)
- [ ] `bundle_modules_2_499` ($4.99), `bundle_modules_3_699` ($6.99), `bundle_modules_4_899` ($8.99), `bundle_modules_5_999` ($9.99), `bundle_modules_6_1000` ($10.00)
- [ ] `core_complete_1499` ($14.99)
- [ ] `full_code_upgrade_1000` ($10.00)
- [ ] `continuum_7d_199` ($1.99), `continuum_30d_399` ($3.99) — standalone, **not** in CORE Complete, not bundled
- [ ] Stale bundle prices archived (`bundle_modules_3_799 / 4_1099 / 5_1299`)
- [ ] Live webhook `…/api/public/payments/webhook?env=live` listening on `checkout.session.completed`

### Database / storage — ⚠️ #1 LAUNCH GATE (migrations are NOT auto-applied)
PHASE 6 found that the deploy pipeline does **not** auto-apply repo migrations — all three recent
migrations were missing in the target DB, which **breaks ALL generation** (CORE/add-ons/Continuum):
`loadOrderContext` selects `continuum_type`, the separate pipeline inserts `module_code`, and the
per-module ref needs `report_ref`. A missing column makes every order fail with "order not found"
or `failed_generation`. **Apply + verify these BEFORE the PHASE 5 code (`c450555`+) is deployed:**
- [ ] `20260605193000_report_ref_support.sql` → `reports.report_ref` + trigger `set_report_ref()`
- [ ] `20260606120000_report_module_code.sql` → `reports.module_code` + ref `-MODULE` suffix
- [ ] `20260606170000_continuum.sql` → `orders.continuum_type`, `reports.continuum_type`, index
- [ ] **Verify via the health endpoint:** `GET /api/public/health/generation-pipeline` returns
      `"schema_ready": true` and `"schema_missing": []`. If any column is missing it lists exactly
      which migration to apply — this guard now fails the health check (503) so an unapplied
      migration is caught before a customer hits it.
- [ ] `reports` storage bucket exists (private)
- [ ] `support:report` works against production (read-only)

### Flags currently OFF (confirm baseline)
- [ ] `BUNDLE_SEPARATE_REPORTS` = 0 (production)
- [ ] `CONTINUUM_ENABLED` = 0 (production)
- [ ] `VITE_CONTINUUM_ENABLED` = 0 (production)
- [ ] Rollback rehearsed in staging (flipping flags back to 0 restores legacy behavior)

### Gates already green
- [x] PHASE 4 — add-ons + Continuum real-AI validation pass (schema, proof-anchored, zero forbidden claims)
- [x] PHASE 6 — separate-pipeline dry run **GREEN** (CORE+LOVE end-to-end via async sweeper: AI →
      APITemplate PDF → bucket → rows with `-MODULE` ref; `attempt_count=2` = resume works)
- [ ] PHASE 7 — Stripe **test-mode** E2E green (CORE Complete + Continuum 7d/30d) — see PHASE7_E2E_CHECKLIST.md

### Launch-readiness guards (close in PHASE 8, verify before enable)
- [ ] **Health endpoint is a HARD GATE:** do not enable any production flag unless
      `GET /api/public/health/generation-pipeline` returns `200` + `schema_ready:true`.
- [ ] **Stripe lookup keys** resolve in LIVE (manual checklist now; a `verifyStripeLookupKeys()` script
      later): `core_499`, `core_complete_1499`, `module_*_299`, `bundle_modules_2_499`/`3_699`/`4_899`/
      `5_999`/`6_1000`, `continuum_7d_199`, `continuum_30d_399`.
- [ ] **APITemplate** account = paid (Starter+), monthly quota ≥ expected, a render test passes
      (CORE Complete = 7 PDFs/order).
- [ ] **pg_cron / sweeper health:** `last_sweeper_run_at` exists and is < 5 min old; cron job
      `darrow-generation-sweeper-v2` exists; stuck-queued count = 0 (or known); `failed_generation_24h` visible.
- [ ] **Debug routes audit:** every `/api/public/debug/*` route is secret-gated, prints no secrets,
      creates no customer data without an explicit test marker, and sends no email by default.
- [ ] **Timing expectation copy** live: `/result` says "we'll email you when ready"; premium
      `expectedMin = 20`; FAQ says CORE Complete ~15–20 min (no false-failure banner before ~9 min).

---

## 2. Enable sequence (only after §1 all ✅ + explicit approval)

1. Confirm **no active generation jobs** in flight (`generation_jobs` quiet).
2. Confirm the **latest commit is deployed** to production.
3. Confirm env/secrets (§1) one more time.
3b. **HARD GATE:** `GET /api/public/health/generation-pipeline` → `200` + `schema_ready:true`.
    If 503 / `schema_ready:false` → **do not enable any flag**; apply the listed migration first.
4. **Enable `BUNDLE_SEPARATE_REPORTS=1`** (production). Legacy combined path is the fallback if anything misbehaves.
5. **Enable `CONTINUUM_ENABLED=1` + `VITE_CONTINUUM_ENABLED=1`** — only if PHASE 7 Continuum E2E is green **and** explicitly approved.
6. Place **one controlled live order** (only if explicitly approved) — smallest viable (e.g. CORE $4.99, or Continuum 7d $1.99). **Do not run marketing/paid traffic until this first live order completes end-to-end.** If it fails → flags back to 0 immediately.
7. **Monitor** for that order end-to-end:
   - `generation_jobs` (queued → complete, no stuck/`failed`)
   - `reports` (rows created; per-module `report_ref` `…-LOVE` etc.; `pdf_url`, `download_token`; Continuum row has `continuum_type` + correct period)
   - `astro_data` (chart computed)
   - storage (`reports` bucket has the PDF objects)
   - Resend (delivery email accepted; links resolve)
   - Stripe webhook (`checkout.session.completed` received, idempotent)
8. **Verify `support:report`** shows the order (per-module + Continuum visibility).
9. If anything fails → **immediately** set the relevant flag(s) back to 0 (see Rollback).

---

## 3. Rollback (immediate, non-destructive)

- Set `BUNDLE_SEPARATE_REPORTS=0` → legacy combined report path resumes.
- Set `CONTINUUM_ENABLED=0` + `VITE_CONTINUUM_ENABLED=0` → Continuum UI hidden; `createContinuumCheckout` refuses.
- **Do not delete** any per-module / Continuum rows already created.
- Use `support:report` + `resend` / `regenerate` tooling for any affected order.
- Legacy CORE v3 production behavior is unchanged throughout (CORE v4.1 stays staged).

Rollback is just flag flips — no schema or data changes are required to revert.

---

## 4. Notes / invariants preserved

- CORE Complete = CORE + LOVE + MONEY + BODY + YEAR + STYLE + PLACE = **$14.99** (unchanged savings math).
- Continuum is **standalone** ($1.99 / $3.99), one-time, rolling period from generation, **never** bundled or added to CORE Complete.
- No subscriptions, no mutable cart, no checkout-architecture rewrite.
- Content rules enforced (no Japanese astrology, no astrocartography/cities, no synastry in LOVE, no colors/stones as magic, no medical/financial/relationship guarantees, no guaranteed predictions).

---

_Prepared as PHASE 9 draft. Awaiting PHASE 6 (service-role key) + PHASE 7 (Lovable staging + Stripe test-card E2E) before this runbook is executable. No action authorized by this file._
