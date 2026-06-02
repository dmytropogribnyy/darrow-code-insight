# DARROW CODE — CORE Place Archetype Policy v1

**Status:** curated Darrow rule doc / docs-only
**Runtime status:** not active
**Not prompt authority**
**Not schema authority**
**Not PDF/template authority**
**Not provider implementation authority**
**Not report generation authority**
**Derived from source packs in original Darrow Code language**
**Requires separate explicit approval before runtime integration**

Source packs used: `DARROW_ASTROGEO_PLACE_SOURCE_ADDENDUM_v0_1.md`
Guard references: `ASTROGEO_PLACE_RULES_v1.md` · `PLACE_ADDON_BOUNDARY_POLICY_v1.md` · `PLACE_USE_CASE_ARCHETYPES_v1.md`
Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md`

---

## 1. Purpose

This policy defines when and how CORE may include a small, concrete place reference without becoming the PLACE add-on and without giving relocation advice.

CORE may include a short environmental resonance note — but only under conditions defined here.

---

## 2. When CORE may include a place note

CORE may include an environmental resonance note only when:

```text
a) The chart has multiple signals converging on a place-sensitive pattern
   (e.g. strong IC, 4th house emphasis, Moon dominant, environmental resonance
   across BaZi element + natal pattern + numerology)

   AND

b) The place note adds genuine interpretive value beyond what the chart section
   already covers without it

   AND

c) The wording passes the framing rules in §4 and the forbidden rules in §5
```

If only one condition is met, or if the place note would be generic filler, skip it.

---

## 3. CORE place content limits

```text
Allowed:
  ✅ Broad environmental archetype (1–3 examples max)
  ✅ Non-ranked, non-personalized illustrative examples
  ✅ Framed as symbolic resonance, not recommendation
  ✅ A single sentence or short paragraph — not a section

Blocked:
  ❌ Maps
  ❌ Astrocartography lines
  ❌ Relocated chart interpretation
  ❌ City ranking or scoring
  ❌ "Best city" or "top cities" language
  ❌ Target-location-based calculations
  ❌ Goal-based place matching (belongs to PLACE add-on)
  ❌ Practical reality check section (belongs to PLACE add-on)
  ❌ More than 3 illustrative examples
```

---

## 4. Allowed CORE place wording

These are reference patterns. They show the register and constraint of CORE place language.

### 4.1 Environmental archetype framing

```text
"This pattern may respond well to environments that carry a quality of [archetype] —
 not as a prescription, but as a symbolic resonance."

"The kind of environment this chart tends to find grounding in is [archetype]:
 structured, historically rooted, not overly stimulating."

"For recovery, the archetype this chart points toward is closer to coastal retreat
 or thermal spa region than to a dense urban hub — this is an environmental tendency,
 not an instruction."
```

### 4.2 Illustrative city / region examples

```text
"For public role and ambition, the archetype resembles cities like London, Frankfurt,
 or Singapore — not as a command to move, but as a symbolic reference for the kind
 of structured, high-visibility field this pattern understands."

"For creative output, this chart tends to respond to environments like coastal
 Mediterranean cities or culturally rich mid-size European capitals — as an
 archetype of beauty and stimulation, not as a ranked destination."

"For rest and recovery, places like Madeira, Lake Bled, or similar coastal or
 mountain spa environments represent the archetype — quieter, slower, more
 embodied than the career-oriented environments."
```

### 4.3 Environmental metaphor framing

```text
"Think of places like coastal towns, mountain retreats, or structured business
 capitals — not as prescriptions, but as environmental metaphors for the kind
 of field this pattern understands."

"The IC pattern here tends to feel more anchored near water or in smaller,
 historically rooted communities — this is a tendency read from the chart,
 not a direction to move."
```

---

## 5. Forbidden CORE place wording

```text
"Move to X."
"Your best city is X."
"Avoid X."
"This city will make you rich / heal you / bring love / change your life."
"You must live near water / mountains / in Europe / in Asia."
"This country is bad / good for your destiny."
"X is your destined place."
"You will thrive in X."
"Your chart says you belong in X."
"The best place for your Sun sign is X."
"You should leave your current city."
"Based on your chart, consider relocating to X."
Any wording implying a personalized recommendation without user-provided goals and MAP-PLACE processing
```

---

## 6. CORE place example types — definitions

These terms are used in any CORE place output. They must not be confused with each other.

| Type | Definition | CORE allowed |
|---|---|---|
| Environmental archetype | symbolic description of an environment quality that resonates with a chart pattern (e.g. "structured financial capitals") | ✅ yes |
| Illustrative city/region | a named city/region used as a concrete example of an archetype | ✅ yes — max 3, clearly non-prescriptive |
| Non-personalized example | a city used to represent an archetype for any chart with this pattern, not selected for this specific user | ✅ yes — must be framed as archetype |
| No-ranking sample | illustrative examples provided without implicit or explicit ranking | ✅ yes — "places like X, Y" not "X is better than Y" |
| Place metaphor | a geographic quality used symbolically (e.g. "the kind of environment where the tide sets the rhythm") | ✅ yes — if used sparingly |
| Personalized place recommendation | a specific city selected after analysis of this user's chart, goals, and target inputs | ❌ PLACE add-on only |

---

## 7. Suggested CORE place note structure

When a CORE place note is warranted, it should follow this structure:

```text
1. One sentence naming the environmental quality the chart responds to
   (no city yet; establish the archetype)

2. One sentence or short phrase with 1–3 illustrative examples
   (named cities/regions as archetype reference, clearly framed as "places like…")

3. Optional: one sentence noting what PLACE add-on provides for those who want more
   ("For a full place analysis — city comparison, relocated chart, and goal-based matching —
    the PLACE add-on provides that depth.")
```

Maximum length for CORE place note: 3–5 sentences. If more is needed, it belongs in PLACE.

---

## 8. Quality check before including a CORE place note

Before including any place note in a CORE output, check:

```text
□ Does the chart have multiple signals converging on this theme?
□ Does the place note add real interpretive value?
□ Is the wording clearly non-prescriptive?
□ Is the note framed as archetype / environmental resonance, not recommendation?
□ Are examples clearly illustrative ("places like...") and not ranked?
□ Is there no more than 1 short paragraph / 3–5 sentences?
□ Is there no map, line, relocated chart, or target-location calculation?
□ Does the note pass the forbidden wording check in §5?
```

If any box is unchecked, revise or remove the note.

---

## 9. Phase note

```text
This policy defines CORE place archetype rules only.

Full PLACE add-on implementation requires:
1. MAP0 — FreeAstroAPI/provider capability audit
2. MAP-PLACE — provider/location data mapping
3. Runtime approval for PLACE add-on
4. Product design decisions for PLACE UX and scope

Until those gates are cleared, CORE uses only the soft environmental archetype
framing defined in this document.
```

🔒 curated Darrow rule doc · docs-only · not active in runtime · KB2-PLACE approved · requires explicit runtime approval
