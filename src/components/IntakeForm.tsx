import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { createCheckout } from "@/utils/checkout.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { StripeEmbeddedCheckoutBox } from "@/components/StripeEmbeddedCheckout";
import { PlaceAutocomplete } from "@/components/PlaceAutocomplete";
import type { PlaceSuggestion } from "@/utils/places.functions";
import {
  priceForModules,
  type ModuleCode,
} from "@/lib/modules";
import { ctaLabelFor } from "@/components/ProductSelector";

type FormState = {
  first_name: string;
  email: string;
  date_of_birth: string;
  birth_time: string;
  birth_city: string;
  full_name_for_numerology: string;
};

const initial: FormState = {
  first_name: "",
  email: "",
  date_of_birth: "",
  birth_time: "",
  birth_city: "",
  full_name_for_numerology: "",
};

export function IntakeForm({ chapters = [] }: { chapters?: ModuleCode[] } = {}) {
  const [form, setForm] = useState<FormState>(initial);
  const [resolvedPlace, setResolvedPlace] = useState<PlaceSuggestion | null>(null);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const navigate = useNavigate();

  const quote = priceForModules(chapters, true);
  const ctaText = ctaLabelFor(chapters);
  const ctaPrice = `$${(quote.cents / 100).toFixed(2)}`;

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.email || !form.date_of_birth || !form.birth_city) {
      toast.error("Please complete the required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email.");
      return;
    }
    setPlaceError(null);
    setSubmitting(true);
    try {
      const res = await createCheckout({
        data: {
          modules: chapters,
          first_name: form.first_name.trim(),
          email: form.email.trim(),
          date_of_birth: form.date_of_birth,
          birth_time: form.birth_time || "",
          birth_city: form.birth_city.trim(),
          full_name_for_numerology: form.full_name_for_numerology || "",
          origin: window.location.origin,
          environment: getStripeEnvironment(),
          resolved_place: resolvedPlace
            ? {
                latitude: resolvedPlace.latitude,
                longitude: resolvedPlace.longitude,
                timezone: resolvedPlace.timezone,
                resolved_name: resolvedPlace.resolved_name,
                country: resolvedPlace.country,
              }
            : undefined,
        },
      });
      setClientSecret(res.client_secret);
      setSessionId(res.session_id);
    } catch (err: any) {
      const msg = err?.message ?? "Could not start checkout.";
      // If geocoding failed, surface as inline field error too.
      if (/select your birth city/i.test(msg)) setPlaceError(msg);
      toast.error(msg);
      setSubmitting(false);
    }
  };

  if (clientSecret) {
    return (
      <div className="w-full max-w-[480px] mx-auto">
        <StripeEmbeddedCheckoutBox
          fetchClientSecret={async () => clientSecret}
        />
        <p className="mt-3 text-center text-[11px] text-muted-grey">
          After payment you'll be redirected to your report.
          {sessionId && (
            <>
              {" "}
              <button
                type="button"
                className="underline"
                onClick={() => navigate({ to: "/generating", search: { session_id: sessionId } })}
              >
                Continue
              </button>
            </>
          )}
        </p>
      </div>
    );
  }

  const labelCls = "intake-label";
  const inputCls = "intake-input";

  return (
    <form onSubmit={onSubmit} className="w-full space-y-[18px]">
      <div>
        <label className={labelCls}>First name</label>
        <input className={inputCls} value={form.first_name} onChange={update("first_name")} placeholder="Your first name" required />
      </div>

      <div>
        <label className={labelCls}>Email</label>
        <input
          type="email"
          className={inputCls}
          value={form.email}
          onChange={update("email")}
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="grid gap-[18px] sm:grid-cols-[1.4fr_1fr] grid-cols-1">
        <div>
          <label className={labelCls}>Date of birth</label>
          <input
            type="date"
            className={inputCls}
            value={form.date_of_birth}
            onChange={update("date_of_birth")}
            required
          />
        </div>
        <div>
          <label className={labelCls}>Birth time</label>
          <input
            type="time"
            className={inputCls}
            value={form.birth_time}
            onChange={update("birth_time")}
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Birth city + country</label>
        <PlaceAutocomplete
          value={form.birth_city}
          onTextChange={(t) => {
            setForm((f) => ({ ...f, birth_city: t }));
            if (placeError) setPlaceError(null);
          }}
          onSelect={(p) => setResolvedPlace(p)}
          inputClassName={inputCls}
          placeholder="Start typing your birth city..."
          required
          invalid={!!placeError}
        />
        {placeError ? (
          <p className="mt-1.5 text-[11px]" style={{ color: "#B23A3A" }}>
            {placeError}
          </p>
        ) : (
          <p className="mt-1.5 text-[11.5px] sm:text-[12px]" style={{ color: "#4A402D" }}>
            Used only to calculate your birth chart timezone and coordinates.
          </p>
        )}
      </div>

      <div>
        <label className={labelCls} style={{ opacity: 0.75 }}>
          Full name <span className="normal-case tracking-normal" style={{ color: "#6B6B6B" }}>— optional</span>
        </label>
        <input
          className={inputCls}
          value={form.full_name_for_numerology}
          onChange={update("full_name_for_numerology")}
          placeholder="Full name for deeper numerology"
        />
      </div>

      <div className="pt-3 text-center">
        <div className="flex items-center justify-center gap-3 mb-2.5" aria-hidden="false">
          <span className="h-px w-8 sm:w-10" style={{ backgroundColor: "rgba(212,175,55,0.45)" }} />
          <p className="text-[11px] sm:text-[12px] tracking-[0.18em] sm:tracking-[0.2em] uppercase text-gold font-semibold">
            Launch price
          </p>
          <span className="h-px w-8 sm:w-10" style={{ backgroundColor: "rgba(212,175,55,0.45)" }} />
        </div>
        <button
          type="submit"
          disabled={submitting}
          style={{
            backgroundColor: "#D4AF37",
            color: "#0A0F1E",
            boxShadow: "0 8px 22px rgba(212,175,55,0.28), 0 1px 0 rgba(10,15,30,0.06) inset",
          }}
          className="cta-premium w-full font-sans font-semibold rounded-[10px] py-3.5 px-4 text-[15px] sm:text-[16px] flex items-center justify-center gap-2.5 disabled:opacity-60"
        >
          <span>{submitting ? "Preparing…" : ctaText}</span>
          <span
            className="font-mono text-[13px] px-2 py-[3px] rounded"
            style={{ backgroundColor: "#0A0F1E", color: "#D4AF37" }}
          >
            {ctaPrice}
          </span>
        </button>
        <p className="mt-4 text-[12.5px] sm:text-[13px] font-medium leading-relaxed" style={{ color: "#4A402D" }}>
          Start instantly · Ready in a few minutes · Multi-page PDF ·{" "}
          <span style={{ color: "#D4AF37" }}>No subscription required</span> · Yours forever
        </p>
      </div>
    </form>
  );
}
