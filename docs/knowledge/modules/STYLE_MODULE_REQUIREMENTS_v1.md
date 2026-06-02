# DARROW CODE — STYLE Module Requirements v1

**Status:** docs-only planning / data sufficiency matrix
**Runtime status:** not active
**Not prompt/schema/template/provider/runtime authority**
**Requires later MAP0/MAP1/runtime approval before use**

Phase: MOD-SUFF0
Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md`

---

## 1. Module purpose

STYLE covers the person's aesthetic signature, personal visual identity, and the colors, textures, and environmental aesthetics that resonate with their chart pattern.

**Scope note:** Colors and gemstones are gated layers. STYLE at minimum version covers aesthetic archetype from Venus, Moon, and elements — without color or stone recommendations. Color and stone content becomes available only after explicit approval and curated dictionary unlock.

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
| Birth time (exact) | Ascendant (style interface / physical presence) | `birth_time_confidence: "exact"` |
| Birth city | Required alongside birth time | Required if birth time provided |

---

## 4. Required provider / calculated data

| Signal | Source | Rule doc | Notes |
|---|---|---|---|
| Venus sign + aspects | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Core aesthetic sense / value / attraction quality |
| Moon sign | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Aesthetic comfort / emotional environment texture |
| Sun sign | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Core identity as visual / expressive signature |
| Element balance | Derived from planetary signs | `ELEMENT_MODALITY_RULES_v1.md` | Elemental aesthetic register (fire / earth / air / water) |

---

## 5. Optional / conditional provider data

| Signal | Condition | Rule doc | Notes |
|---|---|---|---|
| Ascendant sign | Exact birth time | `ASTRO_HOUSE_RULES_v1.md` | Physical interface / style presentation |
| House 5 (creative expression / aesthetics) | Exact birth time | `ASTRO_HOUSE_RULES_v1.md` | Creative self-expression field |
| House 1 (body / presence) | Exact birth time | `ASTRO_HOUSE_RULES_v1.md` | Physical self and style interface |
| BaZi element balance | Provider payload available | `ELEMENT_MODALITY_RULES_v1.md` | Wu Xing aesthetic element as optional texture |
| Neptune sign / aspects | FreeAstroAPI natal | `ASTRO_PLANET_RULES_v1.md` | Aesthetic imagination / dreamy quality |
| Libra / Venus emphasis | Derived | `ASTRO_ZODIAC_RULES_v1.md` | Refined / balanced aesthetic tendency |
| Taurus emphasis | Derived | `ASTRO_ZODIAC_RULES_v1.md` | Sensory / material / tactile aesthetic |
| Supportive colors (gated) | Curated dict approved + explicit unlock | `COLORS_SYMBOLIC_RULES_v1.md` (future) | Gated until KB2-D or explicit approval |
| Supportive gemstones (gated) | Curated dict approved + explicit unlock | `STONE_SYMBOLIC_RULES_v1.md` (future) | Gated until KB2-D or explicit approval |
| Symbolic allies / materials (gated) | Curated dict approved + explicit unlock | Future | Gated until explicitly unlocked |

---

## 6. Required curated rule docs (available)

| Rule doc | Layer covered |
|---|---|
| `ASTRO_PLANET_RULES_v1.md` | Venus, Moon, Sun, Neptune |
| `ASTRO_ZODIAC_RULES_v1.md` | Sign-level aesthetic themes |
| `ELEMENT_MODALITY_RULES_v1.md` | Elemental aesthetic register |
| `ASTRO_HOUSE_RULES_v1.md` | 1H/5H/Ascendant (conditional) |
| `BIRTH_TIME_RELIABILITY_POLICY_v1.md` | Birth time gate |

---

## 7. Future rule docs still missing

| Rule doc | Layer | Phase |
|---|---|---|
| `COLORS_SYMBOLIC_RULES_v1.md` | Supportive color palette (gated) | KB2-D |
| `STONE_SYMBOLIC_RULES_v1.md` | Supportive gemstone layer (gated) | KB2-D |
| `NUMEROLOGY_RULES_v1.md` | LP / Birthday as style/aesthetic texture | KB2-B |

---

## 8. Gated layers

| Layer | Status | Condition to unlock |
|---|---|---|
| Supportive colors | gated | Curated color dict (`COLORS_SYMBOLIC_RULES_v1.md`) approved + explicit unlock |
| Supportive gemstones | gated | Curated stone dict (`STONE_SYMBOLIC_RULES_v1.md`) approved + explicit unlock |
| Symbolic allies / materials | gated | Future curated rules + explicit unlock |
| Celtic tree aesthetic mirror | gated | KB2-D + explicit unlock |

---

## 9. Blocked claims

```text
"Your lucky color is X"
"This color attracts love / money / success"
"Wear this color for luck / protection / healing"
"Your gemstone is X"
"This stone protects you"
"Wearing X gemstone heals your [issue]"
"Must wear / use" language
"This color brings money"
"Avoid wearing [color] because it is bad for your chart"
Color or stone compatibility claims between people
Medical or psychological healing from color or material
"Your style determines your success"
```

---

## 10. Minimum viable generation level

```text
With: birth date only (no birth time; colors/stones gated)

Available:
  - Venus sign aesthetic archetype
  - Moon sign environmental comfort texture
  - Element balance aesthetic register
  - Sun sign expressive quality
  - Cross-signal aesthetic synthesis (warm / structural / airy / depth)
  - Aesthetic archetype framing without specific color/stone output

Not available:
  - Ascendant / House 1 (need birth time)
  - House 5 (need birth time)
  - Colors (gated)
  - Stones (gated)

Confidence: medium — aesthetic personality framing without color/stone or Ascendant
```

---

## 11. Full-quality generation level

```text
With: birth date + exact birth time + birth city + approved color/stone dict unlocked

Available:
  - All above plus
  - Ascendant (physical/style interface)
  - House 1 and House 5 emphasis
  - BaZi element aesthetic texture (if payload)
  - Supported colors as symbolic anchors (if unlocked — not lucky/healing claims)
  - Supported stones as symbolic mirrors (if unlocked — not remedy claims)
  - Aesthetic palette synthesis across natal + element + BaZi layers

Confidence: high (when gated layers unlocked)
```

---

## 12. Confidence levels by section

| Section | Without birth time / gated | With birth time / gated unlocked |
|---|---|---|
| Venus aesthetic archetype | high | high |
| Moon environmental texture | high | high |
| Elemental aesthetic register | high | high |
| Ascendant / style interface | blocked | high |
| House 1 / 5 emphasis | blocked | high |
| Color palette (symbolic) | gated | conditional (if approved) |
| Gemstone mirror | gated | conditional (if approved) |
| Symbolic allies | gated | conditional (if approved) |

---

## 13. What must never be hallucinated

```text
Ascendant when birth time is unknown
Houses 1/5 when birth time is unknown
Colors when curated dict is not approved / layer not unlocked
Stones when curated dict is not approved / layer not unlocked
"Lucky" color or stone framing under any condition
Healing or protection claims from any aesthetic layer
Compatibility claims from aesthetic profiles
```

🔒 docs-only planning · not active in runtime · MOD-SUFF0 · requires MAP0/MAP1/runtime approval
