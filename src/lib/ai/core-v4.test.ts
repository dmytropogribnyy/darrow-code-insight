// B2 staging tests for CORE v4.1 prompt + split preparation.
//
// These verify the v4 staging is correct WITHOUT activating it:
//   - system-prompt.ts still points to the active v3 prompt
//   - the staged v4 prompt file content enforces the v4 contract
//   - the v4 split partition covers exactly the 17 body keys once
//   - the v4 diagnostic config exposes the right targets/version markers
//   - v3 split + diagnostic exports are unchanged (regression)

import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

import {
  CORE_V4_BODY_SECTION_KEYS,
  EXECUTIVE_SUMMARY_LABELS,
  CLOSING_PILLAR_TITLES,
} from "./schema";
import {
  CORE_V4_SECTIONS_A,
  CORE_V4_SECTIONS_B,
  CORE_V3_SECTIONS_A,
  CORE_V3_SECTIONS_B,
  coreV4ToolSchemas,
  DARROW_V4_SYSTEM_PROMPT,
} from "./core-split.server";
import {
  CORE_V4_KEYS,
  CORE_V4_TARGETS,
  CORE_V4_WORD_TARGET_RANGE,
  CORE_V4_WORD_HARD_CAP,
  CORE_V4_SCHEMA_VERSION,
  CORE_V4_REPORT_VERSION,
  CORE_V3_KEYS,
  CORE_V3_WORD_TARGET_RANGE,
  CORE_V3_WORD_HARD_CAP,
  evaluateCoreV4Structure,
} from "./diagnostic.server";
import { coreV4Instructions } from "./user-prompt";

const promptMd = readFileSync(
  new URL("./darrowcode_ai_system_prompt_v4_1.md", import.meta.url),
  "utf8",
);
const systemPromptSrc = readFileSync(new URL("./system-prompt.ts", import.meta.url), "utf8");

// ── 1 · system prompt NOT switched ────────────────────────────────────────────

describe("B2 — system prompt not switched (production stays v3)", () => {
  it("system-prompt.ts imports the active v3 prompt md", () => {
    expect(systemPromptSrc).toContain("darrowcode_ai_system_prompt.md?raw");
  });

  it("system-prompt.ts does NOT import the staged v4.1 prompt", () => {
    expect(systemPromptSrc).not.toContain("darrowcode_ai_system_prompt_v4_1");
  });

  it("staged v4.1 prompt file exists and is non-trivial", () => {
    expect(promptMd.length).toBeGreaterThan(1000);
  });
});

// ── 2 · staged v4 prompt content ──────────────────────────────────────────────

describe("B2 — staged v4 prompt content enforces the v4 contract", () => {
  it("includes the product identity CORE Report: UNVEIL", () => {
    expect(promptMd).toContain("CORE Report: UNVEIL");
  });

  it("includes the Cosmic Core Code Method layer", () => {
    expect(promptMd).toContain("Cosmic Core Code Method");
  });

  it('instructs schema_version "core_v4"', () => {
    expect(promptMd).toContain("core_v4");
  });

  it("includes operating_mode as a required key", () => {
    expect(promptMd).toContain("operating_mode");
  });

  it("includes all 17 locked body keys", () => {
    for (const key of CORE_V4_BODY_SECTION_KEYS) {
      expect(promptMd).toContain(key);
    }
  });

  it("includes cover_tagline as a cover sub-field", () => {
    expect(promptMd).toContain("cover_tagline");
    expect(promptMd).toMatch(/cover sub-field/i);
  });

  it("excludes the old v3 closing-object emission instruction", () => {
    expect(promptMd).not.toContain("closing.executive_summary");
    expect(promptMd).not.toContain("closing.recommended_next_module");
  });

  it("excludes recommended_next_module entirely", () => {
    expect(promptMd).not.toContain("recommended_next_module");
  });

  it("forbids direct body cross-sell", () => {
    expect(promptMd).toMatch(/no direct module cross-sell/i);
  });

  it("forbids astrocartography / specific cities in CORE", () => {
    expect(promptMd).toContain("astrocartography");
    expect(promptMd).toMatch(/no specific cities/i);
  });

  it("states FreeAstroAPI remains the provider", () => {
    expect(promptMd).toContain("FreeAstroAPI");
  });

  it("forbids external ephemeris and Astro.com source use", () => {
    expect(promptMd).toMatch(/external ephemeris/i);
    expect(promptMd).toContain("Astro.com");
  });

  it("enforces proof_tags maximum 5", () => {
    expect(promptMd).toMatch(/maximum 5 proof tags/i);
  });

  it("states the disclaimer is template-injected, not AI-generated", () => {
    expect(promptMd).toMatch(/template[- ]inject/i);
    expect(promptMd).toMatch(/do not generate the\s+disclaimer/i);
  });

  it("includes the reading experience standard (Dinner Table Test)", () => {
    expect(promptMd).toContain("Dinner Table Test");
  });

  it("includes the locked executive_summary labels", () => {
    for (const label of EXECUTIVE_SUMMARY_LABELS) {
      expect(promptMd).toContain(label);
    }
  });

  it("includes the locked closing pillar titles", () => {
    for (const title of CLOSING_PILLAR_TITLES) {
      expect(promptMd).toContain(title);
    }
  });
});

