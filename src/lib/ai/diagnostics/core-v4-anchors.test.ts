// B5.3-A — anchor / data-availability validation tests (no AI, no network).

import { describe, it, expect } from "vitest";
import {
  validateAnchors,
  deriveAnchorAvailability,
  type AnchorAvailability,
} from "./core-v4-anchors";

const FULL: AnchorAvailability = {
  birthTimeKnown: true,
  baziAvailable: false,
  nameNumerologyAvailable: true,
  personalYear: 5,
};

// Build a core module carrying one section (validateAnchors scans present keys).
const core = (key: string, prose: string, proof_tags: string[] = []) => ({
  schema_version: "core_v4",
  [key]: { prose, proof_tags },
});

describe("B5.3-A — deriveAnchorAvailability", () => {
  it("reads birth_time_known, bazi.available, name numerology, personal_year", () => {
    const chart = {
      bazi: { available: false },
      numerology: { personal_year: 7, name_numerology: { available: true } },
    };
    const natal = { birth_time_known: true, full_name_for_numerology: "A B" };
    const a = deriveAnchorAvailability(chart, natal);
    expect(a).toEqual({
      birthTimeKnown: true,
      baziAvailable: false,
      nameNumerologyAvailable: true,
      personalYear: 7,
    });
  });

  it("name numerology unavailable when full name is absent", () => {
    const a = deriveAnchorAvailability(
      { bazi: { available: false }, numerology: { personal_year: 1 } },
      { birth_time_known: true, full_name_for_numerology: null },
    );
    expect(a.nameNumerologyAvailable).toBe(false);
  });
});

describe("B5.3-A — validateAnchors", () => {
  it("PASSES when anchors match available data (no bazi, houses ok, name ok, year ok)", () => {
    const r = validateAnchors(
      core("orientation", "You read a room before you can explain it.", [
        "Sun in Cancer 7th house",
        "Life Path 4",
        "Personal Year 5",
      ]),
      FULL,
    );
    expect(r.pass).toBe(true);
    expect(r.violations).toHaveLength(0);
  });

  it("FAILS on BaZi mention when bazi.available=false", () => {
    const r = validateAnchors(
      core("core_architecture", "Your Gui Water Day Master sits at peak strength.", [
        "Gui Water Day Master",
      ]),
      FULL,
    );
    expect(r.pass).toBe(false);
    expect(r.violations.some((v) => v.kind === "forbidden_bazi")).toBe(true);
  });

  it("PASSES the same BaZi text when bazi IS available", () => {
    const r = validateAnchors(
      core("core_architecture", "Your Gui Water Day Master sits at peak strength.", [
        "Gui Water Day Master",
      ]),
      { ...FULL, baziAvailable: true },
    );
    expect(r.violations.some((v) => v.kind === "forbidden_bazi")).toBe(false);
  });

  it("FAILS on house / angle claims when birth_time_known=false", () => {
    const r = validateAnchors(
      core("orientation", "Your Sun in the 7th house, Ascendant in Pisces.", [
        "Ascendant in Pisces",
        "Moon in Scorpio, 11th house",
      ]),
      { ...FULL, birthTimeKnown: false },
    );
    expect(r.pass).toBe(false);
    expect(r.violations.some((v) => v.kind === "forbidden_house_angle")).toBe(true);
  });

  it("does NOT flag houses/angles when birth_time_known=true", () => {
    const r = validateAnchors(
      core("orientation", "Your Sun in the 7th house.", ["Ascendant in Pisces"]),
      FULL,
    );
    expect(r.violations.some((v) => v.kind === "forbidden_house_angle")).toBe(false);
  });

  it("FAILS on Expression / Soul Urge when full name is absent", () => {
    const r = validateAnchors(
      core("numerology_code", "Your Expression 4 and Soul Urge 7 pull in opposite directions.", [
        "Expression 4",
        "Soul Urge 7",
      ]),
      { ...FULL, nameNumerologyAvailable: false },
    );
    expect(r.pass).toBe(false);
    expect(r.violations.some((v) => v.kind === "forbidden_name_numerology")).toBe(true);
  });

  it("allows Life Path / Personal Year even when name numerology is unavailable", () => {
    const r = validateAnchors(
      core("numerology_code", "Your Life Path is 4.", ["Life Path 4", "Personal Year 5"]),
      { ...FULL, nameNumerologyAvailable: false },
    );
    expect(r.pass).toBe(true);
  });

  it("FAILS on a Personal Year that does not match the chart", () => {
    const r = validateAnchors(
      core("numerology_code", "This is a Personal Year 9 for you.", []),
      FULL, // chart personalYear = 5
    );
    expect(r.pass).toBe(false);
    expect(r.violations.some((v) => v.kind === "timing_mismatch")).toBe(true);
  });

  it("does NOT false-positive on Western 'water sign' language (no BaZi stem)", () => {
    const r = validateAnchors(
      core("battery", "Your Scorpio Moon is a water sign; earth signs steady you.", []),
      FULL,
    );
    expect(r.violations.some((v) => v.kind === "forbidden_bazi")).toBe(false);
  });
});
