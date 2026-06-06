// BUNDLE-D — per-module support tests (pure + mocked actions; no live calls).

import { describe, it, expect, vi } from "vitest";
import {
  toSupportFacts,
  planSupportActions,
  formatPurchaseSupport,
  type SupportReportFacts,
} from "./report-support";
import {
  resendModuleAction,
  regenerateModuleAction,
  resendBundleAction,
  SupportActionError,
  type SupportActionDeps,
} from "./support-actions";

// Build a per-module fact (bundle row) or a legacy combined fact.
function fact(
  opts: {
    module?: string | null;
    modules?: string[];
    gen?: string;
    pdf?: boolean;
    email_sent?: boolean;
    order?: string;
    ref?: string;
  } = {},
): SupportReportFacts {
  const module = opts.module ?? null;
  return toSupportFacts({
    report: {
      id: `r_${opts.ref ?? module ?? "x"}`,
      report_ref: opts.ref ?? (module ? `DC-20260606-0001-${module}` : "DC-20260606-0001"),
      module_code: module,
      modules_array: opts.modules ?? (module ? [module] : ["CORE", "LOVE"]),
      pdf_url: opts.pdf === false ? null : "path.pdf",
      generation_status: opts.gen ?? "complete",
      download_token: `tok_${module ?? "c"}`,
      ready_email_sent_at: opts.email_sent === false ? null : "2026-06-06T10:00:00Z",
    },
    customer: { first_name: "Alex", email: "alex@example.com" },
    order: { status: opts.order ?? "complete", stripe_session_id: "cs_1" },
    job: { attempt_count: 1 },
  });
}

describe("module_code on facts", () => {
  it("per-module row carries module_code; legacy combined is null", () => {
    expect(fact({ module: "LOVE" }).module_code).toBe("LOVE");
    expect(fact({}).module_code).toBeNull();
  });
});

describe("planSupportActions — per-module recommendation", () => {
  it("complete -> none, failed -> regenerate, pdf+no-email -> resend", () => {
    const facts = [
      fact({ module: "CORE", gen: "complete", email_sent: true }),
      fact({ module: "LOVE", gen: "failed_generation", pdf: false, order: "complete" }),
      fact({ module: "MONEY", gen: "complete", pdf: true, email_sent: false }),
    ];
    const plan = planSupportActions(facts);
    const by = Object.fromEntries(plan.map((p) => [p.module, p.action]));
    expect(by.CORE).toBe("none");
    expect(by.LOVE).toBe("regenerate");
    expect(by.MONEY).toBe("resend");
    expect(plan.every((p) => !!p.report_ref)).toBe(true);
  });
});

describe("formatPurchaseSupport", () => {
  it("renders a purchase header + one line per module", () => {
    const s = formatPurchaseSupport([fact({ module: "CORE" }), fact({ module: "LOVE" })]);
    expect(s).toMatch(/PURCHASE · Alex · alex@example.com/);
    expect(s).toMatch(/reports: 2/);
    expect(s).toMatch(/CORE\s+DC-20260606-0001-CORE/);
    expect(s).toMatch(/LOVE\s+DC-20260606-0001-LOVE/);
  });

  it("legacy combined report still supported (module COMBINED)", () => {
    const s = formatPurchaseSupport([fact({})]);
    expect(s).toMatch(/COMBINED/);
  });
});

function deps(over: Partial<SupportActionDeps> = {}): SupportActionDeps {
  return {
    resendModuleEmail: vi.fn(async () => ({ sent: true })),
    regenerateModule: vi.fn(async () => ({ queued: true })),
    resendBundleEmail: vi.fn(async () => ({ sent: true })),
    ...over,
  };
}

describe("support actions — scoped + safe (mocked)", () => {
  it("resendModuleAction resends ONLY that module when PDF exists", async () => {
    const d = deps();
    const res = await resendModuleAction(fact({ module: "LOVE" }), d);
    expect(res).toMatchObject({ action: "resend", module: "LOVE", ok: true });
    expect(d.resendModuleEmail).toHaveBeenCalledTimes(1);
    expect((d.resendModuleEmail as any).mock.calls[0][0].module).toBe("LOVE");
    expect(d.regenerateModule).not.toHaveBeenCalled();
  });

  it("resendModuleAction refuses when no PDF exists (must regenerate first)", async () => {
    await expect(
      resendModuleAction(fact({ module: "MONEY", gen: "failed_generation", pdf: false }), deps()),
    ).rejects.toBeInstanceOf(SupportActionError);
  });

  it("regenerateModuleAction is scoped to exactly one module", async () => {
    const d = deps();
    await regenerateModuleAction(fact({ module: "BODY", gen: "failed_generation", pdf: false }), d);
    expect(d.regenerateModule).toHaveBeenCalledTimes(1);
    expect((d.regenerateModule as any).mock.calls[0][0].module).toBe("BODY");
  });

  it("resendBundleAction resends only complete modules; refuses if none complete", async () => {
    const d = deps();
    const facts = [
      fact({ module: "CORE", pdf: true }),
      fact({ module: "LOVE", gen: "failed_generation", pdf: false }),
    ];
    const res = await resendBundleAction(facts, d);
    expect(res).toMatchObject({ action: "resend_bundle", count: 1, ok: true });
    expect((d.resendBundleEmail as any).mock.calls[0][0].modules).toEqual(["CORE"]);

    await expect(
      resendBundleAction([fact({ module: "LOVE", gen: "failed_generation", pdf: false })], deps()),
    ).rejects.toBeInstanceOf(SupportActionError);
  });
});
