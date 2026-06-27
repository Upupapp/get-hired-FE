# GetHired OPTIMIZE Fix Log — SEO V3 Recent Deployment

**Mode:** Recent deployment (SEO V3)
**Date:** 2026-06-25
**All fixes are small, safe, reversible, and do not change any visible behavior.**

---

## FIX-01: public-list.component.ts — Add ngOnDestroy to clear breadcrumb JSON-LD

**File:** `src/app/public/public-list/public-list.component.ts`
**Problem:** `ngOnInit` calls `seoService.setBreadcrumbJsonLd()` but the class had no `ngOnDestroy`. When a user navigated from /jobs to another route (e.g., /home or /job-seekers), the Jobs breadcrumb JSON-LD script remained in `<head>`, stale structured data.
**Fix:** Added `OnDestroy` to imports, added `implements OnDestroy` to class declaration, added `ngOnDestroy()` calling `seoService.clearBreadcrumbJsonLd()`.
**Risk:** None. Mirrors the cleanup pattern already used in `public-details.component.ts`.

---

## FIX-02: public-company-details.component.ts — Add clearBreadcrumbJsonLd to ngOnDestroy

**File:** `src/app/companies/public-company-details/public-company-details.component.ts`
**Problem:** The SEO subscription uses `take(1)` and auto-completes (no subscription leak). However, `ngOnDestroy` existed but only unsubscribed from `this.link$`. It did not call `clearBreadcrumbJsonLd()`. Company breadcrumb (Home > Companies > {company name}) persisted in `<head>` when navigating away.
**Fix:** Added `this.seoService.clearBreadcrumbJsonLd()` as the first line of the existing `ngOnDestroy`.
**Risk:** None.

---

## FIX-03: main-portal.component.ts — Remove duplicate titleService.setTitle from constructor

**File:** `src/app/public/main-portal/main-portal.component.ts`
**Problem:** Constructor called `this.titleService.setTitle('GetHired Online | Jobs and Hiring Platform')` then `ngOnInit` called `seoService.setPageMeta({ title: 'GetHired Online — Jobs and Hiring Platform in the Philippines', ... })` which calls `titleService.setTitle()` again with a different string. The constructor call was immediately overridden and served no purpose. It also forced `Title` to be injected as a separate dependency alongside `SeoService`.
**Fix:** Removed `import { Title }` and removed `private titleService: Title` constructor parameter. Removed `this.titleService.setTitle(...)` call. Constructor body is now empty.
**Risk:** None. The title is still set correctly in `ngOnInit` via `seoService.setPageMeta`.

---

## FIX-04: employer-portal.component.ts — Remove duplicate titleService.setTitle from constructor

**File:** `src/app/public/employer-portal/employer-portal.component.ts`
**Problem:** Same pattern as FIX-03. Constructor set `'Hire Employees Online | GetHired for Employers'` then `ngOnInit` overrode with `'Post Jobs and Hire Online in the Philippines | GetHired Online'`.
**Fix:** Removed `import { Title }`, removed constructor parameter `private titleService: Title`, removed `this.titleService.setTitle(...)` call.
**Risk:** None.

---

## FIX-05: job-seeker-portal.component.ts — Remove duplicate titleService.setTitle from constructor

**File:** `src/app/public/job-seeker-portal/job-seeker-portal.component.ts`
**Problem:** Same pattern. Constructor set `'Find Jobs Online | GetHired Online'` then `ngOnInit` overrode with `'Find Jobs in the Philippines | GetHired Online'`.
**Fix:** Removed `import { Title }`, removed constructor parameter, removed constructor call.
**Risk:** None.

---

## FIX-06: server.js — Add in-memory sitemap cache

**File:** `get-hired-BE/server.js`
**Problem:** `GET /sitemap.xml` ran a Postgres query and rebuilt the entire XML string on every request. A Googlebot crawl or multiple simultaneous hits would each open a DB connection and rebuild.
**Fix:** Added `let _sitemapCache = { xml: null, builtAt: 0 }` and `const SITEMAP_TTL_MS = 60 * 60 * 1000` (1 hour) before the route handler. On each request: if cache is valid (xml present and age < TTL), serve cached response immediately. On cache miss: build XML, store in `_sitemapCache`, serve and respond. TTL matches the `Cache-Control: max-age=3600` already set on the response.
**Risk:** Low. Cache is process-scoped (resets on server restart/redeploy). If a job is published, the sitemap may lag by up to 1 hour before reflecting the new URL. This is standard and acceptable for sitemaps. No Redis or external dependency required.

---

## FIX-07: server.js — Fix date variable bug in sitemap (now → today)

**File:** `get-hired-BE/server.js`
**Problem:** After the cache refactor, `const now = Date.now()` (a Unix timestamp number like `1719273600000`) was used as the fallback for `<lastmod>` on rows where `updated_at` is null, and for static page `<lastmod>`. This would have emitted `<lastmod>1719273600000</lastmod>` — invalid per the sitemap XSD (expects `YYYY-MM-DD` or ISO 8601 datetime).
**Fix:** Added `const today = new Date().toISOString().split("T")[0]` and replaced both uses of `now` inside the XML body with `today`. `now` (numeric) is only used for cache TTL comparison.
**Risk:** None. Corrects a latent bug that was only dormant because the old code also named the date string `now` (pre-cache-refactor). The rename made it explicit.

---

## Files Changed

### Frontend (`get-hired-FE`)
1. `src/app/public/public-list/public-list.component.ts` — FIX-01
2. `src/app/companies/public-company-details/public-company-details.component.ts` — FIX-02
3. `src/app/public/main-portal/main-portal.component.ts` — FIX-03
4. `src/app/public/employer-portal/employer-portal.component.ts` — FIX-04
5. `src/app/public/job-seeker-portal/job-seeker-portal.component.ts` — FIX-05

### Backend (`get-hired-BE`)
1. `server.js` — FIX-06 + FIX-07
