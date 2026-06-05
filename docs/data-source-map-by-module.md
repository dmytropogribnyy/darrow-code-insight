# Data Source Map by Report Module

**Phase:** DATA-MODULE-AUDIT-1 (docs-only) · **Updated:** 2026-06-06

Precise source/data contract for **CORE + every focused module** (LOVE, MONEY, BODY, YEAR,
STYLE, PLACE), derived from the actual repo. No code/schema/prompt change; no provider/AI calls.

**Source files audited:** `src/lib/astro/provider.ts`, `src/lib/astro/types.ts`,
`src/lib/astro/freeastroapi-provider.server.ts`, `src/lib/astro/mock-provider.server.ts`,
`src/lib/numerology/numerology.ts`, `src/lib/ai/user-prompt.ts`,
`src/lib/generation/pipeline.server.ts`.

> **Key finding:** Only **CORE** has a real per-module generation spec (`coreV3Instructions()`
> — 17 sections, voice, structure). The add-on modules (LOVE/MONEY/BODY/YEAR/STYLE/PLACE) are
> driven **only** by the one-line `moduleRouting()` hints inside the **same single AI call**.
> They have **no dedicated prompt/schema/length/QA contract** → tracked as MODULE-PATTERN-1 /
> MODULE-DIAG-1. CORE v4.1 is staged-only; production CORE = v3.

---

## 1 · Current provider architecture

Provider selection (`src/lib/astro/provider.ts`, `getAstroProvider()`):

- **`ASTRO_PROVIDER`** (env) — in **production it MUST be set explicitly** (e.g.
  `freeastroapi`); otherwise it throws (no auto-select from key presence).
- **`FREEASTROAPI_KEY`** (env) — required when `ASTRO_PROVIDER=freeastroapi`.
- **Mock** is selected only when `ASTRO_PROVIDER=mock` (or no key in non-prod). In
  production the mock **throws** unless `ALLOW_MOCK_ASTRO_IN_PRODUCTION=true`.
- Singleton, cached per process.

**Allowed in production:** `freeastroapi` only (mock is a hard fail unless explicitly overridden).
Pipeline (`pipeline.server.ts`) calls `getAstroProvider().computeNatal(natal)`, persists the
result to **`astro_data.normalized_json`**, then builds the prompt with `buildUserPrompt` (v3)
and emits **all selected modules in one AI call** (`emit_darrow_report`).

---

## 2 · Current normalized data model (`DarrowChartData`, `types.ts`)

| Block | Shape / key fields | Always present? |
|---|---|---|
| `meta` | provider_name/version, generated_at, timezone_used, `birth_time_source` (`exact`/`noon_fallback`/`unknown`), `endpoint_timing_ms`, `endpoint_errors` | yes |
| `natal` | `sun`, `moon`, `ascendant?`, `midheaven?`, `planets[]`, `houses?`, `aspects[]` (major only), `angles_details?` (asc/mc/ic/desc), `stelliums?`, `confidence?` | yes (houses/angles only if birth time) |
| `numerology` | `available: true`, `life_path`, `birth_day_number`, `personal_year`, `personal_year_master_marker`, `name_numerology{…}` | **always** (computed internally) |
| `bazi` | `available`, `day_master?`, `pillars{year,month,day,hour}`, `elements{percentages,dominant,deficient}`, `luck_cycle`, `current_luck_cycle`, `stars`, `interactions`, `professional{favorable/unfavorable…}`, `hour_pillar_used_for_interpretation` | only if `available` |
| `transits` | `available`, `transit_planets[]`, `natal_planets[]`, `aspects[]` (major, orb ≤6, `high_priority` for slow movers) | nullable / graceful |
| `solar_return` | `available`, `year`, `planets[]`, `angles_details`, `natal_comparison{aspects,angularity}` | nullable / graceful |
| `moon_phase` | `available`, `phase{name,illumination,…}`, `zodiac`, `special_moon`, `eclipse`, `traditional_moon`, `forecast` | nullable / graceful |
| `bazi_flow` | `available`, `usable`, `annual_pillar`, `monthly_pillars[]`, `interactions`, `stars`, `time_confidence` | nullable / graceful |

Provider prose/`interpretation` is **stripped** before persistence (`stripInterpretation`,
`stripBaziFlowProse`) — only deterministic structured fields are kept.

---

## 3 · Per-report data routing (from `moduleRouting()` + `safetyRules()`)

