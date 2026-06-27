# GETHIRED SEO Architecture & Policy Contract V3

Generated: 2026-06-25

## Core Policy

### Public Indexable Routes
- MUST have: `<title>`, `<meta name="description">`, `<meta name="robots" content="index, follow">`, canonical `<link>`, OG tags.
- SHOULD have: JSON-LD structured data (JobPosting on job detail, Organization + WebSite on homepage, BreadcrumbList on job detail and company detail).
- MUST NOT expose: private user data, unauthenticated API data, unpublished job IDs.

### Private / Auth-Only Routes
- MUST have: `<meta name="robots" content="noindex, nofollow">` (or at minimum `noindex`).
- robots.txt Disallow covers these paths as a belt-and-suspenders backup.
- Route guards (AuthGuard, EmployerGuard, ApplicantGuard, AdminGuard) remain unchanged — SEO noindex is additive.

### Search / Filtered Results
- `/jobs/search/:keyword` → `noindex, follow` + canonical pointing to `/jobs`.
- Prevents keyword-URL duplicate content crawl.

### Expired / Unpublished Jobs
- Job detail page (`/jobs/details/:id`) → sets `noindex, nofollow` when `job.jobStatusId !== 2`.
- JobPosting JSON-LD is only emitted for `jobStatusId === 2` (published/active).

### Structured Data Rules
- ALL structured data values must come from real API data — never fabricated.
- Forbidden fields: fake salary, fake ratings, fake reviews, fake logos, fake employer claims.
- JobPosting is only emitted on the PUBLIC job detail page for active jobs.
- Organization + WebSite JSON-LD is only on the homepage.
- BreadcrumbList is on job detail and company detail pages.

### Canonical Policy
- Every public page calls `seoService.setCanonical(url)`.
- Canonical URL uses the clean base URL (no query params for list/search).
- Company detail uses `?id=` param in canonical since that IS the canonical form for this page.

### Social Preview Policy
- Every public page sets og:title, og:description, og:type, og:url, og:site_name.
- og:image defaults to the GetHired brand image (file: `/assets/brand/gethired-og-default.png`).
- Twitter card: `summary_large_image` on all public pages.

### hreflang Policy
- NOT implemented. URLs do not have language prefixes (/en/, /tl/ etc.) — ngx-translate uses the same URL for all languages. Adding hreflang would create duplicate-URL signals with no benefit.

## SeoService Contract (seo.service.ts)
- Location: `src/app/core/services/seo.service.ts`
- Provided in root (`providedIn: 'root'`)
- All document/window access guarded with `isPlatformBrowser(platformId)` for SSR safety.
- JSON-LD blocks are injected by ID and replaced on navigation — no accumulation of stale tags.

## SSR (Angular Universal) Policy
- `setCanonical()` is skipped in non-browser context (no direct DOM access).
- `setJsonLd()` is skipped in non-browser context.
- `Meta` and `Title` services work in SSR context (Angular handles these server-side).
