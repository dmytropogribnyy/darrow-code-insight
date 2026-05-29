# DARROW CODE — CORE v4.1 IMPLEMENTATION PLAN
# Status: FUTURE IMPLEMENTATION PLAN — NOT AUTHORIZED FOR EXECUTION YET
# Governed by: docs/SOURCE_OF_TRUTH_v4_1.md + docs/DARROW_DOCS_AUDIT_AND_PLAN_v4_1.md
# Created: 2026-05-29

---

## 1 · PURPOSE

This is a **concrete future implementation plan**, not implementation.
It maps the approved v4.1 documentation to the actual repository files
that must change, and defines the safe sequence for making those changes.

Nothing here authorizes any code change. Implementation begins ONLY after:
- the render-fix diagnostic is approved
- current v3 PDF rendering is visually confirmed stable
- a single clean v4.1 implementation prompt is prepared separately

---

## 2 · SOURCE DOCUMENTS GOVERNING IMPLEMENTATION

| Document | Role in implementation |
|----------|----------------------|
| `docs/SOURCE_OF_TRUTH_v4_1.md` | Governing canonical document; locks structure, naming, safety rules |
| `docs/DARROW_DOCS_AUDIT_AND_PLAN_v4_1.md` | Controlling migration map; migration order (steps 1–7) |
| `docs/DARROW_CORE_MASTER_PATTERN_v4_1.md` | Canonical CORE structure — 26 pages, 17 keys, section order |
| `docs/DARROW_CORE_SAMPLE_REPORT_v4_1.md` | **Gold reference** — tone, rhythm, scenario-first voice |
| `docs/DARROW_REPORT_CONTENT_STANDARD_v4_1.md` | Quality layer — pass/fail rules for each section |
| `docs/darrowcode_core_module_spec_v4_1.md` | Runtime content map — which data belongs where, callout rules per section |
| `docs/darrowcode_ai_system_prompt_v4_1.md` | Future prompt source document — to replace active runtime prompt AFTER authorization |
| `docs/schema_template_patch_v4_1.md` | Schema/template migration planning — conceptual field model and page map |

**The gold reference for voice and rhythm is `DARROW_CORE_SAMPLE_REPORT_v4_1.md`.**
No section should read like a dossier. Every section should feel like a calm,
intelligent human privately recognized the client's pattern.

---

## 3 · CURRENT CODE TOUCHPOINTS

### 3.1 Files That Must Change (in order, after authorization)

