# FreeAstroAPI — Integration Reference

Persistent project reference. Treat as canonical for future maintenance.
Source check date: 2026-05-17.

## Auth

- Base URL: `https://api.freeastroapi.com`
- Header: `x-api-key: <FREEASTROAPI_KEY>` (server-only, never in frontend)
- Header: `Content-Type: application/json`
- Secret name: `FREEASTROAPI_KEY` (Lovable/Supabase Secrets only)

## Endpoints

| Purpose | Method | Path | Tier |
|---|---|---|---|
| City search / geocoding (NOT used — Geoapify kept) | GET | `/api/v2/geo/search?q=...&limit=10` | n/a |
| Western natal | POST | `/api/v1/natal/calculate` | CRITICAL |
| Western transits | POST | `/api/v1/transits/calculate` | GRACEFUL |
| Chinese BaZi (Four Pillars) | POST | `/api/v1/chinese/bazi` | GRACEFUL |
| Western Solar Return | POST | `/api/v1/western/solar/calculate` | GRACEFUL |
| Moon Phase | GET  | `/api/v1/moon/phase` | GRACEFUL (enrichment) |
| BaZi Flow | POST | `/api/v1/chinese/bazi/flow` | GRACEFUL (enrichment) |

**Do NOT use** the deprecated `/api/v1/solar-return/calculate` path.
**Do NOT use** Moon Phase Timeline (`/api/v1/moon/month`) in MVP.
**Do NOT use** Astrocartography globally in MVP. (Reserved for PLACE module when `birth_time_known=true`, later.)
**Do NOT use** Synastry, BaZi Synastry, Health/Neijing, daily sign reports,
provider-generated psychological reports, or SVG chart endpoints in MVP.

## Provider behaviour

- **Natal** = CRITICAL → on failure pipeline aborts, order marked `failed_generation`.
- **Transits / BaZi / Solar Return / Moon Phase / BaZi Flow** = GRACEFUL → on
  failure each block persists as `{ available: false, reason }` and Claude is
  instructed to skip that data.
- Generation must never fail because an enrichment endpoint failed.

## Concurrency strategy (verified hybrid, paid plan)

1. Run Natal first sequentially. `NATAL_MAX_ATTEMPTS = 2`. Abort on failure.
2. After Natal succeeds, run graceful endpoints concurrently via
   `Promise.allSettled` with small staggers:
   - Transits
   - BaZi
   - Solar Return
   - Moon Phase
   - BaZi Flow
3. Per-endpoint budget ~10s. `GRACEFUL_MAX_ATTEMPTS = 2`.
4. Respect `Retry-After` if ≤6s, otherwise `DEFAULT_429_BACKOFF_MS = 1500`.
5. Total generation must stay inside the Cloudflare Worker wall-time budget.
6. Per-endpoint diagnostics surfaced into `meta`:
   `endpoint_timing_ms`, `endpoint_errors`, `hit_429`, `available`.

## Unknown birth time rules

- `time_known: false` is forwarded to natal, transits, solar return.
- Houses / angles / Ascendant / MC / IC / Descendant stay `null` in `normalized_json`.
- BaZi endpoint requires hour/minute — placeholder `12:00` is sent and
  `bazi.hour_pillar_confidence="low"`, `hour_pillar_used_for_interpretation=false`
  flag the model not to make hour-pillar-specific claims.
- BaZi Flow under unknown birth time → set `time_confidence="reduced"`.

## BaZi sex field

- `sex: "M"` or `"F"` — required because it controls luck-cycle direction.
- Collected in the intake form (`intakes.bazi_sex`).
- Used only for BaZi + BaZi Flow API calls. Never surfaced in user copy.
- If missing for BaZi Flow → `bazi_flow.available=false`, `reason="missing_bazi_sex"`.

## Interpretation stripping (CRITICAL)

All API responses pass through `stripInterpretation()` before persistence.
Keys removed recursively: `interpretation`, `interpretations`, plus provider
prose fields surfaced by `/moon/phase` and `/chinese/bazi/flow`
(`rationale`, `advice`, `summary_text`, `description` blocks containing prose).

**Claude must never see provider prose.** Always request provider
interpretation disabled when the endpoint supports it
(`include_interpretation=false`, `dictionary_response=false`, etc.).

## Sign normalization

API returns abbreviated zodiac names in many fields. `sign-normalizer.ts`
converts to canonical English names (Tau→Taurus, Cap→Capricorn, …) before
any field is written to `normalized_json`.

---

## Moon Phase endpoint

`GET /api/v1/moon/phase`

**Use for:**
- YEAR module — small timing tone, never overriding slow transits or Solar Return
- BODY module — soft emotional rhythm nuance
- STYLE module — symbolic visual tone

**Date:** report generation date (UTC).
**Location fallback:** birth lat / lon / timezone (no current-location intake change).

