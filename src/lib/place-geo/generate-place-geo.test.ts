// PLACE-GEO v1 — artifact generator tests (mocked model call + fetchers; no network).

import { describe, it, expect, vi } from "vitest";
import { buildPlaceGeoArtifact, PlaceGeoGenerationError } from "./generate-place-geo";
import { buildPlaceGeoContext } from "./place-geo-context";
import { PLACE_GEO_SECTION_KEYS } from "./place-geo-config";
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

function validPayload() {
  return {
    schema_version: "addon_v1",
    module_code: "PLACE",
    variant: "geo_v1",
    cover_tagline: "Your geography, decoded.",
    sections: Object.fromEntries(
      PLACE_GEO_SECTION_KEYS.map((k) => [
        k,
        { prose: `${k} prose about Lisbon ground.`, proof_tags: ["Lisbon, PT"] },
      ]),
    ),
  };
}

async function geoCtx() {
  return buildPlaceGeoContext("k", PARIS, {
    cityCheck: vi.fn(async () => cityCheckFixture as any),
    recommendations: vi.fn(async () => recsFixture as any),
  } as any);
}

describe("buildPlaceGeoArtifact", () => {
  it("happy path: validates schema + renders geo sections through the addon template", async () => {
    const art = await buildPlaceGeoArtifact("k", PARIS, {
      call: vi.fn(async () => validPayload()),
      first_name: "Sample",
      contextOverride: await geoCtx(),
    });
    expect(art).not.toBeNull();
    expect(art!.variant).toBe("geo_v1");
    expect(art!.html).toMatch(/<!doctype html>|<section/i);
    expect(art!.html).toContain("Your Geography");
    expect(art!.html).toContain("Career Ground"); // humanized geo section key
    expect(art!.html).toContain("Caution Zones");
    expect(art!.html).toContain("Exploratory orientation, not instruction");
  });

  it("returns null (fallback to resonance PLACE) when context unusable", async () => {
    const dead = await buildPlaceGeoContext("k", PARIS, {
      cityCheck: vi.fn(async () => {
        throw new Error("down");
      }),
      recommendations: vi.fn(async () => {
        throw new Error("down");
      }),
    } as any);
    const art = await buildPlaceGeoArtifact("k", PARIS, {
      call: vi.fn(async () => validPayload()),
      contextOverride: dead,
    });
    expect(art).toBeNull();
  });

  it("throws PlaceGeoGenerationError on schema-invalid payload", async () => {
    const bad: any = validPayload();
    delete bad.sections.caution_zones;
    await expect(
      buildPlaceGeoArtifact("k", PARIS, {
        call: vi.fn(async () => bad),
        contextOverride: await geoCtx(),
      }),
    ).rejects.toBeInstanceOf(PlaceGeoGenerationError);
  });
});
