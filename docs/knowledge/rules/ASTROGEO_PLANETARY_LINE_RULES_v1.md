# DARROW CODE — AstroGeo Planetary Line Rules v1

**Status:** curated Darrow rule doc / docs-only
**Runtime status:** not active
**Not prompt authority**
**Not schema authority**
**Not PDF/template authority**
**Not provider implementation authority**
**Not report generation authority**
**Derived from source packs in original Darrow Code language**
**Requires separate MAP0/MAP-PLACE and explicit runtime approval before use**

Source packs used: `DARROW_ASTROGEO_PLACE_SOURCE_ADDENDUM_v0_1.md`
Guard references: `BIRTH_TIME_RELIABILITY_POLICY_v1.md` · `ASTRO_PLANET_RULES_v1.md` · `ASTRO_HOUSE_RULES_v1.md`
Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md` · `PLACE_ADDON_BOUNDARY_POLICY_v1.md`

---

## 1. Core framing rule

```text
A planetary line describes where a given planet was angular (on the horizon or meridian)
at the moment of birth. In those geographic zones, that planet's symbolic function tends
to be more present, visible, or activated in the person's experience of that place.

Planetary lines are symbolic — they do not cause events.
A line is not a promise; it is a field of emphasis.
Proximity to a line increases the potential for that planet's themes to be more prominent.
```

---

## 2. Birth time gate

```text
CRITICAL: Planetary line calculations depend on the exact birth time.
If birth_time_confidence ≠ "exact", planetary lines must NOT be used.

Approximate birth time: do not produce specific lines; may note only broad hemisphere trends.
Unknown birth time: no astrocartography content at all.
```

---

## 3. Angle meanings (applies to all planetary lines)

Every planetary line operates through one of four angles. The angle determines the quality of the activation.

| Angle | Darrow meaning | PLACE use |
|---|---|---|
| ASC (Ascendant) | identity interface — how the person shows up and is received in that place | "how you present yourself there; the social and physical interface of self" |
| DSC (Descendant) | partnership and mirror field — who the person tends to meet and what relationships reflect | "the quality of connection and encounter you attract there" |
| MC (Midheaven) | public role and vocation visibility — how ambition and professional purpose become visible | "how work and public contribution are amplified or challenged there" |
| IC (Imum Coeli) | roots, home, emotional base — how the place feels as an inner anchor | "how this place supports or disturbs the sense of home and inner belonging" |

**Hard rule: angles require exact birth time at all times. See `BIRTH_TIME_RELIABILITY_POLICY_v1.md`.**

---

## 4. Planetary line rules

### 4.1 Sun line

```
id:                   place_sun_line
planet:               Sun
darrow_place_motif:   visibility and authorship — the place amplifies self-expression, leadership quality, and the experience of being genuinely seen
strength_expression:  creative confidence, sense of vitality and purpose, environments where the identity feels most alive and recognized
friction_expression:  ego pressure when visibility becomes performance demand, fatigue from sustained exposure, difficulty retreating into private life
practical_direction:  use Sun-line environments for phases requiring visibility, leadership, or creative output; not ideal for extended retreat or private restoration
safe_report_use:      [PLACE add-on — visibility/career resonance section; CORE — archetype reference only if strongly supported]
forbidden_claims:
  - "this city guarantees success or fame"
  - "you will be a leader there"
  - "your career will advance in X"
sample_phrase:        >
  In regions near the Sun line, the identity tends to feel more visible — the person
  is more easily seen, more recognized, more present as an authoring force. This is
  not a guarantee of success; it is a field where the authoring quality operates with
  fewer filters.
