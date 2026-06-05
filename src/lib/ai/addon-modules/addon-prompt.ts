// MODULE-PROMPT-1 — staged add-on prompt builder (LOVE/MONEY/BODY/YEAR/STYLE/PLACE).
//
// STAGED · NOT production. Consumes a MATERIAL-PACK-1 ReportContext packet (allowed anchors,
// forbidden anchors/claims, fallback, gating) — NOT raw unrestricted chart data. Mirrors the
// CORE v4.1 voice + per-section structured fields. Not wired into buildUserPrompt.

import type { ModuleCode } from "@/lib/modules";
import type { ReportContext } from "@/lib/report-context/build-report-context";
import { ADDON_SECTION_KEYS, ADDON_DISCLAIMER } from "./addon-schema";

const MODULE_PURPOSE: Record<ModuleCode, string> = {
  LOVE: "the client's relational operating system — how they attach, attract, need, and collide in intimacy",
  MONEY: "the client's earning, value, and money-decision pattern (NOT financial advice)",
  BODY: "body-awareness, stress response, and recovery rhythm (NON-medical)",
  YEAR: "the current annual theme, timing pressure, and decision rhythm",
  STYLE: "aesthetic identity and self-presentation as self-recognition (not superstition)",
  PLACE: "environment fit — what spaces regulate vs drain the person (not astrocartography)",
};

const TARGET_WORDS: Record<ModuleCode, string> = {
  LOVE: "1,400–1,900",
  MONEY: "1,400–1,900",
  BODY: "1,300–1,800",
  YEAR: "1,500–2,000",
  STYLE: "1,200–1,700",
  PLACE: "1,200–1,700",
};

// Builds the staged add-on prompt for one module from its material packet.
export function buildAddonModulePrompt(
  module: ModuleCode,
  ctx: ReportContext,
  opts: { first_name?: string | null } = {},
): string {
  const keys = ADDON_SECTION_KEYS[module];
  const disclaimer = ADDON_DISCLAIMER[module];
  const list = (items: string[]) =>
    items.length ? items.map((s) => `  - ${s}`).join("\n") : "  (none)";

  return [
    `═══════════════════════════════════════════════`,
    `DARROW CODE — ${module} FOCUSED CHAPTER (staged add_v1)`,
    `═══════════════════════════════════════════════`,
    ``,
    `Customer first name: ${opts.first_name ?? "(not provided)"}`,
    `Module purpose: ${MODULE_PURPOSE[module]}.`,
    `Target length: ${TARGET_WORDS[module]} prose words across the sections below.`,
    ``,
    `VOICE (non-negotiable): private, premium, recognition-first, psychologically sharp,`,
    `coaching-oriented. The reader should feel SEEN before EXPLAINED. Lead with a lived`,
    `moment; data confirms quietly after. Not a generic horoscope. Not timid.`,
    ``,
    `ADD-ON CANON: this is a focused applied orientation layer for ONE life domain.`,
    `- Practical usability over abstraction; clarity without pressure.`,
    `- Open with ONE recognizable archetype/metaphor and carry it through the chapter.`,
    `- Desire and ambition are welcome; warmth, validation and reassurance are welcome.`,
    `- Support the client WITHOUT taking authority over their life — orient, never command.`,
    `- before/after framing = a shift in EXPERIENCE, never a guaranteed outcome.`,
    `- Dinner Table Test: every line must sound natural to an intelligent adult, not inflated jargon.`,
    ``,
    `MATERIAL PACKET — use ONLY what this packet allows. Do NOT use raw chart data or any`,
    `placement/number not listed here.`,
    `Allowed proof-anchor candidates (cite only these, in trailing proof_tags):`,
    list(ctx.allowedProofAnchorCandidates),
    `Optional enrichment available this run: ${ctx.optionalEnrichmentAvailable.join(", ") || "(none)"}`,
    `Active fallback (missing data): ${ctx.missingDataFallback}`,
    ``,
    `FORBIDDEN ANCHORS (never cite — not in this chart / not allowed):`,
    list(ctx.forbiddenAnchors),
    `FORBIDDEN CLAIMS (never imply anywhere):`,
    list(ctx.forbiddenClaims),
    ``,
    `SAFETY: no medical diagnosis, no financial/investment advice, no legal advice, no`,
    `guaranteed predictions/outcomes, no deterministic commands, no fear-based manipulation.`,
    disclaimer ? `This module MUST be safe for the verbatim disclaimer: "${disclaimer}"` : null,
    ``,
    `STRUCTURE — emit exactly these sections, in order, each as`,
    `{ opening_line?, scenario?, prose, key_insight?, protocols?, warning_signals?, proof_tags? }:`,
    ...keys.map((k, i) => `  ${i + 1}. ${k}`),
    `Include at least one protocol (actionable, structured) across the chapter. proof_tags`,
    `max 5 per section, drawn ONLY from the allowed anchor candidates above.`,
    ``,
    `Emit the ${module} module as JSON: { schema_version: "addon_v1", module_code: "${module}",`,
    `cover_tagline, sections: { <the keys above> } }. Do not add, rename, or reorder sections.`,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");
}
