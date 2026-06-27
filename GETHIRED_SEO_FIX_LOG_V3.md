# GetHired SEO V3 — Fix Log

Audit date: 2026-06-25
Applied by: SEO audit agent

---

## Fixes Applied

### FIX-SEO-01 — company_name snake_case fallback in setJobPostingJsonLd
**File**: `src/app/core/services/seo.service.ts`
**Problem**: `hiringOrganization.name` used `job.companyName || job.companyDetails`. The Job TypeScript interface has no `companyName` field — the API returns `company_name` (snake_case). When `companyName` is undefined, `companyDetails` (a bio/description field) was used as the company name in the JobPosting schema, producing wrong structured data.
**Fix**: Added `(job as any).company_name` as the first fallback, matching the pattern already used in `public-details.component.ts` line 41.
**Before**: `name: job.companyName || job.companyDetails || ''`
**After**: `name: (job as any).company_name || job.companyName || (job as any).companyDetails || ''`

### FIX-SEO-02 — hiringOrganization.logo added to JobPosting schema
**File**: `src/app/core/services/seo.service.ts`
**Problem**: `job.companyLogoUrl` exists in the Job model but was not included in `hiringOrganization`. Google's JobPosting rich result guidelines recommend including a logo.
**Fix**: Added `logo: job.companyLogoUrl` conditionally to `hiringOrganization`.

### FIX-SEO-03 — baseSalary unitText normalization
**File**: `src/app/core/services/seo.service.ts`
**Problem**: Code used `job.rate ? job.rate.toUpperCase() : 'MONTH'`. If `job.rate` is `'monthly'` or `'hourly'`, this produces `'MONTHLY'` or `'HOURLY'` which are NOT valid Schema.org QuantitativeValue unitText values. Valid values are: `HOUR`, `DAY`, `WEEK`, `MONTH`, `YEAR`.
**Fix**: Replaced `.toUpperCase()` with a RATE_MAP lookup that normalizes common English rate terms to valid Schema.org values, with `'MONTH'` as the default.

### FIX-SEO-04 — directApply added to JobPosting schema
**File**: `src/app/core/services/seo.service.ts`
**Problem**: `directApply` was missing. This field signals to Google that users can apply directly on the site, enabling the "Apply on site" badge in Google for Jobs.
**Fix**: Added `directApply: true` to the JobPosting LD object.

### FIX-SEO-05 — identifier added to JobPosting schema
**File**: `src/app/core/services/seo.service.ts`
**Problem**: No `identifier` field was present. Google uses this to deduplicate job postings found on multiple sites.
**Fix**: Added `identifier: { '@type': 'PropertyValue', name: 'GetHired Online', value: job.jobId }` conditionally when `job.jobId` is truthy.

### FIX-SEO-06 — mapEmploymentType fallback changed from null to 'OTHER'
**File**: `src/app/core/services/seo.service.ts`
**Problem**: The function returned `null` for unknown job type names, causing `employmentType` to be omitted from the schema. Google is more likely to show job postings when `employmentType` is present.
**Fix**: Changed final return from `null` to `'OTHER'` (a valid Schema.org EmploymentType value). Also added `VOLUNTEER` mapping and fixed ordering bug where 'contract' could match before 'internship' check.

### FIX-SEO-07 — Sitemap cache TTL reduced from 60min to 15min
**File**: `get-hired-BE/server.js`
**Problem**: 1-hour in-memory cache meant newly published jobs could take up to 60 minutes to appear in the sitemap.
**Fix**: Reduced `SITEMAP_TTL_MS` from `60 * 60 * 1000` to `15 * 60 * 1000`.

### FIX-SEO-08 — Cache-Control header reduced from max-age=3600 to max-age=900
**File**: `get-hired-BE/server.js`
**Problem**: `Cache-Control: public, max-age=3600` allowed CDN/proxy caches to serve a stale sitemap for up to 1 hour after the BE cache was rebuilt.
**Fix**: Changed both `Cache-Control` headers (cache hit and cache miss paths) from `max-age=3600` to `max-age=900` (15 minutes), matching the new TTL.

### FIX-SEO-09 — og:image and twitter:image fallback added to index.html
**File**: `src/index.html`
**Problem**: `og:image` and `twitter:image` meta tags were entirely absent from index.html. `SeoService.setPageMeta()` sets them dynamically, but SSR and initial page load may not have Angular hydrated yet. Social crawlers (Facebook, Twitter/X, LinkedIn, Slack) that fetch the raw HTML will see no OG image. The `DEFAULT_OG_IMAGE` constant references `assets/brand/gethired-og-default.png` which does not exist.
**Fix**: Added `og:image` and `twitter:image` meta tags to index.html pointing to the existing `assets/images/logo.png` as a temporary fallback. Added comment to replace with proper 1200x630px OG image once created.

---

## Fixes NOT Applied (require more investigation or design decisions)

### SKIPPED — Remote job Schema.org fields
Adding `jobLocationType: 'TELECOMMUTE'` and `applicantLocationRequirements` requires mapping `workSetupId`/`workSetupName` values from the DB to detect remote jobs. The mapping table is not available in this audit pass. Documented in NEXT_STEPS.

### SKIPPED — /companies pages in sitemap
Adding company detail pages to the sitemap requires knowing the correct URL pattern and querying the companies table. Deferred to next iteration.

### SKIPPED — hreflang tags
Adding `hreflang="en-PH"` requires either a static meta tag (needs Angular Universal SSR to be active) or a per-page injection in each component. Deferred — see NEXT_STEPS.

### SKIPPED — 410 Gone for expired jobs
Requires BE middleware to check job status on each job detail URL request. Significant BE change, deferred to Phase 2.

### SKIPPED — OG image creation
A proper 1200x630px branded image must be created by a designer. A code fix cannot create this asset.

---

## Files Changed

| File | Changes |
|---|---|
| `get-hired-FE/src/app/core/services/seo.service.ts` | FIX-01 through FIX-06 |
| `get-hired-BE/server.js` | FIX-07, FIX-08 |
| `get-hired-FE/src/index.html` | FIX-09 |
