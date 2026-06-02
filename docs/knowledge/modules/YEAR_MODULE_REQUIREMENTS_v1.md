# DARROW CODE — YEAR Module Requirements v1

**Status:** docs-only planning / data sufficiency matrix
**Runtime status:** not active
**Not prompt/schema/template/provider/runtime authority**
**Requires later MAP0/MAP1/runtime approval before use**

Phase: MOD-SUFF0
Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md`

---

## 1. Module purpose

YEAR covers the person's current annual cycle pattern — what kind of year this is, what pressures and opportunities are present, and how to work with the cycle's quality rather than against it.

YEAR is a cycle-climate module, not a prediction module. It produces seasonal and rhythmic framing, not event forecasts or daily horoscopes.

---

## 2. Required user inputs

| Input | Notes |
|---|---|
| Birth date | Required for natal baseline + numerology |
| Current year | Required for Personal Year calculation and transit context |
| First name | Required for personalization |

---

## 3. Optional / conditional user inputs

| Input | What it unlocks | Condition |
|---|---|---|
| Birth time (exact) | Ascendant-based transit precision, Solar Return angles | Optional — improves quality |
| Birth city | Required if birth time used | Required alongside birth time |

---

## 4. Required provider / calculated data

| Signal | Source | Rule doc | Notes |
|---|---|---|---|
| Personal Year number | In-code calculation (birth MM/DD + current year) | `NUMEROLOGY_RULES_v1.md` (future) | Core annual cycle — minimum viable signal |
| Natal planetary baseline | FreeAstroAPI natal | As per CORE | Provides context for transit interpretation |

---

## 5. Optional / conditional provider data

| Signal | Condition | Rule doc | Notes |
|---|---|---|---|
| Current slow-planet transits (Jupiter, Saturn, Uranus, Neptune, Pluto) | Provider transit payload available | Future transit rules | Annual pressure and opportunity field |
| Solar Return chart | Exact birth time + current year + provider support | Future solar return rules | Annual chart climate |
| Moon phase (monthly cycle) | Provider payload available | Future moon phase rules | Monthly rhythm as light texture |
| BaZi annual/monthly flow | Provider BaZi payload available | Future BaZi flow rules | BaZi annual cycle as optional texture |
| Personal Month number | In-code calculation from PY | `NUMEROLOGY_RULES_v1.md` (future) | Monthly sub-cycle texture |
| Progressed chart | Future phase only | Future progression rules | Not current scope |

---

## 6. Required curated rule docs (available)

| Rule doc | Layer covered |
|---|---|
| `ASTRO_PLANET_RULES_v1.md` | Transpersonal planets (Uranus/Neptune/Pluto as generational texture in transit context) |
| `BIRTH_TIME_RELIABILITY_POLICY_v1.md` | Birth time gate |

---

## 7. Future rule docs still missing

| Rule doc | Layer | Phase |
|---|---|---|
| `NUMEROLOGY_RULES_v1.md` | Personal Year (required), Personal Month (optional) | KB2-B |
| Transit rules | Slow-planet transit climate | Future MAP1 |
| Solar return rules | Annual solar return chart | Future |
| Moon phase rules | Monthly lunar cycle texture | Future |
| BaZi flow rules | Annual / monthly BaZi timing | KB2-C |

---

## 8. Gated layers

| Layer | Status | Notes |
|---|---|---|
| Daily horoscope content | blocked permanently | Not a Darrow product |
| Event-specific date predictions | blocked permanently | Not allowed |
| Daily planetary hour guidance | blocked permanently | Not in scope |

---

## 9. Blocked claims

```text
"This year you will [specific event]"
Daily horoscope predictions or daily guidance
"On [date] you will meet / lose / gain / achieve X"
"This transit guarantees [outcome]"
"This is your lucky year" as a deterministic claim
"Avoid [date range] because X will happen"
Financial / investment / legal timing predictions
Medical timing predictions
Relationship event predictions
"Your year number guarantees success / difficulty"
```

---

## 10. Minimum viable generation level

```text
With: birth date + current year only

Available:
  - Personal Year number (1–9) and its cycle climate
  - Personal Year within the 9-year cycle context
  - Light transit context if major slow-planet transits are available
  - Synthesis: "this year carries the quality of [PY theme] — what that means for this pattern"

Not available:
  - Transits (conditional on provider payload)
  - Solar Return (conditional on birth time + provider)
  - BaZi annual flow (conditional on payload)
  - Moon phase (conditional on provider)

Confidence: medium — seasonally grounded but without full transit layer
```

---

## 11. Full-quality generation level

```text
With: birth date + current year + exact birth time + birth city + transit payload + BaZi payload

Available:
  - Personal Year (core)
  - Major slow-planet transits and their climate
  - Solar Return chart and annual angles
  - BaZi annual flow as supporting texture
  - Moon phase as light monthly rhythm note
  - Full synthesis: numerological cycle + transit pressure + annual chart + BaZi flow

Confidence: high
```

---

## 12. Confidence levels by section

| Section | PY only (minimum) | + transits | + solar return |
|---|---|---|---|
| Annual cycle climate (Personal Year) | high | high | high |
| Outer pressure and opportunity (transits) | blocked | high | high |
| Annual chart re-orientation (Solar Return) | blocked | medium | high |
| Monthly sub-cycle (Personal Month) | medium | medium | medium |
| BaZi annual timing | conditional | conditional | conditional |
| Lunar rhythm (Moon phase) | conditional | conditional | conditional |

---

## 13. What must never be hallucinated

```text
Transit positions when provider payload is absent
Solar Return angles when birth time is unknown or provider does not support it
BaZi annual flow when provider payload is absent
Specific event predictions for any date or period
"This month/week/day you will..." claims
Current year assumed without being passed in user context
```

🔒 docs-only planning · not active in runtime · MOD-SUFF0 · requires MAP0/MAP1/runtime approval
