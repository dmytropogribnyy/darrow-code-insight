# Per-Module Content & Material Contracts

**Phase:** MODULE-PATTERN-1 (docs/contract only) · **Updated:** 2026-06-06

The content + material contract for every report module. **Docs only** — this defines *what
the AI may use, what it must avoid, how the report is structured, and how it degrades* when data
is missing. It does **not** change production prompts, schema, or the pipeline. Implementation is
a later phase (MODULE-PROMPT-1).

**Foundation:** the provider/raw-data layer is **verified** (DATA-AUDIT-1, 2026-06-06 — see
[`data-source-map-by-module.md`](data-source-map-by-module.md)). The remaining work is the
interpretive/material contract layer captured here.

> CORE already has the strongest contract (v4.1, staged). It is the **reference**; this phase
> brings LOVE / MONEY / BODY / YEAR / STYLE / PLACE to a comparable contract level. Production
> CORE is still **v3**.

---

## 1 · Global Darrow report rules (all modules inherit)

### 1.1 Voice
Direct · premium · psychologically sharp · coaching-oriented · pattern-based · human-readable.
**Not** a generic horoscope, **not** timid. Recognition-first: the reader should feel *seen*
before they feel *explained*. Lead with lived experience; technical data confirms quietly after.

### 1.2 Safety (hard)
No medical diagnosis · no therapy claims · no legal advice · no financial/investment advice ·
no guaranteed predictions · no guaranteed relationship/financial/health outcomes · no
deterministic commands ("quit your job", "leave your partner", "invest now") · no fear-based
manipulation.

### 1.3 Data integrity (hard)
- No invented anchors — every proof tag cites a real data point in `DarrowChartData`.
- No houses/angles/ASC/MC/IC/Descendant when `birth_time_known=false`.
- No BaZi (Day Master / Four Pillars / stems / branches / Ten Gods / luck cycles) when
  `bazi.available=false` (incl. missing `bazi_sex`).
- No name numerology (Expression / Soul Urge / Personality) when the full name is missing.
- No colors / stones / Japanese astrology / astrocartography / compatibility unless a verified
  source is implemented + approved (see §7).
- No unsupported public/report claims.

### 1.4 Material use (current reality)
- **Raw provider data is verified** and reliable (natal, houses [birth-time], aspects, BaZi,
  transits, solar return, moon phase, BaZi flow).
- **Interpretive dictionaries are limited:** only **numerology** has a coded meaning dictionary
  (`numerology-meanings.ts`). All other interpretation is **AI + prompt rules** until approved
  dictionaries exist.
- **Colors / stones remain `do_not_claim`** unless a verified dictionary is approved.

---

## 2 · Per-module contract template

Every module section below uses the same 17 fields:
**(1)** purpose · **(2)** customer promise · **(3)** primary user questions · **(4)** required
raw data · **(5)** optional/enrichment · **(6)** forbidden data/claims · **(7)** fallback ·
**(8)** allowed proof anchors · **(9)** forbidden proof anchors · **(10)** report structure ·
**(11)** length/density · **(12)** tone/coaching style · **(13)** safety boundaries ·
**(14)** renderer/layout · **(15)** future schema/prompt implications · **(16)** acceptance
criteria · **(17)** open risks.

> Proposed length targets are **contract proposals** to be calibrated in MODULE-DIAG-1. Focused
> chapters are intentionally smaller than CORE (CORE v4.1 ≈ 4,350–5,250 words).

---

## 3 · CORE (reference — do not redefine)

CORE is governed by the existing **v4.1 contract** (staged): see
[`core-v4.1-readiness-status.md`](core-v4.1-readiness-status.md), `DARROW_CORE_MASTER_PATTERN_v4_1.md`,
and `coreV4Instructions()` in `src/lib/ai/user-prompt.ts` (17 body sections, locked
executive-summary blocks + closing pillars, scenario-first, proof tags ≤5). **Production = v3.**

**Shared rules add-ons inherit from CORE:** scenario-first openings; proof tags at section end,
real data only; per-section structured fields `{ opening_line?, scenario?, prose, key_insight?,
protocols?, warning_signals?, proof_tags? }`; data-availability gating (§1.3); safety (§1.2);
no cross-sell inside the body; symbolic identity woven, never a bare list; colors/stones gated.

---

## 4 · LOVE

1. **Purpose:** the client's relational operating system — how they attach, attract, need, and
   collide in intimacy.
2. **Customer promise:** "Understand your love pattern — why you connect and clash the way you do."
3. **Primary questions:** What's my attachment/attraction pattern? What do I actually need
   emotionally? Where do I sabotage intimacy? What's my conflict loop? What shifts it?
