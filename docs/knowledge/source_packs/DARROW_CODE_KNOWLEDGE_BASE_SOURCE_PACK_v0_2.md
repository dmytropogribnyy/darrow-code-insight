# DARROW CODE — Knowledge Base Source Pack v0.2

**Status:** working draft / memory document  
**Version update:** v0.2 adds linked addenda coordination note for astrology / celestial / esoteric name sources.  
**Purpose:** preserve everything found and agreed so far for future KB1 phase.  
**Scope:** source matrix + safe-use policy + seed Darrow Code rule tables for astrology, numerology, BaZi, Chinese calendar, archetypes, colors, stones, and tree/Ogham symbolic mirrors.  
**Runtime status:** not connected to production. Use later as docs-only material in `docs/knowledge/`.

---

## 0. Core principle

We are **not** building Darrow Code by copying astrology reports, websites, books, or protected tables.

We are building an original **Darrow Code symbolic knowledge base** from:

- FreeAstroAPI calculated chart data;
- public factual metadata;
- general symbolic traditions;
- open / public-domain / CC0 / properly licensed materials where appropriate;
- cross-source synthesis;
- our own Darrow Code interpretation rules, language, metaphors, and product framing.

Correct pipeline:

```text
authoritative sources / open data / general traditions
→ source log + license awareness
→ Darrow Code structured rules
→ original human-readable interpretation
→ CORE / add-on report output
```

---

## 1. Source categories and usage policy

| Source category | Examples | Use in Darrow Code | Allowed? |
|---|---|---|---|
| **Calculated provider data** | FreeAstroAPI payload: placements, aspects, BaZi fields, elements | Primary production data source | ✅ Use now |
| **Open factual metadata** | Wikidata labels/IDs, entity metadata | Metadata, multilingual names, identifiers | ✅ Use with source log |
| **Open-source astrology software** | Astrolog GPL | Reference for calculation concepts / feature landscape; not direct dependency unless license reviewed | ✅ Research/reference |
| **Astronomical verification** | NASA/JPL Horizons | Future QA check for provider output, not astrology interpretation source | ✅ Later verification |
| **Timezone data** | IANA tz database | Future birth-time/timezone hardening | ✅ Later hardening |
| **Astrology-community references** | Astro.com/Astrodienst, AstroDatabank, Skyscript, Kepler College, traditional texts | Professional background / benchmark / terminology | ✅ Research only |
| **Classic public-domain astrology** | Ptolemy, Lilly, Valens traditions | Historical/conceptual background | ✅ Concepts only; avoid copying customer-facing text |
| **Russian astrology references** | Russian pages on signs, houses, aspects, planets | Terminology control and conceptual cross-check | ✅ Research/terminology |
| **Astro.com / Swiss Ephemeris PDFs** | Printable ephemeris PDFs | Do not add to repo; private-use / licensing limits | ❌ Not repo asset |
| **Swiss Ephemeris library/files** | swisseph | Future license decision only; AGPL or professional license implications | ❌ Not now |
| **Copyrighted reports/books** | Liz Greene reports, commercial interpretations, paid PDFs | Benchmark only, never content source | ❌ No copying/paraphrasing |

### Important licensing notes

- **Wikidata** is suitable for factual metadata because its data is released under CC0.
- **CC0/public-domain** is preferred for reusable reference data.
- **CC BY** can be used if attribution and license requirements are tracked.
- **Astrodienst Swiss Ephemeris** is dual-licensed; use would require AGPL compliance or a professional license.
- **Astrodienst printable ephemeris PDFs** are not to be added to the repo.
- **AstroDatabank** is useful for understanding the Rodden-rating birth-data culture, but we do not copy the database wholesale.

---

## 2. Approved research/source registry

