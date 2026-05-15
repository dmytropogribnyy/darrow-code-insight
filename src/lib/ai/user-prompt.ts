import type { DarrowChartData } from "@/lib/astro/types";
import type { ModuleCode } from "@/lib/modules";

export interface BuildUserPromptArgs {
  first_name: string | null;
  date_of_birth: string;
  birth_city: string | null;
  modules: Array<"CORE" | ModuleCode>;
  chart: DarrowChartData;
}

export function buildUserPrompt(args: BuildUserPromptArgs): string {
  return [
    `Customer first name: ${args.first_name ?? "(not provided)"}`,
    `Date of birth: ${args.date_of_birth}`,
    `Birth city: ${args.birth_city ?? "(not provided)"}`,
    `Modules to include (in order): ${args.modules.join(", ")}`,
    "",
    "DarrowChartData (canonical inputs — do not invent placements outside this):",
    "```json",
    JSON.stringify(args.chart, null, 2),
    "```",
    "",
    "Write the Darrow report now by calling emit_darrow_report.",
  ].join("\n");
}
