// BUNDLE-B separate-pipeline tests — injected hooks/deps (no real AI/Stripe/Supabase/PDF/email).

import { describe, it, expect, vi } from "vitest";
import { type ModuleCode } from "@/lib/modules";
import { ADDON_SECTION_KEYS } from "@/lib/ai/addon-modules/addon-schema";
import { separateReportsEnabled, type ReportModule } from "./bundle-reports";
import {
  summarizeOrderOutcome,
  runSeparateReportsPipeline,
  type SeparatePipelineHooks,
} from "./separate-reports-pipeline.server";
import type { ModuleReportResult, OrchestratorDeps } from "./orchestrate-reports";

const R = (module: ReportModule, status: ModuleReportResult["status"]): ModuleReportResult => ({
  module,
  status,
});

describe("summarizeOrderOutcome", () => {
  it("all complete -> order/job complete", () => {
    const o = summarizeOrderOutcome([R("CORE", "complete"), R("LOVE", "complete")]);
    expect(o).toMatchObject({
      order_status: "complete",
      job_status: "complete",
      allComplete: true,
      failed: 0,
    });
  });
  it("partial failure -> failed_generation/failed (not complete)", () => {
    const o = summarizeOrderOutcome([R("CORE", "complete"), R("LOVE", "failed_generation")]);
    expect(o.order_status).toBe("failed_generation");
    expect(o.job_status).toBe("failed");
    expect(o.allComplete).toBe(false);
    expect(o.delivered).toBe(1);
    expect(o.failed).toBe(1);
  });
  it("already-complete (skipped) counts as delivered -> complete", () => {
    const o = summarizeOrderOutcome([R("CORE", "skipped_existing"), R("LOVE", "complete")]);
    expect(o.order_status).toBe("complete");
    expect(o.delivered).toBe(2);
  });
  it("all failed -> failed", () => {
    const o = summarizeOrderOutcome([R("LOVE", "failed_generation")]);
    expect(o.order_status).toBe("failed_generation");
  });
  it("empty -> not complete", () => {
    expect(summarizeOrderOutcome([]).allComplete).toBe(false);
  });
});

// ── injected-hooks path ──
function fullChart(): any {
  return {
    meta: { birth_time_source: "exact" },
    natal: {
      sun: { sign: "Aries" },
      moon: { sign: "Cancer" },
      planets: [
        { name: "Venus", sign: "Taurus" },
        { name: "Mars", sign: "Leo" },
      ],
      houses: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: "Aries" })),
      ascendant: { sign: "Leo" },
      aspects: [],
    },
    numerology: {
      available: true,
      life_path: 7,
      personal_year: 5,
      name_numerology: { available: true },
    },
    bazi: { available: true, day_master: "Gui", elements: { dominant: "Water" } },
    transits: { available: true },
    solar_return: { available: true },
    moon_phase: { available: true, phase: {} },
    bazi_flow: { available: true },
  };
}
function validPayload(m: ModuleCode) {
  return {
    schema_version: "addon_v1",
    module_code: m,
    cover_tagline: m,
    sections: Object.fromEntries(ADDON_SECTION_KEYS[m].map((k) => [k, { prose: `${k} ${m}` }])),
  };
}
function mockDeps(): OrchestratorDeps {
  let seq = 0;
  return {
    call: vi.fn(async ({ userPrompt }: any) =>
      validPayload(
        /FOCUSED CHAPTER/.exec(userPrompt)
          ? (/— (\w+) FOCUSED/.exec(userPrompt)![1] as ModuleCode)
          : "LOVE",
      ),
    ),
    buildCoreArtifact: vi.fn(async () => ({
      html: "<!doctype html><html><body>CORE</body></html>",
    })),
    renderPdf: vi.fn(async () => new Uint8Array([1, 2, 3, 4])),
    persistReport: vi.fn(async ({ module }) => ({
      report_ref: `DC-x-${String(++seq)}-${module}`,
      download_token: `tok_${module}`,
    })),
  };
}

describe("runSeparateReportsPipeline (injected hooks)", () => {
  it("orchestrates all modules and finalizes with the computed outcome", async () => {
    const deps = mockDeps();
    const finalize = vi.fn(async () => {});
    const hooks: SeparatePipelineHooks = {
      loadContext: vi.fn(async () => ({
        modules: ["CORE", "LOVE", "MONEY"] as ReportModule[],
        chart: fullChart(),
        first_name: "Alex",
      })),
      buildDeps: () => deps,
      finalize,
    };
    const { results, outcome } = await runSeparateReportsPipeline("ord_1", hooks);
    expect(results.map((r) => r.module)).toEqual(["CORE", "LOVE", "MONEY"]);
    expect(outcome.order_status).toBe("complete");
    expect(deps.persistReport).toHaveBeenCalledTimes(3); // one row per module
    expect(finalize).toHaveBeenCalledWith("ord_1", results, outcome);
  });

  it("propagates partial failure into a non-complete outcome", async () => {
    const deps = mockDeps();
    (deps.renderPdf as any) = vi.fn(async (_html: string, meta: any) =>
      meta.module === "MONEY" ? new Uint8Array([]) : new Uint8Array([1, 2, 3, 4]),
    );
    const finalize = vi.fn(async () => {});
    const hooks: SeparatePipelineHooks = {
      loadContext: async () => ({
        modules: ["LOVE", "MONEY"] as ReportModule[],
        chart: fullChart(),
        first_name: "A",
      }),
      buildDeps: () => deps,
      finalize,
    };
    const { outcome } = await runSeparateReportsPipeline("ord_2", hooks);
    expect(outcome.order_status).toBe("failed_generation");
    expect(outcome.failed).toBe(1);
  });
});

describe("flag gate (default OFF preserves legacy)", () => {
  it("separateReportsEnabled is false by default, true only when set", () => {
    expect(separateReportsEnabled({})).toBe(false);
    expect(separateReportsEnabled({ BUNDLE_SEPARATE_REPORTS: "1" })).toBe(true);
  });
});