| Source | Use | Status |
|---|---|---|
| FreeAstroAPI | Production calculated astrology/BaZi data provider | Primary current provider |
| Astro.com / Astrodienst astrology portal | Benchmark for product depth, chart culture, AstroDatabank, Swiss Ephemeris policy | Research only |
| Swiss Ephemeris official page | Licensing/precision reference; not used as local dependency | Do not add |
| AstroDatabank | Birth-data reliability culture / Rodden ratings | Research only; no wholesale copy |
| Skyscript / Deborah Houlding | Traditional astrology, houses, historical framing | Research only |
| Kepler College | Astrology education/curriculum orientation | Research only |
| Ptolemy `Tetrabiblos` | Classical/Hellenistic background | Public-domain/classical concept background |
| William Lilly `Christian Astrology` | Traditional astrology background | Public-domain/classical concept background |
| Astrolog | GPL open-source astrology software | Reference only unless license reviewed |
| Wikidata | CC0 factual metadata / multilingual labels | Approved metadata layer |
| IANA Time Zone Database | Historical timezone/DST hardening | Future technical layer |
| NASA/JPL Horizons | Astronomical verification only | Future QA layer |
| Russian terminology pages | Russian equivalents for signs, houses, aspects, planets | Terminology/reference only |
| Ogham / Celtic tree alphabet references | Tree symbolic mirror caution | Future optional mirror only |

---

## 3. Standard rule format

Every future KB entry should follow this structure:

```ts
type DarrowKnowledgeRule = {
  id: string;
  layer:
    | "zodiac"
    | "planet"
    | "house"
    | "aspect"
    | "element"
    | "numerology"
    | "bazi"
    | "chinese_calendar"
    | "archetype"
    | "color"
    | "stone"
    | "tree";

  trigger: {
    data_key: string;
    value: string;
    strength?: "primary" | "secondary" | "supporting";
    conditions?: string[];
  };

  darrow_meaning: string;
  strength_expression: string;
  shadow_expression: string;
  practical_direction: string;

  report_use: {
    core: "allowed" | "conditional" | "blocked";
    addons: string[];
    proof_tag_allowed: boolean;
  };

  safety: {
    forbidden_claims: string[];
    required_language?: string[];
  };

  sample_phrase: string;
};
```

---

# 4. Seed rule tables

## 4.1 Zodiac signs — `ASTRO_ZODIAC_RULES_v1`

| Sign | Element / mode | Darrow Code meaning | Strength | Risk | CORE use |
|---|---|---|---|---|---|
| Aries | Fire / Cardinal | ignition before certainty | courage, activation, start energy | impatience, reactive exits | action/start pattern |
| Taurus | Earth / Fixed | stabilization through body, value, rhythm | endurance, consistency, sensual grounding | over-attachment, slow release | money/body/rhythm |
| Gemini | Air / Mutable | pattern through language, movement, comparison | adaptability, quick perception | fragmentation, nervous over-processing | social/cognitive |
| Cancer | Water / Cardinal | emotional memory as intelligence | protection, depth, care | over-absorption, defensiveness | core/battery/home |
| Leo | Fire / Fixed | visible authorship of identity | warmth, leadership, creative presence | pride wound, performance pressure | visibility/creative |
| Virgo | Earth / Mutable | refinement as service and self-respect | precision, repair, usefulness | self-criticism, over-control | work/body/protocol |
| Libra | Air / Cardinal | relational calibration | diplomacy, aesthetics, balance | pleasing, indecision | love/social/style |
| Scorpio | Water / Fixed | hidden pressure and truth-reading | depth, loyalty, transformation | suspicion, control, guarding | intimacy/shadow |
| Sagittarius | Fire / Mutable | meaning through horizon | vision, teaching, expansion | excess, abstraction, escape | year/meaning |
| Capricorn | Earth / Cardinal | structure and earned authority | mastery, endurance, responsibility | heaviness, over-duty | career/base |
| Aquarius | Air / Fixed | pattern recognition beyond convention | originality, systems thinking | detachment, alienation | cognitive/social |
| Pisces | Water / Mutable | permeability to symbol, mood, compassion | imagination, empathy | diffusion, boundary loss | creative/vitality |

**Usage rule:**  
Sun = identity tone. Moon = emotional rhythm. Ascendant = social interface only if birth time reliable. Stellium/dominant sign = amplification. Never open customer prose with “You are Aries…”; translate into lived pattern first.

---

## 4.2 Planets — `ASTRO_PLANET_RULES_v1`

