# DARROW CODE — CORE Module Requirements v1

**Status:** docs-only planning / data sufficiency matrix
**Runtime status:** not active
**Not prompt/schema/template/provider/runtime authority**
**Requires later MAP0/MAP1/runtime approval before use**

Phase: MOD-SUFF0
Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md`

---

## 1. Module purpose

CORE is the foundation report. It is the primary product every client receives. All other modules are add-ons built on top of CORE.

CORE covers: identity architecture, operating mode, emotional rhythm, shadow and friction patterns, relational tendencies, professional archetype, environmental resonance, numerology code, and executive synthesis.

---

## 2. Required user inputs

| Input | Notes |
|---|---|
| Birth date (DD/MM/YYYY) | Required for natal chart + numerology |
| First name | Required for report personalization |

---

## 3. Optional / conditional user inputs

| Input | What it unlocks | Condition |
|---|---|---|
| Birth time (HH:MM) | Houses 1–12, Ascendant, MC, IC, Descendant | `birth_time_confidence: "exact"` |
| Birth city | Required alongside birth time for house calculation | Required if birth time provided |
| Full name (all names) | Expression / Soul Urge / name numerology layer | Must be available and normalized |
| BaZi sex (male/female) | BaZi Luck Pillar direction | If BaZi is used |

---

## 4. Required provider / calculated data

| Signal | Source | Rule doc |
|---|---|---|
| Sun sign | FreeAstroAPI natal | `ASTRO_ZODIAC_RULES_v1.md` |
| Moon sign | FreeAstroAPI natal | `ASTRO_ZODIAC_RULES_v1.md` + `ASTRO_PLANET_RULES_v1.md` |
| All planet signs (Mercury → Pluto) | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` |
| Major natal aspects | FreeAstroAPI natal | `ASTRO_ASPECT_RULES_v1.md` |
| Element balance | Derived from planetary signs | `ELEMENT_MODALITY_RULES_v1.md` |
| Modality balance | Derived from planetary signs | `ELEMENT_MODALITY_RULES_v1.md` |
| Life Path number | In-code calculation from birth date | `NUMEROLOGY_RULES_v1.md` (future) |
| Birthday number | In-code calculation from birth day | `NUMEROLOGY_RULES_v1.md` (future) |

---

## 5. Optional / conditional provider data

| Signal | Condition | Rule doc |
|---|---|---|
| Houses 1–12 | `birth_time_confidence: "exact"` | `ASTRO_HOUSE_RULES_v1.md` |
| Ascendant (Rising sign) | `birth_time_confidence: "exact"` | `ASTRO_HOUSE_RULES_v1.md` |
| MC / IC / Descendant | `birth_time_confidence: "exact"` | `ASTRO_HOUSE_RULES_v1.md` |
| Expression / Soul Urge number | Full name available | `NUMEROLOGY_RULES_v1.md` (future) |
| Personal Year number | Current year + birth date | `NUMEROLOGY_RULES_v1.md` (future) — light context only |
| BaZi Day Master | FreeAstroAPI BaZi payload available | `BAZI_DAY_MASTER_RULES_v1.md` (future) |
| BaZi element percentages | FreeAstroAPI BaZi payload available | `ELEMENT_MODALITY_RULES_v1.md` |
| Chinese zodiac animal | FreeAstroAPI BaZi pillars | `CHINESE_ZODIAC_RULES_v1.md` (future) — soft layer |
| Environmental place archetype | Chart has strong place-signal (IC, Moon, 4H) | `CORE_PLACE_ARCHETYPE_POLICY_v1.md` — 1–3 examples max |

---

## 6. Required curated rule docs (available)

| Rule doc | Layer covered |
|---|---|
| `ASTRO_ZODIAC_RULES_v1.md` | 12 signs |
| `ASTRO_PLANET_RULES_v1.md` | 10 planets + conditional supporting |
| `ASTRO_ASPECT_RULES_v1.md` | 6 major aspects |
| `ELEMENT_MODALITY_RULES_v1.md` | 4 elements, 3 modalities, polarity |
| `ASTRO_HOUSE_RULES_v1.md` | 12 houses (conditional) |
| `BIRTH_TIME_RELIABILITY_POLICY_v1.md` | Birth time gate |