| Module | Required / primary data | Optional / supporting | Forbidden when unavailable | Proof-anchor + safety |
|---|---|---|---|---|
| **CORE** | Natal (Sun/Moon/planets/aspects, element balance); BaZi pillars + Day Master (if available); Life Path + Birth Day Number | Expression/Soul Urge/Personality (only if name + convergence); Houses/ASC/MC (only if birth time) | BaZi terms if `bazi.available=false`; house/angle if no birth time; name-numerology if no full name | proof_tags = real data only; no medical/wealth/deterministic claims; never a standalone "Name Numerology" section |
| **LOVE** | Venus, Mars, Moon, 5H, 7H, Descendant | Name numerology only if it reinforces the pattern | 5H/7H/Descendant if no birth time; name-num if no name | No synastry (MVP); no compatibility from name numerology alone |
| **MONEY** | 2H, 6H, 8H, 10H, Jupiter, Saturn, Venus, Pluto | Life Path / Expression / Maturity; BaZi favorable/unfavorable elements + structure | houses if no birth time; BaZi if unavailable | no wealth/income guarantees |
| **BODY** | Moon, Mars, Saturn, 6H | BaZi element imbalance; Moon Phase soft-rhythm note | 6H if no birth time; BaZi if unavailable | **no medical claims** — "your system may respond to…" language only |
| **YEAR** | Slow transits + Solar Return (primary); Personal Year (theme) | BaZi Flow (annual/monthly timing) | Solar Return if `available=false`; transits if `available=false`; BaZi Flow if unavailable | no guaranteed predictions; Personal Year must match computed value |
| **STYLE** | Venus, Ascendant, Moon | BaZi element balance (color/material direction) | Ascendant if no birth time; BaZi if unavailable | visual/material language only; **no healing/luck/protection/attraction** claims |
| **PLACE** | Moon, IC, 4H, angular planets | BaZi favorable elements (environmental qualities) | IC/4H/angular if no birth time; BaZi if unavailable | **astrocartography NOT implemented — never name specific cities** |

**Enrichment guardrails (all modules):** name numerology, Moon Phase, BaZi Flow are *supporting
synthesis layers, never standalone sections*; every enrichment claim must cite its data point.

---

## 4 · FreeAstroAPI endpoint / field audit

All calls: `POST https://api.freeastroapi.com…` (moon phase is GET), header `x-api-key`,
`interpretation.enable=false`. Natal is **critical** (1 retry, aborts on fail); the rest are
**graceful** (1 retry, 10s budget each, `available:false` + `reason` on failure).

| Block | Endpoint | `normalized_json` path | Availability condition | On failure | Used by prompt today? |
|---|---|---|---|---|---|
| natal | `/api/v1/natal/calculate` | `natal.*` (planets, houses, aspects, angles_details, stelliums) | always attempted; **houses/angles only if `birth_time_known`** | **aborts generation** | yes (all modules) |
| transits | `/api/v1/transits/calculate` | `transits.*` | graceful | `transits.available=false` | yes (YEAR primary) |
| bazi | `/api/v1/chinese/bazi` | `bazi.*` | **requires `bazi_sex` M/F** (else `missing_bazi_sex`) | `bazi.available=false` | yes (CORE + enrichment) |
| solar_return | `/api/v1/western/solar/calculate` | `solar_return.*` | graceful | `solar_return.available=false` | yes (YEAR primary) |
| moon_phase | `/api/v1/moon/phase` (GET) | `moon_phase.*` | graceful enrichment | `moon_phase.available=false` | soft (BODY rhythm) |
| bazi_flow | `/api/v1/chinese/bazi/flow` | `bazi_flow.*` | **requires `bazi_sex` M/F**; `usable=false` if no structured data | `bazi_flow.available=false` | soft (YEAR timing) |
| **numerology** | **internal** `computeNumerology()` (Pythagorean) | `numerology.*` | **always** (date-derived); name fields need full name | n/a (no network) | yes (CORE + support) |

**Confidence signals:** `meta.birth_time_source`, `bazi.hour_pillar_confidence`,
`bazi_flow.time_confidence`, `natal.confidence` (passthrough), `bazi_flow.usable`.

---

## 5 · Birth-time rules

- `hasHouses = birth_time_known` (`freeastroapi-provider.server.ts:1036`). When false:
  `natal.houses`, `ascendant`, `midheaven`, `angles_details` are **null**; BaZi uses noon
  (hour 12) with `hour_pillar_confidence="low"`, `hour_pillar_used_for_interpretation=false`.
- `safetyRules()` injects: *no strong claims about Ascendant/MC/IC/Descendant/houses/house
  rulers/overlays* when `birth_time_source !== "exact"`.
- **Do not invent houses/angles.** Modules whose primary data is house-based (LOVE 5H/7H,
  MONEY 2/6/8/10H, BODY 6H, PLACE IC/4H, STYLE ASC) must degrade gracefully without birth time.

---

## 6 · BaZi rules

- Use BaZi **only when `bazi.available=true`**. `safetyRules()`: when false, *do NOT mention
  BaZi, Four Pillars, Day Master, Ten Gods, Chinese astrology, stems, branches, or luck cycles
  anywhere*.
- **`bazi_sex` (M/F) is required** — the provider throws `missing_bazi_sex` → `available:false`.
  (UI must collect it when BaZi is enabled; `NatalInput.bazi_sex`.)
