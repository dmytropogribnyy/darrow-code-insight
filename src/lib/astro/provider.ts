import type { DarrowChartData, NatalInput } from "./types";

export interface AstroProvider {
  name: string;
  version: string;
  computeNatal(input: NatalInput): Promise<DarrowChartData>;
}

let _instance: AstroProvider | null = null;

export async function getAstroProvider(): Promise<AstroProvider> {
  if (_instance) return _instance;
  const kind = (process.env.ASTRO_PROVIDER ?? "mock").toLowerCase();
  if (kind === "mock") {
    const { MockAstroProvider } = await import("./mock-provider.server");
    _instance = new MockAstroProvider();
  } else {
    throw new Error(`Unsupported ASTRO_PROVIDER: ${kind}`);
  }
  return _instance;
}
