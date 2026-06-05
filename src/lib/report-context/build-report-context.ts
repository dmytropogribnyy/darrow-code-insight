// MATERIAL-PACK-1 — production per-module material/context builder.
//
// Source of truth: docs/module-content-contracts.md (encoded in MODULE_PACKS) + the verified
// provider layer. Produces a per-module packet that prompts (MODULE-PROMPT-1) consume INSTEAD
// of raw unrestricted chart data — so a module can only use data + anchors the contract allows.
//
// Enforced gating: houses/angles only when birth_time_known; BaZi only when bazi.available;
// name numerology only with full name; YEAR timing only when available; colors/stones excluded;
// Japanese astrology / astrocartography / compatibility not_implemented.
//
// Pure. No AI/Stripe/FreeAstroAPI. Reuses the pure availability + material classification helpers.

import type { DarrowChartData } from "@/lib/astro/types";
import type { ReportModule } from "@/lib/generation/bundle-reports";
import {
  summarizeAvailability,
  type AvailabilitySummary,
} from "@/lib/diagnostics/material-context/availability";
import {
  MODULE_PACKS,
  MATERIAL_CATEGORIES,
  NO_INVENTED_ENRICHMENT_RULE,
  NO_UNSUPPORTED_PUBLIC_CLAIMS_RULE,
} from "@/lib/diagnostics/material-context/material-readiness";

export interface ReportContext {
  module: ReportModule;
  customer: { first_name: string | null };
  birth: { date_of_birth?: string; birth_time_known: boolean; birth_city?: string | null };
  availability: AvailabilitySummary;
  requiredRaw: string[];
  optionalEnrichmentAvailable: string[];
  housesIncluded: boolean;
  baziIncluded: boolean;
  nameNumerologyIncluded: boolean;
  timingIncluded: boolean;
  allowedProofAnchorCandidates: string[];
  forbiddenAnchors: string[];
  forbiddenClaims: string[];
  numerologyMeanings?: unknown;
  missingDataFallback: string;
  rules: string[];
  debug: string;
}

// ── chart readers ───────────────────────────────────────────────
function planetSign(chart: Partial<DarrowChartData>, name: string): string | null {
  const planets = chart.natal?.planets;
  if (Array.isArray(planets)) {
    const p = planets.find((x: any) => String(x?.name).toLowerCase() === name.toLowerCase());
    if (p?.sign) return p.sign;
  }
  if (name.toLowerCase() === "sun" && chart.natal?.sun?.sign) return chart.natal.sun.sign;
  if (name.toLowerCase() === "moon" && chart.natal?.moon?.sign) return chart.natal.moon.sign;
  return null;
}

function placementAnchors(chart: Partial<DarrowChartData>, planets: string[]): string[] {
  const out: string[] = [];
  for (const name of planets) {
    const sign = planetSign(chart, name);
    if (sign) out.push(`${name} in ${sign}`);
  }
  return out;
}

function aspectAnchors(chart: Partial<DarrowChartData>, planets: string[]): string[] {
  const aspects = chart.natal?.aspects;
  if (!Array.isArray(aspects)) return [];
  const set = new Set(planets.map((p) => p.toLowerCase()));
  return aspects
    .filter((a: any) => set.has(String(a?.a).toLowerCase()) && set.has(String(a?.b).toLowerCase()))
    .map((a: any) => `${a.a} ${a.type} ${a.b}`)
    .slice(0, 6);
}

// Key natal planets per module (from module-content-contracts.md).
const MODULE_PLANETS: Record<ReportModule, string[]> = {
  CORE: ["Sun", "Moon", "Mercury", "Venus", "Mars", "Saturn"],
  LOVE: ["Venus", "Mars", "Moon"],
  MONEY: ["Jupiter", "Saturn", "Venus", "Mars", "Pluto"],
  BODY: ["Moon", "Mars", "Saturn"],
  YEAR: [],
  STYLE: ["Venus", "Moon", "Sun"],
  PLACE: ["Moon"],
};

