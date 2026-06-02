# DARROW CODE — Astro Planet Rules v1

**Status:** curated Darrow rule doc / docs-only
**Runtime status:** not active
**Not prompt authority**
**Not schema authority**
**Not PDF/template authority**
**Not provider implementation authority**
**Not report generation authority**
**Derived from source packs in original Darrow Code language**
**Requires separate explicit approval before runtime integration**

Source packs used: `DARROW_WESTERN_ZODIAC_SOURCE_ADDENDUM_v0_1.md` · `DARROW_CODE_KNOWLEDGE_BASE_SOURCE_PACK_v0_2.md`
Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md`

---

## 1. Core framing rule

```text
A planet is a symbolic function — a specific quality of operation, not a deterministic cause.

Planet in sign = how that function operates.
Planet in house = what life area that function primarily engages (only if birth time reliable).
Planet in aspect = how that function relates to another.

No planet placement causes an event or guarantees an outcome.
A planet in hard aspect is not cursed. A planet in easy aspect is not protected.
```

---

## 2. Planet categories

| Category | Planets | Darrow role |
|---|---|---|
| Personal | Sun, Moon, Mercury, Venus, Mars | Individual temperament; primary interpretive signals |
| Social | Jupiter, Saturn | Interface between the individual and structure/society |
| Transpersonal | Uranus, Neptune, Pluto | Generational field; their sign matters more than their house in most interpretations |
| Conditional / supporting | Chiron, North Node, Lilith | Secondary supporting signals; marked conditional below |

---

## 3. Personal planet rules

### 3.1 Sun

```
id:                   planet_sun
layer:                planet
function:             authorship / vital center / conscious identity direction
darrow_meaning:       the quality the person is developing the authority to embody — the animating core of self-expression
strength_expression:  visible center, confident self-direction, the capacity to act from genuine inner authority
shadow_expression:    ego pressure when identity feels threatened, rigidity when the identity cannot adapt, performance of self instead of expression
practical_direction:  inhabit the center without defending it; authority is most alive when it does not require protection
safe_report_use:      [orientation, core_architecture, executive_summary]
forbidden_claims:
  - "your Sun sign determines your destiny"
  - health or career guarantees from Sun placement
  - "your best match is..."
sample_phrase:        >
  The Sun describes the quality this person is building the authority to be.
  Not a fixed type — a direction of development. The strength of this placement
  shows in how fully the person can inhabit it without needing external validation.
```

---

### 3.2 Moon

```
id:                   planet_moon
layer:                planet
function:             emotional body / safety system / inner rhythm
darrow_meaning:       how the person restores themselves, what they need to feel safe, and what their emotional intelligence registers most readily
strength_expression:  memory and care as intelligence, emotional attunement, the capacity to restore self and others
shadow_expression:    mood-dependent perception, over-protective behaviors that shut out growth, seeking safety through comfort at the expense of development
practical_direction:  recognize the rhythm rather than override it; the emotional intelligence is most useful when it is acknowledged, not suppressed
safe_report_use:      [core_architecture, body_and_vitality, environment_and_resonance, relational_pattern]
forbidden_claims:
  - "Moon sign determines your emotions definitively"
  - health or fertility claims from Moon placement
  - "you are moody" as a fixed label
sample_phrase:        >
  The Moon describes the emotional operating system — what this person needs in order
  to feel restored, safe, and present. That system is not a weakness. It is a genuine
  intelligence that needs to be worked with, not overridden.
```

---

### 3.3 Mercury

```
id:                   planet_mercury
layer:                planet
function:             perception / language / information processing
darrow_meaning:       how the person takes in, organizes, and transmits information and experience
strength_expression:  analytical clarity, communicative precision, the ability to translate complex signals into usable language
shadow_expression:    overthinking, nervous scattering, processing without landing, language as defense against experience
practical_direction:  communicate with specificity; the perceptive quality is most useful when it produces something transmissible
safe_report_use:      [core_architecture, operating_mode, professional_archetype]
forbidden_claims:
  - "Mercury retrograde caused the problem"
  - learning disability claims from Mercury placement
  - intelligence guarantees
sample_phrase:        >
  The perceptive range of this chart is notable. It picks up and processes more signals
  than most. The question is whether the processing ever finishes — or whether the mind
  keeps revising rather than arriving.
```

---

### 3.4 Venus

```
id:                   planet_venus
layer:                planet
function:             value / beauty / attraction / choice
darrow_meaning:       what this person genuinely values, how they relate to beauty and pleasure, and what they are naturally drawn toward
strength_expression:  aesthetic intelligence, relational warmth, the capacity to create environments that feel harmonious and attractive
shadow_expression:    pleasing others at the expense of one's own values, indulgence that avoids difficulty, attraction without discernment
practical_direction:  know what is genuinely valued before orienting toward it; the aesthetic and relational intelligence is most useful when it serves something real
safe_report_use:      [core_architecture, relational_pattern, environment_and_resonance]
forbidden_claims:
  - "Venus guarantees relationship success"
  - "Venus retrograde ruined your relationship"
  - love/wealth attraction claims
