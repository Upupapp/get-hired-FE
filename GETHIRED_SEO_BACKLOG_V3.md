# GETHIRED SEO Backlog V3

Generated: 2026-06-25

## P1 — Blocking / Critical

| ID | Item | File | Notes |
|----|------|------|-------|
| B1 | Create `/assets/brand/gethired-og-default.png` (1200×630) | assets/brand/ | Required for social previews |
| B2 | Verify `/assets/images/logo.png` exists for Organization JSON-LD | assets/images/ | Required for Google rich results |

## P2 — High Value / Should Do

| ID | Item | File | Notes |
|----|------|------|-------|
| P2-01 | Fix soft 404 — return HTTP 404 status in SSR server.ts for wildcard routes | server.ts | Helps Google de-index stale URLs faster |
| P2-02 | Add company pages to sitemap.xml endpoint | get-hired-BE/server.js | Needs company page URLs with ?id= format |
| P2-03 | Apply `.gh-skeleton-card` to app-job-posts-list loading state | job-posts-list component | CSS already ready, needs wiring |
| P2-04 | Apply `.gh-job-card-hover` to public job card component | job card component | CSS already ready |
| P2-05 | Add `loading="lazy"` to company logo images in job cards | job card component | CLS improvement |
| P2-06 | Add explicit `width` and `height` to company logo img tags | job card component | CLS prevention |
| P2-07 | Add visual breadcrumb component on job detail page | public-details.component.html | Crawlable internal links + UX |
| P2-08 | Replace Angular router navigation buttons with `<a href>` for key internal links | main-portal.component.html | Crawlable links for Googlebot |
| P2-09 | Add "Back to jobs" `<a href="/jobs">` link on job detail page | public-details.component.html | Internal linking |
| P2-10 | Verify "thousands" in jobs meta description matches actual count | public-list.component.ts | Copy accuracy |
| P2-11 | Add Organization JSON-LD to company detail page | public-company-details.component.ts | Company page structured data |

## P3 — Nice To Have

| ID | Item | Notes |
|----|------|-------|
| P3-01 | Google Indexing API integration for fast job publish/depublish | See GETHIRED_SEO_GOOGLE_INDEXING_API_PLAN_V3.md |
| P3-02 | SSR canonical via link element server-side | Requires Angular Universal TransferState or custom SSR middleware |
| P3-03 | Add component-level noindex to /signup, /reset-password, /change-password, /verify | robots.txt covers these; component noindex is belt-and-suspenders |
| P3-04 | Per-job OG image (use job banner URL when available) | Improve social share for job detail pages |
| P3-05 | Twitter site handle (twitter:site) | Needs verified Twitter account URL |
| P3-06 | Add public /companies index page | Currently no standalone company list route |
| P3-07 | Switch company route to path param (/companies/:id) | Cleaner SEO-friendly URL pattern |
| P3-08 | Sitemap index file for scale | Only needed if total URLs exceed 50,000 |
| P3-09 | rel=prev/rel=next for paginated job list (if pagination is added) | Future feature |
| P3-10 | Font preloading for Manrope/DM Sans | Reduces FOUT, minor LCP improvement |
| P3-11 | Hero image preload (`<link rel="preload">`) | LCP improvement for homepage hero |
| P3-12 | Tagalog (tl) i18n + URL prefixes + hreflang | Only if URL-based language switching is adopted |
