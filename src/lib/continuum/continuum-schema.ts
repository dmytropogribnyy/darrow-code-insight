// CONTINUUM schema (continuum_v1) — per-type section structure. Reuses the add-on section shape.
// STAGED · not wired to production. Feature-gated by CONTINUUM_ENABLED.

import { z } from "zod";
import { AddonSectionSchema } from "@/lib/ai/addon-modules/addon-schema";
import type { ContinuumType } from "./continuum-config";

// Section keys per Continuum product (from the PHASE 3 contract).
export const CONTINUUM_SECTION_KEYS: Record<ContinuumType, string[]> = {
  "7d": [
    "opening_signal",
    "main_theme",
    "pressure_zone",
    "green_zone",
    "work_focus",
    "relationships_rhythm",
    "body_recovery",
    "practical_protocol",
    "closing_signal",
  ],
  "30d": [
    "opening_signal",
    "month_theme",
    "system_status",
    "primary_vector",
    "work_money",
    "relationships_social",
    "body_recovery",
    "place_environment",
    "green_windows",
    "pressure_windows",
    "protocols",
    "closing_signal",
  ],
};

export const CONTINUUM_TARGET_WORDS: Record<ContinuumType, string> = {
  "7d": "900–1,300",
  "30d": "1,700–2,500",
};

export function continuumSchema(type: ContinuumType) {
  const keys = CONTINUUM_SECTION_KEYS[type];
  const sectionShape = Object.fromEntries(keys.map((k) => [k, AddonSectionSchema]));
  return z
    .object({
      schema_version: z.literal("continuum_v1"),
      continuum_type: z.literal(type),
      cover_tagline: z.string().min(1).max(200),
      sections: z.object(sectionShape).strict(),
    })
    .strict();
}

export type ContinuumPayload = z.infer<ReturnType<typeof continuumSchema>>;
