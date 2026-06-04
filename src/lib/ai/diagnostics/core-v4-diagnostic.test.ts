// B5.2 — CORE v4 manual diagnostic logic tests (no real AI, no FreeAstroAPI).
//
// These cover the pure diagnostic logic + safety guards with mocks/stubs only.
// No Anthropic call, no network, no Supabase, no email.

import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

import {
  parseDiagnosticOptionsFromEnv,
  buildPlan,
  assertCanRunAi,
  AiCallNotApprovedError,
  MissingApiKeyError,
  runCoreV4Validation,
  buildCoreV4DiagnosticClientSnapshot,
  extractCoreModule,
  CORE_V4_DIAGNOSTIC_DEFAULT_MODEL,
  CORE_V4_DIAGNOSTIC_DEFAULT_OUT_DIR,
} from "./core-v4-diagnostic";

// Minimal valid CoreV4 module (mirrors the staged contract; no AI involved).
const VALID_V4_CORE = {
  schema_version: "core_v4" as const,
  cover_tagline: "Your personal architecture, decoded.",
  orientation: { opening_line: "You are not built for noise.", prose: "orientation prose" },
  core_architecture: { opening_line: "When it is right, all of you agrees.", prose: "core prose" },
  operating_mode: { opening_line: "You work like a laser.", prose: "operating prose" },
  battery: { prose: "battery prose" },
  social_interface: { prose: "social prose" },
  numerology_code: { prose: "numerology prose" },
  cognitive_style: { prose: "cognitive prose" },
  drive_and_rhythm: { prose: "drive prose" },
  professional_archetype: { opening_line: "Architect, not the face.", prose: "prof prose" },
  money_and_value: { prose: "money prose" },
  relationship_baseline: { prose: "relationship prose" },
  vitality_baseline: { prose: "vitality prose" },
  environment_and_resonance: { prose: "environment prose" },
  shadow_and_friction: { prose: "shadow prose" },
  before_after: {
    before_after_pairs: [
      { before: "Before one", after: "After one" },
      { before: "Before two", after: "After two" },
    ],
  },
  executive_summary: {
    executive_summary_blocks: [
      { label: "YOUR CORE ADVANTAGE" as const, content: "advantage" },
      { label: "YOUR PRIMARY SENSITIVITY" as const, content: "sensitivity" },
      { label: "YOUR DECISION FORMULA" as const, content: "formula" },
      { label: "THE CORE CONCLUSION" as const, content: "conclusion" },
      { label: "CURRENT CYCLE" as const, content: "cycle" },
      { label: "THE NEXT LEVEL" as const, content: "next level" },
    ],
  },
  next_step: {
    closing_pillars: [
      { title: "TRUST THE SIGNAL" as const, prose: "trust" },
      { title: "BUILD THE BASE" as const, prose: "build" },
      { title: "RESPECT THE CYCLE" as const, prose: "respect" },
      { title: "HONOR THE SPACE" as const, prose: "honor" },
    ],
  },
};

