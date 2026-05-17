import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Loader2, AlertCircle, Sparkles, RefreshCw, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StripeEmbeddedCheckoutBox } from "@/components/StripeEmbeddedCheckout";
import { getReportContext, createUpsellCheckout } from "@/utils/checkout.functions";
import { getReportDownloadUrl } from "@/utils/generation.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { MODULE_CODES, priceForModules, type ModuleCode } from "@/lib/modules";
import { BRAND_ASSETS } from "@/lib/brand/assets";

export const Route = createFileRoute("/result/$reportToken")({
  head: () => ({ meta: [{ title: "Your report is ready — Darrow Code" }] }),
  component: ResultPage,
});

const ADDONS: { code: ModuleCode; title: string; desc: string }[] = [
  { code: "LOVE", title: "LOVE", desc: "Who you attract — and why it keeps happening" },
  { code: "MONEY", title: "MONEY", desc: "Your real wealth pattern & income mechanism" },
  { code: "BODY", title: "BODY", desc: "Your stress signature & recovery rhythm" },
  { code: "YEAR", title: "YEAR", desc: "What this year will demand of you" },
  { code: "STYLE", title: "STYLE", desc: "Your colors, aesthetic & personal signature" },
  { code: "PLACE", title: "PLACE", desc: "Where you'll thrive — and where to avoid" },
];

