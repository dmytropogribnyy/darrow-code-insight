# DARROW CODE — AstroGeo / Astrocartography / Relocation Source Addendum v0.1

**Status:** research appendix / source-pack draft  
**Purpose:** capture sources and safe-use policy for astrocartography, locational astrology, relocated charts, local space, city/place resonance, and future PLACE add-on logic.  
**Runtime status:** not active. This is future KB/source-pack material, not prompt/runtime/schema/template/provider logic.

---

## 0. Core decision

AstroGeo / astrocartography is important for Darrow Code, but it should **not** be added to CORE runtime now.

Recommended product placement:

```text
CORE: optional soft environmental resonance only, no maps/city ranking.
PLACE add-on: main home for astrocartography, relocated charts, city/country resonance.
STYLE/BODY/YEAR: possible minor cross-links later.
```

This layer requires exact birth time, birthplace, target location, and provider/calculation support.

---

## 1. Core rule

Astrocartography and relocation astrology may be used only as **symbolic place-resonance mapping**, not as a guarantee that a city will bring love, money, healing, success, danger, or destiny.

Allowed:
- astrocartography as future PLACE add-on source;
- relocated chart as place-context chart;
- planetary angular lines as symbolic place emphasis;
- local space / directionality as optional advanced research;
- city/place comparison after explicit product phase;
- original Darrow Code interpretation language.

Not allowed:
- ranking cities as objectively best/worst for life;
- deterministic relocation advice;
- telling the user to move, leave, buy property, immigrate, marry, divorce, or change career;
- guaranteeing love/money/fame/health/safety in a location;
- using astrocartography without reliable birth time;
- using map outputs without provider/license review;
- copying Astro.com/Astro-Seek/AstroStyle report text or map UI;
- scraping maps, interpretations, or protected outputs.

Safe Darrow wording:

```text
This place may symbolically emphasize the Venus function: connection, beauty, value, and relational ease. That does not mean the city guarantees love; it means the place may mirror and amplify this part of your pattern.
```

Forbidden wording:

```text
Move here for love / money / success.
This is your best city.
This line guarantees career growth.
This location will heal you.
Avoid this place because it is bad for you.
```

---

## 2. Reviewed source matrix

| Source | Type | Useful extraction | Darrow Code use | Risk / restriction |
|---|---|---|---|---|
| Astro-Seek astrocartography map | Calculator/tool | Map UX, planet lines, relocation-style user expectations | Benchmark only | Page fetch blocked; do not rely on copied output |
| Astro.com AstroClick Travel | Professional astrology tool | Major benchmark for locational astrology / travel map UX | Benchmark only | Do not copy map, text, interpretations, or UI |
| Astro.com Atlas | Atlas/location infrastructure | Shows Astro.com has atlas/location query and locational astrology products | Reference for location/atlas importance | Do not copy data unless license permits |
| AstroStyle astrocartography article | Popular educational guide | Clear framing: relocated natal chart, planetary lines, houses/location importance | Tone/source comparison | Contains “best/worst” and luck-style phrasing; must soften |
| Old Farmer’s Almanac astrocartography article | Popular educational guide | Public-facing “best places to live/visit” framing | Market/SEO reference | Page fetch blocked; manually review later |
| The Travelling Light astrocartography article | Practitioner/lifestyle | Personal/place transformation framing | Market/tone awareness | Requires manual review; no copied prose |
| Astrochart.co | Calculator/app | Market/tool reference for chart and possible relocation features | Feature benchmark | Need manual review; no scraping/copying |
| Moyra app natal/astro funnel | Commercial acquisition funnel | Market UX reference for astrology apps | Marketing/UX awareness only | Not source authority; avoid copying flow or claims |
| Wikipedia locational astrology | Broad overview | Terms: locational astrology, astrocartography, astrogeography, local space; Jim Lewis history | Background only | Editable; cross-check with better sources |
| Jim Lewis / Astro*Carto*Graphy legacy | Historical origin | Technique history and trademark/pioneer context | Source-log background | Do not copy copyrighted maps/books |
| Business Insider / People / InStyle mainstream articles | Popular trend coverage | Market demand, user expectations, “not a foolproof life plan” caution | Market-awareness only | Stories/anecdotes not evidence |

---

## 3. Key findings

### 3.1 This is a real product category

