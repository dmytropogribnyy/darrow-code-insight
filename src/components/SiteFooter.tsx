import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer>
      <div className="max-w-2xl mx-auto px-6 pt-10 sm:pt-12 pb-12 text-center">
        <div className="flex items-center justify-center gap-3" aria-hidden="false">
          <span className="h-px w-6 sm:w-10" style={{ backgroundColor: "rgba(212,175,55,0.4)" }} />
          <p
            className="font-display text-[12px] sm:text-[13px] uppercase"
            style={{ color: "#4A402D", letterSpacing: "0.22em" }}
          >
            Powered by the Darrow Code Method
          </p>
          <span className="h-px w-6 sm:w-10" style={{ backgroundColor: "rgba(212,175,55,0.4)" }} />
        </div>
        <p className="mt-5 text-[11px] sm:text-[12px] leading-[1.55]" style={{ color: "#6B6B6B" }}>
          For self-reflection and personal insight.
          <br />
          Not medical, legal or financial advice.
        </p>
        <div className="mt-6">
          <p
            className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] mb-3"
            style={{ color: "#4A402D" }}
          >
            Follow Darrow Code
          </p>
          <div
            className="flex justify-center gap-6 text-[13px] sm:text-[14px]"
            style={{ color: "#151922" }}
          >
            <a
              href="https://www.tiktok.com/@darrowcode"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-gold hover:underline underline-offset-4 decoration-gold/40 transition-colors"
            >
              TikTok
            </a>
            <a
              href="https://www.instagram.com/darrowcode"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-gold hover:underline underline-offset-4 decoration-gold/40 transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://www.youtube.com/@darrowcode"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-gold hover:underline underline-offset-4 decoration-gold/40 transition-colors"
            >
              YouTube
            </a>
          </div>
        </div>
        <div
          className="mt-6 flex justify-center gap-7 text-[13px] sm:text-[14px]"
          style={{ color: "#151922" }}
        >
          <Link
            to="/privacy"
            className="font-medium hover:text-gold hover:underline underline-offset-4 decoration-gold/40 transition-colors"
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="font-medium hover:text-gold hover:underline underline-offset-4 decoration-gold/40 transition-colors"
          >
            Terms
          </Link>
          <Link
            to="/contact"
            className="font-medium hover:text-gold hover:underline underline-offset-4 decoration-gold/40 transition-colors"
          >
            Contact
          </Link>
        </div>
        <p className="mt-5 text-[11px]" style={{ color: "#9A8F80" }}>
          &copy; Darrow Code
        </p>
      </div>
    </footer>
  );
}
