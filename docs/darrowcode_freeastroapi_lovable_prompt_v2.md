# Darrow Code — FreeAstroAPI Lovable Prompt v2.0

Generated after re-checking FreeAstroAPI official docs on 2026-05-17.

**Important:** the raw API key is intentionally not stored in this file. Store it only as `FREEASTROAPI_KEY` in Lovable/Supabase Secrets.

---

```text
Darrow Code — FreeAstroAPI Production Integration Patch v2.0

TASK
Replace the mock astrology data provider with real FreeAstroAPI data for Darrow Code reports.
The goal is to generate reports from real deterministic chart data, not mock/fake astrology data.

DO NOT CHANGE
- Stripe checkout flow
- pricing logic
- Supabase Auth rule: no auth, no login, no dashboard
- report JSON schema expected by the PDF template
- Darrow Code AI system prompt voice/style rules
- PDF visual design
- token-based result/download routes
- Resend email delivery flow

SECURITY — REQUIRED
- Do NOT hardcode any API key.
- Do NOT commit the API key into source code, markdown, logs, database rows, or frontend bundles.
- Do NOT call FreeAstroAPI directly from browser/client code.
- All FreeAstroAPI calls must run server-side only: Supabase Edge Functions / backend code.
- Use a single secret/env var:
  FREEASTROAPI_KEY=<store in Lovable/Supabase Secrets only>
- The project owner will provide the current key separately. Store it only as the FREEASTROAPI_KEY secret.

ENVIRONMENT VARIABLES
Set these values:
  ASTRO_PROVIDER=freeastroapi
  BAZI_PROVIDER=freeastroapi
  GEOCODING_PROVIDER=freeastroapi
  TIMEZONE_PROVIDER=freeastroapi
  FREEASTROAPI_KEY=<secret value only>

Remove/stop relying on these for FreeAstroAPI unless existing code requires backward compatibility:
  ASTROLOGY_API_KEY
  BAZI_API_KEY

BASE URL + AUTH
Base URL:
  https://api.freeastroapi.com

Headers for every request:
  x-api-key: process.env.FREEASTROAPI_KEY
  Content-Type: application/json

OFFICIAL ENDPOINTS TO USE
1. City Search / Geocoding:
   GET /api/v2/geo/search?q={query}&limit=10

2. Western Natal:
   POST /api/v1/natal/calculate

3. Western Transits:
   POST /api/v1/transits/calculate

4. Chinese BaZi / Four Pillars:
   POST /api/v1/chinese/bazi

5. Western Solar Return:
   POST /api/v1/western/solar/calculate

CRITICAL CORRECTION
Do NOT use the old/incorrect Solar Return endpoint:
  /api/v1/solar-return/calculate
Use only:
  /api/v1/western/solar/calculate

SECRET SETUP IN LOVABLE
Before implementation, create/update project secret:
  Name: FREEASTROAPI_KEY
  Value: paste the current FreeAstroAPI key provided by the project owner

Then verify server-side access by making a tiny backend-only test request.
Never print the key in logs.

STEP 0 — SAVE THIS REFERENCE FILE
Create or replace:
  src/lib/astro/FREEASTROAPI_REFERENCE.md

The file must document:
- Base URL
- Auth header
- All endpoint paths above
- Request examples
- Unknown birth time rules
- BaZi sex field rule
- Interpretation stripping rule
- Sign normalization map
- Error handling matrix
- Verification checklist

STEP 1 — AUDIT EXISTING CODE FIRST
Read and report findings before implementing:
1. src/lib/astro/types.ts
   - Current DarrowChartData shape
   - Whether solar_return exists
   - Whether transits supports transit_planets, is_applying, high_priority
   - Whether bazi has available/reason/current_luck_cycle fields

2. src/lib/astro/provider.ts
   - How ASTRO_PROVIDER is read
   - Where to add freeastroapi provider case

3. src/lib/astro/mock-provider.server.ts
   - Existing provider interface and method signatures

4. src/lib/generation/pipeline.server.ts
   - How astro_data.normalized_json is passed to AI
   - Confirm pipeline does not depend on mock-only fields

5. src/lib/ai/user-prompt.ts
   - Confirm it serializes normalized DarrowChartData only
   - Confirm it does not pass raw_json or provider interpretation blocks to Claude

After audit, report findings. Then continue only if no blocking conflict is found.

STEP 2 — UI / DATABASE UPDATE FOR BAZI SEX
BaZi endpoint requires sex: "M" or "F" because it affects luck-cycle direction.
Add a small intake field:

Label:
  Birth sex for BaZi calculation
Options:
  Male / Female
Helper text:
  Used only for traditional BaZi timing calculation.

Store in intakes:
  bazi_sex text nullable CHECK (bazi_sex IN ('M','F'))

For MVP, make this required if BAZI_PROVIDER=freeastroapi.
Do not use this field for marketing, identity, personalization, or report language.
Use it only for the BaZi API request.

STEP 3 — CITY SEARCH / LOCATION RESOLUTION
If existing Geoapify location resolution is already working, you may keep it.
Otherwise, use FreeAstroAPI City Search:
  GET /api/v2/geo/search?q={birth_city_query}&limit=10

Rules:
- Frontend must not call FreeAstroAPI directly.
- Frontend calls your backend/edge function.
- Backend calls FreeAstroAPI with FREEASTROAPI_KEY.
- User selects one resolved place before checkout.
- Store: resolved_birth_place_name, birth_city, birth_country, latitude, longitude, timezone, geocoding_provider='freeastroapi', timezone_source='freeastroapi'.
- Do not proceed to Stripe checkout until a valid place is resolved.

STEP 4 — IMPLEMENT PROVIDER
Create:
  src/lib/astro/sign-normalizer.ts
  src/lib/astro/freeastroapi-provider.server.ts

Update:
  src/lib/astro/types.ts
  src/lib/astro/provider.ts

SIGN NORMALIZATION MAP
API returns abbreviated signs in many response fields. Normalize every sign before saving normalized_json:

const SIGN_MAP: Record<string, string> = {
  "Tau": "Taurus",
  "Cap": "Capricorn",
  "Ari": "Aries",
  "Sco": "Scorpio",
  "Pis": "Pisces",
  "Can": "Cancer",
  "Aqu": "Aquarius",
  "Lib": "Libra",
  "Vir": "Virgo",
  "Gem": "Gemini",
  "Leo": "Leo",
  "Sag": "Sagittarius"
}

export const normalizeSign = (s?: string | null): string | null => {
  if (!s) return null
  return SIGN_MAP[s] ?? s
}

PROVIDER FACTORY UPDATE
In src/lib/astro/provider.ts add:

case "freeastroapi":
  if (!process.env.FREEASTROAPI_KEY) {
    throw new Error("FREEASTROAPI_KEY is required when ASTRO_PROVIDER=freeastroapi")
  }
  return new FreeAstroAPIProvider(process.env.FREEASTROAPI_KEY)

Also add startup safety:
If NODE_ENV === "production" AND ASTRO_PROVIDER === "mock", log a visible warning and fail generation unless explicitly overridden by ALLOW_MOCK_ASTRO_IN_PRODUCTION=true.

STEP 5 — FREEASTROAPI REQUESTS
Run these calls in parallel using Promise.allSettled.
Natal is critical; all others fail gracefully.

A) NATAL — CRITICAL
POST /api/v1/natal/calculate

Request shape:
{
  "name": first_name,
  "year": birthYear,
  "month": birthMonth,
  "day": birthDay,
  "time_known": birth_time_known,
  "hour": birth_time_known ? birthHour : undefined,
  "minute": birth_time_known ? birthMinute : undefined,
  "city": resolved_birth_place_name || birth_city,
  "lat": latitude,
  "lng": longitude,
  "tz_str": "AUTO",
  "house_system": "placidus",
  "zodiac_type": "tropical",
  "include_speed": true,
  "include_dignity": true,
  "include_minor_aspects": false,
  "include_stelliums": true,
  "include_features": ["chiron", "lilith", "true_node"],
  "interpretation": { "enable": false }
}

Unknown birth time rules:
- Use time_known=false.
- Do not invent Ascendant, MC, IC, Descendant, houses, or house placements.
- If API omits houses/angles, keep them null/unavailable in normalized_json.
- Claude must receive birth_time_known=false and must not make strong house/angle claims.

Processing:
- If natal fails, abort generation and mark order/report failed_generation.
- Strip interpretation if returned.
- Normalize signs.
- Keep planets, houses, angles_details, aspects, stelliums, confidence.
- Filter aspects to is_major=true for core proof layer unless minor aspects are explicitly needed later.
- Validate when birth_time_known=true:
  angles_details.asc.sign should match houses[0].sign.
  angles_details.mc.sign should match houses[9].sign.
  If mismatch, log warning and prefer houses/angles_details consistently.

B) TRANSITS — GRACEFUL
POST /api/v1/transits/calculate

Request shape:
{
  "natal": {
    "name": first_name,
    "city": resolved_birth_place_name || birth_city,
    "year": birthYear,
    "month": birthMonth,
    "day": birthDay,
    "time_known": birth_time_known,
    "hour": birth_time_known ? birthHour : undefined,
    "minute": birth_time_known ? birthMinute : undefined,
    "lat": latitude,
    "lng": longitude,
    "tz_str": "AUTO"
  },
  "transit_date": new Date().toISOString().slice(0,16),
  "current_city": resolved_birth_place_name || birth_city,
  "current_lat": latitude,
  "current_lng": longitude,
  "tz_str": "AUTO",
  "orb_settings": {
    "Conjunction": 8.0,
    "Opposition": 8.0,
    "Trine": 6.0,
    "Square": 6.0,
    "Sextile": 4.0
  },
  "interpretation": { "enable": false }
}

Processing:
- If rejected, set transits = { available:false, reason:error.message } and continue.
- Strip interpretation if returned.
- Normalize signs.
- Keep transit_planets, natal_planets, aspects, aspects_summary.
- Filter aspects: is_major=true AND orb <= 6.0.
- Add high_priority=true when between.transit is one of: jupiter, saturn, uranus, neptune, pluto.
- Preserve is_applying.

C) BAZI — GRACEFUL BUT IMPORTANT
POST /api/v1/chinese/bazi

If birth time is known:
{
  "year": birthYear,
  "month": birthMonth,
  "day": birthDay,
  "hour": birthHour,
  "minute": birthMinute,
  "city": resolved_birth_place_name || birth_city,
  "lat": latitude,
  "lng": longitude,
  "sex": bazi_sex,
  "time_standard": "true_solar",
  "include_pinyin": true,
  "include_stars": true,
  "include_interactions": true,
  "include_professional": true
}

If birth time is unknown:
- The API requires hour/minute.
- Use hour=12, minute=0 only as a required placeholder for API calculation.
- In normalized_json set:
  bazi.birth_time_known=false
  bazi.hour_pillar_confidence="low"
  bazi.hour_pillar_used_for_interpretation=false
- Do NOT allow Claude to make strong claims from the BaZi Hour Pillar.
- Day Master, year/month/day pillars and element balance may still be used, but hour-pillar-specific claims must be avoided.

Processing:
- If rejected, set bazi = { available:false, reason:error.message } and continue.
- Extract day_master, pillars, elements.percentages, elements.dominant, professional, luck_cycle.pillars, stars, interactions.
- Detect current_luck_cycle where start_year <= currentYear <= end_year.

D) SOLAR RETURN — GRACEFUL
POST /api/v1/western/solar/calculate

Determine srYear:
const today = new Date()
const birthdayThisYear = new Date(today.getFullYear(), birthMonth - 1, birthDay)
const srYear = today >= birthdayThisYear ? today.getFullYear() : today.getFullYear() - 1

Request shape:
{
  "natal": {
    "name": first_name,
    "year": birthYear,
    "month": birthMonth,
    "day": birthDay,
    "time_known": birth_time_known,
    "hour": birth_time_known ? birthHour : undefined,
    "minute": birth_time_known ? birthMinute : undefined,
    "location": {
      "city": resolved_birth_place_name || birth_city,
      "lat": latitude,
      "lng": longitude,
      "timezone": timezone || "AUTO"
    }
  },
  "solar_return": {
    "year": srYear,
    "location": {
      "city": resolved_birth_place_name || birth_city,
      "lat": latitude,
      "lng": longitude,
      "timezone": timezone || "AUTO"
    },
    "settings": {
      "house_system": "placidus",
      "zodiac_type": "Tropical",
      "aspect_set": "major",
      "node_type": "true"
    }
  }
}

Processing:
- If rejected, set solar_return = { available:false, reason:error.message } and continue.
- Strip interpretation if returned.
- Normalize signs.
- Extract exact solar return moment, planets, angles_details, natal_comparison.aspects, natal_comparison.house_overlay, natal_comparison.angularity.
- If birth_time_known=false, do not depend on house overlay or angles if omitted/unavailable.
- Keep top SR-to-natal aspects with orb <= 5.0 sorted by orb ascending.
- Keep angularity entries with orb <= 3.0.

STEP 6 — RAW VS NORMALIZED STORAGE
Save to astro_data:
- provider_name = "freeastroapi"
- provider_version = "freeastroapi-docs-2026-05-17"
- raw_json = raw responses from FreeAstroAPI, after removing any interpretation blocks and never including the API key
- normalized_json = DarrowChartData used by Claude
- calculation_date = current date
- timezone_used = timezone || "AUTO"
- birth_time_source = "exact" if birth_time_known=true, otherwise "unknown"

Claude must receive normalized_json only.
Do not pass raw_json to Claude.
Do not pass interpretation text from FreeAstroAPI to Claude.

STEP 7 — ERROR HANDLING MATRIX
Endpoint failure handling:
- Natal: abort generation, mark failed_generation.
- City Search: block checkout until resolved.
- Transits: set available=false and continue; YEAR module becomes weaker.
- BaZi: set available=false and continue; no Bazi claims in report.
- Solar Return: set available=false and continue; YEAR uses transits + personal year.

On 429:
- Honor Retry-After header.
- Use exponential backoff with jitter.
- Cap retries to avoid loops.

STEP 8 — AI SAFETY RULES
Before calling Claude, ensure the user prompt states:
- Use only available data.
- If bazi.available=false, do not mention BaZi/Four Pillars/Day Master/Ten Gods.
- If birth_time_known=false, do not make strong claims from Ascendant, MC, IC, Descendant, houses, house rulers, or house overlays.
- If solar_return.available=false, do not mention Solar Return.
- If transits.available=false, YEAR module must rely only on Personal Year and available natal/BaZi context.
- Every proof_tag must reference a real available data point.

STEP 9 — VERIFICATION TEST
Run one test order with:
- Name: Alex
- Date of birth: 1990-05-15
- Time: 10:00
- City: Bratislava, Slovakia
- Birth sex for BaZi: Male

After generation, show:
1. astro_data.normalized_json summary
2. Whether natal/transits/bazi/solar_return are available
3. 10+ planets present
4. 12 houses present for known birth time
5. bazi.day_master exists
6. bazi.current_luck_cycle exists, if returned by API
7. transits.aspects include is_applying and high_priority flags where applicable
8. solar_return endpoint used is exactly /api/v1/western/solar/calculate
9. First generated CORE report JSON preview
10. Proof tags showing real chart data

Do not mark the task complete until verification passes.

```

