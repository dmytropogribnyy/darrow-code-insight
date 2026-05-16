# Maintenance — generation pipeline

This document covers the paid-order → report-delivered pipeline and how to
recover from common failure modes. Keep it short. Update it when the flow
changes.

---

## Pipeline at a glance

```
Stripe checkout
  → POST /api/public/payments/webhook?env=…    (signature-verified)
    → orders.status = paid
    → modules_purchased rows upserted
    → generation_jobs row inserted (status=queued)
  → POST /api/public/jobs/process-generation   (cron, every minute)
    → claims a queued / stuck job
    → runFullGenerationPipeline()
      → astro_data → Anthropic → HTML → PDF → Supabase Storage upload
      → reports.generation_status = complete
      → orders.status = complete
      → reports.ready_email_sent_at set, customer email sent
```

The dispatcher is also called inline by the webhook, but cron is the
durable safety net — never rely on the inline call alone.

---

## The auth bug (do not reintroduce)

`/api/public/jobs/process-generation` accepts two auth modes:

1. `Authorization: Bearer <JOB_DISPATCH_SECRET>` — used by webhook / manual.
2. `apikey: <SUPABASE_PUBLISHABLE_KEY>` — used by `pg_cron` via `net.http_post`.

A regression that only checks `Authorization: Bearer` will silently break
the cron sweeper: paid orders stay queued forever and customers see an
infinite spinner. The webhook still works, so dev test orders may look
fine — the bug only surfaces when the inline pipeline call exceeds the
preview-runtime timeout and the sweeper has to take over.

Covered by `src/routes/api/public/jobs/process-generation.test.ts`. Run
`bunx vitest run` before deploying changes to that file.

---

## Cron sweeper

- Supabase cron job: `darrow-generation-sweeper-v2`, schedule `* * * * *`.
- Hits `https://project--{id}.lovable.app/api/public/jobs/process-generation`
  with the publishable anon key in the `apikey` header.
- Picks the oldest `queued` job (>30s old) or stuck `processing` job
  (>4 min old) and runs it.
- Also runs `repairPaidOrdersWithoutJobs()` (creates missing `generation_jobs`
  rows for paid orders) and `sendOneMissingReadyEmail()` (one missed
  ready-email per tick).
- Health: `SELECT public.last_sweeper_run_at();` returns the last successful
  run. The health endpoint and admin alerts both use this.

---

## Health endpoint

`GET /api/health/generation-pipeline` (no auth, no PII):

```json
{
  "healthy": true,
  "paid_orders_without_job_24h": 0,
  "queued_older_than_5m": 0,
  "processing_older_than_10m": 0,
  "failed_generation_24h": 0,
  "last_successful_generation_at": "…",
  "last_sweeper_run_at": "…"
}
```

Returns HTTP 200 when `healthy: true`, otherwise 503 (so uptime monitors
treat it as down). Point pingdom/uptimerobot/etc. at this URL.

---

## Admin alerts

`checkAlertConditions()` runs at the end of every sweeper tick.
Emails go to `ADMIN_NOTIFICATION_EMAIL`. Throttled at 1 email per kind per
30 min via the `admin_alerts` table.

Conditions:

| Kind                | Trigger                                                  |
|---------------------|----------------------------------------------------------|
| `paid_no_job_3m`    | Paid order >3 min with no `generation_jobs` row.         |
| `queued_5m`         | Any job in `queued` status with `updated_at` >5 min ago. |
| `processing_10m`    | Any job in `processing` status with `updated_at` >10 min ago. |
| `failed_generation` | Any `reports.generation_status='failed_generation'` in last 24h. |
| `sweeper_stale_15m` | Sweeper hasn't logged a successful cron run in 15 min.   |

Reset throttle for one kind: `DELETE FROM admin_alerts WHERE kind = '…'`.

---

## Manual recovery

### Inspect a stuck order

```sql
SELECT o.id, o.status, o.created_at, j.status, j.attempt_count, j.last_error, j.updated_at
FROM orders o
LEFT JOIN generation_jobs j ON j.order_id = o.id
WHERE o.id = '<order_id>';
```

### Force the sweeper to pick a specific order

```bash
curl -X POST \
  -H "Authorization: Bearer $JOB_DISPATCH_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"order_id":"<order_id>"}' \
  https://project--3b6e1dad-b8e6-4d27-9267-46e36c3e34e3.lovable.app/api/public/jobs/process-generation
```

### Resend the ready-email for a completed report

```bash
curl -X POST \
  -H "Authorization: Bearer $JOB_DISPATCH_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"order_id":"<order_id>","force":true}' \
  https://project--3b6e1dad-b8e6-4d27-9267-46e36c3e34e3.lovable.app/api/public/jobs/resend-ready-email
```

### Retry a `failed_generation` report without double-charging

The customer has already paid — never create a new Stripe session.
Just reset the job and let the sweeper pick it up:

```sql
UPDATE generation_jobs
   SET status = 'queued',
       attempt_count = 0,
       last_error = NULL,
       updated_at = now()
 WHERE order_id = '<order_id>';

UPDATE reports
   SET generation_status = 'processing',
       generation_error = NULL
 WHERE intake_id = (SELECT intake_id FROM orders WHERE id = '<order_id>');
```

Within ~1 min the sweeper claims it and regenerates. No new charge ever
hits the customer's card.

---

## Logs to check first

Worker logs emit structured JSON lines tagged `"log":"pipeline"`. To trace
one order end to end, grep for its `order_id`:

```
"log":"pipeline" "order_id":"<order_id>"
```

Key stages: `webhook_received`, `job_enqueued`, `worker_claimed`,
`astro_data_generated`, `ai_generation_started`, `ai_generation_completed`,
`pdf_generated`, `email_sent`, `status_updated`. Each has
`result: success|retry|failed` and `duration_ms`.

Also useful:
- `[dispatcher]` — sweeper picking jobs.
- `[pipeline]` — legacy pipeline progress logs (kept alongside structured logs).
- `[webhook]` — Stripe webhook handler.
- `[anthropic]` — model fallback and chunked generation notes.
