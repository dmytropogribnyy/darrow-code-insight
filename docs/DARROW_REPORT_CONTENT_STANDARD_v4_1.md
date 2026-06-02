# DARROW — REPORT CONTENT STANDARD v4.1

# Scope: CORE Report: UNVEIL (Cosmic Core Code Method)

# Status: ACTIVE v4.1 STANDARD (quality layer)

# Governed by: DARROW_DOCS_AUDIT_AND_PLAN_v4_1.md (controlling document)

---

## 1 · STATUS / PURPOSE

This file is the active **CORE v4.1 report content standard**. It defines the
quality bar that every generated CORE report must meet — how the prose must
sound, what each section must do, and the pass/fail rules a section must clear
before it is acceptable.

It is a **content quality standard**, not a schema spec and not a runtime prompt.
It does not define JSON keys, schema validation, page-to-template mapping, API
behavior, or implementation code. Those live in separate implementation files
(`darrowcode_core_module_spec_v4_1.md`, `schema_template_patch_v4_1.md`, etc.),
which are created later in the migration order — not here.

If a generated section conflicts with this standard, the section is wrong and
must be regenerated, regardless of whether it validated against the schema.

---

## 2 · SOURCE HIERARCHY

Each approved document owns one layer. They do not overlap, and in a conflict the
roles below decide which file governs.

| Layer             | File                                           | Owns                                                                         |
| ----------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| Intent            | `DARROW_CORE_PRODUCT_CONCEPT_STANDARD_v4_1.md` | WHAT CORE is for the client; philosophy, scope, product boundaries           |
| Structure         | `DARROW_CORE_MASTER_PATTERN_v4_1.md`           | Section sequence, word targets, page structure, formatting logic             |
| Execution quality | `DARROW_CORE_SAMPLE_REPORT_v4_1.md`            | The approved GOLD REFERENCE — the tone, rhythm, and reader intimacy to match |
| Pass/fail quality | **This file**                                  | The quality rules a generated report must clear                              |
| Migration control | `DARROW_DOCS_AUDIT_AND_PLAN_v4_1.md`           | File status, conflict resolution, migration order                            |

Rule of thumb: the concept standard says _why_, the master pattern says _how it
is structured_, the gold sample shows _what good looks like_, and this file says
_whether a given output passes_.

---

## 3 · CORE v4.1 TARGET

- **Product (customer-facing):** CORE Report: UNVEIL
- **Method / brand layer:** Cosmic Core Code Method
- **Page target:** 26 pages
- **Word target:** 4,350–5,250 generated words
- **Generated CORE section keys:** 17 — `orientation`, `core_architecture`,
  `operating_mode`, `battery`, `social_interface`, `numerology_code`,
  `cognitive_style`, `drive_and_rhythm`, `professional_archetype`,
  `money_and_value`, `relationship_baseline`, `vitality_baseline`,
  `environment_and_resonance`, `shadow_and_friction`, `before_after`,
  `executive_summary`, `next_step`
- **Static / template-rendered pages** (separate, NOT generated keys):
  cover, orientation-system/framework page, library page, back cover
- **cover_tagline:** a VARIABLE cover sub-field, not a generated body section
  and not a static page
- **operating_mode:** part of the v4.1 standard, but its schema migration is
  NOT implemented until the render-fix diagnostic is approved. It appears in
  this standard and in the gold sample as part of the intended output; it is
  not added to the live pipeline yet.

---

## 4 · WHAT THE REPORT MUST FEEL LIKE

The single quality bar: the client closes the report thinking **"This explains me."**

Every report must be:

- **recognition first** — the client feels seen before they feel explained
- **human-readable** — readable and useful with no astrology knowledge
- **a private reading** — made for one person, not distributed to a list
- **calm premium authority** — precise and self-assured, never anxious or salesy
- **self-trust over instruction** — it returns the client to their own signal
- **clarity over control** — it makes life legible, it does not direct it
- **orientation over prediction** — it describes how the person works, not what
  will happen

If a section reads as impressive astrology _about_ the client rather than a
description the client recognizes as _themselves_, it fails — rewrite it.

---

## 5 · WHAT THE REPORT MUST NOT FEEL LIKE