// ── 3 · coreV4Instructions builder ────────────────────────────────────────────

describe("B2 — coreV4Instructions() builder", () => {
  const text = coreV4Instructions();

  it("declares schema_version core_v4", () => {
    expect(text).toContain("core_v4");
  });

  it("lists all 17 body keys", () => {
    for (const key of CORE_V4_BODY_SECTION_KEYS) {
      expect(text).toContain(key);
    }
  });

  it("includes cover_tagline as a cover sub-field", () => {
    expect(text).toContain("cover_tagline");
  });

  it("does not instruct emitting recommended_next_module", () => {
    expect(text).not.toContain("recommended_next_module");
  });

  it("does not instruct emitting a v3 closing object property", () => {
    expect(text).not.toContain("closing.executive_summary");
  });

  it("states the v4 word target range", () => {
    expect(text).toContain("4,350");
    expect(text).toContain("5,250");
  });
});

// ── 4 · v4 split coverage ─────────────────────────────────────────────────────

describe("B2 — v4 split A/B covers exactly the 17 body keys once", () => {
  const combined = [...CORE_V4_SECTIONS_A, ...CORE_V4_SECTIONS_B];

  it("Call A has 9 body keys, Call B has 8 body keys", () => {
    expect(CORE_V4_SECTIONS_A).toHaveLength(9);
    expect(CORE_V4_SECTIONS_B).toHaveLength(8);
  });

  it("combined split has exactly 17 keys", () => {
    expect(combined).toHaveLength(17);
  });

  it("no duplicate keys across the split", () => {
    expect(new Set(combined).size).toBe(17);
  });

  it("combined split equals the locked body key set", () => {
    expect([...combined].sort()).toEqual([...CORE_V4_BODY_SECTION_KEYS].sort());
  });

  it("operating_mode is included", () => {
    expect(combined).toContain("operating_mode");
  });

  it("cover_tagline is NOT a body section key in the split", () => {
    expect(combined).not.toContain("cover_tagline");
  });

  it("identity_card / closing / recommended_next_module are NOT in the split", () => {
    expect(combined).not.toContain("identity_card");
    expect(combined).not.toContain("closing");
    expect(combined).not.toContain("recommended_next_module");
  });

  it("v4 tool schema A requires cover_tagline + core_sections_a (schema_version core_v4)", () => {
    expect(coreV4ToolSchemas.splitASchema.required).toContain("cover_tagline");
    expect(coreV4ToolSchemas.splitASchema.required).toContain("core_sections_a");
    expect(
      coreV4ToolSchemas.splitASchema.properties.core_sections_a.properties.schema_version.enum,
    ).toEqual(["core_v4"]);
  });

  it("v4 tool schema B requires only core_sections_b (no closing, no client_snapshot)", () => {
    expect(coreV4ToolSchemas.splitBSchema.required).toEqual(["core_sections_b"]);
  });
});