---

## Official docs checked

- https://www.freeastroapi.com/docs
- https://www.freeastroapi.com/docs/auth
- https://www.freeastroapi.com/docs/western/natal
- https://www.freeastroapi.com/docs/western/transits
- https://www.freeastroapi.com/docs/western/solar-return
- https://www.freeastroapi.com/docs/chinese/bazi
- https://www.freeastroapi.com/docs/geo/search
- https://www.freeastroapi.com/pricing



PROMPT 1C PATCH — Numerology + FreeAstroAPI Enrichment

Implement a Darrow Code data enrichment upgrade.

Goal:
Improve report depth without adding risky external dependencies.

Scope:
1. Keep numerology/name numerology fully internal.
2. Add safe FreeAstroAPI enrichment endpoints where useful.
3. Do not change checkout, Stripe, pricing, PDF layout, Resend, Supabase Auth rules, or core Darrow Code report schema unless explicitly required.
4. Keep Geoapify as the checkout geocoding/timezone provider. Do not rewrite PlaceAutocomplete or checkout location resolution.

============================================================
PART 1 — NAME NUMEROLOGY: INTERNAL ONLY
============================================================

Do NOT add external APIs for:
- numerology
- name meaning
- name origin
- gender prediction
- nationality prediction
- ethnicity prediction
- online name search

