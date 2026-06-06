-- 20260605193000_report_ref_support.sql
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS report_ref TEXT;

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

CREATE UNIQUE INDEX IF NOT EXISTS reports_report_ref_key ON public.reports(report_ref);

-- 20260606120000_report_module_code.sql
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS module_code public.module_code;
CREATE INDEX IF NOT EXISTS idx_reports_module_code ON public.reports(module_code);

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
    NEW.report_ref := 'DC-' || day_key || '-' || lpad(seq::text, 4, '0')
      || CASE WHEN NEW.module_code IS NOT NULL THEN '-' || NEW.module_code::text ELSE '' END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_report_ref ON public.reports;
CREATE TRIGGER trg_set_report_ref
  BEFORE INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_report_ref();