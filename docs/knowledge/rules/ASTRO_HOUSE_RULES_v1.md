# DARROW CODE — Astro House Rules v1

**Status:** curated Darrow rule doc / docs-only
**Runtime status:** not active
**Not prompt authority**
**Not schema authority**
**Not PDF/template authority**
**Not provider implementation authority**
**Not report generation authority**
**Derived from source packs in original Darrow Code language**
**Requires separate explicit approval before runtime integration**

Source packs used: `DARROW_ASTRO_HOUSES_SOURCE_ADDENDUM_v0_1.md` · `DARROW_CODE_KNOWLEDGE_BASE_SOURCE_PACK_v0_2.md`
Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md` · `BIRTH_TIME_RELIABILITY_POLICY_v1.md`

---

## 1. Core framing rule

```text
Houses are life areas — the stages where symbolic functions play out.
They are NOT personality labels and NOT deterministic outcomes.

House = where the action happens, not what the person is.
Planet = the function operating there.
Sign on house cusp = the operating style of that life area.
Aspect = how that house area communicates with others.

CRITICAL GATE: Houses require reliable birth time AND birthplace.
If birth_time_confidence = "unknown", houses must NOT be used.
```

---

## 2. House system caution

Different house systems place cusps differently. The same planet may fall in different houses under Whole Sign vs Placidus, especially near cusps.

```text
Whole Sign:     the entire sign containing the Ascendant becomes the 1st house;
                each subsequent sign = the next house; cusp is always 0° of the sign.
Placidus:       a time-based quadrant system; most popular modern default;
                cusps fall at specific degree within each sign.
Equal House:    each house is exactly 30° from the Ascendant.
Koch, Campanus, Regiomontanus, Porphyry: additional mathematical variants.
```

Darrow policy:

```text
Use the house system returned by the provider.
Do not switch house systems silently.
Do not make high-stakes claims near cusps without noting possible house-system variance.
Store the house system used when available.
Do not claim one system is universally "more accurate."
```

---

## 3. Empty house policy

An empty house means no major selected body is placed in that life area in the current chart configuration.

```text
Empty house ≠ absence of life in that area.
Empty house = no concentrated symbolic function operating there in this chart.
Life in that area is governed by the house's ruling planet and its placement.

Do not tell a client "nothing is happening in your X house."
```

---

## 4. House types

### 4.1 Angular houses (1, 4, 7, 10)

Angular houses are the four pillars of the chart. Planets here are said to operate with the most immediate and visible impact.

```text
Angular emphasis: life asks the pattern to become embodied, visible, and active.
Strong angular planets: tend to shape the person's outer life and circumstances more directly.
```

### 4.2 Succedent houses (2, 5, 8, 11)

Succedent houses consolidate and hold what the angular houses initiate.

```text
Succedent emphasis: the pattern stabilizes, accumulates, and manages resources and relationships.
```

### 4.3 Cadent houses (3, 6, 9, 12)

Cadent houses process, adapt, and translate.

```text
Cadent emphasis: the pattern learns, adjusts, communicates, and prepares for the next angular phase.
```

---

## 5. House rules (12 houses)

### 5.1 House 1 — Identity Interface

```
id:                   house_1
layer:                house
traditional_name:     Ascendant / House of Self
darrow_area:          identity interface, body, first impression, embodied presence
darrow_meaning:       how the person meets the world and how the world meets them; the physical and social interface of self
strength_expression:  clarity of embodied presence, comfort in one's own physical and social signature
shadow_expression:    preoccupation with image or first impression at the expense of depth
practical_direction:  inhabit the body before explaining the self
safe_report_use:      [core_architecture, social_interface]
requires_birth_time:  true
forbidden_claims:
  - "your 1st house determines your appearance definitively"
  - physical description claims from 1st house sign
  - health prognoses from 1st house
```

---

### 5.2 House 2 — Value and Resource

```
id:                   house_2
layer:                house
traditional_name:     House of Possessions / Self-Worth
darrow_area:          material resources, self-worth, value system, earned income orientation
darrow_meaning:       the field where the person builds their sense of material and psychological worth
strength_expression:  steady value-building, resource sense, ability to know what is genuinely worth keeping
shadow_expression:    scarcity fear, self-worth contingent on material holdings, attachment to what has already been outgrown
practical_direction:  build value without becoming owned by the building
safe_report_use:      [MONEY add-on, professional_archetype, value baseline]
requires_birth_time:  true
forbidden_claims:
  - "2nd house determines wealth/poverty"
  - financial outcome guarantees
  - "your income will [specific claim]"