| Planet | Darrow function | Strength expression | Shadow expression |
|---|---|---|---|
| Sun | authorship / vitality | visible center, self-direction | ego pressure, identity rigidity |
| Moon | emotional body / safety | memory, care, restoration | mood dependence, overprotection |
| Mercury | perception / language | analysis, communication, translation | overthinking, nervous scattering |
| Venus | value / beauty / choice | attraction, harmony, taste | pleasing, indulgence, avoidance |
| Mars | action / desire / defense | courage, libido, initiative | aggression, impatience, force |
| Jupiter | meaning / expansion | trust, teaching, growth | excess, inflation, overreach |
| Saturn | structure / limits / mastery | discipline, authority, endurance | fear, heaviness, contraction |
| Uranus | freedom / disruption | originality, breakthrough | instability, alienation |
| Neptune | imagination / dissolution | empathy, symbol, vision | confusion, escape, porousness |
| Pluto | depth / power / transformation | intensity, truth, rebirth | control, obsession, compulsion |
| Chiron | wound / medicine | hard-won guidance | wound-identification |

**Usage rule:**  
A planet is a symbolic function, not a deterministic cause. Example: “Mars square Saturn” → “drive meets the brake,” not “you will fail.”

---

## 4.3 Houses — `ASTRO_HOUSE_RULES_v1`

**Use only if birth time is reliable.**

| House | Area | Darrow use |
|---:|---|---|
| 1 | identity interface, body, first impression | CORE / social interface |
| 2 | value, money, possessions, self-worth | MONEY / value baseline |
| 3 | speech, learning, siblings, local field | cognitive style |
| 4 | home, roots, emotional base | environment / battery |
| 5 | creativity, romance, play | LOVE / creative expression |
| 6 | routine, work rhythm, health habits | BODY / vitality |
| 7 | partnership, contracts, mirror | LOVE |
| 8 | intimacy, shared resources, shadow | LOVE / MONEY / shadow |
| 9 | meaning, travel, belief, study | YEAR / direction |
| 10 | vocation, status, public role | professional archetype |
| 11 | groups, networks, future | social interface |
| 12 | unconscious, retreat, hidden pressure | shadow / vitality |

**Safety rule:**  
If `birth_time_known=false`, do not use houses, Ascendant, MC, IC, Descendant, or house rulers.

---

## 4.4 Aspects — `ASTRO_ASPECT_RULES_v1`

| Aspect | Angle | Darrow meaning | Report phrasing |
|---|---:|---|---|
| Conjunction | 0° | fusion / concentration | two functions operate as one force |
| Opposition | 180° | polarity / mirror | life asks you to hold both ends |
| Square | 90° | productive friction | pressure creates skill through repeated contact |
| Trine | 120° | native flow | a gift that may be underused because it feels natural |
| Sextile | 60° | opportunity / cooperation | talent activates through participation |
| Quincunx | 150° | mismatch / adjustment | two functions require translation, not force |

**Usage rule:**  
Aspect = relationship between symbolic functions. Interpret as a behavioral tension/flow, not fate.

---

## 4.5 Elements — `ELEMENT_RULES_v1`

### Western four elements

| Element | Darrow meaning | Strength | Risk |
|---|---|---|---|
| Fire | ignition, will, visibility | courage, inspiration | burnout, impatience |
| Earth | form, body, resources | stability, craft | rigidity, heaviness |
| Air | thought, language, distance | clarity, connection | dissociation, overthinking |
| Water | feeling, memory, resonance | empathy, depth | absorption, boundary blur |

### Chinese five phases / Wu Xing

| Phase | Darrow meaning | Use |
|---|---|---|
| Wood | growth, direction, expansion | planning, upward movement |
| Fire | warmth, expression, visibility | charisma, emotional heat |
| Earth | containment, digestion, stability | grounding, responsibility |
| Metal | boundary, refinement, standard | precision, structure |
| Water | depth, adaptation, strategy | perception, memory |

**Usage rule:**  
Western elements and BaZi Wu Xing should not be mechanically merged. If both point to the same motif, call it cross-system convergence.

---

## 4.6 Numerology — `NUMEROLOGY_RULES_v1`

| Number | Darrow meaning | Strength | Risk |
|---:|---|---|---|
| 1 | self-initiation | leadership, originality | isolation, force |
| 2 | relational intelligence | sensitivity, mediation | dependency, hesitation |
| 3 | expression | creativity, speech | scattering, performance |
| 4 | structure | discipline, reliability | rigidity, heaviness |
| 5 | movement | freedom, adaptability | instability, excess |
| 6 | care / responsibility | harmony, protection | overgiving, control |
| 7 | inner knowledge | analysis, depth, spiritual intelligence | withdrawal, skepticism |
| 8 | power / material mastery | executive force, ambition | domination, pressure |
| 9 | completion / compassion | wisdom, service | martyrdom, diffusion |
| 11 | heightened signal | inspiration, sensitivity | nervous overload |
| 22 | master builder | large-scale structure | burden, perfectionism |
| 33 | service-heart archetype | guidance, compassion | savior complex |

