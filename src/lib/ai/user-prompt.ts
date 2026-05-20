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
  return [
    "MODULE DATA ROUTING — which data belongs to which module:",
    "- CORE (v3): Natal + BaZi pillars + Day Master + Life Path + Birth Day Number. Expression/Soul Urge/Personality only when name_numerology.available=true AND they converge with the main pattern. Never a standalone 'Name Numerology' section.",
    "- LOVE: Venus, Mars, Moon, 5H, 7H, Descendant. Name numerology only if it reinforces the relationship pattern. No synastry in MVP. No compatibility claims from name numerology alone.",
    "- MONEY: 2H, 6H, 8H, 10H, Jupiter, Saturn, Venus, Pluto. Life Path / Expression / Maturity can support income mechanism + value structure. BaZi favorable/unfavorable elements + structure can support money mechanism.",
    "- BODY: Moon, Mars, Saturn, 6H. BaZi element imbalance can support stress/recovery rhythm. Moon Phase may add a soft rhythm note. No medical claims. Use 'your system may respond to…' language.",
    "- YEAR: Slow transits + Solar Return are primary. Personal Year supports the annual theme. BaZi Flow may support annual/monthly timing.",
    "- STYLE: Venus, Ascendant, Moon. BaZi element balance supports color/material direction. Visual-resonance / material-signature language only. No healing/luck/protection/attraction claims.",
    "- PLACE: Moon, IC, 4H, angular planets. BaZi favorable elements can support environmental qualities. Astrocartography is NOT implemented — never name specific cities.",
    "",
    "ENRICHMENT GUARDRAILS:",
    "- Name numerology, Moon Phase and BaZi Flow are supporting synthesis layers, never standalone sections.",
    "- Every enrichment-based claim must cite its data point.",
  ].join("\n");
}

function coreV3Instructions(): string {
  return [
    "═══════════════════════════════════════════════",
    "CORE v3 GENERATION — REQUIRED SPEC FOR THIS CALL",
    "═══════════════════════════════════════════════",
    "",
    "You are generating a CORE v3 report.",
    "Generate ALL 17 sections below. Total target: 3,000–3,600 words.",
    "Do not compress. This is the flagship paid report — deliver full depth.",
    "",
    "Emit modules.CORE with schema_version: \"core_v3\" and these 17 keys",
    "(in this order, with word targets):",
    "  1. cover_tagline (10–20 words)",
    "  2. orientation (180–220 words)",
    "  3. core_architecture (280–340 words)",
    "  4. battery (220–260 words)",
    "  5. social_interface (200–240 words)",
    "  6. numerology_code (260–300 words)",
    "  7. cognitive_style (200–240 words)",
    "  8. drive_and_rhythm (200–240 words)",
    "  9. professional_archetype (220–260 words)",
    " 10. money_and_value (200–240 words)",
    " 11. relationship_baseline (200–240 words)",
    " 12. vitality_baseline (180–220 words)",
    " 13. environment_and_resonance (180–220 words)",
    " 14. shadow_and_friction (240–280 words)",
    " 15. before_after (120–160 words)",
    " 16. executive_summary (280–320 words)",
    " 17. next_step (80–120 words)",
    "",
    "Each section MUST contain: a concrete scenario line, mechanism explanation,",
    "at least one PROTOCOL: or Warning Signal: block, and proof tags drawn from",
    "real data at the end (format: [Placement1 · Placement2 · ...]).",
    "No generic horoscope language. No technical chart dump.",
    "",
    "Also emit client_snapshot (required) derived from the v3 sections:",
    "- pattern_name: 3–5 word label derived from core_architecture",
    "- core_pattern: 1–2 sentences distilled from core_architecture",
    "- unique_signature: 1 sentence from battery or social_interface",
    "- primary_strength: 1 sentence from core_architecture",
    "- pressure_point: 1 sentence from shadow_and_friction",
    "- best_operating_rhythm: 1 sentence from drive_and_rhythm",
    "- current_timing_theme: 1 sentence reflecting current timing context",
    "- practical_focus: 1–2 sentences from protocols / next_step",
    "- recommended_next_module: one of LOVE, MONEY, BODY, YEAR, STYLE, PLACE",
    "",
    "Also emit closing.executive_summary and closing.recommended_next_module.",
  ].join("\n");
}

export function buildUserPrompt(args: BuildUserPromptArgs): string {
  const includesCore = args.modules.includes("CORE" as any);
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
    includesCore ? coreV3Instructions() : "",
    "",
    "DarrowChartData (canonical inputs — do not invent placements outside this):",
    "```json",
    JSON.stringify(args.chart, null, 2),
    "```",
    "",
    "Write the Darrow report now by calling emit_darrow_report.",
  ].join("\n");
}
