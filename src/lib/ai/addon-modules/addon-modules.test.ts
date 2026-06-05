// MODULE-PROMPT-1 — staged add-on schema + prompt tests (no AI/Stripe/provider).

import { describe, it, expect } from "vitest";
import { MODULE_CODES, type ModuleCode } from "@/lib/modules";
import { addonModuleSchema, ADDON_SECTION_KEYS } from "./addon-schema";
import { buildAddonModulePrompt } from "./addon-prompt";
import { buildReportContextForModule } from "@/lib/report-context/build-report-context";

const PLANETS = [
  { name: "Sun", sign: "Aries" },
  { name: "Moon", sign: "Cancer" },
  { name: "Venus", sign: "Taurus" },
  { name: "Mars", sign: "Leo" },
  { name: "Jupiter", sign: "Gemini" },
  { name: "Saturn", sign: "Capricorn" },
  { name: "Pluto", sign: "Scorpio" },
];

function fullChart(): any {
  return {
    meta: { provider_name: "freeastroapi", birth_time_source: "exact" },
    natal: {
      sun: { sign: "Aries" },
      moon: { sign: "Cancer" },
      planets: PLANETS,
      houses: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: "Aries" })),
      ascendant: { sign: "Leo" },
      aspects: [{ a: "Venus", b: "Mars", type: "trine", is_major: true }],
    },
    numerology: {
      available: true,
      life_path: 7,
      personal_year: 5,
      name_numerology: { available: true, expression: 8 },
    },
    bazi: { available: true, day_master: "Gui", elements: { dominant: "Water" } },
    transits: { available: true, aspects: [] },
    solar_return: { available: true },
    moon_phase: { available: true, phase: {} },
    bazi_flow: { available: true },
  };
}

// Minimal valid add-on module payload for a given module.
function validModule(module: ModuleCode) {
  const sections = Object.fromEntries(
    ADDON_SECTION_KEYS[module].map((k) => [
      k,
      {
        prose: `${k} prose.`,
        proof_tags: ["Venus in Taurus"],
        protocols: [{ title: "Do", body: "this" }],
      },
    ]),
  );
  return {
    schema_version: "addon_v1",
    module_code: module,
    cover_tagline: "A focused chapter.",
    sections,
  };
}

describe("addonModuleSchema — all six modules parse a valid payload", () => {
  for (const m of MODULE_CODES) {
    it(`${m} valid payload passes; wrong module_code fails`, () => {
      expect(addonModuleSchema(m).safeParse(validModule(m)).success).toBe(true);
      const wrong = { ...validModule(m), module_code: m === "LOVE" ? "MONEY" : "LOVE" };
      expect(addonModuleSchema(m).safeParse(wrong).success).toBe(false);
    });
  }

  it("rejects unknown/extra section keys (strict)", () => {
    const bad: any = validModule("LOVE");
    bad.sections.extra_section = { prose: "x" };
    expect(addonModuleSchema("LOVE").safeParse(bad).success).toBe(false);
  });
});

describe("buildAddonModulePrompt — consumes the material packet, not raw chart", () => {
  it("injects allowed anchors + forbidden claims; never dumps raw chart JSON", () => {
    const ctx = buildReportContextForModule("LOVE", fullChart(), { first_name: "Alex" });
    const prompt = buildAddonModulePrompt("LOVE", ctx, { first_name: "Alex" });
    expect(prompt).toMatch(/Venus in Taurus/); // an allowed anchor candidate
    expect(prompt).toMatch(/Japanese astrology/); // forbidden-claims list
    expect(prompt).toMatch(/attraction_pattern/); // section structure
    // Must NOT embed a raw DarrowChartData JSON dump.
    expect(prompt).not.toMatch(/"natal"\s*:/);
    expect(prompt).not.toMatch(/"schema_version"\s*:\s*"1\.0"/);
  });

  it("module-specific safety: STYLE forbids colors/stones, BODY carries medical disclaimer, PLACE forbids cities", () => {
    const chart = fullChart();
    const style = buildAddonModulePrompt("STYLE", buildReportContextForModule("STYLE", chart));
    expect(style.toLowerCase()).toMatch(/colors|stones/);
    const body = buildAddonModulePrompt("BODY", buildReportContextForModule("BODY", chart));
    expect(body.toLowerCase()).toMatch(/not medical advice/);
    const place = buildAddonModulePrompt("PLACE", buildReportContextForModule("PLACE", chart));
    expect(place.toLowerCase()).toMatch(/astrocartography|city|cities/);
  });

  it("no-birth-time packet forbids houses/angles in the prompt", () => {
    const noTime = fullChart();
    noTime.meta.birth_time_source = "unknown";
    noTime.natal.houses = null;
    noTime.natal.ascendant = null;
    const ctx = buildReportContextForModule("MONEY", noTime);
    const prompt = buildAddonModulePrompt("MONEY", ctx);
    expect(prompt.toLowerCase()).toMatch(/no birth time|house \/ angle/);
  });
});
