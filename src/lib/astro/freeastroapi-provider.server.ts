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
  MoonPhaseBlock,
  BaziFlowBlock,
  BaziFlowMonthlyPillar,
} from "./types";
import { normalizeSign } from "./sign-normalizer";
import { computeNumerology } from "@/lib/numerology/numerology";

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
const GRACEFUL_STAGGER = { transits: 0, bazi: 250, solar: 500, moon: 750, baziflow: 1000 } as const;

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
async function fetchTransits(
  apiKey: string,
  input: NatalInput,
  diag: EndpointDiag,
): Promise<any> {
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
  return postJson(apiKey, "/api/v1/transits/calculate", body, {
    maxAttempts: GRACEFUL_MAX_ATTEMPTS,
    label: "transits",
  }, diag);
}

// ============================================================
// BAZI — graceful
// ============================================================
async function fetchBazi(
  apiKey: string,
  input: NatalInput,
  diag: EndpointDiag,
): Promise<any> {
  if (input.bazi_sex !== "M" && input.bazi_sex !== "F") {
    throw new Error("missing_bazi_sex");
  }
  const { y, m, d } = parseDate(input.date_of_birth);
  const tm = parseTime(input.birth_time ?? null);
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
  return postJson(apiKey, "/api/v1/chinese/bazi", body, {
    maxAttempts: GRACEFUL_MAX_ATTEMPTS,
    label: "bazi",
  }, diag);
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

async function fetchSolarReturn(
  apiKey: string,
  input: NatalInput,
  diag: EndpointDiag,
): Promise<any> {
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
  return postJson(apiKey, "/api/v1/western/solar/calculate", body, {
    maxAttempts: GRACEFUL_MAX_ATTEMPTS,
    label: "solar_return",
  }, diag);
}

// ============================================================
// MOON PHASE — graceful enrichment
// ============================================================
async function fetchMoonPhase(
  apiKey: string,
  input: NatalInput,
  diag: EndpointDiag,
): Promise<any> {
  const now = new Date();
  const params = new URLSearchParams({
    date: now.toISOString().slice(0, 10),
    lat: String(input.latitude),
    lon: String(input.longitude),
    tz_str: input.timezone || "UTC",
    include_zodiac: "true",
    include_special: "true",
    include_eclipse: "true",
    include_forecast: "true",
    include_traditional_moon: "true",
    include_visuals: "false",
    include_interpretation: "false",
  });
  const url = `/api/v1/moon/phase?${params.toString()}`;
  let attempt = 0;
  let lastErr: any = null;
  while (attempt < GRACEFUL_MAX_ATTEMPTS) {
    attempt++;
    try {
      const res = await withTimeout(
        fetch(`${BASE_URL}${url}`, {
          method: "GET",
          headers: { "x-api-key": apiKey },
        }),
        STEP_TIMEOUT_MS,
        `GET /api/v1/moon/phase`,
      );
      diag.status = res.status;
      if (res.status === 429) {
        diag.hit_429 = true;
        if (attempt < GRACEFUL_MAX_ATTEMPTS) {
          const ra = Number(res.headers.get("retry-after"));
          const backoff =
            Number.isFinite(ra) && ra > 0 && ra * 1000 <= MAX_RETRY_AFTER_MS
              ? ra * 1000
              : DEFAULT_429_BACKOFF_MS;
          await sleep(backoff);
          continue;
        }
      }
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`moon/phase HTTP ${res.status}: ${text.slice(0, 200)}`);
      }
      return await res.json();
    } catch (e: any) {
      lastErr = e;
      if (attempt >= GRACEFUL_MAX_ATTEMPTS) throw e;
      await sleep(400);
    }
  }
  throw lastErr ?? new Error("moon/phase failed");
}

