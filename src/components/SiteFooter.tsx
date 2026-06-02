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
      </div>
    </footer>
  );
}
