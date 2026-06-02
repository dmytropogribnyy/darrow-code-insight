# DARROW CODE — Western Zodiac / Sign Archetype Source Addendum v0.1

**Status:** research appendix / source-pack draft  
**Purpose:** capture source-review notes and safe-use policy for Western zodiac signs, sign archetypes, tropical/sidereal distinction, sign-vs-constellation caution, and popular sign-personality sources.  
**Runtime status:** not active. This is future **KB1 docs-only** material, not prompt/runtime/schema/template logic.

---

## 0. Core rule

Western zodiac material may be used as symbolic / archetypal background, but Darrow Code must not reduce a person to a sun-sign label.

Allowed:
- zodiac sign as symbolic tone;
- sign element / modality / polarity;
- sign ruler as interpretive context;
- sign archetype as one layer in a multi-layer pattern;
- historical / astronomical distinction between signs and constellations;
- original Darrow Code meanings and phrasing.

Not allowed:
- copying sign descriptions from lifestyle sites;
- “You are Aries, therefore…” openings;
- deterministic personality claims;
- compatibility guarantees;
- lucky color / lucky number / gemstone certainty;
- scientific claims that astrology is empirically proven;
- confusion between tropical signs and physical constellations;
- adding Ophiuchus as a Darrow CORE sign without a deliberate product decision.

Darrow Code wording rule:

```text
Sign = symbolic mode / operating tone.
Planet = function.
House = life area, only if birth time reliable.
Aspect = relationship between functions.
No sign alone determines the person.
```

---

## 1. Reviewed source matrix

| Source | Type | Useful extraction | Darrow Code use | Risk / restriction |
|---|---|---|---|---|
| Wikipedia — Astrological sign | Broad overview / editable reference | 12 signs as 30-degree sectors, First Point of Aries, Babylonian/Hellenistic background, tropical/sidereal distinction, precession/Ophiuchus caution | General orientation only; cross-check with stronger sources | Editable source; do not rely as sole authority |
| Britannica — Zodiac | Encyclopedic reference | Concise historical/factual grounding for zodiac as belt/sign system | Source-log / background | Good overview, but not interpretive rule source |
| TravelChinaGuide — Western Zodiac | Popular astrology guide | Common market taxonomy: dates, element, ruler, strength/weakness, lucky color/number/jewelry, compatibility | Market/SEO/reference only; useful for claims-to-block | Contains lucky/compatibility/jewelry claims; do not copy |
| Allure — Zodiac sign traits | Modern lifestyle astrology | Contemporary human-readable sign language, modern style/personality framing | Tone/market awareness only | Strong personality claims; do not copy prose |
| Wikipedia — Western astrology | Broad overview / editable reference | Western astrology as horoscopic system; popular culture reduction to sun-sign astrology; historical links to Hellenistic/Babylonian traditions | Background/source-log only | Editable source; contains science-status framing; use carefully |
| Weber State physics page — Astrological vs Astronomical Zodiac | Astronomy education resource | Side-by-side difference between astrological sign dates and astronomical constellation dates; Ophiuchus not recognized as sign by astrologers | Important caution for sign-vs-constellation policy | Educational table only; do not convert to runtime astrology |
| Novel Factory — Western Zodiac Character Archetypes | Writing/archetype article | Zodiac as character-writing archetypes; positive/negative trait structure | Useful for archetype-library format inspiration only | Writing tool / commercial source; do not copy sign summaries |
| Emma.ca — Zodiac signs guide | Popular lifestyle guide | Market overview: origins, dates, sign summaries, relationships | Market/SEO reference only | Contains broad traits and compatibility; not authority |
| Skyscript / Deborah Houlding — Development of the Zodiac | Traditional astrology / history article | High-value historical framing: zodiac development, ecliptic, 12 equal 30-degree signs, constellation-vs-sign distinction | Strong research background; concepts only | Copyrighted article; do not reproduce text |
| Skyscript sign-symbolism pages | Traditional sign symbolism | Shows deep symbolic derivation from season, myth, ruler, element | Research/style inspiration for depth | Do not copy prose or structure wholesale |
| IAU / constellation boundary references | Astronomy reference | Modern constellations are sky regions, not equal zodiac signs; useful for Ophiuchus/constellation caution | Astronomy/source-policy anchor | Do not use as astrology interpretation source |

---

## 2. Key source observations

### 2.1 Astrological signs are not the same thing as constellations

Western astrological signs are traditionally treated as twelve equal 30-degree divisions of the ecliptic / zodiacal circle. Physical constellations are unequal sky regions and do not align one-to-one with tropical signs.

Darrow policy:

```text
Never explain Western zodiac signs as if they are identical to the physical constellations.
Use “sign” for the symbolic 30-degree zodiac division.
Use “constellation” only for astronomy or mythic background.
```

### 2.2 Ophiuchus caution

Astronomically, the Sun passes through Ophiuchus as one of the ecliptic constellations. This does not automatically make Ophiuchus a standard Western astrological sign.