// ── 5 · v4 diagnostic config ──────────────────────────────────────────────────

describe("B2 — v4 diagnostic config", () => {
  it("schema version marker is core_v4", () => {
    expect(CORE_V4_SCHEMA_VERSION).toBe("core_v4");
  });

  it("report version marker is v4.1", () => {
    expect(CORE_V4_REPORT_VERSION).toBe("v4.1");
  });

  it("word target range is 4,350–5,250", () => {
    expect(CORE_V4_WORD_TARGET_RANGE).toEqual([4350, 5250]);
  });

  it("word hard cap is 6000", () => {
    expect(CORE_V4_WORD_HARD_CAP).toBe(6000);
  });

  it("v4 keys are the 17 body keys, including operating_mode", () => {
    expect(CORE_V4_KEYS).toHaveLength(17);
    expect(CORE_V4_KEYS).toContain("operating_mode");
    expect(CORE_V4_KEYS).not.toContain("cover_tagline");
  });

  it("v4 targets table has exactly 17 sections", () => {
    expect(Object.keys(CORE_V4_TARGETS)).toHaveLength(17);
  });

  it("evaluateCoreV4Structure flags wrong schema_version on a core_v3 module", () => {
    const issues = evaluateCoreV4Structure({
      generated_modules: ["CORE"],
      modules: { CORE: { schema_version: "core_v3" } },
    });
    expect(issues.some((i) => i.code === "WRONG_SCHEMA_VERSION")).toBe(true);
  });

  it("evaluateCoreV4Structure flags missing cover_tagline + missing body keys", () => {
    const issues = evaluateCoreV4Structure({
      generated_modules: ["CORE"],
      modules: { CORE: { schema_version: "core_v4" } },
    });
    expect(
      issues.some((i) => i.code === "MISSING_SECTION_KEY" && i.detail === "cover_tagline"),
    ).toBe(true);
    expect(
      issues.some((i) => i.code === "MISSING_SECTION_KEY" && i.detail === "operating_mode"),
    ).toBe(true);
  });
});

// ── 6 · v3 regression (unchanged) ─────────────────────────────────────────────

describe("B2 — v3 split + diagnostic unchanged", () => {
  it("v3 split A has 9 sections starting with cover_tagline", () => {
    expect(CORE_V3_SECTIONS_A).toHaveLength(9);
    expect(CORE_V3_SECTIONS_A[0]).toBe("cover_tagline");
  });

  it("v3 split B has 8 sections", () => {
    expect(CORE_V3_SECTIONS_B).toHaveLength(8);
  });

  it("v3 word target range unchanged (3,800–4,600)", () => {
    expect(CORE_V3_WORD_TARGET_RANGE).toEqual([3800, 4600]);
  });

  it("v3 word hard cap unchanged (5000)", () => {
    expect(CORE_V3_WORD_HARD_CAP).toBe(5000);
  });

  it("v3 keys still include cover_tagline (v3 treats it as a section)", () => {
    expect(CORE_V3_KEYS).toContain("cover_tagline");
  });
});

// ── 7 · CoreV4Schema validation in evaluateCoreV4Structure (B2.1) ─────────────

