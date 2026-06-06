// PHASE 5 — Continuum generation orchestrator tests (mocked hooks; no AI/Stripe/Supabase/PDF/email).

import { describe, it, expect, vi } from "vitest";
import { runContinuumGeneration, type ContinuumHooks } from "./continuum-pipeline.server";
import { computeContinuumPeriod } from "./continuum-config";

function hooks(over: Partial<ContinuumHooks> = {}): ContinuumHooks {
  return {
    loadContext: vi.fn(async () => ({
      type: "7d" as const,
      chart: {} as any,
      first_name: "Alex",
      generatedAt: new Date("2026-06-06T12:00:00Z"),
    })),
    generateArtifact: vi.fn(async (ctx) => ({
      type: ctx.type,
      payload: {
        schema_version: "continuum_v1",
        continuum_type: ctx.type,
        cover_tagline: "x",
        sections: {},
      } as any,
      html: "<!doctype html><html><body>continuum</body></html>",
      period: computeContinuumPeriod(ctx.generatedAt, ctx.type),
    })),
    renderPdf: vi.fn(async () => new Uint8Array([1, 2, 3, 4])),
    persistReport: vi.fn(async () => ({ report_ref: "DC-20260606-0001", download_token: "tok_c" })),
    finalize: vi.fn(async () => {}),
    ...over,
  };
}

describe("runContinuumGeneration", () => {
  it("happy path -> complete; persists + finalizes", async () => {
    const h = hooks();
    const res = await runContinuumGeneration("ord_1", h);
    expect(res).toMatchObject({
      status: "complete",
      report_ref: "DC-20260606-0001",
      download_token: "tok_c",
      pdf_bytes: 4,
    });
    expect(h.persistReport).toHaveBeenCalledTimes(1);
    expect(h.finalize).toHaveBeenCalledWith("ord_1", res);
  });

  it("generation failure -> failed_generation; still finalizes (no persist)", async () => {
    const h = hooks({
      generateArtifact: vi.fn(async () => {
        throw new Error("model boom");
      }),
    });
    const res = await runContinuumGeneration("ord_2", h);
    expect(res.status).toBe("failed_generation");
    expect(res.error).toMatch(/model boom/);
    expect(h.persistReport).not.toHaveBeenCalled();
    expect(h.finalize).toHaveBeenCalledWith("ord_2", res);
  });

  it("empty PDF -> failed_generation", async () => {
    const h = hooks({ renderPdf: vi.fn(async () => new Uint8Array([])) });
    const res = await runContinuumGeneration("ord_3", h);
    expect(res.status).toBe("failed_generation");
    expect(res.error).toMatch(/empty PDF/);
    expect(h.persistReport).not.toHaveBeenCalled();
  });
});