Darrow policy:

```text
Do not add Ophiuchus to CORE zodiac logic.
If mentioned at all, treat it as an astronomy/constellation discussion, not as a default Darrow sign.
```

### 2.3 Sun-sign reduction is too weak for Darrow Code

Popular sources often reduce zodiac reading to date-of-birth sun sign personality. Darrow Code should be richer:

```text
Sun sign = identity tone.
Moon sign = emotional rhythm.
Ascendant = social interface, only if birth time reliable.
Dominant sign / stellium = amplification.
House placement = life area, only if birth time reliable.
Aspect pattern = functional relationship.
```

---

## 3. Source-quality classification

| Source class | Examples | Use |
|---|---|---|
| Historical / traditional astrology | Skyscript, Ptolemy/Tetrabiblos background, traditional dignity texts | Conceptual grounding; no copied prose |
| Encyclopedic overview | Britannica, Wikipedia | Background and terminology check |
| Astronomy caution | Weber State physics, IAU constellation references, Ophiuchus discussions | Prevent sign-vs-constellation confusion |
| Lifestyle/popular astrology | Allure, Emma.ca, TravelChinaGuide | Market/tone awareness; claims-to-avoid |
| Creative writing archetypes | Novel Factory | Archetype-format inspiration; not astrology authority |
| SEO/date calculators | TravelChinaGuide and similar | Date/ruler/element comparison; no runtime authority |

---

## 4. Darrow zodiac rule model

Every sign should be encoded in Darrow terms as:

```ts
type DarrowZodiacRule = {
  sign: string;
  element: "fire" | "earth" | "air" | "water";
  modality: "cardinal" | "fixed" | "mutable";
  polarity: "yang_active" | "yin_receptive";
  traditional_ruler: string;
  modern_ruler?: string;
  darrow_meaning: string;
  strength_expression: string;
  shadow_expression: string;
  practical_direction: string;
  safe_report_use: string[];
  forbidden_claims: string[];
};
```

---

## 5. Darrow zodiac archetype seeds v0.1

These are original Darrow Code interpretations, not copied source descriptions.

| Sign | Element / modality | Darrow meaning | Strength expression | Shadow expression | Practical direction |
|---|---|---|---|---|---|
| Aries | Fire / Cardinal | ignition before certainty | courage, initiative, first move | impatience, reactive exits, force | act, then check impact |
| Taurus | Earth / Fixed | stabilization through body, value, rhythm | endurance, consistency, taste | attachment, slow release, comfort trap | build value without freezing |
| Gemini | Air / Mutable | reality understood through language and movement | adaptability, perception, translation | fragmentation, nervous over-processing | focus the signal |
| Cancer | Water / Cardinal | emotional memory as intelligence | care, protection, inner radar | absorption, defense, mood-based retreat | protect without closing |
| Leo | Fire / Fixed | visible authorship of identity | warmth, leadership, creative presence | pride wound, performance pressure | lead from heart, not applause |
| Virgo | Earth / Mutable | refinement as service and self-respect | precision, repair, useful intelligence | self-criticism, control, endless fixing | improve without shrinking |
| Libra | Air / Cardinal | relational calibration | diplomacy, beauty, balance | pleasing, indecision, self-erasure | choose without abandoning harmony |
| Scorpio | Water / Fixed | hidden pressure and truth-reading | depth, loyalty, transformation | suspicion, control, guarded intimacy | let truth move without domination |
| Sagittarius | Fire / Mutable | meaning through horizon | vision, teaching, expansion | excess, abstraction, escape | aim the arrow before release |
| Capricorn | Earth / Cardinal | structure and earned authority | mastery, endurance, responsibility | heaviness, over-duty, emotional austerity | build with life still inside it |
| Aquarius | Air / Fixed | pattern recognition beyond convention | originality, systems view, future logic | detachment, alienation, rigidity of freedom | humanize the system |
| Pisces | Water / Mutable | permeability to symbol, mood, and compassion | imagination, empathy, spiritual softness | diffusion, boundary loss, escape | give form to the vision |

---

## 6. Sign mechanics table

Use as conceptual reference. Dates may vary slightly by year and source; runtime should rely on provider chart data rather than hard-coded date tables.

| Sign | Symbol | Tropical longitude | Element | Modality | Traditional ruler | Modern ruler |
|---|---|---:|---|---|---|---|
| Aries | Ram | 0°–29°59′ | Fire | Cardinal | Mars | — |
| Taurus | Bull | 30°–59°59′ | Earth | Fixed | Venus | — |
| Gemini | Twins | 60°–89°59′ | Air | Mutable | Mercury | — |
| Cancer | Crab | 90°–119°59′ | Water | Cardinal | Moon | — |
| Leo | Lion | 120°–149°59′ | Fire | Fixed | Sun | — |
| Virgo | Maiden | 150°–179°59′ | Earth | Mutable | Mercury | sometimes Ceres in modern/minority systems |
| Libra | Scales | 180°–209°59′ | Air | Cardinal | Venus | minority modern assignments exist |
| Scorpio | Scorpion | 210°–239°59′ | Water | Fixed | Mars | Pluto |
| Sagittarius | Archer | 240°–269°59′ | Fire | Mutable | Jupiter | — |
| Capricorn | Goat / Sea-Goat | 270°–299°59′ | Earth | Cardinal | Saturn | — |
| Aquarius | Water-Bearer | 300°–329°59′ | Air | Fixed | Saturn | Uranus |
| Pisces | Fish | 330°–359°59′ | Water | Mutable | Jupiter | Neptune |

