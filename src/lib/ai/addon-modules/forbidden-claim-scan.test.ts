// Forbidden-claim + proof-anchor scanner tests (pure, no AI).

import { describe, it, expect } from "vitest";
import { scanForbiddenClaims, scanUnbackedProofTags } from "./forbidden-claim-scan";

describe("scanForbiddenClaims", () => {
  it("flags stones/crystals, luck/healing/protection, magical colors", () => {
    const v = scanForbiddenClaims(
      "Wear amethyst and rose quartz for healing. This is your lucky color that will protect your aura.",
    );
    const cats = new Set(v.map((x) => x.category));
    expect(cats.has("stones_crystals")).toBe(true);
    expect(cats.has("luck_healing_protection")).toBe(true);
  });

  it("flags medical, financial, relationship guarantees, and cities", () => {
    expect(
      scanForbiddenClaims("this cures inflammation and lowers cortisol").some(
        (x) => x.category === "medical",
      ),
    ).toBe(true);
    expect(
      scanForbiddenClaims("guaranteed returns if you invest in this").some(
        (x) => x.category === "financial_guarantee",
      ),
    ).toBe(true);
    expect(
      scanForbiddenClaims("you will meet the one, your soulmate").some(
        (x) => x.category === "relationship_guarantee",
      ),
    ).toBe(true);
    expect(
      scanForbiddenClaims("you should relocate and move to Paris").some(
        (x) => x.category === "astrocartography_city",
      ),
    ).toBe(true);
  });

  it("does NOT flag clean aesthetic/sensory style language", () => {
    const v = scanForbiddenClaims(
      "A stone-grey wool coat with a structured silhouette projects quiet, tactile authority. Choose matte textures and deep navy for visual silence.",
    );
    expect(v).toEqual([]);
  });
});

describe("scanUnbackedProofTags", () => {
  const allowed = ["Venus in Taurus", "Moon in Cancer", "Ascendant in Leo"];
  it("passes tags backed by the allowed anchors", () => {
    expect(scanUnbackedProofTags(["Venus in Taurus", "Moon"], allowed)).toEqual([]);
  });
  it("flags tags not present in the chart/packet", () => {
    expect(scanUnbackedProofTags(["Neptune in Pisces", "BaZi Day Master Gui"], allowed)).toEqual([
      "Neptune in Pisces",
      "BaZi Day Master Gui",
    ]);
  });
});
