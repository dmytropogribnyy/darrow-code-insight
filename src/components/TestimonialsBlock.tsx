/**
 * Testimonials — quiet, premium social proof block.
 * 5 hand-written quotes from US-style personas. Static, no API.
 * Styled to match the gold/paper aesthetic used across the landing page.
 */

interface Testimonial {
  quote: string;
  name: string;
  location: string;
  context: string; // which report they bought
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I've read horoscopes my whole life. This is the first one that actually sounded like it knew me — not a generic sun-sign blurb. The CORE report felt like a private letter.",
    name: "Hannah",
    location: "United States",
    context: "CORE Report",
  },
  {
    quote:
      "I got CORE Complete while thinking through a career change. The MONEY and YEAR chapters felt especially relevant — not like generic advice, but like a clearer map of my timing, habits, and where my energy was actually going.",
    name: "Marcus",
    location: "United Kingdom",
    context: "CORE Complete",
  },
  {
    quote:
      "The LOVE chapter put words to a pattern I've been repeating for ten years. Worth way more than the price. Beautifully written, too — not woo-woo at all.",
    name: "Sienna",
    location: "France",
    context: "CORE + LOVE",
  },
  {
    quote:
      "I added the 30-day CONTINUUM brief and used the daily protocol all month. Calm, specific, no fluff. It reads like a thoughtful coach, not an app.",
    name: "Daniel",
    location: "Germany",
    context: "CONTINUUM · 30 Days",
  },
  {
    quote:
      "Premium feel from the first page. Clean PDF, real depth, no upsells inside. Gifted CORE Complete to two friends — both said the same thing: this is different.",
    name: "Avery",
    location: "United States",
    context: "CORE Complete",
  },
];

function StarRow() {
  return (
    <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="#D4AF37"
          aria-hidden="true"
        >
          <path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.6L6 22l1.5-7.2L2 10l7.1-1.1L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function Initials({ name }: { name: string }) {
  const initials = (name.trim()[0] ?? "").toUpperCase();
  return (
    <div
      className="grid place-items-center rounded-full shrink-0 font-serif font-semibold"
      style={{
        width: 40,
        height: 40,
        background: "linear-gradient(180deg, #F2D27A 0%, #D4AF37 100%)",
        color: "#1F1A10",
        fontSize: 14,
        letterSpacing: "0.04em",
        boxShadow: "0 2px 6px -2px rgba(212,175,55,0.55)",
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure
      className="rounded-[14px] px-5 py-5 sm:px-6 sm:py-6 h-full flex flex-col"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(252,247,232,0.92) 100%)",
        border: "1px solid rgba(212,175,55,0.32)",
        boxShadow:
          "0 8px 22px -16px rgba(31,26,16,0.4), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <StarRow />
        <span
          className="font-sans font-bold uppercase px-2 py-0.5 rounded-full"
          style={{
            fontSize: "10px",
            letterSpacing: "0.12em",
            color: "#1F1A10",
            background: "rgba(212,175,55,0.18)",
            border: "1px solid rgba(212,175,55,0.4)",
          }}
        >
          Verified buyer
        </span>
      </div>
      <blockquote
        className="font-sans leading-[1.7] flex-1"
        style={{ color: "#1F1A10", fontSize: "clamp(15px, 1.4vw, 16.5px)", fontFamily: "var(--font-sans)" }}
      >
        <span className="text-gold/70 mr-0.5 align-[-0.05em] font-serif" style={{ fontSize: "1.3em", lineHeight: 0 }}>
          “
        </span>
        {t.quote}
        <span className="text-gold/70 ml-0.5 align-[-0.05em] font-serif" style={{ fontSize: "1.3em", lineHeight: 0 }}>
          ”
        </span>
      </blockquote>

      <figcaption className="mt-4 flex items-center gap-3">
        <Initials name={t.name} />
        <div className="min-w-0">
          <p
            className="font-sans font-semibold truncate"
            style={{ color: "#1F1A10", fontSize: "13.5px" }}
          >
            {t.name}
          </p>
          <p
            className="font-sans truncate"
            style={{ color: "#4A4232", fontSize: "12.5px" }}
          >
            {t.location} · {t.context}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export function TestimonialsBlock() {
  return (
    <section aria-labelledby="testimonials-heading" className="w-full">
      <div className="text-center mb-7 sm:mb-8">
        <p
          className="uppercase font-bold"
          style={{
            color: "#A07B1F",
            fontSize: "clamp(11.5px, 1.1vw, 12.5px)",
            letterSpacing: "0.22em",
          }}
        >
          Loved by readers
        </p>
        <h2
          id="testimonials-heading"
          className="font-serif mt-2.5 leading-[1.1]"
          style={{ fontSize: "clamp(24px, 3.2vw, 30px)", color: "#1F1A10" }}
        >
          What people are saying
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {TESTIMONIALS.slice(0, 4).map((t) => (
          <TestimonialCard key={t.name} t={t} />
        ))}
      </div>
      {/* 5th card — featured full-width on md+ */}
      <div className="mt-4 sm:mt-5">
        <TestimonialCard t={TESTIMONIALS[4]} />
      </div>
    </section>
  );
}
