# CORE v4.1 — Source-of-Truth Map (B5.0)

**Date:** 2026-06-03
**Phase:** B5.0 — Knowledge/Docs Audit + Diagnostic Fixture Alignment
**Status:** docs-only map. Governs how B5.0 chooses sources for the **diagnostic
fixture/content contract only**. It authorizes no production, schema, prompt, or
runtime change.

---

## 1 · Canonical docs for B5.0

These are the authoritative sources used to align the diagnostic CORE fixture.

| Doc | Role for B5.0 |
|---|---|
| `docs/SOURCE_OF_TRUTH_v4_1.md` | **Top-level governance.** File status, product identity, structure locks (26pp / 4,350–5,250 words / 17 keys), safety locks, what is/isn't authorized. |
| `docs/DARROW_DOCS_AUDIT_AND_PLAN_v4_1.md` | **Controlling migration map** — file status + conflict resolution + migration order (governs together with SOURCE_OF_TRUTH). |
| `docs/DARROW_CORE_MASTER_PATTERN_v4_1.md` | **Canonical structure** — section sequence, per-section word targets, proof-tag/protocol/warning formats, visual order. |
| `docs/darrowcode_core_module_spec_v4_1.md` | Runtime content map (which sections carry protocols/warnings). |
| `docs/DARROW_REPORT_CONTENT_STANDARD_v4_1.md` | **Quality / pass-fail layer** — voice, scenario-first rule, proof-tag rules, safety. |
| `docs/DARROW_CORE_SAMPLE_REPORT_v4_1.md` | **Gold reference (canonical sample text).** The Dmitry sample; the text source for the diagnostic fixture. |
| `docs/DARROW_CORE_PRODUCT_CONCEPT_STANDARD_v4_1.md` | Product intent / philosophy / boundaries. |

## 2 · Reference-only (not a content/text source)

| Doc | Role |
|---|---|
| `docs/render-only-2026-06-02T09-20-00-731Z.pdf` | **Internal visual/content-density baseline only.** NOT the structural authority — it is a 21-page internal render; the v4.1 target is 26 pages / 4,350–5,250 words / 17 keys. Where its text conflicts with the gold MD, the **gold MD wins**. Reference only; not production, not runtime, not customer-facing; not modified. |
| `phe.pdf` (external) | Generic external density/completeness benchmark **only**. NOT the Darrow pattern. Never copied. Not committed. |

## 3 · Future migration planning only (do NOT implement in B5.0)

| Doc | Role |
|---|---|
| `docs/schema_template_patch_v4_1.md` | **Future migration planning only.** Inspected for the conceptual field model + locked labels. No production schema/template change in B5.0. |
| `docs/darrowcode_ai_system_prompt_v4_1.md` | Future prompt source — **not active runtime.** Untouched in B5.0. |

## 4 · Knowledge base (supporting interpretation only)

`docs/knowledge/**` is governed by `docs/knowledge/SOURCE_POLICY.md`. For B5.0 it is
**supporting interpretation reference only** — not a runtime source. Per policy:
original Darrow Code expression only; no copying/paraphrasing copyrighted text; no
Astro.com/Astrodienst/Swiss-Ephemeris PDFs in repo; no deterministic claims; no
lucky/healing/protection claims; colors/stones/symbolic allies are **not
production-ready** until a curated Darrow rules dict exists (currently policy-ready,
dict pending). The diagnostic fixture does not introduce any color/stone/ally claim.

## 5 · Legacy / do-not-use as source

`docs/archive/**` (old v3 SOURCE_OF_TRUTH, old prompts, old module spec, old quality
examples). History only. If a legacy file conflicts with the approved package, the
package wins.

---

## 6 · Which file defines what

| Concern | Authoritative file(s) |
|---|---|
| Report structure (sections, order, pages) | `SOURCE_OF_TRUTH_v4_1.md` (17-key lock) + `MASTER_PATTERN_v4_1.md` (page map) + `schema_template_patch_v4_1.md` (conceptual field model) |
| Section density (word targets) | `MASTER_PATTERN_v4_1.md` (per-section targets) + `SOURCE_OF_TRUTH` (totals) |
| Tone / voice | `DARROW_REPORT_CONTENT_STANDARD_v4_1.md` + `MASTER_PATTERN` (Voice Anchor) + gold sample |
| Proof / reference anchors | `MASTER_PATTERN` (format, ≤5) + `CONTENT_STANDARD §10` (real-data rule) |
| Astrology rules | `docs/knowledge/ASTRO_INTERPRETATION_RULES_v1.md` + `docs/knowledge/rules/ASTRO_*` |
| BaZi rules | `docs/knowledge/BAZI_INTERPRETATION_RULES_v1.md` |
| Numerology rules | `docs/knowledge/NUMEROLOGY_RULES_v1.md` |
| Safety rules | `SOURCE_OF_TRUTH §10` + `CONTENT_STANDARD §17–§19` + `SOURCE_POLICY` + `CORE_MODULE_REQUIREMENTS §9` |
| Sample report content | `DARROW_CORE_SAMPLE_REPORT_v4_1.md` (gold) |
| Locked labels / disclaimer | `schema_template_patch_v4_1.md §7A` (exec labels, closing pillars, vitality disclaimer) |

