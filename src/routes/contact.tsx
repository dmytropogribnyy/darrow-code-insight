import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [{ title: "Contact — Darrow Code" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader onDark />

      <section
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
        <div className="max-w-2xl mx-auto px-6 pt-16 sm:pt-24 pb-20 sm:pb-28 text-center">
          <div className="inline-flex items-center border border-gold/60 rounded-full px-4 py-2">
            <span
              className="font-sans font-semibold text-gold uppercase"
              style={{ fontSize: "clamp(11.5px, 1.2vw, 12px)", letterSpacing: "0.12em" }}
            >
              CONTACT · DARROW CODE
            </span>
          </div>

          <img
            src="/brand/darrow-symbol-small.png"
            alt="Darrow Code"
            className="mx-auto mt-6 sm:mt-8 mb-5 opacity-95"
            style={{
              width: "clamp(40px, 7vw, 52px)",
              height: "auto",
              imageRendering: "-webkit-optimize-contrast",
            }}
          />

          <h1
            className="font-serif text-paper leading-[1.05]"
            style={{ fontSize: "clamp(38px, 6vw, 56px)", color: "var(--paper)" }}
          >
            Get in touch.
          </h1>

          <p
            className="font-serif italic mt-5 text-gold leading-[1.3]"
            style={{ fontSize: "clamp(17px, 2.4vw, 20px)" }}
          >
            We read every message personally.
          </p>

          <p className="mt-7 text-[15px] sm:text-[16px] text-muted-grey leading-[1.65] font-sans max-w-[520px] mx-auto">
            For questions, support, or data deletion requests — reach out and
            we'll respond as soon as we can.
          </p>

          <div className="mt-9 sm:mt-10 max-w-[460px] mx-auto bg-white/[0.04] border border-gold/30 rounded-[10px] px-6 py-7">
            <p
              className="font-sans uppercase text-gold/80 text-[11px]"
              style={{ letterSpacing: "0.16em" }}
            >
              Email us at
            </p>
            <a
              className="block mt-3 font-serif text-paper hover:text-gold transition-colors duration-200 break-all"
              style={{ fontSize: "clamp(18px, 3vw, 22px)" }}
              href="mailto:thedarrowcode@gmail.com"
            >
              thedarrowcode@gmail.com
            </a>
          </div>

          <p
            className="mt-8 font-sans font-medium text-[11.5px] sm:text-[12px] text-[#9CA3AF] uppercase"
            style={{ letterSpacing: "0.12em" }}
          >
            Typical response · Within 24–48 hours
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
