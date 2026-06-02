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
        <div className="mt-6 space-y-4 text-[14px] text-charcoal leading-relaxed">
          <p>
            We collect only what is needed to generate your astrology report: your first name,
            email, birth data, and (optionally) full name for numerology.
          </p>
          <p>
            Your birth city is used only to compute your chart's coordinates and timezone. We never
            sell your data and never share it with advertisers.
          </p>
          <p>
            Your generated PDF is stored privately and accessible via your unique download link. You
            may request deletion at any time via the contact page.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
