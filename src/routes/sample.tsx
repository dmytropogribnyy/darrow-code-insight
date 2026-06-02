import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/sample")({
  head: () => ({
    meta: [
      { title: "Sample Report — Darrow Code" },
      {
        name: "description",
        content: "A preview of the Darrow Code Astro Report — cover, interior pages, and closing.",
      },
      { property: "og:title", content: "Sample Report — Darrow Code" },
      {
        property: "og:description",
        content: "See what a Darrow Code Astro Report looks like before you order.",
      },
      { property: "og:url", content: "/sample" },
    ],
    links: [{ rel: "canonical", href: "/sample" }],
  }),
  component: SamplePage,
});

const PREVIEWS = [
  { src: "/brand/sample-cover.jpg", caption: "Cover" },
  { src: "/brand/sample-interior.jpg", caption: "Interior page" },
  { src: "/brand/sample-closing.jpg", caption: "Closing" },
] as const;

function PreviewImage({ src, caption }: { src: string; caption: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const show = loaded && !failed;
  return (
    <figure className="border border-border rounded-md overflow-hidden bg-white/60 shadow-sm">
      <div className="relative aspect-[3/4] bg-paper">
        {!show && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[11px] tracking-meta uppercase text-muted-grey">
              {caption} — preview pending
            </p>
          </div>
        )}
        {/* Probe image — kept mounted so onLoad/onError fire; hidden until proven good */}
        <img
          src={src}
          alt={`Darrow Code report ${caption.toLowerCase()} preview`}
          loading="lazy"
          onLoad={(e) => {
            const img = e.currentTarget;
            // Reject SPA HTML fallbacks that "decode" with zero dimensions
            if (img.naturalWidth > 0 && img.naturalHeight > 0) setLoaded(true);
            else setFailed(true);
          }}
          onError={() => setFailed(true)}
          className={
            "absolute inset-0 w-full h-full object-cover transition-opacity " +
            (show ? "opacity-100" : "opacity-0 pointer-events-none")
          }
        />
      </div>
      <figcaption className="text-[11px] tracking-meta uppercase text-muted-grey text-center py-2.5 border-t border-border bg-paper">
        {caption}
      </figcaption>
    </figure>
  );
}

function SamplePage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16">
        <div className="text-center">
          <p className="text-[10px] tracking-meta uppercase text-gold">Preview</p>
          <h1 className="font-serif text-warm-brown mt-3" style={{ fontSize: 36 }}>
            What you actually receive
          </h1>
          <p className="mt-4 text-[14px] text-neutral-grey leading-relaxed max-w-xl mx-auto">
            A premium downloadable PDF, generated privately from your birth data and delivered to
            your email — yours to keep, with no subscription.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {PREVIEWS.map((p) => (
            <PreviewImage key={p.src} src={p.src} caption={p.caption} />
          ))}
        </div>

        {/* What's inside */}
        <section className="mt-14">
          <p className="text-center text-[10px] tracking-meta uppercase text-gold mb-3">
            What's inside
          </p>
          <h2 className="text-center font-serif text-warm-brown text-2xl mb-6">
            Every report includes
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-[13.5px] text-neutral-grey">
            {[
              ["Premium downloadable PDF", "Print-ready, lifetime access."],
              ["CORE Report or focused chapters", "Buy CORE, a single chapter, or CORE Complete."],
              ["Client Snapshot", "Your personal pattern name and one-line read."],
              ["Architecture section", "How you actually think, react and decide."],
              ["Practical protocols", "Specific moves for love, money, body or timing."],
              ["Warning Signal / Before–After", "Where you slip, and what changes when you don't."],
              ["Proof tags", "Real astrology, BaZi and numerology anchors behind each insight."],
              ["Email delivery + secure download link", "Token-protected — no account needed."],
            ].map(([title, desc]) => (
              <li key={title} className="border border-border rounded-md p-4 bg-white/60">
                <p className="font-semibold text-warm-brown text-[13px] mb-1">{title}</p>
                <p className="text-[12.5px] leading-relaxed">{desc}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-14 text-center">
          <Link
            to="/"
            className="inline-block border border-gold text-gold px-6 py-3 rounded-[6px] text-[13px] hover:bg-gold hover:text-navy transition"
          >
            Get your CORE Report →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
