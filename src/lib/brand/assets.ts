// Darrow Code — canonical brand asset registry.
//
// Single source of truth for every reference to brand imagery across the app.
// Files live in /public/brand/ and are served as static assets. The launch
// requirements spec (see ./darrowcode_launch_requirements.md) defines naming,
// sizes, and where each asset is used.
//
// Do NOT introduce alternate logos, icons, or stock graphics elsewhere.
// To add a new asset: drop the file in /public/brand/ and register it here.

export const BRAND_COLORS = {
  navy: "#0A0F1E",
  gold: "#D4AF37",
  ivory: "#F6F4EF",
  textLight: "#E5E7EB",
  textMuted: "#9CA3AF",
  textDark: "#151922",
  textBronze: "#4A402D",
  hairline: "#6B6B6B",
  surfaceDark: "#151922",
} as const;

export const BRAND_FONTS = {
  display: "'Cormorant SC', serif",
  serif: "'Cormorant Garamond', serif",
  sans: "'Inter', system-ui, sans-serif",
} as const;

// Relative paths — resolved against the host at request time.
export const BRAND_ASSETS = {
  symbolGold: "/brand/darrow-symbol-gold.png",
  symbolSmall: "/brand/darrow-symbol-small.png",
  favicon: "/brand/darrow-favicon.png",
  socialPreview: "/brand/darrow-social-preview.png",
  emailHeader: "/brand/email-header.png",
} as const;

export type BrandAssetKey = keyof typeof BRAND_ASSETS;

/**
 * Build an absolute URL for a brand asset. Required when the asset must be
 * fetched by an external renderer (PDF service, email client, OG crawler).
 */
export function brandAssetUrl(key: BrandAssetKey, baseUrl?: string): string {
  const path = BRAND_ASSETS[key];
  if (!baseUrl) return path;
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}