```

---

### 4.2 Moon line

```
id:                   place_moon_line
planet:               Moon
darrow_place_motif:   belonging and emotional home — the place activates the inner rhythm, care, memory, and the experience of genuine emotional rest
strength_expression:  deeper sense of belonging and emotional attunement, ease of care and nourishment, places that feel instinctively like home
friction_expression:  emotional intensity, heightened mood sensitivity, over-attachment to the place or its community, difficulty leaving once settled
practical_direction:  Moon-line environments support recovery, family life, creative gestation, and emotionally rich living; less suited for high-performance exposure phases
safe_report_use:      [PLACE add-on — emotional/home resonance section; CORE — archetype reference for recovery or home patterns]
forbidden_claims:
  - "this city will make you feel at home guaranteed"
  - "fertility/family outcomes from Moon line"
  - "emotional healing guaranteed"
sample_phrase:        >
  Near the Moon line, the emotional register tends to deepen — the place may feel
  instinctively familiar, nurturing, or like a kind of home that was not expected.
  That resonance is symbolic; it does not mean the city provides what home means
  without the person also building it.
```

---

### 4.3 Mercury line

```
id:                   place_mercury_line
planet:               Mercury
darrow_place_motif:   communication and movement — the place activates cognitive agility, learning, networks, and the exchange of language and ideas
strength_expression:  ease of connection, intellectual stimulation, commercial mobility, strong learning and information environments
friction_expression:  nervous overload from the volume of stimulation, scattered attention, difficulty resting the mind, restlessness
practical_direction:  Mercury-line environments suit short-term intellectual phases, writing projects, learning immersions, and commercial activity; less suited for deep solitude
safe_report_use:      [PLACE add-on — learning/career/communication resonance; CORE — archetype reference for cognitive-style environments]
forbidden_claims:
  - "business success guaranteed in this city"
  - "you will find your language/career there"
  - "Mercury line guarantees communication skill"
sample_phrase:        >
  In Mercury-line zones, the mind tends to be more active — more stimulated, more
  in conversation with the environment. Cities that fit this archetype tend to be
  information-rich, mobile, commercially alive. That suits some phases; others
  need the quiet that Mercury-line environments rarely provide.
```

---

### 4.4 Venus line

```
id:                   place_venus_line
planet:               Venus
darrow_place_motif:   beauty and relational ease — the place activates the aesthetic register, social grace, and the experience of feeling valued and attractive
strength_expression:  ease of connection, beauty in the environment, social warmth, receptivity to creative and relational experience
friction_expression:  indulgence, comfort that avoids necessary difficulty, dependency on social approval, aesthetic overstimulation
practical_direction:  Venus-line environments suit creative work, relationship repair, pleasure-oriented travel, and phases needing aesthetic nourishment; not ideal for hard-work or discipline phases
safe_report_use:      [PLACE add-on — love/social/creative resonance section; CORE — archetype reference for beauty/relational environments]
forbidden_claims:
  - "you will find love in this city"
  - "this place guarantees relationships"
  - "Venus line attracts a partner"
sample_phrase:        >
  Near the Venus line, the relational and aesthetic register tends to open more easily.
  The place may feel more beautiful, more socially welcoming, more oriented toward
  pleasure and connection. That does not mean the city delivers love; it means the
  field for those qualities is less obstructed.
```

---

### 4.5 Mars line

```
id:                   place_mars_line
planet:               Mars
darrow_place_motif:   action and assertion — the place activates drive, directional energy, sexuality, and the willingness to initiate and compete
strength_expression:  physical vitality, competitive edge, courage, directional initiative, high-output work environments
friction_expression:  conflict, impatience, burnout from sustained high output, heat that exceeds the available fuel, tension in close relationships
practical_direction:  Mars-line environments suit high-intensity work phases, athletic pursuits, and initiating action; extended living there can be draining without rest and recovery practices
safe_report_use:      [PLACE add-on — action/career/competitive resonance; CORE — archetype reference for high-drive environments]
forbidden_claims:
  - "this place will make you powerful/strong"
  - "danger/conflict guaranteed"
  - "physical outcomes from Mars line"
sample_phrase:        >
  In Mars-line zones, energy tends to be higher — the place activates drive and
  assertiveness. That is useful in phases that require output and courage. The
  friction is that the same activation makes rest and softness harder to access.
