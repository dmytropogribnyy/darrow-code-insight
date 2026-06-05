import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: "Privacy — Darrow Code" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-serif text-warm-brown" style={{ fontSize: 32 }}>
          Privacy
        </h1>
        <p className="mt-2 text-[12px] text-charcoal/60">Last updated: June 2026</p>
        <div className="mt-6 space-y-4 text-[14px] text-charcoal leading-relaxed">
          <p>
            Darrow Code collects only the information needed to generate and deliver your
            personalized astrology report: your first name, email address, birth date, birth time,
            birth city, selected report options, and optionally your full name for numerology-based
            insights.
          </p>
          <p>
            Your birth city is used to calculate chart coordinates and timezone. Your birth data is
            used only to generate your report and related order records.
          </p>
          <p>
            Payments are processed securely by Stripe. Darrow Code does not store your full card
            details.
          </p>
          <p>
            Your generated PDF is stored privately and accessed through a unique download link. We
            use your email address to deliver your report, send order-related messages, and respond
            to support requests.
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
            Darrow Code reports are for self-reflection and personal insight. They are not medical,
            legal, financial, psychological, or professional advice.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
