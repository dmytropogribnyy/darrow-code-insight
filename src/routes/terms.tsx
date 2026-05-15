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
        <h1 className="font-serif text-warm-brown" style={{ fontSize: 32 }}>Terms</h1>
        <div className="mt-6 space-y-4 text-[14px] text-charcoal leading-relaxed">
          <p>
            Darrow Code Astro Reports are sold as one-time digital products,
            delivered as PDF after successful payment.
          </p>
          <p>
            Reports are provided for self-reflection and personal insight. They are
            not medical, legal, or financial advice.
          </p>
          <p>
            Because reports are personalized digital goods generated immediately after
            payment, all sales are final unless the report fails to generate.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
