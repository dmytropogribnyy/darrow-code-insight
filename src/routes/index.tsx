import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { IntakeForm } from "@/components/IntakeForm";
import { ProductSelector } from "@/components/ProductSelector";
import { FaqBlock } from "@/components/FaqBlock";
import { ContinuumTeaser } from "@/components/ContinuumTeaser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ContinuumType } from "@/lib/continuum/continuum-config";
import {
  PlanetGlyphRibbon,
  HeroStars,
  MoonPhaseChip,
  ZodiacWheel,
} from "@/components/HeroAstroAccents";
import { MODULE_CODES, type ModuleCode } from "@/lib/modules";

type Selectable = "CORE" | ModuleCode;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Astrology Report & Birth Code PDF | Darrow Code" },
      {
        name: "description",
        content:
          "More than a horoscope. Private AI-powered astrology reports from your birth data — CORE, Love, Money, Body, Year, Style and Place PDF insights.",
      },
      { property: "og:title", content: "Darrow Code — AI Astrology Report & Birth Code PDF" },
      {
        property: "og:description",
        content:
          "More than a horoscope. Private AI-powered astrology reports from your birth data — CORE, Love, Money, Body, Year, Style and Place PDF insights.",
      },
      { name: "twitter:title", content: "Darrow Code — AI Astrology Report & Birth Code PDF" },
      {
        name: "twitter:description",
        content:
          "More than a horoscope. Private AI-powered astrology reports from your birth data — CORE, Love, Money, Body, Year, Style and Place PDF insights.",
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
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [continuumOpen, setContinuumOpen] = useState<ContinuumType | null>(null);
  const [continuumResetSignal, setContinuumResetSignal] = useState(0);
  const selectorRef = useRef<HTMLDivElement>(null);

  const hasAnySelection = selected.size > 0;
  const chaptersList = Array.from(selected).filter((c): c is ModuleCode => c !== "CORE");
  const handleContinueToIntake = () => {
    setResetSignal((n) => n + 1);
    setCheckoutOpen(false);
    setIntakeOpen(true);
  };

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
        className="text-light-grey relative overflow-hidden hero-veil hero-grain"
        style={{
          background: `
            radial-gradient(circle at 50% 18%, rgba(212,175,55,0.06), transparent 28%),
            radial-gradient(circle at 80% 20%, rgba(229,231,235,0.035), transparent 30%),
            linear-gradient(180deg, #0A0F1E 0%, rgba(0,0,0,0.25) 100%)
          `,
          backgroundColor: "#0A0F1E",
        }}
      >
        <HeroStars />
        {/* Faint zodiac wheel watermark behind the headline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{ top: "clamp(180px, 28%, 320px)" }}
        >
          <ZodiacWheel size={520} className="hidden sm:block" />
          <ZodiacWheel size={340} className="block sm:hidden" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 pt-12 sm:pt-16 pb-10 sm:pb-12 text-center">
          {/* Top badge */}
          <div className="inline-flex items-center border border-gold/60 rounded-full px-4 py-2">
            <span
              className="font-sans font-semibold text-gold uppercase"
              style={{ fontSize: "clamp(11.5px, 1.2vw, 12px)", letterSpacing: "0.12em" }}
            >
              PREMIUM AI-POWERED ASTROLOGY REPORT · DARROW CODE METHOD · PDF
            </span>
          </div>

          {/* Decorative planetary glyph ribbon + tonight's moon phase */}
          <PlanetGlyphRibbon />
          <MoonPhaseChip />

          {/* Darrow symbol — cinematic spin on load + replay on click */}
          <img
            src="/brand/darrow-symbol-small.png"
            alt="Darrow Code"
            onClick={(e) => {
              const el = e.currentTarget;
              el.classList.remove("darrow-symbol-spin");
              void el.offsetWidth; // force reflow to restart animation
              el.classList.add("darrow-symbol-spin");
            }}
            className="mx-auto mt-5 sm:mt-7 mb-[18px] sm:mb-6 opacity-95 darrow-symbol-spin cursor-pointer"
            style={{
              width: "clamp(44px, 8vw, 56px)",
              height: "auto",
              imageRendering: "-webkit-optimize-contrast",
              transformOrigin: "center center",
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
            className="font-serif italic mt-6 leading-[1.4] tracking-[0.005em]"
            style={{
              fontSize: "clamp(20px, 2.8vw, 26px)",
              color: "#E6C35A",
            }}
          >
            More than a horoscope.
            <br />
            Your private birth code.
          </p>

          {/* Brand continuity */}
          <p className="mt-4 text-[16px] sm:text-[17px] md:text-[18px] text-light-grey leading-[1.65] font-sans font-medium">
            AI astrology report · Built from your birth data · Decoded through the Darrow Code
            Method
          </p>

          {/* Explainer */}
          <p className="mt-6 sm:mt-7 text-[17px] sm:text-[18px] md:text-[19px] text-muted-grey max-w-[640px] mx-auto leading-[1.65] font-sans">
            A premium AI-powered personal astrology horoscope report built from your birth data — a
            private PDF reading of your birth chart, personality patterns, timing, love, money,
            body, style and place.
          </p>

          {/* Quote box */}
          <figure className="mt-8 sm:mt-9 max-w-[560px] mx-auto text-left bg-white/[0.06] border-l-[3px] border-gold pl-7 pr-6 py-6 sm:py-7 rounded-r-[10px]">
            <blockquote
              className="font-serif text-paper leading-[1.6]"
              style={{ fontSize: "clamp(19px, 2.1vw, 22px)" }}
            >
              <span className="text-gold/70 mr-1 align-[-0.1em] text-[1.4em] leading-none font-serif">
                “
              </span>
              One astrology tradition shows part of the picture.
              <br />
              <span className="font-semibold text-gold">Darrow Code reads the full pattern.</span>
              <span className="text-gold/70 ml-1 align-[-0.1em] text-[1.4em] leading-none font-serif">
                ”
              </span>
            </blockquote>
          </figure>

          {/* Method line */}
          <p
            className="mt-8 sm:mt-9 font-sans font-medium text-[12px] sm:text-[13px] text-[#9CA3AF] uppercase"
            style={{ letterSpacing: "0.14em" }}
          >
            Western Astrology · Chinese Bazi · Numerology · Pattern Psychology · AI Synthesis
          </p>

          {/* Focused chapters teaser */}
          <div className="mt-6 sm:mt-8 max-w-[560px] mx-auto">
            <p className="text-center font-sans text-[16px] sm:text-[17px] md:text-[18px] text-light-grey leading-[1.65]">
              Start with{" "}
              <button
                type="button"
                onClick={() => jumpToChapter("CORE")}
                className="font-semibold text-[#D4AF37] border-b border-transparent hover:border-[#D4AF37]/70 hover:text-[#E6C35A] transition-colors duration-150 pb-px cursor-pointer"
                aria-label="Jump to CORE Report"
              >
                CORE
              </button>
              . Add the chapters you want.
              <br />
              Or unlock{" "}
              <button
                type="button"
                onClick={() => jumpToChapter("COMPLETE")}
                className="font-semibold text-[#D4AF37] border-b border-transparent hover:border-[#D4AF37]/70 hover:text-[#E6C35A] transition-colors duration-150 pb-px cursor-pointer"
                aria-label="Jump to CORE Complete bundle"
              >
                CORE Complete
              </button>
              .
              <br />
              Need timing? Add a{" "}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("continuum");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="font-semibold text-[#D4AF37] border-b border-transparent hover:border-[#D4AF37]/70 hover:text-[#E6C35A] transition-colors duration-150 pb-px cursor-pointer"
                aria-label="Jump to Continuum personal timing report"
              >
                Continuum
              </button>{" "}
              7-day or 30-day AI forecast.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
              {["LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"].map((m, i) => (
                <span key={m} className="flex items-center gap-x-3">
                  <button
                    type="button"
                    onClick={() => jumpToChapter(m)}
                    aria-label={`Jump to ${m} chapter`}
                    className="font-sans font-semibold text-[15px] sm:text-[16px] text-[#D4AF37] cursor-pointer border-b border-transparent hover:border-[#D4AF37]/70 hover:text-[#E6C35A] transition-colors duration-150 pb-px"
                  >
                    {m}
                  </button>
                  {i < 5 && <span className="text-[#6B6B6B] text-[13px]">·</span>}
                </span>
              ))}
            </div>
            {/* Price line — all tiers visible, wraps cleanly on mobile */}
            <ul
              className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center font-sans text-light-grey leading-relaxed list-none p-0"
              style={{ fontSize: "clamp(14px, 1.25vw, 15.5px)" }}
            >
              <li className="whitespace-nowrap">
                <span className="text-gold font-semibold">CORE</span> <span>$4.99</span>
              </li>
              <li aria-hidden="true" className="text-[#6B6B6B]">
                ·
              </li>
              <li className="whitespace-nowrap">Chapters $2.99 each</li>
              <li aria-hidden="true" className="text-[#6B6B6B]">
                ·
              </li>
              <li className="whitespace-nowrap">
                <span className="text-gold font-semibold">CORE Complete</span>{" "}
                <span className="text-gold font-semibold">$14.99</span>
              </li>
            </ul>

            {/* Primary hero CTA — scrolls to product selector / intake */}
            <div className="mt-7 sm:mt-8 flex flex-col items-center">
              <button
                type="button"
                onClick={() =>
                  selectorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="inline-flex items-center justify-center font-sans font-semibold rounded-full px-7 py-3.5 sm:px-8 sm:py-4 bg-gold text-navy hover:bg-[#E6C35A] transition-colors duration-200 shadow-[0_8px_24px_-10px_rgba(212,175,55,0.55)]"
                style={{ fontSize: "clamp(15px, 1.4vw, 16.5px)", letterSpacing: "0.02em" }}
                aria-label="Scroll to choose your report and enter birth data"
              >
                Unlock My Birth Code <span className="ml-2">→</span>
              </button>
              <p
                className="mt-3 font-sans text-[12.5px] sm:text-[13px] text-[#9CA3AF]"
                style={{ letterSpacing: "0.04em" }}
              >
                Private AI Astrology PDF · Ready In A Few Minutes · No Subscription
              </p>
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
        <div
          ref={selectorRef}
          id="product-selector"
          className="max-w-[560px] sm:max-w-[640px] md:max-w-[720px] mx-auto px-4 sm:px-6 pt-10 sm:pt-12"
        >
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

        {/* CONTINUUM teaser — separate timing product, below chapters */}
        <div
          id="continuum"
          className="max-w-[560px] sm:max-w-[640px] md:max-w-[720px] mx-auto px-4 sm:px-6 mt-8 sm:mt-10 scroll-mt-20"
        >
          <ContinuumTeaser
            onSelect7d={() => {
              setContinuumResetSignal((n) => n + 1);
              setContinuumOpen("7d");
            }}
            onSelect30d={() => {
              setContinuumResetSignal((n) => n + 1);
              setContinuumOpen("30d");
            }}
          />
        </div>
      </section>

      {/* CONTINUUM intake modal */}
      <Dialog
        open={continuumOpen !== null}
        onOpenChange={(o) => {
          if (!o) setContinuumOpen(null);
        }}
      >
        <DialogContent className="max-w-[520px] max-h-[90vh] overflow-y-auto bg-paper">
          <DialogHeader>
            <DialogTitle className="font-serif text-[22px]" style={{ color: "#1F1A10" }}>
              CONTINUUM · {continuumOpen === "7d" ? "Next 7 Days" : "Next 30 Days"}
            </DialogTitle>
            <DialogDescription style={{ color: "#4A402D" }}>
              Enter your birth data — your personal timing brief PDF is generated right after
              checkout.
            </DialogDescription>
          </DialogHeader>
          {continuumOpen && (
            <IntakeForm
              continuumType={continuumOpen}
              resetSignal={continuumResetSignal}
              onCheckoutOpen={() => {}}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* INTAKE — paper section */}
      <section className="flex-1">
        <div className="max-w-[480px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5">
          <p
            className="text-center font-medium text-[14px] sm:text-[15px] mb-5 leading-[1.55]"
            style={{ color: "#4A402D" }}
          >
            Enter your birth data — checkout comes next, then your private astrology PDF.
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
        <div className="max-w-[480px] sm:max-w-[560px] md:max-w-[640px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-6 sm:pb-8">
          <FaqBlock />
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[480px] sm:max-w-[560px] md:max-w-[640px] mx-auto px-4 sm:px-6">
        <div className="border-t border-[#E5E7EB]/40" />
      </div>

      <SiteFooter />
    </div>
  );
}
