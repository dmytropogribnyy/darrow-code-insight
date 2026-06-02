# DARROW CODE — FreeAstroAPI Provider Mapping Plan v1

**Status:** KBSYS0 docs-only plan.  
**Scope:** mapping plan only. No runtime implementation.

---

## 1. Purpose

This document defines the future mapping model between FreeAstroAPI / `DarrowChartData` and curated Darrow Code knowledge rules.

It does **not** authorize any code changes or new endpoint usage.

---

## 2. Source hierarchy

| Layer | Role |
|---|---|
| `src/lib/astro/types.ts` | Current normalized data shape |
| `src/lib/astro/provider.ts` | Provider interface |
| `src/lib/astro/FREEASTROAPI_REFERENCE.md` | Current provider reference |
| `docs/FREEASTROAPI_DARROW_REFERENCE_v3_PLACE_READY.md` | Current CORE/PLACE boundary reference |
| `docs/knowledge/rules/*.md` | Future curated Darrow interpretation rules |

If this plan conflicts with actual provider types, provider types win.
If this plan conflicts with `SOURCE_OF_TRUTH_v4_1.md`, source of truth wins.

---

## 3. Mapping model

Future mapping docs should use this shape:

```text
provider_or_chart_field
→ normalized_darrow_signal
→ rule_doc
→ report_section
→ status
→ conditions
→ forbidden_claims
```

---

## 4. Initial mapping targets

| Provider / DarrowChartData field | Normalized signal | Future rule doc | Report use | Status |
|---|---|---|---|---|
| `natal.sun.sign` | sun sign / identity tone | `ASTRO_ZODIAC_RULES_v1.md` | orientation / core architecture | allowed |
| `natal.moon.sign` | moon sign / emotional rhythm | `ASTRO_ZODIAC_RULES_v1.md` + planet rules | emotional rhythm / battery | allowed |
| `natal.ascendant` | social interface | future Ascendant rule | social interface | conditional: reliable birth time |
| `natal.midheaven` | public role / vocation | house/angle rules | professional archetype | conditional: reliable birth time |
| `natal.planets[]` | planetary functions | `ASTRO_PLANET_RULES_v1.md` | CORE sections | allowed |
| `natal.aspects[]` | function relationships | `ASTRO_ASPECT_RULES_v1.md` | friction / gifts / operating mode | allowed |
| `natal.houses` | life-area emphasis | `ASTRO_HOUSE_RULES_v1.md` | section-specific | conditional: reliable birth time |
| `numerology.life_path` | life operating lesson | `NUMEROLOGY_RULES_v1.md` | numerology_code / executive summary | allowed |
| `numerology.birth_day_number` | instinctive gift | `NUMEROLOGY_RULES_v1.md` | numerology_code | allowed |
| `numerology.personal_year` | current-cycle climate | `NUMEROLOGY_RULES_v1.md` | YEAR later / light CORE context | conditional |
| `numerology.name_numerology.*` | name-code layer | `NUMEROLOGY_RULES_v1.md` | optional if full name exists | conditional |
| `bazi.day_master` | BaZi operating climate | `BAZI_DAY_MASTER_RULES_v1.md` | operating mode / identity texture | conditional |
| `bazi.pillars` | Chinese calendar context | `CHINESE_ZODIAC_RULES_v1.md` / BaZi rules | supporting context | conditional |
| `bazi.elements.percentages` | Wu Xing balance | element rules | environment / body / style texture | conditional |
| `transits` | current slow-planet climate | future transit rules | YEAR later | conditional |
| `solar_return` | annual chart climate | future solar return rules | YEAR later | conditional |
| `moon_phase` | timing / lunar nuance | future moon phase rules | YEAR/BODY/STYLE small texture | conditional |
| `bazi_flow` | annual/monthly BaZi timing | future BaZi flow rules | YEAR only | conditional |

---

## 5. Blocked from CORE mapping

Do not map these into CORE:

- astrocartography;
- synastry;
- BaZi synastry;
- health/Neijing;
- provider-generated psychological reports;
- daily sign reports;
- SVG chart visuals;
- lucky-number/color/stone endpoints or content;
- remedial gemstone/feng-shui content.

---

## 6. Birth-time reliability requirements

Houses and angles require reliable birth time and location.

If birth time is unknown or unreliable:

```text
Do not use houses.
Do not use Ascendant.
Do not use MC / IC / Descendant.
Do not use house rulers.
Do not use planets-in-houses.
```

Future MAP1 should create a dedicated `BIRTH_TIME_RELIABILITY_POLICY_v1.md` if needed.

---

## 7. Interpretation stripping policy

Provider prose is not Darrow output.

Future mapping must preserve the rule:

```text
Provider data = factual/calculated source.
Darrow rules = original interpretation.
Customer report = premium editorial synthesis.
```

Do not pass provider interpretation/prose into the model when avoidable.
Do not store or render provider report prose as Darrow content.

---

## 8. Future MAP1 tasks

MAP1 should:

1. read existing provider types;
2. list actual available fields;
3. map fields to curated rule docs;
4. mark allowed / conditional / gated / blocked;
5. document missing-data behavior;
6. document birth-time reliability rules;
7. document report-section routing;
8. confirm no runtime/provider code changes.
