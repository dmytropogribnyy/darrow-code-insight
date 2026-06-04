// B4 render-only tests for the CORE v4.1 HTML renderer.
//
// Tests verify:
//   1. All 17 v4 body sections are rendered with correct headings
//   2. Special structures render correctly (before_after_pairs,
//      executive_summary_blocks, closing_pillars)
//   3. Cover and closing pages are present
//   4. No blank/empty output
//   5. v3 renderer path is NOT affected (regression guard via import check)
//   6. renderCoreV4HtmlSafe does NOT call AI, Stripe, email, Supabase,
//      or any generation pipeline (source-level check)
//
// No API calls are made. No PDF is generated. Renderer is pure HTML→string.

import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import {
  renderCoreV4HtmlSafe,
  BODY_PAGE_STYLE,
  BODY_PAGE_BREAK_BEFORE,
  BODY_PAGE_STYLE_V4,
} from "./template";

// ── Fixture: minimal but complete CoreV4 object ──────────────────────────────

const FIXTURE_CORE_V4 = {
  schema_version: "core_v4" as const,
  cover_tagline: "Your personal architecture, decoded.",
  orientation: {
    prose: "Orientation prose. This is how you move through the world.",
    opening_line: "You have always operated with a distinct internal compass.",
  },
  core_architecture: {
    prose: "Core architecture prose. The structural layer of how you function.",
    protocols: [{ title: "Clarify Before Act", body: "Return to first principles." }],
  },
  operating_mode: {
    prose: "Operating mode prose. This is your default processing style.",
    key_insight: "You are most effective when you operate from quiet certainty.",
  },
  battery: {
    prose: "Battery prose. This is what restores you.",
    warning_signals: ["Overgiving without replenishing."],
  },
  social_interface: { prose: "Social interface prose. How you show up to others." },
  numerology_code: { prose: "Numerology code prose. The number layer of your pattern." },
  cognitive_style: { prose: "Cognitive style prose. How you process information." },
  drive_and_rhythm: { prose: "Drive and rhythm prose. What animates your action." },
  professional_archetype: {
    prose: "Professional archetype prose. How you operate in work and contribution.",
    proof_tags: ["Sun in Capricorn", "Saturn conjunct Midheaven"],
  },
  money_and_value: { prose: "Money and value prose. Your relationship with resources." },
  relationship_baseline: { prose: "Relationship baseline prose. Your relational pattern." },
  vitality_baseline: {
    prose: "Vitality baseline prose. Your physical rhythm and energy.",
    disclaimer:
      "This is interpretive orientation, not medical advice. Consult a qualified healthcare professional for any health concerns.",
  },
  environment_and_resonance: {
    prose: "Environment and resonance prose. Spaces that support you.",
    scenario: "Think of environments where the pace is deliberate.",
  },
  shadow_and_friction: {
    prose: "Shadow and friction prose. The pressure points in your pattern.",
    warning_signals: ["Chronic over-preparation as avoidance."],
  },
  before_after: {
    before_after_pairs: [
      {
        before: "Before: reacting before the full picture arrives.",
        after: "After: pausing long enough for clarity.",
      },
      {
        before: "Before: mistaking speed for efficiency.",
        after: "After: trusting that depth produces better results.",
      },
    ],
  },
  executive_summary: {
    opening_line: "Here is the essential read of your architecture.",
    executive_summary_blocks: [
      {
        label: "YOUR CORE ADVANTAGE" as const,
        content: "Strategic depth combined with structured execution.",
      },
      {
        label: "YOUR PRIMARY SENSITIVITY" as const,
        content: "Susceptibility to operating without clear purpose.",
      },
      {
        label: "YOUR DECISION FORMULA" as const,
        content: "Gather quietly, then decide with authority.",
      },
      {
        label: "THE CORE CONCLUSION" as const,
        content: "You are built to lead through precision, not volume.",
      },
      {
        label: "CURRENT CYCLE" as const,
        content: "A year of consolidating rather than expanding.",
      },
      {
        label: "THE NEXT LEVEL" as const,
        content: "Operating from choice rather than obligation.",
      },
    ],
  },
  next_step: {
    prose: "Four principles for working with this architecture.",
    closing_pillars: [
      {
        title: "TRUST THE SIGNAL" as const,
        prose: "Your inner signal is accurate. Use it before asking for external confirmation.",
      },
      {
        title: "BUILD THE BASE" as const,
        prose: "The structural work is the most productive thing you can do right now.",
      },
      {
        title: "RESPECT THE CYCLE" as const,
        prose: "The current phase is consolidation. Do not force expansion.",
      },
      {
        title: "HONOR THE SPACE" as const,
        prose: "Protect the quiet where your best thinking happens.",
      },
    ],
  },
};

