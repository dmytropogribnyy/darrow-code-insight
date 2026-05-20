// Darrow Report schema — Zod runtime + JSON Schema for Anthropic tool.
//
// CORE module is v3 (17 sections, schema_version "core_v3").
// Add-on modules retain the legacy shape for runtime compatibility — they
// will be migrated in a later pass per docs/current/SOURCE_OF_TRUTH.md.

import { z } from "zod";

const ModuleSnapshotSchema = z.object({
  main_pattern: z.string().min(1),
  main_strength: z.string().min(1),
  main_risk: z.string().min(1),
  practical_protocol: z.string().min(1),
  next_step: z.string().min(1),
});

// ─────────────────────────────────────────────────────────────
// CORE v3 — 17 named sections, schema_version="core_v3"
// ─────────────────────────────────────────────────────────────

const CORE_V3_MIN: Record<string, number> = {
  cover_tagline: 50,
  orientation: 700,
  core_architecture: 1000,
  battery: 800,
  social_interface: 750,
  numerology_code: 900,
  cognitive_style: 750,
  drive_and_rhythm: 750,
  professional_archetype: 800,
  money_and_value: 750,
  relationship_baseline: 750,
  vitality_baseline: 650,
  environment_and_resonance: 650,
  shadow_and_friction: 900,
  before_after: 450,
  executive_summary: 1000,
  next_step: 300,
};

const CoreV3Schema = z
  .object({
    schema_version: z.literal("core_v3"),
    cover_tagline: z.string(),
    orientation: z.string(),
    core_architecture: z.string(),
    battery: z.string(),
    social_interface: z.string(),
    numerology_code: z.string(),
    cognitive_style: z.string(),
    drive_and_rhythm: z.string(),
    professional_archetype: z.string(),
    money_and_value: z.string(),
    relationship_baseline: z.string(),
    vitality_baseline: z.string(),
    environment_and_resonance: z.string(),
    shadow_and_friction: z.string(),
    before_after: z.string(),
    executive_summary: z.string(),
    next_step: z.string(),
    // Optional carry-overs (some flows still emit these; harmless if present)
    proof_tags: z.array(z.string()).optional(),
    module_snapshot: ModuleSnapshotSchema.optional(),
    color_palette: z.array(z.string()).optional(),
    color_names: z.array(z.string()).optional(),
  })
  .superRefine((mod, ctx) => {
    for (const [k, min] of Object.entries(CORE_V3_MIN)) {
      const actual = ((mod as any)[k] as string | undefined)?.length ?? 0;
      if (actual < min) {
        // Diagnostic logging for under-generation debugging.
        console.warn("[schema] CORE v3 section under min length", {
          section: k,
          actual,
          expected: min,
          status: "FAILED",
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [k],
          message: `CORE.${k} too short: ${actual} chars < ${min} required`,
        });
      }
    }
  });

// ─────────────────────────────────────────────────────────────
// Legacy / add-on module shape (kept for LOVE/MONEY/BODY/YEAR/STYLE/PLACE
// and for any legacy renderer fallback on old stored reports)
// ─────────────────────────────────────────────────────────────

const LegacyModuleSchema = z.object({
  opening: z.string().min(40),
  architecture: z.string().min(80),
  mechanic: z.string().min(40),
  timing: z.string().min(40),
  protocols: z.string().min(80),
  shadow: z.string().min(40),
  before_after: z.string().min(30),
  next: z.string().min(20),
  proof_tags: z.array(z.string()).min(1),
  module_snapshot: ModuleSnapshotSchema.optional(),
  color_palette: z.array(z.string()).optional(),
  color_names: z.array(z.string()).optional(),
  // Allow v3 add-on keys as optional so future add-on migrations don't break.
  module_opening: z.string().optional(),
  primary_architecture: z.string().optional(),
  mechanism: z.string().optional(),
  key_pattern: z.string().optional(),
  summary: z.string().optional(),
  bridge: z.string().optional(),
});

// Module is either v3 CORE or legacy add-on.
const ModuleSchema = z.union([CoreV3Schema, LegacyModuleSchema]);

export const DarrowReportSchema = z.object({
  client_name: z.string().min(1),
  generated_modules: z.array(z.string()).min(1),
  client_snapshot: z.object({
    pattern_name: z.string().min(1),
    core_pattern: z.string().min(1),
    unique_signature: z.string().min(1),
    primary_strength: z.string().min(1),
    pressure_point: z.string().min(1),
    best_operating_rhythm: z.string().min(1),
    current_timing_theme: z.string().min(1),
    practical_focus: z.string().min(1),
    recommended_next_module: z.string().min(1),
  }),
  modules: z.record(z.string(), ModuleSchema),
  closing: z.object({
    executive_summary: z.string().min(40),
    recommended_next_module: z.string().min(1),
    grand_synthesis: z.string().optional(),
  }),
});