describe("B5.2 — options + plan are safe-by-default", () => {
  it("defaults to plan-only (no AI) when env is empty", () => {
    const o = parseDiagnosticOptionsFromEnv({});
    expect(o.approveAiCall).toBe(false);
    expect(o.planOnly).toBe(true);
    expect(o.mode).toBe("sequential");
    expect(o.model).toBe(CORE_V4_DIAGNOSTIC_DEFAULT_MODEL);
    expect(o.outDir).toBe(CORE_V4_DIAGNOSTIC_DEFAULT_OUT_DIR);
    expect(o.renderHtml).toBe(false);
    expect(o.renderPdf).toBe(false);
  });

  it("requires CORE_V4_APPROVE_AI=1 to enable a real AI call", () => {
    expect(parseDiagnosticOptionsFromEnv({ CORE_V4_APPROVE_AI: "1" }).approveAiCall).toBe(true);
    expect(parseDiagnosticOptionsFromEnv({ CORE_V4_APPROVE_AI: "true" }).approveAiCall).toBe(true);
    expect(parseDiagnosticOptionsFromEnv({ CORE_V4_APPROVE_AI: "0" }).approveAiCall).toBe(false);
    expect(parseDiagnosticOptionsFromEnv({ CORE_V4_APPROVE_AI: "yes" }).approveAiCall).toBe(false);
  });

  it("parses render + mode + model overrides", () => {
    const o = parseDiagnosticOptionsFromEnv({
      CORE_V4_APPROVE_AI: "1",
      CORE_V4_RENDER: "html,pdf",
      CORE_V4_MODE: "parallel",
      CORE_V4_MODEL: "claude-x",
    });
    expect(o.renderHtml).toBe(true);
    expect(o.renderPdf).toBe(true);
    expect(o.mode).toBe("parallel");
    expect(o.model).toBe("claude-x");
  });

  it("plan text marks PLAN-ONLY and the approve flag when not approved", () => {
    const plan = buildPlan(parseDiagnosticOptionsFromEnv({}));
    expect(plan).toMatch(/PLAN-ONLY/);
    expect(plan).toMatch(/CORE_V4_APPROVE_AI=1/);
    expect(plan).toMatch(/no Anthropic call/i);
  });
});

describe("B5.2 — assertCanRunAi guard", () => {
  it("throws AiCallNotApprovedError when not approved (no AI possible)", () => {
    const o = parseDiagnosticOptionsFromEnv({});
    expect(() => assertCanRunAi(o, {})).toThrow(AiCallNotApprovedError);
  });

  it("throws MissingApiKeyError when approved but ANTHROPIC_API_KEY is absent", () => {
    const o = parseDiagnosticOptionsFromEnv({ CORE_V4_APPROVE_AI: "1" });
    expect(() => assertCanRunAi(o, {})).toThrow(MissingApiKeyError);
  });

  it("passes when approved and ANTHROPIC_API_KEY is present (no call made)", () => {
    const o = parseDiagnosticOptionsFromEnv({ CORE_V4_APPROVE_AI: "1" });
    expect(() => assertCanRunAi(o, { ANTHROPIC_API_KEY: "sk-test" })).not.toThrow();
  });
});

describe("B5.2 — runCoreV4Validation uses the staged v4 contract", () => {
  it("passes a valid v4 core module (schema + structure + lengths)", () => {
    const v = runCoreV4Validation(VALID_V4_CORE);
    expect(v.schemaPass).toBe(true);
    expect(v.schemaIssues).toHaveLength(0);
    expect(v.structuralIssues).toHaveLength(0);
    expect(v.checks.beforeAfterPairs).toBe(2);
    expect(v.checks.execLabelOrderOk).toBe(true);
    expect(v.checks.closingPillarOrderOk).toBe(true);
    expect(v.checks.proofTagsMaxOk).toBe(true);
    expect(v.checks.missingSections).toHaveLength(0);
    // 17 sections evaluated for length
    expect(v.lengthDiags).toHaveLength(17);
  });

  it("fails schema when a section carries more than 5 proof_tags", () => {
    const v = runCoreV4Validation({
      ...VALID_V4_CORE,
      orientation: { prose: "p", proof_tags: ["a", "b", "c", "d", "e", "f"] },
    });
    expect(v.schemaPass).toBe(false);
    expect(v.checks.proofTagsMaxOk).toBe(false);
  });

  it("flags wrong before_after pair count", () => {
    const v = runCoreV4Validation({
      ...VALID_V4_CORE,
      before_after: { before_after_pairs: [{ before: "b", after: "a" }] },
    });
    expect(v.schemaPass).toBe(false);
    expect(v.checks.beforeAfterPairs).toBe(1);
  });
});

describe("B5.2 — extractCoreModule (re-render-from-JSON path, no AI)", () => {
  it("returns modules.CORE from a full report", () => {
    expect(extractCoreModule({ modules: { CORE: VALID_V4_CORE } })).toBe(VALID_V4_CORE);
  });
  it("returns a bare core module unchanged", () => {
    expect(extractCoreModule(VALID_V4_CORE)).toBe(VALID_V4_CORE);
  });
  it("fromJson option is parsed from CORE_V4_FROM_JSON env", () => {
    const o = parseDiagnosticOptionsFromEnv({ CORE_V4_FROM_JSON: "outputs/x.json" });
    expect(o.fromJson).toBe("outputs/x.json");
    expect(o.approveAiCall).toBe(false); // re-render needs no AI approval
  });
});