// ── Run renderer ─────────────────────────────────────────────────────────────

const html = renderCoreV4HtmlSafe(FIXTURE_CORE_V4, "Alex");

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("B4 — renderCoreV4HtmlSafe: document structure", () => {
  it("returns non-empty HTML string", () => {
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(5000);
  });

  it("is a valid HTML document with lang and charset", () => {
    expect(html).toContain("<!doctype html>");
    expect(html).toContain('lang="en"');
    expect(html).toContain('charset="utf-8"');
  });

  it("contains the client name", () => {
    expect(html).toContain("Alex");
  });

  it("does NOT contain Squarespace or v3-only keywords", () => {
    expect(html).not.toContain("Squarespace");
    expect(html).not.toContain("core_v3");
    expect(html).not.toContain("core.opening");
  });
});

describe("B4 — renderCoreV4HtmlSafe: cover page", () => {
  it("contains the cover title", () => {
    expect(html).toContain("The Personal Architecture Report");
  });

  it("contains the cover tagline", () => {
    expect(html).toContain("Your personal architecture, decoded.");
  });

  it("cover has dark background (0A0F1E)", () => {
    expect(html).toContain("#0A0F1E");
  });

  it("cover uses page-break-after:always (does not bleed into body)", () => {
    expect(html).toContain("page-break-after:always");
  });
});

describe("B4 — renderCoreV4HtmlSafe: method page", () => {
  it("contains Method & Orientation page", () => {
    expect(html).toContain("Method");
    expect(html).toContain("Orientation over prediction");
  });

  it("contains the disclaimer text", () => {
    expect(html).toContain("not medical, legal, financial or psychiatric advice");
  });
});

describe("B4 — renderCoreV4HtmlSafe: all 17 body sections present", () => {
  const sectionHeadings = [
    "Orientation",
    "Core Architecture",
    "Operating Mode",
    "The Battery",
    "Social Interface",
    "Numerology Code",
    "Cognitive Style",
    "Drive &amp; Rhythm",
    "Professional Archetype",
    "Money &amp; Value",
    "Relationship Baseline",
    "Vitality Baseline",
    "Environment &amp; Resonance",
    "Shadow &amp; Friction",
    "Before / After",
    "Executive Summary",
    "Next Step",
  ];

  for (const heading of sectionHeadings) {
    it(`contains section heading: ${heading}`, () => {
      expect(html).toContain(heading);
    });
  }
});

describe("B4 — renderCoreV4HtmlSafe: section content rendering", () => {
  it("renders section prose", () => {
    expect(html).toContain("Orientation prose");
    expect(html).toContain("Core architecture prose");
    expect(html).toContain("Operating mode prose");
  });

  it("renders opening_line in italic style", () => {
    expect(html).toContain("You have always operated with a distinct internal compass");
    // opening_line rendered with openingLineStyle
    expect(html).toContain("font-style:italic");
  });

  it("renders key_insight", () => {
    expect(html).toContain("You are most effective when you operate from quiet certainty");
  });

  it("renders protocol boxes", () => {
    expect(html).toContain("PROTOCOL");
    expect(html).toContain("Clarify Before Act");
    expect(html).toContain("Return to first principles");
  });

  it("renders warning_signals boxes", () => {
    expect(html).toContain("Warning Signal");
    expect(html).toContain("Overgiving without replenishing");
  });

  it("renders proof_tags", () => {
    expect(html).toContain("Sun in Capricorn");
    expect(html).toContain("Saturn conjunct Midheaven");
  });

  it("renders scenario text", () => {
    expect(html).toContain("Think of environments where the pace is deliberate");
  });

  it("renders vitality disclaimer", () => {
    expect(html).toContain("This is interpretive orientation, not medical advice");
  });
});

