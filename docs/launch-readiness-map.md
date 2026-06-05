# Darrow Code — Launch Readiness Map

**Phase:** LAUNCH-AUDIT-1 (docs-only) · **Date:** 2026-06-05 · **HEAD:** `602d2eb`

One place that records what is ready, partially ready, and still blocking public launch.
This is a snapshot, not an implementation. Production remains v3 / one-combined-PDF.

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
- 🔴 **Do not publicly launch bundle / CORE Complete sales** until **BUNDLE-B** and
  **BUNDLE-C** are implemented, or the business **explicitly accepts** one combined PDF
  (with copy adjusted to match).

Required future phases:
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
- FreeAstroAPI output must be **verified on real data** before final production claims and
  proof anchors.

Status: 🟡 used in production; availability audit pending.

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

## 10 · Recommended execution order from here

1. ✅ Push Phase A docs (`bundle-separate-reports-plan.md`).
2. ✅ LAUNCH-AUDIT-1 docs-only readiness map (this file).
3. Apply `report_ref` Supabase migration; test `support:report` on a real/test order.
4. **BUNDLE-B:** separate report units / one PDF per module.
5. **BUNDLE-C:** email + download/result page with multiple report links.
6. **BUNDLE-D:** per-report regenerate/resend.
7. Focused module content calibration: LOVE / MONEY / BODY / YEAR / STYLE / PLACE.
8. FreeAstroAPI / data-availability audit across all modules.
9. CORE v4.1 production switch — only after diagnostics / content / layout pass.
10. Full Stripe test-mode E2E.
11. Only then public launch / ads.

**Safe to sell today:** single-report purchases (CORE only, or one chapter) once P0
checkout/email/download E2E + secrets are verified. **Hold bundle/CORE Complete** until
BUNDLE-B/C or explicit acceptance.
