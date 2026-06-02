# DARROW CODE — Astrological Houses / House Systems Source Addendum v0.1

**Status:** research appendix / source-pack draft  
**Purpose:** capture source-review notes and safe-use policy for Western astrological houses, house systems, angular/succedent/cadent classification, Whole Sign vs Placidus variance, and birth-time reliability rules.  
**Runtime status:** not active. This is future **KB1 docs-only** material, not prompt/runtime/schema/template logic.

---

## 0. Core rule

Astrological houses are useful only when the birth time and birthplace are reliable enough to calculate the chart angles and house cusps.

Allowed:
- houses as life-area / context fields;
- Ascendant / MC / IC / Descendant only with reliable birth time;
- house-system awareness: Whole Sign, Placidus, Equal, Koch, Campanus, Regiomontanus, etc.;
- original Darrow Code interpretations of house topics;
- house emphasis as a support layer when provider data includes it.

Not allowed:
- using houses when birth time is unknown or unreliable;
- pretending house placements are stable without exact time/location;
- treating one house system as universally “the correct one” without product decision;
- copying house descriptions from lifestyle websites;
- deterministic life-event predictions;
- medical / legal / financial certainty from house placements;
- compatibility claims from 7th/8th house alone;
- using house rulership as a dense technical dump in customer prose.

Darrow Code wording rule:

```text
House = life area / stage of experience.
Planet = function.
Sign = operating style / symbolic tone.
Aspect = relationship between functions.
No house alone determines an outcome.
```

---

## 1. Reviewed source matrix

| Source | Type | Useful extraction | Darrow Code use | Risk / restriction |
|---|---|---|---|---|
| Wikipedia — House (astrology) | Broad/editable overview | Houses depend on time/location; many house systems; 12 life areas; historical/modality tables; references to Deborah Houlding, Lilly, Arroyo, etc. | Background only; source-log and terminology check | Editable; the page currently has a warning about possible AI-generated material, so cross-check needed |
| AstroStyle — 12 houses | Popular/lifestyle astrology guide | Very clear user-facing structure: houses as 12 segments/life areas; planets as actors, signs as roles, houses as stages; personal vs interpersonal houses | Tone/market awareness only | Predictive/action language and lifestyle wording; do not copy |
| Astro.com / Astrodienst houses article | Professional astrology ecosystem | Benchmark source for house interpretation/product depth if accessible | Research benchmark only | Page was not fully accessible during review; do not rely until manually checked |
| Astro-Seek house systems calculator | Calculator/tool | Useful as market/tool reference for comparing house systems and chart outputs | Source-log / feature-reference | Page fetch failed during review; verify manually later |
| CHANI — 12 houses | Modern astrology education | Strong accessible framing: houses anchor sky to time/place perspective; houses as domains/stages; empty houses are normal; full house/stellium concept | Tone/reference inspiration only | Do not copy prose; 6th/12th traditional-heavy language needs careful safety wording |
| Old Farmer’s Almanac — 12 houses | Popular reference | Likely simple house topic list for mainstream readers | Pending manual review | Page fetch failed during review |
| Cafe Astrology — Whole Sign Houses chart | Calculator/tool/reference | Clearly distinguishes Whole Sign from Placidus default; notes Whole Sign houses start at 0° of the Ascendant sign; user must enter exact birth time | Good source-log for house-system variance | Do not copy report text; calculator is not source of product authority |
| Co–Star houses page | App/product/lifestyle explanation | Market/product reference for app-style house education | Pending manual review | Page returned no accessible text during review |
| Skyscript / Deborah Houlding — Houses background | Traditional astrology source | High-value traditional house doctrine and historical grounding; house meanings beyond modern “12-letter alphabet” | Strong future research source | Do not copy text; use concepts only |
| Deborah Houlding, *The Houses: Temples of the Sky* | Book/reference | Traditional house meanings and historical architecture | Future background/reference | Copyrighted; do not reproduce text |
| William Lilly, *Christian Astrology* | Public-domain traditional source | Classical house significations; angular strength; traditional phrasing | Conceptual background only | Do not use archaic fatalistic style in customer prose |
| Astro-Seek / Astro.com calculators | Calculation benchmark | Compare provider output, house systems, high-latitude behavior | Future QA only | Do not scrape or rely on protected outputs |

---

## 2. Key source observations