describe("B4 — renderCoreV4HtmlSafe: before_after special structure", () => {
  it("renders before_after_pairs", () => {
    expect(html).toContain("reacting before the full picture arrives");
    expect(html).toContain("pausing long enough for clarity");
    expect(html).toContain("mistaking speed for efficiency");
    expect(html).toContain("trusting that depth produces better results");
  });

  it("renders Before and After labels", () => {
    expect(html).toContain("Before");
    expect(html).toContain("After");
  });

  it("renders pairs in sequence: BEFORE → AFTER → BEFORE → AFTER (not grouped)", () => {
    // Pair 1 before/after, then pair 2 before/after. The first pair's AFTER must
    // appear BEFORE the second pair's BEFORE — otherwise it is grouped B/B/A/A.
    const b1 = html.indexOf("reacting before the full picture arrives"); // pair 1 before
    const a1 = html.indexOf("pausing long enough for clarity"); // pair 1 after
    const b2 = html.indexOf("mistaking speed for efficiency"); // pair 2 before
    const a2 = html.indexOf("trusting that depth produces better results"); // pair 2 after
    expect(b1).toBeGreaterThan(-1);
    expect(a1).toBeGreaterThan(b1);
    expect(b2).toBeGreaterThan(a1); // pair-1 AFTER before pair-2 BEFORE (regression guard)
    expect(a2).toBeGreaterThan(b2);
  });

  it("labels each pair with a subtle Pattern N eyebrow when multiple pairs exist", () => {
    expect(html).toContain("Pattern 1");
    expect(html).toContain("Pattern 2");
  });
});

describe("B4 — renderCoreV4HtmlSafe: executive_summary special structure", () => {
  it("renders all 6 executive_summary_blocks", () => {
    expect(html).toContain("YOUR CORE ADVANTAGE");
    expect(html).toContain("YOUR PRIMARY SENSITIVITY");
    expect(html).toContain("YOUR DECISION FORMULA");
    expect(html).toContain("THE CORE CONCLUSION");
    expect(html).toContain("CURRENT CYCLE");
    expect(html).toContain("THE NEXT LEVEL");
  });

  it("renders block content", () => {
    expect(html).toContain("Strategic depth combined with structured execution");
    expect(html).toContain("Gather quietly, then decide with authority");
  });

  it("renders executive_summary opening_line", () => {
    expect(html).toContain("Here is the essential read of your architecture");
  });
});

describe("B4 — renderCoreV4HtmlSafe: next_step closing pillars", () => {
  it("renders all 4 closing pillar titles", () => {
    expect(html).toContain("TRUST THE SIGNAL");
    expect(html).toContain("BUILD THE BASE");
    expect(html).toContain("RESPECT THE CYCLE");
    expect(html).toContain("HONOR THE SPACE");
  });

  it("renders pillar prose", () => {
    expect(html).toContain(
      "Your inner signal is accurate. Use it before asking for external confirmation",
    );
    expect(html).toContain("Protect the quiet where your best thinking happens");
  });
});

describe("B4 — renderCoreV4HtmlSafe: closing page", () => {
  it("contains the closing page tagline", () => {
    expect(html).toContain("More than a horoscope. Your private birth code.");
  });

  it("closing page uses page-break-before:always", () => {
    // The closing section opens ~700+ chars before the tagline text.
    // Search a 1200-char window to capture the section opening tag.
    const closingIdx = html.lastIndexOf("More than a horoscope");
    const closingSection = html.slice(Math.max(0, closingIdx - 1200), closingIdx);
    expect(closingSection).toContain("page-break-before:always");
  });

  it("closing page uses page-break-after:auto (prevents trailing blank page)", () => {
    expect(html).toContain("page-break-after:auto");
  });

  it("closing page has dark background (#0A0F1E)", () => {
    // Both cover and closing use #0A0F1E; just verify the full document has it.
    expect(html).toContain("#0A0F1E");
  });
});

