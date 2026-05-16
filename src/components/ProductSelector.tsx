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
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function ProductSelector({ selected, onToggle, onSelectAll, onClear }: Props) {
  const chapters = Array.from(selected) as ModuleCode[];
  const quote = priceForModules(chapters, true);
  const allSelected = selected.size === 6;

  return (
    <div className="w-full">
      <div className="text-center mb-5">
        <p className="text-[11px] tracking-[0.2em] uppercase text-gold font-semibold">
          Choose your report
        </p>
        <h2
          className="font-serif mt-2 leading-[1.1]"
          style={{ fontSize: "clamp(22px,3vw,26px)", color: "#4A402D" }}
        >
          CORE Report is your foundation.
          <br />
          Add chapters or get CORE Complete.
        </h2>
      </div>

      {/* CORE card — locked on (foundation) */}
      <div
        className="rounded-[10px] border px-4 py-4 mb-3 flex items-start gap-3"
        style={{
          borderColor: "rgba(212,175,55,0.55)",
          background: "rgba(212,175,55,0.06)",
        }}
      >
        <div
          className="mt-0.5 w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-bold"
          style={{ backgroundColor: "#D4AF37", color: "#0A0F1E" }}
        >
          ✓
        </div>
        <div className="flex-1">
          <p className="text-[12px] tracking-[0.16em] uppercase text-gold font-semibold">
            CORE Report — foundation
          </p>
          <p className="text-[13px] leading-relaxed mt-1" style={{ color: "#4A402D" }}>
            Your private birth code: how you think, react, choose and move through change.
          </p>
        </div>
        <span
          className="font-mono text-[14px] whitespace-nowrap font-semibold"
          style={{ color: "#4A402D" }}
        >
          $4.99
        </span>
      </div>

      {/* CORE Complete bundle card */}
      <button
        type="button"
        onClick={allSelected ? onClear : onSelectAll}
        className="w-full text-left rounded-[10px] border-2 px-4 py-4 mb-5 transition flex items-start gap-3"
        style={{
          borderColor: allSelected ? "#D4AF37" : "rgba(212,175,55,0.4)",
          background: allSelected ? "rgba(212,175,55,0.10)" : "rgba(212,175,55,0.03)",
        }}
      >
        <div
          className="mt-0.5 w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-bold border"
          style={{
            backgroundColor: allSelected ? "#D4AF37" : "transparent",
            color: "#0A0F1E",
            borderColor: "#D4AF37",
          }}
        >
          {allSelected ? "✓" : ""}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-[12px] tracking-[0.16em] uppercase text-gold font-semibold">
              CORE Complete
            </p>
            <span
              className="text-[10px] tracking-[0.16em] uppercase px-2 py-0.5 rounded"
              style={{ backgroundColor: "#0A0F1E", color: "#D4AF37" }}
            >
              Best value · Save $7.94
            </span>
          </div>
          <p className="text-[13px] leading-relaxed mt-1" style={{ color: "#4A402D" }}>
            CORE Report + all 6 Focused Chapters in one reading.
          </p>
        </div>
        <span
          className="font-mono text-[14px] whitespace-nowrap font-semibold"
          style={{ color: "#4A402D" }}
        >
          $14.99
        </span>
      </button>

      <p
        className="text-center text-[11px] tracking-[0.18em] uppercase mb-3"
        style={{ color: "#7A6F58" }}
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
              type="button"
              onClick={() => onToggle(code)}
              className="text-left rounded-[8px] border px-3.5 py-3 transition flex items-start gap-2.5"
              style={{
                borderColor: active ? "#D4AF37" : "rgba(74,64,45,0.18)",
                background: active ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.4)",
              }}
            >
              <div
                className="mt-0.5 w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[9px] font-bold border"
                style={{
                  backgroundColor: active ? "#D4AF37" : "transparent",
                  color: "#0A0F1E",
                  borderColor: active ? "#D4AF37" : "rgba(74,64,45,0.4)",
                }}
              >
                {active ? "✓" : ""}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] tracking-[0.14em] uppercase text-gold font-semibold">
                    {meta.title}
                  </p>
                  <span
                    className="font-mono text-[12px] whitespace-nowrap"
                    style={{ color: "#4A402D" }}
                  >
                    +$2.99
                  </span>
                </div>
                <p className="text-[12px] leading-snug mt-0.5" style={{ color: "#5C5340" }}>
                  {meta.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Order summary */}
      <div
        className="rounded-[8px] px-4 py-3.5 mb-1 border"
        style={{
          borderColor: "rgba(74,64,45,0.2)",
          background: "rgba(255,255,255,0.55)",
        }}
      >
        <div className="flex items-center justify-between text-[13px]">
          <span style={{ color: "#4A402D" }}>{quote.label}</span>
          <span className="font-mono font-semibold" style={{ color: "#0A0F1E" }}>
            {formatPrice(quote.cents)}
          </span>
        </div>
        {quote.saved_cents > 0 && (
          <div className="flex items-center justify-between text-[11.5px] mt-1">
            <span style={{ color: "#7A6F58" }}>
              <span className="line-through">{formatPrice(quote.separate_cents)}</span>{" "}
              separately
            </span>
            <span className="font-mono text-gold">save {formatPrice(quote.saved_cents)}</span>
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
