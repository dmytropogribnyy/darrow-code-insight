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
          className="w-full text-left rounded-[14px] px-5 py-5 sm:px-6 sm:py-5 flex items-start gap-3.5 transition disabled:cursor-default"
          style={{
            border: coreSelected ? "2px solid #D4AF37" : "2px solid rgba(212,175,55,0.55)",
            background: coreSelected
              ? "linear-gradient(180deg, rgba(212,175,55,0.18) 0%, rgba(252,247,232,0.95) 100%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(252,247,232,0.92) 100%)",
            boxShadow: coreSelected
              ? "0 1px 0 rgba(255,255,255,0.7) inset, 0 14px 32px -16px rgba(160,123,31,0.55), 0 0 0 4px rgba(212,175,55,0.10)"
              : "0 1px 0 rgba(255,255,255,0.7) inset, 0 10px 26px -18px rgba(31,26,16,0.45)",
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
              style={{ color: "#6B6B68", fontSize: "clamp(14px, 1.35vw, 15.5px)" }}
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
          className="w-full text-left rounded-[14px] px-5 py-5 sm:px-6 sm:py-5 transition flex items-start gap-3.5 disabled:cursor-default"
          style={{
            border: allSelected ? "2px solid #B8860B" : "2px solid #D4AF37",
            background: allSelected
              ? "linear-gradient(180deg, rgba(212,175,55,0.22) 0%, rgba(252,247,232,0.96) 100%)"
              : "linear-gradient(180deg, rgba(212,175,55,0.12) 0%, rgba(255,251,238,0.95) 100%)",
            boxShadow: allSelected
              ? "0 1px 0 rgba(255,255,255,0.7) inset, 0 16px 36px -16px rgba(160,123,31,0.65), 0 0 0 4px rgba(212,175,55,0.12)"
              : "0 1px 0 rgba(255,255,255,0.7) inset, 0 12px 30px -16px rgba(160,123,31,0.5)",
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
              style={{ color: "#6B6B68", fontSize: "clamp(14px, 1.35vw, 15.5px)" }}
            >
              The complete AI astrology report set — CORE + all 6 focused chapters (LOVE, MONEY,
              BODY, YEAR, STYLE, PLACE), each delivered as its own private PDF. The full Darrow Code
              reading of your birth pattern.
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
                className="text-left rounded-[12px] px-4 py-3.5 transition flex items-start gap-2.5 disabled:cursor-default"
                style={{
                  border: active ? "1.5px solid #B8860B" : "1px solid rgba(74,64,45,0.28)",
                  background: active
                    ? "linear-gradient(180deg, rgba(212,175,55,0.16) 0%, rgba(252,247,232,0.92) 100%)"
                    : "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(252,247,232,0.7) 100%)",
                  boxShadow: active
                    ? "0 1px 0 rgba(255,255,255,0.65) inset, 0 8px 20px -12px rgba(160,123,31,0.55)"
                    : "0 1px 0 rgba(255,255,255,0.6) inset, 0 4px 12px -10px rgba(31,26,16,0.35)",
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
                    style={{ color: "#6B6B68", fontSize: "clamp(12.5px, 1.2vw, 13.5px)" }}
                  >
                    {meta.desc}
                  </p>
                  <p
                    className="leading-snug mt-1 italic"
                    style={{ color: "#8E8E8B", fontSize: "clamp(11.5px, 1.1vw, 12.5px)" }}
                  >
                    {meta.detail}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Order summary — always full opacity, even when locked */}
      <div
        className="rounded-[14px] px-6 py-5 mb-1 border-2 relative overflow-hidden"
        style={{
          borderColor: "rgba(212,175,55,0.55)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(252,247,232,0.96) 100%)",
          boxShadow:
            "0 10px 28px -14px rgba(31,26,16,0.45), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        {quote && quote.saved_cents > 0 && (
          <div className="mb-2.5 flex">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 font-sans font-bold uppercase"
              style={{
                fontSize: "10.5px",
                letterSpacing: "0.1em",
                color: "#1F1A10",
                background: "linear-gradient(180deg, #F2D27A 0%, #D4AF37 100%)",
                boxShadow: "0 2px 6px -2px rgba(212,175,55,0.6)",
              }}
            >
              Best value
            </span>
          </div>
        )}
        <div
          className="flex items-baseline justify-between gap-4"
          style={{ fontSize: "clamp(15px, 1.45vw, 17px)" }}
        >
          <span
            className="font-serif font-semibold leading-tight min-w-0 break-words"
            style={{ color: "#1F1A10", fontSize: "clamp(17px, 1.7vw, 20px)" }}
          >
            {quote ? quote.label : "Nothing selected"}
          </span>
          <span
            className="font-mono font-bold whitespace-nowrap shrink-0"
            style={{ color: "#0A0F1E", fontSize: "clamp(22px, 2.4vw, 28px)" }}
          >
            {quote ? formatPrice(quote.cents) : "—"}
          </span>
        </div>
        {quote && quote.saved_cents > 0 && (
          <>
            <div
              aria-hidden="true"
              className="my-3 h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.45) 50%, transparent 100%)",
              }}
            />
            <div
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2"
              style={{ fontSize: "clamp(13px, 1.2vw, 14px)" }}
            >
              <span style={{ color: "#5C5340" }} className="font-sans min-w-0">
                If bought separately{" "}
                <span className="line-through ml-0.5 whitespace-nowrap" style={{ color: "#8A7E5E" }}>
                  {formatPrice(quote.separate_cents)}
                </span>
              </span>
              <span
                className="font-sans font-bold inline-flex items-center rounded-full px-3 py-1 whitespace-nowrap shrink-0"
                style={{
                  color: "#1F1A10",
                  background: "rgba(212,175,55,0.18)",
                  border: "1px solid rgba(212,175,55,0.45)",
                  fontSize: "clamp(12.5px, 1.15vw, 13.5px)",
                  letterSpacing: "0.01em",
                }}
              >
                You save {formatPrice(quote.saved_cents)}
              </span>
            </div>
          </>
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
