# DARROW CODE — Relocation Chart Rules v1

**Status:** curated Darrow rule doc / docs-only
**Runtime status:** not active
**Not prompt authority**
**Not schema authority**
**Not PDF/template authority**
**Not provider implementation authority**
**Not report generation authority**
**Derived from source packs in original Darrow Code language**
**Requires separate MAP0/MAP-PLACE and explicit runtime approval before use**

Source packs used: `DARROW_ASTROGEO_PLACE_SOURCE_ADDENDUM_v0_1.md`
Guard references: `BIRTH_TIME_RELIABILITY_POLICY_v1.md` · `ASTRO_HOUSE_RULES_v1.md` · `ASTROGEO_PLACE_RULES_v1.md`
Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md` · `PLACE_ADDON_BOUNDARY_POLICY_v1.md`

---

## 1. Core definition

A relocated natal chart is a chart calculated using the same birth moment as the natal chart, but recalculated for the angles and houses of a target location — as if the person had been born at that moment in the target city.

```text
Relocated chart = place-context chart.
It does NOT replace the natal chart.
It does NOT create a new identity, new life path, or new destiny.
It shows how the existing natal pattern is emphasized, reframed, or redistributed when placed in a different geographic field.
```

---

## 2. What a relocated chart changes

A relocation re-calculates:

```text
Changed:
  - Ascendant / Rising sign (ASC) — new local horizon
  - Midheaven / MC — new local meridian
  - IC and Descendant — follow from ASC/MC shift
  - House assignments of all planets — derived from new angles
  - House rulers — follow from new house assignments

NOT changed:
  - Planetary signs (e.g. Sun in Aries stays Sun in Aries)
  - Planetary positions in the zodiac (degrees unchanged)
  - Natal aspects between planets (unchanged)
  - The natal chart itself (still the foundation)
```

---

## 3. Required inputs

A relocated chart calculation requires ALL of the following:

| Input | Requirement |
|---|---|
| Birth date | exact — day, month, year |
| Birth time | `birth_time_confidence: "exact"` — approximate or unknown blocks relocated chart |
| Birthplace | city, country, verified coordinates, timezone |
| Target location | city/region name, verified coordinates, timezone/DST handled |
| Calculation method | provider/engine identified and verified (MAP0 required first) |

If birth time is approximate or unknown:

```text
Do not produce a relocated chart.
Do not produce local house or angle claims.
A soft environmental archetype note may still be written if supported by natal planetary signs,
but it must not reference houses, angles, or specific degree placements.
```

---

## 4. How to use a relocated chart in Darrow

### 4.1 House redistribution

In a relocated chart, planets may move into different houses compared to the natal chart. A planet that was cadent in the natal chart may become angular in the relocated chart, making its themes more prominent and visible in that location.

```text
Darrow framing:
"In [city], the [planet] function, which in the natal chart operates in the background,
moves into a more active position — the place amplifies and makes visible what the natal
chart holds more quietly."
```

### 4.2 Angular planets in relocation

A planet near the Ascendant, MC, IC, or Descendant in a relocated chart is considered angularly activated in that location.

```text
Angular in relocated chart = the planet's symbolic function is more prominently encountered
and expressed in that geographic field.
```

Angular does not mean guaranteed. It means prominent.

### 4.3 House emphasis shift

If the natal chart has a cluster of planets in one house, relocation may disperse them across different houses — or concentrate them further. This can shift the experiential emphasis of different life areas.

---

## 5. What a relocated chart is NOT

```text
NOT a new natal chart
NOT a new identity or personality
NOT proof that the person should live in the target location
NOT a guarantee of outcomes
NOT a replacement for the natal chart in any interpretation
NOT valid if birth time is approximate or unknown
NOT to be produced without verified provider support (MAP0)
```

---

## 6. Relocation chart vs planetary line map

These are related but distinct tools:

| Tool | What it shows | Darrow use |
|---|---|---|
| Planetary line map | Where each planet was angular (ASC/MC/IC/DSC) globally | Broad geographic emphasis zones |
| Relocated chart | The full chart recalculated for one specific target location | House and angle redistribution for that specific city |

A robust PLACE interpretation uses both. The planetary line map identifies the zone; the relocated chart shows the detailed redistribution within that zone.

---

## 7. Target location data requirements

For runtime use (future MAP-PLACE phase), every target location needs:

```ts
// conceptual — not runtime yet
interface TargetLocation {
  name: string;           // city / region name
  country: string;        // ISO country code preferred
  latitude: number;       // decimal degrees, verified
  longitude: number;      // decimal degrees, verified
  timezone: string;       // IANA tz database identifier
  dst_applied: boolean;   // whether DST has been applied for calculation date
}
```

Atlas / geocoding reliability must be confirmed before production use. Provider-side or Darrow-side atlas handling must be decided in MAP0.

---

## 8. House-system caution in relocation

The same house-system considerations from `ASTRO_HOUSE_RULES_v1.md` apply to relocated charts:

```text
The house system used must be the same as or compatible with the natal chart system.
Do not silently switch house systems between natal and relocated chart.
High-latitude targets require extra caution with Placidus cusps.
```

---

## 9. MAP0 requirement before production

```text
Before any relocated chart can be produced in runtime:

1. MAP0 must confirm whether FreeAstroAPI supports relocated chart calculation for a target city.
2. MAP0 must confirm what input format is required (coordinates, timezone, date/time).
3. MAP0 must confirm what output is returned and in what format.
4. MAP-PLACE must map that output to Darrow PLACE rule docs.
5. Product design must approve the PLACE add-on scope and UX.
```

Until MAP0 is complete, no relocated chart output may be produced or implied in runtime.

---

## 10. Forbidden claims (relocated chart)

```text
"The relocated chart proves you should live in X"
"This city will change your life/career/relationships"
"You have a new identity in X"
"The relocated chart overrides your natal chart"
"This is your true chart"
Relocation chart claims when birth time is approximate or unknown
Relocation advice (move, leave, buy property, immigrate)
Medical / legal / financial / safety claims from relocated chart
Compatibility claims from comparing two people's relocated charts
```

---

## 11. Safe sample phrases

```text
"In [city], the way the chart distributes emphasis shifts — the [planet] function, which
operates in a supporting role natally, moves into a more active position locally. That
does not mean the city creates something new; it means the same pattern is more visible there."

"The relocated chart for [city] places the Ascendant in [sign], which means the person's
social interface in that location takes on a different quality — not a new personality,
but a different local emphasis."

"This is a tool for understanding how a place might amplify or redistribute existing patterns,
not a prescription for where to live."
```

🔒 curated Darrow rule doc · docs-only · not active in runtime · KB2-PLACE approved · requires MAP0/MAP-PLACE and explicit runtime approval