### 2.1 Houses depend on time and location

Western houses are not derived from birth date alone. They depend on the time and location of the chart. This means houses are unreliable when the user provides only a date or an approximate time.

Darrow hard rule:

```text
If birth_time_known = false, do not use:
- houses
- Ascendant
- Midheaven / MC
- IC
- Descendant
- house rulers
- planets-in-houses
- stellium-in-house claims
```

### 2.2 Houses are life areas, not personality labels

Houses describe where planetary functions show up: body/interface, money/value, learning, home, creativity, work/routine, partnership, intimacy/shared resources, meaning/travel, vocation, networks, hidden life/rest.

Darrow rule:

```text
Do not say “you are a 10th-house person” as a label.
Say “this chart places more emphasis on public role / vocation” if house data is reliable.
```

### 2.3 House systems vary

Different house systems can place planets in different houses, especially near cusps or at higher latitudes. Whole Sign, Placidus, Equal, Koch, Campanus, Regiomontanus, Porphyry and others use different mathematical assumptions.

Darrow policy:

```text
Store the house system used by provider.
Do not switch house system silently.
Do not compare houses across systems without marking the method.
```

Recommended future internal field:

```json
{
  "house_data": {
    "house_system": "unknown | placidus | whole_sign | equal | koch | campanus | regiomontanus | provider_default",
    "birth_time_confidence": "exact | approximate | unknown",
    "birthplace_confidence": "exact | approximate | unknown",
    "usable_for_core": true,
    "notes": []
  }
}
```

### 2.4 Whole Sign vs Placidus must be explicit

Whole Sign assigns the whole sign containing the Ascendant to the 1st house; Placidus is a time-based quadrant system often used as a default in many modern calculators.

Darrow policy:

```text
If FreeAstroAPI/provider returns Placidus, use Placidus and label internally.
If provider returns Whole Sign, use Whole Sign and label internally.
If no system is specified, mark house_system = provider_default and do not make high-stakes claims.
```

---

## 3. Source-quality classification

| Source class | Examples | Use |
|---|---|---|
| Traditional / historical astrology | Skyscript, Deborah Houlding, William Lilly | Conceptual grounding; no copied prose |
| Calculator / provider benchmark | Astro-Seek, Cafe Astrology, Astro.com | House-system comparison and UX expectations |
| Popular education | AstroStyle, CHANI, Almanac, Co–Star | Human-readable tone / market expectations |
| Encyclopedic overview | Wikipedia | Background and source-listing only |
| Runtime provider | FreeAstroAPI later | Actual calculated chart data source |
| Scientific/astronomy caution | astronomy references if needed | Prevent overclaiming; not interpretive source |

---

## 4. Darrow house rule model

Every house should eventually be encoded in Darrow terms as:

```ts
type DarrowHouseRule = {
  house_number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  traditional_name?: string;
  darrow_area: string;
  life_domain: string[];
  strength_expression: string;
  shadow_expression: string;
  practical_direction: string;
  addons: string[];
  safety: {
    requires_birth_time: true;
    forbidden_claims: string[];
    required_language?: string[];
  };
};
```

---

## 5. Darrow house symbolic seeds v0.1

These are original Darrow Code interpretations, not copied source text.

