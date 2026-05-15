import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/generating")({
  head: () => ({
    meta: [{ title: "Generating your report — Darrow Code" }],
  }),
  component: GeneratingPage,
});

function GeneratingPage() {
  return (
    <div className="min-h-screen bg-navy text-light-grey flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-8 w-10 h-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
        <h1 className="font-serif text-paper" style={{ fontSize: 28, color: "var(--paper)" }}>
          Reading the full pattern…
        </h1>
        <p className="mt-3 text-[12px] text-muted-grey">
          Building your private CORE Report
        </p>
        <p className="mt-2 text-[11px] text-muted-grey/70">
          Usually 60–90 seconds
        </p>
      </div>
    </div>
  );
}