Policy:
- Prefer traditional rulers for rule consistency.
- Modern rulers may be used as secondary symbolic overlay.
- Do not introduce minority rulerships into production without product decision.

---

## 7. What to extract vs block from popular sources

### Extract safely

Popular sources are useful for:
- common user expectations around signs;
- vocabulary people recognize;
- basic polarity of strengths / risks;
- SEO language to avoid sounding too technical;
- trend awareness around compatibility/colors/stones.

### Block

Do not use:
- “lucky number”;
- “lucky color”;
- gemstone certainty;
- best-match compatibility;
- celebrity lists as proof;
- claims that a sign causes jealousy, success, attractiveness, illness, wealth, or relationship outcome;
- exact prose from sign descriptions.

---

## 8. Darrow report integration

### CORE v4.1 — allowed later

Allowed:
- sign as symbolic tone;
- Sun/Moon/Ascendant if data reliable;
- element/modality balance;
- sign ruler as function emphasis;
- sign archetype only as one layer among many;
- sign convergence with numerology/BaZi/archetype.

Example:

```text
The Aries layer does not make you “an aggressive person.” In this chart, it shows the ignition point: the part of you that moves before certainty arrives.
```

### CORE v4.1 — avoid

Avoid:
- “As a Leo, you are…”
- “Your zodiac sign proves…”
- “Your best match is…”
- “Your lucky color/stone is…”
- “Ophiuchus changed your sign.”
- “NASA changed astrology.”

---

## 9. Future docs split

During KB1 docs-only phase, this appendix can become:

```text
docs/knowledge/ASTRO_ZODIAC_SOURCE_ADDENDUM_v1.md
docs/knowledge/ASTRO_ZODIAC_RULES_v1.md
docs/knowledge/ASTRO_SIGN_ARCHETYPE_RULES_v1.md
docs/knowledge/ASTRO_SIGN_VS_CONSTELLATION_POLICY_v1.md
docs/knowledge/SOURCE_LOG.md
```

Do not wire into runtime until a later explicit phase defines:
- source priority;
- tropical vs sidereal handling;
- whether sign archetypes are prompt-only or structured rule data;
- whether Ophiuchus is mentioned only in FAQ/source policy.

---

## 10. Source-log draft notes

- Britannica provides a useful concise overview of zodiac as an encyclopedic topic and should be used for background rather than interpretive rules.
- Wikipedia astrological sign and Western astrology pages are useful as broad orientation for 12 signs, 30-degree sectors, Babylonian/Hellenistic background, precession, tropical/sidereal distinction, and sun-sign reduction, but must be cross-checked because Wikipedia is editable.
- Skyscript / Deborah Houlding is a high-value traditional astrology background source for the history and symbolic development of signs. Use concepts only; do not reproduce article text.
- Weber State physics page is useful for explaining why astrological sign dates differ from astronomical constellation dates and why Ophiuchus is not automatically a Western sign.
- TravelChinaGuide, Allure, Emma.ca, and similar popular pages are useful for market vocabulary and user expectations, but they contain compatibility, lucky color/number/jewelry, or broad personality claims that Darrow Code should not copy.
- Novel Factory is useful only as an example of zodiac archetypes as character-writing tools. It is not an astrology authority.

---

## 11. Additional resources to inspect later

Suggested future cross-check sources:

```text
- Ptolemy, Tetrabiblos — classical source background, public-domain translations only
- Manilius, Astronomica — classical zodiac/body/sign symbolism background
- Skyscript sign pages for all 12 signs — concept extraction only
- The Astrology Podcast episodes / transcripts on signs and sect/rulers — modern expert overview, no copying
- AstroWiki or Kepler College educational pages — terminology/course-coverage check
- IAU constellation references — astronomy boundary/source-policy caution
- NASA / Space Place archived zodiac-constellation articles — astronomy caution if accessible
```

---

## 12. Claude guard note

Do not give this addendum to Claude during B2.1/B2.2/B3/B4 technical phases.

Future KB1 only:

```md
This Western Zodiac / Sign Archetype addendum is docs-only research material.
Do not modify runtime, schema, prompts, PDF template, generation pipeline, routes, Stripe, email, auth, customer logic, or provider integrations.
Do not activate new zodiac rules.
Do not add Ophiuchus to CORE logic.
Do not create deterministic claims.
```