| House | Darrow area | Strength expression | Shadow expression | Practical direction | Best report use |
|---:|---|---|---|---|---|
| 1 | identity interface, body, first impression | presence, directness, embodied self-definition | self-focus, reactivity, image pressure | inhabit the body before explaining yourself | CORE / social_interface |
| 2 | value, resources, self-worth, material base | steady value-building, taste, resource sense | attachment, scarcity fear, self-worth tied to possession | build value without becoming owned by it | MONEY / value baseline |
| 3 | speech, learning, local field, siblings/peers | communication, skill acquisition, translation | noise, nervous comparison, scattered attention | make language useful and specific | CORE / cognitive_style |
| 4 | home, roots, emotional base, private foundation | emotional memory, protection, inner anchoring | family entanglement, withdrawal, nostalgia trap | create a base that supports growth | CORE / battery / environment |
| 5 | creativity, play, romance, authorship of joy | creative radiance, pleasure, self-expression | performance, drama, validation hunger | create because life wants expression, not applause | LOVE / STYLE / creativity |
| 6 | routine, work rhythm, service, body maintenance | discipline, repair, useful systems | overwork, self-criticism, body anxiety | refine routines without turning life into a checklist | BODY / professional rhythm |
| 7 | partnership, contracts, mirror, equal other | cooperation, relational intelligence, negotiation | projection, people-pleasing, dependency on reflection | meet others without disappearing into them | LOVE / contracts |
| 8 | intimacy, shared resources, hidden pressure, transformation | depth, trust, psychological courage | control, suspicion, crisis attachment | let truth transform without domination | LOVE / MONEY / shadow |
| 9 | meaning, travel, study, belief, horizon | teaching, vision, expansion, perspective | dogma, escape, overpromising | aim the belief before expanding it | YEAR / direction |
| 10 | vocation, public role, responsibility, visible authority | mastery, ambition, public contribution | over-duty, status pressure, emotional austerity | build a role that can hold your real life | CAREER / professional_archetype |
| 11 | networks, allies, future, collective field | community, systems thinking, long-range vision | detachment, social abstraction, group dependency | choose circles that strengthen the future self | social_interface / future |
| 12 | retreat, hidden life, endings, unconscious pressure | deep rest, spiritual privacy, symbolic sensitivity | self-undoing, isolation, avoidance, hidden leakage | make the invisible conscious before it runs the system | shadow / vitality |

---

## 6. Angular / succedent / cadent emphasis

| House type | Houses | Darrow meaning | Use |
|---|---|---|---|
| Angular | 1, 4, 7, 10 | action points / life pillars | strong visibility and event-field emphasis |
| Succedent | 2, 5, 8, 11 | stabilization / resources / continuity | consolidation and holding pattern |
| Cadent | 3, 6, 9, 12 | adaptation / learning / transition | movement, processing, adjustment |

Darrow-safe use:

```text
Angular emphasis: life asks the pattern to become visible and embodied.
Succedent emphasis: the person stabilizes, holds, builds, or manages value.
Cadent emphasis: the pattern processes, learns, translates, adapts, or withdraws.
```

Blocked:
- predicting fame, illness, marriage, death, imprisonment, or career outcome from house type alone.

---

## 7. Personal / interpersonal / transpersonal grouping

A useful modern teaching grouping:

| Group | Houses | Darrow use |
|---|---|---|
| Personal / private | 1–6 | self, body, resources, local environment, creativity, routine |
| Relational / public / collective | 7–12 | partnership, shared resources, worldview, vocation, networks, hidden life |

This can help report flow, but should not become a deterministic hierarchy.

---

## 8. Empty houses and stelliums

### Empty houses

Safe rule:

```text
An empty house does not mean that area of life is absent.
It means no major selected body is placed there in the chosen chart set.
```

### Stellium / house concentration

Potential rule:

```text
If 3+ selected bodies occupy one house, that house can be flagged as an emphasized life area.
```

Safety:
- Decide which bodies count before runtime.
- Do not use house stellium if birth time is approximate/unknown.
- Avoid high-stakes predictions.

---

## 9. House rulers

House rulers are useful but technical. They should be used mostly as an internal proof layer.

Safe approach:

```text
House ruler = the planet ruling the sign on a house cusp.
It links one life area to another, but it should not be dumped into customer prose unless it creates a clear readable pattern.
```

Blocked:
- “Your 7th-house ruler guarantees marriage/divorce.”
- “Your 10th-house ruler proves career success/failure.”
- “Your 6th-house ruler shows illness.”

---

## 10. Birth-time reliability policy

Recommended future field:

```ts
type BirthTimeReliability =
  | "exact"        // known exact time, ideally documented
  | "approximate"  // user estimate / rounded time
  | "unknown";     // no time or intentionally unknown
```

Usage:

| Reliability | House usage |
|---|---|
| exact | Houses, Ascendant, MC/IC/Descendant allowed |
| approximate | Use with warning; avoid cusp-sensitive claims; prefer broad angular/hemisphere themes only |
| unknown | Do not use houses or angles |

Darrow rule:

```text
If birth time is missing, the report can still use signs, planets, aspects that do not require houses, numerology, and non-time-sensitive layers.
```

---

## 11. What to extract vs block from provided sources

### Extract safely