---

## 7 · Conflicts found and resolutions

| # | Conflict | Resolution |
|---|---|---|
| 1 | Render-only PDF shows **Gemini Ascendant**; gold MD shows **Cancer Ascendant** (Sun/Moon/rising all Cancer). | Gold MD (8-file package) is the **text authority**; render-only PDF is visual/density baseline only. Fixture uses the **Cancer-ASC** gold frame, internally consistent across all 17 sections. |
| 2 | Render-only PDF = **21 pages**; v4.1 target = **26 pages**. | Render-only PDF is **not** the structural authority. The diagnostic renderer renders the 17 generated sections + Cover + Method/Orientation + Closing; it does **not** render the static Library/Back-Cover pages. The full 26-page production layout is a later template phase, not B5.0. |
| 3 | "Client Snapshot" page exists in render-only PDF, but `client_snapshot` is **not** one of the 17 generated keys (flagged "phantom" in the schema-patch v3 predecessor). | Client Snapshot in the diagnostic = the **Personal Orientation System / identity-card payload** (name, birth data, Sun/Moon/Asc, Life Path, BaZi Day Master, dominant element, archetype). It is passed as **separate metadata** to the renderer, **not** as an 18th generated section key. The 17-key lock is preserved. |
| 4 | Master pattern requires **3 RECHARGE PROTOCOLS** in Battery; user's repeated-label rule forbids stacked identical blocks. | For the **diagnostic presentation**, Battery folds the three recharge methods into prose + **one** protocol block (distinct, editorial). Deliberate, documented deviation justified by the repeated-label rule; renderer untouched. |

No conflict blocks B5.0. All are resolved by the established hierarchy.

---

## 8 · Scope statement

- **B5.0 updates the diagnostic fixture and the content contract only.** It does
  not change production, schema, `system-prompt.ts`, AI prompts, routes, Stripe,
  checkout, email, Supabase, or the renderer (unless explicitly required and noted).
- `operating_mode` remains **migration-gated for production**; it appears in the
  **diagnostic** fixture (render-only) consistent with the gold sample, and is not
  added to the live pipeline here.
- **B5.1 (later, after approval)** may update production prompt/system integration.
  `system-prompt.ts` and AI prompts remain untouched in B5.0.

---

## 9 · Data Layer / FreeAstroAPI Availability Map

Documentation only. B5.0 does **not** call FreeAstroAPI, change provider code, or
change runtime mapping. Authoritative shape: `src/lib/astro/types.ts`
(`DarrowChartData`); numerology computed in `src/lib/numerology/numerology.ts`;
provider `src/lib/astro/freeastroapi-provider.server.ts`; reference
`src/lib/astro/FREEASTROAPI_REFERENCE.md`. Provider lock: **FreeAstroAPI** (per
`SOURCE_OF_TRUTH §9`).

### 9.1 Western astrology (FreeAstroAPI natal)

| Signal | Availability |
|---|---|
| Sun sign | ✅ Always |
| Moon sign | ✅ Always |
| Planet positions (Mercury→Pluto): sign, degree, retrograde, dignity | ✅ Always |
| Aspects (conjunction/opposition/trine/square/sextile): type, orb, is_applying | ✅ Always (as provided) |
| Element balance / modality (e.g. "Water Dominant 59%", "Cardinal Mode") | ✅ Derived/calculated from positions |
| Chart shape (Bundle/Bowl/…) | ✅ Derived (from positions) |
| Ascendant (Rising) | ⚠️ **Only if `birth_time_known=true`** (`natal.ascendant` null otherwise) |
| Midheaven / MC, IC, Descendant (`angles_details`) | ⚠️ **Only if `birth_time_known=true`** |
| Houses 1–12 + planet-in-house | ⚠️ **Only if `birth_time_known=true`** (`natal.houses` null otherwise) |
| Stelliums | ✅ Derived (house-stelliums need birth time) |

### 9.2 BaZi (FreeAstroAPI, `bazi.available`)

