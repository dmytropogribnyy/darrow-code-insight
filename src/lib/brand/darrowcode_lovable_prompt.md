# Darrow Code Astro Report — Lovable Production Prompt

**How to use:** Paste the four build prompts in sequence: PROMPT 1A → PROMPT 1B → PROMPT 1C → PROMPT 1D. Each builds on the previous. After all four builds, paste PROMPT 2 (polish pass) for visual refinement.

---

## PROMPT 1A — Core App + UI + Supabase Schema

```
Build a premium one-primary-screen astrology web app called Darrow Code Astro Report.
The main experience is a single landing + intake screen, supported by minimal utility routes.

The app sells a $4.99 one-time personalized astrology PDF report, usually generated
in 60–90 seconds from the user's birth data. After purchase, users see 6 optional
add-on modules ($2.99 each) and a FULL CODE bundle option.

No accounts. No login. No dashboard. No subscription. No coming-soon features.
Purchases are linked to customers.id and intakes.id — NOT auth.users.id.
Do NOT enable Supabase Auth.

NOTE: This is PROMPT 1A. After Lovable builds this skeleton, paste PROMPT 1B (Stripe +
payments), then PROMPT 1C (AI + PDF pipeline), then PROMPT 1D (assets + domain + checklist).

================================================================
ARCHITECTURAL ANTICIPATION — FUTURE PHASE 2 FEATURES
================================================================

For MVP, do NOT build the following but anticipate them in schema/structure:

1. LOVE · TANDEM (partner synastry product, Phase 2)
   - Add nullable `partner_data` JSONB column to `intakes` table
   - Reserve `LOVE_TANDEM` value in modules_purchased enum
   - astroProvider.ts interface should declare (but not implement)
     a synastry calculation method
   - This avoids schema migration when Tandem ships

2. FLOW (monthly subscription, Phase 2)
   - Stripe integration can be one-time only for MVP
   - Database must have a `subscriptions` table prepared (dormant for Phase 2):
     id, customer_id, status, stripe_subscription_id, created_at
     (customer_id = customers.id — NOT auth.users.id)

These are dormant placeholders. Do not surface them in UI at launch.

================================================================
VISUAL STYLE — CANONICAL (from Visual Masterfile, LOCKED)
================================================================

⚠️ These are the ONLY colors and fonts allowed in the system.
If a color is not listed here, it does not exist. No deviations.

COLOR TOKENS:
- Warm Paper #F6F4EF       — primary content background (forms, body)
- Midnight Navy #0A0F1E    — hero, dark dividers, dark cover sections
- Luxury Gold #D4AF37      — THE ONLY ACCENT (titles, CTA, logo only)
- Soft Light Grey #E5E7EB  — light text on dark backgrounds
- Muted Grey #9CA3AF       — meta text, "Prepared for", captions
- Warm Dark Brown #4A402D  — page titles, section headings
- Deep Charcoal #151922    — body text on light backgrounds
- Neutral Grey #6B6B6B     — footer, disclaimers, legal only

FONT FAMILIES (load from Google Fonts):
- Cormorant SC             — product titles, hero H1, covers (use #D4AF37)
- Cormorant Garamond       — page titles, section headings (use #4A402D)
- Inter                    — ALL body, UI, forms, checkout (#151922 or #E5E7EB)

No other fonts. No decorative typefaces.

Font import URL:
https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@400;500&family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap

LUXURY GOLD USAGE RULES:
- ✓ Product titles and brand wordmark
- ✓ CTA button borders and CTA text
- ✓ Logo / symbol
- ✗ Never for regular body text
- ✗ Never in footers
- ✗ Never applied mass to surfaces

READABILITY EXCEPTION:
- App sales hero H1: use #F6F4EF or #E5E7EB (ivory/light grey) on dark navy
  for maximum readability and modern feel. Gold on hero H1 is visually heavier.
- PDF cover product titles: keep #D4AF37 (gold on navy for premium feel).

NOTE ON HERO BACKGROUND:
The hero section is the dark exception. Use Midnight Navy #0A0F1E as
background for the hero area only. All other content sections (after
scrolling past hero) use Warm Paper #F6F4EF.

================================================================
SCREEN 1 — Landing + Intake (the only homepage)
================================================================

HEADER BAR (top, with bottom border):
- Left: "DARROW CODE" — uppercase, gold #D4AF37, font-size 11px,
  letter-spacing 4px
- Right: "See a sample →" — small gray link, opens /sample page

TOP BADGE (centered, gold #D4AF37 0.5px border, pill-rounded):
"AI-POWERED PERSONAL ASTROLOGY REPORT · DARROW CODE METHOD · PDF"
(font-size 10px, letter-spacing 2px, gold #D4AF37 text, small gold dot at start)

HEADLINE (serif, 42–44px, ivory):
"Your zodiac sign
is only the surface."
(force line break exactly here)

POSITIONING TAGLINE (serif italic, gold #D4AF37, 17px):
"More than a horoscope. Less than a consultation."

BRAND CONTINUITY LINE (small, centered, 12px muted gray #9CA3AF):
"AI-powered · Built from your birth data · Decoded through the Darrow Code Method"
(Keep subtle. Must not compete with the main headline or CTA.)

EXPLAINER (15px gray, max-width 480px, centered):
"Get a private AI-powered astrology report built from your birth chart —
revealing your love pattern, money code, body rhythm, timing cycle
and direction signal."
(make the 5 element names ivory-white instead of gray to highlight)

QUOTE BOX (left gold #D4AF37 2px border, subtle warm background):
"One astrology tradition shows part of the picture.
Darrow Code reads the full pattern."
(serif italic; second line in gold #D4AF37, not italic)

METHOD LINE (10px gray, letter-spaced 1.5px, centered):
"WESTERN ASTROLOGY · CHINESE BAZI · NUMEROLOGY ·
PATTERN PSYCHOLOGY · AI SYNTHESIS"

FORM BRIDGE LINE (small, centered, 13px muted gray, directly above form):
"Start instantly. Your private report is generated after checkout."

INTAKE FORM (max-width 380px):
Field 1: First name (text, required)
Field 2: Email (email, required, validated)
Field 3+4 (side by side, grid 1.4fr / 1fr):
   - Date of birth (date picker preferred, required; store as ISO YYYY-MM-DD)
   - Birth time — optional, improves precision (store as HH:MM)
     Placeholder: "Birth time — optional, improves precision"
     If omitted: set birth_time_known=false, store birth_time=null
     If provided: set birth_time_known=true
Field 5: City of birth (text, required)
   - Placeholder: "City of birth, e.g. Bratislava, Slovakia"
   - Helper text below field (10px muted gray):
     "Used only to calculate your birth chart timezone and coordinates."
   - Use autocomplete if possible
   - Must resolve to latitude, longitude and IANA timezone before Stripe checkout
   - If location cannot be resolved, show inline error and ask user to refine city
Field 6: Full name for numerology (text, optional)
   - Placeholder: "Full name for deeper numerology — optional"
   - Smaller text, visually de-emphasized (not required)
   - If omitted: calculate Life Path and Personal Year only
   - If provided: also calculate Expression number, Soul Urge, Personality number
   - Store as full_name_for_numerology in intakes table (nullable)

LAUNCH PRICE LABEL (small gold #D4AF37 text, letter-spaced, above CTA):
"LAUNCH PRICE"

CTA BUTTON (large, gold #D4AF37 background, navy #0A0F1E text, full width of form):
"Generate my CORE Report" + price pill showing "$4.99"
(price pill: dark navy background, gold #D4AF37 text, monospace, inside the button)

TRUST ROW (small gray text with dot separators, below CTA):
"Start instantly · Usually 60–90 seconds · Multi-page PDF · No subscription required · Yours forever"
(make "No subscription required" gold #D4AF37 to emphasize)

COPY RULES FOR SPEED LANGUAGE:
Do NOT use: "instant report" / "instant PDF" / "instant results"
Allowed: "Start instantly" / "Instant access" / "Personal PDF in minutes" / "Usually 60–90 seconds"
Reason: The user can start immediately, but PDF generation normally takes 60–90 seconds.

FOOTER WHISPER (serif italic, 13px, faded gray, separated by thin top border):
"When the pattern becomes visible, life gets easier to read."

Below that, in 10px letter-spaced gray:
"POWERED BY THE DARROW CODE METHOD"

DISCLAIMER (10px, very faded gray, bottom):
"For self-reflection and personal insight.
Not medical, legal or financial advice."

================================================================
SCREEN 3 — Generating
================================================================

Full-screen centered loading state, same dark navy aesthetic:
- Animated indicator (subtle, gold #D4AF37)
- Center text (serif, 28px): "Reading the full pattern…"
- Below in 12px gray: "Building your private CORE Report"
- Estimated 60–90 seconds

Behind the scenes, process-generation-job runs the generation sequence:
1. Call astrology data provider for natal chart, transits, numerology, Bazi
2. Call Claude AI with Darrow Code system prompt + astro data
3. Generate styled PDF
4. Save PDF to Supabase Storage
5. Create download_token
6. Send PDF link via email (Resend)

The /generating page polls get-generation-status by stripe_session_id.
When status=complete, redirect to /result/:report_token.

================================================================
SCREEN 4 — Result + Upsell
================================================================

TOP BLOCK:
- Small gold #D4AF37 checkmark icon
- "YOUR CORE IS READY" — letter-spaced gold #D4AF37 label
- Big outlined button (gold #D4AF37 text, gold #D4AF37 border):
  "Download your PDF" with download icon
- Below in 12px gray: "Also sent to your email"

Separated by thin border, then:

CONTEXT LINE (12px muted gray, centered, above upsell header):
"Your CORE Report is complete. These optional chapters expand specific areas."

UPSELL SECTION HEADER (serif 22px):
"Want to go deeper?"

SUBHEAD (13px gray):
"Add a focused chapter — $2.99 each, added to your report"

6 MODULE CARDS (stacked vertically, each clickable to add):
Each card shows: gold #D4AF37 icon + module name (letter-spaced bold) +
one-line description (12px gray) + "+$2.99" price (monospace, right-aligned)

LOVE       — "Who you attract — and why it keeps happening"
MONEY      — "Your real wealth pattern & income mechanism"
BODY       — "Your stress signature & recovery rhythm"
YEAR       — "What this year will demand of you"
STYLE      — "Your colors, aesthetic & personal signature"
PLACE      — "Where you'll thrive — and where to avoid"

FULL CODE BUNDLE CARD (gold #D4AF37 accent, highlighted):
PRICING LOGIC — keep simple, no fractional prices:
- If user owns ONLY CORE: show "Complete your FULL CODE · +$10.00" (flat)
- If user has already bought any individual add-on after CORE:
  HIDE the FULL CODE card and show only remaining add-ons at $2.99 each
- Subtitle when shown: "Unlock all 6 chapters"

NEVER show $14.99 to someone who already paid for CORE — they'll feel
double-charged. NEVER show fractional upgrade prices like +$7.01.

When user selects modules and clicks "Add to my report":
1. New Stripe checkout for the selected modules (one-time payment)
2. After payment: append modules to existing report, regenerate combined PDF
3. New email with updated PDF

================================================================
BACKEND — Supabase
================================================================

Tables:
- customers (id, email, first_name, created_at)
  -- This is a public app table. Do NOT use Supabase Auth.
  -- Do NOT enable login, password, or email verification.
  -- email must be UNIQUE
  -- If same email submits again, reuse the existing customer record (no duplicate)
  -- If same customer buys add-ons later, attach to their existing customer_id
  -- If same customer buys a NEW CORE with different birth data, create a new intake
  -- customer_id means customers.id — NOT auth.users.id
- intakes (id, customer_id, date_of_birth, birth_time, birth_time_known boolean default false,
  birth_city, latitude, longitude, timezone, created_at,
  resolved_birth_place_name text nullable,
  birth_country text nullable,
  timezone_source text nullable,
  geocoding_provider text nullable,
  full_name_for_numerology text nullable,
  partner_data JSONB nullable,
  partner_data_delete_at timestamp nullable)
- orders (id, customer_id, intake_id, stripe_session_id, amount_cents,
  status, created_at)
  -- status enum: pending | paid | processing | complete | failed_generation | refunded
- modules_purchased (id, customer_id, intake_id, module_code, order_id,
  created_at)
  -- module_code enum: CORE, LOVE, MONEY, BODY, YEAR, STYLE, PLACE, LOVE_TANDEM
  -- LOVE_TANDEM is reserved for Phase 2. Do not show in UI at launch.
- astro_data (id, intake_id, provider_name, provider_version,
  raw_json, normalized_json,
  calculation_date, timezone_used, birth_time_source,
  generated_at, created_at)
  -- raw_json: unmodified provider response (archived)
  -- normalized_json: DarrowChartData shape (what Claude receives)
  -- normalized_json must always be present before generate-report runs
- reports (id, customer_id, intake_id, modules_array, pdf_url,
  ai_content_json, download_token, model_used, generation_status,
  generation_error, created_at)
  -- model_used: which Claude model produced this report (for A/B + cost tracking)
  -- generation_status: pending | processing | complete | failed_generation
  -- generation_error: null or error message if failed
- subscriptions (id, customer_id, status, stripe_subscription_id, created_at)
  -- DORMANT. Phase 2 only. Do not surface in MVP UI.
  -- customer_id = customers.id — NOT auth.users.id
- stripe_events (id, stripe_event_id, processed_at, created_at)
  -- stripe_event_id UNIQUE — idempotency guard for all incoming Stripe webhooks
- generation_jobs (id, order_id, status, attempt_count, last_error, created_at, updated_at)
  -- status enum: queued | processing | complete | failed
  -- enqueued by stripe-webhook, executed by process-generation-job
  -- prevents long-running logic inside webhook handler

UNIQUE CONSTRAINTS (required — apply in Supabase schema):
  orders.stripe_session_id UNIQUE
  reports.download_token UNIQUE
  modules_purchased: UNIQUE(customer_id, intake_id, module_code)
  stripe_events.stripe_event_id UNIQUE
  customers.email UNIQUE (already specified above — confirm in schema)

Storage bucket:
- "reports" — private, signed URLs for PDF download

================================================================
ROUTES TO BUILD (MVP)
================================================================

DO include:
- / (Screen 1 — landing + intake)
- /sample (Screen 1.5 — see PROMPT 1D for full spec)
- /generating (Screen 3 — loading state)
- /result/:report_token (Screen 4 — download + upsell)
- /download/:report_token (permanent secure PDF access)
- /privacy, /terms, /contact (simple static pages, footer only)
- Stripe webhook endpoint

DO NOT include:
- User accounts or login system
- Dashboard or user history page
- Subscription pricing anywhere
- Multiple navigation menu items
- Email verification flows
- Password reset
- "Coming soon" sections
- Social sharing buttons
- Promo codes (yet)
- Cookie banner (yet — add later)

Stripe, AI, PDF, and email configuration is in PROMPT 1B and PROMPT 1C.
Assets, SEO, domain, and final checklist are in PROMPT 1D.
```