Banned registers and content. A section that drifts into any of these fails:

- a technical astrology report
- a chart dump (placements listed as the content)
- a generic horoscope ("Cancers tend to…")
- motivational or self-help content
- fear, mystique, or doom
- outcome promises of any kind
- financial promises (wealth, income guarantees)
- medical claims (diagnosis, cure, healing)
- lucky / healing / protection / attraction claims
- a system manual written for a machine
- a teaser that makes CORE feel incomplete without other products

---

## 6 · HUMAN READABILITY STANDARD

**The Dinner Table Test (mandatory for every sentence):**

> If a sentence cannot be said to an intelligent adult friend in a calm, relaxed
> conversation — it does not belong in the report.

The client must be able to read and benefit from the entire report **without
knowing or caring about astrology, BaZi, or numerology.** Technical proof
supports recognition; it never carries the section and never becomes the subject
of the reading. The data confirms what the client already recognizes about
themselves — it is not the point of the paragraph.

---

## 7 · LANGUAGE RULES

Reduce mechanical, machine-like phrasing. The report should read as a private
reading for a person, not as one system describing another.

**Avoid overuse of:**

- "your system"
- "your factory settings"
- "your settings"
- "your configuration"
- "the mechanism"
- "operating architecture"
- "technical architecture"

**Preferred human-facing language:**

- how you are built
- your way of reading pressure
- your way of deciding
- your inner reference
- your rhythm
- your pattern
- your signal
- your architecture (sparingly)
- how life moves through you
- what steadies you
- what drains you
- what restores you
- what becomes clear when you stop fighting yourself

"system" is allowed only **rarely**, when it genuinely sounds natural — never as
a repeated default framing. If "your system" appears more than once or twice in
a section, rewrite.

---

## 8 · SECTION RHYTHM

Every generated section should generally move in this order:

1. **Short declarative opening line** — names the pattern, max ~12 words
2. **Lived scenario / recognizable moment** — a real scene, present tense
3. **Human pattern** — what the client actually experiences
4. **Plain-language explanation** — how it works, in ordinary words
5. **Technical placement / data confirmation** — only _after_ the human pattern
   is already clear, as confirmation
6. **Protocol or warning signal** — where appropriate for the section
7. **Proof tags** — quiet, at the very end

The order is the point: human first, data second. A section that reverses this
(data first, human second) fails the standard even if every fact is correct.

---

## 9 · SCENARIO-FIRST RULE

A section must **never open** with placements, aspects, numbers, houses, signs,
or BaZi terms. It opens with lived experience — a moment the client recognizes.

Technical data appears only after the human pattern is already understandable on
its own. The reader should be nodding in recognition before they encounter a
single astrological term.

✅ "You are in a meeting. The numbers add up… but you already feel it."
❌ "With Sun conjunct Moon in Cancer in the 1st house, you tend to…"

---

## 10 · PROOF TAG RULES

- **Maximum 5 proof tags per section.**
- Proof tags are **quiet support**, placed at the very end of the section. They
  must never be the main content or dominate the reading.
- Every tag must reference **real, available data** from the received chart.
- **No invented or estimated placements.** If it is not in the data, it is not
  a tag.
- **No proof tags for unavailable data.**
- If `birth_time_known=false`: do **not** use houses, angles, Ascendant, MC, IC,
  Descendant, or astrocartography line claims — in tags or in body.
- If a statement cannot be anchored to a real data point, do not make the
  statement.

---

## 11 · PROTOCOL RULES

Protocols must be:

- **behavioral** — a specific observable action, not a mindset
- **specific** — concrete to how this person functions
- **supportive, not commanding** — "this is how you work best," not "do this or fail"
- **2–4 sentences**
- grounded in the client's actual pattern, never generic

**Banned protocol content:**

- "just relax" / "be more present" / vague self-care
- "trust the universe" / "manifest" / "heal your energy"
- medical, financial, or legal advice
- any directive phrased as a command ("you must," "you need to")

Descriptive need-language is allowed when it names a real structural requirement,
e.g. "you need quiet to recover." What is banned is pressure-command phrasing
such as "you need to fix this" or "you must do this."