| Signal | Availability |
|---|---|
| Day Master (e.g. "Gui Water") | ✅ When `bazi.available` |
| Four Pillars (year/month/day/hour) | ✅ When available (hour pillar needs birth time; `hour_pillar_confidence`) |
| Element balance / strength (`elements.percentages`, dominant, deficient) | ✅ When available |
| Luck cycle / current luck cycle | ✅ When available (`bazi.luck_cycle`, `current_luck_cycle`) |
| Annual / monthly flow pillars (`bazi_flow`) | ✅ When available (timing layer) |

### 9.3 Numerology (in-code, `src/lib/numerology/numerology.ts`)

| Signal | Availability |
|---|---|
| Life Path | ✅ Always (from DOB) |
| Birth Day number | ✅ Always (from DOB) |
| Personal Year (+ master marker) | ✅ Always (from DOB + current year) |
| Expression | ⚠️ **Only if full name provided** |
| Soul Urge | ⚠️ **Only if full name provided** |
| Personality | ⚠️ **Only if full name provided** |
| Maturity | ⚠️ Only if Expression + Life Path available |
| Hidden Passion numbers | ⚠️ Only if full name provided |
| Karmic Lessons | ⚠️ Only if full name provided |

### 9.4 Personal Orientation System / identity-card payload (template-extracted)

Assembled from the above for the POS page (not a generated section): client name,
birth date/time/place, Sun sign, Moon sign, Ascendant (if birth time), Life Path,
BaZi Day Master, dominant element, professional archetype (if derived). No new data;
a presentation of already-available fields.

### 9.5 Future / deferred (not CORE in B5.0)

- Astrocartography / PLACE lines — PLACE focused chapter only (`birth_time_known=true` + purchase).
- Solar Returns (`solar_return` block exists) — deferred; not a CORE layer now.
- Progressions — not supported.
- Transits (`transits` block exists) — CORE timing relies on **Personal Year** (and BaZi flow where available), **not** transits, per `CONTENT_STANDARD §19`.
- Colors / stones / symbolic allies — **gated**; curated Darrow dict pending (`SOURCE_POLICY`).

### 9.6 Must-not-use

- Houses, Ascendant, MC/IC/Descendant when `birth_time_known=false`.
- Aspects or exact degrees not present in provider data; **no invented placements**.
- **No invented proof tags** (every tag references real available data).
- Astro.com / Astrodienst / Swiss Ephemeris PDFs as repo assets.
- Copyrighted report text or protected tables.

### 9.7 Proof-anchor rule + diagnostic-fixture compliance

Every proof/reference anchor in the diagnostic fixture must be one of:
1. **present in the canonical internal sample** (`DARROW_CORE_SAMPLE_REPORT_v4_1.md`), or
2. clearly marked **deterministic fixture-only**, or
3. available from documented FreeAstroAPI / numerology / BaZi data.

**Birth-time gate:** use houses, angles, Ascendant, MC/IC/Descendant **only if
`birth_time_known=true`**.

**Diagnostic fixture status:** the B5.0 fixture is the **full-quality case** —
sample client *Dmitry* with `birth_time_known=true`, full name present, BaZi
available. **All anchors are drawn verbatim from the canonical internal gold
sample** (rule 1) and are therefore deterministic fixture data. House/angle anchors
(e.g. `Sun conjunct ASC 0°43'`, `Saturn Virgo 4H`, `MC Aquarius 29°`) are valid in
this case because the sample has a known birth time. In production, the same
sections must drop house/angle anchors when `birth_time_known=false`. No anchor in
the fixture was invented; none claims data outside the documented layers above.

### 9.8 Rules-folder consistency check (`docs/knowledge/rules/`)

Reviewed `docs/knowledge/rules/` (all marked docs-only / not runtime authority).
The fixture anchors are consistent with them:

- **`BIRTH_TIME_RELIABILITY_POLICY_v1.md`** decision table: with `exact` birth time,
  houses + Ascendant + MC/IC/DC are allowed. The sample has an exact time, so the
  house/angle anchors are permitted. (Production must follow the `unknown` row and
  drop them when birth time is missing.)
- **`ELEMENT_MODALITY_RULES_v1.md §4.1`**: dominant element/modality = 3+ personal
  planets in one element. Sun/Moon/Mercury in Cancer ⇒ "Water Dominant" + "Cardinal
  Mode" are valid; fixture prose stays descriptive (no forbidden "water person
  therefore…" determinism).
- **`ASTRO_ASPECT_RULES_v1.md §2`** orb policy: all fixture aspect anchors are within
  orb (`conj ≤8–10°`, `square ≤6–8°`, `opposition ≤8–10°`), and prose names the two
  functions rather than issuing a verdict — no "bad aspect" framing.

No rule in `rules/` conflicts with the fixture or the content contract.
