// BUNDLE-B (increment 1) — per-module report-unit planning (pure, additive).
//
// Decides, for a purchase, whether to create ONE combined report (legacy) or N
// separate per-module reports — gated by the BUNDLE_SEPARATE_REPORTS flag (default
// OFF). No DB, no AI, no pipeline side effects here; the pipeline consumes this plan
// in a later increment. Legacy combined reports stay valid; single-report purchases
// behave identically. Report grouping is by intake_id / Stripe session, NOT by ref.

import type { ModuleCode } from "@/lib/modules";

export type ReportModule = "CORE" | ModuleCode;

// CORE first, then chapters in catalog order — stable display + ref sequence.
const MODULE_ORDER: ReportModule[] = ["CORE", "LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"];

export function orderModules(modules: ReportModule[]): ReportModule[] {
  const set = new Set(modules);
  return MODULE_ORDER.filter((m) => set.has(m));
}

// Feature flag — separate per-module reports. Default OFF (legacy combined PDF).
export function separateReportsEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const v = env.BUNDLE_SEPARATE_REPORTS;
  return v === "1" || v?.toLowerCase() === "true";
}

// Customer-facing ref. Combined: DC-YYYYMMDD-####. Per-module: DC-YYYYMMDD-####-MODULE.
// (The DB trigger is the source of truth in production; this mirrors it for app/tests.)
export function formatModuleReportRef(
  createdAt: Date,
  seq: number,
  moduleCode?: ReportModule | null,
): string {
  const y = createdAt.getUTCFullYear();
  const m = String(createdAt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(createdAt.getUTCDate()).padStart(2, "0");
  const base = `DC-${y}${m}${d}-${String(seq).padStart(4, "0")}`;
  return moduleCode ? `${base}-${moduleCode}` : base;
}

export interface ReportUnitPlan {
  /** null = legacy combined report; otherwise the single module this row covers. */
  module_code: ReportModule | null;
  /** Combined: all purchased modules. Per-module: exactly [module_code]. */
  modules_array: ReportModule[];
  /** Human label for support/logs. */
  label: string;
}

// Plans the report rows to create for a purchase.
// - separate=false (legacy): ONE combined unit holding all modules.
// - separate=true: ONE unit per selected module (CORE first).
export function planReportUnits(
  modules: ReportModule[],
  opts: { separate: boolean },
): ReportUnitPlan[] {
  const ordered = orderModules(modules);
  if (ordered.length === 0) throw new Error("planReportUnits: no modules selected");

  if (!opts.separate) {
    return [{ module_code: null, modules_array: ordered, label: combinedLabel(ordered) }];
  }
  return ordered.map((m) => ({ module_code: m, modules_array: [m], label: moduleLabel(m) }));
}

function moduleLabel(m: ReportModule): string {
  return m === "CORE" ? "CORE Report" : `${m} chapter`;
}

function combinedLabel(modules: ReportModule[]): string {
  const chapters = modules.filter((m) => m !== "CORE");
  if (modules.includes("CORE") && chapters.length === 6) return "CORE Complete";
  if (modules.includes("CORE") && chapters.length === 0) return "CORE Report";
  if (modules.includes("CORE")) return `CORE + ${chapters.length} chapters`;
  return chapters.length === 1 ? `${chapters[0]} chapter` : `${chapters.length} chapters`;
}

// Groups a purchase's report rows for delivery/support (by a stable purchase key).
export function groupReportsByPurchase<T extends { intake_id: string }>(
  reports: T[],
  keyOf: (r: T) => string = (r) => r.intake_id,
): Map<string, T[]> {
  const out = new Map<string, T[]>();
  for (const r of reports) {
    const k = keyOf(r);
    const arr = out.get(k) ?? [];
    arr.push(r);
    out.set(k, arr);
  }
  return out;
}
