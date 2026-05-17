import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Download, ExternalLink } from "lucide-react";
import { getReportDownloadUrl } from "@/utils/generation.functions";
import { BRAND_ASSETS } from "@/lib/brand/assets";

export const Route = createFileRoute("/download/$reportToken")({
  head: () => ({ meta: [{ title: "Your report — Darrow Code" }] }),
  component: DownloadPage,
});

function DownloadPage() {
  const { reportToken } = Route.useParams();
  const [busy, setBusy] = useState<"open" | "download" | null>(null);

  const isIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1));

  const onOpen = async () => {
    // Open blank tab synchronously so Safari (incl. iOS) doesn't block it.
    const win = window.open("about:blank", "_blank");
    setBusy("open");
    try {
      const { inlineUrl } = await getReportDownloadUrl({ data: { report_token: reportToken } });
      if (win) win.location.href = inlineUrl;
      else window.location.href = inlineUrl;
    } catch (e: any) {
      if (win) win.close();
      toast.error(e?.message ?? "Could not open report.");
    } finally {
      setBusy(null);
    }
  };

  const onDownload = async () => {
    setBusy("download");
    try {
      const { downloadUrl } = await getReportDownloadUrl({ data: { report_token: reportToken } });
      if (isIOS) {
        window.location.href = downloadUrl;
      } else {
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = "darrow-code-report.pdf";
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Could not download report.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy">
      <SiteHeader onDark />

      <main
        className="flex-1 text-light-grey"
        style={{
          background: `
            radial-gradient(circle at 50% 18%, rgba(212,175,55,0.06), transparent 28%),
            radial-gradient(circle at 80% 20%, rgba(229,231,235,0.035), transparent 30%),
            linear-gradient(180deg, #0A0F1E 0%, rgba(0,0,0,0.25) 100%)
          `,
          backgroundColor: "#0A0F1E",
        }}
      >
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <img
            src={BRAND_ASSETS.symbolGold}
            alt=""
            aria-hidden="true"
            className="mx-auto mb-6 opacity-95"
            style={{ width: "clamp(48px, 8vw, 64px)", height: "auto" }}
          />
          <p
            className="text-gold font-sans font-semibold uppercase"
            style={{ fontSize: "clamp(11px, 1.2vw, 12px)", letterSpacing: "0.18em" }}
          >
            Permanent access
          </p>
          <h1
            className="font-serif text-paper mt-4"
            style={{ fontSize: "clamp(28px, 4vw, 36px)", color: "var(--paper)", lineHeight: 1.2 }}
          >
            Your Darrow Code Report
          </h1>
          <p className="mt-4 text-[14px] text-light-grey/85">
            Bookmark this page — your link is permanent.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpen}
              disabled={busy !== null}
              className="inline-flex items-center justify-center gap-2 bg-gold text-navy px-5 py-3.5 rounded-[6px] text-[14px] font-semibold hover:brightness-105 transition disabled:opacity-60"
            >
              <ExternalLink className="w-4 h-4" />
              {busy === "open" ? "Opening…" : "Open PDF"}
            </button>
            <button
              type="button"
              onClick={onDownload}
              disabled={busy !== null}
              className="inline-flex items-center justify-center gap-2 border border-gold text-gold px-5 py-3.5 rounded-[6px] text-[14px] font-medium hover:bg-gold hover:text-navy transition disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              {busy === "download" ? "Preparing…" : "Download"}
            </button>
          </div>
          <p className="mt-3 text-[12px] text-muted-grey">
            Open reads in your browser. Download saves a copy.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
