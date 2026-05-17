# FreeAstroAPI — Integration Reference

Locked snapshot of the FreeAstroAPI surface used by Darrow Code.
Source check date: 2026-05-17.

## Auth

- Base URL: `https://api.freeastroapi.com`
- Header: `x-api-key: <FREEASTROAPI_KEY>` (server-only, never in frontend)
- Header: `Content-Type: application/json`
- Secret name: `FREEASTROAPI_KEY` (Lovable/Supabase Secrets only)

## Endpoints

| Purpose | Method | Path |
|---|---|---|
| City search / geocoding (NOT used — Geoapify kept) | GET | `/api/v2/geo/search?q=...&limit=10` |
| Western natal | POST | `/api/v1/natal/calculate` |
| Western transits | POST | `/api/v1/transits/calculate` |
| Chinese BaZi (Four Pillars) | POST | `/api/v1/chinese/bazi` |
| Western Solar Return | POST | `/api/v1/western/solar/calculate` |

**Do NOT use** the deprecated `/api/v1/solar-return/calculate` path.

## Provider behaviour

- Natal is CRITICAL → on failure the generation pipeline aborts and the order is marked `failed_generation`.
- Transits / BaZi / Solar Return are GRACEFUL → on failure each block is persisted as `{ available: false, reason }` and Claude is instructed to skip that data.

## Unknown birth time rules

- `time_known: false` is forwarded to natal, transits, solar return.
- Houses / angles / Ascendant / MC / IC / Descendant are kept `null` in `normalized_json`.
- BaZi endpoint *requires* hour/minute — placeholder `12:00` is sent and
  `bazi.hour_pillar_confidence="low"`, `hour_pillar_used_for_interpretation=false` flag the model not to make hour-pillar-specific claims.

## BaZi sex field

- `sex: "M"` or `"F"` — required because it controls luck-cycle direction.
- Collected in the intake form (`intakes.bazi_sex`).
- Used only for the BaZi API call. Not surfaced in any user copy or report text.

## Interpretation stripping

All API responses pass through `stripInterpretation()` before persistence.
Keys removed: `interpretation`, `interpretations`. Claude never sees provider prose.

## Sign normalization

API returns abbreviated zodiac names in many fields. The `sign-normalizer.ts`
map converts them to canonical English names (Tau→Taurus, Cap→Capricorn, …)
before any field is written to `normalized_json`.

## Error handling matrix

| Endpoint | Failure handling |
|---|---|
| Natal | Abort generation, mark `failed_generation`. |
| Transits | `available=false`, YEAR module weakened. |
| BaZi | `available=false`, no BaZi claims allowed. |
| Solar Return | `available=false`, YEAR falls back to transits + personal year. |
| `429 Too Many Requests` | Exponential backoff with jitter (cap 3 retries), honours `Retry-After`. |

## Verification checklist

1. `astro_data.normalized_json.meta.provider_name === "freeastroapi"`
2. `natal.planets.length >= 10`
3. If birth time known → 12 houses + ASC + MC present.
4. `bazi.day_master` set when bazi.available.
5. `bazi.current_luck_cycle` set when API returns luck pillars covering current year.
6. `transits.aspects[*].is_applying` and `high_priority` propagated.
7. Solar Return endpoint exactly `/api/v1/western/solar/calculate`.
8. Generated CORE JSON references real chart data in `proof_tag` fields.
