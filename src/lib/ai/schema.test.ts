// Unit tests for CoreV3Schema backward compatibility and CoreV4Schema contract.
//
// These tests enforce:
//   - v3 reports continue to validate (no regressions)
//   - v4 discriminant is strict (core_v4 ≠ core_v3, no silent fallback)
//   - v4 body section key contract (17 locked keys, no cover_tagline/identity_card/closing)
//   - proof_tags max 5 per section
//   - special section shapes (before_after_pairs, executive_summary_blocks, closing_pillars)
//   - vitality_baseline verbatim disclaimer
//   - strict mode rejects unknown top-level keys (e.g. recommended_next_module)

import { describe, it, expect } from "vitest";
import {
  CoreV3Schema,
  CoreV4Schema,
  CORE_V4_BODY_SECTION_KEYS,
  EXECUTIVE_SUMMARY_LABELS,
  CLOSING_PILLAR_TITLES,
  CORE_V4_DISCLAIMER_TEXT,
  DarrowReportSchema,
} from "./schema";

// ── Fixture helpers ───────────────────────────────────────────────────────────

// Pad string to exact length (satisfies v3 prose minimums in superRefine).
function s(n: number) {
  return "x".repeat(n);
}

// Minimal valid v3 fixture — all prose-length minimums met.
const V3_FIXTURE = {
  schema_version: "core_v3" as const,
  cover_tagline: s(50),
  orientation: s(800),
  core_architecture: s(1100),
  battery: s(900),
  social_interface: s(800),
  numerology_code: s(1000),
  cognitive_style: s(800),
  drive_and_rhythm: s(800),
  professional_archetype: s(900),
  money_and_value: s(800),
  relationship_baseline: s(800),
  vitality_baseline: s(750),
  environment_and_resonance: s(750),
  shadow_and_friction: s(1000),
  before_after: s(500),
  executive_summary: s(1100),
  next_step: s(350),
};

// Standard v4 section (regular shape).
function makeSection(extra?: Record<string, unknown>) {
  return { prose: "valid prose content", ...extra };
}

// Minimal valid v4 fixture — all required fields present.
const V4_FIXTURE = {
  schema_version: "core_v4" as const,
  cover_tagline: "Your personal architecture, decoded.",
  orientation: makeSection(),
  core_architecture: makeSection(),
  operating_mode: makeSection(),
  battery: makeSection(),
  social_interface: makeSection(),
  numerology_code: makeSection(),
  cognitive_style: makeSection(),
  drive_and_rhythm: makeSection(),
  professional_archetype: makeSection(),
  money_and_value: makeSection(),
  relationship_baseline: makeSection(),
  vitality_baseline: makeSection(),
  environment_and_resonance: makeSection(),
  shadow_and_friction: makeSection(),
  before_after: {
    before_after_pairs: [
      { before: "Before first shift.", after: "After first shift." },
      { before: "Before second shift.", after: "After second shift." },
    ],
  },
  executive_summary: {
    executive_summary_blocks: [
      { label: "YOUR CORE ADVANTAGE" as const, content: "Core advantage content." },
      { label: "YOUR PRIMARY SENSITIVITY" as const, content: "Primary sensitivity content." },
      { label: "YOUR DECISION FORMULA" as const, content: "Decision formula content." },
      { label: "THE CORE CONCLUSION" as const, content: "Core conclusion content." },
      { label: "CURRENT CYCLE" as const, content: "Current cycle content." },
      { label: "THE NEXT LEVEL" as const, content: "Next level content." },
    ],
  },
  next_step: {
    closing_pillars: [
      { title: "TRUST THE SIGNAL" as const, prose: "Trust the signal prose." },
      { title: "BUILD THE BASE" as const, prose: "Build the base prose." },
      { title: "RESPECT THE CYCLE" as const, prose: "Respect the cycle prose." },
      { title: "HONOR THE SPACE" as const, prose: "Honor the space prose." },
    ],
  },
};

// ── CoreV3Schema — backward compatibility ─────────────────────────────────────

