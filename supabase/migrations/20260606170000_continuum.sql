-- PHASE 5 — CONTINUUM standalone timing products. Additive + backward-compatible.
--
-- Continuum is a separate order type (continuum_7d / continuum_30d), NOT a module and NOT part
-- of CORE Complete. A Continuum purchase reuses the orders/reports tables: orders.continuum_type
-- marks the order for the generation dispatcher; reports.continuum_type marks the report row
-- (modules_array stays empty; report_ref = DC-YYYYMMDD-#### as usual). Nullable columns => legacy
-- rows and the existing flow are untouched when CONTINUUM_ENABLED=0.

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS continuum_type TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS continuum_type TEXT;
CREATE INDEX IF NOT EXISTS idx_reports_continuum_type ON public.reports(continuum_type);
