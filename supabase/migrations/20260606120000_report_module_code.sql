-- BUNDLE-B (increment 1) — per-module report units.
--
-- Additive + backward-compatible. Adds reports.module_code (nullable): legacy combined
-- reports keep module_code = NULL (one row, modules_array = all modules, one combined PDF);
-- new per-module reports set module_code (one row per selected module, own PDF/token/ref).
-- The report_ref trigger is extended to append the module suffix ONLY when module_code is
-- set, so existing rows and the legacy flow are unchanged (DC-YYYYMMDD-#### as before;
-- per-module rows become DC-YYYYMMDD-####-MODULE). Grouping of a purchase's reports is via
-- intake_id + orders.stripe_session_id (unchanged).

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS module_code public.module_code;
CREATE INDEX IF NOT EXISTS idx_reports_module_code ON public.reports(module_code);

-- Extend report_ref generation: append "-MODULE" when module_code is present.
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

-- Re-assert the trigger (idempotent; function body updated above).
DROP TRIGGER IF EXISTS trg_set_report_ref ON public.reports;
CREATE TRIGGER trg_set_report_ref
  BEFORE INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_report_ref();
