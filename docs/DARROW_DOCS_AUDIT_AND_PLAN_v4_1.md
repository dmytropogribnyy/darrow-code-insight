# DARROW DOCS — AUDIT & MIGRATION PLAN v4.1

# Status: APPROVED CONTROLLING DOCUMENT · rev. 4

# Purpose: Resolve documentation chaos before any further files are written or rewritten.

# This file wins over all other documentation in matters of file status,

# conflict resolution, and migration order.

---

## 1 · EXECUTIVE VERDICT

The project currently holds **three overlapping generations** of documentation:
the original Lovable MVP prompts, the v3 cleanup/spec files, and the new v4.1
CORE standard. They contradict each other — and the v3 set even contradicts
_itself_. This is the root cause of generation drift.

Four decisions govern everything below:

**1. v3 runtime is TEMPORARY.**
The current production pipeline (v3 prompt + v3 schema + v3 template) stays
live only as the diagnostic/runtime base. It is not the target. It is the
thing being fixed.

**2. v4.1 is the future CORE STANDARD.**
`DARROW_CORE_MASTER_PATTERN_v4_1.md` is canonical for what CORE must become:
26 pages, 4,350–5,250 words, recognition-first, human-readable. All future
implementation migrates toward it.

**3. Loveable must NOT receive mixed old/v3/v4 files.**
Handing Loveable conflicting targets is exactly what caused it to "fix the
wrong thing." Until a single clean v4.1 implementation package exists,
Loveable receives only what the current diagnostic requires.

**4. The render-fix diagnostic must COMPLETE before any implementation migration.**
No schema changes, no prompt swaps, no `operating_mode`, no v4.1 keys —
until the current PDF render pipeline is confirmed stable on the existing
v3 sections. Migration starts only after diagnostic approval.

---

## 2 · FILE STATUS TABLE

Classification legend:

- **ACTIVE v4.1 STANDARD** — canonical now, use as quality/structure source
- **TEMPORARY RUNTIME / DIAGNOSTIC** — keeps production alive, not the target
- **UPDATE TO v4.1** — good base, must be revised before it becomes canonical
- **ARCHIVE / HISTORY ONLY** — keep for record, never implement from
- **DO NOT USE FOR IMPLEMENTATION** — actively dangerous to feed Loveable now

