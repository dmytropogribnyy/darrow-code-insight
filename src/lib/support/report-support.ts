// Report recovery support — pure logic (no DB, no AI, no Stripe).
//
// Builds a read-only support summary for one report (= one purchase / report
// package, one combined PDF) and a recommended recovery action. Reuses the
// EXISTING schema (orders.status, reports.generation_status / pdf_url /
// ready_email_sent_at / download_token, generation_jobs.attempt_count / last_error).
// report_ref is per reports row, never per module; client name is shown alongside,
// never embedded in report_ref. DIAGNOSTIC/SUPPORT only.

export const ALL_MODULES = ["CORE", "LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"] as const;

export interface SupportReportFacts {
  report_ref: string | null;
  report_id: string;
  module_code: string | null; // per-module bundle row; null = legacy combined
  client_name: string | null;
  email: string | null;
  modules: string[];
  product_title: string;
  // order
  order_status: string | null; // order_status enum
  stripe_session_id: string | null;
  amount_cents: number | null;
  created_at: string | null;
  // generation / delivery
  generation_status: string | null; // report_generation_status enum
  pdf_exists: boolean;
  download_token: string | null;
  link_active: boolean;
  email_sent: boolean;
  ready_email_sent_at: string | null;
  attempt_count: number | null;
  last_error: string | null;
}

// Human product label from the purchased modules.
export function productTitle(modules: string[]): string {
  const set = new Set(modules);
  const hasCore = set.has("CORE");
  const chapters = modules.filter((m) => m !== "CORE");
  if (hasCore && chapters.length === 6) return "CORE Complete";
  if (hasCore && chapters.length === 0) return "CORE Report";
  if (hasCore) return `CORE + ${chapters.length} chapter${chapters.length === 1 ? "" : "s"}`;
  if (chapters.length === 1) return `${chapters[0]} chapter`;
  return `${chapters.length} chapters`;
}

