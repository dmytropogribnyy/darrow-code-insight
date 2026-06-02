# DARROW CODE — BAZI INTERPRETATION RULES v1

# Status: ⚠️ POLICY STUB — data provider active; interpretation dict pending

# Governed by: SOURCE_POLICY.md + SYMBOLIC_IDENTITY_STANDARD.md

---

## 1 · DATA LAYER (ACTIVE)

BaZi Four Pillars data is provided by **FreeAstroAPI**
endpoint: `POST /api/v1/chinese/bazi`

Available fields: Day Master, Day Master strength, Ten Gods, element balance,
pillar interactions, Shen Sha Stars, 12 Life Stages, Luck Pillars.

BaZi data is conditional: if BaZi is unavailable, no BaZi claims may be made
anywhere in the report.

---

## 2 · CONFIRMED PATTERNS (from gold sample)

From `DARROW_CORE_SAMPLE_REPORT_v4_1.md` — Dmitry's profile:

| BaZi element | Darrow Code framing |
|---|---|
| Gui Water Day Master (peak strength) | "The deepest, most interior form of the Water element — a nature built for depth, for reading what is beneath the surface, for processing the world slowly and thoroughly" |
| Cross-system convergence framing | "A second symbolic system, read in a completely different way, points at the same thing" — used to strengthen the core_architecture read |

---

## 3 · INTERPRETATION PRINCIPLES (ACTIVE)

1. **Cross-system convergence is the highest-value use.** When BaZi confirms
   the natal chart's read, name it explicitly: "two separate systems, one
   conclusion."
2. **Day Master as operating nature.** Translate the Day Master into the client's
   lived operating style — not as technical jargon, but as a pattern they
   recognize in themselves.
3. **Element balance as fuel type.** The dominant element tells you what actually
   powers the client, not just what they're like.
4. **No historical claims.** Never say "an ancient Chinese system" as the main
   framing — name the pattern first, use BaZi as confirmation.
5. **Conditional rendering.** If BaZi returns no data or is unavailable, skip
   all BaZi references silently. No placeholder, no apology.

---

## 4 · FULL DICTIONARY (pending KBv1)

When populated, this file will contain original Darrow Code interpretation rules
for the 10 Day Masters (Jia/Yi/Bing/Ding/Wu/Ji/Geng/Xin/Ren/Gui), element
balance patterns, and key Ten Gods interactions.

Rule format:
```
Day Master: [Jia / Yi / Bing / Ding / Wu / Ji / Geng / Xin / Ren / Gui]
Plain-language archetype: [the lived quality in human terms]
Darrow Code pattern name: [evocative label]
Recognition line: [the "yes, that's me" sentence]
Element fuel type: [what actually drives this person]
Shadow/cost: [honest design trade-off]
Cross-system alignment: [how this typically aligns with Water/Fire/etc natal charts]
```

---

## 5 · CHANGE LOG

| Date | Change |
|---|---|
| 2026-06-02 | B0 stub — data layer confirmed; gold sample patterns logged; principles documented; full dict pending KBv1 |
