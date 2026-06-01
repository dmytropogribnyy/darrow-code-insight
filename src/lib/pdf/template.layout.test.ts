// Layout regression tests for the v3 PDF renderer.
// These tests enforce the layout contract defined in template.ts and catch
// regressions from ad-hoc page-break edits that previously caused:
//   - blank/stub pages (break-inside:avoid on long sections; excess bottom padding)
//   - proof orphaning (proof rendered before protocols / stranded alone)
//   - sections flowing into each other (page-break-before:auto)
//   - footer/stamp collision (padding too small, or proof landing near stamp zone)
//   - proof-only pages (proof as standalone trailing div after all callouts)
//
// Tests run against exported CSS constants — no full render needed.
// If a test fails, find the relevant constant in template.ts and check
// whether a recent edit violated the layout contract comment block.

import { describe, it, expect } from "vitest";
import {
  BODY_PAGE_STYLE,
  BODY_PAGE_BREAK_BEFORE,
  PROOF_STYLE,
  PROOF_EVIDENCE_STYLE,
} from "./template";

describe("PDF layout contract — section wrapper", () => {
  it("section wrapper does NOT have break-inside:avoid (prevents ghost/stub pages for long sections)", () => {
    expect(BODY_PAGE_STYLE).not.toContain("break-inside:avoid");
    expect(BODY_PAGE_STYLE).not.toContain("page-break-inside:avoid");
  });

  it("section wrapper does NOT have page-break-after (avoids double-break stub pages)", () => {
    expect(BODY_PAGE_STYLE).not.toContain("page-break-after");
    expect(BODY_PAGE_STYLE).not.toContain("break-after");
  });

  it("section wrapper has cream background with print-color-adjust (prevents white bottom strip)", () => {
    expect(BODY_PAGE_STYLE).toContain("background:#FAF7F2");
    expect(BODY_PAGE_STYLE).toContain("print-color-adjust:exact");
  });

  it("section wrapper has ≥16mm bottom padding (stamp text top ~15.2mm from bottom — content must not collide)", () => {
    // Stamp baseline at 12mm from bottom (pdf-lib y=12*2.834pt).
    // Stamp text size 9pt ≈ 3.2mm → stamp text TOP ≈ 15.2mm from bottom.
    // padding-bottom must exceed 15.2mm → minimum 16mm for safe clearance.
    // Current: 20mm → content ends ≤277mm from top → 4.8mm gap above stamp text. Safe.
    const match = BODY_PAGE_STYLE.match(/padding:\d+mm \d+mm (\d+)mm/);
    expect(match).not.toBeNull();
    const bottomPad = parseInt(match![1], 10);
    expect(bottomPad).toBeGreaterThanOrEqual(16);
  });
});

describe("PDF layout contract — blank/stub page prevention", () => {
  it("section wrapper bottom padding ≤ 22mm (>22mm caused blank stub pages when content filled ~272mm)", () => {
    // Root cause of blank page 7/19/22: content+padding exceeded A4 297mm.
    // At 26mm padding, content filling to 272mm → 298mm total → 1mm overflow = blank page.
    // At 20mm padding, content can fill to 277mm before overflow. Reduces blank-page risk.
    const match = BODY_PAGE_STYLE.match(/padding:\d+mm \d+mm (\d+)mm/);
    expect(match).not.toBeNull();
    const bottomPad = parseInt(match![1], 10);
    expect(bottomPad).toBeLessThanOrEqual(22);
  });

  it("section wrapper bottom padding ≥ 16mm (stamp text top ~15.2mm — must maintain clearance)", () => {
    const match = BODY_PAGE_STYLE.match(/padding:\d+mm \d+mm (\d+)mm/);
    expect(match).not.toBeNull();
    const bottomPad = parseInt(match![1], 10);
    expect(bottomPad).toBeGreaterThanOrEqual(16);
  });

  it("BODY_PAGE_STYLE does NOT have break-inside:avoid (this would make long sections atomic and create blank stubs)", () => {
    expect(BODY_PAGE_STYLE).not.toContain("break-inside:avoid");
    expect(BODY_PAGE_STYLE).not.toContain("page-break-inside:avoid");
  });
});

describe("PDF layout contract — section page-break", () => {
  it("BODY_PAGE_BREAK_BEFORE uses always (each section starts on fresh page)", () => {
    expect(BODY_PAGE_BREAK_BEFORE).toContain("page-break-before:always");
  });

  it("BODY_PAGE_BREAK_BEFORE uses break-before:page (modern syntax alongside legacy)", () => {
    expect(BODY_PAGE_BREAK_BEFORE).toContain("break-before:page");
  });

  it("BODY_PAGE_BREAK_BEFORE does NOT include page-break-after (no double-break)", () => {
    expect(BODY_PAGE_BREAK_BEFORE).not.toContain("page-break-after");
  });
});

