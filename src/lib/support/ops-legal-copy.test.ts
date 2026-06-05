// OPS-LEGAL-1 — legal/support copy guards (source-level, no rendering).

import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

const repoRoot = new URL("../../../", import.meta.url);
// Collapse JSX line-wrapping whitespace so multi-line copy matches as one string.
const read = (p: string) => readFileSync(new URL(p, repoRoot), "utf8").replace(/\s+/g, " ");

const terms = read("src/routes/terms.tsx");
const privacy = read("src/routes/privacy.tsx");
const faq = read("src/components/FaqBlock.tsx");

describe("Terms copy", () => {
  it("has the personalized-digital-product + accuracy clauses", () => {
    expect(terms).toContain("personalized digital products");
    expect(terms).toMatch(/not responsible for incorrect report content/i);
    expect(terms).toMatch(/not medical, legal, financial, psychological/i);
  });
  it("contains a Refund Policy section (refunds live ONLY in Terms)", () => {
    expect(terms).toContain("Refund Policy");
    expect(terms).toMatch(/generally non-refundable/i);
    expect(terms).toMatch(/no additional charge/i);
  });
  it("mentions Stripe + a report reference for support", () => {
    expect(terms).toMatch(/Stripe/);
    expect(terms).toMatch(/DC-YYYYMMDD/);
  });
});

describe("Privacy copy", () => {
  it("explains data, Stripe, private PDF link, report reference + deletion", () => {
    expect(privacy).toMatch(/Stripe/);
    expect(privacy).toMatch(/does not store your full card details/i);
    expect(privacy).toMatch(/unique download link/i);
    expect(privacy).toMatch(/report reference/i);
    expect(privacy).toMatch(/request deletion/i);
  });
  it("does NOT contain refund policy (refunds belong only in Terms)", () => {
    expect(privacy.toLowerCase()).not.toContain("refund");
  });
});

describe("FAQ copy", () => {
  it("includes the two approved items", () => {
    expect(faq).toContain("Is payment secure?");
    expect(faq).toContain("What if something goes wrong with my report?");
  });
  it("does NOT include a direct refund FAQ question", () => {
    // No FAQ question line should ask about refunds.
    const questionLines = [...faq.matchAll(/question:\s*"([^"]+)"/g)].map((m) =>
      m[1].toLowerCase(),
    );
    expect(questionLines.some((q) => q.includes("refund"))).toBe(false);
  });
});