**Query flags (required):**
- `include_zodiac=true`
- `include_special=true`
- `include_eclipse=true`
- `include_forecast=true`
- `include_traditional_moon=true`
- `include_visuals=false`
- `include_interpretation=false`

**Do NOT** store SVG visuals. **Do NOT** render moon visuals in the PDF.
**Do NOT** create a standalone "Your Moon Phase Meaning" section in the report.

**Normalized shape:** see `moon_phase` block in `types.ts` (compact deterministic
fields only — phase name, illumination, age, zodiac sign, special-moon flags,
eclipse flags, traditional name, next-phase forecast).

On failure: `moon_phase = { available: false, reason }`. Generation continues.

---

## BaZi Flow endpoint

`POST /api/v1/chinese/bazi/flow`

**Use for:**
- YEAR module — annual/monthly timing layer

**Request:**
- Same birth data as BaZi (year/month/day/hour/minute/city/lat/lng/sex)
- `target_year = currentYear`
- `target_year_end = currentYear` (single year only — no multi-year ranges)
- `mode = "summary"` (never `"standard"`/`"debug"` in production)
- `include = ["interactions", "stars"]`
- `dictionary_response = false`

**Normalized shape:** see `bazi_flow` block in `types.ts` (annual pillar,
monthly pillars, interactions, stars, ten-god labels, `time_confidence`).
Strip all provider prose / interpretation / rationale / advice.

On failure / missing sex / etc.: `bazi_flow = { available: false, reason }`.
Generation continues.

---

## Module usage routing (where each layer belongs)

| Module | Primary signals | Enrichment that may converge |
|---|---|---|
| CORE  | Natal + BaZi pillars + Life Path + Birth Day + Day Master | Expression/Soul Urge/Personality if `full_name_for_numerology` exists AND converges |
| LOVE  | Venus, Mars, Moon, 5H, 7H, Descendant | Name numerology only if it reinforces the relationship pattern. No synastry in MVP. |
| MONEY | 2H, 6H, 8H, 10H, Jupiter, Saturn, Venus, Pluto | Life Path / Expression / Maturity; BaZi favorable elements + structure |
| BODY  | Moon, Mars, Saturn, 6H | BaZi element imbalance; Moon Phase as soft rhythm note. **No medical claims.** |
| YEAR  | Slow transits + Solar Return + Personal Year | BaZi Flow as annual/monthly layer; Moon Phase as small texture. Daily moon must NOT overpower slow transits or SR. |
| STYLE | Venus, Ascendant, Moon | BaZi element balance; Expression/Soul Urge as aesthetic nuance; Moon Phase as symbolic visual tone. Visual-resonance language only. **No healing/luck/protection/attraction claims.** |
| PLACE | Moon, IC, 4H, angular planets | BaZi favorable elements. Astrocartography NOT in MVP — never name specific cities without real ACG line data. |

## Human-readable output guardrail

All new data layers are **source material**, not report content.

- The customer-facing report must remain human-readable, premium editorial,
  practical, and emotionally intelligent.
- Technical data mostly belongs in `proof_tags`, not in long explanatory blocks.
- Never create standalone generic sections such as
  "Your Name Numerology" / "Your Moon Phase Meaning" / "Your BaZi Flow Reading" /
  "Your Lucky Numbers" / "Your Moon Energy".
- Blend enrichment only when it converges with the module theme.

**Forbidden language across all modules:** destiny, fate, soul mission,
vibration, lucky number, healing, protection, attraction, mystical guarantees,
medical claims, legal claims, financial guarantees.

## Error handling matrix

| Endpoint | Failure handling |
|---|---|
| Natal | Abort generation, mark `failed_generation`. |
| Transits | `available=false`, YEAR module weakened. |
| BaZi | `available=false`, no BaZi claims allowed. |
| Solar Return | `available=false`, YEAR falls back to transits + personal year. |
| Moon Phase | `available=false`, YEAR/BODY/STYLE skip the moon nuance layer. |
| BaZi Flow | `available=false`, YEAR skips annual BaZi timing layer. |
| `429 Too Many Requests` | Honour `Retry-After` (≤6s) else 1.5s backoff, cap 1 retry per endpoint. |

## Verification checklist

1. `astro_data.normalized_json.meta.provider_name === "freeastroapi"`
2. `natal.planets.length >= 10`
3. If birth time known → 12 houses + ASC + MC present.
4. `bazi.day_master` set when `bazi.available`.
5. `bazi.current_luck_cycle` set when API returns luck pillars covering current year.
6. `transits.aspects[*].is_applying` and `high_priority` propagated.
7. Solar Return endpoint exactly `/api/v1/western/solar/calculate`.
8. `moon_phase` block compact, no `interpretation*` keys anywhere.
9. `bazi_flow` block compact, single year, no prose.
10. `interpretation_leak === false` across the full payload.
11. Generated CORE JSON references real chart data in `proof_tag` fields.
12. Report preview is editorial — no "Your Moon Phase Meaning" / "Your Name Numerology" / "Your BaZi Flow Reading" sections.