describe("CoreV3Schema — backward compatibility", () => {
  it("accepts a valid v3 report with prose strings", () => {
    expect(CoreV3Schema.safeParse(V3_FIXTURE).success).toBe(true);
  });

  it("accepts schema_version: core_v3", () => {
    const result = CoreV3Schema.safeParse(V3_FIXTURE);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.schema_version).toBe("core_v3");
    }
  });

  it("accepts v3 sections as structured callout objects", () => {
    const fixture = {
      ...V3_FIXTURE,
      core_architecture: {
        prose: s(1100),
        protocols: [{ title: "Protocol title", body: "Protocol body content." }],
      },
      battery: {
        prose: s(900),
        warning_signals: ["Watch for this signal."],
      },
    };
    expect(CoreV3Schema.safeParse(fixture).success).toBe(true);
  });

  it("rejects schema_version: core_v4 (wrong literal for v3 schema)", () => {
    const result = CoreV3Schema.safeParse({ ...V3_FIXTURE, schema_version: "core_v4" });
    expect(result.success).toBe(false);
  });

  it("rejects fixture with a section prose too short", () => {
    const short = { ...V3_FIXTURE, orientation: s(10) }; // 10 < 800 minimum
    expect(CoreV3Schema.safeParse(short).success).toBe(false);
  });

  it("cover_tagline behaves as a section field (string accepted)", () => {
    const result = CoreV3Schema.safeParse(V3_FIXTURE);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.cover_tagline).toBe("string");
    }
  });

  it("DarrowReportSchema closing field still present and required", () => {
    // closing belongs at report level (not in CoreV3Schema itself)
    expect("closing" in DarrowReportSchema.shape).toBe(true);
  });
});

// ── CoreV4Schema — discriminant ───────────────────────────────────────────────

describe("CoreV4Schema — discriminant", () => {
  it("accepts schema_version: core_v4", () => {
    const result = CoreV4Schema.safeParse(V4_FIXTURE);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.schema_version).toBe("core_v4");
    }
  });

  it("rejects schema_version: core_v3 (wrong literal for v4 schema)", () => {
    const result = CoreV4Schema.safeParse({ ...V4_FIXTURE, schema_version: "core_v3" });
    expect(result.success).toBe(false);
  });

  it("rejects missing schema_version", () => {
    const { schema_version: _omit, ...noVersion } = V4_FIXTURE;
    expect(CoreV4Schema.safeParse(noVersion).success).toBe(false);
  });

  it("rejects schema_version: core_v3 — does not silently fall through to v3", () => {
    // A v4-shaped object with schema_version: core_v3 must fail CoreV4Schema.
    const ambiguous = { ...V4_FIXTURE, schema_version: "core_v3" as const };
    expect(CoreV4Schema.safeParse(ambiguous).success).toBe(false);
  });

  it("rejects missing required body key (operating_mode)", () => {
    const { operating_mode: _omit, ...missing } = V4_FIXTURE;
    expect(CoreV4Schema.safeParse(missing).success).toBe(false);
  });
});

// ── CoreV4Schema — body key contract ─────────────────────────────────────────

describe("CoreV4Schema — body key contract", () => {
  it("CORE_V4_BODY_SECTION_KEYS has exactly 17 entries", () => {
    expect(CORE_V4_BODY_SECTION_KEYS).toHaveLength(17);
  });

  it("operating_mode is in CORE_V4_BODY_SECTION_KEYS", () => {
    expect(CORE_V4_BODY_SECTION_KEYS).toContain("operating_mode");
  });

  it("cover_tagline is NOT in CORE_V4_BODY_SECTION_KEYS", () => {
    expect(CORE_V4_BODY_SECTION_KEYS).not.toContain("cover_tagline");
  });

  it("identity_card is NOT in CORE_V4_BODY_SECTION_KEYS", () => {
    expect(CORE_V4_BODY_SECTION_KEYS).not.toContain("identity_card");
  });

  it("cover_tagline exists as a top-level field in CoreV4Schema (cover sub-field)", () => {
    expect("cover_tagline" in CoreV4Schema.shape).toBe(true);
  });

  it("closing is NOT in CoreV4Schema", () => {
    expect("closing" in CoreV4Schema.shape).toBe(false);
  });

  it("recommended_next_module is NOT in CoreV4Schema (strict mode rejects it)", () => {
    const withCrossSell = { ...V4_FIXTURE, recommended_next_module: "LOVE" };
    expect(CoreV4Schema.safeParse(withCrossSell).success).toBe(false);
  });

  it("all 17 body keys are present in a valid v4 fixture", () => {
    const result = CoreV4Schema.safeParse(V4_FIXTURE);
    expect(result.success).toBe(true);
    if (result.success) {
      for (const key of CORE_V4_BODY_SECTION_KEYS) {
        expect(key in result.data).toBe(true);
      }
    }
  });
});

// ── CoreV4Schema — proof_tags max ─────────────────────────────────────────────

describe("CoreV4Schema — proof_tags max 5 per section", () => {
  it("proof_tags absent (optional) passes", () => {
    expect(CoreV4Schema.safeParse(V4_FIXTURE).success).toBe(true);
  });

  it("proof_tags with 5 tags passes", () => {
    const fixture = {
      ...V4_FIXTURE,
      orientation: makeSection({ proof_tags: ["a", "b", "c", "d", "e"] }),
    };
    expect(CoreV4Schema.safeParse(fixture).success).toBe(true);
  });

  it("proof_tags with 6 tags fails", () => {
    const fixture = {
      ...V4_FIXTURE,
      orientation: makeSection({ proof_tags: ["a", "b", "c", "d", "e", "f"] }),
    };
    expect(CoreV4Schema.safeParse(fixture).success).toBe(false);
  });

  it("proof_tags with 0 tags passes (empty array is optional/allowed)", () => {
    const fixture = {
      ...V4_FIXTURE,
      core_architecture: makeSection({ proof_tags: [] }),
    };
    expect(CoreV4Schema.safeParse(fixture).success).toBe(true);
  });
});

