// FreeAstroAPI provider — real chart data.
// Server-side only. Never imports into client bundles (filename ends with .server.ts).
//
// Calls run in parallel via Promise.allSettled:
//   - natal: CRITICAL — throws on failure (aborts generation)
//   - transits / bazi / solar_return: GRACEFUL — return { available: false, reason } on failure
//
// All sign abbreviations normalized. Interpretation blocks stripped before persistence.

import type { AstroProvider } from "./provider";
import type {
  DarrowChartData,
  NatalInput,
  PlanetPosition,
  HouseCusp,
  AspectRow,
  TransitsBlock,
  BaziBlock,
  SolarReturnBlock,
  BaziLuckCycle,
} from "./types";
import { normalizeSign } from "./sign-normalizer";
import {
  lifePath,
  birthDay,
  personalYear,
  expressionNumber,
  soulUrgeNumber,
  personalityNumber,
} from "./numerology";

const BASE_URL = "https://api.freeastroapi.com";
// Hard ceiling per HTTP request.
const STEP_TIMEOUT_MS = 45_000;
// Per-endpoint wall-time budget for graceful endpoints (incl. retry).
const GRACEFUL_ENDPOINT_BUDGET_MS = 10_000;
// Natal is critical: 1 initial + 1 retry.
const NATAL_MAX_ATTEMPTS = 2;
// Graceful endpoints: 1 initial + 1 retry.
const GRACEFUL_MAX_ATTEMPTS = 2;
// 429 fallback wait if Retry-After header absent.
const DEFAULT_429_BACKOFF_MS = 1500;
// Reject Retry-After values larger than this (would blow the worker budget).
const MAX_RETRY_AFTER_MS = 6_000;
// Stagger between concurrent graceful calls (paid plan still benefits from a tiny gap).
const GRACEFUL_STAGGER = { transits: 0, bazi: 250, solar: 500 } as const;

function parseDate(dob: string): { y: number; m: number; d: number } {
  const [y, m, d] = dob.split("-").map((x) => parseInt(x, 10));
  return { y, m, d };
}

function parseTime(t: string | null | undefined): { h: number; min: number } | null {
  if (!t) return null;
  const [h, m] = t.split(":").map((x) => parseInt(x, 10));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return { h, min: m };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let to: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      p,
      new Promise<never>((_, rej) => {
        to = setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms);
      }),
    ]);
  } finally {
    if (to) clearTimeout(to);
  }
}

export interface EndpointDiag {
  elapsed_ms: number;
  status: number | null;
  hit_429: boolean;
  available: boolean;
  error?: string;
}

interface PostOpts {
  maxAttempts: number;
  label: string;
}

