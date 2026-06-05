# CORE v4.1 — Readiness Status

**Updated:** 2026-06-04 · **HEAD:** `d64c63f` · **Production:** v3 (unchanged)

> Start here when resuming CORE v4.1 work. This is the single source of truth for
> "what is done, what works, what is not production yet, and how to run it."

---

## 1 · Phase status

| Phase | What | Status |
|---|---|---|
| B5.0 | Full v4.1 diagnostic CORE sample (fixture) + visual baseline | ✅ accepted |
| B5.0-AFTER | Before/After pair order + artifact freshness | ✅ accepted |
| B5.1 | Staged v4 prompt audit / hardening / tests | ✅ accepted |
| B5.2 (CLI) | Manual CORE v4 JSON diagnostic CLI | ✅ accepted |
| B5.2 (real run) | One approved real v4 generation (Anthropic) | ✅ done (32 pp artifact) |
| B5.2 (PDF polish, `d64c63f`) | Combined warning/protocol blocks, page-break protection, prompt + medical-wording guard | ✅ code accepted · **fresh-PDF visual QA pending** |
| B5.3 | This docs/readiness lock | in progress |
| B6 | Focused module patterns + real content calibration | not started |
| prod switch | Switch production to v4.1 | not started (separate explicit phase) |

---

## 2 · What works now (staged / diagnostic)

- **Diagnostic fixture** — deterministic gold sample renders cleanly (21 pp).
- **Staged v4 prompt** — `src/lib/ai/darrowcode_ai_system_prompt_v4_1.md` (NOT active).
- **Staged generator** — `generateCoreV4Split()` (Anthropic, two-call split).
- **Schema** — `CoreV4Schema` (strict; 17 body keys + cover_tagline; locked exec labels / pillar titles; before_after length 2; proof_tags ≤ 5).
- **Evaluation stack** — `evaluateCoreV4Structure()` + `evaluateCoreV4Lengths()`.
- **Manual diagnostic CLI** — `npm run diagnostic:core-v4` (plan-only default).
- **No-AI re-render** — `CORE_V4_FROM_JSON=<path>` re-renders HTML/PDF from existing JSON without any AI call.
- **v4 renderer** — `renderCoreV4HtmlSafe`:
  - multiple `warning_signals` → ONE combined **WARNING SIGNALS** block (numbered); single → singular **Warning Signal**.
  - multiple `protocols` → ONE combined **PROTOCOLS** block; single → **PROTOCOL · Title**.
  - v4 callout boxes carry `break-inside:avoid` (label+body never split across a page) and relocate whole instead of force-splitting.
  - `BODY_PAGE_STYLE_V4` adds `box-decoration-break:clone` so section padding repeats on continuation pages (carried-over content is not glued to the top).

---

## 3 · What is NOT production yet

- No production v4 route. No production switch. `system-prompt.ts` and `pipeline.server.ts` unchanged; paid pipeline still checks `core_v3`.
- No `CORE_SCHEMA_VERSION` / env selector.
- No Supabase persistence, no email delivery, no checkout/order routing for v4.
- No OpenAI / GPT fallback (Anthropic only for the current v4 diagnostic path; a provider-fallback phase is future + separate, only if needed).

---

## 4 · Commands

```bash
# plan-only (default — no AI, writes nothing)
npm run diagnostic:core-v4

# approved real diagnostic (uses Anthropic tokens) + render html+pdf
CORE_V4_APPROVE_AI=1 CORE_V4_RENDER=html,pdf npm run diagnostic:core-v4

# re-render HTML+PDF from existing JSON — NO AI call
CORE_V4_FROM_JSON=outputs/core-v4-diagnostic/core-v4-diagnostic.report.json \
  CORE_V4_RENDER=html,pdf npm run diagnostic:core-v4
```

Env "flags": `CORE_V4_APPROVE_AI`, `CORE_V4_MODEL` (default `claude-sonnet-4-6`),
`CORE_V4_FALLBACK_MODEL`, `CORE_V4_MODE` (sequential|parallel), `CORE_V4_OUT_DIR`,
`CORE_V4_RENDER` (`html`,`pdf`), `CORE_V4_FROM_JSON`. Runs under Vitest (no new dep).

---

## 5 · Secrets

- **`ANTHROPIC_API_KEY`** — required for a real Anthropic generation (CLI approved run, and future production Claude generation). Read from `process.env`.
- Not present in any repo `.env`; for Cloudflare it lives as a Workers secret (`wrangler secret`).
- **`OPENAI_API_KEY`** — NOT needed; no OpenAI usage in this repo today.
- Do not commit secrets. Do not paste API keys in chat. Use local session env or hosting secrets.

---

## 6 · Artifact paths (real diagnostic run)

```
outputs/core-v4-diagnostic/core-v4-diagnostic.raw.json        # full merged report
outputs/core-v4-diagnostic/core-v4-diagnostic.report.json     # CORE module
outputs/core-v4-diagnostic/core-v4-diagnostic.validation.json # validation result
outputs/core-v4-diagnostic/core-v4-diagnostic.html
outputs/core-v4-diagnostic/core-v4-diagnostic.pdf
```

`outputs/` is gitignored — artifacts are never committed.

### Page-count note (avoids confusion)

| Artifact | Pages | Authority |
|---|---|---|
| Production target (`DARROW_CORE_MASTER_PATTERN_v4_1.md`) | **26** | product spec (incl. static Library + Back Cover pages) |
| Diagnostic fixture (`outputs/pdf-v4.1-core-diagnostic.pdf`) | 21 | layout sample only — **not** the page-count authority |
| Real v4 generation (`outputs/core-v4-diagnostic/…pdf`) | 32 | current model output — over target; section-length calibration is **B6** |

The diagnostic layout is not the final production page-count authority. The 26-page
target stands; current real output (32 pp) needs B6 content calibration to reach it.

---

## 7 · Acceptance gates (v4 diagnostic)

- `CoreV4Schema` PASS · structure PASS · section lengths acceptable.
- No repeated stacked WARNING SIGNAL / PROTOCOL labels. ✅ (renderer normalizes)
- No callout label/body split across pages. ✅ (`break-inside:avoid`)
- No browser headers/footers, no blank pages, Darrow footer numbering. ✅
- No medical/clinical wording (`depression`, `diagnosis`, `clinical`, `therapy`) — staged prompt bans it; **content already generated before `d64c63f` may still contain it until regenerated.**
- Human content-quality review.

---

## 8 · Recommended next step

1. **A — Visual QA** the freshly re-rendered real-v4 PDF after `d64c63f`:
   `outputs/core-v4-diagnostic/core-v4-diagnostic.pdf` (32 pp) — confirm combined WARNING SIGNALS blocks, no stacked labels, continuation padding.
2. **B** — if good, lock B5 as fully accepted.
3. **C — B6** focused module patterns + real content calibration (section lengths to 26-page target; the `not depression` wording will clear on regeneration).
4. **D** — production switch later, in a separate explicit phase, only after v4 JSON + PDF diagnostics are accepted.
