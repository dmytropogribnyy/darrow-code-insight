
CREATE TABLE IF NOT EXISTS public.admin_alerts (
  kind text PRIMARY KEY,
  last_sent_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

-- No public policies: only service_role (which bypasses RLS) may access.

CREATE OR REPLACE FUNCTION public.last_sweeper_run_at()
RETURNS timestamptz
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, cron
AS $$
  SELECT max(start_time)
  FROM cron.job_run_details jrd
  JOIN cron.job j ON j.jobid = jrd.jobid
  WHERE j.jobname = 'darrow-generation-sweeper-v2'
    AND jrd.status = 'succeeded';
$$;

REVOKE ALL ON FUNCTION public.last_sweeper_run_at() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.last_sweeper_run_at() TO anon, authenticated, service_role;