async function postJson(
  apiKey: string,
  path: string,
  body: any,
  opts: PostOpts,
  diag: EndpointDiag,
): Promise<any> {
  const { maxAttempts, label } = opts;
  let attempt = 0;
  let lastErr: any = null;
  while (attempt < maxAttempts) {
    attempt++;
    try {
      const res = await withTimeout(
        fetch(`${BASE_URL}${path}`, {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }),
        STEP_TIMEOUT_MS,
        `POST ${path}`,
      );
      diag.status = res.status;
      if (res.status === 429) {
        diag.hit_429 = true;
        if (attempt < maxAttempts) {
          const retryAfterHeader = Number(res.headers.get("retry-after"));
          let backoff = DEFAULT_429_BACKOFF_MS;
          if (Number.isFinite(retryAfterHeader) && retryAfterHeader > 0) {
            const ms = retryAfterHeader * 1000;
            // Only respect if within budget; otherwise fall back to default.
            backoff = ms <= MAX_RETRY_AFTER_MS ? ms : DEFAULT_429_BACKOFF_MS;
          }
          console.warn(`[freeastroapi] ${label} 429 → wait ${backoff}ms (attempt ${attempt}/${maxAttempts})`);
          await sleep(backoff);
          continue;
        }
      }
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${path} HTTP ${res.status}: ${text.slice(0, 200)}`);
      }
      return await res.json();
    } catch (e: any) {
      lastErr = e;
      if (attempt >= maxAttempts) throw e;
      // Short backoff before retry for non-429 errors.
      await sleep(500);
    }
  }
  throw lastErr ?? new Error(`${path} failed`);
}


function stripInterpretation<T>(obj: T): T {
  // Recursively delete `interpretation` / `interpretations` keys anywhere in
  // the tree. FreeAstroAPI nests them inside bazi.interactions[], bazi.professional, etc.
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((v) => stripInterpretation(v)) as unknown as T;
  }
  if (typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (k === "interpretation" || k === "interpretations") continue;
      out[k] = stripInterpretation(v);
    }
    return out as T;
  }
  return obj;
}

function normalizePlanet(p: any): PlanetPosition {
  return {
    name: String(p?.name ?? p?.planet ?? "Unknown"),
    sign: normalizeSign(p?.sign),
    degree: typeof p?.degree === "number" ? p.degree : Number(p?.degree ?? 0),
    house: p?.house ?? null,
    retrograde: !!p?.retrograde,
    speed: typeof p?.speed === "number" ? p.speed : null,
    dignity: p?.dignity ?? null,
  };
}

function normalizeHouse(h: any): HouseCusp {
  return {
    house: Number(h?.house ?? h?.number ?? 0),
    sign: normalizeSign(h?.sign),
    degree: typeof h?.degree === "number" ? h.degree : Number(h?.degree ?? 0),
  };
}

// Strip "(T)" / "(N)" suffix that FreeAstroAPI transits API appends.
function stripSideSuffix(s: string): { name: string; side: "T" | "N" | null } {
  const m = s.match(/^(.*?)\s*\((T|N)\)\s*$/);
  if (m) return { name: m[1].trim(), side: m[2] as "T" | "N" };
  return { name: s.trim(), side: null };
}

function normalizeAspect(a: any): AspectRow & { high_priority?: boolean; _transit_name?: string } {
  // FreeAstroAPI uses different field names per endpoint (a/b, from/to,
  // planet1/planet2, transit_planet/natal_planet, p1/p2). Try them all.
  const aRaw = String(
    a?.a ?? a?.from ?? a?.planet1 ?? a?.transit_planet ?? a?.p1 ?? a?.first ?? "",
  );
  const bRaw = String(
    a?.b ?? a?.to ?? a?.planet2 ?? a?.natal_planet ?? a?.p2 ?? a?.second ?? "",
  );
  const aP = stripSideSuffix(aRaw);
  const bP = stripSideSuffix(bRaw);
  // Detect transit body: explicit (T) marker, then explicit field, then default to b.
  let transitName = "";
  if (aP.side === "T") transitName = aP.name;
  else if (bP.side === "T") transitName = bP.name;
  else if (a?.transit_planet) transitName = String(a.transit_planet);
  return {
    a: aP.name,
    b: bP.name,
    type: String(a?.type ?? a?.aspect ?? "").toLowerCase(),
    orb: typeof a?.orb === "number" ? a.orb : Number(a?.orb ?? 0),
    is_major: a?.is_major === undefined ? undefined : !!a.is_major,
    is_applying: a?.is_applying === undefined ? undefined : !!a.is_applying,
    _transit_name: transitName || undefined,
  };
}

// ============================================================
// NATAL — critical
// ============================================================
async function fetchNatal(
  apiKey: string,
  input: NatalInput,
  diag: EndpointDiag,
): Promise<any> {
  const { y, m, d } = parseDate(input.date_of_birth);
  const tm = parseTime(input.birth_time ?? null);
  const body: Record<string, any> = {
    name: input.first_name ?? "User",
    year: y,
    month: m,
    day: d,
    time_known: !!input.birth_time_known,
    city: input.birth_city ?? "",
    lat: input.latitude,
    lng: input.longitude,
    tz_str: input.timezone || "AUTO",
    house_system: "placidus",
    zodiac_type: "tropical",
    include_speed: true,
    include_dignity: true,
    include_minor_aspects: false,
    include_stelliums: true,
    include_features: ["chiron", "lilith", "true_node"],
    interpretation: { enable: false },
  };
  if (input.birth_time_known && tm) {
    body.hour = tm.h;
    body.minute = tm.min;
  }
  return postJson(apiKey, "/api/v1/natal/calculate", body, {
    maxAttempts: NATAL_MAX_ATTEMPTS,
    label: "natal",
  }, diag);
}

// ============================================================
// TRANSITS — graceful
// ============================================================
async function fetchTransits(apiKey: string, input: NatalInput): Promise<any> {
  const { y, m, d } = parseDate(input.date_of_birth);
  const tm = parseTime(input.birth_time ?? null);
  const natalBody: Record<string, any> = {
    name: input.first_name ?? "User",
    city: input.birth_city ?? "",
    year: y,
    month: m,
    day: d,
    time_known: !!input.birth_time_known,
    lat: input.latitude,
    lng: input.longitude,
    tz_str: input.timezone || "AUTO",
  };
  if (input.birth_time_known && tm) {
    natalBody.hour = tm.h;
    natalBody.minute = tm.min;
  }
  const body = {
    natal: natalBody,
    transit_date: new Date().toISOString().slice(0, 16),
    current_city: input.birth_city ?? "",
    current_lat: input.latitude,
    current_lng: input.longitude,
    tz_str: input.timezone || "AUTO",
    orb_settings: {
      Conjunction: 8.0,
      Opposition: 8.0,
      Trine: 6.0,
      Square: 6.0,
      Sextile: 4.0,
    },
    interpretation: { enable: false },
  };
  return postJson(apiKey, "/api/v1/transits/calculate", body);
}

// ============================================================
// BAZI — graceful
// ============================================================
async function fetchBazi(apiKey: string, input: NatalInput): Promise<any> {
  // Never default sex. Without explicit M/F, BaZi luck-cycle direction would be wrong.
  // Throwing here causes the graceful catch to set bazi.available=false with this reason.
  if (input.bazi_sex !== "M" && input.bazi_sex !== "F") {
    throw new Error("missing_bazi_sex");
  }
  const { y, m, d } = parseDate(input.date_of_birth);
  const tm = parseTime(input.birth_time ?? null);
  // API requires hour/minute. If unknown, send 12:00 as placeholder and downgrade hour pillar.
  const hour = input.birth_time_known && tm ? tm.h : 12;
  const minute = input.birth_time_known && tm ? tm.min : 0;
  const body = {
    year: y,
    month: m,
    day: d,
    hour,
    minute,
    city: input.birth_city ?? "",
    lat: input.latitude,
    lng: input.longitude,
    sex: input.bazi_sex,
    time_standard: "true_solar",
    include_pinyin: true,
    include_stars: true,
    include_interactions: true,
    include_professional: true,
    interpretation: { enable: false },
  };
  return postJson(apiKey, "/api/v1/chinese/bazi", body);
}

// ============================================================
// SOLAR RETURN — graceful
// ============================================================
function computeSrYear(dob: string): number {
  const { y: _y, m, d } = parseDate(dob);
  const today = new Date();
  const birthdayThisYear = new Date(today.getFullYear(), m - 1, d);
  return today >= birthdayThisYear ? today.getFullYear() : today.getFullYear() - 1;
}

async function fetchSolarReturn(apiKey: string, input: NatalInput): Promise<any> {
  const { y, m, d } = parseDate(input.date_of_birth);
  const tm = parseTime(input.birth_time ?? null);
  const srYear = computeSrYear(input.date_of_birth);
  const natalBody: Record<string, any> = {
    name: input.first_name ?? "User",
    year: y,
    month: m,
    day: d,
    time_known: !!input.birth_time_known,
    location: {
      city: input.birth_city ?? "",
      lat: input.latitude,
      lng: input.longitude,
      timezone: input.timezone || "AUTO",
    },
  };
  if (input.birth_time_known && tm) {
    natalBody.hour = tm.h;
    natalBody.minute = tm.min;
  }
  const body = {
    natal: natalBody,
    solar_return: {
      year: srYear,
      location: {
        city: input.birth_city ?? "",
        lat: input.latitude,
        lng: input.longitude,
        timezone: input.timezone || "AUTO",
      },
      settings: {
        house_system: "placidus",
        zodiac_type: "Tropical",
        aspect_set: "major",
        node_type: "true",
      },
    },
    interpretation: { enable: false },
  };
  return postJson(apiKey, "/api/v1/western/solar/calculate", body);
}

// ============================================================
// Normalizers per block
// ============================================================
function buildNatalBlock(raw: any, hasHouses: boolean): DarrowChartData["natal"] {
  const cleaned = stripInterpretation(raw ?? {});
  const planetsRaw: any[] = Array.isArray(cleaned.planets) ? cleaned.planets : [];
  const planets = planetsRaw.map(normalizePlanet);
  const housesRaw: any[] = Array.isArray(cleaned.houses) ? cleaned.houses : [];
  const houses = hasHouses && housesRaw.length > 0 ? housesRaw.map(normalizeHouse) : null;
  const aspectsRaw: any[] = Array.isArray(cleaned.aspects) ? cleaned.aspects : [];
  // Core proof layer = major aspects only.
  const aspects = aspectsRaw
    .map(normalizeAspect)
    .filter((a) => a.is_major !== false);

  const angles = cleaned.angles_details ?? cleaned.angles ?? null;
  const ascendant = hasHouses && angles?.asc
    ? { name: "Ascendant", sign: normalizeSign(angles.asc.sign), degree: Number(angles.asc.degree ?? 0), house: 1 }
    : null;
  const midheaven = hasHouses && angles?.mc
    ? { name: "Midheaven", sign: normalizeSign(angles.mc.sign), degree: Number(angles.mc.degree ?? 0), house: 10 }
    : null;

  const findPlanet = (name: string) =>
    planets.find((p) => p.name.toLowerCase() === name.toLowerCase()) ?? {
      name,
      sign: "",
      degree: 0,
      house: null,
      retrograde: false,
    };

  const angles_details = hasHouses
    ? {
        asc: angles?.asc ? { sign: normalizeSign(angles.asc.sign), degree: Number(angles.asc.degree ?? 0) } : null,
        mc: angles?.mc ? { sign: normalizeSign(angles.mc.sign), degree: Number(angles.mc.degree ?? 0) } : null,
        ic: angles?.ic ? { sign: normalizeSign(angles.ic.sign), degree: Number(angles.ic.degree ?? 0) } : null,
        desc: angles?.desc ? { sign: normalizeSign(angles.desc.sign), degree: Number(angles.desc.degree ?? 0) } : null,
      }
    : null;

  // Validation warnings (logged only).
  if (hasHouses && angles_details?.asc && houses && houses[0] && angles_details.asc.sign !== houses[0].sign) {
    console.warn("[freeastroapi] ASC sign mismatch with house 1", angles_details.asc.sign, houses[0].sign);
  }
  if (hasHouses && angles_details?.mc && houses && houses[9] && angles_details.mc.sign !== houses[9].sign) {
    console.warn("[freeastroapi] MC sign mismatch with house 10", angles_details.mc.sign, houses[9].sign);
  }

  return {
    sun: findPlanet("Sun"),
    moon: findPlanet("Moon"),
    ascendant,
    midheaven,
    planets,
    houses,
    aspects,
    angles_details,
    stelliums: cleaned.stelliums ?? null,
    confidence: cleaned.confidence ?? null,
  };
}

const HIGH_PRIORITY_TRANSITERS = new Set(["jupiter", "saturn", "uranus", "neptune", "pluto"]);

function buildTransitsBlock(raw: any): TransitsBlock {
  const cleaned = stripInterpretation(raw ?? {});
  const transitsRaw: any[] = Array.isArray(cleaned.transit_planets) ? cleaned.transit_planets : [];
  const natalsRaw: any[] = Array.isArray(cleaned.natal_planets) ? cleaned.natal_planets : [];
  const aspectsRaw: any[] = Array.isArray(cleaned.aspects) ? cleaned.aspects : [];
  const aspects = aspectsRaw
    .map(normalizeAspect)
    .filter((a) => a.is_major !== false && a.orb <= 6.0)
    .map((a) => {
      const transitName = (a._transit_name ?? a.b ?? "").toLowerCase();
      const high = HIGH_PRIORITY_TRANSITERS.has(transitName);
      // Drop internal helper before persistence.
      const { _transit_name, ...rest } = a;
      return { ...rest, high_priority: high };
    });
  return {
    available: true,
    transit_date: cleaned.transit_date ?? new Date().toISOString().slice(0, 16),
    transit_planets: transitsRaw.map(normalizePlanet),
    natal_planets: natalsRaw.map(normalizePlanet),
    aspects,
    aspects_summary: cleaned.aspects_summary ?? null,
  };
}

// Strip prose / advice / predictions but keep deterministic structured fields.
// Keeps day_master, pillars (with gan/zhi info + ten_gods), elements, current/luck_cycle,
// compact stars (name/pillar/zhi), compact interactions (id/type/scope/pillars/branches/transform_*),
// and a compact professional block (dm_strength/structure/favorable/unfavorable + numeric scores).
function compactPillar(p: any): any {
  if (!p || typeof p !== "object") return p;
  const { interpretation: _i, interpretations: _i2, ...rest } = p;
  return rest;
}

function compactStar(s: any): any {
  if (!s || typeof s !== "object") return null;
  return {
    name: s.name ?? null,
    pillar: s.pillar ?? null,
    zhi: s.zhi ?? null,
  };
}

function compactInteraction(it: any): any {
  if (!it || typeof it !== "object") return null;
  return {
    id: it.id ?? null,
    type: it.type ?? null,
    scope: it.scope ?? null,
    pillars: it.pillars ?? null,
    branches: it.branches ?? null,
    is_formed: it.is_formed ?? null,
    transform_level: it.transform_level ?? null,
    transform_to: it.transform_to ?? null,
  };
}

function compactProfessional(p: any): any {
  if (!p || typeof p !== "object") return null;
  const dbg = p.professional_debug ?? {};
  return {
    dm_strength: p.dm_strength ?? null,
    structure: p.structure ?? null,
    yong_shen_candidates: p.yong_shen_candidates ?? null,
    favorable_elements: p.favorable_elements ?? null,
    unfavorable_elements: p.unfavorable_elements ?? null,
    scores: {
      dm_strength_score: dbg.dm_strength_score ?? null,
      seasonal_factor: dbg.seasonal_factor ?? null,
      balance_ratio: dbg.balance_ratio ?? null,
    },
  };
}

function buildLuckCyclePillar(c: any): BaziLuckCycle {
  const gan = c?.gan ?? c?.stem?.chinese ?? c?.stem ?? "";
  const zhi = c?.zhi ?? c?.branch?.chinese ?? c?.branch ?? "";
  const ganInfo = c?.gan_info ?? (typeof c?.stem === "object" ? c.stem : null);
  const zhiInfo = c?.zhi_info ?? (typeof c?.branch === "object" ? c.branch : null);
  const startYear = Number(c?.start_year);
  const endYear = Number(
    c?.end_year ?? (Number.isFinite(startYear) ? startYear + 9 : NaN),
  );
  const startAge = c?.start_age != null ? Number(c.start_age) : null;
  const endAge =
    c?.end_age != null
      ? Number(c.end_age)
      : startAge != null
        ? startAge + 9
        : null;
  return {
    start_year: startYear,
    end_year: endYear,
    start_age: startAge,
    end_age: endAge,
    stem: {
      chinese: String(gan ?? ""),
      pinyin: c?.gan_pinyin ?? ganInfo?.pinyin ?? null,
      element: ganInfo?.element ?? null,
      polarity: ganInfo?.polarity ?? null,
      name: ganInfo?.name ?? null,
    },
    branch: {
      chinese: String(zhi ?? ""),
      pinyin: c?.zhi_pinyin ?? zhiInfo?.pinyin ?? null,
      element: zhiInfo?.element ?? null,
      polarity: zhiInfo?.polarity ?? null,
      zodiac: zhiInfo?.zodiac ?? null,
      name: zhiInfo?.name ?? null,
    },
    pillar_label: c?.gan_zhi ?? c?.pillar_label ?? null,
  };
}

function buildBaziBlock(raw: any, birthTimeKnown: boolean): BaziBlock {
  const cleaned = stripInterpretation(raw ?? {});
  const pillarsRaw = Array.isArray(cleaned.pillars) ? cleaned.pillars : [];
  // API returns pillars as array of { label, ... }; map to {year,month,day,hour}.
  const pillarsByLabel: Record<string, any> = {};
  for (const p of pillarsRaw) {
    if (p?.label) pillarsByLabel[String(p.label)] = compactPillar(p);
  }
  // Fallback if API uses object form.
  const pillarsObj =
    pillarsRaw.length === 0 && cleaned.pillars && typeof cleaned.pillars === "object"
      ? cleaned.pillars
      : pillarsByLabel;

  const luckCyclePillars: BaziLuckCycle[] = Array.isArray(cleaned?.luck_cycle?.pillars)
    ? cleaned.luck_cycle.pillars.map(buildLuckCyclePillar)
    : [];
  const now = new Date().getFullYear();
  const current =
    luckCyclePillars.find((c) => c.start_year <= now && now <= c.end_year) ?? null;

  const starsRaw: any[] = Array.isArray(cleaned.stars) ? cleaned.stars : [];
  const interactionsRaw: any[] = Array.isArray(cleaned.interactions)
    ? cleaned.interactions
    : [];

  return {
    available: true,
    birth_time_known: birthTimeKnown,
    hour_pillar_confidence: birthTimeKnown ? "high" : "low",
    hour_pillar_used_for_interpretation: birthTimeKnown,
    day_master: cleaned.day_master ?? null,
    pillars: {
      year: pillarsObj.year,
      month: pillarsObj.month,
      day: pillarsObj.day,
      hour: pillarsObj.hour,
    },
    elements: cleaned.elements
      ? {
          percentages: cleaned.elements.percentages ?? undefined,
          dominant: cleaned.elements.dominant ?? null,
          deficient: cleaned.elements.deficient ?? null,
        }
      : undefined,
    luck_cycle: { pillars: luckCyclePillars },
    current_luck_cycle: current,
    stars: starsRaw.map(compactStar).filter(Boolean),
    interactions: interactionsRaw.map(compactInteraction).filter(Boolean),
    professional: compactProfessional(cleaned.professional),
  };
}

function buildSolarReturnBlock(raw: any, year: number): SolarReturnBlock {
  const cleaned = stripInterpretation(raw ?? {});
  const planetsRaw: any[] = Array.isArray(cleaned.planets) ? cleaned.planets : [];
  const angles = cleaned.angles_details ?? cleaned.angles ?? null;
  const comp = cleaned.natal_comparison ?? {};
  const aspectsRaw: any[] = Array.isArray(comp.aspects) ? comp.aspects : [];
  const aspects = aspectsRaw
    .map(normalizeAspect)
    .filter((a) => a.orb <= 5.0)
    .sort((x, y) => x.orb - y.orb)
    .slice(0, 25);
  const angularityRaw: any[] = Array.isArray(comp.angularity) ? comp.angularity : [];
  const angularity = angularityRaw
    .map((e: any) => ({
      planet: String(e.planet ?? ""),
      angle: String(e.angle ?? ""),
      orb: Number(e.orb ?? 99),
    }))
    .filter((e) => e.orb <= 3.0);

  return {
    available: true,
    exact_return_moment: cleaned.exact_return_moment ?? cleaned.return_moment ?? null,
    year,
    planets: planetsRaw.map(normalizePlanet),
    angles_details: angles
      ? {
          asc: angles.asc ? { sign: normalizeSign(angles.asc.sign), degree: Number(angles.asc.degree ?? 0) } : null,
          mc: angles.mc ? { sign: normalizeSign(angles.mc.sign), degree: Number(angles.mc.degree ?? 0) } : null,
          ic: angles.ic ? { sign: normalizeSign(angles.ic.sign), degree: Number(angles.ic.degree ?? 0) } : null,
          desc: angles.desc ? { sign: normalizeSign(angles.desc.sign), degree: Number(angles.desc.degree ?? 0) } : null,
        }
      : null,
    natal_comparison: {
      aspects,
      house_overlay: comp.house_overlay ?? null,
      angularity,
    },
  };
}

// ============================================================
// Provider class
// ============================================================
export class FreeAstroAPIProvider implements AstroProvider {
  name = "freeastroapi";
  version = "freeastroapi-docs-2026-05-17";
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("FREEASTROAPI_KEY missing");
    this.apiKey = apiKey;
  }

  async computeNatal(input: NatalInput): Promise<DarrowChartData> {
    const hasHouses = !!input.birth_time_known;

    // Sequential calls with a fixed inter-call gap. Avoids the parallel-stagger
    // race where a Natal 429 retry collides with the next staggered call.
    // Natal is critical (throws); the other three are graceful (catch → __error).
    let natalRaw: any;
    try {
      natalRaw = await fetchNatal(this.apiKey, input);
    } catch (e: any) {
      throw new Error(`FreeAstroAPI natal failed: ${String(e?.message ?? e)}`);
    }

    await sleep(SEQUENTIAL_GAP_MS);
    const transitsResult: any = await fetchTransits(this.apiKey, input).catch((e) => ({
      __error: String(e?.message ?? e),
    }));

    await sleep(SEQUENTIAL_GAP_MS);
    const baziResult: any = await fetchBazi(this.apiKey, input).catch((e) => ({
      __error: String(e?.message ?? e),
    }));

    await sleep(SEQUENTIAL_GAP_MS);
    const solarResult: any = await fetchSolarReturn(this.apiKey, input).catch((e) => ({
      __error: String(e?.message ?? e),
    }));

    const natal = buildNatalBlock(natalRaw, hasHouses);

    const transits: TransitsBlock = (transitsResult as any)?.__error
      ? { available: false, reason: (transitsResult as any).__error }
      : buildTransitsBlock(transitsResult);

    const bazi: BaziBlock = (baziResult as any)?.__error
      ? { available: false, reason: (baziResult as any).__error }
      : buildBaziBlock(baziResult, !!input.birth_time_known);

    const srYear = computeSrYear(input.date_of_birth);
    const solar_return: SolarReturnBlock = (solarResult as any)?.__error
      ? { available: false, reason: (solarResult as any).__error }
      : buildSolarReturnBlock(solarResult, srYear);

    // Numerology — local computation (unchanged).
    const fullName = input.full_name_for_numerology ?? "";
    const numerology = {
      life_path: lifePath(input.date_of_birth),
      expression: fullName ? expressionNumber(fullName) : null,
      soul_urge: fullName ? soulUrgeNumber(fullName) : null,
      personality: fullName ? personalityNumber(fullName) : null,
      birth_day: birthDay(input.date_of_birth),
      personal_year: personalYear(input.date_of_birth),
      source: "computed" as const,
    };

    const birth_time_source: DarrowChartData["meta"]["birth_time_source"] = input.birth_time_known
      ? "exact"
      : "unknown";

    return {
      schema_version: "1.0",
      meta: {
        provider_name: this.name,
        provider_version: this.version,
        generated_at: new Date().toISOString(),
        timezone_used: input.timezone || "UTC",
        birth_time_source,
      },
      natal,
      numerology,
      bazi,
      transits,
      solar_return,
    };
  }
}