- house topics / life-area taxonomy;
- house-system variance;
- exact birth time requirement;
- empty houses are normal;
- planets/signs/houses as function/style/area framing;
- angular/succedent/cadent grouping;
- Whole Sign vs Placidus distinction;
- market-friendly house language.

### Block

Do not use:
- fatalistic traditional phrasing about death, imprisonment, enemies, disease;
- health diagnosis from 6th/12th house;
- marriage/divorce claims from 7th house;
- inheritance/death claims from 8th house;
- career success/failure claims from 10th house;
- “empty house means nothing happens there” claims;
- house-based compatibility;
- exact event prediction from house placements.

---

## 12. Darrow report integration

### CORE v4.1 — allowed later

Allowed only when birth time is reliable:
- Ascendant as social interface;
- house emphasis as life-area emphasis;
- planets-in-houses as contextual layer;
- 10th house / MC for professional archetype;
- 4th/6th/12th for battery/vitality/environment;
- 2nd/8th for money/value/shared resources;
- 5th/7th/8th for relationship/creative layers.

Example:

```text
With reliable birth time, this chart places extra weight on the 10th-house field: the place where private competence becomes visible responsibility. That does not guarantee status; it shows where the pattern asks to be built in public.
```

### CORE v4.1 — avoid

Avoid:

```text
Your 6th house means health problems.
Your 7th house proves your marriage pattern.
Your 8th house means death/inheritance.
Your 10th house guarantees success.
Your 12th house means hidden enemies.
```

---

## 13. Future provider / FreeAstroAPI mapping questions

Later data-mapping phase should answer:

```text
- Does FreeAstroAPI return houses?
- Which house system does it use by default?
- Can house system be requested?
- Does it return Ascendant, MC, IC, Descendant?
- Does it expose house cusps?
- Does it expose planets-in-houses?
- How does it handle unknown birth time?
- How does it handle high latitudes?
- Is timezone/DST handled by provider or by our app?
- What confidence metadata should Darrow store?
```

Do not solve these in this appendix. This is a source-policy and symbolic-rule seed only.

---

## 14. Future repo placement

During KB1 docs-only phase, this appendix can become:

```text
docs/knowledge/ASTRO_HOUSE_SOURCE_ADDENDUM_v1.md
docs/knowledge/ASTRO_HOUSE_RULES_v1.md
docs/knowledge/ASTRO_HOUSE_SYSTEM_POLICY_v1.md
docs/knowledge/BIRTH_TIME_RELIABILITY_POLICY_v1.md
docs/knowledge/SOURCE_LOG.md
```

Do not wire into runtime until a later explicit phase defines:
- provider payload;
- house system;
- birth-time reliability field;
- fallback behavior for unknown time;
- whether houses appear in CORE, add-ons, or both.

---

## 15. Source-log draft notes

- Wikipedia House (astrology) is useful as a broad source-listing and terminology reference. It states that houses depend on time and location rather than date and that exact time/date/location are needed for house calculation, but the page has a warning about possible AI-generated material, so it should not be used as a sole authority.
- AstroStyle gives a very accessible market-friendly framing: houses as 12 segments/life areas and the place where planets/signs play out. Useful for tone awareness only.
- CHANI gives a strong modern explanation that houses anchor the sky to the time/place perspective of birth, and it explicitly notes empty houses are normal. Useful for human-readable framing only.
- Cafe Astrology is useful for Whole Sign vs Placidus comparison and calculator UX: Whole Sign houses begin at 0° of the Ascendant sign, while Placidus is the default generator on that site.
- Astro.com / Astrodienst and Astro-Seek should be inspected manually later for house-system calculator behavior and professional product benchmark, because pages were not fully accessible during automated review.
- Co–Star and Almanac pages should be manually checked later; they were not text-accessible during this pass.
- Skyscript / Deborah Houlding and traditional texts should be used later for stronger historical/traditional grounding, but never copied into customer prose.

---

## 16. Claude guard note

Do not give this addendum to Claude during B3/B4 technical phases unless a specific docs-only KB1 phase is running.

Future KB1 only:

```md
This Astrological Houses / House Systems addendum is docs-only research material.
Do not modify runtime, schema, prompts, PDF template, generation pipeline, routes, Stripe, email, auth, customer logic, or provider integrations.
Do not activate house-based generation.
Do not use houses when birth_time_known=false.
Do not make medical, legal, financial, relationship, death, or event-prediction claims from houses.
```
