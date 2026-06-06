// BUNDLE-C — purchase delivery view tests (pure).

import { describe, it, expect } from "vitest";
import { buildPurchaseDelivery, type DeliveryReportRow } from "./purchase-delivery";

const base = "https://darrowcode.com";

function row(over: Partial<DeliveryReportRow>): DeliveryReportRow {
  return {
    module_code: null,
    modules_array: null,
    report_ref: null,
    generation_status: "complete",
    pdf_url: "path.pdf",
    download_token: "tok",
    ...over,
  };
}

describe("buildPurchaseDelivery — legacy combined", () => {
  it("single combined report -> one combined entry with link", () => {
    const d = buildPurchaseDelivery(
      [
        row({
          modules_array: ["CORE", "LOVE"],
          report_ref: "DC-20260606-0001",
          download_token: "tokC",
        }),
      ],
      { appBaseUrl: base },
    );
    expect(d.mode).toBe("combined");
    expect(d.entries).toHaveLength(1);
    expect(d.entries[0].module).toBe("REPORT");
    expect(d.entries[0].download_url).toBe(`${base}/download/tokC`);
    expect(d.complete_count).toBe(1);
  });

  it("single-module combined row labels by its module", () => {
    const d = buildPurchaseDelivery([row({ modules_array: ["LOVE"], download_token: "t" })], {
      appBaseUrl: base,
    });
    expect(d.entries[0].module).toBe("LOVE");
  });
});

describe("buildPurchaseDelivery — separate per-module", () => {
  const sep = (m: string, over: Partial<DeliveryReportRow> = {}): DeliveryReportRow =>
    row({
      module_code: m,
      modules_array: [m],
      report_ref: `DC-20260606-0001-${m}`,
      download_token: `tok_${m}`,
      ...over,
    });

  it("CORE only separate -> one CORE entry", () => {
    const d = buildPurchaseDelivery([sep("CORE")], { appBaseUrl: base });
    expect(d.mode).toBe("separate");
    expect(d.entries.map((e) => e.module)).toEqual(["CORE"]);
  });

  it("CORE Complete -> 7 links, CORE first", () => {
    const mods = ["PLACE", "CORE", "LOVE", "MONEY", "BODY", "YEAR", "STYLE"];
    const d = buildPurchaseDelivery(
      mods.map((m) => sep(m)),
      { appBaseUrl: base },
    );
    expect(d.entries.map((e) => e.module)).toEqual([
      "CORE",
      "LOVE",
      "MONEY",
      "BODY",
      "YEAR",
      "STYLE",
      "PLACE",
    ]);
    expect(d.complete_count).toBe(7);
    expect(d.entries.every((e) => e.download_url?.startsWith(`${base}/download/`))).toBe(true);
  });

  it("partial failure: failed/pending modules have no link and show status", () => {
    const d = buildPurchaseDelivery(
      [
        sep("CORE"),
        sep("MONEY", { generation_status: "failed_generation", pdf_url: null }),
        sep("LOVE", { generation_status: "processing", pdf_url: null }),
      ],
      { appBaseUrl: base },
    );
    const by = Object.fromEntries(d.entries.map((e) => [e.module, e]));
    expect(by.CORE.complete).toBe(true);
    expect(by.MONEY.complete).toBe(false);
    expect(by.MONEY.download_url).toBeNull();
    expect(by.MONEY.status).toBe("failed_generation");
    expect(by.LOVE.status).toBe("processing");
    expect(d.complete_count).toBe(1);
    expect(d.total).toBe(3);
  });

  it("no duplicate links (dedupe by token)", () => {
    const d = buildPurchaseDelivery([sep("CORE"), sep("CORE")], { appBaseUrl: base });
    expect(d.entries).toHaveLength(1);
  });
});
