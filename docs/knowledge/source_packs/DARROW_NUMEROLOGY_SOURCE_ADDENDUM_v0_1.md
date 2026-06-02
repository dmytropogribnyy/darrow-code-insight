# DARROW CODE — Numerology Knowledge Source Addendum v0.1

**Status:** working research/KB draft, not runtime implementation.  
**Purpose:** capture what can be safely extracted from numerology sources as conceptual/background material, then translate it into original Darrow Code rules.

---

## 0. Source-use rule

Use the sources below as **research/background**, not as copy text. The product should not reproduce their wording, examples, proprietary reports, paid-report structure, or branded claims. Darrow Code uses the concepts to build original rules:

`source concept → Darrow trigger → Darrow meaning → strength → risk → practical direction → forbidden claims`

---

## 1. Reviewed source matrix

| Source | Useful extraction | Product-use status |
|---|---|---|
| Astro-Seek Numerology | Life Path, Birthday Number, Name Numerology, Personal Year calculators and conceptual categories | Good calculator/category reference; do not copy reports |
| Numerology.com | Core Numbers framework, Life Path, Birthday, Expression/Destiny, Personality, Master Numbers, number 1–9 overview | Good conceptual reference; do not copy prose/paid material |
| Numerologist.com | Confirms Life Path, master numbers 11/22/33, name calculators, pattern-language framing | Good cross-check; avoid marketing copy |
| Horoscope.com | Manual Life Path, Destiny/Expression, Pythagorean letter table, Soul Number/Soul Urge explanation | Good calculation cross-check |
| Token Rock | Pythagorean vs Chaldean methods, core numbers, Heart’s Desire, Portrait/Personality, Life Path examples, Master Numbers | Good method/cross-check; do not copy interpretations |
| General historical background | Pythagorean method, gematria/isopsephy/abjad traditions | Background only; Darrow uses modern Western Pythagorean-style system by default |

---

## 2. Approved Darrow numerology layers

### 2.1 CORE-safe layers

These can be used in CORE v4.1 when data is available:

| Layer | Input required | CORE use |
|---|---|---|
| Life Path | Date of birth | Primary life-learning / operating lesson |
| Birthday Number | Day of month | Natural gift / raw talent tone |
| Personal Year | Birth month + birth day + current year | Current-cycle climate, not prediction |
| Expression / Destiny | Full birth name | Talents, strengths, challenge-style |
| Soul Urge / Heart’s Desire | Full birth name vowels | Inner motivation / private desire pattern |
| Personality / Portrait | Full birth name consonants | Social impression / outer mask |
| Cornerstone | First letter of first name | Initial approach to life / first reaction style |
| Capstone | Last letter of first name | Closure/follow-through style |
| First vowel | First vowel in first name | Private inner motivation accent |

### 2.2 Gated / future layers

| Layer | Status | Reason |
|---|---|---|
| Compatibility numerology | Future LOVE only | Needs curated relationship rules; avoid shallow matching |
| House/address number | Future PLACE/STYLE optional | Too gimmicky for CORE now |
| Angel numbers | Blocked for CORE | Too generic/viral; not birth-code based |
| Karmic debt numbers | Future optional | Needs careful non-fear-based policy |
| Pinnacle cycles / life cycles | Future YEAR | Needs clean cycle engine and source policy |
| Chaldean method | Research only | Different alphabet model; do not mix with default Pythagorean without a decision |

---

## 3. Calculation decisions — Darrow v0.1

### 3.1 Default method

Use a **Western Pythagorean-style letter mapping** by default for English/Latin-script names. Horoscope.com gives the common A-Z mapping and Token Rock states that Pythagorean is the most commonly used Western method.

### 3.2 Pythagorean letter table

| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|
| A | B | C | D | E | F | G | H | I |
| J | K | L | M | N | O | P | Q | R |
| S | T | U | V | W | X | Y | Z | |

### 3.3 Life Path calculation policy

**Recommended Darrow default:** grouped reduction method.

1. Convert birth month to number.
2. Reduce month, day, and year groups separately.
3. Preserve Master Numbers 11, 22, 33 when they appear as final core values.
4. Sum the groups.
5. Reduce to 1–9 unless final result is 11, 22, or 33.
6. Store calculation trace for debugging/proof tags.

```ts
function reduceNumber(n: number, preserveMasters = true): number {
  if (preserveMasters && [11, 22, 33].includes(n)) return n;
  while (n > 9) n = String(n).split('').reduce((a, d) => a + Number(d), 0);
  return n;
}

function lifePath(month: number, day: number, year: number): { value: number; trace: string } {
  const m = reduceNumber(month);
  const d = reduceNumber(day);
  const y = reduceNumber(String(year).split('').reduce((a, d) => a + Number(d), 0));
  const total = m + d + y;
  return { value: reduceNumber(total), trace: `${m}+${d}+${y}=${total}` };
}
```

**Note:** sources vary on whether to preserve only 11/22 or also 33, and whether to preserve master numbers inside intermediate groups. Darrow should keep a single method and document it.

### 3.4 Birthday Number

Use the raw day of month, 1–31. Optionally store a reduced root as `birthday_root`, but do not replace the raw Birthday Number.

### 3.5 Expression / Destiny