### Numerology fields

| Field | Input | Meaning | CORE use |
|---|---|---|---|
| Life Path | birth date | life operating lesson | allowed |
| Birth Day Number | day of month | instinctive expression | allowed |
| Personal Year | birth month/day + current year | current-cycle climate | allowed |
| Expression | full name | talent architecture | conditional |
| Soul Urge | vowels/full name | inner motive | conditional |
| Personality | consonants/full name | social surface | conditional |

**Safety rule:**  
No deterministic numerology claims. Use as symbolic code, not fate.

---

## 4.7 BaZi Day Masters — `BAZI_DAY_MASTER_RULES_v1`

| Day Master | Phase / polarity | Darrow meaning |
|---|---|---|
| Jia 甲 | Yang Wood | upright growth, principled expansion |
| Yi 乙 | Yin Wood | adaptive growth, relational intelligence |
| Bing 丙 | Yang Fire | solar presence, visible warmth |
| Ding 丁 | Yin Fire | focused flame, subtle influence |
| Wu 戊 | Yang Earth | mountain stability, containment |
| Ji 己 | Yin Earth | cultivated soil, nourishment |
| Geng 庚 | Yang Metal | raw metal, decisive force |
| Xin 辛 | Yin Metal | refined metal, precision/elegance |
| Ren 壬 | Yang Water | ocean water, scale, strategy |
| Gui 癸 | Yin Water | rain/mist water, subtle perception |

**Usage rule:**  
BaZi should never sound like a technical dump. Translate Day Master into readable operating climate. Example: “Gui Water” → “you notice the subtle shift before others can name it.”

---

## 4.8 Chinese calendar / zodiac — `CHINESE_CALENDAR_RULES_v1`

| Animal / Branch | Darrow mirror |
|---|---|
| Rat 子 | strategy, alertness, resourcefulness |
| Ox 丑 | endurance, discipline, slow power |
| Tiger 寅 | courage, risk, independent force |
| Rabbit 卯 | sensitivity, diplomacy, quiet intelligence |
| Dragon 辰 | scale, charisma, mythic ambition |
| Snake 巳 | perception, timing, hidden knowledge |
| Horse 午 | movement, vitality, independence |
| Goat 未 | care, softness, aesthetic sensitivity |
| Monkey 申 | agility, invention, problem-solving |
| Rooster 酉 | standards, precision, presentation |
| Dog 戌 | loyalty, protection, ethics |
| Pig 亥 | generosity, embodiment, completion |

**Usage rule:**  
Use as a soft birth-year layer or BaZi support. Do not reduce the person to “year animal.”

---

## 4.9 Archetype library — `ARCHETYPE_LIBRARY_v1`

| Archetype | Trigger convergence | Darrow meaning |
|---|---|---|
| Gray Cardinal | Water/depth + leadership/structure | quiet authority, emotional intelligence, controlled force |
| Quiet Strategist | Water/Mercury/Saturn | reads pressure before acting |
| Signal Keeper | Moon/Water/12H/Neptune | protects subtle truth |
| Builder of Order | Earth/Saturn/Capricorn | makes life usable through structure |
| Warm Commander | Fire/Sun/Mars/Jupiter | activates others through confidence |
| Refined Analyst | Virgo/Mercury/Metal | turns chaos into usable clarity |
| Bridge Maker | Libra/Venus/Air | translates between people/worlds |
| Depth Alchemist | Scorpio/Pluto/8H/Water | transforms pressure into insight |
| Vision Carrier | Sagittarius/Jupiter/9H | moves through meaning and horizon |
| Pattern Outsider | Aquarius/Uranus/Air | sees systems from outside the system |
| Creative Vessel | Pisces/Neptune/Water | channels symbol, mood, imagination |
| Root Guardian | Cancer/Moon/4H/Earth-Water | protects emotional base |

**Usage rule:**  
Archetype is assigned only after convergence across multiple layers. Never from one sign alone.

---

## 4.10 Colors — `COLORS_SYMBOLIC_RULES_v1`

**Status:** gated until curated dictionary approved. Store in KB, but do not let production generate these until prompt unlock.

