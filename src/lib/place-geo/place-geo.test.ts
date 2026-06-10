// PLACE-GEO v1 — context/prompt/schema/acceptance tests (mocked fetchers, real fixtures).

import { describe, it, expect, vi } from "vitest";
import { buildPlaceGeoContext } from "./place-geo-context";
import { buildPlaceGeoPrompt } from "./place-geo-prompt";
import { placeGeoSchema, placeGeoEnabled, PLACE_GEO_SECTION_KEYS } from "./place-geo-config";
import { scanPlaceGeoAcceptance } from "./place-geo-acceptance";
import cityCheckFixture from "@/lib/astro/__fixtures__/acg-city-check.lisbon.json";
import recsFixture from "@/lib/astro/__fixtures__/acg-recommendations.career.json";
import type { NatalInput } from "@/lib/astro/types";

const PARIS: NatalInput = {
  date_of_birth: "1995-09-05",
  birth_time: "20:00:00",
  birth_time_known: true,
  latitude: 48.8566,
  longitude: 2.3522,
  timezone: "Europe/Paris",
  birth_city: "Paris",
};

const fetchers = {
  cityCheck: vi.fn(async () => cityCheckFixture as any),
  recommendations: vi.fn(async () => recsFixture as any),
};

describe("buildPlaceGeoContext", () => {
  it("birth-time gate: unknown time -> unusable, zero calls", async () => {
    const f = { cityCheck: vi.fn(), recommendations: vi.fn() };
    const ctx = await buildPlaceGeoContext("k", { ...PARIS, birth_time_known: false }, f as any);
    expect(ctx.usable).toBe(false);
    expect(f.cityCheck).not.toHaveBeenCalled();
    expect(f.recommendations).not.toHaveBeenCalled();
  });

  it("orchestrates city-check then focus passes; anchors derived from API payload only", async () => {
    const ctx = await buildPlaceGeoContext("k", PARIS, fetchers as any);
    expect(ctx.usable).toBe(true);
    expect(fetchers.cityCheck).toHaveBeenCalledTimes(1);
    // Lisbon fixture country=PT -> region exists -> all 8 passes run (every focus regional+global)
    expect(fetchers.recommendations).toHaveBeenCalledTimes(8);
    const a = ctx.allowedProofAnchorCandidates.join(" | ");
    expect(a).toMatch(/Lisbon, PT — Jupiter MC \(10H\)/);
    expect(a).toMatch(/Oviedo, ES — Jupiter MC line, ~\d+ km/);
    expect(ctx.cityNames).toContain("Lisbon");
    expect(ctx.cityNames).toContain("Oviedo");
  });

  it("partial failure tolerated; total failure -> unusable", async () => {
    const half = {
      cityCheck: vi.fn(async () => {
        throw new Error("down");
      }),
      recommendations: vi.fn(async () => recsFixture as any),
    };
    const ctx = await buildPlaceGeoContext("k", PARIS, half as any);
    expect(ctx.usable).toBe(true); // passes still landed
    expect(ctx.failedCalls).toBeGreaterThanOrEqual(1);
    const dead = {
      cityCheck: vi.fn(async () => {
        throw new Error("down");
      }),
      recommendations: vi.fn(async () => {
        throw new Error("down");
      }),
    };
    const ctx2 = await buildPlaceGeoContext("k", PARIS, dead as any);
    expect(ctx2.usable).toBe(false); // caller falls back to resonance PLACE
  });
});

describe("prompt + schema + flag", () => {
  it("prompt: locked skeleton, hard rules, packet cities present, no invented-city allowance", async () => {
    const ctx = await buildPlaceGeoContext("k", PARIS, fetchers as any);
    const p = buildPlaceGeoPrompt(ctx, { first_name: "Sample" });
    for (const k of PLACE_GEO_SECTION_KEYS) expect(p).toContain(k);
    expect(p).toMatch(/NEVER name a city that is not present in the DATA PACKET/);
    expect(p).toMatch(/NEVER show raw scores/);
    expect(p).toMatch(/directional not deterministic/);
    expect(p).toContain("Lisbon");
  });

  it("schema: valid geo payload passes; missing section fails", () => {
    const sections = Object.fromEntries(
      PLACE_GEO_SECTION_KEYS.map((k) => [k, { prose: `${k} prose`, proof_tags: ["Lisbon, PT"] }]),
    );
    const ok = placeGeoSchema().safeParse({
      schema_version: "addon_v1",
      module_code: "PLACE",
      variant: "geo_v1",
      cover_tagline: "Your geography, decoded.",
      sections,
    });
    expect(ok.success).toBe(true);
    const bad: any = { ...ok.data, sections: { ...sections } };
    delete bad.sections.caution_zones;
    expect(placeGeoSchema().safeParse(bad).success).toBe(false);
  });

  it("flag default OFF", () => {
    expect(placeGeoEnabled({})).toBe(false);
    expect(placeGeoEnabled({ PLACE_GEO_ENABLED: "1" })).toBe(true);
  });
});

describe("acceptance gate", () => {
  const cities = ["Lisbon", "Oviedo", "Gijón", "Valladolid", "Santander", "Lille", "Porto"];
  it("passes rich concrete output", () => {
    const text =
      "Lisbon sits on your Jupiter MC line ~26 km out. Oviedo and Gijón carry the same geometry, " +
      "while Valladolid offers quieter ground. Santander suits recovery; Lille links visibility to roots. Porto rounds out the map.";
    const r = scanPlaceGeoAcceptance(text, cities);
    expect(r.cityMentions).toBeGreaterThanOrEqual(6);
    expect(r.ok).toBe(true);
  });
  it("fails vague geography + raw score leaks + too few cities", () => {
    const r = scanPlaceGeoAcceptance(
      "Coastal regions resonate with you. Your score here is 151.55. Western Europe generally supports your career.",
      cities,
    );
    expect(r.ok).toBe(false);
    expect(r.vaguePhrases.length).toBeGreaterThanOrEqual(2);
    expect(r.rawScoreLeaks).toContain("151.55");
    expect(r.cityMentions).toBeLessThan(6);
  });
});