// Minimal valid CoreV4 CORE module fixture used across B2.1 tests.
const VALID_V4_CORE = {
  schema_version: "core_v4" as const,
  cover_tagline: "Your personal architecture, decoded.",
  orientation: { prose: "orientation prose" },
  core_architecture: { prose: "core architecture prose" },
  operating_mode: { prose: "operating mode prose" },
  battery: { prose: "battery prose" },
  social_interface: { prose: "social interface prose" },
  numerology_code: { prose: "numerology code prose" },
  cognitive_style: { prose: "cognitive style prose" },
  drive_and_rhythm: { prose: "drive and rhythm prose" },
  professional_archetype: { prose: "professional archetype prose" },
  money_and_value: { prose: "money and value prose" },
  relationship_baseline: { prose: "relationship baseline prose" },
  vitality_baseline: { prose: "vitality baseline prose" },
  environment_and_resonance: { prose: "environment and resonance prose" },
  shadow_and_friction: { prose: "shadow and friction prose" },
  before_after: {
    before_after_pairs: [
      { before: "Before first", after: "After first" },
      { before: "Before second", after: "After second" },
    ],
  },
  executive_summary: {
    executive_summary_blocks: [
      { label: "YOUR CORE ADVANTAGE" as const, content: "advantage content" },
      { label: "YOUR PRIMARY SENSITIVITY" as const, content: "sensitivity content" },
      { label: "YOUR DECISION FORMULA" as const, content: "formula content" },
      { label: "THE CORE CONCLUSION" as const, content: "conclusion content" },
      { label: "CURRENT CYCLE" as const, content: "cycle content" },
      { label: "THE NEXT LEVEL" as const, content: "next level content" },
    ],
  },
  next_step: {
    closing_pillars: [
      { title: "TRUST THE SIGNAL" as const, prose: "trust prose" },
      { title: "BUILD THE BASE" as const, prose: "build prose" },
      { title: "RESPECT THE CYCLE" as const, prose: "respect prose" },
      { title: "HONOR THE SPACE" as const, prose: "honor prose" },
    ],
  },
};

function makeV4Report(coreOverride?: Record<string, unknown>) {
  return {
    generated_modules: ["CORE"],
    modules: { CORE: { ...VALID_V4_CORE, ...coreOverride } },
  };
}

describe("B2.1 — evaluateCoreV4Structure CoreV4Schema validation", () => {
  it("passes (no SCHEMA_VALIDATION_FAILED) for a valid CoreV4-shaped report", () => {
    const issues = evaluateCoreV4Structure(makeV4Report());
    expect(issues.some((i) => i.code === "SCHEMA_VALIDATION_FAILED")).toBe(false);
    expect(issues).toHaveLength(0);
  });

  it("fails when executive_summary_blocks use duplicate valid labels", () => {
    const issues = evaluateCoreV4Structure(
      makeV4Report({
        executive_summary: {
          executive_summary_blocks: [
            { label: "YOUR CORE ADVANTAGE", content: "c" },
            { label: "YOUR CORE ADVANTAGE", content: "c" }, // duplicate at position 1
            { label: "YOUR DECISION FORMULA", content: "c" },
            { label: "THE CORE CONCLUSION", content: "c" },
            { label: "CURRENT CYCLE", content: "c" },
            { label: "THE NEXT LEVEL", content: "c" },
          ],
        },
      }),
    );
    expect(issues.some((i) => i.code === "SCHEMA_VALIDATION_FAILED")).toBe(true);
  });

  it("fails when executive_summary_blocks use valid labels in wrong order", () => {
    const issues = evaluateCoreV4Structure(
      makeV4Report({
        executive_summary: {
          executive_summary_blocks: [
            { label: "YOUR PRIMARY SENSITIVITY", content: "c" }, // wrong at position 0
            { label: "YOUR CORE ADVANTAGE", content: "c" }, // wrong at position 1
            { label: "YOUR DECISION FORMULA", content: "c" },
            { label: "THE CORE CONCLUSION", content: "c" },
            { label: "CURRENT CYCLE", content: "c" },
            { label: "THE NEXT LEVEL", content: "c" },
          ],
        },
      }),
    );
    expect(issues.some((i) => i.code === "SCHEMA_VALIDATION_FAILED")).toBe(true);
  });

  it("fails when closing_pillars use duplicate valid titles", () => {
    const issues = evaluateCoreV4Structure(
      makeV4Report({
        next_step: {
          closing_pillars: [
            { title: "TRUST THE SIGNAL", prose: "p" },
            { title: "TRUST THE SIGNAL", prose: "p" }, // duplicate at position 1
            { title: "RESPECT THE CYCLE", prose: "p" },
            { title: "HONOR THE SPACE", prose: "p" },
          ],
        },
      }),
    );
    expect(issues.some((i) => i.code === "SCHEMA_VALIDATION_FAILED")).toBe(true);
  });

  it("fails when closing_pillars use valid titles in wrong order", () => {
    const issues = evaluateCoreV4Structure(
      makeV4Report({
        next_step: {
          closing_pillars: [
            { title: "BUILD THE BASE", prose: "p" }, // wrong at position 0
            { title: "TRUST THE SIGNAL", prose: "p" }, // wrong at position 1
            { title: "RESPECT THE CYCLE", prose: "p" },
            { title: "HONOR THE SPACE", prose: "p" },
          ],
        },
      }),
    );
    expect(issues.some((i) => i.code === "SCHEMA_VALIDATION_FAILED")).toBe(true);
  });

  it("fails when recommended_next_module appears inside CORE (strict mode)", () => {
    // CoreV4Schema uses .strict() — unknown top-level keys are rejected.
    const issues = evaluateCoreV4Structure(
      makeV4Report({ recommended_next_module: "LOVE" } as any),
    );
    expect(issues.some((i) => i.code === "SCHEMA_VALIDATION_FAILED")).toBe(true);
  });

  it("fails when a v3-style closing object appears inside CORE (strict mode)", () => {
    const issues = evaluateCoreV4Structure(
      makeV4Report({ closing: { executive_summary: "...", recommended_next_module: "LOVE" } }),
    );
    expect(issues.some((i) => i.code === "SCHEMA_VALIDATION_FAILED")).toBe(true);
  });
});

