# GetHired SEO V4 — Internal Linking & Breadcrumb Log

Generated: 2026-06-26

## Breadcrumb JSON-LD Status

BreadcrumbList JSON-LD is implemented on three public pages:

| Page | Breadcrumb chain |
|------|-----------------|
| /jobs | Home > Jobs |
| /jobs/details/:id | Home > Jobs > [Job Title] |
| /companies/details | Home > Companies > [Company Name] |

All use real data (no fabricated labels). All use `https://gethiredonline.app` URLs. All are cleared on ngOnDestroy.

## V4 SSR Fix Impact on Breadcrumbs

Previously, BreadcrumbList JSON-LD was browser-only (isBrowser guard). Post-V4 DOCUMENT fix, breadcrumb JSON-LD is now in SSR HTML. Google can parse it from the first HTTP response, increasing rich result eligibility.

## Visual Breadcrumb Navigation

**Status: NO visual breadcrumb UI component exists**

JSON-LD breadcrumbs give Google rich result eligibility, but there is no visible breadcrumb navigation on any page. This is a V5 enhancement:
- Users can't see where they are in the site hierarchy
- Missing `<nav aria-label="breadcrumb">` UI means no accessibility benefit

**Backlog:** Implement a simple visual breadcrumb component for job detail and company detail pages. Use `<a>` tags (crawlable). Pair with the existing JSON-LD.

## Internal Linking (Crawlable `<a>` Tags)

### 404 Page (FIXED in V3)
The 404 page has recovery `<a href="/home">` and `<a href="/jobs">` links — confirmed in template. Googlebot can follow these to rediscover public pages.

### Hero/Portal CTAs (KNOWN ISSUE from V3 N6 — still open)
`/home`, `/job-seekers`, `/employers` navigation buttons use Angular `(click)` handlers and `router.navigateByUrl()` — NOT `<a href>` tags. Googlebot's crawl via link following will NOT find these CTAs as crawlable links.

Impact: Google may not discover /job-seekers and /employers via link following from /home alone. However:
1. Both URLs are in the sitemap (mitigates discovery)
2. Both are in the robots.txt Allow scope
3. Googlebot will find them via sitemap even without crawlable CTAs

Recommended fix (V5): Wrap major navigation CTAs in `<a [href]="url">` instead of pure `(click)` handlers. Angular Router supports this pattern without breaking SPA navigation.

## Site-Wide Navigation Links

The app has a navigation/sidebar structure in employer and applicant panels, but these are private (auth-guarded) routes — not relevant to SEO crawling.

The public navigation (header/footer) was not fully audited — check that `<a href="/home">`, `<a href="/jobs">` links exist in PublicComponent's nav/header template.