---

## PROMPT 1B — Stripe + Payment Pipeline

```
This is PROMPT 1B — paste after PROMPT 1A has been built.
Add Stripe payments, checkout flow, and the generation job pipeline.
Do not change: UI, schema, routes, or anything built in PROMPT 1A.

================================================================
SCREEN 2 — Stripe Checkout
================================================================

On form submit:
1. Validate required fields (first name, email, date of birth, city)
2. Resolve birth city → latitude, longitude, timezone (IANA) via geocoding
   If resolution fails: show inline error asking user to refine city.
   Do NOT proceed to payment until location resolves successfully.
3. Save intake data to Supabase (including resolved lat/lon/timezone,
   birth_time_known flag, and birth_time if provided)
4. Create Stripe Checkout Session:
     mode: payment, ONE-TIME, no subscription
     metadata: {
       customer_id,
       intake_id,
       modules_to_purchase: '["CORE"]',
       order_type: "core"
     }
5. Redirect to Stripe Checkout
6. After success → redirect to /generating?session_id=...

NOTE: If user closes browser after payment, the stripe-webhook still fires
and generates the report. Email delivery is the primary fallback.
The email must include the /download/:report_token link so user can always
retrieve their PDF without returning to the browser session.

================================================================
STRIPE INTEGRATION RULE
================================================================

USE LOVABLE'S BUILT-IN PAYMENTS WHEREVER POSSIBLE.

Use Lovable's built-in Payments / Stripe integration to handle:
- One-time checkout session creation
- Stripe product and price object setup
- Test mode payment flow
- Live mode Stripe account connection
- Hosted checkout redirect to Stripe
- Basic payment confirmation plumbing

Do NOT manually rebuild Stripe checkout from scratch unless Lovable's
built-in payments cannot support the required metadata and no-account flow.

Store Stripe secret keys ONLY through Lovable/Supabase secrets manager.
Never expose Stripe keys in frontend code. Never paste them into chat.

PAYMENT MODEL:
- One-time payments only. No subscriptions in MVP.
- No Stripe customer portal.
- No login / no Supabase Auth.
- Purchases linked to customers.id and intakes.id, NOT auth.users.id.

PRODUCTS:
- CORE Report:                     $4.99
- Any single add-on module:        $2.99
- FULL CODE upgrade after CORE:   +$10.00

CHECKOUT SESSION METADATA (required on every session):
  customer_id, intake_id, modules_to_purchase, order_type

Never use user_id in Stripe metadata. customer_id means customers.id.

  CORE purchase:
    modules_to_purchase: '["CORE"]'
    order_type: "core"

  Add-on purchase:
    modules_to_purchase: '["LOVE","BODY"]'  (whichever selected)
    order_type: "addon"

  Full Code upgrade:
    modules_to_purchase: '["LOVE","MONEY","BODY","YEAR","STYLE","PLACE"]'
    order_type: "full_code"

PAYMENT CONFIRMATION — SOURCE OF TRUTH:
Use Stripe webhook as the authoritative source of payment confirmation.
Frontend success redirect is for UX only — do not rely on it for order creation.

The Stripe webhook only confirms payment and enqueues generation.
It must stay fast — do NOT run astro/AI/PDF/email logic inside it.

Webhook fast path:
  1. Verify Stripe webhook signature
  2. Deduplicate event via stripe_events
  3. Create/update paid order in Supabase
  4. Write modules_purchased records
  5. Insert a generation_jobs row (status: queued)
  6. Return HTTP 200 immediately
  7. Trigger process-generation-job asynchronously (EdgeRuntime.waitUntil
     or background Edge Function call)

The process-generation-job function runs the full generation pipeline:
  generate-astro-data → generate-report → validate JSON → generate-pdf →
  create download_token → send email with /download/:report_token

Use Stripe Test Mode for initial build.

================================================================
EDGE FUNCTIONS (Stripe + payment pipeline only)
================================================================

create-checkout-session
  Input: intake_id, modules_to_purchase[]
  Output: Stripe checkout URL

stripe-webhook
  Listens: checkout.session.completed
  CRITICAL: This function must return HTTP 200 IMMEDIATELY after enqueueing.
  Do NOT run astro/AI/PDF/email logic inside the webhook handler.
  Stripe retries if it doesn't receive 2xx within ~30s — long pipelines cause duplicate events.
  Action (fast path only):
    1. Verify Stripe webhook signature
    2. Check idempotency: if stripe_event_id already exists in stripe_events, return 200 immediately
    3. Insert stripe_event_id into stripe_events (dedup guard)
    4. Check if order with this stripe_session_id already exists — if yes, return 200
    5. Create order record (status: paid), write modules_purchased records
    6. Insert a generation_jobs row (status: queued) for this order
    7. Return HTTP 200 immediately
    8. Use EdgeRuntime.waitUntil to trigger process-generation-job asynchronously
       (or invoke it as a background Edge Function call)

process-generation-job
  Input: order_id (from generation_jobs queue)
  Action:
    1. Mark generation_jobs row as processing
    2. Trigger generate-astro-data
    3. After astro_data is saved, trigger generate-report
    4. Trigger generate-pdf (after report JSON saved)
    5. Create download_token and store in reports.download_token
    6. Trigger send-email with APP_BASE_URL/download/{token}
    7. Mark generation_jobs row as complete (or failed on error)

generate-astro-data
  — Stub. Full implementation in PROMPT 1C.
  — process-generation-job calls this first; astro_data must exist before generate-report runs.

generate-report
  — Stub. Full implementation in PROMPT 1C (Claude config, prompt caching, structured JSON output).
  — process-generation-job calls this only after astro_data is saved.

generate-pdf
  — Stub. Full implementation in PROMPT 1C (HTML template + external PDF service).
  — Do NOT use Puppeteer or pdf-lib inside Edge Functions.

get-generation-status
  Input: stripe_session_id
  Action:
    - Find order by stripe_session_id
    - Find latest report associated with that order/intake
    - Return: { status: "processing" | "complete" | "failed_generation" }
    - If complete, also return: { report_token: "..." }
    - NEVER return order_id, customer_id, raw pdf_url, or signed URLs to frontend

send-email
  — Stub. Full implementation in PROMPT 1C (Resend template, email body, subjects).
  — Receives download_url = APP_BASE_URL/download/{token}, NOT a raw Supabase signed URL.

CONFLICT RESOLUTION — if any earlier instruction conflicts with this section:
  - Never use user_id in Stripe metadata — use customer_id only
  - Never show fractional FULL CODE upgrade prices
  - Never proceed to Stripe if geocoding/location resolution fails
  - Stripe webhook must stay thin (no pipeline logic)
  - Token-based routes only: /result/:report_token, /download/:report_token
```