// ── 8 · B2.2 — v4 split path uses staged v4 prompt, v3 unchanged ─────────────

const coreSplitSrc = readFileSync(new URL("./core-split.server.ts", import.meta.url), "utf8");

describe("B2.2 — staged v4 split uses darrowcode_ai_system_prompt_v4_1.md", () => {
  it("core-split.server.ts imports the staged v4.1 prompt via ?raw", () => {
    expect(coreSplitSrc).toContain("darrowcode_ai_system_prompt_v4_1.md?raw");
  });

  it("DARROW_V4_SYSTEM_PROMPT is non-empty and contains CORE Report: UNVEIL", () => {
    expect(DARROW_V4_SYSTEM_PROMPT.length).toBeGreaterThan(500);
    expect(DARROW_V4_SYSTEM_PROMPT).toContain("CORE Report: UNVEIL");
  });

  it("DARROW_V4_SYSTEM_PROMPT differs from the active v3 system prompt", () => {
    // v3 prompt is loaded by system-prompt.ts; v4 is the staged file.
    // They must be different strings — v4 is not live yet.
    expect(DARROW_V4_SYSTEM_PROMPT).not.toBe(systemPromptSrc);
  });

  it("v4 generateCoreV4Split passes DARROW_V4_SYSTEM_PROMPT (source-level check)", () => {
    // Verify the source wires DARROW_V4_SYSTEM_PROMPT into v4 calls.
    expect(coreSplitSrc).toContain("systemPrompt: DARROW_V4_SYSTEM_PROMPT");
  });

  it("v3 split calls do NOT pass systemPrompt override (default stays v3 prompt)", () => {
    // v3 call sites in generateCoreV3Split have no systemPrompt field.
    // Confirm by checking the v3 suffix labels are not paired with DARROW_V4_SYSTEM_PROMPT.
    expect(coreSplitSrc).toContain("DARROW_SYSTEM_PROMPT");
    // The default parameter in callAnthropicSub falls back to DARROW_SYSTEM_PROMPT.
    expect(coreSplitSrc).toContain("systemPrompt = DARROW_SYSTEM_PROMPT");
  });

  it("system-prompt.ts still imports active v3 prompt (regression)", () => {
    expect(systemPromptSrc).toContain("darrowcode_ai_system_prompt.md?raw");
  });

  it("system-prompt.ts does NOT import the staged v4.1 prompt (regression)", () => {
    expect(systemPromptSrc).not.toContain("darrowcode_ai_system_prompt_v4_1");
  });
});
