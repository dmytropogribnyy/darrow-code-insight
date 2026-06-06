// BUNDLE-C — purchase-level delivery view (pure).
//
// Given the report rows for ONE purchase (grouped by intake_id), build the per-module list the
// result page + report-ready email present: module, report_ref, status, and a download link when
// complete. Backward compatible: a legacy single combined report stays one "combined" entry.
// No DB/AI/email here. Tokens are passed through as-is; callers must only pass same-purchase rows.

export interface DeliveryReportRow {
  module_code: string | null;
  modules_array: string[] | null;
  report_ref: string | null;
  generation_status: string | null;
  pdf_url: string | null;
  download_token: string;
}

export interface DeliveryEntry {
  module: string; // "CORE"/"LOVE"/... or "REPORT" for a legacy combined report
  label: string;
  report_ref: string | null;
  status: string;
  complete: boolean;
  download_url: string | null; // present only when complete
  download_token: string;
}

export interface PurchaseDelivery {
  mode: "combined" | "separate";
  entries: DeliveryEntry[];
  complete_count: number;
  total: number;
}

const MODULE_ORDER = ["CORE", "LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"];
const MODULE_LABEL: Record<string, string> = {
  CORE: "CORE Report",
  LOVE: "LOVE chapter",
  MONEY: "MONEY chapter",
  BODY: "BODY chapter",
  YEAR: "YEAR chapter",
  STYLE: "STYLE chapter",
  PLACE: "PLACE chapter",
  REPORT: "Darrow Code Report",
};

function moduleOf(r: DeliveryReportRow): string {
  if (r.module_code) return r.module_code;
  const arr = r.modules_array ?? [];
  return arr.length === 1 ? arr[0] : "REPORT";
}

export function buildPurchaseDelivery(
  reports: DeliveryReportRow[],
  opts: { appBaseUrl: string },
): PurchaseDelivery {
  const base = opts.appBaseUrl.replace(/\/$/, "");
  const separate = reports.some((r) => !!r.module_code);

  // In separate mode show only per-module rows; otherwise the (single) combined row(s).
  const rows = separate ? reports.filter((r) => !!r.module_code) : reports;

  // Dedupe by download_token (no duplicate links).
  const seen = new Set<string>();
  const entries: DeliveryEntry[] = [];
  for (const r of rows) {
    if (seen.has(r.download_token)) continue;
    seen.add(r.download_token);
    const module = moduleOf(r);
    const complete = r.generation_status === "complete" && !!r.pdf_url;
    entries.push({
      module,
      label: MODULE_LABEL[module] ?? module,
      report_ref: r.report_ref,
      status: r.generation_status ?? "unknown",
      complete,
      download_url: complete ? `${base}/download/${r.download_token}` : null,
      download_token: r.download_token,
    });
  }

  entries.sort((a, b) => {
    const ia = MODULE_ORDER.indexOf(a.module);
    const ib = MODULE_ORDER.indexOf(b.module);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

  return {
    mode: separate ? "separate" : "combined",
    entries,
    complete_count: entries.filter((e) => e.complete).length,
    total: entries.length,
  };
}
