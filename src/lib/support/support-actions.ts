// BUNDLE-D — per-module support actions (pure + injectable; no live calls here).
//
// Each action is SCOPED to ONE module (or an explicit bundle resend) and refuses unsafe
// operations (e.g. resending a module with no PDF yet). Execution is injected via deps so this
// is fully testable with mocks; the real wiring (Supabase/email/regeneration enqueue) is provided
// by the caller. No accidental whole-bundle regeneration; idempotency is the deps' responsibility.

import type { SupportReportFacts } from "./report-support";

export class SupportActionError extends Error {}

export interface SupportActionDeps {
  // Resend the report-ready link for ONE module (PDF must already exist).
  resendModuleEmail: (a: {
    report_ref: string | null;
    download_token: string | null;
    module: string;
  }) => Promise<{ sent: boolean }>;
  // Regenerate ONE module only (enqueue/flag — must not touch other modules).
  regenerateModule: (a: {
    report_id: string;
    report_ref: string | null;
    module: string;
  }) => Promise<{ queued: boolean }>;
  // Resend the purchase bundle email listing all complete modules.
  resendBundleEmail: (a: { modules: string[]; report_refs: (string | null)[] }) => Promise<{
    sent: boolean;
  }>;
}

function moduleOf(f: SupportReportFacts): string {
  return f.module_code ?? f.modules[0] ?? "REPORT";
}

export interface ActionResult {
  action: "resend" | "regenerate" | "resend_bundle";
  module?: string;
  count?: number;
  ok: boolean;
}

// Resend ONE module's link. Refuses if no PDF exists yet.
export async function resendModuleAction(
  fact: SupportReportFacts,
  deps: SupportActionDeps,
): Promise<ActionResult> {
  const module = moduleOf(fact);
  if (!fact.pdf_exists || !fact.download_token) {
    throw new SupportActionError(`cannot resend ${module}: no PDF / link yet — regenerate first`);
  }
  const { sent } = await deps.resendModuleEmail({
    report_ref: fact.report_ref,
    download_token: fact.download_token,
    module,
  });
  return { action: "resend", module, ok: sent };
}

// Regenerate ONE module only (explicit). Does not touch sibling modules.
export async function regenerateModuleAction(
  fact: SupportReportFacts,
  deps: SupportActionDeps,
): Promise<ActionResult> {
  const module = moduleOf(fact);
  const { queued } = await deps.regenerateModule({
    report_id: fact.report_id,
    report_ref: fact.report_ref,
    module,
  });
  return { action: "regenerate", module, ok: queued };
}

// Resend the bundle email for a purchase (all complete modules). Refuses if none are complete.
export async function resendBundleAction(
  facts: SupportReportFacts[],
  deps: SupportActionDeps,
): Promise<ActionResult> {
  const complete = facts.filter((f) => f.pdf_exists && f.download_token);
  if (complete.length === 0) {
    throw new SupportActionError("no complete reports to resend in this purchase");
  }
  const { sent } = await deps.resendBundleEmail({
    modules: complete.map(moduleOf),
    report_refs: complete.map((f) => f.report_ref),
  });
  return { action: "resend_bundle", count: complete.length, ok: sent };
}
