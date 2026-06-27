# GetHired OPTIMIZE Release Gate — SEO V3

**Date:** 2026-06-25
**Deployment:** SEO V3 (FE bf5bd08 + fixes, BE 26ca25a + fixes)

---

## Performance Gates

| Gate | Status | Notes |
|---|---|---|
| SeoService creates no duplicate JSON-LD tags | PASS | `getElementById` + replace-in-place; no accumulation |
| JSON-LD cleanup on route exit (public-details) | PASS | `clearJobPostingJsonLd` + `clearBreadcrumbJsonLd` + `seoSub.unsubscribe()` in ngOnDestroy |
| JSON-LD cleanup on route exit (public-list) | PASS | FIX-01 added ngOnDestroy with clearBreadcrumbJsonLd |
| JSON-LD cleanup on route exit (public-company-details) | PASS | FIX-02 added clearBreadcrumbJsonLd to existing ngOnDestroy |
| sitemap.xml: no DB query on every request | PASS | FIX-06 added 1-hour in-memory cache |
| sitemap.xml: correct date format in `<lastmod>` | PASS | FIX-07 fixed `now` (numeric) → `today` (YYYY-MM-DD string) |
| Skeleton CSS shimmer is GPU-only (no layout) | PASS | `background-position` animation only |
| Hover lift is compositor-only (no CLS) | PASS | `transform: translateY` — no layout trigger |
| `prefers-reduced-motion` guard on shimmer | PASS | `animation: none` + static background |
| `prefers-reduced-motion` guard on hover lift | PASS | `transform: none` in reduce block |
| SeoService bundle: tree-shakable | PASS | `providedIn: 'root'` + injected in 10 components = included intentionally |
| No duplicate Title injection on portal pages | PASS | FIX-03/04/05 removed constructor titleService calls |
| robots.txt served as static asset | PASS | Listed in angular.json `assets` array |
| robots.txt disallows authenticated routes | PASS | /admin, /recruiter, /user, /owner, /investor, /api, /payment, /subscription, /signin, /signup, /reset-password, /change-password, /verify |
| Sitemap declaration in robots.txt | PASS | `Sitemap: https://gethiredonline.app/sitemap.xml` |

---

## SEO Gates

| Gate | Status | Notes |
|---|---|---|
| Public job detail: JobPosting JSON-LD with required fields | PASS | `@context`, `@type`, `title`, `description`, `datePosted`, `hiringOrganization`, `jobLocation`, `url` |
| JobPosting only for status=2 (published) jobs | PASS | Guarded with `if (job.jobStatusId === 2)` |
| Inactive job detail: `noindex, nofollow` | PASS | `robots: job.jobStatusId === 2 ? 'index, follow' : 'noindex, nofollow'` |
| Homepage: Organization + WebSite JSON-LD | PASS | `setOrganizationJsonLd()` + `setWebsiteJsonLd()` called in main-portal ngOnInit |
| Search results page: `noindex, follow` | PASS | public-search sets `robots: 'noindex, follow'` |
| Auth pages: `noindex, nofollow` | PASS | signin and 404 use appropriate robots directives |
| OG defaults in index.html (SSR fallback) | PASS | og:title, og:description, og:type, og:url, og:site_name, twitter:card present |
| Canonical URL set per-route | PASS | Passed in `setPageMeta` config on all public indexable pages |
| `<link rel="canonical">` created by SeoService (browser only) | PASS | `setCanonical` creates/updates link element |
| sitemap.xml returns valid XML (status 200) | PASS | Try/catch with 500 fallback XML |
| sitemap.xml Cache-Control header | PASS | `public, max-age=3600` |
| sitemap.xml `<lastmod>` format | PASS | ISO date string `YYYY-MM-DD` after FIX-07 |

---

## Core Web Vitals Readiness

| Metric | Assessment |
|---|---|
| LCP | Not impacted by SEO V3. OG image is in `<meta>`, not `<img>`. Static `<head>` meta tags add negligible parse time. |
| CLS | No new layout-shift risks. Skeleton placeholders reserve space via fixed heights. Hover lift uses compositor-only transform. |
| FID / INP | No blocking main-thread work at route change. JSON-LD mutations touch `<head>` only (off-screen). |
| TBT | No new scripts or synchronous operations introduced. |

---

## Risks Remaining (not blocking)

| Risk | Severity | Notes |
|---|---|---|
| Canonical link not injected server-side (SSR gap) | Low | Returns early in `setCanonical` when not browser. Not blocking — app is CSR today. |
| Organization/WebSite JSON-LD not cleaned up on navigate away from / | Low | Intentional: org schema is globally appropriate. Google de-dupes. No fix needed. |
| Sitemap cache is process-scoped (resets on restart) | Low | First post-restart request pays the DB cost. Acceptable. |
| Newly published jobs may not appear in sitemap for up to 1 hour | Low | Acceptable for sitemap use case. Googlebot re-crawls anyway. |
| `localStorage` accessed at field-init level in public-search (SSR risk) | Low | `public loggedUserData: any = JSON.parse(localStorage.getItem('userData'))` — throws on SSR. No SSR active currently. |

---

## Overall Readiness

| Domain | Readiness |
|---|---|
| Core Web Vitals | **Ready** |
| SEO (structured data, canonical, robots) | **Ready** |
| Memory / cleanup | **Ready** (post-fixes) |
| Backend sitemap | **Ready** (post-fixes) |
| Bundle size | **Ready** |
