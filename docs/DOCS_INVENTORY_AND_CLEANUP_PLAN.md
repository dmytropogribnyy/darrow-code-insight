# DARROW CODE — DOCS INVENTORY & CLEANUP PLAN
# Status: PLANNING ONLY — no files moved, deleted, or rewritten
# Governed by: docs/SOURCE_OF_TRUTH_v4_1.md + docs/DARROW_DOCS_AUDIT_AND_PLAN_v4_1.md
# Created: 2026-05-29

---

## 1 · PURPOSE

This file provides a full repository documentation inventory and a proposed
second-step cleanup plan so every doc file has a clear classification, future
action, and runtime-connection status.

Nothing is moved or deleted here. No old files are rewritten. This is the plan
for Phase 2 (docs cleanup), which is NOT authorized until Phase 1 (CORE v4.1
implementation) is complete and approved.

---

## 2 · CLASSIFICATION LEGEND

| Code | Meaning |
|------|---------|
| **ACTIVE v4.1** | Canonical approved source — use for quality/structure/implementation reference |
| **RUNTIME** | Connected to or loaded by runtime TypeScript code — do NOT change yet |
| **DIAGNOSTIC** | Describes current v3 runtime but is NOT a source instruction for v4.1 |
| **FREEASTROAPI REF** | Provider/integration reference — history/reference only |
| **ARCHIVE** | History only — never implement from |
| **UNSAFE** | Contains or may contain raw API key / secret — do not commit, do not copy |
| **UNKNOWN** | Needs manual review |

---

## 3 · FULL DOCUMENTATION INVENTORY

### 3.1 `docs/` root — v4.1 Approved Package

All 9 files are untracked (git status shows `??`) — they were added locally but
not yet committed. They contain no secrets. Commit the full v4.1 package together.

| File | Classification | Reason | Runtime-connected? | Action |
|------|---------------|--------|-------------------|--------|
| `docs/SOURCE_OF_TRUTH_v4_1.md` | **ACTIVE v4.1** | Governing canonical SOT; declares v4.1 approved future standard, v3 runtime temporary | NO | Keep; commit |
| `docs/DARROW_DOCS_AUDIT_AND_PLAN_v4_1.md` | **ACTIVE v4.1** | Controlling migration map; approved rev. 4 | NO | Keep; commit |
| `docs/DARROW_CORE_PRODUCT_CONCEPT_STANDARD_v4_1.md` | **ACTIVE v4.1** | Philosophy layer; approved rev. 3 | NO | Keep; commit |
| `docs/DARROW_CORE_MASTER_PATTERN_v4_1.md` | **ACTIVE v4.1** | Canonical structure; 26 pages / 4,350–5,250 words / 17 keys | NO | Keep; commit |
| `docs/DARROW_CORE_SAMPLE_REPORT_v4_1.md` | **ACTIVE v4.1** | Gold reference — approved tone/rhythm standard | NO | Keep; commit |
| `docs/DARROW_REPORT_CONTENT_STANDARD_v4_1.md` | **ACTIVE v4.1** | Quality layer — pass/fail rules | NO | Keep; commit |
| `docs/darrowcode_core_module_spec_v4_1.md` | **ACTIVE v4.1** | Runtime content map (future — not live yet) | NO | Keep; commit |
| `docs/darrowcode_ai_system_prompt_v4_1.md` | **ACTIVE v4.1** | Future prompt source doc — NOT active runtime | NO | Keep; commit — must NOT replace runtime prompt until authorized |
| `docs/schema_template_patch_v4_1.md` | **ACTIVE v4.1** | Future schema/template migration planning | NO | Keep; commit |

### 3.2 `docs/` root — FreeAstroAPI Reference Files

| File | Classification | Reason | Runtime-connected? | Action |
|------|---------------|--------|-------------------|--------|
| `docs/darrowcode_freeastroapi_lovable_prompt_v2.md` | **FREEASTROAPI REF** | Old v2 integration guide / Lovable prompt history. Do not use as implementation source. | NO | Keep as history; do not send to Lovable |
| `docs/FreeAstroAPI_DarrowCode_Integration_Updated_v2.md` | **FREEASTROAPI REF** | Updated v2 integration reference. Historical/reference only. | NO | Keep; add DEPRECATED header in Phase 2 |
| `docs/freeastroapi.md` | **FREEASTROAPI REF** | Raw API reference notes. Historical/reference only. | NO | Keep as archive |

