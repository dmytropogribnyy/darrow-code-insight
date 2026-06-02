# DARROW CODE — SOURCE OF TRUTH v4.1

# Module: CORE Report: UNVEIL (Cosmic Core Code Method)

# Status: CANONICAL SOURCE OF TRUTH — v4.1 approved future standard; v3 runtime temporary

# Supersedes: any prior SOURCE_OF_TRUTH for documentation/migration governance

---

## 1 · STATUS / PURPOSE

This is the **canonical source of truth for CORE v4.1 documentation and
migration.** It governs file status, the approved source package, migration
guardrails, and implementation readiness.

It is **not** code, **not** a runtime prompt, **not** a schema, and **not** a
Loveable implementation instruction. It declares what is approved, what is
locked, and what is not yet authorized — nothing more.

In any conflict over file status, product identity, structure, or migration
order, this file and `DARROW_DOCS_AUDIT_AND_PLAN_v4_1.md` (the controlling
migration map) govern together; legacy files do not.

---

## 2 · APPROVED v4.1 PACKAGE

The complete approved source package is exactly these eight files:

| File                                           | Role                                                      |
| ---------------------------------------------- | --------------------------------------------------------- |
| `DARROW_DOCS_AUDIT_AND_PLAN_v4_1.md`           | Controlling migration map                                 |
| `DARROW_CORE_PRODUCT_CONCEPT_STANDARD_v4_1.md` | Philosophy / product intent                               |
| `DARROW_CORE_MASTER_PATTERN_v4_1.md`           | Canonical structure                                       |
| `DARROW_CORE_SAMPLE_REPORT_v4_1.md`            | Gold reference                                            |
| `DARROW_REPORT_CONTENT_STANDARD_v4_1.md`       | Quality layer                                             |
| `darrowcode_core_module_spec_v4_1.md`          | Module / content map                                      |
| `darrowcode_ai_system_prompt_v4_1.md`          | Future prompt source document — **not active runtime**    |
| `schema_template_patch_v4_1.md`                | Future migration planning — **not active implementation** |

These eight files are the **only** source package for future v4.1
implementation. No other file may be used as a source instruction.

---

## 2A · KNOWLEDGE BASE PACKAGE (B0 addition)

The `docs/knowledge/` directory is part of the canonical documentation package
from B0 onward:

| File | Role |
|---|---|
| `SOURCE_POLICY.md` | Governs all knowledge base source and content rules |
| `KNOWLEDGE_SOURCE_MATRIX_v1.md` | Approved data layers and their scope |
| `SYMBOLIC_IDENTITY_STANDARD.md` | Symbolic identity layer scope; identity card placement |
| `SOURCE_LOG.md` | Tracks external reference materials used |
| `COLORS_STONES_SYMBOLIC_ALLIES_v1.md` | Policy stub — dict pending KBv1 phase |
| `ARCHETYPE_LIBRARY_v1.md` | Partial stub — Gray Cardinal confirmed; full library pending |
| `NUMEROLOGY_RULES_v1.md` | Calculation layer active; interpretation dict pending |
| `ASTRO_INTERPRETATION_RULES_v1.md` | Data layer active; dict pending |
| `BAZI_INTERPRETATION_RULES_v1.md` | Data layer active; dict pending |

---

## 2B · PRIORITY RULE (B0 addition)

The latest user-approved product direction has **priority over older or
incomplete wording** in the existing v4.1 docs. This applies specifically to:

- Richer CORE reading experience
- Symbolic identity layer (colors, stones, symbolic allies, identity card)
- Name / numerology / birth-code interpretation
- Zodiac / Moon / Ascendant / planet / element / archetype indicators
- More varied, readable, and engaging report structure
- Stronger Darrow Code product feel

If the current v4.1 docs do not fully encode a latest product decision, that
decision is first applied via a docs-only B0 patch — then implemented in code.

**The following guardrails are NOT overridden by product direction:**
- CORE only for now — no add-ons yet
- FreeAstroAPI remains current provider
- No Astro.com / Astrodienst / Swiss Ephemeris / external PDF ephemeris in repo
- No copyrighted source copying or paraphrasing
- No payment / Stripe / email / auth / customer mutation changes
- Backward compatibility with v3 reports maintained
- No stored v3 report mutation
- No production switch before v4 diagnostic visual approval

