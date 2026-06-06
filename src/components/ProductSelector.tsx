import { Link } from "@tanstack/react-router";
import { MODULE_CODES, type ModuleCode, priceForModules } from "@/lib/modules";

export type Selectable = "CORE" | ModuleCode;

const CHAPTER_META: Record<ModuleCode, { title: string; desc: string; detail: string }> = {
  LOVE: {
    title: "LOVE",
    desc: "Your love pattern, attraction style and relationship rhythm.",
    detail: "How you bond, what drains you, what kind of partner fits your chart.",
  },
  MONEY: {
    title: "MONEY",
    desc: "Your work, money and value pattern.",
    detail: "Where your earning power lives, your spending pattern, work environments that fit.",
  },
  BODY: {
    title: "BODY",
    desc: "Your stress signature and recovery rhythm.",
    detail: "How your body holds pressure, what restores you, signals to watch.",
  },
  YEAR: {
    title: "YEAR",
    desc: "Your personal year, timing pressure and opportunity pattern.",
    detail: "What this year is really for, the green windows, the pressure zones.",
  },
  STYLE: {
    title: "STYLE",
    desc: "Your aesthetic signature, presence and style pattern.",
    detail: "Your visual archetype, colors and textures that amplify you, presence cues.",
  },
  PLACE: {
    title: "PLACE",
    desc: "Your environment pattern — where your system feels clearer or drained.",
    detail: "Cities, climates and rooms that lift you vs. flatten you.",
  },
};


