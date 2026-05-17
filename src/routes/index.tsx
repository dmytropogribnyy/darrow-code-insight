import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { IntakeForm } from "@/components/IntakeForm";
import { ProductSelector } from "@/components/ProductSelector";
import { FaqBlock } from "@/components/FaqBlock";
import { MODULE_CODES, type ModuleCode } from "@/lib/modules";

type Selectable = "CORE" | ModuleCode;


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Darrow Code Astro Report — Your private AI astrology PDF" },
      {
        name: "description",
        content:
          "More than a horoscope. Less than a consultation. A private AI-powered astrology PDF built from your birth data — Western, Bazi, numerology and pattern psychology.",
      },
      { property: "og:title", content: "Darrow Code Astro Report" },
      {
        property: "og:description",
        content:
          "Your private AI-powered astrology report — built from your birth data and decoded through the Darrow Code Method.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  // CORE pre-selected by default but the user can unselect it.
  const [selected, setSelected] = useState<Set<Selectable>>(new Set(["CORE"]));
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const selectorRef = useRef<HTMLDivElement>(null);

  const toggle = (code: Selectable) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(code)) n.delete(code);
      else n.add(code);
      return n;
    });
  const selectAll = () => setSelected(new Set<Selectable>(["CORE", ...MODULE_CODES]));
  const clear = () => setSelected(new Set());

  const handleChangeSelection = () => {
    setCheckoutOpen(false);
    setResetSignal((n) => n + 1);
    requestAnimationFrame(() => {
      selectorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const jumpToChapter = (key: string) => {
    const el = document.getElementById(`chapter-${key}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("chapter-pulse");
    void el.offsetWidth; // restart animation
    el.classList.add("chapter-pulse");
    window.setTimeout(() => el.classList.remove("chapter-pulse"), 1800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader onDark />

      {/* HERO — dark navy section */}
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
        <div className="max-w-3xl mx-auto px-6 pt-12 sm:pt-16 pb-10 sm:pb-12 text-center">
          {/* Top badge */}
          <div className="inline-flex items-center border border-gold/60 rounded-full px-4 py-2">
            <span
              className="font-sans font-semibold text-gold uppercase"
              style={{ fontSize: "clamp(11.5px, 1.2vw, 12px)", letterSpacing: "0.12em" }}
            >
              PREMIUM AI-POWERED ASTROLOGY REPORT · DARROW CODE METHOD · PDF
            </span>
          </div>

          {/* Darrow symbol */}
          <img
            src="/brand/darrow-symbol-small.png"
            alt="Darrow Code"
            className="mx-auto mt-5 sm:mt-7 mb-[18px] sm:mb-6 opacity-95"
            style={{
              width: "clamp(44px, 8vw, 56px)",
              height: "auto",
              imageRendering: "-webkit-optimize-contrast",
            }}
          />

          {/* Headline */}
          <h1
            className="font-serif mt-8 text-paper leading-[1.05]"
            style={{ fontSize: "clamp(38px, 6vw, 56px)", color: "var(--paper)" }}
          >
            Your zodiac sign
            <br />
            is only the surface.
          </h1>

          {/* Tagline */}
          <p
            className="font-serif italic mt-5 text-gold leading-[1.3]"
            style={{ fontSize: "clamp(18px, 2.6vw, 22px)" }}
          >
            More than a horoscope.
            <br />
            Your private birth code.
          </p>

          {/* Brand continuity */}
          <p className="mt-3 text-[15px] sm:text-[16px] md:text-[17px] text-light-grey leading-[1.6] font-sans font-medium">
            AI-powered · Built from your birth data · Decoded through the Darrow Code Method
          </p>

          {/* Explainer */}
          <p className="mt-6 sm:mt-7 text-[16px] sm:text-[17px] md:text-[18px] text-muted-grey max-w-[640px] mx-auto leading-[1.6] font-sans">
            Get a premium private astrology report built from your birth data — revealing your personal pattern: how you think, react, choose and move through change.
          </p>

          {/* Quote box */}
          <div className="mt-6 sm:mt-7 max-w-[460px] mx-auto text-left bg-white/[0.04] border-l-2 border-gold/80 pl-5 pr-4 py-4 rounded-r-[6px]">
            <p className="font-serif italic text-light-grey text-[16px] sm:text-[17px] leading-[1.45]">
              "One astrology tradition shows part of the picture.
              <br />
              <span className="not-italic text-gold">Darrow Code reads the full pattern.</span>"
            </p>
          </div>

          {/* Method line */}
          <p
            className="mt-7 sm:mt-8 font-sans font-medium text-[11.5px] sm:text-[13px] text-[#9CA3AF] uppercase"
            style={{ letterSpacing: "0.1em" }}
          >
            Western Astrology · Chinese Bazi · Numerology · Pattern Psychology · AI Synthesis
          </p>

          {/* Focused chapters teaser */}
          <div className="mt-3 sm:mt-4 max-w-[520px] mx-auto">
            <p className="text-center font-sans text-[14px] sm:text-[15px] md:text-[16px] text-light-grey leading-relaxed">
              Start with{" "}
              <button
                type="button"
                onClick={() => jumpToChapter("CORE")}
                className="font-semibold text-[#D4AF37] border-b border-transparent hover:border-[#D4AF37]/70 hover:text-[#E6C35A] transition-colors duration-150 pb-px cursor-pointer"
                aria-label="Jump to CORE Report"
              >
                CORE
              </button>
              , add focused chapters, or get{" "}
              <button
                type="button"
                onClick={() => jumpToChapter("COMPLETE")}
                className="font-semibold text-[#D4AF37] border-b border-transparent hover:border-[#D4AF37]/70 hover:text-[#E6C35A] transition-colors duration-150 pb-px cursor-pointer"
                aria-label="Jump to CORE Complete bundle"
              >
                CORE Complete
              </button>
              :
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-x-2.5 gap-y-1">
              {["LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"].map((m, i) => (
                <span key={m} className="flex items-center gap-x-2.5">
                  <button
                    type="button"
                    onClick={() => jumpToChapter(m)}
                    aria-label={`Jump to ${m} chapter`}
                    className="font-sans font-semibold text-[13.5px] sm:text-[14px] md:text-[15px] text-[#D4AF37] cursor-pointer border-b border-transparent hover:border-[#D4AF37]/70 hover:text-[#E6C35A] transition-colors duration-150 pb-px"
                  >
                    {m}
                  </button>
                  {i < 5 && (
                    <span className="text-[#6B6B6B] text-[12px]">·</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Gold hairline divider between hero and intake */}
        <div
          aria-hidden="true"
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.45) 50%, transparent 100%)",
          }}
        />
      </section>

      {/* PRODUCT SELECTOR — paper section */}
      <section>
        <div ref={selectorRef} className="max-w-[560px] mx-auto px-4 sm:px-6 pt-10 sm:pt-12">
          <ProductSelector
            selected={selected}
            onToggle={toggle}
            onSelectAll={selectAll}
            onClear={clear}
            locked={checkoutOpen}
          />
          {checkoutOpen && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={handleChangeSelection}
                className="font-sans font-medium text-[14px] min-h-[44px] px-3 inline-flex items-center transition-colors border-b border-transparent hover:border-current"
                style={{ color: "#D4AF37" }}
              >
                + Add more to your order
              </button>
            </div>
          )}
        </div>
      </section>

      {/* INTAKE — paper section */}
      <section className="flex-1">
        <div className="max-w-[480px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5">
          <p className="text-center font-medium text-[13px] sm:text-[14px] mb-5" style={{ color: "#4A402D" }}>
            Enter your birth data — checkout and your private report come next.
          </p>
          <div className="relative">
            {/* Subtle gold accent line above card */}
            <div
              aria-hidden="true"
              className="absolute -top-px left-6 right-6 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.5) 50%, transparent 100%)",
              }}
            />
            <div className="intake-card">
              <IntakeForm
                includesCore={selected.has("CORE")}
                chapters={Array.from(selected).filter((c): c is ModuleCode => c !== "CORE")}
                onCheckoutOpen={() => setCheckoutOpen(true)}
                resetSignal={resetSignal}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — paper section */}
      <section className="flex-1" id="about">
        <div className="max-w-[480px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-6 sm:pb-8">
          <FaqBlock />
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[480px] mx-auto px-4 sm:px-6">
        <div className="border-t border-[#E5E7EB]/40" />
      </div>

      <SiteFooter />
    </div>
  );
}
