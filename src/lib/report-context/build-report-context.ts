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
// CONTENT-DEPTH-1: anchors keep their base string (e.g. "Venus in Aquarius") and append precise
// detail as a suffix — so they stay more SPECIFIC without lengthening the report. Detail is gated by
// availability; absent data never appears.
function planetDetail(
  chart: Partial<DarrowChartData>,
  name: string,
): { sign: string; house?: number | null; retrograde?: boolean; dignity?: string | null } | null {
  let p: any = null;
  const planets = chart.natal?.planets;
  if (Array.isArray(planets))
    p = planets.find((x: any) => String(x?.name).toLowerCase() === name.toLowerCase());
  if (!p && name.toLowerCase() === "sun") p = chart.natal?.sun;
  if (!p && name.toLowerCase() === "moon") p = chart.natal?.moon;
  if (!p?.sign) return null;
  return {
    sign: p.sign,
    house: p.house ?? null,
    retrograde: !!p.retrograde,
    dignity: p.dignity ?? null,
  };
}

const MEANINGLESS_DIGNITY = new Set(["peregrine", "none", "neutral", ""]);

// A3: sign + (house if birth time) + retrograde + meaningful dignity.
function placementAnchors(
  chart: Partial<DarrowChartData>,
  planets: string[],
  withHouses: boolean,
): string[] {
  const out: string[] = [];
  for (const name of planets) {
    const d = planetDetail(chart, name);
    if (!d) continue;
    const extra: string[] = [];
    if (withHouses && d.house != null) extra.push(`${d.house}H`);
    if (d.retrograde) extra.push("retrograde");
    if (d.dignity && !MEANINGLESS_DIGNITY.has(d.dignity.toLowerCase())) extra.push(d.dignity);
    out.push(`${name} in ${d.sign}${extra.length ? ` · ${extra.join(", ")}` : ""}`);
  }
  return out;
}

// A3: aspect type + orb + applying; tightest-orb first (more central to the pattern).
function aspectAnchors(chart: Partial<DarrowChartData>, planets: string[]): string[] {
  const aspects = chart.natal?.aspects;
  if (!Array.isArray(aspects)) return [];
  const set = new Set(planets.map((p) => p.toLowerCase()));
  return aspects
    .filter((a: any) => set.has(String(a?.a).toLowerCase()) && set.has(String(a?.b).toLowerCase()))
    .slice()
    .sort((x: any, y: any) => Math.abs(x?.orb ?? 99) - Math.abs(y?.orb ?? 99))
    .slice(0, 6)
    .map((a: any) => {
      const detail =
        typeof a.orb === "number"
          ? ` (orb ${a.orb.toFixed(1)}°${a.is_applying ? ", applying" : ""})`
          : "";
      return `${a.a} ${a.type} ${a.b}${detail}`;
    });
}

// A2: BaZi depth — day master (+strength), element balance, favorable elements, current luck cycle.
// Keeps the legacy "BaZi Day Master X" + "BaZi dominant element X" base strings for back-compat.
function baziDepthAnchors(chart: Partial<DarrowChartData>, module: ReportModule): string[] {
  const b: any = chart.bazi;
  if (!b?.available) return [];
  const out: string[] = [];
  if (b.day_master) {
    const strength = b.professional?.dm_strength;
    out.push(`BaZi Day Master ${b.day_master}${strength ? ` (${strength})` : ""}`);
  }
  const dom = b.elements?.dominant;
  const def = b.elements?.deficient;
  if (dom) out.push(`BaZi dominant element ${dom}${def ? ` (deficient: ${def})` : ""}`);
  const fav = b.professional?.favorable_elements;
  if (
    Array.isArray(fav) &&
    fav.length &&
    (module === "MONEY" || module === "BODY" || module === "CORE")
  )
    out.push(`BaZi favorable elements ${fav.slice(0, 3).join("/")}`);
  const cur = b.current_luck_cycle;
  if (cur?.pillar_label && (module === "MONEY" || module === "YEAR" || module === "CORE"))
    out.push(`BaZi current luck cycle ${cur.pillar_label}`);
  return out;
}