```

---

### 4.6 Jupiter line

```
id:                   place_jupiter_line
planet:               Jupiter
darrow_place_motif:   expansion and meaning — the place activates the horizon, generosity of vision, opportunity fields, and the sense that more is possible
strength_expression:  encounters with growth, education, cultural richness, philosophical depth, openness to possibility
friction_expression:  excess, overpromising, inflation of what is actually available, difficulty accepting the limits of what a place can provide
practical_direction:  Jupiter-line environments suit phases of learning, expansion, study, spiritual orientation, and opening to new paradigms; not ideal for strict discipline or reduction phases
safe_report_use:      [PLACE add-on — learning/spiritual/expansion resonance; CORE — archetype reference for expansive or teaching-oriented environments]
forbidden_claims:
  - "luck guaranteed in this city"
  - "wealth comes from Jupiter line"
  - "this place will expand your success"
sample_phrase:        >
  Near the Jupiter line, the field tends to feel more open — more possibility, more
  cultural richness, more encounters with ideas and people that expand the horizon.
  That openness is a genuine quality of certain environments. It does not guarantee
  that everything sought will be found there.
```

---

### 4.7 Saturn line

```
id:                   place_saturn_line
planet:               Saturn
darrow_place_motif:   structure and earned authority — the place demands more, asks for sustained effort, and rewards mastery rather than ease
strength_expression:  serious work, disciplined output, long-term building, professional respect earned through consistent effort
friction_expression:  heaviness, isolation, restriction, environments that demand without giving back, emotional austerity that depletes rather than develops
practical_direction:  Saturn-line environments suit phases of serious professional building, mastery development, and long-term ambition; not ideal for healing, rest, or ease-seeking phases
safe_report_use:      [PLACE add-on — career/professional/structure resonance; CORE — archetype reference for demanding or achievement-oriented environments]
forbidden_claims:
  - "career guaranteed in this city"
  - "this place will punish or restrict you"
  - "Saturn line causes isolation or failure"
sample_phrase:        >
  In Saturn-line zones, the field asks more of the person — more discipline,
  more endurance, more sustained effort before the environment responds. That is
  not a punishment; it is a terrain. Some of the most significant professional
  development happens in exactly this kind of demanding field.
```

---

### 4.8 Uranus line

```
id:                   place_uranus_line
planet:               Uranus
darrow_place_motif:   disruption and reinvention — the place breaks conventional patterns and activates originality, surprise, and the pressure to step outside the inherited form
strength_expression:  creative breakthrough, liberation from outdated structures, encounters with innovation and unconventional thinking
friction_expression:  instability, alienation, unpredictability that becomes exhausting, difficulty sustaining a long-term anchor
practical_direction:  Uranus-line environments suit phases of conscious reinvention, creative experimentation, and breaking from prior constraints; not ideal for long-term stability or quiet consolidation
safe_report_use:      [PLACE add-on — reinvention/creative/innovation resonance; CORE — archetype reference for disruption or change-oriented environments]
forbidden_claims:
  - "breakthrough guaranteed in this city"
  - "this place will liberate you"
  - "Uranus line causes chaos or instability"
sample_phrase:        >
  Near the Uranus line, the environment tends to be less predictable — more charged
  with novelty, disruption, and the energy of things not yet settled. For reinvention
  phases, that is valuable. For phases needing consolidation, it can feel like the
  ground never quite steadies.
```

---

### 4.9 Neptune line

```
id:                   place_neptune_line
planet:               Neptune
darrow_place_motif:   imagination and dissolution — the place softens boundaries, activates the dream register, and amplifies creative, spiritual, and compassionate experience
strength_expression:  creative inspiration, artistic immersion, spiritual openness, the experience of beauty and surrender to something larger
friction_expression:  confusion when dissolving the ordinary fails to build something new, escapism, weak boundaries, difficulty distinguishing the imagined from the actual
practical_direction:  Neptune-line environments suit creative retreats, spiritual work, artistic immersion, and intentional surrender; not ideal for practical execution or sharp decision-making phases
safe_report_use:      [PLACE add-on — spiritual/creative/retreat resonance; CORE — archetype reference for dreamy or spiritually resonant environments]
forbidden_claims:
  - "spiritual healing guaranteed in this place"
  - "psychic experiences guaranteed"
  - "Neptune line causes confusion or addiction"
