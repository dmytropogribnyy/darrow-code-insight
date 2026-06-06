# DARROW CODE — SOURCE POLICY

# Status: ACTIVE · B0-approved (2026-06-02)

# Governs: all Darrow Code knowledge base work

# Governed by: docs/SOURCE_OF_TRUTH_v4_1.md (controlling)

---

## 1 · PURPOSE

This policy governs how Darrow Code builds and maintains its internal knowledge
base. It applies to all symbolic interpretation rules, data layer docs, archetype
libraries, and any reference material used in report generation.

Building an original knowledge base is not only allowed — it is required. The
goal is not to copy interpretations. The goal is to build our own structured
rule base from general symbolic traditions, public facts, and original Darrow
Code language.

### 1.1 · MAXIMAL-ENRICHMENT MANDATE (owner-approved 2026-06-07)

Darrow Code should enrich every report **as much as safely possible**. Mine ALL
available material — the `source_packs/`, general symbolic traditions, and any
CC0/public-domain/licensed source — for their **concepts**, and author **original
Darrow Code rules** (`docs/knowledge/rules/`) that we then wire into generation.
Cover every layer that adds real value (Western astro, BaZi, numerology, archetypes,
Chinese zodiac, colors/stones as aesthetic anchors, names, soft place-archetypes, …).

This mandate does NOT relax two bedrock constraints — they protect us legally and
keep the brand honest, and richness is achieved *within* them, never by breaking them:
1. **Never copy or lightly paraphrase third-party wording / protected tables** (§2.3).
   `source_packs/` are mined for concepts only and are NEVER injected raw into prompts.
2. **Never make lucky / healing / protection / medical / financial / relationship /
   guaranteed-outcome / deterministic claims** for any layer (§2.3, §5). Secondary
   systems (colors/stones/etc.) may appear only as aesthetic/sensory/symbolic anchors.

---

## 2 · WHAT IS ALLOWED

### 2.1 Freely allowed — primary sources and original work

- **FreeAstroAPI calculated data** — planetary positions, aspects, BaZi Day
  Master, element balance, etc. (our contracted provider)
- **In-code numerology calculations** from user input
- **General symbolic traditions as conceptual background** — what planets
  mean, what elements represent, what numbers signify. Facts about astrology,
  numerology, and Chinese calendar systems are general knowledge.
- **CC0 / public-domain / properly licensed reference material** — allowed if
  license rules are followed and logged in SOURCE_LOG.md
- **Cross-source synthesis** — combining traditions with our own product lens
- **Original Darrow Code writing** — our own interpretive language, metaphors,
  framing, rules, and protocols

### 2.2 Allowed as research/background only (extract concepts, never wording)

- Published astrology books and traditions (sign meanings, planetary functions,
  aspect themes, house themes)
- Authoritative open sources on numerology, BaZi symbolism, archetypal
  psychology
- Astro.com / Astrodienst as benchmark for depth and accuracy — **never** as
  a content source; **never** scraped or copied
- Liz Greene / Howard Sasportas reports as depth/quality benchmark — **never**
  as a content source
- Professional astrology texts for conceptual background — never for
  direct extraction

If a source informs our thinking but we do not copy it, no log entry is needed.
If we use a specific table, dataset, or phrase as direct background, log it.

### 2.3 NOT allowed — hard prohibitions

- Copying or lightly paraphrasing **copyrighted text** (books, reports, websites)
- Copying **protected tables or databases** wholesale
- Adding **Astro.com / Astrodienst / Swiss Ephemeris PDFs** to the repo
- Adding **private-use-only materials** as project assets
- Using **ephemeris PDFs as repo data assets** — Swiss Ephemeris accuracy is
  available via FreeAstroAPI engine; no local copy is needed
- Presenting **secondary symbolic systems** (colors, stones, etc.) as
  scientific fact
- **Deterministic claims** based on symbolic systems
- **Lucky / healing / protection claims** for any symbolic material

---

## 3 · HOW TO BUILD DARROW CODE INTERPRETATION RULES

Every rule in the knowledge base must be:

1. **Original expression** — our own language, metaphors, and framing. Not a
   paraphrase of copyrighted text.
2. **Concept-based** — extract the conceptual meaning, not the wording
3. **Synthesis-driven** — combining traditions with the Darrow Code product lens
4. **Darrow Code voice** — passes the Dinner Table Test; warm and precise;
   human-readable by a non-astrologer

Each interpretation rule should state:
- the symbolic layer (sign / planet / element / number / etc.)
- the plain-language meaning
- the lived-experience pattern it maps to
- the Darrow Code framing (recognition-first, not technical)

---

## 4 · SOURCE LOG REQUIREMENT

When using any specific external reference beyond general background:
- Add an entry to SOURCE_LOG.md
- Record: date, source name, what was used for, license or access type

| If source is... | Action |
|---|---|
| CC0 or public domain | Log it, note the license |
| Requires attribution | Log it, apply attribution in the relevant file |
| Copyrighted, used as research background only | Brief log entry noting it informed thinking |
| Copyrighted text copied directly | **Not allowed** |

---

## 5 · SECONDARY SYMBOLIC SYSTEMS

Secondary systems (colors, stones, Celtic calendar, planetary allies, etc.)
may be used as:
- symbolic mirrors that support the client's recognized pattern
- psychological and practical anchors for a specific reading
- explanatory tools that deepen the reading without making scientific claims

They must NOT be presented as:
- scientifically validated
- lucky charms or protection devices
- healing claims
- deterministic predictions

Before any secondary symbolic system is implemented in production:
- A curated Darrow Code rules file must exist in `docs/knowledge/`
- The rules must be original Darrow Code interpretations
- The rules must not copy protected tables
- The content must not make lucky/healing/protection claims

---

## 6 · SCOPE STATUS

| Symbolic layer | Status | Notes |
|---|---|---|
| Western natal (planets, signs, aspects, houses) | ✅ Active | FreeAstroAPI provider |
| BaZi Four Pillars | ✅ Active | FreeAstroAPI provider |
| Numerology (LP, Expr, Soul Urge, PY) | ✅ Active | In-code calculation |
| Ascendant, MC, houses | ✅ Conditional | Requires birth_time_known=true |
| Supportive colors (CORE symbolic anchors) | ⚠️ Policy ready, dict pending | Curated dict required before production |
| Supportive stones (CORE symbolic anchors) | ⚠️ Policy ready, dict pending | Curated dict required before production |
| Symbolic allies / planetary allies | ⚠️ Policy ready, dict pending | Curated dict required before production |
| Archetype library | 🟡 Active authoring target | Author curated Darrow library, then wire |
| Chinese zodiac (BaZi animal) | 🟡 Active authoring target | Soft symbolic layer; no fortune-telling/compatibility |
| Names / etymology (soft) | 🟡 Active authoring target | Soft symbolic layer; no fate/destiny claims |
| Celtic / Druid tree calendar | 🟡 Optional authoring target | Curated Darrow rules; symbolic mirror only |
| Progressions, Solar Returns | 🔒 Future add-ons | YEAR/Continuum routing; no deterministic forecasts |
| Astrocartography / cities | 🔒 PLACE add-on only | MAP0 + birth_time; CORE/PLACE use soft archetype, never city recommendations |
| Synastry / compatibility | 🔒 Blocked | Requires partner data + separate phase |
| Health / Neijing / medical | 🔒 Blocked permanently | Never in scope |

**Under the §1.1 maximal-enrichment mandate**, every 🟡 / ⚠️ layer above is an **active
authoring target**: build its original curated Darrow rules dict, gate it by the forbidden-claims
contract, then wire + re-validate. Roadmap + per-module map: `docs/launch/KNOWLEDGE_WIRE_PLAN.md`.
🔒 layers stay off until their separate gate (partner data / MAP0 / never).

---

## 7 · CHANGE CONTROL

Updates to this policy require explicit session review.
No interpretation rule in `docs/knowledge/` may contradict this policy.
If a conflict arises between this policy and a specific knowledge file, this
policy wins.

---

🔒 STATUS: ACTIVE B0-approved source policy · supersedes any prior implicit policy