```

---

### 5.3 House 3 — Communication and Learning

```
id:                   house_3
layer:                house
traditional_name:     House of Communication
darrow_area:          speech, writing, learning, local environment, siblings and peers, short journeys
darrow_meaning:       the field where the person builds skill, language, and connection in their immediate cognitive and social environment
strength_expression:  clear communication, skillful learning, the ability to translate and transmit
shadow_expression:    scattered attention, noise over signal, nervous comparison with immediate others
practical_direction:  make language useful and specific rather than comprehensive
safe_report_use:      [core_architecture, operating_mode — cognitive style]
requires_birth_time:  true
forbidden_claims:
  - "3rd house determines intelligence"
  - sibling outcome claims
  - travel claims from 3rd house
```

---

### 5.4 House 4 — Foundation and Roots

```
id:                   house_4
layer:                house
traditional_name:     IC / House of Home
darrow_area:          home, roots, emotional base, private foundation, family of origin legacy
darrow_meaning:       the field that underlies everything — the emotional and material base the person builds from and returns to
strength_expression:  emotional anchoring, the ability to create a home base that genuinely restores
shadow_expression:    family entanglement, nostalgia trap, using the past as the primary measure of the present
practical_direction:  create a base that supports forward movement rather than one that simply recreates what was
safe_report_use:      [environment_and_resonance, body_and_vitality, core_architecture]
requires_birth_time:  true
forbidden_claims:
  - "4th house determines your relationship with your mother/father"
  - real estate predictions
  - family outcome claims
```

---

### 5.5 House 5 — Creativity and Authorship

```
id:                   house_5
layer:                house
traditional_name:     House of Pleasure / Children
darrow_area:          creativity, play, romance, authorship of joy, self-expression through creation
darrow_meaning:       the field where the person most naturally expresses what is alive and genuine in them — through making, playing, and risking pleasure
strength_expression:  creative radiance, the capacity to take genuine pleasure, willingness to express
shadow_expression:    performance hunger, drama, validation-seeking in romance or creative work
practical_direction:  create because life wants expression, not because an audience demands it
safe_report_use:      [LOVE add-on, STYLE add-on, creative texture in CORE]
requires_birth_time:  true
forbidden_claims:
  - "5th house determines how many children you will have"
  - romantic outcome claims
  - "5th house guarantees creative success"
```

---

### 5.6 House 6 — Routine and Service

```
id:                   house_6
layer:                house
traditional_name:     House of Health / Service
darrow_area:          daily routine, work rhythm, service, body maintenance, refinement practices
darrow_meaning:       the field where the person sustains themselves through the daily system they build and maintain
strength_expression:  disciplined self-maintenance, useful service, the capacity to build and keep sustainable routines
shadow_expression:    overwork, self-criticism about physical or work performance, anxiety around the body as a project
practical_direction:  build routines that serve life rather than turning life into a routine
safe_report_use:      [BODY add-on, professional rhythm in CORE — as soft texture only]
requires_birth_time:  true
forbidden_claims:
  - "6th house determines your health"
  - illness diagnoses from 6th house planets
  - "your 6th house shows [specific health problem]"
```

---

### 5.7 House 7 — Partnership and Mirror

```
id:                   house_7
layer:                house
traditional_name:     House of Partnership / Descendant
darrow_area:          partnership, contracts, the equal other, the projected self, relational mirror
darrow_meaning:       the field where the person most clearly encounters what they cannot fully recognize in themselves — through the people they choose as partners and significant others
strength_expression:  genuine cooperation, relational intelligence, the capacity to meet an equal other fully
shadow_expression:    projection, dependency on the mirror, losing the self in the partnership
practical_direction:  meet others without disappearing into them; the field is richest when both parties remain distinct
safe_report_use:      [LOVE add-on, relational_pattern — if birth time reliable]
requires_birth_time:  true
forbidden_claims:
  - "7th house determines your marriage"
  - "you will marry a [sign] person"
  - divorce/partnership outcome predictions
```

---

### 5.8 House 8 — Transformation and Shared Resources

```
id:                   house_8
layer:                house
traditional_name:     House of Death / Shared Resources
darrow_area:          intimacy, shared resources, psychological depth, crisis and renewal, hidden power dynamics
darrow_meaning:       the field where the person encounters irreversible change — through intimacy, shared material reality, and the confrontation with what cannot be controlled
strength_expression:  psychological courage, the capacity to sustain transformation, depth of trust in intimate bonds
shadow_expression:    control around intimacy or shared resources, crisis attachment, power dynamics that replace genuine closeness
practical_direction:  let transformation complete rather than managing it back to comfort
safe_report_use:      [LOVE add-on, MONEY add-on, shadow_and_friction — if birth time reliable]
requires_birth_time:  true
forbidden_claims:
  - "8th house determines death/inheritance"
  - "8th house means you have trauma"
  - financial outcome claims from 8th house
