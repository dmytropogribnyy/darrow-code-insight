import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: "Privacy — Darrow Code" }],
  }),
  component: PrivacyPage,
});

const DARK_BG = `
  radial-gradient(circle at 50% 18%, rgba(212,175,55,0.06), transparent 28%),
  radial-gradient(circle at 80% 20%, rgba(229,231,235,0.035), transparent 30%),
  linear-gradient(180deg, #0A0F1E 0%, rgba(0,0,0,0.25) 100%)
`;

function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader onDark />

      <section
        className="flex-1 text-light-grey"
        style={{ background: DARK_BG, backgroundColor: "#0A0F1E" }}
      >
        <div className="max-w-2xl mx-auto px-6 pt-16 sm:pt-20 pb-20 sm:pb-24">
          <span
            className="inline-flex items-center border border-gold/60 rounded-full px-4 py-2 font-sans font-semibold text-gold uppercase"
            style={{ fontSize: "clamp(11.5px, 1.2vw, 12px)", letterSpacing: "0.12em" }}
          >
            PRIVACY · DARROW CODE
          </span>

          <h1
            className="font-serif text-paper mt-6 leading-[1.05]"
            style={{ fontSize: "clamp(34px, 5vw, 48px)", color: "var(--paper)" }}
          >
            Privacy
          </h1>
          <p className="mt-2 text-[12px] text-muted-grey">Last updated: June 2026</p>

          <div className="mt-7 space-y-4 text-[14px] sm:text-[15px] leading-[1.7] text-light-grey">
            <p>
              Darrow Code collects only the information needed to generate and deliver your
              personalized astrology report: your first name, email address, birth date, birth time,
              birth city, selected report options, and optionally your full name for
              numerology-based insights.
            </p>
            <p>
              Your birth city is used to calculate chart coordinates and timezone. Your birth data
              is used only to generate your report and related order records.
            </p>
            <p>
              Payments are processed securely by Stripe. Darrow Code does not store your full card
              details.
            </p>
            <p>
              Your generated PDF is stored privately and accessed through a unique download link. We
              use your email address to deliver your report, send order-related messages, and
              respond to support requests.
            </p>
            <p>
              We may store a Darrow Code report reference, client name, order/payment identifiers,
              generation status, delivery status, and support history so we can track, regenerate,
              re-deliver, or support your purchased report if needed.
            </p>
            <p>We do not sell your personal data and do not share it with advertisers.</p>
            <p>
              You may request deletion of your personal data or generated report by contacting us
              through the contact page. Some order or payment records may need to be retained where
              required for tax, accounting, fraud prevention, or legal compliance.
            </p>
            <p>
              Darrow Code reports are for self-reflection and personal insight. They are not
              medical, legal, financial, psychological, or professional advice.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
