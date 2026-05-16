
# Purchase Flow Audit & Implementation Plan

No code changes yet. This is a read-only audit of what exists today, what breaks under the new direction, and the safest phased rollout.

---

## 1. What the current implementation supports today

**Frontend**
- `src/routes/index.tsx` — homepage hero + single `IntakeForm`. No product selector. Hero copy already mentions "Optional focused chapters available **after** your CORE Report" — i.e. CORE-first is baked into the marketing.
- `src/components/IntakeForm.tsx` — collects intake, calls `createCoreCheckout` and opens embedded Stripe. Hard-coded CTA "Unlock My CORE Report · $4.99". No module selection.
- `src/routes/result.$reportToken.tsx` — returning-customer page. Shows remaining add-ons at flat **$2.99 each** (`total = selected.size * 2.99`), plus a "Complete your FULL CODE +$10.00" card shown only when `owned.size === 0` (i.e. CORE-only customers). Customer-facing label today: **"FULL CODE"**. No bundle pricing.

**Backend / checkout**
- `src/utils/checkout.functions.ts`
  - `createCoreCheckout` — always creates intake + order, lookup_key `core_499`, metadata `order_type: "CORE"`, `modules_to_purchase: "CORE"`.
  - `createUpsellCheckout` — takes `report_token` + `modules` + `order_type ∈ {"ADDONS","FULL_CODE_UPGRADE"}`. Strips already-owned modules. ADDONS price = `modules.length * MODULE_PRICE_CENTS` (flat). FULL_CODE_UPGRADE = single `full_code_upgrade_1000` lookup key.
- `src/lib/modules.ts` — Stripe lookup keys: `core_499`, `module_<x>_299` (×6), `full_code_upgrade_1000`. Constants `CORE_PRICE_CENTS=499`, `MODULE_PRICE_CENTS=299`, `FULL_CODE_UPGRADE_CENTS=1000`.

**Webhook** (`src/routes/api/public/payments/webhook.ts`)
- Branches on `order_type`:
  - `"FULL_CODE_UPGRADE"` → insert all 6 modules to `modules_purchased`
  - `"ADDONS"` → parse `modules_to_purchase` CSV
  - **else (CORE or anything unknown) → inserts ZERO modules into `modules_purchased`**. CORE ownership is implicit (a `reports` row exists for the intake), not a `modules_purchased` row.

**Pipeline** (`src/lib/generation/pipeline.server.ts`)
- `loadOrderContext` hard-codes `modules = ["CORE", ...owned add-ons]`. Every report always includes CORE.
- AI schema (`src/lib/ai/schema.ts`) requires `modules.CORE` (required field). Same in the JSON tool schema.
- AI system prompt (`src/lib/ai/darrowcode_ai_system_prompt.md`) is built around "CORE is the foundation; add-ons reference it"; explicit "CORE always present" guidance.
- PDF template (`src/lib/pdf/template.ts`) — `renderReportHtml` reads `report.modules.CORE` directly (`const core = report.modules.CORE`) and always renders the Client Snapshot + CORE chapter; add-ons are layered on top.

**Email** (`src/lib/email/resend.server.ts`)
- Single template `reportReadyEmail`, subject **"Your Darrow Code report is ready"**, body assumes a CORE report. No variant for chapter-only.

**DB / Stripe constraints**
- `modules_purchased` has unique `(customer_id, intake_id, module_code)` — duplicate-protected.
- No `module_code='CORE'` row is ever written today (CORE is implicit via `reports.intake_id`).
- Stripe: only 1 SKU per chapter (`module_<x>_299`) and 1 bundle SKU (`full_code_upgrade_1000`). No bundle SKUs for 2/3/4/5/6 chapters.

---

## 2. What breaks if a customer buys a non-CORE flow today

| Scenario | What breaks |
|---|---|
| **LOVE only (no CORE)** | (a) No UI to choose it. (b) Webhook `order_type` would have to be something other than CORE/ADDONS/FULL_CODE_UPGRADE — `ADDONS` path needs an intake that already exists; CORE-flow creates intake. (c) Pipeline forces `modules=["CORE", ...]` — would still generate CORE and the customer would get CORE without paying. (d) AI schema requires `modules.CORE`. (e) PDF template reads `report.modules.CORE` (will throw or render blank). (f) Email subject says "report is ready" — generic but acceptable. |
| **LOVE + MONEY only** | Same as above + no bundle pricing. Today it would compute `2 × $2.99 = $5.98` flat. |
| **CORE + LOVE in one checkout** | No path. `createCoreCheckout` only takes CORE; webhook ignores modules for CORE order_type. Customer would be charged $4.99, get CORE only, and `modules_purchased` would have no LOVE row. |
| **CORE Complete (first purchase)** | No homepage path. Today only available as an upsell after CORE. |
| **Returning customer buying 3 remaining chapters** | Works, but priced `3 × $2.99 = $8.97` (no bundle). |
| **Returning customer with CORE + 2 chapters wants "complete"** | UI hides the FULL CODE card (because `owned.size > 0`). Customer must hand-pick remaining and is charged flat. No clean completion price. |
| **Historical reports** | Safe — all existing rows are CORE-based, schema unchanged. Tokens keep working. |