| Color | Darrow symbolic use | Pair with | Forbidden claims |
|---|---|---|---|
| Deep blue | emotional coherence, quiet authority | Water / Moon / Saturn | healing anxiety |
| Gold | solar confidence, authorship, visible value | Sun / Leo / Jupiter | brings wealth |
| Forest green | renewal, organic growth | Earth / Wood / Venus | guarantees luck |
| Charcoal | containment, seriousness, boundary | Saturn / Capricorn / Metal | protection claim |
| Ivory / white | clarity, reset, simplicity | Moon / Metal / Air | purification claim |
| Burgundy | mature passion, depth | Venus / Pluto / Scorpio | attracts love |
| Terracotta | grounded action, body warmth | Mars / Earth / Fire | fixes energy |
| Violet | symbolic imagination | Neptune / Pisces / 11 | psychic powers |
| Silver | lunar reflection, subtle perception | Moon / Water | activates intuition |
| Copper | warmth, value, embodied beauty | Venus / Fire / Earth | magnetizes money |

**Usage rule:**  
Use colors as psychological-symbolic anchors only. Example: “deep blue as a symbolic anchor for emotional coherence,” never “your lucky color.”

---

## 4.11 Stones — `STONE_SYMBOLIC_RULES_v1`

**Status:** gated until curated dictionary approved.

| Stone | Darrow symbolic use | Pair with | Forbidden claims |
|---|---|---|---|
| Obsidian | boundary, shadow honesty | Pluto / Scorpio / Saturn | protection |
| Amethyst | quiet mind, symbolic sensitivity | Pisces / Neptune / 7 | healing |
| Citrine | visible value, confidence | Sun / Jupiter / 8 | wealth guarantee |
| Rose quartz | relational softness | Venus / Moon / 2 / 6 | attracts love |
| Hematite | grounding, containment | Earth / Saturn / Metal | medical/energy claim |
| Lapis lazuli | truth, voice, depth | Mercury / Sagittarius / Air | mystical certainty |
| Carnelian | action, courage, creative heat | Mars / Fire / 1 / 5 | libido/health claim |
| Jade | steadiness, growth, balance | Wood / Earth / Venus | luck claim |
| Moonstone | rhythm, receptivity | Moon / Cancer / Water | fertility/medical |
| Clear quartz | clarity/focus as metaphor | Mercury / Air / Sun | energetic guarantee |

**Usage rule:**  
Use as symbolic mirrors only. No healing, luck, protection, attraction, medical, or energetic guarantee claims.

---

## 4.12 Trees / Ogham / Druid mirrors — `TREE_SYMBOLIC_MIRRORS_v1`

**Status:** future optional symbolic mirror. Do not frame as historically certain ancient Celtic astrology.

| Tree | Darrow mirror |
|---|---|
| Birch | renewal, clean beginning |
| Rowan | protective awareness, perceptive courage |
| Ash | integration between levels |
| Alder | threshold courage |
| Willow | memory, lunar responsiveness |
| Hawthorn | boundary between softness and defense |
| Oak | endurance, dignity, rooted power |
| Holly | resilience, winter strength |
| Hazel | wisdom, learning, poetic intelligence |
| Vine | connection, sweetness, social weave |
| Ivy | persistence, attachment, survival |
| Reed | voice, message, hidden music |
| Elder | completion, ancestral reflection |

**Usage rule:**  
Phrase as “modern symbolic mirror,” not as scientific, historical, or deterministic fact.

---

## 4.13 Traditional dignity — `ASTRO_DIGNITY_RULES_v1`

| Concept | Darrow usage |
|---|---|
| Domicile / rulership | function has native language |
| Exaltation | function is emphasized/refined |
| Detriment | function works through translation |
| Fall | function requires humility/repatterning |
| Peregrine | function lacks obvious anchor; context matters |

**Usage rule:**  
Use mostly as proof layer. Avoid dense doctrine in customer prose.

---

## 4.14 Modalities — `ASTRO_MODALITY_RULES_v1`

| Mode | Signs | Darrow meaning |
|---|---|---|
| Cardinal | Aries, Cancer, Libra, Capricorn | initiates motion |
| Fixed | Taurus, Leo, Scorpio, Aquarius | stabilizes and intensifies |
| Mutable | Gemini, Virgo, Sagittarius, Pisces | adapts, translates, changes state |

