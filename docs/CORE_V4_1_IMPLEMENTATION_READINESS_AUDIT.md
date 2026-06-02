# DARROW CODE — CORE v4.1 IMPLEMENTATION READINESS AUDIT

# Status: AUDIT / PLANNING ONLY — no code changes authorized

# Governed by: docs/SOURCE_OF_TRUTH_v4_1.md + docs/DARROW_DOCS_AUDIT_AND_PLAN_v4_1.md

# Created: 2026-05-29

---

## 1 · WHAT CURRENT RUNTIME ACTUALLY GENERATES TODAY

### 1.1 Active AI Prompt

**File:** `src/lib/ai/darrowcode_ai_system_prompt.md`
**Loaded by:** `src/lib/ai/system-prompt.ts` via `import ... from "./darrowcode_ai_system_prompt.md?raw"`
**Label inside file:** `v3.0 MERGED (Active Runtime)`
**Schema version emitted:** `core_v3`

This is the ONLY prompt file wired to the runtime. All other `.md` files in
`src/lib/ai/` are documentation-only and are NOT imported by any TypeScript code.

### 1.2 User Prompt Builder

**File:** `src/lib/ai/user-prompt.ts`
Constructs the per-request user message. Includes:

- Safety rules (birth time, BaZi availability, transit availability)
- Module data routing (which chart data belongs to which module)
- `coreV3Instructions()` function — emits CORE v3.1 generation spec inline
- Chart data as JSON

The `coreV3Instructions()` function hardcodes:

- Word target: **3,800–4,600 prose words**, hard cap 5,000
- Section count: **17 keys** (v3 set, see §1.3)
- Structured callout schema (prose + protocols[] + warning_signals[])

### 1.3 Current CORE Section Keys (v3)

Exactly 17, declared in `src/lib/ai/schema.ts` and `src/lib/ai/diagnostic.server.ts`:

```
 1. cover_tagline        (string, 15–25 words)
 2. orientation          (string, 200–250 words)
 3. core_architecture    (object: prose + protocols[])
 4. battery              (object: prose + protocols[] + warning_signals[])
 5. social_interface     (object: prose + protocols[])
 6. numerology_code      (object: prose + protocols[])
 7. cognitive_style      (object: prose + protocols[])
 8. drive_and_rhythm     (object: prose + protocols[])
 9. professional_archetype (object: prose + protocols[] + warning_signals[])
10. money_and_value      (object: prose + protocols[])
11. relationship_baseline (object: prose + protocols[])
12. vitality_baseline    (object: prose + protocols[])
13. environment_and_resonance (object: prose + protocols[])
14. shadow_and_friction  (object: prose + warning_signals[], NO protocols)
15. before_after         (string, 140–180 words, 2 Before + 2 After)
16. executive_summary    (string, 300–360 words)
17. next_step            (string, 100–130 words)
```

Plus optional top-level fields: `proof_tags`, `module_snapshot`.

### 1.4 Current Schema Shape

**File:** `src/lib/ai/schema.ts`

- `DarrowReportSchema` (Zod): top-level object with `client_name`, `generated_modules`,
  `client_snapshot` (9 fields including `recommended_next_module`), `modules`, `closing`
- `CoreV3Schema`: schema_version "core_v3" + 17 keys + optional extras
- Section field: union of `string | SectionObjectSchema` (forward/back-compat)
- Add-on modules: `LegacyModuleSchema` (opening, architecture, mechanic, timing, protocols,
  shadow, before_after, next, proof_tags)
- `closing`: executive_summary + recommended_next_module + optional grand_synthesis
- `client_snapshot.recommended_next_module`: present (cross-sell field)

### 1.5 Current Word Targets (v3 runtime)

| Metric            | v3 Target         |
| ----------------- | ----------------- |
| Total prose       | 3,800–4,600 words |
| Hard cap          | 5,000 words       |
| cover_tagline     | 15–25 words       |
| orientation       | 200–250 words     |
| core_architecture | 300–380 words     |
| battery           | 250–300 words     |
| social_interface  | 220–260 words     |
| numerology_code   | 280–320 words     |
| executive_summary | 300–360 words     |
| next_step         | 100–130 words     |