---

## PROMPT 1C — AI + Astrology Provider + PDF + Email

```
This is PROMPT 1C — paste after PROMPT 1B has been built.
Add the AI report generation, astrology data, PDF creation, and email delivery pipeline.
Do not change: UI, schema, Stripe flow, or anything built in PROMPT 1A or 1B.

================================================================
CONFIGURABLE ASTROLOGY PROVIDER LAYER
================================================================

Create a single file: astroProvider.ts

Define an interface:
  interface AstroProvider {
    getNatalChart(input: NatalInput): Promise<ChartData>
    getTransits(input: TransitInput): Promise<TransitData>
    getNumerology(input: { name, date }): Promise<NumerologyData>
    getBaziPillars(input: { date, time }): Promise<BaziData>
    getSynastry?(input: SynastryInput): Promise<SynastryData>
    // getSynastry is optional — declared for Phase 2 (LOVE · TANDEM) only.
    // Do NOT implement or call it in MVP.
  }

For MVP: use a placeholder/mock provider that returns sample data structures.
The real astrology API will be plugged in as a separate concern.

Do NOT hard-code Swiss Ephemeris or any specific provider into the main app
logic. Keep the provider swappable.

RECOMMENDED PROVIDERS (verify current pricing/availability before connecting):
- Western chart + transits + Solar Return: AstrologyAPI or FreeAstroAPI
- Chinese Bazi Four Pillars: FreeAstroAPI (preferred — /api/v1/chinese/bazi,
  returns Four Pillars, Day Master, Ten Gods, Hidden Stems, Element Balance,
  with True Solar Time logic for accurate Hour Pillar)
- Pythagorean numerology (Life Path, Personal Year): calculate in
  Edge Function directly — no API needed for these
- Extended numerology (Expression, Soul Urge, Personality): calculate internally
  from full_name_for_numerology field if provided
- Geocoding + timezone: Geoapify (preferred), Mapbox, or Google
- PDF generation: APITemplate.io (preferred for page-mapped Darrow PDF template)
  or PDFShift (alternative for raw HTML-to-PDF)
  (do NOT use Puppeteer inside Supabase Edge Functions — cold start issues)

⚠️ Do NOT use provider-generated PDF reports as the customer-facing product.
Use providers only for deterministic source data (planets, signs, houses,
aspects, transits, Bazi pillars, numerology numbers).
All interpretation must come from the Darrow Code AI system prompt and
the Darrow Code PDF template.

================================================================
ASTROLOGY API ACCESS — ENVIRONMENT VARIABLES AND SECURITY
================================================================

⚠️ All astrology provider calls must happen ONLY inside Supabase Edge Functions.
Never expose API keys in frontend code. Never call astrology APIs from the browser.

ENVIRONMENT VARIABLES:

  ASTRO_PROVIDER=mock | astrologyapi | freeastroapi | divineapi
  ASTROLOGY_API_USER_ID=
  ASTROLOGY_API_KEY=

  BAZI_PROVIDER=disabled | freeastroapi | asktian
  BAZI_API_KEY=

  GEOCODING_PROVIDER=geoapify | mapbox | google | nominatim
  GEOCODING_API_KEY=

  TIMEZONE_PROVIDER=geoapify | google | timezonedb
  TIMEZONE_API_KEY=

  SYMBOLIC_PROVIDER=disabled | asktian
  SYMBOLIC_API_KEY=

MVP defaults (launch with these):
  ASTRO_PROVIDER=mock
  BAZI_PROVIDER=disabled
  GEOCODING_PROVIDER=geoapify
  TIMEZONE_PROVIDER=geoapify
  SYMBOLIC_PROVIDER=disabled

Real launch values:
  ASTRO_PROVIDER=astrologyapi
  BAZI_PROVIDER=freeastroapi

GEOCODING + TIMEZONE STEP (required before any astrology API call):

User inputs "City of birth" as free text.
Before calling astrology provider, resolve:
  city string → latitude, longitude, IANA timezone

Use Geoapify for MVP and production — supports geocoding, autocomplete and timezone.
Mapbox or Google may be used later if higher accuracy is needed.

⚠️ Do NOT use public Nominatim API for production autocomplete.
Nominatim is allowed only for local development or very low-volume manual testing.

Timezone resolution is required before astrology calculation.
Store resolved values in intakes:
  latitude, longitude, timezone, timezone_source, geocoding_provider

Pass lat, lon, timezone (not city string) to astrology provider.

NORMALIZATION LAYER (required):

All provider responses must be normalized into one internal DarrowChartData
object BEFORE the data is passed to Claude. Claude must never depend on
raw provider response shapes — they differ between providers and versions.

Canonical internal shape:

  {
    "western": {
      "sun":        { "sign": "Cancer", "house": 6, "degree": 12.4 },
      "moon":       { "sign": "Cancer", "house": 6, "degree": 12.8 },
      "ascendant":  { "sign": "Cancer", "degree": 8.1 },
      "aspects":    []
    },
    "transits":   [],
    "bazi": {
      "day_master":       "Wood",
      "element_balance":  {}
    },
    "numerology": {
      "life_path":     8,
      "personal_year": 4
    },
    "bazi_available": false
  }

The normalization function lives in astroProvider.ts alongside the interface.
Mock provider returns this shape with sample data.
Real providers map their response into this same shape.

================================================================
PROVIDER STACK — ROLES AND RULES
================================================================

Use providers for deterministic source data ONLY.
Do NOT use provider-generated PDF reports as the customer-facing product.
All final interpretation must come from the Darrow Code AI system prompt
and the Darrow Code PDF template.

WESTERN_ASTRO_PROVIDER=mock | astrologyapi | freeastroapi | divineapi
  MVP default: mock
  Production preferred: astrologyapi or freeastroapi
  Use for: planets, signs, houses, aspects, transits, Solar Return

BAZI_PROVIDER=disabled | freeastroapi | asktian
  MVP default: disabled
  Production preferred: freeastroapi
  AskTian is optional symbolic enrichment only — NOT the primary Bazi calculator.
  FreeAstroAPI /api/v1/chinese/bazi returns:
    Four Pillars, Day Master, Ten Gods, Hidden Stems,
    Element Balance, True Solar Time
  BAZI FALLBACK RULE (required for MVP with disabled Bazi):
  If BAZI_PROVIDER=disabled or Bazi data is absent from normalized_json:
    Do NOT mention Bazi, Four Pillars, Day Master, Ten Gods, or element balance
    in the AI prompt or any generated content. Use only Western astrology,
    numerology, and timing data. Do NOT let the model invent or hallucinate
    Bazi data. Pass a flag in normalized_json: bazi_available: false.
  Before going live: switch BAZI_PROVIDER=freeastroapi.

NUMEROLOGY_PROVIDER=internal
  Calculate Life Path and Personal Year from date of birth in Edge Function.
  If full_name_for_numerology is provided:
    Calculate Expression, Soul Urge, Personality number internally.
  Do NOT call an external numerology API for MVP.

GEOCODING_PROVIDER=geoapify | mapbox | google | nominatim
  Production default: geoapify
  Nominatim: allowed only for local development or very low-volume testing.
  Do NOT use public Nominatim API for production autocomplete.

TIMEZONE_PROVIDER=geoapify | google | timezonedb
  Resolve IANA timezone from lat/lon before every astrology call.
  Store: timezone, timezone_source, timezone_resolved_at in intakes.

PDF_PROVIDER=apitemplate | pdfshift
  Preferred for page-mapped Darrow reports: apitemplate
  Alternative for raw HTML-to-PDF: pdfshift
  Do NOT use Puppeteer or browser-based rendering inside Supabase Edge Functions.

SYMBOLIC_PROVIDER=disabled | asktian
  MVP default: disabled
  Optional later use: Japanese eto/kanshi, name analysis, cultural calendar
  Do NOT use symbolic provider output as primary interpretation.
  Use structured symbolic data as optional supporting layer only.

================================================================
EXTENDED SYMBOLIC DATA SOURCES
================================================================

The report may use extended symbolic layers ONLY when grounded in available
input data or explicitly derived from normalized chart data.

Do NOT invent unsupported symbolic claims.
Do NOT present symbolic correspondences as medical, financial, romantic,
or spiritual guarantees.

1. WESTERN ASTROLOGY
   Source: Astrology provider API via Supabase Edge Function
   Required data: Sun, Moon, Ascendant, planets, houses, aspects, transits,
     dominant element, modality, MC, house cusps
   Used for: CORE, LOVE, MONEY, BODY, YEAR, STYLE, PLACE

2. CHINESE BAZI / FOUR PILLARS
   Source: FreeAstroAPI, AskTian, or configured Bazi provider
   Required data: Year/Month/Day/Hour pillars, Day Master, Ten Gods if available,
     element distribution, dominant/weak element
   Used for: CORE, MONEY, BODY, YEAR, STYLE, PLACE
   Interpretation rule:
     Wood = growth/direction  |  Fire = visibility/activation
     Earth = stability/digestion  |  Metal = precision/boundaries
     Water = perception/memory
   Do NOT write generic animal-sign horoscopes.

3. CHINESE ZODIAC / STEM-BRANCH SYMBOLISM
   Source: Derived from Bazi Year Branch
   Used for: light supporting symbolism only
   Do NOT say "because you are a Dragon, you are..."
   Use only if it clearly enriches the Bazi element/pillar reading.

4. JAPANESE ETO / KANSHI SYMBOLISM
   Source: Derived from the same stem-branch cycle when available
   Used for: optional cultural mirror only
   Do NOT treat as a separate predictive system.
   Do NOT add as a standalone section. Mention rarely and elegantly.

5. PYTHAGOREAN NUMEROLOGY
   Source: Calculated in Edge Function from date of birth
   Always available: Life Path, Personal Year
   Optional (requires full_name_for_numerology field):
     Expression number, Soul Urge, Personality number
   If full name is NOT provided, do NOT calculate or claim Expression,
   Soul Urge, or Personality numbers.

6. NAME SYMBOLISM
   Source: Optional full_name_for_numerology field in intakes
   Used for: Expression, Soul Urge, Personality number
   If full name is absent, skip this layer entirely.
   Treat as a supporting layer, not the primary identity.

7. COLORS
   Source: STYLE module synthesis — Venus, Ascendant, Moon, dominant element,
     Bazi balance, numerology
   Output: color_palette (3–5 hex codes) + color_names (3–5 elegant names)
   Colors are visual/aesthetic resonance only.
   Do NOT claim that colors attract love, money or protection.

8. STONES, METALS, TEXTURES
   Source: STYLE symbolic synthesis from element balance, Venus/Ascendant tone,
     Moon needs, Bazi missing/supportive element
   Output: 1–3 symbolic material anchors
   Examples: pearl, onyx, jade, garnet, moonstone, smoky quartz, lapis,
     gold, silver, bronze, matte leather, silk, linen
   Use as visual/material anchors only.
   Do NOT claim healing, luck, protection, chakra effects, or guaranteed outcomes.
   Required language: "symbolic anchor" / "material signature" / "aesthetic support"

9. ASTROCARTOGRAPHY / PLACE
   Source: If real astrocartography line data is NOT available,
     derive from Moon, IC, 4H, dominant element, Bazi balance only.
   Recommend environmental types, rhythms and place qualities.
   Do NOT name specific cities unless real astrocartography line data exists.

================================================================
DARROW CODE AI SYSTEM PROMPT (for Claude API calls)
================================================================

⚠️ DO NOT use the legacy short prompt below. It is deprecated.

SOURCE OF TRUTH: darrowcode_ai_system_prompt.md (Production v2.1)

Use the full system prompt from that file when building the
generate-report Edge Function.

The report JSON schema the backend must produce and the PDF template
must consume is:

  client_snapshot (always present):
    pattern_name, core_pattern, unique_signature, primary_strength, pressure_point,
    best_operating_rhythm, current_timing_theme, practical_focus, recommended_next_module

  per module:
    opening, architecture, mechanic, timing, protocols,
    shadow, before_after, next, proof_tags

  per add-on module (additionally):
    module_snapshot:
      main_pattern, main_strength, main_risk,
      practical_protocol, next_step

  STYLE also adds: color_palette, color_names
  FULL CODE also adds: closing.grand_synthesis

Do not build backend or PDF template around any other field names.
If there is any conflict between this file and
darrowcode_ai_system_prompt.md, the ai_system_prompt file wins.

================================================================
CLAUDE / ANTHROPIC CONFIG
================================================================

Use environment variables. Do NOT hard-code model names in code:
  ANTHROPIC_API_KEY=
  ANTHROPIC_MODEL_DEFAULT=claude-opus-4-7
  ANTHROPIC_MODEL_FALLBACK=claude-sonnet-4-6

Prompt caching:
  Use the current Anthropic SDK method — either top-level cache_control
  or explicit cache_control on the fixed Darrow Code system prompt block.
  The system prompt is identical for every user. Caching reduces cost ~90%.

Fallback logic:
  If ANTHROPIC_MODEL_DEFAULT fails (rate limit, timeout, API error):
    - retry once with ANTHROPIC_MODEL_FALLBACK
    - log model_used in reports.model_used for A/B tracking

Sampling params:
  Do NOT set temperature, top_p, or top_k when using claude-opus-4-7
  or claude-sonnet-4-6. Non-default sampling params cause API errors.

================================================================
STRUCTURED JSON OUTPUT
================================================================

Use Anthropic Structured Outputs with JSON schema.
Pass in the API call:
  output_config: { type: "json_schema", json_schema: DarrowReportSchema }

Do NOT rely only on prompt-based JSON instructions.

Validation + retry:
  1. Parse returned JSON and validate against DarrowReportSchema.
  2. If JSON parse or schema validation fails, retry once with the same model.
  3. If retry also fails:
     - set reports.generation_status = failed_generation
     - save error to reports.generation_error
     - notify ADMIN_NOTIFICATION_EMAIL

================================================================
EDGE FUNCTION IMPLEMENTATION (replaces 1B stubs)
================================================================

PROMPT 1B created stubs for these functions. PROMPT 1C must replace
the placeholder behavior with real generation logic.

Do NOT change the thin Stripe webhook or generation_jobs queue.
The webhook continues to enqueue jobs only.
process-generation-job remains the orchestrator.

generate-astro-data
  Input: intake_id
  Action:
    1. Load intake record
    2. Use resolved latitude, longitude, timezone (already stored)
    3. Call astroProvider.ts with configured provider
    4. Calculate Pythagorean numerology internally (no API)
       - Life Path + Personal Year always
       - Expression, Soul Urge, Personality if full_name_for_numerology present
    5. Normalize provider response into DarrowChartData shape
    6. Set bazi_available: false if BAZI_PROVIDER=disabled or data absent
    7. Save raw_json and normalized_json to astro_data table

generate-report
  Input: order_id
  Action:
    1. Load order, intake, customer, astro_data, purchased modules
    2. Build user prompt from normalized astro data + module list
    3. Call Claude API with:
       - Full Darrow Code system prompt (from darrowcode_ai_system_prompt.md, CACHED)
       - User prompt with this client’s data
       - output_config: { type: "json_schema", json_schema: DarrowReportSchema }
    4. Validate returned JSON against DarrowReportSchema
    5. On failure: retry once; on second failure: set failed_generation
    6. Save ai_content_json to reports.ai_content_json
    7. Save model name to reports.model_used
    8. Set generation_status = processing → complete (or failed_generation)

generate-pdf
  Input: report_id
  Action:
    1. Load ai_content_json from reports
    2. Render branded HTML template following PDF CONTENT ARCHITECTURE
    3. Send HTML to external PDF service (APITemplate.io preferred, PDFShift fallback)
       Do NOT use Puppeteer or pdf-lib inside Edge Functions
    4. Save final PDF to Supabase Storage private bucket “reports”
    5. Generate random unguessable download_token (~40 chars, crypto.randomBytes)
    6. Store download_token in reports.download_token
    7. Do NOT return raw Supabase signed URL to email layer

send-email
  Input: order_id, report_token
  Action:
    1. Build permanent download URL: {APP_BASE_URL}/download/{report_token}
    2. Send branded email via Resend (see EMAIL DELIVERY section below)
    3. Do NOT attach the PDF directly
    4. Do NOT email raw Supabase signed URLs

================================================================
EMAIL DELIVERY — REQUIRED
================================================================

Email is required because:
  - The app has no login/dashboard
  - The user may close the browser after payment
  - Add-ons regenerate the report and need a new delivery notice

Use Resend. Environment variable:
  RESEND_API_KEY=

Send email after: CORE generation, any add-on regeneration, FULL CODE regeneration.

Report ready email:
  Subject: "Your Darrow Code report is ready"
  Body:
    Hi {first_name},

    Your Darrow Code report is ready.

    Download your PDF:
    {APP_BASE_URL}/download/{report_token}

    You can return to this link anytime. No account required.

    Darrow Code
    For self-reflection and personal insight.
    Not medical, legal or financial advice.

Generation delay/failure email:
  Subject: "Your Darrow Code report is still being prepared"
  Body:
    Hi {first_name},

    Your payment was successful. Your report is still being prepared
    and we’ll send it to you as soon as it’s ready.

    You do not need to pay again.

    Darrow Code

================================================================
PDF PROVIDER ENV VARS
================================================================

  PDF_PROVIDER=apitemplate | pdfshift
  APITEMPLATE_API_KEY=
  PDFSHIFT_API_KEY=

APITemplate.io preferred for page-mapped Darrow PDF templates.
PDFShift as alternative for raw HTML-to-PDF.
Do NOT use Puppeteer or browser-based rendering inside Supabase Edge Functions.

================================================================
PDF CONTENT ARCHITECTURE — REQUIRED
================================================================

All generated reports must follow the section structure and JSON schema
from darrowcode_ai_system_prompt.md.
Do NOT render AI output as one continuous text block.
Do NOT invent additional section names or rename JSON fields.
Map each JSON field to its corresponding PDF page section.

────────────────────────────────────────
CORE REPORT  ($4.99 · 12–14 pages)
────────────────────────────────────────

JSON fields used:
  modules.CORE.opening, architecture, mechanic, timing, protocols,
  shadow, before_after, next, proof_tags
  + client_snapshot (pattern_name, core_pattern, unique_signature, primary_strength,
    pressure_point, best_operating_rhythm, current_timing_theme,
    practical_focus, recommended_next_module)
  + closing.executive_summary

Page layout:
  Page 1    — Cover: product title + client name + birth data
  Page 2    — Disclaimer + Darrow Code framework explanation
  Page 3    — Client Snapshot: pattern_name + core_pattern + 5 summary lines
               Render `unique_signature` as a highlighted editorial block under Pattern Name.
               Render `practical_focus` as a small practical card near the bottom of this page.
  Page 4    — opening + architecture
  Page 5    — mechanic
  Page 6    — timing
  Pages 7–8 — protocols (with whitespace for PROTOCOL: list items)
  Page 9    — shadow (render as "Warning Signal:" callout box)
  Page 10   — before_after
              (render as stacked "Before:" and "After:" editorial blocks,
               not true columns — single-column layout must be preserved)
  Page 11   — next + executive_summary
  Pages 12–14 — static cross-sell: other available modules

────────────────────────────────────────
ADD-ON MODULES  ($2.99 each · 6–8 pages)
────────────────────────────────────────

Modules: LOVE · MONEY · BODY · YEAR · STYLE · PLACE

Each uses the same 9 JSON fields:
  opening, architecture, mechanic, timing, protocols,
  shadow, before_after, next, proof_tags

Page layout per add-on:
  Page 1   — Module cover: module name + client name
  Page 2   — opening + architecture
  Page 3   — mechanic + timing
  Pages 4–5 — protocols
  Page 6   — shadow + before_after
  Page 7   — next + cross-sell to remaining modules
  Page 8   — closing watermark page (static)

STYLE module exception:
  Also renders color_palette (3–5 hex codes) and color_names as a
  dedicated color swatch section on page 2 or 3.
  Do not skip this — it is core STYLE deliverable.

Each add-on module also renders a module_snapshot quick-reference card
(main_pattern, main_strength, main_risk, practical_protocol, next_step)
on Page 1 (module cover) or Page 7 (before closing watermark).

────────────────────────────────────────
MODULE DATA SOURCES (what feeds each module)
────────────────────────────────────────

  CORE   — Sun, Moon, Ascendant, dominant element, Life Path, Day Master, pillars
  LOVE   — Venus, Mars, Moon, 7H, 5H, Descendant, numerology, Bazi relationship element
  MONEY  — 2H, 8H, 10H, Jupiter, Saturn, Venus, Pluto, Life Path 8/22, Bazi Wealth element
  BODY   — Moon, Mars, 6H, Saturn, dominant element, Bazi element balance
           ⚠️ Always include soft disclaimer: "your system may respond to..."
  YEAR   — Solar Return, major transits, Personal Year, Bazi annual pillar
  STYLE  — Ascendant, Venus, Moon, 2H, dominant element, Bazi balance
  PLACE  — Moon, IC, 4H, dominant element, Bazi balance
           Reference environmental types, not specific cities.

────────────────────────────────────────
FULL CODE  (internal full product value: $14.99 · post-CORE upgrade shown as +$10.00 · ~50 pages)
────────────────────────────────────────

⚠️ Do not display "$14.99 total" on the post-purchase result page.
After CORE purchase, show only: "Complete your FULL CODE · +$10.00".
The $14.99 figure is for reference only — never surfaced to users who already paid for CORE.

Layout:
  Master cover + methodology section
  CORE report (full version, same 12–14 page layout)
  LOVE module (compressed to ~85% of standalone length)
  MONEY module (compressed to ~85%)
  BODY module (compressed to ~85%)
  YEAR module (compressed to ~85%)
  STYLE module (compressed to ~85%, includes color palette)
  PLACE module (compressed to ~85%)
  Grand synthesis: closing.grand_synthesis — 300–400 words
    (meta-level reading across all modules, only present for FULL CODE)
  Closing watermark page (static)

────────────────────────────────────────
PDF DESIGN RULES (apply to all report types)
────────────────────────────────────────

  Background: Warm Paper #F6F4EF for all body pages
  Cover background: Midnight Navy #0A0F1E
  Font: Cormorant Garamond for headings, Inter for body text
  Body text: Deep Charcoal #151922, line-height 1.7–1.75
  Text alignment: ragged-right (no justified text)
  Columns: single column only
  Margins: generous (min 20mm all sides)
  Accent: one gold rule or pull quote per page maximum
  Ornaments: none — whitespace is the luxury signal
  proof_tags: rendered as small-text footnotes or a dedicated tag strip
              at the bottom of each content page
  Symbol watermark: darrow-symbol-small.png at 5–8% opacity, bottom of body pages
  No page should render as a wall of unbroken text.

================================================================
REPORT READING EXPERIENCE — CLIENT-FRIENDLY ASTROLOGY LAYER
================================================================

The report must feel engaging, personal, and readable for a non-technical client.
Do NOT write like an astrology textbook.
Do NOT list placements mechanically.
Do NOT over-explain astrology terminology in the main body.

MAIN BODY STYLE:
- Write in premium editorial language.
- Translate chart data into lived human experience.
- Make the client feel: "This explains me."
- Keep the tone grounded, specific, adult, and emotionally intelligent.
- Use astrology as the hidden structural engine, not as decorative mysticism.

ASTROLOGY PROOF LAYER:
- Every interpretive claim must be grounded in real data points.
- Mention selected placements only when they clarify the point.
- Put most technical confirmations into proof_tags.
- proof_tags should feel like evidence notes, not the main story.
- Example:
    Main text:  "Your system does not trust speed. It opens after consistency."
    proof_tags: ["Moon in Cancer", "Saturn aspect to Venus", "Fixed modality emphasis"]

BALANCE TARGET:
- 80% client-friendly interpretation
- 20% visible astrology / numerology / Bazi confirmation in body text
- Technical anchors concentrated in proof_tags

The client must not need astrology knowledge to enjoy the report.
An astrology-aware reader must feel the interpretation is grounded and non-generic.
This is what separates the Darrow Code product from AI horoscope generators.

================================================================
CLIENT SUMMARY + PRACTICAL RECOMMENDATIONS
================================================================

Every report must leave the client with four things:
1. A clear personal pattern summary
2. A memorable pattern name (archetype label)
3. Practical protocols they can apply immediately
4. A specific next step

CLIENT SNAPSHOT — render in CORE PDF (page 3 or before executive summary):

  Pattern Name:          [archetype label, 2–4 words, specific to chart]
  Core Pattern:          [1–2 sentences]
  Unique Signature:      [1–2 sentences: what makes this configuration distinctive]
  Primary Strength:      [1 sentence]
  Pressure Point:        [1 sentence]
  Best Operating Rhythm: [1 sentence]
  Current Timing Theme:  [1 sentence]
  Practical Focus:       [1 concrete behavior area to pay attention to now]
  Recommended Next Module: [module + one-line reason]

Example Client Snapshot:
  Pattern Name: The Quiet Strategist
  Core Pattern: You are not built for random motion. You process deeply,
    act precisely, and build leverage over time.
  Unique Signature: Your configuration combines deep emotional registration
    with strategic pattern recognition, which means you notice subtle shifts
    before other people can name them.
  Primary Strength: You notice what others miss.
  Pressure Point: You may carry load silently until the system becomes reactive.
  Best Operating Rhythm: Deep focus, slow trust, strong boundaries, clear recovery cycles.
  Current Timing Theme: Stop confusing intensity with direction.
  Practical Focus: Delay important responses when emotionally activated.
  Recommended Next Module: MONEY — your income pattern benefits most from structure now.

MODULE SNAPSHOT — render as quick-reference card in each add-on PDF:

  LOVE Snapshot:    Relationship Pattern / Attraction Loop / Protection Strategy / Protocol
  MONEY Snapshot:   Wealth Mechanism / Income Strength / Money Trap / Protocol
  BODY Snapshot:    Stress Signature / Recovery Need / Overload Signal / Protocol
  YEAR Snapshot:    Year Theme / Main Opportunity / Main Risk / Protocol
  STYLE Snapshot:   Visual Signature / Color Direction / Material Anchor / Protocol
  PLACE Snapshot:   Environmental Pattern / Place Stressor / Supportive Setting / Protocol

PROTOCOL QUALITY RULES:

Do NOT write vague advice such as:
  ✗ trust yourself  ✗ be more confident  ✗ follow your intuition
  ✗ stay positive   ✗ manifest your path ✗ take care of yourself

Use precise, behavior-based language:
  ✓ delay this decision by 24 hours
  ✓ do not answer during emotional activation
  ✓ price from a fixed framework, not from mood
  ✓ schedule recovery before overload hits
  ✓ choose environments with lower sensory pressure
  ✓ test the city for 7 days before committing to relocation

Each protocol must connect to a named chart/Bazi/numerology data point,
but must be understandable without astrology knowledge.

================================================================
SCOPE REMINDER
================================================================

PROMPT 1C covers only: AI, astrology provider, PDF rendering, email delivery.
Do NOT change: routes, UI, sample page, SEO meta, assets, domain setup.
Those are handled in PROMPT 1A and PROMPT 1D.

Conflict resolution for this section:
  - Never hard-code Claude model names
  - Never use Puppeteer/pdf-lib inside Edge Functions
  - Never email raw Supabase signed URLs
  - Never use provider-generated reports/interpretations as the product
  - Bazi fallback rule must be enforced (no hallucinated Bazi data)
```

