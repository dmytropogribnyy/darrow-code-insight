# DARROW CODE — AstroGeo PLACE Rules v1

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
Guard references: `BIRTH_TIME_RELIABILITY_POLICY_v1.md` · `ASTRO_PLANET_RULES_v1.md` · `ASTRO_HOUSE_RULES_v1.md`
Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md` · `PLACE_ADDON_BOUNDARY_POLICY_v1.md`

---

## 1. Core principle

```text
Place is not a guarantee. Place can symbolically emphasize, mirror, amplify, pressure,
soften, or contextualize a chart pattern.

A location does not rewrite the natal chart. It shifts the field in which the chart operates.
```

AstroGeo / astrocartography in Darrow Code is **symbolic place-resonance mapping** — not a scientific system, not a deterministic prediction, and not relocation advice.

---

## 2. Product layer placement

| Layer | PLACE use | Status |
|---|---|---|
| CORE | Soft environmental resonance only; 1–3 illustrative place archetypes if chart strongly supports it; no maps, no lines, no rankings | blocked until explicit unlock per `CORE_PLACE_ARCHETYPE_POLICY_v1.md` |
| PLACE add-on | Astrocartography lines, relocated chart, city/region comparison, goal-based place strategy | future add-on; requires MAP0/MAP-PLACE and explicit approval |
| YEAR | Possible minor cross-link if annual transit emphasis supports place note | conditional; future only |
| LOVE / MONEY / BODY / STYLE | Possible minor cross-links | future; not current scope |

---

## 3. Required inputs for any PLACE calculation

Any astrocartography or relocated chart output requires ALL of the following:

```text
birth_time_reliability: "exact"   — approximate or unknown blocks all line/angle claims
birthplace:             city, country, coordinates, timezone
target_location:        city/region name, coordinates, timezone / DST
calculation_method:     provider/engine specified and verified (MAP0 required first)
```

If any of the above is missing or unreliable:

```text
Do not produce astrocartography lines.
Do not produce relocated chart angles.
Do not produce city-specific symbolic claims.
```

---

## 4. What "place emphasis" means in Darrow

Place emphasis is symbolic — it describes a quality of resonance between a chart pattern and a geographic field. It is not a causal mechanism.

| Term | Darrow meaning |
|---|---|
| Supportive emphasis | a location where a chart function may operate with less friction |
| Creative pressure | a location where a chart function is challenged to develop |
| Visibility field | a location where a pattern becomes more publicly visible |
| Relationship mirror | a location where relational dynamics are more strongly activated |
| Discipline terrain | a location where structure and effort are more demanded |
| Dream field | a location where imagination and idealism are amplified |
| Identity amplifier | a location where the sense of self and purpose is intensified |
| Recovery resonance | a location where rest, withdrawal, and restoration are naturally supported |
| Home field | a location where the emotional and domestic register feels anchored |

None of these terms imply a guarantee.

---

## 5. Four types of place content — distinctions

These must never be confused or merged without explicit differentiation:

| Type | Definition | Allowed in |
|---|---|---|
| Environmental archetype | a symbolic description of the kind of place a pattern tends to resonate with (e.g. "structured financial capitals", "old coastal towns") | CORE (soft, non-ranked) |
| Illustrative place example | a named city/region used as an example of an archetype — clearly marked as non-prescriptive | CORE (1–3 examples max) and PLACE |
| Personalized place recommendation | a specific city selected based on this user's chart, goals, and target inputs | PLACE add-on only; requires MAP0 |
| Relocation advice | actionable instruction to move, leave, buy property, or change life situation | Never in Darrow — forbidden at all phases |

---

## 6. Safe Darrow PLACE language

### Allowed

```text
"This pattern may respond well to environments like..."
"As an archetype, the kind of place that resonates is..."
"For illustration: cities like X or Y represent this type of field — not as a prescription,
 but as a symbolic reference point."
"This place may mirror and amplify the Venus function: beauty, ease, relational warmth.
 That does not mean the city guarantees love."
"The IC pattern here tends to feel more anchored near the water or in smaller, historically
 rooted towns — this is a tendency, not a formula."
```

### Forbidden

```text
"Move to X."
"Your best city is X."
"Avoid X."
"This city will make you rich / heal you / bring love."
"X is bad for your chart."
"This line guarantees career growth."
"You will thrive in X."
"X is your destiny location."
"This country is dangerous for you."
```

---

## 7. Practical reality check (mandatory in PLACE add-on)

Any future PLACE output must include or link to a practical reality check section:

```text
Symbolic place resonance does not replace real-world judgment.

Factors that must be weighed:
- visa / residency rights
- language
- employment market
- family and personal ties
- cost of living
- safety
- healthcare access
- legal and financial situation
- personal preference and tolerance
- climate
- cultural fit

Place resonance is one input. Real-world feasibility is the deciding factor.
```

---

## 8. Global forbidden claims (all PLACE content)

```text
"Best city" or "worst city" rankings
Relocation instructions or move/leave/buy advice
Love / money / fame / health / safety guarantees from location
Astrocartography lines without exact birth time
City-specific claims without verified coordinates and calculation method
Claims that a location is "fated," "karmic," or "destined"
Medical safety or health claims from location
Legal, financial, or immigration guidance from chart
Compatibility claims based on city comparison between two people
```

---

## 9. Phase gate

```text
PLACE output (beyond CORE soft resonance) requires:
1. MAP0 — FreeAstroAPI / provider capability audit for astrocartography/relocation
2. MAP-PLACE — mapping provider data to PLACE rule docs
3. Explicit runtime implementation approval
4. Product design decision on PLACE add-on scope and UX

Do not produce city recommendations, maps, lines, or relocated chart output until these gates are cleared.
```

🔒 curated Darrow rule doc · docs-only · not active in runtime · KB2-PLACE approved · requires MAP0/MAP-PLACE and explicit runtime approval