export type DarrowReport = z.infer<typeof DarrowReportSchema>;
export type DarrowModule = z.infer<typeof LegacyModuleSchema>;
export type DarrowCoreV3 = z.infer<typeof CoreV3Schema>;

// ─────────────────────────────────────────────────────────────
// Anthropic tool input JSON Schema — must stay in lockstep with Zod.
// CORE v3 keys are required; add-on legacy keys mirror LegacyModuleSchema.
// ─────────────────────────────────────────────────────────────

const coreV3Props = {
  type: "object",
  required: [
    "schema_version",
    "cover_tagline",
    "orientation",
    "core_architecture",
    "battery",
    "social_interface",
    "numerology_code",
    "cognitive_style",
    "drive_and_rhythm",
    "professional_archetype",
    "money_and_value",
    "relationship_baseline",
    "vitality_baseline",
    "environment_and_resonance",
    "shadow_and_friction",
    "before_after",
    "executive_summary",
    "next_step",
  ],
  properties: {
    schema_version: { type: "string", enum: ["core_v3"] },
    cover_tagline: { type: "string" },
    orientation: { type: "string" },
    core_architecture: { type: "string" },
    battery: { type: "string" },
    social_interface: { type: "string" },
    numerology_code: { type: "string" },
    cognitive_style: { type: "string" },
    drive_and_rhythm: { type: "string" },
    professional_archetype: { type: "string" },
    money_and_value: { type: "string" },
    relationship_baseline: { type: "string" },
    vitality_baseline: { type: "string" },
    environment_and_resonance: { type: "string" },
    shadow_and_friction: { type: "string" },
    before_after: { type: "string" },
    executive_summary: { type: "string" },
    next_step: { type: "string" },
    proof_tags: { type: "array", items: { type: "string" } },
  },
} as const;

const legacyModuleProps = {
  type: "object",
  required: [
    "opening",
    "architecture",
    "mechanic",
    "timing",
    "protocols",
    "shadow",
    "before_after",
    "next",
    "proof_tags",
  ],
  properties: {
    opening: { type: "string" },
    architecture: { type: "string" },
    mechanic: { type: "string" },
    timing: { type: "string" },
    protocols: { type: "string" },
    shadow: { type: "string" },
    before_after: { type: "string" },
    next: { type: "string" },
    proof_tags: { type: "array", items: { type: "string" }, minItems: 1 },
    module_snapshot: {
      type: "object",
      required: [
        "main_pattern",
        "main_strength",
        "main_risk",
        "practical_protocol",
        "next_step",
      ],
      properties: {
        main_pattern: { type: "string" },
        main_strength: { type: "string" },
        main_risk: { type: "string" },
        practical_protocol: { type: "string" },
        next_step: { type: "string" },
      },
    },
    color_palette: { type: "array", items: { type: "string" } },
    color_names: { type: "array", items: { type: "string" } },
  },
} as const;

export const darrowReportJsonSchema = {
  type: "object",
  required: [
    "client_name",
    "generated_modules",
    "client_snapshot",
    "modules",
    "closing",
  ],
  properties: {
    client_name: { type: "string" },
    generated_modules: { type: "array", items: { type: "string" }, minItems: 1 },
    client_snapshot: {
      type: "object",
      required: [
        "pattern_name",
        "core_pattern",
        "unique_signature",
        "primary_strength",
        "pressure_point",
        "best_operating_rhythm",
        "current_timing_theme",
        "practical_focus",
        "recommended_next_module",
      ],
      properties: {
        pattern_name: { type: "string" },
        core_pattern: { type: "string" },
        unique_signature: { type: "string" },
        primary_strength: { type: "string" },
        pressure_point: { type: "string" },
        best_operating_rhythm: { type: "string" },
        current_timing_theme: { type: "string" },
        practical_focus: { type: "string" },
        recommended_next_module: { type: "string" },
      },
    },
    modules: {
      type: "object",
      description:
        "Keys are module codes. CORE uses v3 shape (schema_version=core_v3). Add-ons (LOVE/MONEY/BODY/YEAR/STYLE/PLACE) use the legacy shape.",
      properties: {
        CORE: coreV3Props,
        LOVE: legacyModuleProps,
        MONEY: legacyModuleProps,
        BODY: legacyModuleProps,
        YEAR: legacyModuleProps,
        STYLE: legacyModuleProps,
        PLACE: legacyModuleProps,
      },
    },
    closing: {
      type: "object",
      required: ["executive_summary", "recommended_next_module"],
      properties: {
        executive_summary: { type: "string" },
        recommended_next_module: { type: "string" },
        grand_synthesis: { type: "string" },
      },
    },
  },
} as const;
