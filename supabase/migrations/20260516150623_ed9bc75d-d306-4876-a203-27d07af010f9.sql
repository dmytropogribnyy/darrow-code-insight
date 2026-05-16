select cron.unschedule('darrow-generation-sweeper-v2');

select cron.schedule(
  'darrow-generation-sweeper-v2',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://project--3b6e1dad-b8e6-4d27-9267-46e36c3e34e3-dev.lovable.app/api/public/jobs/process-generation',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhc2FzZSIsInJlZiI6InFlcXhiZHZxbnZjdWJneHhsaWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NTI2NjksImV4cCI6MjA5NDQyODY2OX0.du01VeIQJ_6gD_O8sVydjOAYfWws7C5OPq8kK7hneuo"}'::jsonb,
    body := '{}'::jsonb,
    timeout_milliseconds := 900000
  );
  $$
);