Do NOT use web search at runtime.

Reason:
Name numerology must be deterministic, privacy-safe, cheap, and fully controllable.

Use only:
- date_of_birth
- optional full_name_for_numerology

If full_name_for_numerology is absent:
- calculate only Life Path, Personal Year, and Birth Day Number
- do not claim Expression, Soul Urge, Personality, Maturity, Hidden Passion, or Karmic Lessons

If full_name_for_numerology is present:
calculate internally:
- Expression Number
- Soul Urge Number
- Personality Number
- Maturity Number
- Hidden Passion Number(s)
- Karmic Lessons
- name_letters_used
- name_normalization_warning if relevant

Create or update:

src/lib/numerology/numerology.ts
src/lib/numerology/numerology-meanings.ts

============================================================
PART 2 — PYTHAGOREAN LETTER MAP
============================================================

Use Pythagorean mapping:

1: A J S
2: B K T
3: C L U
4: D M V
5: E N W
6: F O X
7: G P Y
8: H Q Z
9: I R

Normalize full name:
- uppercase
- remove spaces, hyphens, apostrophes, dots
- remove Latin diacritics via Unicode NFKD normalization
- keep only A-Z letters after normalization
- if fewer than 2 valid letters remain, set name_numerology.available=false with reason="insufficient_latin_letters"

Do not block checkout if name numerology cannot be calculated.
Name numerology is optional enrichment only.

Vowels:
- A, E, I, O, U
- Treat Y as consonant by default.
- Add y_policy="consonant_by_default" to normalized_json.
- Do not try to infer pronunciation.

============================================================
PART 3 — NUMBER REDUCTION RULES
============================================================

Implement:

reduceNumber(n, options)

Rules:
- Reduce by digit sum until 1-9.
- Preserve master numbers 11, 22, 33 only when options.keepMasterNumbers=true.
- Do not preserve arbitrary double numbers like 44, 55, 66.

Calculations:

Life Path:
- Sum all digits of YYYYMMDD.
- Reduce with keepMasterNumbers=true.

Birth Day Number:
- Reduce day number with keepMasterNumbers=true.

Personal Year:
- Use birth month + birth day + current year digits.
- Reduce to 1-9.
- Also store master_marker if intermediate value is 11, 22, or 33, but final personal_year should stay 1-9.

Expression Number:
- Sum all mapped letters in full normalized name.
- Reduce with keepMasterNumbers=true.

Soul Urge Number:
- Sum vowels only.
- Reduce with keepMasterNumbers=true.

Personality Number:
- Sum consonants only.
- Reduce with keepMasterNumbers=true.

