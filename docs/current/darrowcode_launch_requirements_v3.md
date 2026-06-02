# Darrow Code — Launch Requirements v3

# docs/current/darrowcode_launch_requirements_v3.md

# Replaces: darrowcode_launch_requirements.md (archived)

---

## PART 1 — VISUAL ASSETS

### A. Brand Symbol

| File                      | Size               | Format          | Where used                                   |
| ------------------------- | ------------------ | --------------- | -------------------------------------------- |
| `darrow-symbol-gold.png`  | 1024×1024          | PNG transparent | PDF covers, generating animation, watermarks |
| `darrow-symbol-small.png` | 256×256            | PNG transparent | Result screen mark, small embeds             |
| `darrow-favicon.png`      | 128×128            | PNG             | Browser favicon                              |
| `darrow-favicon.ico`      | 32×32 (multi-size) | ICO             | Browser favicon (legacy)                     |

**Color spec:** `#D4AF37` Luxury Gold on transparent background.

### B. Social Preview Image

| File                        | Size     | Format | Content                                     |
| --------------------------- | -------- | ------ | ------------------------------------------- |
| `darrow-social-preview.png` | 1200×630 | PNG    | Symbol + "DARROW CODE" + tagline on #0A0F1E |

### C. Sample Report PDF Pages (/sample trust page)

Three watermarked sample pages from a real UNVEIL report:

| File                  | Format                | Content                                   |
| --------------------- | --------------------- | ----------------------------------------- |
| `sample-cover.jpg`    | JPG 72dpi, 800×1131px | Cover page                                |
| `sample-interior.jpg` | JPG 72dpi, 800×1131px | Interior section (e.g. Core Architecture) |
| `sample-closing.jpg`  | JPG 72dpi, 800×1131px | Executive Summary / closing page          |

Use anonymized birth data or "SAMPLE" watermark.

### D. Email Header (optional)

| File               | Size    | Format |
| ------------------ | ------- | ------ |
| `email-header.png` | 600×200 | PNG    |

---

## PART 2 — ASSET DELIVERY PHASES

**Phase 1 — Before first Lovable build:**

- `darrow-symbol-gold.png`, `darrow-favicon.png`, `darrow-social-preview.png`

**Phase 2 — Before PDF template build:**

- `darrow-symbol-gold.png` (high-res for covers)
- `darrow-symbol-small.png` (for watermarks)

**Phase 3 — Before public launch:**

- `sample-cover.jpg`, `sample-interior.jpg`, `sample-closing.jpg`
- `email-header.png`

---

## PART 3 — DATA SOURCES (CURRENT STATUS)

### LAYER 1 — Personal data (from intake form)

| Field                    | Status                                                   |
| ------------------------ | -------------------------------------------------------- |
| First name               | ✅ Active                                                |
| Email                    | ✅ Active                                                |
| Date of birth            | ✅ Active                                                |
| Birth time               | ✅ Active (optional, stored as birth_time_known boolean) |
| City of birth            | ✅ Active (geocoded before checkout)                     |
| Full name for numerology | ✅ Active (optional)                                     |
| Birth sex for Bazi       | ✅ Active (M/F, required for FreeAstroAPI Bazi endpoint) |

### LAYER 2 — Astrological data (CURRENT PROVIDER)

**FreeAstroAPI — ACTIVE PRODUCTION PROVIDER**

| Endpoint                             | Status                                |
| ------------------------------------ | ------------------------------------- |
| GET /api/v2/geo/search               | ✅ City search / geocoding            |
| POST /api/v1/natal/calculate         | ✅ Western natal chart                |
| POST /api/v1/transits/calculate      | ✅ Current transits                   |
| POST /api/v1/chinese/bazi            | ✅ Bazi Four Pillars                  |
| POST /api/v1/western/solar/calculate | ✅ Solar Return (birth time required) |

**Numerology:** Calculated internally in Edge Function — no API needed.
**Moon Phase:** Enrichment field from FreeAstroAPI normalized data.
**BaZi Flow / Ten Gods:** Enrichment field from FreeAstroAPI Bazi response.
**Provider interpretation blocks:** STRIPPED — never passed to Claude.

**Key:** `FREEASTROAPI_KEY` — stored in Lovable/Supabase Secrets only.
Never hardcoded, never committed to source.

### LAYER 3 — Interpretive tradition (built into AI prompt)

Active prompt: `src/lib/ai/darrowcode_ai_system_prompt.md` (v3 merged)
Active specs: `src/lib/ai/darrowcode_core_module_spec.md` and `darrowcode_addon_modules_spec.md`

---

## PART 4 — CONTENT TARGETS (v3 — CURRENT)

| Module                    | Pages | Words         | Sections              |
| ------------------------- | ----- | ------------- | --------------------- |
| CORE                      | 18–20 | 3,000–3,600   | 17                    |
| Each add-on               | 8–10  | 1,200–1,500   | 10                    |
| Full Code / CORE Complete | 65–75 | 12,000–14,000 | all + grand_synthesis |

