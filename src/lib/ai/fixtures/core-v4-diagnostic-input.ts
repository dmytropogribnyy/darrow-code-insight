// CORE v4 manual diagnostic INPUT fixture (B5.2).
//
// DIAGNOSTIC-ONLY · NOT customer data · NOT production.
// Deterministic, fictional birth input for the manual core-v4 diagnostic CLI and
// its tests. No FreeAstroAPI call — the chart is produced by the deterministic
// MockAstroProvider. The user prompt is built with the production
// buildCoreV4UserPrompt() (no generator logic is reimplemented here).

import type { NatalInput, DarrowChartData } from "@/lib/astro/types";
import { MockAstroProvider } from "@/lib/astro/mock-provider.server";
import { buildCoreV4UserPrompt } from "@/lib/ai/user-prompt";

export const CORE_V4_DIAGNOSTIC_CLIENT_NAME = "Dmitry";

// Full-quality diagnostic case: birth_time_known = true, full name for numerology,
// BaZi sex set. Fictional sample values — not a real person's data.
export const CORE_V4_DIAGNOSTIC_NATAL_INPUT: NatalInput = {
  date_of_birth: "1979-06-25",
  birth_time: "04:30:00",
  birth_time_known: true,
  latitude: 49.9935,
  longitude: 36.2304,
  timezone: "Europe/Kyiv",
  full_name_for_numerology: "Dmitry Diagnostic Sample",
  first_name: "Dmitry",
  bazi_sex: "M",
  birth_city: "Kharkiv",
};

export interface CoreV4DiagnosticInput {
  clientName: string;
  natalInput: NatalInput;
  chart: DarrowChartData;
  userPrompt: string;
}

// Builds the deterministic diagnostic generation input. Reuses the production
// user-prompt builder and the deterministic mock chart provider. No FreeAstroAPI,
// no customer data, no persistence.
export async function buildCoreV4DiagnosticInput(): Promise<CoreV4DiagnosticInput> {
  const provider = new MockAstroProvider();
  const chart = await provider.computeNatal(CORE_V4_DIAGNOSTIC_NATAL_INPUT);
  const userPrompt = buildCoreV4UserPrompt({
    first_name: CORE_V4_DIAGNOSTIC_CLIENT_NAME,
    date_of_birth: CORE_V4_DIAGNOSTIC_NATAL_INPUT.date_of_birth,
    birth_city: CORE_V4_DIAGNOSTIC_NATAL_INPUT.birth_city ?? null,
    modules: ["CORE"],
    chart,
  });
  return {
    clientName: CORE_V4_DIAGNOSTIC_CLIENT_NAME,
    natalInput: CORE_V4_DIAGNOSTIC_NATAL_INPUT,
    chart,
    userPrompt,
  };
}
