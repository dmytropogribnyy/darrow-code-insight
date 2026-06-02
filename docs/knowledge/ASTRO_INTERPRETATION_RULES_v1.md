# DARROW CODE — ASTRO INTERPRETATION RULES v1

# Status: ⚠️ POLICY STUB — data provider active; interpretation dict pending

# Governed by: SOURCE_POLICY.md + SYMBOLIC_IDENTITY_STANDARD.md

---

## 1 · DATA LAYER (ACTIVE)

Western natal chart data is provided by **FreeAstroAPI** (Swiss Ephemeris engine).
Available data: planets, signs, houses, aspects, ASC/MC/IC/DSC, dominant element.

Conditional availability:
- Houses, ASC, MC, IC, DSC: require `birth_time_known=true`
- If `birth_time_known=false`: use signs, aspects, and element balance only

---

## 2 · CONFIRMED PATTERNS (from gold sample)

Key interpretation framings demonstrated in `DARROW_CORE_SAMPLE_REPORT_v4_1.md`:

| Placement | Darrow Code framing | Principle |
|---|---|---|
| Sun/Moon/ASC Cancer stellium | "You cannot perform a version of yourself you do not feel" | Alignment of core/emotional/outer self |
| Gui Water Day Master (peak) | "Two separate systems, one conclusion: depth and interior reading" | Cross-system convergence |
| Bundle chart shape | "You work like a laser, not a floodlight" | Specialist focus vs generalist spread |
| Water dominant 59% | "Fuel: emotional resonance, not logic or obligation" | Element as operating fuel type |
| Moon Cancer (1H) | "What you need to feel safe and who you are at your core are the same thing" | Moon placement as emotional architecture |
| Cancer ASC | "Broadcasts warmth; behind it stands a careful gate" | Ascendant as social broadcast vs inner reality |
| Mercury Cancer 2H | "You feel your way to understanding, and then your intellect catches up" | Cognitive style from Mercury sign |
| Mars Taurus 12H | "Slow to start, hard to get rolling, and then nearly impossible to stop" | Drive tempo from Mars sign/house |
| Saturn Virgo 4H | "Foundation matters more than facade; practical and in its right place" | Work ethic from Saturn house |
| MC Aquarius 29° | "Reform, innovation, the future of how things are done" | Career direction from MC |
| Venus Gemini 12H | "Real tenderness stays hidden, almost held in reserve" | Relationship style from Venus sign/house |

---

## 3 · INTERPRETATION PRINCIPLES (ACTIVE)

These principles apply to all astrological interpretation in Darrow Code:

1. **Human pattern first.** Name the lived experience before the placement.
2. **Placement as confirmation.** Data confirms what the client already recognizes.
3. **Cross-system convergence.** When two separate systems (e.g. natal + BaZi)
   point at the same pattern, name the convergence — it is the strongest evidence.
4. **Design trade-off framing.** Every strength has a shadow. Name both without shame.
5. **No historical claims.** Never say "two frameworks built centuries apart" —
   this was flagged as unsafe in the conflict audit.
6. **No determinism.** No "you will," "you are destined to," "your fate is."

---

## 4 · FULL DICTIONARY (pending KBv1)

When populated, this file will contain original Darrow Code interpretation rules
for: all 12 signs, all 10 planets, all 12 houses, major aspect themes,
element balance patterns, chart shape archetypes (Bundle, Splash, etc.),
dominant planet patterns.

Rule format:
```
Placement: [planet / sign / house]
Plain-language meaning: [human-readable]
Darrow Code pattern name: [evocative label]
Recognition line: [the "yes, that's me" sentence]
Shadow/cost: [honest design trade-off]
Proof tag format: [how to write the proof tag]
```

---

## 5 · CHANGE LOG

| Date | Change |
|---|---|
| 2026-06-02 | B0 stub — data layer confirmed; gold sample patterns logged; interpretation principles documented; full dict pending KBv1 |
