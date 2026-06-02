# DARROW CODE — MONEY Module Requirements v1

**Status:** docs-only planning / data sufficiency matrix
**Runtime status:** not active
**Not prompt/schema/template/provider/runtime authority**
**Requires later MAP0/MAP1/runtime approval before use**

Phase: MOD-SUFF0
Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md`

---

## 1. Module purpose

MONEY covers the person's wealth, work, and business mechanism — how they generate, manage, and relate to resources; their professional operating style; their relationship with authority, structure, ambition, and material value.

**Scope note:** This module explicitly covers money, work, career, and business mechanism. There is no separate Career module. All career/work/professional framing belongs here alongside wealth and resource patterns.

---

## 2. Required user inputs

| Input | Notes |
|---|---|
| Birth date | Required for natal chart + numerology |
| First name | Required for personalization |

---

## 3. Optional / conditional user inputs

| Input | What it unlocks | Condition |
|---|---|---|
| Birth time (exact) | Houses 2H/8H/10H, MC (career/vocation field) | `birth_time_confidence: "exact"` |
| Birth city | Required alongside birth time | Required if birth time provided |
| Full name | Expression number (talent/capacity layer) | Optional — adds depth |

---

## 4. Required provider / calculated data

| Signal | Source | Rule doc | Notes |
|---|---|---|---|
| Jupiter sign + aspects | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Expansion / opportunity orientation |
| Saturn sign + aspects | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Structure / mastery / earned authority |
| Venus sign + aspects | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Values / resource sense / material taste |
| Mars sign + aspects | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Drive / initiative / professional energy |
| Pluto aspects | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Power dynamics / transformation in work |
| Sun sign + aspects | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Identity and authorship in work context |
| Mercury sign | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Thinking style / communication in professional field |
| Earth element emphasis | Derived from planetary signs | `ELEMENT_MODALITY_RULES_v1.md` | Material stability / craft orientation |
| Life Path number | In-code calculation | `NUMEROLOGY_RULES_v1.md` (future) | Core professional operating lesson |

---

## 5. Optional / conditional provider data

| Signal | Condition | Rule doc | Notes |
|---|---|---|---|
| House 2 (value / earned income) | Exact birth time | `ASTRO_HOUSE_RULES_v1.md` | Resource and self-worth field |
| House 8 (shared resources / depth) | Exact birth time | `ASTRO_HOUSE_RULES_v1.md` | External resources / depth field |
| House 10 / MC (vocation / public role) | Exact birth time | `ASTRO_HOUSE_RULES_v1.md` | Professional visibility and earned authority |
| House 6 (work rhythm / service) | Exact birth time | `ASTRO_HOUSE_RULES_v1.md` | Day-to-day professional rhythm |
| Expression number | Full name available | `NUMEROLOGY_RULES_v1.md` (future) | Professional capacity / talent architecture |
| BaZi resource / output pillars | Provider payload available | `BAZI_DAY_MASTER_RULES_v1.md` (future) | BaZi material and resource tendency |
| BaZi element balance | Provider payload available | `ELEMENT_MODALITY_RULES_v1.md` | Wu Xing resource / output tendency |
| Capricorn / 10H stellium emphasis | Derived | `ASTRO_ZODIAC_RULES_v1.md` | Structure and earned authority emphasis |
| Taurus / 2H stellium emphasis | Derived | `ASTRO_ZODIAC_RULES_v1.md` | Value and resource stability emphasis |

---

## 6. Required curated rule docs (available)

| Rule doc | Layer covered |
|---|---|
| `ASTRO_PLANET_RULES_v1.md` | Jupiter, Saturn, Venus, Mars, Pluto, Sun, Mercury |
| `ASTRO_ASPECT_RULES_v1.md` | Jupiter/Saturn/Venus/Mars/Pluto aspects |
| `ASTRO_ZODIAC_RULES_v1.md` | Sign-level resource/authority themes |
| `ELEMENT_MODALITY_RULES_v1.md` | Earth element + material competence |
| `ASTRO_HOUSE_RULES_v1.md` | 2H/6H/8H/10H (conditional) |
| `BIRTH_TIME_RELIABILITY_POLICY_v1.md` | Birth time gate |

---

## 7. Future rule docs still missing

| Rule doc | Layer | Phase |
|---|---|---|
| `NUMEROLOGY_RULES_v1.md` | LP / Expression as professional capacity | KB2-B |
| `BAZI_DAY_MASTER_RULES_v1.md` | BaZi material / resource / output patterns | KB2-C |
| Professional archetype rules | Convergence-based professional archetype synthesis | KB2 or MAP1 |

---

## 8. Gated layers

| Layer | Status | Notes |
|---|---|---|
| Investment / financial strategy | blocked | Not a Darrow product output |
| Tax / legal / business structure advice | blocked | Not a Darrow product output |
| Wealth guarantee claims | blocked permanently | Never allowed |
| "Lucky money" framing | blocked permanently | Never allowed |

---

## 9. Blocked claims

```text
Wealth / income / financial outcome guarantees
"This aspect guarantees career success / failure"
Investment, legal, or financial advice of any kind
"Your best career path is [specific profession]"
"You will earn [amount]"
"Move to X for your career" (belongs to PLACE if at all)
"Your 10th house guarantees [role/status]"
"This planet guarantees promotion / business success"
Lucky money numbers / colors / stones
Medical / health / fitness claims
Compatibility of financial profiles
```

---

## 10. Minimum viable generation level

```text
With: birth date only

Available:
  - Jupiter / Saturn / Venus / Mars / Pluto / Sun / Mercury signs and aspects
  - Earth element and professional modality emphasis
  - Life Path as professional operating lesson
  - Cross-layer convergence (planet signals + numerology)
  - Professional archetype framing without house confirmation

Not available:
  - Houses 2H / 8H / 10H (need birth time)
  - MC / vocational field (need birth time)
  - Expression numerology (need full name)
  - BaZi resource patterns (conditional on payload)

Confidence: medium — strong professional pattern without house/MC confirmation
```

---

## 11. Full-quality generation level

```text
With: birth date + exact birth time + birth city + full name + BaZi payload

Available:
  - All above plus
  - Houses 2H / 6H / 8H / 10H
  - MC and vocational emphasis
  - Expression numerology (professional capacity layer)
  - BaZi resource / output element patterns
  - Professional archetype from multi-layer convergence
  - Full synthesis: resource pattern + professional drive + authority style + business mechanism

Confidence: high
```

---

## 12. Confidence levels by section

| Section | Without birth time | With birth time |
|---|---|---|
| Resource / value orientation (Venus/2H) | medium | high |
| Professional drive and energy (Mars/Saturn) | high | high |
| Expansion / opportunity (Jupiter) | high | high |
| Earned authority and mastery (Saturn) | high | high |
| Power dynamics in work (Pluto) | high | high |
| Vocational field / public role (10H/MC) | blocked | high |
| Work rhythm and service (6H) | blocked | high |
| Shared resources / business depth (8H) | blocked | high |
| Professional capacity (Expression) | blocked (no name) | conditional |
| BaZi resource / output | conditional | conditional |

---

## 13. What must never be hallucinated

```text
Houses 2/6/8/10 when birth time is unknown
MC / vocational field when birth time is unknown
Expression number when full name is absent
BaZi resource patterns when provider payload is absent
Specific income, outcome, or career path predictions
Financial, legal, or investment advice
Compatibility of two people's financial patterns
```

🔒 docs-only planning · not active in runtime · MOD-SUFF0 · requires MAP0/MAP1/runtime approval