Astro.com has a dedicated locational astrology section including AstroClick Travel and AstroClick Local Space. AstroStyle frames locational astrology / astrocartography as a branch that explores best or worst places to live, and explains that a relocated chart is the basis for most locational astrology.

Darrow implication:

```text
PLACE add-on should eventually include this layer because customers understand “where should I live / travel / feel aligned?” as a strong astrology product question.
```

### 3.2 Astrocartography requires exact birth data

Astrocartography depends heavily on birth time, birthplace, and target place. The key changing factor is the angle/horizon/house relationship in different locations.

Darrow hard rule:

```text
If birth_time_reliability != exact, do not produce astrocartography lines or city ranking.
```

Approximate birth time may allow only a warning-level soft note, not precise lines.

### 3.3 Map lines are not enough

AstroStyle notes that relocated charts provide more detail than the map alone because the map mainly shows where planetary line emphasis occurs, while the relocated chart shows local houses and angles.

Darrow implication:

```text
Future PLACE should combine:
1. planetary lines / angularity;
2. relocated chart;
3. local houses/angles;
4. user goal context;
5. practical real-world filters.
```

### 3.4 Astrogeo output must stay non-deterministic

Popular sources often say “best/worst places,” “luck,” “career,” “love,” “healing,” or “fated.” Darrow must translate this into symbolic place resonance:

```text
supportive emphasis
creative pressure
visibility field
relationship mirror
discipline terrain
dream field
identity amplifier
```

Not:

```text
guaranteed best city
bad city
avoid forever
career success guaranteed
love guaranteed
healing guaranteed
```

---

## 4. Future Darrow AstroGeo model

Potential future object shape:

```ts
type DarrowAstroGeoSignal = {
  target_location: {
    name: string;
    country?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  };
  birth_time_reliability: "exact" | "approximate" | "unknown";
  calculation_method: "astrocartography" | "relocated_chart" | "local_space" | "provider_default";
  line_or_chart_signal: {
    planet?: string;
    angle?: "ASC" | "DSC" | "MC" | "IC";
    distance_km?: number;
    house_emphasis?: string;
    strength: "primary" | "secondary" | "weak";
  };
  darrow_place_meaning: string;
  best_use_cases: string[];
  friction_notes: string[];
  forbidden_claims: string[];
  report_use: {
    core: "blocked" | "soft_context_only";
    addons: Array<"PLACE" | "YEAR" | "LOVE" | "MONEY" | "STYLE" | "BODY">;
  };
};
```

---

## 5. Planetary line motif seeds

Status: research only / not runtime.

| Planet line | Darrow-safe place motif | Possible strengths | Possible frictions | Forbidden claims |
|---|---|---|---|---|
| Sun | visibility, authorship, being seen | confidence, leadership, creative exposure | ego pressure, performance fatigue | fame/success guaranteed |
| Moon | home, memory, emotional belonging | care, rest, family, inner rhythm | moodiness, over-attachment | fertility/healing/home guarantee |
| Mercury | movement, language, networks | writing, learning, commerce, mobility | nervous overload, distraction | business success guaranteed |
| Venus | beauty, ease, value, affection | love, art, pleasure, social grace | indulgence, dependency, avoidance | love/marriage guaranteed |
| Mars | action, heat, assertion | drive, sexuality, courage, competition | conflict, impatience, burnout | physical power/safety claims |
| Jupiter | expansion, teaching, horizon | opportunity, education, generosity | excess, overpromise, inflation | luck/wealth guaranteed |
| Saturn | structure, duty, mastery | discipline, career seriousness, endurance | heaviness, isolation, restriction | career guarantee or punishment framing |
| Uranus | disruption, freedom, reinvention | originality, surprise, liberation | instability, alienation, chaos | breakthrough guaranteed |
| Neptune | dream, imagination, permeability | art, spirituality, compassion | confusion, escapism, weak boundaries | spiritual/healing guarantee |
| Pluto | depth, power, transformation | psychological depth, renewal, intensity | control, crisis, obsession | trauma/healing/danger certainty |
| Chiron | wound-to-wisdom | mentoring, repair, art from pain | wound activation, sensitivity | healing promise |
| Node | direction / strange familiarity | meaningful contacts, future pull | over-fated storytelling | karmic destiny guarantee |

---

## 6. Angle motif seeds

