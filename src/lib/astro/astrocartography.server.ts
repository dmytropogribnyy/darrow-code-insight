// PLACE-GEO v1 — FreeAstroAPI astrocartography service layer (MAP0-verified 2026-06-10).
//
// Wraps the two endpoints PLACE-GEO consumes, live-probed on our paid key:
//   POST /api/v1/western/astrocartography/city-check        (one city × all 5 focuses)
//   POST /api/v1/western/astrocartography/recommendations   (ranked cities for one focus)
// Types are built from REAL captured responses (src/lib/astro/__fixtures__/acg-*.json),
// not from docs — fields the API may omit are optional.
//
// Hard rules (contract):
//   - `include_crossings` is NEVER sent (High-plan gated → 403 high_plan_required).
//   - `include_map_lines: false` always (no map rendering in v1; huge GeoJSON payloads).
//   - birth_time_known=true is REQUIRED — callers must gate; we throw early otherwise.
//   - Warn-only normalization: unknown shapes are logged, never thrown, never retried.
//   - Retry: max 1 extra attempt, ONLY on network error / 5xx / 429. Never on 4xx.
//
// No Stripe/email/Supabase. Pure fetch + normalize.

import type { NatalInput } from "./types";

const BASE_URL = "https://api.freeastroapi.com";
const TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 2;

export type AcgFocus = "career" | "romance" | "home" | "health" | "spiritual";
export const ACG_FOCUSES: AcgFocus[] = ["career", "romance", "home", "health", "spiritual"];

export interface AcgLineRef {
  body?: string;
  angle?: string;
  distance_km?: number;
}

export interface AcgAngularPlanet {
  body?: string;
  angle?: string;
  orb_deg?: number;
  house?: number;
}

export interface AcgRelocationSummary {
  angular_planets?: AcgAngularPlanet[];
  dominant_themes?: string[];
  summary_short?: string;
  summary_caution?: string;
}

export interface AcgCity {
  name: string;
  country?: string;
  state?: string;
  lat?: number;
  lng?: number;
  timezone?: string;
  population?: number;
}

export interface AcgCityResult {
  city: AcgCity;
  rank?: number;
  score?: number;
  line_score?: number;
  paran_score?: number;
  relocation_score?: number;
  summary?: string;
  distance_from_natal_km?: number;
  nearest_favorable_line?: AcgLineRef | null;
  nearest_challenging_line?: AcgLineRef | null;
  nearest_favorable_distance_km?: number;
  nearest_challenging_distance_km?: number;
  top_factors?: Array<Record<string, unknown>>;
  match_tier?: string;
  signal_strength?: string;
  relocation_summary?: AcgRelocationSummary | null;
  city_visual_explanation?: string;
}

export interface AcgMeta {
  signal_strength?: string;
  confidence?: string;
  match_tier?: string;
  no_strong_matches?: boolean;
  candidate_count?: number;
  scored_count?: number;
}

export interface AcgFocusScore {
  score?: number;
  summary?: string;
  top_factors?: Array<Record<string, unknown>>;
  nearest_favorable_line?: AcgLineRef | null;
  nearest_challenging_line?: AcgLineRef | null;
}

export interface AcgRecommendationsResult {
  meta: AcgMeta;
  warnings: string[];
  results: AcgCityResult[];
}

export interface AcgCityCheckResult {
  meta: AcgMeta;
  warnings: string[];
  city: AcgCity;
  overall_score?: number;
  focus_scores: Partial<Record<AcgFocus, AcgFocusScore>>;
  relocation_summary?: AcgRelocationSummary | null;
}

// ── natal block (nested — astrocartography endpoints expect { natal: {...} }) ──
function parseDateParts(date: string): { y: number; m: number; d: number } {
  const [y, m, d] = date.split("-").map((x) => Number(x));
  return { y, m, d };
}

function parseTimeParts(t: string | null | undefined): { h: number; min: number } | null {
  if (!t) return null;
  const [h, min] = t.split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  return { h, min };
}