### 1.6 Current PDF Page Structure

- Rendered by `src/lib/pdf/template.ts`
- Converted to PDF via `src/lib/pdf/apitemplate.server.ts` (APITemplate.io, HTML→PDF)
- Page numbers stamped post-render via `src/lib/pdf/stamp-page-numbers.server.ts` (pdf-lib)
- Zero margins (layout fully owned in HTML)
- Current page count: **implied ~18–22 pages** (v3 targets); exact count not locked in code
- **Render-fix patch applied** (v3.1 patch, see recent git commits): PDF clipping fixed

### 1.7 Current Quality Gate

**File:** `src/lib/ai/quality-gate.server.ts`

- **Warn-only** — does NOT trigger regeneration
- Checks for: `LEAD_WITH_PLACEMENT`, `DOSSIER_TONE`, `TECHNICAL_DENSITY`, `RECOGNITION_FIRST`
- Used only by diagnostic route, not production pipeline

### 1.8 Generation Architecture

**Production path:**

- CORE-only → `generateCoreV3Split()` (2 sequential Anthropic calls: sections 1–9, then 10–17)
- 4+ modules → `generateChunkedReport()` (chunked parallel)
- 2–3 modules → single call with optional premium model

**Diagnostic path:**

- Route: `src/routes/api/public/debug/core-v3-run.ts`
- Uses: `src/lib/ai/diagnostic.server.ts` (bypasses Zod superRefine for warn-only length checks)

### 1.9 Current Runtime Status

- **Schema version:** `core_v3` (v3.1 with structured callouts)
- **Prompt:** v3.0 MERGED (active runtime)
- **Word targets:** 3,800–4,600 words
- **PDF:** v3 layout under render-fix, page count not precisely locked
- **`operating_mode`:** ABSENT from current schema and prompt
- **`cover_tagline`:** Present as section key #1 in v3 schema
- **`client_snapshot`:** Present with `recommended_next_module` (cross-sell)
- **Classification:** **v3 (v3.1 callout-structured variant)** — not v4, not mixed

---

## 2 · CONFLICTS WITH APPROVED CORE v4.1

| #   | Area                           | Current v3                                                                | v4.1 Required                                                                                                          | Risk                                 |
| --- | ------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| C1  | Section key: cover_tagline     | Key #1 in schema (string field)                                           | Cover sub-field, NOT a body section key                                                                                | Schema + template migration          |
| C2  | Section key: operating_mode    | ABSENT                                                                    | Key #3 in 17-key set                                                                                                   | Schema + prompt + template migration |
| C3  | Word count                     | 3,800–4,600 (hard cap 5,000)                                              | 4,350–5,250                                                                                                            | Prompt + quality gate update         |
| C4  | Page count                     | ~18–22 pages (implied)                                                    | Exactly 26 pages                                                                                                       | Template rebuild                     |
| C5  | Section count                  | 17 keys (v3 set)                                                          | 17 keys (v4.1 set: different members)                                                                                  | Schema + prompt migration            |
| C6  | Section field model            | prose + protocols[] + warning_signals[]                                   | Adds: opening_line, scenario, key_insight, proof_tags[], before_after_pairs, executive_summary_blocks, closing_pillars | Schema extension + template          |
| C7  | cross-sell field               | client_snapshot.recommended_next_module + closing.recommended_next_module | No direct cross-sell inside body sections                                                                              | Schema / prompt cleanup              |
| C8  | Product naming                 | "CORE" / "Darrow Report"                                                  | "CORE Report: UNVEIL" / "Cosmic Core Code Method"                                                                      | Prompt + template static pages       |
| C9  | Library/ecosystem page         | Not verified in template                                                  | Library page (static, template-rendered)                                                                               | Template update                      |
| C10 | Per-section structured fields  | prose-level protocols + warnings                                          | Fully structured: opening_line, scenario, prose, key_insight, callouts                                                 | Schema + template + prompt           |
| C11 | No city claims (PLACE in CORE) | User-prompt instructs "never name specific cities" ✅                     | Same rule maintained                                                                                                   | ✅ Already compliant                 |
| C12 | Data safety rules              | Present in user-prompt.ts ✅                                              | Same rules maintained                                                                                                  | ✅ Already compliant                 |