4. **Required raw data:** natal **Venus, Mars, Moon** + relationship-relevant aspects.
5. **Optional/enrichment:** **5H / 7H / Descendant** (only with birth time); name numerology
   *only* if it reinforces the relational pattern; BaZi element flavor if available.
6. **Forbidden:** synastry/compatibility (no partner data + no dedicated contract); guaranteed
   love outcomes; "you will meet…" predictions; houses/Descendant without birth time.
7. **Fallback (no birth time):** Venus/Mars/Moon + aspects only; no house/Descendant language.
8. **Allowed proof anchors:** Venus/Mars/Moon sign + aspect; 5H/7H/Desc (birth time only);
   relevant Personal Year timing.
9. **Forbidden anchors:** any house/angle without birth time; BaZi when unavailable; name-derived
   numbers without full name; partner/synastry anchors.
10. **Structure:** attraction pattern → emotional needs → intimacy/closeness style → conflict
    loop → relational blind spot → 2–3 practical protocols.
11. **Length:** ~1,400–1,900 words.
12. **Tone:** warm, candid, non-judgmental coach; name the loop without blame.
13. **Safety:** no relationship guarantees; no "leave/stay" directives; no diagnosis of a partner.
14. **Renderer:** reuse focused-chapter layout; protocol callouts; proof-tag line per section.
15. **Future:** dedicated LOVE schema mirroring CORE's per-section shape; synastry is a separate
    future product (needs partner intake + contract).
16. **Acceptance:** gating holds (no Desc without birth time); ≥1 protocol; no compatibility
    claims; proof tags all real.
17. **Open risks:** relational advice tone drifting toward therapy; over-claiming from sparse aspects.

---

## 5 · MONEY

1. **Purpose:** the client's earning, value, and money-decision pattern (not financial advice).
2. **Customer promise:** "See how you earn, spend, and decide — and where money friction repeats."
3. **Primary questions:** What's my earning style? Where's my money friction? My risk/decision
   pattern? How do I create value? What discipline fits me?
4. **Required raw data:** natal **Jupiter, Saturn, Venus, Mars, Pluto** + relevant aspects.
5. **Optional/enrichment:** **2H / 6H / 8H / 10H** (birth time only); Life Path support; BaZi
   `professional` favorable/unfavorable elements + structure (only `bazi.available=true`).
6. **Forbidden:** income promises, investment advice, "buy/sell/invest" instructions, wealth
   guarantees; houses without birth time; BaZi when unavailable.
7. **Fallback (no birth time):** planet-only money read (Jupiter/Saturn/Venus/Mars/Pluto).
8. **Allowed proof anchors:** money-planet sign + aspect; 2/6/8/10H (birth time); BaZi favorable
   elements (when available); Life Path.
9. **Forbidden anchors:** houses without birth time; BaZi when unavailable; specific prices/returns.
10. **Structure:** earning pattern → value/work style → money friction → risk & decision pattern
    → discipline/structure → 2–3 practical money/work protocols.
11. **Length:** ~1,400–1,900 words.
12. **Tone:** pragmatic, grounded operator's coach.
13. **Safety:** explicitly **not** financial advice; no guarantees; no investment instruction.
14. **Renderer:** focused-chapter layout; protocol callouts.
15. **Future:** MONEY schema; optional BaZi-professional surfacing once meanings are contracted.
16. **Acceptance:** no financial-advice/guarantee phrasing; gating holds; proof tags real.
17. **Open risks:** sliding into investment-sounding language; BaZi element over-use.

---

## 6 · BODY

1. **Purpose:** body-awareness, stress response, and recovery rhythm — **non-medical**.
2. **Customer promise:** "Understand your energy, stress signals, and recovery rhythm."
3. **Primary questions:** How does my system carry stress? Where do I leak energy? My overload
   signals? What recovery rhythm fits me?
4. **Required raw data:** natal **Moon, Mars, Saturn**.
5. **Optional/enrichment:** **6H** (birth time only); element balance; BaZi element imbalance
   (only `bazi.available=true`); **moon phase as a soft rhythm note only**.
6. **Forbidden:** medical diagnosis, disease/condition claims, treatment/medication advice,
   symptom interpretation; houses without birth time; BaZi when unavailable.
7. **Fallback (no birth time):** Moon/Mars/Saturn "your system may respond to…" language only.
8. **Allowed proof anchors:** Moon/Mars/Saturn sign + aspect; 6H (birth time); element balance.
9. **Forbidden anchors:** any clinical/medical framing; houses without birth time; BaZi when off.
10. **Structure:** stress-carrying pattern → energy leakage → overload signals → recovery style →
    2–3 practical **non-medical** routines.