---

## 7. Future rule docs still missing (needed for full quality)

| Rule doc | Layer | Phase |
|---|---|---|
| `NUMEROLOGY_RULES_v1.md` | LP / Birthday / PY / Expression / Soul Urge | KB2-B |
| `BAZI_DAY_MASTER_RULES_v1.md` | BaZi Day Master operating climate | KB2-C |
| `CHINESE_ZODIAC_RULES_v1.md` | Chinese zodiac soft layer | KB2-C |
| `ARCHETYPE_LIBRARY_v1.md` | Named professional archetypes | KB2 or MAP1 |

---

## 8. Gated layers

| Layer | Status | Condition to unlock |
|---|---|---|
| Colors (supportive) | gated | Curated dict approved + explicit unlock |
| Gemstones (supportive) | gated | Curated dict approved + explicit unlock |
| Celtic trees / Ogham | gated | Curated rules approved + explicit unlock |
| Name etymology automation | gated | Curated rules + explicit unlock |
| Environmental place archetype | conditional | Chart must strongly support it; see `CORE_PLACE_ARCHETYPE_POLICY_v1.md` |

---

## 9. Blocked claims

```text
Astrocartography lines in CORE
Relocated chart interpretation in CORE
City ranking or "best city" claims in CORE
Synastry in CORE
Health / Neijing readings
Daily horoscope predictions
Lucky numbers / colors / stones
Healing / protection / wealth guarantees
Name-change recommendations
Deterministic fate claims
Medical / legal / financial advice
"You are [sign], therefore..."
```

---

## 10. Minimum viable generation level

```text
With: birth date only (no birth time, no full name)

Available:
  - Sun / Moon / planet signs and aspects
  - Element and modality balance
  - Life Path + Birthday number
  - Personal Year (light context)
  - Cross-layer convergence synthesis

Not available:
  - Houses / Ascendant / MC / IC
  - Expression / Soul Urge numerology
  - BaZi (if provider payload missing)
  - Colors / stones / trees (gated)

Confidence: medium
Quality: solid symbolic profile without house/angle layer
```

---

## 11. Full-quality generation level

```text
With: birth date + exact birth time + birth city + full name + BaZi payload

Available:
  - All of the above
  - Houses 1–12
  - Ascendant / MC / IC / Descendant
  - Planet-in-house layer
  - Angular / house-stellium emphasis
  - Expression / Soul Urge numerology
  - BaZi Day Master and element balance
  - Chinese zodiac soft layer
  - Cross-system convergence (natal + numerology + BaZi)

Confidence: high
Quality: full symbolic profile with all allowed layers
```

---

## 12. Confidence levels by section

| Section | Without birth time | With birth time |
|---|---|---|
| Orientation / identity tone | high | high |
| Core architecture (planets/aspects) | high | high |
| Operating mode | high | high |
| Emotional rhythm (Moon) | high | high |
| Shadow and friction | high | high |
| Relational pattern | medium | high |
| Professional archetype | medium | high (MC/10H available) |
| Social interface | low (no Asc) | high (Asc available) |
| Environmental resonance | medium | high (IC/4H available) |
| Numerology code (LP/Birthday) | high | high |
| Numerology code (Expr/SU) | blocked if no full name | conditional |
| BaZi / Four Pillars | conditional | conditional |
| Executive summary | high | high |

---

## 13. What must never be hallucinated

```text
Birth time when not provided
Rising sign (Ascendant) when birth time is unknown
House placements when birth time is unknown
MC / IC / Descendant when birth time is unknown
Full name numerology when full name is not provided
BaZi Day Master when provider payload is absent
Specific planet degree positions
Aspect presence when not in provider data
Personal Year when current year is not available
```

🔒 docs-only planning · not active in runtime · MOD-SUFF0 · requires MAP0/MAP1/runtime approval
