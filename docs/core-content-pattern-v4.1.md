# CORE Content Pattern — v4.1 (Operational Contract)

**Date:** 2026-06-03
**Phase:** B5.0
**Status:** Concise operational contract for CORE content quality. Distilled from
`SOURCE_OF_TRUTH_v4_1.md`, `DARROW_CORE_MASTER_PATTERN_v4_1.md`,
`DARROW_REPORT_CONTENT_STANDARD_v4_1.md`, `schema_template_patch_v4_1.md`, and the
gold sample `DARROW_CORE_SAMPLE_REPORT_v4_1.md`. This contract governs the
**diagnostic fixture content** in B5.0; production prompt integration is **B5.1**.

---

## 1 · Purpose

CORE is a **premium personal architecture report**. It must create **recognition**
("this explains me"), not generic horoscope language. Orientation over prediction;
self-trust over instruction; calm premium authority.

## 2 · Required structure

Static/template pages (separate from generated keys): **Cover**, **Personal
Orientation System / Method & Orientation**, **Library**, **Back Cover**.

The **17 generated keys**, fixed order (no add/remove/rename/merge/reorder):

1. orientation · 2. core_architecture · 3. operating_mode ⚠️ (migration-gated for
production; included in diagnostic) · 4. battery · 5. social_interface ·
6. numerology_code · 7. cognitive_style · 8. drive_and_rhythm ·
9. professional_archetype · 10. money_and_value · 11. relationship_baseline ·
12. vitality_baseline · 13. environment_and_resonance · 14. shadow_and_friction ·
15. before_after · 16. executive_summary · 17. next_step.

Plus **Closing**. The Personal Orientation System page may carry static boilerplate
+ a variable **identity-card payload** (name, birth data, Sun/Moon/Asc if available,
Life Path, BaZi Day Master, dominant element, archetype). This is **not** a new
generated section — it is supplied metadata.

## 3 · Section density

| Section | Word target |
|---|---|
| orientation | 220–270 |
| core_architecture | 380–460 (5–6 paras) |
| operating_mode | 260–310 |
| battery | 290–340 |
| social_interface | 230–270 |
| numerology_code | 340–400 |
| cognitive_style | 230–270 |
| drive_and_rhythm | 230–270 |
| professional_archetype | 300–360 |
| money_and_value | 230–270 |
| relationship_baseline | 230–270 |
| vitality_baseline | 210–250 |
| environment_and_resonance | 210–250 |
| shadow_and_friction | 340–400 |
| before_after | 160–200 (exactly 2 Before / 2 After) |
| executive_summary | 340–400 (6 labeled blocks) |
| next_step | 130–160 (4 pillars) |

**Total target: 4,350–5,250 generated words.** Major sections carry 4–6 meaningful
paragraphs. Short sections only where intentionally compressed. **No 80–120-word
skeleton placeholder sections** in a final CORE.

## 4 · Proof / reference anchor rules

- Specific and coherent; they **support** the human read, never carry it.
- **≤ 5 per section**; placed quietly at the end (thin grey evidence line).
- Reference **real available data** only — no invented/estimated placements.
- Coherent across Western astrology, BaZi, numerology, pattern psychology (one chart).
- `birth_time_known=false` → no houses/angles/Asc/MC/IC/Descendant. BaZi unavailable
  → no BaZi tags. No full name → no Expression/Soul Urge/Personality.

## 5 · Block rules

- **Protocols:** behavioral, specific, supportive (not commanding), 2–4 sentences,
  named with a descriptive title (`PROTOCOL · {Name}`).
- **Warning signals:** observable, non-judgmental, used **sparingly** (early-cue).
- **No repeated identical PROTOCOL/WARNING labels stacked on one page** when
  avoidable. If a section would stack multiples, fold extras into prose or use one
  consolidated block. (Distinct-titled blocks are acceptable only when elegant.)

## 6 · Voice rules

Recognition-first; human-readable by a non-astrologer; premium; specific; not
robotic; not generic horoscope filler; not deterministic prediction. Scenario-first
(never open a section with placements). Lead with the human pattern; data confirms.
Avoid mechanical "your system / your configuration / the mechanism" overuse.

## 7 · Safety rules

- No medical / legal / financial advice; no diagnosis, cure, healing.
- No guaranteed outcomes, wealth promises, lucky/protection/attraction claims.
- The user remains the decision-maker.
- `vitality_baseline` carries the **verbatim** disclaimer (see §9).
- CORE uses **environmental resonance only** — no specific cities / best places.
- No direct cross-sell inside body sections.

## 8 · Knowledge-use rules

Use `docs/knowledge/**` as symbolic interpretation **support** only, under
`SOURCE_POLICY.md`: original Darrow expression; no copyrighted copying; no
unsupported technical claims; gated layers (colors/stones/allies) stay out until a
curated dict is approved.

## 9 · Locked labels (verbatim)

`executive_summary_blocks` (6): **YOUR CORE ADVANTAGE · YOUR PRIMARY SENSITIVITY ·
YOUR DECISION FORMULA · THE CORE CONCLUSION · CURRENT CYCLE · THE NEXT LEVEL**.

`closing_pillars` (4): **TRUST THE SIGNAL · BUILD THE BASE · RESPECT THE CYCLE ·
HONOR THE SPACE**.

`vitality_baseline` disclaimer (exact): *"This is interpretive orientation, not
medical advice. Consult a qualified healthcare professional for any health
concerns."*

## 10 · B5.1 note

Production prompt/system integration is a **separate future phase (B5.1)**.
`system-prompt.ts` and AI prompts remain untouched in B5.0. This contract describes
the content quality bar the diagnostic fixture demonstrates; it is not a runtime
prompt and authorizes no production change.
