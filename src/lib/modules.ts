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

export const MODULE_PRICE_CENTS = 299;
export const CORE_PRICE_CENTS = 499;
export const FULL_CODE_UPGRADE_CENTS = 1000;