Maturity Number:
- Expression Number + Life Path Number.
- Reduce with keepMasterNumbers=true.

Hidden Passion:
- Count frequency of mapped letter values 1-9.
- Highest frequency value(s) = hidden_passion_numbers.
- If tie, return multiple values.

Karmic Lessons:
- Values 1-9 that are missing from the full name letter value frequency.

============================================================
PART 4 — NUMEROLOGY MEANING LAYER
============================================================

Create internal meaning map in:

src/lib/numerology/numerology-meanings.ts

Do not generate long canned text in backend.
Backend should provide concise meaning labels only.

Example structure:

{
  1: {
    core: "self-direction, initiative, identity pressure",
    shadow: "isolation, control, impatience",
    protocol_hint: "decide from direction, not reaction"
  },
  2: {
    core: "sensitivity, mediation, relational intelligence",
    shadow: "over-adaptation, hesitation, emotional over-reading",
    protocol_hint: "separate peacekeeping from self-erasure"
  },
  ...
  11: {
    core: "heightened perception, symbolic sensitivity, signal amplification",
    shadow: "nervous overstimulation, idealization, pressure to be exceptional",
    protocol_hint: "ground insight before acting on it"
  },
  22: {
    core: "large-scale building, structural vision, practical mastery",
    shadow: "over-responsibility, pressure, delayed action",
    protocol_hint: "turn scale into steps"
  },
  33: {
    core: "care, teaching, emotional responsibility, service through presence",
    shadow: "rescuer pattern, guilt, self-sacrifice",
    protocol_hint: "serve without becoming the container for everyone"
  }
}

Language rules:
- No destiny language.
- No “your name means you are…”
- No “soul mission”.
- No “lucky number”.
- No “vibration”.
- No mystical claims.
- Use Darrow Code language: structure, mechanism, operating pattern, pressure point.

============================================================
PART 5 — NORMALIZED JSON OUTPUT
============================================================

Extend normalized_json.numerology to include:

numerology: {
  available: true,
  life_path: number,
  birth_day_number: number,
  personal_year: number,
  personal_year_master_marker?: number | null,

  name_numerology: {
    available: boolean,
    reason?: string,

    source_name_present: boolean,
    normalized_name?: string,
    name_letters_used?: number,
    y_policy?: "consonant_by_default",

    expression?: number,
    soul_urge?: number,
    personality?: number,
    maturity?: number,
    hidden_passion_numbers?: number[],
    karmic_lessons?: number[],

    meanings?: {
      expression?: { core: string, shadow: string, protocol_hint: string },
      soul_urge?: { core: string, shadow: string, protocol_hint: string },
      personality?: { core: string, shadow: string, protocol_hint: string },
      maturity?: { core: string, shadow: string, protocol_hint: string }
    }
  }
}

Do not store or send unnecessary raw full name beyond what already exists in intake.
Claude should receive normalized numerology data, not a large name-analysis essay.

============================================================
PART 6 — HOW CLAUDE SHOULD USE NAME NUMEROLOGY
============================================================

Update user-prompt builder, not the Darrow Code system prompt unless required.

When name_numerology.available=true, include a compact block in the user prompt:

NAME NUMEROLOGY DATA:
- Expression Number: X — [core / shadow / protocol_hint]
- Soul Urge Number: X — [core / shadow / protocol_hint]
- Personality Number: X — [core / shadow / protocol_hint]
- Maturity Number: X — [core / shadow / protocol_hint]
- Hidden Passion: X
- Karmic Lessons: X, Y
- Use only when it converges with astrology or BaZi data.
- Do not overuse.
- Do not create a separate generic numerology report.
- Blend it into client_snapshot, CORE architecture, MONEY, STYLE, or proof_tags only when relevant.

Rules for AI output:
- Every name numerology claim must cite the exact number in proof_tags or in body.
- Good: “Expression 8 reinforces the Saturn/Jupiter money architecture: value improves when pressure is structured before emotion enters.”
- Bad: “Your name vibration means you are destined for wealth.”
- Bad: “Your name shows your soul mission.”
- Bad: “Because your name number is 6, you are a healer.”

============================================================
PART 7 — FREEASTROAPI EXTRA ENDPOINTS TO ADD
============================================================

Keep current core calls:
1. Natal
2. Transits
3. BaZi
4. Solar Return

Add these safe enrichments:

A) Moon Phase — add now, graceful failure

Endpoint:
GET /api/v1/moon/phase

Use for:
- YEAR timing tone
- BODY emotional rhythm nuance
- STYLE symbolic visual layer
- optional PDF visual detail if easy

Call:
GET /api/v1/moon/phase?date={currentDate}T12:00:00&lat={birth_latitude}&lon={birth_longitude}&include_zodiac=true&include_forecast=true&include_special=true&include_eclipse=true&include_traditional_moon=true&include_visuals=false&include_interpretation=false

Important:
- include_interpretation=false
- Do not pass FreeAstroAPI interpretation text to Claude.
- Store only deterministic fields:
  phase.name
  phase.illumination
  phase.age_days
  phase.is_waxing
  zodiac.sign
  next_phases
  special_moon.labels
  eclipse summary if present
  forecast

On failure:
moon_phase = { available:false, reason:error.message }
Do not fail the order.

B) BaZi Flow — add now if bazi_sex is available, graceful failure

Endpoint:
POST /api/v1/chinese/bazi/flow

Use for:
- YEAR module
- current timing layer
- BaZi annual/monthly context

Request:
{
  "year": birthYear,
  "month": birthMonth,
  "day": birthDay,
  "hour": birthHourOr12,
  "minute": birthMinuteOr0,
  "city": birth_city,
  "lat": latitude,
  "lng": longitude,
  "sex": bazi_sex,
  "target_year": currentYear,
  "target_year_end": currentYear,
  "mode": "summary",
  "include": ["interactions", "stars"],
  "dictionary_response": false
}

Important:
- Do not request more than 1 year.
- If bazi_sex is missing, skip and set bazi_flow.available=false reason="missing_bazi_sex".
- If birth time unknown, use 12:00 only for BaZi technical calculation and mark time_confidence="reduced".
- Do not make precise hour-pillar claims if birth time is unknown.

On failure:
bazi_flow = { available:false, reason:error.message }
Do not fail the order.

C) Astrocartography Lines — Phase 2 / PLACE only, not global now

Endpoint:
POST /api/v1/western/astrocartography/lines

Do not call this for every report yet.

Use only when:
- PLACE module is purchased
- birth_time_known=true
- latitude/longitude/timezone are resolved
- endpoint access is available for the current plan

