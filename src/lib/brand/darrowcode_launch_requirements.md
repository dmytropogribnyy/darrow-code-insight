# Darrow Code — Launch Requirements Document

This document covers exactly what assets you need to prepare and provide,
when to provide them, and where the system pulls its "raw material" from
to generate accurate, interesting reports.

---

## PART 1 — VISUAL ASSETS YOU NEED TO PREPARE

### A. Brand Symbol (the gold orbital mark)

You should already have this from previous design work. Need these formats:

| File name | Size | Format | Where used |
|---|---|---|---|
| `darrow-symbol-gold.png` | 1024×1024 | PNG transparent | PDF covers, generating animation, watermarks |
| `darrow-symbol-small.png` | 256×256 | PNG transparent | Result screen mark, small embeds |
| `darrow-favicon.png` | 128×128 | PNG | Browser favicon |
| `darrow-favicon.ico` | 32×32 (multi-size) | ICO | Browser favicon (legacy) |
| `darrow-app-icon.png` | 512×512 | PNG | iOS/Android PWA icon (future) |

**Color spec for symbol:** `#D4AF37` Luxury Gold on transparent background.

### B. Social Preview Image

For Open Graph meta tags (link previews when site is shared):

| File name | Size | Format | Content |
|---|---|---|---|
| `darrow-social-preview.png` | 1200×630 | PNG/JPG | Symbol + "DARROW CODE" + tagline on `#0A0F1E` navy |

Suggested layout:
- Background: Midnight Navy `#0A0F1E`
- Center: Gold symbol (medium size)
- Below symbol: "DARROW CODE" in Cormorant SC, `#D4AF37`
- Bottom: "AI-powered personal astrology report · Darrow Code Method" in Inter, `#E5E7EB`

### C. Sample Report PDF Pages (for /sample trust page)

Three watermarked sample pages from an existing manual UNVEIL report:

| File name | Format | Content |
|---|---|---|
| `sample-cover.jpg` | JPG @ 72dpi, 800×1131px | PDF cover page with sample data |
| `sample-interior.jpg` | JPG @ 72dpi, 800×1131px | One interior section page (e.g., Architecture) |
| `sample-closing.jpg` | JPG @ 72dpi, 800×1131px | Executive Summary / closing page |

These should have a subtle "SAMPLE" watermark or use anonymized birth data
to prevent literal reuse but show real quality.

### D. Email Header Image (optional)

For the report delivery email:

| File name | Size | Format | Content |
|---|---|---|---|
| `email-header.png` | 600×200 | PNG | "DARROW CODE" wordmark in gold on navy, simple |

---

## PART 2 — WHEN TO PROVIDE EACH ASSET

### Phase 1 — Before first Lovable build

Drop these in Lovable chat OR commit to `/public/brand/` in GitHub:

- `darrow-symbol-gold.png` (the main symbol)
- `darrow-favicon.png` (favicon)
- `darrow-social-preview.png` (OG image)

**Why:** Lovable will use these to render the landing page properly.
Without the symbol, the generating screen has nothing to animate. Without
favicon, browser tabs look unbranded.

### Phase 2 — Before PDF template build

When we start building the PDF generation:

- `darrow-symbol-gold.png` (high-res, for covers)
- `darrow-symbol-small.png` (for watermarks)

**Why:** PDF cover renders symbol at full size. Body pages use small version
as watermark.

### Phase 3 — Before public launch

When you're ready to go live and announce:

- `sample-cover.jpg`, `sample-interior.jpg`, `sample-closing.jpg`
- `email-header.png`

**Why:** Sample images go on the /sample page that builds trust BEFORE
purchase. Email header is part of delivery flow polish.

### Phase 4 — After first 100 customers

Optional, only when you have real data:

- Updated samples using anonymized real customer reports (with permission)
- Brand video / animation for hero (only if it improves conversion)

---

## PART 3 — WHERE THE SYSTEM PULLS "RAW MATERIAL"

This is the critical infrastructure question. There are 3 layers of input
that feed every report.

### LAYER 1 — Personal data (from the user)

Collected via the intake form:

