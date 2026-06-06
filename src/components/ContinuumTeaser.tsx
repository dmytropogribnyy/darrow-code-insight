/**
 * CONTINUUM teaser block — separate product line shown on the landing page
 * below the CORE / chapters selector.
 *
 * Two timing variants (Next 7 Days / Next 30 Days) of one product (CONTINUUM).
 * Standalone — NOT part of CORE, CORE Complete, or any bundle.
 *
 * Visually styled to match the gold/paper aesthetic of ProductSelector but
 * with a distinct "TIMING" framing so cold visitors understand it's a
 * different category (forecast/timing) from CORE (identity/foundation).
 *
 * `comingSoon` (default: true) renders disabled CTAs with a "Coming soon"
 * badge until the Continuum checkout backend ships. Flip to false once
 * `createContinuumCheckout` and the webhook branch are merged + flags up.
 */

interface ContinuumTeaserProps {
  comingSoon?: boolean;
  onSelect7d?: () => void;
  onSelect30d?: () => void;
}

interface CardProps {
  period: string;
  priceLabel: string;
  blurb: string;
  bullets: string[];
  ctaLabel: string;
  disabled: boolean;
  onClick?: () => void;
}

function ContinuumCard({
  period,
  priceLabel,
  blurb,
  bullets,
  ctaLabel,
  disabled,
  onClick,
}: CardProps) {
  return (
    <div
      className="rounded-[12px] border-2 px-5 py-5 sm:px-6 sm:py-6 flex flex-col"
      style={{
        borderColor: "rgba(212,175,55,0.55)",
        background: "rgba(255,255,255,0.72)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.5) inset, 0 6px 18px -12px rgba(31,26,16,0.35)",
      }}
    >
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <p
          className="uppercase font-bold"
          style={{
            color: "#8B6914",
            fontSize: "clamp(13px, 1.25vw, 14.5px)",
            letterSpacing: "0.18em",
          }}
        >
          {period}
        </p>
        <span
          className="font-mono whitespace-nowrap font-bold"
          style={{ color: "#1F1A10", fontSize: "clamp(15px, 1.4vw, 17px)" }}
        >
          {priceLabel}
        </span>
      </div>
      <p
        className="leading-relaxed mt-2"
        style={{ color: "#2A2418", fontSize: "clamp(13.5px, 1.3vw, 14.5px)" }}
      >
        {blurb}
      </p>
      <ul
        className="mt-3 mb-4 space-y-1.5 flex-1 list-none p-0"
        style={{ color: "#3A3225", fontSize: "clamp(12.5px, 1.15vw, 13.5px)" }}
      >
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 leading-snug">
            <span aria-hidden="true" style={{ color: "#B8860B" }} className="mt-[2px]">
              ·
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="w-full inline-flex items-center justify-center font-sans font-semibold rounded-full px-5 py-3 transition-colors duration-200 disabled:cursor-not-allowed"
        style={{
          background: disabled ? "rgba(160,123,31,0.18)" : "#D4AF37",
          color: disabled ? "#7A6418" : "#0A0F1E",
          fontSize: "clamp(13.5px, 1.25vw, 14.5px)",
          letterSpacing: "0.02em",
          boxShadow: disabled ? "none" : "0 6px 18px -10px rgba(212,175,55,0.55)",
        }}
      >
        {ctaLabel}
      </button>
      <p
        className="text-center mt-2 font-sans italic"
        style={{
          color: "#8A7F68",
          fontSize: "clamp(11px, 1vw, 12px)",
          letterSpacing: "0.02em",
        }}
      >
        Sample preview coming soon
      </p>
    </div>
  );
}

export function ContinuumTeaser({ comingSoon, onSelect7d, onSelect30d }: ContinuumTeaserProps) {
  // When `comingSoon` is not explicitly provided, derive from the client gate.
  // Production stays dark until VITE_CONTINUUM_ENABLED is flipped.
  const resolvedComingSoon =
    typeof comingSoon === "boolean" ? comingSoon : import.meta.env.VITE_CONTINUUM_ENABLED !== "1";
  return (
    <section
      aria-labelledby="continuum-heading"
      className="rounded-[14px] px-5 py-7 sm:px-7 sm:py-8"
      style={{
        background: "linear-gradient(180deg, rgba(212,175,55,0.06) 0%, rgba(212,175,55,0.02) 100%)",
        border: "1px solid rgba(212,175,55,0.32)",
        boxShadow: "0 8px 28px -18px rgba(31,26,16,0.35)",
      }}
    >
      {/* Header */}
      <div className="text-center mb-5 sm:mb-6">
        <p
          className="uppercase font-bold inline-flex items-center gap-2 flex-wrap justify-center"
          style={{
            color: "#A07B1F",
            fontSize: "clamp(11.5px, 1.1vw, 12.5px)",
            letterSpacing: "0.22em",
          }}
        >
          <span>Personal Timing Report</span>
          {resolvedComingSoon && (
            <span
              className="px-2 py-0.5 rounded-full font-bold uppercase"
              style={{
                background: "#0A0F1E",
                color: "#F5D87A",
                fontSize: "clamp(9.5px, 0.85vw, 10.5px)",
                letterSpacing: "0.18em",
              }}
            >
              Coming soon
            </span>
          )}
        </p>
        <h2
          id="continuum-heading"
          className="font-serif mt-2.5 leading-[1.1]"
          style={{ fontSize: "clamp(24px, 3.2vw, 30px)", color: "#1F1A10" }}
        >
          CONTINUUM — your personal timing brief
        </h2>
        <p
          className="mt-3 mx-auto leading-[1.55]"
          style={{
            color: "#3A3225",
            fontSize: "clamp(13.5px, 1.3vw, 15px)",
            maxWidth: "520px",
          }}
        >
          A private AI astrology forecast based on your birth chart — what's coming next, pressure
          zones, green windows and a daily protocol. Delivered as a separate PDF.
        </p>
      </div>

      {/* Two variant cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ContinuumCard
          period="Next 7 Days"
          priceLabel="$1.99"
          blurb="AI horoscope report built from your birth chart — a week-ahead timing brief: what to push, what to pause, what to protect. Delivered as a separate PDF."
          bullets={[
            "Main theme of the week",
            "Pressure zones · green windows",
            "Work, relationships, body rhythm",
            "Daily protocol",
          ]}
          ctaLabel={resolvedComingSoon ? "Coming soon" : "Get my 7-day brief"}
          disabled={resolvedComingSoon}
          onClick={onSelect7d}
        />
        <ContinuumCard
          period="Next 30 Days"
          priceLabel="$3.99"
          blurb="AI horoscope report built from your birth chart — a full month-ahead map: vectors, windows, environments and recovery focus. Delivered as a separate PDF."
          bullets={[
            "Month theme · primary vector",
            "Green & pressure windows",
            "Work, money, relationships, body",
            "Monthly protocols",
          ]}
          ctaLabel={resolvedComingSoon ? "Coming soon" : "Get my 30-day brief"}
          disabled={resolvedComingSoon}
          onClick={onSelect30d}
        />
      </div>

      {/* Footer note */}
      <p
        className="text-center mt-5 font-sans"
        style={{
          color: "#5C5340",
          fontSize: "clamp(11.5px, 1.05vw, 12.5px)",
          letterSpacing: "0.04em",
        }}
      >
        Standalone product · Not part of CORE or CORE Complete · One-time purchase
      </p>
    </section>
  );
}
