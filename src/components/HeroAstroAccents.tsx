// Decorative astrological accents for the hero section.
// - Subtle planetary glyph ribbon (pure ornament, no data claims)
// - A few twinkling "stars" (CSS only)
// - Local moon-phase chip computed from the current UTC date
//
// No external API calls. Moon phase is derived from the synodic month
// (~29.53 days) anchored to a known new moon. Accuracy ±1 day.

import { useEffect, useState } from "react";

const PLANET_GLYPHS = ["☉", "☽", "☿", "♀", "♂", "♃", "♄"];
// 12 zodiac glyphs, Aries at top, clockwise.
// "\uFE0E" = variation selector-15 → forces text presentation (not emoji color),
// so the glyphs inherit the monochrome gold fill instead of system emoji colors.
const ZODIAC_GLYPHS = [
  "♈\uFE0E",
  "♉\uFE0E",
  "♊\uFE0E",
  "♋\uFE0E",
  "♌\uFE0E",
  "♍\uFE0E",
  "♎\uFE0E",
  "♏\uFE0E",
  "♐\uFE0E",
  "♑\uFE0E",
  "♒\uFE0E",
  "♓\uFE0E",
];

/**
 * Thin gold zodiac wheel — decorative SVG watermark for the hero.
 * Pure ornament, no data. Sits behind the headline at very low opacity.
 */
export function ZodiacWheel({ size = 520, className = "" }: { size?: number; className?: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 1;
  const rInner = rOuter - 28;
  const rGlyph = rOuter - 14;
  const gold = "rgba(212,175,55,1)";

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (-90 + i * 30) * (Math.PI / 180);
    const x1 = cx + rInner * Math.cos(angle);
    const y1 = cy + rInner * Math.sin(angle);
    const x2 = cx + rOuter * Math.cos(angle);
    const y2 = cy + rOuter * Math.sin(angle);
    const glyphAngle = (-90 + i * 30 + 15) * (Math.PI / 180);
    const gx = cx + rGlyph * Math.cos(glyphAngle);
    const gy = cy + rGlyph * Math.sin(glyphAngle);
    return { x1, y1, x2, y2, gx, gy, glyph: ZODIAC_GLYPHS[i] };
  });

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${size} ${size}`}
      className={`pointer-events-none select-none ${className}`}
      width={size}
      height={size}
      style={{ opacity: 0.085 }}
    >
      <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke={gold} strokeWidth={1} />
      <circle cx={cx} cy={cy} r={rInner} fill="none" stroke={gold} strokeWidth={0.75} />
      <circle cx={cx} cy={cy} r={rInner - 60} fill="none" stroke={gold} strokeWidth={0.5} />
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={gold} strokeWidth={0.75} />
          <text
            x={t.gx}
            y={t.gy}
            fill={gold}
            fontSize={14}
            fontFamily="serif"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {t.glyph}
          </text>
        </g>
      ))}
    </svg>
  );
}

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
  // A small constellation-feel field: varied sizes, some highlighted with a
  // soft golden glow. Hand-placed so it never looks like a single stray pixel.
  const stars = [
    // left cluster
    { top: "8%", left: "6%", delay: "0s", size: 2, glow: false },
    { top: "14%", left: "11%", delay: "1.2s", size: 3, glow: true },
    { top: "20%", left: "4%", delay: "2.4s", size: 1.5, glow: false },
    { top: "32%", left: "9%", delay: "0.6s", size: 2, glow: false },
    { top: "48%", left: "3%", delay: "3.0s", size: 2.5, glow: false },
    { top: "62%", left: "8%", delay: "1.8s", size: 3, glow: true },
    { top: "78%", left: "5%", delay: "2.2s", size: 2, glow: false },
    { top: "88%", left: "13%", delay: "0.4s", size: 1.5, glow: false },
    // right cluster
    { top: "10%", left: "88%", delay: "2.6s", size: 2, glow: false },
    { top: "18%", left: "94%", delay: "1.0s", size: 3, glow: true },
    { top: "30%", left: "91%", delay: "3.2s", size: 1.5, glow: false },
    { top: "44%", left: "96%", delay: "0.8s", size: 2.5, glow: false },
    { top: "58%", left: "89%", delay: "2.0s", size: 2, glow: false },
    { top: "72%", left: "95%", delay: "1.4s", size: 3, glow: true },
    { top: "84%", left: "92%", delay: "0.2s", size: 2, glow: false },
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
            background: s.glow ? "rgba(230,195,90,0.95)" : "rgba(230,230,235,0.75)",
            boxShadow: s.glow
              ? "0 0 8px rgba(230,195,90,0.7), 0 0 14px rgba(230,195,90,0.35)"
              : "0 0 4px rgba(230,230,235,0.45)",
            animation: `darrow-twinkle 3.6s ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes darrow-twinkle {
          0%, 100% { opacity: 0.25; transform: scale(0.9); }
          50% { opacity: 0.95; transform: scale(1.15); }
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
