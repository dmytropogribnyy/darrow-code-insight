import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [{ title: "Contact — Darrow Code" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-serif text-warm-brown" style={{ fontSize: 32 }}>Contact</h1>
        <p className="mt-6 text-[14px] text-charcoal leading-relaxed">
          For questions, refunds on failed generations, or data deletion requests,
          email us at{" "}
          <a className="text-gold underline underline-offset-4" href="mailto:hello@darrowcode.com">
            hello@darrowcode.com
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
