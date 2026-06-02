# DARROW CODE — PLACE Module Requirements v1

**Status:** docs-only planning / data sufficiency matrix
**Runtime status:** not active
**Not prompt/schema/template/provider/runtime authority**
**Requires MAP0/MAP-PLACE and explicit runtime approval before any use**

Phase: MOD-SUFF0
Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md` · `PLACE_ADDON_BOUNDARY_POLICY_v1.md`

---

## 1. Module purpose

PLACE covers the person's best environments for work, rest, and renewal — using astrocartography, relocated chart analysis, and environmental resonance mapping to identify which geographic fields tend to amplify or challenge specific chart patterns.

**Scope note:** PLACE requires MAP0 (FreeAstroAPI astrogeo capability audit) and MAP-PLACE (provider-to-rule mapping) before any runtime use. It is currently a future add-on only.

---

## 2. Required user inputs

| Input | Notes |
|---|---|
| Birth date | Required |
| Birth time (exact) | Required for astrocartography lines and relocated chart |
| Birth city / coordinates | Required for chart origin point |
| Target location(s) | Required for city/region comparison |
| User goal | Required for goal-based place matching (career / rest / love / study / etc.) |
| First name | Required for personalization |

---

## 3. Optional / conditional user inputs

| Input | What it unlocks | Condition |
|---|---|---|
| Multiple target locations | City-by-city comparison table | Optional — more inputs = richer output |
| Goal weighting | Prioritized multi-goal place matching | Optional — improves output relevance |
| Current residence | Comparison: home vs target environments | Optional |
| Practical filter inputs (visa status, language, etc.) | Reality check enrichment | Optional but strongly encouraged |

---

## 4. Required provider / calculated data

| Signal | Source | Condition | Notes |
|---|---|---|---|
| Natal planetary baseline | FreeAstroAPI natal | Always | Context for all PLACE interpretation |
| Astrocartography lines per target | MAP0 audit required | Exact birth time + target coords | Not available until MAP0 confirms support |
| Relocated chart for target | MAP0 audit required | Exact birth time + target coords | Not available until MAP0 confirms support |
| Local house/angle redistribution | Derived from relocated chart | Exact birth time + target coords | Not available until MAP0 confirms |
| Target location coordinates | Atlas lookup or user-provided | Always | Verified lat/long + timezone/DST |

---

## 5. Optional / conditional provider data

| Signal | Condition | Notes |
|---|---|---|
| Local space / azimuth lines | MAP0 audit + provider support | Advanced; not required for minimum |
| Geodetic astrology | MAP0 audit + provider support | Advanced; not required for minimum |
| Multiple relocated charts | Multiple user targets | City comparison table |
| Progressed chart for target | Future phase | Not current scope |

---

## 6. Required curated rule docs (available)

| Rule doc | Layer covered |
|---|---|
| `ASTROGEO_PLACE_RULES_v1.md` | Core PLACE principles and framing |
| `ASTROGEO_PLANETARY_LINE_RULES_v1.md` | 10 planetary lines + angles |
| `RELOCATION_CHART_RULES_v1.md` | Relocated chart rules |
| `PLACE_ADDON_BOUNDARY_POLICY_v1.md` | CORE vs PLACE boundary |
| `PLACE_USE_CASE_ARCHETYPES_v1.md` | 12 goal-based use-case buckets |
| `CORE_PLACE_ARCHETYPE_POLICY_v1.md` | CORE soft environmental resonance policy |
| `BIRTH_TIME_RELIABILITY_POLICY_v1.md` | Birth time gate |

---

## 7. Future rule docs still missing

| Rule doc | Layer | Phase |
|---|---|---|
| `FREEASTROAPI_TO_DARROW_PLACE_MAPPING_v1.md` | Provider field to PLACE rule mapping | MAP0 / MAP-PLACE |
| `BIRTH_TIME_RELIABILITY_POLICY_v1.md` extended | High-latitude behavior | MAP-PLACE |
| City/region practical filter rules | Visa/language/cost filters for reality check | MAP-PLACE |

---

## 8. Supported use-case buckets

From `PLACE_USE_CASE_ARCHETYPES_v1.md`:

| Use case | Minimum viable | Full quality |
|---|---|---|
| Work / Career | ✅ archetype only | ✅ planetary lines + relocated chart |
| Business / Money | ✅ archetype only | ✅ planetary lines + relocated chart |
| Recovery / Rest | ✅ archetype only | ✅ planetary lines + relocated chart |
| Creative / Inspiration | ✅ archetype only | ✅ planetary lines + relocated chart |
| Love / Social | ✅ archetype only | ✅ planetary lines + relocated chart |
| Spiritual / Retreat | ✅ archetype only | ✅ planetary lines + relocated chart |
| Long-term Home Base | ✅ archetype only | ✅ planetary lines + relocated chart |
| Short-term Travel Reset | ✅ archetype only | ✅ planetary lines |
| Learning / Study | ✅ archetype only | ✅ planetary lines + relocated chart |
| Visibility / Public Role | ✅ archetype only | ✅ planetary lines + relocated chart |
| Body / Health-Rhythm Support | ✅ archetype only (no medical claims) | ✅ environmental quality only |
| Reinvention / New Chapter | ✅ archetype only | ✅ planetary lines + relocated chart |

---

## 9. Gated and blocked layers

| Layer | Status | Notes |
|---|---|---|
| Astrocartography lines | blocked until MAP0 | Provider support not yet confirmed |
| Relocated chart output | blocked until MAP0 | Provider support not yet confirmed |
| City ranking / scoring | blocked permanently | No "best city" claim ever |
| Relocation advice (move/leave/buy) | blocked permanently | Never a Darrow output |
| Medical / health claims from location | blocked permanently | Never a Darrow output |
| Legal / financial / immigration advice | blocked permanently | Never a Darrow output |
| Astrocartography without exact birth time | blocked permanently | Required condition |
| Place content in CORE beyond archetype | blocked | See `CORE_PLACE_ARCHETYPE_POLICY_v1.md` |

---

## 10. Blocked claims

```text
"Your best city is X"
"Worst city for you is X"
"Move to X"
"Leave your current city / country"
"Buy property in X"
"Immigrate to X"
"This place guarantees love / money / health / success / career"
"This city will make you happy"
"This country is bad for your chart"
"This is your destined / fated / karmic place"
"Your Sun line gives you fame in X"
City ranking without user-provided target shortlist and MAP-PLACE processing
Astrocartography output without exact birth time
Relocated chart without exact birth time and verified coordinates
Medical / health / legal / financial / safety advice from any location signal
```

---

## 11. Minimum viable generation level

```text
With: birth date only (no birth time; no target location)

