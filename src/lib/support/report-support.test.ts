// OPS-LEGAL-1 — report support logic tests (no DB, no AI, no Stripe).

import { describe, it, expect } from "vitest";
import {
  recommendedAction,
  toSupportFacts,
  productTitle,
  formatReportRef,
  formatSupportSummary,
  paymentSucceeded,
  type SupportReportFacts,
} from "./report-support";

const baseReport = {
  id: "r1",
  report_ref: "DC-20260605-0001",
  customer_id: "c1",
  intake_id: "i1",
  modules_array: ["CORE"],
  pdf_url: "https://example/r.pdf",
  generation_status: "complete",
  generation_error: null,
  download_token: "tok123",
  ready_email_sent_at: "2026-06-05T10:00:00Z",
  created_at: "2026-06-05T09:00:00Z",
};
const facts = (over: Partial<any> = {}): SupportReportFacts =>
  toSupportFacts({
    report: { ...baseReport, ...(over.report ?? {}) },
    customer: { first_name: "Dmitry", email: "dmitry@example.com", ...(over.customer ?? {}) },
    order: {
      status: "complete",
      stripe_session_id: "cs_1",
      amount_cents: 1499,
      ...(over.order ?? {}),
    },
    job: { attempt_count: 1, last_error: null, ...(over.job ?? {}) },
  });

describe("report_ref format", () => {
  it("formats DC-YYYYMMDD-#### (UTC)", () => {
    expect(formatReportRef(new Date("2026-06-05T09:00:00Z"), 1)).toBe("DC-20260605-0001");
    expect(formatReportRef(new Date("2026-12-31T23:59:00Z"), 42)).toBe("DC-20261231-0042");
  });

  it("contains module-agnostic ref with NO client name or sensitive data", () => {
    const ref = formatReportRef(new Date("2026-06-05T09:00:00Z"), 1);
    expect(ref).toMatch(/^DC-\d{8}-\d{4}$/);
    expect(ref.toLowerCase()).not.toContain("dmitry");
    expect(ref).not.toMatch(/@/);
  });
});

describe("productTitle", () => {
  it("CORE only → CORE Report", () => {
    expect(productTitle(["CORE"])).toBe("CORE Report");
  });
  it("CORE + all 6 → CORE Complete", () => {
    expect(productTitle(["CORE", "LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"])).toBe(
      "CORE Complete",
    );
  });
  it("CORE + some → CORE + N chapters", () => {
    expect(productTitle(["CORE", "LOVE", "MONEY"])).toBe("CORE + 2 chapters");
  });
  it("chapters only", () => {
    expect(productTitle(["LOVE"])).toBe("LOVE chapter");
    expect(productTitle(["LOVE", "MONEY"])).toBe("2 chapters");
  });
});

describe("toSupportFacts maps existing schema correctly", () => {
  it("derives pdf_exists, email_sent, link_active, modules, product_title", () => {
    const f = facts();
    expect(f.report_ref).toBe("DC-20260605-0001");
    expect(f.client_name).toBe("Dmitry");
    expect(f.email).toBe("dmitry@example.com");
    expect(f.pdf_exists).toBe(true);
    expect(f.email_sent).toBe(true);
    expect(f.link_active).toBe(true);
    expect(f.product_title).toBe("CORE Report");
    expect(f.attempt_count).toBe(1);
  });

  it("link inactive when generation not complete", () => {
    const f = facts({ report: { generation_status: "processing", pdf_url: null } });
    expect(f.link_active).toBe(false);
    expect(f.pdf_exists).toBe(false);
  });
});

describe("recommendedAction — GPT-approved logic", () => {
  it("paid + complete + pdf + email_sent → none (resend on request)", () => {
    expect(recommendedAction(facts()).action).toBe("none");
  });

  it("paid + complete + pdf + NOT email_sent → resend", () => {
    const r = recommendedAction(facts({ report: { ready_email_sent_at: null } }));
    expect(r.action).toBe("resend");
  });

  it("paid + failed_generation → regenerate", () => {
    const r = recommendedAction(
      facts({ report: { generation_status: "failed_generation", pdf_url: null } }),
    );
    expect(r.action).toBe("regenerate");
  });

  it("paid + missing pdf → regenerate", () => {
    const r = recommendedAction(facts({ report: { pdf_url: null } }));
    expect(r.action).toBe("regenerate");
  });

  it("regenerate after >=3 attempts hints manual refund", () => {
    const r = recommendedAction(
      facts({
        report: { pdf_url: null, generation_status: "failed_generation" },
        job: { attempt_count: 4 },
      }),
    );
    expect(r.action).toBe("regenerate");
    expect(r.reason.toLowerCase()).toContain("refund");
  });

  it("unpaid (pending) → investigate_payment", () => {
    const r = recommendedAction(facts({ order: { status: "pending" } }));
    expect(r.action).toBe("investigate_payment");
  });

  it("refunded → refunded (no delivery action)", () => {
    const r = recommendedAction(facts({ order: { status: "refunded" } }));
    expect(r.action).toBe("refunded");
  });
});

describe("paymentSucceeded", () => {
  it("paid/processing/complete/failed_generation/refunded are post-payment", () => {
    for (const s of ["paid", "processing", "complete", "failed_generation", "refunded"]) {
      expect(paymentSucceeded(s)).toBe(true);
    }
    expect(paymentSucceeded("pending")).toBe(false);
    expect(paymentSucceeded(null)).toBe(false);
  });
});

describe("formatSupportSummary", () => {
  it("shows name · product · ref and the recommended action", () => {
    const s = formatSupportSummary(facts());
    expect(s).toContain("Dmitry");
    expect(s).toContain("CORE Report");
    expect(s).toContain("DC-20260605-0001");
    expect(s).toMatch(/recommended:\s+NONE/);
    expect(s).toContain("payment:");
    expect(s).toContain("generation:");
    expect(s).toContain("PDF:");
    expect(s).toContain("email sent:");
  });
});
