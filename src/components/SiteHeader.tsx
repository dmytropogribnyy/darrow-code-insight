import { Link, useNavigate, useRouterState } from "@tanstack/react-router";

function scrollToAbout() {
  const start = Date.now();
  const tick = () => {
    const el = document.getElementById("about");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (Date.now() - start < 2000) requestAnimationFrame(tick);
  };
  tick();
}

export function SiteHeader({ onDark = false }: { onDark?: boolean }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header
      className={
        onDark
          ? "bg-navy text-light-grey border-b border-gold/15"
          : "bg-paper text-charcoal border-b border-border"
      }
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="text-gold font-sans font-medium shrink-0"
          style={{ fontSize: 12, letterSpacing: "0.28em" }}
        >
          DARROW CODE
        </Link>

        {/* Centered announcement — subtle, responsive */}
        <div
          className="hidden sm:flex flex-1 justify-center px-3 min-w-0"
          aria-label="Launch announcement"
        >
          <span
            className={
              "font-sans font-medium truncate " +
              (onDark ? "text-light-grey/90" : "text-neutral-grey")
            }
            style={{ fontSize: "clamp(14px, 1.4vw, 16px)", letterSpacing: "0.04em" }}
          >
            <span className="hidden md:inline">
              Launch drop · Your birth code, decoded for less than a latte
            </span>
            <span className="md:hidden text-gold/90">Birth code decoded</span>
          </span>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <a
            href="/#about"
            onClick={(e) => {
              e.preventDefault();
              if (pathname === "/") {
                scrollToAbout();
              } else {
                navigate({ to: "/" }).then(() => scrollToAbout());
              }
            }}
            className={
              "font-sans font-medium transition-colors duration-200 " +
              (onDark
                ? "text-light-grey hover:text-gold hover:underline underline-offset-4 decoration-gold/50"
                : "text-neutral-grey hover:text-charcoal hover:underline underline-offset-4 decoration-charcoal/40")
            }
            style={{ fontSize: "clamp(13px, 1.1vw, 14px)" }}
          >
            About
          </a>
          <Link
            to="/sample"
            className={
              "font-sans font-medium transition-colors duration-200 " +
              (onDark
                ? "text-light-grey hover:text-gold hover:underline underline-offset-4 decoration-gold/50"
                : "text-neutral-grey hover:text-charcoal hover:underline underline-offset-4 decoration-charcoal/40")
            }
            style={{ fontSize: "clamp(13px, 1.1vw, 14px)" }}
          >
            See a sample <span className="text-gold">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
