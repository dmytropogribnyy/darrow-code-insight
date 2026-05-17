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
const STEP_TIMEOUT_MS = 45_000;
const MAX_RETRIES = 3;

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

async function postJson(apiKey: string, path: string, body: any): Promise<any> {
  let attempt = 0;
  let lastErr: any = null;
  while (attempt < MAX_RETRIES) {
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
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("retry-after")) || 0;
        const backoff = retryAfter > 0
          ? retryAfter * 1000
          : Math.min(8000, 500 * 2 ** attempt) + Math.floor(Math.random() * 400);
        if (attempt < MAX_RETRIES) {
          await sleep(backoff);
          continue;
        }
      }
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${path} HTTP ${res.status}: ${text.slice(0, 300)}`);
      }
      return await res.json();
    } catch (e: any) {
      lastErr = e;
      if (attempt >= MAX_RETRIES) throw e;
      await sleep(Math.min(4000, 400 * 2 ** attempt));
    }
  }
  throw lastErr ?? new Error(`${path} failed`);
}

function stripInterpretation<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;
  const clone: any = Array.isArray(obj) ? [...obj] : { ...obj };
  delete clone.interpretation;
  delete clone.interpretations;
  return clone;
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

function normalizeAspect(a: any): AspectRow & { high_priority?: boolean } {
  // FreeAstroAPI uses different field names per endpoint (a/b, from/to,
  // planet1/planet2, transit_planet/natal_planet, p1/p2). Try them all.
  const aName =
    a?.a ?? a?.from ?? a?.planet1 ?? a?.transit_planet ?? a?.p1 ?? a?.first ?? "";
  const bName =
    a?.b ?? a?.to ?? a?.planet2 ?? a?.natal_planet ?? a?.p2 ?? a?.second ?? "";
  return {
    a: String(aName),
    b: String(bName),
    type: String(a?.type ?? a?.aspect ?? "").toLowerCase(),
    orb: typeof a?.orb === "number" ? a.orb : Number(a?.orb ?? 0),
    is_major: a?.is_major === undefined ? undefined : !!a.is_major,
    is_applying: a?.is_applying === undefined ? undefined : !!a.is_applying,
  };
}

// ============================================================
// NATAL — critical
// ============================================================
async function fetchNatal(apiKey: string, input: NatalInput): Promise<any> {
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
  return postJson(apiKey, "/api/v1/natal/calculate", body);
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
      // High priority if transit body (a) is outer/Jupiter+.
      const transitName = a.a.toLowerCase();
      const high = HIGH_PRIORITY_TRANSITERS.has(transitName);
      return { ...a, high_priority: high };
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

function buildBaziBlock(raw: any, birthTimeKnown: boolean): BaziBlock {
  const cleaned = stripInterpretation(raw ?? {});
  const pillars = cleaned.pillars ?? {};
  const luckCyclePillars: BaziLuckCycle[] = Array.isArray(cleaned?.luck_cycle?.pillars)
    ? cleaned.luck_cycle.pillars.map((c: any) => ({
        start_year: Number(c.start_year),
        end_year: Number(c.end_year),
        stem: String(c.stem ?? ""),
        branch: String(c.branch ?? ""),
        pinyin: c.pinyin ?? null,
      }))
    : [];
  const now = new Date().getFullYear();
  const current = luckCyclePillars.find((c) => c.start_year <= now && now <= c.end_year) ?? null;

  return {
    available: true,
    birth_time_known: birthTimeKnown,
    hour_pillar_confidence: birthTimeKnown ? "high" : "low",
    hour_pillar_used_for_interpretation: birthTimeKnown,
    day_master: cleaned.day_master ?? null,
    pillars: {
      year: pillars.year,
      month: pillars.month,
      day: pillars.day,
      hour: pillars.hour,
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
    stars: cleaned.stars ?? null,
    interactions: cleaned.interactions ?? null,
    professional: cleaned.professional ?? null,
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

    // Natal is critical; others graceful.
    const natalP = fetchNatal(this.apiKey, input);
    const transitsP = fetchTransits(this.apiKey, input).catch((e) => ({ __error: String(e?.message ?? e) }));
    const baziP = fetchBazi(this.apiKey, input).catch((e) => ({ __error: String(e?.message ?? e) }));
    const solarP = fetchSolarReturn(this.apiKey, input).catch((e) => ({ __error: String(e?.message ?? e) }));

    let natalRaw: any;
    try {
      natalRaw = await natalP;
    } catch (e: any) {
      throw new Error(`FreeAstroAPI natal failed: ${String(e?.message ?? e)}`);
    }

    const [transitsResult, baziResult, solarResult] = await Promise.all([transitsP, baziP, solarP]);

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