| Field | Source | How it's used |
|---|---|---|
| First name | User input | Personalization 1-2 times per module |
| Email | User input | PDF delivery, account-less identity |
| Date of birth | User input | Foundation for all astro calculations |
| Birth time | User input (optional) | Refines Ascendant + Houses precision |
| City of birth | User input | Latitude/longitude/timezone resolution |

**Storage:** Supabase `intakes` table. Never shared, never sold.

### LAYER 2 — Astrological raw data (from external API)

The personal data goes to an astrology calculation API which returns the
mathematical chart data.

**For MVP, use one of these providers** (verify current pricing before connecting):

**Option A — AstrologyAPI (recommended for MVP)**
- Endpoint: https://json.astrologyapi.com
- Provides: Western natal chart, transits, Solar Return, numerology,
  basic Chinese astrology
- Pricing: per-call basis (~$0.001-0.01 per call)
- Covers: CORE, LOVE, MONEY, YEAR modules cleanly

**Option B — DivineAPI**
- Endpoint: https://divineapi.com
- Provides: Western, Vedic, Numerology, Horoscope endpoints
- Pricing: subscription tiers
- Covers: most modules; Bazi requires verification

**For Bazi Four Pillars specifically:**
- FreeAstroAPI has explicit BaZi Four Pillars endpoint
- Returns: Day Master, Ten Gods, element balance, life stages
- Use only if primary API doesn't cover Bazi adequately

**For numerology basics (Life Path, Personal Year):**
- Calculate directly in Edge Function — no API needed
- Pythagorean reduction from birth date is simple arithmetic
- Saves cost and gives full control

**Required data points the system needs from astrology API:**

```
Western:
- Sun, Moon, Ascendant: sign + house + degree
- Mercury, Venus, Mars: sign + house
- Jupiter, Saturn: sign + house
- Uranus, Neptune, Pluto: sign + house
- MC: sign + degree
- Major aspects (conjunctions, squares, oppositions, trines) with orbs
- Dominant element (Fire/Earth/Air/Water)
- Dominant modality (Cardinal/Fixed/Mutable)
- All 12 house cusps

Current transits (date of report generation):
- Saturn, Jupiter, Uranus, Neptune, Pluto positions
- Any major transits to natal placements (within 2° orb)

Bazi (Four Pillars):
- Year pillar (stem + branch)
- Month pillar (stem + branch)
- Day pillar (stem + branch) — Day Master
- Hour pillar (stem + branch) — if birth time known
- Element distribution (Wood/Fire/Earth/Metal/Water counts)
- Dominant element / weak element

Numerology (calculated in-function):
- Life Path number (1-9, 11, 22, 33)
- Expression number (from full name, if collected)
- Soul Urge (vowels only)
- Personal Year (current year energy)
```

### LAYER 3 — Interpretive tradition (built into AI prompt)

The astro data alone isn't a report. It becomes a report through interpretation.
The Darrow Code system prompt instructs Claude to work in the methodological
tradition of established astrologers:

| Module | Interpretive tradition |
|---|---|
| CORE | Pelletier (Personal Portrait) + Greene (Psychological Horoscope) |
| LOVE | Townley (Mars/Venus) + Greene (relational shadow) |
| MONEY | Jehle (8th house) + Greene (vocation) + Pelletier (career houses) |
| BODY | Greene (nervous patterns) + traditional medical astrology disclaimers |
| YEAR | Hand (transit interpretation) — slow transits, long arcs |
| STYLE | Color Horoscope tradition + Venus/Ascendant correspondences |
| PLACE | AstroClick / astrocartography tradition |

**Important:** Claude is NOT given those authors' texts to copy. It uses
general methodological principles associated with those traditions, without
imitating any author's style, wording, structure, or proprietary language.
It is informed by the data from Layer 2, and outputs original Darrow Code voice.

This is why Darrow Code reports feel more substantive than typical AI
horoscope generators — the AI is anchored in real astrological methodology,
not invented from scratch.

---

## PART 4 — DATA FLOW DIAGRAM

