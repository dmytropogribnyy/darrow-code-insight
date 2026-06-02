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
    "CORE v3.1 GENERATION — REQUIRED SPEC FOR THIS CALL",
    "═══════════════════════════════════════════════",
    "",
    "You are generating a CORE v3.1 report.",
    "Generate ALL 17 sections below. Total target: 3,800–4,600 prose words.",
    "Hard cap: 5,000 words. If you exceed this, you have failed the brief —",
    "the goal is depth and recognition, not length.",
    "This is the flagship paid report. Voice: human, recognition-first,",
    "ordinary-life translation before technical mechanism.",
    "",
    "VOICE RULE (non-negotiable — this overrides any other instinct):",
    "The report must sound like a private premium reading written by a calm,",
    "intelligent human — NOT a technical astrology/BaZi/numerology analysis.",
    "The reader should feel RECOGNIZED before they feel EXPLAINED.",
    "",
    "Do not lead with placements. Lead with lived experience.",
    "Use placements only AFTER the client has recognized the pattern.",
    "Technical data belongs MOSTLY in the trailing [proof tag] bracket, not",
    "in the body prose.",
    "",
    "Every major section must answer, in this order:",
    "  1. What will the client recognize? (specific, scenic, ordinary-life)",
    "  2. Where does this show up in their real life? (concrete moments)",
    "  3. What is the practical shift? (what changes when they see it)",
    "  4. What is the simple protocol? (1 actionable callout, structured)",
    "  Only THEN add the proof anchors in the [proof tag].",
    "",
    'WRONG opening: "Your Sun and Moon are both in Cancer, positioned in',
    'the 1st house…"',
    'RIGHT opening: "You do not need a room to explain itself before you',
    "know what is happening inside it. The chart explains why — but the",
    'lived pattern comes first."',
    "",
    'WRONG opening: "Your BaZi Day Master is Gui Water at Peak strength…"',
    'RIGHT opening: "Your system does not skim the surface. It absorbs,',
    "compares, and waits until the deeper pattern becomes clear. The BaZi",
    'layer confirms this as a Water-based architecture."',
    "",
    "Banned opening patterns (apply to EVERY section):",
    "  • Starting with a sign/planet/house placement",
    '  • Starting with "Your Sun is...", "Your Day Master is...",',
    '    "Your Life Path is...", "Your Ascendant is..."',
    "  • Listing technical anchors before the human pattern",
    "",
    "Dinner-table test: every paragraph must be sayable to an intelligent",
    "adult in calm conversation. If it sounds like a textbook or an",
    "analytical memo, rewrite it.",
    "",
    "PROSE STRUCTURE (non-negotiable, see system prompt):",
    "- Every section starts with a SHORT declarative pattern line (≤12 words),",
    "  then a SCENARIO paragraph (specific, recognisable scene),",
    "  then mechanism, then protocol/warning callout, then proof tag line.",
    "- Paragraphs are 2–4 sentences, separated by blank lines.",
    "- No paragraph over 120 words. No wall-of-text sections.",
    "",
    "STRUCTURED CALLOUT FIELDS (CORE v3.1 schema):",
    "- Prose-only sections (emit as plain string): cover_tagline, orientation,",
    "  before_after, executive_summary, next_step.",
    "- Sections with PROTOCOL callouts — emit as OBJECT",
    "  { prose, protocols: [{title, body}] }: core_architecture, battery,",
    "  social_interface, numerology_code, cognitive_style, drive_and_rhythm,",
    "  professional_archetype, money_and_value, relationship_baseline,",
    "  vitality_baseline, environment_and_resonance.",
    "- Sections that ALSO need Warning Signals — add warning_signals: [string]:",
    "  battery, professional_archetype.",
    "- shadow_and_friction → OBJECT { prose, warning_signals: [string] },",
    "  NO protocols.",
    "- DO NOT embed `PROTOCOL:` or `Warning Signal:` lines inside the prose",
    "  anymore. The PDF renders them from the structured fields.",
    "",
    'Emit modules.CORE with schema_version: "core_v3" and these 17 keys',
    "(in this order, with per-section prose word targets):",
    "  1. cover_tagline (15–25 words, string)",
    "  2. orientation (200–250 words, string, 3–4 paragraphs)",
    "  3. core_architecture (300–380 words prose + 1 protocol)",
    "  4. battery (250–300 words prose + 1 protocol + 1 warning_signal)",
    "  5. social_interface (220–260 words prose + 1 protocol)",
    "  6. numerology_code (280–320 words prose + 1 protocol)",
    "  7. cognitive_style (220–260 words prose + 1 protocol)",
    "  8. drive_and_rhythm (220–260 words prose + 1 protocol)",
    "  9. professional_archetype (240–280 words prose + 1 protocol + 1 warning_signal)",
    " 10. money_and_value (220–260 words prose + 1 protocol)",
    " 11. relationship_baseline (220–260 words prose + 1 protocol)",
    " 12. vitality_baseline (200–240 words prose + 1 protocol)",
    " 13. environment_and_resonance (200–240 words prose + 1 protocol)",
    " 14. shadow_and_friction (280–340 words prose + 1 warning_signal)",
    " 15. before_after (140–180 words, string, 2 Before + 2 After blocks)",
    " 16. executive_summary (300–360 words, string, no callouts)",
    " 17. next_step (100–130 words, string)",
    "",
    "HUMAN READABILITY:",
    "- Lead with scenario and ordinary-life translation. The customer should",
    "  understand the section WITHOUT astrology or BaZi knowledge.",
    "- Move EXACT orbs, repeated house strings, Chinese characters, branch/stem",
    "  technical detail, nayin, ten gods, and element percentages into the",
    "  trailing proof_tag bracket — not into the main prose.",
    "- Technical anchors are allowed, but each must translate into a behavioural",
    "  observation in the same paragraph.",
    "",
    "PRECISION RULE — DO NOT contradict the chart data:",
    '- If the chart shows Gemini Ascendant, do NOT write "Cancer Ascendant".',
    "- Distinguish the OUTWARD INTERFACE (Ascendant sign) from the INTERIOR",
    '  ARCHITECTURE (Sun/Moon/element emphasis). E.g. "Gemini Ascendant as the',
    '  outward interface; Cancer Sun/Moon as the interior architecture."',
    '- Use "stellium near the identity zone" only when house data actually',
    "  supports it.",
    "",
    "Also emit client_snapshot (required) derived from the v3.1 sections:",
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
