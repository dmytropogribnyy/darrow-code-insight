import { useEffect, useId, useRef, useState } from "react";
import { searchPlaces, type PlaceSuggestion } from "@/utils/places.functions";

type Props = {
  value: string;
  onTextChange: (text: string) => void;
  onSelect: (place: PlaceSuggestion | null) => void;
  inputClassName: string;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
};

export function PlaceAutocomplete({
  value,
  onTextChange,
  onSelect,
  inputClassName,
  placeholder,
  required,
  invalid,
}: Props) {
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const listId = useId();
  const debounceRef = useRef<number | null>(null);
  const reqIdRef = useRef(0);
  const blurTimerRef = useRef<number | null>(null);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    const q = value.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      const myReq = ++reqIdRef.current;
      setLoading(true);
      try {
        const res = await searchPlaces({ data: { query: q } });
        if (myReq !== reqIdRef.current) return;
        setResults(res.results);
        setOpen(res.results.length > 0);
        setActiveIdx(-1);
      } catch {
        if (myReq !== reqIdRef.current) return;
        setResults([]);
        setOpen(false);
      } finally {
        if (myReq === reqIdRef.current) setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [value]);

  const choose = (p: PlaceSuggestion) => {
    justSelectedRef.current = true;
    onTextChange(p.display);
    onSelect(p);
    setOpen(false);
    setResults([]);
    setActiveIdx(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (activeIdx >= 0) {
        e.preventDefault();
        choose(results[activeIdx]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        className={inputClassName}
        value={value}
        onChange={(e) => {
          onTextChange(e.target.value);
          onSelect(null); // any edit invalidates a previous selection
        }}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
        onBlur={() => {
          // Delay so click on a suggestion still registers
          blurTimerRef.current = window.setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-invalid={invalid || undefined}
      />
      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 left-0 right-0 max-h-64 overflow-auto rounded-[6px] border border-border bg-paper shadow-lg"
        >
          {results.map((r, i) => (
            <li
              key={`${r.latitude},${r.longitude},${i}`}
              role="option"
              aria-selected={i === activeIdx}
              className={
                "px-3 py-2 text-[13px] cursor-pointer text-charcoal " +
                (i === activeIdx ? "bg-gold/15" : "hover:bg-gold/10")
              }
              onMouseDown={(e) => {
                e.preventDefault();
                if (blurTimerRef.current) window.clearTimeout(blurTimerRef.current);
                choose(r);
              }}
              onMouseEnter={() => setActiveIdx(i)}
            >
              {r.display}
            </li>
          ))}
        </ul>
      )}
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-grey">
          …
        </span>
      )}
    </div>
  );
}
