import { MODULE_CODES, type ModuleCode, priceForModules } from "@/lib/modules";

const CHAPTER_META: Record<ModuleCode, { title: string; desc: string }> = {
  LOVE: { title: "LOVE", desc: "Who you attract — and why it keeps happening" },
  MONEY: { title: "MONEY", desc: "Your real wealth pattern & income mechanism" },
  BODY: { title: "BODY", desc: "Your stress signature & recovery rhythm" },
  YEAR: { title: "YEAR", desc: "What this year will demand of you" },
  STYLE: { title: "STYLE", desc: "Your colors, aesthetic & personal signature" },
  PLACE: { title: "PLACE", desc: "Where you'll thrive — and where to avoid" },
};

interface Props {
  selected: Set<ModuleCode>;
  onToggle: (m: ModuleCode) => void;
  onSelectAll: () => void;
  onClear: () => void;
  locked?: boolean;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function ProductSelector({ selected, onToggle, onSelectAll, onClear, locked = false }: Props) {
  const chapters = Array.from(selected) as ModuleCode[];
  const quote = priceForModules(chapters, true);
  const allSelected = selected.size === 6;

  return (
    <div className="w-full">
      <div
        aria-disabled={locked}
        className={locked ? "pointer-events-none opacity-65 select-none transition-opacity" : "transition-opacity"}
      >
      <div className="text-center mb-5">
        <p
          className="text-[11px] tracking-[0.22em] uppercase font-bold"
          style={{ color: "#A07B1F" }}
        >
          Choose your report
        </p>
        <h2
          className="font-serif mt-2 leading-[1.1]"
          style={{ fontSize: "clamp(22px,3vw,26px)", color: "#1F1A10" }}
        >
          CORE Report is your foundation.
          <br />
          Add chapters or get CORE Complete.
        </h2>
      </div>

      {/* CORE card — locked on (foundation) */}
      <div
        id="chapter-CORE"
        className="rounded-[10px] border-2 px-4 py-4 mb-3 flex items-start gap-3"
        style={{
          borderColor: "#D4AF37",
          background: "rgba(212,175,55,0.12)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset, 0 6px 18px -10px rgba(160,123,31,0.45)",
        }}
      >
        <div
          className="mt-0.5 w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-bold"
          style={{ backgroundColor: "#B8860B", color: "#FFF7E0" }}
        >
          ✓
        </div>
        <div className="flex-1">
          <p
            className="text-[12px] tracking-[0.18em] uppercase font-bold"
            style={{ color: "#8B6914" }}
          >
            CORE Report — foundation
          </p>
          <p className="text-[13px] leading-relaxed mt-1" style={{ color: "#2A2418" }}>
            Your private birth code: how you think, react, choose and move through change.
          </p>
        </div>
        <span
          className="font-mono text-[14px] whitespace-nowrap font-bold"
          style={{ color: "#1F1A10" }}
        >
          $4.99
        </span>
      </div>

      {/* CORE Complete bundle card */}
      <button
        id="chapter-COMPLETE"
        type="button"
        disabled={locked}
        onClick={allSelected ? onClear : onSelectAll}
        className="w-full text-left rounded-[10px] border-2 px-4 py-4 mb-5 transition flex items-start gap-3 disabled:cursor-default"
        style={{
          borderColor: allSelected ? "#B8860B" : "#D4AF37",
          background: allSelected ? "rgba(212,175,55,0.16)" : "rgba(212,175,55,0.06)",
          boxShadow: allSelected
            ? "0 1px 0 rgba(255,255,255,0.6) inset, 0 10px 26px -12px rgba(160,123,31,0.55)"
            : "0 1px 0 rgba(255,255,255,0.5) inset, 0 4px 14px -10px rgba(160,123,31,0.35)",
        }}
      >
        <div
          className="mt-0.5 w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-bold border"
          style={{
            backgroundColor: allSelected ? "#B8860B" : "transparent",
            color: "#FFF7E0",
            borderColor: "#B8860B",
          }}
        >
          {allSelected ? "✓" : ""}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p
              className="text-[12px] tracking-[0.18em] uppercase font-bold"
              style={{ color: "#8B6914" }}
            >
              CORE Complete
            </p>
            <span
              className="text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 rounded font-bold"
              style={{
                backgroundColor: "#0A0F1E",
                color: "#F5D87A",
                boxShadow: "0 2px 8px -3px rgba(10,15,30,0.5)",
              }}
            >
              Best value · Save $7.94
            </span>
          </div>
          <p className="text-[13px] leading-relaxed mt-1" style={{ color: "#2A2418" }}>
            CORE Report + all 6 Focused Chapters in one reading.
          </p>
        </div>
        <span
          className="font-mono text-[14px] whitespace-nowrap font-bold"
          style={{ color: "#1F1A10" }}
        >
          $14.99
        </span>
      </button>

      <p
        className="text-center text-[11px] tracking-[0.2em] uppercase mb-3 font-semibold"
        style={{ color: "#5C5340" }}
      >
        — or pick individual chapters —
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
        {MODULE_CODES.map((code) => {
          const meta = CHAPTER_META[code];
          const active = selected.has(code);
          return (
            <button
              key={code}
              id={`chapter-${code}`}
              type="button"
              onClick={() => onToggle(code)}
              className="text-left rounded-[8px] border px-3.5 py-3 transition flex items-start gap-2.5"
              style={{
                borderColor: active ? "#B8860B" : "rgba(74,64,45,0.28)",
                background: active ? "rgba(212,175,55,0.14)" : "rgba(255,255,255,0.65)",
                boxShadow: active
                  ? "0 4px 14px -8px rgba(160,123,31,0.5)"
                  : "0 1px 0 rgba(255,255,255,0.5) inset",
              }}
            >
              <div
                className="mt-0.5 w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[9px] font-bold border"
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
                    className="text-[12px] tracking-[0.16em] uppercase font-bold"
                    style={{ color: "#8B6914" }}
                  >
                    {meta.title}
                  </p>
                  <span
                    className="font-mono text-[12px] whitespace-nowrap font-semibold"
                    style={{ color: "#1F1A10" }}
                  >
                    +$2.99
                  </span>
                </div>
                <p className="text-[12px] leading-snug mt-0.5" style={{ color: "#3A3225" }}>
                  {meta.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Order summary */}
      <div
        className="rounded-[8px] px-4 py-3.5 mb-1 border-2"
        style={{
          borderColor: "rgba(74,64,45,0.35)",
          background: "rgba(255,255,255,0.85)",
          boxShadow: "0 4px 16px -10px rgba(31,26,16,0.35)",
        }}
      >
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-semibold" style={{ color: "#1F1A10" }}>{quote.label}</span>
          <span className="font-mono font-bold text-[15px]" style={{ color: "#0A0F1E" }}>
            {formatPrice(quote.cents)}
          </span>
        </div>
        {quote.saved_cents > 0 && (
          <div className="flex items-center justify-between text-[11.5px] mt-1">
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

export function ctaLabelFor(chapters: ModuleCode[]): string {
  if (chapters.length === 6) return "Unlock CORE Complete";
  if (chapters.length === 0) return "Unlock My CORE Report";
  return chapters.length === 1
    ? "Unlock My CORE Report + 1 chapter"
    : `Unlock My CORE Report + ${chapters.length} chapters`;
}
