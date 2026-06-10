// CONTINUUM material packet (pure). Compact, period-aware timing context. Only available/gated
// data; no full previous-PDF dump. Reuses the availability + do-not-claim layers. STAGED.

import type { DarrowChartData } from "@/lib/astro/types";
import { summarizeAvailability } from "@/lib/diagnostics/material-context/availability";
import {
  MATERIAL_CATEGORIES,
  NO_INVENTED_ENRICHMENT_RULE,
  NO_UNSUPPORTED_PUBLIC_CLAIMS_RULE,
} from "@/lib/diagnostics/material-context/material-readiness";
import {
  computeContinuumPeriod,
  type ContinuumType,
  type ContinuumPeriod,
} from "./continuum-config";
import { timingAnchors } from "@/lib/report-context/build-report-context";

export interface ContinuumContext {
  type: ContinuumType;
  period: ContinuumPeriod;
  customer: { first_name: string | null };
  timingIncluded: boolean;
  optionalEnrichmentAvailable: string[];
  allowedProofAnchorCandidates: string[];
  forbiddenAnchors: string[];
  forbiddenClaims: string[];
  missingDataFallback: string;
  rules: string[];
  debug: string;
}

function planetSign(chart: Partial<DarrowChartData>, name: string): string | null {
  const planets = chart.natal?.planets;
  if (Array.isArray(planets)) {
    const p = planets.find((x: any) => String(x?.name).toLowerCase() === name.toLowerCase());
    if (p?.sign) return p.sign;
  }
  if (name === "Sun" && chart.natal?.sun?.sign) return chart.natal.sun.sign;
  if (name === "Moon" && chart.natal?.moon?.sign) return chart.natal.moon.sign;
  return null;
}

export function buildContinuumContext(
  type: ContinuumType,
  chart: Partial<DarrowChartData>,
  opts: { generatedAt: Date; first_name?: string | null },
): ContinuumContext {
  const a = summarizeAvailability(chart);
  const period = computeContinuumPeriod(opts.generatedAt, type);

  const transits = a.transits.available;
  const solar = a.solar_return.available;
  const flow = a.bazi_flow.available;
  const moon = a.moon_phase.available;
  const timingIncluded = transits || solar || flow;

  const anchors: string[] = [];
  // Natal essentials.
  for (const n of ["Sun", "Moon"]) {
    const s = planetSign(chart, n);
    if (s) anchors.push(`${n} in ${s}`);
  }
  // Numerology timing.
  if (chart.numerology?.personal_year != null) {
    const mm = chart.numerology.personal_year_master_marker;
    anchors.push(`Personal Year ${chart.numerology.personal_year}${mm ? ` (master ${mm})` : ""}`);
  }
  // BaZi essentials (if available).
  if (chart.bazi?.available && chart.bazi.day_master)
    anchors.push(`BaZi Day Master ${chart.bazi.day_master}`);
  // CONTENT-DEPTH-1 A1: real timing signals (transits / solar-return / BaZi flow / moon phase) —
  // descriptive anchors only, emitted only for available layers; replaces the old generic strings.
  anchors.push(...timingAnchors(chart));
  if (anchors.length > 16) anchors.splice(16);

  const optionalEnrichmentAvailable = [
    transits && "transits",
    solar && "solar return",
    flow && "bazi_flow",
    moon && "moon phase",
  ].filter(Boolean) as string[];

  const forbiddenAnchors: string[] = [];
  if (!transits) forbiddenAnchors.push("transit-based timing (unavailable)");
  if (!solar) forbiddenAnchors.push("solar-return timing (unavailable)");
  if (!flow) forbiddenAnchors.push("BaZi-flow timing (unavailable)");
  forbiddenAnchors.push("any specific dated event prediction");

  const forbiddenClaims = [
    ...MATERIAL_CATEGORIES.filter(
      (c) => c.status === "do_not_claim" || c.status === "not_implemented",
    ).map((c) => c.label),
    "guaranteed predictions / 'this will happen' language",
    "calendar week/month framing (this is a rolling period from generation)",
  ];

  const missingDataFallback = timingIncluded
    ? "use the available timing layers + Personal Year"
    : "Personal Year theme + natal essentials only (no transit/solar/flow timing available)";

  return {
    type,
    period,
    customer: { first_name: opts.first_name ?? null },
    timingIncluded,
    optionalEnrichmentAvailable,
    allowedProofAnchorCandidates: anchors,
    forbiddenAnchors,
    forbiddenClaims,
    missingDataFallback,
    rules: [NO_INVENTED_ENRICHMENT_RULE, NO_UNSUPPORTED_PUBLIC_CLAIMS_RULE],
    debug: `[continuum ${type}] ${period.covers_label} · timing=${timingIncluded} · anchors=${anchors.length}`,
  };
}
