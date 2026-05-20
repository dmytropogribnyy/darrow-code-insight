// Darrow Report schema — Zod runtime + JSON Schema for Anthropic tool.
//
// CORE module is v3.1 (17 sections, schema_version "core_v3").
// 11 sections now support structured callout objects:
//   { prose: string, protocols?: [{title, body}], warning_signals?: string[] }
// 5 sections remain plain prose strings.
// Zod accepts either shape (string OR section object) for forward/back-compat
// with reports stored before v3.1 — getCoreSectionProse() in the PDF
// template handles both. Anthropic emits the new shape.
//
// Add-on modules retain the legacy shape for runtime compatibility.

import { z } from "zod";

const ModuleSnapshotSchema = z.object({
  main_pattern: z.string().min(1),
  main_strength: z.string().min(1),
  main_risk: z.string().min(1),
  practical_protocol: z.string().min(1),
  next_step: z.string().min(1),
});

// ─────────────────────────────────────────────────────────────
// CORE v3.1 — structured callout sections
// ─────────────────────────────────────────────────────────────

export const CORE_V3_SECTIONS_WITH_PROTOCOLS = [
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
] as const;

export const CORE_V3_SECTIONS_WITH_WARNINGS = [
  "battery",
  "professional_archetype",
  "shadow_and_friction",
] as const;

export const CORE_V3_PROSE_ONLY_SECTIONS = [
  "cover_tagline",
  "orientation",
  "before_after",
  "executive_summary",
  "next_step",
] as const;

const ProtocolObject = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

const SectionObjectSchema = z
  .object({
    prose: z.string(),
    protocols: z.array(ProtocolObject).optional(),
    warning_signals: z.array(z.string()).optional(),
  })
  .passthrough();

// Accept either a raw string (legacy / prose-only) or the structured object.
const CoreSectionField = z.union([z.string(), SectionObjectSchema]);

// Updated v3.1 minimums (prose length, not full object stringified).
// These are per-section minimum prose char counts.
const CORE_V3_MIN: Record<string, number> = {
  cover_tagline: 50,
  orientation: 800,
  core_architecture: 1100,
  battery: 900,
  social_interface: 800,
  numerology_code: 1000,
  cognitive_style: 800,
  drive_and_rhythm: 800,
  professional_archetype: 900,
  money_and_value: 800,
  relationship_baseline: 800,
  vitality_baseline: 750,
  environment_and_resonance: 750,
  shadow_and_friction: 1000,
  before_after: 500,
  executive_summary: 1100,
  next_step: 350,
};

function sectionProse(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && typeof (v as any).prose === "string") return (v as any).prose;
  return "";
}

const CoreV3Schema = z
  .object({
    schema_version: z.literal("core_v3"),
    cover_tagline: CoreSectionField,
    orientation: CoreSectionField,
    core_architecture: CoreSectionField,
    battery: CoreSectionField,
    social_interface: CoreSectionField,
    numerology_code: CoreSectionField,
    cognitive_style: CoreSectionField,
    drive_and_rhythm: CoreSectionField,
    professional_archetype: CoreSectionField,
    money_and_value: CoreSectionField,
    relationship_baseline: CoreSectionField,
    vitality_baseline: CoreSectionField,
    environment_and_resonance: CoreSectionField,
    shadow_and_friction: CoreSectionField,
    before_after: CoreSectionField,
    executive_summary: CoreSectionField,
    next_step: CoreSectionField,
    proof_tags: z.array(z.string()).optional(),
    module_snapshot: ModuleSnapshotSchema.optional(),
    color_palette: z.array(z.string()).optional(),
    color_names: z.array(z.string()).optional(),
  })
  .superRefine((mod, ctx) => {
    for (const [k, min] of Object.entries(CORE_V3_MIN)) {
      const prose = sectionProse((mod as any)[k]);
      const actual = prose.length;
      if (actual < min) {
        console.warn("[schema] CORE v3.1 section under min prose length", {
          section: k,
          actual,
          expected: min,
          status: "FAILED",
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [k],
          message: `CORE.${k} prose too short: ${actual} chars < ${min} required`,
        });
      }
    }
  });

// ─────────────────────────────────────────────────────────────
// Legacy / add-on module shape
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
  module_opening: z.string().optional(),
  primary_architecture: z.string().optional(),
  mechanism: z.string().optional(),
  key_pattern: z.string().optional(),
  summary: z.string().optional(),
  bridge: z.string().optional(),
});

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
export type DarrowCoreSection = z.infer<typeof CoreSectionField>;

// Helper used across template + diagnostics. Always returns the prose text
// for a CORE v3 section whether it is stored as a string (legacy) or as the
// new {prose, protocols?, warning_signals?} object.
export function getCoreSectionProse(field: unknown): string {
  return sectionProse(field);
}
export function getCoreSectionProtocols(field: unknown): Array<{ title: string; body: string }> {
  if (field && typeof field === "object" && Array.isArray((field as any).protocols)) {
    return (field as any).protocols as Array<{ title: string; body: string }>;
  }
  return [];
}
export function getCoreSectionWarnings(field: unknown): string[] {
  if (field && typeof field === "object" && Array.isArray((field as any).warning_signals)) {
    return ((field as any).warning_signals as unknown[]).map((x) => String(x));
  }
  return [];
}

// ─────────────────────────────────────────────────────────────
// Anthropic tool JSON Schema — lockstep with Zod.
// CORE sections that carry callouts emit as objects; prose-only stays string.
// ─────────────────────────────────────────────────────────────

const protocolJsonSchema = {
  type: "object",
  required: ["title", "body"],
  properties: { title: { type: "string" }, body: { type: "string" } },
} as const;

function sectionObjectJsonSchema(opts: { protocols?: boolean; warnings?: boolean }) {
  const properties: Record<string, any> = { prose: { type: "string" } };
  const required: string[] = ["prose"];
  if (opts.protocols) properties.protocols = { type: "array", items: protocolJsonSchema };
  if (opts.warnings) properties.warning_signals = { type: "array", items: { type: "string" } };
  return { type: "object", required, properties };
}

const SECTIONS_WITH_PROTOCOLS_SET = new Set<string>(CORE_V3_SECTIONS_WITH_PROTOCOLS);
const SECTIONS_WITH_WARNINGS_SET = new Set<string>(CORE_V3_SECTIONS_WITH_WARNINGS);

export function coreSectionJsonSchemaFor(key: string) {
  const hasP = SECTIONS_WITH_PROTOCOLS_SET.has(key);
  const hasW = SECTIONS_WITH_WARNINGS_SET.has(key);
  if (!hasP && !hasW) return { type: "string" } as const;
  return sectionObjectJsonSchema({ protocols: hasP, warnings: hasW });
}

const coreV3Props = (() => {
  const allKeys = [
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
  ];
  const properties: Record<string, any> = {
    schema_version: { type: "string", enum: ["core_v3"] },
    proof_tags: { type: "array", items: { type: "string" } },
  };
  for (const k of allKeys) properties[k] = coreSectionJsonSchemaFor(k);
  return {
    type: "object",
    required: ["schema_version", ...allKeys],
    properties,
  };
})();

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
        "Keys are module codes. CORE uses v3.1 shape (schema_version=core_v3, structured callout objects for 11 sections). Add-ons use the legacy shape.",
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
