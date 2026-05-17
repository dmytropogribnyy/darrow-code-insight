// Darrow Report v2.1 schema — Zod runtime + JSON Schema for Anthropic tool.
import { z } from "zod";

const ModuleSnapshotSchema = z.object({
  main_pattern: z.string().min(1),
  main_strength: z.string().min(1),
  main_risk: z.string().min(1),
  practical_protocol: z.string().min(1),
  next_step: z.string().min(1),
});

const ModuleSchema = z.object({
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
});

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
export type DarrowModule = z.infer<typeof ModuleSchema>;

const moduleProps = {
  type: "object",
  required: ["opening","architecture","mechanic","timing","protocols","shadow","before_after","next","proof_tags"],
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
      required: ["main_pattern","main_strength","main_risk","practical_protocol","next_step"],
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
  required: ["client_name","generated_modules","client_snapshot","modules","closing"],
  properties: {
    client_name: { type: "string" },
    generated_modules: { type: "array", items: { type: "string" }, minItems: 1 },
    client_snapshot: {
      type: "object",
      required: ["pattern_name","core_pattern","unique_signature","primary_strength","pressure_point","best_operating_rhythm","current_timing_theme","practical_focus","recommended_next_module"],
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
      description: "Keys are module codes (CORE, LOVE, MONEY, BODY, YEAR, STYLE, PLACE). Only purchased modules are included.",
      properties: {
        CORE: moduleProps,
        LOVE: moduleProps,
        MONEY: moduleProps,
        BODY: moduleProps,
        YEAR: moduleProps,
        STYLE: moduleProps,
        PLACE: moduleProps,
      },
    },
    closing: {
      type: "object",
      required: ["executive_summary","recommended_next_module"],
      properties: {
        executive_summary: { type: "string" },
        recommended_next_module: { type: "string" },
        grand_synthesis: { type: "string" },
      },
    },
  },
} as const;
