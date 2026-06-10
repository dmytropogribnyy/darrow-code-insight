// PLACE-GEO v1 — service-layer tests (mocked HTTP; normalization runs against REAL captured
// fixtures from the MAP0 live probe 2026-06-10). No network.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchAcgCityCheck,
  fetchAcgRecommendations,
  buildAcgNatalBlock,
} from "./astrocartography.server";
import { regionForCountry } from "./region-map";
import cityCheckFixture from "./__fixtures__/acg-city-check.lisbon.json";
import recsFixture from "./__fixtures__/acg-recommendations.career.json";
import type { NatalInput } from "./types";

const PARIS_1995: NatalInput = {
  date_of_birth: "1995-09-05",
  birth_time: "20:00:00",
  birth_time_known: true,
  latitude: 48.8566,
  longitude: 2.3522,
  timezone: "Europe/Paris",
  birth_city: "Paris",
};

function mockFetchOnce(status: number, body: any) {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
    headers: new Map(),
  })) as any;
}

let fetchSpy: any;
beforeEach(() => {
  fetchSpy = mockFetchOnce(200, cityCheckFixture);
  vi.stubGlobal("fetch", fetchSpy);
});
afterEach(() => vi.unstubAllGlobals());

describe("buildAcgNatalBlock — birth-time gate", () => {
  it("throws without exact birth time (astrocartography is invalid without it)", () => {
    expect(() =>
      buildAcgNatalBlock({ ...PARIS_1995, birth_time_known: false, birth_time: null }),
    ).toThrow(/exact birth time/);
  });

  it("builds the nested natal block with parsed date/time", () => {
    const b: any = buildAcgNatalBlock(PARIS_1995);
    expect(b).toMatchObject({
      year: 1995,
      month: 9,
      day: 5,
      hour: 20,
      minute: 0,
      city: "Paris",
      time_known: true,
      house_system: "placidus",
    });
  });
});

describe("request shaping — contract guards", () => {
  it("city-check: sends nested natal, include_map_lines:false, NEVER include_crossings", async () => {
    await fetchAcgCityCheck("k", PARIS_1995, { city: "Lisbon", country: "PT" });
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toContain("/api/v1/western/astrocartography/city-check");
    const body = JSON.parse(init.body);
    expect(body.natal.year).toBe(1995);
    expect(body.city).toBe("Lisbon");
    expect(body.include_map_lines).toBe(false); // defaults true on this endpoint — must be explicit
    expect(body.include_paran_summary).toBe(true);
    expect("include_crossings" in body).toBe(false); // High-plan gated — never sent
  });

  it("recommendations: focus + scope + countries + caps; never include_crossings", async () => {
    fetchSpy = mockFetchOnce(200, recsFixture);
    vi.stubGlobal("fetch", fetchSpy);
    await fetchAcgRecommendations("k", PARIS_1995, {
      focus: "career",
      countryScope: "selected_countries",
      countries: ["FR", "ES", "PT"],
      limit: 5,
    });
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.focus).toBe("career");
    expect(body.country_scope).toBe("selected_countries");
    expect(body.countries).toEqual(["FR", "ES", "PT"]);
    expect(body.limit).toBe(5);
    expect(body.min_population).toBe(150000);
    expect(body.include_map_lines).toBe(false);
    expect("include_crossings" in body).toBe(false);
  });
});

describe("error policy", () => {
  it("403 (high_plan_required) is terminal — exactly ONE fetch, no retry", async () => {
    fetchSpy = mockFetchOnce(403, { error: "high_plan_required" });
    vi.stubGlobal("fetch", fetchSpy);
    await expect(fetchAcgCityCheck("k", PARIS_1995, { city: "Lisbon" })).rejects.toThrow(/403/);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("5xx retries once then succeeds", async () => {
    let n = 0;
    fetchSpy = vi.fn(async () => {
      n++;
      if (n === 1)
        return { ok: false, status: 502, json: async () => ({}), text: async () => "bad gateway" };
      return { ok: true, status: 200, json: async () => cityCheckFixture, text: async () => "" };
    });
    vi.stubGlobal("fetch", fetchSpy);
    const out = await fetchAcgCityCheck("k", PARIS_1995, { city: "Lisbon" });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(out.city.name).toBe("Lisbon");
  });
});

describe("normalization — against REAL captured responses", () => {
  it("city-check: 5 focus scores, angular Jupiter MC 0.2° 10H, themes + caution", async () => {
    const out = await fetchAcgCityCheck("k", PARIS_1995, { city: "Lisbon", country: "PT" });
    expect(out.city).toMatchObject({ name: "Lisbon", country: "PT" });
    expect(Object.keys(out.focus_scores).sort()).toEqual([
      "career",
      "health",
      "home",
      "romance",
      "spiritual",
    ]);
    expect(out.focus_scores.career?.summary).toMatch(/Jupiter MC/i);
    const ang = out.relocation_summary?.angular_planets?.[0];
    expect(ang).toMatchObject({ body: "jupiter", angle: "mc", orb_deg: 0.2, house: 10 });
    expect(out.relocation_summary?.summary_caution).toBeTruthy();
    expect(out.warnings.join(" ")).toMatch(/directional rather than deterministic/i);
  });

  it("recommendations: ranked real cities with quality flags; no GeoJSON retained", async () => {
    fetchSpy = mockFetchOnce(200, recsFixture);
    vi.stubGlobal("fetch", fetchSpy);
    const out = await fetchAcgRecommendations("k", PARIS_1995, {
      focus: "career",
      countryScope: "selected_countries",
      countries: ["FR", "ES", "PT"],
    });
    expect(out.meta).toMatchObject({ signal_strength: "strong", match_tier: "strong" });
    expect(out.results.length).toBeGreaterThanOrEqual(3);
    const first = out.results[0];
    expect(first.city.name).toBe("Oviedo");
    expect(first.rank).toBe(1);
    expect(first.nearest_favorable_line).toMatchObject({ body: "jupiter", angle: "mc" });
    expect(typeof first.nearest_favorable_line?.distance_km).toBe("number");
    expect(first.relocation_summary?.dominant_themes).toContain("career");
    // map/geometry payloads are never retained in the normalized shape
    expect(JSON.stringify(out)).not.toMatch(/LineString|coordinates/);
  });

  it("malformed results are skipped (warn-only), valid ones survive", async () => {
    fetchSpy = mockFetchOnce(200, {
      meta: {},
      warnings: [],
      results: [{ no_city: true }, { city: { name: "Porto", country: "PT" }, rank: 1 }],
    });
    vi.stubGlobal("fetch", fetchSpy);
    const out = await fetchAcgRecommendations("k", PARIS_1995, {
      focus: "home",
      countryScope: "all",
    });
    expect(out.results).toHaveLength(1);
    expect(out.results[0].city.name).toBe("Porto");
  });
});

describe("region map", () => {
  it("maps known birth countries to reachable regions", () => {
    expect(regionForCountry("FR")).toContain("PT");
    expect(regionForCountry("UA")).toContain("PL");
    expect(regionForCountry("us")).toContain("CA"); // case-insensitive
  });
  it("unknown country → null (caller runs global pass only)", () => {
    expect(regionForCountry("ZZ")).toBeNull();
    expect(regionForCountry(null)).toBeNull();
  });
});
