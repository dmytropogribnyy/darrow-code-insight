import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long does report generation take?",
    answer:
      "Most reports are ready within 2–4 minutes. Larger bundles (like CORE Complete with all 6 focused chapters) may take up to 6–8 minutes since each chapter is generated individually and then compiled into a single PDF.",
  },
  {
    question: "Do I save if I add multiple chapters?",
    answer:
      "Yes — bundle pricing applies automatically when you select 2 or more Focused Chapters. The more you add, the more you save. Adding all 6 chapters costs $10.00 instead of $17.94 separately. CORE Complete — CORE Report plus all 6 chapters — is $14.99, saving $7.94 compared with buying everything individually.",
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
