// MODULE-DIAG-lite — fixture render diagnostic for all six add-ons.
//
// No AI/Stripe/provider. Builds a fixture add-on payload per module, renders it with the
// production-safe renderAddonModuleHtmlSafe, writes the HTML to gitignored outputs/ for visual
// QA, and asserts each module renders real, module-specific content (NOT a CORE fallback /
// empty page). Run: npm run diag:addon-render (or via the full test suite).

import { mkdirSync, writeFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { MODULE_CODES, type ModuleCode } from "@/lib/modules";
import { ADDON_SECTION_KEYS } from "@/lib/ai/addon-modules/addon-schema";
import { renderAddonModuleHtmlSafe } from "./addon-template";

const OUT_DIR = "outputs/addon-render-diag";

function fixture(module: ModuleCode) {
  const sections = Object.fromEntries(
    ADDON_SECTION_KEYS[module].map((k) => [
      k,
      {
        opening_line: `You may already sense this about your ${module.toLowerCase()} pattern.`,
        scenario: `A concrete ${module.toLowerCase()} moment where the ${k.replace(/_/g, " ")} shows up.`,
        prose: `This is the ${k.replace(/_/g, " ")} for ${module}: a clear, recognizable description of how it works in ordinary life.`,
        key_insight: `The shift: seeing the ${k.replace(/_/g, " ")} for what it is.`,
        protocols: [{ title: "Practice", body: `A small actionable ${module} protocol.` }],
        warning_signals: [`When the ${k.replace(/_/g, " ")} tips into overdrive.`],
        proof_tags: ["Venus in Taurus", "Moon in Cancer"],
      },
    ]),
  );
  return {
    schema_version: "addon_v1",
    module_code: module,
    cover_tagline: `Your ${module} focused chapter.`,
    sections,
  };
}

describe("MODULE-DIAG-lite — add-on render diagnostics", () => {
  it("renders all six add-ons to standalone module-specific HTML (writes to outputs/)", () => {
    mkdirSync(OUT_DIR, { recursive: true });
    const summary: string[] = [];
    for (const m of MODULE_CODES) {
      const html = renderAddonModuleHtmlSafe(m, fixture(m), "Sample Client");
      writeFileSync(`${OUT_DIR}/${m}.html`, html);
      // Real, module-specific content — not CORE fallback / empty.
      expect(html).toContain(m);
      expect(html).toMatch(new RegExp(`This is the .* for ${m}`));
      expect(html).not.toContain("Core Architecture");
      expect(html.length).toBeGreaterThan(2000);
      summary.push(`${m}: ${html.length} bytes`);
    }
    writeFileSync(`${OUT_DIR}/_summary.txt`, summary.join("\n"));

    console.log(
      `[addon-render-diag] wrote ${MODULE_CODES.length} module HTML files to ${OUT_DIR}/`,
    );
    expect(summary).toHaveLength(MODULE_CODES.length);
  });
});