Request:
{
  "natal": {
    "year": birthYear,
    "month": birthMonth,
    "day": birthDay,
    "hour": birthHour,
    "minute": birthMinute,
    "city": birth_city,
    "lat": latitude,
    "lng": longitude,
    "tz_str": timezone,
    "time_known": true,
    "house_system": "placidus"
  },
  "bodies": ["sun", "moon", "venus", "jupiter", "saturn"],
  "angles": ["asc", "mc", "ic", "dsc"],
  "include_crossings": false
}

Important:
- Do not set include_crossings=true because it may require higher plan access.
- Do not fail PLACE if astrocartography fails.
- If available, normalize only lightweight line metadata. Do not pass huge raw GeoJSON to Claude.
- For Claude, summarize nearest/strongest line categories if a location/city check exists later.
- For MVP, if no city check is implemented, keep PLACE environmental rather than city-specific.

D) Do NOT add these now:
- Moon Phase Timeline /api/v1/moon/month — requires Entry/High; not needed for MVP.
- Synastry — reserve for LOVE_TANDEM Phase 2.
- BaZi Synastry — reserve for LOVE_TANDEM Phase 2.
- Health & Constitution / Neijing Life Curve — avoid medical risk.
- Psychological Reports / Daily Sign / Daily Personal — do not use provider-generated interpretations.
- SVG charts — optional visual enhancement later, not required for data quality.

============================================================
PART 8 — EXTEND DARROWCHARTDATA
============================================================

Add optional fields:

moon_phase?: {
  available: boolean
  phase?: {
    name: string
    illumination?: number
    age_days?: number
    is_waxing?: boolean
  }
  zodiac?: {
    sign: string
    degree?: number
  }
  next_phases?: Record<string, string>
  special_moon?: {
    labels?: string[]
    is_supermoon?: boolean
    is_blue_moon?: boolean
  }
  eclipse?: {
    is_eclipse?: boolean
    type?: string
    days_from_query?: number
  }
  forecast?: Record<string, any>
  reason?: string
}

bazi_flow?: {
  available: boolean
  target_year?: number
  interactions?: any[]
  stars?: any[]
  summary?: any
  reason?: string
}

astrocartography?: {
  available: boolean
  source?: "freeastroapi"
  calculated_for_place_module?: boolean
  lines_summary?: Array<{
    body: string
    angle: string
    id: string
  }>
  reason?: string
}

============================================================
PART 9 — DATA SOURCE PRIORITY FOR MODULES
============================================================

CORE:
- Natal
- BaZi
- Life Path
- Expression/Soul Urge/Personality only if full_name_for_numerology exists

LOVE:
- Venus, Mars, Moon, 5H, 7H, Descendant
- Name numerology only if it converges with relationship pattern
- Do not use synastry in MVP

MONEY:
- 2H, 6H, 8H, 10H, Jupiter, Saturn, Venus, Pluto
- Life Path, Expression, Maturity
- BaZi favorable/unfavorable elements and structure

BODY:
- Moon, Mars, Saturn, 6H
- BaZi element imbalance
- Moon Phase as soft rhythm note
- No medical claims

YEAR:
- Transits
- Solar Return
- Personal Year
- BaZi Flow
- Moon Phase
- Slow transits have priority over daily moon data

STYLE:
- Venus, Ascendant, Moon
- BaZi element balance
- Expression/Soul Urge as optional aesthetic nuance
- Moon Phase as optional symbolic visual layer
- Internal color/material map only

PLACE:
- Moon, IC, 4H, angular planets
- BaZi favorable elements
- Astrocartography only if PLACE purchased and birth_time_known=true
- Otherwise describe environmental qualities, not specific cities

============================================================
PART 10 — ABSOLUTE RULES
============================================================

Do not expose API keys in frontend.
Use FREEASTROAPI_KEY from server-side secrets only.

Do not change checkout geocoding. Keep Geoapify.

Do not use FreeAstroAPI interpretation text.
Always request provider interpretation disabled when available.
Strip interpretation blocks if returned.

Do not use external name-origin/gender/nationality/ethnicity APIs.

Do not make medical, legal, financial, healing, lucky, protection, or guaranteed attraction claims.

Do not fail the order if Moon Phase, BaZi Flow, or Astrocartography fails.

Natal is critical.
Transits, BaZi, Solar Return, Moon Phase, BaZi Flow are enrichment layers with graceful fallback.

============================================================
PART 11 — VERIFICATION
============================================================

After implementation, run a test order:

Name: Alex
Full name for numerology: Alex Morgan
DOB: 1990-05-15
Time: 10:00
City: Bratislava, Slovakia
Birth sex for BaZi: M

Show:
1. normalized_json.numerology
2. normalized_json.moon_phase
3. normalized_json.bazi_flow
4. normalized_json.western.sun/moon/ascendant if available
5. normalized_json.bazi.day_master
6. Whether any FreeAstroAPI interpretation blocks were stripped
7. First generated CORE report JSON preview
8. Proof tags showing real data anchors

Do not skip verification.


FreeAstroAPI core probe is green. Proceed with the next patch:

PROMPT 1C PATCH — Internal Numerology + FreeAstroAPI Enrichment

Goal:
Improve Darrow Code report depth while keeping the customer-facing report human-readable, premium, emotionally intelligent, and aligned with the existing Darrow Code system.

This is NOT a technical astrology dump.
This is NOT a generic numerology report.
This is NOT a mystical/moon/crystal content expansion.

All new data layers must remain supporting source data for the existing Darrow Code interpretation engine.

============================================================
SOURCE OF TRUTH
===============

Use these existing project rules as source of truth:

1. Darrow Code AI System Prompt

* Product voice only
* Warm Architect 70/30 balance
* Dinner Table Test
* Proof tags as evidence notes
* No destiny / vibration / lucky / soul mission / generic horoscope language
* Every interpretive claim must anchor in a named data point

2. Lovable production prompt

* 80% client-friendly interpretation
* 20% visible astrology / numerology / BaZi confirmation
* Technical data mostly belongs in proof_tags
* The report must be readable for a non-technical client
* Do not write like an astrology textbook
* Do not mechanically list placements

3. Current verified FreeAstroAPI layer

* Natal, Transits, BaZi, Solar Return are already green
* provider_name=freeastroapi
* interpretation_leak=false
* transits available
* BaZi available
* Solar Return available
* current_luck_cycle structured
* hybrid endpoint strategy working under Worker budget