// ── CoreV4Schema — before_after special shape ─────────────────────────────────

describe("CoreV4Schema — before_after special shape", () => {
  it("before_after_pairs with exactly 2 pairs passes", () => {
    expect(CoreV4Schema.safeParse(V4_FIXTURE).success).toBe(true);
  });

  it("before_after_pairs with 1 pair fails", () => {
    const fixture = {
      ...V4_FIXTURE,
      before_after: {
        before_after_pairs: [{ before: "Before.", after: "After." }],
      },
    };
    expect(CoreV4Schema.safeParse(fixture).success).toBe(false);
  });

  it("before_after_pairs with 3 pairs fails", () => {
    const fixture = {
      ...V4_FIXTURE,
      before_after: {
        before_after_pairs: [
          { before: "B1", after: "A1" },
          { before: "B2", after: "A2" },
          { before: "B3", after: "A3" },
        ],
      },
    };
    expect(CoreV4Schema.safeParse(fixture).success).toBe(false);
  });

  it("before_after_pairs with missing before field fails", () => {
    const fixture = {
      ...V4_FIXTURE,
      before_after: {
        before_after_pairs: [
          { after: "A1" }, // missing before
          { before: "B2", after: "A2" },
        ],
      },
    };
    expect(CoreV4Schema.safeParse(fixture).success).toBe(false);
  });
});

// ── CoreV4Schema — executive_summary special shape ───────────────────────────

describe("CoreV4Schema — executive_summary special shape", () => {
  it("EXECUTIVE_SUMMARY_LABELS has exactly 6 entries", () => {
    expect(EXECUTIVE_SUMMARY_LABELS).toHaveLength(6);
  });

  it("executive_summary_blocks with 6 correct labels passes", () => {
    expect(CoreV4Schema.safeParse(V4_FIXTURE).success).toBe(true);
  });

  it("executive_summary_blocks with wrong label fails", () => {
    const fixture = {
      ...V4_FIXTURE,
      executive_summary: {
        executive_summary_blocks: [
          { label: "WRONG LABEL", content: "..." }, // invalid label
          { label: "YOUR PRIMARY SENSITIVITY", content: "..." },
          { label: "YOUR DECISION FORMULA", content: "..." },
          { label: "THE CORE CONCLUSION", content: "..." },
          { label: "CURRENT CYCLE", content: "..." },
          { label: "THE NEXT LEVEL", content: "..." },
        ],
      },
    };
    expect(CoreV4Schema.safeParse(fixture).success).toBe(false);
  });

  it("executive_summary_blocks with only 5 blocks fails", () => {
    const fixture = {
      ...V4_FIXTURE,
      executive_summary: {
        executive_summary_blocks: [
          { label: "YOUR CORE ADVANTAGE", content: "..." },
          { label: "YOUR PRIMARY SENSITIVITY", content: "..." },
          { label: "YOUR DECISION FORMULA", content: "..." },
          { label: "THE CORE CONCLUSION", content: "..." },
          { label: "CURRENT CYCLE", content: "..." },
          // missing THE NEXT LEVEL
        ],
      },
    };
    expect(CoreV4Schema.safeParse(fixture).success).toBe(false);
  });

  it("executive_summary_blocks with 7 blocks fails", () => {
    const fixture = {
      ...V4_FIXTURE,
      executive_summary: {
        executive_summary_blocks: [
          { label: "YOUR CORE ADVANTAGE", content: "..." },
          { label: "YOUR PRIMARY SENSITIVITY", content: "..." },
          { label: "YOUR DECISION FORMULA", content: "..." },
          { label: "THE CORE CONCLUSION", content: "..." },
          { label: "CURRENT CYCLE", content: "..." },
          { label: "THE NEXT LEVEL", content: "..." },
          { label: "YOUR CORE ADVANTAGE", content: "extra block" }, // 7th
        ],
      },
    };
    expect(CoreV4Schema.safeParse(fixture).success).toBe(false);
  });

  it("all 6 locked labels are present in EXECUTIVE_SUMMARY_LABELS", () => {
    expect(EXECUTIVE_SUMMARY_LABELS).toContain("YOUR CORE ADVANTAGE");
    expect(EXECUTIVE_SUMMARY_LABELS).toContain("YOUR PRIMARY SENSITIVITY");
    expect(EXECUTIVE_SUMMARY_LABELS).toContain("YOUR DECISION FORMULA");
    expect(EXECUTIVE_SUMMARY_LABELS).toContain("THE CORE CONCLUSION");
    expect(EXECUTIVE_SUMMARY_LABELS).toContain("CURRENT CYCLE");
    expect(EXECUTIVE_SUMMARY_LABELS).toContain("THE NEXT LEVEL");
  });
});