sample_phrase:        >
  In Neptune-line zones, the ordinary structures of time and identity tend to become
  more permeable. For creative or spiritual phases, that porousness is exactly what
  is needed. It asks the person to have something to give form to — otherwise the
  dissolution produces drift rather than vision.
```

---

### 4.10 Pluto line

```
id:                   place_pluto_line
planet:               Pluto
darrow_place_motif:   depth and transformation — the place amplifies psychological intensity, power dynamics, and the pressure to undergo genuine change
strength_expression:  psychological depth, access to power and regenerative forces, the capacity to confront what has been hidden and use it productively
friction_expression:  control dynamics, obsession, crisis that goes too deep too fast, encounters with concentrated power that require strong boundaries
practical_direction:  Pluto-line environments suit phases of intentional transformation, deep creative or psychological work, and confronting unresolved depth; not casual living or ease-seeking environments
safe_report_use:      [PLACE add-on — transformation/depth resonance; CORE — archetype reference for intense or regenerative environments]
forbidden_claims:
  - "this place will transform you"
  - "danger or trauma guaranteed"
  - "Pluto line causes crisis or death"
sample_phrase:        >
  Near the Pluto line, what is not yet resolved tends to surface more readily. The
  place amplifies depth and intensity. That is valuable in phases of deliberate
  transformation and not comfortable in phases needing rest or gentleness.
```

---

### 4.11 Chiron line (conditional / supporting)

```
id:                   place_chiron_line
layer:                planet
condition:            supporting signal only; not primary PLACE interpretation
darrow_place_motif:   wound-to-wisdom territory — the place may activate old patterns of difficulty that, when engaged consciously, become transferable guidance
strength_expression:  mentoring capacity, artistic expression from difficulty, environments oriented toward healing in the Darrow sense (not medical healing)
friction_expression:  wound activation that is not yet ready for integration, sensitivity to old patterns
safe_report_use:      [PLACE add-on — as supporting texture only]
forbidden_claims:
  - "this place will heal you"
  - "Chiron line guarantees healing or repair"
  - medical healing claims
```

---

### 4.12 North Node line (conditional / supporting)

```
id:                   place_north_node_line
layer:                planet
condition:            supporting signal only; not primary PLACE interpretation
darrow_place_motif:   directional pull — the place may feel simultaneously unfamiliar and strangely significant, as though it is pulling the person toward unexplored but important territory
safe_report_use:      [PLACE add-on — as light directional texture only]
forbidden_claims:
  - "this is your karmic / destined place"
  - "soul purpose guaranteed in this city"
  - any karmic certainty claims
```

---

## 5. Combining lines and angles

The richest PLACE interpretation combines:

```text
1. Which planet(s) are angular near this location
2. Which angle (ASC / DSC / MC / IC) the planet operates through
3. The relocated chart house emphasis at this location
4. The user's stated goal and current life phase
5. The practical reality check (visa, language, work, family, cost, safety)
```

Single-line readings should be held lightly. Convergence across multiple lines, angles, and relocated chart signals justifies stronger emphasis.

---

## 6. Global forbidden claims (all planetary lines)

```text
"This city guarantees love / success / money / healing / safety"
"This line is lucky / unlucky"
"Avoid this city because it is bad for your chart"
"Your best city is X"
"You will thrive / suffer there"
Planetary line claims without exact birth time
Medical, legal, financial, or immigration advice from line placement
Compatibility claims from comparing two people's planetary lines
```

🔒 curated Darrow rule doc · docs-only · not active in runtime · KB2-PLACE approved · requires MAP0/MAP-PLACE and explicit runtime approval
