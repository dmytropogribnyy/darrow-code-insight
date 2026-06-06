CREATE OR REPLACE FUNCTION public.set_report_ref()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
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