// ============================================================
// BAZI FLOW — graceful enrichment (single year, summary mode)
// ============================================================
async function fetchBaziFlow(
  apiKey: string,
  input: NatalInput,
  diag: EndpointDiag,
): Promise<any> {
  if (input.bazi_sex !== "M" && input.bazi_sex !== "F") {
    throw new Error("missing_bazi_sex");
  }
  const { y, m, d } = parseDate(input.date_of_birth);
  const tm = parseTime(input.birth_time ?? null);
  const hour = input.birth_time_known && tm ? tm.h : 12;
  const minute = input.birth_time_known && tm ? tm.min : 0;
  const currentYear = new Date().getFullYear();
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
    target_year: currentYear,
    target_year_end: currentYear,
    mode: "summary",
    include: ["interactions", "stars"],
    dictionary_response: false,
    interpretation: { enable: false },
  };
  return postJson(apiKey, "/api/v1/chinese/bazi/flow", body, {
    maxAttempts: GRACEFUL_MAX_ATTEMPTS,
    label: "bazi_flow",
  }, diag);
}
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

function buildMoonPhaseBlock(raw: any): MoonPhaseBlock {
  const cleaned = stripInterpretation(raw ?? {}) as any;
  const phase = cleaned.phase ?? cleaned.moon_phase ?? null;
  const zodiac = cleaned.zodiac ?? null;
  const special = cleaned.special_moon ?? cleaned.special ?? null;
  const eclipse = cleaned.eclipse ?? null;
  const tradMoon = cleaned.traditional_moon ?? cleaned.traditional ?? null;
  const forecast = cleaned.forecast ?? null;
  return {
    available: true,
    timestamp: cleaned.timestamp ?? cleaned.date ?? undefined,
    phase: phase
      ? {
          name: phase.name ?? phase.phase_name ?? undefined,
          illumination:
            typeof phase.illumination === "number"
              ? phase.illumination
              : typeof phase.illumination_percent === "number"
                ? phase.illumination_percent
                : undefined,
          age_days:
            typeof phase.age_days === "number"
              ? phase.age_days
              : typeof phase.age === "number"
                ? phase.age
                : undefined,
          phase_angle_deg:
            typeof phase.phase_angle_deg === "number"
              ? phase.phase_angle_deg
              : typeof phase.phase_angle === "number"
                ? phase.phase_angle
                : undefined,
          is_waxing:
            typeof phase.is_waxing === "boolean" ? phase.is_waxing : undefined,
        }
      : undefined,
    zodiac: zodiac
      ? {
          sign: zodiac.sign ? normalizeSign(zodiac.sign) : undefined,
          degree:
            typeof zodiac.degree === "number" ? zodiac.degree : undefined,
          zodiac_type: zodiac.zodiac_type ?? zodiac.type ?? undefined,
        }
      : undefined,
    next_phases: cleaned.next_phases ?? undefined,
    special_moon: special
      ? {
          labels: Array.isArray(special.labels) ? special.labels : undefined,
          is_supermoon:
            typeof special.is_supermoon === "boolean" ? special.is_supermoon : undefined,
          is_blue_moon:
            typeof special.is_blue_moon === "boolean" ? special.is_blue_moon : undefined,
          is_harvest_moon:
            typeof special.is_harvest_moon === "boolean" ? special.is_harvest_moon : undefined,
          is_hunter_moon:
            typeof special.is_hunter_moon === "boolean" ? special.is_hunter_moon : undefined,
        }
      : undefined,
    eclipse: eclipse
      ? {
          is_eclipse:
            typeof eclipse.is_eclipse === "boolean" ? eclipse.is_eclipse : undefined,
          is_blood_moon:
            typeof eclipse.is_blood_moon === "boolean" ? eclipse.is_blood_moon : undefined,
          type: eclipse.type ?? undefined,
          days_from_query:
            typeof eclipse.days_from_query === "number"
              ? eclipse.days_from_query
              : undefined,
        }
      : undefined,
    traditional_moon: tradMoon
      ? {
          name: tradMoon.name ?? undefined,
          month: tradMoon.month ?? undefined,
          is_current_full_moon:
            typeof tradMoon.is_current_full_moon === "boolean"
              ? tradMoon.is_current_full_moon
              : undefined,
        }
      : undefined,
    forecast: forecast
      ? {
          days_until_full_moon:
            typeof forecast.days_until_full_moon === "number"
              ? forecast.days_until_full_moon
              : undefined,
          days_until_new_moon:
            typeof forecast.days_until_new_moon === "number"
              ? forecast.days_until_new_moon
              : undefined,
          next_special_moon: forecast.next_special_moon ?? undefined,
          next_eclipse: forecast.next_eclipse ?? undefined,
        }
      : undefined,
  };
}

