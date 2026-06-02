# DARROW CODE — Report Module Data Requirements Matrix v1

**Status:** docs-only planning / data sufficiency matrix
**Runtime status:** not active
**Not prompt/schema/template/provider/runtime authority**
**Requires later MAP0/MAP1/runtime approval before use**

Governed by: `SOURCE_POLICY.md` · `GATED_LAYERS_POLICY_v1.md`
Phase: MOD-SUFF0

---

## 1. Purpose

This matrix provides a consolidated cross-module view of all data requirements, confidence levels, gating, and fallback rules for each Darrow report module. Each module has a dedicated detailed file; this document is the at-a-glance reference.

---

## 2. User input requirements by module

| Input | CORE | LOVE | MONEY | BODY | YEAR | STYLE | PLACE |
|---|---|---|---|---|---|---|---|
| Birth date | ✅ required | ✅ required | ✅ required | ✅ required | ✅ required | ✅ required | ✅ required |
| Birth time (exact) | ⚠️ conditional | ⚠️ conditional | ⚠️ conditional | ⚠️ conditional | — | ⚠️ conditional | ✅ required |
| Birth city / coordinates | ⚠️ if birth time | ⚠️ if birth time | ⚠️ if birth time | ⚠️ if birth time | — | ⚠️ if birth time | ✅ required |
| Full name | ⚠️ conditional | ⚠️ optional | ⚠️ optional | — | — | — | — |
| Partner birth data | ❌ not CORE | ⚠️ future synastry | — | — | — | — | — |
| Current year | ⚠️ light context | — | — | — | ✅ required | — | — |
| Target location(s) | — | — | — | — | — | — | ✅ required |
| User goal | — | — | — | — | — | — | ✅ required |

---

## 3. Provider / calculated data by module

| Data | CORE | LOVE | MONEY | BODY | YEAR | STYLE | PLACE |
|---|---|---|---|---|---|---|---|
| Natal planets / signs | ✅ required | ✅ required | ✅ required | ✅ required | ⚠️ baseline | ✅ required | ⚠️ baseline |
| Natal aspects | ✅ required | ✅ required | ✅ required | ✅ required | — | — | — |
| Element / modality balance | ✅ required | ⚠️ optional | ⚠️ optional | ✅ required | — | ✅ required | — |
| Houses 1–12 | ⚠️ conditional | ⚠️ conditional | ⚠️ 2H/8H/10H | ⚠️ 6H/12H | — | ⚠️ 1H/5H | ❌ blocked (MAP0) |
| Ascendant / MC | ⚠️ conditional | ⚠️ conditional | ⚠️ 10H/MC | ⚠️ 1H | — | ⚠️ conditional | ❌ blocked (MAP0) |
| Numerology (LP/Birthday/PY) | ✅ allowed | ⚠️ optional | ⚠️ optional | ⚠️ optional | ✅ PY required | ⚠️ optional | — |
| Full name numerology | ⚠️ conditional | ⚠️ conditional | ⚠️ conditional | — | — | — | — |
| BaZi Day Master | ⚠️ conditional | ⚠️ conditional | ⚠️ conditional | ⚠️ conditional | ⚠️ conditional | — | — |
| BaZi element balance | ⚠️ optional | — | ⚠️ optional | ⚠️ optional | ⚠️ optional | ⚠️ optional | — |
| Transits | — | — | — | — | ⚠️ full quality | — | — |
| Solar return | — | — | — | — | ⚠️ full quality | — | — |
| Moon phase | — | — | — | ⚠️ optional | ⚠️ optional | — | — |
| BaZi flow | — | — | — | — | ⚠️ optional | — | — |
| Astrocartography / relocation | ❌ blocked | ❌ blocked | ❌ blocked | ❌ blocked | ❌ blocked | ❌ blocked | ⚠️ MAP0 required |

---

## 4. Confidence level summary

| Module | Minimum (no birth time) | Full (exact birth time) | Notes |
|---|---|---|---|
| CORE | medium | high | missing birth time removes houses/Asc |
| LOVE | medium (personal pattern only) | high (+ house layer) | synastry requires partner data (future) |
| MONEY | medium | high | 2H/8H/10H need birth time |
| BODY | medium | high | 6H/12H need birth time |
| YEAR | high (PY only) | high (+ transits) | birth time not required for PY |
| STYLE | medium | high | Asc needs birth time; colors/stones gated |
| PLACE | blocked | conditional | MAP0 required before any runtime use |

---

## 5. Gated and blocked layers summary

| Layer | Status | Unlocks via |
|---|---|---|
| Colors | gated | explicit approval + curated dict |
| Gemstones | gated | explicit approval + curated dict |
| Celtic trees / Ogham | gated | explicit approval + curated dict |
| Name etymology automation | gated | explicit approval + curated rules |
| Chinese zodiac compatibility | gated | explicit approval |
| Astrocartography lines | blocked for CORE; conditional for PLACE | MAP0 + MAP-PLACE + runtime approval |
| Relocated chart | blocked for CORE; conditional for PLACE | MAP0 + MAP-PLACE + runtime approval |
| Synastry | blocked for CORE; future LOVE | partner data + explicit phase |
| Health/Neijing | blocked all modules | never in current scope |
| Daily horoscope | blocked all modules | not a Darrow product |

---

## 6. Blocked claims — all modules

```text
lucky numbers / colors / stones / dates
heals / healing guarantee
protects / protection guarantee
attracts money / love / success / luck
compatibility guarantee
health guarantee
career / wealth / outcome guarantee
name-change recommendation
event prediction certainty
deterministic fate / destiny claims
medical / legal / financial / immigration advice
"your soulmate is..."
"move to / leave / buy property in..."
"your best city is..."
```

---

## 7. Fallback chain (summary)

See `MODULE_FALLBACK_POLICY_v1.md` for full detail.

```text
Missing birth time     → drop houses / Asc / MC / IC / DSC; continue with planets + signs + numerology
Missing full name      → drop Expression/Soul Urge; continue with LP + Birthday
Missing BaZi payload   → skip BaZi section; no hallucination
Missing partner data   → personal relationship pattern only; no synastry
Missing target location → no PLACE city content; soft environmental archetype allowed in CORE
Provider field absent  → skip that signal; do not invent it
Gated layer not unlocked → suppress; do not generate
```

---

## 8. Module module dependencies

```text
All modules depend on: natal planetary data + numerology baseline
LOVE additionally needs:  Venus, Mars, Moon, 5H/7H/8H (conditional), relational pattern rules
MONEY additionally needs: 2H/8H/10H (conditional), Jupiter/Saturn/Venus/Mars/Pluto
BODY additionally needs:  Moon/Mars/Saturn/6H/12H (conditional), element balance
YEAR additionally needs:  Personal Year (required), transits/solar return (optional)
STYLE additionally needs: Venus, Moon, Asc (conditional), gated color/stone dict
PLACE additionally needs: exact birth time, birthplace, target location, MAP0 cleared
```

🔒 docs-only planning matrix · not active in runtime · MOD-SUFF0 · requires MAP0/MAP1/runtime approval
