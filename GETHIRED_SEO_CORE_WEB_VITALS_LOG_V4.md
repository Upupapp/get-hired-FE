# GetHired SEO V4 — Core Web Vitals & Performance SEO Log

Generated: 2026-06-26

## Context

Core Web Vitals are a Google ranking signal for mobile search. The key metrics are:
- LCP (Largest Contentful Paint) — target: < 2.5s
- CLS (Cumulative Layout Shift) — target: < 0.1
- INP (Interaction to Next Paint) — target: < 200ms

These are performance concerns, not crawlability concerns. Angular Universal SSR helps LCP because the browser receives rendered HTML immediately (no JS-first blank screen for Googlebot or users).

## Identified Risks

### CLS Risk 1: Brand SVG Images Without Dimensions (MEDIUM)

Brand illustrations on /home, /job-seekers, /employers are loaded as `<img>` elements without explicit `width` and `height` attributes:
```html
<img src="/assets/brand/gethired-wow/portal-gradient-mesh.svg" alt="" class="portal-hero-mesh" aria-hidden="true">
```
Without dimensions, the browser cannot reserve layout space before the image loads, causing layout shift.

**Fix (backlog):** Add explicit `width` and `height` to these img elements. Since they're SVGs with defined viewBoxes, the correct approach is to set CSS `width: 100%` and use `aspect-ratio` in CSS, or set pixel dimensions matching the SVG's intrinsic size.

**Risk level:** MEDIUM — these are decorative images, positioned absolutely or with overflow hidden in some cases, so actual CLS impact may be low. Measure in PageSpeed Insights before prioritizing.

### CLS Risk 2: Angular Material and Bootstrap Loading

CSS from external sources (Google Fonts, Bootstrap CDN, Material Icons CDN) can cause FOUT/FOIT and minor layout shifts if they arrive after initial render. These are standard third-party dependencies and cannot be eliminated without self-hosting.

**Mitigation already in place:** `<link rel="preconnect">` for fonts.googleapis.com and fonts.gstatic.com is in index.html. This reduces font load latency.

### LCP: SSR Mitigates Worst Case

Angular Universal SSR is confirmed working. The LCP element on public pages is likely the hero section heading or background image. Since SSR delivers rendered HTML, the LCP is not blocked by JavaScript execution.

### Render-Blocking Resources

index.html loads synchronously:
- Bootstrap JS from CDN (cdnjs.cloudflare.com) — has `integrity` + `crossorigin` but no `defer`
- Google Maps API — has `defer` ✓
- Popper.js from CDN — no `defer`

**Risk:** Bootstrap JS and Popper.js without `defer` block HTML parsing. They are listed after the `<link>` tags but before `</head>`, which means they block the initial render.

**Fix (backlog, low priority):** Add `defer` attribute to Bootstrap JS and Popper.js script tags.

### Skeleton Loading CSS (Implemented in V3)

`styles.scss` contains `.gh-skeleton`, `.gh-skeleton-card`, `.gh-job-card-hover` with prefers-reduced-motion guards. These are in place and functional. They reduce perceived load time for the jobs list but do not directly affect Core Web Vitals metrics.

## Summary Table

| Risk | Severity | Status |
|------|----------|--------|
| SVG images without dimensions (CLS) | MEDIUM | Backlog V5 |
| Bootstrap/Popper no defer (LCP) | LOW | Backlog V5 |
| Font FOIT (CLS/LCP) | LOW | Backlog V5 |
| Blank-screen SPA (LCP) | ELIMINATED | SSR working |
| Skeleton loading | PRESENT | ✓ V3 |

## Measurement

Run these after deploy:
```
https://pagespeed.web.dev/report?url=https://gethiredonline.app/home
https://pagespeed.web.dev/report?url=https://gethiredonline.app/jobs
```
Target scores: Performance > 70 mobile, > 90 desktop.
