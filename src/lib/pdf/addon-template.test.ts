// ADDON-RENDERER-1 — per-module renderer tests (no AI/Stripe/provider).

import { describe, it, expect } from "vitest";
import { MODULE_CODES, type ModuleCode } from "@/lib/modules";
import { ADDON_SECTION_KEYS } from "@/lib/ai/addon-modules/addon-schema";
import { renderAddonModuleHtmlSafe } from "./addon-template";

function fixture(module: ModuleCode) {
  const sections = Object.fromEntries(
    ADDON_SECTION_KEYS[module].map((k) => [
      k,
      {
        opening_line: `${k} opening.`,
        scenario: `A ${module} ${k} scene.`,
        prose: `${k} prose body for ${module}.`,
        key_insight: `${k} insight.`,
        protocols: [{ title: "Try", body: "do this" }],
        warning_signals: ["watch for this"],
        proof_tags: ["Venus in Taurus", "Moon in Cancer"],
      },
    ]),
  );
  return {
    schema_version: "addon_v1",
    module_code: module,
    cover_tagline: `${module} tagline`,
    sections,
  };
}

describe("renderAddonModuleHtmlSafe — all six modules", () => {
  for (const m of MODULE_CODES) {
    it(`${m} renders a standalone, non-empty, module-specific document`, () => {
      const html = renderAddonModuleHtmlSafe(m, fixture(m), "Alex");
      expect(html).toMatch(/<!doctype html>/i);
      expect(html).toContain("Alex");
      // module-specific cover title
      expect(html).toContain(m);
      // first section rendered (humanized key)
      const firstKey = ADDON_SECTION_KEYS[m][0];
      const humanFirst = firstKey
        .split("_")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ");
      expect(html).toContain(humanFirst);
      // real content + proof anchors, not CORE fallback
      expect(html).toMatch(/prose body for/);
      expect(html).toContain("Venus in Taurus");
      expect(html).not.toContain("Core Architecture");
      expect(html.length).toBeGreaterThan(1500);
    });
  }
});

describe("renderAddonModuleHtmlSafe — safety + guards", () => {
  it("BODY/MONEY/YEAR carry their disclaimer", () => {
    expect(renderAddonModuleHtmlSafe("BODY", fixture("BODY"))).toMatch(/Not medical advice/);
    expect(renderAddonModuleHtmlSafe("MONEY", fixture("MONEY"))).toMatch(/Not financial/);
    expect(renderAddonModuleHtmlSafe("YEAR", fixture("YEAR"))).toMatch(
      /not guaranteed prediction/i,
    );
  });

  it("throws (fails loud) rather than ship an empty add-on PDF", () => {
    expect(() =>
      renderAddonModuleHtmlSafe("LOVE", {
        schema_version: "addon_v1",
        module_code: "LOVE",
        sections: {},
      }),
    ).toThrow(/no module sections/);
  });
});
