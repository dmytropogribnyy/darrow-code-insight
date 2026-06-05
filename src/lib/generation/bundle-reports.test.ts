// BUNDLE-B (increment 1) — planning/ref helper tests (pure, no DB/AI/Stripe).

import { describe, it, expect } from "vitest";
import {
  planReportUnits,
  formatModuleReportRef,
  separateReportsEnabled,
  orderModules,
  groupReportsByPurchase,
} from "./bundle-reports";

describe("separateReportsEnabled (flag, default OFF)", () => {
  it("is off by default and on only with 1/true", () => {
    expect(separateReportsEnabled({})).toBe(false);
    expect(separateReportsEnabled({ BUNDLE_SEPARATE_REPORTS: "1" })).toBe(true);
    expect(separateReportsEnabled({ BUNDLE_SEPARATE_REPORTS: "true" })).toBe(true);
    expect(separateReportsEnabled({ BUNDLE_SEPARATE_REPORTS: "0" })).toBe(false);
  });
});

describe("orderModules", () => {
  it("orders CORE first then catalog order", () => {
    expect(orderModules(["MONEY", "CORE", "LOVE"])).toEqual(["CORE", "LOVE", "MONEY"]);
  });
});

describe("formatModuleReportRef", () => {
  it("combined ref has no module suffix", () => {
    expect(formatModuleReportRef(new Date("2026-06-06T09:00:00Z"), 1)).toBe("DC-20260606-0001");
  });
  it("per-module ref appends the module", () => {
    expect(formatModuleReportRef(new Date("2026-06-06T09:00:00Z"), 2, "LOVE")).toBe(
      "DC-20260606-0002-LOVE",
    );
  });
});

describe("planReportUnits", () => {
  it("legacy: one combined unit holding all modules", () => {
    const units = planReportUnits(["CORE", "LOVE", "MONEY"], { separate: false });
    expect(units).toHaveLength(1);
    expect(units[0].module_code).toBeNull();
    expect(units[0].modules_array).toEqual(["CORE", "LOVE", "MONEY"]);
    expect(units[0].label).toBe("CORE + 2 chapters");
  });

  it("legacy: CORE Complete label for CORE + all 6", () => {
    const units = planReportUnits(["CORE", "LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"], {
      separate: false,
    });
    expect(units[0].label).toBe("CORE Complete");
  });

  it("separate: one unit per module, CORE first, each holds only its module", () => {
    const units = planReportUnits(["LOVE", "CORE", "MONEY"], { separate: true });
    expect(units.map((u) => u.module_code)).toEqual(["CORE", "LOVE", "MONEY"]);
    for (const u of units) expect(u.modules_array).toHaveLength(1);
    expect(units[0].modules_array).toEqual(["CORE"]);
    expect(units[1].label).toBe("LOVE chapter");
  });

  it("single-report purchase is one unit in both modes", () => {
    expect(planReportUnits(["CORE"], { separate: false })).toHaveLength(1);
    expect(planReportUnits(["CORE"], { separate: true })).toHaveLength(1);
    expect(planReportUnits(["LOVE"], { separate: true })[0].module_code).toBe("LOVE");
  });

  it("throws on empty selection", () => {
    expect(() => planReportUnits([], { separate: true })).toThrow();
  });
});

describe("groupReportsByPurchase", () => {
  it("groups report rows by intake_id", () => {
    const rows = [
      { intake_id: "i1", report_ref: "DC-1-CORE" },
      { intake_id: "i1", report_ref: "DC-2-LOVE" },
      { intake_id: "i2", report_ref: "DC-3-CORE" },
    ];
    const g = groupReportsByPurchase(rows);
    expect(g.get("i1")).toHaveLength(2);
    expect(g.get("i2")).toHaveLength(1);
  });
});