export function buildAcgNatalBlock(input: NatalInput): Record<string, unknown> {
  if (!input.birth_time_known)
    throw new Error("[acg] astrocartography requires exact birth time (birth_time_known=true)");
  const { y, m, d } = parseDateParts(input.date_of_birth);
  const tm = parseTimeParts(input.birth_time);
  if (!tm) throw new Error("[acg] astrocartography requires a parseable birth_time");
  return {
    year: y,
    month: m,
    day: d,
    hour: tm.h,
    minute: tm.min,
    city: input.birth_city ?? "",
    lat: input.latitude,
    lng: input.longitude,
    tz_str: input.timezone || "AUTO",
    time_known: true,
    house_system: "placidus",
  };
}

// ── fetch helper (timeout + bounded retry; never retries 4xx) ──
async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const guard = new Promise<never>((_, rej) => {
    timer = setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([p, guard]);
  } finally {
    clearTimeout(timer!);
  }
}

async function postAcg(apiKey: string, path: string, body: Record<string, unknown>): Promise<any> {
  // Contract guard: these keys must never reach the API regardless of caller bugs.
  delete (body as any).include_crossings;
  let lastErr: any = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await withTimeout(
        fetch(`${BASE_URL}${path}`, {
          method: "POST",
          headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        TIMEOUT_MS,
        `POST ${path}`,
      );
      if (res.ok) return await res.json();
      const text = await res.text().catch(() => "");
      const err = new Error(`[acg] ${path} HTTP ${res.status}: ${text.slice(0, 180)}`);
      // 4xx (including 403 high_plan_required) → terminal, never retry.
      if (res.status >= 400 && res.status < 500 && res.status !== 429) throw err;
      lastErr = err; // 5xx / 429 → one bounded retry
    } catch (e: any) {
      if (/HTTP 4\d\d/.test(String(e?.message)) && !/HTTP 429/.test(String(e?.message))) throw e;
      lastErr = e;
    }
    if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, 600));
  }
  throw lastErr ?? new Error(`[acg] ${path} failed`);
}

// ── warn-only normalizers (trim to consumed fields; drop GeoJSON/map payloads) ──
function normLineRef(v: any): AcgLineRef | null {
  if (!v || typeof v !== "object") return null;
  return { body: v.body, angle: v.angle, distance_km: v.distance_km };
}

function normRelocationSummary(v: any): AcgRelocationSummary | null {
  if (!v || typeof v !== "object") return null;
  return {
    angular_planets: Array.isArray(v.angular_planets)
      ? v.angular_planets.map((p: any) => ({
          body: p?.body,
          angle: p?.angle,
          orb_deg: p?.orb_deg,
          house: p?.house,
        }))
      : undefined,
    dominant_themes: Array.isArray(v.dominant_themes) ? v.dominant_themes : undefined,
    summary_short: typeof v.summary_short === "string" ? v.summary_short : undefined,
    summary_caution: typeof v.summary_caution === "string" ? v.summary_caution : undefined,
  };
}

function normCityResult(v: any): AcgCityResult | null {
  if (!v || typeof v !== "object" || !v.city?.name) {
    console.warn("[acg] skipping malformed city result", { keys: v ? Object.keys(v) : null });
    return null;
  }
  return {
    city: {
      name: v.city.name,
      country: v.city.country,
      state: v.city.state,
      lat: v.city.lat,
      lng: v.city.lng,
      timezone: v.city.timezone,
      population: v.city.population,
    },
    rank: v.rank,
    score: v.score,
    line_score: v.line_score,
    paran_score: v.paran_score,
    relocation_score: v.relocation_score,
    summary: v.summary,
    distance_from_natal_km: v.distance_from_natal_km,
    nearest_favorable_line: normLineRef(v.nearest_favorable_line),
    nearest_challenging_line: normLineRef(v.nearest_challenging_line),
    nearest_favorable_distance_km: v.nearest_favorable_distance_km,
    nearest_challenging_distance_km: v.nearest_challenging_distance_km,
    top_factors: Array.isArray(v.top_factors) ? v.top_factors : undefined,
    match_tier: v.match_tier,
    signal_strength: v.signal_strength,
    relocation_summary: normRelocationSummary(v.relocation_summary),
    city_visual_explanation:
      typeof v.city_visual_explanation === "string" ? v.city_visual_explanation : undefined,
  };
}

