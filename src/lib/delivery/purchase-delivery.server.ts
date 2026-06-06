// BUNDLE-C — resolve a token to its purchase-level delivery view (server-only).
//
// Any module's download_token resolves the purchase via its intake_id, then lists ALL sibling
// reports for that same intake (= same customer purchase). Security: only same-intake_id rows are
// returned, so one token never exposes another customer's reports. Built on the pure
// buildPurchaseDelivery. No new purchase-level token required.

import { buildPurchaseDelivery, type PurchaseDelivery } from "./purchase-delivery";

const SIBLING_COLS =
  "module_code, modules_array, report_ref, generation_status, pdf_url, download_token";

export async function getPurchaseDeliveryByToken(
  sb: any,
  token: string,
  appBaseUrl: string,
): Promise<PurchaseDelivery | null> {
  const { data: report } = await sb
    .from("reports")
    .select("intake_id")
    .eq("download_token", token)
    .maybeSingle();
  if (!report?.intake_id) return null;

  const { data: siblings } = await sb
    .from("reports")
    .select(SIBLING_COLS)
    .eq("intake_id", report.intake_id);

  return buildPurchaseDelivery(siblings ?? [], { appBaseUrl });
}
