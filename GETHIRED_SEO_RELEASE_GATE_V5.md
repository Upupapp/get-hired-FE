# GetHired SEO V5 — Release Gate

Generated: 2026-06-26
Based on: HEAD=41b5920 (FE), HEAD=6a7755c (BE)

## Verdict: HOLD — one P1 bug must be fixed

There is one P1 structured data bug that should be fixed before claiming SEO complete.
All other V4 checks carry forward at PASS. The application can remain deployed; the bug
does not break the site — it may cause a "duplicate JobPosting" warning in Google's
Rich Results Test.

---

## Go / No-Go Checklist (V5 Delta — only changed rows shown; all others carry from V4)

| # | Check | Status (V5) | Notes |
|---|-------|-------------|-------|
| G5 | noindex on signup | PASS | V4 fix (was WEAK in V3) |
| G6 | noindex on reset-password | PASS | V4 fix |
| G7 | noindex on change-password | PASS | V4 fix |
| G8 | noindex on verify (account-auth) | PASS | V4 fix |
| G21 | BreadcrumbList on job detail — visual nav matches JSON-LD | PASS | V5 breadcrumb commit |
| G22 | No fake structured data | PASS | sameAs:[] removed |
| G28 | No duplicate JobPosting JSON-LD blocks | FAIL P1 | NEW — see §1 of V5 report |
| G29 | JobPosting JSON-LD gated on active jobs in child component | FAIL P2 | NEW — child has no statusId check |
| G30 | Error-state noindex fires on job-not-found | PASS | V5 — jobErrorSub pattern |
| G31 | OG image points to existing file | PASS | V5 — DEFAULT_OG_IMAGE = /assets/images/logo.png |

---

## Full Go / No-Go Table (all items)