Do not break the verified FreeAstroAPI core layer.

============================================================
DO NOT CHANGE
=============

Do NOT change:

* checkout flow
* Stripe
* pricing
* PDF layout
* Resend/email delivery
* token routes
* Supabase Auth rule
* Geoapify checkout geocoding
* report JSON schema unless a small additive field is required
* existing Darrow Code AI system prompt unless a tiny clarification is required
* working FreeAstroAPI core endpoints
* current hybrid concurrency strategy unless needed for budget safety

Keep Geoapify for:

* city autocomplete
* birth city resolution
* lat/lng
* timezone before checkout

Keep FreeAstroAPI for:

* astrology calculations only
* deterministic source data only

============================================================
CUSTOMER-FACING OUTPUT GUARDRAIL
================================

All new layers must make the final report feel:

* more personal
* more accurate
* more specific
* richer
* more human-readable
* more premium

They must NOT make the report:

* more technical
* more textbook-like
* more mystical
* more generic
* more list-like
* more “AI generated”

Do not create customer-facing standalone sections like:

* “Your Name Numerology”
* “Your Moon Phase Meaning”
* “Your BaZi Flow Reading”
* “Your Lucky Numbers”
* “Your Moon Energy”

Instead, blend these layers only when they converge with Western astrology, BaZi, transits, Solar Return, or the module theme.

Good customer-facing style:
“Your system works best when pressure becomes structure before emotion enters the decision.”

Good proof_tags:
“Expression 8 · Saturn transit · Geng Day Master”

Bad customer-facing style:
“Your Expression Number is 8, which means you are destined for power.”
“Your name vibration shows your soul mission.”
“Your moon phase energy will attract luck.”
“BaZi Flow says you will have a lucky year.”

============================================================
PART 1 — INTERNAL NUMEROLOGY ONLY
=================================

Do NOT add external APIs for:

* numerology
* name meaning
* name origin
* gender prediction
* nationality prediction
* ethnicity prediction
* online name search

Do NOT use web search at runtime.

Use only:

* date_of_birth
* optional full_name_for_numerology

If full_name_for_numerology is absent:

* calculate only:

  * Life Path
  * Personal Year
  * Birth Day Number
* set name_numerology.available=false with reason="full_name_not_provided"
* do not claim Expression, Soul Urge, Personality, Maturity, Hidden Passion, or Karmic Lessons

If full_name_for_numerology is present:
calculate internally:

* Expression Number
* Soul Urge Number
* Personality Number
* Maturity Number
* Hidden Passion Number(s)
* Karmic Lessons
* name_letters_used
* name_normalization_warning if relevant

Create or update:

* src/lib/numerology/numerology.ts
* src/lib/numerology/numerology-meanings.ts

Do not block checkout if name numerology cannot be calculated.
Name numerology is optional enrichment only.

============================================================
PART 2 — PYTHAGOREAN LETTER MAP
===============================

Use Pythagorean mapping:

1: A J S
2: B K T
3: C L U
4: D M V
5: E N W
6: F O X
7: G P Y
8: H Q Z
9: I R

Normalize full name:

* uppercase
* remove spaces, hyphens, apostrophes, dots
* remove Latin diacritics via Unicode NFKD normalization
* keep only A-Z letters after normalization
* if fewer than 2 valid letters remain, set name_numerology.available=false with reason="insufficient_latin_letters"

Vowels:

* A, E, I, O, U
* Treat Y as consonant by default
* Add y_policy="consonant_by_default" to normalized_json
* Do not infer pronunciation

============================================================
PART 3 — NUMBER REDUCTION RULES
===============================

Implement reduceNumber(n, options).

Rules:

* Reduce by digit sum until 1-9.
* Preserve master numbers 11, 22, 33 only when options.keepMasterNumbers=true.
* Do not preserve arbitrary double numbers like 44, 55, 66.

Calculations:

Life Path:

* Sum all digits of YYYYMMDD.
* Reduce with keepMasterNumbers=true.

Birth Day Number:

* Reduce day number with keepMasterNumbers=true.

Personal Year:

* Use birth month + birth day + current year digits.
* Reduce to 1-9.
* Also store personal_year_master_marker if intermediate value is 11, 22, or 33.
* Final personal_year should stay 1-9.

Expression Number:

* Sum all mapped letters in full normalized name.
* Reduce with keepMasterNumbers=true.

Soul Urge Number:

* Sum vowels only.
* Reduce with keepMasterNumbers=true.

Personality Number:

* Sum consonants only.
* Reduce with keepMasterNumbers=true.

Maturity Number:

* Expression Number + Life Path Number.
* Reduce with keepMasterNumbers=true.

Hidden Passion:

* Count frequency of mapped letter values 1-9.
* Highest frequency value(s) = hidden_passion_numbers.
* If tie, return multiple values.

Karmic Lessons:

* Values 1-9 missing from the full name letter value frequency.

============================================================
PART 4 — NUMEROLOGY MEANING LAYER
=================================

Create internal meaning map in:
src/lib/numerology/numerology-meanings.ts

Do not generate long canned text in backend.
Backend should provide concise meaning labels only.

Meaning object shape:
{
core: string,
shadow: string,
protocol_hint: string
}

Language rules:

* No destiny language.
* No “your name means you are...”
* No “soul mission”.
* No “lucky number”.
* No “vibration”.
* No mystical claims.
* No “healer” identity labels.
* Use Darrow Code language:

  * structure
  * mechanism
  * operating pattern
  * pressure point
  * protocol
  * configuration
  * signal
  * rhythm

Include meanings for:
1,2,3,4,5,6,7,8,9,11,22,33

Example tone:

1:
core: "self-direction, initiative, identity pressure"
shadow: "isolation, control, impatience"
protocol_hint: "decide from direction, not reaction"

8:
core: "value structure, pressure management, material responsibility"
shadow: "control through achievement, tension around worth, over-identification with results"
protocol_hint: "define value before emotion enters the decision"

11:
core: "heightened perception, symbolic sensitivity, signal amplification"
shadow: "nervous overstimulation, idealization, pressure to be exceptional"
protocol_hint: "ground insight before acting on it"

22:
core: "large-scale building, structural vision, practical mastery"
shadow: "over-responsibility, pressure, delayed action"
protocol_hint: "turn scale into steps"

33:
core: "care, teaching, emotional responsibility, service through presence"
shadow: "rescuer pattern, guilt, self-sacrifice"
protocol_hint: "serve without becoming the container for everyone"

