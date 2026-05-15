// Shared types for the astrology provider layer.

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
}

export interface PlanetPosition {
  name: string;
  sign: string;
  degree: number;
  house?: number | null;
  retrograde?: boolean;
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

export interface BaziBlock {
  available: boolean;
  reason?: string;
  year_pillar?: { stem: string; branch: string };
  month_pillar?: { stem: string; branch: string };
  day_pillar?: { stem: string; branch: string };
  hour_pillar?: { stem: string; branch: string };
}

export interface DarrowChartData {
  schema_version: "1.0";
  meta: {
    provider_name: string;
    provider_version: string;
    generated_at: string;
    timezone_used: string;
    birth_time_source: "exact" | "noon_fallback";
  };
  natal: {
    sun: PlanetPosition;
    moon: PlanetPosition;
    ascendant?: PlanetPosition | null;
    midheaven?: PlanetPosition | null;
    planets: PlanetPosition[];
    houses?: HouseCusp[] | null;
    aspects: AspectRow[];
  };
  numerology: NumerologyBlock;
  bazi: BaziBlock;
  transits?: {
    summary: string;
    notable: AspectRow[];
  } | null;
}
