// BUNDLE-B orchestrator tests — all deps mocked (no real AI/Stripe/Supabase/PDF/email).

import { describe, it, expect, vi } from "vitest";
import { type ModuleCode } from "@/lib/modules";
import { ADDON_SECTION_KEYS } from "@/lib/ai/addon-modules/addon-schema";
import { orchestrateReports, deliveryMode, type OrchestratorDeps } from "./orchestrate-reports";
import type { ReportModule } from "./bundle-reports";

function fullChart(): any {
  return {
    meta: { birth_time_source: "exact" },
    natal: {
      sun: { sign: "Aries" },
      moon: { sign: "Cancer" },
      planets: [
        { name: "Venus", sign: "Taurus" },
        { name: "Mars", sign: "Leo" },
        { name: "Saturn", sign: "Capricorn" },
        { name: "Jupiter", sign: "Gemini" },
        { name: "Pluto", sign: "Scorpio" },
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

function validPayload(module: ModuleCode) {
  const sections = Object.fromEntries(
    ADDON_SECTION_KEYS[module].map((k) => [k, { prose: `${k} for ${module}` }]),
  );
  return { schema_version: "addon_v1", module_code: module, cover_tagline: `${module}`, sections };
}

function deps(over: Partial<OrchestratorDeps> = {}): OrchestratorDeps {
  let seq = 0;
  return {
    call: vi.fn(async ({ userPrompt }: any) => {
      const m = /DARROW CODE — (\w+) FOCUSED/.exec(userPrompt)?.[1] as ModuleCode;
      return validPayload(m);
    }),
    buildCoreArtifact: vi.fn(async () => ({
      html: "<!doctype html><html><body>CORE Architecture: The Monolith</body></html>",
    })),
    renderPdf: vi.fn(async () => new Uint8Array([1, 2, 3, 4])),
    persistReport: vi.fn(async ({ module }) => ({
      report_ref:
        module === "CORE"
          ? `DC-20260606-${String(++seq).padStart(4, "0")}`
          : `DC-20260606-${String(++seq).padStart(4, "0")}-${module}`,
      download_token: `tok_${module}`,
    })),
    ...over,
  };
}

describe("deliveryMode (flag default OFF)", () => {
  it("OFF -> combined (legacy), ON -> separate", () => {
    expect(deliveryMode({})).toBe("combined");
    expect(deliveryMode({ BUNDLE_SEPARATE_REPORTS: "1" })).toBe("separate");
  });
});

describe("orchestrateReports", () => {
  it("CORE only -> one complete CORE unit (no module suffix)", async () => {
    const d = deps();
    const res = await orchestrateReports(["CORE"], fullChart(), { first_name: "Alex" }, d);
    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({
      module: "CORE",
      status: "complete",
      download_token: "tok_CORE",
    });
    expect(res[0].report_ref).toMatch(/^DC-\d{8}-\d{4}$/);
    expect(d.buildCoreArtifact).toHaveBeenCalledTimes(1);
  });

  it("one add-on only -> one complete unit with module-suffixed ref", async () => {
    const res = await orchestrateReports(["LOVE"], fullChart(), { first_name: "Alex" }, deps());
    expect(res).toHaveLength(1);
    expect(res[0].status).toBe("complete");
    expect(res[0].report_ref).toMatch(/DC-\d{8}-\d{4}-LOVE/);
  });

  it("CORE Complete (CORE + all 6) -> 7 complete units, CORE first", async () => {
    const all: ReportModule[] = ["LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE", "CORE"];
    const d = deps();
    const res = await orchestrateReports(all, fullChart(), { first_name: "Alex" }, d);
    expect(res.map((r) => r.module)).toEqual([
      "CORE",
      "LOVE",
      "MONEY",
      "BODY",
      "YEAR",
      "STYLE",
      "PLACE",
    ]);
    expect(res.every((r) => r.status === "complete")).toBe(true);
    expect(d.persistReport).toHaveBeenCalledTimes(7);
  });

  it("partial failure: one module fails, others still complete", async () => {
    const d = deps({
      call: vi.fn(async ({ userPrompt }: any) => {
        const m = /DARROW CODE — (\w+) FOCUSED/.exec(userPrompt)?.[1] as ModuleCode;
        if (m === "MONEY") throw new Error("model boom");
        return validPayload(m);
      }),
    });
    const res = await orchestrateReports(["CORE", "LOVE", "MONEY"], fullChart(), {}, d);
    const by = Object.fromEntries(res.map((r) => [r.module, r.status]));
    expect(by.CORE).toBe("complete");
    expect(by.LOVE).toBe("complete");
    expect(by.MONEY).toBe("failed_generation");
    expect(d.persistReport).toHaveBeenCalledTimes(2); // failed module not persisted
  });

  it("idempotent retry: a complete module is skipped, not re-rendered/persisted", async () => {
    const d = deps({
      loadExisting: vi.fn(async (m) =>
        m === "LOVE"
          ? {
              status: "complete",
              report_ref: "DC-20260606-0001-LOVE",
              download_token: "tok_LOVE_old",
            }
          : null,
      ),
    });
    const res = await orchestrateReports(["LOVE", "MONEY"], fullChart(), {}, d);
    const by = Object.fromEntries(res.map((r) => [r.module, r]));
    expect(by.LOVE.status).toBe("skipped_existing");
    expect(by.LOVE.download_token).toBe("tok_LOVE_old");
    expect(by.MONEY.status).toBe("complete");
    expect(d.persistReport).toHaveBeenCalledTimes(1); // only MONEY persisted
    expect(d.renderPdf).toHaveBeenCalledTimes(1); // LOVE not re-rendered
  });

  it("empty PDF -> failed_generation", async () => {
    const d = deps({ renderPdf: vi.fn(async () => new Uint8Array([])) });
    const res = await orchestrateReports(["STYLE"], fullChart(), {}, d);
    expect(res[0].status).toBe("failed_generation");
    expect(res[0].error).toMatch(/empty PDF/);
  });
});