const MODULE_LABEL: Record<string, string> = {
  CORE: "CORE",
  LOVE: "Love",
  MONEY: "Money",
  BODY: "Body",
  YEAR: "Year",
  STYLE: "Style",
  PLACE: "Place",
};

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function relTime(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

type ReportRow = {
  report_token: string;
  modules: string[];
  status: string;
  error: string | null;
  created_at: string;
  is_current: boolean;
};

function describeReport(modules: string[]): { kind: "complete" | "addons" | "core"; label: string; sub: string } {
  const set = new Set(modules);
  if (set.size === 7) {
    return { kind: "complete", label: "CORE Complete", sub: "Full reading · all 7 chapters · ~50 pages" };
  }
  if (set.has("CORE") && set.size > 1) {
    const addons = modules.filter((m) => m !== "CORE").map((m) => MODULE_LABEL[m] ?? m);
    return {
      kind: "addons",
      label: `CORE + ${addons.join(" + ")}`,
      sub: `${modules.length} chapters in one PDF`,
    };
  }
  if (set.has("CORE")) {
    return { kind: "core", label: "CORE Reading", sub: "Your foundational reading" };
  }
  const labels = modules.map((m) => MODULE_LABEL[m] ?? m).join(" + ");
  return { kind: "addons", label: labels, sub: `${modules.length} focused chapter${modules.length > 1 ? "s" : ""}` };
}

function ReportCard({
  row,
  onOpen,
  onDownload,
  busyAction,
  onRefresh,
}: {
  row: ReportRow;
  onOpen: () => void;
  onDownload: () => void;
  busyAction: "open" | "download" | null;
  onRefresh: () => void;
}) {
  const info = describeReport(row.modules);
  const complete = row.status === "complete";
  const failed = row.status === "failed";
  const pending = !complete && !failed;
  const isPremium = info.kind === "complete";

  // Adaptive ETA copy + stuck detection for pending reports
  const ageMs = Date.now() - new Date(row.created_at).getTime();
  const ageMin = Math.floor(ageMs / 60000);
  const expectedMin = isPremium ? 7 : info.kind === "addons" ? Math.max(2, row.modules.length) : 2;
  const takingLonger = pending && ageMin >= expectedMin + 2;

  let pendingCopy: string;
  if (isPremium) {
    pendingCopy = "Composing your full reading… ~5–7 min · all 7 chapters + grand synthesis";
  } else if (info.kind === "addons" && row.modules.length > 2) {
    pendingCopy = `Composing ${row.modules.length} chapters… ~${expectedMin} min · we'll email you`;
  } else {
    pendingCopy = "Generating… ETA ~2 min · we'll email you";
  }

  return (
    <div
      className={
        "rounded-[10px] border bg-white/60 backdrop-blur-sm px-5 py-5 transition " +
        (isPremium
          ? "border-2 border-gold shadow-[0_4px_24px_-12px_rgba(184,134,11,0.45)]"
          : "border-border")
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {isPremium && <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />}
            <p
              className="text-[11px] tracking-meta uppercase font-bold"
              style={{ color: isPremium ? "#B8860B" : "#7A6F58" }}
            >
              {info.label}
            </p>
            {row.is_current && (
              <span className="text-[10px] uppercase tracking-[0.14em] text-gold/90 font-semibold">
                · this email
              </span>
            )}
          </div>
          <p className="text-[14px] mt-1.5 leading-snug" style={{ color: "#1F1A12" }}>
            {info.sub}
          </p>
          <p className="text-[11.5px] mt-2" style={{ color: "#7A6F58" }}>
            {relTime(row.created_at)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        {complete && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpen}
              disabled={busyAction !== null}
              className={
                "inline-flex items-center justify-center gap-1.5 rounded-[6px] py-3 text-[13px] font-semibold transition disabled:opacity-60 " +
                (isPremium
                  ? "bg-gold text-navy hover:brightness-105"
                  : "border border-gold text-warm-brown hover:bg-gold hover:text-navy")
              }
            >
              <ExternalLink className="w-4 h-4" />
              {busyAction === "open" ? "Opening…" : "Open PDF"}
            </button>
            <button
              type="button"
              onClick={onDownload}
              disabled={busyAction !== null}
              className="inline-flex items-center justify-center gap-1.5 rounded-[6px] py-3 text-[13px] font-semibold transition disabled:opacity-60 border border-gold text-warm-brown hover:bg-gold hover:text-navy"
            >
              <Download className="w-4 h-4" />
              {busyAction === "download" ? "Preparing…" : "Download"}
            </button>
          </div>
        )}
        {pending && (
          <div className="space-y-2">
            <div
              className="w-full inline-flex items-center justify-center gap-2 rounded-[6px] py-3 text-[12.5px] text-center px-3"
              style={{ background: "rgba(184,134,11,0.06)", color: "#7A6F58" }}
            >
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>{pendingCopy}</span>
            </div>
            {takingLonger && (
              <div
                className="flex items-start gap-2 rounded-[6px] py-2.5 px-3 text-[11.5px]"
                style={{ background: "rgba(184,134,11,0.04)", color: "#7A6F58" }}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gold/80" />
                <span className="flex-1">
                  Taking a bit longer than usual — we're still on it. Your PDF will arrive by email
                  the moment it's ready.
                </span>
                <button
                  type="button"
                  onClick={onRefresh}
                  className="inline-flex items-center gap-1 text-gold hover:text-warm-brown font-semibold shrink-0"
                  aria-label="Refresh status"
                >
                  <RefreshCw className="w-3 h-3" /> refresh
                </button>
              </div>
            )}
          </div>
        )}
        {failed && (
          <div
            className="w-full inline-flex items-start gap-2 rounded-[6px] py-3 px-3 text-[12.5px] text-left"
            style={{ background: "rgba(180,40,40,0.06)", color: "#8a3a3a" }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
            <span>
              Generation failed. Our team has been notified — you'll receive a fresh link shortly.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultPage() {
  const { reportToken } = Route.useParams();
  const [selected, setSelected] = useState<Set<ModuleCode>>(new Set());
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyAction, setBusyAction] = useState<{ token: string; action: "open" | "download" } | null>(null);
  const queryClient = useQueryClient();
  const refreshReports = () =>
    queryClient.invalidateQueries({ queryKey: ["report-context", reportToken] });

  const ctxQ = useQuery({
    queryKey: ["report-context", reportToken],
    queryFn: () => getReportContext({ data: { report_token: reportToken } }),
    // Poll while any sibling is still generating
    refetchInterval: (q) => {
      const d = q.state.data as { reports?: ReportRow[] } | undefined;
      const anyPending = d?.reports?.some((r) => r.status !== "complete" && r.status !== "failed");
      return anyPending ? 15000 : false;
    },
  });

  const owned = new Set<string>(ctxQ.data?.owned_modules ?? []);
  const remaining = ADDONS.filter((m) => !owned.has(m.code));
  const ownsOnlyCore = owned.size === 1 && owned.has("CORE");
  const reports: ReportRow[] = (ctxQ.data?.reports ?? []) as ReportRow[];

  const toggle = (code: ModuleCode) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(code)) n.delete(code);
      else n.add(code);
      return n;
    });

  const selectedArr = Array.from(selected) as ModuleCode[];
  const quote = selectedArr.length > 0 ? priceForModules(selectedArr, false) : null;

  const isIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1));

  async function handleOpen(token: string) {
    // Open blank tab SYNCHRONOUSLY in the click handler so Safari (incl. iOS)
    // doesn't block the popup after the awaited server call resolves.
    const win = window.open("about:blank", "_blank");
    setBusyAction({ token, action: "open" });
    try {
      const { inlineUrl } = await getReportDownloadUrl({ data: { report_token: token } });
      if (win) win.location.href = inlineUrl;
      else window.location.href = inlineUrl;
    } catch (e: any) {
      if (win) win.close();
      toast.error(e?.message ?? "Could not open report.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDownload(token: string) {
    setBusyAction({ token, action: "download" });
    try {
      const { downloadUrl } = await getReportDownloadUrl({ data: { report_token: token } });
      if (isIOS) {
        // iOS Safari shows the native Download sheet when the current tab
        // navigates to a URL with Content-Disposition: attachment.
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
      setBusyAction(null);
    }
  }

  async function startUpsell(orderType: "ADDONS" | "FULL_CODE_UPGRADE") {
    if (!ctxQ.data) return;
    setBusy(true);
    try {
      const modules =
        orderType === "FULL_CODE_UPGRADE" ? [...MODULE_CODES] : (Array.from(selected) as ModuleCode[]);
      const res = await createUpsellCheckout({
        data: {
          report_token: reportToken,
          modules,
          order_type: orderType,
          origin: window.location.origin,
          environment: getStripeEnvironment(),
        },
      });
      setClientSecret(res.client_secret);
    } catch (err: any) {
      toast.error(err?.message ?? "Could not start checkout.");
    } finally {
      setBusy(false);
    }
  }

  const multiple = reports.length > 1;

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader onDark />

      {/* TOP — dark navy hero */}
      <section
        className="text-light-grey"
        style={{
          background: `
            radial-gradient(circle at 50% 18%, rgba(212,175,55,0.06), transparent 28%),
            radial-gradient(circle at 80% 20%, rgba(229,231,235,0.035), transparent 30%),
            linear-gradient(180deg, #0A0F1E 0%, rgba(0,0,0,0.25) 100%)
          `,
          backgroundColor: "#0A0F1E",
        }}
      >
        <div className="max-w-xl mx-auto px-6 pt-16 pb-14 text-center">
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
            {multiple ? `Your ${reports.length} readings` : "Your reading is ready"}
          </p>
          <h1
            className="font-serif text-paper mt-4"
            style={{ fontSize: "clamp(28px, 4vw, 36px)", color: "var(--paper)", lineHeight: 1.2 }}
          >
            Your Darrow Code Library
          </h1>
          <p className="mt-3 text-[12.5px] text-light-grey/75 max-w-sm mx-auto">
            Each PDF is delivered separately and also sent to your email. Bookmark this page to access
            all of your readings.
          </p>
        </div>
      </section>

      {/* MIDDLE — report cards stack */}
      <section className="bg-paper">
        <div className="max-w-xl mx-auto px-6 pt-10 pb-2 w-full">
          {ctxQ.isLoading ? (
            <div className="flex items-center justify-center py-10 text-[13px]" style={{ color: "#7A6F58" }}>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading your readings…
            </div>
          ) : reports.length === 0 ? (
            <p className="text-center text-[14px]" style={{ color: "#4A402D" }}>
              We couldn't find this reading. Check your email link.
            </p>
          ) : (
            <>
              {multiple && (
                <p
                  className="text-[11px] tracking-meta uppercase font-bold mb-4 text-center"
                  style={{ color: "#B8860B" }}
                >
                  Your readings · newest first
                </p>
              )}
              <div className="space-y-3">
                {reports.map((r) => (
                  <ReportCard
                    key={r.report_token}
                    row={r}
                    onOpen={() => handleOpen(r.report_token)}
                    onDownload={() => handleDownload(r.report_token)}
                    busyAction={busyAction?.token === r.report_token ? busyAction.action : null}
                    onRefresh={refreshReports}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* BOTTOM — warm paper add-on selection */}
      <main className="flex-1 max-w-xl mx-auto px-6 pt-10 pb-16 w-full">
        {clientSecret ? (
          <div className="max-w-[480px] mx-auto">
            <StripeEmbeddedCheckoutBox fetchClientSecret={async () => clientSecret} />
          </div>
        ) : remaining.length === 0 ? (
          <div className="text-center border-t border-border pt-8">
            <p className="text-[14px]" style={{ color: "#4A402D" }}>
              You own every chapter. Your Darrow Code is complete.
            </p>
          </div>
        ) : (
          <div className="border-t border-border pt-10">
            <h2 className="font-serif text-center text-warm-brown" style={{ fontSize: 24 }}>
              Want to go deeper?
            </h2>
            <p className="text-center text-[13.5px] mt-2" style={{ color: "#2E2519" }}>
              Each new chapter arrives as its own focused PDF — added to the library above.
            </p>

            <div className="mt-8 space-y-3">
              {remaining.map((m) => {
                const active = selected.has(m.code);
                return (
                  <button
                    key={m.code}
                    type="button"
                    onClick={() => toggle(m.code)}
                    className={
                      "w-full text-left border rounded-[8px] px-4 py-4 transition flex items-start gap-4 " +
                      (active
                        ? "border-gold bg-white/60"
                        : "border-border bg-white/30 hover:border-gold/60")
                    }
                  >
                    <div className="flex-1">
                      <p
                        className="text-[12px] tracking-meta uppercase font-bold"
                        style={{ color: "#B8860B" }}
                      >
                        {m.title}
                      </p>
                      <p className="text-[14px] mt-1.5 leading-snug" style={{ color: "#1F1A12" }}>
                        {m.desc}
                      </p>
                    </div>
                    <span
                      className="font-mono text-[14px] whitespace-nowrap font-semibold"
                      style={{ color: "#0A0F1E" }}
                    >
                      +$2.99
                    </span>
                  </button>
                );
              })}
            </div>

            {ownsOnlyCore && (
              <button
                type="button"
                onClick={() => startUpsell("FULL_CODE_UPGRADE")}
                disabled={busy}
                className="mt-4 w-full text-left border-2 border-gold rounded-[8px] px-4 py-4 bg-gold/5 hover:bg-gold/10 transition disabled:opacity-60"
              >
                <p
                  className="text-[12px] tracking-meta uppercase font-bold"
                  style={{ color: "#B8860B" }}
                >
                  Complete your reading — CORE Complete
                </p>
                <p className="text-[14px] mt-1.5 leading-snug" style={{ color: "#1F1A12" }}>
                  All 6 Focused Chapters in one bound PDF with a grand synthesis. Save $7.94.
                </p>
                <p className="font-mono text-[14px] mt-2 font-semibold" style={{ color: "#0A0F1E" }}>
                  +$10.00
                </p>
              </button>
            )}

            {quote && (
              <div className="mt-8 sticky bottom-4">
                <div
                  className="rounded-[8px] px-4 py-3 mb-2 border bg-white/70"
                  style={{ borderColor: "rgba(74,64,45,0.2)" }}
                >
                  <div className="flex items-center justify-between text-[13px]">
                    <span style={{ color: "#4A402D" }}>
                      {selectedArr.length === 1
                        ? `${selectedArr[0]} chapter`
                        : `${selectedArr.length} chapters bundle`}
                    </span>
                    <span className="font-mono font-semibold" style={{ color: "#0A0F1E" }}>
                      {fmt(quote.cents)}
                    </span>
                  </div>
                  {quote.saved_cents > 0 && (
                    <div className="flex items-center justify-between text-[11.5px] mt-1">
                      <span style={{ color: "#7A6F58" }}>
                        if bought separately: <span className="line-through">{fmt(quote.separate_cents)}</span>
                      </span>
                      <span className="font-mono text-gold">save {fmt(quote.saved_cents)}</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => startUpsell("ADDONS")}
                  disabled={busy}
                  className="w-full bg-gold text-navy font-semibold rounded-[6px] py-3.5 flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  <span>{busy ? "Preparing…" : "Add to my library"}</span>
                  <span className="bg-navy text-gold font-mono text-[12px] px-2 py-1 rounded">
                    {fmt(quote.cents)}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link to="/" className="text-[12px] text-neutral-grey hover:text-charcoal">
            ← Back to home
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
