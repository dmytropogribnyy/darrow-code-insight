import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Download } from "lucide-react";
import { getReportDownloadUrl } from "@/utils/generation.functions";

export const Route = createFileRoute("/download/$reportToken")({
  head: () => ({ meta: [{ title: "Download your report — Darrow Code" }] }),
  component: DownloadPage,
});

function DownloadPage() {
  const { reportToken } = Route.useParams();
  const [busy, setBusy] = useState(false);

  const onDownload = async () => {
    setBusy(true);
    try {
      const { url } = await getReportDownloadUrl({ data: { report_token: reportToken } });
      window.location.href = url;
    } catch (e: any) {
      toast.error(e?.message ?? "Could not download report.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 max-w-md mx-auto px-6 py-20 text-center">
        <p className="text-[10px] tracking-meta uppercase text-gold">Permanent access</p>
        <h1 className="font-serif text-warm-brown mt-3" style={{ fontSize: 30 }}>
          Your Darrow Code Report
        </h1>
        <p className="mt-4 text-[13px] text-neutral-grey">
          This link is yours forever. Bookmark it for future access.
        </p>

        <button
          type="button"
          onClick={onDownload}
          disabled={busy}
          className="mt-8 inline-flex items-center gap-2 border border-gold text-gold px-6 py-3 rounded-[6px] text-[14px] font-medium hover:bg-gold hover:text-navy transition disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          {busy ? "Preparing…" : "Download PDF"}
        </button>
      </main>
      <SiteFooter />
    </div>
  );
}
