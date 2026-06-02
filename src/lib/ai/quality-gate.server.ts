// CORE v3.1 mini quality gate — warn-only heuristics that flag prose which
// reads more like an astrology dossier than a private premium reading.
//
// This is intentionally simple regex + first-sentence scanning. It does NOT
// trigger retries; it returns a list of warnings the diagnostic surfaces in
// its response so we can iterate on the prompt without burning paid runs.

import { getCoreSectionProse } from "./schema";

export interface QualityWarning {
  section: string;
  code: "RECOGNITION_FIRST" | "DOSSIER_TONE" | "TECHNICAL_DENSITY" | "LEAD_WITH_PLACEMENT";
  detail: string;
}

// Phrases that almost always indicate the section is leading with a
// placement instead of with lived experience. Matched on the first ~160
// chars of the section prose only.
const PLACEMENT_LEAD = [
  /^your sun (is|and|sign)/i,
  /^your moon (is|and|sign)/i,
  /^your ascendant (is|sign)/i,
  /^your (rising|midheaven)/i,
  /^your day master is/i,
  /^your life path (is|number)/i,
  /^your bazi /i,
  /^with (sun|moon|venus|mars|mercury|jupiter|saturn|pluto|neptune|uranus) in /i,
  /^the \w+ (in|on) the \d+(st|nd|rd|th) house/i,
];

// Dossier/textbook tone — analytical phrasing typical of free chart reports.
const DOSSIER_PHRASES = [
  /placed in the \d+(st|nd|rd|th) house/i,
  /day master is \w+ \w+ at (peak|prosperous|weak|dead) strength/i,
  /natal chart indicates/i,
  /this configuration suggests/i,
  /the native (is|will|tends to)/i,
];

// Long unbroken technical strings outside proof tags (degree+minute,
// element percentages, stem/branch codes).
const TECHNICAL_NOISE =
  /\b\d{1,3}°\d{1,2}'\b|\bgeng (zi|chou|yin|mao|chen|si|wu|wei|shen|you|xu|hai)\b|\b\d{1,3}% (water|wood|fire|earth|metal)\b/gi;

function firstSentence(s: string): string {
  return s.trim().split(/(?<=[.!?])\s+/)[0] ?? "";
}

function bodyWithoutProof(s: string): string {
  return s.replace(/\n*\[[^[\]]+\]\s*$/, "").trim();
}

export function evaluateQualityGate(core: any): QualityWarning[] {
  const warnings: QualityWarning[] = [];
  if (!core || typeof core !== "object") return warnings;

  for (const key of Object.keys(core)) {
    if (key === "schema_version" || key === "proof_tags") continue;
    const prose = getCoreSectionProse(core[key]);
    if (!prose || prose.length < 40) continue;
    const body = bodyWithoutProof(prose);
    const lead = firstSentence(body).slice(0, 200);

    if (PLACEMENT_LEAD.some((rx) => rx.test(lead))) {
      warnings.push({
        section: key,
        code: "LEAD_WITH_PLACEMENT",
        detail: `Opens with a placement: "${lead.slice(0, 120)}"`,
      });
    }

    for (const rx of DOSSIER_PHRASES) {
      const m = body.match(rx);
      if (m) {
        warnings.push({
          section: key,
          code: "DOSSIER_TONE",
          detail: `Dossier phrasing detected: "${m[0]}"`,
        });
        break;
      }
    }

    const techHits = body.match(TECHNICAL_NOISE);
    if (techHits && techHits.length > 2) {
      warnings.push({
        section: key,
        code: "TECHNICAL_DENSITY",
        detail: `${techHits.length} raw technical anchors in body prose (move to proof tag): ${techHits.slice(0, 3).join(", ")}`,
      });
    }

    // Recognition-first: the first sentence should reference the reader's
    // experience ("you", "your") OR a scenic noun, not a chart object.
    if (!/^(you|your|there'?s|when|in (rooms|conversations|relationships|work))/i.test(lead)) {
      // Only flag if it also looks technical — avoid false positives on
      // declarative pattern lines like "The hidden cost of carrying both."
      if (
        /sun|moon|venus|mars|mercury|jupiter|saturn|pluto|ascendant|midheaven|day master|life path|bazi|numerolog/i.test(
          lead,
        )
      ) {
        warnings.push({
          section: key,
          code: "RECOGNITION_FIRST",
          detail: `Opening does not lead with recognition: "${lead.slice(0, 120)}"`,
        });
      }
    }
  }

  return warnings;
}
