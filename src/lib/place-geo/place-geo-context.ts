// PLACE-GEO v1 — context orchestration: birth-city check → region → parallel focus passes.
// Anchors are derived FROM the API payload, so the unbacked-proof gate makes invented cities
// structurally impossible. Partial failure tolerated; total failure → caller falls back to the
// resonance PLACE. Injectable fetchers => testable without network.

import type { NatalInput } from "@/lib/astro/types";
import {
  fetchAcgCityCheck,
  fetchAcgRecommendations,
  type AcgCityCheckResult,
  type AcgRecommendationsResult,
  type AcgCityResult,
  type AcgFocus,
} from "@/lib/astro/astrocartography.server";
import { regionForCountry } from "@/lib/astro/region-map";

export interface PlaceGeoPass {
  focus: AcgFocus;
  scope: "regional" | "global";
  result: AcgRecommendationsResult | null; // null = call failed (partial-failure policy)
}

export interface PlaceGeoContext {
  birthCityCheck: AcgCityCheckResult | null;
  passes: PlaceGeoPass[];
  allowedProofAnchorCandidates: string[];
  cityNames: string[]; // distinct, from API payload only — acceptance gate input
  failedCalls: number;
  usable: boolean; // false → fall back to resonance PLACE
}

type Fetchers = {
  cityCheck: typeof fetchAcgCityCheck;
  recommendations: typeof fetchAcgRecommendations;
};

const CALL_PLAN: Array<{ focus: AcgFocus; scope: "regional" | "global"; limit: number }> = [
  { focus: "career", scope: "regional", limit: 5 },
  { focus: "career", scope: "global", limit: 5 },
  { focus: "romance", scope: "regional", limit: 5 },
  { focus: "home", scope: "regional", limit: 5 },
  { focus: "home", scope: "global", limit: 5 },
  { focus: "health", scope: "regional", limit: 3 },
];

function cap(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function lineLabel(l?: { body?: string; angle?: string; distance_km?: number } | null): string {
  if (!l?.body || !l?.angle) return "";
  const dist = typeof l.distance_km === "number" ? `, ~${Math.round(l.distance_km)} km` : "";
  return `${cap(l.body)} ${l.angle.toUpperCase()} line${dist}`;
}

function anchorsForCity(r: AcgCityResult): string[] {
  const out: string[] = [];
  const cityLabel = r.city.country ? `${r.city.name}, ${r.city.country}` : r.city.name;
  out.push(cityLabel);
  const fav = lineLabel(r.nearest_favorable_line);
  if (fav) out.push(`${cityLabel} — ${fav}`);
  const chal = lineLabel(r.nearest_challenging_line);
  if (chal) out.push(`${cityLabel} — challenging ${chal}`);
  return out;
}

export async function buildPlaceGeoContext(
  apiKey: string,
  input: NatalInput,
  fetchers: Fetchers = { cityCheck: fetchAcgCityCheck, recommendations: fetchAcgRecommendations },
): Promise<PlaceGeoContext> {
  if (!input.birth_time_known) {
    return {
      birthCityCheck: null,
      passes: [],
      allowedProofAnchorCandidates: [],
      cityNames: [],
      failedCalls: 0,
      usable: false,
    };
  }

  // 1) Birth-city check first — it also resolves the ISO country for the regional passes.
  let birthCityCheck: AcgCityCheckResult | null = null;
  try {
    birthCityCheck = await fetchers.cityCheck(apiKey, input, {
      city: input.birth_city ?? "",
      lat: input.latitude,
      lng: input.longitude,
    });
  } catch (e: any) {
    console.warn("[place-geo] birth-city check failed", { msg: String(e?.message).slice(0, 120) });
  }

  const region = regionForCountry(birthCityCheck?.city?.country ?? null);

  // 2) Focus passes in parallel; regional passes need a region (else skipped).
  const plan = CALL_PLAN.filter((p) => p.scope === "global" || region);
  const settled = await Promise.allSettled(
    plan.map((p) =>
      fetchers.recommendations(apiKey, input, {
        focus: p.focus,
        countryScope: p.scope === "regional" ? "selected_countries" : "all",
        ...(p.scope === "regional" ? { countries: region! } : {}),
        limit: p.limit,
      }),
    ),
  );
  const passes: PlaceGeoPass[] = plan.map((p, i) => ({
    focus: p.focus,
    scope: p.scope,
    result: settled[i].status === "fulfilled" ? (settled[i] as any).value : null,
  }));
  const failedCalls = passes.filter((p) => !p.result).length + (birthCityCheck ? 0 : 1);

  // 3) Anchors + distinct city names — strictly from the API payload.
  const anchors: string[] = [];
  const citySet = new Set<string>();
  if (birthCityCheck?.city?.name) {
    const label = birthCityCheck.city.country
      ? `${birthCityCheck.city.name}, ${birthCityCheck.city.country}`
      : birthCityCheck.city.name;
    citySet.add(birthCityCheck.city.name);
    anchors.push(label);
    for (const ap of birthCityCheck.relocation_summary?.angular_planets ?? []) {
      if (ap.body && ap.angle)
        anchors.push(
          `${label} — ${cap(ap.body)} ${ap.angle.toUpperCase()}${ap.house ? ` (${ap.house}H)` : ""}`,
        );
    }
  }
  for (const p of passes) {
    for (const r of p.result?.results ?? []) {
      citySet.add(r.city.name);
      anchors.push(...anchorsForCity(r));
    }
  }
  const allowedProofAnchorCandidates = Array.from(new Set(anchors)).slice(0, 60);

  // Usable = birth-city read OR at least one focus pass landed.
  const usable = !!birthCityCheck || passes.some((p) => p.result);
  return {
    birthCityCheck,
    passes,
    allowedProofAnchorCandidates,
    cityNames: Array.from(citySet),
    failedCalls,
    usable,
  };
}