Keep meanings concise. Claude will do the interpretation.

============================================================
PART 5 — NORMALIZED JSON OUTPUT
===============================

Extend normalized_json.numerology to include:

numerology: {
available: true,
life_path: number,
birth_day_number: number,
personal_year: number,
personal_year_master_marker?: number | null,

name_numerology: {
available: boolean,
reason?: string,

```
source_name_present: boolean,
normalized_name?: string,
name_letters_used?: number,
y_policy?: "consonant_by_default",
name_normalization_warning?: string | null,

expression?: number,
soul_urge?: number,
personality?: number,
maturity?: number,
hidden_passion_numbers?: number[],
karmic_lessons?: number[],

meanings?: {
  expression?: { core: string, shadow: string, protocol_hint: string },
  soul_urge?: { core: string, shadow: string, protocol_hint: string },
  personality?: { core: string, shadow: string, protocol_hint: string },
  maturity?: { core: string, shadow: string, protocol_hint: string }
}
```

}
}

Do not send a large name-analysis essay to Claude.
Claude should receive compact deterministic numerology data only.

Do not store unnecessary raw full name beyond the existing intake field.
Do not expose full name in logs unless already standard for intake debugging.

============================================================
PART 6 — USER PROMPT BUILDER UPDATE
===================================

Update:
src/lib/ai/user-prompt.ts

When name_numerology.available=true, include compact data:

NAME NUMEROLOGY DATA:

* Expression Number: X — core / shadow / protocol_hint
* Soul Urge Number: X — core / shadow / protocol_hint
* Personality Number: X — core / shadow / protocol_hint
* Maturity Number: X — core / shadow / protocol_hint
* Hidden Passion: X
* Karmic Lessons: X, Y

Add these instructions to Claude in the user prompt:

Use name numerology only when it converges with astrology, BaZi, transits, Solar Return, or module theme.

Do not create a separate generic numerology report.

Do not overuse name numerology.

Do not use name numerology to make identity claims.

Do not use name-origin, ethnicity, nationality, or gender assumptions.

Blend name numerology into:

* client_snapshot
* CORE architecture
* MONEY
* STYLE
* proof_tags

Only use it when relevant.

Every name numerology claim must cite the exact number in proof_tags or body.

Good:
“Expression 8 reinforces the Saturn/Jupiter money architecture: value improves when pressure is structured before emotion enters.”

Bad:
“Your name vibration means you are destined for wealth.”
“Your name shows your soul mission.”
“Because your name number is 6, you are a healer.”

============================================================
PART 7 — FREEASTROAPI ENRICHMENT ENDPOINTS
==========================================

Keep current verified core calls:

1. Natal
2. Transits
3. BaZi
4. Solar Return

Add only these enrichment endpoints now:

A) Moon Phase — add now, graceful failure

Endpoint:
GET /api/v1/moon/phase

Use for:

* YEAR timing tone
* BODY emotional rhythm nuance
* STYLE symbolic visual layer

Use report generation date as the date.

Use birth location as location fallback:

* lat = birth latitude
* lon = birth longitude
* tz_str = stored birth timezone

Do not collect current location now.
Do not change intake.

Query flags:

* include_zodiac=true
* include_special=true
* include_eclipse=true
* include_forecast=true
* include_traditional_moon=true
* include_visuals=false
* include_interpretation=false

Important:

* Do not pass provider interpretation text to Claude.
* Request include_interpretation=false.
* Strip interpretation / interpretations recursively if returned.
* Do not store SVG visuals now.
* Do not render moon visuals in PDF now unless already trivial and non-disruptive.

Store only compact deterministic fields:
moon_phase: {
available: boolean,
timestamp?: string,
phase?: {
name: string,
illumination?: number,
age_days?: number,
phase_angle_deg?: number,
is_waxing?: boolean
},
zodiac?: {
sign: string,
degree?: number,
zodiac_type?: string
},
next_phases?: Record<string, string>,
special_moon?: {
labels?: string[],
is_supermoon?: boolean,
is_blue_moon?: boolean,
is_harvest_moon?: boolean,
is_hunter_moon?: boolean
},
eclipse?: {
is_eclipse?: boolean,
is_blood_moon?: boolean,
type?: string,
days_from_query?: number
},
traditional_moon?: {
name?: string,
month?: string,
is_current_full_moon?: boolean
},
forecast?: {
days_until_full_moon?: number,
days_until_new_moon?: number,
next_special_moon?: any,
next_eclipse?: any
},
reason?: string
}

On failure:
moon_phase = { available:false, reason:error.message }

Do not fail the order if Moon Phase fails.

B) BaZi Flow — add now, graceful failure

Endpoint:
POST /api/v1/chinese/bazi/flow

Use for:

* YEAR module
* current timing layer
* BaZi annual/monthly context

Request requirements:

* target_year = currentYear
* target_year_end = currentYear
* mode = "summary"
* include = ["interactions", "stars"]
* dictionary_response = false
* sex = bazi_sex

Use the same birth data already used for BaZi:

* year
* month
* day
* hour
* minute
* city
* lat
* lng
* sex

Important:

* Do not request multi-year ranges.
* Do not use mode="standard" or mode="debug" for production report generation.
* If bazi_sex is missing, skip and set bazi_flow.available=false reason="missing_bazi_sex".
* If birth time unknown, use 12:00 only for technical calculation and mark time_confidence="reduced".
* Do not make precise hour-pillar claims if birth time is unknown.
* Strip all provider prose / interpretation / rationale / advice.
* Keep only compact structured fields.

Normalize to:

bazi_flow: {
available: boolean,
target_year?: number,
target_year_end?: number,
annual_pillar?: {
year: number,
gan_zhi?: string,
gan?: string,
zhi?: string,
gan_pinyin?: string,
zhi_pinyin?: string,
ten_god?: string
},
monthly_pillars?: Array<{
index?: number,
name?: string,
gan_zhi?: string,
gan?: string,
zhi?: string,
ten_god?: string,
interactions?: any[],
stars?: any[]
}>,
interactions?: any[],
stars?: any[],
time_confidence?: "exact" | "reduced",
reason?: string
}

On failure:
bazi_flow = { available:false, reason:error.message }

Do not fail the order if BaZi Flow fails.

C) Astrocartography — do NOT implement now

Do not call Astrocartography globally.
Do not add cost/time to CORE generation.

Only update reference docs:

