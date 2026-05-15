import { Link } from "@tanstack/react-router";

export function SiteHeader({ onDark = false }: { onDark?: boolean }) {
  return (
    <header
      className={
        "border-b " +
        (onDark
          ? "border-white/10 bg-navy text-light-grey"
          : "border-border bg-paper text-charcoal")
      }
    >
      <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
        <Link
          to="/"
          className="text-gold font-sans font-medium"
          style={{ fontSize: 11, letterSpacing: "0.35em" }}
        >
          DARROW CODE
        </Link>
        <Link
          to="/sample"
          className={
            "text-[12px] " +
            (onDark ? "text-muted-grey hover:text-light-grey" : "text-neutral-grey hover:text-charcoal")
          }
        >
          See a sample →
        </Link>
      </div>
    </header>
  );
}
