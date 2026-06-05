// DATA-AUDIT-1 — audit/parser/material logic tests (no network, no AI, no Stripe).

import { describe, it, expect } from "vitest";
import {
  summarizeAvailability,
  moduleImpact,
  isAuditApproved,
  assertApprovedRunPrereqs,
  MissingFreeAstroKeyError,
  WrongProviderError,
  AuditNotApprovedError,
} from "./availability";
import {
  MATERIAL_CATEGORIES,
  MODULE_PACKS,
  buildMaterialContextForModule,
  NO_INVENTED_ENRICHMENT_RULE,
} from "./material-readiness";

const baseNumerology = {
  available: true,
  life_path: 7,
  birth_day_number: 3,
  personal_year: 5,
  name_numerology: { available: true, expression: 8, soul_urge: 2, personality: 6 },
};

const chartFull: any = {
  meta: { provider_name: "freeastroapi", birth_time_source: "exact" },
  natal: {
    sun: { sign: "Aries" },
    moon: { sign: "Cancer" },
    planets: [{ name: "Sun", sign: "Aries", dignity: "rulership" }],
    houses: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: "Aries", degree: 0 })),
    ascendant: { name: "Ascendant", sign: "Leo" },
    angles_details: { asc: { sign: "Leo", degree: 1 } },
    aspects: [{ a: "Sun", b: "Moon", type: "trine", orb: 2, is_major: true }],
  },
  numerology: baseNumerology,
  bazi: {
    available: true,
    day_master: "Gui",
    pillars: {},
    hour_pillar_confidence: "high",
    hour_pillar_used_for_interpretation: true,
  },
  transits: { available: true, aspects: [{ a: "Saturn", b: "Sun", high_priority: true }] },
  solar_return: {
    available: true,
    planets: [{}],
    angles_details: {},
    natal_comparison: { aspects: [{}], angularity: [{}] },
  },
  moon_phase: { available: true, phase: {}, zodiac: {}, forecast: {} },
  bazi_flow: {
    available: true,
    usable: true,
    annual_pillar: {},
    monthly_pillars: [{}, {}],
    time_confidence: "exact",
  },
};

describe("summarizeAvailability", () => {
  it("reports full availability for a complete chart", () => {
    const a = summarizeAvailability(chartFull);
    expect(a.natal.houses_count).toBe(12);
    expect(a.natal.ascendant).toBe(true);
    expect(a.natal.dignity_present).toBe(true);
    expect(a.numerology.name_numerology_available).toBe(true);
    expect(a.bazi.available).toBe(true);
    expect(a.transits.high_priority_count).toBe(1);
    expect(a.solar_return.angularity).toBe(true);
    expect(a.bazi_flow.monthly_pillars_count).toBe(2);
  });

  it("no birth time → houses/angles unavailable", () => {
    const a = summarizeAvailability({
      ...chartFull,
      natal: {
        ...chartFull.natal,
        houses: null,
        ascendant: null,
        midheaven: null,
        angles_details: null,
      },
    });
    expect(a.natal.houses_count).toBe(0);
    expect(a.natal.ascendant).toBe(false);
    expect(a.natal.angles_details).toBe(false);
  });

  it("missing bazi_sex → bazi unavailable", () => {
    const a = summarizeAvailability({
      ...chartFull,
      bazi: { available: false, reason: "missing_bazi_sex" },
    });
    expect(a.bazi.available).toBe(false);
    expect(a.bazi.reason).toBe("missing_bazi_sex");
  });

  it("missing full name → name numerology unavailable", () => {
    const a = summarizeAvailability({
      ...chartFull,
      numerology: { ...baseNumerology, name_numerology: { available: false } },
    });
    expect(a.numerology.life_path).toBe(true); // date-derived still present
    expect(a.numerology.name_numerology_available).toBe(false);
    expect(a.numerology.expression).toBe(false);
  });
});

