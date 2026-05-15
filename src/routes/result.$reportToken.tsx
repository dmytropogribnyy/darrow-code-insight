import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Download } from "lucide-react";
import { useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/result/$reportToken")({
  head: () => ({
    meta: [{ title: "Your report is ready — Darrow Code" }],
  }),
  component: ResultPage,
});

const MODULES = [
  { code: "LOVE", title: "LOVE", desc: "Who you attract — and why it keeps happening" },
  { code: "MONEY", title: "MONEY", desc: "Your real wealth pattern & income mechanism" },
  { code: "BODY", title: "BODY", desc: "Your stress signature & recovery rhythm" },
  { code: "YEAR", title: "YEAR", desc: "What this year will demand of you" },
  { code: "STYLE", title: "STYLE", desc: "Your colors, aesthetic & personal signature" },
  { code: "PLACE", title: "PLACE", desc: "Where you'll thrive — and where to avoid" },
] as const;

function ResultPage() {
  const { reportToken } = Route.useParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Phase 2 logic: in real flow, derive this from reports.modules_array.
  const ownsOnlyCore = true;

  const toggle = (code: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(code)) n.delete(code);
      else n.add(code);
      return n;
    });

  const total = selected.size * 2.99;

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader />

      <main className="flex-1 max-w-xl mx-auto px-6 py-16 w-full">
        {/* Top success block */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gold text-gold">
            <Check className="w-5 h-5" />
          </div>
          <p className="mt-4 text-[11px] tracking-meta uppercase text-gold">
            Your CORE is ready
          </p>

          <a
            href={`/download/${reportToken}`}
            className="mt-6 inline-flex items-center gap-2 border border-gold text-gold px-6 py-3 rounded-[6px] text-[14px] font-medium hover:bg-gold hover:text-navy transition"
          >
            <Download className="w-4 h-4" />
            Download your PDF
          </a>
          <p className="mt-3 text-[12px] text-muted-grey">Also sent to your email</p>
        </div>

        <div className="my-12 border-t border-border" />

        {/* Upsell */}
        <p className="text-center text-[12px] text-muted-grey mb-2">
          Your CORE Report is complete. These optional chapters expand specific areas.
        </p>
        <h2 className="font-serif text-center text-warm-brown" style={{ fontSize: 22 }}>
          Want to go deeper?
        </h2>
        <p className="text-center text-[13px] text-neutral-grey mt-1">
          Add a focused chapter — $2.99 each, added to your report
        </p>

        <div className="mt-8 space-y-3">
          {MODULES.map((m) => {
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
                  <p className="text-[12px] text-neutral-grey mt-1">{m.desc}</p>
                </div>
                <span className="font-mono text-[12px] text-charcoal whitespace-nowrap">
                  +$2.99
                </span>
              </button>
            );
          })}
        </div>

        {/* FULL CODE bundle — only when user owns ONLY core */}
        {ownsOnlyCore && (
          <div className="mt-4 border-2 border-gold rounded-[8px] px-4 py-4 bg-gold/5">
            <p className="text-[12px] tracking-meta uppercase text-gold font-semibold">
              Complete your FULL CODE
            </p>
            <p className="text-[12px] text-neutral-grey mt-1">Unlock all 6 chapters</p>
            <p className="font-mono text-[13px] text-charcoal mt-2">+$10.00</p>
          </div>
        )}

        {selected.size > 0 && (
          <div className="mt-8 sticky bottom-4">
            <button
              type="button"
              className="w-full bg-gold text-navy font-semibold rounded-[6px] py-3.5 flex items-center justify-center gap-3"
            >
              <span>Add to my report</span>
              <span className="bg-navy text-gold font-mono text-[12px] px-2 py-1 rounded">
                ${total.toFixed(2)}
              </span>
            </button>
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
