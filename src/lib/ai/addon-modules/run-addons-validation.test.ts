// All-add-ons validation runner (approved real AI, one synthetic input, all six modules).
//
// DEFAULT = plan-only, NO network. APPROVED run only with ADDON_VALIDATE_APPROVE=1 + a local
// ANTHROPIC_API_KEY. For EACH module (LOVE/MONEY/BODY/YEAR/STYLE/PLACE) it exercises the real
// chain (context -> prompt -> Anthropic -> addon_v1 schema -> render), scans the output for
// forbidden claims + unbacked proof tags, and writes artifacts to gitignored outputs/. Each
// module is its own test → per-module pass/fail. No Stripe/email/customer data; secrets local only.
//   ADDON_VALIDATE_APPROVE=1 npm run validate:addons

import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { MODULE_CODES, type ModuleCode } from "@/lib/modules";
import { buildReportContextForModule } from "@/lib/report-context/build-report-context";
import { buildAddonModulePrompt } from "./addon-prompt";
import { addonModuleSchema } from "./addon-schema";
import { createAnthropicAddonCall } from "./generate-addon";
import { renderAddonModuleHtmlSafe } from "@/lib/pdf/addon-template";
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
const MODEL = "claude-sonnet-4-6";
const OUT_DIR = "outputs/addons-validation";

// One synthetic, non-customer chart with full data so every module has its anchors.
function syntheticFullChart(): any {
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
        { name: "Mercury", sign: "Sagittarius" },
        { name: "Venus", sign: "Aquarius" },
        { name: "Mars", sign: "Scorpio" },
        { name: "Jupiter", sign: "Taurus" },
        { name: "Saturn", sign: "Virgo" },
        { name: "Pluto", sign: "Scorpio" },
      ],
      houses: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: "Aries", degree: 0 })),
      ascendant: { name: "Ascendant", sign: "Virgo" },
      midheaven: { name: "Midheaven", sign: "Gemini" },
      aspects: [
        { a: "Venus", b: "Moon", type: "sextile", is_major: true },
        { a: "Mars", b: "Saturn", type: "trine", is_major: true },
        { a: "Jupiter", b: "Saturn", type: "opposition", is_major: true },
        { a: "Saturn", b: "Sun", type: "square", is_major: true },
      ],
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
    transits: {
      available: true,
      aspects: [{ a: "Saturn", b: "Sun", type: "square", high_priority: true }],
    },
    solar_return: { available: true },
    moon_phase: { available: true, phase: {}, zodiac: {}, forecast: {} },
    bazi_flow: { available: true, usable: true },
  };
}

function collect(payload: any): { text: string; proofTags: string[] } {
  const sections = payload.sections ?? {};
  const text = [
    payload.cover_tagline ?? "",
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
  return { text, proofTags };
}

describe("validate:addons (all six modules)", () => {
  it.skipIf(approved)("plan-only: lists the modules it would validate (no network)", () => {
    console.log(
      "── validate:addons · PLAN-ONLY ──\n  modules: " +
        MODULE_CODES.join(", ") +
        "\n  ADDON_VALIDATE_APPROVE=1 npm run validate:addons",
    );
    expect(approved).toBe(false);
  });

  for (const module of MODULE_CODES as ModuleCode[]) {
    it.runIf(approved)(
      `${module}: real generation -> schema + safety + proof anchors`,
      async () => {
        expect(process.env.ANTHROPIC_API_KEY, "ANTHROPIC_API_KEY required").toBeTruthy();
        mkdirSync(OUT_DIR, { recursive: true });
        const chart = syntheticFullChart();
        const ctx = buildReportContextForModule(module, chart, { first_name: "Sample" });
        const prompt = buildAddonModulePrompt(module, ctx, { first_name: "Sample" });
        const raw = await createAnthropicAddonCall()({ userPrompt: prompt, model: MODEL });
        writeFileSync(`${OUT_DIR}/${module}.raw.json`, JSON.stringify(raw, null, 2));

        const parsed = addonModuleSchema(module).safeParse(raw);
        if (!parsed.success) {
          const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
          writeFileSync(`${OUT_DIR}/${module}.schema-issues.json`, JSON.stringify(issues, null, 2));

          console.log(`── ${module}: SCHEMA FAILED ──\n  ` + issues.join("\n  "));
        }
        expect(parsed.success, `${module} schema invalid — see outputs/`).toBe(true);
        if (!parsed.success) return;

        const html = renderAddonModuleHtmlSafe(module, parsed.data, "Sample Client");
        const { text, proofTags } = collect(parsed.data);
        const violations = scanForbiddenClaims(text);
        const unbacked = scanUnbackedProofTags(proofTags, ctx.allowedProofAnchorCandidates);

        writeFileSync(`${OUT_DIR}/${module}.html`, html);
        writeFileSync(`${OUT_DIR}/${module}.payload.json`, JSON.stringify(parsed.data, null, 2));
        writeFileSync(
          `${OUT_DIR}/${module}.validation.json`,
          JSON.stringify(
            {
              module,
              schema_valid: true,
              proof_tags: proofTags,
              unbacked_proof_tags: unbacked,
              forbidden_violations: violations,
              html_bytes: html.length,
            },
            null,
            2,
          ),
        );

        console.log(
          `── ${module} ── schema=VALID html=${html.length}B proof_tags=${proofTags.length} unbacked=${unbacked.length ? unbacked.join(",") : "none"} forbidden=${violations.length ? violations.map((v) => `[${v.category}]${v.match}`).join(",") : "none"}`,
        );

        expect(violations, `${module} forbidden claims: ${JSON.stringify(violations)}`).toEqual([]);
        expect(unbacked, `${module} unbacked proof tags: ${JSON.stringify(unbacked)}`).toEqual([]);
        expect(html).not.toContain("Core Architecture");
      },
      150_000,
    );
  }
});