11. **Length:** ~1,300–1,800 words.
12. **Tone:** calm, somatic-aware coach; "energy", "stress response", "recovery", "nervous-system
    style" used carefully, never clinically.
13. **Safety (strict):** the template injects the verbatim medical disclaimer (as in CORE
    vitality); no diagnosis, no treatment, no disease naming.
14. **Renderer:** focused-chapter layout + injected medical disclaimer block.
15. **Future:** BODY schema; moon-phase rhythm contract.
16. **Acceptance:** zero medical/diagnostic language; disclaimer present; gating holds.
17. **Open risks:** wellness language drifting clinical; moon-phase over-claiming.

---

## 7 · YEAR

1. **Purpose:** the current annual theme, timing pressure, and decision rhythm.
2. **Customer promise:** "Know what this year is really asking of you — and when."
3. **Primary questions:** What's this year's theme? When are the pressure/opportunity windows?
   What should I time differently? What's the monthly/seasonal focus?
4. **Required raw data:** **Personal Year** (always; must equal computed `numerology.personal_year`).
5. **Optional/enrichment:** **transits** + **solar return** (primary when available — both
   verified rich); **BaZi Flow** annual/monthly (only when available).
6. **Forbidden:** guaranteed predictions, specific dated event claims, "this will happen".
7. **Fallback:** if transits **and** solar return unavailable → Personal Year theme only (+ BaZi
   flow if available). If solar return only is missing → transits + Personal Year.
8. **Allowed proof anchors:** Personal Year number; slow-transit aspect; solar-return angle/aspect;
   BaZi Flow annual/monthly pillar (when available).
9. **Forbidden anchors:** Personal Year ≠ computed value; invented dated predictions.
10. **Structure:** yearly theme → pressure windows → opportunity windows → monthly/seasonal focus
    → decision rhythm → 2–3 practical timing protocols.
11. **Length:** ~1,500–2,000 words.
12. **Tone:** strategic timing coach; windows and rhythm, not fortune-telling.
13. **Safety:** no guaranteed predictions; framing as *theme/window/tendency*, not certainty.
14. **Renderer:** focused-chapter layout; optional timeline/▢ window callouts.
15. **Future:** YEAR schema; transit/solar-return surfacing contract; BaZi-flow timing contract.
16. **Acceptance:** Personal Year matches computed value (ANCHOR-AUDIT-1); no guarantees; graceful
    degradation when transits/solar return absent.
17. **Open risks:** prediction-sounding phrasing; transit overload (42–49 aspects available — must
    curate to the high-priority slow movers).

---

## 8 · STYLE

1. **Purpose:** aesthetic identity and self-presentation as self-recognition (not superstition).
2. **Customer promise:** "Discover your aesthetic signature — how you show up and what feels like you."
3. **Primary questions:** What's my aesthetic identity? My material/texture preference? How do I
   want to be seen? What presentation feels authentic vs forced?
4. **Required raw data:** natal **Venus, Moon, Sun**.
5. **Optional/enrichment:** **Ascendant** (birth time only); element balance; BaZi element balance
   (only when available).
6. **Forbidden:** **colors/stones as luck/healing/protection/attraction** (gated — see §10);
   magical claims; Ascendant without birth time.
7. **Fallback (no birth time):** Venus/Moon/Sun visual-resonance language only; no ASC.
8. **Allowed proof anchors:** Venus/Moon/Sun sign + aspect; Ascendant (birth time); element balance.
9. **Forbidden anchors:** specific color/stone correspondences (until approved); ASC without birth
   time; luck/protection framing.
10. **Structure:** aesthetic identity → visibility/how-you're-seen → texture/material preference →
    presentation pattern → 2–3 practical style protocols.
11. **Length:** ~1,200–1,700 words.
12. **Tone:** tasteful stylist-coach; style as self-recognition, never superstition.
13. **Safety:** no magical/luck/protection claims; colors/stones gated.
14. **Renderer:** focused-chapter layout; **no** color-swatch/stone modules until approved.
15. **Future:** if a verified COLORS/STONES dictionary is approved, add a gated enrichment block.
16. **Acceptance:** zero luck/healing/protection language; no specific color/stone correspondences;
    gating holds.
17. **Open risks:** drifting into colors/stones; ASC leaking without birth time.

---

## 9 · PLACE

1. **Purpose:** environment fit — what spaces regulate vs drain the person (not astrocartography).
2. **Customer promise:** "Understand the environments and rhythms that support or drain you."
3. **Primary questions:** What environments regulate me? What drains me? What home/workspace fits?
   How should I think about relocation (reflectively, not predictively)?
