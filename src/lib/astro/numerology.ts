// Pure Pythagorean numerology helpers.

const LETTER_VALUES: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function reduce(n: number): number {
  // Keep master numbers 11, 22, 33.
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split("").reduce((s, d) => s + Number(d), 0);
  }
  return n;
}

function sumDigits(s: string): number {
  return s.split("").filter((c) => /\d/.test(c)).reduce((a, c) => a + Number(c), 0);
}

export function lifePath(dob: string): number {
  // dob YYYY-MM-DD
  return reduce(sumDigits(dob));
}

export function birthDay(dob: string): number {
  const day = Number(dob.slice(8, 10));
  return reduce(day);
}

export function personalYear(dob: string, year = new Date().getUTCFullYear()): number {
  const md = dob.slice(5); // MM-DD
  return reduce(sumDigits(md) + sumDigits(String(year)));
}

function nameNumber(name: string, filter: (ch: string) => boolean): number | null {
  const letters = name.toLowerCase().split("").filter((c) => /[a-z]/.test(c) && filter(c));
  if (letters.length === 0) return null;
  const total = letters.reduce((s, c) => s + (LETTER_VALUES[c] ?? 0), 0);
  return reduce(total);
}

export function expressionNumber(name: string): number | null {
  return nameNumber(name, () => true);
}

export function soulUrgeNumber(name: string): number | null {
  return nameNumber(name, (c) => VOWELS.has(c));
}

export function personalityNumber(name: string): number | null {
  return nameNumber(name, (c) => !VOWELS.has(c));
}
