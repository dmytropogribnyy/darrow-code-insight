import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/sample")({
  head: () => ({
    meta: [
      { title: "Sample Report — Darrow Code" },
      {
        name: "description",
        content: "A preview of what a Darrow Code Astro Report looks like.",
      },
    ],
  }),
  component: SamplePage,
});

function SamplePage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-[10px] tracking-meta uppercase text-gold">Preview</p>
        <h1 className="font-serif text-warm-brown mt-3" style={{ fontSize: 36 }}>
          A glimpse of your report
        </h1>
        <p className="mt-4 text-[14px] text-neutral-grey leading-relaxed">
          A multi-page PDF with your love pattern, money code, body rhythm,
          timing cycle and direction signal — drawn from your birth chart and decoded
          through the Darrow Code Method.
        </p>
        <div className="mt-10 border border-border rounded-md p-10 bg-white/40">
          <p className="font-display text-gold text-[18px] tracking-[0.2em]">
            DARROW CODE
          </p>
          <p className="mt-2 font-serif italic text-warm-brown">
            Sample cover preview
          </p>
          <p className="mt-6 text-[12px] text-muted-grey">
            Full sample PDF coming soon.
          </p>
        </div>
        <div className="mt-10">
          <Link
            to="/"
            className="inline-block border border-gold text-gold px-5 py-2.5 rounded-[6px] text-[13px] hover:bg-gold hover:text-navy transition"
          >
            ← Back to start
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
