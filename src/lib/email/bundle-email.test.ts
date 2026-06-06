// BUNDLE-C — multi-link email tests (+ legacy single-report email unchanged).

import { describe, it, expect } from "vitest";
import { bundleReportReadyEmail, reportReadyEmail } from "./resend.server";

describe("bundleReportReadyEmail (multi-link)", () => {
  const items = [
    {
      label: "CORE Report",
      report_ref: "DC-20260606-0001-CORE",
      download_url: "https://d.co/download/tokC",
    },
    {
      label: "LOVE chapter",
      report_ref: "DC-20260606-0002-LOVE",
      download_url: "https://d.co/download/tokL",
    },
  ];

  it("lists every PDF link + the result page; plural subject", () => {
    const { subject, html } = bundleReportReadyEmail({
      first_name: "Alex",
      result_url: "https://d.co/result/tokC",
      items,
    });
    expect(subject).toMatch(/reports are ready/i);
    expect(html).toContain("Hi Alex,");
    expect(html).toContain("https://d.co/download/tokC");
    expect(html).toContain("https://d.co/download/tokL");
    expect(html).toContain("DC-20260606-0001-CORE");
    expect(html).toContain("https://d.co/result/tokC");
  });

  it("singular subject for one item", () => {
    const { subject } = bundleReportReadyEmail({
      first_name: null,
      result_url: "https://d.co/result/x",
      items: [items[0]],
    });
    expect(subject).toMatch(/report is ready/i);
  });

  it("notes pending modules without linking them", () => {
    const { html } = bundleReportReadyEmail({
      first_name: "A",
      result_url: "https://d.co/result/x",
      items,
      pending_count: 2,
    });
    expect(html).toMatch(/still being prepared/i);
    expect(html).toMatch(/2 more reports/);
  });
});

describe("legacy reportReadyEmail unchanged (regression guard)", () => {
  it("still renders the single download link", () => {
    const { subject, html } = reportReadyEmail({
      first_name: "Alex",
      download_url: "https://d.co/download/legacy",
      result_url: "https://d.co/result/legacy",
    });
    expect(subject).toMatch(/premium Darrow Code report is ready/);
    expect(html).toContain("https://d.co/download/legacy");
  });
});