### 3.3 `docs/` root — New Audit/Planning Files (created in this session)

| File | Classification | Reason | Runtime-connected? | Action |
|------|---------------|--------|-------------------|--------|
| `docs/CORE_V4_1_IMPLEMENTATION_READINESS_AUDIT.md` | **ACTIVE v4.1** | Audit of current v3 runtime vs v4.1 requirements | NO | Keep; commit |
| `docs/DOCS_INVENTORY_AND_CLEANUP_PLAN.md` | **ACTIVE v4.1** | This file — full docs inventory and cleanup plan | NO | Keep; commit |
| `docs/CORE_V4_1_IMPLEMENTATION_PLAN.md` | **ACTIVE v4.1** | Concrete future implementation plan | NO | Keep; commit |
| `docs/FREEASTROAPI_DARROW_REFERENCE_v3_PLACE_READY.md` | **ACTIVE v4.1** | FreeAstroAPI / PLACE reference aligned with v4.1 | NO | Keep; commit |

### 3.4 `docs/current/` — Outdated v3 Diagnostic Docs

These files describe the v3 runtime accurately but are NOT the target.
They must NOT be used as source instructions for v4.1 implementation.
None are referenced by runtime TypeScript code (confirmed by grep).

| File | Classification | Reason | Runtime-connected? | Action |
|------|---------------|--------|-------------------|--------|
| `docs/current/SOURCE_OF_TRUTH.md` | **DIAGNOSTIC** | Old v3 SOT; says "active CORE = 18–20 / 3,000–3,600" — directly conflicts v4.1. Superseded by SOURCE_OF_TRUTH_v4_1.md. | NO | In Phase 2: add DEPRECATED header; move to `docs/archive/v3_diagnostic/` |
| `docs/current/darrowcode_launch_requirements_v3.md` | **DIAGNOSTIC** | Ops/infrastructure parts (APITemplate, Resend, Supabase, DNS, assets) are still valid. Content targets (v3 word/page counts) are stale and conflict v4.1. | NO | In Phase 2: split — extract ops-valid parts into a runtime ops doc; archive content targets section |
| `docs/current/darrowcode_lovable_prompt_v3.md` | **DIAGNOSTIC** | Last v3 Lovable prompt. Usable only as reference for current diagnostic understanding. Do NOT use for v4.1 implementation. | NO | In Phase 2 (after render-fix closes): add DEPRECATED header; move to `docs/archive/v3_diagnostic/` |

### 3.5 `docs/archive/` — History Only

No runtime references found. Keep as historical record.

| File | Classification | Reason | Runtime-connected? | Action |
|------|---------------|--------|-------------------|--------|
| `docs/archive/darrowcode_ai_system_prompt_v2.1.md` | **ARCHIVE** | Earlier, weaker prompt than v3_merged. No runtime connection. History only. | NO | Leave in archive |
| `docs/archive/darrowcode_lovable_prompt_v1.md` | **ARCHIVE** | Original MVP prompt (12–14 pages CORE). History only. | NO | Leave in archive |

### 3.6 `src/lib/ai/` — Runtime-Connected Code Files

| File | Classification | Reason | Runtime-connected? | Action |
|------|---------------|--------|-------------------|--------|
| `src/lib/ai/darrowcode_ai_system_prompt.md` | **RUNTIME** | ONLY file imported by TS code (system-prompt.ts via `?raw`). Active v3.0 MERGED prompt. | **YES** | Do NOT touch until render-fix approved + v4.1 migration authorized |
| `src/lib/ai/system-prompt.ts` | **RUNTIME** | Loads the .md prompt; wires it to Anthropic calls | **YES** | Do NOT touch |
| `src/lib/ai/schema.ts` | **RUNTIME** | Zod schema; imported by all generation paths | **YES** | Do NOT touch |
| `src/lib/ai/user-prompt.ts` | **RUNTIME** | Builds per-request user message; hardcodes v3.1 targets | **YES** | Do NOT touch |
| `src/lib/ai/anthropic.server.ts` | **RUNTIME** | Anthropic API caller + chunked generation logic | **YES** | Do NOT touch |
| `src/lib/ai/core-split.server.ts` | **RUNTIME** | CORE split generation (2 sequential calls) | **YES** | Do NOT touch |
| `src/lib/ai/diagnostic.server.ts` | **RUNTIME** | Diagnostic AI runner (warn-only) | **YES** | Do NOT touch |
| `src/lib/ai/quality-gate.server.ts` | **RUNTIME** | Warn-only quality heuristics | **YES** | Do NOT touch |

