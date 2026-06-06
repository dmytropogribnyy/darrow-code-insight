// PHASE 2 — soft "recommended next" upsell logic (pure). Max 2 recommendations.
//
// Premium + subtle, never salesy. Links only to the website/product selector (no post-purchase
// one-click checkout — there is no mutable cart). Continuum is only ever recommended when the
// feature flag is ON. No scarcity / no guarantees / no unsupported claims.

export interface NextRecommendation {
  key: string;
  title: string; // short block heading
  body: string;
  cta_label: string;
  cta_url: string;
}

const ALL_CHAPTERS = ["LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"];
// One related chapter to suggest after a single focused chapter.
const RELATED: Record<string, string> = {
  LOVE: "YEAR",
  MONEY: "YEAR",
  BODY: "YEAR",
  YEAR: "STYLE",
  STYLE: "PLACE",
  PLACE: "BODY",
};

export function recommendNextProducts(
  purchased: string[],
  opts: { appBaseUrl: string; continuumEnabled?: boolean },
): NextRecommendation[] {
  const url = opts.appBaseUrl.replace(/\/$/, "");
  const set = new Set(purchased.map((p) => p.toUpperCase()));
  const hasCore = set.has("CORE");
  const chapters = ALL_CHAPTERS.filter((m) => set.has(m));
  const recs: NextRecommendation[] = [];

  if (hasCore && chapters.length === 6) {
    // CORE Complete — only suggest Continuum, and only when enabled.
    if (opts.continuumEnabled) {
      recs.push({
        key: "continuum",
        title: "Your next layer",
        body: "Next layer: timing. Continuum gives a focused 7-day or 30-day AI astrology timing brief — windows, pressure and green zones for the period ahead.",
        cta_label: "Explore Continuum",
        cta_url: url,
      });
    }
    return recs;
  }

  if (hasCore && chapters.length >= 1) {
    // CORE + some chapters → complete the set.
    recs.push({
      key: "core_complete",
      title: "Go deeper",
      body: "You already have the foundation and part of the map. CORE Complete gives you the full focused set — every life area decoded.",
      cta_label: "Explore CORE Complete",
      cta_url: url,
    });
    return recs;
  }

  if (hasCore) {
    // CORE only → focused chapters.
    recs.push({
      key: "focused_chapters",
      title: "Go deeper",
      body: "Your CORE report is the foundation. If you want to go deeper, the focused chapters decode specific life areas — love, money, body, year, style and place — one by one.",
      cta_label: "Explore focused chapters",
      cta_url: url,
    });
    return recs;
  }

  // Chapters without CORE → recommend the CORE foundation + one related chapter (max 2).
  recs.push({
    key: "core_foundation",
    title: "Your next layer",
    body: "Focused chapters are most useful when paired with the CORE foundation — your baseline pattern that the chapters build on.",
    cta_label: "Explore CORE Report",
    cta_url: url,
  });
  if (chapters.length === 1) {
    const related = RELATED[chapters[0]];
    if (related && !set.has(related)) {
      recs.push({
        key: "related_chapter",
        title: "If you want the next layer",
        body: `Readers who explore ${chapters[0]} often look at ${related} next — a closely related part of the same pattern.`,
        cta_label: `Explore ${related}`,
        cta_url: url,
      });
    }
  }
  return recs.slice(0, 2);
}
