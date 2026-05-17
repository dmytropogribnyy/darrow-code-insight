import type { DarrowChartData } from "@/lib/astro/types";
import type { ModuleCode } from "@/lib/modules";

export interface BuildUserPromptArgs {
  first_name: string | null;
  date_of_birth: string;
  birth_city: string | null;
  modules: Array<"CORE" | ModuleCode>;
  chart: DarrowChartData;
}

function safetyRules(chart: DarrowChartData): string {
  const rules: string[] = [];
  rules.push("DATA SAFETY RULES — read before writing the report:");
  rules.push("- Use only data present in DarrowChartData. Do not invent placements or aspects.");
  rules.push("- Every proof_tag must reference a real data point from this chart.");
  if (chart.meta.birth_time_source !== "exact") {
    rules.push(
      "- birth_time_known = FALSE. Do NOT make strong claims about Ascendant, Midheaven, IC, Descendant, house placements, house rulers, or any house-overlay reading. House-based language must be omitted or hedged.",
    );
  }
  if (!chart.bazi?.available) {
    rules.push(
      "- bazi.available = FALSE. Do NOT mention BaZi, Four Pillars, Day Master, Ten Gods, Chinese astrology, stems, branches, or luck cycles anywhere in the report.",
    );
  } else if (chart.bazi?.hour_pillar_used_for_interpretation === false) {
    rules.push(
      "- BaZi hour pillar is unreliable (birth time unknown). Use Day Master, year/month/day pillars and element balance only. Do not make hour-pillar-specific claims.",
    );
  }
  if (chart.solar_return && !chart.solar_return.available) {
    rules.push(
      "- solar_return.available = FALSE. Do NOT mention Solar Return. YEAR ahead must rely on transits + personal year only.",
    );
  }
  if (chart.transits && !chart.transits.available) {
    rules.push(
      "- transits.available = FALSE. YEAR module relies only on Personal Year and natal/BaZi context (when available).",
    );
  }
  return rules.join("\n");
}

export function buildUserPrompt(args: BuildUserPromptArgs): string {
  return [
    `Customer first name: ${args.first_name ?? "(not provided)"}`,
    `Date of birth: ${args.date_of_birth}`,
    `Birth city: ${args.birth_city ?? "(not provided)"}`,
    `Modules to include (in order): ${args.modules.join(", ")}`,
    "",
    safetyRules(args.chart),
    "",
    "DarrowChartData (canonical inputs — do not invent placements outside this):",
    "```json",
    JSON.stringify(args.chart, null, 2),
    "```",
    "",
    "Write the Darrow report now by calling emit_darrow_report.",
  ].join("\n");
}