---

## 4.15 Polarity — `ASTRO_POLARITY_RULES_v1`

| Polarity | Signs | Darrow meaning |
|---|---|---|
| Yang / active | Fire + Air | outward movement, expression, projection |
| Yin / receptive | Earth + Water | inward processing, containment, absorption |

---

## 4.16 Aspect tension — `ASPECT_TENSION_RULES_v1`

| Type | Aspects | Darrow meaning |
|---|---|---|
| Harmonizing | trine, sextile | easier flow / talent |
| Tension-building | square, opposition | growth through friction |
| Fusion | conjunction | concentration / intensity |
| Adjustment | quincunx | translation / mismatch |

---

# 5. How the KB should be used in reports

## CORE v4.1 — allowed now

CORE can use:

- zodiac sign meanings;
- Sun/Moon/planetary emphasis;
- Ascendant only if reliable birth time;
- houses only if reliable birth time;
- aspects;
- western elements;
- Life Path / Personal Year;
- full name numerology only if full name is available;
- BaZi only if provider payload exists;
- Chinese birth-year layer softly;
- archetype assignment from convergence;
- strengths / risks / direction;
- environmental resonance.

## CORE v4.1 — blocked until curated dictionary unlock

Do not produce these in production output yet:

- exact supportive colors;
- exact stones;
- symbolic allies;
- tree/Ogham/Druid assignment;
- full aesthetic style palette;
- detailed crystal/color/tree guidance.

## Add-ons later

| Add-on | KB layers |
|---|---|
| LOVE | Venus, Mars, Moon, 5H/7H/8H, relationship archetype, attachment wording |
| MONEY | 2H/8H/10H, Saturn/Jupiter/Venus/Pluto, Life Path, BaZi resource/output logic |
| BODY | Moon, Mars, Saturn, 6H, element balance, BaZi stress/recovery layer |
| YEAR | Personal Year, transits, solar return if available, Chinese calendar cycle |
| STYLE | Venus, Ascendant, Moon, colors, stones, materials, aesthetic archetype |
| PLACE | environmental resonance now; astrocartography later only with approved provider |

---

# 6. Recommended future repo file structure

```text
docs/knowledge/
  SOURCE_POLICY.md
  SOURCE_LOG.md
  KNOWLEDGE_SOURCE_MATRIX_v1.md

  ASTRO_ZODIAC_RULES_v1.md
  ASTRO_PLANET_RULES_v1.md
  ASTRO_HOUSE_RULES_v1.md
  ASTRO_ASPECT_RULES_v1.md
  ELEMENT_RULES_v1.md
  ASTRO_DIGNITY_RULES_v1.md
  ASTRO_MODALITY_RULES_v1.md
  ASTRO_POLARITY_RULES_v1.md
  ASPECT_TENSION_RULES_v1.md

  NUMEROLOGY_RULES_v1.md
  BAZI_DAY_MASTER_RULES_v1.md
  CHINESE_CALENDAR_RULES_v1.md

  ARCHETYPE_LIBRARY_v1.md
  COLORS_SYMBOLIC_RULES_v1.md
  STONE_SYMBOLIC_RULES_v1.md
  TREE_SYMBOLIC_MIRRORS_v1.md
```

---

# 7. Future phase proposal

## KB1 — Darrow Code Knowledge Base v1

Docs-only phase after v4 diagnostic route/template stabilizes.

Allowed:
- create / update `docs/knowledge/*_v1.md`;
- add source matrix;
- add source log;
- add seed rule tables.

Not allowed:
- runtime code;
- schema changes;
- prompt activation;
- copying external text;
- adding Astro.com/SWISS PDFs;
- generation/API calls.

## KB2 — Runtime mapping later

After visual approval of CORE v4.1 diagnostic:

```text
FreeAstroAPI / user input
→ DarrowChartData
→ symbolic extraction
→ KB rule matching
→ identity card payload
→ CORE v4.1 PDF
```

---

# 8. Source notes to keep

## High-value source notes

- Astrodienst/Swiss Ephemeris: high precision, based on JPL DE ephemerides, but dual licensing requires AGPL or professional license; do not add now.
- Astrodienst printable ephemerides: private-use/permission constraints; do not add PDFs to repo.
- AstroDatabank: useful for birth data reliability culture and Rodden ratings; no wholesale copy.
- Astrolog: GPL open-source astrology software; useful as feature reference, not necessarily dependency.
- Wikidata: CC0 factual metadata layer.
- IANA tz database: future timezone/DST hardening.
- NASA/JPL Horizons: future astronomical verification only.
- Russian pages on aspects/houses/signs: useful for terminology and conceptual cross-check.
- Ogham/tree layer: future poetic symbolic mirror only, not historical certainty.

