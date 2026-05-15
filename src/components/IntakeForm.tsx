import { useState } from "react";
import { toast } from "sonner";

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
    // Stripe checkout wired in PROMPT 1B.
    toast.info("Checkout will be wired up in the next step.");
    setSubmitting(false);
  };

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
        <label className={labelCls}>City of birth</label>
        <input
          className={inputCls}
          value={form.birth_city}
          onChange={update("birth_city")}
          placeholder="City of birth, e.g. Bratislava, Slovakia"
          required
        />
        <p className="mt-1 text-[10px] text-muted-grey">
          Used only to calculate your birth chart timezone and coordinates.
        </p>
      </div>

      <div>
        <label className={labelCls + " opacity-70"}>Full name <span className="normal-case tracking-normal text-muted-grey">— optional</span></label>
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
          <span>Generate my CORE Report</span>
          <span
            className="bg-navy text-gold font-mono text-[12px] px-2 py-1 rounded"
          >
            $4.99
          </span>
        </button>
        <p className="mt-3 text-[11px] text-muted-grey">
          Start instantly · Usually 60–90 seconds · Multi-page PDF ·{" "}
          <span className="text-gold">No subscription required</span> · Yours forever
        </p>
      </div>
    </form>
  );
}