| # | Check | Status | Notes |
|---|-------|--------|-------|
| G1 | SeoService SSR-safe (DOCUMENT injection) | PASS | V4 |
| G2 | Public page titles correct | PASS | V4 |
| G3 | Public page descriptions correct | PASS | V4 |
| G4 | Canonical tags set on indexable pages | PASS | V4 SSR fix |
| G5 | noindex on signin | PASS | V3 |
| G6 | noindex on signup | PASS | V4 |
| G7 | noindex on reset-password | PASS | V4 |
| G8 | noindex on change-password | PASS | V4 |
| G9 | noindex on verify (account-authentication) | PASS | V4 |
| G10 | noindex on 404 | PASS | V3 |
| G11 | noindex on /jobs/search/* | PASS | V3 |
| G12 | Private routes in robots.txt Disallow | PASS | V3 |
| G13 | robots.txt in angular.json assets | PASS | V3 |
| G14 | Sitemap endpoint exists on BE | PASS | V3 |
| G15 | Sitemap only includes active jobs | PASS | V3 |
| G16 | Sitemap in robots.txt | PASS | V3 |
| G17 | JobPosting JSON-LD on active jobs only — parent path | PASS | V3 + V4 SSR fix |
| G18 | JobPosting JSON-LD cleared on navigate (parent) | PASS | public-details ngOnDestroy |
| G19 | Organization JSON-LD on homepage | PASS | V3 + V4 SSR fix; sameAs removed V5 |
| G20 | WebSite + SearchAction on homepage | PASS | V3 + V4 SSR fix |
| G21 | BreadcrumbList on job detail | PASS | V5: visual nav + JSON-LD consistent |
| G22 | No fake structured data | PASS | V5: sameAs:[] removed; all fields from real API |
| G23 | No auth guards weakened | PASS | Zero guard changes in V3-V5 |
| G24 | No payment logic changed | PASS | Zero changes in V3-V5 |
| G25 | Google Search Console tag in index.html | PASS | Already present |
| G26 | Recovery links on 404 page | PASS | V3 |
| G27 | Copy claims verified honest | PASS | V4 |
| G28 | No duplicate JobPosting JSON-LD blocks | FAIL P1 | Two blocks: gh-jsonld-jobposting + job-posting-structured-data |
| G29 | JobPosting JSON-LD gated on active jobs in child | FAIL P2 | JobStructuredDataService.apply() has no statusId===2 guard |
| G30 | Error-state noindex on job-not-found | PASS | V5 |
| G31 | OG image points to existing file | PASS | V5 — was FAIL in V4 |

---

## P1 Fix Required Before Claiming SEO Complete

### FIX-1: Remove JobStructuredDataService from job-posts-details.component.ts

**File:** `src/app/jobs/job-posts-details/job-posts-details.component.ts`

Remove these 4 lines:
```typescript
// Line 16: import
import { JobStructuredDataService } from '@main/public/services/job-structured-data.service';

// Constructor injection:
private structuredData: JobStructuredDataService,

// ngOnInit line 84:
this.structuredData.apply(job);

// ngOnDestroy line 168:
this.structuredData.remove();
```

The parent `PublicDetailsComponent` already injects `seoService.setJobPostingJsonLd(job)` (gated on `jobStatusId===2`) and calls `seoService.clearJobPostingJsonLd()` in `ngOnDestroy`. There is no need for the child to also inject structured data.

**Risk: NONE** — removing a duplicate writer. Parent's copy is identical data, more complete field coverage, and correctly guarded.

---

## Human Verification Required

### VERIFY-1: Rich Results Test — post-fix
After applying FIX-1, test any live job detail URL at:
https://search.google.com/test/rich-results
Expected: exactly one `JobPosting` object, no "Duplicate items" warning.

### VERIFY-2: Production sitemap.xml routing (carried from V4)
```bash
curl -I https://gethiredonline.app/sitemap.xml
```
Expected: `Content-Type: application/xml; charset=utf-8`

### VERIFY-3: SSR canonical in rendered HTML (carried from V4)
```bash
curl -sA Googlebot https://gethiredonline.app/home | grep canonical
```
Expected: `<link rel="canonical" href="https://gethiredonline.app/home">`

### VERIFY-4: Google Search Console property claim
A human must complete the GSC property verification and sitemap submission.

---

## V5 Code Changes Summary

| File | Change | Commits | Risk |
|------|--------|---------|------|
| `src/app/jobs/job-posts-details/job-posts-details.component.html` | Visual breadcrumb nav added | 41b5920 | LOW |
| `src/app/jobs/job-posts-details/job-posts-details.component.ts` | jobErrorSub → noindex; normalizedJobSub → index,follow; Meta injected; jobErrorSub unsubscribed in destroy | 41b5920 | LOW |
| `src/app/jobs/job-posts-details/job-posts-details.component.scss` | Breadcrumb styles | 41b5920 | NONE |
| `src/app/core/services/seo.service.ts` | Removed `sameAs: []` from Organization JSON-LD | 94e4d39 | NONE |
| `src/app/public/job-seeker-portal/job-seeker-portal.component.html` | 3 Browse-jobs buttons → `<a routerLink="/jobs">` | 94e4d39 | NONE |
| `src/app/app.routing.module.ts` | Dead isMobileViewAllowed route data removed | 94e4d39 | NONE |
| `src/app/auth/auth.module.ts` | Dead isMobileViewAllowed annotation removed | 94e4d39 | NONE |
| `src/app/shared/guard/auth.guard.ts` | Dead query param removed; navigateByUrl cleaner URLs | 94e4d39 | NONE |

---

## Non-Blocking Backlog (updated from V4)

| Priority | Item | Status |
|----------|------|--------|
| P2 | FIX-1: remove duplicate JobStructuredDataService from job-posts-details | NEW — should do |
| P2 | Add statusId===2 guard in JobStructuredDataService caller | NEW |
| P2 | FAQPage JSON-LD for /job-seekers and /employers FAQ sections | Unchanged |
| P2 | Company pages in sitemap | Unchanged |
| P2 | Convert portal-cta-band primary to `<a routerLink>` | NEW |
| P3 | Change 'noindex' to 'noindex, nofollow' in jobErrorSub | NEW |
| P3 | Convert remaining goToJobs() buttons in main-portal.component.html | Unchanged |
| P3 | Branded 1200x630px OG image (design asset) | Unchanged |
| P3 | Soft 404 → 410 Gone for expired job URLs | Unchanged |
| P3 | SSR TransferState for initial job list data | Unchanged |
| P3 | Google Indexing API for fast publish/depublish | Unchanged |
| P3 | Explicit width/height on brand SVG images (CLS) | Unchanged |
| P3 | defer on Bootstrap/Popper.js scripts | Unchanged |
| P3 | Clean URLs for company pages (/companies/:id) | Unchanged |
