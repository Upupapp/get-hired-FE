/** Single source for GetHired brand mark paths (Logo Sprint 1 — light-only interim). */

export type BrandLogoVariant = 'horizontal' | 'mark';
export type BrandLogoTone = 'on-light' | 'on-dark';

export const BRAND_ASSETS = {
  horizontalOnLight: 'assets/brand/gethired-logo-horizontal-on-light-interim.png',
  markOnLight: 'assets/brand/gethired-mark-on-light-interim.png',
  /** Interim source for dark surfaces; BrandLogoComponent renders it white. */
  horizontalLegacy: 'assets/brand/Gethired-horizontal-logo.png?v=3',
} as const;

export function brandLogoSrc(
  variant: BrandLogoVariant = 'horizontal',
  tone: BrandLogoTone = 'on-light'
): string {
  if (tone !== 'on-light') {
    return BRAND_ASSETS.horizontalLegacy;
  }
  return variant === 'mark' ? BRAND_ASSETS.markOnLight : BRAND_ASSETS.horizontalOnLight;
}

export const BRAND_LOGO_ALT = 'GetHired';
