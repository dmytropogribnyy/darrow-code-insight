import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Download } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StripeEmbeddedCheckoutBox } from "@/components/StripeEmbeddedCheckout";
import { getReportContext, createUpsellCheckout } from "@/utils/checkout.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { MODULE_CODES, priceForModules, type ModuleCode } from "@/lib/modules";
import { BRAND_ASSETS } from "@/lib/brand/assets";

export const Route = createFileRoute("/result/$reportToken")({
  head: () => ({ meta: [{ title: "Your report is ready — Darrow Code" }] }),
  component: ResultPage,
});

const MODULES: { code: ModuleCode; title: string; desc: string }[] = [
  { code: "LOVE", title: "LOVE", desc: "Who you attract — and why it keeps happening" },
  { code: "MONEY", title: "MONEY", desc: "Your real wealth pattern & income mechanism" },
  { code: "BODY", title: "BODY", desc: "Your stress signature & recovery rhythm" },
  { code: "YEAR", title: "YEAR", desc: "What this year will demand of you" },
  { code: "STYLE", title: "STYLE", desc: "Your colors, aesthetic & personal signature" },
  { code: "PLACE", title: "PLACE", desc: "Where you'll thrive — and where to avoid" },
];

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function ResultPage() {
  const { reportToken } = Route.useParams();
  const [selected, setSelected] = useState<Set<ModuleCode>>(new Set());
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const ctxQ = useQuery({
    queryKey: ["report-context", reportToken],
    queryFn: () => getReportContext({ data: { report_token: reportToken } }),
  });

  // owned includes "CORE" + any owned chapter codes (server-side union).
  const owned = new Set<string>(ctxQ.data?.owned_modules ?? []);
  const ownedChapters = MODULE_CODES.filter((m) => owned.has(m));
  const remaining = MODULES.filter((m) => !owned.has(m.code));
  const ownsOnlyCore = ownedChapters.length === 0;

  const toggle = (code: ModuleCode) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(code)) n.delete(code);
      else n.add(code);
      return n;
    });

  // Bundle-priced quote for currently selected remaining chapters (no CORE — customer already owns it).
  const selectedArr = Array.from(selected) as ModuleCode[];
  const quote =
    selectedArr.length > 0 ? priceForModules(selectedArr, false) : null;

  async function startUpsell(orderType: "ADDONS" | "FULL_CODE_UPGRADE") {
    if (!ctxQ.data) return;
    setBusy(true);
    try {
      const modules =
        orderType === "FULL_CODE_UPGRADE"
          ? [...MODULE_CODES]
          : (Array.from(selected) as ModuleCode[]);
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

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader />

      <main className="flex-1 max-w-xl mx-auto px-6 py-16 w-full">
        <div className="text-center">
          <img
            src={BRAND_ASSETS.symbolGold}
            alt=""
            aria-hidden="true"
            className="mx-auto mb-4 w-14 h-14 opacity-95"
          />
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gold text-gold">
            <Check className="w-5 h-5" />
          </div>
          <p className="mt-4 text-[11px] tracking-meta uppercase text-gold">Your report is ready</p>

          <a
            href={`/download/${reportToken}`}
            className="mt-6 inline-flex items-center gap-2 border border-gold text-gold px-6 py-3 rounded-[6px] text-[14px] font-medium hover:bg-gold hover:text-navy transition"
          >
            <Download className="w-4 h-4" />
            Download your PDF
          </a>
          <p className="mt-3 text-[12px] text-muted-grey">Also sent to your email · No account required</p>

          {/* Owned summary */}
          <p className="mt-5 text-[12px]" style={{ color: "#5C5340" }}>
            <span className="uppercase tracking-[0.16em] text-gold font-semibold">Owned:</span>{" "}
            CORE{ownedChapters.length > 0 ? ", " + ownedChapters.join(", ") : ""}
          </p>
        </div>

        <div className="my-12 border-t border-border" />

        {clientSecret ? (
          <div className="max-w-[480px] mx-auto">
            <StripeEmbeddedCheckoutBox fetchClientSecret={async () => clientSecret} />
          </div>
        ) : remaining.length === 0 ? (
          <div className="text-center">
            <p className="text-[14px]" style={{ color: "#4A402D" }}>
              You own the full CORE Complete reading. Nothing else to add.
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-serif text-center text-warm-brown" style={{ fontSize: 22 }}>
              Want to go deeper?
            </h2>
            <p className="text-center text-[13px] mt-1" style={{ color: "#5C5340" }}>
              Add a focused chapter — $2.99 each, or bundle to save.
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
                      <p className="text-[12px] tracking-meta uppercase text-gold font-semibold">
                        {m.title}
                      </p>
                      <p className="text-[13px] mt-1" style={{ color: "#5C5340" }}>
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

            {/* CORE Complete upgrade — only when customer owns only CORE */}
            {ownsOnlyCore && (
              <button
                type="button"
                onClick={() => startUpsell("FULL_CODE_UPGRADE")}
                disabled={busy}
                className="mt-4 w-full text-left border-2 border-gold rounded-[8px] px-4 py-4 bg-gold/5 hover:bg-gold/10 transition disabled:opacity-60"
              >
                <p className="text-[12px] tracking-meta uppercase text-gold font-semibold">
                  Complete your reading — CORE Complete
                </p>
                <p className="text-[13px] mt-1" style={{ color: "#5C5340" }}>
                  Unlock all 6 Focused Chapters in one upgrade. Save $7.94.
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
                        <span className="line-through">{fmt(quote.separate_cents)}</span>{" "}
                        separately
                      </span>
                      <span className="font-mono text-gold">
                        save {fmt(quote.saved_cents)}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => startUpsell("ADDONS")}
                  disabled={busy}
                  className="w-full bg-gold text-navy font-semibold rounded-[6px] py-3.5 flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  <span>{busy ? "Preparing…" : "Add to my report"}</span>
                  <span className="bg-navy text-gold font-mono text-[12px] px-2 py-1 rounded">
                    {fmt(quote.cents)}
                  </span>
                </button>
              </div>
            )}
          </>
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
