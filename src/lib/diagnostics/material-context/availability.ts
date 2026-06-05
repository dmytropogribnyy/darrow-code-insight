// DATA-AUDIT-1 — provider field-availability summary + per-module impact (pure).
// DIAGNOSTIC ONLY. No network, no AI. Operates on a DarrowChartData (real, from an
// approved run, or synthetic in tests) and reports which fields are present.

import type { DarrowChartData } from "@/lib/astro/types";
import { AUDIT_MODULES, type AuditModule } from "./synthetic-cases";

const num = (v: unknown) => (Array.isArray(v) ? v.length : 0);
const has = (v: unknown) => v !== null && v !== undefined;

export interface AvailabilitySummary {
  meta: {
    provider_name?: string;
    provider_version?: string;
    birth_time_source?: string;
    timezone_used?: string;
    endpoint_errors: string[];
  };
  natal: {
    sun: boolean;
    moon: boolean;
    planets_count: number;
    houses_count: number;
    ascendant: boolean;
    midheaven: boolean;
    angles_details: boolean;
    aspects_count: number;
    stelliums: boolean;
    dignity_present: boolean;
    confidence: boolean;
  };
  numerology: {
    life_path: boolean;
    birth_day_number: boolean;
    personal_year: boolean;
    name_numerology_available: boolean;
    expression: boolean;
    soul_urge: boolean;
    personality: boolean;
  };
  bazi: {
    available: boolean;
    reason?: string;
    day_master: boolean;
    pillars: boolean;
    elements_percentages: boolean;
    professional: boolean;
    current_luck_cycle: boolean;
    stars_count: number;
    interactions_count: number;
    hour_pillar_confidence?: string;
    hour_pillar_used_for_interpretation?: boolean;
  };
  transits: {
    available: boolean;
    reason?: string;
    aspects_count: number;
    high_priority_count: number;
  };
  solar_return: {
    available: boolean;
    reason?: string;
    planets_count: number;
    angles_details: boolean;
    natal_aspects_count: number;
    angularity: boolean;
  };
  moon_phase: {
    available: boolean;
    reason?: string;
    phase: boolean;
    zodiac: boolean;
    forecast: boolean;
  };
  bazi_flow: {
    available: boolean;
    usable?: boolean;
    reason?: string;
    annual_pillar: boolean;
    monthly_pillars_count: number;
    interactions: boolean;
    stars: boolean;
    time_confidence?: string;
  };
}

export function summarizeAvailability(chart: Partial<DarrowChartData>): AvailabilitySummary {
  const natal: any = chart.natal ?? {};
  const numer: any = chart.numerology ?? {};
  const name: any = numer.name_numerology ?? {};
  const bazi: any = chart.bazi ?? {};
  const transits: any = chart.transits ?? null;
  const solar: any = chart.solar_return ?? null;
  const moon: any = chart.moon_phase ?? null;
  const flow: any = chart.bazi_flow ?? null;
  const planets: any[] = Array.isArray(natal.planets) ? natal.planets : [];

  return {
    meta: {
      provider_name: chart.meta?.provider_name,
      provider_version: chart.meta?.provider_version,
      birth_time_source: chart.meta?.birth_time_source,
      timezone_used: chart.meta?.timezone_used,
      endpoint_errors: Object.keys(chart.meta?.endpoint_errors ?? {}),
    },
    natal: {
      sun: has(natal.sun) && !!natal.sun?.sign,
      moon: has(natal.moon) && !!natal.moon?.sign,
      planets_count: planets.length,
      houses_count: num(natal.houses),
      ascendant: has(natal.ascendant),
      midheaven: has(natal.midheaven),
      angles_details: has(natal.angles_details),
      aspects_count: num(natal.aspects),
      stelliums: has(natal.stelliums),
      dignity_present: planets.some((p) => has(p?.dignity)),
      confidence: has(natal.confidence),
    },
    numerology: {
      life_path: typeof numer.life_path === "number",
      birth_day_number: typeof numer.birth_day_number === "number",
      personal_year: typeof numer.personal_year === "number",
      name_numerology_available: name.available === true,
      expression: typeof name.expression === "number",
      soul_urge: typeof name.soul_urge === "number",
      personality: typeof name.personality === "number",
    },
    bazi: {
      available: bazi.available === true,
      reason: bazi.available === true ? undefined : bazi.reason,
      day_master: has(bazi.day_master),
      pillars: has(bazi.pillars),
      elements_percentages: has(bazi.elements?.percentages),
      professional: has(bazi.professional),
      current_luck_cycle: has(bazi.current_luck_cycle),
      stars_count: num(bazi.stars),
      interactions_count: num(bazi.interactions),
      hour_pillar_confidence: bazi.hour_pillar_confidence,
      hour_pillar_used_for_interpretation: bazi.hour_pillar_used_for_interpretation,
    },
    transits: {
      available: transits?.available === true,
      reason: transits?.available === true ? undefined : transits?.reason,
      aspects_count: num(transits?.aspects),
      high_priority_count: Array.isArray(transits?.aspects)
        ? transits.aspects.filter((a: any) => a?.high_priority).length
        : 0,
    },
    solar_return: {
      available: solar?.available === true,
      reason: solar?.available === true ? undefined : solar?.reason,
      planets_count: num(solar?.planets),
      angles_details: has(solar?.angles_details),
      natal_aspects_count: num(solar?.natal_comparison?.aspects),
      angularity: num(solar?.natal_comparison?.angularity) > 0,
    },
    moon_phase: {
      available: moon?.available === true,
      reason: moon?.available === true ? undefined : moon?.reason,
      phase: has(moon?.phase),
      zodiac: has(moon?.zodiac),
      forecast: has(moon?.forecast),
    },
    bazi_flow: {
      available: flow?.available === true,
      usable: flow?.usable,
      reason: flow?.available === true ? undefined : flow?.reason,
      annual_pillar: has(flow?.annual_pillar),
      monthly_pillars_count: num(flow?.monthly_pillars),
      interactions: num(flow?.interactions) > 0,
      stars: num(flow?.stars) > 0,
      time_confidence: flow?.time_confidence,
    },
  };
}