interface Props {
  selected: Set<Selectable>;
  onToggle: (m: Selectable) => void;
  onSelectAll: () => void;
  onClear: () => void;
  locked?: boolean;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function ProductSelector({
  selected,
  onToggle,
  onSelectAll,
  onClear,
  locked = false,
}: Props) {
  const coreSelected = selected.has("CORE");
  const chapters = Array.from(selected).filter((c): c is ModuleCode => c !== "CORE");
  const hasAnySelection = coreSelected || chapters.length > 0;
  const quote = hasAnySelection ? priceForModules(chapters, coreSelected) : null;
  const allSelected = coreSelected && chapters.length === 6;

  return (
    <div className="w-full">
      <div
        aria-disabled={locked}
        className={
          locked
            ? "pointer-events-none opacity-65 select-none transition-opacity"
            : "transition-opacity"
        }
      >
        <div className="text-center mb-6 sm:mb-7">
          <p
            className="uppercase font-bold"
            style={{
              color: "#A07B1F",
              fontSize: "clamp(12px, 1.15vw, 13px)",
              letterSpacing: "0.22em",
            }}
          >
            Choose your personal astrology PDF
          </p>
          <h2
            className="font-serif mt-2.5 leading-[1.1]"
            style={{ fontSize: "clamp(26px, 3.6vw, 34px)", color: "#1F1A10" }}
          >
            Start with CORE — your foundation report.
            <br />
            Or add focused chapters for the areas you want.
          </h2>
        </div>

        {/* CORE card — toggleable; recommended foundation */}
        <button
          id="chapter-CORE"
          type="button"
          disabled={locked}
          onClick={() => onToggle("CORE")}
          aria-pressed={coreSelected}
          className="w-full text-left rounded-[12px] border-2 px-5 py-5 sm:px-6 sm:py-5 mb-3.5 flex items-start gap-3.5 transition disabled:cursor-default"
          style={{
            borderColor: coreSelected ? "#D4AF37" : "rgba(212,175,55,0.6)",
            background: coreSelected ? "rgba(212,175,55,0.12)" : "rgba(212,175,55,0.04)",
            boxShadow: coreSelected
              ? "0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 22px -10px rgba(160,123,31,0.5)"
              : "0 1px 0 rgba(255,255,255,0.5) inset",
          }}
        >
          <div
            className="mt-0.5 w-[18px] h-[18px] rounded-sm flex items-center justify-center text-[11px] font-bold border shrink-0"
            style={{
              backgroundColor: coreSelected ? "#B8860B" : "transparent",
              color: "#FFF7E0",
              borderColor: "#B8860B",
            }}
          >
            {coreSelected ? "✓" : ""}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <p
                className="uppercase font-bold"
                style={{
                  color: "#8B6914",
                  fontSize: "clamp(13px, 1.25vw, 14.5px)",
                  letterSpacing: "0.18em",
                }}
              >
                CORE Report
              </p>
              <span
                className="uppercase font-semibold"
                style={{
                  color: "#A07B1F",
                  fontSize: "clamp(10.5px, 1vw, 11.5px)",
                  letterSpacing: "0.14em",
                }}
              >
                · Recommended foundation
              </span>
            </div>
            <p
              className="leading-relaxed mt-1.5"
              style={{ color: "#2A2418", fontSize: "clamp(14px, 1.35vw, 15.5px)" }}
            >
              Your full personal astrology foundation report — birth chart, personality patterns,
              timing, numerology and life rhythm. Decoded through the Darrow Code Method and
              delivered as a private PDF.
            </p>
          </div>
          <span
            className="font-mono whitespace-nowrap font-bold"
            style={{ color: "#1F1A10", fontSize: "clamp(15px, 1.4vw, 17px)" }}
          >
            $4.99
          </span>
        </button>
        <div className="mt-1.5 mb-3.5 text-center">
          <Link
            to="/sample"
            className="font-sans font-medium underline-offset-4 hover:underline transition-colors"
            style={{
              color: "#8B6914",
              fontSize: "clamp(12px, 1.1vw, 13px)",
              letterSpacing: "0.02em",
            }}
          >
            See a sample report →
          </Link>
        </div>


        {/* CORE Complete bundle card */}
        <button
          id="chapter-COMPLETE"
          type="button"
          disabled={locked}
          onClick={allSelected ? onClear : onSelectAll}
          className="w-full text-left rounded-[12px] border-2 px-5 py-5 sm:px-6 sm:py-5 mb-6 transition flex items-start gap-3.5 disabled:cursor-default"
          style={{
            borderColor: allSelected ? "#B8860B" : "#D4AF37",
            background: allSelected ? "rgba(212,175,55,0.16)" : "rgba(212,175,55,0.06)",
            boxShadow: allSelected
              ? "0 1px 0 rgba(255,255,255,0.6) inset, 0 12px 28px -12px rgba(160,123,31,0.6)"
              : "0 1px 0 rgba(255,255,255,0.5) inset, 0 6px 18px -10px rgba(160,123,31,0.4)",
          }}
        >
          <div
            className="mt-0.5 w-[18px] h-[18px] rounded-sm flex items-center justify-center text-[11px] font-bold border shrink-0"
            style={{
              backgroundColor: allSelected ? "#B8860B" : "transparent",
              color: "#FFF7E0",
              borderColor: "#B8860B",
            }}
          >
            {allSelected ? "✓" : ""}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <p
                className="uppercase font-bold"
                style={{
                  color: "#8B6914",
                  fontSize: "clamp(13px, 1.25vw, 14.5px)",
                  letterSpacing: "0.18em",
                }}
              >
                CORE Complete
              </p>
              <span
                className="uppercase px-2 py-0.5 rounded font-bold"
                style={{
                  backgroundColor: "#0A0F1E",
                  color: "#F5D87A",
                  boxShadow: "0 2px 8px -3px rgba(10,15,30,0.5)",
                  fontSize: "clamp(10.5px, 1vw, 11.5px)",
                  letterSpacing: "0.18em",
                }}
              >
                Best value · Save $7.94
              </span>
            </div>
            <p
              className="leading-relaxed mt-1.5"
              style={{ color: "#2A2418", fontSize: "clamp(14px, 1.35vw, 15.5px)" }}
            >
              The complete AI astrology report set — CORE + all 6 focused chapters (LOVE, MONEY,
              BODY, YEAR, STYLE, PLACE), each delivered as its own private PDF. The full Darrow
              Code reading of your birth pattern.
            </p>
          </div>
          <span
            className="font-mono whitespace-nowrap font-bold"
            style={{ color: "#1F1A10", fontSize: "clamp(15px, 1.4vw, 17px)" }}
          >
            $14.99
          </span>
        </button>
        <div className="mt-1.5 mb-6 text-center">
          <Link
            to="/sample"
            className="font-sans font-medium underline-offset-4 hover:underline transition-colors"
            style={{
              color: "#8B6914",
              fontSize: "clamp(12px, 1.1vw, 13px)",
              letterSpacing: "0.02em",
            }}
          >
            See what's inside →
          </Link>
        </div>


        <p
          className="text-center uppercase mb-1 font-semibold"
          style={{
            color: "#5C5340",
            fontSize: "clamp(11.5px, 1.1vw, 12.5px)",
            letterSpacing: "0.2em",
          }}
        >
          — or pick individual chapters —
        </p>
        <p
          className="text-center font-sans font-normal mb-4"
          style={{
            color: "#9CA3AF",
            marginTop: "4px",
            fontSize: "clamp(12.5px, 1.15vw, 13.5px)",
          }}
        >
          Pick any chapter on its own, or combine several
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {MODULE_CODES.map((code) => {
            const meta = CHAPTER_META[code];
            const active = selected.has(code);
            return (
              <button
                key={code}
                id={`chapter-${code}`}
                type="button"
                disabled={locked}
                onClick={() => onToggle(code)}
                className="text-left rounded-[10px] border px-4 py-3.5 transition flex items-start gap-2.5 disabled:cursor-default"
                style={{
                  borderColor: active ? "#B8860B" : "rgba(74,64,45,0.28)",
                  background: active ? "rgba(212,175,55,0.14)" : "rgba(255,255,255,0.65)",
                  boxShadow: active
                    ? "0 4px 14px -8px rgba(160,123,31,0.5)"
                    : "0 1px 0 rgba(255,255,255,0.5) inset",
                }}
              >
                <div
                  className="mt-0.5 w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-bold border shrink-0"
                  style={{
                    backgroundColor: active ? "#B8860B" : "transparent",
                    color: "#FFF7E0",
                    borderColor: active ? "#B8860B" : "rgba(74,64,45,0.5)",
                  }}
                >
                  {active ? "✓" : ""}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className="uppercase font-bold"
                      style={{
                        color: "#8B6914",
                        fontSize: "clamp(12.5px, 1.2vw, 13.5px)",
                        letterSpacing: "0.16em",
                      }}
                    >
                      {meta.title}
                    </p>
                    <span
                      className="font-mono whitespace-nowrap font-semibold"
                      style={{ color: "#1F1A10", fontSize: "clamp(12.5px, 1.15vw, 13.5px)" }}
                    >
                      $2.99
                    </span>
                  </div>
                  <p
                    className="leading-snug mt-1"
                    style={{ color: "#3A3225", fontSize: "clamp(12.5px, 1.2vw, 13.5px)" }}
                  >
                    {meta.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Order summary — always full opacity, even when locked */}
      <div
        className="rounded-[10px] px-5 py-4 mb-1 border-2"
        style={{
          borderColor: "rgba(74,64,45,0.35)",
          background: "rgba(255,255,255,0.85)",
          boxShadow: "0 6px 18px -10px rgba(31,26,16,0.4)",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ fontSize: "clamp(13.5px, 1.25vw, 14.5px)" }}
        >
          <span className="font-semibold" style={{ color: "#1F1A10" }}>
            {quote ? quote.label : "Nothing selected"}
          </span>
          <span
            className="font-mono font-bold"
            style={{ color: "#0A0F1E", fontSize: "clamp(15px, 1.4vw, 16.5px)" }}
          >
            {quote ? formatPrice(quote.cents) : "—"}
          </span>
        </div>
        {quote && quote.saved_cents > 0 && (
          <div
            className="flex items-center justify-between mt-1.5"
            style={{ fontSize: "clamp(11.5px, 1.05vw, 12.5px)" }}
          >
            <span style={{ color: "#5C5340" }}>
              if bought separately:{" "}
              <span className="line-through">{formatPrice(quote.separate_cents)}</span>
            </span>
            <span className="font-mono font-bold" style={{ color: "#8B6914" }}>
              save {formatPrice(quote.saved_cents)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ctaLabelFor(includesCore: boolean, chapters: ModuleCode[]): string {
  if (includesCore && chapters.length === 6) return "Unlock CORE Complete";
  if (includesCore && chapters.length === 0) return "Unlock My CORE Report";
  if (includesCore) {
    return chapters.length === 1
      ? "Unlock My CORE Report + 1 chapter"
      : `Unlock My CORE Report + ${chapters.length} chapters`;
  }
  if (chapters.length === 1) return `Unlock My ${chapters[0]} Chapter`;
  return `Unlock ${chapters.length} Focused Chapters`;
}