Use the full birth name. Sum all letters using the Pythagorean table. Reduce to 1–9 or 11/22/33.

### 3.6 Soul Urge / Heart’s Desire

Use vowels from the full birth name. Reduce to 1–9 or 11/22/33.

### 3.7 Personality / Portrait

Use consonants from the full birth name. Reduce to 1–9 or 11/22/33.

### 3.8 Personal Year

Use month + day + current calendar year digits. Reduce to 1–9. Use as current-cycle climate, not prediction.

---

## 4. Darrow original number meanings v0.1

| Number | Darrow meaning | Strength expression | Shadow expression | Practical direction |
|---:|---|---|---|---|
| 1 | Self-initiation and authorship | leadership, originality, courage to begin | isolation, force, impatience | initiate, then review impact |
| 2 | Relational intelligence and attunement | sensitivity, mediation, cooperation | dependency, hesitation, hurt sensitivity | listen without losing center |
| 3 | Expression and creative circulation | speech, imagination, social warmth | scattering, performance, unfinished loops | create rhythm, not just sparks |
| 4 | Structure, craft, and reliability | discipline, order, practical building | rigidity, heaviness, fear of change | build a base that can also breathe |
| 5 | Movement, change, and experience | freedom, adaptability, curiosity | instability, excess, avoidance | choose change with a container |
| 6 | Care, responsibility, and harmony | protection, loyalty, beauty, service | overgiving, control, guilt | care without carrying everyone |
| 7 | Inner knowledge and depth-search | analysis, solitude, spiritual/intellectual depth | withdrawal, suspicion, over-isolation | trust the signal, then test it |
| 8 | Power, value, and material command | executive force, resource sense, ambition | pressure, domination, over-identification with results | lead with responsibility, not control |
| 9 | Completion, compassion, and wider meaning | wisdom, service, creative compassion | martyrdom, diffusion, emotional exhaustion | release what is complete and serve cleanly |
| 11 | Heightened signal and visionary perception | inspiration, intuition, subtle leadership | nervous overload, idealistic pressure | ground the signal before sharing it |
| 22 | Master builder / large-scale structure | vision made practical, systems, legacy | burden, perfectionism, domination by the plan | build in stages, not as a life sentence |
| 33 | Service-heart / teaching through compassion | healing presence, uplift, guidance | savior complex, emotional over-responsibility | serve without disappearing |

---

## 5. Number role mapping in Darrow reports

Same number, different role:

| Number type | Interpretive question | Example use |
|---|---|---|
| Life Path | What life lesson/path is repeated? | “Your life keeps asking you to…” |
| Birthday Number | What natural gift came online early? | “You may reach for this instinctively…” |
| Expression | What capability wants to be used? | “Your name-code points to a talent for…” |
| Soul Urge | What privately motivates you? | “Underneath the visible behavior, you want…” |
| Personality | What do others meet first? | “People may first experience you as…” |
| Personal Year | What is the current climate? | “This year favors…” |
| Cornerstone | How do you begin? | “Your first move is often…” |
| Capstone | How do you close/finish? | “You complete things by…” |
| First Vowel | What inner motive quietly drives the name? | “The private reason underneath…” |

---

## 6. Darrow report integration

### CORE v4.1

Use numerology in `numerology_code`, `core_architecture`, `operating_mode`, `executive_summary`, and possibly `next_step`.

Allowed wording:

- “As a symbolic code, your Life Path points to…”
- “This does not override the chart; it supports the same pattern from another angle.”
- “The number is useful when it explains a repeated life rhythm, not when it becomes a label.”

Avoid:

- “This number determines your fate.”
- “You are guaranteed to…”
- “This number is lucky/unlucky.”
- “Your name proves…”
- “You must change your name.”

### YEAR add-on

Use Personal Year, Personal Month, Personal Day later only after cycle engine is defined.

### LOVE add-on

Use compatibility only later, after curated relationship numerology rules are written.

### STYLE / PLACE

Do not use house/address numerology yet. Future optional layer only.

---

## 7. Source notes for internal SOURCE_LOG

- Astro-Seek: useful for categories/calculators: Life Path, Birthday Number, Name Numerology, Personal Year.
- Numerology.com: useful for Core Numbers, Life Path importance, Expression/Destiny, Personality, Master Numbers, and 1–9 overview.
- Numerologist.com: useful cross-check for birthday/name pattern language and Life Path calculation examples.
- Horoscope.com: useful for manual Life Path calculation, Destiny/Expression name-number calculation, Pythagorean A-Z mapping, and Soul Number definition.
- Token Rock: useful for Pythagorean vs Chaldean comparison, Life Path examples, Heart’s Desire/Portrait categories, Master Numbers framing.

---

## 8. Implementation backlog

1. `docs/knowledge/NUMEROLOGY_RULES_v1.md` — create from this addendum.
2. `src/lib/knowledge/numerology.ts` — future rule mapping, not now.
3. Runtime fields to define later:
   - `life_path`
   - `birthday_number`
   - `expression_number`
   - `soul_urge_number`
   - `personality_number`
   - `personal_year`
   - `cornerstone_letter`
   - `capstone_letter`
   - `first_vowel`
   - `calculation_trace`
4. Add tests for calculation consistency before runtime integration.

