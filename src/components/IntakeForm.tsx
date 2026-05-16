import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { createCoreCheckout } from "@/utils/checkout.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { StripeEmbeddedCheckoutBox } from "@/components/StripeEmbeddedCheckout";
import { PlaceAutocomplete } from "@/components/PlaceAutocomplete";
import type { PlaceSuggestion } from "@/utils/places.functions";

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

export function IntakeForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [resolvedPlace, setResolvedPlace] = useState<PlaceSuggestion | null>(null);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const navigate = useNavigate();

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
      const res = await createCoreCheckout({
        data: {
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
          <p className="mt-1.5 text-[11px]" style={{ color: "#9CA3AF" }}>
            Used only to calculate your birth chart timezone and coordinates.
          </p>
        )}
      </div>

      <div>
        <label className={labelCls} style={{ opacity: 0.75 }}>
          Full name <span className="normal-case tracking-normal" style={{ color: "#9CA3AF" }}>— optional</span>
        </label>
        <input
          className={inputCls}
          value={form.full_name_for_numerology}
          onChange={update("full_name_for_numerology")}
          placeholder="Full name for deeper numerology"
        />
      </div>

      <div className="pt-3 text-center">
        <p className="text-[10px] tracking-meta uppercase text-gold mb-2">Launch price</p>
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
          <span>{submitting ? "Preparing…" : "Unlock My CORE Report"}</span>
          <span
            className="font-mono text-[13px] px-2 py-[3px] rounded"
            style={{ backgroundColor: "#0A0F1E", color: "#D4AF37" }}
          >
            $4.99
          </span>
        </button>
        <p className="mt-4 text-[12px] leading-relaxed" style={{ color: "#6B6B6B" }}>
          Start instantly · Usually 60–90 seconds · Multi-page PDF ·{" "}
          <span style={{ color: "#D4AF37" }}>No subscription required</span> · Yours forever
        </p>
      </div>
    </form>
  );
}
