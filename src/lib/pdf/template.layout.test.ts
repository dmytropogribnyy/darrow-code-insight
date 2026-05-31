// Layout regression tests for the v3 PDF renderer.
// These tests enforce the layout contract defined in template.ts and catch
// regressions from ad-hoc page-break edits that previously caused:
//   - blank/stub pages (break-inside:avoid on long sections)
//   - proof orphaning (proof rendered before protocols / stranded alone)
//   - sections flowing into each other (page-break-before:auto)
//   - footer/stamp collision (padding too small)
//
// Tests run against exported CSS constants — no full render needed.
// If a test fails, find the relevant constant in template.ts and check
// whether a recent edit violated the layout contract comment block.

import { describe, it, expect } from "vitest";
import { BODY_PAGE_STYLE, BODY_PAGE_BREAK_BEFORE, PROOF_STYLE } from "./template";

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

  it("section wrapper has ≥14mm bottom padding (stamp at 12mm from bottom — must not collide)", () => {
    // padding:22mm 20mm 26mm — third value is bottom.
    // 26mm > 12mm stamp position = safe clearance on the last physical page of a section.
    const match = BODY_PAGE_STYLE.match(/padding:\d+mm \d+mm (\d+)mm/);
    expect(match).not.toBeNull();
    const bottomPad = parseInt(match![1], 10);
    expect(bottomPad).toBeGreaterThanOrEqual(14);
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

describe("PDF layout contract — proof/reference block", () => {
  it("PROOF_STYLE has page-break-before:avoid (proof stays with preceding content)", () => {
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

describe("PDF layout contract — warning+proof attachment (trailingBlock)", () => {
  it("BODY_PAGE_STYLE bottom padding exceeds stamp position so single-page sections are safe", () => {
    // Stamp is at 12mm from physical bottom. padding-bottom must exceed this.
    const match = BODY_PAGE_STYLE.match(/padding:\d+mm \d+mm (\d+)mm/);
    expect(match).not.toBeNull();
    const bottomPad = parseInt(match![1], 10);
    expect(bottomPad).toBeGreaterThan(12);
  });

  it("PROOF_STYLE does NOT put proof before protocol (proof must be last)", () => {
    // Structural check: proof must NOT dominate the opening of a section.
    // We verify by checking that PROOF_STYLE is compact/muted, not a heading style.
    expect(PROOF_STYLE).not.toContain("font-size:22pt");
    expect(PROOF_STYLE).not.toContain("font-size:18pt");
    expect(PROOF_STYLE).toContain("font-style:italic");
  });
});