sample_phrase:        >
  Venus describes what genuinely attracts and what feels worth building — in relationships,
  in environments, in work. The signal here is not about romance alone. It is about taste:
  what this person keeps returning to as beautiful, worthwhile, or true.
```

---

### 3.5 Mars

```
id:                   planet_mars
layer:                planet
function:             action / desire / directed energy / defense
darrow_meaning:       how this person initiates, what animates their desire, and how they deal with opposition
strength_expression:  courage, directed initiative, the capacity to sustain effort toward something genuinely desired
shadow_expression:    aggression when desire is frustrated, impatience when forward motion is blocked, force used where persuasion would serve
practical_direction:  direct the energy toward something specific; Mars is most effective when desire and direction are aligned
safe_report_use:      [core_architecture, operating_mode, shadow_and_friction, professional_archetype]
forbidden_claims:
  - "Mars causes violence"
  - "hard Mars aspect makes you dangerous"
  - health/injury guarantees from Mars
sample_phrase:        >
  The drive here is real. Something in this chart wants to move, to act, to initiate.
  The question is what that energy is pointed toward — and whether the direction
  is worth the force being applied.
```

---

## 4. Social planet rules

### 4.1 Jupiter

```
id:                   planet_jupiter
layer:                planet
function:             expansion / meaning / opportunity / growth orientation
darrow_meaning:       where this person naturally expands, what they believe in, and what they use to make sense of experience
strength_expression:  generosity of vision, trust in the possibility of growth, the ability to teach and transmit meaning
shadow_expression:    excess in service of more-more-more, inflation of what is actually available, overreach that outpaces the ground
practical_direction:  ground the expansion in something specific; Jupiter is most useful when the optimism is attached to an actual direction
safe_report_use:      [core_architecture, professional_archetype, relational_pattern, executive_summary]
forbidden_claims:
  - "Jupiter guarantees luck or wealth"
  - "Jupiter return fixes everything"
  - financial predictions from Jupiter
sample_phrase:        >
  There is an expansive quality here — a genuine orientation toward more: more meaning,
  more connection, more possibility. The gift is in the reach. The work is making sure
  the reach is attached to something that can actually hold it.
```

---

### 4.2 Saturn

```
id:                   planet_saturn
layer:                planet
function:             structure / limitation / mastery / earned authority
darrow_meaning:       where this person must develop through sustained effort and where shortcuts consistently fail
strength_expression:  discipline, long-range vision, the ability to build something that lasts because it was built slowly
shadow_expression:    contraction when the pressure feels permanent, fear that limits more than the situation requires, over-identification with difficulty
practical_direction:  treat the limitation as a curriculum, not a verdict; the mastery is on the other side of the sustained effort
safe_report_use:      [core_architecture, operating_mode, shadow_and_friction, professional_archetype]
forbidden_claims:
  - "Saturn causes suffering"
  - "Saturn return destroys relationships/careers"
  - deterministic life-event predictions from Saturn
sample_phrase:        >
  Saturn describes where this person must earn what they get — where charm or talent alone
  will not be enough. That is not punishment. It is a design: the area where the deepest
  competence becomes possible precisely because it cannot be shortcuts.
```

---

## 5. Transpersonal planet rules

Transpersonal planets move slowly. Their sign is generational. Their personal significance is primarily through aspects to personal planets, house placement (if birth time reliable), and position in the overall chart architecture.

### 5.1 Uranus

```
id:                   planet_uranus
layer:                planet
function:             freedom / disruption / pattern-breaking / collective awakening
darrow_meaning:       where the person (and their generation) experiences the pressure to break from the inherited form
strength_expression:  originality, the capacity to innovate and see beyond convention, the ability to tolerate discontinuity without collapse
shadow_expression:    instability for its own sake, alienation from connection in service of freedom, disruption that destroys before it creates
practical_direction:  break what needs to change; Uranus is most alive when the disruption serves a recognizable future direction
safe_report_use:      [core_architecture, operating_mode — as generational texture]
forbidden_claims:
  - "Uranus transit guarantees upheaval"
  - "Uranus causes divorce/job loss"
sample_phrase:        >
  This placement carries a generational quality: the pressure toward breaking with
  inherited form, toward original thinking, toward patterns that have not been worn
  smooth by convention. Whether that energy is disruptive or generative depends on
  what it is aimed at.