| File                                          | Classification                                           | Reason                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DARROW_CORE_MASTER_PATTERN_v4_1.md`          | **ACTIVE v4.1 STANDARD**                                 | Canonical CORE structure, voice, formatting. Already cleaned.                                                                                                                                                                                                                                                                                                                                                                                  |
| `Cosmic_Core_Code_eng.docx` (manual)          | **ACTIVE v4.1 STANDARD** (reference)                     | Source of CORE tone, compact sequence, recognition effect.                                                                                                                                                                                                                                                                                                                                                                                     |
| `FULL_DESTINY_CODEX_eng.docx` (manual)        | **ACTIVE v4.1 STANDARD** (reference)                     | Source of premium depth, scenario rhythm, timing logic, closing style.                                                                                                                                                                                                                                                                                                                                                                         |
| `COSMIC_CORE_CODE_concept.docx`               | **ACTIVE v4.1 STANDARD** (philosophy)                    | Confirmed present. Marked `FINAL · CANONICAL · NON-NEGOTIABLE`. This IS the product concept for UNVEIL: self-trust over action, "legible enough to move without force," flow Orientation→Recognition→Normalization→Integration, grounded praise, quality-of-life effect. Already formalized into `DARROW_CORE_PRODUCT_CONCEPT_STANDARD_v4_1.md`, approved rev. 3. Remains the canonical philosophy source behind the product concept standard. |
| `FULL_CODEX_Concept.docx`                     | **ACTIVE v4.1 STANDARD** (philosophy, different product) | Confirmed present. Marked `FINAL · CANONICAL · NON-NEGOTIABLE`. Concept for the Full Destiny Codex (strategic layer) — NOT CORE. Do not merge with CORE. Reserve for the future Full Destiny master pattern. ⚠️ Conflict: concept says "22-PAGE ARCHITECTURE (LOCKED)" but the manual `FULL_DESTINY_CODEX_eng.docx` runs ~38 pages — resolve when Full Codex pattern is built.                                                                 |
| `DARROW_REPORT_CONTENT_STANDARD.md`           | **UPDATE TO v4.1**                                       | Strong base ("This explains me," scenario/protocol/proof). But still fixes CORE 18–20 / 3,000–3,600 / 17 and forbids "healing" while spec elsewhere leaks unsafe wording. Must become `_v4_1`.                                                                                                                                                                                                                                                 |
| `darrowcode_addon_modules_spec.md`            | **UPDATE TO v4.1** (deferred)                            | Fine as v3 add-on baseline (8–10 pages / 1,200–1,500 / 10 sections). Needs v4.1 human-readable pass _after_ CORE is locked. Do not finalize yet.                                                                                                                                                                                                                                                                                               |
| `darrowcode_launch_requirements_v3.md`        | **UPDATE TO v4.1** (partial)                             | Assets / provider / DNS / APITemplate / legal parts are operationally correct. Content targets are stale (v3). Keep ops, update targets.                                                                                                                                                                                                                                                                                                       |
| `darrowcode_ai_system_prompt_v3_merged.md`    | **TEMPORARY RUNTIME / DIAGNOSTIC**                       | Current runtime base. Still has REQUIRED system-language and v3 targets. Replace later with `darrowcode_ai_system_prompt_v4_1.md`. (Content not re-verified in this audit — listed as uploaded but body not provided here.)                                                                                                                                                                                                                    |
| `darrowcode_schema_template_patch.md`         | **UPDATE TO v4.1**                                       | Right idea (protocols[], warning_signals[], callout boxes, template-driven). But targets v3 / 17 keys / "22–26 pages" and references phantom `client_snapshot`. Rewrite as `_v4_1`.                                                                                                                                                                                                                                                            |
| `loveable_final_prompt.md`                    | **TEMPORARY RUNTIME / DIAGNOSTIC**                       | Last v3 Loveable prompt. Usable as reference for the _current_ diagnostic only. Do not use for v4.1 implementation — it requests CORE v3 18–20 / 3,000–3,600.                                                                                                                                                                                                                                                                                  |
| `darrowcode_SOURCE_OF_TRUTH.md`               | **DO NOT USE FOR IMPLEMENTATION**                        | Says active CORE = 18–20 / 3,000–3,600. Directly contradicts v4.1. Replace with `SOURCE_OF_TRUTH_v4_1.md`.                                                                                                                                                                                                                                                                                                                                     |
| `darrowcode_core_module_spec.md`              | **ARCHIVE / HISTORY ONLY**                               | Old CORE blueprint. Contains unsafe "psychic static / literal nervous system reset" example, 16-vs-17 internal contradiction, old targets. Superseded by master pattern.                                                                                                                                                                                                                                                                       |
| `darrowcode_ai_system_prompt_v3.md`           | **ARCHIVE / HISTORY ONLY**                               | Earlier, weaker than v3_merged. Has REQUIRED system-language and 16-vs-17 conflict.                                                                                                                                                                                                                                                                                                                                                            |
| `darrowcode_prose_structure_rules.md`         | **ARCHIVE / HISTORY ONLY** (merge useful parts)          | Word target 3,700–4,600 conflicts with v4.1. Phantom `client_snapshot`. Useful rules (paragraph length, opening line, proof tags) already absorbed into v4.1. Do not feed separately.                                                                                                                                                                                                                                                          |
| `darrowcode_quality_examples.md` (old)        | **ARCHIVE / HISTORY ONLY**                               | Contains "centuries apart," harsh phrasing, 6 proof tags. Replace with cleaned v4.1 samples.                                                                                                                                                                                                                                                                                                                                                   |
| `loveable_cleanup_prompt.md`                  | **ARCHIVE / HISTORY ONLY** (after diagnostic)            | v3 migration record. Keep as history. Archive once render-fix is closed.                                                                                                                                                                                                                                                                                                                                                                       |
| `darrowcode_lovable_prompt.md` (original MVP) | **ARCHIVE / HISTORY ONLY**                               | Has CORE 12–14 pages, Full Code ~50 pages, mock provider. UI/Stripe/Supabase parts useful only as extraction source for a future clean app spec.                                                                                                                                                                                                                                                                                               |

> Note: `COSMIC_CORE_CODE_concept.docx` and `FULL_CODEX_Concept.docx` are now
> confirmed present and both marked `FINAL · CANONICAL · NON-NEGOTIABLE`.
> They are promoted to ACTIVE v4.1 STANDARD (philosophy layer). The CORE concept
> has been formalized into the approved `DARROW_CORE_PRODUCT_CONCEPT_STANDARD_v4_1.md`;
> the Full Codex concept is reserved for the future Full Destiny pattern and must NOT
> be merged into CORE.

---

## 3 · CONFLICT TABLE

Every known contradiction across the document set. "Generation" column shows
which era introduced the value.

| #   | Area                  | Conflicting values                                                                                                             | Where they appear                                                                                                              |
| --- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| C1  | CORE page count       | **12–14** (MVP) vs **18–20** (v3) vs **22–26** (schema patch) vs **26** (v4.1)                                                 | lovable_prompt → spec/SOT/launch → schema_template_patch → master pattern                                                      |
| C2  | CORE word count       | **900–1,160** (MVP/v2.1) vs **3,000–3,600** (v3 spec) vs **3,600–4,500 / 3,700–4,600** (prose rules) vs **4,350–5,250** (v4.1) | three different live numbers even within v3                                                                                    |
| C3  | CORE section count    | **8** (MVP) vs **16** (prompt header) vs **17** (output format + spec table)                                                   | `ai_system_prompt_v3` header says 16, its own OUTPUT FORMAT lists 17                                                           |
| C4  | Unsafe wording        | "washes off **psychic static**" / "your **literal nervous system reset**"                                                      | `darrowcode_core_module_spec.md` Section 4                                                                                     |
| C5  | Historical claim      | "two completely independent frameworks, **built centuries apart**"                                                             | old `quality_examples.md`                                                                                                      |
| C6  | Vocabulary direction  | **REQUIRED** "Your system… / The mechanism here is…" (pushes system-language) vs v4.1 **PREFERRED** human-facing openers       | `ai_system_prompt_v3` LANGUAGE RULES vs v4.1                                                                                   |
| C7  | Phantom key           | `client_snapshot` referenced but absent from the section list                                                                  | prose_structure_rules + schema_template_patch reference it; spec/prompt do not define it                                       |
| C8  | Full Code size        | **~50 pages** (MVP) vs **65–75 pages / 12,000–14,000 words** (v3)                                                              | lovable_prompt vs SOT/launch                                                                                                   |
| C9  | Add-on page count     | **6–8 pages / 480–690 words** (deprecated) vs **8–10 pages / 1,200–1,500 words** (v3 active)                                   | deprecated targets vs addon_modules_spec                                                                                       |
| C10 | Proof tag count       | up to **6 tags** in old example vs **max 5** rule                                                                              | old quality_examples vs prose_rules/v4.1                                                                                       |
| C11 | Operating Mode        | **absent** (v3) vs **present** (v4.1, flagged as schema migration)                                                             | v3 section maps vs master pattern                                                                                              |
| C12 | Full Codex page count | **22 pages "LOCKED"** (concept) vs **~38 pages** (manual)                                                                      | `FULL_CODEX_Concept.docx` vs `FULL_DESTINY_CODEX_eng.docx`. Out of scope for CORE; resolve when Full Destiny pattern is built. |

---

## 4 · WINNER RULE

For each area, exactly one source wins. When any file disagrees with the
winner, the winner controls.

| Area                                                   | Winning source                                                                                                        | Notes                                                                                                                 |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Product philosophy / what the report must FEEL like    | `COSMIC_CORE_CODE_concept.docx` (CANONICAL) + manuals, formalized into `DARROW_CORE_PRODUCT_CONCEPT_STANDARD_v4_1.md` | Recognition, self-trust, orientation not prediction. The concept file is the authority; the manuals show it executed. |
| CORE content pattern / structure / word & page targets | `DARROW_CORE_MASTER_PATTERN_v4_1.md`                                                                                  | 26 pages, 4,350–5,250 words, 17 generated CORE section keys + static/template-rendered pages.                         |
| Quality bar / what passes a section                    | `DARROW_REPORT_CONTENT_STANDARD_v4_1.md` (to be created from existing standard + v4.1 voice)                          | Scenario/mechanism/protocol/proof, no system-speak dominance.                                                         |
| Runtime AI prompt                                      | **Now:** `darrowcode_ai_system_prompt_v3_merged.md` (temporary). **Future:** `darrowcode_ai_system_prompt_v4_1.md`    | Swap only after diagnostic + sample approval.                                                                         |
| Schema                                                 | **Now:** current `DarrowReportSchema` (v3). **Future:** `schema_template_patch_v4_1.md`                               | New keys (operating_mode, structured callouts) added at migration only.                                               |
| PDF template                                           | **Now:** current `src/lib/pdf/template.ts` (under render-fix). **Future:** v4.1 template mapping                      | Template-driven formatting wins over AI markdown.                                                                     |
| Provider / data rules                                  | `src/lib/astro/FREEASTROAPI_REFERENCE.md` (runtime) + provider sections of `launch_requirements_v3`                   | Unchanged. FreeAstroAPI is production.                                                                                |
| Visual canon / assets / domain                         | PART 7 of `launch_requirements_v3` (visual canon LOCKED)                                                              | Colors/fonts already correct. Do not re-derive.                                                                       |
| Pricing / payment                                      | Current production code (Stripe)                                                                                      | Not a documentation question. Do not touch.                                                                           |

**Global tie-breaker:** in any conflict between a content standard and a
runtime file, the content standard defines _intent_; the runtime file is
_updated to match_ — never the reverse, and never silently.

**Canonical CORE key count (locked, to prevent a 17-vs-18 conflict):**

The v4.1 CORE generates exactly **17 section keys**:
`orientation`, `core_architecture`, `operating_mode`, `battery`,
`social_interface`, `numerology_code`, `cognitive_style`, `drive_and_rhythm`,
`professional_archetype`, `money_and_value`, `relationship_baseline`,
`vitality_baseline`, `environment_and_resonance`, `shadow_and_friction`,
`before_after`, `executive_summary`, `next_step`.

Static / template-rendered pages are **separate and not counted** as generated
keys: cover, orientation-system/framework page, ecosystem page, back cover.

> Reconciliation note: the master pattern lists `cover_tagline` as a short
> generated line on the cover. Treat it as a cover sub-field, not a standalone
> CORE section — it does not change the 17-key count. When the v4.1 spec/schema
> are built, define `cover_tagline` as part of the cover page payload, separate
> from the 17 body sections.

---

## 5 · PROPOSED v4.1 FILE SET

**ACTIVE CONTENT STANDARD** (defines what good output is):

- `DARROW_CORE_MASTER_PATTERN_v4_1.md` — ✅ exists, approved
- `DARROW_CORE_PRODUCT_CONCEPT_STANDARD_v4_1.md` — ✅ exists, approved philosophy layer (rev. 3)
- `DARROW_CORE_SAMPLE_REPORT_v4_1.md` — ✅ exists, approved GOLD REFERENCE
- `COSMIC_CORE_CODE_concept.docx` — ✅ exists, CANONICAL (philosophy source)
- `DARROW_REPORT_CONTENT_STANDARD_v4_1.md` — next to create (Step 5 start)

**RESERVED — FUTURE SCOPE (not CORE):**

- `FULL_CODEX_Concept.docx` — ✅ exists, CANONICAL. Philosophy for the Full Destiny Codex strategic layer. Do not touch until CORE is fully locked; do not merge into CORE.

**IMPLEMENTATION** (prepared later, after diagnostic + sample approval):

- `darrowcode_ai_system_prompt_v4_1.md` — v3_merged base, REQUIRED→PREFERRED vocab, v4.1 targets, formatting system, cleaned examples, operating_mode flagged as migration
- `darrowcode_core_module_spec_v4_1.md` — runtime form of the master pattern; marks static pages as template-rendered, not Claude-generated
- `schema_template_patch_v4_1.md` — operating_mode + structured fields (opening_line, scenario, key_insight, protocols[], warning_signals[], proof_tags[]) + 26-page mapping + v3 backward compatibility
- `SOURCE_OF_TRUTH_v4_1.md` — declares v4.1 standard active, v3 runtime temporary until approval

**ARCHIVE** (history only):

- `darrowcode_lovable_prompt.md` (original MVP)
- `darrowcode_ai_system_prompt_v3.md`
- `darrowcode_core_module_spec.md`
- old `darrowcode_quality_examples.md`
- `loveable_cleanup_prompt.md` and `loveable_final_prompt.md` — archive once render-fix diagnostic is closed
- `darrowcode_prose_structure_rules.md` — archive after useful rules are confirmed inside v4.1
- old `darrowcode_SOURCE_OF_TRUTH.md` — archive when `_v4_1` replaces it

---

## 6 · MIGRATION ORDER

Strict sequence. Do not skip ahead.

1. **Finish the current Loveable render-fix diagnostic.** ⏳ IN PROGRESS (external blocker)
   Confirm the PDF renders cleanly on the existing v3 sections. No new keys,
   no prompt swap, no operating_mode during this step.

2. **Approve this audit/plan (`DARROW_DOCS_AUDIT_AND_PLAN_v4_1.md`).** ✅ COMPLETED / APPROVED
   This file is the controlling map.

3. **Create `DARROW_CORE_PRODUCT_CONCEPT_STANDARD_v4_1.md`.** ✅ COMPLETED / APPROVED (rev. 3)
   Formalized the confirmed `COSMIC_CORE_CODE_concept.docx` (canonical) into v4.1:
   aligned to the 26-page master pattern, carried over grounded-praise and
   quality-of-life sections, and explicitly separated it from the Full Codex
   concept so the two products never blur.

4. **Create one full CORE sample (all 26 pages) from the master pattern.** ✅ COMPLETED / APPROVED (GOLD REFERENCE)
   `DARROW_CORE_SAMPLE_REPORT_v4_1.md` approved as the gold reference.

5. **Create the v4.1 implementation docs** in this order: ⬅️ CURRENT NEXT STEP
   `DARROW_REPORT_CONTENT_STANDARD_v4_1.md` (start here) →
   `darrowcode_core_module_spec_v4_1.md` →
   `darrowcode_ai_system_prompt_v4_1.md` →
   `schema_template_patch_v4_1.md` →
   `SOURCE_OF_TRUTH_v4_1.md`.

6. **Only then prepare a single clean Loveable implementation prompt.**
   One package, no mixed generations, scoped to implementation only.

7. **Implement with backward compatibility for old v3 reports.**
   New generations use v4.1 keys. Old stored reports keep a safe legacy
   renderer/fallback. v4.1 generation must fail loudly (not silently fall
   back to legacy keys) if v4.1 keys are missing.

---

## 7 · DO NOT TOUCH YET

These are working and out of scope until implementation migration is
explicitly approved:

- Stripe
- Checkout
- Pricing
- FreeAstroAPI provider implementation
- Numerology calculations
- Moon Phase / BaZi Flow enrichment
- Resend email delivery
- APITemplate integration
- Result / download token routes
- Supabase Auth / no-login model
- The existing render-fix diagnostic branch

No documentation change in this plan authorizes a change to any of the above.

---

## 8 · STATUS

| Item                           | State                                                              |
| ------------------------------ | ------------------------------------------------------------------ |
| This audit/plan                | **APPROVED · rev. 4** (steps 3 & 4 completed)                      |
| v4.1 CORE master pattern       | ✅ Complete, approved                                              |
| Product concept standard       | ✅ Complete, approved (rev. 3)                                     |
| Full CORE sample               | ✅ Complete, approved GOLD REFERENCE                               |
| Render-fix diagnostic          | In progress / external blocker                                     |
| v4.1 implementation docs       | ⬅️ Next step — start with `DARROW_REPORT_CONTENT_STANDARD_v4_1.md` |
| Loveable implementation prompt | Not started                                                        |

**Controlling rule:** if any other file disagrees with this document on
file status, conflict resolution, or migration order — this document wins
until it is explicitly superseded by an approved successor.
