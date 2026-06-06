import { Link, useNavigate, useRouterState } from "@tanstack/react-router";

function scrollToId(id: string) {
  const start = Date.now();
  const tick = () => {
    const el = document.getElementById(id);
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

  const goToSection = (id: string) => {
    if (pathname === "/") {
      scrollToId(id);
    } else {
      navigate({ to: "/" }).then(() => scrollToId(id));
    }
  };

  const announcementClasses =
    "font-sans font-medium transition-colors duration-200 cursor-pointer " +
    (onDark
      ? "text-light-grey/90 hover:text-gold"
      : "text-neutral-grey hover:text-charcoal");

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

        {/* Centered announcement — tablet+ only; mobile gets its own row below */}
        <div
          className="hidden sm:flex flex-1 justify-center px-3 min-w-0"
          aria-label="Launch announcement"
        >
          <button
            type="button"
            onClick={() => goToSection("product-selector")}
            className={announcementClasses + " truncate"}
            style={{ fontSize: "clamp(13px, 1.3vw, 16px)", letterSpacing: "0.04em" }}
            aria-label="Jump to choose your report"
          >
            <span className="hidden md:inline">
              Launch drop · Your birth code, decoded for less than a latte
            </span>
            <span className="md:hidden">Launch drop · Birth code decoded</span>
          </button>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <a
            href="/#about"
            onClick={(e) => {
              e.preventDefault();
              goToSection("about");
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

      {/* Mobile announcement row — visible only below sm */}
      <div
        className={
          "sm:hidden px-4 py-2 flex justify-center border-t " +
          (onDark ? "border-gold/10" : "border-border")
        }
      >
        <button
          type="button"
          onClick={() => goToSection("product-selector")}
          className={announcementClasses + " text-center"}
          style={{ fontSize: 12.5, letterSpacing: "0.04em" }}
          aria-label="Jump to choose your report"
        >
          Launch drop · Birth code decoded <span className="text-gold">→</span>
        </button>
      </div>
    </header>
  );
}
