# GETHIRED_SEO_PERFORMANCE_ACCESSIBILITY_MOBILE_QA_V2
Command: GETHIRED_REUSABLE_SEO_SEARCH_INDEXING_PUBLIC_DISCOVERY_COMMAND_V2
Date: 2026-06-27

---

## Performance Baseline

### Angular Universal SSR — The Primary Performance Win
With SSR enabled, Googlebot and real users receive fully-rendered HTML from the first byte. This eliminates the "blank page until JS runs" problem that destroys LCP scores on pure SPAs.

**Expected LCP impact:** Significant improvement over non-SSR Angular. Server should return first meaningful HTML within 200-500ms (depends on Linode + PM2 performance).

---

## Core Web Vitals Assessment

### LCP (Largest Contentful Paint) — Target < 2.5s

**Risk factors:**
- Logo/hero images on home and marketing pages — need width/height attributes and lazy/eager loading hints
- Job cards with company logos — if images load slowly, they become LCP element
- SSR render time on Node/PM2 — monitor PM2 process memory

**Positive factors:**
- SSR renders page structure immediately
- nginx serves static assets with appropriate caching
- default OG image at 95KB is reasonably sized

**Status:** Not benchmarked in this session. Backlog: run Lighthouse on `/home` and `/jobs` from a mobile-simulated connection.

---

### CLS (Cumulative Layout Shift) — Target < 0.1

**Risk factors:**
- Company logos in job cards: if no `width`/`height` attributes, browser can't reserve space → shift when image loads
- Angular animations on job card mount/enter
- Font loading without preload hints

**Recommendation:**
- All `<img>` tags on public pages should have explicit `width` and `height` attributes, or equivalent CSS `aspect-ratio`
- Angular fade-in animations should use `opacity` transitions (no layout shift) rather than `height`/`margin` animations

**Status:** Not fixed in this session. Backlog item.

---

### FID / INP (Interaction to Next Paint) — Target < 200ms

Public job board and job detail pages are primarily read-heavy. Minimal user interaction before hydration. Risk is LOW.

Main interaction on `/jobs`:
- Search/filter inputs — should respond instantly
- Job card click → navigate to detail page

If Angular bundle size is large, main thread blocking on parse/execute can delay first interactions. This should be monitored via Lighthouse JS parse time.

---

## Mobile Optimization

### Viewport Configuration
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```
✅ Present in `index.html`. Standard mobile viewport.

### Mobile Usability Issues (Not Fixed This Session)

**Known P0 from previous SECURE/NOTIFY audit:**
- Submit footer on forms has `z-index: 99` — behind mobile bottom nav (`z-index: 999`)
- Save button may be untappable on mobile
- **Status:** Flagged in `todo_master.md`, not yet fixed
- **SEO impact:** Google's mobile-first indexing penalizes non-tappable CTAs

### Touch Target Sizes
- `gh-form-card` design system enforces 44px input heights (matches Apple's minimum touch target guidelines)
- Public pages use Bootstrap and Angular Material — touch targets depend on component configuration

**Backlog:** Audit all public page CTAs for minimum 44×44px touch target compliance.

---

## Mobile-First Indexing

Google uses mobile-first indexing — it crawls and indexes the mobile version of your site. Since GetHired uses Angular Universal SSR with responsive CSS (Bootstrap), the same HTML is served to all clients.

**Risk:** Desktop-optimized content that's hidden on mobile via `display: none` or `visibility: hidden` can be excluded from the index. Verify that key content (job titles, descriptions, apply buttons) is not hidden on mobile viewports.

**Status:** Not verified. Backlog: check public components for `d-none d-md-block` patterns on key content.

---

## Asset Optimization

| Asset Type | Status | Recommendation |
|---|---|---|
| OG image (95KB JPEG) | ✅ Acceptable | Already good |
| Company logos (Firebase Storage) | Unknown | Should be WEBP with JPEG fallback, served via CDN |
| Brand logo assets | Unknown | Need audit for format + compression |
| JS bundle | Unknown | Run `ng build --stats-json` + webpack-bundle-analyzer |
| CSS | Angular Material + Bootstrap | Large framework CSS; defer non-critical CSS |

---

## No Code Changes Made

This is an assessment-only log. Performance improvements are tracked in the backlog.