### 3.7 `src/lib/ai/` — Documentation .md Files (NOT runtime-connected)

These files live in the code directory but are NOT imported by any TypeScript code.
They are documentation only. Confirmed: only `darrowcode_ai_system_prompt.md` is imported.

| File | Classification | Reason | Runtime-connected? | Action |
|------|---------------|--------|-------------------|--------|
| `src/lib/ai/DARROW_REPORT_CONTENT_STANDARD.md` | **DIAGNOSTIC** | Old v3 content standard. Superseded by `docs/DARROW_REPORT_CONTENT_STANDARD_v4_1.md`. | NO | In Phase 2: add DEPRECATED header; keep in place or move to archive |
| `src/lib/ai/darrowcode_core_module_spec.md` | **ARCHIVE** | Old v3 core blueprint; 3,000–3,600 words / 18–20 pages targets. Contains unsafe example ("psychic static"). Superseded by `docs/darrowcode_core_module_spec_v4_1.md`. | NO | In Phase 2: add DEPRECATED header; move to docs/archive/ |
| `src/lib/ai/darrowcode_addon_modules_spec.md` | **DIAGNOSTIC** | v3 add-on spec (8–10 pages / 1,200–1,500 words). Needs v4.1 pass after CORE locked. Do not use for v4.1 add-on implementation. | NO | In Phase 2: add DEPRECATED header; update after CORE v4.1 is complete |
| `src/lib/ai/darrowcode_quality_examples.md` | **ARCHIVE** | Old quality examples. May contain "centuries apart", 6 proof tags, harsh phrasing. Superseded by v4.1 gold sample. | NO | In Phase 2: add DEPRECATED header; move to docs/archive/ |

### 3.8 `src/lib/astro/` — Provider Reference

| File | Classification | Reason | Runtime-connected? | Action |
|------|---------------|--------|-------------------|--------|
| `src/lib/astro/FREEASTROAPI_REFERENCE.md` | **RUNTIME** (reference doc) | Cited by v3 SOT as the active provider reference. Not imported by TS code directly, but is the canonical provider reference doc used by developers. | Reference doc | Keep; do not change during Phase 0 |

### 3.9 `.env` Files — Security Status

| File | Tracked? | Contents | Action |
|------|----------|---------|--------|
| `.env` | **YES — tracked in git** | Supabase URL, project ID, ANON key (all public/publishable by design) | YELLOW FLAG — see below |
| `.env.development` | **YES — tracked in git** | Stripe test publishable key (pk_test_...) — public key by design | YELLOW FLAG — see below |
| `.env.production` | **YES — tracked in git** | Stripe live publishable key (pk_live_...) — public key by design | YELLOW FLAG — see below |
| `.env.local` | NOT FOUND | — | OK |

**YELLOW FLAG — .env files tracked in git:**
All three tracked `.env` files contain ONLY public/publishable keys (Supabase anon key,
Stripe publishable keys). These are intentionally client-visible and not secrets.
Real secrets (ANTHROPIC_API_KEY, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY,
APITEMPLATE_API_KEY, RESEND_API_KEY, FREEASTROAPI_KEY) were NOT found in any tracked file.
This is not a critical security incident, but tracking `.env` files sets a bad precedent
(the next developer may not distinguish public from secret values).

**Do NOT fix this in Phase 0.** Phase 2 action: add `.env`, `.env.development`,
`.env.production` to `.gitignore`, run `git rm --cached` to untrack them.
Do NOT do this until explicitly approved; do NOT remove working local env files.

