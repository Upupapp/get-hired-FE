# GetHired SEO V4 — Architecture & Policy Contract

Generated: 2026-06-26

## Architecture Overview

### Central SEO Service
File: `src/app/core/services/seo.service.ts`
Status: V3 created, V4 upgraded (DOCUMENT injection fix)

The SeoService is the single authoritative owner of all SEO-related document mutations. No component may write directly to `<title>`, `<meta>`, `<link rel="canonical">`, or `<script type="application/ld+json">` except through SeoService methods.

### V4 Architectural Fix: DOCUMENT Token Injection

V3 used bare `document` and `window` globals inside `setCanonical`, `clearCanonical`, `setJsonLd`, `clearJsonLd`, and `stripHtml`. These globals do not exist in Angular Universal's server-side rendering context.

V4 replaces all bare `document` references with `@Inject(DOCUMENT) private doc: Document` from `@angular/common`. The DOCUMENT token resolves to the real browser DOM in the browser and to Angular Universal's DOM stub on the server. This ensures:
- Canonical `<link>` tags are emitted in SSR HTML (seen by Googlebot)
- JSON-LD `<script>` blocks are emitted in SSR HTML (Rich Results eligible on first crawl)
- No more isBrowser guards needed for DOM mutations (except `stripHtml` server path still uses regex for safety)

### SSR Strategy
- Angular Universal is confirmed working (Googlebot curl returns real `<title>`)
- All SeoService methods are now fully SSR-safe after the DOCUMENT injection fix
- No Angular server.ts changes needed

## Indexability Policy

| Surface | Policy | Reason |
|---------|--------|--------|
| /home | index, follow | Primary entry point |
| /jobs | index, follow | Primary job discovery |
| /jobs/details/:id (jobStatusId=2) | index, follow | Google for Jobs eligibility |
| /jobs/details/:id (jobStatusId≠2) | noindex, nofollow | Expired/draft jobs not indexable |
| /job-seekers | index, follow | Public marketing page |
| /employers | index, follow | Public marketing page |
| /companies/details | index, follow | Public company profile |
| /jobs/search/:keyword | noindex, follow | Duplicate content (parameterized) |
| /signin /signup /reset-password /change-password /verify | noindex, nofollow | Authentication flows — private |
| /admin/* /recruiter/* /user/* | noindex (robots.txt Disallow + guards) | Private dashboards |
| 404 page | noindex, follow | Standard 404 policy |

## Canonical URL Policy

- All indexable pages set an explicit canonical URL via `seoService.setPageMeta({ canonical: '...' })`
- Noindex pages: canonical is intentionally omitted (SeoService clears any stale canonical)
- Search result pages (/jobs/search/:keyword): canonical points to /jobs (deduplication)
- Company pages: canonical uses query-param URL (`/companies/details?id=X`) — not ideal but matches actual URL structure; clean URL migration is a V5 backlog item

## Structured Data Policy

| Type | Location | Condition |
|------|----------|-----------|
| Organization | /home | Always |
| WebSite + SearchAction | /home | Always |
| JobPosting | /jobs/details/:id | Only when jobStatusId === 2 |
| BreadcrumbList | /jobs, /jobs/details/:id, /companies/details | Always on these pages |

Forbidden in all structured data: rating, reviewCount, fabricated salary, fabricated logo, fake employer name.

## Sitemap Policy
- Dynamic BE endpoint: `GET /sitemap.xml`
- Active jobs only (`WHERE job_status_id = 2`)
- 15-minute in-memory cache
- 503 on DB error (not 500 — Googlebot retries 503)

## Robots.txt Policy
- `Allow: /` for all user-agents
- Explicit Disallow for all private routes
- Sitemap reference at bottom