describe("B4 — renderCoreV4HtmlSafe: layout invariants", () => {
  it("uses BODY_PAGE_STYLE for body sections (layout regression guard)", () => {
    // Verify the exported constant is used (it appears in the HTML output)
    const bodyPadMatch = BODY_PAGE_STYLE.match(/padding:(\d+mm \d+mm \d+)mm/);
    expect(bodyPadMatch).not.toBeNull();
    // The padding string should appear in the rendered HTML
    expect(html).toContain("FAF7F2"); // cream background from BODY_PAGE_STYLE
  });

  it("uses BODY_PAGE_BREAK_BEFORE for body sections", () => {
    expect(BODY_PAGE_BREAK_BEFORE).toContain("page-break-before:always");
    expect(html).toContain("page-break-before:always");
  });

  it("has overflow-wrap:break-word on body sections (prevents horizontal clipping)", () => {
    expect(html).toContain("overflow-wrap:break-word");
  });

  it("does NOT contain the broken v4 fallback field names (regression guard)", () => {
    // These are the wrong field names from the old broken fallback
    expect(html).not.toContain("core.opening");
    expect(html).not.toContain("core.mechanic");
    expect(html).not.toContain("core.shadow");
    expect(html).not.toContain("core.next");
  });
});

describe("B4.1 — renderCoreV4HtmlSafe: @page CSS for Puppeteer/headless rendering", () => {
  it("includes @page rule with A4 size and zero margin (required for preferCSSPageSize:true)", () => {
    expect(html).toContain("@page");
    expect(html).toContain("size: A4");
    expect(html).toContain("margin: 0");
  });
});

describe("B4.1 — renderCoreV4HtmlSafe: client snapshot page (optional)", () => {
  const snapshot = {
    pattern_name: "The Structural Architect",
    core_pattern: "A builder of reliable systems in uncertain terrain.",
    unique_signature: "You bring depth where others bring speed.",
    primary_strength: "Structural clarity under ambiguity.",
    pressure_point: "Over-preparation as avoidance.",
    best_operating_rhythm: "Long cycles: build, produce, recover.",
    current_timing_theme: "Consolidation phase.",
    practical_focus: "Protect depth-conditions.",
  };
  const htmlWithSnap = renderCoreV4HtmlSafe(FIXTURE_CORE_V4, "Alex", snapshot);

  it("renders Client Snapshot heading when clientSnapshot is provided", () => {
    expect(htmlWithSnap).toContain("Client Snapshot");
  });

  it("renders pattern_name in snapshot page", () => {
    expect(htmlWithSnap).toContain("The Structural Architect");
  });

  it("renders core_pattern in snapshot page", () => {
    expect(htmlWithSnap).toContain("A builder of reliable systems in uncertain terrain");
  });

  it("renders Primary Strength label", () => {
    expect(htmlWithSnap).toContain("Primary Strength");
  });

  it("renders Pressure Point label", () => {
    expect(htmlWithSnap).toContain("Pressure Point");
  });

  it("does NOT render Client Snapshot when no snapshot is provided (base fixture)", () => {
    expect(html).not.toContain("Client Snapshot");
  });

  it("snapshot page uses BODY_PAGE_BREAK_BEFORE (page-break-before:always)", () => {
    const snapIdx = htmlWithSnap.indexOf("Client Snapshot");
    const before = htmlWithSnap.slice(Math.max(0, snapIdx - 600), snapIdx);
    expect(before).toContain("page-break-before:always");
  });
});

