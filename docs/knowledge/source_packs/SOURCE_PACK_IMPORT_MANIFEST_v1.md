# DARROW CODE — Source Pack Import Manifest v1

**Status:** KB1-A approved manifest · docs-only · 2026-06-02
**Phase:** KB1-A (inspect + prepare)
**Next phase:** KB1-B (import approved canonical files)
**Scope:** manifest only. No source packs imported yet. No runtime changes.

Governed by: `SOURCE_POLICY.md` · `KNOWLEDGE_SOURCE_MATRIX_v1.md` · `docs/knowledge/mapping/GATED_LAYERS_POLICY_v1.md`

---

## 1. Purpose

This manifest defines the expected source-pack files to be imported during KB1-B, their authority scope, version-selection rules, division of responsibility, and claim boundaries.

No source pack listed here has been imported yet.
No runtime, prompt, schema, route, PDF, Stripe, or payment logic is touched in KB1-A or KB1-B.

---

## 2. Import candidates

The following nine files are the approved KB1-B import candidates.

### 2.1 File list

| # | File | Layer | Version rule |
|---|---|---|---|
| 1 | `DARROW_CODE_KNOWLEDGE_BASE_SOURCE_PACK_v0_1.md` | Core knowledge base · all layers overview | Import only if no v0_2+ exists |
| 2 | `DARROW_NUMEROLOGY_SOURCE_ADDENDUM_v0_1.md` | Numerology (LP, Expr, Soul Urge, Birthday, PY) | Import only if no v0_2+ exists |
| 3 | `DARROW_ASTROLOGY_NAMES_SOURCE_ADDENDUM_v0_1.md` | Name symbolism / etymology | Import only if no v0_2+ exists |
| 4 | `DARROW_WESTERN_ZODIAC_SOURCE_ADDENDUM_v0_1.md` | Western natal signs, planets, aspects, elements | Import only if no v0_2+ exists |
| 5 | `DARROW_ASTRO_HOUSES_SOURCE_ADDENDUM_v0_1.md` | Houses, Ascendant, MC/IC/DC angles | Import only if no v0_2+ exists |
| 6 | `DARROW_CHINESE_ZODIAC_SOURCE_ADDENDUM_v0_1.md` | Chinese zodiac animal / soft cultural-symbolic layer | Import only if no v0_2+ exists |
| 7 | `DARROW_ASTRO_COLOR_SOURCE_ADDENDUM_v0_1.md` | Supportive colors (gated) | Import only if no v0_2+ exists |
| 8 | `DARROW_ASTRO_GEMSTONE_SOURCE_ADDENDUM_v0_1.md` | Supportive gemstones (gated) | Import only if no v0_2+ exists |
| 9 | `DARROW_CELTIC_TREE_SOURCE_ADDENDUM_v0_1.md` | Celtic trees / Ogham (gated) | Import only if no v0_2+ exists |

### 2.2 Authority scope for every file in this list

Each imported file carries **only** the following authority:

```text
Status:                     research/source-pack only
Runtime status:             not active
Prompt authority:           none
Schema authority:           none
PDF/template authority:     none
Provider implementation:    none
Report generation:          none
Stripe/payment/auth:        none
Gated-layer activation:     none — docs-only existence is not runtime permission
```

Importing a file into `docs/knowledge/source_packs/` does **not** activate any layer in production.
Docs-only existence is never runtime permission (see `GATED_LAYERS_POLICY_v1.md` §8).

---

## 3. Canonical-version check

Before importing during KB1-B:

1. Check whether a newer approved version exists (e.g. `v0_2`, `v1_0`).
2. If a newer approved version exists → import only the newer version. Do not import both.
3. If only `v0_1` exists and it is the current approved version → import `v0_1`.
4. Do not import duplicate `v0_1` / `v0_2` variants unless explicitly instructed by the user.
5. If version status is unclear → pause and ask the user before importing.

Version determination belongs to the GPT/user review step (see §4 below).

---

## 4. Division of responsibility

