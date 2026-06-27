# GETHIRED SEO Core Web Vitals Log V3

Generated: 2026-06-25

## Audit Overview
Research-only phase — identifying CWV risks from static code analysis. No Lighthouse run available in this context.

## LCP (Largest Contentful Paint) Risks

### /home — MainPortalComponent
- Hero section (`portal-hero`) uses CSS gradient mesh SVG as background image.
- Hero title `<h1 class="portal-hero-title">` is text — fast to render, good.
- USP pillar SVGs loaded lazily by default (no `<link rel="preload">`).
- **Risk:** If the portal hero background SVG is large, it delays LCP. Use `loading="eager"` on hero images or preload the hero CSS background.

### /jobs — PublicListComponent
- Job cards rendered by `app-job-posts-list` which makes API calls to fetch jobs.
- API response time directly affects when job cards (likely LCP element) appear.
- **Risk:** Slow API = bad LCP. Skeleton loading (Phase 21) mitigates perceived performance.

### /jobs/details/:id — PublicDetailsComponent
- Header uses `background-image: url(~/src/assets/images/placeholder/job-post-banner.png)`.
- This is a placeholder PNG loaded as a CSS background — NOT preloaded.
- **Risk:** CSS background images are not discoverable by the browser preload scanner. Could delay LCP if banner is the LCP element.

## CLS (Cumulative Layout Shift) Risks

### Job Cards
- If company logos load without explicit `width` and `height` attributes, they will cause layout shift when they load.
- **Action:** Add explicit dimensions to logo `<img>` tags in job card components.

### Banner Image
- `bg-banner` uses `height: 260px` (fixed height) — good, no CLS from banner.

### portal-hero sections
- Height appears to be CSS-based with fixed sizing — low CLS risk.

### Font Loading
- Google Fonts loaded via `<link>` in index.html with `display=swap` parameter — this prevents FOIT but can cause FOUT (Flash of Unstyled Text = slight CLS).
- Mitigate with `font-display: optional` for non-critical fonts, or preconnect to fonts.gstatic.com (already present in index.html).

## FID / INP (Interaction)
- Angular 13 bundle size is flagged in angular.json: `maximumWarning: 4mb, maximumError: 5mb`.
- Lazy-loading modules (PublicModule, AuthModule, AdminPanelModule etc.) helps split the bundle.
- No heavy synchronous JavaScript blocking identified in the component code reviewed.

## Recommendations

| Issue | Fix | Priority |
|-------|-----|---------|
| No LCP preload for hero image | Add `<link rel="preload">` for hero SVG/background | P2 |
| Company logo CLS | Add width+height to img tags in job card | P2 |
| Slow API → late LCP on /jobs | Skeleton loading (Phase 21 implemented) | Done |
| Font FOUT | Consider `font-display: optional` for body font | P3 |
| Large initial bundle | Audit angular.json budget violations | P2 |

## Skeleton Loading (Phase 21 — Implemented)
Global CSS classes added to `styles.scss`:
- `.gh-skeleton` — base shimmer animation with prefers-reduced-motion guard.
- `.gh-skeleton-card` — card-level skeleton wrapper.
- `.gh-skeleton-title`, `.gh-skeleton-subtitle`, `.gh-skeleton-line`, `.gh-skeleton-tag` — skeleton block shapes.
- `.gh-job-card-hover` — hover lift animation with prefers-reduced-motion guard.
