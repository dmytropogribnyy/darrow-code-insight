// PLACE-GEO v1 — generation prompt: locked skeleton, real cities only, score→language rules.

import type { PlaceGeoContext } from "./place-geo-context";
import { PLACE_GEO_SECTION_KEYS, PLACE_GEO_TARGET_WORDS } from "./place-geo-config";

function packetJson(ctx: PlaceGeoContext): string {
  // Cleaned subset — never the raw API responses.
  return JSON.stringify(
    {
      birth_city_check: ctx.birthCityCheck,
      passes: ctx.passes.map((p) => ({
        focus: p.focus,
        scope: p.scope,
        meta: p.result?.meta ?? null,
        results: (p.result?.results ?? []).slice(0, 5),
      })),
    },
    null,
    1,
  );
}

export function buildPlaceGeoPrompt(
  ctx: PlaceGeoContext,
  opts: { first_name?: string | null } = {},
): string {
  return [
    `═══════════════════════════════════════════════`,
    `DARROW CODE — PLACE (GEO v1) · Your Geography Decoded`,
    `═══════════════════════════════════════════════`,
    `Customer first name: ${opts.first_name ?? "(not provided)"}`,
    `Target length: ${PLACE_GEO_TARGET_WORDS} prose words total across the sections below.`,
    `HARD CAP: 1,600 words. Exceeding it is a FAILED brief — depth and concreteness, not length.`,
    `Respect the per-section word targets strictly.`,
    ``,
    `VOICE: Warm Architect — structural truth first, warmth second. Private premium reading,`,
    `recognition-first. The reader should feel SEEN, then oriented. Dinner-table test applies.`,
    ``,
    `HARD RULES (any violation = generation failure):`,
    `1. Every recommended place = City, Country + the named line/paran behind it + approximate`,
    `   distance ("~26 km", "about 200 km"). Vague geography ("coastal regions", "Western Europe`,
    `   generally", "you may find challenges in Asia") is FORBIDDEN.`,
    `2. NEVER name a city that is not present in the DATA PACKET below. No exceptions.`,
    `3. NEVER show raw scores as numbers. Translate signal quality into language:`,
    `   match_tier strong → "one of the strongest placements your map can find";`,
    `   moderate/mixed → "a supportive lean, not a landslide";`,
    `   no_strong_matches/weak → "your map doesn't shout here — it whispers" + shift weight to`,
    `   the birth-city read.`,
    `4. Challenging data = "demanding ground / ground with a bill attached" — never doom, never`,
    `   "avoid at all costs", never health/safety/legal predictions tied to a location.`,
    `5. No guarantees (love/money/health/career), no relocation INSTRUCTIONS ("move to X") —`,
    `   orientation + travel-test framing only. No medical/financial/immigration advice.`,
    `6. API 'summary' strings are facts to rephrase in Darrow voice — never copy them verbatim.`,
    `6b. GEOGRAPHIC TEXTURE: when 2+ recommended cities share the same line, present them as a`,
    `   named CORRIDOR/REGION with the cities as anchor points inside it (e.g. "the British Isles`,
    `   carry your Jupiter MC corridor — Dublin ~173 km, Belfast, Glasgow, Edinburgh all sit on`,
    `   it", "eastern Germany is your Venus band — Leipzig sits practically ON the line"). Name`,
    `   islands/coasts/regions when the listed cities sit on them. The cities themselves must`,
    `   still come ONLY from the DATA PACKET — the region naming is framing, not new claims.`,
    `7. Body prose carries NO raw orbs/degrees/percentages and never the word "orb" — that`,
    `   technical detail lives in proof_tags only. Distances ("~26 km") ARE allowed in prose.`,
    ``,
    `STRUCTURE — emit exactly these sections, in order, each as`,
    `{ opening_line?, scenario?, prose, key_insight?, protocols?, warning_signals?, proof_tags? }:`,
    `  1. orientation — "How Place Works in Your Code" (~120w; lines/parans/relocated chart in`,
    `     plain language, no jargon dump)`,
    `  2. where_you_stand — birth-city deep read (~220w; strongest supportive + honest caution,`,
    `     from birth_city_check; verdict: what this ground feeds vs taxes)`,
    `  3. career_ground (~260w; 2 regional + 1–2 global named cities, each with line + distance;`,
    `     one "if you only shortlist one" pick)`,
    `  4. love_ground (~200w; 2–3 named cities, same bar; no relationship guarantees)`,
    `  5. home_ground (~200w; 2–3 named cities; contrast with career_ground if they diverge)`,
    `  6. restoration_places (~120w; 1–2 cities/regions for recovery & rest; non-medical)`,
    `  7. caution_zones (~120w; 2–3 named cities or latitude bands near challenging lines/parans;`,
    `     demanding-ground framing)`,
    `  8. closing_integration — "Working With Your Map" (~100w; travel-test before relocation;`,
    `     a line ≠ destiny; exploratory, directional not deterministic)`,
    ``,
    `proof_tags: 2–5 per section, ONLY from these candidates (technical detail lives here):`,
    ...ctx.allowedProofAnchorCandidates.slice(0, 40).map((a) => `  - ${a}`),
    ``,
    `DATA PACKET (the ONLY source of cities/lines/distances):`,
    packetJson(ctx),
    ``,
    `Emit JSON: { schema_version: "addon_v1", module_code: "PLACE", variant: "geo_v1",`,
    `cover_tagline, sections: { ${PLACE_GEO_SECTION_KEYS.join(", ")} } }.`,
    `Do not add, rename, or reorder sections.`,
  ].join("\n");
}