describe("moduleImpact", () => {
  it("blocks house-based + BaZi + name layers when unavailable", () => {
    const a = summarizeAvailability({
      ...chartFull,
      natal: { ...chartFull.natal, houses: null, ascendant: null },
      bazi: { available: false },
      numerology: { ...baseNumerology, name_numerology: { available: false } },
    });
    const impact = moduleImpact(a);
    expect(impact).toHaveLength(7);
    const love = impact.find((m) => m.module === "LOVE")!;
    expect(love.blocked.join(" ")).toMatch(/houses\/angles/);
    expect(love.blocked.join(" ")).toMatch(/name numerology/);
    const place = impact.find((m) => m.module === "PLACE")!;
    expect(place.notes.join(" ")).toMatch(/astrocartography/);
  });

  it("YEAR degrades to Personal Year only when transits + solar return missing", () => {
    const a = summarizeAvailability({
      ...chartFull,
      transits: { available: false },
      solar_return: { available: false },
    });
    const year = moduleImpact(a).find((m) => m.module === "YEAR")!;
    expect(year.degraded.join(" ")).toMatch(/Personal Year only/);
  });
});

describe("approved-run guard (no network)", () => {
  it("blocks when not approved", () => {
    expect(() => assertApprovedRunPrereqs({})).toThrow(AuditNotApprovedError);
  });
  it("blocks wrong provider", () => {
    expect(() =>
      assertApprovedRunPrereqs({ FREEASTROAPI_AUDIT_APPROVE: "1", ASTRO_PROVIDER: "mock" }),
    ).toThrow(WrongProviderError);
  });
  it("blocks missing FREEASTROAPI_KEY BEFORE any network call", () => {
    expect(() =>
      assertApprovedRunPrereqs({ FREEASTROAPI_AUDIT_APPROVE: "1", ASTRO_PROVIDER: "freeastroapi" }),
    ).toThrow(MissingFreeAstroKeyError);
  });
  it("isAuditApproved reflects the flag", () => {
    expect(isAuditApproved({})).toBe(false);
    expect(isAuditApproved({ FREEASTROAPI_AUDIT_APPROVE: "1" })).toBe(true);
  });
});

describe("material readiness classification", () => {
  const byKey = (k: string) => MATERIAL_CATEGORIES.find((c) => c.key === k)!;

  it("colors / stones are do_not_claim (gated, not approved)", () => {
    expect(byKey("colors").status).toBe("do_not_claim");
    expect(byKey("stones").status).toBe("do_not_claim");
  });
  it("Japanese astrology / astrocartography / compatibility are not_implemented", () => {
    expect(byKey("japanese_astrology").status).toBe("not_implemented");
    expect(byKey("astrocartography").status).toBe("not_implemented");
    expect(byKey("compatibility").status).toBe("not_implemented");
  });
  it("date numerology is implemented_verified; sign/planet meanings are doc_only_planned", () => {
    expect(byKey("numerology_date").status).toBe("implemented_verified");
    expect(byKey("sign_planet_house_meanings").status).toBe("doc_only_planned");
  });
  it("every module has a material pack", () => {
    expect(MODULE_PACKS.map((p) => p.module).sort()).toEqual([
      "BODY",
      "CORE",
      "LOVE",
      "MONEY",
      "PLACE",
      "STYLE",
      "YEAR",
    ]);
  });
});

describe("buildMaterialContextForModule (diagnostic helper)", () => {
  it("includes the No-invented-enrichment rule and forbidden claims", () => {
    const ctx = buildMaterialContextForModule("STYLE", {
      ...chartFull,
      bazi: { available: false },
    } as any);
    expect(ctx.rules).toContain(NO_INVENTED_ENRICHMENT_RULE);
    expect(ctx.forbiddenFields.join(" ")).toMatch(/BaZi/);
    expect(ctx.forbiddenClaims.join(" ").toLowerCase()).toMatch(/japanese|stone|color/);
  });
});
