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
        <div className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 border border-gold/60 rounded-full px-3.5 py-1.5">
            <span className="w-1 h-1 rounded-full bg-gold" />
            <span
              className="text-gold uppercase"
              style={{ fontSize: 10, letterSpacing: "0.2em" }}
            >
              AI-Powered Personal Astrology Report · Darrow Code Method · PDF
            </span>
          </div>

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
            className="font-serif italic mt-5 text-gold"
            style={{ fontSize: 17 }}
          >
            More than a horoscope. Less than a consultation.
          </p>

          {/* Brand continuity */}
          <p className="mt-3 text-[12px] text-muted-grey">
            AI-powered · Built from your birth data · Decoded through the Darrow Code Method
          </p>

          {/* Explainer */}
          <p className="mt-8 text-[15px] text-muted-grey max-w-[480px] mx-auto leading-relaxed">
            Get a private AI-powered astrology report built from your birth chart — revealing your{" "}
            <span className="text-paper">love pattern</span>,{" "}
            <span className="text-paper">money code</span>,{" "}
            <span className="text-paper">body rhythm</span>,{" "}
            <span className="text-paper">timing cycle</span> and{" "}
            <span className="text-paper">direction signal</span>.
          </p>

          {/* Quote box */}
          <div className="mt-10 max-w-[460px] mx-auto text-left bg-white/[0.03] border-l-2 border-gold pl-5 py-4 rounded-r-sm">
            <p className="font-serif italic text-light-grey text-[16px] leading-snug">
              "One astrology tradition shows part of the picture.
              <br />
              <span className="not-italic text-gold">Darrow Code reads the full pattern.</span>"
            </p>
          </div>

          {/* Method line */}
          <p
            className="mt-10 text-muted-grey uppercase"
            style={{ fontSize: 10, letterSpacing: "0.15em" }}
          >
            Western Astrology · Chinese Bazi · Numerology · Pattern Psychology · AI Synthesis
          </p>
        </div>
      </section>

      {/* INTAKE — paper section */}
      <section className="flex-1">
        <div className="max-w-xl mx-auto px-6 py-14">
          <p className="text-center text-[13px] text-muted-grey mb-6">
            Start instantly. Your private report is generated after checkout.
          </p>
          <IntakeForm />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
