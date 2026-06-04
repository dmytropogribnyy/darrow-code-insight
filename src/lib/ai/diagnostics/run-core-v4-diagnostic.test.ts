// CORE v4 manual diagnostic CLI runner (B5.2).
//
// Runs under Vitest (the repo's existing TS+Vite runner) because the v4 generator
// and renderer use Vite-only imports (?raw / ?inline). It is NOT a normal unit
// test — it is a manual, env-driven CLI:
//
//   npm run diagnostic:core-v4                      # PLAN-ONLY (default, no AI)
//   CORE_V4_APPROVE_AI=1 npm run diagnostic:core-v4 # real generation (uses tokens)
//   CORE_V4_APPROVE_AI=1 CORE_V4_RENDER=html,pdf npm run diagnostic:core-v4
//
// Env "flags": CORE_V4_APPROVE_AI, CORE_V4_MODEL, CORE_V4_FALLBACK_MODEL,
//   CORE_V4_MODE (sequential|parallel), CORE_V4_OUT_DIR, CORE_V4_RENDER (html,pdf).
//
// Safe by default: no AI, no FreeAstroAPI, no Supabase, no email, no checkout,
// no route. The plan-only path writes nothing. Under `npm test` (no env), the
// real-generation case is skipped and only plan-only assertions run.

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it, expect } from "vitest";

import {
  parseDiagnosticOptionsFromEnv,
  buildPlan,
  assertCanRunAi,
  runCoreV4Validation,
  formatValidationReport,
  buildCoreV4DiagnosticClientSnapshot,
} from "./core-v4-diagnostic";
import { buildCoreV4DiagnosticInput } from "@/lib/ai/fixtures/core-v4-diagnostic-input";
import { generateCoreV4Split } from "@/lib/ai/core-split.server";
import { renderCoreV4HtmlSafe } from "@/lib/pdf/template";

const options = parseDiagnosticOptionsFromEnv(process.env);

describe("CORE v4 manual diagnostic CLI", () => {
  it("prints the run plan", () => {
    // eslint-disable-next-line no-console
    console.log("\n" + buildPlan(options) + "\n");
    expect(options.mode).toMatch(/^(sequential|parallel)$/);
  });

  // Plan-only is the default. When NOT approved, assert nothing was triggered.
  it.skipIf(options.approveAiCall)("plan-only: no AI call, no artifacts written", () => {
    expect(options.planOnly).toBe(true);
    expect(options.approveAiCall).toBe(false);
  });

  // Real generation only runs when explicitly approved (CORE_V4_APPROVE_AI=1).
  // Deferred until the user approves a real run — skipped by default and under CI.
  it.runIf(options.approveAiCall)(
    "approved: generate v4 → validate → write artifacts (+ optional render)",
    async () => {
      assertCanRunAi(options, process.env);

      const input = await buildCoreV4DiagnosticInput();
      const result = await generateCoreV4Split(
        input.userPrompt,
        options.model,
        options.fallbackModel,
        { mode: options.mode },
      );
      const core = result.report?.modules?.CORE;
      expect(core).toBeTruthy();

      const validation = runCoreV4Validation(core);
      // eslint-disable-next-line no-console
      console.log("\n" + formatValidationReport(validation) + "\n");

      mkdirSync(options.outDir, { recursive: true });
      writeFileSync(
        join(options.outDir, "core-v4-diagnostic.raw.json"),
        JSON.stringify(result.report, null, 2),
        "utf8",
      );
      writeFileSync(
        join(options.outDir, "core-v4-diagnostic.report.json"),
        JSON.stringify(core, null, 2),
        "utf8",
      );
      writeFileSync(
        join(options.outDir, "core-v4-diagnostic.validation.json"),
        JSON.stringify(validation, null, 2),
        "utf8",
      );

      if (options.renderHtml || options.renderPdf) {
        const snapshot = buildCoreV4DiagnosticClientSnapshot(input.clientName, core);
        const html = renderCoreV4HtmlSafe(core, input.clientName, snapshot);
        const htmlPath = join(options.outDir, "core-v4-diagnostic.html");
        writeFileSync(htmlPath, html, "utf8");

        if (options.renderPdf) {
          // Reuse the single existing PDF engine (scripts/generate-v4-pdf.mjs)
          // via env in/out overrides — no second PDF engine is created.
          const pdfPath = join(options.outDir, "core-v4-diagnostic.pdf");
          const r = spawnSync("node", ["scripts/generate-v4-pdf.mjs"], {
            stdio: "inherit",
            env: { ...process.env, CORE_V4_PDF_IN: htmlPath, CORE_V4_PDF_OUT: pdfPath },
          });
          expect(r.status).toBe(0);
        }
      }

      expect(validation.schemaPass).toBe(true);
    },
    600_000,
  );
});
