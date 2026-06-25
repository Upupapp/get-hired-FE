# GETHIRED_SEO_REPORT_RECENT_V4
Audit of SEO V3 + SEO QA pass + MOBILEVIEW deployments.
Date: 2026-06-25

---

## SUMMARY

| Check | Result |
|---|---|
| Public content hidden on mobile (display:none) | PASS — no hiding of SEO-critical content |
| JSON-LD injected regardless of screen size | PASS — injected into <head> via SeoService |
| Apply Now CTA visible on mobile | PASS |
| Canonical URL format | PASS |
| noindex on auth/private routes | PARTIAL — see detail |
| JobPosting JSON-LD only for active jobs (jobStatusId===2) | PASS |
| directApply: true | PASS |
| baseSalary unitText ('HOUR'/'MONTH' not 'HOURLY'/'MONTHLY') | PASS |
| /jobs/search/ Disallow in robots.txt | FIXED (was missing, now added) |
| Auth/private routes blocked in robots.txt | PASS |
| Sitemap directive correct | PASS |
| Sitemap URL format (https://.../jobs/details/{id}) | PASS |
| Sitemap lastmod ISO date YYYY-MM-DD | PASS |
| Sitemap changefreq / priority sensible | PASS |
| Sitemap static pages (/home /jobs /job-seekers /employers) | PASS |
| MOBILEVIEW: no public content hidden on mobile | PASS |
| OG image file exists | FAIL (gap documented, logo.png fallback active) |

---

## 1. PUBLIC PAGE SEO PARITY ON MOBILE

**Files audited:**
- `src/app/public/public-details/public-details.component.html`
- `src/app/public/public-details/public-details.component.scss`
- `src/app/jobs/job-posts-details/job-posts-details.component.html`
- `src/app/jobs/job-details-sidecard/job-details-sidecard.component.html`

### 1a. Job title / description / company name hidden on mobile?

PASS. Reviewed every CSS file in the public-details chain. No `display:none` rules apply to
`.title-banner`, `.title-banner-description`, the job description section, or the company sidecard
at any breakpoint. The MOBILEVIEW pass added responsive sizing (font-size, padding) for the banner
at `max-width: 767px`, which improves legibility without hiding anything.

The two `display:none !important` rules found in `job-posts-details.component.scss` (lines 383,
415) are on `.logo-thumbnail` / `.logo-thumbnail-2` — the interview icon swap-pair used for
hover state. These are decorative icons on an interaction widget; they do not hide any text or
SEO-relevant content.

### 1b. JSON-LD injected regardless of screen size?

PASS. `SeoService.setJsonLd()` injects `<script type="application/ld+json">` into `document.head`,
not into the Angular template. Screen size has no effect on whether this fires. The call is gated
only on `job.jobStatusId === 2` (correct).

### 1c. Apply Now CTA visible on mobile?

PASS. The `btn btn-apply-now` button in `job-posts-details.component.html` (line 57) uses
Bootstrap `w-100` and has no mobile-only `display:none` override. The MOBILEVIEW SCSS for
`public-details.component.scss` (max-width: 767px) does not touch CTA visibility.

---

## 2. SEOSERVICE CORRECTNESS

**File:** `src/app/core/services/seo.service.ts`

### 2a. Canonical URL format

PASS. When an explicit `canonical` string is passed (all call sites pass an absolute URL starting
with `https://gethiredonline.app`), `setCanonical()` sets it directly. The `og:url` fallback
builds `${BASE_URL}${this.router.url}` — correct.

All public detail pages pass: `canonical: 'https://gethiredonline.app/jobs/details/${this.jobId}'`

### 2b. noindex on auth/private routes

PARTIAL:

- `/signin` — PASS. `SigninComponent.ngOnInit` calls `seoService.setPageMeta({ robots: 'noindex, nofollow' })`.
- `/signup` — WEAK. `SignupComponent` does NOT inject SeoService and does NOT call `setPageMeta`.
  Protection is provided only by `Disallow: /signup` in robots.txt. The meta-robots safety net
  is absent. Low priority (robots.txt Disallow is respected by all major bots), but worth a future
  cleanup pass.
- `/user/*`, `/recruiter/*`, `/admin/*` — rely solely on robots.txt Disallow (no Angular auth guard
  is injecting noindex). Same pattern as signup. Acceptable for now.
- `/jobs/search/:keyword` — PASS. `PublicSearchComponent.ngOnInit` calls
  `setPageMeta({ robots: 'noindex, follow' })`. Also now backed by `Disallow: /jobs/search/`
  (see Section 3 fix below).

### 2c. JobPosting JSON-LD only for active jobs?

PASS. In `public-details.component.ts`:
```typescript
if (job.jobStatusId === 2) {
  this.seoService.setJobPostingJsonLd(job);
} else {
  this.seoService.clearJobPostingJsonLd();
}
```
`robots` is also conditioned: `job.jobStatusId === 2 ? 'index, follow' : 'noindex, nofollow'`.
Inactive job detail pages are noindexed AND have no JobPosting JSON-LD.

### 2d. directApply: true

PASS. Present at `seo.service.ts` line 243.

### 2e. baseSalary unitText

PASS. RATE_MAP at lines 271-276 maps:
- `hourly` / `hour` → `'HOUR'`
- `monthly` / `month` → `'MONTH'`
- `daily` / `day` → `'DAY'`
- `weekly` / `week` → `'WEEK'`
- `annual` / `annually` / `yearly` / `year` → `'YEAR'`
- unmapped fallback → `'MONTH'`

This is correct Schema.org `QuantitativeValue.unitText` per the spec (not 'HOURLY'/'MONTHLY').

---

## 3. ROBOTS.TXT AUDIT

**File:** `src/robots.txt`

### 3a. /jobs/search/ Disallow

FIXED. The file was missing this rule. Applied fix:

```
# Prevent indexing paginated/filtered search result pages (duplicate content).
# The meta-robots noindex in PublicSearchComponent is a JS-rendered fallback;
# this Disallow rule ensures crawl budget is not spent on search result pages.
Disallow: /jobs/search/
```

Without this rule, Googlebot (and other crawlers) would crawl `/jobs/search/*` URLs, burning crawl
budget on pages that already carry a JS-rendered `noindex`. Angular is an SPA without SSR —
crawlers may process JSON-LD and meta tags, but relying on JS-rendered noindex alone is fragile.
The Disallow is the reliable crawl-budget guard.

### 3b. Auth/private routes blocked

PASS. The file correctly blocks:
`/admin/`, `/admin`, `/recruiter/`, `/recruiter`, `/user/`, `/user`, `/owner/`, `/owner`,
`/investor/`, `/investor`, `/api/`, `/payment/`, `/payment`, `/subscription/`, `/subscription`,
`/signin`, `/signup`, `/reset-password`, `/change-password`, `/verify`

Note: trailing-slash + bare forms are present for all directory routes (good).

### 3c. Sitemap directive

PASS. `Sitemap: https://gethiredonline.app/sitemap.xml` is present at line 28 (now line 35 after
the fix).

---

## 4. SITEMAP XML QUALITY

**File:** `get-hired-BE/server.js` (lines 168-225)

### 4a. URL format

PASS. Job URLs: `${BASE_URL}/jobs/details/${safeJobId}` where `BASE_URL = "https://gethiredonline.app"`.
Format matches the canonical pattern used in SeoService and public-details.component.ts.

### 4b. lastmod ISO date format YYYY-MM-DD

PASS. `new Date(row.updated_at).toISOString().split("T")[0]` produces `YYYY-MM-DD`. Fallback to
`today` (same format) when `updated_at` is null.

### 4c. changefreq and priority

PASS and sensible:
- Static pages: /home (weekly/1.0), /jobs (daily/0.9), /job-seekers and /employers (monthly/0.7)
- Job detail pages: weekly/0.8

### 4d. Static pages

PASS. All four required static pages are present: `/home`, `/jobs`, `/job-seekers`, `/employers`.

### 4e. Sitemap TTL

NOTE: TTL is 15 minutes (SITEMAP_TTL_MS = 15 * 60 * 1000), reduced from 60 minutes in a prior
pass. Newly published jobs appear in sitemap within 15 minutes of publication. Acceptable.

### 4f. XML injection safety

PASS. `xmlEscape()` function encodes all five XML predefined entities for job_id values.

---

## 5. MOBILEVIEW IMPACT ON SEO

**Files:** `main-portal.component.scss`, `public-details.component.scss`

### 5a. main-portal.component.scss

PASS. At `max-width: 575px`:
- `portal-hero-cta-group` goes `flex-direction: column; align-items: stretch` — buttons become
  full-width. This improves CTA tap target, does not hide anything.
- `portal-journey-cta` same treatment.
- Hero visual (`portal-hero-visual`) is `aria-hidden="true"` in the HTML — it is a decorative
  mock-card illustration. It changes to `flex-direction: column` at 575px. No SEO content hidden.
- `portal-hero-inner--split` at 991px collapses from 2-column grid to 1-column. Content is
  reordered but never hidden.

No `display:none` rules added by MOBILEVIEW in this file.

### 5b. public-details.component.scss

PASS. MOBILEVIEW changes at `max-width: 767px`:
- `.bg-banner`: `height: auto`, `min-height: 200px`, `padding: 24px 16px` — prevents overflow
- `.title-banner`: `font-size: 22px` — readable, not hidden
- `.title-banner-description`: `font-size: 13px` — readable, not hidden
- `.container-fluid.px-3 .row`: `flex-direction: column` — stacks sidecard above content on mobile

All changes are layout/sizing only. No content is hidden.

---

## 6. OG IMAGE STATUS

FAIL (pre-existing, not regressed by recent deployments).

**What exists:**
- `src/assets/images/logo.png` — exists, serves as the current og:image fallback
- `src/assets/images/placeholder/logo.png` — also exists

**What is missing:**
- `src/assets/brand/gethired-og-default.png` — referenced in SeoService as `DEFAULT_OG_IMAGE`
  at line 34. This file does NOT exist.

**Current behavior:**
Because the file is missing, social previews (Facebook, Twitter/X, LinkedIn, WhatsApp) will show
a broken image icon when the fallback PNG URL returns a 404, OR the platform may show no image
at all. Only pages that explicitly pass a different `ogImage` value will have a working OG image
(none currently do — all pages use the default).

**Recommended action:**
Create a 1200x630px PNG at `src/assets/brand/gethired-og-default.png` (also requires creating
the `/assets/brand/` directory). This is the minimum needed to fix social sharing previews.
Content: GetHired logo centered on brand background. Alternatively, point `DEFAULT_OG_IMAGE` to
an existing asset (`/assets/images/logo.png`) as a temporary fix until the proper OG image is
created.

---

## 7. ADDITIONAL FINDINGS

### 7a. Signup component missing noindex meta tag

LOW PRIORITY. `SignupComponent` does not inject `SeoService` and has no `setPageMeta` call.
Protection is provided by `Disallow: /signup` in robots.txt. For defense-in-depth, add:
```typescript
this.seoService.setPageMeta({
  title: 'Sign Up | GetHired Online',
  description: 'Create your GetHired Online account...',
  robots: 'noindex, nofollow',
});
```
Mirror of the pattern already in `SigninComponent`.

### 7b. Duplicate "Login to Apply" button

COSMETIC/UX. In `job-posts-details.component.html` lines 61-67, the "Login to Apply" button
appears twice with identical `*ngIf="!userRole"` conditions. One of these is redundant. Not an
SEO issue (search engines handle duplicate buttons fine) but creates visual duplication for
logged-out visitors.

### 7c. No SSR (Angular Universal)

ARCHITECTURAL NOTE. This is a client-side-rendered Angular SPA. JSON-LD, canonical tags, and
meta robots are all set via JavaScript after page load. Google can render JavaScript (Chromium-based
crawler), but other bots (Bing, Facebook, LinkedIn scrapers) may not. This means:
- OG tags may fail to resolve for social cards on non-Google platforms
- Canonical and noindex directives may not be honored by non-JS bots

This is a pre-existing architectural constraint, not introduced by recent deployments. The
robots.txt Disallow rules provide a JS-independent layer of protection for private routes.

---

## CHANGES MADE

1. `src/robots.txt` — added `Disallow: /jobs/search/` with explanatory comment.

---

## PASS/FAIL SUMMARY TABLE (DETAILED)

| Check | Status | Notes |
|---|---|---|
| No display:none on mobile for job title | PASS | |
| No display:none on mobile for job description | PASS | |
| No display:none on mobile for company name | PASS | |
| JSON-LD in head, not template | PASS | SeoService injects into document.head |
| Apply Now CTA visible on mobile | PASS | btn-apply-now w-100, no mobile hide |
| Canonical is absolute URL, correct domain | PASS | https://gethiredonline.app/jobs/details/{id} |
| Canonical has no trailing query params | PASS | |
| noindex on /signin | PASS | meta robots set in SigninComponent |
| noindex on /signup | WEAK | robots.txt Disallow only; no meta tag |
| noindex on /user/*, /recruiter/*, /admin/* | WEAK | robots.txt Disallow only; no meta tag |
| noindex on /jobs/search/* | PASS | meta robots + (now) robots.txt Disallow |
| JobPosting JSON-LD only for jobStatusId===2 | PASS | |
| directApply: true | PASS | seo.service.ts line 243 |
| baseSalary unitText HOUR/MONTH (not HOURLY/MONTHLY) | PASS | RATE_MAP normalizes correctly |
| /jobs/search/ in robots.txt Disallow | FIXED | Added in this audit |
| All auth routes in robots.txt Disallow | PASS | |
| Sitemap directive in robots.txt | PASS | |
| Sitemap URL format correct | PASS | https://gethiredonline.app/jobs/details/{id} |
| Sitemap lastmod YYYY-MM-DD | PASS | ISO split on "T" |
| Sitemap changefreq/priority sensible | PASS | |
| Sitemap includes /home /jobs /job-seekers /employers | PASS | |
| MOBILEVIEW: no content hidden via display:none | PASS | Only sizing/layout changes |
| CTA buttons visible on mobile | PASS | full-width stretch, not hidden |
| OG default image file exists | FAIL | /assets/brand/gethired-og-default.png missing |
