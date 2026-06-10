// CORE-HUMAN-VOICE v3.2 — explicit per-section proof_tags: schema accepts them (additive,
// backward-compatible) and the v3 renderer prefers them over trailing-bracket prose extraction.

import { describe, it, expect } from "vitest";
import { CoreV3Schema } from "@/lib/ai/schema";
import { renderReportHtmlSafe } from "./template";

const baseCore = (over: any = {}) => ({
  schema_version: "core_v3" as const,
  cover_tagline: "A steady architecture built to last over long arcs of effort.",
  orientation: "x".repeat(810),
  core_architecture: {
    prose: "y".repeat(1110),
    protocols: [{ title: "Foundation", body: "Test the ground before you build." }],
    proof_tags: ["Yang Earth Day Master", "Xu day branch", "Earth-dominant composition"],
  },
  battery: {
    prose: "b".repeat(910),
    protocols: [{ title: "Recover", body: "Rest deliberately." }],
  },
  social_interface: {
    prose: "s".repeat(810),
    protocols: [{ title: "Filter", body: "Be selective." }],
  },
  numerology_code: {
    prose: "n".repeat(1010),
    protocols: [{ title: "Output", body: "Share early." }],
  },
  cognitive_style: { prose: "c".repeat(810), protocols: [{ title: "Trust", body: "First read." }] },
  drive_and_rhythm: {
    prose: "d".repeat(810),
    protocols: [{ title: "Aim", body: "Pick a target." }],
  },
  professional_archetype: {
    prose: "p".repeat(910),
    protocols: [{ title: "Scope", body: "Real range." }],
  },
  money_and_value: { prose: "m".repeat(810), protocols: [{ title: "Anchor", body: "Set terms." }] },
  relationship_baseline: {
    prose: "r".repeat(810),
    protocols: [{ title: "Surface", body: "Say it." }],
  },
  vitality_baseline: {
    prose: "v".repeat(760),
    protocols: [{ title: "Check", body: "Reserve level." }],
  },
  environment_and_resonance: {
    prose: "e".repeat(760),
    protocols: [{ title: "Audit", body: "Assess space." }],
  },
  shadow_and_friction: {
    prose: "f".repeat(1010),
    warning_signals: ["You defend the arrangement."],
  },
  before_after: "z".repeat(510),
  executive_summary: "w".repeat(1110),
  next_step: "q".repeat(360),
  ...over,
});

describe("CoreV3Schema — per-section proof_tags (additive)", () => {
  it("accepts a section object WITH proof_tags", () => {
    expect(CoreV3Schema.safeParse(baseCore()).success).toBe(true);
  });

  it("still accepts the old shape WITHOUT proof_tags (backward compatible)", () => {
    const r = CoreV3Schema.safeParse(
      baseCore({
        core_architecture: { prose: "y".repeat(1110), protocols: [{ title: "F", body: "B." }] },
      }),
    );
    expect(r.success).toBe(true);
  });

  it("rejects more than 5 proof_tags", () => {
    const r = CoreV3Schema.safeParse(
      baseCore({
        core_architecture: { prose: "y".repeat(1110), proof_tags: ["a", "b", "c", "d", "e", "f"] },
      }),
    );
    expect(r.success).toBe(false);
  });
});

describe("v3 renderer — explicit proof_tags vs trailing-bracket fallback", () => {
  const snapshot = {
    pattern_name: "The Mountain That Moves",
    core_pattern: "Builds from the ground up.",
    unique_signature: "Quiet endurance.",
    primary_strength: "Sustains effort over long arcs.",
    pressure_point: "Holds form past usefulness.",
    best_operating_rhythm: "Deep-cycle work with consolidation.",
    current_timing_theme: "Initiation.",
    practical_focus: "Test the ground.",
    recommended_next_module: "MONEY",
  };
  const render = (core: any) =>
    renderReportHtmlSafe({
      client_name: "Alex",
      generated_modules: ["CORE"],
      client_snapshot: snapshot,
      modules: { CORE: core },
    } as any);

  it("renders explicit proof_tags as a compact ·-joined evidence line", () => {
    const html = render(baseCore());
    expect(html).toContain("Yang Earth Day Master · Xu day branch · Earth-dominant composition");
  });

  it("explicit proof_tags take priority over a trailing [bracket] in prose", () => {
    const html = render(
      baseCore({
        core_architecture: {
          prose: "Real human prose.\n\n[OLD bracket proof]",
          protocols: [{ title: "F", body: "B." }],
          proof_tags: ["NEW explicit proof"],
        },
      }),
    );
    expect(html).toContain("NEW explicit proof");
    expect(html).not.toContain("OLD bracket proof");
  });

  it("falls back to trailing [bracket] proof when no proof_tags present (back-compat)", () => {
    const html = render(
      baseCore({
        core_architecture: {
          prose: "Real human prose.\n\n[Legacy bracket anchor]",
          protocols: [{ title: "F", body: "B." }],
        },
      }),
    );
    expect(html).toContain("Legacy bracket anchor");
  });
});
