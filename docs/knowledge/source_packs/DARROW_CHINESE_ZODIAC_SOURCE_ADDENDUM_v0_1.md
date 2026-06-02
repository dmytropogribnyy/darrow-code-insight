# DARROW CODE — Chinese Zodiac / Shengxiao Source Addendum v0.1

**Status:** research appendix / source-pack draft  
**Purpose:** capture source-review notes and safe-use policy for Chinese zodiac / Shengxiao, 12 animal signs, Heavenly Stems / Earthly Branches, 60-year cycle, lunar-calendar boundary, Tai Sui / luck claims, and popular Chinese horoscope material.  
**Runtime status:** not active. This is future **KB1 docs-only** material, not prompt/runtime/schema/template logic.

---

## 0. Core rule

Chinese zodiac material can be used as a **soft cultural-symbolic layer** and as background for later BaZi / Chinese calendar mapping, but Darrow Code must not reduce the person to a birth-year animal.

Allowed:
- 12 animal signs as cultural-symbolic mirrors;
- birth-year animal as a soft support layer;
- Heavenly Stems / Earthly Branches / sexagenary cycle as technical calendar context;
- Wu Xing / Five Phases as symbolic dynamics when provider data supports it;
- Chinese New Year / Start of Spring boundary awareness;
- original Darrow Code interpretations.

Not allowed:
- deterministic fortune claims;
- lucky/unlucky numbers, colors, flowers, objects, directions as guarantees;
- compatibility calculators or marriage-matching claims;
- Tai Sui fear framing;
- “bad luck year” / “must wear red/jade” recommendations;
- medical, fertility, gender-prediction, wealth, exam-success, or longevity claims;
- copying yearly horoscope predictions or daily horoscope copy;
- using lifestyle/daily horoscope articles as source of truth.

Darrow Code wording rule:

```text
Chinese zodiac animal = cultural-symbolic rhythm / year-cycle mirror.
Wu Xing element = phase tendency / movement quality.
Heavenly Stem + Earthly Branch = calendar-cycle context.
No animal sign alone determines personality, compatibility, fortune, wealth, health, or success.
```

---

## 1. Reviewed source matrix

| Source | Type | Useful extraction | Darrow Code use | Risk / restriction |
|---|---|---|---|---|
| China Highlights — Chinese Zodiac | Travel/culture + popular astrology guide | 12-animal order, Chinese New Year boundary, Start of Spring caveat, animal trait shorthand, 2026 Horse dates | Useful source-log / market reference | Includes lucky colors/numbers/flowers, compatibility, luckiest/unluckiest signs; do not copy claims |
| YourChineseAstrology.com | Large popular Chinese astrology portal | 12 signs, horoscope/year pages, Four Pillars, Five Elements, Stem-Branch, calendar/converter topics | Useful map of categories and market expectations | Strong predictive/luck/health/wealth/Tai Sui/feng shui/palmistry content; high-risk |
| ChineseNewYear.net — Zodiac | Popular Chinese New Year / zodiac guide | Clear 12-animal order, calculator, lunar-year boundary, sign descriptions | Source-log / comparison only | Compatibility and personality copy must not be reused |
| Creative Arts Guild PDF — 12 Chinese Zodiac Signs | Educational classroom-style PDF | Simple 12-sign table with recent years and traits; Jade Emperor race story | Educational reference / source comparison only | Do not copy images/table/prose; simplified personality claims |
| YourTango daily Chinese zodiac article | Lifestyle/daily horoscope | Example of ultra-current daily forecast framing and “day energy” language | Claims-to-avoid / market awareness | Do not copy daily forecasts or “life gets better for signs” claims |
| Horoscope.com Chinese Horoscopes | Popular horoscope portal | Sign picker and mainstream product taxonomy | Market reference only | Daily/forecast content; no runtime authority |
| Wikipedia — Chinese zodiac | Editable overview | 12 animals, Earthly Branches, Heavenly Stems, 60-year cycle, sign/order overview | Background only; cross-check with better sources | Editable; do not rely as sole authority |
| Wikipedia — Earthly Branches / Heavenly Stems / Chinese calendar | Technical calendar overview | Stem-branch cycle, sexagenary cycle, double-hours, calendar context | Useful technical background | Editable; cite/source-log only |
| Britannica / academic / calendar references | Future cross-check | Historical/cultural grounding | Inspect later | Need better source depth before runtime |

