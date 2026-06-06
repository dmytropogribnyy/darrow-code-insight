// PHASE 2 — recommend-next logic + email rendering tests (pure; no live sends).

import { describe, it, expect } from "vitest";
import { recommendNextProducts } from "./recommend-next";
import { bundleReportReadyEmail, reportReadyEmail } from "./resend.server";

const base = "https://darrowcode.com";

describe("recommendNextProducts", () => {
  it("CORE only -> recommend focused chapters (1 rec)", () => {
    const r = recommendNextProducts(["CORE"], { appBaseUrl: base });
    expect(r).toHaveLength(1);
    expect(r[0].key).toBe("focused_chapters");
    expect(r[0].cta_url).toBe(base);
  });

  it("CORE + some chapters -> recommend CORE Complete", () => {
    const r = recommendNextProducts(["CORE", "LOVE", "MONEY"], { appBaseUrl: base });
    expect(r[0].key).toBe("core_complete");
  });

  it("CORE Complete -> no CORE/add-on re-recommend; Continuum only if enabled", () => {
    const all = ["CORE", "LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"];
    expect(recommendNextProducts(all, { appBaseUrl: base })).toEqual([]);
    const withContinuum = recommendNextProducts(all, { appBaseUrl: base, continuumEnabled: true });
    expect(withContinuum).toHaveLength(1);
    expect(withContinuum[0].key).toBe("continuum");
  });

  it("add-on only -> recommend CORE foundation + one related chapter (<=2)", () => {
    const r = recommendNextProducts(["LOVE"], { appBaseUrl: base });
    expect(r.length).toBeLessThanOrEqual(2);
    expect(r[0].key).toBe("core_foundation");
    expect(r[1].cta_label).toBe("Explore YEAR"); // LOVE -> YEAR
  });

  it("never recommends Continuum when the flag is off", () => {
    const all = ["CORE", "LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"];
    const r = recommendNextProducts(all, { appBaseUrl: base, continuumEnabled: false });
    expect(r.find((x) => x.key === "continuum")).toBeUndefined();
  });

  it("max 2 recommendations", () => {
    for (const p of [["CORE"], ["LOVE"], ["LOVE", "MONEY"], ["CORE", "LOVE"]]) {
      expect(recommendNextProducts(p, { appBaseUrl: base }).length).toBeLessThanOrEqual(2);
    }
  });
});

describe("bundle email renders the recommendation; legacy stays intact", () => {
  const items = [
    { label: "CORE Report", report_ref: "DC-1-CORE", download_url: `${base}/download/t` },
  ];

  it("renders the soft recommendation block + still lists PDFs", () => {
    const rec = recommendNextProducts(["CORE"], { appBaseUrl: base })[0];
    const { html } = bundleReportReadyEmail({
      first_name: "Alex",
      result_url: `${base}/result/t`,
      items,
      recommendation: rec,
    });
    expect(html).toContain(`${base}/download/t`); // delivery preserved
    expect(html).toMatch(/focused chapters/i); // recommendation present
    expect(html).toContain("Explore focused chapters →");
  });

  it("omits the block when no recommendation is passed", () => {
    const { html } = bundleReportReadyEmail({
      first_name: "Alex",
      result_url: `${base}/result/t`,
      items,
    });
    expect(html).not.toMatch(/Explore focused chapters/);
  });

  it("legacy reportReadyEmail unchanged (single link, no upsell block)", () => {
    const { html } = reportReadyEmail({
      first_name: "Alex",
      download_url: `${base}/download/legacy`,
      result_url: `${base}/result/legacy`,
    });
    expect(html).toContain(`${base}/download/legacy`);
  });
});