export function buildReportContextForModule(
  module: ReportModule,
  chart: Partial<DarrowChartData>,
  customer: { first_name?: string | null } = {},
): ReportContext {
  const a = summarizeAvailability(chart);
  const pack = MODULE_PACKS.find((p) => p.module === module)!;

  const housesIncluded = a.natal.houses_count > 0 || a.natal.ascendant;
  const baziIncluded = a.bazi.available;
  const nameNumerologyIncluded = a.numerology.name_numerology_available;
  const timingIncluded = a.transits.available || a.solar_return.available || a.bazi_flow.available;

  // Concrete allowed anchor candidates, derived from the chart + gating.
  const anchors: string[] = [];
  anchors.push(...placementAnchors(chart, MODULE_PLANETS[module]));
  anchors.push(...aspectAnchors(chart, MODULE_PLANETS[module]));
  if (module === "CORE" || module === "MONEY") {
    if (typeof a.numerology.life_path === "boolean" && chart.numerology?.life_path != null)
      anchors.push(`Life Path ${chart.numerology.life_path}`);
  }
  if (module === "CORE" && nameNumerologyIncluded) {
    const n: any = chart.numerology?.name_numerology;
    if (typeof n?.expression === "number") anchors.push(`Expression ${n.expression}`);
  }
  if (
    (module === "CORE" ||
      module === "MONEY" ||
      module === "BODY" ||
      module === "STYLE" ||
      module === "PLACE") &&
    baziIncluded
  ) {
    if (chart.bazi?.day_master) anchors.push(`BaZi Day Master ${chart.bazi.day_master}`);
    const el = chart.bazi?.elements?.dominant;
    if (el) anchors.push(`BaZi dominant element ${el}`);
  }
  if (module === "YEAR" && chart.numerology?.personal_year != null) {
    anchors.push(`Personal Year ${chart.numerology.personal_year}`);
    if (timingIncluded) anchors.push("current transit/solar-return window (when available)");
  }
  if (
    housesIncluded &&
    (module === "LOVE" ||
      module === "MONEY" ||
      module === "BODY" ||
      module === "PLACE" ||
      module === "STYLE")
  ) {
    if (chart.natal?.ascendant?.sign) anchors.push(`Ascendant in ${chart.natal.ascendant.sign}`);
  }

  // Forbidden anchors — explicit, from gating + contract.
  const forbiddenAnchors: string[] = [...pack.forbidden];
  if (!housesIncluded)
    forbiddenAnchors.push("any house / angle / ASC / MC / IC / Descendant (no birth time)");
  if (!baziIncluded)
    forbiddenAnchors.push("any BaZi / Day Master / pillars / elements (unavailable)");
  if (!nameNumerologyIncluded)
    forbiddenAnchors.push("Expression / Soul Urge / Personality (no full name)");
  if (module === "YEAR" && !timingIncluded)
    forbiddenAnchors.push("transit / solar-return / BaZi-flow timing (unavailable)");

  // Forbidden claims — global do-not-claim + not-implemented + module specifics.
  const forbiddenClaims = MATERIAL_CATEGORIES.filter(
    (c) => c.status === "do_not_claim" || c.status === "not_implemented",
  ).map((c) => c.label);

  // Active fallback given availability.
  let missingDataFallback = pack.fallback;
  if (module === "YEAR" && !a.transits.available && !a.solar_return.available) {
    missingDataFallback = "Personal Year theme only (transits + solar return unavailable)";
  } else if (!housesIncluded) {
    missingDataFallback = pack.fallback;
  }

  const optionalEnrichmentAvailable: string[] = [];
  if (housesIncluded) optionalEnrichmentAvailable.push("houses/angles");
  if (baziIncluded) optionalEnrichmentAvailable.push("BaZi");
  if (nameNumerologyIncluded) optionalEnrichmentAvailable.push("name numerology");
  if (a.moon_phase.available && module === "BODY") optionalEnrichmentAvailable.push("moon phase");
  if (timingIncluded && module === "YEAR")
    optionalEnrichmentAvailable.push("transits/solar/bazi_flow");

  const numerologyMeanings =
    module === "CORE" && nameNumerologyIncluded
      ? (chart.numerology as any)?.name_numerology?.meanings
      : undefined;

  const debug =
    `[material-pack ${module}] birth_time=${(chart as any).meta?.birth_time_source ?? "?"} ` +
    `houses=${housesIncluded} bazi=${baziIncluded} name=${nameNumerologyIncluded} timing=${timingIncluded} ` +
    `anchors=${anchors.length} forbidden_anchors=${forbiddenAnchors.length}`;

  return {
    module,
    customer: { first_name: customer.first_name ?? null },
    birth: {
      date_of_birth: (chart as any)._birth?.date_of_birth,
      birth_time_known: ((chart as any).meta?.birth_time_source ?? "unknown") === "exact",
      birth_city: (chart as any)._birth?.birth_city ?? null,
    },
    availability: a,
    requiredRaw: pack.requiredRaw,
    optionalEnrichmentAvailable,
    housesIncluded,
    baziIncluded,
    nameNumerologyIncluded,
    timingIncluded,
    allowedProofAnchorCandidates: anchors,
    forbiddenAnchors,
    forbiddenClaims,
    numerologyMeanings,
    missingDataFallback,
    rules: [NO_INVENTED_ENRICHMENT_RULE, NO_UNSUPPORTED_PUBLIC_CLAIMS_RULE],
    debug,
  };
}
