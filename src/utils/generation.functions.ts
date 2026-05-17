// Client-importable server functions for the report download flow.
// Heavy server-only work (PDF generation, supabase admin) lives in
// `@/lib/generation.server` and is imported lazily inside the handler.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getReportDownloadUrl = createServerFn({ method: "POST" })
  .inputValidator(z.object({ report_token: z.string().min(8).max(255) }).parse)
  .handler(async ({ data }) => {
    const { adminClient } = await import("@/lib/generation.server");
    const sb = adminClient();
    const { data: report } = await sb
      .from("reports")
      .select("pdf_url, generation_status")
      .eq("download_token", data.report_token)
      .maybeSingle();
    if (!report) throw new Error("Report not found");
    if (report.generation_status !== "complete" || !report.pdf_url) {
      throw new Error("Report is still being generated");
    }
    // Two signed URLs from the same object:
    //  - inlineUrl: opens in-browser (Content-Disposition: inline) for "Open PDF"
    //  - downloadUrl: forces save (Content-Disposition: attachment) for "Download PDF"
    const [inlineRes, downloadRes] = await Promise.all([
      sb.storage.from("reports").createSignedUrl(report.pdf_url, 300),
      sb.storage
        .from("reports")
        .createSignedUrl(report.pdf_url, 300, { download: "darrow-code-report.pdf" }),
    ]);
    if (inlineRes.error || !inlineRes.data || downloadRes.error || !downloadRes.data) {
      throw new Error("Could not create download link");
    }
    return {
      // `url` kept for backward compatibility with existing callers.
      url: downloadRes.data.signedUrl as string,
      inlineUrl: inlineRes.data.signedUrl as string,
      downloadUrl: downloadRes.data.signedUrl as string,
    };
  });
