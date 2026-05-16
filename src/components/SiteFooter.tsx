import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer>
      <div className="max-w-2xl mx-auto px-6 pt-8 sm:pt-10 pb-10 text-center">
        <p
          className="mt-4 font-sans font-medium text-[11px] uppercase"
          style={{ color: "#4A402D", letterSpacing: "0.18em" }}
        >
          Powered by the Darrow Code Method
        </p>
        <p
          className="mt-5 text-[10px] sm:text-[11px] leading-[1.5]"
          style={{ color: "#6B6B6B" }}
        >
          For self-reflection and personal insight.
          <br />
          Not medical, legal or financial advice.
        </p>
        <div className="mt-6 flex justify-center gap-6 text-[13px]" style={{ color: "#151922" }}>
          <Link to="/privacy" className="font-medium hover:text-gold hover:underline underline-offset-4 decoration-gold/40 transition-colors">Privacy</Link>
          <Link to="/terms" className="font-medium hover:text-gold hover:underline underline-offset-4 decoration-gold/40 transition-colors">Terms</Link>
          <Link to="/contact" className="font-medium hover:text-gold hover:underline underline-offset-4 decoration-gold/40 transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
