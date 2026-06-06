# KNOWLEDGE-WIRE — grounding every module in curated Darrow knowledge

**Goal:** maximally wire the **safe, original** curated interpretation layer into CORE + every add-on +
Continuum, so output is explicitly "Darrow Method" grounded — not AI-from-training. Synthesized from a
full audit of `docs/knowledge/` (rules/, modules/, mapping/, source_packs/, governance).

**Hard rule:** wire only **`docs/knowledge/rules/`** (original Darrow, IP-safe). **Never inject
`source_packs/`** (third-party research — IP: must not reproduce wording). Gated/blocked layers stay off.

---

## 1. Readiness audit (what we can wire now vs what needs authoring)

| Knowledge | State | Action |
|---|---|---|
| `ASTRO_ZODIAC_RULES` (12 signs) | ✅ complete, structured, original | **code → dict, wire** |
| `ASTRO_PLANET_RULES` (10 + Chiron/Node/Lilith conditional) | ✅ complete | **code → dict, wire** |
| `ASTRO_HOUSE_RULES` (12 houses) | ✅ complete, **birth-time gated** | **code → dict, wire (gated)** |
| `ASTRO_ASPECT_RULES` (6 major) | ✅ complete | **code → dict, wire** |
| `ELEMENT_MODALITY_RULES` (4 elem + 3 modal + polarity) | ✅ complete | **code → dict, wire** |
| `numerology-meanings.ts` | ✅ already coded (1–9 + 11/22/33) | reuse as the model |
| `BAZI_INTERPRETATION_RULES` | ⚠️ **stub** — data live, no meaning dict | **author dict** (Phase 2) |
| `ARCHETYPE_LIBRARY` | ⚠️ 1 entry only | **author library** (Phase 2) |
| Colors / Gemstones / Celtic / Names | 🔒 gated | stay OFF (separate approval + dict) |
| Astrocartography / cities / relocation (PLACE) | 🔒 blocked (MAP0) | stay OFF — PLACE uses soft archetype only |
| Synastry / compatibility (LOVE) | 🔒 blocked | stay OFF — LOVE is self-only |
| `source_packs/*` | 🔒 IP | **NEVER inject** (provenance only) |

Each `rules/` entry already carries `forbidden_claims` + `safe_report_use` (module/section routing) + a
`sample_phrase` (Darrow voice). Governance: `GATED_LAYERS_POLICY_v1`, `KNOWLEDGE_SOURCE_MATRIX_v1`,
`BIRTH_TIME_RELIABILITY_POLICY_v1`, `SOURCE_POLICY` (IP).

## 2. Per-module knowledge map (what each module consumes)

Gating is uniform: **houses/ASC/MC only if `birth_time_confidence="exact"`**; BaZi only if payload present;
name-numerology only if full name; never invent absent data (fallback chain).

| Module | Data signals | Knowledge to wire | Hard exclusions |
|---|---|---|---|
| **CORE** | Sun/Moon/all planets, aspects, element/modality, numerology (LP/Birthday/PY); houses/ASC/MC *(birth_time)*; BaZi *(payload)* | ZODIAC, PLANET, ASPECT, ELEMENT, HOUSE(gated), (BaZi, archetype — Phase 2) | colors/stones, cities, synastry, health, horoscope, lucky/fate, medical/legal/financial |
| **LOVE** | Moon/Venus/Mars + aspects; 5H/7H/8H *(birth_time)*; Soul Urge *(name)* | PLANET(Moon/Venus/Mars/Saturn/Pluto/Neptune), ASPECT, HOUSE(5/7/8 gated) | synastry/compatibility, soulmate, marriage/divorce predictions, healing |
| **MONEY** | Jupiter/Saturn/Venus/Mars/Pluto/Sun/Mercury + aspects, Earth, LP; 2H/6H/8H/10H/MC *(birth_time)*; BaZi | PLANET, ASPECT, ZODIAC(Cap/Tau), ELEMENT(Earth), HOUSE(2/6/8/10 gated) | investment/financial advice, wealth/income guarantees, specific career/income, relocation |
| **BODY** | Moon/Mars/Saturn/Sun + aspects, element balance; 1H/4H/6H/12H *(birth_time)*; moon phase, BaZi | PLANET(Moon/Mars/Saturn/Sun/Neptune), ASPECT, ELEMENT, HOUSE(1/4/6/12 gated) | health diagnosis, medical advice/guarantees, healing stones/colors, body-type claims |
| **YEAR** | Personal Year *(required)*; transits, solar return, BaZi flow, moon phase *(payload)* | PLANET(transpersonal-in-transit), numerology PY; (transit/SR/flow rules — Phase 2) | daily horoscope, event/date predictions, outcome guarantees |
| **STYLE** | Venus/Moon/Sun + aspects, element; ASC/1H/5H *(birth_time)* | PLANET(Venus/Moon/Sun/Neptune), ZODIAC(Lib/Tau), ELEMENT, HOUSE(1/5 gated) | colors/stones as luck/healing/protection, must-wear, color compatibility |
| **PLACE** | Moon + environmental resonance (soft archetype only) | `PLACE_USE_CASE_ARCHETYPES`, `CORE_PLACE_ARCHETYPE_POLICY` (soft, non-ranked) | **cities/astrocartography/relocation (MAP0-blocked)**, move/buy advice |
| **CONTINUUM 7d/30d** | timing layers: Personal Year, transits, solar return, BaZi flow, moon phase | numerology PY + (transit/flow rules — Phase 2); planet-in-transit framing | guaranteed predictions, "this will happen", calendar-week/month framing |