---

## 3 · PRODUCT IDENTITY LOCK

- **Customer-facing name:** CORE Report: UNVEIL
- **Method / brand layer:** Cosmic Core Code Method
- CORE is **complete on its own**.
- **CORE Complete** = CORE Report + all six focused chapters.
- **Focused chapters:** LOVE / MONEY / BODY / YEAR / STYLE / PLACE.
- The **Full Destiny Codex is separate / future scope** — not part of the current
  CORE Library page.

---

## 4 · CORE STRUCTURE LOCK

- 26 pages
- 4,350–5,250 generated words
- exactly **17 generated CORE section keys**
- static / template-rendered pages are separate from generated keys
- `cover_tagline` is a VARIABLE cover sub-field (not a body section, not a static
  page)
- `operating_mode` is part of v4.1 but **migration-gated** (not live until
  render-fix approval)

The 17 generated keys, in fixed order:

1. `orientation`
2. `core_architecture`
3. `operating_mode`
4. `battery`
5. `social_interface`
6. `numerology_code`
7. `cognitive_style`
8. `drive_and_rhythm`
9. `professional_archetype`
10. `money_and_value`
11. `relationship_baseline`
12. `vitality_baseline`
13. `environment_and_resonance`
14. `shadow_and_friction`
15. `before_after`
16. `executive_summary`
17. `next_step`

No adding, removing, renaming, merging, or reordering.

---

## 5 · STATIC PAGES LOCK

Template-rendered, not AI-generated:

- Cover
- Personal Orientation System
- Library page
- Back Cover

The AI generates only the body sections, the `cover_tagline` sub-field, and
client metadata is supplied (name, birth data). It does not generate static page
copy.

---

## 6 · CURRENT RUNTIME STATUS

- **Render-fix approved** (2026-06-02, build marker `core-v3-1-layout-foundation-2026-06-02-2`).
- **B0 docs patch complete** (2026-06-02): reading experience standard encoded,
  symbolic identity layer defined, identity card placement decided (POS page 02),
  locked labels extracted from gold sample, `docs/knowledge/` policy layer created,
  legacy `docs/current/` archived.
- **v4.1 migration phases B1–B4 are now authorized** (schema → prompt → diagnostic
  route → template). Each phase gates the next.
- Current production / runtime remains **v3** until v4 diagnostic PDF is visually
  approved.
- **No production switch yet.** Pipeline.server.ts stays on v3 until B8 approval.
- No prompt swap in production runtime until B6 (after v4 JSON diagnostic passes).
- No template migration in production until B5 complete and visual PDF approved.

---

## 7 · MIGRATION GATE

| Condition | Status |
|---|---|
| Render-fix diagnostic approved | ✅ **2026-06-02** (build marker `core-v3-1-layout-foundation-2026-06-02-2`) |
| v3 PDF rendering visually stable | ✅ **2026-06-02** (visual inspection approved) |
| Backward-compatibility path defined | ✅ **2026-06-02** (PRE-B decision note: `CoreV3Schema` unchanged, `schema_version` discriminant, no v3→v4 coercion, no stored report mutation) |
| B0 docs patch complete | ✅ **2026-06-02** (reading experience, symbolic identity, locked labels, knowledge policy) |
| Implementation phases B1–B4 | ✅ **AUTHORIZED** — begin in order |
| Production switch (B8) | ⏳ **GATED** — awaits visual approval of v4 diagnostic PDF |

Implementation phases B1–B4 may now proceed in sequence.
Production switch to v4 remains gated on explicit visual approval after B7.

---

## 8 · DO NOT USE / ARCHIVE RULES

The following old v3/legacy files must **not** be used as source instructions for
v4.1 implementation:

- old Loveable prompts
- old Source of Truth
- old core module spec
- old AI prompt v3
- old prose structure rules
- old quality examples
- cleanup / final v3 prompts

They may be retained only as history or temporary diagnostic reference. If any
legacy file conflicts with the approved eight-file package, the package wins.

---

## 9 · DATA / PROVIDER LOCK