// ── CoreV4Schema — next_step closing pillars ─────────────────────────────────

describe("CoreV4Schema — next_step closing pillars", () => {
  it("CLOSING_PILLAR_TITLES has exactly 4 entries", () => {
    expect(CLOSING_PILLAR_TITLES).toHaveLength(4);
  });

  it("closing_pillars with 4 correct titles passes", () => {
    expect(CoreV4Schema.safeParse(V4_FIXTURE).success).toBe(true);
  });

  it("closing_pillars with wrong title fails", () => {
    const fixture = {
      ...V4_FIXTURE,
      next_step: {
        closing_pillars: [
          { title: "WRONG TITLE", prose: "..." }, // invalid
          { title: "BUILD THE BASE", prose: "..." },
          { title: "RESPECT THE CYCLE", prose: "..." },
          { title: "HONOR THE SPACE", prose: "..." },
        ],
      },
    };
    expect(CoreV4Schema.safeParse(fixture).success).toBe(false);
  });

  it("closing_pillars with 3 pillars fails", () => {
    const fixture = {
      ...V4_FIXTURE,
      next_step: {
        closing_pillars: [
          { title: "TRUST THE SIGNAL", prose: "..." },
          { title: "BUILD THE BASE", prose: "..." },
          { title: "RESPECT THE CYCLE", prose: "..." },
          // missing HONOR THE SPACE
        ],
      },
    };
    expect(CoreV4Schema.safeParse(fixture).success).toBe(false);
  });

  it("closing_pillars with 5 pillars fails", () => {
    const fixture = {
      ...V4_FIXTURE,
      next_step: {
        closing_pillars: [
          { title: "TRUST THE SIGNAL", prose: "..." },
          { title: "BUILD THE BASE", prose: "..." },
          { title: "RESPECT THE CYCLE", prose: "..." },
          { title: "HONOR THE SPACE", prose: "..." },
          { title: "TRUST THE SIGNAL", prose: "extra" }, // 5th
        ],
      },
    };
    expect(CoreV4Schema.safeParse(fixture).success).toBe(false);
  });

  it("all 4 locked titles are present in CLOSING_PILLAR_TITLES", () => {
    expect(CLOSING_PILLAR_TITLES).toContain("TRUST THE SIGNAL");
    expect(CLOSING_PILLAR_TITLES).toContain("BUILD THE BASE");
    expect(CLOSING_PILLAR_TITLES).toContain("RESPECT THE CYCLE");
    expect(CLOSING_PILLAR_TITLES).toContain("HONOR THE SPACE");
  });
});

// ── CoreV4Schema — vitality_baseline disclaimer ───────────────────────────────

describe("CoreV4Schema — vitality_baseline disclaimer", () => {
  it("disclaimer absent passes (template injects it; AI does not generate it)", () => {
    expect(CoreV4Schema.safeParse(V4_FIXTURE).success).toBe(true);
  });

  it("disclaimer with exact verbatim text passes", () => {
    const fixture = {
      ...V4_FIXTURE,
      vitality_baseline: makeSection({ disclaimer: CORE_V4_DISCLAIMER_TEXT }),
    };
    expect(CoreV4Schema.safeParse(fixture).success).toBe(true);
  });

  it("disclaimer with wrong text fails", () => {
    const fixture = {
      ...V4_FIXTURE,
      vitality_baseline: makeSection({ disclaimer: "This is not medical advice." }),
    };
    expect(CoreV4Schema.safeParse(fixture).success).toBe(false);
  });

  it("CORE_V4_DISCLAIMER_TEXT matches gold sample verbatim", () => {
    expect(CORE_V4_DISCLAIMER_TEXT).toBe(
      "This is interpretive orientation, not medical advice. Consult a qualified healthcare professional for any health concerns.",
    );
  });
});

// ── CoreV4Schema — opening_line max length ────────────────────────────────────

describe("CoreV4Schema — opening_line max 120 chars", () => {
  it("opening_line of exactly 120 chars passes", () => {
    const fixture = {
      ...V4_FIXTURE,
      orientation: makeSection({ opening_line: "x".repeat(120) }),
    };
    expect(CoreV4Schema.safeParse(fixture).success).toBe(true);
  });

  it("opening_line of 121 chars fails", () => {
    const fixture = {
      ...V4_FIXTURE,
      orientation: makeSection({ opening_line: "x".repeat(121) }),
    };
    expect(CoreV4Schema.safeParse(fixture).success).toBe(false);
  });
});