A protocol describes how the client's own design works best. It hands them a
tool, not an order.

---

## 12 · WARNING SIGNAL RULES

Warning signals must be:

- **observable** — something the client can notice in their own behavior
- **non-judgmental** — never shaming or pathologizing
- **practical** — useful as an early-recognition cue
- written as the **early sign**, before the problem fully lands

A warning signal points at a behavior the client can catch ("becoming polite with
someone you used to be warm with"), not at a character flaw. It never frames the
client as broken, disordered, or at fault.

---

## 13 · BEFORE / AFTER RULES

Before / After framing is allowed and encouraged. It must describe a **shift in
perception, never a guaranteed outcome.** The reality does not change between
Before and After — only the legibility does.

✅ Good:

> Before: pressure remains confusing.
> After: pressure becomes readable.

❌ Bad (outcome promise):

> Before: you struggle.
> After: you succeed.

The pressure, the responsibility, the complexity all remain. What changes is that
they become legible — and a life you can read is easier to carry than one you
cannot.

---

## 14 · GROUNDED PRAISE

Praise is allowed **only when grounded** in observed structure or lived strength.

**Allowed** (points at something real):

- structural resilience
- capacity to carry responsibility
- ability to function under pressure
- maturity already demonstrated
- lived strength

**Not allowed** (points at fantasy):

- "you are amazing"
- "unlimited potential"
- "destined for greatness"
- "everything will be fine"

Grounded praise names something the client has actually done or actually is.
Ungrounded praise inflates a fantasy of who they might become. Only the first
belongs in CORE.

---

## 15 · PRODUCT COMPLETENESS RULE

CORE must feel **complete on its own.** A client who buys only the CORE Report
must close it feeling they received a whole, satisfying product — never a teaser
or a sample that requires another purchase to "finish."

Focused chapters may be mentioned only as **optional deeper lenses**, never as
requirements, and never in a way that implies CORE is incomplete without them.

Approved structure (matches current storefront):

- **CORE Report** = the complete foundation
- **CORE Complete** = CORE Report + all six focused chapters in one reading
- **LOVE / MONEY / BODY / YEAR / STYLE / PLACE** = optional focused chapters

The Full Destiny Codex is **not** part of the current CORE ecosystem. If
referenced at all, it is framed as a separate / future strategic product, never
as something needed to complete CORE.

**No direct cross-sell in body sections.** Do not insert direct module cross-sells
inside the body of generated reading sections. Focused chapters may be mentioned
only on the Library page or, if relevant, in the optional Next Level / next-step
logic. No pricing, urgency, FOMO, or "you need this module" language anywhere.

---

## 16 · NAMING CONSISTENCY

- **Customer-facing product name:** CORE Report: UNVEIL
- **Method / brand layer:** Cosmic Core Code Method

Use this naming consistently across: cover, email, result page, ecosystem/library
page, download page, and all implementation docs.

Do not make "COSMIC CORE CODE: UNVEIL" the sole main title when checkout sells
"CORE Report." The customer must recognize, on the cover, the product they bought.
Cosmic Core Code is the method/brand layer beneath the product name, not the
headline product name itself.

---

## 17 · MODULE SAFETY RULES

These apply wherever a CORE section touches a focused-area theme, and they bind
the focused chapters when those are written later:

- **MONEY / money_and_value:** value, work, income mechanics, resource pressure.
  No wealth promises. No financial advice.
- **BODY / vitality_baseline:** stress signature, rhythm, recovery orientation.
  No medical claims, no diagnosis, no healing claims. Carry the disclaimer.
- **YEAR:** orientation, timing climate, pressure themes only. No deterministic
  prediction of events.
- **STYLE:** aesthetic signature, colors, materials for the focused chapter's
  full visual/aesthetic scope. No lucky / healing / protection claims about
  any color or material.
- **PLACE / environment_and_resonance:** environmental resonance only in CORE.
  Specific cities belong only to the PLACE focused chapter, with real
  astrocartography/relocation data (see §18).
- **LOVE / relationship_baseline:** relationship and intimacy patterns. No
  guaranteed attraction or compatibility promises.

### 17A · CORE SYMBOLIC ANCHOR LAYER (B0 addition)

CORE may include **brief symbolic anchors** — supportive colors, stones, and
symbolic allies — **when supported by a curated Darrow Code rules dict** in
`docs/knowledge/COLORS_STONES_SYMBOLIC_ALLIES_v1.md`.

This is distinct from the STYLE focused chapter's deeper visual identity work.

CORE symbolic anchors must:
- Be brief (1–2 anchors per type, not an extended palette)
- Be explained as psychological or structural mirrors
- Be derived from the client's natal, BaZi, or numerology profile
- Pass the no-claims rule: no lucky, healing, protection, or attraction claims
- Be governed by the curated dict before appearing in production output

Allowed framing in CORE:
- "Supportive color: deep blue — as a symbolic anchor for emotional coherence
  and quiet authority"
- "A stone that mirrors the same steady, grounded quality: [name] — for its
  association with depth and clarity, not for any protective claim"

Not allowed anywhere (CORE or STYLE):
- "Brings luck"
- "Heals"
- "Protects from"
- "Attracts"
- "Manifests"

The curated dict in `docs/knowledge/` must exist and be approved before
any color/stone/ally is generated in production. Without the dict, omit
this layer silently — do not substitute generic lists.

---

## 18 · PLACE DATA RULE

**CORE / UNVEIL:**

- Do not name specific cities or "best places."
- Do not make relocation or astrocartography-line claims.
- Use environmental resonance / qualities only (climate, landscape, density,
  quiet, proximity to water, privacy).

**PLACE focused chapter** may later use FreeAstroAPI astrocartography endpoints:

- /api/v1/western/astrocartography/recommendations
- /api/v1/western/astrocartography/city-check
- /api/v1/western/astrocartography/relocation
- /api/v1/western/astrocartography/lines
- /api/v1/western/astrocartography/parans

Specific city recommendations require ALL of:

- PLACE purchased
- birth_time_known = true
- resolved coordinates / timezone
- real astrocartography / relocation data returned

If `birth_time_known=false`: do not generate city rankings, best places,
relocation claims, or astrocartography line claims. Use environmental qualities
only.

Astro.com and Astro-Seek are manual sanity-check tools only — never production
APIs and never scraping targets.

---

## 19 · DATA AVAILABILITY RULES

Use only data that is actually present. Never fabricate to fill a section.

- If **BaZi** is unavailable → do not mention BaZi, Day Master, elements, or
  branches anywhere.
- If **Solar Return** is unavailable → do not mention Solar Return.
- If **transits** are unavailable → the timing/current-cycle language must rely
  only on available layers (e.g. Personal Year), and must not invent transits.
- If **full_name_for_numerology** is absent → do not make Expression, Soul Urge,
  or Personality number claims; use Life Path + Personal Year only, and note that
  Expression, Soul Urge, and Personality numbers can only be calculated when the
  full name is provided.
- If **birth_time_known=false** → do not make strong house, angle, Ascendant,
  MC, IC, or Descendant claims; prioritize planets by sign, aspects, element
  balance, numerology, and (if available) BaZi.

A thinner data set produces a shorter, honest report — never a padded one built
on invented placements.

---

## 20 · CLIENT READABILITY / FORMATTING STANDARD

Stable visual hierarchy per section:

- section title
- short opening line (the hook)
- scenario paragraph (visually distinct — italic or set apart)
- normal prose (short paragraphs, breathing room)
- key insight (sparse bold — one line per section maximum)
- protocol callout (lifted from the prose)
- warning signal callout (muted, quieter than the protocol)
- proof tags (small, muted, at the very end)
- bullets only where they genuinely improve readability (protocols, executive
  summary, library page, short lists)

**Formatting warning:** do not rely on raw AI-generated markdown to produce this
hierarchy. Final formatting must be **template-driven through structured fields**.
The AI emits content; the template controls the visual look. This keeps every
client's report visually consistent and prevents layout drift. (The structured-
field mechanics live in the schema/template implementation file, created later —
not here.)