- **FreeAstroAPI remains the production provider.**
- Provider implementation is **not changed** by this documentation.
- No provider calls are changed yet.
- PLACE astrocartography endpoints are **future PLACE-chapter only — not CORE.**
- CORE uses **environmental resonance only.**

---

## 10 · SAFETY LOCKS

- **MONEY:** no wealth promises, no financial advice.
- **BODY:** no medical claims, diagnosis, or healing claims.
- **YEAR:** orientation, not prediction.
- **STYLE:** no lucky / healing / protection claims.
- **PLACE:** no cities / best places in CORE (environmental resonance only).
- **LOVE:** no guaranteed compatibility or attraction.
- **No direct cross-sell inside body sections.**

---

## 11 · BACKWARD COMPATIBILITY LOCK

- Existing v3 stored reports must remain renderable.
- A legacy path / adapter is allowed for old reports only.
- New v4.1 generations must use v4.1 keys.
- v4.1 must **fail loudly** if required keys are missing.
- **No silent fallback** to v3 keys.
- Do **not mutate** old stored reports.

---

## 12 · LIBRARY PAGE LOCK

Approved Library structure (current storefront):

- CORE Report
- CORE Complete
- LOVE / MONEY / BODY / YEAR / STYLE / PLACE

Rules:

- optional deeper lenses
- no pricing / FOMO / urgency
- no "you unlocked one layer"
- no "complete the suite"
- no Full Destiny Codex on the current Library page

---

## 13 · WHAT IS NOT AUTHORIZED YET

This source of truth does NOT authorize:

- code changes
- schema changes
- template changes
- runtime prompt swap
- Loveable implementation
- Stripe / checkout / pricing changes
- provider changes
- Resend changes
- API route changes
- APITemplate changes
- add-on module creation
- FreeAstroAPI / PLACE reference update

Approval of the documentation package is not approval to implement.

---

## 14 · NEXT STEP AFTER THIS FILE

After this file is approved, the **Step 5 documentation package is complete.**

The next action is **NOT implementation.** The next action is to wait for and
review the render-fix diagnostic.

Separately, after this file is approved, a **documentation-only** FreeAstroAPI /
PLACE reference update may be created:
`FREEASTROAPI_DARROW_REFERENCE_v3_PLACE_READY.md`.

That future file must **not** be a Loveable prompt and must **not** authorize
runtime changes — it is reference documentation only.

Only **after render-fix diagnostic approval** should a single clean Loveable
implementation prompt be prepared.

---

## 15 · FINAL APPROVAL CHECKLIST

- [ ] Eight-file v4.1 package listed and role-defined
- [ ] v3 runtime temporary status clear (production stays v3 until render-fix)
- [ ] No implementation authorized
- [ ] 17 generated keys locked (no add/remove/rename/merge/reorder)
- [ ] operating_mode migration-gated
- [ ] cover_tagline reconciled as a cover sub-field
- [ ] Library page locked (current storefront; no Full Destiny; no FOMO)
- [ ] PLACE safety locked (environmental resonance only in CORE)
- [ ] Backward compatibility locked (legacy render, fail-loud, no mutation)
- [ ] Old v3/legacy files excluded as sources
- [ ] Next step clearly waits on the render-fix diagnostic
- [ ] FreeAstroAPI / PLACE reference update explicitly deferred until after this
      file's approval

---

🔒 STATUS: CANONICAL SOURCE OF TRUTH v4.1 · approved future standard · v3 runtime temporary · no implementation authorized

---

## CHANGE LOG

| Version       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (predecessor) | Old `SOURCE_OF_TRUTH` (v3) — described the v3 runtime as canonical. ARCHIVED; retained only as history per audit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| v4.1          | **Current.** Final canonical source of truth built only from the approved eight-file package. Declares v4.1 the approved future standard with v3 runtime temporary until render-fix approval; lists and role-defines the eight approved files; locks product identity (CORE Report: UNVEIL / Cosmic Core Code Method), structure (26 pages / 4,350–5,250 words / 17 keys / static pages / cover_tagline / operating_mode migration-gated), current runtime status, migration gate, do-not-use/archive rules, data/provider lock, safety locks, backward-compatibility lock, Library page lock, what is not authorized yet, and next step (wait on render-fix; PLACE reference deferred). No code, schema, template, runtime swap, Loveable prompt, or deployment. |