---

# 9. Quick prompt for future Claude KB1 phase

```md
MODEL / MODE:
Use Claude Sonnet.

TASK:
Run KB1 only — docs-only Darrow Code Knowledge Base v1.

Allowed:
- docs/knowledge/*.md only

Do NOT:
- edit src/
- edit schema
- edit prompts
- edit routes
- run generation
- call APIs
- add external PDFs/files/databases
- copy copyrighted text
- copy protected tables/databases wholesale

Goal:
Create structured Darrow Code rule files from the approved Knowledge Base Source Pack v0.1.

Use:
- SOURCE_POLICY.md
- SOURCE_LOG.md
- KNOWLEDGE_SOURCE_MATRIX_v1.md
- this Source Pack v0.1

Create/update:
- ASTRO_ZODIAC_RULES_v1.md
- ASTRO_PLANET_RULES_v1.md
- ASTRO_HOUSE_RULES_v1.md
- ASTRO_ASPECT_RULES_v1.md
- ELEMENT_RULES_v1.md
- ASTRO_DIGNITY_RULES_v1.md
- NUMEROLOGY_RULES_v1.md
- BAZI_DAY_MASTER_RULES_v1.md
- CHINESE_CALENDAR_RULES_v1.md
- ARCHETYPE_LIBRARY_v1.md
- COLORS_SYMBOLIC_RULES_v1.md
- STONE_SYMBOLIC_RULES_v1.md
- TREE_SYMBOLIC_MIRRORS_v1.md

Rules:
- extract concepts, not wording
- write original Darrow Code interpretations
- mark colors/stones/trees as gated unless curated dictionary is approved
- include forbidden claims for every symbolic layer
- update SOURCE_LOG.md for specific external references
- stop after commit and push
```


---

# Appendix B — Linked addenda update notes v0.2

Status: source-pack coordination note  
Added: 2026-06-02  
Runtime status: not active. Docs/source-log material only.

This source pack is now accompanied by these working addenda:

```text
DARROW_NUMEROLOGY_SOURCE_ADDENDUM_v0_1.md
DARROW_ASTROLOGY_NAMES_SOURCE_ADDENDUM_v0_2.md
```

The astrology + names addendum v0.2 adds an Appendix A covering astrology-inspired, celestial, Russian-language, and esoteric name sources, including:

```text
https://www.nameinfo.ru/catalog/
https://solnet.ee/names/n_01
https://astrolingua.ru/LINGRAF/imena1.htm
https://www.motherandbaby.com/baby-names/best/astrology-names/
https://www.thebump.com/b/astrology-baby-names
https://www.babycentre.co.uk/a25005337/baby-names-inspired-by-the-solar-system
https://www.kabalarians.com/name-meanings/male/astrology.htm
```

## B1. Integration rule

These sources should be treated as:

- name-source matrix inputs;
- source-log entries;
- symbolic-category inspiration;
- market-awareness / forbidden-claim examples.

They should not be treated as:

- primary etymology authorities;
- runtime data sources;
- copyable name databases;
- deterministic name-destiny systems.

## B2. Future docs generated from the addendum

During KB1, the new appendix can inform:

```text
docs/knowledge/NAME_SOURCE_MATRIX_v1.md
docs/knowledge/NAME_ETYMOLOGY_RULES_v1.md
docs/knowledge/NAME_SYMBOLIC_ARCHETYPES_v1.md
docs/knowledge/CELESTIAL_NAME_SYMBOLISM_v1.md
docs/knowledge/SOURCE_LOG.md
```

## B3. Gating reminder

Keep these layers gated unless explicitly approved later:

- automated name etymology;
- bulk extraction from name catalogues;
- celestial-name assignment;
- zodiac-name assignment;
- name compatibility;
- name-change suggestions;
- deterministic claims about personality, health, wealth, love, luck, success, fertility, or destiny.

Allowed framing remains:

```text
The name layer can act as a soft symbolic mirror only when verified and when it converges with chart / numerology patterns.
```
