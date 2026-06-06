// STYLE add-on validation runner (approved real AI, one synthetic input, one module).
//
// DEFAULT = plan-only, NO network. APPROVED run only with ADDON_VALIDATE_APPROVE=1 + a local
// ANTHROPIC_API_KEY. Exercises the REAL add-on chain end-to-end for STYLE on ONE synthetic chart:
//   buildReportContextForModule -> buildAddonModulePrompt -> real Anthropic -> addon_v1 validation
//   -> renderAddonModuleHtmlSafe -> forbidden-claim + proof-anchor scan -> write HTML to outputs/.
// No Stripe, no customer email, no real customer data. Never prints/commits secrets.
//   ADDON_VALIDATE_APPROVE=1 npm run validate:style-addon

import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { buildReportContextForModule } from "@/lib/report-context/build-report-context";
import { buildAddonArtifact, createAnthropicAddonCall } from "./generate-addon";
import { scanForbiddenClaims, scanUnbackedProofTags } from "./forbidden-claim-scan";

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

const approved =
  process.env.ADDON_VALIDATE_APPROVE === "1" ||
  process.env.ADDON_VALIDATE_APPROVE?.toLowerCase() === "true";
const OUT_DIR = "outputs/style-validation";

// Synthetic, non-customer STYLE chart. birth_time_known=true so ASC is allowed.
function syntheticStyleChart(): any {
  return {
    meta: {
      provider_name: "synthetic",
      birth_time_source: "exact",
      timezone_used: "Europe/London",
    },
    natal: {
      sun: { name: "Sun", sign: "Capricorn" },
      moon: { name: "Moon", sign: "Pisces" },
      planets: [
        { name: "Sun", sign: "Capricorn" },
        { name: "Moon", sign: "Pisces" },
        { name: "Venus", sign: "Aquarius" },
        { name: "Mars", sign: "Scorpio" },
      ],
      houses: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: "Aries", degree: 0 })),
      ascendant: { name: "Ascendant", sign: "Virgo" },
      aspects: [{ a: "Venus", b: "Moon", type: "sextile", is_major: true }],
    },
    numerology: {
      available: true,
      life_path: 4,
      birth_day_number: 1,
      personal_year: 6,
      name_numerology: { available: false },
    },
    bazi: {
      available: true,
      day_master: "Xin",
      elements: { dominant: "Metal", deficient: "Fire" },
    },
    transits: { available: true, aspects: [] },
    solar_return: { available: true },
    moon_phase: { available: true, phase: {} },
    bazi_flow: { available: true },
  };
}

describe("validate:style-addon", () => {
  it.skipIf(approved)("plan-only: prints the STYLE validation plan (no network)", () => {
    const ctx = buildReportContextForModule("STYLE", syntheticStyleChart(), {
      first_name: "Sample",
    });
    // eslint-disable-next-line no-console
    console.log(
      [
        "── validate:style-addon · PLAN-ONLY (no network) ──",
        `  module: STYLE`,
        `  allowed anchors: ${ctx.allowedProofAnchorCandidates.join(", ")}`,
        `  forbidden claims (must not appear): ${ctx.forbiddenClaims.join(", ")}`,
        "  To run the APPROVED validation (uses tokens, synthetic input only):",
        "    ADDON_VALIDATE_APPROVE=1 npm run validate:style-addon",
      ].join("\n"),
    );
    expect(approved).toBe(false);
  });

  it.runIf(approved)(
    "approved: real STYLE generation + schema + safety + proof-anchor validation",
    async () => {
      expect(
        process.env.ANTHROPIC_API_KEY,
        "ANTHROPIC_API_KEY required for approved run",
      ).toBeTruthy();
      const chart = syntheticStyleChart();
      const ctx = buildReportContextForModule("STYLE", chart, { first_name: "Sample" });

      // Real chain: prompt -> Anthropic -> addon_v1 validation -> render. Throws on schema fail.
      const artifact = await buildAddonArtifact("STYLE", chart, {
        call: createAnthropicAddonCall(),
        first_name: "Sample",
        clientName: "Sample Client",
      });

      // Collect all text + proof tags from the validated payload.
      const sections = (artifact.payload as any).sections ?? {};
      const allText = [
        (artifact.payload as any).cover_tagline ?? "",
        ...Object.values(sections).flatMap((s: any) =>
          [
            s.opening_line,
            s.scenario,
            s.prose,
            s.key_insight,
            ...(s.warning_signals ?? []),
            ...(s.protocols ?? []).map((p: any) => `${p.title} ${p.body}`),
          ].filter(Boolean),
        ),
      ].join("\n");
      const proofTags = Object.values(sections).flatMap((s: any) => s.proof_tags ?? []) as string[];

      const violations = scanForbiddenClaims(allText);
      const unbacked = scanUnbackedProofTags(proofTags, ctx.allowedProofAnchorCandidates);

      mkdirSync(OUT_DIR, { recursive: true });
      writeFileSync(`${OUT_DIR}/STYLE.html`, artifact.html);
      writeFileSync(`${OUT_DIR}/STYLE.payload.json`, JSON.stringify(artifact.payload, null, 2));
      const report = {
        module: "STYLE",
        schema_valid: true,
        allowed_anchors: ctx.allowedProofAnchorCandidates,
        proof_tags: proofTags,
        unbacked_proof_tags: unbacked,
        forbidden_violations: violations,
        html_bytes: artifact.html.length,
      };
      writeFileSync(`${OUT_DIR}/STYLE.validation.json`, JSON.stringify(report, null, 2));
      // eslint-disable-next-line no-console
      console.log(
        [
          "── STYLE validation report ──",
          `  schema: VALID`,
          `  html: ${artifact.html.length} bytes -> ${OUT_DIR}/STYLE.html`,
          `  proof tags (${proofTags.length}): ${proofTags.join(" · ")}`,
          `  unbacked proof tags: ${unbacked.length ? unbacked.join(" · ") : "none"}`,
          `  forbidden-claim violations: ${violations.length ? violations.map((v) => `[${v.category}] ${v.match}`).join(" · ") : "none"}`,
        ].join("\n"),
      );

      // Safety gates — fail loud so we STOP before more modules if unsafe.
      expect(violations, `forbidden claims found: ${JSON.stringify(violations)}`).toEqual([]);
      expect(unbacked, `proof tags not backed by the chart: ${JSON.stringify(unbacked)}`).toEqual(
        [],
      );
      expect(artifact.html).not.toContain("Core Architecture");
    },
    180_000,
  );
});
