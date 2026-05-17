// Internal Pythagorean numerology — deterministic, no external APIs.
// See src/lib/numerology/NUMEROLOGY_REFERENCE.md for the canonical rules.

import { NUMEROLOGY_MEANINGS, type NumerologyMeaning } from "./numerology-meanings";

const LETTER_VALUES: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

const VOWELS = new Set(["A", "E", "I", "O", "U"]); // Y = consonant by default

export interface ReduceOptions {
  keepMasterNumbers?: boolean;
}

export function reduceNumber(n: number, opts: ReduceOptions = {}): number {
  const keep = opts.keepMasterNumbers === true;
  let v = Math.abs(Math.trunc(n));
  while (v > 9) {
    if (keep && (v === 11 || v === 22 || v === 33)) return v;
    v = String(v).split("").reduce((s, d) => s + Number(d), 0);
  }
  return v;
}

function sumDigits(s: string): number {
  return s.split("").reduce((sum, ch) => sum + (/\d/.test(ch) ? Number(ch) : 0), 0);
}

// --- date-based numbers -----------------------------------------------------

export function lifePath(dob: string): number {
  // YYYY-MM-DD → digit sum, master numbers preserved
  return reduceNumber(sumDigits(dob), { keepMasterNumbers: true });
}

export function birthDayNumber(dob: string): number {
  const day = Number(dob.slice(8, 10));
  return reduceNumber(day, { keepMasterNumbers: true });
}

export interface PersonalYearResult {
  personal_year: number;
  personal_year_master_marker: number | null;
}

export function personalYear(dob: string, year = new Date().getUTCFullYear()): PersonalYearResult {
  const md = dob.slice(5); // "MM-DD"
  const raw = sumDigits(md) + sumDigits(String(year));
  // Master marker is recorded if intermediate value is 11/22/33,
  // but final personal_year is always reduced to 1-9 for module logic.
  const marker = reduceNumber(raw, { keepMasterNumbers: true });
  const finalPY = reduceNumber(raw, { keepMasterNumbers: false });
  const personal_year_master_marker = marker === 11 || marker === 22 || marker === 33 ? marker : null;
  return { personal_year: finalPY, personal_year_master_marker };
}

// --- name-based numbers -----------------------------------------------------

export interface NormalizedName {
  normalized: string;        // A-Z only, uppercase
  letters_used: number;
  warning: string | null;
}

export function normalizeName(name: string): NormalizedName {
  // 1) NFKD then strip combining marks → removes Latin diacritics
  let s = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  // 2) Uppercase
  s = s.toUpperCase();
  // 3) Keep only A-Z
  const normalized = s.replace(/[^A-Z]/g, "");
  const warning = normalized.length < name.replace(/[^A-Za-z]/g, "").length
    ? "Some characters were not in the Latin A–Z range and were ignored."
    : null;
  return { normalized, letters_used: normalized.length, warning };
}

function letterValues(normalized: string, filter: (ch: string) => boolean): number[] {
  const vals: number[] = [];
  for (const ch of normalized) {
    if (!filter(ch)) continue;
    const v = LETTER_VALUES[ch];
    if (v !== undefined) vals.push(v);
  }
  return vals;
}

function sumOrNull(arr: number[], keepMaster = true): number | null {
  if (arr.length === 0) return null;
  return reduceNumber(arr.reduce((a, b) => a + b, 0), { keepMasterNumbers: keepMaster });
}

export function expressionNumber(normalized: string): number | null {
  return sumOrNull(letterValues(normalized, () => true));
}

export function soulUrgeNumber(normalized: string): number | null {
  return sumOrNull(letterValues(normalized, (c) => VOWELS.has(c)));
}

export function personalityNumber(normalized: string): number | null {
  return sumOrNull(letterValues(normalized, (c) => !VOWELS.has(c)));
}

export function maturityNumber(expression: number | null, life_path: number | null): number | null {
  if (expression == null || life_path == null) return null;
  return reduceNumber(expression + life_path, { keepMasterNumbers: true });
}

