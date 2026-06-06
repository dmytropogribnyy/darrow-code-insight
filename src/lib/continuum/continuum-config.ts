// CONTINUUM — standalone timing products (config + rolling-period logic). Pure.
//
// CONTINUUM · Next 7 Days ($1.99) and CONTINUUM · Next 30 Days ($3.99) are SEPARATE one-time
// products — NOT subscriptions, NOT chapters, NOT part of CORE Complete, NOT bundled together,
// no 7d+30d discount. Rolling period from generation time (not calendar week/month).
// Feature-gated: CONTINUUM_ENABLED=false by default. No live CTA until validated + approved.

export type ContinuumType = "7d" | "30d";
export const CONTINUUM_TYPES: ContinuumType[] = ["7d", "30d"];

export interface ContinuumProduct {
  type: ContinuumType;
  code: "CONTINUUM_7D" | "CONTINUUM_30D";
  label: string;
  short: string;
  price_cents: number;
  days: number;
  price_id: string; // Stripe lookup key / config-driven
  description: string;
}

// Config-driven. Prices: 7d $1.99, 30d $3.99. Do NOT bundle; do NOT add to CORE Complete.
export const CONTINUUM_PRODUCTS: Record<ContinuumType, ContinuumProduct> = {
  "7d": {
    type: "7d",
    code: "CONTINUUM_7D",
    label: "CONTINUUM · Next 7 Days",
    short: "Next 7 Days",
    price_cents: 199,
    days: 7,
    price_id: "continuum_7d_199",
    description:
      "A focused AI astrology timing horoscope for the next 7 days — pressure, green zones, focus, recovery and practical guidance.",
  },
  "30d": {
    type: "30d",
    code: "CONTINUUM_30D",
    label: "CONTINUUM · Next 30 Days",
    short: "Next 30 Days",
    price_cents: 399,
    days: 30,
    price_id: "continuum_30d_399",
    description:
      "A deeper AI astrology monthly orientation brief for your next 30 days — timing windows, focus themes, recovery rhythm and practical protocols.",
  },
};

// Feature flag — default OFF. No public Continuum CTA/purchase until enabled (after validation).
export function continuumEnabled(env: Record<string, string | undefined> = process.env): boolean {
  const v = env.CONTINUUM_ENABLED;
  return v === "1" || v?.toLowerCase() === "true";
}

export interface ContinuumPeriod {
  period_type: ContinuumType;
  generated_at: string; // ISO
  period_start: string; // ISO date (= generated date)
  period_end: string; // ISO date (= generated date + days)
  generated_label: string; // "June 6, 2026"
  covers_label: string; // "Covers: June 6–June 13, 2026"
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function fmtDate(d: Date): string {
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

// Rolling period from the generation moment. NOT a calendar week/month.
export function computeContinuumPeriod(generatedAt: Date, type: ContinuumType): ContinuumPeriod {
  const days = CONTINUUM_PRODUCTS[type].days;
  const start = new Date(
    Date.UTC(generatedAt.getUTCFullYear(), generatedAt.getUTCMonth(), generatedAt.getUTCDate()),
  );
  const end = new Date(start.getTime());
  end.setUTCDate(end.getUTCDate() + days);

  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const startLabel = sameYear
    ? `${MONTHS[start.getUTCMonth()]} ${start.getUTCDate()}`
    : fmtDate(start);
  const covers = `Covers: ${startLabel}–${fmtDate(end)}`;

  return {
    period_type: type,
    generated_at: generatedAt.toISOString(),
    period_start: start.toISOString().slice(0, 10),
    period_end: end.toISOString().slice(0, 10),
    generated_label: `Generated: ${fmtDate(generatedAt)}`,
    covers_label: covers,
  };
}
