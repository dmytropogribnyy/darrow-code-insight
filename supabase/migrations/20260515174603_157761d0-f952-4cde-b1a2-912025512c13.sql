-- Make order_id unique on generation_jobs so the webhook can upsert.
alter table public.generation_jobs
  add constraint generation_jobs_order_id_key unique (order_id);

-- Enable pg_cron + pg_net (idempotent).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Sweep queued/stuck generation jobs every minute. The dispatcher picks one
-- order per call. We schedule 4 calls/minute at staggered offsets via a single
-- minute-level job with 4 sequential POSTs to drain bursts gently.
select cron.schedule(
  'darrow-generation-sweeper',
  '* * * * *',
  $$
  select
    net.http_post(
      url := (current_setting('app.darrow_dispatcher_url', true)),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.darrow_dispatcher_secret', true)
      ),
      body := '{}'::jsonb
    );
  $$
);