// A1: real timing signals for YEAR + Continuum — actual transits, solar-return angularity, BaZi annual
// flow, moon phase. Descriptive anchors only (no event prediction). Capped + ordered by salience.
export function timingAnchors(chart: Partial<DarrowChartData>): string[] {
  const out: string[] = [];
  const t: any = chart.transits;
  if (t?.available && Array.isArray(t.aspects)) {
    const ranked = t.aspects
      .slice()
      .sort(
        (x: any, y: any) =>
          (y.high_priority ? 1 : 0) - (x.high_priority ? 1 : 0) ||
          Math.abs(x?.orb ?? 99) - Math.abs(y?.orb ?? 99),
      )
      .slice(0, 4);
    for (const a of ranked) {
      const hp = a.high_priority ? ", high-priority" : "";
      const orb = typeof a.orb === "number" ? `, orb ${a.orb.toFixed(1)}°` : "";
      out.push(`Transit ${a.a} ${a.type} natal ${a.b}${hp}${orb}`);
    }
  }
  const sr: any = chart.solar_return;
  if (sr?.available) {
    const ang = sr.natal_comparison?.angularity;
    if (Array.isArray(ang)) {
      for (const x of ang.slice(0, 2)) out.push(`Solar Return ${x.planet} angular to ${x.angle}`);
    }
  }
  const flow: any = chart.bazi_flow;
  if (flow?.available && flow.annual_pillar?.gan_zhi) {
    const tg = flow.annual_pillar.ten_god ? ` (Ten God: ${flow.annual_pillar.ten_god})` : "";
    out.push(`BaZi annual pillar ${flow.annual_pillar.gan_zhi}${tg}`);
  }
  const mp: any = chart.moon_phase;
  if (mp?.available && mp.phase?.name) {
    const sign = mp.zodiac?.sign ? ` in ${mp.zodiac.sign}` : "";
    out.push(`Moon phase ${mp.phase.name}${sign}`);
  }
  return out;
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

  // Concrete allowed anchor candidates, derived from the chart + gating. CONTENT-DEPTH-1: richer,
  // capped, availability-gated — more SPECIFIC anchors at the same report length.
  const anchors: string[] = [];
  anchors.push(...placementAnchors(chart, MODULE_PLANETS[module], housesIncluded)); // A3
  anchors.push(...aspectAnchors(chart, MODULE_PLANETS[module])); // A3 (orb/applying)

  // Numerology (A4 depth).
  if (module === "CORE" || module === "MONEY") {
    if (chart.numerology?.life_path != null)
      anchors.push(`Life Path ${chart.numerology.life_path}`);
  }
  if (module === "CORE" && chart.numerology?.birth_day_number != null)
    anchors.push(`Birth Day ${chart.numerology.birth_day_number}`);
  if (module === "CORE" && nameNumerologyIncluded) {
    const n: any = chart.numerology?.name_numerology;
    if (typeof n?.expression === "number") anchors.push(`Expression ${n.expression}`);
    if (typeof n?.soul_urge === "number") anchors.push(`Soul Urge ${n.soul_urge}`);
  }

  // BaZi depth (A2).
  if (baziIncluded) anchors.push(...baziDepthAnchors(chart, module));

  // YEAR timing (A1) — real signals, not a generic placeholder string.
  if (module === "YEAR") {
    if (chart.numerology?.personal_year != null) {
      const mm = chart.numerology.personal_year_master_marker;
      anchors.push(`Personal Year ${chart.numerology.personal_year}${mm ? ` (master ${mm})` : ""}`);
    }
    if (timingIncluded) anchors.push(...timingAnchors(chart));
  }

  // Ascendant (gated by birth time).
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

  // Token budget: cap total anchor candidates.
  if (anchors.length > 18) anchors.splice(18);

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