- Birth time not required for BaZi to be `available`, but without it the **hour pillar is
  unreliable** (`hour_pillar_used_for_interpretation=false`) → use Day Master + year/month/day
  pillars + element balance only.

---

## 7 · Numerology rules

- **Date-derived (always available):** Life Path, Birth Day Number, Personal Year
  (`numerology.available` is the literal `true`).
- **Name-derived (require full name):** Expression, Soul Urge, Personality, Maturity — gated by
  `numerology.name_numerology.available` (which is false when `full_name_for_numerology` absent).
- **Do not use name numerology if the name is missing.** Never a standalone "Name Numerology"
  section — it only supports convergence with the main pattern.

---

## 8 · Timing / YEAR rules

- **Personal Year must equal the computed `numerology.personal_year`** (enforced by the CORE v4
  anchor validator B5.3-A; not yet enforced for add-on modules → ANCHOR-AUDIT-1).
- Transits, Solar Return, BaZi Flow used **only when `available=true`** (and `bazi_flow.usable`).
  `safetyRules()`: if Solar Return unavailable, YEAR relies on transits + Personal Year; if
  transits unavailable, YEAR relies on Personal Year (+ BaZi when available).
- **No guaranteed predictions / outcomes.**

---

## 9 · Per-module preliminary data matrix

Legend: ✅ primary · ➕ supporting · ⛔ gated-off when unavailable.

| Data layer | CORE | LOVE | MONEY | BODY | YEAR | STYLE | PLACE |
|---|---|---|---|---|---|---|---|
| Natal planets/signs/aspects | ✅ | ✅ | ✅ | ✅ | ➕ | ✅ | ✅ |
| Houses / ASC / MC / IC (birth-time) | ➕⛔ | ✅⛔ | ✅⛔ | ✅⛔ | ➕⛔ | ✅⛔(ASC) | ✅⛔ |
| Numerology (Life Path / Personal Year) | ✅ | ➕ | ➕ | – | ➕ | – | – |
| Name numerology (full name) | ➕⛔ | ➕⛔ | ➕⛔ | – | – | – | – |
| BaZi (Day Master/elements) | ✅⛔ | – | ➕⛔ | ➕⛔ | ➕⛔ | ➕⛔ | ➕⛔ |
| Transits | – | – | – | – | ✅⛔ | – | – |
| Solar Return | – | – | – | – | ✅⛔ | – | – |
| Moon Phase | – | – | – | ➕⛔ | – | – | – |
| BaZi Flow | – | – | – | – | ➕⛔ | – | – |

---

## 10 · Gaps and blockers

**Missing / under-specified:**
- Add-on modules (LOVE/MONEY/BODY/YEAR/STYLE/PLACE) have **no dedicated generation contract** —
  only `moduleRouting()` one-liners in a shared call. No per-module schema, length targets,
  proof-anchor rules, or PDF QA → **MODULE-PATTERN-1**, **MODULE-DIAG-1**.
- Anchor/data validation exists **only for CORE v4 diagnostic** (B5.3-A). No positive
  placement-matching and no per-module validation → **ANCHOR-AUDIT-1**.

**FreeAstroAPI must be tested on real data (DATA-AUDIT-1):**
- Does `/natal/calculate` reliably return `stelliums`, `angles_details`, dignity, `confidence`?
- Does `/chinese/bazi` reliably populate `professional.favorable_elements/unfavorable_elements`,
  `elements.percentages/dominant/deficient`, `current_luck_cycle`, `stars`, `interactions`?
- Does `/western/solar/calculate` return `natal_comparison.angularity` and `angles_details`?
- Does `/transits/calculate` return enough `high_priority` (slow-mover) aspects for a YEAR read?
- Does `/chinese/bazi/flow` return structured `annual_pillar` + `monthly_pillars` (vs `usable:false`)?
- Confirm `bazi`/`bazi_flow` truly fail closed when `bazi_sex` is missing (UI must collect it).
- Confirm houses/angles are **absent** (not noon-faked) when `birth_time_known=false`.

**Prompt under-use / risk:**
- MONEY/BODY/STYLE/PLACE lean on BaZi favorable-element + house data whose **real availability
  is unverified** — content may over-claim if those fields are sparse.
- YEAR depends on transits + Solar Return (both graceful) — needs a defined fallback contract
  when both are `available:false` (currently only Personal Year remains).

**Tests needed (future phases):**
- Per-module availability gating (mirror B5.3-A anchors for each add-on).
- Provider-shape contract tests against recorded real FreeAstroAPI responses (fixtures).
- Birth-time-absent and BaZi-absent degradation per module.

---

## Cross-links

[`launch-readiness-map.md`](launch-readiness-map.md) ·
[`bundle-separate-reports-plan.md`](bundle-separate-reports-plan.md) ·
[`core-v4.1-readiness-status.md`](core-v4.1-readiness-status.md) ·
provider reference: `src/lib/astro/FREEASTROAPI_REFERENCE.md`
