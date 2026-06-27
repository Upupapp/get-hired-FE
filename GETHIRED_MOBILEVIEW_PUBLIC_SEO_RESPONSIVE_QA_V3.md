# GETHIRED MOBILEVIEW — Public SEO & Responsive QA V3
Generated: 2026-06-26

---

## Core Web Vitals / Mobile SEO Context

GetHired uses Angular Universal SSR for public routes (/home, /jobs, /jobs/details/:id, /jobs/search/:kw).
SSR ensures:
- Content visible to search crawler on first HTML response
- LCP (Largest Contentful Paint) candidate rendered server-side
- Meta tags / JSON-LD injected before hydration

---

## Meta Tag Coverage (SeoService)

| Route | Title | Description | Canonical | robots |
|-------|-------|-------------|-----------|--------|
| /home | Dynamic (role selector) | Default OG | — | index, follow |
| /jobs | Browse Jobs in the Philippines | Thousands of jobs... | https://gethiredonline.app/jobs | index, follow |
| /jobs/details/:id | [Job Title] — [Company] | Job description text | /jobs/details/:id | index, follow |
| /jobs/search/:kw | Search results for [:kw] | Dynamic | /jobs/search/:kw | index, follow |

SEO fix confirmed: `jobLocationType: 'TELECOMMUTE'` for remote jobs, `description` fallback to `jobTitle` — from prior sprint.

---

## JSON-LD / Structured Data

- BreadcrumbList on /jobs: CONFIRMED in public-list.component.ts (ngOnInit → setBreadcrumbJsonLd)
- BreadcrumbList on /jobs/details/:id: CONFIRMED in job-posts-details.component.ts
- JobPosting schema on /jobs/details/:id: set by SeoService (previous sprint fix)
- BreadcrumbList cleared on ngOnDestroy (public-list clears on navigate away)

---

## OG Image

- Default OG image: `https://gethiredonline.app/assets/brand/gethired-og-default.png`
- File exists at `src/assets/brand/gethired-og-default.png` (confirmed V2)
- Referenced in index.html (fallback) and seo.service.ts (DEFAULT_OG_IMAGE constant)
- CONFIRMED correct — no logo.png fallback bug (fixed in prior sprint)

---

## Mobile Viewport

- `<meta name="viewport" content="width=device-width, initial-scale=1">` — standard Angular setup
- No user-scalable=no constraint (accessibility good practice)

---

## Public Content Not Hidden

Critical constraint check: **DO NOT hide SEO-critical content on mobile.**

- Job title, description, company name, location: rendered in DOM on SSR, not hidden
- Banner decorative elements (banner-person, banner-float-*): set to width:0px at 860px — INVISIBLE, not display:none
  - This is CORRECT: they're decorative images, not text content
- Job list cards: visible on mobile via Bootstrap col-12

---

## CLS (Cumulative Layout Shift)

- `.gh-breadcrumb-nav`: `min-height: 2rem; contain: layout` — prevents CLS from breadcrumb mount
- Skeleton loaders: `.gh-skeleton-card` fills layout space while content loads — prevents CLS

---

## Responsive Images

- Global rule: `img { max-width: 100%; height: auto }` in styles.scss
- Banner images use background-size:cover, not img tags (no CLS risk from img intrinsic dimensions)
- OG image referenced in meta tag only (not displayed on page)

---

## Issues Found

None critical. All SEO-critical content is visible on mobile. All structured data in place.