### Key Naming Conflicts

- `cover_tagline`: in v3 schema as section key → in v4.1 as a cover page sub-field
- `operating_mode`: absent in v3 → required as key #3 in v4.1 (between `core_architecture` and `battery`)
- The 15 shared keys (keys 2, 3→4...) are the same names: orientation, core_architecture, battery, social_interface, numerology_code, cognitive_style, drive_and_rhythm, professional_archetype, money_and_value, relationship_baseline, vitality_baseline, environment_and_resonance, shadow_and_friction, before_after, executive_summary, next_step

---

## 3 · OUTDATED REFERENCES IN THE PROJECT

### 3.1 In `src/lib/ai/` — Documentation Files (NOT runtime-connected)

These `.md` files live alongside the runtime code but are NOT imported by any
TypeScript file (confirmed by grep). They are documentation-only:

| File                                           | Status                  | Issue                                                                 |
| ---------------------------------------------- | ----------------------- | --------------------------------------------------------------------- |
| `src/lib/ai/darrowcode_ai_system_prompt.md`    | **ACTIVE RUNTIME**      | Only file imported by code (`system-prompt.ts`). v3.0 MERGED.         |
| `src/lib/ai/DARROW_REPORT_CONTENT_STANDARD.md` | Old v3 content standard | Superseded by `docs/DARROW_REPORT_CONTENT_STANDARD_v4_1.md`           |
| `src/lib/ai/darrowcode_core_module_spec.md`    | Old v3 core spec        | 3,000–3,600 words / 18–20 pages — directly conflicts v4.1 targets     |
| `src/lib/ai/darrowcode_addon_modules_spec.md`  | v3 add-on spec          | Superseded, not yet updated to v4.1; deferred                         |
| `src/lib/ai/darrowcode_quality_examples.md`    | Old quality examples    | May contain old voice examples / "centuries apart" or unsafe phrasing |

### 3.2 In `src/lib/astro/`

| File                                      | Status                                                                                                                 |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `src/lib/astro/FREEASTROAPI_REFERENCE.md` | Active runtime reference (cited by v3 SOT). Not imported by TS code but referenced as the provider reference document. |

### 3.3 In `docs/current/`

| File                                                | Status                                                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `docs/current/SOURCE_OF_TRUTH.md`                   | Old v3 SOT. Still accurately describes what is running (v3 runtime) but uses old targets. NOT a source instruction for v4.1.    |
| `docs/current/darrowcode_launch_requirements_v3.md` | Ops parts (APITemplate, Resend, Supabase, DNS) may still be valid. Content targets (18–20 pages / 3,000–3,600 words) are stale. |
| `docs/current/darrowcode_lovable_prompt_v3.md`      | Last v3 Lovable prompt. Reference for current diagnostic only. Archive after render-fix closes.                                 |

### 3.4 In `docs/archive/`

| File                                               | Status                                                           |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| `docs/archive/darrowcode_ai_system_prompt_v2.1.md` | History only. Earlier, weaker prompt. Not referenced by runtime. |
| `docs/archive/darrowcode_lovable_prompt_v1.md`     | History only. Original MVP prompt. Not referenced by runtime.    |

### 3.5 Runtime-Connected vs Documentation-Only

| File                                        | Runtime-connected? | How                                                                                      |
| ------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------- |
| `src/lib/ai/darrowcode_ai_system_prompt.md` | **YES**            | Loaded by `system-prompt.ts` via `?raw` import                                           |
| `src/lib/ai/schema.ts`                      | **YES**            | Imported by anthropic.server.ts, diagnostic.server.ts, core-split.server.ts, template.ts |
| `src/lib/ai/user-prompt.ts`                 | **YES**            | Imported by pipeline.server.ts                                                           |
| `src/lib/ai/core-split.server.ts`           | **YES**            | Imported by anthropic.server.ts                                                          |
| `src/lib/ai/quality-gate.server.ts`         | **YES**            | Imported by diagnostic route                                                             |
| `src/lib/pdf/template.ts`                   | **YES**            | Imported by pipeline.server.ts                                                           |
| `src/lib/astro/FREEASTROAPI_REFERENCE.md`   | **NO**             | Documentation only, no TS import found                                                   |
| All other `.md` files in `src/lib/ai/`      | **NO**             | Documentation only, no TS imports                                                        |
| All files in `docs/`                        | **NO**             | Documentation only                                                                       |
| All files in `docs/current/`                | **NO**             | Documentation only                                                                       |
| All files in `docs/archive/`                | **NO**             | Documentation only                                                                       |