4. **Required raw data:** natal **Moon**; **IC / 4H / angular factors** (birth time only).
5. **Optional/enrichment:** BaZi favorable environmental elements (only when available).
6. **Forbidden:** **astrocartography**, **specific city/country recommendations**, "move to X";
   houses/IC without birth time; BaZi when unavailable.
7. **Fallback (no birth time):** Moon-only environment qualities; no IC/4H/angular language.
8. **Allowed proof anchors:** Moon sign + aspect; IC/4H/angular planet (birth time); BaZi favorable
   element (when available).
9. **Forbidden anchors:** any city/lat-long/relocation-line anchor; houses without birth time.
10. **Structure:** environment pattern → what regulates you → what drains you → home/workspace fit
    → relocation **reflection** → 2–3 practical environment protocols.
11. **Length:** ~1,200–1,700 words.
12. **Tone:** grounded place-coach; qualities of space, not map coordinates.
13. **Safety:** no city prediction; relocation framed as self-reflection, not instruction.
14. **Renderer:** focused-chapter layout; **no** map/astrocartography module.
15. **Future:** astrocartography is a separate product needing a verified source + contract.
16. **Acceptance:** zero specific-city claims; gating holds; relocation framed reflectively.
17. **Open risks:** implying astrocartography; naming places; IC leaking without birth time.

---

## 10 · Cross-module data matrix

Values: **P**=primary · **S**=supporting · **G**=gated (birth-time/availability) · **F**=forbidden ·
**Fut**=future only · **—**=not used.

| Data layer | CORE | LOVE | MONEY | BODY | YEAR | STYLE | PLACE |
|---|---|---|---|---|---|---|---|
| natal planets/aspects | P | P | P | P | S | P | S |
| houses / angles (birth-time) | G | G | G | G | S/G | G | G |
| numerology (date-derived) | P | S | S | — | P | — | — |
| name numerology | G | G | G | — | — | — | — |
| BaZi | G | F | G | G | G | G | G |
| transits | — | — | — | — | P/G | — | — |
| solar return | — | — | — | — | P/G | — | — |
| moon phase | — | — | — | S/G | — | — | — |
| bazi_flow | — | — | — | — | S/G | — | — |
| colors / stones | G | — | — | — | — | G | — |
| Japanese astrology | F | F | F | F | F | F | F |
| astrocartography | F | — | — | — | — | — | F |
| compatibility / synastry | F | F(Fut) | — | — | — | — | — |

---

## 11 · Do-not-claim registry (reports + public copy)

Until implemented **and** verified **and** approved, the following must **not** appear in reports
or marketing copy:

- Japanese astrology (no source — `not_implemented`)
- Astrocartography / specific city recommendation (`not_implemented`)
- Compatibility / synastry (`not_implemented`; no partner intake/contract)
- Colors / stones / crystals as luck / healing / protection / attraction (`do_not_claim`, gated)
- Medical diagnosis / treatment / disease claims (`do_not_claim`)
- Financial guarantees / investment instruction (`do_not_claim`)
- Relationship outcome guarantees (`do_not_claim`)
- Guaranteed predictions / dated event claims (`do_not_claim`)
- Professional legal / financial / medical advice (`do_not_claim`)

**Colors/stones status:** remain **gated / `do_not_claim`** — *not approved*. A verified
COLORS/STONES dictionary + explicit approval is required before STYLE (or CORE) may surface them.

**Japanese astrology / astrocartography / compatibility:** remain **not implemented** — no
provider, no dictionary, no contract.

---

## 12 · Implementation phases after MODULE-PATTERN-1

1. **MODULE-PROMPT-1** — convert these contracts into staged prompts/schemas for the add-ons
   (mirroring CORE v4.1's per-section structured fields). Staged, not production.
2. **MODULE-DIAG-1** — real generation + visual PDF QA for each add-on; calibrate length/tone.
3. **ANCHOR-AUDIT-1** — per-module data/proof validation (extend B5.3-A anchors to every module).
4. **BUNDLE-B/C** — separate PDFs per module + multi-link delivery (parallel **P0** delivery blocker).
5. **CORE-V4-PROD-SWITCH** — separate, after CORE v4.1 diagnostics/content/layout pass.

---

## Cross-links

[`data-source-map-by-module.md`](data-source-map-by-module.md) ·
[`material-assembly-readiness.md`](material-assembly-readiness.md) ·
[`launch-readiness-map.md`](launch-readiness-map.md) ·
[`core-v4.1-readiness-status.md`](core-v4.1-readiness-status.md) ·
[`bundle-separate-reports-plan.md`](bundle-separate-reports-plan.md)
