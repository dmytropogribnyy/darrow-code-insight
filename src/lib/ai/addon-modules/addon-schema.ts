// MODULE-PROMPT-1 — staged add-on module schemas (LOVE/MONEY/BODY/YEAR/STYLE/PLACE).
//
// STAGED · NOT production. Mirrors the CORE v4.1 per-section structured shape so add-on
// reports have the same recognition-first structure. Section keys come from
// docs/module-content-contracts.md. Not wired into buildUserPrompt / the live pipeline.

import { z } from "zod";
import type { ModuleCode } from "@/lib/modules";

// Per-section structured fields (same family as CORE v4).
export const AddonSectionSchema = z
  .object({
    opening_line: z.string().max(160).optional(),
    scenario: z.string().optional(),
    prose: z.string().min(1),
    key_insight: z.string().optional(),
    protocols: z.array(z.object({ title: z.string(), body: z.string() })).optional(),
    warning_signals: z.array(z.string()).optional(),
    proof_tags: z.array(z.string()).max(5).optional(),
  })
  .strict();

// Section keys per add-on module. Structure DNA from the old Darrow samples
// (orientation -> single archetype -> domain sections -> closing integration), kept
// strictly within module-content-contracts.md + the do-not-claim registry.
// See docs/reference/addon-samples/ADDON_SAMPLE_SYNTHESIS.md.
export const ADDON_SECTION_KEYS: Record<ModuleCode, string[]> = {
  // DYAD CODE (solo) — fortress/sanctuary; NO synastry/compatibility.
  LOVE: [
    "orientation",
    "relational_archetype",
    "love_style",
    "emotional_needs",
    "conflict_loop",
    "intimacy_protocol",
    "closing_integration",
  ],
  // Vector Code — System Architect; NO investment/income advice.
  MONEY: [
    "orientation",
    "authority_archetype",
    "income_engine",
    "value_and_leverage",
    "money_friction",
    "negotiation_protocol",
    "closing_integration",
  ],
  // VITAL CODE — capacity vs motivation, battery; NON-medical.
  BODY: [
    "orientation",
    "capacity_archetype",
    "energy_battery",
    "stress_pressure_valve",
    "recovery_and_sleep",
    "practical_protocol",
    "closing_integration",
  ],
  // Solar Architect — terrain/weather map; NO guaranteed predictions.
  YEAR: [
    "orientation",
    "annual_theme",
    "timing_phases",
    "green_and_pressure_zones",
    "domain_timing",
    "strategic_summary",
    "closing_integration",
  ],
  // Aesthetics Code — visual signature/interface; colors/stones GATED.
  STYLE: [
    "orientation",
    "aesthetic_archetype",
    "material_and_texture",
    "silhouette_and_presence",
    "presentation_interface",
    "closing_integration",
  ],
  // Place Code — spatial alignment; NO astrocartography / city names.
  PLACE: [
    "orientation",
    "environment_archetype",
    "what_regulates",
    "what_drains",
    "space_protocol",
    "closing_integration",
  ],
};

// Modules that must carry a non-clinical / non-advice disclaimer in the rendered PDF.
export const ADDON_DISCLAIMER: Partial<Record<ModuleCode, string>> = {
  BODY: "For self-reflection only. Not medical advice, diagnosis, or treatment.",
  MONEY: "For self-reflection only. Not financial, investment, or professional advice.",
  YEAR: "For self-reflection only. Orientation, not guaranteed prediction.",
};

// Builds the strict Zod schema for one add-on module.
export function addonModuleSchema(module: ModuleCode) {
  const keys = ADDON_SECTION_KEYS[module];
  const sectionShape = Object.fromEntries(keys.map((k) => [k, AddonSectionSchema]));
  return z
    .object({
      schema_version: z.literal("addon_v1"),
      module_code: z.literal(module),
      cover_tagline: z.string().min(1).max(200),
      sections: z.object(sectionShape).strict(),
    })
    .strict();
}

export type AddonModule = z.infer<ReturnType<typeof addonModuleSchema>>;
