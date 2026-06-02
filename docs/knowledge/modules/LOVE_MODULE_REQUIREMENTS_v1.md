# DARROW CODE — LOVE Module Requirements v1

**Status:** docs-only planning / data sufficiency matrix
**Runtime status:** not active
**Not prompt/schema/template/provider/runtime authority**
**Requires later MAP0/MAP1/runtime approval before use**

Phase: MOD-SUFF0
Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md`

---

## 1. Module purpose

LOVE covers the person's relationship architecture: how they attract, attach, navigate intimacy, handle conflict in partnership, and what repeating relational patterns appear across relationships.

LOVE is a personal report about this person's relational pattern — it is NOT a compatibility reading in the current scope. Synastry (partner chart comparison) is a future phase requiring partner data.

---

## 2. Required user inputs

| Input | Notes |
|---|---|
| Birth date | Required for natal chart |
| First name | Required for personalization |

---

## 3. Optional / conditional user inputs

| Input | What it unlocks | Condition |
|---|---|---|
| Birth time (exact) | Houses 5H/7H/8H, Ascendant, Descendant | `birth_time_confidence: "exact"` |
| Birth city | Required alongside birth time | Required if birth time provided |
| Full name | Name numerology soul-urge layer (relational inner motive) | Optional — adds depth |
| Partner birth data | Future synastry phase | NOT current scope |

---

## 4. Required provider / calculated data

| Signal | Source | Rule doc | Notes |
|---|---|---|---|
| Moon sign | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Emotional rhythm / attachment style |
| Venus sign | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Value / attraction / relational quality |
| Mars sign | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Desire / initiative / conflict style |
| Venus aspects | FreeAstroAPI natal | `ASTRO_ASPECT_RULES_v1.md` | Relational friction or ease patterns |
| Mars aspects | FreeAstroAPI natal | `ASTRO_ASPECT_RULES_v1.md` | Desire / conflict patterns |
| Moon aspects | FreeAstroAPI natal | `ASTRO_ASPECT_RULES_v1.md` | Emotional pattern in relationship |

---

## 5. Optional / conditional provider data

| Signal | Condition | Rule doc | Notes |
|---|---|---|---|
| House 5 (romance / play) | Exact birth time | `ASTRO_HOUSE_RULES_v1.md` | Creative / romantic expression field |
| House 7 (partnership) | Exact birth time | `ASTRO_HOUSE_RULES_v1.md` | Partnership / mirror field |
| House 8 (intimacy / depth) | Exact birth time | `ASTRO_HOUSE_RULES_v1.md` | Intimacy / shared resources |
| Ascendant / Descendant | Exact birth time | `ASTRO_HOUSE_RULES_v1.md` | Social interface + partner archetype |
| Pluto aspects | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Depth / control / transformation in relationship |
| Neptune aspects | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Idealization / dissolution in relationship |
| Saturn aspects (personal planets) | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Structure / limitation in relationship patterns |
| Soul Urge number | Full name available | `NUMEROLOGY_RULES_v1.md` (future) | Inner relational motive |
| BaZi Day Master relational texture | Provider payload available | `BAZI_DAY_MASTER_RULES_v1.md` (future) | BaZi relational climate as soft texture |

---

## 6. Required curated rule docs (available)

| Rule doc | Layer covered |
|---|---|
| `ASTRO_PLANET_RULES_v1.md` | Moon, Venus, Mars, Saturn, Pluto, Neptune |
| `ASTRO_ASPECT_RULES_v1.md` | Venus/Mars/Moon aspects |
| `ASTRO_HOUSE_RULES_v1.md` | 5H/7H/8H (conditional) |
| `BIRTH_TIME_RELIABILITY_POLICY_v1.md` | Birth time gate |

---

## 7. Future rule docs still missing

| Rule doc | Layer | Phase |
|---|---|---|
| `NUMEROLOGY_RULES_v1.md` | Soul Urge as inner relational motive | KB2-B |
| `BAZI_DAY_MASTER_RULES_v1.md` | BaZi relational climate texture | KB2-C |
| Attachment / relational archetype rules | Convergence-based relational pattern synthesis | KB2 or MAP1 |

---

## 8. Gated layers

| Layer | Status | Condition to unlock |
|---|---|---|
| Synastry (partner chart comparison) | blocked / future | Partner data + explicit synastry phase |
| Compatibility guarantees | blocked permanently | Never allowed |
| "Soulmate" or "twin flame" framing | blocked permanently | Never allowed |

---

## 9. Blocked claims

```text
"Your soulmate is..."
"You are compatible with [sign] people"
"You are incompatible with X"
"This person is wrong for you"
"This aspect means you will struggle in marriage"
"Your 7th house guarantees partnership outcome"
Marriage / divorce predictions
Compatibility scores or ranking of partner types
Medical or psychological diagnoses from relational patterns
Synastry output without partner data
Health / healing claims from Venus/Moon placement
Lucky love stones / colors / rituals
```

---

## 10. Minimum viable generation level

```text
With: birth date only

Available:
  - Moon sign / emotional attachment pattern
  - Venus sign / relational quality and values
  - Mars sign / desire and conflict style
  - Venus / Mars / Moon aspects
  - Relational shadow and friction patterns
  - Relational strengths and tendencies
  - Cross-layer convergence note

Not available:
  - Houses 5/7/8 (need birth time)
  - Ascendant / Descendant (need birth time)
  - Soul Urge (need full name)
  - Synastry (need partner data — future phase)

Confidence: medium — strong personal pattern without house/angle layer
```

---

## 11. Full-quality generation level

```text
With: birth date + exact birth time + birth city + full name

Available:
  - All planetary signals above
  - Houses 5H / 7H / 8H emphasis
  - Ascendant / Descendant (partner archetype field)
  - Planet-in-house relational layer
  - Soul Urge numerology (inner relational motive)
  - BaZi relational texture (if provider payload)
  - Full convergence synthesis across systems

Confidence: high
```

---

## 12. Confidence levels by section

| Section | Without birth time | With birth time |
|---|---|---|
| Emotional attachment style (Moon) | high | high |
| Relational values and attraction (Venus) | high | high |
| Desire and conflict style (Mars) | high | high |
| Relational shadow (hard aspects) | high | high |
| Partnership field (7H/Desc) | blocked | high |
| Intimacy / depth field (8H) | blocked | high |
| Romance / creativity field (5H) | blocked | high |
| Inner relational motive (Soul Urge) | blocked (no name) | conditional |
| BaZi relational texture | conditional | conditional |

---

## 13. What must never be hallucinated

```text
Partner birth data not provided by user
Synastry or compatibility analysis without partner data
Houses 5/7/8 when birth time is unknown
Ascendant / Descendant when birth time is unknown
Soul Urge when full name is absent
Compatibility guarantees from sign or aspect patterns alone
"Your partner should be [sign]" claims
Marriage or divorce predictions
```

🔒 docs-only planning · not active in runtime · MOD-SUFF0 · requires MAP0/MAP1/runtime approval