---

## 20A · READING EXPERIENCE REQUIREMENTS (B0 addition)

CORE and future add-on reports must be:

- **Rich** — multiple data layers woven into a coherent reading, not a thin profile
- **Readable** — human-readable by a non-astrologer without explanation
- **Emotionally recognizable** — the client thinks "yes, that is exactly it"
- **Varied** — different section rhythms, metaphors, and structural approaches
- **Premium** — depth, precision, and care visible on every page
- **Astrologically informed** — real data confirms the human read
- **Psychologically insightful** — names the lived experience with accuracy
- **Less technical** — technical terminology as quiet confirmation, never as the main content
- **Recognizably Darrow Code** — not generic astrology, not a classic report clone

### What to avoid (reading experience failure modes)

- Generic horoscope language ("Cancers tend to feel deeply...")
- Dry astro dumps (listing placements as content)
- Long uninterrupted walls of text
- Random esoteric lists without explanation (bare labels: "Color: blue")
- Copying tone or phrasing from classic Liz Greene-style reports
- Shallow motivational writing ("you have unlimited potential")
- Repetitive section formulas (every section starting and ending the same way)
- Excessive "system architecture" abstraction ("your mechanism," "your factory settings")
- Fear-based or shame-based framing of any pattern

### Section variety requirement

