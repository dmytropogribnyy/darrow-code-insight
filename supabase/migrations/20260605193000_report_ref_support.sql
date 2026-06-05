-- OPS-LEGAL-1 · Customer-facing report reference for support / order tracking.
--
-- One report_ref per reports row (= one purchase / report package, one combined PDF),
-- NOT per module. Format: DC-YYYYMMDD-#### (per-creation-day sequence).
-- Safe + idempotent: nullable column, backfill, unique index, BEFORE INSERT trigger.
-- App code does not need to change — the trigger assigns report_ref on insert.

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS report_ref TEXT;

-- Backfill existing rows with a stable per-day sequence ordered by creation time.
WITH numbered AS (
  SELECT
    id,
    'DC-' || to_char(created_at, 'YYYYMMDD') || '-' ||
    lpad(
      row_number() OVER (
        PARTITION BY to_char(created_at, 'YYYYMMDD')
        ORDER BY created_at, id
      )::text, 4, '0'
    ) AS ref
  FROM public.reports
  WHERE report_ref IS NULL
)
UPDATE public.reports r
SET report_ref = n.ref
FROM numbered n
WHERE r.id = n.id;

-- Enforce uniqueness once populated.
CREATE UNIQUE INDEX IF NOT EXISTS reports_report_ref_key ON public.reports(report_ref);

-- Auto-assign report_ref on insert when the caller did not provide one.
-- Low-concurrency safe; a same-millisecond collision is rejected by the unique index.
CREATE OR REPLACE FUNCTION public.set_report_ref()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  day_key text := to_char(now(), 'YYYYMMDD');
  seq int;
BEGIN
  IF NEW.report_ref IS NULL THEN
    SELECT count(*) + 1 INTO seq
    FROM public.reports
    WHERE to_char(created_at, 'YYYYMMDD') = day_key;
    NEW.report_ref := 'DC-' || day_key || '-' || lpad(seq::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_report_ref ON public.reports;
CREATE TRIGGER trg_set_report_ref
  BEFORE INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_report_ref();
