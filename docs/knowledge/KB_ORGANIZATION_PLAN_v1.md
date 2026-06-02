# DARROW CODE — Knowledge Base Organization Plan v1

**Status:** KBSYS0 docs-only skeleton.  
**Scope:** organization plan only. No runtime, prompt, schema, provider, route, PDF, payment, email, or customer logic changes.

---

## 1. Purpose

This plan defines how Darrow Code knowledge materials should be organized before any future runtime integration.

The goal is to keep four layers separate:

```text
FreeAstroAPI / calculated provider data
→ source packs / research background
→ curated Darrow Code rules
→ provider-to-rule mapping
→ customer-facing report output
```

---

## 2. Directory roles

| Directory / file | Role | Runtime authority |
|---|---|---:|
| `SOURCE_POLICY.md` | Controlling source-use and claim policy | No direct runtime authority |
| `SOURCE_LOG.md` | External source tracking | No direct runtime authority |
| `KNOWLEDGE_SOURCE_MATRIX_v1.md` | Approved layer registry | Policy/reference only |
| `source_packs/` | Raw reviewed research appendices | Never runtime |
| `rules/` | Curated original Darrow rules | Future rule source after approval |
| `mapping/` | FreeAstroAPI / DarrowChartData mapping plans | Future mapping reference after approval |

---

## 3. Source packs

Source packs are raw research documents.

They may include:

- reviewed source matrices;
- market/category research;
- source-risk notes;
- extraction candidates;
- forbidden claim lists;
- future rule seeds.

They must always be marked:

```text
research only
not runtime
not prompt instruction
not schema instruction
not PDF/template instruction
not provider implementation instruction
```

---

## 4. Curated rules

Curated rule docs will be created later from approved source packs.

Every future rule should include:

- layer;
- trigger/source basis;
- Darrow meaning;
- strength expression;
- shadow expression;
- practical direction;
- report use;
- status: allowed / conditional / gated / blocked;
- forbidden claims.

Curated rules must use original Darrow Code language, not copied or lightly paraphrased external text.

---

## 5. Provider mapping

Provider mapping docs will later map:

```text
FreeAstroAPI / DarrowChartData field
→ normalized Darrow signal
→ curated rule doc
→ report section
→ allowed / conditional / gated / blocked
```

Mapping docs must rely on the existing provider layer and `DarrowChartData` shape. They must not create or modify runtime code.

---

## 6. Layer status summary

| Layer | Status | Notes |
|---|---|---|
| Western natal signs / planets / aspects | allowed | From calculated provider data + curated rules |
| Houses / angles / Ascendant / MC | conditional | Require reliable birth time and birthplace |
| Numerology | allowed / conditional | Birth-date fields allowed; full-name fields require input |
| BaZi / Four Pillars | conditional | Use only when provider payload exists; no technical dump |
| Chinese zodiac | conditional / gated | Soft cultural-symbolic layer only |
| Colors | gated | STYLE/future symbolic anchor only |
| Gemstones | gated | STYLE/identity-card future only; no remedial claims |
| Celtic trees / Ogham | gated | Optional poetic mirror only; not historical certainty |
| Astrocartography | blocked for CORE | Future PLACE-only capability |
| Synastry | blocked for CORE | Future LOVE-only capability |
| Health/Neijing | blocked | Not safe for MVP product output |
| Daily horoscopes | blocked | Not a Darrow source |

---

## 7. Current source-pack inventory to import later

Planned KB1 import candidates:

```text
DARROW_CODE_KNOWLEDGE_BASE_SOURCE_PACK_v0_1.md
DARROW_NUMEROLOGY_SOURCE_ADDENDUM_v0_1.md
DARROW_ASTROLOGY_NAMES_SOURCE_ADDENDUM_v0_1.md
DARROW_WESTERN_ZODIAC_SOURCE_ADDENDUM_v0_1.md
DARROW_ASTRO_HOUSES_SOURCE_ADDENDUM_v0_1.md
DARROW_CHINESE_ZODIAC_SOURCE_ADDENDUM_v0_1.md
DARROW_ASTRO_COLOR_SOURCE_ADDENDUM_v0_1.md
DARROW_ASTRO_GEMSTONE_SOURCE_ADDENDUM_v0_1.md
DARROW_CELTIC_TREE_SOURCE_ADDENDUM_v0_1.md
```

If a newer approved version exists, import the newer version and do not import the older one.

---

## 8. Change-control rule

Do not combine KB docs work with technical CORE v4 phases.

Forbidden in KBSYS0 / KB1 / KB2 / MAP1 docs phases:

- editing `src/`;
- editing prompts;
- editing schema;
- editing routes;
- editing PDF template;
- editing provider implementation;
- editing payment, Stripe, email, auth, customer, order, or token logic;
- running generation;
- calling Claude API;
- calling FreeAstroAPI.

---

## 9. Next phases

```text
KBSYS0 — skeleton and guardrails (this phase)
KB1 — import approved source packs into source_packs/
KB2 — create curated Darrow rule docs
MAP1 — map FreeAstroAPI / DarrowChartData to rules and report sections
RUNTIME-KB — only after explicit later approval
```