---

## 3. Minimal backend changes required

These are **gated** changes; nothing here ships without explicit approval.

### 3a. `order_type` standardization (webhook + checkout.functions.ts)
- New canonical set: `"core" | "standalone_modules" | "core_plus_modules" | "full_code" | "addon"`.
- **Internal compat**: keep accepting legacy `"CORE" | "ADDONS" | "FULL_CODE_UPGRADE"` for any in-flight Stripe sessions during deploy window (map at webhook entry). No DB rename. No Stripe product rename. The string `"full_code"` matches your spec; customer never sees it.
- Webhook: when modules CSV includes `"CORE"`, also insert a `modules_purchased` row with `module_code='CORE'` so ownership becomes explicit and uniform. **Requires DB enum change** — currently `module_code` enum is `LOVE|MONEY|BODY|YEAR|STYLE|PLACE`. Need migration: `ALTER TYPE module_code ADD VALUE 'CORE'`. (Existing rows unaffected; legacy CORE ownership stays implicit via `reports`, and pipeline / `getReportContext` should treat `reports.intake_id ⇒ owns CORE` as the source of truth for backwards compat — the new enum value is just for forward writes.)

### 3b. Pipeline must respect actual purchased modules
- `loadOrderContext` should derive `modules` from the **order's `modules_to_purchase`** (or from `modules_purchased` for the intake), not unconditionally prepend `"CORE"`.
- Add a "report shape" decision: `hasCore = modules.includes("CORE")`. If `!hasCore`, schema, prompt and template must support a chapter-only PDF.

### 3c. AI schema + prompt for standalone chapters (BIGGEST RISK)
- Current schema: `modules.CORE` is `required`. Either:
  - **Option A (minimal)**: keep `client_snapshot` required (it provides the "foundation context") and make `modules.CORE` optional. Standalone chapter reports still produce a `client_snapshot` so the chapter has anchoring context, but no full CORE chapter pages. Lowest risk for AI quality.
  - **Option B (heavier)**: introduce a separate "standalone module" schema variant with an embedded mini-foundation paragraph per chapter. Requires substantial prompt rewrites and re-QA on output quality. **Defer.**
- Prompt md needs an addendum: "If `CORE` is not in `modules_to_generate`, still produce `client_snapshot` (the brief 1-page foundation), then the requested chapter(s) only — each chapter must read coherently without referencing missing CORE sections."
- **This needs a real eval run** on 3–5 birth profiles before launch.

### 3d. PDF template
- `renderReportHtml` must branch: with-CORE renders today's layout; without-CORE renders cover → disclaimer → client_snapshot → chapter(s) → cross-sell → closing. Modest refactor (~30 lines). No risk to existing CORE PDFs if branch is `hasCore ? today : new`.

### 3e. Bundle pricing — single source of truth
- Define a pure function `priceForModules(modules: ModuleCode[], includesCore: boolean): { cents, lookup_keys[], saved }` shared by:
  - server `createCheckout` (any flow)
  - client UI (order summary preview)
