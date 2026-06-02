// Regression tests for the blank-page prune module.
//
// Full prune behavior (actually removing pages from real PDFs) requires
// a heavy fixture and is covered by the render-only diagnostic workflow.
// These tests verify:
//   - exported constants match the layout contract
//   - validatePrunedLayout fires correct warnings at correct thresholds
//   - the module interface is stable

import { describe, it, expect } from "vitest";
import {
  PRUNE_MIN_GLYPHS,
  PRUNE_PAGE_COUNT_MIN,
  PRUNE_PAGE_COUNT_MAX,
  validatePrunedLayout,
} from "./prune-blank-pages.server";

describe("prune-blank-pages — constants", () => {
  it("PRUNE_MIN_GLYPHS is 3 (blank pages have 0 Tj/TJ ops; real pages have many)", () => {
    expect(PRUNE_MIN_GLYPHS).toBe(3);
  });

  it("PRUNE_PAGE_COUNT_MIN is 16 (collapse below this = article-flow regression)", () => {
    expect(PRUNE_PAGE_COUNT_MIN).toBe(16);
  });

  it("PRUNE_PAGE_COUNT_MAX is 26 (above this = pagination overflow or runaway generation)", () => {
    expect(PRUNE_PAGE_COUNT_MAX).toBe(26);
  });
});

describe("prune-blank-pages — validatePrunedLayout", () => {
  it("returns no warnings when page count is in band and nothing pruned", () => {
    const warnings = validatePrunedLayout([], 20);
    expect(warnings).toHaveLength(0);
  });

  it("returns info warning when pages were pruned", () => {
    const warnings = validatePrunedLayout([7, 19], 18);
    expect(warnings.some((w) => w.level === "info" && w.message.includes("7"))).toBe(true);
    expect(warnings.some((w) => w.message.includes("19"))).toBe(true);
  });

  it("returns warn when final page count is below minimum (article-collapse)", () => {
    const warnings = validatePrunedLayout([], 14);
    expect(warnings.some((w) => w.level === "warn" && w.message.includes("below minimum"))).toBe(
      true,
    );
  });

  it("returns warn when final page count is above maximum (overflow)", () => {
    const warnings = validatePrunedLayout([], 30);
    expect(warnings.some((w) => w.level === "warn" && w.message.includes("exceeds maximum"))).toBe(
      true,
    );
  });

  it("returns no page-count warning at exactly min boundary", () => {
    const warnings = validatePrunedLayout([], PRUNE_PAGE_COUNT_MIN);
    expect(warnings.filter((w) => w.level === "warn")).toHaveLength(0);
  });

  it("returns no page-count warning at exactly max boundary", () => {
    const warnings = validatePrunedLayout([], PRUNE_PAGE_COUNT_MAX);
    expect(warnings.filter((w) => w.level === "warn")).toHaveLength(0);
  });

  it("respects custom pageCountMin/Max overrides", () => {
    const warnings = validatePrunedLayout([], 10, { pageCountMin: 5, pageCountMax: 15 });
    expect(warnings.filter((w) => w.level === "warn")).toHaveLength(0);
  });
});

// ── Blank-page detection contract (documentation) ─────────────────────────
// Full blank-page pruning requires a real APITemplate PDF fixture.
// The render-only diagnostic workflow provides the integration test:
//   POST /api/public/debug/core-v3-run {"mode":"render_only"}
//   → check response.pdf.bytes is reasonable
//   → download and inspect: no page should contain only "Darrow Code · NN"
//
// Detection logic invariants (enforced by the implementation, not unit tests):
//   - Blank pages:  0 Tj/TJ operators in all content streams  → removed
//   - Cover/closing: always protected (index 0 and index n-1)
//   - Background paint (q/Q/m/l/f/re operators): explicitly ignored
//   - FlateDecode streams: decompressed via node:zlib before scanning
//   - If inflate fails: raw bytes scanned (conservative — may miss text
//     in malformed compressed streams, but won't false-positive remove pages)
// ──────────────────────────────────────────────────────────────────────────