// Strip provider prose recursively; keep only compact structured fields.
function stripBaziFlowProse<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map((v) => stripBaziFlowProse(v)) as unknown as T;
  if (typeof obj === "object") {
    const drop = new Set([
      "interpretation",
      "interpretations",
      "rationale",
      "advice",
      "summary_text",
      "description",
      "long_description",
      "explanation",
      "narrative",
      "ai_summary",
    ]);
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (drop.has(k)) continue;
      out[k] = stripBaziFlowProse(v);
    }
    return out as T;
  }
  return obj;
}

function buildBaziFlowBlock(raw: any, birthTimeKnown: boolean): BaziFlowBlock {
  const cleaned = stripBaziFlowProse(raw ?? {}) as any;
  const annualRaw =
    cleaned.annual_pillar ?? cleaned.year_pillar ?? cleaned.annual ?? null;
  const annual_pillar = annualRaw
    ? {
        year:
          typeof annualRaw.year === "number"
            ? annualRaw.year
            : Number(annualRaw.year ?? cleaned.target_year),
        gan_zhi: annualRaw.gan_zhi ?? annualRaw.pillar ?? undefined,
        gan: annualRaw.gan ?? annualRaw.stem ?? undefined,
        zhi: annualRaw.zhi ?? annualRaw.branch ?? undefined,
        gan_pinyin: annualRaw.gan_pinyin ?? undefined,
        zhi_pinyin: annualRaw.zhi_pinyin ?? undefined,
        ten_god: annualRaw.ten_god ?? undefined,
      }
    : undefined;

  const monthlyRaw: any[] = Array.isArray(cleaned.monthly_pillars)
    ? cleaned.monthly_pillars
    : Array.isArray(cleaned.months)
      ? cleaned.months
      : [];
  const monthly_pillars: BaziFlowMonthlyPillar[] = monthlyRaw.map((m: any, i: number) => ({
    index: typeof m.index === "number" ? m.index : i + 1,
    name: m.name ?? m.label ?? undefined,
    gan_zhi: m.gan_zhi ?? m.pillar ?? undefined,
    gan: m.gan ?? m.stem ?? undefined,
    zhi: m.zhi ?? m.branch ?? undefined,
    ten_god: m.ten_god ?? undefined,
    interactions: Array.isArray(m.interactions) ? m.interactions : undefined,
    stars: Array.isArray(m.stars) ? m.stars : undefined,
  }));

  return {
    available: true,
    target_year:
      typeof cleaned.target_year === "number"
        ? cleaned.target_year
        : undefined,
    target_year_end:
      typeof cleaned.target_year_end === "number"
        ? cleaned.target_year_end
        : undefined,
    annual_pillar,
    monthly_pillars,
    interactions: Array.isArray(cleaned.interactions) ? cleaned.interactions : undefined,
    stars: Array.isArray(cleaned.stars) ? cleaned.stars : undefined,
    time_confidence: birthTimeKnown ? "exact" : "reduced",
  };
}

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

    // Hybrid strategy: Natal first (critical, sequential), then Transits/BaZi/Solar
    // concurrently with a small stagger via Promise.allSettled. Each graceful endpoint
    // has its own wall-time budget so the worker can never hang on a slow upstream.
    const mkDiag = (): EndpointDiag => ({
      elapsed_ms: 0,
      status: null,
      hit_429: false,
      available: false,
    });
    const diagNatal = mkDiag();
    const diagTransits = mkDiag();
    const diagBazi = mkDiag();
    const diagSolar = mkDiag();

    const run = async <T>(
      label: string,
      diag: EndpointDiag,
      fn: () => Promise<T>,
      budgetMs?: number,
    ): Promise<{ ok: true; value: T } | { ok: false; error: string }> => {
      const t0 = Date.now();
      console.log(`[freeastroapi] ${label} start`);
      try {
        const p = fn();
        const value = budgetMs ? await withTimeout(p, budgetMs, label) : await p;
        diag.elapsed_ms = Date.now() - t0;
        diag.available = true;
        console.log(
          `[freeastroapi] ${label} end elapsed=${diag.elapsed_ms}ms status=${diag.status} 429=${diag.hit_429} available=true`,
        );
        return { ok: true, value };
      } catch (e: any) {
        diag.elapsed_ms = Date.now() - t0;
        diag.available = false;
        diag.error = String(e?.message ?? e);
        console.warn(
          `[freeastroapi] ${label} end elapsed=${diag.elapsed_ms}ms status=${diag.status} 429=${diag.hit_429} available=false error=${diag.error}`,
        );
        return { ok: false, error: diag.error };
      }
    };

    // 1) Natal — critical. Abort if it fails.
    const natalRes = await run("natal", diagNatal, () =>
      fetchNatal(this.apiKey, input, diagNatal),
    );
    if (!natalRes.ok) {
      throw new Error(`FreeAstroAPI natal failed: ${natalRes.error}`);
    }
    const natalRaw = natalRes.value;

    // 2) Graceful endpoints — concurrent with stagger.
    const staggered = async <T>(delayMs: number, fn: () => Promise<T>): Promise<T> => {
      if (delayMs > 0) await sleep(delayMs);
      return fn();
    };

    const [transitsSettled, baziSettled, solarSettled] = await Promise.allSettled([
      staggered(GRACEFUL_STAGGER.transits, () =>
        run("transits", diagTransits, () => fetchTransits(this.apiKey, input, diagTransits), GRACEFUL_ENDPOINT_BUDGET_MS),
      ),
      staggered(GRACEFUL_STAGGER.bazi, () =>
        run("bazi", diagBazi, () => fetchBazi(this.apiKey, input, diagBazi), GRACEFUL_ENDPOINT_BUDGET_MS),
      ),
      staggered(GRACEFUL_STAGGER.solar, () =>
        run("solar_return", diagSolar, () => fetchSolarReturn(this.apiKey, input, diagSolar), GRACEFUL_ENDPOINT_BUDGET_MS),
      ),
    ]);

    const extract = <T,>(
      s: PromiseSettledResult<{ ok: true; value: T } | { ok: false; error: string }>,
    ): T | { __error: string } => {
      if (s.status === "rejected") return { __error: String(s.reason?.message ?? s.reason) };
      return s.value.ok ? s.value.value : { __error: s.value.error };
    };
    const transitsResult = extract(transitsSettled) as any;
    const baziResult = extract(baziSettled) as any;
    const solarResult = extract(solarSettled) as any;

    const natal = buildNatalBlock(natalRaw, hasHouses);

    const transits: TransitsBlock = transitsResult?.__error
      ? { available: false, reason: transitsResult.__error }
      : buildTransitsBlock(transitsResult);

    const bazi: BaziBlock = baziResult?.__error
      ? { available: false, reason: baziResult.__error }
      : buildBaziBlock(baziResult, !!input.birth_time_known);

    const srYear = computeSrYear(input.date_of_birth);
    const solar_return: SolarReturnBlock = solarResult?.__error
      ? { available: false, reason: solarResult.__error }
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

    const endpoint_timing_ms: Record<string, number> = {
      natal: diagNatal.elapsed_ms,
      transits: diagTransits.elapsed_ms,
      bazi: diagBazi.elapsed_ms,
      solar_return: diagSolar.elapsed_ms,
    };
    const endpoint_errors: Record<string, string> = {};
    if (diagTransits.error) endpoint_errors.transits = diagTransits.error;
    if (diagBazi.error) endpoint_errors.bazi = diagBazi.error;
    if (diagSolar.error) endpoint_errors.solar_return = diagSolar.error;

    return {
      schema_version: "1.0",
      meta: {
        provider_name: this.name,
        provider_version: this.version,
        generated_at: new Date().toISOString(),
        timezone_used: input.timezone || "UTC",
        birth_time_source,
        endpoint_timing_ms,
        endpoint_errors,
      },
      natal,
      numerology,
      bazi,
      transits,
      solar_return,
    };
  }
}