---

## 4 · WHAT MUST REMAIN UNTOUCHED UNTIL RENDER-FIX DIAGNOSTIC APPROVAL

Per `SOURCE_OF_TRUTH_v4_1.md` §7 and `DARROW_DOCS_AUDIT_AND_PLAN_v4_1.md` §7:

- `src/lib/ai/darrowcode_ai_system_prompt.md` — current v3 runtime prompt
- `src/lib/ai/schema.ts` — current v3 schema (CoreV3Schema + DarrowReportSchema)
- `src/lib/ai/user-prompt.ts` — current v3 user prompt builder
- `src/lib/ai/core-split.server.ts` — current split generator
- `src/lib/pdf/template.ts` — current v3 PDF template (render-fix applied)
- `src/lib/pdf/apitemplate.server.ts` — PDF rendering (APITemplate.io)
- `src/lib/pdf/stamp-page-numbers.server.ts` — page number stamper
- `src/lib/generation/pipeline.server.ts` — production pipeline
- `src/routes/api/public/payments/webhook.ts` — Stripe webhook
- `src/routes/api/public/jobs/process-generation.ts` — job dispatcher
- All Stripe / checkout / pricing code
- All Supabase Auth / token route code
- All Resend email code
- Current diagnostic routes (`/api/public/debug/core-v3-run` etc.)
- `.env*` files (do NOT overwrite local env files)

---

## 5 · WHAT FUTURE CORE v4.1 MIGRATION WILL REQUIRE

After render-fix diagnostic approval:

### 5.1 Schema Migration (`src/lib/ai/schema.ts`)

- Add `operating_mode` as a required section key (between `core_architecture` and `battery`)
- Move `cover_tagline` from a section key to a cover-page sub-field
- Add structured fields per section:
  - `opening_line` (short declarative hook)
  - `scenario` (lived recognizable moment)
  - `key_insight` (optional, sparse)
  - `proof_tags[]` per-section (≤5)
- Add special-section schemas:
  - `before_after_pairs` (exactly 2 Before / 2 After)
  - `executive_summary_blocks` (6 labeled blocks)
  - `closing_pillars` (4 pillars)
  - `disclaimer` on vitality_baseline (verbatim)
- Update word-count minimum checks to v4.1 targets (4,350–5,250 total)
- Keep `CoreV3Schema` for backward-compat with stored v3 reports
- New schema should be `CoreV4Schema` or `CoreUnveilSchema` — never mutate old schema

### 5.2 AI Prompt Migration

- Replace contents of `src/lib/ai/darrowcode_ai_system_prompt.md` with v4.1 prompt
  (source: `docs/darrowcode_ai_system_prompt_v4_1.md`)
