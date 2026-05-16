// Shared module catalog + Stripe price ID mapping.
// Module codes here MUST match the `module_code` enum in the database.

export type ModuleCode = "LOVE" | "MONEY" | "BODY" | "YEAR" | "STYLE" | "PLACE";

export const MODULE_CODES: ModuleCode[] = ["LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"];

export const MODULE_PRICE_ID: Record<ModuleCode, string> = {
  LOVE: "module_love_299",
  MONEY: "module_money_299",
  BODY: "module_body_299",
  YEAR: "module_year_299",
  STYLE: "module_style_299",
  PLACE: "module_place_299",
};

export const CORE_PRICE_ID = "core_499";
export const FULL_CODE_UPGRADE_PRICE_ID = "full_code_upgrade_1000";
export const CORE_COMPLETE_PRICE_ID = "core_complete_1499";

export const MODULE_PRICE_CENTS = 299;
export const CORE_PRICE_CENTS = 499;
export const FULL_CODE_UPGRADE_CENTS = 1000;
export const CORE_COMPLETE_CENTS = 1499;

// Bundle ladder for N focused chapters bought together (no CORE).
// Index 0 unused; index 1 uses single-chapter SKU (299).
const CHAPTER_BUNDLE_CENTS: Record<number, number> = {
  1: 299,
  2: 499,
  3: 699,
  4: 899,
  5: 999,
  6: 1000,
};

const CHAPTER_BUNDLE_LOOKUP: Record<number, string> = {
  2: "bundle_modules_2_499",
  3: "bundle_modules_3_699",
  4: "bundle_modules_4_899",
  5: "bundle_modules_5_999",
  6: "bundle_modules_6_1000",
};

export interface PriceQuote {
  cents: number;
  separate_cents: number;
  saved_cents: number;
  // Stripe line items expressed as lookup keys, in display order.
  lookup_keys: string[];
  // Human-readable label for adaptive CTA / order summary heading.
  label: string;
  // Whether this quote includes CORE.
  includes_core: boolean;
  // Full list of module codes that ownership rows should be written for.
  // (Includes "CORE" when includes_core is true.)
  modules_owned_on_success: ("CORE" | ModuleCode)[];
}

/**
 * Single source of truth for pricing across UI and Stripe checkout.
 *
 * Rules:
 *  - chapters only, N=1 → single-chapter SKU
 *  - chapters only, N≥2 → bundle SKU
 *  - CORE only → CORE SKU
 *  - CORE + all 6 chapters → CORE Complete SKU (1499)
 *  - CORE + N chapters (1..5) → CORE SKU + chapter line(s) at bundle ladder
 *    (line items: CORE + bundle_modules_N for N≥2, or CORE + single chapter for N=1)
 */
export function priceForModules(
  chapters: ModuleCode[],
  includesCore: boolean,
): PriceQuote {
  const uniqueChapters = Array.from(new Set(chapters)) as ModuleCode[];
  const n = uniqueChapters.length;

  if (!includesCore && n === 0) {
    throw new Error("priceForModules: nothing selected");
  }

  const separateChapters = n * MODULE_PRICE_CENTS;
  const separate_cents = (includesCore ? CORE_PRICE_CENTS : 0) + separateChapters;

  // CORE Complete (first purchase: CORE + all 6)
  if (includesCore && n === 6) {
    return {
      cents: CORE_COMPLETE_CENTS,
      separate_cents,
      saved_cents: separate_cents - CORE_COMPLETE_CENTS,
      lookup_keys: [CORE_COMPLETE_PRICE_ID],
      label: "CORE Complete",
      includes_core: true,
      modules_owned_on_success: ["CORE", ...MODULE_CODES],
    };
  }

  // CORE only
  if (includesCore && n === 0) {
    return {
      cents: CORE_PRICE_CENTS,
      separate_cents,
      saved_cents: 0,
      lookup_keys: [CORE_PRICE_ID],
      label: "CORE Report",
      includes_core: true,
      modules_owned_on_success: ["CORE"],
    };
  }

  // CORE + 1..5 chapters
  if (includesCore && n >= 1 && n <= 5) {
    const chapterCents = CHAPTER_BUNDLE_CENTS[n];
    const cents = CORE_PRICE_CENTS + chapterCents;
    const chapterKey =
      n === 1 ? MODULE_PRICE_ID[uniqueChapters[0]] : CHAPTER_BUNDLE_LOOKUP[n];
    return {
      cents,
      separate_cents,
      saved_cents: separate_cents - cents,
      lookup_keys: [CORE_PRICE_ID, chapterKey],
      label: `CORE Report + ${n} ${n === 1 ? "chapter" : "chapters"}`,
      includes_core: true,
      modules_owned_on_success: ["CORE", ...uniqueChapters],
    };
  }

  // chapters only, no CORE
  if (n === 1) {
    return {
      cents: MODULE_PRICE_CENTS,
      separate_cents,
      saved_cents: 0,
      lookup_keys: [MODULE_PRICE_ID[uniqueChapters[0]]],
      label: `${uniqueChapters[0]} chapter`,
      includes_core: false,
      modules_owned_on_success: [...uniqueChapters],
    };
  }
  // chapters only, 2..6
  const chapterCents = CHAPTER_BUNDLE_CENTS[n];
  return {
    cents: chapterCents,
    separate_cents,
    saved_cents: separate_cents - chapterCents,
    lookup_keys: [CHAPTER_BUNDLE_LOOKUP[n]],
    label: n === 6 ? "All 6 Focused Chapters" : `${n} Focused Chapters`,
    includes_core: false,
    modules_owned_on_success: [...uniqueChapters],
  };
}
