# DARROW CODE — KNOWLEDGE SOURCE MATRIX v1

# Status: ACTIVE · B0-approved (2026-06-02)

# Governs: approved data and knowledge layers for Darrow Code production

# Governed by: SOURCE_POLICY.md (this directory) + SOURCE_OF_TRUTH_v4_1.md

---

## 1 · PURPOSE

This matrix defines every approved data and knowledge layer, its role, scope,
and current status for Darrow Code production.

---

## 2 · APPROVED LAYERS

### TIER 1 — ACTIVE PRODUCTION DATA

| Layer | Source | Role | Status |
|---|---|---|---|
| Western natal chart | FreeAstroAPI | Planetary positions, aspects, signs, houses, angles | ✅ Active |
| BaZi Four Pillars | FreeAstroAPI | Day Master, element balance, Shen Sha Stars, Luck Pillars | ✅ Active |
| Numerology (LP/Expr/Soul Urge/PY) | In-code calculation | Birth date + full name → numerology profile | ✅ Active |
| Client input | User intake form | first_name, birth date, birth time, birth city, full name, bazi_sex | ✅ Active |

### TIER 2 — ACTIVE REFERENCE (docs only, not API)

| Layer | Source | Role | Status |
|---|---|---|---|
| General astrological symbolism | General tradition (original Darrow Code rules) | Sign meanings, planetary functions, element themes | ✅ Active for knowledge base rules |
| General numerological symbolism | General tradition (original Darrow Code rules) | Number meanings, Life Path, Expression, Soul Urge interpretation | ✅ Active for knowledge base rules |
| BaZi interpretation principles | General tradition (original Darrow Code rules) | Day Master profiles, element interactions | ✅ Active for knowledge base rules |

### TIER 3 — REFERENCE ONLY (benchmark; never copy)

| Layer | Source | Role | Restriction |
|---|---|---|---|
| Astro.com / Astrodienst | astro.com | Benchmark for chart accuracy and interpretive depth | Research only. Never scraped. Never copied. |
| Liz Greene / Howard Sasportas works | Published books | Benchmark for psychological depth and reading quality | Research background only. Never copied or paraphrased. |
| Published astrology / numerology books | Various | Conceptual background for knowledge base rules | Extract concepts only; never copy wording. |

### TIER 4 — FUTURE APPROVED LAYERS

| Layer | Source | Role | Gate |
|---|---|---|---|
| Timezone resolution hardening | IANA Time Zone Database (CC0) | Accurate birth-time timezone | Future hardening phase |
| Astronomical verification | NASA/JPL Horizons | Spot-checking planetary accuracy only | Future verification only; not a production source |
| Factual metadata | Wikidata (CC0) | Public factual identifiers where useful | When specifically needed |

### TIER 5 — CONDITIONAL / FUTURE (policy ready, dict pending)

| Layer | Role | Gate before production |
|---|---|---|
| Supportive colors | CORE symbolic anchors (psychological mirrors) | Curated Darrow Code dict in `COLORS_STONES_SYMBOLIC_ALLIES_v1.md` |
| Supportive stones | CORE symbolic anchors (psychological mirrors) | Same file |
| Symbolic / planetary allies | CORE symbolic anchors | Same file |
| Archetype library | Named archetypes for `professional_archetype` section | `ARCHETYPE_LIBRARY_v1.md` populated |

### TIER 6 — DO NOT USE

| Layer | Reason |
|---|---|
| Astro.com / Astrodienst ephemeris PDFs | Do not add to repo |
| Swiss Ephemeris source files | Do not add to repo; accuracy available via FreeAstroAPI |
| Celtic / Druid tree calendar | Not authorized until strong curated Darrow Code rules exist |
| Any copyrighted database extracted wholesale | Not allowed per SOURCE_POLICY |
| Scraping of any astrology website | Not allowed |

---

## 3 · CHANGE LOG

| Date | Change |
|---|---|
| 2026-06-02 | Created at B0 · approved layers established |