- Update `coreV3Instructions()` in `user-prompt.ts` for v4.1 word targets and section map
- Update section suffixes in `core-split.server.ts` (A = sections 1–9, B = sections 10–17,
  but new partition must account for `operating_mode` as key #3)
- Remove `recommended_next_module` from body cross-sell positions where restricted

### 5.3 PDF Template Migration (`src/lib/pdf/template.ts`)

- Implement 26-page layout per `schema_template_patch_v4_1.md` §12 page map
- Render static pages: Cover (with `cover_tagline` sub-field), Personal Orientation System,
  Library, Back Cover
- Render structured fields: opening_line, scenario, prose, key_insight, protocols[], warnings[],
  proof_tags[], disclaimer, before_after_pairs, executive_summary_blocks, closing_pillars
- Template controls all visual hierarchy — AI generates content only
- Library page replaces old Ecosystem page

### 5.4 Backward Compatibility

- Keep legacy renderer path for old v3 reports (schema_version === "core_v3")
- v4.1 generation must **fail loudly** if required keys missing
- No silent fallback from v4.1 to v3 keys
- Do NOT mutate stored v3 reports

### 5.5 Quality Gate Updates

- Update `quality-gate.server.ts` to check v4.1 rules (no city claims, no operating_mode
  missing, proof_tags ≤5, etc.)
- Consider making gate trigger at least a warning on major v4.1 violations

---

## 6 · RISK RANKING

### Low risk — documentation changes only

- Archiving old docs in `docs/current/` and `src/lib/ai/*.md` (doc files only, no TS)
- Adding DEPRECATED headers to old spec files
- Creating this audit file and companion planning docs

### Medium risk — prompt / schema planning

- Designing the v4.1 schema shape (no code yet)
- Planning the section field migration
- Designing backward-compat adapter approach

### High risk — runtime / schema / template (NOT AUTHORIZED YET)

- Replacing `darrowcode_ai_system_prompt.md` (active runtime)
- Modifying `schema.ts` (used by all generation paths)
- Modifying `user-prompt.ts` (changes all paid reports)
- Modifying `template.ts` (changes all PDFs)
- Modifying `core-split.server.ts` (changes split generation)

### Blocked — until render-fix diagnostic approval

- ALL high-risk items above
- `operating_mode` implementation
- 26-page template rebuild
- Schema migration (CoreV4Schema addition)

---

## 7 · RECOMMENDED IMPLEMENTATION SEQUENCE

1. **Complete render-fix diagnostic** — confirm PDF renders cleanly on v3 sections.
   Route: `/api/public/debug/core-v3-run`. Visual PDF inspection required.

2. **Freeze approved docs** — ensure all v4.1 docs are committed and no further
   changes to the approved 8-file package until implementation begins.

3. **Define backward-compat strategy** — decide: schema union discriminant
   (`schema_version: "core_v3" | "core_v4"` or "core_unveil"), or
   separate legacy renderer function. Define before touching schema.

4. **Prepare single clean v4.1 implementation prompt** — one package, no mixed
   generations, scoped to implementation only. Do NOT feed Lovable/Claude Code
   a mix of old and new files.

5. **Migrate schema** — add `CoreV4Schema`, update `DarrowReportSchema` union,
   keep `CoreV3Schema` untouched for legacy render path.

6. **Migrate AI prompt and user-prompt builder** — swap system prompt file,
   update `coreV3Instructions()` to v4.1 spec, update `core-split.server.ts`
   section partition for new key order.

7. **Migrate PDF template** — implement 26-page layout from schema_template_patch_v4_1.
   Render all static pages. Render all structured fields. Visual inspection required.

8. **Add fail-loud validation** — quality gate must reject (not warn-only) on v4.1
   key violations: missing required keys, city claims in CORE, proof_tags > 5, etc.

9. **Run diagnostic generation** — one test generation, inspect JSON output.

10. **Run render-only re-render** — render the diagnostic JSON to PDF. Inspect
    all 26 pages visually.

11. **Only after visual approval: publish** — update production. Monitor first few
    real paid orders.

---

## 8 · ENV / SECRETS FINDING

**YELLOW FLAG — tracked .env files:**

- `.env`, `.env.development`, `.env.production` are ALL tracked by git (`git ls-files` confirms).
- Current contents are **public/publishable keys only** (Supabase anon key, Stripe pk*test*_,
  Stripe pk*live*_). These are designed to be public and are safe to expose.
- Real secrets (ANTHROPIC_API_KEY, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY,
  APITEMPLATE_API_KEY, RESEND_API_KEY, FREEASTROAPI_KEY) were NOT found in tracked files.
  They are presumably set as Cloudflare Workers environment variables.
- **This is not a critical security incident**, but tracking `.env` files in git is bad practice.
- **Recommendation (Phase 2):** Add `.env`, `.env.development`, `.env.production` to
  `.gitignore`. Remove them from git tracking (`git rm --cached`). Do NOT do this now
  (Phase 0 only; do not modify git history or env files without explicit approval).

---

🔒 STATUS: AUDIT ONLY · no code changes made · v3 runtime untouched · v4.1 planning documented
