# GetHired SEO V4 — Image SEO & Asset Log

Generated: 2026-06-26

## OG Image Status

### Primary OG image (MISSING — P1 Backlog)
- **Expected path:** `src/assets/brand/gethired-og-default.png`
- **Status:** Does NOT exist
- **Current fallback:** `https://gethiredonline.app/assets/images/logo.png`
- **Impact:** Social sharing (Facebook, Twitter, LinkedIn, Slack) shows the logo as preview image. Logo is likely square and small — will not fill the 1200×630 social card well.
- **Action needed:** Create a 1200×630 branded OG image and place at `src/assets/brand/gethired-og-default.png`. Then update `DEFAULT_OG_IMAGE` in seo.service.ts and `og:image`/`twitter:image` in index.html.

### logo.png (EXISTS — PASS)
- **Path:** `src/assets/images/logo.png`
- **Status:** File confirmed present
- **Used for:** OG image fallback, Organization JSON-LD logo field
- **Impact:** Organization JSON-LD has a valid logo URL. OG image is functional (not ideal, but not broken).

## Alt Text Audit — Public Pages

### Decorative images (correctly using alt="" + aria-hidden="true")
All brand illustrations/SVGs on the portal pages use `alt=""` with `aria-hidden="true"` — correct pattern for purely decorative images that convey no unique information to screen readers.

Examples verified:
- `<img src="/assets/brand/gethired-wow/portal-gradient-mesh.svg" alt="" aria-hidden="true">`
- `<img [src]="item.icon" alt="" aria-hidden="true">` (USP pillar icons)
- `<img src="/assets/brand/gethired-wow/video-answer-orb.svg" alt="">` (video story card)

### Role card images
`<img [src]="icon" alt="">` — empty alt. For decorative role-selection icons, empty alt is correct (the adjacent text label provides the meaning).

### No informational images missing alt text
No `<img>` tags found in public-facing templates without an `alt` attribute at all. Pattern is consistently either `alt=""` (decorative) or the adjacent text provides context.

## Image Performance Notes

- Brand SVGs from `/assets/brand/gethired-wow/` are inline SVG files served as img tags — no width/height attributes explicitly set (causes potential CLS)
- Recommendation: add explicit `width` and `height` attributes to brand SVG `<img>` elements to allow browsers to reserve layout space before the image loads
- This is a Core Web Vitals concern — see GETHIRED_SEO_CORE_WEB_VITALS_LOG_V4.md

## Font Loading

Google Fonts are loaded via `<link href="https://fonts.googleapis.com/..." rel="stylesheet">` without `font-display: swap`. This can cause FOIT (Flash of Invisible Text) on slow connections. Not a direct indexing issue but affects CLS/LCP.

Recommendation: add `&display=swap` to the Google Fonts URL (already present in some apps but not confirmed here). Low priority for SEO.