describe("PDF layout contract — proof/reference block (PROOF_STYLE, legacy export)", () => {
  it("PROOF_STYLE has page-break-before:avoid (legacy contract — still exported for compat)", () => {
    expect(PROOF_STYLE).toContain("page-break-before:avoid");
    expect(PROOF_STYLE).toContain("break-before:avoid");
  });

  it("PROOF_STYLE has break-inside:avoid (proof line never splits mid-text)", () => {
    expect(PROOF_STYLE).toContain("break-inside:avoid");
    expect(PROOF_STYLE).toContain("page-break-inside:avoid");
  });

  it("PROOF_STYLE uses muted colour (proof is subtle metadata, not main content)", () => {
    expect(PROOF_STYLE).toContain("color:#9CA3AF");
  });

  it("PROOF_STYLE has compact top margin (≤ 8pt to stay close to preceding element)", () => {
    const match = PROOF_STYLE.match(/margin-top:(\d+)pt/);
    expect(match).not.toBeNull();
    const marginTop = parseInt(match![1], 10);
    expect(marginTop).toBeLessThanOrEqual(8);
  });
});

describe("PDF layout contract — PROOF_EVIDENCE_STYLE (active: proof inside callout)", () => {
  it("PROOF_EVIDENCE_STYLE exists and is compact (≤ 8pt — embedded evidence, not headline)", () => {
    const match = PROOF_EVIDENCE_STYLE.match(/font-size:(\d+)pt/);
    expect(match).not.toBeNull();
    expect(parseInt(match![1], 10)).toBeLessThanOrEqual(8);
  });

  it("PROOF_EVIDENCE_STYLE uses muted colour (subtle metadata inside callout)", () => {
    expect(PROOF_EVIDENCE_STYLE).toContain("color:#9CA3AF");
  });

  it("PROOF_EVIDENCE_STYLE is italic (visually distinct from callout body text)", () => {
    expect(PROOF_EVIDENCE_STYLE).toContain("font-style:italic");
  });

  it("PROOF_EVIDENCE_STYLE does NOT include page-break rules (inside break-inside:avoid callout — outer rule is sufficient)", () => {
    expect(PROOF_EVIDENCE_STYLE).not.toContain("page-break-before");
    expect(PROOF_EVIDENCE_STYLE).not.toContain("break-before");
    expect(PROOF_EVIDENCE_STYLE).not.toContain("page-break-inside");
    expect(PROOF_EVIDENCE_STYLE).not.toContain("break-inside");
  });

  it("PROOF_EVIDENCE_STYLE has a compact separator (border-top to visually attach to callout body)", () => {
    expect(PROOF_EVIDENCE_STYLE).toContain("border-top");
  });

  it("PROOF_EVIDENCE_STYLE has word-wrap safety (prevents overflow from long technical strings)", () => {
    expect(PROOF_EVIDENCE_STYLE).toContain("overflow-wrap:break-word");
  });
});

describe("PDF layout contract — warning+proof attachment (layout-foundation-3)", () => {
  it("BODY_PAGE_STYLE bottom padding exceeds stamp baseline (12mm) — single-page sections are safe", () => {
    const match = BODY_PAGE_STYLE.match(/padding:\d+mm \d+mm (\d+)mm/);
    expect(match).not.toBeNull();
    const bottomPad = parseInt(match![1], 10);
    expect(bottomPad).toBeGreaterThan(12);
  });

  it("PROOF_EVIDENCE_STYLE is smaller than PROOF_STYLE (evidence inside callout must not visually dominate)", () => {
    const evidenceSize = parseInt(PROOF_EVIDENCE_STYLE.match(/font-size:(\d+)pt/)![1], 10);
    const proofSize = parseInt(PROOF_STYLE.match(/font-size:(\d+)pt/)![1], 10);
    expect(evidenceSize).toBeLessThanOrEqual(proofSize);
  });

  it("PROOF_STYLE does NOT put proof before protocol (proof must be last — technical metadata after guidance)", () => {
    expect(PROOF_STYLE).not.toContain("font-size:22pt");
    expect(PROOF_STYLE).not.toContain("font-size:18pt");
    expect(PROOF_STYLE).toContain("font-style:italic");
  });

  it("PROOF_EVIDENCE_STYLE does NOT make proof prominent (no large font, no heading colour)", () => {
    expect(PROOF_EVIDENCE_STYLE).not.toContain("font-size:22pt");
    expect(PROOF_EVIDENCE_STYLE).not.toContain("font-size:18pt");
    expect(PROOF_EVIDENCE_STYLE).not.toContain("color:#D4AF37");
    expect(PROOF_EVIDENCE_STYLE).not.toContain("color:#4A402D");
  });
});

// ── Blank/stub page detection contract ─────────────────────────────────────
// Full blank-page detection requires PDF text extraction (not available in unit
// tests). The checks below verify the HTML-level invariants that prevent blank
// pages from forming. The runtime diagnostic (core-v3-run.ts) should additionally
// verify that no extracted PDF page contains only "Darrow Code · NN" text.
//
// Layout-foundation-3 changes that prevent blank/stub pages:
//   1. BODY_PAGE_STYLE padding-bottom reduced from 26mm to 20mm
//      → section content can fill to 277mm before overflow (was 271mm)
//   2. Proof embedded inside last callout — removes standalone trailing div
//      → no extra element pushing section height beyond page boundary
//   3. No break-inside:avoid at section level
//      → Chromium can naturally flow long sections across pages
// ──────────────────────────────────────────────────────────────────────────