---

## 2. Key source observations

### 2.1 Common 12-animal order

The standard popular sequence:

```text
Rat → Ox → Tiger → Rabbit → Dragon → Snake → Horse → Goat/Sheep → Monkey → Rooster → Dog → Pig
```

Naming note:
- Goat / Sheep / Ram may vary by translation.
- For Darrow, use a single display label per language but preserve aliases in source notes.

### 2.2 Calendar boundary matters

Birth year alone is not enough for people born in January / February.

Common boundary notes:
- Many popular pages use **Chinese New Year** as the start of the animal year.
- Some traditional/professional systems use **Start of Spring / Li Chun** around February 3–4.
- Darrow runtime must not hard-code Gregorian year = zodiac sign without boundary logic.

Safe Darrow rule:

```text
If a user is born in January or February, calculate the Chinese year boundary before assigning a Chinese zodiac animal.
Do not infer from Gregorian year alone.
```

### 2.3 Chinese zodiac is not Western zodiac

Chinese zodiac signs are part of a 12-year animal cycle connected with calendrical symbolism, not 30-degree ecliptic signs like Western astrology.

Safe distinction:

```text
Western zodiac sign = ecliptic sign / chart placement.
Chinese zodiac animal = calendar-year symbolic cycle.
Do not merge the two mechanically.
```

### 2.4 Year animal is a weak standalone layer

Many popular sources reduce the system to birth-year animal traits. For Darrow, the year animal should be secondary unless supported by:
- BaZi / Four Pillars data;
- Heavenly Stem + Earthly Branch;
- Wu Xing element balance;
- Chinese calendar cycle;
- convergence with Western chart / numerology.

---

## 3. Source-quality classification

| Source class | Examples | Use |
|---|---|---|
| Cultural/calendar background | China Highlights, ChineseNewYear.net, calendar references | Source-log, boundary notes, 12-animal order |
| Technical calendar layer | Earthly Branches, Heavenly Stems, sexagenary cycle, Chinese calendar | Future FreeAstroAPI / BaZi mapping |
| Popular horoscope portals | YourChineseAstrology, Horoscope.com | Market taxonomy / claims-to-avoid |
| Daily horoscope articles | YourTango, daily forecast pages | Do not use except as market-warning examples |
| Classroom PDFs | Creative Arts Guild PDF | Simple table comparison; no image/prose reuse |
| Academic / encyclopedic references | Future Britannica, academic calendar/folklore sources | Needed later for stronger grounding |

---

## 4. Darrow Chinese zodiac rule model

Every animal sign should eventually be encoded in Darrow terms as:

```ts
type DarrowChineseZodiacRule = {
  animal: string;
  aliases?: string[];
  earthly_branch: string;
  yin_yang?: "yin" | "yang";
  fixed_phase?: "wood" | "fire" | "earth" | "metal" | "water";
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
};
```

---

## 5. Darrow Chinese animal symbolic seeds v0.1

These are original Darrow Code symbolic seeds, not copied source interpretations.

| Animal | Darrow mirror | Strength expression | Shadow expression | Practical direction |
|---|---|---|---|---|
| Rat | strategy under pressure | resourcefulness, timing, adaptive intelligence | over-calculation, anxiety, opportunism | move cleverly without losing trust |
| Ox | slow power and disciplined base | endurance, reliability, patient effort | rigidity, emotional heaviness, refusal to pivot | build steadily, but update the plan |
| Tiger | courageous disruption | boldness, risk, independent force | volatility, impatience, conflict-seeking | act bravely with rhythm, not impulse |
| Rabbit | soft intelligence and social sensing | diplomacy, sensitivity, graceful protection | avoidance, over-caution, quiet resentment | stay gentle without disappearing |
| Dragon | scale, charisma, mythic ambition | confidence, vision, magnetic force | inflation, drama, pride pressure | make the vision usable |
| Snake | hidden perception and timing | depth, strategy, subtle reading | secrecy, suspicion, control | reveal only what serves truth |
| Horse | motion, vitality, independence | energy, freedom, momentum, enthusiasm | restlessness, scattered heat, escape | choose direction before speed |
| Goat / Sheep | care, aesthetic softness, collective harmony | compassion, beauty, support, creative gentleness | dependency, worry, emotional blur | care with boundaries and structure |
| Monkey | invention and agile problem-solving | curiosity, play, improvisation, tactical mind | trickiness, inconsistency, clever avoidance | use intelligence to build, not dodge |
| Rooster | standards and visible precision | discipline, presentation, alertness, refinement | criticism, vanity, nervous perfectionism | improve the signal without attacking the person |
| Dog | loyalty and moral protection | honesty, devotion, ethics, guardianship | mistrust, defensiveness, pessimism | protect values without expecting betrayal |
| Pig | generosity and embodied completion | warmth, abundance, sincerity, enjoyment | indulgence, over-trust, soft avoidance | receive life without losing discernment |

