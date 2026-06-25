# GetHired SEO V4 — Social Preview / Open Graph Log

Generated: 2026-06-26

## OG & Twitter Tag Coverage

All OG and Twitter tags are set by `SeoService.setPageMeta()`. Every component that calls setPageMeta automatically gets OG + Twitter tags because they're wired into the same method.

### Tags Set Per Page

| Tag | Set by | Value |
|-----|--------|-------|
| og:type | setPageMeta | website (default) or article (job details) |
| og:url | setPageMeta | canonical or current router.url |
| og:title | setPageMeta | same as page title |
| og:description | setPageMeta | same as meta description |
| og:site_name | setPageMeta | "GetHired Online" |
| og:image | setPageMeta | DEFAULT_OG_IMAGE (logo.png) or custom |
| twitter:card | setPageMeta | summary_large_image |
| twitter:title | setPageMeta | same as title |
| twitter:description | setPageMeta | same as description |
| twitter:image | setPageMeta | same as og:image |

### index.html Static Defaults

index.html includes static OG tags as SSR defaults. These are the values Googlebot and social crawlers see before the Angular app hydrates. They match the /home page defaults and are appropriate.

## OG Image Gap (P1)

All pages currently serve `logo.png` as the OG image. Issues:
1. Logo is likely square (not 1200×630) — social platforms pad/crop it
2. Twitter "summary_large_image" card expects a landscape image — a square logo renders poorly
3. Facebook and LinkedIn will show the logo in a small square with lots of whitespace

**Resolution path:**
1. Designer creates `gethired-og-default.png` (1200×630px, branded GetHired image)
2. Place at `src/assets/brand/gethired-og-default.png`
3. Update `DEFAULT_OG_IMAGE` constant in seo.service.ts:
   ```ts
   const DEFAULT_OG_IMAGE = `${BASE_URL}/assets/brand/gethired-og-default.png`;
   ```
4. Update og:image and twitter:image in index.html

No other code changes needed — all components inherit from DEFAULT_OG_IMAGE.

## Job Detail OG Image

Job detail pages do not set a job-specific OG image (no employer logo URL reliably available). They inherit DEFAULT_OG_IMAGE. This is acceptable — a branded GetHired OG image on job shares is better than a random employer logo that may not load.

If employer logos become reliably available, PublicDetailsComponent could be updated to pass `ogImage: job.companyLogoUrl` to setPageMeta when available.

## Testing Social Previews

After OG image is created and deployed:
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter/X: https://cards-dev.twitter.com/validator (deprecated but still works)
- LinkedIn: https://www.linkedin.com/post-inspector/
- Open Graph: https://www.opengraph.xyz/
