// DATA-AUDIT-1 — material assembly readiness (pure, diagnostic-only).
//
// Classifies whether the system can assemble the full material pack for each report:
// deterministic data, derived data, interpretive dictionaries, module packs. Reflects
// the ACTUAL repo: the only coded interpretive dictionary is numerology-meanings.ts;
// everything else (signs/planets/houses/aspects/BaZi/colors/stones/archetypes) is
// AI-from-training guided by prompt rules, or doc-only in docs/knowledge/ (not wired).
// NOT used by production. No network, no AI.

import type { DarrowChartData } from "@/lib/astro/types";
import { summarizeAvailability } from "./availability";
import type { AuditModule } from "./synthetic-cases";

export type MaterialStatus =
  | "implemented_verified" // deterministic + tested in code
  | "implemented_unverified" // code path exists, real provider data not yet verified (DATA-AUDIT-1)
  | "doc_only_planned" // exists only as a docs/knowledge policy file, not wired to code/prompts
  | "not_implemented" // no source at all
  | "do_not_claim"; // must NOT be presented publicly / in reports yet

export interface MaterialCategory {
  key: string;
  label: string;
  status: MaterialStatus;
  source: string;
  note: string;
}

// Governing rules — printed into outputs and enforced by tests.
export const NO_INVENTED_ENRICHMENT_RULE =
  "No invented enrichment: if a material category is not backed by deterministic data, a " +
  "documented + approved knowledge dictionary, or an approved prompt contract, the AI must NOT " +
  "present it as part of the Darrow method.";

export const NO_UNSUPPORTED_PUBLIC_CLAIMS_RULE =
  "No unsupported public claims: public/report copy must NOT imply Darrow Code uses colors, " +
  "stones, Japanese astrology, astrocartography, compatibility, or medical/financial/guaranteed " +
  "prediction layers unless that material source is implemented, verified, and approved.";

// High-risk + core enrichment categories, classified against the real repo.
export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  {
    key: "natal",
    label: "Natal placements/aspects",
    status: "implemented_unverified",
    source: "FreeAstroAPI /natal (provider)",
    note: "Critical endpoint; real field reliability pending DATA-AUDIT-1.",
  },
  {
    key: "houses_angles",
    label: "Houses / ASC / MC / IC",
    status: "implemented_unverified",
    source: "FreeAstroAPI /natal (birth-time gated)",
    note: "Only when birth_time_known; absent otherwise.",
  },
  {
    key: "numerology_date",
    label: "Life Path / Birth Day / Personal Year",
    status: "implemented_verified",
    source: "src/lib/numerology/numerology.ts",
    note: "Internal deterministic; always available.",
  },
  {
    key: "name_numerology",
    label: "Name numerology + meanings",
    status: "implemented_verified",
    source: "numerology.ts + numerology-meanings.ts",
    note: "Only when full name present; the ONLY coded interpretive dictionary.",
  },
  {
    key: "bazi",
    label: "BaZi / Chinese astrology",
    status: "implemented_unverified",
    source: "FreeAstroAPI /chinese/bazi",
    note: "Needs bazi_sex; structured data only, meanings not coded.",
  },
  {
    key: "bazi_flow",
    label: "BaZi Flow (annual/monthly timing)",
    status: "implemented_unverified",
    source: "FreeAstroAPI /chinese/bazi/flow",
    note: "Needs bazi_sex; may return usable=false.",
  },
  {
    key: "transits",
    label: "Transits",
    status: "implemented_unverified",
    source: "FreeAstroAPI /transits",
    note: "Graceful; YEAR primary; density unverified.",
  },
  {
    key: "solar_return",
    label: "Solar Return",
    status: "implemented_unverified",
    source: "FreeAstroAPI /western/solar",
    note: "Graceful; YEAR primary.",
  },
  {
    key: "moon_phase",
    label: "Moon Phase",
    status: "implemented_unverified",
    source: "FreeAstroAPI /moon/phase",
    note: "Graceful enrichment; soft rhythm note.",
  },
  {
    key: "location_tz",
    label: "Location / timezone / geocoding",
    status: "implemented_unverified",
    source: "intake geocoding + provider tz",
    note: "Stability across hemispheres unverified.",
  },
  {
    key: "sign_planet_house_meanings",
    label: "Sign / planet / house / aspect meanings",
    status: "doc_only_planned",
    source: "docs/knowledge/ASTRO_INTERPRETATION_RULES_v1.md",
    note: "Doc-only policy; NOT wired — AI generates from training + prompt rules.",
  },
  {
    key: "bazi_meanings",
    label: "Day Master / Five Elements / Ten Gods meanings",
    status: "doc_only_planned",
    source: "docs/knowledge/BAZI_INTERPRETATION_RULES_v1.md",
    note: "Doc-only; not a coded dictionary.",
  },
  {
    key: "archetypes",
    label: "Module archetypes / coaching patterns",
    status: "doc_only_planned",
    source: "docs/knowledge/ARCHETYPE_LIBRARY_v1.md",
    note: "Doc-only; not wired to prompts deterministically.",
  },
  {
    key: "colors",
    label: "Color associations",
    status: "do_not_claim",
    source: "docs/knowledge/COLORS_STONES_SYMBOLIC_ALLIES_v1.md",
    note: "Doc-only + GATED OFF in v4 prompt ('dictionary not yet approved').",
  },
  {
    key: "stones",
    label: "Stone / crystal associations",
    status: "do_not_claim",
    source: "docs/knowledge/COLORS_STONES_SYMBOLIC_ALLIES_v1.md",
    note: "Doc-only + gated off; must not be claimed.",
  },
  {
    key: "japanese_astrology",
    label: "Japanese astrology layer",
    status: "not_implemented",
    source: "(none)",
    note: "No provider, no dictionary, not in prompts — do not claim.",
  },
  {
    key: "astrocartography",
    label: "Astrocartography / city guidance",
    status: "not_implemented",
    source: "(none)",
    note: "Explicitly NOT implemented; PLACE must never name cities.",
  },
  {
    key: "compatibility",
    label: "Compatibility / synastry",
    status: "not_implemented",
    source: "(none)",
    note: "No synastry in MVP; no compatibility from name numerology alone.",
  },
  {
    key: "medical_health",
    label: "Medical / health diagnosis",
    status: "do_not_claim",
    source: "(safety)",
    note: "BODY uses 'your system may respond to…' only; no medical claims.",
  },
];

