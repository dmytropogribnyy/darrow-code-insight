// CONTINUUM schema/context/prompt/renderer/generation tests (pure + mocked; no real AI).

import { describe, it, expect, vi } from "vitest";
import { continuumSchema, CONTINUUM_SECTION_KEYS } from "./continuum-schema";
import { buildContinuumContext } from "./continuum-context";
import { buildContinuumPrompt } from "./continuum-prompt";
import { renderContinuumHtmlSafe } from "./continuum-template";
import {
  generateContinuum,
  buildContinuumArtifact,
  ContinuumGenerationError,
} from "./generate-continuum";
import type { ContinuumType } from "./continuum-config";
import type { AddonModelCall } from "@/lib/ai/addon-modules/generate-addon";

const GEN_AT = new Date("2026-06-06T12:00:00Z");

function chart(over: any = {}): any {
  return {
    meta: { birth_time_source: "exact" },
    natal: {
      sun: { sign: "Capricorn" },
      moon: { sign: "Pisces" },
      planets: [],
      houses: [],
      aspects: [],
    },
    numerology: { available: true, personal_year: 6, name_numerology: { available: false } },
    bazi: { available: true, day_master: "Xin" },
    transits: {
      available: true,
      aspects: [{ a: "Saturn", b: "Sun", type: "square", orb: 2.1, high_priority: true }],
    },
    solar_return: {
      available: true,
      natal_comparison: { angularity: [{ planet: "Mars", angle: "MC", orb: 1.5 }] },
    },
    moon_phase: { available: true, phase: { name: "Waxing Crescent" }, zodiac: { sign: "Taurus" } },
    bazi_flow: { available: true, annual_pillar: { gan_zhi: "Jia-Chen", ten_god: "Wealth" } },
    ...over,
  };
}

function valid(type: ContinuumType) {
  const sections = Object.fromEntries(
    CONTINUUM_SECTION_KEYS[type].map((k) => [
      k,
      { prose: `${k} prose`, proof_tags: ["Personal Year 6"] },
    ]),
  );
  return {
    schema_version: "continuum_v1",
    continuum_type: type,
    cover_tagline: `Continuum ${type}`,
    sections,
  };
}

describe("continuumSchema", () => {
  for (const t of ["7d", "30d"] as ContinuumType[]) {
    it(`${t} valid payload passes; wrong type / extra section fails`, () => {
      expect(continuumSchema(t).safeParse(valid(t)).success).toBe(true);
      expect(
        continuumSchema(t).safeParse({ ...valid(t), continuum_type: t === "7d" ? "30d" : "7d" })
          .success,
      ).toBe(false);
      const bad: any = valid(t);
      bad.sections.extra = { prose: "x" };
      expect(continuumSchema(t).safeParse(bad).success).toBe(false);
    });
  }
  it("7d has 9 sections, 30d has 12", () => {
    expect(CONTINUUM_SECTION_KEYS["7d"]).toHaveLength(9);
    expect(CONTINUUM_SECTION_KEYS["30d"]).toHaveLength(12);
  });
});

describe("buildContinuumContext", () => {
  it("includes rolling period labels + timing anchors when available", () => {
    const ctx = buildContinuumContext("7d", chart(), { generatedAt: GEN_AT, first_name: "Alex" });
    expect(ctx.period.covers_label).toBe("Covers: June 6–June 13, 2026");
    expect(ctx.timingIncluded).toBe(true);
    expect(ctx.allowedProofAnchorCandidates).toContain("Personal Year 6");
    expect(ctx.allowedProofAnchorCandidates.join(" ")).toMatch(/Transit Saturn square natal Sun/);
    expect(ctx.allowedProofAnchorCandidates.join(" ")).toMatch(
      /Moon phase Waxing Crescent in Taurus/,
    );
    expect(ctx.forbiddenClaims.join(" ")).toMatch(/guaranteed predictions/);
    expect(ctx.forbiddenClaims.join(" ")).toMatch(/calendar week\/month/);
  });
  it("no timing data -> timing forbidden + Personal-Year fallback", () => {
    const ctx = buildContinuumContext(
      "30d",
      chart({
        transits: { available: false },
        solar_return: { available: false },
        bazi_flow: { available: false },
      }),
      { generatedAt: GEN_AT },
    );
    expect(ctx.timingIncluded).toBe(false);
    expect(ctx.forbiddenAnchors.join(" ")).toMatch(/transit-based timing/);
    expect(ctx.missingDataFallback.toLowerCase()).toMatch(/personal year theme/);
  });
});

describe("buildContinuumPrompt", () => {
  it("is packet-driven, period-aware, forbids guarantees, no raw chart dump", () => {
    const ctx = buildContinuumContext("7d", chart(), { generatedAt: GEN_AT, first_name: "Alex" });
    const p = buildContinuumPrompt(ctx, { first_name: "Alex" });
    expect(p).toMatch(/Covers: June 6–June 13, 2026/);
    expect(p).toMatch(/Personal Year 6/);
    expect(p).toMatch(/no guaranteed predictions/);
    expect(p).toMatch(/ROLLING period/);
    expect(p).toMatch(/opening_signal/);
    expect(p).not.toMatch(/"natal"\s*:/);
  });
});

describe("renderContinuumHtmlSafe", () => {
  it("renders standalone HTML with period labels + closing", () => {
    const ctx = buildContinuumContext("7d", chart(), { generatedAt: GEN_AT });
    const html = renderContinuumHtmlSafe("7d", valid("7d") as any, ctx.period, "Alex");
    expect(html).toMatch(/<!doctype html>/i);
    expect(html).toContain("Generated: June 6, 2026");
    expect(html).toContain("Covers: June 6–June 13, 2026");
    expect(html).toContain("Alex");
    expect(html).not.toContain("Core Architecture");
  });
});

describe("generate (mocked)", () => {
  const mock = (type: ContinuumType): AddonModelCall => vi.fn(async () => valid(type));
  it("generateContinuum validates the payload", async () => {
    const ctx = buildContinuumContext("30d", chart(), { generatedAt: GEN_AT });
    const out = await generateContinuum(ctx, { call: mock("30d") });
    expect(out.continuum_type).toBe("30d");
  });
  it("throws on invalid payload", async () => {
    const ctx = buildContinuumContext("7d", chart(), { generatedAt: GEN_AT });
    const bad: AddonModelCall = async () => ({
      schema_version: "continuum_v1",
      continuum_type: "7d",
      sections: {},
    });
    await expect(generateContinuum(ctx, { call: bad })).rejects.toBeInstanceOf(
      ContinuumGenerationError,
    );
  });
  it("buildContinuumArtifact produces standalone HTML for 7d + 30d", async () => {
    for (const t of ["7d", "30d"] as ContinuumType[]) {
      const art = await buildContinuumArtifact(t, chart(), {
        call: mock(t),
        generatedAt: GEN_AT,
        first_name: "Alex",
      });
      expect(art.type).toBe(t);
      expect(art.html).toMatch(/<!doctype html>/i);
      expect(art.period.covers_label).toMatch(/Covers:/);
    }
  });
});
