# DARROW CODE — SYMBOLIC IDENTITY STANDARD

# Status: ACTIVE · B0-approved (2026-06-02)

# Governs: symbolic identity layer in CORE Report: UNVEIL

# Governed by: SOURCE_POLICY.md + DARROW_REPORT_CONTENT_STANDARD_v4_1.md

---

## 1 · PURPOSE

This document defines the **symbolic identity layer** for the CORE Report:
UNVEIL — what symbolic identity elements belong in CORE, how they are
presented, and where they live in the 26-page structure.

It also defines the boundary between the CORE symbolic identity layer and the
STYLE focused chapter's deeper visual/aesthetic identity work.

---

## 2 · THE GOAL

CORE should give the client this feeling:

> "This is my personal symbolic code. My sign, name, numbers, planets,
> elements, strengths, risks, archetype, direction, and symbolic anchors
> were decoded in one coherent system."

This is not achieved through a list. It is achieved through a reading that
moves from recognition to orientation across the full 26-page arc — with each
section contributing a piece of the client's symbolic identity as it goes.

---

## 3 · WHAT BELONGS IN CORE (SYMBOLIC IDENTITY)

The following elements belong in CORE wherever the section spec requires them.
They are distributed across sections — not consolidated into a separate page.
The Personal Orientation System page (page 02) serves as the identity card
anchor (see §5 below).

| Symbolic element | Where in CORE | Data dependency |
|---|---|---|
| Zodiac sign + readable meaning | `core_architecture` | Sun sign (always available) |
| Moon pattern | `battery` | Moon sign (always available) |
| Ascendant / social interface | `social_interface` | ASC (requires birth_time_known=true) |
| Ruling planet / key planetary emphasis | `core_architecture` or `operating_mode` | Natal chart |
| Dominant element / elemental balance | `operating_mode` | Natal chart |
| Key planetary allies | Woven into relevant sections as contextual anchors | Natal chart |
| Life Path number | `numerology_code` | Birth date (always available) |
| Expression / Soul Urge / Personality | `numerology_code` | full_name_for_numerology (conditional) |
| Personal Year | `numerology_code` or `executive_summary` | Birth date (always available) |
| BaZi / Chinese calendar layer | `core_architecture` | BaZi data (if available) |
| Personal archetype typing | `professional_archetype` | Natal chart + birth_time for MC |
| Strengths | `core_architecture`, `professional_archetype`, `executive_summary` | Natal chart |
| Shadow / risk pattern | `shadow_and_friction` | Natal chart |
| Supportive colors | `next_step` or woven into relevant sections | ⚠️ Curated dict required |
| Supportive stones | `next_step` or woven into relevant sections | ⚠️ Curated dict required |
| Supportive elements | `operating_mode` or `environment_and_resonance` | Natal element balance |
| Symbolic allies | `next_step` or relevant sections | ⚠️ Curated dict required |
| Direction / growth focus | `next_step` | Integrated from whole reading |

---

## 4 · HOW TO PRESENT SYMBOLIC IDENTITY ELEMENTS

### 4.1 Each indicator must be explained

Do NOT output empty labels:

❌ "Color: blue"
❌ "Stone: amethyst"
❌ "Planet: Venus"
❌ "Element: Water"

Every symbolic indicator must include:
- what it means for this person's pattern
- what strength it supports
- what risk or shadow it balances
- how it can be used practically or psychologically

✅ Example (correct):
"Supportive color: deep blue — not as a lucky charm, but as a symbolic anchor
for emotional coherence, quiet authority, and depth of focus."

✅ Example (correct):
"Your dominant element is Water — which means you do not take in information the
way most people around you do. You absorb the emotional temperature of a room
before a single fact is registered."

### 4.2 No lucky, healing, or protection claims

Colors, stones, and symbolic allies are **psychological mirrors and practical
anchors** — not lucky charms, protective amulets, or healing devices.

Allowed framing:
- "as a psychological anchor for..."
- "as a symbolic mirror of..."
- "supports the pattern of..."
- "matches the structure of..."

Not allowed:
- "brings luck"
- "heals"
- "protects from"
- "attracts"
- "manifests"

### 4.3 Data-conditional elements