function normMeta(v: any): AcgMeta {
  if (!v || typeof v !== "object") return {};
  return {
    signal_strength: v.signal_strength,
    confidence: v.confidence,
    match_tier: v.match_tier,
    no_strong_matches: v.no_strong_matches,
    candidate_count: v.candidate_count,
    scored_count: v.scored_count,
  };
}

// ── public API ──
export interface AcgRecommendationsOpts {
  focus: AcgFocus;
  countryScope: "selected_countries" | "all";
  countries?: string[]; // ISO codes; required when scope = selected_countries
  limit?: number;
  minPopulation?: number;
}

export async function fetchAcgRecommendations(
  apiKey: string,
  input: NatalInput,
  opts: AcgRecommendationsOpts,
): Promise<AcgRecommendationsResult> {
  const body: Record<string, unknown> = {
    natal: buildAcgNatalBlock(input),
    focus: opts.focus,
    country_scope: opts.countryScope,
    ...(opts.countryScope === "selected_countries" ? { countries: opts.countries ?? [] } : {}),
    limit: opts.limit ?? 5,
    min_population: opts.minPopulation ?? 150_000,
    include_paran_summary: true,
    include_relocation_summary: true,
    include_map_lines: false,
  };
  const raw = await postAcg(apiKey, "/api/v1/western/astrocartography/recommendations", body);
  return {
    meta: normMeta(raw?.meta),
    warnings: Array.isArray(raw?.warnings) ? raw.warnings : [],
    results: (Array.isArray(raw?.results) ? raw.results : [])
      .map(normCityResult)
      .filter(Boolean) as AcgCityResult[],
  };
}

export interface AcgCityCheckOpts {
  city: string;
  country?: string; // ISO code, recommended for disambiguation
  lat?: number;
  lng?: number;
}

export async function fetchAcgCityCheck(
  apiKey: string,
  input: NatalInput,
  opts: AcgCityCheckOpts,
): Promise<AcgCityCheckResult> {
  const body: Record<string, unknown> = {
    natal: buildAcgNatalBlock(input),
    city: opts.city,
    ...(opts.country ? { country: opts.country } : {}),
    ...(opts.lat != null && opts.lng != null ? { lat: opts.lat, lng: opts.lng } : {}),
    include_paran_summary: true,
    include_relocation_summary: true,
    include_map_lines: false, // defaults TRUE on this endpoint — must send false explicitly
  };
  const raw = await postAcg(apiKey, "/api/v1/western/astrocartography/city-check", body);
  const focus_scores: Partial<Record<AcgFocus, AcgFocusScore>> = {};
  for (const f of ACG_FOCUSES) {
    const fs = raw?.focus_scores?.[f];
    if (!fs || typeof fs !== "object") continue;
    focus_scores[f] = {
      score: fs.score,
      summary: fs.summary,
      top_factors: Array.isArray(fs.top_factors) ? fs.top_factors : undefined,
      nearest_favorable_line: normLineRef(fs.nearest_favorable_line),
      nearest_challenging_line: normLineRef(fs.nearest_challenging_line),
    };
  }
  if (!raw?.city?.name) console.warn("[acg] city-check response missing city block");
  return {
    meta: normMeta(raw?.meta),
    warnings: Array.isArray(raw?.warnings) ? raw.warnings : [],
    city: {
      name: raw?.city?.name ?? opts.city,
      country: raw?.city?.country,
      state: raw?.city?.state,
      lat: raw?.city?.lat,
      lng: raw?.city?.lng,
      timezone: raw?.city?.timezone,
      population: raw?.city?.population,
    },
    overall_score: raw?.overall_score,
    focus_scores,
    relocation_summary: normRelocationSummary(raw?.relocation_summary),
  };
}