describe("B4.1 — renderCoreV4HtmlSafe: blank-page prevention (closing page)", () => {
  it("closing page uses page-break-after:auto (not always) — no trailing blank page", () => {
    // Find the last occurrence of the closing page style block
    const closingIdx = html.lastIndexOf("More than a horoscope");
    const closingSection = html.slice(Math.max(0, closingIdx - 1200), closingIdx + 100);
    // Must have auto, must NOT have always on break-after in the same section
    expect(closingSection).toContain("page-break-after:auto");
    expect(closingSection).not.toContain("page-break-after:always");
  });

  it("HTML has exactly one page-break-after:always (only the cover)", () => {
    // cover has page-break-after:always; body sections use only page-break-before:always;
    // closing uses page-break-after:auto. This validates the cover is the only after:always.
    const matches = html.match(/page-break-after:always/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(1);
  });
});

describe("B4.1-R — per-section proof anchors (Darrow baseline style)", () => {
  // The primary Darrow baseline (render-only-2026-06-02) renders proof anchors
  // as a thin grey evidence line at the tail of each section — NOT as chips, and
  // NOT as a separate data-appendix page. These guards lock that behaviour in.
  it("renders proof_tags as a tail evidence line when a section has no callouts", () => {
    const fixture = {
      schema_version: "core_v4" as const,
      orientation: {
        prose: "Orientation prose without callouts.",
        proof_tags: ["Sun Cancer 1H", "Gui Water Day Master"],
      },
    };
    const out = renderCoreV4HtmlSafe(fixture, "Alex");
    expect(out).toContain("Sun Cancer 1H");
    expect(out).toContain("Gui Water Day Master");
    // joined with the Darrow middot separator, not chip markup
    expect(out).toContain("Sun Cancer 1H · Gui Water Day Master");
  });

  it("does NOT render an ANCHORED IN chip strip (phe.pdf-style treatment was reverted)", () => {
    const fixture = {
      schema_version: "core_v4" as const,
      orientation: { prose: "P.", proof_tags: ["Saturn dominant"] },
    };
    const out = renderCoreV4HtmlSafe(fixture, "Alex");
    expect(out).not.toContain("Anchored in");
  });

  it("does NOT render a Data & Reference Anchors appendix page (not in the Darrow baseline)", () => {
    const fixture = {
      schema_version: "core_v4" as const,
      orientation: { prose: "Orientation prose." },
    };
    const out = renderCoreV4HtmlSafe(fixture, "Alex");
    expect(out).not.toContain("Data &amp; Reference Anchors");
  });
});

describe("B5.2 — v4 warning normalization + page-break safety", () => {
  const multiWarn = renderCoreV4HtmlSafe(
    {
      schema_version: "core_v4" as const,
      cover_tagline: "x",
      battery: {
        prose: "battery prose",
        warning_signals: ["First signal here.", "Second signal here.", "Third signal here."],
      },
    },
    "Alex",
  );
  const oneWarn = renderCoreV4HtmlSafe(
    {
      schema_version: "core_v4" as const,
      cover_tagline: "x",
      battery: { prose: "p", warning_signals: ["only one signal"] },
    },
    "Alex",
  );

  it("renders multiple warning_signals as ONE combined 'Warning Signals' block", () => {
    expect(multiWarn).toContain(">Warning Signals<");
    // never N stacked singular 'Warning Signal' labels
    expect((multiWarn.match(/>Warning Signal</g) || []).length).toBe(0);
    expect(multiWarn).toContain("First signal here.");
    expect(multiWarn).toContain("Second signal here.");
    expect(multiWarn).toContain("Third signal here.");
  });

  it("renders a single warning as a singular 'Warning Signal' block", () => {
    expect(oneWarn).toContain(">Warning Signal<");
    expect(oneWarn).not.toContain(">Warning Signals<");
  });

  it("v4 section style clones padding across page breaks (continuation top spacing)", () => {
    expect(BODY_PAGE_STYLE_V4).toContain("box-decoration-break:clone");
    expect(multiWarn).toContain("box-decoration-break:clone");
  });

  it("combined warning block carries break-inside protection (label+body never split)", () => {
    const idx = multiWarn.indexOf(">Warning Signals<");
    const around = multiWarn.slice(Math.max(0, idx - 400), idx);
    expect(around).toContain("break-inside:avoid");
    expect(around).toContain("page-break-inside:avoid");
  });

  it("v3 section style is NOT changed (no clone) — production renderer untouched", () => {
    expect(BODY_PAGE_STYLE).not.toContain("box-decoration-break");
  });
});

describe("B4 — renderCoreV4HtmlSafe: v3 isolation (source-level)", () => {
  // Verify the renderer file does NOT import production pipeline functions
  const templateSrc = readFileSync(new URL("./template.ts", import.meta.url), "utf8");

  it("template.ts does NOT import generateDarrowReport (v3 production pipeline)", () => {
    expect(templateSrc).not.toContain("generateDarrowReport");
  });

  it("template.ts does NOT import Stripe or checkout modules", () => {
    expect(templateSrc).not.toMatch(/^import.*stripe/im);
    expect(templateSrc).not.toMatch(/^import.*checkout/im);
  });

  it("template.ts does NOT import email / Resend", () => {
    expect(templateSrc).not.toContain("resend");
    expect(templateSrc).not.toContain("Resend");
    expect(templateSrc).not.toContain("sendEmail");
  });

  it("template.ts does NOT import Supabase client", () => {
    expect(templateSrc).not.toContain("createClient");
    expect(templateSrc).not.toContain("supabase");
  });

  it("renderCoreV4HtmlSafe is exported from template.ts", () => {
    expect(templateSrc).toContain("export function renderCoreV4HtmlSafe");
  });

  it("renderReportHtmlSafe (v3 production path) is still exported", () => {
    expect(templateSrc).toContain("export function renderReportHtmlSafe");
  });

  it("v3 production renderer still handles schema_version core_v3", () => {
    expect(templateSrc).toContain('core.schema_version === "core_v3"');
  });
});

describe("B4 — core-v4-render route: source-level safety guards", () => {
  const routeSrc = readFileSync(
    new URL("../../routes/api/public/debug/core-v4-render.ts", import.meta.url),
    "utf8",
  );

  it("route file exists and is non-trivial", () => {
    expect(routeSrc.length).toBeGreaterThan(500);
  });

  it("route registers /api/public/debug/core-v4-render path", () => {
    expect(routeSrc).toContain("/api/public/debug/core-v4-render");
  });

  it("route is auth-guarded with JOB_DISPATCH_SECRET", () => {
    expect(routeSrc).toContain("JOB_DISPATCH_SECRET");
    expect(routeSrc).toContain("checkWorkerAuth");
  });

  it("route imports renderCoreV4HtmlSafe (v4 renderer only)", () => {
    expect(routeSrc).toContain("renderCoreV4HtmlSafe");
  });

  it("route does NOT import the v3 renderer directly", () => {
    expect(routeSrc).not.toContain("renderReportHtmlSafe");
    expect(routeSrc).not.toContain("renderReportHtml(");
  });

  it("route does NOT call AI generation (no import of AI modules)", () => {
    // Comments mention generateDarrowReport as a safety note — check imports only.
    expect(routeSrc).not.toMatch(/^import.*generateCoreV4Split/im);
    expect(routeSrc).not.toMatch(/^import.*generateDarrowReport/im);
    expect(routeSrc).not.toMatch(/^import.*anthropic/im);
    expect(routeSrc).not.toMatch(/^import.*core-split/im);
  });

  it("route does NOT import Stripe or checkout", () => {
    expect(routeSrc).not.toMatch(/^import.*stripe/im);
    expect(routeSrc).not.toMatch(/^import.*checkout/im);
  });

  it("route does NOT import email / Resend", () => {
    expect(routeSrc).not.toMatch(/^import.*resend/im);
    expect(routeSrc).not.toContain("sendEmail");
  });

  it("route does NOT import Supabase client (no DB access)", () => {
    // Safety note headers contain 'supabase' as description — check imports only.
    expect(routeSrc).not.toMatch(/^import.*supabase/im);
    expect(routeSrc).not.toMatch(/^import.*createClient/im);
  });

  it("route does NOT import token/download route modules", () => {
    // Safety notes and headers describe download behavior — check imports only.
    expect(routeSrc).not.toMatch(/^import.*reportToken/im);
    expect(routeSrc).not.toContain("getReportDownloadUrl");
  });

  it("route supports both render_html and render_pdf modes", () => {
    expect(routeSrc).toContain("render_html");
    expect(routeSrc).toContain("render_pdf");
  });

  it("safety_notes are present in the route", () => {
    expect(routeSrc).toContain("SAFETY_NOTES");
    expect(routeSrc).toContain("No Stripe");
    expect(routeSrc).toContain("No email");
    expect(routeSrc).toContain("No AI generation");
  });
});