Each section should use the full available rhythm — not just prose with a
protocol bolted on. Where the section spec allows it, include:
- A recognition-first opening scene
- A clear pattern name or typology
- What this looks like in real life
- Key strength
- Hidden risk or shadow
- Practical direction
- Protocol (behavioral, specific)
- Warning signal (observable, non-judgmental)
- Proof tags (quiet, at the end)

Variety means: not every section uses all of these, and no two sections should
feel like they used the same formula. The gold sample shows the range.

---

## 21 · PASS / FAIL CHECKLIST

Review every generated section against all of these. Any "no" = fail = regenerate.

- [ ] Does it start with human recognition (scenario / lived moment), not data?
- [ ] Can a non-astrologer fully understand it?
- [ ] Is technical data secondary — confirmation, not the subject?
- [ ] Are proof tags real, available, and ≤ 5?
- [ ] Is the protocol behavioral, specific, and supportive (not commanding)?
- [ ] Is the tone premium, calm, and private?
- [ ] Is it free of any promise, diagnosis, prediction, or pressure?
- [ ] Does it avoid mechanical "your system" language?
- [ ] Does it feel like the approved gold sample in tone and rhythm?
- [ ] (Where relevant) does it respect the module safety + data availability rules?

---

## 22 · GOLD SAMPLE REFERENCE

`DARROW_CORE_SAMPLE_REPORT_v4_1.md` is the **approved gold reference** for
execution quality. Generated reports should match its tone, rhythm, reader
intimacy, and safety level.

Do **not** copy it verbatim. The sample client (Dmitry) and that chart's specific
placements, scenarios, archetype names, and metaphors belong to that chart only.
Match the _quality and voice_ of the gold sample; generate the _content_ fresh
from each client's real data.

---

🔒 STATUS: ACTIVE v4.1 STANDARD · quality layer · governs generated CORE prose

---

## CHANGE LOG

| Version                 | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (predecessor)           | `DARROW_REPORT_CONTENT_STANDARD.md` (v3) — quality bar with v3 targets (CORE 18–20 pages / 3,000–3,600 words / 17 sections), still contained the older "system" framing.                                                                                                                                                                                                                                                                                                                                                                                                            |
| v4.1                    | New quality standard aligned to the approved v4.1 set. Updated targets to 26 pages / 4,350–5,250 words / 17 generated keys + static pages. Added source hierarchy, scenario-first rule, language rules reducing mechanical phrasing, grounded-praise rule, product-completeness rule, naming consistency (CORE Report: UNVEIL + Cosmic Core Code Method), module safety rules, PLACE data rule, data availability rules, formatting standard, pass/fail checklist, and gold-sample reference. Quality layer only — no schema, page mapping, runtime prompt, or implementation code. |
| v4.1 (approval cleanup) | **Current.** Replaced "unlock" wording in data availability (§19), clarified command-tone vs descriptive need-language (§11), and added no-direct-cross-sell rule for body sections (§15). No schema, runtime, implementation, or Loveable prompt content added.                                                                                                                                                                                                                                                                                                                    |
