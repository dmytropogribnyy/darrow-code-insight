# DARROW CODE — NUMEROLOGY RULES v1

# Status: ⚠️ POLICY STUB — calculation rules active; interpretation dict pending

# Governed by: SOURCE_POLICY.md + SYMBOLIC_IDENTITY_STANDARD.md

---

## 1 · WHAT IS ACTIVE (CALCULATION LAYER)

Numerology calculations are handled **in-code** (`src/lib/astro/numerology.ts`).
No API call needed. The following are calculated from user input:

| Number | Calculation source | Always available? |
|---|---|---|
| Life Path | Birth date (day + month + year reduction) | ✅ Yes |
| Personal Year | Birth day + birth month + current year | ✅ Yes |
| Expression | Full name numerological reduction | Requires `full_name_for_numerology` |
| Soul Urge (Heart's Desire) | Vowels of full name | Requires `full_name_for_numerology` |
| Personality | Consonants of full name | Requires `full_name_for_numerology` |

**Data safety rule:** If `full_name_for_numerology` is absent:
- Use Life Path + Personal Year only
- Include neutral note: "Expression, Soul Urge, and Personality numbers require
  the full name provided at intake"
- Do not use upsell language

---

## 2 · INTERPRETATION RULES (to be populated in KBv1 phase)

When populated, this file will contain original Darrow Code interpretation rules
for each number (1–9, plus master numbers 11, 22, 33 where appropriate).

Rule format for each number:
```
Number: [1–9, 11, 22]
Layer: [Life Path / Expression / Soul Urge / Personality / Personal Year]
Plain-language meaning: [what it describes in human terms]
Core pattern: [the structural truth it names]
Recognition line: [the "yes, that's me" phrase]
Integration note: [how it works with other numbers — tension or harmony]
Darrow Code framing: [how this fits the recognition-first reading approach]
```

---

## 3 · CONFIRMED PATTERNS (from gold sample)

From `DARROW_CORE_SAMPLE_REPORT_v4_1.md` — Dmitry's profile:

| Number | Layer | Pattern confirmed in gold sample |
|---|---|---|
| 8 | Expression | The builder / structure-carrier — holds weight and authority outward |
| 7 | Soul Urge | The seeker — needs silence and depth to recharge; inner driver |
| 1 | Personality | First impression: someone who decides; stands alone |
| 3 | Life Path | The integrator — takes depth and translates into clear/usable for others |
| 4→5 | Personal Year | 4 = foundation/discipline; 5 = movement/openness; mid-year transition |

Gold sample framing note: "These are not who you are in some fixed way.
They are gears you can shift between, on purpose."

---

## 4 · CHANGE LOG

| Date | Change |
|---|---|
| 2026-06-02 | B0 stub — calculation layer confirmed active; patterns from gold sample logged; full dict pending KBv1 |