```
User fills form
   ↓
[Edge Function: validate + save to Supabase intakes]
   ↓
[Stripe checkout]
   ↓
[stripe-webhook fires on payment]
   ↓ (fast path only — must return HTTP 200 immediately)
Verify Stripe signature
   ↓
Deduplicate event via stripe_events
   ↓
Create/update paid order in Supabase
   ↓
Write modules_purchased records
   ↓
Insert generation_jobs row (status: queued)
   ↓
Return HTTP 200 immediately
   ↓ (async, via EdgeRuntime.waitUntil or background Edge Function)
[process-generation-job]
   ↓
[Edge Function: generate-astro-data]
   ↓ calls
AstrologyAPI / DivineAPI → returns Western chart, transits, numerology
FreeAstroAPI Bazi → returns Four Pillars
Edge Function → calculates Life Path, Personal Year
   ↓ stores in
Supabase astro_data table
   ↓
[Edge Function: generate-report]
   ↓ sends to
Claude API with:
   - System prompt (Darrow Code voice + interpretive traditions, CACHED)
   - User prompt (this client's astro data + requested modules)
   ↓ returns
Structured JSON with all module sections
   ↓ validate JSON against schema (retry once on failure)
   ↓ stored in
Supabase reports.ai_content_json
   ↓
[Edge Function: generate-pdf]
   ↓ sends HTML template + JSON to
PDFShift / APITemplate.io → renders branded PDF
   ↓ saves to
Supabase Storage (private)
   ↓ generates
download_token, stores in reports table
   ↓
[Edge Function: send-email]
   ↓ via Resend
Email with /download/:token link
```

---

## PART 5 — CRITICAL VISUAL CANON (LOCKED)

All UI surfaces — Lovable app, PDF, email, future pages — must use only
these tokens. If a color is not listed, it does not exist in this system.

### Colors

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

### Fonts

```
Cormorant SC          product titles, covers, hero H1     →  #D4AF37
Cormorant Garamond    page titles, section headings        →  #4A402D
Inter                 all body, UI, forms, checkout         →  #151922 (or #E5E7EB on dark)
```

Load via Google Fonts:
```
https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@400;500&family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap
```

### Exception for viral content

Bright yellow `#FFE000` is allowed ONLY for TikTok video covers / overlays
(viral hooks). Never on app, PDF, email, or any owned digital surface.

---

## PART 5B — PDF PAGE DESIGN SPEC (modern editorial)

Beyond color/font compliance, PDF pages must FEEL modern, pleasant to read,
and stylish. These are the typography and layout rules that achieve that.

