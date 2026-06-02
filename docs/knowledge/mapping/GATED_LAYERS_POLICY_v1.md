# DARROW CODE — Gated Layers Policy v1

**Status:** KBSYS0 docs-only policy.  
**Scope:** gating policy only. No runtime implementation.

---

## 1. Purpose

This policy prevents raw symbolic source packs from accidentally becoming production report logic.

A layer can exist in research docs while still being blocked or gated for runtime.

---

## 2. Status definitions

| Status | Meaning |
|---|---|
| allowed | May be used when required data exists and curated rules are approved |
| conditional | May be used only when specific data-quality conditions are met |
| gated | May exist in docs, but must not be active in runtime without explicit later approval |
| blocked | Must not be used in current product/runtime output |

---

## 3. Allowed layers

Allowed after curated rules and product approval:

- Western natal signs;
- planets;
- major aspects;
- elements and modalities;
- Life Path and Birthday Number;
- core chart/numerology convergence.

---

## 4. Conditional layers

| Layer | Condition |
|---|---|
| Houses | reliable birth time and birthplace |
| Ascendant / MC / IC / Descendant | reliable birth time and birthplace |
| Planet-in-house claims | reliable birth time and house system known |
| Full-name numerology | full name provided and normalized |
| Name symbolism | etymology verified; soft wording only |
| BaZi Day Master / pillars | provider payload available; no technical dump |
| Chinese zodiac animal | calendar method known; soft symbolic layer only |
| Moon phase | provider payload available; small texture only |
| Transits / Solar Return / BaZi Flow | YEAR/add-on routing; no deterministic forecasts |

---

## 5. Gated layers

These layers are not active in CORE runtime unless explicitly unlocked later:

- colors;
- gemstones;
- Celtic trees / Ogham;
- symbolic allies;
- name etymology automation;
- house/address numerology;
- compatibility numerology;
- Chinese zodiac compatibility;
- Feng Shui / remedial objects;
- STYLE palette generation.

Gated layers require:

1. curated Darrow rule doc;
2. forbidden-claims policy;
3. report-section routing decision;
4. explicit implementation phase;
5. review before production use.

---

## 6. Blocked layers / claims

Hard-blocked in Darrow output:

- lucky numbers;
- lucky colors;
- lucky stones;
- healing claims;
- protection claims;
- wealth guarantees;
- career guarantees;
- medical claims;
- legal claims;
- compatibility guarantees;
- Tai Sui fear/remedy framing;
- gemstone finger/metal/carat/ritual advice;
- name-change recommendations;
- daily horoscope predictions;
- event prediction certainty;
- provider-generated psychological report prose;
- health/Neijing readings;
- synastry in CORE;
- astrocartography in CORE.

---

## 7. Safe wording

Allowed language:

```text
symbolic mirror
psychological anchor
visual cue
soft support
poetic accent
cultural-symbolic layer
```

Forbidden language:

```text
lucky
heals
protects
attracts money/love/success
guarantees
fixes your chart
changes destiny
must wear/use/do
```

---

## 8. Runtime guard

No implementation may activate a gated layer unless a later explicit phase says so.

Docs-only existence is not runtime permission.