// DC-YYYYMMDD-#### (display/test helper; the DB trigger is the source of truth).
export function formatReportRef(createdAt: Date, seq: number): string {
  const y = createdAt.getUTCFullYear();
  const m = String(createdAt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(createdAt.getUTCDate()).padStart(2, "0");
  return `DC-${y}${m}${d}-${String(seq).padStart(4, "0")}`;
}

const PAID_STATUSES = new Set(["paid", "processing", "complete", "failed_generation"]);

export function paymentSucceeded(orderStatus: string | null): boolean {
  return !!orderStatus && (PAID_STATUSES.has(orderStatus) || orderStatus === "refunded");
}

export type SupportAction = "none" | "resend" | "regenerate" | "investigate_payment" | "refunded";

export interface RecommendedAction {
  action: SupportAction;
  reason: string;
}

// Recovery decision from the persisted facts (GPT-approved logic).
export function recommendedAction(f: SupportReportFacts): RecommendedAction {
  if (f.order_status === "refunded") {
    return { action: "refunded", reason: "Order already refunded — no delivery action." };
  }
  if (!paymentSucceeded(f.order_status)) {
    return {
      action: "investigate_payment",
      reason: `Payment not confirmed (order status: ${f.order_status ?? "unknown"}).`,
    };
  }
  // Paid from here on.
  if (f.generation_status === "failed_generation" || !f.pdf_exists) {
    const many = (f.attempt_count ?? 0) >= 3;
    return {
      action: "regenerate",
      reason: many
        ? `Generation failed/no PDF after ${f.attempt_count} attempts — regenerate; if it keeps failing, consider a manual Stripe refund.`
        : "Paid but generation failed or no PDF — regenerate (no new charge).",
    };
  }
  if (f.pdf_exists && !f.email_sent) {
    return { action: "resend", reason: "PDF exists but report-ready email not recorded — resend." };
  }
  return {
    action: "none",
    reason: "Report generated and email sent — resend only if the customer asks.",
  };
}

// Maps raw joined rows → SupportReportFacts (pure; used by the .server fetcher + tests).
export function toSupportFacts(input: {
  report: any;
  customer?: any;
  order?: any;
  job?: any;
}): SupportReportFacts {
  const { report, customer, order, job } = input;
  const modules: string[] = Array.isArray(report?.modules_array) ? report.modules_array : [];
  const pdf_exists = !!report?.pdf_url;
  const generation_status = report?.generation_status ?? null;
  const email_sent = !!report?.ready_email_sent_at;
  return {
    report_ref: report?.report_ref ?? null,
    report_id: report?.id,
    module_code: report?.module_code ?? null,
    client_name: customer?.first_name ?? null,
    email: customer?.email ?? null,
    modules,
    product_title: productTitle(modules),
    order_status: order?.status ?? null,
    stripe_session_id: order?.stripe_session_id ?? null,
    amount_cents: typeof order?.amount_cents === "number" ? order.amount_cents : null,
    created_at: report?.created_at ?? order?.created_at ?? null,
    generation_status,
    pdf_exists,
    download_token: report?.download_token ?? null,
    link_active: pdf_exists && generation_status === "complete" && !!report?.download_token,
    email_sent,
    ready_email_sent_at: report?.ready_email_sent_at ?? null,
    attempt_count: typeof job?.attempt_count === "number" ? job.attempt_count : null,
    last_error: report?.generation_error ?? job?.last_error ?? null,
  };
}

export function formatSupportSummary(f: SupportReportFacts): string {
  const rec = recommendedAction(f);
  const yn = (b: boolean) => (b ? "yes" : "no");
  return [
    "──────────────────────────────────────────────────────────",
    `  ${f.client_name ?? "(no name)"} · ${f.product_title} · ${f.report_ref ?? "(no ref)"}`,
    `  email:             ${f.email ?? "(none)"}`,
    `  modules:           ${f.modules.join(", ") || "(none)"}`,
    `  payment:           ${f.order_status ?? "unknown"}  (paid: ${yn(paymentSucceeded(f.order_status))})`,
    `  generation:        ${f.generation_status ?? "unknown"}`,
    `  PDF:               ${yn(f.pdf_exists)}`,
    `  download link:     ${f.link_active ? "active" : "inactive"}  (token: ${f.download_token ? "present" : "none"})`,
    `  email sent:        ${yn(f.email_sent)}${f.ready_email_sent_at ? ` (at ${f.ready_email_sent_at})` : ""}`,
    `  attempts:          ${f.attempt_count ?? "n/a"}`,
    `  last error:        ${f.last_error ?? "none"}`,
    `  stripe session:    ${f.stripe_session_id ?? "none"}`,
    `  → recommended:     ${rec.action.toUpperCase()} — ${rec.reason}`,
    "──────────────────────────────────────────────────────────",
  ].join("\n");
}

// ── BUNDLE-D: purchase-level (per-module) support ───────────────────

export interface ModuleActionPlan {
  report_ref: string | null;
  module: string;
  action: SupportAction;
  reason: string;
}

// Per-module recommended action across all reports of a purchase.
export function planSupportActions(facts: SupportReportFacts[]): ModuleActionPlan[] {
  return facts.map((f) => {
    const rec = recommendedAction(f);
    return {
      report_ref: f.report_ref,
      module: f.module_code ?? f.modules[0] ?? "REPORT",
      action: rec.action,
      reason: rec.reason,
    };
  });
}

// Purchase-level summary: header (client/email) + one compact line per module + action.
export function formatPurchaseSupport(facts: SupportReportFacts[]): string {
  if (facts.length === 0) return "No reports found for this purchase.";
  const head = facts[0];
  const yn = (b: boolean) => (b ? "yes" : "no");
  const lines = [
    "══════════════════════════════════════════════════════════",
    `  PURCHASE · ${head.client_name ?? "(no name)"} · ${head.email ?? "(no email)"}`,
    `  reports: ${facts.length}   payment: ${head.order_status ?? "unknown"}   stripe: ${head.stripe_session_id ?? "none"}`,
    "──────────────────────────────────────────────────────────",
  ];
  for (const f of facts) {
    const rec = recommendedAction(f);
    const mod = f.module_code ?? (f.modules.length === 1 ? f.modules[0] : "COMBINED");
    lines.push(
      `  ${mod.padEnd(8)} ${f.report_ref ?? "(no ref)"}  gen=${f.generation_status ?? "?"}  pdf=${yn(f.pdf_exists)}  link=${f.link_active ? "active" : "—"}  email=${yn(f.email_sent)}  → ${rec.action.toUpperCase()}`,
    );
    if (rec.action !== "none") lines.push(`           ${rec.reason}`);
  }
  lines.push("══════════════════════════════════════════════════════════");
  return lines.join("\n");
}