```

---

### 5.9 House 9 — Meaning and Horizon

```
id:                   house_9
layer:                house
traditional_name:     House of Philosophy / Long Journeys
darrow_area:          meaning, philosophy, belief, higher education, long travel, teaching, cultural horizon
darrow_meaning:       the field where the person seeks to understand the larger pattern — to locate themselves within something wider than the immediate situation
strength_expression:  expansive thinking, the capacity to hold and transmit a vision, orientation toward genuine learning
shadow_expression:    dogma mistaken for wisdom, escape into abstraction, overpromising about meaning
practical_direction:  ground the horizon in something specific enough to reach
safe_report_use:      [YEAR add-on, professional_archetype — as directional texture]
requires_birth_time:  true
forbidden_claims:
  - "9th house determines your beliefs"
  - travel outcome guarantees
  - "9th house means you will study/teach"
```

---

### 5.10 House 10 — Vocation and Public Role

```
id:                   house_10
layer:                house
traditional_name:     Midheaven / MC / House of Career
darrow_area:          vocation, public role, visible authority, earned reputation, the contribution that is remembered
darrow_meaning:       the field where private competence becomes public responsibility — where the person's work meets the world's acknowledgment
strength_expression:  mastery that becomes visible, the capacity to hold a public role without losing the private self
shadow_expression:    over-identification with status, ambition disconnected from meaning, the role replacing the person
practical_direction:  build a role that can hold your real life, not one that requires the real life to disappear
safe_report_use:      [professional_archetype, executive_summary — if birth time reliable]
requires_birth_time:  true
forbidden_claims:
  - "10th house determines your career/success"
  - "MC in [sign] means you will be [profession]"
  - fame or status outcome guarantees
```

---

### 5.11 House 11 — Networks and Future

```
id:                   house_11
layer:                house
traditional_name:     House of Friends / Groups
darrow_area:          networks, allies, collective field, future vision, chosen communities
darrow_meaning:       the field where the person situates themselves in relation to what is coming — through the circles they choose and the shared visions they commit to
strength_expression:  community intelligence, the capacity to hold a long-range vision in collaboration with others
shadow_expression:    group dependency, social abstraction that replaces genuine connection, alienation within the collective
practical_direction:  choose circles that strengthen the future self rather than simply belonging to them
safe_report_use:      [social_interface, professional_archetype — as network texture]
requires_birth_time:  true
forbidden_claims:
  - "11th house determines your friendships"
  - friendship outcome predictions
  - "you will achieve your goals because of 11th house"
```

---

### 5.12 House 12 — Hidden Life and Retreat

```
id:                   house_12
layer:                house
traditional_name:     House of the Unconscious / Hidden Enemies
darrow_area:          retreat, hidden life, endings, unconscious patterns, symbolic sensitivity, the invisible operating system
darrow_meaning:       the field where the person processes what cannot be brought into direct light — the private interior, the symbolic life, the patterns that operate below the stated surface
strength_expression:  deep restoration capacity, symbolic attunement, the ability to work with what is not yet fully conscious
shadow_expression:    self-undoing when the hidden patterns are not examined, isolation, avoidance, patterns that run without acknowledgment
practical_direction:  make the invisible conscious before it runs the system; the 12th is most alive when it is acknowledged rather than managed
safe_report_use:      [shadow_and_friction, body_and_vitality — as vitality / restoration texture]
requires_birth_time:  true
forbidden_claims:
  - "12th house means hidden enemies"
  - "12th house indicates imprisonment/illness"
  - "12th house means you are secretly X"
```

---

## 6. House rulers (proof layer)

House rulers connect life areas through planetary links. They are most useful in internal analysis and proof layers.

```text
House ruler = the planet ruling the sign on that house cusp.
It links one life area to the house where the ruling planet is placed.
```

Darrow policy:

```text
Use house rulers as internal depth layer and proof evidence.
Do not produce house ruler chains as customer-facing prose unless the pattern is exceptionally clear and legible.
Never: "Your 7th-house ruler is in the 8th, therefore your relationships will involve crisis."
```

Forbidden:

```text
"Your [house] ruler guarantees [outcome]"
Deterministic life-event claims from ruler placement
Compatibility claims from ruler comparisons
```

---

## 7. Global forbidden claims (all houses)

```text
Houses determine life events (marriage, death, illness, wealth, imprisonment)
Empty houses mean nothing is happening in that area
House placement guarantees career/relationship/health outcome
Compatibility verdicts from house comparisons between two charts
Medical diagnoses from 6th/1st/12th house planets
"Your 8th house means you will inherit/experience death"
"Your 12th house means you have hidden enemies"
Using houses when birth_time_confidence = "unknown"
```

🔒 curated Darrow rule doc · docs-only · not active in runtime · KB2-A approved · requires explicit later approval for runtime integration
