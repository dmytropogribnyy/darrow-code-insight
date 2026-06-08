# Data-utilization audit — are we squeezing the maximum useful raw signal?

Audited what FreeAstroAPI populates vs what each report's prompt/packet actually surfaces.

## Headline
- **Provider gives EVERYTHING** — natal (planets w/ degree/house/retrograde/dignity, ASC/MC/IC/DESC,
  houses, aspects w/ orb/applying, stelliums), numerology (life_path, birth_day, personal_year + master
  marker, full name: expression/soul_urge/personality/maturity/hidden_passion/karmic_lessons), BaZi
  (day_master, 4 pillars, element %, dominant/deficient, luck_cycle + current cycle, **Shen Sha stars**,
  **interactions**, **professional**: dm_strength/structure/favorable+unfavorable elements/scores),
  transits (planets + aspects + high_priority), solar_return (planets, angles, angularity, natal compare),
  moon_phase (phase/illumination/zodiac/eclipse/special/forecast), bazi_flow (annual+monthly pillars w/
  **ten_gods**, interactions, stars). **Nothing is type-only — it's all populated.**
- **The gap is consumption, not availability.** A lot of specific, interesting signal never reaches the model.

## The asymmetry
- **CORE** passes the **whole chart JSON** → has access to everything, but the prompt GUIDANCE underuses it
  (dignity/retrograde/stelliums/luck-cycles/ten-gods/Shen-Sha passed but not highlighted; element % pushed
  to proof-tags only; name numerology gated behind a convergence check).
- **Add-ons** use a curated PACKET that surfaces only a **thin slice**: planet **signs** (no degree/house/
  retrograde/dignity), aspects (max 6, **type only — no orb/applying**), BaZi (**only day_master +
  dominant element** — not pillars/ten-gods/stars/luck-cycle/element-%/professional), numerology (only
  life_path/personal_year). Houses/angles are an **availability flag**, never actual placements.
- **YEAR** is the worst miss: it's a *timing* product but cites only `Personal Year N` + a **generic
  "current transit/solar-return window" string** — the actual transits / solar-return / bazi-flow / moon
  detail is **never surfaced**.
- **Continuum 7d/30d** = thinnest: Sun/Moon sign + Personal Year + **named** timing windows (no detail).

## Per-module: used vs HIGH-VALUE available-but-unused

| Module | Used now | High-value signal left on the table |
|---|---|---|
| CORE | full JSON (under-directed) | dignity/retrograde as signals, stellium composition, BaZi luck-cycle/ten-gods/Shen-Sha, element-% in prose, name-numerology depth |
| LOVE | Venus/Mars/Moon sign, ≤6 aspects (type), ASC sign | aspect **orb/applying**, planet **degree/house/dignity/retrograde**, 5H/7H/8H placements, Soul Urge |
| MONEY | +Jupiter/Saturn/Pluto sign, Life Path, BaZi day_master+dominant | **BaZi professional** (dm_strength/structure/**favorable elements**/scores), element %, 2H/8H/10H/MC, aspect orb |
| BODY | Moon/Mars/Saturn sign, BaZi day_master+dominant | **moon_phase detail** (phase/zodiac/waxing), element %, 6H/12H, BaZi element balance, aspect orb |
| YEAR | Personal Year + generic timing string | **actual transits** (which planet, aspect, high_priority), **solar-return** (angles/angularity), **bazi_flow** (annual/monthly ten-gods), moon phase, PY master marker |
| STYLE | Venus/Moon/Sun sign, BaZi day_master+dominant | planet degree/dignity, 1H/5H, element % (aesthetic register), aspect orb |
| PLACE | Moon sign, BaZi day_master+dominant | IC/4H/angular placements (the actual PLACE signal), element balance |
| CONTINUUM | Sun/Moon sign, Personal Year, named timing windows | **all** transit/solar/flow/moon timing detail, PY master marker, luck-cycle stage |

## Enrichment priorities (depth, NOT length — these become MORE SPECIFIC anchors, not longer reports)

1. **YEAR + Continuum — surface actual timing detail** (biggest miss for the timing products): real transit
   aspects (planet→natal, high_priority), solar-return angularity, bazi_flow annual/monthly ten-gods, moon
   phase. These become concrete proof anchors instead of a vague "timing window".
2. **BaZi depth where modules route to it** (MONEY/BODY/STYLE/PLACE/CORE): element %, favorable/unfavorable
   elements, current luck-cycle, Shen-Sha stars, ten-gods — huge populated layer currently reduced to
   day_master + dominant.
3. **Add-on placement precision**: surface planet **house + dignity + retrograde** (not just sign) and
   aspect **orb** (tighter = more central) for the module's planets → sharper, less generic anchors.
4. **Numerology depth**: birth_day_number everywhere; expression/soul_urge where the module allows.
5. **Stelliums**: decode the actual grouping into an anchor (CORE/relevant add-ons).

## How (architecture)
Extend the material packet (`buildReportContextForModule`) + `buildContinuumContext` to compute these
richer anchors from the chart (gated by availability + birth_time), and the `buildKnowledgePackForModule`
selector grounds their interpretation. **No schema/section/word-target change**; the win is anchor
specificity at the same length. Each enrichment re-validated (real-AI: schema + forbidden + length flat).
Still gated/blocked: colors/stones-as-magic, cities, synastry, health (unchanged).