---

## PROMPT 1D — Assets + Sample Page + SEO + Domain + Final Checklist

```
This is PROMPT 1D — paste after PROMPT 1C has been built.
Add brand assets, sample page, SEO, domain configuration, and final checklist.
Do not change: UI, schema, Stripe flow, AI pipeline, or anything built in PROMPT 1A–1C.

================================================================
BRAND ASSETS — DARROW CODE SYMBOL
================================================================

The Darrow Code gold orbital symbol is the official brand mark.
Use it sparingly, as a brand ritual element — NOT as decoration.

ASSETS REQUIRED (provided by Dmitry before build):
- /brand/darrow-symbol-gold.png        — 1024×1024 transparent, color #D4AF37
- /brand/darrow-symbol-small.png       — 256×256 transparent
- /brand/darrow-favicon.png            — 128×128
- /brand/darrow-social-preview.png     — 1200×630 (OG image)

HUMAN INTERFACE PERSONA:
The brand's human face is Dan Darrow (the Architect / Messenger / Guide).
He is not the hero. The user's pattern is always the focus.
If an avatar appears: Old Money aesthetic, static, navy/gold tones.

USAGE RULES:
- Header stays text-only: "DARROW CODE" in Cormorant SC #D4AF37
  (no symbol next to the wordmark in header)
- DO NOT place a large symbol in the main hero above the headline.
  The hero must remain conversion-focused.
- Use the symbol as favicon / app icon.
- Generating screen: animate the symbol with slow pulse or slow rotation,
  centered above "Reading the full pattern…" text.
- Result screen: small symbol near "YOUR CORE IS READY".
- PDF cover: symbol crisp and centered, Luxury Gold #D4AF37 on Midnight Navy.
- PDF body pages: very subtle watermark at bottom (opacity 5–8%)
  next to page number.
- Social preview / Open Graph: use the social preview image.

ANIMATION ON GENERATING SCREEN:
- Slow pulse (1.5–2 second cycle) or very slow rotation (8–12 sec per cycle).
- Feels like an astronomical instrument activating, not a spinner.
- No bouncing, no childish effects, no excessive glow.

See darrowcode_launch_requirements.md for complete asset spec, timing,
and data source documentation.

HOW TO PROVIDE ASSETS TO LOVABLE:
Option A: Drag-and-drop image files directly into Lovable chat with prompt.
Option B: If GitHub-connected, place files in /public/brand/:
  /brand/darrow-symbol-gold.png      (1024x1024, #D4AF37 on transparent)
  /brand/darrow-symbol-small.png     (256x256, #D4AF37 on transparent)
  /brand/darrow-favicon.png          (128x128)
  /brand/darrow-social-preview.png   (1200x630)
  /brand/email-header.png            (600x200, gold wordmark on navy)
Option C: Use Lovable Dev Mode if available and drop into /public folder.

CANONICAL ASSET MAPPING (do not invent new paths):

  /brand/darrow-favicon.png
    → browser favicon
    → apple touch icon

  /brand/darrow-symbol-gold.png
    → generating screen animated symbol
    → result screen small symbol
    → PDF cover symbol

  /brand/darrow-symbol-small.png
    → subtle PDF body watermark (5–8% opacity)

  /brand/email-header.png
    → branded email header image in Resend templates

  /brand/darrow-social-preview.png
    → Open Graph image (og:image)
    → Twitter / X preview image

  /brand/sample-cover.jpg
    → CORE sample preview image 1 (/sample page)

  /brand/sample-interior.jpg
    → CORE sample preview image 2 (/sample page)

  /brand/sample-closing.jpg
    → CORE sample preview image 3 (/sample page)

  /brand/sample-love.jpg
    → optional future LOVE sample preview (show in LOVE teaser card if present)

  /brand/sample-money.jpg
    → optional future MONEY sample preview (show in MONEY teaser card if present)

  /brand/sample-body.jpg
    → optional future BODY sample preview (show in BODY teaser card if present)

  /brand/sample-year.jpg
    → optional future YEAR sample preview (show in YEAR teaser card if present)

  /brand/sample-style.jpg
    → optional future STYLE sample preview (show in STYLE teaser card if present)

  /brand/sample-place.jpg
    → optional future PLACE sample preview (show in PLACE teaser card if present)

IMPLEMENTATION NOTE — adding module samples later:
  To add module sample previews after launch, upload correctly named JPG files
  into /public/brand/ (e.g. sample-love.jpg). The app checks for these files
  and displays them automatically inside the corresponding teaser card.
  No logic changes required.

OPTIONAL ASSETS (do not generate if not provided):
  /brand/darrow-favicon.ico    — legacy browser favicon (32x32)
  /brand/darrow-app-icon.png   — future PWA icon (512x512)
  If these files are not provided, use darrow-favicon.png only.
  Do NOT generate fake ICO or PWA icons.

RULES:
- Do not generate placeholder graphics. Use only these production assets.
- Preserve the transparent background on the gold symbol.
- The symbol must remain centered and crisp on dark navy backgrounds (#0A0F1E).
- Use the symbol sparingly as a ritual brand element, not decoration.
- Ensure favicon is correctly wired in the app <head> metadata.
- Ensure social preview is wired in SEO / Open Graph metadata.
- Ensure email template uses /brand/email-header.png.

================================================================
DEPLOYMENT + DOMAIN ARCHITECTURE
================================================================

CURRENT SETUP (confirmed):
  Registrar / provider: Namecheap
  Main website: Squarespace (darrowcode.com connected as primary domain)
  Built-in Squarespace domain: impala-porpoise-geft.squarespace.com
  DNS provider shown in Squarespace: Namecheap

PRIMARY DOMAIN: darrowcode.com
  Platform: Squarespace
  Role: brand, trust, SEO, product explanation, sales entry point
  Do NOT build report generation, Stripe checkout, Supabase logic,
  or PDF delivery on Squarespace.

APP SUBDOMAIN: app.darrowcode.com
  Platform: Lovable + Supabase + Stripe + Resend + PDF provider
  Role: intake form → Stripe checkout → generation → result → download

DNS — WHERE TO ADD THE APP SUBDOMAIN RECORD:
  When Lovable provides the DNS record for app.darrowcode.com
  (typically CNAME host: "app", value: something.lovable.app),
  add it in whichever system actually controls DNS:

  OPTION A — If Squarespace DNS Settings allows adding custom records:
    Squarespace → Domains → darrowcode.com → DNS Settings → Edit
    Add the record Lovable provides.

  OPTION B — If Squarespace only shows connected domain but not editable records:
    Namecheap → Domain List → darrowcode.com → Manage → Advanced DNS
    Add the record Lovable provides.

  Because Squarespace shows Provider: Namecheap, Option B is likely.
  Use whichever interface actually lets you add the record.

WHAT NOT TO TOUCH:
  ✗ Do NOT click "Start Transfer" — not needed
  ✗ Do NOT click "Disconnect domain" — will take down the site
  ✗ Do NOT change root DNS records for darrowcode.com or www.darrowcode.com
  ✓ Add ONLY the app subdomain record (host: app)

ROUTING:
  darrowcode.com        → brand / sales / SEO / trust (Squarespace)
  app.darrowcode.com    → CORE intake / payment / generation / result / download (Lovable)

CTA STRATEGY:
  All primary CTA buttons on darrowcode.com must point to:
    https://app.darrowcode.com
  Do not put the intake form or Stripe checkout on Squarespace.

SQUARESPACE SIMPLIFICATION (before public launch):
  Manually rebuild darrowcode.com into a clean marketing entry:
  - One primary offer: CORE Report
  - One primary CTA: "Get your CORE Report →" → https://app.darrowcode.com
  - Remove outdated product logic and navigation complexity
  - Remove old offer confusion
  - Keep FLOW/subscription hidden (Phase 2 only)
  - Brief pages: Home, Method, Sample, About, Contact, Privacy/Terms

================================================================
LAUNCH READINESS
================================================================

The app must be:
- Mobile-first responsive
- Fast loading (no heavy assets)
- Production-ready Stripe integration in TEST mode initially
- Resend integration for email delivery
- Deployable to app.darrowcode.com via Lovable custom domain settings

================================================================
PRODUCTION PATCH — apply these from the start
================================================================

1. AI MODEL VIA ENV VARS + PROMPT CACHING
Do NOT hard-code any AI model name in code.
Use environment variables:
  ANTHROPIC_API_KEY
  ANTHROPIC_MODEL_DEFAULT    (launch value: claude-opus-4-7)
  ANTHROPIC_MODEL_FALLBACK   (launch value: claude-sonnet-4-6)

Why Opus 4.7 for launch:
- First-impression quality matters more than per-call cost at $4.99 price point
- AI cost per report is expected to remain acceptable at launch volume when
  prompt caching is enabled
- Lower volume on launch means total spend is small

CRITICAL — implement prompt caching:
The Darrow Code system prompt is long and identical for every user.
Use Anthropic prompt caching according to the current SDK — either top-level
cache_control or explicit cache_control: { type: "ephemeral" } on the fixed
Darrow Code system prompt block. This can reduce cached system-prompt input
cost by up to ~90% on repeat calls.

Fallback logic: If the default model returns an error, retry once with the
fallback model before failing the request. Log model used per request
(see reports table schema) for future A/B comparison.

2. "90 SECONDS" IS UI MARKETING ONLY
In backend logic and Edge Functions, expect generation can take up to
2–3 minutes worst case. The UI says "90 seconds" but the generating
screen must NOT timeout or show error before ~3 min.
Internal copy: "usually 60–90 seconds" or "about 90 seconds".

3. PDF DELIVERY — DO NOT EMAIL RAW SIGNED URLS
Supabase signed URLs expire. If user opens email 3 days later, link is dead.

Instead: Create a permanent secure download route.
  Route: /download/:report_token

  Implementation:
  - reports table has a download_token column (random, unguessable, ~40 chars)
  - The email contains the route URL with this token, NOT a signed URL
  - When user opens the route, the server validates the token and
    generates a FRESH signed URL on demand, then serves the PDF
  - Token does not expire (or expires after 1 year)
  - This makes PDF accessible forever from the same email link

4. STRIPE METADATA — every Checkout Session must include:
  metadata: {
    customer_id,
    intake_id,
    modules_to_purchase,   // JSON string of module codes
    order_type             // "core" | "addon" | "full_code"
  }
Never use user_id in Stripe metadata. Use customer_id only.
Without this, the webhook can't know what was bought.

5. STRIPE WEBHOOK IDEMPOTENCY
The webhook can fire multiple times for the same event.
Before creating an order:
  - Check if an order with this stripe_session_id already exists
  - If yes, do nothing (do not duplicate)
  - If no, create the order

6. FULL CODE PRICING — KEEP IT SIMPLE
After CORE purchase: show "Complete your FULL CODE · +$10.00" (flat).
After buying individual add-ons:
  - Hide FULL CODE card, OR
  - Show only remaining individual add-ons at $2.99 each
Do NOT show fractional bundle prices like "+$7.01".
At $2.99 unit cost, if user paid for CORE+1 module and upgrades to
FULL CODE for +$10, that's fine — they effectively get a small premium
on the already-purchased module. Acceptable for MVP simplicity.

7. TOKEN-BASED ROUTES (not order_id-based)
For the no-account model, use token-based routes everywhere:
  - /result/:report_token   (post-payment result page)
  - /download/:report_token (permanent PDF access)
The token must be:
  - Random, unguessable, ~40 chars (e.g., crypto.randomBytes(20).toString('hex'))
  - Stored in reports.download_token column
  - Never derived from user_id, order_id, or email
Never expose internal order_id or user_id in user-facing URLs.

8. FAILURE / DELAY HANDLING
If generation takes longer than 3 minutes OR any Edge Function fails
after successful payment:
  - Keep order status as "processing" or "failed_generation" in DB
  - Show user a calm message on /result page:
    "Your report is still being prepared. We'll email it to you
     as soon as it's ready — usually within a few minutes."
  - Do NOT show a payment error if payment succeeded
  - Do NOT ask the user to pay again
  - Log the error to Supabase logs
  - Send an internal notification email to admin (configurable via
    ADMIN_NOTIFICATION_EMAIL env var)

9. ADD-ON STRIPE METADATA

  CORE purchase metadata:
    modules_to_purchase: '["CORE"]'
    order_type: "core"

  Add-on purchase metadata:
    modules_to_purchase: '["LOVE","BODY"]'  (whichever selected)
    order_type: "addon"

  Full Code upgrade metadata:
    modules_to_purchase: '["LOVE","MONEY","BODY","YEAR","STYLE","PLACE"]'
    order_type: "full_code"

  Webhook must use this metadata to know exactly what was purchased.

10. ENVIRONMENT VARIABLES (complete list)

  # App
  APP_BASE_URL=https://app.darrowcode.com
  SUPPORT_EMAIL=
  ADMIN_NOTIFICATION_EMAIL=

  # AI
  ANTHROPIC_API_KEY=
  ANTHROPIC_MODEL_DEFAULT=claude-opus-4-7
  ANTHROPIC_MODEL_FALLBACK=claude-sonnet-4-6

  # Stripe
  STRIPE_SECRET_KEY=
  STRIPE_WEBHOOK_SECRET=

  # Email
  RESEND_API_KEY=

  # PDF
  PDFSHIFT_API_KEY=       (or APITEMPLATE_API_KEY)

  # Astrology providers
  ASTRO_PROVIDER=mock
  ASTROLOGY_API_USER_ID=
  ASTROLOGY_API_KEY=
  BAZI_PROVIDER=disabled
  BAZI_API_KEY=
  GEOCODING_PROVIDER=geoapify
  GEOCODING_API_KEY=
  TIMEZONE_PROVIDER=geoapify
  TIMEZONE_API_KEY=
  SYMBOLIC_PROVIDER=disabled
  SYMBOLIC_API_KEY=

  Use APP_BASE_URL for all result/download links in emails:
    ${APP_BASE_URL}/download/${token}

11. EMAIL TEMPLATES

  Report ready email:
    Subject: "Your Darrow Code report is ready"
    Body:
      Hi {first_name},

      Your CORE Report is ready.

      Download your PDF:
      {APP_BASE_URL}/download/{token}

      You can return to this link anytime. No account required.

      Darrow Code
      For self-reflection and personal insight.
      Not medical, legal or financial advice.

  Generation delay/failure email:
    Subject: "Your Darrow Code report is still being prepared"
    Body:
      Hi {first_name},

      Your payment was successful. Your report is still being prepared
      and we’ll send it to you as soon as it’s ready.

      You do not need to pay again.

      Darrow Code

================================================================
MASTER CONFLICT RESOLUTION (applies across all PROMPT 1A–1D)
================================================================

If any earlier instruction across PROMPT 1A–1D conflicts with these rules,
these rules win:
  - Never hard-code Claude model names
  - Never use Puppeteer/pdf-lib inside Edge Functions
  - Never email raw Supabase signed URLs
  - Never use /result/:order_id — only /result/:report_token
  - Never show fractional FULL CODE upgrade prices
  - Never proceed to Stripe if geocoding/location resolution fails
  - Never expose API keys in frontend code
  - Never use user_id in Stripe metadata — customer_id only
  - Stripe webhook must stay thin (no pipeline logic)
  - Bazi fallback rule must be enforced (do NOT hallucinate Bazi data when disabled)
  - Provider-generated reports/interpretations are forbidden as the customer product
  - No Supabase Auth, no login, no dashboard, no subscription in MVP

================================================================
IMPLEMENTATION CLARIFICATIONS (final)
================================================================

- Use a public `customers` table. Do NOT enable Supabase Auth.
  Do NOT create login, password reset, or email verification flows.
  customer_id means customers.id — it is not related to auth.users.

- The Stripe webhook must NOT run the full generation pipeline directly.
  It must verify signature, deduplicate the event, create/update the paid order,
  write modules_purchased records, enqueue generation_jobs, and return HTTP 200 quickly.

- The process-generation-job function runs the full generation pipeline:
  generate-astro-data → generate-report → validate JSON → generate-pdf →
  create download_token → send-email.

- Do NOT skip generate-astro-data before generate-report.

- The /generating page must poll get-generation-status by stripe_session_id.
  When status=complete, redirect to /result/:report_token.
  The status endpoint must never expose order_id, customer_id, or signed URLs.

- The /sample page uses 3 static images from /brand/:
  sample-cover.jpg, sample-interior.jpg, sample-closing.jpg.
  Do not generate placeholder sample images. If files are not uploaded,
  show empty placeholder slots, not invented content.

- astroProvider.ts must include getSynastry? as an optional interface method.
  Do not implement or call it in MVP. It is reserved for LOVE · TANDEM Phase 2.

- Claude JSON output must be validated against the expected schema
  before saving. Retry once on failure. On second failure:
  set generation_status=failed_generation, notify ADMIN_NOTIFICATION_EMAIL.

================================================================
FINAL PRE-BUILD CHECKLIST
================================================================

Before generating the first build, confirm these are in place:

1. Mock astrology provider active (ASTRO_PROVIDER=mock)
2. All external API keys are server-side only in Supabase Edge Functions
3. Birth city resolved to lat/lon/timezone before Stripe checkout
4. Checkout blocked if location resolution fails
5. birth_time_known=false when user omits birth time
6. CORE checkout metadata: modules_to_purchase=["CORE"], order_type="core"
7. Add-on/FULL CODE metadata explicit (see Payment Model section)
8. Email fallback covers browser-close-after-payment scenario
9. All email links use APP_BASE_URL, not raw Supabase signed URLs
10. customers.email is UNIQUE; existing customer record reused on repeat purchase
11. Supabase Auth is NOT enabled — customers table only
12. /generating polls get-generation-status by stripe_session_id → redirects to /result/:report_token
13. /privacy, /terms, /contact pages exist in footer
14. /sample page is minimal: headline + 3 images + CTA back to intake
15. Lovable built-in Stripe payments are enabled where possible
16. Existing Stripe account is connected or ready to connect in Lovable
17. Stripe Test Mode payment completes successfully end-to-end
18. Checkout metadata (customer_id, intake_id, modules_to_purchase, order_type) is present in Stripe session
19. Successful payment creates order + generation_jobs row in Supabase
20. Generation pipeline runs without requiring user login or Supabase Auth
```

