// PLACE-GEO v1 — content acceptance gate (beyond shared forbidden/density scans).
// Validates the GENERATED payload: enough real cities, no raw scores, no vague geography.

export interface PlaceGeoAcceptance {
  cityMentions: number; // distinct packet cities actually named in the text
  rawScoreLeaks: string[]; // bare floats like 151.55 in prose (scores must never surface)
  vaguePhrases: string[]; // banned vague geography
  ok: boolean;
}

const VAGUE_RE =
  /\b(coastal (regions|cities|areas)|western europe generally|southern regions|you may find challenges in (asia|europe|africa|america)s?|regions (that )?resonate)\b/gi;

// Bare decimal floats (e.g. 151.55) — distances are "~26 km" (integers), orbs live in proof_tags.
const RAW_FLOAT_RE = /\b\d+\.\d+\b(?!\s*°)/g;

export function scanPlaceGeoAcceptance(
  proseText: string,
  packetCityNames: string[],
  opts: { minCities?: number } = {},
): PlaceGeoAcceptance {
  const minCities = opts.minCities ?? 6;
  const lower = proseText.toLowerCase();
  const mentioned = new Set<string>();
  for (const c of packetCityNames) {
    if (c && lower.includes(c.toLowerCase())) mentioned.add(c);
  }
  const vaguePhrases: string[] = [];
  let m: RegExpExecArray | null;
  VAGUE_RE.lastIndex = 0;
  while ((m = VAGUE_RE.exec(proseText)) !== null) vaguePhrases.push(m[0]);
  const rawScoreLeaks: string[] = [];
  RAW_FLOAT_RE.lastIndex = 0;
  while ((m = RAW_FLOAT_RE.exec(proseText)) !== null) rawScoreLeaks.push(m[0]);
  return {
    cityMentions: mentioned.size,
    rawScoreLeaks,
    vaguePhrases,
    ok: mentioned.size >= minCities && rawScoreLeaks.length === 0 && vaguePhrases.length === 0,
  };
}
