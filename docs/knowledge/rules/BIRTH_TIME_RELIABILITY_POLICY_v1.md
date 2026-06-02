# DARROW CODE — Birth Time Reliability Policy v1

**Status:** curated Darrow rule doc / docs-only
**Runtime status:** not active
**Not prompt authority**
**Not schema authority**
**Not PDF/template authority**
**Not provider implementation authority**
**Not report generation authority**
**Derived from source packs in original Darrow Code language**
**Requires separate explicit approval before runtime integration**

Source packs used: `DARROW_ASTRO_HOUSES_SOURCE_ADDENDUM_v0_1.md` · `DARROW_CODE_KNOWLEDGE_BASE_SOURCE_PACK_v0_2.md`
Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md` · `ASTRO_HOUSE_RULES_v1.md`

---

## 1. Purpose

This policy defines how Darrow Code determines which astrological layers are available based on the reliability of the user's reported birth time.

Houses, Ascendant, and angles are calculated from the exact moment of birth at a specific geographic location. Without that information, those layers cannot be used. This policy governs the fallback behavior.

---

## 2. Reliability levels

### 2.1 Exact

```
value:       "exact"
definition:  User provided a specific birth time, ideally from a documented source (birth certificate,
             hospital record, family record with time noted). No indication that the time was estimated.
```

What is allowed with `exact`:

```text
All standard chart layers:
  ✅ Houses 1–12
  ✅ Ascendant (Rising sign)
  ✅ Midheaven / MC
  ✅ IC (Imum Coeli)
  ✅ Descendant
  ✅ House rulers
  ✅ Planets-in-houses
  ✅ House stellium claims
  ✅ Angular / succedent / cadent emphasis
  ✅ Cusp placements (with caution — see below)
```

Cusp caution even with exact time:

```text
If a planet is within 1–2° of a house cusp, do not make strong claims about which house it is in
without noting the house-system dependence. Different house systems may place it differently.
```

---

### 2.2 Approximate

```
value:       "approximate"
definition:  User provided an estimated birth time or a rounded time ("around noon," "early morning,"
             "I think about 3pm"). The time may be off by an hour or more.
```

What is allowed with `approximate`:

```text
Broad patterns only — avoid cusp-sensitive claims:
  ✅ Rough hemisphere emphasis (eastern/western, northern/southern) if the estimate is reliable enough
  ✅ Angular house planets only if the planet is clearly within the house regardless of reasonable time variance
  ✅ Ascendant sign — only if the estimate is confident enough that sign change in ±1 hour is unlikely
  ⚠️  Houses — use with caution; prefer broad angular/cadent/succedent groupings over specific house numbers
  ❌  Exact degree of Ascendant / MC
  ❌  Cusp-sensitive planetary house claims
  ❌  Strong claims about planets near house cusps
```

Fallback language for approximate:

```text
"With the birth time available, the chart suggests an emphasis in [broad area] — though the exact
house placement of some planets may shift depending on the precise birth moment."
```

---

### 2.3 Unknown

```
value:       "unknown"
definition:  User did not provide a birth time, stated they do not know it, or the birth time is
             explicitly marked as unavailable.
```

What is NOT allowed with `unknown`:

```text
❌  Houses 1–12 (any of them)
❌  Ascendant / Rising sign
❌  Midheaven / MC
❌  IC (Imum Coeli)
❌  Descendant
❌  House rulers
❌  Planets-in-houses
❌  House stellium claims
❌  Angular / succedent / cadent emphasis
❌  "You are a [Rising sign] rising" claims
❌  Any claim that depends on knowing where the chart begins
```

What IS still available with `unknown`:

```text
✅  Sun sign / Moon sign / Mercury / Venus / Mars / all planet signs
✅  Planetary aspects (between planets — angles not required)
✅  Element and modality balance from planetary signs
✅  Numerology layers (Life Path, Expression, Soul Urge, Birthday, PY)
✅  BaZi Day Master and relevant pillars (if provider payload exists)
✅  Chinese zodiac animal (conditional layer)
✅  All sign-based interpretation
✅  Convergence across sign-level and numerological layers
```

---

## 3. No hallucination rule

```text
Darrow Code must never:
  - pretend to know the Ascendant when birth time is unknown
  - infer the rising sign from personality descriptions
  - estimate house placements from behavioral patterns
  - use "noon chart" or "sunrise chart" defaults without flagging the limitation clearly
  - proceed with house interpretation as if the birth time were known when it is not

If birth time is missing, houses are missing. The report must be designed to work without them.
```

---

## 4. Transparency rule

When birth time is unavailable or approximate, the report or diagnostic should note the limitation.

```text
Suggested internal flag (not necessarily customer-facing):
  birth_time_confidence: "unknown" | "approximate" | "exact"

Suggested customer-facing note (when relevant):
  "Without a confirmed birth time, this reading is based on planetary signs, aspects,
  numerology, and BaZi — which provide a full and rich layer of interpretation without
  requiring house placement."
```

The limitation is not an apology. It is a framing that maintains accuracy.

---

## 5. Birth location (birthplace)

Birthplace is required for house calculation alongside birth time.

```text
If birth city and birth time are both available → houses may be calculated.
If birth time is available but birth city is not → houses cannot be reliably calculated.
```

For most users who know their birth time, birthplace is also known. But this dependency should be explicit in the intake form and in the provider call.

---

## 6. High-latitude considerations

At high geographic latitudes (above approximately 60° north or south), certain house systems (particularly Placidus) can produce extreme house cusp distortions.

```text
If user birthplace is at high latitude:
  - Note the potential for house-system distortion
  - Prefer Whole Sign or Equal House if available from provider
  - Avoid high-stakes claims based on house cusps
  - Store birthplace latitude when available for this check
```

---

## 7. Provider field reference (future MAP1)

The following field should be received from or passed to the provider. Exact implementation belongs to MAP1 / future provider integration phase.

```ts
// conceptual — not runtime yet
type BirthTimeReliability = "exact" | "approximate" | "unknown";

interface ChartDataContext {
  birth_time_confidence: BirthTimeReliability;
  birthplace_confidence: "exact" | "approximate" | "unknown";
  house_system: "placidus" | "whole_sign" | "equal" | "koch" | "campanus" | "regiomontanus" | "provider_default" | "unknown";
  houses_usable_for_core: boolean; // derived from birth_time_confidence
}
```

---

## 8. Decision table

| birth_time_confidence | Houses allowed | Ascendant allowed | MC/IC/DC allowed | House rulers allowed |
|---|---|---|---|---|
| exact | ✅ yes (with cusp caution) | ✅ yes | ✅ yes | ✅ yes |
| approximate | ⚠️ broad only | ⚠️ if sign clearly stable | ⚠️ if clearly not on cusp | ⚠️ if house clearly stable |
| unknown | ❌ no | ❌ no | ❌ no | ❌ no |

---

## 9. Forbidden behaviors (all reliability levels)

```text
Inferring birth time from personality or behavior
Claiming Ascendant when birth time is unknown
Using houses when birth_time_confidence = "unknown"
Using "noon chart" as a silent default without flagging it
Making house-specific claims near cusps without noting house-system dependence
Providing cusp percentages or degree-precision claims about houses to clients as if they were certain
Telling the client what their Ascendant is based on appearance
```

🔒 curated Darrow rule doc · docs-only · not active in runtime · KB2-A approved · requires explicit later approval for runtime integration
