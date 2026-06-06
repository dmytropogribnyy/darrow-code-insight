// Coded Darrow interpretation dictionaries — original curated content transcribed from
// docs/knowledge/rules/ (which are original Darrow language, IP-safe; never from source_packs raw).
//
// Purpose: GROUND report generation in Darrow meanings/framings so output is more specific and
// on-voice — at roughly the SAME length as today (depth, not length). The pack is source material the
// model grounds in to replace generic phrasing; it is NOT reproduced verbatim and NOT appended.
//
// STAGED · not wired into prompts until the selector + per-module wiring + A/B re-validation land.

export type KnowledgeLayer =
  | "zodiac"
  | "planet"
  | "house"
  | "aspect"
  | "element"
  | "modality"
  | "polarity";

export interface KnowledgeEntry {
  /** Stable key: "aries", "sun", "house_5", "square", "fire", "cardinal", "yang". */
  id: string;
  layer: KnowledgeLayer;
  /** Display label: "Aries", "Sun", "House 5", "Square", "Fire". */
  label: string;
  /** darrow_meaning — the central Darrow framing. */
  meaning: string;
  /** strength_expression. */
  strength: string;
  /** shadow_expression. */
  shadow: string;
  /** practical_direction (optional). */
  practical?: string;
  /** safe_report_use — sections/modules this entry feeds (routing), e.g. ["orientation","core_architecture"]. */
  safe_report_use: string[];
  /** Per-entry forbidden framings (carried into the prompt safety block). */
  forbidden_claims?: string[];
  /** Darrow voice-register example. */
  sample_phrase?: string;
  /** Houses require birth time. */
  requires_birth_time?: boolean;
  /** Extra structured facts: element, modality, polarity, rulers, angle, group, orb, etc. */
  meta?: Record<string, string>;
}

export type KnowledgeDict = Record<string, KnowledgeEntry>;
