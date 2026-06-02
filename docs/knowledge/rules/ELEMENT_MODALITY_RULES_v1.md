# DARROW CODE — Element and Modality Rules v1

**Status:** curated Darrow rule doc / docs-only
**Runtime status:** not active
**Not prompt authority**
**Not schema authority**
**Not PDF/template authority**
**Not provider implementation authority**
**Not report generation authority**
**Derived from source packs in original Darrow Code language**
**Requires separate explicit approval before runtime integration**

Source packs used: `DARROW_CODE_KNOWLEDGE_BASE_SOURCE_PACK_v0_2.md` · `DARROW_WESTERN_ZODIAC_SOURCE_ADDENDUM_v0_1.md`
Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md`

---

## 1. Core framing rule

```text
Elements and modalities are chart-level patterns — they describe how the overall
symbolic architecture is distributed, not how any individual sign or planet operates in isolation.

Element balance:   what type of energy predominates in the chart overall
Modality balance:  how the chart engages with change and motion
Polarity balance:  inward vs outward orientation across the chart as a whole

These are texture layers — they contextualize the sign and planet rules, not replace them.
No element or modality balance causes a personality type or life outcome.
```

---

## 2. Western four elements

### 2.1 Fire

```
id:                   element_fire
layer:                element
signs:                [Aries, Leo, Sagittarius]
darrow_meaning:       animating will — the quality of ignition, visibility, direction, and the orientation toward what is alive
strength_expression:  courage, initiative, warmth, the capacity to inspire and be inspired, forward momentum
shadow_expression:    burnout from sustained output without replenishment, impatience when momentum slows, heat that consumes what it meant to illuminate
practical_direction:  sustain the ignition by connecting it to something renewable; fire without fuel exhausts itself
report_use:           emphasis in orientation, operating mode, executive summary when dominant
forbidden_claims:
  - "fire chart means success/aggression/passion" as deterministic
  - health claims from fire imbalance
  - "you lack fire therefore..."
sample_phrase:        >
  The fire emphasis in this chart gives it momentum — a quality of moving toward,
  of wanting to ignite something. The question is whether the fuel is renewable
  or whether the brightness is burning through something finite.
```

---

### 2.2 Earth

```
id:                   element_earth
layer:                element
signs:                [Taurus, Virgo, Capricorn]
darrow_meaning:       materialization and form — the capacity to build something tangible, patient, and durable in the physical world
strength_expression:  stability, craft, reliability, the ability to stay with a process long enough for it to produce real results
shadow_expression:    rigidity when conditions change, reduction of experience to utility, heaviness when the material world becomes the only register
practical_direction:  use the building instinct for things that genuinely warrant permanence; not everything needs to be made concrete
report_use:           emphasis in professional archetype, body and vitality, environment when dominant
forbidden_claims:
  - "earth chart guarantees wealth/stability"
  - "you lack earth therefore you are unstable"
  - health claims from earth imbalance
sample_phrase:        >
  The earth emphasis here gives the chart patience and craft — the orientation toward
  building what genuinely lasts. The challenge is remembering that some things are meant
  to remain unfinished, fluid, or alive rather than fixed.
```

---

### 2.3 Air

```
id:                   element_air
layer:                element
signs:                [Gemini, Libra, Aquarius]
darrow_meaning:       conceptualization and connection — the capacity to perceive patterns, communicate across differences, and hold multiple perspectives simultaneously
strength_expression:  clarity of thought, relational intelligence, the ability to translate ideas into language and connect people across distances
shadow_expression:    detachment from the somatic and emotional dimensions of experience, analysis that processes without arriving, abstraction that floats above what is actually happening
practical_direction:  connect the thinking to what can be sensed and felt as well as what can be understood; the intelligence is most useful when it is grounded
report_use:           emphasis in core architecture, operating mode, relational pattern when dominant
forbidden_claims:
  - "air chart means intelligence/social ability" as deterministic
  - "you lack air therefore you can't communicate"
  - compatibility claims from air emphasis
sample_phrase:        >
  The air emphasis in this chart gives it range — the capacity to perceive, name,
  and connect across more territory than most. The question is whether the range
  ever comes to rest long enough to be inhabited.
```

---

### 2.4 Water

```
id:                   element_water
layer:                element
signs:                [Cancer, Scorpio, Pisces]
darrow_meaning:       emotional depth and resonance — the capacity to perceive and be moved by what cannot be directly named, and to understand others from the inside
strength_expression:  empathic attunement, depth of memory, the ability to navigate the emotional and symbolic dimensions of experience with genuine intelligence
shadow_expression:    absorption of others' emotional states at the expense of one's own clarity, boundary dissolution, difficulty distinguishing between received feeling and one's own
practical_direction:  tend the boundary without eliminating the sensitivity; the depth is most useful when it does not flood the foundation
report_use:           emphasis in core architecture, relational pattern, body and vitality, environment when dominant
forbidden_claims:
  - "water chart means emotional instability"
  - "you lack water therefore you are cold"
  - health or psychological claims from water imbalance
sample_phrase:        >
  The water emphasis here gives the chart depth and resonance — the ability to sense
  what is underneath. That intelligence is real. The work is keeping a boundary
  clear enough to know what belongs to whom.
