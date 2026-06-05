// BUNDLE-B generation core tests — injected MOCK model call (no real AI/Stripe/provider).

import { describe, it, expect, vi } from "vitest";
import { type ModuleCode } from "@/lib/modules";
import { ADDON_SECTION_KEYS } from "./addon-schema";
import { buildReportContextForModule } from "@/lib/report-context/build-report-context";
import {
  generateAddonModule,
  buildAddonArtifact,
  createAnthropicAddonCall,
  AddonGenerationError,
  type AddonModelCall,
} from "./generate-addon";

function fullChart(): any {
  return {
    meta: { birth_time_source: "exact" },
    natal: {
      sun: { sign: "Aries" },
      moon: { sign: "Cancer" },
      planets: [
        { name: "Venus", sign: "Taurus" },
        { name: "Mars", sign: "Leo" },
        { name: "Saturn", sign: "Capricorn" },
        { name: "Jupiter", sign: "Gemini" },
        { name: "Pluto", sign: "Scorpio" },
      ],
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

function validPayload(module: ModuleCode) {
  const sections = Object.fromEntries(
    ADDON_SECTION_KEYS[module].map((k) => [
      k,
      { prose: `${k} prose for ${module}.`, proof_tags: ["Venus in Taurus"] },
    ]),
  );
  return {
    schema_version: "addon_v1",
    module_code: module,
    cover_tagline: `${module} tagline`,
    sections,
  };
}

const mockCall = (module: ModuleCode): AddonModelCall => vi.fn(async () => validPayload(module));

describe("generateAddonModule", () => {
  it("returns a validated payload from the model call", async () => {
    const ctx = buildReportContextForModule("LOVE", fullChart());
    const out = await generateAddonModule("LOVE", ctx, { call: mockCall("LOVE") });
    expect(out.module_code).toBe("LOVE");
    expect(out.sections).toHaveProperty("relational_archetype");
  });

  it("passes a packet-driven prompt to the model (allowed anchors present)", async () => {
    const ctx = buildReportContextForModule("LOVE", fullChart());
    const call = vi.fn(async () => validPayload("LOVE"));
    await generateAddonModule("LOVE", ctx, { call });
    const prompt = (call.mock.calls[0] as any[])[0].userPrompt as string;
    expect(prompt).toMatch(/Venus in Taurus/);
    expect(prompt).toMatch(/Japanese astrology/); // forbidden-claims list
  });

  it("throws AddonGenerationError on an invalid payload", async () => {
    const ctx = buildReportContextForModule("MONEY", fullChart());
    const badCall: AddonModelCall = async () => ({
      schema_version: "addon_v1",
      module_code: "MONEY",
      sections: {},
    });
    await expect(generateAddonModule("MONEY", ctx, { call: badCall })).rejects.toBeInstanceOf(
      AddonGenerationError,
    );
  });

  it("rejects a payload for the wrong module", async () => {
    const ctx = buildReportContextForModule("BODY", fullChart());
    const wrongCall: AddonModelCall = async () => validPayload("LOVE");
    await expect(generateAddonModule("BODY", ctx, { call: wrongCall })).rejects.toBeInstanceOf(
      AddonGenerationError,
    );
  });
});

describe("buildAddonArtifact — chart -> packet -> generate -> render", () => {
  it("produces standalone module HTML for all six modules", async () => {
    const modules: ModuleCode[] = ["LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"];
    for (const m of modules) {
      const art = await buildAddonArtifact(m, fullChart(), {
        call: mockCall(m),
        first_name: "Alex",
      });
      expect(art.module).toBe(m);
      expect(art.html).toMatch(/<!doctype html>/i);
      expect(art.html).toContain(m);
      expect(art.html).toContain("Alex");
      expect(art.html).not.toContain("Core Architecture");
    }
  });
});

describe("createAnthropicAddonCall — real default is key-guarded", () => {
  it("throws without ANTHROPIC_API_KEY (never calls AI in tests)", async () => {
    const prev = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    const call = createAnthropicAddonCall("LOVE");
    await expect(call({ userPrompt: "x", model: "claude-sonnet-4-6" })).rejects.toThrow(
      /ANTHROPIC_API_KEY/,
    );
    if (prev) process.env.ANTHROPIC_API_KEY = prev;
  });
});