### 3.10 `docs/API.docx` — Status

`docs/API.docx` — **NOT FOUND** in the repository. No action needed.
If this file is discovered in an untracked location, treat it as UNSAFE (it was
documented as containing a raw FreeAstroAPI key). Do not commit it. Do not print or
copy the key. Recommend key rotation if the key may still be active.

---

## 4 · PROPOSED SECOND-STEP CLEANUP

This cleanup is **NOT authorized until Phase 1 (CORE v4.1 implementation) is complete
and visually approved.** Do not perform any of these steps now.

### 4.1 Files to Archive

| File | Proposed destination |
|------|---------------------|
| `docs/current/SOURCE_OF_TRUTH.md` | Move to `docs/archive/v3_diagnostic/SOURCE_OF_TRUTH_v3.md` + add DEPRECATED header |
| `docs/current/darrowcode_lovable_prompt_v3.md` | Move to `docs/archive/v3_diagnostic/` + add DEPRECATED header |
| `src/lib/ai/darrowcode_core_module_spec.md` | Move to `docs/archive/v3_diagnostic/` + add DEPRECATED header |
| `src/lib/ai/darrowcode_quality_examples.md` | Move to `docs/archive/v3_diagnostic/` + add DEPRECATED header |

### 4.2 Files to Receive DEPRECATED Headers (in place)

| File | Reason |
|------|--------|
| `docs/current/darrowcode_launch_requirements_v3.md` | Ops parts valid; content targets stale. Add DEPRECATED header with note: "ops section still valid; word/page targets superseded by v4.1" |
| `src/lib/ai/DARROW_REPORT_CONTENT_STANDARD.md` | Superseded by `docs/DARROW_REPORT_CONTENT_STANDARD_v4_1.md` |
| `src/lib/ai/darrowcode_addon_modules_spec.md` | Needs v4.1 pass after CORE v4.1 locked |
| `docs/FreeAstroAPI_DarrowCode_Integration_Updated_v2.md` | Historical reference; superseded by `docs/FREEASTROAPI_DARROW_REFERENCE_v3_PLACE_READY.md` |

### 4.3 Files That Should Remain in `docs/archive/` as History Only

- `docs/archive/darrowcode_ai_system_prompt_v2.1.md`
- `docs/archive/darrowcode_lovable_prompt_v1.md`

### 4.4 Runtime References That Must Remain Until Migration

- `src/lib/ai/darrowcode_ai_system_prompt.md` — do NOT archive; this IS the live runtime
- `src/lib/astro/FREEASTROAPI_REFERENCE.md` — keep as provider reference
- All `.ts` runtime files — unchanged until migration

### 4.5 Env / Secret File Cleanup (requires explicit approval)

- Add `.env`, `.env.development`, `.env.production` to `.gitignore`
- Run `git rm --cached .env .env.development .env.production` to stop tracking
- Verify `.env.local` and any other local secrets are already gitignored

### 4.6 Files That Must Never Be Sent to Lovable

- Any file in `docs/current/` (old v3 targets would confuse implementation)
- Any file in `docs/archive/`
- `src/lib/ai/darrowcode_core_module_spec.md` (old unsafe wording)
- `src/lib/ai/darrowcode_quality_examples.md` (old phrasing)
- Mixed combinations of old v3 and new v4.1 files

### 4.7 Files That Must Never Be Used as Source Instructions for v4.1

Per `SOURCE_OF_TRUTH_v4_1.md` §8:
- `docs/current/SOURCE_OF_TRUTH.md` (says CORE = 18–20 / 3,000–3,600)
- `docs/current/darrowcode_lovable_prompt_v3.md`
- `docs/archive/darrowcode_ai_system_prompt_v2.1.md`
- `docs/archive/darrowcode_lovable_prompt_v1.md`
- `src/lib/ai/darrowcode_core_module_spec.md`
- `src/lib/ai/darrowcode_quality_examples.md`
- `src/lib/ai/DARROW_REPORT_CONTENT_STANDARD.md`
- Any `docs/FreeAstroAPI*` files except as API endpoint reference

---

🔒 STATUS: INVENTORY AND PLAN ONLY · no files moved, deleted, or rewritten
