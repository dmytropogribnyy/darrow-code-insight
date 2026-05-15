import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { createCoreCheckout } from "@/utils/checkout.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { StripeEmbeddedCheckoutBox } from "@/components/StripeEmbeddedCheckout";

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
        },
      });
      setClientSecret(res.client_secret);
      setSessionId(res.session_id);
    } catch (err: any) {
      toast.error(err?.message ?? "Could not start checkout.");
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

  const labelCls = "block text-[11px] tracking-meta uppercase text-neutral-grey mb-1.5";
  const inputCls =
    "w-full bg-paper border border-border rounded-[6px] px-3 py-2.5 text-[14px] text-charcoal " +
    "placeholder:text-neutral-grey/70 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition";

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[380px] mx-auto space-y-4">
      <div>
        <label className={labelCls}>First name</label>
        <input className={inputCls} value={form.first_name} onChange={update("first_name")} required />
      </div>

      <div>
        <label className={labelCls}>Email</label>
        <input
          type="email"
          className={inputCls}
          value={form.email}
          onChange={update("email")}
          required
        />
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
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
        <input
          className={inputCls}
          value={form.birth_city}
          onChange={update("birth_city")}
          placeholder="City and country, e.g. Bratislava, Slovakia"
          required
        />
        <p className="mt-1 text-[10px] text-muted-grey">
          Used only to calculate your birth chart timezone and coordinates.
        </p>
      </div>

      <div>
        <label className={labelCls + " opacity-70"}>
          Full name <span className="normal-case tracking-normal text-muted-grey">— optional</span>
        </label>
        <input
          className={inputCls + " text-[13px]"}
          value={form.full_name_for_numerology}
          onChange={update("full_name_for_numerology")}
          placeholder="Full name for deeper numerology — optional"
        />
      </div>

      <div className="pt-2 text-center">
        <p className="text-[10px] tracking-meta uppercase text-gold mb-2">Launch price</p>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gold text-navy font-sans font-semibold tracking-wide rounded-[6px] py-3.5 hover:brightness-105 active:brightness-95 transition disabled:opacity-60 flex items-center justify-center gap-3"
        >
          <span>{submitting ? "Preparing…" : "Generate my CORE Report"}</span>
          <span className="bg-navy text-gold font-mono text-[12px] px-2 py-1 rounded">$4.99</span>
        </button>
        <p className="mt-3 text-[11px] text-muted-grey">
          Start instantly · Usually 60–90 seconds · Multi-page PDF ·{" "}
          <span className="text-gold">No subscription required</span> · Yours forever
        </p>
      </div>
    </form>
  );
}
