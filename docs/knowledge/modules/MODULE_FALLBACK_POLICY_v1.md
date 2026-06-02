# DARROW CODE — Module Fallback Policy v1

**Status:** docs-only planning / data sufficiency matrix
**Runtime status:** not active
**Not prompt/schema/template/provider/runtime authority**
**Requires later MAP0/MAP1/runtime approval before use**

Phase: MOD-SUFF0
Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md` · `BIRTH_TIME_RELIABILITY_POLICY_v1.md`

---

## 1. Purpose

This policy defines the fallback behavior for every Darrow report module when required data is missing, optional data is absent, or a gated layer has not been unlocked.

The core principle: **degrade gracefully, never hallucinate**.

```text
If data is missing → skip that signal or section
If a layer is gated → suppress output entirely; never generate it
If a provider field is absent → skip; do not invent
If output would require missing data → reduce confidence; mark partial
Never invent birth time, house positions, partner data, or target locations
Never generate blocked content to fill a gap
```

---

## 2. Fallback by missing input

### 2.1 Birth time missing

| Lost capability | Fallback |
|---|---|
| Houses 1–12 | Omit all house-specific claims |
| Ascendant / Rising sign | Omit rising sign reference entirely |
| MC / IC / Descendant | Omit all angle references |
| House rulers | Omit |
| Planet-in-house claims | Omit |
| House stellium | Omit |
| Angular emphasis | Omit |
| Solar Return angles | Omit |
| Relocated chart (PLACE) | Block entirely |
| Astrocartography lines (PLACE) | Block entirely |

**Output quality:** reduces from high to medium for most modules; PLACE reduces to blocked (astrocartography).

**Transparency note:** The report should not explain what is missing in technical terms but should simply not include house/angle content. If PLACE is reduced to archetype-only, the CORE environmental note should be framed naturally without flagging the absence.

---

### 2.2 Full name missing

| Lost capability | Fallback |
|---|---|
| Expression / Destiny number | Omit |
| Soul Urge / Heart's Desire number | Omit |
| Name numerology layer | Omit |
| Name symbolism / etymology | Omit |

**Retained:** Life Path (from birth date), Birthday number, Personal Year — none of these require the full name.

---

### 2.3 Birth city missing (when birth time is provided)

```text
If birth city is absent and birth time is present:
  - House calculation is not possible without location
  - Fall back to "birth time available but location unknown" → treat as birth time unknown for house purposes
  - Omit houses / Ascendant / angles
```

---

### 2.4 Target location missing (PLACE module)

```text
If no target location is provided:
  - Full PLACE add-on content is blocked
  - CORE may include a soft environmental archetype note only
  - See CORE_PLACE_ARCHETYPE_POLICY_v1.md for allowed CORE place content
  - No city names, no lines, no comparison
```

---

### 2.5 Partner data missing (LOVE module — synastry)

```text
If partner birth data is not provided:
  - Generate personal relational pattern only
  - Do not attempt synastry or compatibility analysis
  - Do not infer partner type, best match, or relationship compatibility
  - Output: "This reading focuses on your own relational architecture — how you tend to attach, attract, and navigate partnership."
```

---

### 2.6 Provider payload missing (BaZi / transits / solar return)

| Missing payload | Fallback |
|---|---|
| BaZi Day Master / pillars absent | Skip BaZi section entirely; do not mention it |
| Transit data absent | Skip transit section; use Personal Year as primary YEAR signal |
| Solar Return absent | Skip solar return; use Personal Year + light transit note if available |
| BaZi annual flow absent | Skip; fallback to Personal Year |
| Moon phase absent | Skip lunar texture; omit from BODY/YEAR |
| FreeAstroAPI astrogeo payload absent | Block all astrocartography/relocation content |

---

### 2.7 Gated layer not approved

```text
If a gated layer (colors / stones / Celtic trees / name etymology / Chinese zodiac compat) is not unlocked:
  - Suppress the content entirely — do not generate placeholder, alternative, or teaser
  - Do not explain that the layer exists but is gated
  - Simply omit; the report quality is not reduced by absence of gated layers
```

---

## 3. Fallback confidence marking (internal)

These are internal confidence flags for the generation layer — not customer-facing labels.

| Confidence | Condition | Behavior |
|---|---|---|
| high | All required + most optional data present | Full output for this module |
| medium | Required data present; key optional missing (e.g. no birth time) | Reduced output; house layer omitted |
| low | Minimal data; many signals missing | Minimal viable output only; clearly delimited |
| blocked | Required data missing OR layer is gated/blocked | Do not generate this section/module |

---

## 4. When to block a module entirely

A module should be blocked (not generated at all) when:

```text
PLACE add-on:
  - birth time is unknown
  - no target location provided
  - MAP0 has not been completed

LOVE synastry:
  - partner data not provided (generate personal pattern instead; do not block LOVE entirely)

YEAR:
  - current year not available (this should always be available)
  - if all of PY / transit / solar return data is absent: generate a very brief cycle context note only

STYLE colors/stones:
  - gated dict not approved → omit color/stone section but retain Venus/Moon/element aesthetic archetype
```

No module should be entirely blocked due to missing birth time alone (except PLACE astrocartography). All modules have a minimum viable version that does not require birth time.

---

## 5. How to mark a module as partial

In internal diagnostics (not customer-facing):

```text
module_status: "full" | "partial_no_birth_time" | "partial_no_name" | "partial_no_target" | "minimum_viable" | "blocked"
confidence: "high" | "medium" | "low" | "blocked"
missing_inputs: string[]  // list of what was absent
gated_layers_suppressed: string[]  // list of suppressed gated signals
```

In customer-facing output: no explicit confidence labels. The output simply reflects what is available without explaining what is missing.

---

## 6. What must never be generated to fill a gap

```text
Invented birth time
Invented rising sign or house positions
Invented partner birth data
Invented target city coordinates
Invented BaZi Day Master when provider payload is absent
Invented transit positions
Lucky/healing/protection content as a filler when real signals are missing
Compatibility claims when partner data is absent
Medical/health advice as a filler for the BODY section
Event predictions as a filler for the YEAR section
City recommendations as a filler for the PLACE section
```

---

## 7. Fallback chain summary

```text
Missing birth time
  → houses / Asc / MC / IC / DSC dropped
  → continue with planets / aspects / elements / numerology
  → output: medium confidence

Missing full name
  → Expression / Soul Urge dropped
  → continue with LP / Birthday / PY
  → output: medium-high confidence

Missing birth city (when birth time exists)
  → treat as "birth time not usable for houses"
  → houses dropped
  → output: medium confidence

Missing BaZi payload
  → BaZi section omitted
  → no reduction in other sections
  → output: high confidence for non-BaZi signals

Missing transit payload (YEAR)
  → transit section omitted
  → Personal Year becomes primary cycle signal
  → output: medium confidence

Missing target location (PLACE)
  → PLACE add-on blocked entirely
  → CORE soft environmental archetype allowed
  → output: blocked at PLACE level / soft at CORE level

Missing partner data (LOVE synastry)
  → personal relational pattern generated
  → synastry section blocked
  → output: medium confidence (personal pattern only)

Gated layer not unlocked
  → layer suppressed entirely
  → no impact on other sections
  → output: unchanged for non-gated content
```

🔒 docs-only planning · not active in runtime · MOD-SUFF0 · requires MAP0/MAP1/runtime approval
