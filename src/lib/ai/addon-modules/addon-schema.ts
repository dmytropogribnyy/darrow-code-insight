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

// Section keys per add-on module (from the contracts in module-content-contracts.md).
export const ADDON_SECTION_KEYS: Record<ModuleCode, string[]> = {
  LOVE: [
    "attraction_pattern",
    "emotional_needs",
    "intimacy_style",
    "conflict_loop",
    "relational_blind_spot",
  ],
  MONEY: [
    "earning_pattern",
    "value_and_work_style",
    "money_friction",
    "risk_and_decision",
    "discipline_structure",
  ],
  BODY: ["stress_pattern", "energy_leakage", "overload_signals", "recovery_style"],
  YEAR: [
    "yearly_theme",
    "pressure_windows",
    "opportunity_windows",
    "seasonal_focus",
    "decision_rhythm",
  ],
  STYLE: ["aesthetic_identity", "visibility", "texture_material", "presentation_pattern"],
  PLACE: [
    "environment_pattern",
    "what_regulates",
    "what_drains",
    "home_workspace_fit",
    "relocation_reflection",
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
