# DARROW CODE — Report Section Routing Plan v1

**Status:** KBSYS0 docs-only plan.  
**Scope:** section-routing plan only. No runtime implementation.

---

## 1. Purpose

This document defines the future routing model between curated knowledge rules and Darrow Code report sections.

It does not authorize prompt, schema, PDF template, route, provider, or generation changes.

---

## 2. Routing principle

```text
Data signal
→ curated rule
→ report section
→ human-readable synthesis
```

The report should never become a technical dump. Technical data belongs mostly in proof tags, diagnostics, or internal reasoning.

---

## 3. CORE routing candidates

| Report area | Possible signals | Status |
|---|---|---|
| orientation | Sun/Moon/chart overview, Life Path, dominant motifs | allowed |
| identity_card | name only if verified, key chart/numerology motifs | conditional |
| core_architecture | planets, signs, aspects, elements, numerology convergence | allowed |
| operating_mode | modality, aspects, BaZi Day Master if available | conditional |
| shadow_and_friction | hard aspects, Saturn/Mars/Pluto patterns, numerology shadow | allowed |
| relational_pattern | Moon/Venus/Mars/7H only if data reliable | conditional |
| professional_archetype | 10H/MC only if time reliable; Saturn/Jupiter/Mars/Mercury | conditional |
| body_and_vitality | Moon/Mars/Saturn/6H only as symbolic rhythm; no medical claims | conditional |
| environment_and_resonance | Moon/IC/4H if reliable, BaZi element texture | conditional |
| numerology_code | Life Path, Birthday, Personal Year, name numerology if full name | allowed / conditional |
| executive_summary | strongest convergences only | allowed |
| closing_pillars | practical Darrow synthesis | allowed |

---

## 4. Add-on routing candidates

| Add-on | Future signals | Notes |
|---|---|---|
| LOVE | Venus, Mars, Moon, 5H/7H/8H, relationship archetype | No synastry in MVP unless explicit later phase |
| MONEY | 2H/8H/10H, Jupiter, Saturn, Venus, Pluto, numerology 8/4/6, BaZi resource/output | No wealth guarantees |
| BODY | Moon, Mars, Saturn, 6H, element balance, BaZi stress/recovery texture | No medical claims |
| YEAR | Personal Year, transits, solar return, BaZi flow, moon phase as small texture | No daily horoscope claims |
| STYLE | Venus, Ascendant if reliable, Moon, colors, stones, materials | Colors/stones gated |
| PLACE | environmental resonance now; astrocartography only future PLACE | No city rankings in CORE |

---

## 5. Routing restrictions

Do not route these into CORE:

- astrocartography lines;
- city/country rankings;
- synastry;
- daily forecasts;
- lucky colors/numbers/stones;
- healing/protection/remedy advice;
- provider-generated interpretation prose;
- medical/legal/financial certainty.

---

## 6. Missing-data behavior

If a signal is unavailable:

```text
skip it
or downgrade it
or mark it as unavailable in diagnostics
```

Do not hallucinate missing chart fields.
Do not infer houses/angles when birth time is unknown.
Do not infer full-name numerology when full name is absent.
Do not infer BaZi hour-pillar meaning when hour confidence is low.

---

## 7. Future MAP1 work

MAP1 should turn this plan into a full routing table:

```text
DarrowChartData field
→ rule document
→ report section
→ conditions
→ fallback behavior
→ forbidden claims
```
