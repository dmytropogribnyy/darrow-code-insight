// CONTENT-DEPTH-1 — tests that the enriched packet surfaces richer anchors (placement precision,
// BaZi depth, real YEAR timing), gated by availability, with absent data never producing an anchor.

import { describe, it, expect } from "vitest";
import { buildReportContextForModule } from "./build-report-context";

function richChart(over: any = {}): any {
  return {
    meta: { provider_name: "synthetic", birth_time_source: "exact" },
    natal: {
      sun: { name: "Sun", sign: "Capricorn", house: 4, retrograde: false, dignity: "peregrine" },
      moon: { name: "Moon", sign: "Pisces", house: 6, retrograde: false, dignity: "peregrine" },
      planets: [
        { name: "Sun", sign: "Capricorn", house: 4, dignity: "peregrine" },
        { name: "Moon", sign: "Pisces", house: 6 },
        { name: "Venus", sign: "Aquarius", house: 5, retrograde: true, dignity: "detriment" },
        { name: "Mars", sign: "Scorpio", house: 2, dignity: "domicile" },
        { name: "Jupiter", sign: "Taurus", house: 8 },
        { name: "Saturn", sign: "Virgo", house: 12 },
        { name: "Pluto", sign: "Scorpio", house: 2 },
      ],
      houses: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: "Aries", degree: 0 })),
      ascendant: { name: "Ascendant", sign: "Virgo" },
      aspects: [
        { a: "Venus", b: "Moon", type: "sextile", orb: 4.2, is_major: true, is_applying: false },
        { a: "Venus", b: "Mars", type: "square", orb: 1.1, is_major: true, is_applying: true },
      ],
    },
    numerology: {
      available: true,
      life_path: 4,
      birth_day_number: 1,
      personal_year: 6,
      personal_year_master_marker: null,
      name_numerology: { available: true, expression: 8, soul_urge: 7 },
    },
    bazi: {
      available: true,
      day_master: "Xin",
      elements: { dominant: "Metal", deficient: "Fire" },
      professional: { dm_strength: "strong", favorable_elements: ["Fire", "Wood"] },
      current_luck_cycle: { pillar_label: "Jia-Wu", start_age: 28, end_age: 38 },
    },
    transits: {
      available: true,
      aspects: [
        { a: "Saturn", b: "Sun", type: "square", orb: 2.0, high_priority: true },
        { a: "Mercury", b: "Moon", type: "trine", orb: 0.5, high_priority: false },
      ],
    },
    solar_return: {
      available: true,
      natal_comparison: { angularity: [{ planet: "Mars", angle: "MC", orb: 1.2 }] },
    },
    moon_phase: { available: true, phase: { name: "Full Moon" }, zodiac: { sign: "Leo" } },
    bazi_flow: { available: true, annual_pillar: { gan_zhi: "Jia-Chen", ten_god: "Wealth" } },
    ...over,
  };
}

describe("CONTENT-DEPTH-1 placement precision (A3)", () => {
  it("LOVE surfaces house + retrograde + meaningful dignity (birth time on)", () => {
    const a = buildReportContextForModule("LOVE", richChart()).allowedProofAnchorCandidates.join(
      " | ",
    );
    expect(a).toMatch(/Venus in Aquarius · 5H, retrograde, detriment/);
    expect(a).not.toMatch(/peregrine/); // meaningless dignity filtered
  });

  it("aspect anchors carry orb + applying, tightest first", () => {
    const a = buildReportContextForModule("LOVE", richChart()).allowedProofAnchorCandidates;
    const venusMars = a.find((s) => s.includes("Venus square Mars"));
    expect(venusMars).toMatch(/orb 1\.1°, applying/);
    // Venus square Mars (orb 1.1) should come before Venus sextile Moon (orb 4.2)
    expect(a.indexOf(venusMars!)).toBeLessThan(
      a.findIndex((s) => s.includes("Venus sextile Moon")),
    );
  });

  it("birth-time gating: no houses -> no house detail in anchors", () => {
    const noTime = richChart({
      meta: { provider_name: "synthetic", birth_time_source: "unknown" },
      natal: { ...richChart().natal, houses: [], ascendant: undefined },
    });
    const a = buildReportContextForModule("LOVE", noTime).allowedProofAnchorCandidates.join(" | ");
    expect(a).toMatch(/Venus in Aquarius/);
    expect(a).not.toMatch(/5H/); // house suppressed without birth time
  });
});

describe("CONTENT-DEPTH-1 BaZi depth (A2)", () => {
  it("MONEY surfaces DM strength + favorable elements + current luck cycle", () => {
    const a = buildReportContextForModule("MONEY", richChart()).allowedProofAnchorCandidates.join(
      " | ",
    );
    expect(a).toMatch(/BaZi Day Master Xin \(strong\)/);
    expect(a).toMatch(/BaZi dominant element Metal \(deficient: Fire\)/);
    expect(a).toMatch(/BaZi favorable elements Fire\/Wood/);
    expect(a).toMatch(/BaZi current luck cycle Jia-Wu/);
  });

  it("BaZi unavailable -> no BaZi anchors", () => {
    const noBazi = buildReportContextForModule("MONEY", richChart({ bazi: { available: false } }));
    expect(noBazi.allowedProofAnchorCandidates.join(" | ")).not.toMatch(/BaZi/);
  });
});

describe("CONTENT-DEPTH-1 YEAR real timing (A1)", () => {
  it("surfaces actual transits / solar-return / BaZi flow / moon phase, not a generic string", () => {
    const a = buildReportContextForModule("YEAR", richChart()).allowedProofAnchorCandidates.join(
      " | ",
    );
    expect(a).toMatch(/Personal Year 6/);
    expect(a).toMatch(/Transit Saturn square natal Sun, high-priority, orb 2\.0°/);
    expect(a).toMatch(/Solar Return Mars angular to MC/);
    expect(a).toMatch(/BaZi annual pillar Jia-Chen \(Ten God: Wealth\)/);
    expect(a).toMatch(/Moon phase Full Moon in Leo/);
    expect(a).not.toMatch(/current transit\/solar-return window/); // old generic string gone
  });

  it("YEAR without timing -> no timing anchors + forbidden lists them unavailable", () => {
    const ctx = buildReportContextForModule(
      "YEAR",
      richChart({
        transits: { available: false },
        solar_return: { available: false },
        bazi_flow: { available: false },
        moon_phase: { available: false },
      }),
    );
    expect(ctx.allowedProofAnchorCandidates.join(" | ")).not.toMatch(
      /Transit |Solar Return |Moon phase/,
    );
    expect(ctx.forbiddenAnchors.join(" | ")).toMatch(/timing \(unavailable\)/);
  });
});

describe("CONTENT-DEPTH-1 numerology depth (A4) + budget", () => {
  it("CORE surfaces birth day + soul urge; anchors capped", () => {
    const ctx = buildReportContextForModule("CORE", richChart());
    const a = ctx.allowedProofAnchorCandidates.join(" | ");
    expect(a).toMatch(/Birth Day 1/);
    expect(a).toMatch(/Soul Urge 7/);
    expect(ctx.allowedProofAnchorCandidates.length).toBeLessThanOrEqual(18);
  });
});
