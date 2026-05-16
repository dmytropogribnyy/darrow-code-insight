# Generation pipeline hardening

Scope: backend reliability only. No UI or feature work.

## 1. Regression test for worker auth
- Add `src/routes/api/public/jobs/process-generation.test.ts` (vitest)
- Cases:
  - `apikey: SUPABASE_PUBLISHABLE_KEY` header → 200/202 (cron mode)
  - `Authorization: Bearer <JOB_DISPATCH_SECRET>` → 200/202 (service mode)
  - Missing/invalid auth → 401 with `{ error: "unauthorized", code: "AUTH_REQUIRED" }`
- Mock pipeline so test stays fast.
- Wire into existing test command so deploys block on failure.

## 2. Structured pipeline logging
- New helper `src/lib/observability/pipeline-log.ts`:
  - `logStage({ order_id, stripe_session_id?, generation_job_id?, stage, duration_ms?, result, error? })`
  - Emits single-line JSON via `console.log` so it's grep-able in worker logs.
- Instrument:
  - `webhook.ts` → `webhook_received`, `job_enqueued`
  - `pipeline.server.ts` → `worker_claimed`, `astro_data_generated`, `ai_generation_started`, `ai_generation_completed`, `pdf_generated`, `status_updated`, `email_sent`
- Each call wraps the existing step with `Date.now()` timing.

## 3. Health endpoint
- New route `src/routes/api/health/generation-pipeline.ts` (GET, no auth).
  - Note: lives under `/api/health/*`, not `/api/public/*`, but is intentionally public read-only with no PII.
- Returns JSON:
  ```
  {
    paid_orders_without_job_24h,
    queued_older_than_5m,
    processing_older_than_10m,
    failed_generation_24h,
    last_successful_generation_at,
    last_sweeper_run_at,
    healthy: boolean
  }
  ```
- `last_sweeper_run_at` derived from `cron.job_run_details` for the sweeper job.

## 4. Admin alerting
- New table `admin_alerts(kind text pk, last_sent_at timestamptz)` for throttle (30 min cooldown).
- Sweeper extension `src/routes/api/public/jobs/process-generation.ts` (already cron-invoked every minute):
  - After regular work, run `checkAlertConditions()` which inspects DB and sends one email per kind via `sendEmail` to `ADMIN_NOTIFICATION_EMAIL`.
  - Kinds: `paid_no_job_3m`, `queued_5m`, `processing_10m`, `failed_generation`, `sweeper_stale_15m`.
  - `sweeper_stale_15m` check piggybacks on `cron.job_run_details`.

## 5. Recover missing ready emails
- Query: `reports` where `generation_status='complete'` AND `ready_email_sent_at IS NULL` AND `pdf_url IS NOT NULL`.
- For each, call existing `resend-ready-email` route logic directly (in a small admin script or inline server fn invocation).
- Report list of order_ids attempted + result in final summary.

## 6. MAINTENANCE.md
- Single new file at repo root covering: auth bug history, sweeper, manual stuck-order recovery (SQL snippets), retry without double-charge, health endpoint, log keywords.

## 7. Anthropic retry/backoff
- Update `src/lib/ai/anthropic.server.ts`:
  - Replace current single-fallback with: up to 4 attempts total — default model with exp backoff (1s, 3s, 9s) on 5xx/429/408, then 1 attempt on fallback model.
  - Already-correct behavior preserved (timeout abort, schema parse).
- Confirm `reportDelayEmail` copy mentions "no second charge". Update template if missing.

## 8. Verification
- Run vitest for new auth test.
- Run health endpoint via `stack_modern--invoke-server-function` and capture output.
- Manually trigger sweeper and capture structured log lines.
- Document end-to-end Stripe Test Mode run as a checklist in final report (full live E2E with real Stripe requires user click — agent will simulate by enqueuing a job and observing logs).

## Out of scope
- New UI, new features, schema changes beyond `admin_alerts`.
- Touching `src/integrations/supabase/*` generated files.

## Final report will include
- Test results, health endpoint output, recovered order ids, remaining manual items, risks.
