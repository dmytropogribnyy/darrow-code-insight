import type { DarrowChartData, NatalInput } from "./types";

export interface AstroProvider {
  name: string;
  version: string;
  computeNatal(input: NatalInput): Promise<DarrowChartData>;
}

let _instance: AstroProvider | null = null;

export async function getAstroProvider(): Promise<AstroProvider> {
  if (_instance) return _instance;
  const explicit = (process.env.ASTRO_PROVIDER ?? "").toLowerCase().trim();
  const isProd = process.env.NODE_ENV === "production";

  // In production, ASTRO_PROVIDER MUST be set explicitly. Do not auto-select
  // based on the presence of FREEASTROAPI_KEY — that hides misconfiguration.
  if (isProd && !explicit) {
    throw new Error("ASTRO_PROVIDER must be set explicitly in production (e.g. 'freeastroapi').");
  }

  const hasFreeAstro = !!process.env.FREEASTROAPI_KEY;
  const kind = explicit || (hasFreeAstro ? "freeastroapi" : "mock");

  if (kind === "freeastroapi") {
    if (!process.env.FREEASTROAPI_KEY) {
      throw new Error("FREEASTROAPI_KEY is required when ASTRO_PROVIDER=freeastroapi");
    }
    const { FreeAstroAPIProvider } = await import("./freeastroapi-provider.server");
    _instance = new FreeAstroAPIProvider(process.env.FREEASTROAPI_KEY);
    return _instance;
  }

  if (kind === "mock") {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ALLOW_MOCK_ASTRO_IN_PRODUCTION !== "true"
    ) {
      throw new Error(
        "Mock astro provider is disabled in production. Set ASTRO_PROVIDER=freeastroapi or ALLOW_MOCK_ASTRO_IN_PRODUCTION=true to override.",
      );
    }
    console.warn("[astro] using MOCK provider — not real chart data");
    const { MockAstroProvider } = await import("./mock-provider.server");
    _instance = new MockAstroProvider();
    return _instance;
  }

  throw new Error(`Unsupported ASTRO_PROVIDER: ${kind}`);
}
