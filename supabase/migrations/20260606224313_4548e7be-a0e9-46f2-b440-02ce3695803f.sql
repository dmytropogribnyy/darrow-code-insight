ALTER TABLE public.orders  ADD COLUMN IF NOT EXISTS continuum_type TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS continuum_type TEXT;
CREATE INDEX IF NOT EXISTS idx_reports_continuum_type ON public.reports(continuum_type);