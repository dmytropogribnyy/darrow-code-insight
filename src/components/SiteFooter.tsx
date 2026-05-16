import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-10 sm:mt-12">
      <div className="max-w-2xl mx-auto px-6 py-10 text-center">
        <p className="font-serif italic text-[14px] text-neutral-grey">
          When the pattern becomes visible, life gets easier to read.
        </p>
        <p
          className="mt-4 font-sans text-[11px] text-muted-grey uppercase"
          style={{ letterSpacing: "0.12em" }}
        >
          Powered by the Darrow Code Method
        </p>
        <p className="mt-6 text-[11px] text-neutral-grey leading-relaxed">
          For self-reflection and personal insight.
          <br />
          Not medical, legal or financial advice.
        </p>
        <div className="mt-6 flex justify-center gap-5 text-[12px] text-[#4A402D]">
          <Link to="/privacy" className="hover:text-charcoal transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-charcoal transition-colors">Terms</Link>
          <Link to="/contact" className="hover:text-charcoal transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
