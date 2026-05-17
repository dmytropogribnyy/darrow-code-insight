# Numerology — Internal Reference

Persistent project reference. Treat as canonical for future maintenance.

Numerology in Darrow Code is **100% internal and deterministic**. No external
APIs, no web search, no name-origin / gender / nationality / ethnicity / cultural
inference. The output is a compact data layer that feeds the Darrow Code
synthesis engine — it is **never** a customer-facing standalone "Numerology Report".

## Inputs

- `date_of_birth` (always present from checkout intake)
- `full_name_for_numerology` (OPTIONAL — collected only when the customer opts in)

If `full_name_for_numerology` is absent:
- Compute only: Life Path, Birth Day Number, Personal Year.
- `name_numerology.available = false`, `reason = "full_name_not_provided"`.
- Do NOT claim Expression / Soul Urge / Personality / Maturity / Hidden Passion / Karmic Lessons.

If `full_name_for_numerology` is present but yields fewer than 2 valid Latin letters
after normalization:
- `name_numerology.available = false`, `reason = "insufficient_latin_letters"`.

Numerology never blocks checkout. It is optional enrichment only.

## Pythagorean letter map

```
1 : A J S
2 : B K T
3 : C L U
4 : D M V
5 : E N W
6 : F O X
7 : G P Y
8 : H Q Z
9 : I R
```

## Name normalization

1. Unicode NFKD normalize, strip combining marks (removes Latin diacritics).
2. Uppercase.
3. Remove spaces, hyphens, apostrophes, dots, and any non `A-Z` character.
4. Keep only `A-Z` letters.

Do not infer pronunciation, ethnicity, language family, or gender from the name.
Do not transliterate non-Latin scripts. Do not call any external service.

## Vowel / Y policy

- Vowels: **A, E, I, O, U**
- Y is treated as a **consonant by default**.
- Record `y_policy: "consonant_by_default"` in the normalized output for transparency.

## Reduction rules

`reduceNumber(n, { keepMasterNumbers })`:

- Reduce by digit-sum until 1–9.
- When `keepMasterNumbers = true`: preserve **11, 22, 33** only.
- Do NOT preserve arbitrary double numbers like 44, 55, 66.

## Number definitions

| Number | Formula | keepMasterNumbers |
|---|---|---|
| Life Path | Digit sum of `YYYYMMDD` | true |
| Birth Day Number | Reduce the day component | true |
| Personal Year | Digit sum of (birth month + birth day + current year), reduced to 1–9. Also record `personal_year_master_marker` if the intermediate is 11/22/33. | final stays 1–9 |
| Expression | Sum of all mapped letters of normalized name | true |
| Soul Urge | Sum of vowels only | true |
| Personality | Sum of consonants only | true |
| Maturity | Expression + Life Path | true |
| Hidden Passion | Letter value(s) with the highest frequency (tie → array) | n/a |
| Karmic Lessons | Letter values in 1–9 missing from the frequency map | n/a |

## Meaning layer

Backend stores concise meaning labels only in `numerology-meanings.ts`:

```ts
{ core: string, shadow: string, protocol_hint: string }
```

Language must be Darrow Code:
- structure, mechanism, operating pattern, pressure point, protocol,
  configuration, signal, rhythm.

Forbidden language:
- destiny, fate, soul mission, lucky number, vibration, healing, protection,
  attraction, mystical claims, "your name means you are…", identity labels
  like "healer".

Meanings exist for 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33.

Claude does the interpretation — backend never emits long canned essays.

## Normalized JSON shape

```ts
numerology: {
  available: true,
  life_path: number,
  birth_day_number: number,
  personal_year: number,
  personal_year_master_marker?: number | null,

  name_numerology: {
    available: boolean,
    reason?: string,
    source_name_present: boolean,
    normalized_name?: string,
    name_letters_used?: number,
    y_policy?: "consonant_by_default",
    name_normalization_warning?: string | null,

    expression?: number,
    soul_urge?: number,
    personality?: number,
    maturity?: number,
    hidden_passion_numbers?: number[],
    karmic_lessons?: number[],

    meanings?: {
      expression?: { core: string, shadow: string, protocol_hint: string },
      soul_urge?: { core: string, shadow: string, protocol_hint: string },
      personality?: { core: string, shadow: string, protocol_hint: string },
      maturity?: { core: string, shadow: string, protocol_hint: string },
    }
  }
}
```

## Module usage routing

| Module | Numerology contribution |
|---|---|
| CORE  | Life Path + Birth Day always. Expression/Soul Urge/Personality only when `full_name_for_numerology` exists AND they converge with the main astrology + BaZi pattern. **Never a separate "Name Numerology" section.** |
| LOVE  | Name numerology only if it reinforces the relationship pattern (Venus/Mars/Moon/5H/7H/Descendant). Never a compatibility claim from numerology alone. |
| MONEY | Life Path, Expression, Maturity may support income mechanism + value structure alongside 2H/6H/8H/10H, Jupiter, Saturn, Venus, Pluto. |
| BODY  | Numerology generally not used. |
| YEAR  | Personal Year supports the annual theme alongside slow transits and Solar Return. Never overrides them. |
| STYLE | Expression / Soul Urge may add aesthetic nuance when relevant — visual-resonance language only. |
| PLACE | Numerology not used. |

## Hard rules

- Never call external numerology / name-origin / gender / nationality /
  ethnicity APIs at any point in the pipeline.
- Never use web search at runtime.
- Never emit a standalone generic "Numerology Report" section to the customer.
- Every numerology claim in the customer-facing report must cite the exact
  number, and should usually appear in `proof_tags` rather than in a long
  explanatory block.
- Numerology is **source material**, not report content.