function letterFrequency(normalized: string): Record<number, number> {
  const freq: Record<number, number> = {};
  for (const ch of normalized) {
    const v = LETTER_VALUES[ch];
    if (v === undefined) continue;
    freq[v] = (freq[v] ?? 0) + 1;
  }
  return freq;
}

export function hiddenPassionNumbers(normalized: string): number[] {
  const freq = letterFrequency(normalized);
  let max = 0;
  for (const v of Object.values(freq)) if (v > max) max = v;
  if (max === 0) return [];
  return Object.entries(freq)
    .filter(([, count]) => count === max)
    .map(([k]) => Number(k))
    .sort((a, b) => a - b);
}

export function karmicLessons(normalized: string): number[] {
  const freq = letterFrequency(normalized);
  const missing: number[] = [];
  for (let n = 1; n <= 9; n++) if (!freq[n]) missing.push(n);
  return missing;
}

// --- aggregate --------------------------------------------------------------

export interface NameNumerologyResult {
  available: boolean;
  reason?: string;
  source_name_present: boolean;
  normalized_name?: string;
  name_letters_used?: number;
  y_policy?: "consonant_by_default";
  name_normalization_warning?: string | null;
  expression?: number;
  soul_urge?: number;
  personality?: number;
  maturity?: number;
  hidden_passion_numbers?: number[];
  karmic_lessons?: number[];
  meanings?: {
    expression?: NumerologyMeaning;
    soul_urge?: NumerologyMeaning;
    personality?: NumerologyMeaning;
    maturity?: NumerologyMeaning;
  };
}

export interface NumerologyOutput {
  available: true;
  life_path: number;
  birth_day_number: number;
  personal_year: number;
  personal_year_master_marker: number | null;
  name_numerology: NameNumerologyResult;
}

export function computeNumerology(args: {
  date_of_birth: string;
  full_name_for_numerology?: string | null;
  now?: Date;
}): NumerologyOutput {
  const life_path = lifePath(args.date_of_birth);
  const birth_day_number = birthDayNumber(args.date_of_birth);
  const py = personalYear(
    args.date_of_birth,
    (args.now ?? new Date()).getUTCFullYear(),
  );

  const raw = (args.full_name_for_numerology ?? "").trim();
  if (!raw) {
    return {
      available: true,
      life_path,
      birth_day_number,
      personal_year: py.personal_year,
      personal_year_master_marker: py.personal_year_master_marker,
      name_numerology: {
        available: false,
        reason: "full_name_not_provided",
        source_name_present: false,
      },
    };
  }

  const { normalized, letters_used, warning } = normalizeName(raw);
  if (letters_used < 2) {
    return {
      available: true,
      life_path,
      birth_day_number,
      personal_year: py.personal_year,
      personal_year_master_marker: py.personal_year_master_marker,
      name_numerology: {
        available: false,
        reason: "insufficient_latin_letters",
        source_name_present: true,
        normalized_name: normalized,
        name_letters_used: letters_used,
        y_policy: "consonant_by_default",
        name_normalization_warning: warning,
      },
    };
  }

  const expression = expressionNumber(normalized);
  const soul_urge = soulUrgeNumber(normalized);
  const personality = personalityNumber(normalized);
  const maturity = maturityNumber(expression, life_path);
  const hidden = hiddenPassionNumbers(normalized);
  const karmic = karmicLessons(normalized);

  const m = (n: number | null | undefined): NumerologyMeaning | undefined =>
    n != null ? NUMEROLOGY_MEANINGS[n] : undefined;

  return {
    available: true,
    life_path,
    birth_day_number,
    personal_year: py.personal_year,
    personal_year_master_marker: py.personal_year_master_marker,
    name_numerology: {
      available: true,
      source_name_present: true,
      normalized_name: normalized,
      name_letters_used: letters_used,
      y_policy: "consonant_by_default",
      name_normalization_warning: warning,
      expression: expression ?? undefined,
      soul_urge: soul_urge ?? undefined,
      personality: personality ?? undefined,
      maturity: maturity ?? undefined,
      hidden_passion_numbers: hidden,
      karmic_lessons: karmic,
      meanings: {
        expression: m(expression),
        soul_urge: m(soul_urge),
        personality: m(personality),
        maturity: m(maturity),
      },
    },
  };
}
