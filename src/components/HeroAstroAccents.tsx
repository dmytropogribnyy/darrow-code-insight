// Decorative astrological accents for the hero section.
// - Subtle planetary glyph ribbon (pure ornament, no data claims)
// - A few twinkling "stars" (CSS only)
// - Local moon-phase chip computed from the current UTC date
//
// No external API calls. Moon phase is derived from the synodic month
// (~29.53 days) anchored to a known new moon. Accuracy ±1 day.

import { useEffect, useState } from "react";

const PLANET_GLYPHS = ["☉", "☽", "☿", "♀", "♂", "♃", "♄"];

const SYNODIC_MONTH = 29.53058867;
// Known new moon: 2000-01-06 18:14 UTC
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);

type PhaseInfo = { name: string; glyph: string };

function moonPhase(date: Date): PhaseInfo {
  const diffDays = (date.getTime() - KNOWN_NEW_MOON_MS) / 86_400_000;
  let age = diffDays % SYNODIC_MONTH;
  if (age < 0) age += SYNODIC_MONTH;

  if (age < 1.84566) return { name: "New Moon", glyph: "🌑" };
  if (age < 5.53699) return { name: "Waxing Crescent", glyph: "🌒" };
  if (age < 9.22831) return { name: "First Quarter", glyph: "🌓" };
  if (age < 12.91963) return { name: "Waxing Gibbous", glyph: "🌔" };
  if (age < 16.61096) return { name: "Full Moon", glyph: "🌕" };
  if (age < 20.30228) return { name: "Waning Gibbous", glyph: "🌖" };
  if (age < 23.99361) return { name: "Last Quarter", glyph: "🌗" };
  if (age < 27.68493) return { name: "Waning Crescent", glyph: "🌘" };
  return { name: "New Moon", glyph: "🌑" };
}

export function PlanetGlyphRibbon() {
  return (
    <div
      aria-hidden="true"
      className="mt-4 flex items-center justify-center gap-x-4 sm:gap-x-5 select-none pointer-events-none"
      style={{
        fontSize: "clamp(14px, 1.4vw, 16px)",
        color: "rgba(212,175,55,0.45)",
        letterSpacing: "0.08em",
      }}
    >
      {PLANET_GLYPHS.map((g, i) => (
        <span key={i} style={{ fontFamily: "serif" }}>
          {g}
        </span>
      ))}
    </div>
  );
}

export function HeroStars() {
  const stars = [
    { top: "12%", left: "8%", delay: "0s", size: 3 },
    { top: "22%", left: "92%", delay: "1.4s", size: 2 },
    { top: "60%", left: "5%", delay: "2.6s", size: 2 },
    { top: "72%", left: "94%", delay: "0.8s", size: 3 },
    { top: "38%", left: "96%", delay: "3.1s", size: 2 },
    { top: "85%", left: "12%", delay: "2.0s", size: 2 },
  ];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: `${s.size}px`,
            height: `${s.size}px`,
            background: "rgba(230,195,90,0.7)",
            boxShadow: "0 0 6px rgba(230,195,90,0.55)",
            animation: `darrow-twinkle 3.6s ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes darrow-twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.9); }
          50% { opacity: 0.9; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

export function MoonPhaseChip() {
  const [phase, setPhase] = useState<PhaseInfo | null>(null);

  useEffect(() => {
    setPhase(moonPhase(new Date()));
  }, []);

  if (!phase) {
    return <div aria-hidden="true" className="mt-4 h-[28px]" />;
  }

  return (
    <div className="mt-4 flex justify-center">
      <div
        className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/[0.04] px-3 py-1.5"
        style={{ backdropFilter: "blur(2px)" }}
        aria-label={`Tonight's moon phase: ${phase.name}`}
      >
        <span style={{ fontSize: "14px", lineHeight: 1 }}>{phase.glyph}</span>
        <span
          className="font-sans text-light-grey"
          style={{
            fontSize: "clamp(11px, 1.1vw, 12px)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Tonight · {phase.name}
        </span>
      </div>
    </div>
  );
}
