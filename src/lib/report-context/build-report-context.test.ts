// MATERIAL-PACK-1 — material/context builder tests (synthetic fixtures, no AI/Stripe/provider).

import { describe, it, expect } from "vitest";
import { buildReportContextForModule } from "./build-report-context";

const PLANETS = [
  { name: "Sun", sign: "Aries" },
  { name: "Moon", sign: "Cancer" },
  { name: "Mercury", sign: "Pisces" },
  { name: "Venus", sign: "Taurus" },
  { name: "Mars", sign: "Leo" },
  { name: "Jupiter", sign: "Gemini" },
  { name: "Saturn", sign: "Capricorn" },
  { name: "Pluto", sign: "Scorpio" },
];

function chart(over: any = {}): any {
  return {
    meta: { provider_name: "freeastroapi", birth_time_source: "exact", ...(over.meta ?? {}) },
    natal: {
      sun: { name: "Sun", sign: "Aries" },
      moon: { name: "Moon", sign: "Cancer" },
      planets: PLANETS,
      houses: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: "Aries", degree: 0 })),
      ascendant: { name: "Ascendant", sign: "Leo" },
      aspects: [{ a: "Venus", b: "Mars", type: "trine", is_major: true }],
      ...(over.natal ?? {}),
    },
    numerology: {
      available: true,
      life_path: 7,
      birth_day_number: 3,
      personal_year: 5,
      name_numerology: {
        available: true,
        expression: 8,
        soul_urge: 2,
        personality: 6,
        meanings: { expression: { core: "x" } },
      },
      ...(over.numerology ?? {}),
    },
    bazi: {
      available: true,
      day_master: "Gui",
      elements: { dominant: "Water" },
      ...(over.bazi ?? {}),
    },
    transits: over.transits ?? {
      available: true,
      aspects: [{ a: "Saturn", b: "Sun", high_priority: true }],
    },
    solar_return: over.solar_return ?? {
      available: true,
      planets: [{}],
      natal_comparison: { angularity: [{}] },
    },
    moon_phase: over.moon_phase ?? { available: true, phase: {}, zodiac: {}, forecast: {} },
    bazi_flow: over.bazi_flow ?? {
      available: true,
      usable: true,
      annual_pillar: {},
      monthly_pillars: [{}],
    },
  };
}

describe("MATERIAL-PACK-1 — full data", () => {
  it("CORE includes placements, Life Path, BaZi Day Master; houses included", () => {
    const ctx = buildReportContextForModule("CORE", chart(), { first_name: "Alex" });
    expect(ctx.housesIncluded).toBe(true);
    expect(ctx.baziIncluded).toBe(true);
    expect(ctx.nameNumerologyIncluded).toBe(true);
    const a = ctx.allowedProofAnchorCandidates.join(" | ");
    expect(a).toMatch(/Sun in Aries/);
    expect(a).toMatch(/Life Path 7/);
    expect(a).toMatch(/Day Master Gui/);
  });

  it("LOVE derives Venus/Mars/Moon + their aspect", () => {
    const ctx = buildReportContextForModule("LOVE", chart());
    const a = ctx.allowedProofAnchorCandidates.join(" | ");
    expect(a).toMatch(/Venus in Taurus/);
    expect(a).toMatch(/Mars in Leo/);
    expect(a).toMatch(/Venus trine Mars/);
  });
});

describe("MATERIAL-PACK-1 — no birth time (houses/angles excluded)", () => {
  it("houses excluded; forbidden anchors include houses/angles; no ASC anchor", () => {
    const c = chart({
      meta: { birth_time_source: "unknown" },
      natal: {
        houses: null,
        ascendant: null,
        midheaven: null,
        angles_details: null,
        sun: { sign: "Aries" },
        moon: { sign: "Cancer" },
        planets: PLANETS,
        aspects: [],
      },
    });
    const ctx = buildReportContextForModule("LOVE", c);
    expect(ctx.housesIncluded).toBe(false);
    expect(ctx.forbiddenAnchors.join(" ")).toMatch(/house \/ angle|no birth time/i);
    expect(ctx.allowedProofAnchorCandidates.join(" ")).not.toMatch(/Ascendant/);
  });
});

describe("MATERIAL-PACK-1 — no full name (name numerology excluded)", () => {
  it("name numerology excluded + forbidden", () => {
    const ctx = buildReportContextForModule(
      "CORE",
      chart({ numerology: { name_numerology: { available: false } } }),
    );
    expect(ctx.nameNumerologyIncluded).toBe(false);
    expect(ctx.numerologyMeanings).toBeUndefined();
    expect(ctx.forbiddenAnchors.join(" ")).toMatch(/Expression \/ Soul Urge \/ Personality/);
    expect(ctx.allowedProofAnchorCandidates.join(" ")).not.toMatch(/Expression \d/);
  });
});

describe("MATERIAL-PACK-1 — missing bazi_sex (BaZi unavailable)", () => {
  it("BaZi excluded + forbidden", () => {
    const ctx = buildReportContextForModule(
      "CORE",
      chart({ bazi: { available: false, reason: "missing_bazi_sex" } }),
    );
    expect(ctx.baziIncluded).toBe(false);
    expect(ctx.forbiddenAnchors.join(" ")).toMatch(/BaZi/);
    expect(ctx.allowedProofAnchorCandidates.join(" ")).not.toMatch(/Day Master/);
  });
});

describe("MATERIAL-PACK-1 — module-specific forbidden claims/anchors", () => {
  it("STYLE forbids colors/stones; PLACE forbids astrocartography; BODY forbids medical; LOVE forbids compatibility", () => {
    const style = buildReportContextForModule("STYLE", chart());
    expect(style.forbiddenAnchors.join(" ").toLowerCase()).toMatch(/colors\/stones|colors/);
    const place = buildReportContextForModule("PLACE", chart());
    expect(place.forbiddenAnchors.join(" ").toLowerCase()).toMatch(/astrocartography|city/);
    const body = buildReportContextForModule("BODY", chart());
    expect(body.forbiddenAnchors.join(" ").toLowerCase()).toMatch(/medical/);
    const love = buildReportContextForModule("LOVE", chart());
    expect(love.forbiddenAnchors.join(" ").toLowerCase()).toMatch(/synastry|compatibility/);
    // Global do-not-claim list always present.
    expect(style.forbiddenClaims.join(" ")).toMatch(/Japanese astrology/);
  });
});

describe("MATERIAL-PACK-1 — YEAR timing unavailable", () => {
  it("timing excluded, fallback to Personal Year only", () => {
    const ctx = buildReportContextForModule(
      "YEAR",
      chart({
        transits: { available: false },
        solar_return: { available: false },
        bazi_flow: { available: false },
      }),
    );
    expect(ctx.timingIncluded).toBe(false);
    expect(ctx.allowedProofAnchorCandidates.join(" ")).toMatch(/Personal Year 5/);
    expect(ctx.forbiddenAnchors.join(" ")).toMatch(/timing/);
    expect(ctx.missingDataFallback.toLowerCase()).toMatch(/personal year theme only/);
  });
});