## 3. Architecture (extends the proven numerology pattern)

Code the `rules/` into structured TS dictionaries (token-controlled, testable, forbidden_claims travel with
each entry), then a gated per-module selector:

```
src/lib/knowledge/
  astro-zodiac.ts       // 12 signs   (from ASTRO_ZODIAC_RULES)
  astro-planet.ts       // 10+3       (from ASTRO_PLANET_RULES)
  astro-house.ts        // 12, gated  (from ASTRO_HOUSE_RULES)
  astro-aspect.ts       // 6 major    (from ASTRO_ASPECT_RULES)
  element-modality.ts   // 4+3+pol    (from ELEMENT_MODALITY_RULES)
  bazi-meanings.ts      // Phase 2 (author)
  archetype-library.ts  // Phase 2 (author)
  build-knowledge-pack.ts  // buildKnowledgePackForModule(module, materialPacket)
```

`buildKnowledgePackForModule(module, packet)`:
- selects ONLY the placements present in THIS chart (Sun=Capricorn → pull Capricorn + Sun entries),
- gates houses/ASC by `birth_time_confidence`, BaZi by availability, name-num by full name,
- routes by each entry's `safe_report_use` so a module only gets its relevant layers,
- enforces a **token budget** (top-N most-central placements by aspect orb / dominance),
- carries each entry's `forbidden_claims` into the prompt's safety block,
- **never** includes gated/blocked layers or source_packs.

The pack is injected into the existing CORE/add-on/Continuum prompt builders as a grounded
"DARROW INTERPRETATION KNOWLEDGE (use these meanings/framings)" block — augmenting, not replacing, the
material packet + safety contracts.

## 4. Implementation phases (staged + re-validated)

- **Stage 1 — Western-astro dicts + selector + CORE.** Code zodiac/planet/house/aspect/element from
  `rules/`; build `buildKnowledgePackForModule`; wire CORE; unit tests (selection, gating, forbidden not
  injected, source_packs never injected); **real-AI A/B on CORE** (with vs without pack — Darrow-ness,
  schema-valid, forbidden-clean, token cost). Verify rule text is original (not copied from source_packs).
- **Stage 2 — All add-ons + Continuum.** Wire LOVE/MONEY/BODY/YEAR/STYLE/PLACE(soft)/Continuum per the
  map; **re-run PHASE 4 real-AI diagnostics for every module** (schema + proof-anchor + forbidden scans).
- **Stage 3 — author the curated dicts that need writing** (owner-reviewed drafts, original Darrow
  language from concepts, each carrying its own `forbidden_claims`): BaZi meaning dict (Day Master /
  Five Elements / Ten Gods), Archetype library, Chinese-zodiac soft layer, Names soft layer, and
  Colors/Stones **as aesthetic/sensory anchors only** (STYLE) — never luck/healing/protection. Wire +
  re-validate each.
- **Stage 4 — timing knowledge for YEAR + Continuum**: transit / solar-return / BaZi-flow / moon-phase
  interpretation rules; wire; re-validate Continuum 7d/30d.

**Maximal-enrichment mandate (owner-approved):** author curated original rules for EVERY layer that adds
value, mining `source_packs/` + general/licensed sources for concepts (never wording). Each stage gates
on: schema valid · proof-anchored · **zero forbidden claims** (incl. no luck/healing/protection/medical/
guarantee) · token budget OK. Authored dicts are drafts pending owner review for voice/accuracy.
Still never wired: source_packs raw (IP), cities/astrocartography-as-recommendation, synastry, health.

## 5. Boundaries (non-negotiable)
- `source_packs/` NEVER injected (IP).
- Gated layers (colors, gemstones, Celtic/Ogham, name-automation) stay OFF — each needs its own approval +
  curated dict + re-validation.
- Blocked: cities/astrocartography/relocation (PLACE → soft archetype only), synastry (LOVE → self-only),
  health/Neijing, daily horoscope, all "lucky/healing/protection/guarantee/fate" claims.
- No data injected that is absent from the chart/packet (fallback chain).

## 6. Sequencing
Does not block PHASE 7 delivery E2E (this is the content/prompt layer). KNOWLEDGE-WIRE is the **content
phase before production enable** — prod enable should wait until KNOWLEDGE-WIRE Stage 1+2 is done OR the
owner explicitly defers it to a fast-follow.
