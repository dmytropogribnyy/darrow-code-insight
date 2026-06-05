import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer>
      <div className="max-w-2xl mx-auto px-6 pt-12 sm:pt-14 pb-14 text-center">
        <div className="flex items-center justify-center gap-3" aria-hidden="false">
          <span className="h-px w-8 sm:w-12" style={{ backgroundColor: "rgba(212,175,55,0.4)" }} />
          <p
            className="font-display text-[13px] sm:text-[14px] uppercase"
            style={{ color: "#4A402D", letterSpacing: "0.22em" }}
          >
            Powered by the Darrow Code Method
          </p>
          <span className="h-px w-8 sm:w-12" style={{ backgroundColor: "rgba(212,175,55,0.4)" }} />
        </div>
        <p className="mt-5 text-[13px] sm:text-[14px] leading-[1.6]" style={{ color: "#6B6B6B" }}>
          For self-reflection and personal insight.
          <br />
          Not medical, legal or financial advice.
        </p>
        <div className="mt-8">
          <p
            className="text-[11px] sm:text-[12px] uppercase tracking-[0.18em] mb-4 font-semibold"
            style={{ color: "#4A402D" }}
          >
            Follow Darrow Code
          </p>
          <div
            className="flex justify-center gap-7 sm:gap-8 text-[15px] sm:text-[16px]"
            style={{ color: "#151922" }}
          >
            <a
              href="https://www.tiktok.com/@darrowcode"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-gold hover:underline underline-offset-4 decoration-gold/40 transition-colors py-1"
            >
              TikTok
            </a>
            <a
              href="https://www.instagram.com/darrowcode"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-gold hover:underline underline-offset-4 decoration-gold/40 transition-colors py-1"
            >
              Instagram
            </a>
            <a
              href="https://www.youtube.com/@darrowcode"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-gold hover:underline underline-offset-4 decoration-gold/40 transition-colors py-1"
            >
              YouTube
            </a>
          </div>
        </div>
        <div
          className="mt-7 flex flex-wrap justify-center gap-x-8 gap-y-2 text-[15px] sm:text-[16px]"
          style={{ color: "#151922" }}
        >
          <Link
            to="/"
            className="font-medium hover:text-gold hover:underline underline-offset-4 decoration-gold/40 transition-colors py-1"
          >
            Home
          </Link>
          <Link
            to="/privacy"
            className="font-medium hover:text-gold hover:underline underline-offset-4 decoration-gold/40 transition-colors py-1"
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="font-medium hover:text-gold hover:underline underline-offset-4 decoration-gold/40 transition-colors py-1"
          >
            Terms
          </Link>
          <Link
            to="/contact"
            className="font-medium hover:text-gold hover:underline underline-offset-4 decoration-gold/40 transition-colors py-1"
          >
            Contact
          </Link>
        </div>
        <p className="mt-6 text-[12px]" style={{ color: "#9A8F80" }}>
          &copy; Darrow Code
        </p>
      </div>
    </footer>
  );
}
