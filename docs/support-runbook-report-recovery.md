# Support Runbook — Report Recovery

How to find a customer's order/report and recover it (resend / regenerate / refund)
**without asking the customer to pay again**. Read-only lookup is via the support CLI;
recovery actions reuse existing routes (resend) / generation retry.

> Architecture note: **one `reports` row = one purchase = one combined PDF** (modules
> in `modules_array`, one `download_token`, one report-ready email). `report_ref`
> (`DC-YYYYMMDD-####`) is **per purchase**, not per module. This support model matches the
> **current** combined-report architecture; **per-report support** (separate PDFs +
> `DC-…-MODULE` refs + per-report regenerate/resend) is planned in BUNDLE-B/D — see
> [`bundle-separate-reports-plan.md`](bundle-separate-reports-plan.md) and
> [`launch-readiness-map.md`](launch-readiness-map.md).

**Status (OPS-LEGAL-2):** the `report_ref` migration is **committed** but its **live Supabase
application is unverified** — confirm via the Supabase dashboard (or service-role key) per
"Applying the migration" below. `support:report` needs `SUPABASE_SERVICE_ROLE_KEY` locally.
**No one-command resend/regenerate CLI exists yet** — recovery is manual via the existing
routes (see "Recovery actions").

## Find an order/report (read-only)

```bash
SUPPORT_FIND=DC-20260605-0001        npm run support:report   # by report reference
SUPPORT_EMAIL=customer@example.com   npm run support:report   # all reports for a customer
SUPPORT_STRIPE=cs_or_pi_id           npm run support:report   # reports for a Stripe order
```

Requires `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (from `.env.local` / hosting env).
The summary shows: client name · product · `report_ref`, email, modules, **payment**,
**generation status**, **PDF exists**, **download link active**, **email sent (+ when)**,
**attempt count**, **last error**, Stripe session, and a **recommended action**.

### Applying the `report_ref` migration & local verification

The migration `supabase/migrations/20260605193000_report_ref_support.sql` is applied by the
**Supabase / Lovable deploy pipeline** — this repo has **no linked Supabase CLI**, so do not
force a CLI `db push`. After deploy, confirm in the Supabase dashboard: `reports.report_ref`
column, unique index `reports_report_ref_key`, function `set_report_ref()` + trigger
`trg_set_report_ref`, and that any existing rows are backfilled (`DC-YYYYMMDD-####`).

To run `support:report` **locally** you also need **`SUPABASE_SERVICE_ROLE_KEY`** in
`.env.local` (service-role secret; `SUPABASE_URL` already ships in the tracked `.env`).
Without it the CLI prints usage and a real lookup fails fast with
`SUPABASE_SERVICE_ROLE_KEY is required`. Never commit this key.

### Recommended-action logic

| Facts | Action |
|---|---|
| paid + generation complete + PDF + email sent | **none** — resend only if the customer asks |
| paid + generation complete + PDF + email **not** sent | **resend** |
| paid + `failed_generation` **or** no PDF | **regenerate** (no new charge) |
| regenerate keeps failing (≥3 attempts) | regenerate; if still failing → consider **manual Stripe refund** |
| order not paid (`pending`) | **investigate_payment** |
| order `refunded` | **none** (already refunded) |

## Procedures

### 1 · Paid but no report received
1. `support:report` by email / report_ref / Stripe id.
2. Check **payment** (must be paid) and **generation status**.
3. PDF exists → **resend** the link/email. Generation failed/no PDF → **regenerate**.
4. Cannot deliver after recovery → **manual Stripe refund** (Dashboard).

### 2 · Broken PDF
1. Verify the PDF/link from the summary.
2. Re-render from existing generated data if possible; **regenerate** only if needed.
3. Resend the corrected link.

### 3 · Email not received
1. Verify **PDF exists** (do not "resend" if there is no valid PDF).
2. Resend the report-ready email (`/api/public/jobs/resend-ready-email`).
3. Optionally refresh the secure download link.

### 4 · Failed generation
1. Inspect **last error** in the summary.
2. Retry/regenerate the **same paid order** — do **not** ask the customer to pay again.

### 5 · Bundle / multi-module issue
- Today a bundle is **one** report/PDF/`report_ref`. Recover the whole package
  (regenerate/resend that one report). Per-module recovery requires the separate
  per-module architecture phase.

### 6 · Refund
- Only when we **cannot deliver** the purchased report after recovery attempts.
- Refund **manually** through the Stripe Dashboard. No automatic refunds in code.

## What to ask the customer

- Report reference (`DC-YYYYMMDD-####`), if they have it.
- The email used at checkout.
- Stripe/payment reference, if available.
- What is missing or broken.

## Recovery actions (existing)

- **Resend** report-ready email/link: `POST /api/public/jobs/resend-ready-email`
  (auth: `JOB_DISPATCH_SECRET`), body `{ "report_id" | "order_id" | "download_token", "force": true }`.
- **Regenerate**: existing generation retry path (`/api/public/jobs/process-generation`).
- Wiring these as one-command support actions is a follow-up (not in this phase).

## Out of scope (this phase)

No regenerate/resend CLI wiring, no `generation_attempts` history table, no per-module
report split, no PDF-architecture change, no checkout changes, no automatic refunds,
no public admin route.