export interface ModulePack {
  module: AuditModule;
  requiredRaw: string[];
  requiredDerived: string[];
  requiredDictionaries: string[];
  optional: string[];
  forbidden: string[];
  fallback: string;
  status: MaterialStatus;
}

const DICT = "interpretation generated by AI + prompt rules (no coded dictionary)";

export const MODULE_PACKS: ModulePack[] = [
  {
    module: "CORE",
    requiredRaw: ["natal", "bazi (if available)"],
    requiredDerived: ["life_path", "personal_year"],
    requiredDictionaries: [DICT, "numerology-meanings (coded)"],
    optional: ["name numerology", "houses/angles"],
    forbidden: ["BaZi if unavailable", "houses if no birth time", "name num if no name"],
    fallback: "natal + date numerology when BaZi/houses absent",
    status: "implemented_unverified",
  },
  {
    module: "LOVE",
    requiredRaw: ["natal Venus/Mars/Moon", "5H/7H/Desc (birth time)"],
    requiredDerived: [],
    requiredDictionaries: [DICT],
    optional: ["name numerology (reinforce only)"],
    forbidden: ["synastry/compatibility", "houses if no birth time"],
    fallback: "Venus/Mars/Moon only without birth time",
    status: "implemented_unverified",
  },
  {
    module: "MONEY",
    requiredRaw: ["natal Jupiter/Saturn/Venus/Pluto", "2/6/8/10H (birth time)"],
    requiredDerived: ["life_path"],
    requiredDictionaries: [DICT],
    optional: ["BaZi favorable/unfavorable elements"],
    forbidden: ["income guarantees", "houses if no birth time", "BaZi if unavailable"],
    fallback: "planet-only money read",
    status: "implemented_unverified",
  },
  {
    module: "BODY",
    requiredRaw: ["natal Moon/Mars/Saturn", "6H (birth time)"],
    requiredDerived: [],
    requiredDictionaries: [DICT],
    optional: ["BaZi element imbalance", "moon phase"],
    forbidden: ["medical claims", "houses if no birth time"],
    fallback: "'your system may respond to…' planet-only",
    status: "implemented_unverified",
  },
  {
    module: "YEAR",
    requiredRaw: ["transits", "solar_return"],
    requiredDerived: ["personal_year"],
    requiredDictionaries: [DICT],
    optional: ["bazi_flow"],
    forbidden: ["guaranteed predictions"],
    fallback: "Personal Year only when transits + solar return unavailable",
    status: "implemented_unverified",
  },
  {
    module: "STYLE",
    requiredRaw: ["natal Venus/Ascendant/Moon"],
    requiredDerived: [],
    requiredDictionaries: [DICT],
    optional: ["BaZi element balance"],
    forbidden: ["colors/stones (gated)", "healing/luck/protection claims", "ASC if no birth time"],
    fallback: "Venus/Moon visual-resonance language only",
    status: "implemented_unverified",
  },
  {
    module: "PLACE",
    requiredRaw: ["natal Moon/IC/4H/angular (birth time)"],
    requiredDerived: [],
    requiredDictionaries: [DICT],
    optional: ["BaZi favorable elements"],
    forbidden: ["astrocartography / city names", "houses if no birth time"],
    fallback: "Moon-only environment qualities",
    status: "implemented_unverified",
  },
];

// Diagnostic-only context packet for a module (NOT wired into production generation).
export interface MaterialContext {
  module: AuditModule;
  availability: ReturnType<typeof summarizeAvailability>;
  allowedFields: string[];
  forbiddenFields: string[];
  dictionaries: string[];
  fallbackRule: string;
  safetyGuardrails: string[];
  forbiddenClaims: string[];
  rules: string[];
}

export function buildMaterialContextForModule(
  module: AuditModule,
  chart: Partial<DarrowChartData>,
): MaterialContext {
  const a = summarizeAvailability(chart);
  const pack = MODULE_PACKS.find((p) => p.module === module)!;
  const forbidden = [...pack.forbidden];
  if (a.natal.houses_count === 0 && !a.natal.ascendant)
    forbidden.push("houses/angles (not in chart)");
  if (!a.bazi.available) forbidden.push("BaZi (not available)");
  if (!a.numerology.name_numerology_available) forbidden.push("name numerology (no full name)");
  return {
    module,
    availability: a,
    allowedFields: [...pack.requiredRaw, ...pack.requiredDerived, ...pack.optional],
    forbiddenFields: forbidden,
    dictionaries: pack.requiredDictionaries,
    fallbackRule: pack.fallback,
    safetyGuardrails: [NO_INVENTED_ENRICHMENT_RULE, NO_UNSUPPORTED_PUBLIC_CLAIMS_RULE],
    forbiddenClaims: MATERIAL_CATEGORIES.filter(
      (c) => c.status === "do_not_claim" || c.status === "not_implemented",
    ).map((c) => c.label),
    rules: [NO_INVENTED_ENRICHMENT_RULE, NO_UNSUPPORTED_PUBLIC_CLAIMS_RULE],
  };
}
