// PLACE-GEO validation runner (approved real FreeAstroAPI + real Anthropic, golden chart).
// DEFAULT plan-only, NO network. PLACE_GEO_VALIDATE_APPROVE=1 npx vitest run src/lib/place-geo/run-place-geo-validation.test.ts

import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { buildPlaceGeoArtifact } from "./generate-place-geo";
import { scanPlaceGeoAcceptance } from "./place-geo-acceptance";
import { createAnthropicAddonCall } from "@/lib/ai/addon-modules/generate-addon";
import { scanForbiddenClaims } from "@/lib/ai/addon-modules/forbidden-claim-scan";
import { scanTechnicalDensity } from "@/lib/ai/technical-density-scan";
import type { NatalInput } from "@/lib/astro/types";

for (const f of [".env.local", ".env"]) {
  if (existsSync(f))
    for (const raw of readFileSync(f, "utf8").split(/\r?\n/)) {
      const t = raw.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i <= 0) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if (/^["'].*["']$/.test(v)) v = v.slice(1, -1);
      if (v && !process.env[k]) process.env[k] = v;
    }
}
const approved = process.env.PLACE_GEO_VALIDATE_APPROVE === "1";
const OUT = "outputs/place-geo-validation";
const PARIS: NatalInput = {
  date_of_birth: "1995-09-05",
  birth_time: "20:00:00",
  birth_time_known: true,
  latitude: 48.8566,
  longitude: 2.3522,
  timezone: "Europe/Paris",
  birth_city: "Paris",
};

describe("validate:place-geo", () => {
  it.skipIf(approved)("plan-only (no network)", () => {
    console.log("── validate:place-geo · PLAN-ONLY — PLACE_GEO_VALIDATE_APPROVE=1 to run");
    expect(approved).toBe(false);
  });

  it.runIf(approved)(
    "golden chart: real ACG + real AI -> schema + acceptance + safety",
    async () => {
      const acgKey = process.env.FREEASTROAPI_KEY!;
      expect(acgKey, "FREEASTROAPI_KEY required").toBeTruthy();
      expect(process.env.ANTHROPIC_API_KEY, "ANTHROPIC_API_KEY required").toBeTruthy();
      mkdirSync(OUT, { recursive: true });

      let art;
      try {
        art = await buildPlaceGeoArtifact(acgKey, PARIS, {
          call: createAnthropicAddonCall(),
          first_name: "Sample",
        });
      } catch (e: any) {
        console.log("SCHEMA ISSUES:", JSON.stringify(e?.issues ?? String(e)).slice(0, 600));
        throw e;
      }
      expect(art, "geo context unusable — ACG calls failed").not.toBeNull();
      writeFileSync(`${OUT}/payload.json`, JSON.stringify(art!.payload, null, 2));
      writeFileSync(`${OUT}/place-geo.html`, art!.html);
      writeFileSync(`${OUT}/context.json`, JSON.stringify(art!.context, null, 2));

      const sections: any = art!.payload.sections;
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
      const words = (allText.match(/\S+/g) ?? []).length;
      const acc = scanPlaceGeoAcceptance(allText, art!.context.cityNames);
      const forbidden = scanForbiddenClaims(allText);
      const density = scanTechnicalDensity(allText);

      console.log(
        `── PLACE-GEO ── words=${words} cities_named=${acc.cityMentions}/${art!.context.cityNames.length} ` +
          `raw_scores=${acc.rawScoreLeaks.length} vague=${acc.vaguePhrases.length} forbidden=${forbidden.length} ` +
          `density_hard=${density.hardViolations.length} html=${art!.html.length}B failed_calls=${art!.context.failedCalls}`,
      );
      if (!acc.ok) console.log("acceptance detail:", JSON.stringify(acc));
      if (density.hardViolations.length)
        console.log("density detail:", JSON.stringify(density.hardViolations.slice(0, 6)));

      expect(acc.cityMentions, "needs >=6 concrete cities").toBeGreaterThanOrEqual(6);
      expect(acc.rawScoreLeaks, "raw score leak").toEqual([]);
      expect(acc.vaguePhrases, "vague geography").toEqual([]);
      expect(forbidden, "forbidden claims").toEqual([]);
      expect(words).toBeGreaterThanOrEqual(1000);
      expect(words).toBeLessThanOrEqual(1900);
    },
    300_000,
  );
});
