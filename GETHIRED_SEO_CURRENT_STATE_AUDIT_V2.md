# GETHIRED_SEO_CURRENT_STATE_AUDIT_V2
Command: GETHIRED_REUSABLE_SEO_SEARCH_INDEXING_PUBLIC_DISCOVERY_COMMAND_V2
Scope: Full system audit — FE + BE
Date: 2026-06-27

---

## Executive Summary

GetHired has **enterprise-grade SEO infrastructure** that is largely production-ready. The system implements Angular Universal SSR, a centralized SeoService, JobPosting/Organization/WebSite/BreadcrumbList JSON-LD, a dynamic caching sitemap endpoint, comprehensive robots.txt, and per-route metadata management.

**Overall SEO Score: 8.5 / 10**

Two actionable gaps: (1) no per-job/per-company dynamic OG images, (2) the sitemap's `/companies` public route is missing from static entries.

---

## Files Audited

### Frontend
- `src/index.html`
- `src/robots.txt`
- `src/app/app-routing.module.ts`
- `src/app/app.component.ts`
- `src/app/app.server.module.ts`
- `server.ts`
- `angular.json`
- `src/app/core/services/seo.service.ts`
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`
- `src/app/views/home/public/public-list/public-list.component.ts` (job board)
- `src/app/views/home/public/public-details/public-details.component.ts` (job detail)
- `src/app/views/home/public/public-search/public-search.component.ts` (search)
- `src/app/views/home/public/public-company-details/public-company-details.component.ts`
- `src/assets/brand/gethired-og-default.jpg`

### Backend
- `server.js` (sitemap endpoint, lines 155–253)
- `routes/jobsRoute.js` (public job endpoints)
- `routes/companiesRoute.js` (public company endpoints)

---

## Public Route Matrix

| Route | Indexable | Guard | Notes |
|---|---|---|---|
| `/home` | YES | None | Redirected from `/` |
| `/jobs` | YES | None | Public job board |
| `/jobs/details/:id` | YES (if active) | None | 404 on invalid job via SSR RESPONSE token |
| `/jobs/search/:keyword` | NO | None | meta noindex + robots.txt Disallow |
| `/companies` | YES | None | Company listing — **missing from sitemap static pages** |
| `/companies/details?id=:id` | YES | None | Company detail page |
| `/job-seekers` | YES | None | Marketing page |
| `/employers` | YES | None | Marketing page |
| `/signin`, `/signup` | NO | unauth guard | robots.txt Disallow |
| `/reset-password`, `/verify` | NO | — | robots.txt Disallow |
| `/admin/**` | NO | AuthGuard role=1 | robots.txt Disallow |
| `/recruiter/**` | NO | AuthGuard role=2 | robots.txt Disallow |
| `/user/**` | NO | AuthGuard role=3 | robots.txt Disallow |

---

## Metadata / SSR Status

| Item | Status | File | Detail |
|---|---|---|---|
| Title service | ✅ PRESENT | `seo.service.ts` | Per-route dynamic titles |
| Meta service | ✅ PRESENT | `seo.service.ts` | description, robots, OG, Twitter |
| Canonical links | ✅ PRESENT | `seo.service.ts:setCanonical()` | Per-route, DOM-safe for SSR |
| Open Graph tags | ✅ PRESENT | `seo.service.ts:setPageMeta()` | og:title/description/image/url/type |
| Twitter card tags | ✅ PRESENT | `seo.service.ts:setPageMeta()` | twitter:card/title/description/image |
| Angular Universal SSR | ✅ PRESENT | `server.ts`, `app.server.module.ts` | Full SSR with REQUEST/RESPONSE tokens |
| HTTP 404 for bad jobs | ✅ PRESENT | `public-details.component.ts` | RESPONSE token sets status 404 |
| Default OG image | ✅ PRESENT | `/assets/brand/gethired-og-default.jpg` | 1200×630 JPEG ~95 KB |
| Google verification | ✅ PRESENT | `index.html` | Meta tag + `google8d5e93b3a9106865.html` |
| GA4 analytics | ✅ PRESENT | `index.html` | G-4C797NXLJF, manual page-view tracking |
| Dynamic OG per job | ❌ MISSING | — | Uses default fallback only |
| Dynamic OG per company | ❌ MISSING | — | Uses default fallback only |
| Hreflang tags | ❌ MISSING | — | Language switcher exists but no hreflang |

---

## Structured Data Status

| Schema | Status | Route | Notes |
|---|---|---|---|
| Organization | ✅ PRESENT | `/home` | Name, URL, logo, contact |
| WebSite | ✅ PRESENT | `/home` | With SearchAction |
| JobPosting | ✅ PRESENT | `/jobs/details/:id` | Active/published jobs only, 13+ fields |
| BreadcrumbList | ✅ PRESENT | All public pages | Navigation hierarchy |
| FAQPage | ❌ NOT YET | — | No visible public FAQ sections implemented |

---

## Sitemap / Robots Status

| Item | Status | Value |
|---|---|---|
| Sitemap URL | ✅ LIVE | `https://gethiredonline.app/sitemap.xml` |
| Sitemap HTTP status | ✅ 200 | Confirmed via curl |
| Static pages | ✅ 4 URLs | /home, /jobs, /job-seekers, /employers |
| `/companies` in sitemap | ❌ MISSING | Public route not included in static URL list |
| Dynamic job URLs | ✅ READY | Returns when published jobs exist in DB |
| Dynamic company URLs | ✅ READY | Returns when published jobs exist in DB |
| Cache TTL | ✅ 15 min | In-memory cache with DB refresh |
| XML escaping | ✅ PRESENT | `xmlEscape()` function |
| Sitemap 503 on error | ✅ PRESENT | Temporary failure signal to Google |
| Robots.txt | ✅ COMPLETE | Private routes disallowed, sitemap referenced |

---

## Core Findings & Risk Summary

| # | Finding | Risk | Action |
|---|---|---|---|
| 1 | `/companies` missing from sitemap static URLs | MEDIUM | Add to static URL list in server.js |
| 2 | No per-job/per-company OG images | MEDIUM | Backlog: dynamic OG image service |
| 3 | Hreflang missing despite language switcher | LOW | Add hreflang backlog if multilingual SEO intended |
| 4 | Prerender covers only `/` | LOW | Expand to include /home, /jobs, /job-seekers, /employers |
| 5 | All other infrastructure | COMPLETE | No action needed |
