# FREEASTROAPI / DARROW CODE — PLACE-READY REFERENCE (v3 runtime baseline)

# Status: REFERENCE DOCUMENTATION ONLY — not a Lovable prompt, not implementation

# Governed by: docs/SOURCE_OF_TRUTH_v4_1.md

# Created: 2026-05-29

---

## 1 · STATUS / PURPOSE

This is a **documentation-only reference file**. It aligns FreeAstroAPI and
PLACE module rules with the approved v4.1 CORE standard.

It is NOT:

- A Lovable / Claude Code implementation prompt
- Runtime instructions
- Schema instructions
- Provider implementation code
- Authorization to implement anything

It must NOT be pasted into Lovable. It must NOT authorize any runtime change.
Use it only as a structured reference for understanding the boundary between
what CORE uses today and what a future PLACE chapter may use.

---

## 2 · SOURCE HIERARCHY

| Source                                                   | Role                                              |
| -------------------------------------------------------- | ------------------------------------------------- |
| `docs/SOURCE_OF_TRUTH_v4_1.md`                           | Governing document — CORE/PLACE boundary          |
| `docs/DARROW_DOCS_AUDIT_AND_PLAN_v4_1.md`                | Migration map                                     |
| `docs/darrowcode_core_module_spec_v4_1.md`               | Per-module data routing                           |
| `src/lib/astro/FREEASTROAPI_REFERENCE.md`                | Current active provider reference (runtime)       |
| `docs/darrowcode_freeastroapi_lovable_prompt_v2.md`      | Historical integration guide (reference only)     |
| `docs/FreeAstroAPI_DarrowCode_Integration_Updated_v2.md` | Updated v2 integration reference (reference only) |
| `docs/freeastroapi.md`                                   | Raw API reference notes (reference only)          |

The three `docs/FreeAstroAPI*` files are historical/provider references.
They must NOT be used as source instructions. The new governing rules for
PLACE data are defined in this file, derived from the approved v4.1 package only.

---

## 3 · SECURITY RULES

- `FREEASTROAPI_KEY` must exist ONLY in local `.env*` files or production Cloudflare
  Workers environment secrets.
- Do NOT print the key. Do NOT copy the key. Do NOT commit the key.
- Do NOT create a `.env` file with a real key.
- Do NOT remove or overwrite working local env files.
- If `docs/API.docx` exists: treat it as UNSAFE — it contains a raw FreeAstroAPI key.
  Do not commit it. Do not copy the key. Recommend key rotation if the key may still
  be active. Do NOT use it as an implementation source.
  **Status as of this audit: `docs/API.docx` was NOT FOUND in this repository.**
- `.env`, `.env.development`, `.env.production` are tracked by git (YELLOW FLAG — see
  `CORE_V4_1_IMPLEMENTATION_READINESS_AUDIT.md` §8). They currently contain only
  public/publishable keys. Real secrets are not in tracked files. Phase 2 action:
  add these files to `.gitignore` and untrack them.

---

## 4 · CURRENT CORE PROVIDER STACK

**Provider:** FreeAstroAPI (production, unchanged)
**Implementation:** `src/lib/astro/freeastroapi-provider.server.ts`
**Interface:** `src/lib/astro/provider.ts`
**Reference:** `src/lib/astro/FREEASTROAPI_REFERENCE.md`
**Fallback:** `src/lib/astro/mock-provider.server.ts` (dev/test only)

Endpoints currently used for CORE generation:

- Natal chart (planets, aspects, element balance, chart shape)
- BaZi / Four Pillars (if birth_time_known or date is sufficient)
- Numerology (Life Path, Birth Day; Expression/Soul Urge/Personality with full name)
- Transits (slow planets, major aspects within 2° orb)
- Solar Return (if available; used by YEAR module)

No changes to provider implementation are authorized in this task.
No astrocartography endpoints are currently called anywhere in the codebase.

---

## 5 · CORE / UNVEIL PLACE RULE

**This rule is locked in `SOURCE_OF_TRUTH_v4_1.md` §9 and §10.**

> CORE Report: UNVEIL uses **environmental resonance only**.

CORE generates the `environment_and_resonance` section based on:

- Environmental qualities derived from Moon, IC, 4th house placements
- BaZi favorable elements (if available): climate type, elemental affinity
- Landscape type: water proximity, density, quiet, nature access, privacy needs
- Sensory load tolerance: urban vs. retreat preference
- Home-base requirements: stability, anchor points, pace

CORE must NOT:

- Name specific cities or countries
- Rank "best places to live"
- Reference astrocartography lines or parans
- Make relocation recommendations
- Call any FreeAstroAPI astrocartography endpoint

**Astrocartography = future PLACE-only capability. It is NOT part of CORE and is NOT
implemented now.** Do not call astrocartography globally. Do not add city rankings to CORE.

---

## 6 · PLACE CHAPTER DATA RULE

The PLACE focused chapter (add-on, future scope) MAY use astrocartography data, but:

**Requirements — ALL must be true simultaneously:**

1. PLACE module is purchased by the customer
2. `birth_time_known = true` (accurate birth time required for meaningful astrocartography)
3. Real astrocartography data returned from FreeAstroAPI (not mocked, not inferred)

If any condition is false: generate environmental resonance only (same as CORE rule).
Do not fallback to city guessing. Do not invent relocation recommendations.

**PLACE is future implementation scope.** It is not authorized in this audit/planning task.

---

## 7 · ASTROCARTOGRAPHY ENDPOINT MAP (FUTURE PLACE REFERENCE)

The following FreeAstroAPI endpoints may be used by a future PLACE chapter implementation.
They are listed here as a reference map only. No code calls them now. No implementation
is authorized.

| Endpoint                                                | Purpose                                                            | Notes                        |
| ------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------- |
| `POST /api/v1/western/astrocartography/recommendations` | Location resonance recommendations based on natal + birth data     | Requires accurate birth time |
| `POST /api/v1/western/astrocartography/city-check`      | Check resonance score for a specific city                          | Requires birth time          |
| `POST /api/v1/western/astrocartography/relocation`      | Relocation chart for a destination city                            | Requires birth time          |
| `POST /api/v1/western/astrocartography/lines`           | Astrocartography planetary lines (which planets are angular where) | Requires birth time          |
| `POST /api/v1/western/astrocartography/parans`          | Parans — latitude bands where planetary lines cross                | Requires birth time          |

These endpoints are not a complete list of all possible FreeAstroAPI endpoints.
Consult `src/lib/astro/FREEASTROAPI_REFERENCE.md` and `docs/freeastroapi.md` for
current endpoint documentation.

**AI data rule:** Do NOT pass raw GeoJSON or full endpoint response dumps to Claude.
Pass only compact normalized summaries (resonant_qualities[], city name + score,
line type + planet — not raw geometry). Claude must not receive unparsed endpoint output.

**Important: astrocartography is broader than "lines only."** Future PLACE may use
the full endpoint set above (recommendations, city-check, relocation, lines, parans)
depending on what data is returned and what the PLACE chapter spec requires.
Do not pre-constrain PLACE to lines-only. Define PLACE's data scope when the
PLACE master pattern is built.

---

## 8 · NORMALIZED PLACE DATA SHAPE — CONCEPTUAL ONLY

If and when astrocartography data is fetched (future PLACE scope only), the
normalized result would conceptually include:

```
// Conceptual only — no code, no types
{
  available: boolean,
  birth_time_required: true,       // always true for astrocartography
  // If available=true:
  resonant_qualities: string[],    // environmental characteristics, not city names
  lines_summary?: {                // from POST /api/v1/western/astrocartography/lines
    planet: string,
    line_type: string,             // e.g., "ASC", "MC", "DSC", "IC"
    longitude_degrees: number,
  }[],
  recommendations?: {             // from POST /api/v1/western/astrocartography/recommendations
    city: string,
    country: string,
    resonance_score: number,
    qualities: string[],
  }[],
  relocation_notes?: string,      // from POST /api/v1/western/astrocartography/relocation or /city-check
}
```

This shape is conceptual planning only. The actual normalization will be defined
during PLACE chapter implementation, after CORE v4.1 is complete and approved.

---

## 9 · AI USAGE RULES FOR PLACE

When the PLACE chapter is eventually implemented:

- Environmental resonance language is always safe (even without astrocartography data).
- Astrocartography claims require `birth_time_known=true` AND real returned data.
- If `birth_time_known=false`: generate environmental resonance only. No line claims.
  No city recommendations. Use hedged language: "Your chart suggests an affinity
  for [environmental quality]…"
- If `birth_time_known=true` but astrocartography data unavailable: same as above.
- If astrocartography data available: city and line data may be referenced, but
  must cite the data point and must not make guarantee-level claims.
- No "best city in the world" or "you must move to X" framing.
- PLACE = orientation and resonance, not prediction or prescription.

---

## 10 · UNKNOWN BIRTH TIME RULE

`birth_time_known = false` affects both CORE and future PLACE:

**CORE (current runtime):**

- No Ascendant, no MC, no house placements, no house rulers
- No angles-based environmental claims
- Use: "If your birth time is accurate, your Ascendant may indicate…"

**PLACE (future scope):**

- Astrocartography requires accurate birth time. If `birth_time_known=false`:
  the PLACE chapter must fall back to environmental resonance only.
- Do not call astrocartography endpoints if birth_time_known=false.
- Disclose to the customer that without accurate birth time, city-specific
  recommendations are not available.

This rule applies regardless of which FreeAstroAPI endpoint is called.

---

## 11 · PROVIDER / COST / PERFORMANCE RULES

- FreeAstroAPI remains the production provider. No provider change is authorized.
- Provider calls are made server-side only (never client-side, never from browser).
- `FREEASTROAPI_KEY` must remain a server-side secret.
- Chart data is computed once per intake and cached in `astro_data` table in Supabase.
  Re-uses cached data for PDF-only retries — no duplicate provider calls.
- Astrocartography endpoints (future PLACE) may be slower or more expensive
  per-call than natal chart endpoints. Cost and latency should be measured before
  enabling them in production.

---

## 12 · ASTRO.COM / ASTRO-SEEK RULE

Astro.com and Astro-Seek are **manual sanity-check tools only**:

- They may be used by developers to manually verify chart calculations.
- They are never production APIs.
- They are never scraping targets.
- Do not build any automated integration with Astro.com or Astro-Seek.

---

## 13 · RELATION TO EXISTING FREEASTROAPI v2 DOCS

| Existing doc                                             | Relation to this file                                                                                                  |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `docs/darrowcode_freeastroapi_lovable_prompt_v2.md`      | Historical integration guide. Do not use as source instruction. Superseded by this file for PLACE/CORE boundary rules. |
| `docs/FreeAstroAPI_DarrowCode_Integration_Updated_v2.md` | Updated v2 reference. Historical/reference only. Add DEPRECATED header in Phase 2.                                     |
| `docs/freeastroapi.md`                                   | Raw API notes. Reference only.                                                                                         |
| `src/lib/astro/FREEASTROAPI_REFERENCE.md`                | Active runtime provider reference. Not superseded — still the authoritative provider implementation doc.               |

This file does NOT replace `src/lib/astro/FREEASTROAPI_REFERENCE.md`. That file remains
the runtime provider reference. This file adds the CORE/PLACE data boundary rules.

---

## 14 · RELATION TO LOVABLE

This file must NOT be pasted into Lovable as an implementation prompt.

When a PLACE chapter implementation is eventually authorized:

1. A separate PLACE master pattern and product concept standard must be created first.
2. A separate PLACE module spec must be built.
3. A clean PLACE implementation prompt must be assembled from the approved PLACE
   package only — not from this reference file.
4. This file may inform the PLACE implementation prompt as background reference,
   but must not substitute for the proper PLACE doc package.

---

## 15 · CHANGELOG

| Version                     | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v3-place-ready (2026-05-29) | Initial creation. Aligns FreeAstroAPI / PLACE rules with v4.1 CORE standard. Governs CORE/PLACE data boundary: CORE = environmental resonance only; astrocartography = future PLACE-only capability with birth_time_known=true + real data. Documents endpoint map for future reference. Establishes security rules, unknown-birth-time rule, provider/cost rules. Confirms API.docx not found in repo. Notes tracked .env files (yellow flag, public keys only). Not a Lovable prompt. No implementation authorized. |

---

🔒 STATUS: REFERENCE DOCUMENTATION ONLY · no implementation · no runtime changes · not a Lovable prompt