describe("B5.2 — diagnostic client snapshot is render-only, not a body key", () => {
  it("assembles a snapshot from generated content without mutating the core", () => {
    const before = JSON.stringify(VALID_V4_CORE);
    const snap = buildCoreV4DiagnosticClientSnapshot("Dmitry", VALID_V4_CORE);
    // core module is unchanged
    expect(JSON.stringify(VALID_V4_CORE)).toBe(before);
    // snapshot has the 8 POS fields
    expect(Object.keys(snap).sort()).toEqual(
      [
        "best_operating_rhythm",
        "core_pattern",
        "current_timing_theme",
        "pattern_name",
        "practical_focus",
        "pressure_point",
        "primary_strength",
        "unique_signature",
      ].sort(),
    );
    expect(snap.primary_strength).toBe("advantage");
    expect(snap.pressure_point).toBe("sensitivity");
    expect(snap.current_timing_theme).toBe("cycle");
  });

  it("does NOT add client_snapshot / identity_card as a generated body key", () => {
    const snap = buildCoreV4DiagnosticClientSnapshot("Dmitry", VALID_V4_CORE);
    expect("client_snapshot" in (VALID_V4_CORE as any)).toBe(false);
    expect("identity_card" in (VALID_V4_CORE as any)).toBe(false);
    // The snapshot object itself is not a CoreV4 body section
    expect("schema_version" in snap).toBe(false);
  });
});

// ── Source-level safety guards (no production wiring) ─────────────────────────

const logicSrc = readFileSync(new URL("./core-v4-diagnostic.ts", import.meta.url), "utf8");
const runnerSrc = readFileSync(
  new URL("./run-core-v4-diagnostic.test.ts", import.meta.url),
  "utf8",
);
const fixtureSrc = readFileSync(
  new URL("../fixtures/core-v4-diagnostic-input.ts", import.meta.url),
  "utf8",
);

describe("B5.2 — diagnostic files touch no production flow", () => {
  const all = logicSrc + runnerSrc + fixtureSrc;

  it("does not import pipeline.server.ts", () => {
    expect(all).not.toContain("pipeline.server");
  });

  it("does not import system-prompt.ts or the active v3 prompt", () => {
    expect(all).not.toContain("system-prompt");
    expect(all).not.toContain("darrowcode_ai_system_prompt.md");
  });

  it("does not import Supabase / email / Stripe / checkout modules", () => {
    // Check import statements, not safety-note comments.
    expect(all).not.toMatch(/from\s+["'][^"']*supabase/i);
    expect(all).not.toMatch(/from\s+["'][^"']*(resend|nodemailer)/i);
    expect(all).not.toContain("sendEmail(");
    expect(all).not.toMatch(/from\s+["'][^"']*stripe/i);
    expect(all).not.toMatch(/from\s+["'][^"']*checkout/i);
  });

  it("does not import a FreeAstroAPI provider (uses the deterministic mock provider)", () => {
    expect(all).not.toMatch(/from\s+["'][^"']*freeastroapi/i);
    expect(fixtureSrc).toContain("MockAstroProvider");
  });

  it("runner reuses the existing v4 generator and renderer (no duplication)", () => {
    expect(runnerSrc).toContain("generateCoreV4Split");
    expect(runnerSrc).toContain("renderCoreV4HtmlSafe");
  });

  it("runner reuses the single PDF engine via env override (no second engine)", () => {
    expect(runnerSrc).toContain("scripts/generate-v4-pdf.mjs");
    expect(runnerSrc).toContain("CORE_V4_PDF_IN");
  });

  it("does not add a CORE_SCHEMA_VERSION production selector", () => {
    expect(all).not.toContain("CORE_SCHEMA_VERSION");
  });
});
