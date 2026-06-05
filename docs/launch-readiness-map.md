# Darrow Code — Launch Readiness Map

**Phase:** LAUNCH-AUDIT-1 (docs-only) · **Updated:** 2026-06-06 · **HEAD:** see `git log`

One place that records what is ready, partially ready, and still blocking public launch.
This is a living snapshot, not an implementation. Production remains v3 / one-combined-PDF.

> **Business decision:** all modules (CORE + all focused chapters + bundles / CORE Complete)
> are intended to launch. Therefore **BUNDLE-B and BUNDLE-C are mandatory before public
> launch** — bundles must deliver **separate** focused PDFs per module (see §3).

---

## 1 · Public infrastructure status

- `darrowcode.com` points to **Lovable**.
- DNS migrated from **Squarespace → Namecheap BasicDNS**.
- Lovable domains show **green**.
- Squarespace is **no longer the active DNS provider**.
- **Hold Squarespace cancellation/removal** until the final next-day DNS/email checks are
  confirmed (don't cancel prematurely).

**Remaining DNS follow-ups:**
- Root **SPF** visibility check for Namecheap email forwarding.
- Optional **MX send / Resend (or SES) feedback record** check if needed.

Status: 🟡 mostly done; pending final next-day DNS/email verification.

---

## 2 · Current production report architecture

Today, one purchase produces **one combined PDF**:

- 1 Stripe checkout → **1 paid `orders` row**
- per-module rows in `modules_purchased` (`module_code`)
- **1 `reports` row** with `modules_array = [selected modules]`
- **1 AI generation**
- **1 `renderReportHtmlSafe()` call** (merges all modules into one document)
- **1 PDF** → **1 `pdf_url`** → **1 `download_token`**
- **1 report-ready email**

⚠️ **This conflicts with the intended bundle product promise** (separate focused PDFs).

---

## 3 · Bundle / CORE Complete launch blocker

See **[`bundle-separate-reports-plan.md`](bundle-separate-reports-plan.md)**.

- Customer-facing promise should **remain separate focused PDFs**.
- Current implementation delivers **one combined PDF**.
- 🔴 **BUNDLE-B and BUNDLE-C are MANDATORY before public launch** (business decision: all
  modules launch). The "explicitly accept one combined PDF" fallback is **off the table**
  unless the business reverses that decision and adjusts copy.

Required phases (now mandatory for launch):
- **BUNDLE-B:** separate report units / one PDF per selected module.
- **BUNDLE-C:** email + download/result page listing all report links.
- **BUNDLE-D:** per-report support regenerate/resend.

Single-report purchases (CORE only, or one chapter) are **not** affected by this blocker.

---

## 4 · CORE report status

- **CORE v3 is still production.**
- **CORE v4.1 is diagnostic / staged only** (not switched to production).
- B5.0 / B5.1 / B5.2 / B5.3 / B5.3-A delivered: diagnostic fixture + visual baseline,
  staged-prompt hardening, manual diagnostic CLI, docs/readiness lock, and anchor /
  data-availability validation for the v4 diagnostic.
- Still may be needed before a production switch: fresh v4 PDF visual QA + content
  calibration (real generation runs long/over-target; `not depression`-style wording
  clears on regeneration).

Status: 🟡 diagnostic-ready, not production.

---

## 5 · Focused add-on modules status

**LOVE, MONEY, BODY, YEAR, STYLE, PLACE are NOT yet calibrated to CORE v4.1's level.**

Each still needs:
- source-of-truth map;
- content pattern contract;
- prompt / schema pattern;
- data-availability rules;
- renderer / layout QA;
- real diagnostic generation;
- visual PDF QA;
- proof-anchor validation;
- length / tone calibration;
- safety wording (no medical / financial / legal guarantees).

🔴 **Do not claim add-on modules are final or launch-ready** until these passes are done.
→ tracked as **MODULE-PATTERN-1** (content contracts) + **MODULE-DIAG-1** (real generation + PDF QA).

---

## 6 · FreeAstroAPI / raw data / provider status

- Production pipeline calls `getAstroProvider()` and persists
  `astro_data.normalized_json`.
- **Full availability audit is still needed.** Confirm which fields are reliably present:
  - Western placements;
  - houses / angles **when** `birth_time_known = true`;
  - **no** houses / angles when `birth_time_known = false`;
  - aspects;
  - numerology fields;
  - BaZi / Chinese astrology fields;
  - timing / Personal Year / annual patterns;
  - location / timezone / geocoding data.
- **Diagnostic anchor validation exists for the CORE v4 diagnostic** (B5.3-A): forbidden
  BaZi when unavailable, forbidden house/angle when no birth time, forbidden name
  numerology when no full name, Personal-Year mismatch.
- **Not yet done:** full positive placement-matching (asserting every generated placement
  matches the chart) and all-module data validation.
- FreeAstroAPI output **verified on real data (2026-06-06 approved run, cases A–E)** — all
  endpoints returned rich structured fields; availability gating held. `FREEASTROAPI_KEY` +
  `ASTRO_PROVIDER=freeastroapi` confirmed set in Lovable (production).

Status: 🟢 provider/data layer verified. Remaining gap = interpretive-dictionary layer
(only numerology is coded) + per-module anchor validation.
→ **DATA-AUDIT-1 provider run DONE**; **ANCHOR-AUDIT-1** (all-module proof/data validation) still open.

---

## 7 · Legal / support status (OPS-LEGAL-1, `cafa241`)

- **Terms** updated incl. Refund Policy (refunds **only** in Terms).
- **Privacy** updated (data, Stripe, private PDF link, report reference, deletion).
- **FAQ** adds "Is payment secure?" + "What if something goes wrong with my report?".
- **No** direct refund FAQ. **No** checkout checkbox.
- `reports.report_ref` migration added (`DC-YYYYMMDD-####`, per purchase).
- Read-only support CLI added: `npm run support:report`.
- `report_ref` is currently **per purchase / combined report** (matches current
  architecture); it must be **extended to per-report** when separate report units land
  (BUNDLE-B/D).

Status: 🟢 legal copy + support visibility shipped (combined-report model).

---

## 8 · Report recovery status

**Exists (read-only visibility) — `npm run support:report`:**
- find by `report_ref` / email / Stripe id;
- payment status · generation status · PDF/link status · email-sent status;
- `attempt_count` + `last_error`;
- recommended action.

**Not implemented yet:**
- one-command **regenerate** support action;
- one-command **resend** support action;
- per-report regenerate/resend (after separate report units architecture).

Status: 🟡 visibility yes; one-command recovery actions no.

---

## 9 · Remaining launch blockers (priority order)

**P0 — must resolve before public launch:**
- Bundle / separate-PDF architecture mismatch (BUNDLE-B/C) — or explicit business acceptance.
- Apply & verify the `report_ref` migration in Supabase.
- Verify checkout → generation → email → download **end-to-end in Stripe test mode**.
- Verify API keys / secrets are configured safely (Anthropic, Resend, Supabase).
- Verify FreeAstroAPI / provider output on real diagnostic data.

**Material assembly (P0 for full-module launch):**
- Provider/raw-data layer is **verified** (DATA-AUDIT-1 approved run, 2026-06-06). The remaining
  blocker is the **interpretive-dictionary layer**: the only **coded** dictionary is
  `numerology-meanings.ts`; all other interpretation is AI-from-training + prompt rules (or
  doc-only in `docs/knowledge/`). All modules must **not** be claimed final until material packs +
  module contracts are complete. See [`material-assembly-readiness.md`](material-assembly-readiness.md).

**P1 — needed soon after / for quality:**
- Add-on module content calibration (LOVE/MONEY/BODY/YEAR/STYLE/PLACE).
- Report-ready email content + `report_ref` display.
- Success/result page `report_ref` display.
- Resend / regenerate support commands.
- Resend / SES / DKIM / SPF / DMARC final validation after DNS migration.

**P2 — later / optional:**
- CORE v4.1 production-switch planning.
- OpenAI / GPT fallback (separate future provider phase only).
- Per-module legacy migration / cleanup if needed.

---

## 10 · Next Phases (named, in order)

- ✅ **LAUNCH-AUDIT-1** — this readiness map (docs).
- ✅ **OPS-LEGAL-1 / OPS-LEGAL-2** — legal copy, `report_ref` migration, read-only support CLI, docs.
- **OPS-LEGAL-2-live** — verify `report_ref` in the Supabase dashboard (column, unique index,
  `set_report_ref()` function, `trg_set_report_ref` trigger, backfill) + run `support:report`
  on a real/test order (needs `SUPABASE_SERVICE_ROLE_KEY` locally).
- **STRIPE-E2E-1** — test-mode checkout → generation → email → download end-to-end.
- **BUNDLE-B** — separate report units / one PDF per module *(mandatory for launch)*.
- **BUNDLE-C** — bundle email + download/result page with multiple report links *(mandatory)*.
- **BUNDLE-D** — per-report support regenerate/resend.
- ✅ **DATA-AUDIT-1** — FreeAstroAPI / provider availability verified via approved run
  (2026-06-06, cases A–E); tooling + docs done (`npm run audit:freeastroapi`,
  [`material-assembly-readiness.md`](material-assembly-readiness.md)). Remaining = interpretive
  dictionaries + per-module contracts (MODULE-PATTERN-1) + per-module validation (ANCHOR-AUDIT-1).
- **MODULE-PATTERN-1** — content contracts for LOVE / MONEY / BODY / YEAR / STYLE / PLACE
  (source-of-truth map, prompt/schema pattern, data-availability rules, safety wording).
- **MODULE-DIAG-1** — real generation + visual PDF QA for all add-on modules.
- **ANCHOR-AUDIT-1** — all-module proof/data validation (positive placement matching +
  per-module anchor checks; extends B5.3-A beyond CORE).
- **CORE-V4-PROD-SWITCH** — later; only after diagnostics / content / layout pass.
- **COMPANION-MVP** — later / feature-gated (Darrow Companion / custom questions); not started.

**Safe to sell today:** single-report purchases (CORE only, or one chapter) once
STRIPE-E2E-1 + secrets are verified. **Bundles / CORE Complete are held** until BUNDLE-B/C.