```

---

### 5.2 Neptune

```
id:                   planet_neptune
layer:                planet
function:             dissolution / imagination / transcendence / collective idealism
darrow_meaning:       where the person (and their generation) encounters the dissolving of boundaries — between self and other, between what is real and what is imagined
strength_expression:  imaginative depth, empathic porousness, the ability to work with symbol and indirect perception
shadow_expression:    confusion when the boundaries dissolve without intention, escape into fantasy when reality becomes demanding, delusion mistaken for inspiration
practical_direction:  give the imagination a form; Neptune is most alive when its permeability produces something specific enough to be shared
safe_report_use:      [core_architecture — as generational texture, body_and_vitality — as porous boundary note]
forbidden_claims:
  - "Neptune causes addiction"
  - "you are psychically sensitive" as a literal claim
  - health claims from Neptune
sample_phrase:        >
  Neptune describes where boundaries become more negotiable — in this person's generation
  and, through personal aspects, in their own relationship to what can and cannot be
  clearly defined. The question is whether that porousness is intentional or managed.
```

---

### 5.3 Pluto

```
id:                   planet_pluto
layer:                planet
function:             depth / power / transformation / confrontation with the underworld
darrow_meaning:       where the person (and their generation) encounters pressure to transform through confronting what has been hidden, suppressed, or denied power
strength_expression:  psychological depth, the capacity to sustain transformation without collapse, the ability to work with shadow rather than be run by it
shadow_expression:    control through withholding, obsession, compulsion to manage what feels threatening, power-over when shared power would serve better
practical_direction:  let the transformation complete; Pluto is most alive when the depth perception moves through the system rather than becoming a permanent guard
safe_report_use:      [core_architecture — as generational texture, shadow_and_friction]
forbidden_claims:
  - "Pluto transit causes death/destruction"
  - "Pluto guarantees psychological crisis"
  - power or control claims
sample_phrase:        >
  Pluto describes where this chart encounters the irreversible — where something must
  fundamentally change rather than be adjusted. That territory is rarely comfortable
  and usually productive.
```

---

## 6. Conditional / supporting planets

These are secondary signals. They must be marked clearly as supporting texture, not primary interpretation.

### 6.1 Chiron (conditional)

```
id:                   planet_chiron
layer:                planet
condition:            supporting signal only; do not use as primary interpretation
function:             wound / hard-won medicine / the place where the person's deepest difficulty becomes their most transferable competence
darrow_meaning:       the area where the person has experienced persistent difficulty and, through that difficulty, developed a specific quality of guidance or understanding
strength_expression:  the capacity to accompany others through territory that was once isolating, because it has been genuinely traversed
shadow_expression:    over-identification with the wound as identity, giving what was needed rather than what is currently real
safe_report_use:      [shadow_and_friction — as supporting texture only]
forbidden_claims:
  - "Chiron causes permanent wounding"
  - health diagnoses from Chiron
sample_phrase:        >
  There is a thread in this chart that has required working through something difficult
  without a reliable guide. What developed on the other side of that is genuinely transmissible.
```

---

### 6.2 North Node (conditional)

```
id:                   planet_north_node
layer:                planet
condition:            supporting signal only; describe as directional pull, not fate
function:             directional pull / developmental edge / evolutionary trajectory
darrow_meaning:       the direction this chart is oriented toward developing — usually territory that feels less familiar but increasingly necessary
safe_report_use:      [executive_summary — as light directional texture only]
forbidden_claims:
  - "North Node determines your soul purpose"
  - "South Node is your past life"
  - any karmic certainty claims
```

---

### 6.3 Lilith / Black Moon Lilith (conditional)

```
id:                   planet_lilith
layer:                planet
condition:            supporting signal only; use only if chart architecture warrants it; avoid overuse
function:             the quality that has been rejected or denied — the place where instinct was told it was wrong
darrow_meaning:       a pattern of instinctive knowing that was suppressed and may now be seeking reintegration
safe_report_use:      [shadow_and_friction — as supporting texture only]
forbidden_claims:
  - "Lilith makes you angry/dangerous/sexual"
  - "Lilith is your dark side"
  - any deterministic claims
```

---

## 7. Dignity background (proof layer)

Dignity concepts may inform the proof layer and internal analysis. They should not appear as dense doctrine in customer prose.

| Dignity | Darrow shorthand |
|---|---|
| Domicile / rulership | Function has native language — operates fluently |
| Exaltation | Function is refined and emphasized |
| Detriment | Function requires translation — works best through indirect approaches |
| Fall | Function needs conscious effort and humility to operate well |
| Peregrine | Function lacks an obvious anchor; context matters more |

---

## 8. Global forbidden claims (all planets)

```text
Any planet causes/guarantees a life event (marriage, divorce, death, wealth, illness)
Retrograde planets are cursed or broken
A planet in hard aspect guarantees hardship
A planet in easy aspect guarantees ease or success
Transiting planets predict specific events with certainty
Lucky/unlucky planet claims
Medical diagnoses from planetary placements
Compatibility verdicts from planet positions alone
```

🔒 curated Darrow rule doc · docs-only · not active in runtime · KB2-A approved · requires explicit later approval for runtime integration