* PLACE can use astrocartography later.
* Call only when PLACE is purchased and birth_time_known=true.
* Do not pass huge raw GeoJSON to Claude.
* Normalize only compact line summaries.
* Do not name specific cities unless real astrocartography line data exists.

D) Do NOT add now:

* Synastry
* BaZi Synastry
* Moon Phase Timeline / /api/v1/moon/month
* Health / Neijing / medical endpoints
* provider-generated psychological reports
* provider-generated daily sign/personal reports
* SVG chart generation
* name-origin APIs
* external numerology APIs
* color APIs
* crystal APIs

============================================================
PART 8 — CONCURRENCY / BUDGET
=============================

Keep the verified hybrid strategy.

Natal remains critical and runs first.

After Natal succeeds, run graceful endpoints with Promise.allSettled and small stagger:

* Transits
* BaZi
* Solar Return
* Moon Phase
* BaZi Flow

Use compact per-endpoint diagnostics:

* endpoint_timing_ms
* endpoint_errors
* hit_429
* available

Do not let Moon Phase or BaZi Flow kill the generation.

Total generation must stay under Worker budget.

If an enrichment endpoint fails or times out:

* return available=false
* include reason/status
* continue generation

Do not enter long retry/backoff loops.
Respect Retry-After only if it is reasonable and does not exceed Worker budget.

============================================================
PART 9 — REPORT USAGE RULES BY MODULE
=====================================

CORE:

* Use Natal
* BaZi
* Life Path
* Expression/Soul Urge/Personality only if full_name_for_numerology exists and converges with main pattern

LOVE:

* Use Venus, Mars, Moon, 5H, 7H, Descendant
* Use name numerology only if it converges with attraction/relationship pattern
* Do not use synastry in MVP

MONEY:

* Use 2H, 6H, 8H, 10H, Jupiter, Saturn, Venus, Pluto
* Use Life Path, Expression, Maturity if relevant
* Use BaZi favorable/unfavorable elements and structure
* Keep language practical: income mechanism, value structure, pressure, boundaries

BODY:

* Use Moon, Mars, Saturn, 6H
* Use BaZi element imbalance
* Use Moon Phase only as a soft rhythm note
* No medical claims
* Use “your system may respond to...” language

YEAR:

* Slow transits are priority
* Solar Return is priority
* Personal Year is priority
* BaZi Flow can enrich annual timing
* Moon Phase can add small emotional/timing texture
* Do not let daily moon data overpower slow transits or Solar Return

STYLE:

* Use Venus, Ascendant, Moon
* Use BaZi element balance
* Use Expression/Soul Urge as optional aesthetic nuance
* Use Moon Phase as optional symbolic visual layer
* Keep colors/materials internal and elegant
* Do not claim colors/stones attract love, money, luck, protection, or healing

PLACE:

* Use Moon, IC, 4H, angular planets
* Use BaZi favorable elements
* Astrocartography later only if PLACE purchased and birth_time_known=true
* Otherwise describe environmental qualities, not specific cities

============================================================
PART 10 — AI SYSTEM PROMPT CLARIFICATION
========================================

Only if needed, add this short clarification to:
src/lib/ai/darrowcode_ai_system_prompt.md

Do not paste API endpoint instructions into the AI system prompt.

Clarification text:

Name numerology, Moon Phase and BaZi Flow are supporting synthesis layers only.
Use them only when they converge with Western astrology, BaZi, transits, Solar Return, or the module theme.
Do not create separate generic sections for name numerology, moon phase or BaZi Flow.
Do not use destiny, vibration, lucky number, soul mission, healing, protection, attraction, or mystical guarantee language.
Every claim based on these layers must be grounded in the exact data point used and should usually appear in proof_tags rather than as technical explanation in the main body.
The final report must remain human-readable, premium editorial, practical, and emotionally intelligent.

============================================================
PART 11 — REFERENCE DOCS
========================

Update:
src/lib/astro/FREEASTROAPI_REFERENCE.md

Add:

* Moon Phase endpoint details
* BaZi Flow endpoint details
* Do not use Moon Phase Timeline now
* Do not use Astrocartography globally now
* Do not use provider interpretations
* Keep all enrichment endpoints graceful
* Human-readable customer output guardrail

Update or create:
src/lib/numerology/NUMEROLOGY_REFERENCE.md

Include:

* Pythagorean map
* reduction rules
* master number policy
* Y policy
* full_name_for_numerology optionality
* no name-origin/gender/nationality/ethnicity inference
* no external numerology APIs
* no generic numerology report

============================================================
PART 12 — ABSOLUTE RULES
========================

Do not expose API keys in frontend.
Use FREEASTROAPI_KEY from server-side secrets only.

Do not change checkout geocoding.
Keep Geoapify.

Do not use FreeAstroAPI interpretation text.
Always request provider interpretation disabled where available.
Strip interpretation blocks recursively if returned.

Do not use external:

* name-origin APIs
* gender APIs
* nationality APIs
* ethnicity APIs
* numerology APIs
* crystal APIs
* color APIs

Do not make:

* medical claims
* legal claims
* financial guarantees
* healing claims
* lucky claims
* protection claims
* attraction claims
* destiny/fate claims

Do not fail the order if Moon Phase or BaZi Flow fails.

Natal is critical.
All enrichment endpoints are graceful.

Do not proceed to any new feature after this patch until verification is green.

============================================================
PART 13 — VERIFICATION
======================

After implementation, run the existing astro-probe with:

Name: Alex
Full name for numerology: Alex Morgan
DOB: 1990-05-15
Time: 10:00
City: Bratislava, Slovakia
Four Pillars Calculation Detail: Male

Show:

1. normalized_json.numerology
2. name_numerology.available
3. Expression Number
4. Soul Urge Number
5. Personality Number
6. Maturity Number
7. Hidden Passion Number(s)
8. Karmic Lessons
9. normalized_json.moon_phase
10. moon_phase.available
11. normalized_json.bazi_flow
12. bazi_flow.available
13. endpoint_timing_ms
14. endpoint_errors
15. whether any endpoint hit 429
16. interpretation_leak=false
17. proof that Moon Phase interpretation is not present
18. proof that BaZi Flow prose/interpretion/rationale is not present
19. First generated CORE report JSON preview
20. proof_tags showing real data anchors
21. confirmation that report content remains human-readable and not a technical dump

The report preview must not contain standalone generic sections like:

* Your Name Numerology
* Your Moon Phase Meaning
* Your BaZi Flow Reading

It should show Darrow Code synthesis, not mechanical data listing.

Do not proceed beyond this patch until verification is green.