### Page geometry
- Page size: A4 (210 × 297 mm) or Letter (8.5 × 11")
- Margins: **20mm top/bottom, 25mm left/right** (generous, premium)
- Single column only (never two-column)
- Page background: Warm Paper #F6F4EF (matte, not white)

### Typography rhythm
- Body: Inter, **11-12pt**, line-height **1.7-1.75**
- Line length target: **55-70 characters per line** (optimal reading zone)
- Paragraph spacing: 12-14pt between paragraphs (1.2x line-height)
- Text alignment: **ragged-right (left-aligned)**, never justified
- Headings: Cormorant Garamond, 24-28pt, line-height 1.15-1.2, letter-spacing -0.3px
- Section labels: Inter, 10pt, UPPERCASE, letter-spacing 3px, color #9CA3AF
- Pull quotes: Cormorant Garamond italic, 14pt, with 2px gold left border

### Visual hierarchy on each page
1. **Top margin block** — section number (e.g. "02") in Garamond #9CA3AF
   on left, brand mark "DARROW CODE" in Cormorant SC 9pt #D4AF37 on right
2. **Section label** small caps above main heading
3. **Heading** Cormorant Garamond #4A402D
4. **Placement reference** italic muted #9CA3AF — context without clutter
5. **Body paragraphs** with generous spacing
6. **Pull quote** (optional, 1 per page max) with gold left rule
7. **Bottom margin block** — proof tags in 8.5pt #9CA3AF letter-spaced caps,
   above thin rule #D4D2C8
8. **Footer line** — report name + page number in gold

### Specific elements
- **PROTOCOL: blocks** — slight offset (background #F1EEE6 or just padding-left 12px),
  number "01/02/03" in Cormorant Garamond gold, body in Inter
- **Warning Signal blocks** — italic intro, no special background, just typography
- **Before / After** — paired on single page, generous space between
- **Proof tags** — thin horizontal rule above, then dot-separated tags

### What makes it FEEL modern (not Victorian)
- **NO ornamental flourishes** — no decorative borders, fleurons, or vintage motifs
- **NO drop caps** — modern editorial doesn't use them
- **NO justified text** — ragged right reads more modern
- **NO heavy bold** — use Cormorant Garamond medium (500), not heavy
- **Single accent rule** — Luxury Gold only on: page number, pull quote rule,
  section number, brand wordmark. Never on body text.
- **Whitespace IS the luxury** — empty space = premium feeling
- **Photographic quality margins** — same proportions as luxury magazine layouts

### Page types
- **Type A — Section page** (one concept per page): heading + body + optional pull quote
- **Type B — Protocol page** (lists): heading + 2-3 PROTOCOL blocks
- **Type C — Before/After page** (paired): two short blocks with generous space
- **Type D — Cover** (navy background): symbol + wordmark + product name + client name
- **Type E — Closing** (light): executive summary + next module invitation

### Mobile PDF reading
PDFs will be read on phones often. Ensure:
- Each page fits on phone screen without horizontal scrolling
- Body text remains readable at phone zoom level (11pt at native size)
- Cover page works as a thumbnail (recognizable at small size)

---

## PART 5C — LOVE · TANDEM STRATEGIC DECISION

### Recommendation: Phase 2 launch (NOT in MVP)

The DYAD Tandem product from the manual catalog is a strong product
(synastry analysis of a specific named partner), but adding it to MVP
increases complexity disproportionately for the launch goal of validating
the basic flow.

**MVP launch:**
- LOVE = Solo only ($2.99 add-on)
- Analyzes the buyer's own attraction pattern, intimacy mechanics, repeat patterns
- Single intake — no partner data needed

**Phase 2 (after first ~100 CORE Reports sold):**
- Add LOVE · TANDEM as separate add-on ($4.99)
- Analyzes the buyer + a specific named partner — synastry, polarity, conflict loops
- Requires additional intake step for partner's birth data

### Why Phase 2, not MVP

1. **UI complexity** — partner intake adds 4 fields + privacy messaging
2. **API cost** — doubles astrology calculation (two charts + synastry)
3. **Edge cases** — partner unknown birth time, name spellings, privacy concerns
4. **Marketing rhythm** — Tandem launch = great PR moment 2-3 months in

### Architectural anticipation (build for it now)

Even though Tandem is Phase 2, the Lovable app should be built with
the architecture ANTICIPATING this future addition:

- Database: `intakes` table should allow a `partner_data` JSONB column (nullable)
- Database: `intakes` table should include `partner_data_delete_at` timestamp (nullable, for 30-day auto-delete)
- Schema: `modules_purchased` enum should reserve `LOVE_TANDEM` code
- Astrology provider layer: synastry calculation should be a callable method
  (even if unused at launch)
- UI flow: when Phase 2 ships, can add 1 card + 1 intake step without rebuild

### UI flow when Tandem ships (Phase 2)

In the post-purchase upsell screen, the relationships category shows
TWO cards side by side:

```
LOVE — Your pattern              +$2.99
Your own attraction pattern. Uses your birth data only.

LOVE · TANDEM — Two people       +$4.99  [gold accent border]
You + a specific partner. Requires partner's birth data.
```

When TANDEM is clicked, an inline partner intake appears with:
- Partner first name
- Partner date of birth
- Partner birth time (optional)
- Partner city of birth
- Privacy note: "Used only for this report. Deleted after 30 days.
  Not used for marketing."

### LOVE_TANDEM module structure (different from Solo LOVE)

When eventually built, the JSON schema for LOVE_TANDEM differs:

```
{
  "opening": "Dmitry + Natalya — what your charts say together",
  "resonance": "where you genuinely connect",
  "polarity": "the magnetic difference (Mars/Venus)",
  "friction": "where you grate against each other",
  "shadow_dynamic": "the loop you keep falling into together",
  "timing": "current phase of the bond",
  "protocols": "how to navigate this specific pairing",
  "before_after": "shift in mutual understanding",
  "next": "recommended follow-up",
  "proof_tags": ["Moon-Moon trine (Cancer-Pisces)", "Mars square Mars (Taurus-Leo)", ...]
}
```

This will be added to the AI system prompt in Phase 2.

---



Before connecting `app.darrowcode.com` and switching Stripe to live mode,
verify all of these:

### Assets ready
- [ ] Symbol PNG (1024×1024) provided to Lovable
- [ ] Favicon (128×128 + .ico) provided
- [ ] Social preview (1200×630) created
- [ ] Sample report images (3 pages) prepared

### API connections live
- [ ] Astrology API account created and key in env vars
- [ ] Anthropic API key in env vars (`ANTHROPIC_API_KEY`)
- [ ] Stripe account verified, test + live keys in env
- [ ] PDFShift or APITemplate.io account + key
- [ ] Resend account + key for email delivery

### Configuration set
- [ ] `ANTHROPIC_MODEL_DEFAULT = claude-opus-4-7`
- [ ] `ANTHROPIC_MODEL_FALLBACK = claude-sonnet-4-6`
- [ ] Prompt caching enabled in Edge Function
- [ ] All required env vars present (see Lovable prompt)

### Functional tests passed
- [ ] Form validation works (try blank fields, invalid email)
- [ ] Stripe test mode checkout completes
- [ ] Webhook fires after payment → order created in DB
- [ ] generate-astro-data returns valid chart
- [ ] generate-report returns valid JSON in Darrow Code voice
- [ ] generate-pdf produces a viewable PDF
- [ ] Email arrives via Resend within 2 minutes of payment
- [ ] /download/:token route serves PDF correctly
- [ ] /result/:token page displays with all required elements
- [ ] FULL CODE upgrade shows +$10 (not $14.99) after CORE purchase
- [ ] Mobile responsive tested on iPhone Safari + Android Chrome

### Brand/voice quality check
- [ ] Generated reports use canonical fonts (Cormorant SC, Garamond, Inter)
- [ ] Generated reports use canonical colors only
- [ ] AI output passes Dinner Table Test
- [ ] 70/30 Warm Architect Balance present in reports
- [ ] No forbidden words appear in reports
- [ ] Reader feels RELIEF, not guilt (subjective test with 3+ readers)

### Legal
- [ ] Disclaimer present on landing page
- [ ] Disclaimer on every PDF (page 2)
- [ ] Privacy policy page exists (basic)
- [ ] Terms page exists (basic)

---

## PART 7 — POST-LAUNCH MONITORING (FIRST 30 DAYS)

Track these in Supabase queries / Stripe dashboard:

**Volume metrics:**
- Daily CORE Report purchases
- CORE → add-on conversion rate
- CORE → FULL CODE upgrade rate

**Quality metrics:**
- Generation success rate (vs failures)
- Average generation time (target <90 sec, alert at >180 sec)
- Email delivery success rate

**Cost metrics:**
- AI cost per report (monitor closely; expected to remain acceptable at launch volume with caching enabled)
- Astrology API cost per report
- PDF generation cost per report
- Total cost per CORE report (target <$0.20)

**Customer signals:**
- Refund requests (target <2%)
- Support tickets re: report quality
- Repeat purchases (FULL CODE after CORE+modules)

If any quality metric drops, audit AI output for voice drift before scaling.

---

## CONTACT POINTS — WHO PROVIDES WHAT

| Item | Who provides | When |
|---|---|---|
| Brand symbol files | You (Dmitry) | Before Lovable build starts |
| Favicon, social preview | You (or designer) | Before Lovable build starts |
| Sample report images | You (from existing manual reports) | Before /sample page goes live |
| API keys (Stripe, Anthropic, Astrology, PDFShift, Resend) | You — create accounts | Before testing |
| DNS CNAME record | You — via Namecheap | After Lovable testing succeeds |
| Sample customer feedback | Real first 5-10 customers | First month |
