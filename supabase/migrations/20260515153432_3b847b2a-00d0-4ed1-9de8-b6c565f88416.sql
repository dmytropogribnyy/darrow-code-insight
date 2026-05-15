
-- Enums
CREATE TYPE public.module_code AS ENUM ('CORE','LOVE','MONEY','BODY','YEAR','STYLE','PLACE','LOVE_TANDEM');
CREATE TYPE public.order_status AS ENUM ('pending','paid','processing','complete','failed_generation','refunded');
CREATE TYPE public.report_generation_status AS ENUM ('pending','processing','complete','failed_generation');
CREATE TYPE public.generation_job_status AS ENUM ('queued','processing','complete','failed');

-- customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- intakes
CREATE TABLE public.intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  date_of_birth DATE NOT NULL,
  birth_time TIME NULL,
  birth_time_known BOOLEAN NOT NULL DEFAULT false,
  birth_city TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timezone TEXT,
  resolved_birth_place_name TEXT,
  birth_country TEXT,
  timezone_source TEXT,
  geocoding_provider TEXT,
  full_name_for_numerology TEXT,
  partner_data JSONB,
  partner_data_delete_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_intakes_customer ON public.intakes(customer_id);

-- orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  intake_id UUID NOT NULL REFERENCES public.intakes(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_intake ON public.orders(intake_id);

-- modules_purchased
CREATE TABLE public.modules_purchased (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  intake_id UUID NOT NULL REFERENCES public.intakes(id) ON DELETE CASCADE,
  module_code public.module_code NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (customer_id, intake_id, module_code)
);

-- astro_data
CREATE TABLE public.astro_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES public.intakes(id) ON DELETE CASCADE,
  provider_name TEXT,
  provider_version TEXT,
  raw_json JSONB,
  normalized_json JSONB,
  calculation_date DATE,
  timezone_used TEXT,
  birth_time_source TEXT,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_astro_intake ON public.astro_data(intake_id);

-- reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  intake_id UUID NOT NULL REFERENCES public.intakes(id) ON DELETE CASCADE,
  modules_array public.module_code[] NOT NULL DEFAULT ARRAY['CORE']::public.module_code[],
  pdf_url TEXT,
  ai_content_json JSONB,
  download_token TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text,'-',''),
  model_used TEXT,
  generation_status public.report_generation_status NOT NULL DEFAULT 'pending',
  generation_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reports_customer ON public.reports(customer_id);
CREATE INDEX idx_reports_intake ON public.reports(intake_id);

-- subscriptions (dormant, Phase 2)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inactive',
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- stripe_events
CREATE TABLE public.stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- generation_jobs
CREATE TABLE public.generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status public.generation_job_status NOT NULL DEFAULT 'queued',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_generation_jobs_order ON public.generation_jobs(order_id);

-- Enable RLS on all tables (service role bypasses; no public policies)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules_purchased ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astro_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

-- Storage bucket for PDFs (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports','reports', false)
ON CONFLICT (id) DO NOTHING;