```

---

## 3. Modalities

### 3.1 Cardinal

```
id:                   modality_cardinal
layer:                modality
signs:                [Aries, Cancer, Libra, Capricorn]
darrow_meaning:       initiation — the orientation toward launching, beginning, directing, and generating forward motion in the life areas each sign governs
strength_expression:  the capacity to start, to act on an impulse before the conditions are perfect, to open new territory
shadow_expression:    tendency to initiate more than sustain, to move on before what was started has fully developed
practical_direction:  pair the initiating quality with the patience to see at least some of what was started through to completion
report_use:           operating mode, professional archetype when dominant
forbidden_claims:
  - "cardinal dominant means you are a leader"
  - career guarantees from cardinal emphasis
sample_phrase:        >
  The cardinal emphasis in this chart is directional — something in the pattern
  consistently wants to begin. The challenge is choosing which beginnings are worth
  the sustained attention that follows the launch.
```

---

### 3.2 Fixed

```
id:                   modality_fixed
layer:                modality
signs:                [Taurus, Leo, Scorpio, Aquarius]
darrow_meaning:       consolidation — the orientation toward sustaining, deepening, and holding a direction once it has been established
strength_expression:  persistence, depth, the capacity to sustain effort through difficulty without losing the thread
shadow_expression:    resistance to change that has already become necessary, holding a position or pattern past its usefulness
practical_direction:  distinguish between productive persistence and loyalty to something that has finished; the fixed quality is most alive when it is attached to something genuinely worth sustaining
report_use:           operating mode, shadow and friction when dominant
forbidden_claims:
  - "fixed dominant means you are stubborn"
  - deterministic personality claims from fixed emphasis
sample_phrase:        >
  The fixed emphasis here gives the chart staying power — a genuine capacity to hold
  a direction under pressure. The work is noticing when that persistence has become
  attachment to something that no longer needs holding.
```

---

### 3.3 Mutable

```
id:                   modality_mutable
layer:                modality
signs:                [Gemini, Virgo, Sagittarius, Pisces]
darrow_meaning:       adaptation — the orientation toward changing state, translating between conditions, and moving through transition without requiring everything to be stable first
strength_expression:  flexibility, the ability to navigate uncertainty, responsiveness to shifting conditions
shadow_expression:    difficulty committing to a direction when too many options remain available, dispersal of energy across too many ongoing adjustments
practical_direction:  choose a direction to adapt toward; the mutable quality is most alive when the flexibility serves something rather than replacing it
report_use:           operating mode, relational pattern when dominant
forbidden_claims:
  - "mutable dominant means you are unreliable"
  - personality type verdicts from mutable emphasis
sample_phrase:        >
  The mutable emphasis in this chart means it navigates change well — it does not require
  conditions to stabilize before it can move. The question is what the movement is
  orienting toward.
```

---

## 4. Element balance interpretation

### 4.1 Dominant element

When 3 or more personal planets (Sun, Moon, Mercury, Venus, Mars) occupy one element, that element is considered dominant.

```text
Dominant element = amplified tonal register; the person's operating tendency is strongly colored by that element's themes.
```

### 4.2 Absent element

When no personal planets occupy an element, that element is considered absent.

```text
Absent element = often a shadow or compensatory area — territory the person may feel less fluent in,
or may over-compensate for, or may unconsciously seek in relationships.
```

An absent element does not mean the qualities are absent from the person's life — it often means they are encountered through others or through effort rather than through instinct.

### 4.3 Singleton

When exactly one planet occupies an element alone among all planets, that planet carries outsized elemental weight.

```text
Singleton rule: the single planet in an element becomes a concentrated, sometimes isolated
carrier of that element's themes — significant and worth noting.
```

---

## 5. Modality balance interpretation

### 5.1 Dominant modality

Three or more personal planets in one modality suggests a consistent way of engaging with change and motion.

### 5.2 Absent modality

No personal planets in a modality suggests territory the person may need to develop consciously.

```text
Absent cardinal: may need to practice initiating or making direct moves
Absent fixed: may need to practice sustaining, committing, or deepening
Absent mutable: may need to practice adapting or tolerating ambiguity
```

These are tendencies and development areas — not deficits.

---

## 6. Polarity (symbolic framing only)

| Polarity | Element | Signs | Tonal quality |
|---|---|---|---|
| Yang / active | Fire, Air | Aries, Gemini, Leo, Libra, Sagittarius, Aquarius | outward expression, projection, engagement |
| Yin / receptive | Earth, Water | Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces | inward processing, containment, absorption |

```text
Polarity is symbolic framing only — not gender, not strength hierarchy.
Yang-dominant charts are not "better" or "more successful."
Yin-dominant charts are not "passive" or "weaker."
Polarity describes the orientation of the operating style, not its quality.
```

---

## 7. Element × Modality grid (reference)

| | Cardinal | Fixed | Mutable |
|---|---|---|---|
| Fire | Aries | Leo | Sagittarius |
| Earth | Capricorn | Taurus | Virgo |
| Air | Libra | Aquarius | Gemini |
| Water | Cancer | Scorpio | Pisces |

Each cell is a unique combination of motivating energy (element) and mode of engagement (modality).

---

## 8. Global forbidden claims

```text
Element or modality balance determines personality type
Dominant fire/earth/air/water guarantees success/career/relationship outcome
Absent elements mean deficiency or inability
Lucky/unlucky elements or modalities
Medical or psychological diagnoses from element imbalance
Compatibility verdicts from element comparison between people
"You are a water person therefore you are emotional/intuitive/weak"
```

🔒 curated Darrow rule doc · docs-only · not active in runtime · KB2-A approved · requires explicit later approval for runtime integration