| File | Change required |
|------|----------------|
| `src/lib/ai/darrowcode_ai_system_prompt.md` | **Keep intact until migration switch is authorized.** Create a staged v4.1 runtime prompt file alongside it first; switch `system-prompt.ts` only during controlled Phase 1 implementation. |
| `src/lib/ai/user-prompt.ts` | Update `coreV3Instructions()` for v4.1 word targets (4,350–5,250) and section map (17 v4.1 keys) |
| `src/lib/ai/schema.ts` | Add `CoreV4Schema`; update `DarrowReportSchema` union; keep `CoreV3Schema` for legacy reports |
| `src/lib/ai/core-split.server.ts` | Update section partition (A=keys 1–9, B=keys 10–17) for v4.1 key order (operating_mode at #3) |
| `src/lib/pdf/template.ts` | Rebuild for 26-page layout; render static pages + all structured fields |
| `src/lib/ai/quality-gate.server.ts` | Update checks for v4.1 rules; upgrade from warn-only to reject on critical violations |

### 3.2 Files That Must NOT Change

| File | Reason |
|------|--------|
| `src/lib/astro/provider.ts` | Provider interface unchanged |
| `src/lib/astro/freeastroapi-provider.server.ts` | Provider implementation unchanged |
| `src/lib/astro/types.ts` | DarrowChartData shape unchanged |
| `src/lib/astro/numerology.ts` | Numerology calculations unchanged |
| `src/lib/generation/pipeline.server.ts` | Pipeline orchestration unchanged |
| `src/routes/api/public/payments/webhook.ts` | Stripe webhook unchanged |
| `src/routes/api/public/jobs/process-generation.ts` | Job dispatcher unchanged |
| `src/lib/email/resend.server.ts` | Email delivery unchanged |
| `src/lib/pdf/apitemplate.server.ts` | APITemplate.io rendering call unchanged |
| `src/lib/pdf/stamp-page-numbers.server.ts` | Page number stamper unchanged |
| `src/lib/stripe.server.ts` | Stripe unchanged |
| All checkout / pricing code | Unchanged |
| All Supabase Auth / token routes | Unchanged |
| `.env*` files | Do NOT overwrite |

### 3.3 Diagnostic Routes — Use During Testing

| Route | Purpose |
|-------|---------|
| `src/routes/api/public/debug/core-v3-run.ts` | Run current CORE diagnostic (pre-migration) |
| `src/routes/api/public/debug/astro-probe.ts` | Probe astrology data availability |
| `src/routes/api/public/health/generation-pipeline.ts` | Pipeline health check |

During v4.1 migration: create a new diagnostic route (e.g., `core-v4-run.ts`) to test
v4.1 generation without touching the production CORE path.

---

## 4 · REQUIRED IMPLEMENTATION CHANGES (AFTER AUTHORIZATION)

### 4.1 AI Prompt Migration

**Source:** `docs/darrowcode_ai_system_prompt_v4_1.md`
**Staging file:** `src/lib/ai/darrowcode_ai_system_prompt_v4_1.md` (create here first)
**Active runtime file (keep intact until switch):** `src/lib/ai/darrowcode_ai_system_prompt.md`
**Switch mechanism:** `src/lib/ai/system-prompt.ts` import — change only during controlled
Phase 1 implementation, after diagnostic generation is approved.
**Rollback:** revert `system-prompt.ts` import back to v3 file if v4.1 diagnostic fails.

Migration steps:
1. Create `src/lib/ai/darrowcode_ai_system_prompt_v4_1.md` with v4.1 content.
2. Leave `src/lib/ai/darrowcode_ai_system_prompt.md` (v3) untouched.
3. Point `system-prompt.ts` import to the v4.1 file only after diagnostic approval.
4. Keep v3 file as rollback until v4.1 PDF is visually approved in production.

Content changes for v4.1 prompt:
- Replace REQUIRED "your system / the mechanism" language with PREFERRED human-facing openers
- Update word targets: 4,350–5,250 prose words total
- Update section map to v4.1 17-key set (see §4.3)
- Add structured field instructions: opening_line, scenario, key_insight, proof_tags[] per section
- Add `operating_mode` section generation instructions
- Keep PLACE environmental-resonance-only rule: CORE uses environmental resonance only.
  Astrocartography is NOT part of CORE. Do not name cities. Do not add city rankings.
  Astrocartography belongs only to the PLACE focused chapter — future scope, not implemented here.
- Keep all data safety rules (birth_time_known, BaZi availability, transit availability)
- Keep BODY disclaimer rule (verbatim medical soft disclaimer required in vitality_baseline)

### 4.2 User Prompt Builder Migration

**File:** `src/lib/ai/user-prompt.ts`

Changes:
- Update `coreV3Instructions()` → rename to `coreV4Instructions()` or similar
- Update word targets: 4,350–5,250 total, hard cap ~6,000
- Update section order to v4.1 (operating_mode at position #3)
- Add structured field schema guidance (opening_line, scenario, key_insight per section)
- Remove `cover_tagline` from inline section spec (it becomes a cover sub-field)
- Add `operating_mode` to inline section spec

### 4.3 Schema Migration

**File:** `src/lib/ai/schema.ts`

Add `CoreV4Schema` (new; do NOT modify `CoreV3Schema`):

```
schema_version: "core_v4" (or "core_unveil")
17 required section keys in this exact order:
  1. orientation
  2. core_architecture
  3. operating_mode          ← NEW (was absent in v3)
  4. battery
  5. social_interface
  6. numerology_code
  7. cognitive_style
  8. drive_and_rhythm
  9. professional_archetype
 10. money_and_value
 11. relationship_baseline
 12. vitality_baseline
 13. environment_and_resonance
 14. shadow_and_friction
 15. before_after
 16. executive_summary
 17. next_step

cover_tagline: cover sub-field (NOT a section key)
```

Per-section structured field shape (conceptual):
```
{
  opening_line: string          // short declarative hook
  scenario: string              // lived recognizable moment
  prose: string                 // body paragraphs
  key_insight?: string          // optional, sparse
  protocols?: [{title, body}]   // behavioral callouts
  warning_signals?: string[]    // observable early cues
  proof_tags?: string[]         // quiet data confirmation, ≤5
}
```

Special sections:
- `vitality_baseline`: add `disclaimer: string` (verbatim medical soft disclaimer)
- `before_after`: `before_after_pairs` (exactly 2 Before / 2 After)
- `executive_summary`: `executive_summary_blocks` (6 labeled blocks)
- `next_step`: `closing_pillars` (4 pillars, frame fixed / conclusions variable)
- Cover page: `cover_tagline` sub-field (not a section key)

Validation rules to implement (fail-loud, not warn-only):
- All 17 section keys present
- No extra/unknown section keys
- proof_tags ≤ 5 per section
- Required disclaimer present in vitality_baseline
- before_after contains exactly 2 Before / 2 After pairs
- No city recommendations anywhere in CORE
- No direct cross-sell inside body sections
- Data availability guards (birth_time_known, BaZi, transits)

### 4.4 PDF Template Migration

**File:** `src/lib/pdf/template.ts`

26-page layout (from `docs/schema_template_patch_v4_1.md` §12):

| Page | Content |
|------|---------|
| 01 | Cover — static title + method line + variable `cover_tagline` + client data |
| 02 | Personal Orientation System — static |
| 03 | `orientation` |
| 04–05 | `core_architecture` |
| 06 | `operating_mode` |
| 07 | `battery` |
| 08 | `social_interface` |
| 09–10 | `numerology_code` |
| 11 | `cognitive_style` |
| 12 | `drive_and_rhythm` |
| 13–14 | `professional_archetype` |
| 15 | `money_and_value` |
| 16 | `relationship_baseline` |
| 17 | `vitality_baseline` |
| 18 | `environment_and_resonance` |
| 19–20 | `shadow_and_friction` |
| 21 | `before_after` |
| 22–23 | `executive_summary` |
| 24 | `next_step` |
| 25 | Library — static |
| 26 | Back Cover — static |

Template responsibilities (not AI):
- Section title rendering
- opening_line styling
- scenario visual distinction (e.g., indented block)
- Prose paragraphs (short, breathing room)
- key_insight emphasis (sparse)
- Protocol callout boxes (lifted from prose)
- Warning signal callouts (muted)
- Proof tags (small, muted, end of section)
- Vitality disclaimer (verbatim)
- Before/After labeled blocks
- Executive summary labeled blocks
- Closing pillars
- All static pages (Cover, Orientation System, Library, Back Cover)

**Library page** replaces old Ecosystem page. Must list:
- CORE Report
- CORE Complete
- LOVE / MONEY / BODY / YEAR / STYLE / PLACE
- No pricing, FOMO, urgency, "complete the suite", "you unlocked one layer",
  no Full Destiny Codex on current Library page

**PLACE in Library page:** described as environmental resonance chapter.
No city claims, no astrocartography, no rankings in the Library copy.

### 4.5 Backward Compatibility

- Keep `CoreV3Schema` — never mutate, never remove
- Old reports (schema_version === "core_v3") render through legacy path
- New v4.1 generations must use `CoreV4Schema`
- v4.1 fails loudly if required keys missing (no silent fallback to v3 keys)
- Do NOT mutate stored v3 reports

### 4.6 Quality Gate Updates

**File:** `src/lib/ai/quality-gate.server.ts`

Upgrade from warn-only to blocking on:
- Missing required section key
- City recommendation in CORE text
- proof_tags > 5 in any section
- Old v3 word target in prompt (e.g., "3,000–3,600")
- Product mismatch (old name vs "CORE Report: UNVEIL")

Retain warn-only for:
- Borderline voice (DOSSIER_TONE, RECOGNITION_FIRST) — still useful as signal

---

## 5 · NON-GOALS

The following are explicitly out of scope for this plan:

- Stripe / checkout / pricing changes
- Supabase Auth / token route changes
- Resend email delivery changes
- FreeAstroAPI provider implementation changes
- APITemplate.io account or rendering changes
- Add-on module (LOVE / MONEY / BODY / YEAR / STYLE / PLACE) generation
- Astrocartography — CORE uses environmental resonance only. Astrocartography is
  future PLACE-chapter scope and is NOT implemented as part of CORE v4.1.
  Do not call astrocartography endpoints globally. Do not add city rankings to CORE.
- Full Destiny Codex implementation
- Any feature not listed in the approved v4.1 package

---

## 6 · TEST / VERIFICATION PLAN

### 6.1 Pre-Migration (Do First)

1. Run current render-fix diagnostic: `GET /api/public/debug/core-v3-run`
2. Inspect diagnostic JSON output — confirm all 17 v3 keys present
3. Inspect diagnostic PDF — confirm no clipping, correct page count, stamps correct
4. Confirm: no quality gate warnings at RECOGNITION_FIRST or LEAD_WITH_PLACEMENT
5. Get explicit approval on diagnostic before proceeding

### 6.2 During Migration (Diagnostic Mode)

6. Run one v4.1 diagnostic generation (via new diagnostic route) — inspect raw JSON
7. Check: exactly 17 v4.1 keys present (including operating_mode, excluding cover_tagline)
8. Check: cover_tagline present as cover sub-field
9. Check: word count 4,350–5,250 total
10. Check: each section has opening_line, scenario, prose
11. Check: proof_tags ≤ 5 per section
12. Check: vitality_baseline has verbatim disclaimer
13. Check: before_after has exactly 2 Before + 2 After pairs
14. Check: no city names anywhere in CORE text
15. Check: no direct cross-sell in body sections
16. Check: BODY uses soft/hedged language (no medical claims)

### 6.3 Visual PDF Verification

17. Run render-only re-render on diagnostic JSON
18. Inspect Cover — cover_tagline present; method line correct
19. Inspect Page 02 — Personal Orientation System static
20. Inspect Page 06 — operating_mode present and formatted correctly
21. Inspect all multi-page sections (04–05, 09–10, 13–14, 19–20, 22–23)
22. Inspect Page 17 — vitality_baseline disclaimer visible
23. Inspect Page 21 — before_after labeled blocks scannable
24. Inspect Page 25 — Library page present, no pricing/FOMO, PLACE = environmental
25. Inspect Page 26 — Back Cover present
26. Confirm: 26 pages total
27. Confirm: page numbers stamped correctly (stamp-page-numbers.server.ts)

### 6.4 Production Readiness

28. Run full paid-order simulation on test Stripe keys
29. Confirm email delivery (Resend)
30. Confirm PDF download (Supabase Storage)
31. Confirm old v3 reports still downloadable (backward compat)
32. Only after all checks pass: deploy to production

---

## 7 · FUTURE ADD-ON PATH

After CORE v4.1 is implemented and visually approved, create one unified add-on
master pattern at a time — starting from the most commercially important focused chapter.

Each add-on should follow the same principle:
- Product concept standard
- Master pattern
- Gold sample
- Content standard
- Module spec
- Prompt/source/schema planning

Add-ons use unified principles from CORE but have their own section maps and safety rules:
- **LOVE:** Venus, Mars, Moon, 5H, 7H, Descendant data. No synastry in MVP.
  No guaranteed compatibility claims.
- **MONEY:** 2H, 6H, 8H, 10H, Jupiter, Saturn. No wealth promises, no financial advice.
- **BODY:** Moon, Mars, Saturn, 6H. No medical claims or diagnosis. Soft/hedged language only.
- **YEAR:** Slow transits + Solar Return. Orientation, not prediction.
- **STYLE:** Venus, Ascendant, Moon. No healing/luck/protection/attraction claims.
- **PLACE:** Environmental resonance layer. Astrocartography is future scope:
  - CORE Report: NEVER names cities or astrocartography lines.
  - PLACE chapter: MAY later use FreeAstroAPI astrocartography endpoints
    (recommendations, city-check, relocation, lines, parans),
    BUT ONLY with: PLACE purchased + birth_time_known=true + real returned data.
  - Do NOT implement PLACE astrocartography now. Do NOT call astrocartography globally.

**Do NOT create add-on master patterns or implementation until CORE v4.1 is
visually approved in production.**

---

## 8 · MIGRATION ORDER (STRICT SEQUENCE)

Do not skip ahead. Each step gates the next.

1. **Finish render-fix diagnostic.** ⏳ IN PROGRESS
   Confirm PDF renders cleanly on v3. Visual inspection required.

2. **Freeze approved docs.** ✅ DONE in this session
   Commit v4.1 doc package. No further changes until implementation begins.

3. **Define backward-compat strategy** (decide schema union discriminant).

4. **Prepare single clean v4.1 implementation prompt.**
   One package; no mixed generations; scoped to implementation only.

5. **Migrate schema** (`schema.ts`). Keep CoreV3Schema. Add CoreV4Schema.

6. **Migrate AI prompt and user-prompt builder.**
   Create `src/lib/ai/darrowcode_ai_system_prompt_v4_1.md` (staged, v3 file stays intact).
   Update `system-prompt.ts` import to point to v4.1 file.
   Update `user-prompt.ts`. Update `core-split.server.ts` section partition for v4.1 key order.
   Keep v3 prompt file as rollback until v4.1 PDF is visually approved.

7. **Migrate PDF template** (`template.ts`).
   26-page layout; all static pages; all structured fields.

8. **Add fail-loud validation** in quality gate.

9. **Run diagnostic generation.** Inspect JSON.

10. **Run render-only re-render.** Inspect all 26 pages visually.

11. **After visual approval: publish.**

---

🔒 STATUS: FUTURE IMPLEMENTATION PLAN ONLY · no code changes made · no schema changes · no runtime changes
