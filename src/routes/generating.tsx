import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { getGenerationStatus } from "@/utils/checkout.functions";
import { BRAND_ASSETS } from "@/lib/brand/assets";

export const Route = createFileRoute("/generating")({
  validateSearch: z.object({ session_id: z.string().optional() }).parse,
  head: () => ({ meta: [{ title: "Generating your report — Darrow Code" }] }),
  component: GeneratingPage,
});

function GeneratingPage() {
  const { session_id } = Route.useSearch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("Reading the full pattern…");
  const stop = useRef(false);

  useEffect(() => {
    if (!session_id) return;
    stop.current = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const res = await getGenerationStatus({ data: { session_id } });
        if (res.report_token) {
          navigate({ to: "/result/$reportToken", params: { reportToken: res.report_token } });
          return;
        }
        if (res.order_status === "paid") setStatus("Payment received — building your report…");
        if (res.generation_status === "processing")
          setStatus("Synthesising your patterns…");
        if (res.generation_status === "failed_generation")
          setStatus("A small delay — we'll email you when it's ready.");
      } catch {
        // ignore — keep polling
      }
      if (!stop.current) timer = setTimeout(tick, 2500);
    };
    tick();
    return () => {
      stop.current = true;
      clearTimeout(timer!);
    };
  }, [session_id, navigate]);

  return (
    <div className="min-h-screen bg-navy text-light-grey flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <img
          src={BRAND_ASSETS.symbolGold}
          alt=""
          aria-hidden="true"
          className="mx-auto mb-10 w-24 h-24 sm:w-28 sm:h-28 darrow-symbol-pulse"
        />
        <h1 className="font-serif text-paper" style={{ fontSize: 28, color: "var(--paper)" }}>
          {status}
        </h1>
        <p className="mt-3 text-[12px] text-muted-grey">Building your private report</p>
        <p className="mt-2 text-[11px] text-muted-grey/70">Usually 60–90 seconds</p>
      </div>
    </div>
  );
}