---

## PROMPT 2 — Polish Pass (run after Prompt 1 generates first build)

```
Polish the Darrow Code app to feel more premium and cinematic.

Refinements:

1. HERO TYPOGRAPHY
- Make headline feel larger and more confident on desktop (46–50px)
- Add slight letter-spacing tightening on headline (-0.8px)
- Subtitle "More than a horoscope. Less than a consultation." should
  feel like a refined editorial subheading, not a slogan

2. SPACING
- More vertical breathing room between sections
- Form should feel narrower than the hero text above it
- All sections separated by subtle 0.5px borders, not just whitespace

3. CTA
- Make CTA button feel highly prominent — it's the only action that matters
- Add subtle hover state (slightly brighter gold + 0.98 scale on active)
- Price pill inside button should feel tactile and premium

4. INPUT FIELDS
- Subtle focus state — gold #D4AF37 1px ring, no blue browser default
- Placeholder text should be 14px gray #666, not too light
- Field labels can be omitted if placeholders are clear

5. MOBILE
- On mobile, keep the intake form visible as early as possible.
  If needed, reduce vertical spacing above the form and allow the
  quote box and method line to appear below the form or as
  collapsible / supporting content. Do not bury the form under
  too much introductory copy.
- On mobile, stack date and time inputs vertically
- Headline scales to 32–36px on mobile
- CTA full-width
- All padding reduces by ~25% for narrow viewports

6. MICRO-INTERACTIONS
- Subtle fade-in animations on page load (200–400ms)
- No bouncing, no spinning, nothing childish
- Loading state on Generating screen: slow elegant pulse, not spinner

7. PREMIUM DETAILS
- Quote box has very subtle gold #D4AF37 glow on its left border
- Brand "DARROW CODE" in header has the tiniest letter-spacing tightening
- Method line text has slight character spacing for editorial feel

Keep all copy exactly as before — only refine visual presentation.

Do not add any new pages, features, or content. Just polish what exists.
```

