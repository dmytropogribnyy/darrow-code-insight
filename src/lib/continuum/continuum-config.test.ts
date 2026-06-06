// CONTINUUM config + rolling-period tests (pure).

import { describe, it, expect } from "vitest";
import {
  CONTINUUM_PRODUCTS,
  continuumEnabled,
  computeContinuumPeriod,
  CONTINUUM_TYPES,
} from "./continuum-config";

describe("CONTINUUM products + flag", () => {
  it("prices: 7d $1.99, 30d $3.99; standalone, not bundled", () => {
    expect(CONTINUUM_PRODUCTS["7d"].price_cents).toBe(199);
    expect(CONTINUUM_PRODUCTS["30d"].price_cents).toBe(399);
    expect(CONTINUUM_PRODUCTS["7d"].days).toBe(7);
    expect(CONTINUUM_PRODUCTS["30d"].days).toBe(30);
    expect(CONTINUUM_TYPES).toEqual(["7d", "30d"]);
  });

  it("descriptions read as AI astrology timing horoscope (not subscription)", () => {
    expect(CONTINUUM_PRODUCTS["7d"].description.toLowerCase()).toMatch(/timing horoscope/);
    expect(CONTINUUM_PRODUCTS["30d"].description.toLowerCase()).toMatch(/orientation brief/);
    for (const t of CONTINUUM_TYPES) {
      expect(CONTINUUM_PRODUCTS[t].description.toLowerCase()).not.toMatch(
        /subscription|weekly|monthly subscription/,
      );
    }
  });

  it("feature flag defaults OFF", () => {
    expect(continuumEnabled({})).toBe(false);
    expect(continuumEnabled({ CONTINUUM_ENABLED: "1" })).toBe(true);
    expect(continuumEnabled({ CONTINUUM_ENABLED: "true" })).toBe(true);
    expect(continuumEnabled({ CONTINUUM_ENABLED: "0" })).toBe(false);
  });
});

describe("computeContinuumPeriod (rolling from generation, not calendar)", () => {
  it("7d: start = generation date, end = +7 days", () => {
    const p = computeContinuumPeriod(new Date("2026-06-06T14:30:00Z"), "7d");
    expect(p.period_type).toBe("7d");
    expect(p.period_start).toBe("2026-06-06");
    expect(p.period_end).toBe("2026-06-13");
    expect(p.generated_label).toBe("Generated: June 6, 2026");
    expect(p.covers_label).toBe("Covers: June 6–June 13, 2026");
  });

  it("30d: end = +30 days", () => {
    const p = computeContinuumPeriod(new Date("2026-06-06T00:00:00Z"), "30d");
    expect(p.period_end).toBe("2026-07-06");
    expect(p.covers_label).toBe("Covers: June 6–July 6, 2026");
  });

  it("cross-year period labels include the year on both ends", () => {
    const p = computeContinuumPeriod(new Date("2026-12-20T00:00:00Z"), "30d");
    expect(p.period_end).toBe("2027-01-19");
    expect(p.covers_label).toBe("Covers: December 20, 2026–January 19, 2027");
  });
});
