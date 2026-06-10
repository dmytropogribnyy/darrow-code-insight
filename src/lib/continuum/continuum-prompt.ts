// CONTINUUM prompt builder (staged). Consumes the material packet — not raw chart. Period-aware,
// timing-orientation voice. Same recognition-first DNA as the add-ons. STAGED · not production.

import type { ContinuumContext } from "./continuum-context";
import { CONTINUUM_SECTION_KEYS, CONTINUUM_TARGET_WORDS } from "./continuum-schema";
import { CONTINUUM_PRODUCTS } from "./continuum-config";

export function buildContinuumPrompt(
  ctx: ContinuumContext,
  opts: { first_name?: string | null } = {},
): string {
  const type = ctx.type;
  const product = CONTINUUM_PRODUCTS[type];
  const keys = CONTINUUM_SECTION_KEYS[type];
  const list = (items: string[]) =>
    items.length ? items.map((s) => `  - ${s}`).join("\n") : "  (none)";

  return [
    `═══════════════════════════════════════════════`,
    `DARROW CODE — CONTINUUM ${product.short.toUpperCase()} (timing brief, continuum_v1)`,
    `═══════════════════════════════════════════════`,
    ``,
    `Customer first name: ${opts.first_name ?? ctx.customer.first_name ?? "(not provided)"}`,
    `This is an AI astrology TIMING brief — a personal orientation for a ROLLING period, NOT a`,
    `generic daily horoscope and NOT a calendar week/month.`,
    `${ctx.period.generated_label}. ${ctx.period.covers_label}.`,
    `Target length: ${CONTINUUM_TARGET_WORDS[type]} prose words across the sections below.`,
    ``,
    `PERIOD PHRASING (hard rule): NEVER write "this week", "this month", "today", "tonight",`,
    `"this weekend", or any calendar-period words. The period is a ROLLING window from generation.`,
    `Refer to it ONLY as "the next ${type === "7d" ? "7 days" : "30 days"}", "this ${type === "7d" ? "7-day" : "30-day"} window",`,
    `"the days ahead", "across this period", or "the covered window". This holds even in REVIEW /`,
    `REFLECTION lines — say "over the days behind you" / "across the stretch so far", never "this week" / "this month".`,
    ``,
    `VOICE: private, premium, recognition-first, calm strategic-advisor. Continuum is a WEATHER MAP`,
    `for your personal system — time becomes readable; the decisions stay with you. Timing is`,
    `ORIENTATION — windows and rhythm, not destiny. The reader decides; you orient. Dinner Table Test applies.`,
    ``,
    `MATERIAL PACKET — use ONLY what this packet allows. Do NOT use raw chart data or any layer`,
    `not listed here.`,
    `Allowed proof-anchor candidates (cite only these, in trailing proof_tags):`,
    list(ctx.allowedProofAnchorCandidates),
    `Available timing layers this run: ${ctx.optionalEnrichmentAvailable.join(", ") || "(none — Personal Year + natal essentials only)"}`,
    `Fallback: ${ctx.missingDataFallback}`,
    ``,
    `FORBIDDEN ANCHORS (never cite):`,
    list(ctx.forbiddenAnchors),
    `FORBIDDEN CLAIMS (never imply anywhere):`,
    list(ctx.forbiddenClaims),
    ``,
    `SAFETY (hard): no guaranteed predictions, no "this will happen", no specific dated events,`,
    `no medical advice, no financial/investment advice, no relationship guarantees, no`,
    `compatibility/synastry, no exact cities/astrocartography. Frame everything as`,
    `tendencies / windows / green zones / pressure zones, anchored to the covered period.`,
    ``,
    `STRUCTURE — emit exactly these sections, in order, each as`,
    `{ opening_line?, scenario?, prose, key_insight?, protocols?, warning_signals?, proof_tags? }:`,
    ...keys.map((k, i) => `  ${i + 1}. ${k}`),
    `Include at least one practical protocol. proof_tags max 5 per section, ONLY from the allowed`,
    `anchor candidates above.`,
    ``,
    `Emit JSON: { schema_version: "continuum_v1", continuum_type: "${type}", cover_tagline,`,
    `sections: { <the keys above> } }. Do not add, rename, or reorder sections.`,
  ].join("\n");
}
