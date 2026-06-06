// CONTINUUM validation runner (approved real AI, synthetic input, 7d + 30d).
//
// DEFAULT plan-only, NO network. APPROVED only with CONTINUUM_VALIDATE_APPROVE=1 + local
// ANTHROPIC_API_KEY. For each type: context -> prompt -> real Anthropic -> continuum_v1 schema
// -> render -> forbidden-claim + proof-anchor + period checks -> artifacts in gitignored outputs/.
// No Stripe/email/customer data. Secrets local only.  CONTINUUM_VALIDATE_APPROVE=1 npm run validate:continuum

import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { buildContinuumContext } from "./continuum-context";
import { buildContinuumPrompt } from "./continuum-prompt";
import { continuumSchema } from "./continuum-schema";
import { createAnthropicContinuumCall } from "./generate-continuum";
import { renderContinuumHtmlSafe } from "./continuum-template";
import { CONTINUUM_TYPES, type ContinuumType } from "./continuum-config";
import {
  scanForbiddenClaims,
  scanUnbackedProofTags,
} from "@/lib/ai/addon-modules/forbidden-claim-scan";

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
  process.env.CONTINUUM_VALIDATE_APPROVE === "1" ||
  process.env.CONTINUUM_VALIDATE_APPROVE?.toLowerCase() === "true";
const MODEL = "claude-sonnet-4-6";
const OUT_DIR = "outputs/continuum-validation";
const GEN_AT = new Date("2026-06-06T12:00:00Z");

function syntheticChart(): any {
  return {
    meta: { provider_name: "synthetic", birth_time_source: "exact" },
    natal: {
      sun: { name: "Sun", sign: "Capricorn" },
      moon: { name: "Moon", sign: "Pisces" },
      planets: [
        { name: "Sun", sign: "Capricorn" },
        { name: "Moon", sign: "Pisces" },
        { name: "Saturn", sign: "Virgo" },
      ],
      houses: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: "Aries" })),
      ascendant: { name: "Ascendant", sign: "Virgo" },
      aspects: [{ a: "Saturn", b: "Sun", type: "square", is_major: true }],
    },
    numerology: { available: true, personal_year: 6, name_numerology: { available: false } },
    bazi: { available: true, day_master: "Xin", elements: { dominant: "Metal" } },
    transits: { available: true, aspects: [{ a: "Saturn", b: "Sun", high_priority: true }] },
    solar_return: { available: true },
    moon_phase: { available: true, phase: {}, zodiac: {}, forecast: {} },
    bazi_flow: { available: true, usable: true },
  };
}

// Continuum-specific guards beyond the shared deny-list.
function scanTimingViolations(text: string): string[] {
  const out: string[] = [];
  const re =
    /\b(guaranteed|will definitely|certain to happen|this will happen|destined to|fated to)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.push(m[0]);
  if (/\bthis week\b|\bthis calendar (week|month)\b/i.test(text))
    out.push("calendar week/month framing");
  return out;
}

describe("validate:continuum", () => {
  it.skipIf(approved)("plan-only (no network)", () => {
    console.log(
      "── validate:continuum · PLAN-ONLY ──\n  types: " +
        CONTINUUM_TYPES.join(", ") +
        "\n  CONTINUUM_VALIDATE_APPROVE=1 npm run validate:continuum",
    );
    expect(approved).toBe(false);
  });

  for (const type of CONTINUUM_TYPES as ContinuumType[]) {
    it.runIf(approved)(
      `${type}: real generation -> schema + period + safety`,
      async () => {
        expect(process.env.ANTHROPIC_API_KEY, "ANTHROPIC_API_KEY required").toBeTruthy();
        mkdirSync(OUT_DIR, { recursive: true });
        const ctx = buildContinuumContext(type, syntheticChart(), {
          generatedAt: GEN_AT,
          first_name: "Sample",
        });
        const prompt = buildContinuumPrompt(ctx, { first_name: "Sample" });
        const raw = await createAnthropicContinuumCall(type)({ userPrompt: prompt, model: MODEL });
        writeFileSync(`${OUT_DIR}/${type}.raw.json`, JSON.stringify(raw, null, 2));

        const parsed = continuumSchema(type).safeParse(raw);
        if (!parsed.success) {
          writeFileSync(
            `${OUT_DIR}/${type}.schema-issues.json`,
            JSON.stringify(
              parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
              null,
              2,
            ),
          );
        }
        expect(parsed.success, `${type} schema invalid — see outputs/`).toBe(true);
        if (!parsed.success) return;

        const html = renderContinuumHtmlSafe(type, parsed.data, ctx.period, "Sample Client");
        const sections = (parsed.data as any).sections;
        const allText = Object.values(sections)
          .flatMap((s: any) =>
            [
              s.opening_line,
              s.scenario,
              s.prose,
              s.key_insight,
              ...(s.warning_signals ?? []),
              ...(s.protocols ?? []).map((p: any) => `${p.title} ${p.body}`),
            ].filter(Boolean),
          )
          .join("\n");
        const proofTags = Object.values(sections).flatMap(
          (s: any) => s.proof_tags ?? [],
        ) as string[];
        const forbidden = [
          ...scanForbiddenClaims(allText),
          ...scanTimingViolations(allText).map((m) => ({ category: "timing", match: m })),
        ];
        const unbacked = scanUnbackedProofTags(proofTags, ctx.allowedProofAnchorCandidates);

        writeFileSync(`${OUT_DIR}/${type}.html`, html);
        writeFileSync(`${OUT_DIR}/${type}.payload.json`, JSON.stringify(parsed.data, null, 2));
        const periodOk =
          html.includes(ctx.period.generated_label) && html.includes(ctx.period.covers_label);

        console.log(
          `── CONTINUUM ${type} ── schema=VALID html=${html.length}B period=${periodOk ? "ok" : "MISSING"} proof_tags=${proofTags.length} unbacked=${unbacked.length ? unbacked.join(",") : "none"} forbidden=${forbidden.length ? forbidden.map((v) => `[${v.category}]${v.match}`).join(",") : "none"} covers="${ctx.period.covers_label}"`,
        );

        expect(forbidden, `${type} forbidden: ${JSON.stringify(forbidden)}`).toEqual([]);
        expect(unbacked, `${type} unbacked: ${JSON.stringify(unbacked)}`).toEqual([]);
        expect(periodOk, `${type} period labels missing from PDF`).toBe(true);
        expect(html).not.toContain("Core Architecture");
      },
      180_000,
    );
  }
});