export interface ModuleImpact {
  module: AuditModule;
  blocked: string[]; // data layers that must be suppressed for this chart
  degraded: string[]; // primary data missing → reduced read
  notes: string[];
}

// Applies the data-source-map gating to a concrete availability summary.
export function moduleImpact(a: AvailabilitySummary): ModuleImpact[] {
  const noHouses = a.natal.houses_count === 0 && !a.natal.ascendant;
  const noBazi = !a.bazi.available;
  const noName = !a.numerology.name_numerology_available;
  const noTransits = !a.transits.available;
  const noSolar = !a.solar_return.available;

  const houseLayer = (label: string) => (noHouses ? [`houses/angles (${label})`] : []);
  const baziLayer = noBazi ? ["BaZi"] : [];
  const nameLayer = noName ? ["name numerology"] : [];

  const rows: Record<AuditModule, { blocked: string[]; degraded: string[]; notes: string[] }> = {
    CORE: {
      blocked: [...houseLayer("ASC/MC"), ...baziLayer, ...nameLayer],
      degraded: [],
      notes: noBazi ? ["cross-system convergence reduced (no BaZi)"] : [],
    },
    LOVE: {
      blocked: [...houseLayer("5H/7H/Desc"), ...nameLayer],
      degraded: noHouses ? ["Venus/Mars/Moon only"] : [],
      notes: [],
    },
    MONEY: {
      blocked: [...houseLayer("2/6/8/10H"), ...baziLayer],
      degraded: noHouses ? ["planet-only money read"] : [],
      notes: [],
    },
    BODY: {
      blocked: [...houseLayer("6H"), ...baziLayer],
      degraded: [],
      notes: !a.moon_phase.available ? ["no Moon Phase rhythm note"] : [],
    },
    YEAR: {
      blocked: [...baziLayer],
      degraded: [
        noTransits && noSolar ? "Personal Year only (no transits + no solar return)" : "",
      ].filter(Boolean),
      notes: noSolar ? ["solar return unavailable"] : [],
    },
    STYLE: { blocked: [...houseLayer("ASC"), ...baziLayer], degraded: [], notes: [] },
    PLACE: {
      blocked: [...houseLayer("IC/4H/angular"), ...baziLayer],
      degraded: noHouses ? ["Moon-only environment read"] : [],
      notes: ["astrocartography not implemented — no city claims"],
    },
  };

  return AUDIT_MODULES.map((m) => ({ module: m, ...rows[m] }));
}

// ── Approved-run guard (pure; tested without network) ───────────────
export class AuditNotApprovedError extends Error {}
export class MissingFreeAstroKeyError extends Error {}
export class WrongProviderError extends Error {}

export function isAuditApproved(env: Record<string, string | undefined>): boolean {
  const v = env.FREEASTROAPI_AUDIT_APPROVE;
  return v === "1" || v?.toLowerCase() === "true";
}

// Throws clearly BEFORE any network call when prerequisites are unmet.
export function assertApprovedRunPrereqs(env: Record<string, string | undefined>): void {
  if (!isAuditApproved(env)) {
    throw new AuditNotApprovedError("Set FREEASTROAPI_AUDIT_APPROVE=1 to run an approved audit.");
  }
  if ((env.ASTRO_PROVIDER ?? "").toLowerCase().trim() !== "freeastroapi") {
    throw new WrongProviderError("ASTRO_PROVIDER must be 'freeastroapi' for an approved audit.");
  }
  if (!env.FREEASTROAPI_KEY) {
    throw new MissingFreeAstroKeyError(
      "FREEASTROAPI_KEY is required — aborting before any network call.",
    );
  }
}
