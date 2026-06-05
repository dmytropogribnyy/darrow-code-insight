# Darrow Code — Documentation Root

> **Where to start:**
> - **Launch status / what's blocking go-live →** [`launch-readiness-map.md`](launch-readiness-map.md)
> - **Resuming CORE v4.1 work →** [`core-v4.1-readiness-status.md`](core-v4.1-readiness-status.md)
>
> Production currently runs **CORE v3** (one combined PDF per purchase). v4.1 is
> diagnostic/staged only. (Commit hashes elsewhere are *historical snapshots*, not the
> current HEAD — use `git log` for the live HEAD.)

## Operations & Launch

| File | Role |
|---|---|
| [`launch-readiness-map.md`](launch-readiness-map.md) | What's ready / partial / blocking before public launch; P0–P2 blockers; next-phase order |
| [`bundle-separate-reports-plan.md`](bundle-separate-reports-plan.md) | Bundles must deliver **separate** PDFs per module (current arch = one combined PDF); BUNDLE-B/C/D plan |
| [`support-runbook-report-recovery.md`](support-runbook-report-recovery.md) | Find an order/report and recover it (resend/regenerate/refund); `npm run support:report` |
| [`local-secrets.md`](local-secrets.md) | Local `.env.local` + production secret checklist (never committed) |
| [`data-source-map-by-module.md`](data-source-map-by-module.md) | Raw data / FreeAstroAPI source contract per module (CORE + LOVE/MONEY/BODY/YEAR/STYLE/PLACE); availability rules; gaps |
| [`material-assembly-readiness.md`](material-assembly-readiness.md) | Can the system assemble the full material pack per report? Dictionary status, per-module safe categories, do-not-claim list, `npm run audit:freeastroapi` |
| [`module-content-contracts.md`](module-content-contracts.md) | Per-module content + material contracts (CORE/LOVE/MONEY/BODY/YEAR/STYLE/PLACE): allowed/forbidden data, structure, fallbacks, proof anchors, safety, do-not-claim registry |
| [`core-v4.1-readiness-status.md`](core-v4.1-readiness-status.md) | CORE v4.1 phase status, what works, what's not production, run commands |
| `darrow-companion-custom-question-roadmap.md` | **TODO (not yet written)** — Darrow Companion / custom-question feature, future / feature-gated |

## Active v4.1 Canonical Documentation

The files in `docs/` root are the **active v4.1 canonical documentation set**.
They govern the CORE Report: UNVEIL (Cosmic Core Code Method) migration.

| File | Role |
|---|---|
| `SOURCE_OF_TRUTH_v4_1.md` | Canonical source of truth — governs migration |
| `DARROW_DOCS_AUDIT_AND_PLAN_v4_1.md` | Controlling migration map |
| `DARROW_CORE_PRODUCT_CONCEPT_STANDARD_v4_1.md` | Philosophy / product intent |
| `DARROW_CORE_MASTER_PATTERN_v4_1.md` | Canonical structure |
| `DARROW_CORE_SAMPLE_REPORT_v4_1.md` | Gold reference |
| `DARROW_REPORT_CONTENT_STANDARD_v4_1.md` | Quality layer |
| `darrowcode_core_module_spec_v4_1.md` | Module / content map |
| `darrowcode_ai_system_prompt_v4_1.md` | Future prompt source |
| `schema_template_patch_v4_1.md` | Schema/template migration planning |
| `CORE_V4_1_IMPLEMENTATION_PLAN.md` | Implementation plan |
| `CORE_V4_1_IMPLEMENTATION_READINESS_AUDIT.md` | Readiness audit |
| `DARROW_CORE_PRODUCT_CONCEPT_STANDARD_v4_1.md` | Product concept |
| `DOCS_INVENTORY_AND_CLEANUP_PLAN.md` | Docs cleanup map |

## Knowledge Base (Policy Layer)

`docs/knowledge/` — Darrow Code internal knowledge base.
Policy and structure layer only at B0. Full dictionaries are a future phase.

## Archive

`docs/archive/` — Historical files retained for reference only.
- `docs/archive/v3_current_legacy/` — Legacy v3 docs (formerly in `docs/current/`)
- `docs/archive/` root files — Earlier MVP/v2 prompts

**Do not use archived files as implementation sources.**