---

## After Lovable builds it — testing checklist

Before connecting app.darrowcode.com (add Lovable DNS record to Namecheap Advanced DNS or Squarespace DNS — wherever records are editable):

- [ ] Form validation works (try blank, try invalid email)
- [ ] Stripe checkout completes in test mode
- [ ] Webhook fires after payment → order created
- [ ] Generating screen polls or subscribes correctly
- [ ] Result screen shows download button
- [ ] PDF actually downloads (even if content is placeholder)
- [ ] Email arrives via Resend
- [ ] FULL CODE shows correct dynamic price (+$10 after CORE)
- [ ] Mobile view tested on iPhone Safari and Android Chrome
- [ ] No console errors

---

## Next steps after MVP works

1. Swap placeholder astrology provider → real API or Swiss Ephemeris layer
2. Refine Darrow Code system prompt with sample reports for tone calibration
3. Build /sample page with 3 PDF preview images
4. Connect app.darrowcode.com to Lovable by adding the DNS record Lovable provides
   in the active DNS manager.
   ⚠️ Domain is registered at Namecheap. If nameservers point to Squarespace,
   add the record in Squarespace DNS settings, not Namecheap Advanced DNS.
   Do NOT change root domain hosting. Keep darrowcode.com on Squarespace.
   Point only the app subdomain to Lovable.
5. Switch Stripe to LIVE mode
6. Launch with TikTok ROLL of "Your zodiac sign is only the surface" videos

---

## PROMPT 3 — Asset Update (paste after uploading brand files to Lovable)

```
Use these uploaded Darrow Code brand assets as the canonical production assets.

Asset mapping:

/brand/darrow-favicon.png
  → browser favicon
  → apple touch icon

/brand/darrow-symbol-gold.png
  → generating screen animated symbol
  → result screen small symbol
  → PDF cover symbol

/brand/darrow-symbol-small.png
  → subtle PDF body watermark (5–8% opacity)

/brand/email-header.png
  → branded email header image for Resend emails

/brand/darrow-social-preview.png
  → Open Graph / social preview image (og:image)
  → Twitter / X preview image

Important:
- Do not generate placeholder graphics anymore.
- Use only these production assets.
- Preserve transparent background on the gold symbol.
- Symbol must remain centered and crisp on dark navy backgrounds (#0A0F1E).
- Use the symbol sparingly as a ritual brand element, not decoration.

Also:
- Ensure favicon is correctly connected in the app <head> metadata.
- Ensure social preview image is connected in SEO / Open Graph metadata.
- Ensure email template uses the provided /brand/email-header.png.
```
