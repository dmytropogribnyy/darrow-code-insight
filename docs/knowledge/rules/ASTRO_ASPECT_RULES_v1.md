# DARROW CODE — Astro Aspect Rules v1

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
An aspect is a relationship between two symbolic functions — not a verdict about one of them.

Aspect = how two functions are in conversation with each other.

Hard aspects are not punishments.
Easy aspects are not protections.
No aspect alone causes an event or guarantees an outcome.

Interpretation rule: name the two functions first, then describe the quality of their relationship.
Never reduce to "you have a bad aspect" or "your chart is difficult."
```

---

## 2. Orb policy

Orbs define how close to exact the angular relationship must be to count.

| Aspect | Approximate orb |
|---|---|
| Conjunction / Opposition | up to 8–10° |
| Trine / Square | up to 6–8° |
| Sextile | up to 4–6° |
| Quincunx | up to 2–3° |

The tighter the orb, the more central the aspect theme is to the person's operating pattern.

Orb policy depends on which bodies are involved:
- Aspects between personal planets carry more weight than those involving slow-movers.
- Sun / Moon aspects traditionally allow wider orbs.
- Provider orb defaults should be noted when available.

---

## 3. Aspect tension groupings

| Group | Aspects | Darrow meaning |
|---|---|---|
| Harmonizing | Trine, Sextile | flow, ease, natural talent — may require activation |
| Tension-building | Square, Opposition | productive friction, growth through repeated contact |
| Fusion | Conjunction | concentration, intensity, inseparability of two functions |
| Adjustment | Quincunx | mismatch, translation required, recalibration |

---

## 4. Aspect rules

### 4.1 Conjunction (0°)

```
id:                   aspect_conjunction
layer:                aspect
angle:                0°
group:                fusion
darrow_meaning:       two symbolic functions operating as one combined force — amplified, concentrated, inseparable
strength_expression:  the combined functions act with intensity and focus; the person experiences them as deeply unified aspects of self
shadow_expression:    the functions may reinforce each other's shadow as readily as their strength; it can be difficult to see one without the other
practical_direction:  recognize the fusion; distinguish the two functions enough to choose how to apply them together rather than letting them automatically merge
safe_report_use:      [core_architecture, operating_mode, shadow_and_friction]
forbidden_claims:
  - "this conjunction causes [specific life event]"
  - "conjunction is lucky/unlucky"
sample_phrase:        >
  These two functions are fused in this chart — they operate as a single force rather than
  as separate energies. The gift is in the concentration. The challenge is seeing them
  clearly enough to work with them deliberately.
```

---

### 4.2 Opposition (180°)

```
id:                   aspect_opposition
layer:                aspect
angle:                180°
group:                tension-building
darrow_meaning:       two symbolic functions in maximum polarity — life consistently asks the person to hold both ends without collapsing into either
strength_expression:  awareness through contrast, the capacity to understand both sides of a polarity, integration through repeated encounter
shadow_expression:    oscillation between the poles without integrating them, projecting one side onto others or onto external situations, the exhaustion of sustained tension
practical_direction:  hold both ends as a genuine and productive tension rather than resolving it by choosing a side
safe_report_use:      [core_architecture, operating_mode, shadow_and_friction, relational_pattern]
forbidden_claims:
  - "opposition causes relationship conflict"
  - "this opposition will break apart"
  - deterministic event predictions
sample_phrase:        >
  This aspect describes a polarity the chart keeps returning to. These two functions pull
  in opposite directions — not to destroy each other, but to develop the capacity to hold
  both at once. Integration, not resolution, is what this asks for.
```

---

### 4.3 Square (90°)

```
id:                   aspect_square
layer:                aspect
angle:                90°
group:                tension-building
darrow_meaning:       two symbolic functions in productive friction — the repeated contact between them generates skill, drive, and capability through resistance
strength_expression:  the tension creates ambition and the energy to override obstacles; the person develops competence precisely in the area of friction
shadow_expression:    the friction becomes frustration when there is no forward channel; the drive turns back on itself when blocked
practical_direction:  find the productive outlet for the tension; squares are most alive when they are building something rather than colliding inside the person
safe_report_use:      [core_architecture, operating_mode, shadow_and_friction, professional_archetype]
forbidden_claims:
  - "this square will cause [specific problem]"
  - "square aspects are bad/difficult signs"
  - "you have hard aspects therefore..."
sample_phrase:        >
  There is a persistent friction here between two functions that do not easily agree.
  That friction is not a flaw — it is a generator. The question is whether the energy
  it produces has a direction, or whether it just creates heat.
