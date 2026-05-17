import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Faq = { question: string; answer: ReactNode };

const faqs: Faq[] = [
  {
    question: "What makes Darrow Code different?",
    answer: (
      <div className="space-y-2.5">
        <p>Darrow Code is not a generic horoscope.</p>
        <p>
          It is a premium AI-powered synthesis built from your birth data and,
          if you provide it, your full name for deeper numerology.
        </p>
        <p>
          The Darrow Code Method blends Western astrology, Chinese BaZi / Four
          Pillars, numerology, timing cycles and pattern psychology into one
          clear personal reading — so you receive an interpretation of your
          full pattern, not a list of isolated placements.
        </p>
      </div>
    ),
  },
  {
    question: "What will I find inside my report?",
    answer: (
      <div className="space-y-2.5">
        <p>
          You receive a polished private PDF report with your personal pattern
          briefing: your core architecture, timing theme, practical protocols,
          warning signals, before/after perspective and proof tags showing the
          real astrology, BaZi and numerology data behind the interpretation.
        </p>
        <p>
          You can start with CORE, choose a focused chapter like LOVE or MONEY,
          or get CORE Complete with all chapters in one reading.
        </p>
        <p>
          Tap <strong>“See a sample”</strong> at the top of the page to preview
          the format before buying.
        </p>
      </div>
    ),
  },
  {
    question: "How long does report generation take?",
    answer:
      "Most reports are ready within 2–4 minutes. Larger bundles (like CORE Complete with all 6 focused chapters) may take up to 6–8 minutes since each chapter is generated individually and then compiled into a single PDF.",
  },
  {
    question: "Do I save if I add multiple chapters?",
    answer: (
      <div className="space-y-3">
        <p>
          Yes — bundle pricing is applied automatically as soon as you select 2
          or more Focused Chapters. The more chapters you add, the more you
          save. Single prices: <strong>CORE Report $4.99</strong>, each Focused
          Chapter <strong>$2.99</strong>.
        </p>

        <div>
          <p className="font-semibold mb-1.5" style={{ color: "#1F1A10" }}>
            Focused Chapters only (no CORE)
          </p>
          <ul className="text-[12.5px] sm:text-[13px] space-y-0.5 font-mono">
            <li>2 chapters — <strong>$4.99</strong> <span style={{ color: "#8B6914" }}>(save $0.99)</span></li>
            <li>3 chapters — <strong>$6.99</strong> <span style={{ color: "#8B6914" }}>(save $1.98)</span></li>
            <li>4 chapters — <strong>$8.99</strong> <span style={{ color: "#8B6914" }}>(save $2.97)</span></li>
            <li>5 chapters — <strong>$9.99</strong> <span style={{ color: "#8B6914" }}>(save $4.96)</span></li>
            <li>All 6 chapters — <strong>$10.00</strong> <span style={{ color: "#8B6914" }}>(save $7.94 vs $17.94)</span></li>
          </ul>
        </div>

        <div>
          <p className="font-semibold mb-1.5" style={{ color: "#1F1A10" }}>
            CORE Report + Focused Chapters
          </p>
          <ul className="text-[12.5px] sm:text-[13px] space-y-0.5 font-mono">
            <li>CORE + 1 chapter — <strong>$7.98</strong></li>
            <li>CORE + 2 chapters — <strong>$9.98</strong> <span style={{ color: "#8B6914" }}>(save $0.99)</span></li>
            <li>CORE + 3 chapters — <strong>$11.98</strong> <span style={{ color: "#8B6914" }}>(save $1.98)</span></li>
            <li>CORE + 4 chapters — <strong>$13.98</strong> <span style={{ color: "#8B6914" }}>(save $2.97)</span></li>
            <li>CORE + 5 chapters — <strong>$14.98</strong> <span style={{ color: "#8B6914" }}>(save $4.96)</span></li>
            <li>
              <strong>CORE Complete</strong> (CORE + all 6) — <strong>$14.99</strong>{" "}
              <span style={{ color: "#8B6914" }}>(save $7.94 vs $22.93)</span>
            </li>
          </ul>
        </div>

        <p className="text-[12.5px]" style={{ color: "#5C5340" }}>
          The order summary on the form always shows the exact total and the
          amount you save before checkout.
        </p>
      </div>
    ),
  },
  {
    question: "What affects generation speed?",
    answer:
      "Three things: (1) the number of chapters you select — each runs its own AI pipeline; (2) current AI provider load — we use premium models and occasionally queue requests during peak hours; (3) geocoding validation for your birth city, which usually completes in under a second.",
  },
  {
    question: "Is my birth data kept private?",
    answer:
      "Yes. Your birth data is used only to generate your report and is never shared, sold, or used for any other purpose. All data is processed securely and stored with encryption.",
  },
  {
    question: "Can I download or share my report?",
    answer:
      "Absolutely. Once generated, your report is delivered as a multi-page PDF that you can download, print, or share however you like. It is yours forever with no subscription required.",
  },
];

export function FaqBlock() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-3 mb-5">
        <span
          className="h-px w-10 sm:w-12"
          style={{ backgroundColor: "rgba(212,175,55,0.45)" }}
        />
        <p
          className="text-[11px] sm:text-[12px] tracking-[0.18em] sm:tracking-[0.2em] uppercase font-semibold"
          style={{ color: "#D4AF37" }}
        >
          Common questions
        </p>
        <span
          className="h-px w-10 sm:w-12"
          style={{ backgroundColor: "rgba(212,175,55,0.45)" }}
        />
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="border-b"
            style={{ borderColor: "rgba(212,175,55,0.18)" }}
          >
            <AccordionTrigger
              className="text-[13.5px] sm:text-[14.5px] font-semibold py-4 hover:no-underline"
              style={{ color: "#1a1a2e" }}
            >
              {faq.question}
            </AccordionTrigger>
            <AccordionContent
              className="text-[13px] sm:text-[14px] leading-[1.6] pb-4"
              style={{ color: "#4A402D" }}
            >
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