---

## 6. Heavenly Stems / Earthly Branches / sexagenary cycle

Future runtime mapping should treat this layer as technical/calendar context, not simple personality labeling.

### 6.1 Earthly Branches

The 12 animals correspond to the 12 Earthly Branches:

| Animal | Branch | Pinyin | Darrow use |
|---|---|---|---|
| Rat | 子 | Zi | cycle beginning, midnight/new start motif |
| Ox | 丑 | Chou | stored force, slow grounding |
| Tiger | 寅 | Yin | emergence, force, direction |
| Rabbit | 卯 | Mao | sensitivity, spring-soft growth |
| Dragon | 辰 | Chen | scale, turbulence, mythic movement |
| Snake | 巳 | Si | heat, hidden intelligence, timing |
| Horse | 午 | Wu | peak fire, motion, visibility |
| Goat / Sheep | 未 | Wei | care, earth-soft containment |
| Monkey | 申 | Shen | metal agility, tactical intelligence |
| Rooster | 酉 | You | refinement, harvest, signal clarity |
| Dog | 戌 | Xu | protection, boundary, loyalty |
| Pig | 亥 | Hai | depth, completion, water-store |

### 6.2 Heavenly Stems

The 10 Heavenly Stems cycle through Wood, Fire, Earth, Metal, Water in yin/yang form.

Future use:
- Element/year phase context.
- BaZi support.
- Do not describe as “fate.”

### 6.3 Sexagenary cycle

The 10 stems and 12 branches combine into a 60-year cycle.

Darrow-safe use:

```text
The 60-year cycle gives a calendar-climate layer. It can add symbolic texture, but it does not predict fixed outcomes.
```

---

## 7. Chinese year boundary policy

Runtime decision needed later.

Potential policy:

```ts
type ChineseZodiacBoundaryMode = "chinese_new_year" | "li_chun";
```

Recommended Darrow v0.1:
- If using simple birth-year animal: default to **Chinese New Year boundary** because this is common/popular and matches many user-facing calculators.
- If using BaZi / Four Pillars: use **Li Chun / solar term boundary** if the provider method requires it.
- Always store `calculation_method` and `confidence`.

Suggested object:

```json
{
  "chinese_zodiac_layer": {
    "animal": "Horse",
    "element": "Fire",
    "branch": "Wu",
    "stem": "Bing",
    "boundary_method": "chinese_new_year",
    "source": "provider_or_calendar_engine",
    "confidence": "high",
    "report_use": "soft_symbolic_support"
  }
}
```

---

## 8. What to extract vs block

### Extract safely

- 12-animal sequence.
- Year boundary caution.
- Goat/Sheep translation variants.
- Earthly Branch / Heavenly Stem / 60-year cycle concepts.
- Wu Xing / Five Phase vocabulary.
- High-level cultural symbolism.
- Market awareness around 2026 Fire Horse.

### Block

Do not use:
- lucky numbers/colors/flowers;
- unlucky numbers/colors;
- compatibility calculators;
- “best match” relationship claims;
- “luckiest/unluckiest sign” rankings;
- Tai Sui curse/fear claims;
- “wear red / jade / lucky object” remedial advice;
- exact yearly/daily horoscope predictions;
- wealth/career/health/love certainty;
- gender prediction / pregnancy claims;
- palmistry/face-reading/medical/longevity content.

---

## 9. Darrow report integration

### CORE v4.1 — allowed later

Allowed:
- Chinese birth-year animal as soft cultural-symbolic layer;
- element/phase convergence if reliable;
- BaZi Day Master / Four Pillars if provider payload exists;
- cross-system convergence with Western chart / numerology;
- identity-card symbolic note only if concise and non-deterministic.

Example:

```text
The Horse layer does not mean you are destined to be restless. It adds a movement signature: life tends to improve when your energy has direction, space, and a real horizon.
```