```

---

### 4.4 Trine (120°)

```
id:                   aspect_trine
layer:                aspect
angle:                120°
group:                harmonizing
darrow_meaning:       two symbolic functions in natural resonance — they operate in the same elemental register and communicate without effort
strength_expression:  ease of operation, natural talent in the area the two functions share, a quality that may feel so effortless it goes unrecognized
shadow_expression:    because the flow requires no friction, it may be taken for granted or left undeveloped; ease without engagement can produce less than tension would
practical_direction:  notice the gift and choose to develop it deliberately; the trine is most valuable when its ease is recognized and applied rather than assumed
safe_report_use:      [core_architecture, operating_mode, executive_summary]
forbidden_claims:
  - "trine guarantees success or luck"
  - "trines protect you from difficulty"
  - "this is your strongest area"
sample_phrase:        >
  This is a place where two functions communicate naturally — where effort is reduced
  and the quality flows readily. The invitation is to take it seriously rather than
  let the ease become the reason not to develop it.
```

---

### 4.5 Sextile (60°)

```
id:                   aspect_sextile
layer:                aspect
angle:                60°
group:                harmonizing
darrow_meaning:       two symbolic functions in cooperative potential — the connection is supportive but requires activation through participation
strength_expression:  accessible talent that responds to engagement, the capacity to draw on both functions in a complementary way
shadow_expression:    the potential requires activation; it does not self-generate; without participation it remains potential only
practical_direction:  engage with the territory; the sextile responds to initiative in a way that trines do not always require
safe_report_use:      [core_architecture, operating_mode]
forbidden_claims:
  - "sextile guarantees opportunity"
  - "this will work out easily"
sample_phrase:        >
  There is a cooperative quality between these two functions — they support each other
  when engaged. The opportunity is real; it simply requires showing up for it.
```

---

### 4.6 Quincunx / Inconjunct (150°)

```
id:                   aspect_quincunx
layer:                aspect
angle:                150°
group:                adjustment
darrow_meaning:       two symbolic functions with no natural common ground — they operate in incompatible registers and require ongoing translation, not force
strength_expression:  the persistent adjustment builds a specific kind of flexibility and attentiveness; people with strong quincunxes develop nuanced calibration
shadow_expression:    frustration with the persistent mismatch, the sense that something is always slightly off, exhaustion from the ongoing translation
practical_direction:  adjust rather than resolve; the quincunx does not have a clean resolution — it has an ongoing translation practice
safe_report_use:      [shadow_and_friction, operating_mode — as texture note]
forbidden_claims:
  - "quincunx causes health problems"
  - "this is a bad aspect"
  - deterministic claims
sample_phrase:        >
  These two functions do not easily speak the same language. There is a persistent
  adjustment required between them — not a problem to fix, but a translation to maintain.
  What develops from that is a particular kind of attentiveness.
```

---

## 5. Aspect interpretation principles

### 5.1 Name the functions, not the verdict

```text
Do:   "Mars square Saturn — drive meets structure. The friction produces skill when channeled."
Avoid: "You have a hard Mars-Saturn aspect."
```

### 5.2 Distinguish harmonizing vs tension-building without hierarchy

```text
Tension aspects (square, opposition) are not worse than harmonizing aspects (trine, sextile).
They are different textures of development. Some of the most capable patterns involve significant squares.
Some of the most underused gifts involve unengaged trines.
```

### 5.3 Major pattern awareness

A stellium of aspects around one planet creates a focal point in the chart. When multiple functions converge on one, that function carries amplified weight.

A Grand Trine (three planets in trine) creates a closed circuit of ease — powerful as a gift, but it may benefit from an outer challenge to activate it.

A T-Square (two planets in opposition, both squared by a third) creates a concentrated friction at the apex planet. The apex planet is under the most pressure and often develops the most.

These patterns should be noted as texture, not as fate.

---

## 6. Global forbidden claims (all aspects)

```text
"This aspect causes [specific life event]"
"Hard aspects mean your chart is bad/damaged"
"Easy aspects mean you are lucky/protected"
"This aspect will result in [marriage / divorce / death / illness / success]"
Compatibility verdicts based on aspect comparison between two charts
Deterministic timing claims from aspects alone
"You should avoid X person because their Mars squares your Venus"
```

🔒 curated Darrow rule doc · docs-only · not active in runtime · KB2-A approved · requires explicit later approval for runtime integration
