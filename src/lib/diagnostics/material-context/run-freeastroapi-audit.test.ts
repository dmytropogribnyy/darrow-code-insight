// DATA-AUDIT-1 — FreeAstroAPI availability + material readiness audit runner.
//
// Runs under Vitest (repo convention). DEFAULT = plan-only, NO network: prints what it
// would test + material categories, then passes. APPROVED run only with explicit flag:
//   FREEASTROAPI_AUDIT_APPROVE=1 ASTRO_PROVIDER=freeastroapi npm run audit:freeastroapi
// Approved run uses SYNTHETIC inputs only (no customer data), writes sanitized summaries
// (booleans/counts — never raw API responses, never secrets) to gitignored outputs/.
// No Anthropic/OpenAI, no Stripe.

import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { AUDIT_CASES } from "./synthetic-cases";
import {
  summarizeAvailability,
  moduleImpact,
  isAuditApproved,
  assertApprovedRunPrereqs,
} from "./availability";
import {
  MATERIAL_CATEGORIES,
  MODULE_PACKS,
  NO_INVENTED_ENRICHMENT_RULE,
  NO_UNSUPPORTED_PUBLIC_CLAIMS_RULE,
} from "./material-readiness";

// Local-only env load (no override; never logs values).
for (const f of [".env.local", ".env"]) {
  if (existsSync(f)) {
    for (const raw of readFileSync(f, "utf8").split(/\r?\n/)) {
      const t = raw.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i <= 0) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
        v = v.slice(1, -1);
      if (v && (process.env[k] === undefined || process.env[k] === "")) process.env[k] = v;
    }
  }
}

const approved = isAuditApproved(process.env);
const OUT_DIR = "outputs/freeastroapi-audit";

describe("audit:freeastroapi", () => {
  it.skipIf(approved)("plan-only: prints test plan + material categories (no network)", () => {
    const lines = [
      "── audit:freeastroapi · PLAN-ONLY (no network) ──────────────",
      `  synthetic cases: ${AUDIT_CASES.map((c) => c.id).join(", ")}`,
      ...AUDIT_CASES.map((c) => `    ${c.id}: ${c.label}`),
      "  endpoints it would probe: natal(critical), transits, bazi, solar_return, moon_phase, bazi_flow",
      `  material categories audited: ${MATERIAL_CATEGORIES.length}`,
      ...MATERIAL_CATEGORIES.map((c) => `    [${c.status}] ${c.label} ← ${c.source}`),
      "  module packs: " + MODULE_PACKS.map((p) => p.module).join(", "),
      "  RULES:",
      `    - ${NO_INVENTED_ENRICHMENT_RULE}`,
      `    - ${NO_UNSUPPORTED_PUBLIC_CLAIMS_RULE}`,
      "  To run an APPROVED audit (uses FreeAstroAPI quota, synthetic inputs only):",
      "    FREEASTROAPI_AUDIT_APPROVE=1 ASTRO_PROVIDER=freeastroapi npm run audit:freeastroapi",
    ];
    // eslint-disable-next-line no-console
    console.log(lines.join("\n"));
    expect(approved).toBe(false);
  });

  it.runIf(approved)(
    "approved: probe FreeAstroAPI with synthetic inputs and write sanitized report",
    async () => {
      // Fails clearly BEFORE any network call if prerequisites are missing.
      assertApprovedRunPrereqs(process.env);
      const { getAstroProvider } = await import("@/lib/astro/provider");
      const provider = await getAstroProvider();

      const report: any[] = [];
      for (const c of AUDIT_CASES) {
        let summary: any;
        let error: string | null = null;
        try {
          const chart = await provider.computeNatal(c.input);
          summary = summarizeAvailability(chart);
        } catch (e: any) {
          error = String(e?.message ?? e);
        }
        report.push({
          case: c.id,
          label: c.label,
          // synthetic, non-customer inputs (safe to record)
          input: {
            birth_time_known: c.input.birth_time_known,
            has_full_name: !!c.input.full_name_for_numerology,
            bazi_sex: c.input.bazi_sex ?? null,
            timezone: c.input.timezone,
          },
          error,
          availability: summary ?? null,
          module_impact: summary ? moduleImpact(summary) : null,
        });
      }

      mkdirSync(OUT_DIR, { recursive: true });
      writeFileSync(`${OUT_DIR}/availability-report.json`, JSON.stringify(report, null, 2));
      writeFileSync(
        `${OUT_DIR}/sanitized-field-matrix.json`,
        JSON.stringify(
          report.map((r) => ({ case: r.case, availability: r.availability })),
          null,
          2,
        ),
      );
      writeFileSync(
        `${OUT_DIR}/availability-summary.md`,
        [
          "# FreeAstroAPI availability summary (synthetic inputs)",
          "",
          ...report.map((r) =>
            [
              `## Case ${r.case} — ${r.label}`,
              r.error ? `- ERROR: ${r.error}` : "",
              r.availability
                ? `- bazi.available=${r.availability.bazi.available} · houses=${r.availability.natal.houses_count} · transits=${r.availability.transits.available} · solar=${r.availability.solar_return.available} · bazi_flow=${r.availability.bazi_flow.available}`
                : "",
            ]
              .filter(Boolean)
              .join("\n"),
          ),
        ].join("\n\n"),
      );
      writeFileSync(
        `${OUT_DIR}/module-impact-summary.md`,
        [
          "# Per-module impact (synthetic inputs)",
          ...report
            .filter((r) => r.module_impact)
            .map((r) =>
              [
                `## Case ${r.case}`,
                ...r.module_impact.map(
                  (m: any) =>
                    `- ${m.module}: blocked=[${m.blocked.join(", ")}] degraded=[${m.degraded.join(", ")}]`,
                ),
              ].join("\n"),
            ),
        ].join("\n\n"),
      );

      // eslint-disable-next-line no-console
      console.log(`[audit:freeastroapi] wrote sanitized report to ${OUT_DIR}/`);
      expect(report.length).toBe(AUDIT_CASES.length);
    },
    120_000,
  );
});
