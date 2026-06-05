// CORE v4 anchor / data-availability validation (B5.3-A).
//
// DIAGNOSTIC-ONLY. Validates that the generated proof anchors + section text are
// consistent with the ACTUAL diagnostic input chart's data availability — so a real
// AI diagnostic cannot be accepted just because schema/lengths pass while it cites
// data the chart does not have (e.g. BaZi when bazi.available=false, houses/angles
// when birth_time_known=false, name numerology when no full name).
//
// IMPORTANT: availability is derived from the run's input chart (MockAstroProvider),
// NOT from the gold-sample fixture text. The two are different sources.
//
// No AI call. No production. Pure functions.

import { getCoreV4SectionText } from "@/lib/ai/diagnostic.server";
import { CORE_V4_BODY_SECTION_KEYS } from "@/lib/ai/schema";

export interface AnchorAvailability {
  birthTimeKnown: boolean;
  baziAvailable: boolean;
  nameNumerologyAvailable: boolean;
  personalYear: number | null;
}

// Derives availability from the diagnostic input chart + natal input.
export function deriveAnchorAvailability(chart: any, natalInput: any): AnchorAvailability {
  const nameAvail =
    !!natalInput?.full_name_for_numerology &&
    chart?.numerology?.name_numerology?.available !== false;
  return {
    birthTimeKnown: !!natalInput?.birth_time_known,
    baziAvailable: !!chart?.bazi?.available,
    nameNumerologyAvailable: nameAvail,
    personalYear:
      typeof chart?.numerology?.personal_year === "number" ? chart.numerology.personal_year : null,
  };
}

export type AnchorViolationKind =
  | "forbidden_bazi"
  | "forbidden_house_angle"
  | "forbidden_name_numerology"
  | "timing_mismatch";

export interface AnchorViolation {
  section: string;
  kind: AnchorViolationKind;
  match: string;
}

export interface AnchorValidationResult {
  pass: boolean;
  availability: AnchorAvailability;
  violations: AnchorViolation[];
  scannedSections: number;
}

// BaZi terms (unambiguous): system terms + stem/polarity + element pairs. The
// element words alone (earth/water/fire) are NOT matched — only when preceded by a
// BaZi stem/polarity — so Western "water sign" etc. do not false-positive.
const BAZI_RE =
  /\b(ba[\s-]?zi|day master|four pillars|heavenly stem|earthly branch|luck (?:pillar|cycle)|(?:jia|yi|bing|ding|wu|ji|geng|xin|ren|gui|yin|yang)\s+(?:wood|fire|earth|metal|water))\b/gi;
// House / angle terms — only forbidden when birth_time_known = false.
const HOUSE_ANGLE_RE =
  /\b(\d{1,2}(?:st|nd|rd|th)\s+house|house\s+\d{1,2}|ascendant|rising sign|midheaven|\bMC\b|\bIC\b|\bASC\b|descendant)\b/gi;
// Name-derived numerology — only forbidden when the full name is absent.
// (Life Path + Personal Year are date-derived and always allowed.)
const NAME_NUM_RE =
  /\b(soul urge|expression number|personality number|(?:expression|soul urge|personality)\s+\d)\b/gi;
const PERSONAL_YEAR_RE = /\bpersonal year\s+(?:is\s+)?(\d{1,2})\b/gi;

function findAll(re: RegExp, text: string): string[] {
  const out: string[] = [];
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.push(m[0].trim());
  return out;
}

// Validates anchors/section text against availability. Returns fail-loud violations.
export function validateAnchors(
  coreModule: any,
  availability: AnchorAvailability,
): AnchorValidationResult {
  const violations: AnchorViolation[] = [];
  let scanned = 0;
  for (const key of CORE_V4_BODY_SECTION_KEYS) {
    const field = coreModule?.[key];
    if (!field) continue;
    scanned++;
    const tags = Array.isArray(field.proof_tags) ? field.proof_tags.join(" · ") : "";
    const text = `${getCoreV4SectionText(field)} ${tags}`;

    if (!availability.baziAvailable) {
      for (const hit of findAll(BAZI_RE, text))
        violations.push({ section: key, kind: "forbidden_bazi", match: hit });
    }
    if (!availability.birthTimeKnown) {
      for (const hit of findAll(HOUSE_ANGLE_RE, text))
        violations.push({ section: key, kind: "forbidden_house_angle", match: hit });
    }
    if (!availability.nameNumerologyAvailable) {
      for (const hit of findAll(NAME_NUM_RE, text))
        violations.push({ section: key, kind: "forbidden_name_numerology", match: hit });
    }
    if (availability.personalYear != null) {
      for (const hit of findAll(PERSONAL_YEAR_RE, text)) {
        const claimed = parseInt(hit.replace(/\D+/g, ""), 10);
        if (claimed !== availability.personalYear)
          violations.push({
            section: key,
            kind: "timing_mismatch",
            match: `"${hit}" (expected Personal Year ${availability.personalYear})`,
          });
      }
    }
  }
  return { pass: violations.length === 0, availability, violations, scannedSections: scanned };
}

export function formatAnchorReport(r: AnchorValidationResult): string {
  const a = r.availability;
  const lines = [
    "── CORE v4 anchor / data-availability validation ────────────────",
    `  result:                 ${r.pass ? "PASS" : "FAIL"}`,
    `  availability:           birth_time_known=${a.birthTimeKnown} · bazi=${a.baziAvailable} · name_numerology=${a.nameNumerologyAvailable} · personal_year=${a.personalYear ?? "n/a"}`,
    `  sections scanned:       ${r.scannedSections}`,
    `  violations:             ${r.violations.length}`,
  ];
  for (const v of r.violations.slice(0, 20)) {
    lines.push(`    - [${v.kind}] ${v.section}: ${v.match}`);
  }
  return lines.join("\n");
}
