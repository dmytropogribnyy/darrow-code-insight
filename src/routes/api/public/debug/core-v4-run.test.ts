// Source-level tests for the CORE v4.1 diagnostic JSON route.
//
// These tests verify safety invariants and wiring WITHOUT making any
// API calls (no Claude, no FreeAstroAPI, no Supabase writes).
// They inspect the route source via readFileSync — the same pattern
// used in src/lib/ai/core-v4.test.ts for staged-path verification.

import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

const routeSrc = readFileSync(new URL("./core-v4-run.ts", import.meta.url), "utf8");

describe("B3 — core-v4-run route: safety guards", () => {
  it("route file exists and is non-trivial", () => {
    expect(routeSrc.length).toBeGreaterThan(500);
  });

  it("route registers the /api/public/debug/core-v4-run path", () => {
    expect(routeSrc).toContain("/api/public/debug/core-v4-run");
  });

  it("route contains JOB_DISPATCH_SECRET apikey guard", () => {
    expect(routeSrc).toContain("JOB_DISPATCH_SECRET");
    expect(routeSrc).toContain("checkWorkerAuth");
    expect(routeSrc).toContain("unauthorizedResponse");
  });

  it("route does NOT import PDF template or renderer", () => {
    expect(routeSrc).not.toContain("renderReportHtml");
    expect(routeSrc).not.toContain("renderHtmlToPdf");
    expect(routeSrc).not.toContain("apitemplate");
    expect(routeSrc).not.toContain("template");
  });

  it("route does NOT import Stripe or payment modules", () => {
    // Check for import statements only (comments mentioning safety notes are fine).
    expect(routeSrc).not.toMatch(/^import.*stripe/im);
    expect(routeSrc).not.toMatch(/^import.*checkout/im);
  });

  it("route does NOT import email / Resend modules", () => {
    expect(routeSrc).not.toContain("resend");
    expect(routeSrc).not.toContain("Resend");
    expect(routeSrc).not.toContain("sendEmail");
  });

  it("route does NOT call the v3 production pipeline (generateDarrowReport)", () => {
    // Ensure it is not called (comments mentioning it for clarity are fine).
    expect(routeSrc).not.toContain("generateDarrowReport(");
  });

  it("route does NOT use the active v3 system prompt directly", () => {
    expect(routeSrc).not.toContain("DARROW_SYSTEM_PROMPT");
    expect(routeSrc).not.toContain("darrowcode_ai_system_prompt.md");
  });
});

describe("B3 — core-v4-run route: v4 wiring", () => {
  it("route imports buildCoreV4UserPrompt", () => {
    expect(routeSrc).toContain("buildCoreV4UserPrompt");
  });

  it("route imports generateCoreV4Split", () => {
    expect(routeSrc).toContain("generateCoreV4Split");
  });

  it("route imports evaluateCoreV4Structure", () => {
    expect(routeSrc).toContain("evaluateCoreV4Structure");
  });

  it("route imports evaluateCoreV4Lengths", () => {
    expect(routeSrc).toContain("evaluateCoreV4Lengths");
  });

  it("route imports getCoreV4SectionText", () => {
    expect(routeSrc).toContain("getCoreV4SectionText");
  });
});

describe("B3 — core-v4-run route: supported modes", () => {
  it("route supports plan_only mode", () => {
    expect(routeSrc).toContain("plan_only");
    expect(routeSrc).toContain("planOnlyPayload");
  });

  it("route supports validate_cached_json mode", () => {
    expect(routeSrc).toContain("validate_cached_json");
    expect(routeSrc).toContain("validateCachedJson");
  });

  it("route supports generate_json mode", () => {
    expect(routeSrc).toContain("generate_json");
    expect(routeSrc).toContain("generateAndValidate");
  });

  it("route supports both GET and POST handlers", () => {
    expect(routeSrc).toContain("GET: async");
    expect(routeSrc).toContain("POST: async");
  });

  it("plan_only payload includes expected v4 keys, word targets, and safety notes", () => {
    expect(routeSrc).toContain("CORE_V4_KEYS");
    expect(routeSrc).toContain("CORE_V4_WORD_TARGET_RANGE");
    expect(routeSrc).toContain("CORE_V4_WORD_HARD_CAP");
    expect(routeSrc).toContain("SAFETY_NOTES");
  });

  it("route references BUILD_MARKER for staging metadata", () => {
    expect(routeSrc).toContain("BUILD_MARKER");
    expect(routeSrc).toContain("build-marker");
  });
});

describe("B3 — core-v4-run route: v3 isolation", () => {
  it("route does NOT import from the v3 route file or call v3-only functions", () => {
    // No import from core-v3-run (comments referencing it for context are fine).
    expect(routeSrc).not.toMatch(/^import.*core-v3-run/im);
    expect(routeSrc).not.toContain("generateCoreV3Split");
    // evaluateCoreV4Structure is allowed; the bare v3 name is not.
    expect(routeSrc).not.toMatch(/\bevaluateStructure\b/);
    expect(routeSrc).not.toMatch(/\bCORE_V3_KEYS\b/);
  });

  it("route does NOT import quality-gate or v3 diagnostic functions", () => {
    expect(routeSrc).not.toContain("evaluateQualityGate");
    expect(routeSrc).not.toContain("evaluateCoreV3Lengths");
    expect(routeSrc).not.toContain("evaluateStructure");
  });
});
