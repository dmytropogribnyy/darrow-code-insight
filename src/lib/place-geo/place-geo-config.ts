// PLACE-GEO v1 — config + flag + section contract (staged; server flag default OFF).
// Full astro-geo PLACE: ranked power cities per life focus with REAL lines/distances from
// FreeAstroAPI astrocartography (MAP0-verified). Existing 6-section resonance PLACE stays the
// production path until this is validated + enabled; it is also the no-birth-time fallback.

import { z } from "zod";
import { AddonSectionSchema } from "@/lib/ai/addon-modules/addon-schema";

export function placeGeoEnabled(env: Record<string, string | undefined> = process.env): boolean {
  const v = env.PLACE_GEO_ENABLED;
  return v === "1" || v?.toLowerCase() === "true";
}

// Locked skeleton (order matters; closing_integration reuses the dark closing page).
export const PLACE_GEO_SECTION_KEYS = [
  "orientation", // How Place Works in Your Code (~120w)
  "where_you_stand", // Where You Stand Now — birth city deep read (~220w)
  "career_ground", // ~260w: 2 regional + 1-2 global cities, named lines + distances
  "love_ground", // ~200w
  "home_ground", // ~200w
  "restoration_places", // ~120w
  "caution_zones", // ~120w: demanding ground, never doom
  "closing_integration", // Working With Your Map (~100w, travel-test + exploratory stance)
] as const;

export const PLACE_GEO_TARGET_WORDS = "1,200–1,500";

export const PLACE_GEO_DISCLAIMER =
  "Exploratory orientation, not instruction. Place emphasizes patterns — it does not decide outcomes.";

export function placeGeoSchema() {
  const sectionShape = Object.fromEntries(
    PLACE_GEO_SECTION_KEYS.map((k) => [k, AddonSectionSchema]),
  );
  return z
    .object({
      schema_version: z.literal("addon_v1"),
      module_code: z.literal("PLACE"),
      variant: z.literal("geo_v1"),
      cover_tagline: z.string().min(1).max(200),
      sections: z.object(sectionShape).strict(),
    })
    .strict();
}
