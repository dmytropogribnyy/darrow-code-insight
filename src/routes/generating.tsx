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

const ATMOSPHERIC_MESSAGES = [
  "Creating your personal birth-code report…",
  "Mapping your astrological foundation…",
  "Reading the core pattern in your chart…",
  "Translating birth data into personal insight…",
  "Checking the timing layer…",
  "Following the golden thread through the pattern…",
  "Shaping your private Darrow Code report…",
  "Preparing your final PDF…",
  "Almost ready — your report is being assembled…",
];

function GeneratingPage() {
  const { session_id } = Route.useSearch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("Reading the full pattern…");
  const [detail, setDetail] = useState<string>("Usually 60–90 seconds");
  const [atmosphericIdx, setAtmosphericIdx] = useState(0);
  const [atmosphericVisible, setAtmosphericVisible] = useState(true);
  const [showReassurance, setShowReassurance] = useState(false);
  const [failed, setFailed] = useState(false);
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
        if (res.order_status === "paid" && res.job_status === "queued") {
          setStatus("Payment received — your report is queued…");
          setDetail("Your private link will also arrive by email when ready.");
        } else if (res.order_status === "paid") {
          setStatus("Payment received — creating your report…");
          setDetail("Your private link will also arrive by email when ready.");
        }
        if (res.generation_status === "processing" || res.job_status === "processing") {
          setStatus("Synthesising your patterns…");
          setDetail("This can take several minutes for larger readings.");
        }
        if (res.job_recovery_pending) {
          setStatus("Taking longer than usual — recovery is queued…");
          setDetail("You do not need to pay again. We’ll email your report as soon as it’s ready.");
        }
        if (res.generation_status === "failed_generation" || res.job_status === "failed") {
          setFailed(true);
          setStatus("We hit a delay preparing your report.");
          setDetail("No action or second payment is needed — we’ve saved your order and will email you when it’s ready.");
        }
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

  // Rotate atmospheric messages every 7s with subtle fade
  useEffect(() => {
    const interval = setInterval(() => {
      setAtmosphericVisible(false);
      setTimeout(() => {
        setAtmosphericIdx((i) => (i + 1) % ATMOSPHERIC_MESSAGES.length);
        setAtmosphericVisible(true);
      }, 400);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Show reassurance after ~45s
  useEffect(() => {
    const t = setTimeout(() => setShowReassurance(true), 45000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen text-light-grey flex items-center justify-center px-6"
      style={{
        background: `
          radial-gradient(circle at 50% 18%, rgba(212,175,55,0.06), transparent 28%),
          radial-gradient(circle at 80% 20%, rgba(229,231,235,0.035), transparent 30%),
          linear-gradient(180deg, #0A0F1E 0%, rgba(0,0,0,0.25) 100%)
        `,
        backgroundColor: "#0A0F1E",
      }}
    >
      <div className="text-center max-w-md">
        <img
          src={BRAND_ASSETS.symbolGold}
          alt=""
          aria-hidden="true"
          className="mx-auto mb-10 w-24 h-24 sm:w-28 sm:h-28 darrow-symbol-ritual"
        />
        <h1 className="font-serif text-paper" style={{ fontSize: 28, color: "var(--paper)" }}>
          {status}
        </h1>
        <p className="mt-3 text-[13px] sm:text-[14px] text-light-grey/85">
          Building your private Darrow Code report
        </p>
        <p className="mt-2 text-[12px] sm:text-[13px] text-muted-grey">
          {detail}
        </p>
        <p
          className="mt-6 text-[12px] sm:text-[13px] text-muted-grey/80 italic"
          style={{
            opacity: atmosphericVisible ? 1 : 0,
            transition: "opacity 400ms ease",
            minHeight: "1.25em",
          }}
          aria-live="polite"
        >
          {ATMOSPHERIC_MESSAGES[atmosphericIdx]}
        </p>
        {showReassurance && (
          <p className="mt-8 text-[12px] text-muted-grey/75 leading-relaxed max-w-sm mx-auto">
            {failed
              ? "Your payment is safe and your order is recorded. Support has enough information to recover it without charging you again."
              : "This can take up to a couple of minutes. You can keep this page open — we'll also email your report when it's ready."}
          </p>
        )}
      </div>
    </div>
  );
}
