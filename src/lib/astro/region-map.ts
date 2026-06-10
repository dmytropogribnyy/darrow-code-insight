// PLACE-GEO v1 — reachable-region map for the `selected_countries` recommendations pass.
//
// The regional pass exists because "consider Lille" is actionable for someone born in Paris in a
// way "consider Auckland" is not — the report should contain BOTH reachable and aspirational
// geography. Derived from the user's birth country (current city is not collected at checkout —
// owner decision 2026-06-10: birth city is the mandatory anchor field).
//
// Countries with no entry → caller skips the regional pass and uses country_scope:"all" only.

export const ACG_REGION_MAP: Record<string, string[]> = {
  // Western / Southern Europe
  FR: ["FR", "ES", "PT", "IT", "BE", "CH", "DE", "GB", "NL"],
  ES: ["ES", "PT", "FR", "IT", "MA", "GB", "DE"],
  PT: ["PT", "ES", "FR", "IT", "GB", "DE"],
  IT: ["IT", "FR", "ES", "CH", "AT", "DE", "GR", "HR"],
  DE: ["DE", "AT", "CH", "NL", "FR", "PL", "CZ", "DK", "ES"],
  GB: ["GB", "IE", "FR", "ES", "PT", "NL", "DE"],
  IE: ["IE", "GB", "FR", "ES", "PT", "NL"],
  NL: ["NL", "BE", "DE", "FR", "GB", "DK", "ES"],
  BE: ["BE", "NL", "FR", "DE", "GB", "ES"],
  CH: ["CH", "DE", "FR", "IT", "AT", "ES"],
  AT: ["AT", "DE", "CH", "IT", "CZ", "HU", "HR"],
  GR: ["GR", "IT", "CY", "BG", "TR", "ES"],
  // Central / Eastern Europe
  PL: ["PL", "DE", "CZ", "SK", "LT", "SE", "NL", "GB"],
  CZ: ["CZ", "DE", "AT", "PL", "SK", "HU"],
  UA: ["UA", "PL", "CZ", "DE", "ES", "PT", "GE", "TR"],
  RO: ["RO", "HU", "BG", "DE", "AT", "IT", "ES"],
  HU: ["HU", "AT", "CZ", "SK", "RO", "HR", "DE"],
  // Nordics / Baltics
  SE: ["SE", "NO", "DK", "FI", "DE", "NL", "GB"],
  NO: ["NO", "SE", "DK", "GB", "NL", "DE"],
  DK: ["DK", "DE", "SE", "NO", "NL", "GB"],
  FI: ["FI", "SE", "EE", "DE", "NL"],
  // Americas
  US: ["US", "CA", "MX"],
  CA: ["CA", "US", "MX"],
  MX: ["MX", "US", "CA", "CO", "ES"],
  BR: ["BR", "AR", "UY", "CL", "PT", "ES"],
  AR: ["AR", "CL", "UY", "BR", "ES", "IT"],
  // Middle East / Caucasus
  AE: ["AE", "SA", "QA", "OM", "GE", "TR", "CY"],
  IL: ["IL", "CY", "GR", "GE", "ES", "PT"],
  TR: ["TR", "GE", "GR", "CY", "BG", "DE", "ES"],
  GE: ["GE", "TR", "AM", "AZ", "GR", "CY", "DE"],
  // Asia-Pacific
  IN: ["IN", "AE", "SG", "TH", "LK", "NP"],
  SG: ["SG", "MY", "TH", "ID", "VN", "AU"],
  JP: ["JP", "KR", "TW", "SG", "TH", "AU"],
  AU: ["AU", "NZ", "SG", "ID", "JP"],
  NZ: ["NZ", "AU", "SG", "JP"],
  // Africa
  ZA: ["ZA", "NA", "BW", "MZ", "MU", "GB", "PT"],
  EG: ["EG", "CY", "GR", "AE", "SA", "TR"],
  MA: ["MA", "ES", "PT", "FR", "IT"],
};

/** Regional country list for the birth country, or null → run the global pass only. */
export function regionForCountry(isoCountry: string | null | undefined): string[] | null {
  if (!isoCountry) return null;
  return ACG_REGION_MAP[isoCountry.toUpperCase()] ?? null;
}