If `birth_time_known=false`:
- No Ascendant claim in social_interface — soften to general outer-pattern read
- No firm MC claim in professional_archetype
- No house-based claims anywhere
- Prioritize: Sun/Moon signs, aspects, element balance, numerology, BaZi

If `full_name_for_numerology` absent:
- Life Path + Personal Year only
- Neutral note: "Expression, Soul Urge, and Personality numbers require the
  full name provided at intake"
- No upsell language

If BaZi unavailable:
- No Day Master, element pillar, or Shen Sha references

---

## 5 · IDENTITY CARD PLACEMENT DECISION (B0)

**Decision:** The symbolic identity card surface is the **Personal Orientation
System page (page 02)** — a static / template-rendered page.

This is the safest implementation choice because:
- It does not add an 18th generated key
- It does not break the locked 17-key body structure
- It gives the client a dedicated symbolic reference surface at the front of
  the reading (immediately after cover, before the generated sections begin)
- It can display the client's key symbolic identifiers as a visual "birth code
  summary" extracted from the generated sections

**What the Personal Orientation System page (page 02) contains:**

STATIC boilerplate:
- "PERSONAL ORIENTATION SYSTEM" heading
- "Clarity before action. Orientation over prediction."
- Interpretive framework disclaimer

VARIABLE symbolic identity payload (extracted from generated section data):
- Client name + birth data (already template-rendered)
- Sun sign + Moon sign (or sign + element if birth_time unknown)
- Ascendant if available (birth_time_known=true only)
- Life Path number
- BaZi Day Master + dominant element (if available)
- Professional archetype name (if generated)
- Dominant element label

This payload is assembled by the template renderer from the structured field
data of the generated sections — it is NOT a new generated section. The AI
generates the section fields; the template extracts summary indicators for the
identity card surface.

**Implementation note for B1/B4:** The schema does not need a new key for this.
The template reads from existing generated section fields and client input data
to populate the identity card. This is a template rendering responsibility only.

---

## 6 · CORE vs STYLE BOUNDARY

### CORE symbolic anchors (this standard applies)

Brief, curated, explained as psychological/structural mirrors:
- 1–2 supportive colors (only when curated dict supports it)
- 1–2 supportive stones (only when curated dict supports it)
- Dominant element and elemental balance
- Key planetary emphasis or ruling planet

These appear in CORE as **brief anchors within relevant section prose or in
the `next_step` closing section** — not as a standalone list or dedicated page.

### STYLE focused chapter (future, different scope)

The STYLE focused chapter handles:
- deeper visual and aesthetic identity
- extended color palette and materials
- environmental calibration (visual/sensory)
- styled recommendations in the context of personal expression

STYLE does **not** make lucky/healing/protection claims either — but it has
broader scope to explore the aesthetic dimension in depth.

A brief symbolic anchor in CORE does not constitute a STYLE section. They are
compatible layers, not competing ones.

---

## 7 · READING EXPERIENCE REQUIREMENTS

All symbolic identity elements in CORE must meet the reading experience
standard from `DARROW_REPORT_CONTENT_STANDARD_v4_1.md`:

- recognition-first (lived pattern before symbolic label)
- human-readable (non-astrologer can follow it)
- Dinner Table Test (every sentence)
- no chart dumps
- no generic horoscope language
- no motivational inflation
- premium, varied, and engaging to read

The symbolic identity layer enriches the reading — it does not replace the
reading's observational and structural core.

---

## 8 · IMPLEMENTATION GATES

Before any symbolic identity element beyond the basic natal/numerology/BaZi
layer is added to production generation:

| Gate | Requirement |
|---|---|
| Supportive colors | `COLORS_STONES_SYMBOLIC_ALLIES_v1.md` curated dict populated + approved |
| Supportive stones | Same file |
| Symbolic allies | Same file |
| Professional archetype names | `ARCHETYPE_LIBRARY_v1.md` core names populated + approved |
| Celtic / Druid calendar | Separate future decision; not authorized until strong curated Darrow rules |

---

🔒 STATUS: ACTIVE B0-approved symbolic identity standard

---

## CHANGE LOG

| Date | Change |
|---|---|
| 2026-06-02 | B0 creation — identity card placement decided (POS page 02); CORE vs STYLE boundary defined; explanation requirement for all indicators; implementation gates established |
