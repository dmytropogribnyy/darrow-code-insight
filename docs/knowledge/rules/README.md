# Darrow Code Curated Rules

**Status:** future curated-rule area / docs-only.

This directory will contain original Darrow Code symbolic interpretation rules created from approved source packs.

## Rule requirements

Every future rule should include:

- layer;
- trigger/source basis;
- Darrow meaning;
- strength expression;
- shadow expression;
- practical direction;
- report use;
- status: allowed / conditional / gated / blocked;
- forbidden claims.

## Original language rule

Curated rules must be written in original Darrow Code language.

Allowed:

```text
source concept → Darrow trigger → Darrow meaning → strength → risk → practical direction → forbidden claims
```

Not allowed:

- copying external prose;
- lightly paraphrasing copyrighted reports/articles;
- importing protected tables/databases wholesale;
- creating deterministic claims.

## KB2-A imported rule docs (2026-06-02)

| File | Layer | Gate |
|---|---|---|
| `ASTRO_ZODIAC_RULES_v1.md` | 12 signs, elements, modalities, polarity | allowed |
| `ASTRO_PLANET_RULES_v1.md` | 10 planets + conditional Chiron/Node/Lilith | allowed / conditional |
| `ASTRO_ASPECT_RULES_v1.md` | 6 major aspects | allowed |
| `ELEMENT_MODALITY_RULES_v1.md` | 4 elements, 3 modalities, polarity | allowed |
| `ASTRO_HOUSE_RULES_v1.md` | 12 houses, groupings, empty-house, house-system policy | conditional (birth time required) |
| `BIRTH_TIME_RELIABILITY_POLICY_v1.md` | exact / approximate / unknown definitions and fallback | policy doc |

All files are curated Darrow rule docs · docs-only · not active in runtime.

## Future rule docs (planned)

```text
NUMEROLOGY_RULES_v1.md        — KB2-B
BAZI_DAY_MASTER_RULES_v1.md   — KB2-C
CHINESE_ZODIAC_RULES_v1.md    — KB2-C
NAME_SYMBOLIC_RULES_v1.md     — KB2-D (gated)
COLOR_SYMBOLIC_RULES_v1.md    — KB2-D (gated)
STONE_SYMBOLIC_RULES_v1.md    — KB2-D (gated)
TREE_SYMBOLIC_MIRRORS_v1.md   — KB2-D (gated)
```

## Gated defaults

Unless explicitly unlocked later:

- colors are gated;
- gemstones are gated;
- trees/Ogham are gated;
- name etymology automation is gated;
- compatibility systems are gated;
- astrocartography is blocked for CORE.