| Angle | Darrow-safe meaning | PLACE use |
|---|---|---|
| ASC | identity interface, how the place activates self-presentation | “how you show up there” |
| DSC | other people, partnership, mirror field | “who you meet / what relationships reflect” |
| MC | visibility, vocation, public role | “how the place activates ambition/public work” |
| IC | roots, home, emotional base | “how the place affects inner anchoring/home feeling” |

Hard rule:

```text
Angles require exact birth time.
```

---

## 7. PLACE add-on routing

Recommended future PLACE module sections:

```text
1. Place Overview
2. Best-Use Places vs Rest Places
3. Planetary Line Highlights
4. Relocated Chart Notes
5. City Comparison
6. Emotional/Home Resonance
7. Career/Public Role Resonance
8. Relationship/Social Resonance
9. Creative/Spiritual Resonance
10. Practical Reality Check
11. Places to Approach Consciously
12. Final Place Strategy
```

The “Practical Reality Check” section is mandatory.

It should remind the user that real-world factors matter:
- visa/residency;
- language;
- work market;
- family;
- cost of living;
- safety;
- healthcare;
- legal/financial situation;
- personal preference.

---

## 8. CORE vs PLACE boundary

### CORE v4.1

Allowed later only as a soft line:

```text
Your chart has a strong place/environment layer. Location may matter more for you than for most people, especially around home, visibility, and emotional reset.
```

Blocked in CORE:
- maps;
- city recommendations;
- country rankings;
- “best place to live”;
- astrocartography lines;
- relocated chart details.

### PLACE add-on

Allowed later:
- map-based interpretation;
- city/country comparison;
- relocated chart analysis;
- planetary line motifs;
- practical reality check.

---

## 9. FreeAstroAPI / provider questions for MAP0

The official dashboard docs need recheck before runtime planning.

Questions:

```text
Does FreeAstroAPI provide astrocartography / relocation / local space endpoints?
Does it provide relocated chart calculation for target locations?
Does natal/calculate allow arbitrary target city as relocated chart input?
Does it expose angularity lines or only natal chart data?
Does it expose lat/long/timezone atlas lookup?
Does it return distance-to-line or only raw chart?
Does it support local space azimuth lines?
Does it support geodetic astrology?
Does it support timezone/DST resolution or must app provide it?
What input object does it require for target location?
What output shape is returned?
Are map images/SVGs available, and are they allowed for product use?
Can interpretation be disabled?
```

Current assumption until MAP0:

```text
Do not rely on FreeAstroAPI astrocartography until docs/API are verified.
If no astrocartography endpoint exists, possible fallback is relocated natal chart calculation per target city, if provider supports it safely.
```

---

## 10. Source-log draft notes

- Astro.com / Astrodienst is the strongest benchmark for locational astrology product UX because it has AstroClick Travel and AstroClick Local Space in its locational astrology area. Use as benchmark only; do not copy maps or interpretations.
- Astro.com Atlas is important as a reminder that high-quality place work needs robust location/atlas handling.
- AstroStyle is a useful public educational source explaining relocated charts, planetary lines, and the role of houses/angles in place interpretation; avoid its “best/worst,” luck, and anecdotal certainty language.
- Astro-Seek is useful as calculator/tool benchmark, but the page was not fetchable during this pass.
- Old Farmer’s Almanac and The Travelling Light are market/tone sources to manually review later.
- Moyra and Astrochart.co are app/UX benchmarks, not interpretation authorities.
- Wikipedia/locational astrology is useful for terms and history, including Jim Lewis and local space, but should not be sole authority.
- Mainstream lifestyle/business articles show market demand and user curiosity, but anecdotal claims should not be treated as evidence.

---

## 11. Claude guard note

Do not include this addendum in KB2-A, KB2-B, KB2-C, B4, or MAP1 without explicit instruction.

Future phase suggestion:

```text
KB1-C — import AstroGeo / PLACE source pack
KB2-PLACE — create curated AstroGeo / PLACE symbolic rules
MAP0 — FreeAstroAPI astrogeo capability audit
MAP-PLACE — map provider/location data to PLACE add-on rules
```

Prompt guard:

```md
AstroGeo / astrocartography source-pack material is future PLACE add-on research only.
Do not modify runtime, schema, prompts, routes, PDF template, provider implementation, payment/email/auth/customer/order/token logic.
Do not activate city recommendations, maps, astrocartography lines, or relocated chart interpretation.
```