### CORE v4.1 — avoid

Avoid:

```text
You are a Horse, so 2026 will be lucky.
Your best matches are Tiger and Dog.
Wear red to avoid Tai Sui.
Your lucky numbers are 2, 3, and 7.
This year guarantees career success.
```

### Add-ons later

| Add-on | Possible Chinese zodiac / BaZi use |
|---|---|
| YEAR | Chinese year climate, animal/element symbolic texture, Personal Year convergence |
| LOVE | Very cautious; no compatibility calculator claims |
| MONEY | Only if BaZi resource/output rules are curated; no wealth guarantees |
| BODY | Only symbolic stress/recovery pattern; no medical claims |
| STYLE | Colors/materials only after curated dictionary unlock |
| PLACE | Chinese calendar not primary; possible Feng Shui only if separate approved policy |

---

## 10. Source-risk notes by provided source

### China Highlights
Useful for:
- 12-animal order;
- Chinese zodiac year boundary notes;
- popular animal traits;
- 2026 Horse year reference.

Risk:
- lucky/unlucky things;
- compatibility calculator;
- luckiest/unluckiest signs;
- outdated superstition examples;
- predictive yearly horoscope pages.

### YourChineseAstrology.com
Useful for:
- category map: Chinese zodiac, compatibility, years chart, Chinese calendar, Four Pillars, Five Elements, Stem-Branch, Feng Shui, Tai Sui;
- market expectation around annual/daily/wealth/love/health/career forecast.

Risk:
- high concentration of deterministic claims;
- Tai Sui fear framing;
- health/wealth/love/career predictions;
- palmistry/face-reading/gender prediction/lucky number content.

### ChineseNewYear.net
Useful for:
- clean 12-animal order;
- Lunar New Year boundary;
- user calculator expectation.

Risk:
- compatibility and personality descriptions;
- do not copy sign descriptions.

### Creative Arts Guild PDF
Useful for:
- educational-style table;
- simplified year/animal/personality mapping;
- Jade Emperor race story reference.

Risk:
- do not copy images/table/prose;
- simplified “people embody traits” language.

### YourTango
Useful for:
- example of daily “Chinese zodiac sign life improves” content;
- daily forecast phrasing to avoid.

Risk:
- not source of truth;
- no daily forecast copy;
- no “this day gets better for sign X” claims.

### Horoscope.com
Useful for:
- mainstream horoscope product taxonomy;
- sign picker and Chinese horoscope category.

Risk:
- daily/forecast content;
- no runtime authority.

---

## 11. Future resources to inspect

Suggested later cross-check sources:

```text
- Britannica / academic encyclopedia entry on Chinese zodiac or Chinese calendar
- Chinese calendar / calendrical studies references
- Sources on Heavenly Stems and Earthly Branches
- Sources on sexagenary cycle
- Sources on BaZi / Four Pillars basics with clear license
- Sources on Wu Xing / Five Phases
- Cultural sources on Chinese New Year and zodiac legend
- Provider docs for FreeAstroAPI BaZi / Chinese calendar payload
```

---

## 12. Future repo placement

During KB1 docs-only phase, this appendix can become:

```text
docs/knowledge/CHINESE_ZODIAC_SOURCE_ADDENDUM_v1.md
docs/knowledge/CHINESE_CALENDAR_RULES_v1.md
docs/knowledge/CHINESE_ZODIAC_ANIMAL_RULES_v1.md
docs/knowledge/Bazi_SOURCE_POLICY_v1.md
docs/knowledge/SOURCE_LOG.md
```

Do not wire into runtime until a later explicit phase defines:
- whether Chinese zodiac is calculated locally or trusted from provider payload;
- boundary method;
- relationship to BaZi / Four Pillars;
- confidence handling for January/February births;
- whether the layer appears in CORE identity-card, YEAR add-on, or both.

---

## 13. Claude guard note

Do not give this addendum to Claude during B2.1/B2.2/B3/B4 technical phases.

Future KB1 only:

```md
This Chinese Zodiac / Shengxiao addendum is docs-only research material.
Do not modify runtime, schema, prompts, PDF template, generation pipeline, routes, Stripe, email, auth, customer logic, or provider integrations.
Do not activate Chinese zodiac generation.
Do not add compatibility, lucky-number/color, Tai Sui, wealth, health, or daily horoscope claims.
```