**Old targets (deprecated, must not appear in active files):**

- ~~CORE 12–14 pages / 900–1,160 words~~
- ~~Add-ons 6–8 pages / 480–690 words~~
- ~~Full Code ~50 pages~~

---

## PART 5 — PDF GENERATION (CURRENT STATUS)

**Provider:** APITemplate — active production renderer.

**APITemplate safe renderer rules (proven in production):**

- ✅ Inline CSS only — no external stylesheet links
- ✅ No base64-encoded images (use hosted URLs for symbol/watermark)
- ✅ No external font loading inside PDF template (fonts embedded or system-safe)
- ✅ Do NOT use APITemplate header/footer settings — they break in safe renderer
- ✅ Dark navy (#0A0F1E) cover and closing pages
- ✅ Warm paper (#F6F4EF) body pages
- ✅ Gold (#D4AF37) headings and accents only

**PDF template mapping:**

- `src/lib/pdf/template.ts` maps v3 JSON section keys to PDF pages
- v3 section keys (cover_tagline, orientation, core_architecture, etc.) are the active keys
- Legacy keys (modules.CORE.opening, etc.) must not be used in v3 template

---

## PART 6 — DATA FLOW (CURRENT)

```
User fills intake form
   ↓
[Edge Function: validate + geocode (FreeAstroAPI /geo/search or Geoapify)]
   ↓ resolve city to lat/lng/timezone
[Stripe checkout]
   ↓
[stripe-webhook: verify signature, deduplicate, create order]
   ↓
[Insert generation_jobs row (status: queued)]
   ↓ return HTTP 200 immediately
[process-generation-job — async]
   ↓
[generate-astro-data edge function]
   ↓ calls FreeAstroAPI:
   - natal/calculate → Western chart
   - transits/calculate → current transits
   - chinese/bazi → Four Pillars (requires bazi_sex)
   - western/solar/calculate → Solar Return (if birth_time_known=true)
   ↓ calculates internally:
   - Life Path, Personal Year
   - Expression/Soul Urge/Personality (if full_name provided)
   - Moon Phase enrichment
   - BaZi Flow enrichment
   ↓ strips provider interpretation blocks
   ↓ saves raw_json + normalized_json to astro_data table
   ↓
[generate-report edge function]
   ↓ sends to Claude API:
   - System prompt: src/lib/ai/darrowcode_ai_system_prompt.md (v3, cached)
   - User prompt: serialized normalized DarrowChartData (user-prompt.ts)
   ↓ returns structured JSON
   ↓ validates against DarrowReportSchema (retry once on failure)
   ↓ stores in reports.ai_content_json
   ↓
[generate-pdf edge function]
   ↓ sends HTML template + JSON to APITemplate (safe renderer)
   ↓ saves PDF to Supabase Storage (private)
   ↓ generates download_token
   ↓
[send-email via Resend]
   Email with /download/:token link
```

---

## PART 7 — VISUAL CANON (LOCKED)

```
Warm Paper       #F6F4EF   primary content background
Midnight Navy    #0A0F1E   PDF covers, hero, dark dividers
Luxury Gold      #D4AF37   THE ONLY ACCENT (titles, CTA, logo)
Soft Light Grey  #E5E7EB   light text on dark
Muted Grey       #9CA3AF   meta, "Prepared for", captions
Warm Dark Brown  #4A402D   page titles, section headings
Deep Charcoal    #151922   body text on light backgrounds
Neutral Grey     #6B6B6B   footer, disclaimers, legal only
```

```
Cormorant SC          product titles, covers, hero H1     →  #D4AF37
Cormorant Garamond    page titles, section headings        →  #4A402D
Inter                 all body, UI, forms, checkout         →  #151922 / #E5E7EB on dark
```

Google Fonts import:

```
https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@400;500&family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap
```

---

## PART 8 — LEGAL / DISCLAIMER CHECKLIST

- [ ] Disclaimer on every report: "For self-reflection and personal insight. Not medical, legal, or financial advice."
- [ ] BODY module: "Consult a qualified healthcare professional for any health concerns."
- [ ] No healing/lucky/guaranteed language anywhere in reports
- [ ] No destiny/fated/soul mission language anywhere in reports
- [ ] Privacy policy: birth data used only for chart calculation, never sold
- [ ] GDPR/data deletion path exists in Supabase

---

## PART 9 — LAUNCH MONITORING CHECKLIST

- [ ] Test report generation with known birth data — verify word count ~3,000+ for CORE
- [ ] Verify PDF renders correctly on APITemplate safe renderer
- [ ] Verify download token email delivery via Resend
- [ ] Verify Stripe webhook deduplication (replay same event → no duplicate report)
- [ ] Verify birth_time_known=false path (no house claims in output)
- [ ] Verify Bazi unavailable path (bazi.available=false → no Bazi content)
- [ ] Verify numerology path without full_name (Life Path + PY only)
- [ ] Spot-check proof tags in generated report — all placements real and present in data
- [ ] Verify CORE report does NOT fall below 2,500 words (flag if so)
