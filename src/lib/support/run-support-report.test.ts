// Report recovery support CLI (read-only).
//
// Runs under Vitest (repo convention; no new dep). Env-driven "flags". Read-only:
// it only SELECTs from Supabase and prints a support summary + recommended action.
// No writes, no AI, no Stripe, no email. Needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
// (from .env.local / hosting env).
//
//   npm run support:report                       # usage (no query)
//   SUPPORT_FIND=DC-20260605-0001 npm run support:report
//   SUPPORT_EMAIL=customer@example.com npm run support:report
//   SUPPORT_STRIPE=cs_or_pi_id npm run support:report

import { existsSync, readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { formatSupportSummary } from "./report-support";
import { fetchSupportFacts } from "./report-support.server";

// Minimal local .env loader (does not override shell; never logs values).
function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    if (v && (process.env[k] === undefined || process.env[k] === "")) process.env[k] = v;
  }
}
for (const f of [".env.local", ".env"]) loadEnvFile(f);

const query = {
  ref: process.env.SUPPORT_FIND?.trim(),
  email: process.env.SUPPORT_EMAIL?.trim(),
  stripe: process.env.SUPPORT_STRIPE?.trim(),
};
const hasQuery = !!(query.ref || query.email || query.stripe);

describe("support:report — read-only report recovery summary", () => {
  it.skipIf(hasQuery)("prints usage when no query is provided", () => {
    // eslint-disable-next-line no-console
    console.log(
      [
        "── support:report ─ usage ───────────────────────────────",
        "  SUPPORT_FIND=DC-YYYYMMDD-####   npm run support:report   (by report reference)",
        "  SUPPORT_EMAIL=<email>           npm run support:report   (all reports for a customer)",
        "  SUPPORT_STRIPE=<session/pi id>  npm run support:report   (reports for a Stripe order)",
        "  Read-only. Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.",
      ].join("\n"),
    );
    expect(hasQuery).toBe(false);
  });

  it.runIf(hasQuery)(
    "looks up report(s) and prints support summary + recommended action",
    async () => {
      const facts = await fetchSupportFacts(query);
      if (facts.length === 0) {
        // eslint-disable-next-line no-console
        console.log("No reports found for", query);
      }
      for (const f of facts) {
        // eslint-disable-next-line no-console
        console.log("\n" + formatSupportSummary(f) + "\n");
      }
      expect(Array.isArray(facts)).toBe(true);
    },
    60_000,
  );
});
