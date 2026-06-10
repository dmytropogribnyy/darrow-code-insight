// CONTENT human-readability gate (CORE-HUMAN-VOICE v3.2). Scans BODY PROSE ONLY (never proof_tags)
// for chart machinery that should live in the trailing proof line instead — exact orbs, percentages,
// raw BaZi branch/stem/life-stage technique, meta-method narration — plus a soft machine-word density
// metric and a placement-first section-opener check. Shared so add-ons + Continuum + CORE all pass the
// same bar. Pure, regex-only — no AI/IO. Sibling of forbidden-claim-scan.ts.

export interface DensityFinding {
  category: string;
  match: string;
}

export interface DensityReport {
  // HARD: machinery that must never appear in prose (belongs in proof_tags). Target: empty.
  hardViolations: DensityFinding[];
  // SOFT: machine-vocabulary density — capped, not banned (Darrow voice may use a couple).
  machineWords: string[];
  wordCount: number;
  machineWordsPer1000: number;
}

// Each rule's match is the exact offending substring (for actionable diagnostics).
const HARD_RULES: Array<{ category: string; re: RegExp }> = [
  // 0.4° / 0.27 degrees / 0.4-degree (hyphenated, as the model actually writes it)
  { category: "exact_degree", re: /\b\d+(?:\.\d+)?[\s-]*(?:°|degrees?)\b/gi },
  { category: "orb_word", re: /\borb\b/gi },
  // 54% / 54 %
  { category: "percentage", re: /\b\d+(?:\.\d+)?\s*%/g },
  // BaZi raw technique: "(Dog) branch", "Grave life stage", "Tomb life stage", "nayin", "ten gods"
  {
    category: "bazi_branch",
    re: /\((?:Rat|Ox|Tiger|Rabbit|Dragon|Snake|Horse|Goat|Monkey|Rooster|Dog|Pig)\)\s*branch/gi,
  },
  {
    category: "bazi_life_stage",
    re: /\b(?:grave|tomb|birth|bath|growth|prosperity|peak|decline|sickness|death)\s+life stage\b/gi,
  },
  { category: "bazi_term", re: /\b(?:nayin|ten gods?|day master at|hour pillar|stem-branch)\b/gi },
  // Meta-method narration (tells the reader it's a multi-system synthesis).
  {
    category: "meta_method",
    re: /\b(?:five independent systems|two independent frameworks|the numerology layer (?:adds|confirms)|the ba\s?zi layer (?:adds|confirms)|the astrology layer (?:adds|confirms))\b/gi,
  },
];

const MACHINE_WORDS_RE =
  /\b(?:architecture|system|systemic|layer|mechanism|configuration|operating requirement|load-bearing)\b/gi;

function allMatches(text: string, re: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((m = re.exec(text)) !== null) {
    out.push(m[0]);
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  return out;
}

/** Scan body prose (exclude proof_tags) for machinery + machine-word density. */
export function scanTechnicalDensity(prose: string): DensityReport {
  const text = prose ?? "";
  const hardViolations: DensityFinding[] = [];
  for (const rule of HARD_RULES) {
    for (const match of allMatches(text, rule.re))
      hardViolations.push({ category: rule.category, match });
  }
  const machineWords = allMatches(text, MACHINE_WORDS_RE);
  const wordCount = (text.trim().match(/\S+/g) ?? []).length;
  const machineWordsPer1000 = wordCount ? (machineWords.length / wordCount) * 1000 : 0;
  return { hardViolations, machineWords, wordCount, machineWordsPer1000 };
}

// Placement / mechanism-first openers a major section must NOT start with.
const PLACEMENT_OPENER_RE = new RegExp(
  "^\\s*(?:the\\s+|your\\s+)?(?:" +
    "(?:sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|chiron|lilith|north node|south node|ascendant|midheaven|day master|life path|expression|soul urge|personality|maturity)\\b" +
    "|(?:sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto)\\s+(?:square|trine|sextile|conjunct(?:ion)?|opposition|in)\\b" +
    "|\\d+(?:st|nd|rd|th)\\s+house\\b" +
    "|(?:yang|yin)\\s+(?:earth|fire|metal|water|wood)\\b" +
    ")",
  "i",
);

/** True if the section's first sentence leads with a placement/mechanism instead of human recognition. */
export function opensWithPlacement(prose: string): boolean {
  const firstSentence = (prose ?? "").trim().split(/(?<=[.!?])\s/)[0] ?? "";
  return PLACEMENT_OPENER_RE.test(firstSentence);
}