Available in CORE only:
  - Soft environmental archetype note (if chart strongly supports it)
  - 1–3 illustrative place examples as archetypes (non-ranked, non-prescriptive)
  - See CORE_PLACE_ARCHETYPE_POLICY_v1.md

Not available:
  - Astrocartography lines
  - Relocated chart
  - City/region comparison
  - Goal-based place matching
  - Any PLACE add-on content

Confidence: low (archetype only; blocked at module level)
```

---

## 12. Full-quality generation level (future — requires MAP0/MAP-PLACE)

```text
With: birth date + exact birth time + birth city + target locations + user goals + MAP0 cleared

Available:
  - Planetary line analysis for all target locations
  - Relocated chart house/angle redistribution per target
  - Goal-based use-case matching across 12 use-case buckets
  - City/region comparison table
  - Practical reality check (mandatory)
  - Final place strategy with symbolic resonance + real-world caveat

Confidence: high (when all inputs + MAP0/MAP-PLACE cleared)
```

---

## 13. Confidence levels

| Output type | Without birth time | With birth time | With MAP0 cleared |
|---|---|---|---|
| Environmental archetype (CORE soft) | medium | medium | medium |
| Illustrative place examples | low | low | low |
| Planetary line analysis | blocked | blocked | conditional |
| Relocated chart output | blocked | blocked | conditional |
| Goal-based city matching | blocked | blocked | conditional |
| Practical reality check | n/a | n/a | required |

---

## 14. What must never be hallucinated

```text
Birth time when not provided
Target location coordinates not verified
Astrocartography lines without exact birth time and MAP0 confirmation
Relocated chart output without exact birth time and MAP0 confirmation
"Best city" verdicts
Provider capability assumed without MAP0 audit
Practical reality check omitted from any PLACE output
```

🔒 docs-only planning · not active in runtime · MOD-SUFF0 · requires MAP0/MAP-PLACE and explicit runtime approval
