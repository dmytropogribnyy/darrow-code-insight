// Server-only generation helpers. Blocked from client bundles by the
// `.server.ts` filename. PROMPT 1C will replace the placeholder with the
// real astro-data → AI report → PDF → email pipeline.

import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { MODULE_CODES, type ModuleCode } from "@/lib/modules";

let _sb: any = null;
export function adminClient(): any {
  if (!_sb) {
    _sb = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _sb;
}

async function buildPlaceholderPdf(args: {
  first_name: string | null;
  birth_city: string | null;
  date_of_birth: string;
  modules: ModuleCode[];
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const gold = rgb(0.78, 0.62, 0.22);
  const charcoal = rgb(0.15, 0.15, 0.18);
  const muted = rgb(0.45, 0.45, 0.5);

  page.drawText("DARROW CODE", { x: 50, y: 790, size: 10, font: sans, color: gold });
  page.drawText("Astro Report — Preview", { x: 50, y: 760, size: 22, font: serif, color: charcoal });
  page.drawLine({ start: { x: 50, y: 745 }, end: { x: 545, y: 745 }, thickness: 0.5, color: gold });

  const lines: string[] = [
    "",
    `Prepared for: ${args.first_name ?? "—"}`,
    `Date of birth: ${args.date_of_birth}`,
    `Place of birth: ${args.birth_city ?? "—"}`,
    "",
    "Modules included in this report:",
    "  • CORE",
    ...args.modules.map((m) => `  • ${m}`),
    "",
    "This is a placeholder PDF generated for end-to-end testing of",
    "the Darrow Code purchase flow. The full AI-synthesised report",
    "is wired in PROMPT 1C.",
  ];
  let y = 715;
  for (const line of lines) {
    page.drawText(line, { x: 50, y, size: 12, font: serif, color: charcoal });
    y -= 18;
  }
  page.drawText("More than a horoscope. Your private birth code.", {
    x: 50, y: 60, size: 10, font: serif, color: muted,
  });
  return doc.save();
}

export async function runPlaceholderGeneration(order_id: string): Promise<void> {
  const sb = adminClient();

  const { data: order } = await sb
    .from("orders")
    .select("id, customer_id, intake_id")
    .eq("id", order_id)
    .single();
  if (!order) throw new Error(`order ${order_id} not found`);

  const { data: existingReport } = await sb
    .from("reports")
    .select("id, download_token")
    .eq("intake_id", order.intake_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: ownedRows } = await sb
    .from("modules_purchased")
    .select("module_code")
    .eq("intake_id", order.intake_id);
  const owned = new Set<string>((ownedRows ?? []).map((r: any) => r.module_code));
  const addOnModules = MODULE_CODES.filter((m) => owned.has(m));
  const allModules: any[] = ["CORE", ...addOnModules];

  const { data: intake } = await sb
    .from("intakes")
    .select("date_of_birth, birth_city")
    .eq("id", order.intake_id).single();
  const { data: customer } = await sb
    .from("customers")
    .select("first_name")
    .eq("id", order.customer_id).single();

  const pdfBytes = await buildPlaceholderPdf({
    first_name: customer?.first_name ?? null,
    birth_city: intake?.birth_city ?? null,
    date_of_birth: intake?.date_of_birth ?? "",
    modules: addOnModules,
  });

  let report_id: string;
  let download_token: string;
  if (existingReport) {
    report_id = existingReport.id;
    download_token = existingReport.download_token;
    await sb.from("reports").update({
      modules_array: allModules,
      generation_status: "complete",
      model_used: "placeholder-1.0",
    }).eq("id", report_id);
  } else {
    const { data: created, error } = await sb.from("reports").insert({
      customer_id: order.customer_id,
      intake_id: order.intake_id,
      modules_array: allModules,
      generation_status: "complete",
      model_used: "placeholder-1.0",
    }).select("id, download_token").single();
    if (error || !created) throw new Error(`could not create report: ${error?.message}`);
    report_id = created.id;
    download_token = created.download_token;
  }

  const path = `${download_token}.pdf`;
  const upload = await sb.storage.from("reports").upload(path, pdfBytes, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (upload.error) throw new Error(`pdf upload failed: ${upload.error.message}`);

  await sb.from("reports").update({ pdf_url: path }).eq("id", report_id);
  await sb.from("orders").update({ status: "complete" }).eq("id", order_id);
}
