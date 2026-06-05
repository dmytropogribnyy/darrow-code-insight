import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [{ title: "Terms — Darrow Code" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-serif text-warm-brown" style={{ fontSize: 32 }}>
          Terms
        </h1>
        <p className="mt-2 text-[12px] text-charcoal/60">Last updated: June 2026</p>
        <div className="mt-6 space-y-4 text-[14px] text-charcoal leading-relaxed">
          <p>
            Darrow Code reports are personalized digital products generated from the birth data and
            report options submitted at checkout.
          </p>
          <p>
            By purchasing a report, you confirm that the birth data and email address you submit are
            accurate. Darrow Code is not responsible for incorrect report content caused by
            incorrect or incomplete customer-submitted information.
          </p>
          <p>
            Reports are provided for self-reflection and personal insight. They are not medical,
            legal, financial, psychological, or professional advice, and they do not guarantee any
            specific outcome, prediction, relationship result, financial result, health result, or
            life event.
          </p>
          <p>
            Payments are processed securely by Stripe. Darrow Code does not store your full card
            details.
          </p>

          <h2 className="font-serif text-warm-brown pt-4" style={{ fontSize: 20 }}>
            Report Delivery
          </h2>
          <p>
            After payment, Darrow Code generates your selected personalized report or reports and
            delivers them through a secure download link and/or order-related email.
          </p>
          <p>
            Each report may receive a Darrow Code report reference, such as{" "}
            <span className="font-mono">DC-YYYYMMDD-0001</span>, which can be used for support and
            order tracking.
          </p>
          <p>
            If you contact us about an order, please include your order email, payment reference, or
            Darrow Code report reference.
          </p>

          <h2 className="font-serif text-warm-brown pt-4" style={{ fontSize: 20 }}>
            Refund Policy
          </h2>
          <p>
            Because Darrow Code reports are personalized digital products and generation may begin
            shortly after payment, purchases are generally non-refundable once generation has
            started or the report has been delivered.
          </p>
          <p>
            If a technical issue on our side prevents report generation or delivery, we will first
            attempt to re-generate or re-deliver the purchased report at no additional charge. If we
            are unable to deliver the purchased report, we may issue a refund for the affected item.
          </p>
          <p>Refunds are not provided for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>incorrect birth data submitted by the customer;</li>
            <li>a change of mind after generation has started;</li>
            <li>dissatisfaction with an interpretive or self-reflection result;</li>
            <li>
              expecting medical, legal, financial, psychological, or guaranteed predictive advice.
            </li>
          </ul>
          <p>
            If you believe something went wrong with your order, contact us with your order email,
            payment reference, or Darrow Code report reference.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
