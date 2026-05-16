import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { IntakeForm } from "@/components/IntakeForm";

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
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader onDark />

      {/* HERO — dark navy section */}
      <section className="bg-navy text-light-grey">
        <div className="max-w-3xl mx-auto px-6 pt-12 sm:pt-16 pb-10 sm:pb-12 text-center">
          {/* Top badge */}
          <div className="inline-flex items-center border border-gold/60 rounded-full px-4 py-2">
            <span
              className="font-sans font-semibold text-gold uppercase"
              style={{ fontSize: "clamp(11.5px, 1.2vw, 12px)", letterSpacing: "0.12em" }}
            >
              AI-POWERED PERSONAL ASTROLOGY REPORT · DARROW CODE METHOD · PDF
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
            style={{ fontSize: "clamp(34px,5.2vw,44px)", color: "var(--paper)" }}
          >
            Your zodiac sign
            <br />
            is only the surface.
          </h1>

          {/* Tagline */}
          <p
            className="font-serif italic mt-5 text-gold leading-[1.3]"
            style={{ fontSize: "clamp(16px, 2.2vw, 18px)" }}
          >
            More than a horoscope.
            <br />
            Your private birth code.
          </p>

          {/* Brand continuity */}
          <p className="mt-3 text-[13px] sm:text-[14px] md:text-[15px] text-light-grey leading-[1.6] font-sans">
            AI-powered · Built from your birth data · Decoded through the Darrow Code Method
          </p>

          {/* Explainer */}
          <p className="mt-8 text-[14px] sm:text-[15px] md:text-[16px] text-muted-grey max-w-[620px] mx-auto leading-[1.65]">
            Get a private AI-powered astrology report built from your birth chart — revealing your{" "}
            <span className="text-paper">love pattern</span>,{" "}
            <span className="text-paper">money code</span>,{" "}
            <span className="text-paper">body rhythm</span>,{" "}
            <span className="text-paper">timing cycle</span> and{" "}
            <span className="text-paper">direction signal</span>.
          </p>

          {/* Editorial whisper */}
          <p
            className="mt-7 sm:mt-8 max-w-[520px] mx-auto text-center font-serif italic leading-[1.5]"
            style={{ fontSize: "clamp(14px, 1.8vw, 16px)", color: "#9CA3AF" }}
          >
            When the pattern becomes visible, life gets easier to read.
          </p>

          {/* Quote box */}
          <div className="mt-7 sm:mt-8 max-w-[460px] mx-auto text-left bg-white/[0.03] border-l-2 border-gold pl-5 py-4 rounded-r-sm">
            <p className="font-serif italic text-light-grey text-[16px] leading-snug">
              "One astrology tradition shows part of the picture.
              <br />
              <span className="not-italic text-gold">Darrow Code reads the full pattern.</span>"
            </p>
          </div>

          {/* Method line */}
          <p
            className="mt-8 sm:mt-10 font-sans text-[11px] sm:text-[13px] text-[#9CA3AF] uppercase"
            style={{ letterSpacing: "0.12em" }}
          >
            Western Astrology · Chinese Bazi · Numerology · Pattern Psychology · AI Synthesis
          </p>

          {/* Optional chapters teaser */}
          <div className="mt-4 sm:mt-5 max-w-[520px] mx-auto">
            <p className="text-center font-sans text-[13px] sm:text-[15px] text-[#9CA3AF] leading-relaxed">
              Optional focused chapters available after your CORE Report:
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-x-2.5 gap-y-1">
              {["LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"].map((m, i) => (
                <span key={m} className="flex items-center gap-x-2.5">
                  <span className="font-sans font-semibold text-[13px] sm:text-[14px] text-[#D4AF37]">
                    {m}
                  </span>
                  {i < 5 && (
                    <span className="text-[#6B6B6B] text-[12px]">·</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INTAKE — paper section */}
      <section className="flex-1">
        <div className="max-w-[480px] mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-4 sm:pb-5">
          <p className="text-center font-medium text-[13px] sm:text-[14px] mb-5" style={{ color: "#4A402D" }}>
            Start instantly. Your private report is generated after checkout.
          </p>
          <div className="intake-card">
            <IntakeForm />
          </div>
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