| Actor | KB1-A (this phase) | KB1-B (next phase) |
|---|---|---|
| GPT / user | Review and optimize source-pack appendices | Approve final canonical versions for import |
| Claude | Inspect skeleton; create this manifest | Import only explicitly approved canonical files into `docs/knowledge/source_packs/` |
| Claude | No source content rewrites | Must not rewrite source content into runtime rules |
| Claude | No curated rules | Curated rules belong to KB2 — not KB1-A or KB1-B |
| Claude | No mapping work | FreeAstroAPI mapping belongs to MAP1 — not KB1 |

### 4.1 What Claude must NOT do during KB1-B

- Do not rewrite source content into curated rules.
- Do not activate any gated layer.
- Do not modify `src/`, prompts, schema, routes, PDF template, provider implementation, Stripe/payment/email/auth/customer/order/token logic.
- Do not create curated rule docs (belongs to KB2).
- Do not create provider mapping (belongs to MAP1).
- Do not import a source pack if the user has not explicitly approved the canonical version.

---

## 5. Gated-layer status at import time

Importing the source packs listed above does **not** change any gating status.
The following layers remain gated after KB1-B import:

| Layer | Status after import | Runtime gate |
|---|---|---|
| Colors | gated | Not active in CORE until explicit unlock |
| Gemstones | gated | Not active in CORE until explicit unlock |
| Celtic trees / Ogham | gated | Not active in CORE until explicit unlock |
| Name etymology automation | gated | Not active until curated rules + explicit unlock |
| Chinese zodiac | conditional / gated | Soft cultural-symbolic only; no compatibility claims |
| Houses / Ascendant / MC | conditional | Require reliable birth time and birthplace |
| Astrocartography | blocked for CORE | Future PLACE-only capability |
| Synastry | blocked for CORE | Future LOVE-only capability |
| Health / Neijing | blocked | Not safe for MVP product output |

---

## 6. Blocked claims

The following claims must not appear in any source pack, and must not be generated from source-pack content at any phase:

```text
lucky numbers / colors / stones / dates / directions
heals / healing claims
protects / protection claims
attracts money / love / success / luck / wealth
compatibility guarantees
health guarantees
career guarantees
gemstone remedy instructions (finger, metal, carat, ritual)
name-change recommendations
daily horoscope predictions
deterministic fate / destiny claims
event prediction certainty
Tai Sui fear / remedy framing
medical / legal / financial certainty
synastry in CORE
astrocartography in CORE
provider-generated psychological report prose as Darrow content
```

---

## 7. Required file header for every imported source pack

Every file imported during KB1-B must include or preserve this header block:

```text
Status: research/source-pack only
Runtime status: not active
Not prompt authority
Not schema authority
Not PDF/template authority
Not provider implementation authority
Not report generation authority
Gated layers in this file remain gated until explicitly unlocked
Blocked claims must not be generated from this content
```

---

## 8. Files NOT overwritten by KB1-A or KB1-B

The following B0-approved files must not be overwritten, replaced, or modified by any KB phase work:

```text
docs/knowledge/SOURCE_POLICY.md
docs/knowledge/SOURCE_LOG.md
docs/knowledge/KNOWLEDGE_SOURCE_MATRIX_v1.md
```

If a KB phase would conflict with these files, this manifest and the phase work must defer to those files.

---

## 9. Phase boundaries

```text
KBSYS0   skeleton and guardrails (done — d2d271f)
KB1-A    inspect skeleton; create this manifest (this commit)
KB1-B    import approved canonical source packs into docs/knowledge/source_packs/
KB2      create curated Darrow rule docs in docs/knowledge/rules/
MAP1     map FreeAstroAPI / DarrowChartData fields to rules and report sections
RUNTIME  only after explicit later approval — not part of KB phases
```

B4 and later technical phases proceed independently on the runtime side.
KB docs phases and technical B-phases must not be mixed in the same commit.

---

🔒 STATUS: KB1-A approved import manifest · no source packs imported · no runtime changes
