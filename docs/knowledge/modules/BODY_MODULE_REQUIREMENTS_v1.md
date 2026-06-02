# DARROW CODE — BODY Module Requirements v1

**Status:** docs-only planning / data sufficiency matrix
**Runtime status:** not active
**Not prompt/schema/template/provider/runtime authority**
**Requires later MAP0/MAP1/runtime approval before use**

Phase: MOD-SUFF0
Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md`

---

## 1. Module purpose

BODY covers the person's stress signature and recovery rhythm — how they accumulate and release pressure, what their body needs to restore, what patterns of overwork and depletion appear, and what environmental and rhythmic conditions support their well-being.

**Scope note:** BODY is a stress/recovery rhythm module, not a medical guidance module. It produces symbolic and behavioral pattern recognition only. It must not produce health diagnoses, treatment advice, or health outcome guarantees.

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
| Birth time (exact) | House 6 (routine/rhythm), House 12 (hidden pressure/rest), House 1 (body interface), IC/4H | `birth_time_confidence: "exact"` |
| Birth city | Required alongside birth time | Required if birth time provided |

---

## 4. Required provider / calculated data

| Signal | Source | Rule doc | Notes |
|---|---|---|---|
| Moon sign + aspects | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Emotional rhythm / restoration needs / body-feeling connection |
| Mars sign + aspects | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Physical energy / drive / depletion style |
| Saturn sign + aspects | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Discipline / overwork / contraction patterns |
| Sun sign | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Vitality and life force orientation |
| Element balance | Derived from planetary signs | `ELEMENT_MODALITY_RULES_v1.md` | Overall stress/recovery element texture |

---

## 5. Optional / conditional provider data

| Signal | Condition | Rule doc | Notes |
|---|---|---|---|
| House 6 (routine / work rhythm / body maintenance) | Exact birth time | `ASTRO_HOUSE_RULES_v1.md` | Daily rhythm and service field |
| House 12 (hidden pressure / rest / unconscious patterns) | Exact birth time | `ASTRO_HOUSE_RULES_v1.md` | Hidden load and restoration field |
| House 1 (body interface / physical presence) | Exact birth time | `ASTRO_HOUSE_RULES_v1.md` | Embodied self-presentation field |
| IC / House 4 (emotional base / private restoration) | Exact birth time | `ASTRO_HOUSE_RULES_v1.md` | Inner anchoring and home-base restoration |
| Ascendant (physical / energetic interface) | Exact birth time | `ASTRO_HOUSE_RULES_v1.md` | Body-level first impression and energy |
| BaZi element balance (stress/recovery texture) | Provider payload available | `ELEMENT_MODALITY_RULES_v1.md` | Wu Xing body rhythm as optional texture |
| Moon phase at birth | Provider payload available | — (future rule) | Lunar rhythm as light body-cycle texture |
| Virgo / 6H emphasis | Derived | `ASTRO_ZODIAC_RULES_v1.md` | Refinement / body-awareness tendency |
| Neptune aspects (body dissolve / rest need) | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Porousness / need for deep restoration |

---

## 6. Required curated rule docs (available)

| Rule doc | Layer covered |
|---|---|
| `ASTRO_PLANET_RULES_v1.md` | Moon, Mars, Saturn, Sun, Neptune |
| `ASTRO_ASPECT_RULES_v1.md` | Moon/Mars/Saturn aspects |
| `ELEMENT_MODALITY_RULES_v1.md` | Element balance as stress/recovery texture |
| `ASTRO_ZODIAC_RULES_v1.md` | Sign-level body/rhythm themes |
| `ASTRO_HOUSE_RULES_v1.md` | 1H/4H/6H/12H (conditional) |
| `BIRTH_TIME_RELIABILITY_POLICY_v1.md` | Birth time gate |

---

## 7. Future rule docs still missing

| Rule doc | Layer | Phase |
|---|---|---|
| `NUMEROLOGY_RULES_v1.md` | LP/Birthday as rhythm pattern context | KB2-B |
| `BAZI_DAY_MASTER_RULES_v1.md` | BaZi element stress/recovery patterns | KB2-C |
| Moon phase rules | Lunar cycle rhythm as body texture | Future |

---

## 8. Gated layers

| Layer | Status | Notes |
|---|---|---|
| Health / medical content of any kind | blocked permanently | Not a Darrow output |
| Medical body-system astrology (6th/12th as health diagnosis) | blocked permanently | Never allowed |
| Healing stones or colors for BODY | gated | Curated dict + explicit unlock required |

---

## 9. Blocked claims

```text
Health diagnoses from planetary placements
"Your 6th house indicates [illness/condition]"
"Your 12th house suggests hidden health problems"
"Mars in X means you have energy/anger issues" as medical claim
Treatment advice of any kind
"You should [eat/exercise/sleep/medicate] differently based on your chart"
"This planet weakens your immune system"
Healing / wellness guarantees from symbolic layer
Healing stone / color recommendations for health outcomes
"Your body type is [type] because of [sign/planet]"
Any medical, clinical, or psychiatric diagnosis
```

---

## 10. Minimum viable generation level

```text
With: birth date only

Available:
  - Moon sign / emotional restoration pattern
  - Mars sign / physical drive and depletion style
  - Saturn sign / overwork and contraction pattern
  - Sun sign / vitality orientation
  - Element balance / stress texture (fire/earth/air/water)
  - Basic stress-and-recovery behavioral pattern synthesis

Not available:
  - House 6 / 12 / 1 (need birth time)
  - IC / 4H restoration field (need birth time)
  - BaZi element stress patterns (conditional on payload)

Confidence: medium — behavioral stress/recovery pattern without house confirmation
```

---

## 11. Full-quality generation level

```text
With: birth date + exact birth time + birth city + BaZi payload

Available:
  - All above plus
  - House 1 (body interface)
  - House 4 / IC (inner restoration base)
  - House 6 (daily rhythm and routine field)
  - House 12 (hidden pressure and deep rest field)
  - BaZi element balance as stress/recovery overlay
  - Full behavioral synthesis: drive + rhythm + rest need + depletion pattern

Confidence: high
```

---

## 12. Confidence levels by section

| Section | Without birth time | With birth time |
|---|---|---|
| Restoration needs (Moon) | high | high |
| Physical drive and depletion (Mars) | high | high |
| Overwork / contraction pattern (Saturn) | high | high |
| Vitality orientation (Sun) | high | high |
| Element stress texture | high | high |
| Daily rhythm field (6H) | blocked | high |
| Hidden pressure / rest field (12H) | blocked | high |
| Body interface (1H/Asc) | blocked | high |
| Inner restoration base (4H/IC) | blocked | high |
| BaZi element patterns | conditional | conditional |

---

## 13. What must never be hallucinated

```text
Houses 1/4/6/12 when birth time is unknown
IC / Ascendant when birth time is unknown
BaZi element balance when provider payload is absent
Health diagnoses from any signal
Medical treatment recommendations
Body type or constitution claims without a curated rule base
"Your chart indicates [specific physical condition]"
Wellness / healing guarantees
```

🔒 docs-only planning · not active in runtime · MOD-SUFF0 · requires MAP0/MAP1/runtime approval
