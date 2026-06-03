# Darrow Code — SEO & Social Notes

**Date:** 2026-06-03
**Phase:** SEO1 + FOOTER1

---

## Legacy Squarespace SEO (superseded — reference only)

These settings no longer control the Lovable site. Preserved as legacy keyword reference only.

**Legacy title:**
Personal Astrology Reports & Life Timing Analysis | Darrow Code

**Legacy description:**
Darrow Code provides personalized astrology reports and life timing analysis to reveal repeating patterns, support steadier decisions, and align you with your natural rhythm. Private digital reports delivered discreetly.

Note: "Life Timing Analysis" can be used as a secondary keyword but is not the primary framing. Old Squarespace wording should not be used as the current Lovable title.

---

## Current Lovable SEO metadata (set 2026-06-03)

**Page title:**
AI Astrology Report & Birth Code PDF | Darrow Code

**Meta description:**
More than a horoscope. Private AI-powered astrology reports from your birth data — CORE, Love, Money, Body, Year, Style and Place PDF insights.

**Open Graph title:**
Darrow Code — AI Astrology Report & Birth Code PDF

**Open Graph description:**
More than a horoscope. Private AI-powered astrology reports from your birth data — CORE, Love, Money, Body, Year, Style and Place PDF insights.

**Twitter card title:**
Darrow Code — AI Astrology Report & Birth Code PDF

**Twitter card description:**
More than a horoscope. Private AI-powered astrology reports from your birth data — CORE, Love, Money, Body, Year, Style and Place PDF insights.

### SEO wording requirements (maintained)
- No overpromising.
- No medical, legal, financial, or guaranteed life outcomes.
- Language is premium, clear, and product-specific.
- "AI Astrology Report" + "Birth Code PDF" are the primary keyword anchors.

---

## Official social accounts

| Platform | URL |
|---|---|
| TikTok | https://www.tiktok.com/@darrowcode |
| Instagram | https://www.instagram.com/darrowcode |
| YouTube | https://www.youtube.com/@darrowcode |

Social links added to SiteFooter.tsx in FOOTER1 phase.
All links use `target="_blank" rel="noopener noreferrer"`.

---

## Favicon

Already present and manually verified by user. Not modified in this phase.
Do not modify favicon files or favicon wiring.

---

## Newsletter / email signup

Intentionally deferred. No signup form added in this phase.
Do not add signup form, newsletter form, Resend list logic, or Supabase newsletter storage until explicitly approved.

---

## Files changed in SEO1 + FOOTER1

| File | Change |
|---|---|
| `src/routes/index.tsx` | Updated `head()` meta: title, description, og:title, og:description, twitter:title, twitter:description |
| `src/components/SiteFooter.tsx` | Added "Follow Darrow Code" social section (TikTok, Instagram, YouTube) + © Darrow Code |
| `docs/seo-social-notes-2026-06-03.md` | This document |

---

## Not changed

- Favicon
- Brand assets
- Stripe / checkout / prices
- Product selection logic
- Email sending / report-ready email
- PDF / report generation
- Supabase schema / migrations / RLS
- Token / download routes
- system-prompt.ts
- AI prompts
- Any backend logic