- Pricing table per your spec (in cents):
  - CORE only: 499
  - Chapters bundle ladder: 1→299, 2→499, 3→699, 4→899, 5→999, 6→1000
  - CORE + N chapters: 499 + ladder[N] (or use full_code price 1499 once it matches/beats sum)
  - CORE Complete: 1499 (NEW — replaces today's $14.99 marketing target; current `full_code_upgrade_1000` is the $10 upgrade SKU, kept for returning CORE-only customers)
- **Stripe SKUs to add** (5 new + 1 new):
  - `bundle_modules_2_499`, `bundle_modules_3_699`, `bundle_modules_4_899`, `bundle_modules_5_999`, `bundle_modules_6_1000`
  - `core_complete_1499` (for first-purchase CORE Complete)
- Keep existing single-chapter `module_<x>_299` for the 1-chapter case so add-on price-per-line stays clean and Stripe receipts read sensibly.
- **Source of truth**: server `priceForModules` only. Client UI displays "separate × N" + bundle price as marketing math, but server resolves the actual Stripe lookup key (which determines amount charged). This prevents client tampering.

### 3f. Duplicate protection
- Already enforced at DB (`unique (customer_id,intake_id,module_code)`) + webhook upsert with `ignoreDuplicates`. Server filters owned modules in `createUpsellCheckout`. Need to also filter on first-purchase flow if customer somehow re-submits (edge case; intake_id is fresh per first purchase, so low risk).

### 3g. Email variants
- Five subject/intro variants keyed off `(hasCore, chapterCount)`:
  | hasCore | chapters | subject |
  |---|---|---|
  | true | 0 | "Your Darrow Code CORE Report is ready" |
  | true | ≥1 (not all 6) | "Your Darrow Code Report is ready" |
  | true | 6 (CORE Complete) | "Your Darrow Code Complete reading is ready" |
  | false | 1 | "Your Darrow Code Focused Chapter is ready" |
  | false | ≥2 | "Your Darrow Code Focused Chapters are ready" |
- Body intro paragraph adapts; rest of template (header image, download/result links, signature) stays identical.

---

## 4. Minimal frontend changes required

### Homepage (`src/routes/index.tsx` + new `ProductSelector` component)
- Hero stays. Below hero, **before** the intake card, insert "Choose your report":
  - Recommended foundation card: CORE Report $4.99 (selectable).
  - Focused Chapters grid: 6 cards × $2.99 (multi-select).
  - CORE Complete card: $14.99 · Save $7.94 · Best value.
  - Live order summary (selected items · separate price · bundle price · savings · final price · adaptive CTA label).
- IntakeForm still collects birth data (required for any report type). Submit triggers a new `createCheckout` that accepts `{ modules, includesCore }` instead of the CORE-only fn. Old `createCoreCheckout` becomes a thin wrapper or is removed once frontend migrates.
- Update hero copy: drop "after your CORE Report"; replace with "Start with CORE, a focused chapter, or the full reading."

### Result page (`src/routes/result.$reportToken.tsx`)
- Show owned modules ("Owned: CORE, LOVE") explicitly.
- Remaining chapters: same card list, but selecting 2+ shows bundle price + savings.
- "Complete your reading" card:
  - If owns only CORE → "Complete your CORE — +$10.00 · Save $7.94" (existing flow, unchanged price).
  - If owns CORE + some chapters → show only remaining chapters bundle; **hide CORE Complete card** (avoids confusing fractional pricing).
  - If owns chapters but not CORE → offer "Add CORE Report — +$4.99" + remaining chapters bundle.
- Typography/contrast pass per spec: 13–14px chapter desc, 14–15px price Inter 600, gold accents, Warm Paper bg.

### CTA label logic (shared)
- Implement as one `ctaLabel(modules, hasCore)` helper used on both homepage and result page.

---

## 5. Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| AI prompt produces incoherent standalone chapter | **High** | Phase A: only allow CORE-inclusive flows from homepage (CORE, CORE+chapters, CORE Complete). Defer pure standalone chapters to Phase B after eval. |
| PDF template throws on missing `modules.CORE` | Medium | Defensive branch + unit-style smoke render on CI fixture. |
| Stripe price/lookup-key drift between sandbox/live | Medium | Add new lookup keys via `payments--batch_create_product` once approved; sync happens on publish. |
| Webhook double-charge / duplicate modules | Low | Existing dedupe (stripe_events + DB unique) covers it. |
| Existing in-flight Stripe sessions during deploy | Low | Webhook accepts both legacy and new `order_type` strings during transition window. |
| Customer confusion CORE vs CORE Complete vs FULL CODE | Medium | Hard rename in **all** user-facing copy/email/result/CTA to "CORE Complete"; "FULL CODE" stays only as internal `full_code` order_type and Stripe SKU id. Result-page card label changes today. |
| Historical reports / tokens | None | Schema is additive; old reports keep working unchanged. |
| Pricing client-tampering | Low | Server resolves Stripe price by lookup key; client number is display-only. |

---

## 6. Phased rollout recommendation

### Phase A (safe pre-launch, single deploy)
1. **Rename only**: result page "FULL CODE" → "CORE Complete" (copy change, no logic).
2. **Email variants** for the 3 CORE-inclusive cases (skip standalone-chapter variants).
3. **Bundle pricing for returning customers** on `/result`: implement `priceForModules`, add Stripe bundle SKUs, switch upsell checkout to use them. UI gets order summary with savings.
4. **Homepage selector** but **restricted to CORE-inclusive flows**: CORE only, CORE + chapters, CORE Complete. No standalone-chapter purchases yet. This avoids the AI/PDF/standalone risk entirely.
5. New `order_type` values shipped, webhook accepts both old and new.
6. CORE Complete first-purchase SKU `core_complete_1499` added.

Phase A is one deploy, ships before launch, leaves CORE-first path fully intact (CORE-only purchases still work identically), and gives customers most of the requested flexibility.

### Phase B (post-launch, gated on AI eval)
1. Standalone Focused Chapter purchases (no CORE).
2. AI prompt + schema changes to make chapters coherent alone.
3. PDF template "no-CORE" branch.
4. Email variants for chapter-only.
5. Returning-customer "add CORE later" flow.

Defer until: (a) Phase A is in prod, (b) you've run a manual eval of 3–5 standalone chapters and accepted the quality.

---

## 7. Open questions before implementation

1. **Confirm CORE Complete price = $14.99 first purchase, $10.00 upgrade from CORE-only.** (Today's `full_code_upgrade_1000` = $10 and your spec for the upgrade says +$10.00 — matches. The new SKU is the first-purchase $14.99.)
2. **Confirm Phase A scope is acceptable** (no standalone chapters in v1), or whether you want to push standalone chapters into v1 and accept the AI risk.
3. **Confirm explicit `modules_purchased` rows for CORE going forward.** Requires `ALTER TYPE module_code ADD VALUE 'CORE'`. Backwards compat preserved: old CORE ownership stays inferred from `reports.intake_id`.
4. **Confirm "CORE Complete" as the only customer-facing label** — drop "FULL CODE" from all UI/email/result strings immediately.

Awaiting your go/no-go on each of these before I touch any code.
