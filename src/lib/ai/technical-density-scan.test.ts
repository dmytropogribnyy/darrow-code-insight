import { describe, it, expect } from "vitest";
import { scanTechnicalDensity, opensWithPlacement } from "./technical-density-scan";

describe("scanTechnicalDensity — hard violations (machinery in prose)", () => {
  it("flags exact orbs, degrees, the word orb, and percentages", () => {
    const v = scanTechnicalDensity(
      "The Moon squares Pluto at a tight 0.4-degree orb, and Earth is over 54% of the chart.",
    );
    const cats = v.hardViolations.map((x) => x.category);
    expect(cats).toContain("exact_degree");
    expect(cats).toContain("orb_word");
    expect(cats).toContain("percentage");
  });

  it("flags raw BaZi branch / life-stage / technique terms", () => {
    const v = scanTechnicalDensity(
      "A Yang Earth Day Master sitting in the Xu (Dog) branch at the Grave life stage, with ten gods active.",
    );
    const cats = v.hardViolations.map((x) => x.category);
    expect(cats).toContain("bazi_branch");
    expect(cats).toContain("bazi_life_stage");
    expect(cats).toContain("bazi_term");
  });

  it("flags meta-method narration", () => {
    const v = scanTechnicalDensity(
      "Five independent systems converge here. The numerology layer adds a precise overlay.",
    );
    expect(v.hardViolations.some((x) => x.category === "meta_method")).toBe(true);
  });

  it("clean human prose has zero hard violations + low machine density", () => {
    const human =
      "You do not move because the room gets loud. You move when the ground has proven it can hold you. " +
      "Other people sketch a plan and start the next morning; you commit late and hold long, and the things you build do not fall.";
    const v = scanTechnicalDensity(human);
    expect(v.hardViolations).toEqual([]);
    expect(v.machineWordsPer1000).toBeLessThan(20);
  });

  it("counts machine-word density (soft metric)", () => {
    const v = scanTechnicalDensity(
      "The architecture is a system. The system is a layer. The layer is the configuration mechanism.",
    );
    expect(v.machineWords.length).toBeGreaterThanOrEqual(5);
    expect(v.machineWordsPer1000).toBeGreaterThan(0);
  });
});

describe("opensWithPlacement — section-opener guard", () => {
  it("flags placement / mechanism-first openers", () => {
    for (const bad of [
      "Your Sun in the 9th house drives expansion.",
      "The Moon square Pluto compresses the emotional field.",
      "Mars in Sagittarius wants range.",
      "The 9th house stellium points outward.",
      "Yang Earth Day Master holds form.",
      "Your Day Master is strong.",
    ]) {
      expect(opensWithPlacement(bad), bad).toBe(true);
    }
  });

  it("does NOT flag human recognition / scene openers", () => {
    for (const good of [
      "You do not think in straight lines. You think in terrain.",
      "There is a moment you know well: you have already read the room.",
      "You are not difficult to be close to.",
      "The scene: you have been offered something that pays well.",
    ]) {
      expect(opensWithPlacement(good), good).toBe(false);
    }
  });
});
