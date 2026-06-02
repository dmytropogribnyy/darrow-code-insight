// Deterministic mock astro provider — produces a normalized DarrowChartData
// from the natal input without calling any external API. Bazi is disabled
// by policy (no hallucinated pillars).

import type { AstroProvider } from "./provider";
import type { DarrowChartData, NatalInput, PlanetPosition, AspectRow } from "./types";
import { computeNumerology } from "@/lib/numerology/numerology";

const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function rng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function pickSign(r: () => number): string {
  return SIGNS[Math.floor(r() * 12)];
}

function planet(name: string, r: () => number, hasHouses: boolean): PlanetPosition {
  return {
    name,
    sign: pickSign(r),
    degree: Math.round(r() * 2999) / 100,
    house: hasHouses ? 1 + Math.floor(r() * 12) : null,
    retrograde: r() < 0.18,
  };
}

export class MockAstroProvider implements AstroProvider {
  name = "mock-darrow";
  version = "1.0.0";

  async computeNatal(input: NatalInput): Promise<DarrowChartData> {
    const seed = hashSeed(
      `${input.date_of_birth}|${input.birth_time ?? "noon"}|${input.latitude.toFixed(2)}|${input.longitude.toFixed(2)}`,
    );
    const r = rng(seed);
    const birth_time_source: "exact" | "noon_fallback" =
      input.birth_time_known && input.birth_time ? "exact" : "noon_fallback";
    const hasHouses = birth_time_source === "exact";

    const planets: PlanetPosition[] = [
      planet("Sun", r, hasHouses),
      planet("Moon", r, hasHouses),
      planet("Mercury", r, hasHouses),
      planet("Venus", r, hasHouses),
      planet("Mars", r, hasHouses),
      planet("Jupiter", r, hasHouses),
      planet("Saturn", r, hasHouses),
      planet("Uranus", r, hasHouses),
      planet("Neptune", r, hasHouses),
      planet("Pluto", r, hasHouses),
    ];

    const aspects: AspectRow[] = [];
    const types = ["conjunction", "trine", "square", "opposition", "sextile"];
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        if (r() < 0.18) {
          aspects.push({
            a: planets[i].name,
            b: planets[j].name,
            type: types[Math.floor(r() * types.length)],
            orb: Math.round(r() * 800) / 100,
          });
        }
      }
    }

    const sun = planets[0];
    const moon = planets[1];
    const ascendant = hasHouses
      ? { name: "Ascendant", sign: pickSign(r), degree: Math.round(r() * 2999) / 100, house: 1 }
      : null;
    const midheaven = hasHouses
      ? { name: "Midheaven", sign: pickSign(r), degree: Math.round(r() * 2999) / 100, house: 10 }
      : null;

    const houses = hasHouses
      ? Array.from({ length: 12 }, (_, i) => ({
          house: i + 1,
          sign: pickSign(r),
          degree: Math.round(r() * 2999) / 100,
        }))
      : null;

    const numerology = computeNumerology({
      date_of_birth: input.date_of_birth,
      full_name_for_numerology: input.full_name_for_numerology ?? null,
    });

    return {
      schema_version: "1.0",
      meta: {
        provider_name: this.name,
        provider_version: this.version,
        generated_at: new Date().toISOString(),
        timezone_used: input.timezone,
        birth_time_source,
      },
      natal: {
        sun,
        moon,
        ascendant,
        midheaven,
        planets,
        houses,
        aspects,
      },
      numerology,
      bazi: {
        available: false,
        reason: "Bazi provider is disabled in MVP. Do not interpret pillars.",
      },
      transits: null,
    };
  }
}
