# Darrow Code — Source of Truth

# docs/current/SOURCE_OF_TRUTH.md

**Last updated:** v3.0 cleanup
**Purpose:** Single reference for what is active, what is archived, and which file wins in case of conflict.

---

## ACTIVE RUNTIME (these files control what runs in production)

| File                                        | Role                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `src/lib/ai/darrowcode_ai_system_prompt.md` | Active AI prompt — voice, word targets, section structure, data rules |
| `src/lib/ai/user-prompt.ts`                 | Serializes normalized DarrowChartData into Claude user message        |
| `DarrowReportSchema` (in codebase)          | Validates JSON returned by Claude                                     |
| `src/lib/pdf/template.ts`                   | Maps JSON section keys to PDF pages                                   |
| `src/lib/astro/FREEASTROAPI_REFERENCE.md`   | Active provider reference — endpoints, auth, normalization map        |

**Conflict rule:** If any doc/archive file contradicts an active runtime file, the active runtime file wins.

---

## ACTIVE CONTENT SPECS (these define what good output looks like)

| File                                           | Role                                                                    |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| `src/lib/ai/DARROW_REPORT_CONTENT_STANDARD.md` | Quality bar — what a Darrow Code report must feel like                  |
| `src/lib/ai/darrowcode_core_module_spec.md`    | CORE v3 blueprint: 17 sections, 3,000–3,600 words, 18–20 pages          |
| `src/lib/ai/darrowcode_addon_modules_spec.md`  | Add-on blueprint: 10 sections, 1,200–1,500 words, 8–10 pages per module |

**Conflict rule:** Content specs define intent. Runtime files implement it.
If content spec and runtime schema conflict, update runtime schema to match spec.

---

## CURRENT DOCUMENTATION (reference for building/launching)

| File                                                | Role                                            |
| --------------------------------------------------- | ----------------------------------------------- |
| `docs/current/darrowcode_lovable_prompt_v3.md`      | Current project build reference                 |
| `docs/current/darrowcode_launch_requirements_v3.md` | Current launch checklist and asset requirements |
| `docs/current/SOURCE_OF_TRUTH.md`                   | This file                                       |

---

## ARCHIVED (history only — do not use for implementation)

| File                                                               | Why archived                                                                                    |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `docs/archive/darrowcode_ai_system_prompt_v2.1.md`                 | Superseded by v3 — contains incorrect word targets (CORE 900–1160 words, add-ons 480–690 words) |
| `docs/archive/darrowcode_lovable_prompt_v1.md`                     | Contains mock provider references and old page counts                                           |
| `docs/archive/FreeAstroAPI_DarrowCode_Integration_Updated_v2.docx` | Implemented. Active reference is src/lib/astro/FREEASTROAPI_REFERENCE.md                        |

**Archived files are for history only.**
Do not use them for implementation unless intentionally restoring an older version.

---

## QUICK REFERENCE — v3 TARGETS (what is correct NOW)

| Module                                              | Pages | Words         | Sections                    |
| --------------------------------------------------- | ----- | ------------- | --------------------------- |
| CORE                                                | 18–20 | 3,000–3,600   | 17                          |
| Each add-on (LOVE, MONEY, BODY, YEAR, STYLE, PLACE) | 8–10  | 1,200–1,500   | 10                          |
| Full Code / CORE Complete                           | 65–75 | 12,000–14,000 | all above + grand_synthesis |

## DEPRECATED TARGETS (must not appear in any active/current file)

| Old value                    | Status     |
| ---------------------------- | ---------- |
| CORE 12–14 pages             | ❌ REMOVED |
| CORE 900–1,160 words         | ❌ REMOVED |
| Add-ons 6–8 pages            | ❌ REMOVED |
| Add-ons 480–690 words        | ❌ REMOVED |
| Full Code ~50 pages          | ❌ REMOVED |
| Old 8-section CORE structure | ❌ REMOVED |

---

## PROVIDER STATUS

| Component                      | Status                                          | Source of truth               |
| ------------------------------ | ----------------------------------------------- | ----------------------------- |
| Western natal + transits       | FreeAstroAPI — production                       | FREEASTROAPI_REFERENCE.md     |
| Bazi / Four Pillars            | FreeAstroAPI — production                       | FREEASTROAPI_REFERENCE.md     |
| Solar Return                   | FreeAstroAPI — production (birth time required) | FREEASTROAPI_REFERENCE.md     |
| Geocoding / city search        | FreeAstroAPI or Geoapify                        | FREEASTROAPI_REFERENCE.md     |
| Numerology (Life Path, PY)     | Internal calculation — no API needed            | user-prompt.ts                |
| Moon Phase                     | Enrichment field in normalized_json             | FREEASTROAPI_REFERENCE.md     |
| BaZi Flow / Ten Gods           | Enrichment field in normalized_json             | FREEASTROAPI_REFERENCE.md     |
| Provider interpretation blocks | STRIPPED — never passed to Claude               | generate-report edge function |
