// Shared types for the astrology provider layer.
// Extended in v2 for FreeAstroAPI: richer transits, bazi, solar_return blocks.
// Mock provider still produces a valid subset.

export type Polarity = "fire" | "earth" | "air" | "water";
export type Modality = "cardinal" | "fixed" | "mutable";

export interface NatalInput {
  date_of_birth: string; // YYYY-MM-DD
  birth_time?: string | null; // HH:MM:SS, null when birth_time_known=false
  birth_time_known: boolean;
  latitude: number;
  longitude: number;
  timezone: string;
  full_name_for_numerology?: string | null;
  // First name only — used by FreeAstroAPI as `name`. Not used for interpretation.
  first_name?: string | null;
  // BaZi requires M/F for luck-cycle direction. Optional in type, required in UI when bazi enabled.
  bazi_sex?: "M" | "F" | null;
  // City label sent to FreeAstroAPI requests.
  birth_city?: string | null;
}

export interface PlanetPosition {
  name: string;
  sign: string;
  degree: number;
  house?: number | null;
  retrograde?: boolean;
  speed?: number | null;
  dignity?: string | null;
}

export interface HouseCusp {
  house: number;
  sign: string;
  degree: number;
}

export interface AspectRow {
  a: string;
  b: string;
  type: string; // conjunction, opposition, trine, square, sextile
  orb: number;
  is_major?: boolean;
  is_applying?: boolean;
}

export interface NumerologyBlock {
  life_path: number | null;
  expression: number | null;
  soul_urge: number | null;
  personality: number | null;
  birth_day: number;
  personal_year: number;
  source: "computed" | "unavailable";
  notes?: string;
}

export interface BaziPillar {
  stem: string;
  branch: string;
  pinyin?: string | null;
}

export interface BaziLuckCycle {
  start_year: number;
  end_year: number;
  stem: string;
  branch: string;
  pinyin?: string | null;
}

export interface BaziBlock {
  available: boolean;
  reason?: string;
  birth_time_known?: boolean;
  hour_pillar_confidence?: "high" | "low";
  hour_pillar_used_for_interpretation?: boolean;
  day_master?: string | null;
  pillars?: {
    year?: BaziPillar;
    month?: BaziPillar;
    day?: BaziPillar;
    hour?: BaziPillar;
  };
  elements?: {
    percentages?: Record<string, number>;
    dominant?: string | null;
    deficient?: string | null;
  };
  luck_cycle?: {
    pillars?: BaziLuckCycle[];
  };
  current_luck_cycle?: BaziLuckCycle | null;
  stars?: any;
  interactions?: any;
  professional?: any;
  // Legacy fields kept for backward compatibility.
  year_pillar?: BaziPillar;
  month_pillar?: BaziPillar;
  day_pillar?: BaziPillar;
  hour_pillar?: BaziPillar;
}

export interface TransitsBlock {
  available: boolean;
  reason?: string;
  transit_date?: string;
  transit_planets?: PlanetPosition[];
  natal_planets?: PlanetPosition[];
  aspects?: Array<AspectRow & { high_priority?: boolean }>;
  aspects_summary?: any;
  // Legacy
  summary?: string;
  notable?: AspectRow[];
}

export interface SolarReturnBlock {
  available: boolean;
  reason?: string;
  exact_return_moment?: string | null;
  year?: number;
  planets?: PlanetPosition[];
  angles_details?: {
    asc?: { sign: string; degree: number } | null;
    mc?: { sign: string; degree: number } | null;
    ic?: { sign: string; degree: number } | null;
    desc?: { sign: string; degree: number } | null;
  } | null;
  natal_comparison?: {
    aspects?: AspectRow[];
    house_overlay?: any;
    angularity?: Array<{ planet: string; angle: string; orb: number }>;
  };
}

export interface DarrowChartData {
  schema_version: "1.0";
  meta: {
    provider_name: string;
    provider_version: string;
    generated_at: string;
    timezone_used: string;
    birth_time_source: "exact" | "noon_fallback" | "unknown";
  };
  natal: {
    sun: PlanetPosition;
    moon: PlanetPosition;
    ascendant?: PlanetPosition | null;
    midheaven?: PlanetPosition | null;
    planets: PlanetPosition[];
    houses?: HouseCusp[] | null;
    aspects: AspectRow[];
    angles_details?: {
      asc?: { sign: string; degree: number } | null;
      mc?: { sign: string; degree: number } | null;
      ic?: { sign: string; degree: number } | null;
      desc?: { sign: string; degree: number } | null;
    } | null;
    stelliums?: any;
    confidence?: any;
  };
  numerology: NumerologyBlock;
  bazi: BaziBlock;
  transits?: TransitsBlock | null;
  solar_return?: SolarReturnBlock | null;
}
