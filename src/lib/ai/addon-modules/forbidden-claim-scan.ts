// Forbidden-claim + proof-anchor scanners (pure; no AI). Used by the add-on validation
// runner to fail loud on do-not-claim content and on proof tags not backed by the chart.

export interface ClaimViolation {
  category: string;
  match: string;
}

// Conservative deny-list. Aesthetic material words (e.g. "stone-grey") are NOT flagged on their
// own — only crystal/gem terms and magic/luck/heal/protection framing.
const CATEGORIES: Array<{ category: string; re: RegExp }> = [
  {
    category: "stones_crystals",
    re: /\b(crystal|gemstone|amethyst|quartz|obsidian|citrine|selenite|rose quartz|tiger'?s eye|talisman|amulet)\b/gi,
  },
  {
    // NOTE: "manifest as / manifests as" is the benign verb ("shows up as") and is NOT flagged;
    // only manifestation-as-a-luck-practice is ("manifestation", "manifest your abundance/wealth/…").
    category: "luck_healing_protection",
    re: /\b(lucky|good luck|healing|heals?\b|protective energy|protection from|ward off|cleanse your|aura|chakra|energetic protection)\b|\bmanifestation\b|\bmanifest(?:ing)?\s+(?:your\s+|the\s+|more\s+|greater\s+)?(?:abundance|wealth|money|prosperity|riches|success|love|desires?|dreams?|reality|destiny)\b/gi,
  },
  {
    category: "magical_colors",
    re: /\b(lucky colou?r|colou?rs? (that )?(attract|protect|heal)|wear [a-z ]+ to attract|power colou?r for luck)\b/gi,
  },
  {
    category: "medical",
    re: /\b(diagnos(e|is|ed)|disease|cure[sd]?\b|symptom|clinical|cortisol|inflammation|prescrib|psychosomatic)\b/gi,
  },
  {
    // "invest in your skills / relationships / this work" is benign metaphor; only flag investing in
    // an actual financial instrument (= financial advice).
    category: "financial_guarantee",
    re: /\b(guaranteed (income|returns?|profit|wealth)|will (earn|make) (you )?money|invest in (the )?(market|stocks?|bonds?|crypto(currency)?|shares?|equities|securities|real estate|property|gold|mutual funds?|index funds?|etfs?|a fund)|asset allocation|buy or sell|portfolio allocation)\b/gi,
  },
  {
    category: "relationship_guarantee",
    re: /\b(soulmate|guaranteed (love|relationship)|you will (meet|find) (the one|your))\b/gi,
  },
  {
    category: "astrocartography_city",
    re: /\b(astrocartograph|relocat(e|ion)|move to (paris|london|tokyo|new york|dubai|singapore|miami|berlin|bali)|your (city|country) (is|should be))\b/gi,
  },
];

export function scanForbiddenClaims(text: string): ClaimViolation[] {
  const out: ClaimViolation[] = [];
  const seen = new Set<string>();
  for (const { category, re } of CATEGORIES) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const key = `${category}:${m[0].toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ category, match: m[0] });
    }
  }
  return out;
}

// Returns proof tags that are NOT backed by any allowed anchor candidate (substring match,
// case-insensitive, on the tag's leading token e.g. "Venus" / "Moon" / "Ascendant").
export function scanUnbackedProofTags(proofTags: string[], allowedAnchors: string[]): string[] {
  const allowed = allowedAnchors.join(" | ").toLowerCase();
  const unbacked: string[] = [];
  for (const tag of proofTags) {
    const head = tag
      .split(/[·:,(]/)[0]
      .trim()
      .toLowerCase();
    if (!head) continue;
    // A tag is "backed" if its head token appears in the allowed anchors.
    const token = head.split(/\s+/)[0];
    if (!allowed.includes(token)) unbacked.push(tag);
  }
  return unbacked;
}
