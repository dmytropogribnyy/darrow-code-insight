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

function moduleRouting(): string {
  // Compact routing so Claude knows which data layer belongs to which module.
  // Enrichment layers (name numerology, Moon Phase, BaZi Flow) are SUPPORTING
  // only — never standalone sections. Anchor every claim in proof_tags.
  return [
    "MODULE DATA ROUTING — which data belongs to which module:",
    "- CORE: Natal + BaZi pillars + Day Master + Life Path + Birth Day Number. Expression/Soul Urge/Personality only when name_numerology.available=true AND they converge with the main pattern. Never a standalone 'Name Numerology' section.",
    "- LOVE: Venus, Mars, Moon, 5H, 7H, Descendant. Name numerology only if it reinforces the relationship pattern. No synastry in MVP. No compatibility claims from name numerology alone.",
    "- MONEY: 2H, 6H, 8H, 10H, Jupiter, Saturn, Venus, Pluto. Life Path / Expression / Maturity can support income mechanism + value structure. BaZi favorable/unfavorable elements + structure can support money mechanism. Keep language practical: pricing, value, boundaries, pressure, income rhythm.",
    "- BODY: Moon, Mars, Saturn, 6H. BaZi element imbalance can support stress/recovery rhythm. Moon Phase may add a soft rhythm note. No medical claims. Use 'your system may respond to…' language.",
    "- YEAR: Slow transits + Solar Return are primary. Personal Year supports the annual theme. BaZi Flow may support annual/monthly timing. Moon Phase may add small emotional/timing texture. Daily moon must NOT overpower slow transits or Solar Return.",
    "- STYLE: Venus, Ascendant, Moon. BaZi element balance supports color/material direction. Expression/Soul Urge may add aesthetic nuance when relevant. Moon Phase may add symbolic visual tone. Visual-resonance / material-signature language only. No healing/luck/protection/attraction claims.",
    "- PLACE: Moon, IC, 4H, angular planets. BaZi favorable elements can support environmental qualities. Astrocartography is NOT implemented now — never name specific cities without real ACG line data.",
    "",
    "ENRICHMENT GUARDRAILS:",
    "- Name numerology, Moon Phase and BaZi Flow are supporting synthesis layers. Use them only when they converge with Western astrology, BaZi, transits, Solar Return, or the module theme.",
    "- Do not create standalone generic sections: no 'Your Name Numerology', no 'Your Moon Phase Meaning', no 'Your BaZi Flow Reading', no 'Lucky Numbers'.",
    "- Every enrichment-based claim must cite the exact data point and usually appear in proof_tags rather than as a long explanatory block.",
    "- The final report must remain human-readable, premium editorial, practical, and emotionally intelligent — not a technical dump.",
  ].join("\n");
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
    moduleRouting(),
    "",
    "DarrowChartData (canonical inputs — do not invent placements outside this):",
    "```json",
    JSON.stringify(args.chart, null, 2),
    "```",
    "",
    "Write the Darrow report now by calling emit_darrow_report.",
  ].join("\n");
}
