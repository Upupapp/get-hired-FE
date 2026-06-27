# GETHIRED_SEO_BACKLOG_V2
Command: GETHIRED_REUSABLE_SEO_SEARCH_INDEXING_PUBLIC_DISCOVERY_COMMAND_V2
Date: 2026-06-27

---

## Completed This Session

- [x] Added `/companies` to sitemap static pages (BE `server.js`) — `get-hired-BE` ← **needs deploy**

---

## P1 — High Value, Relatively Easy

### SEO-1: Dynamic OG Image (Use Company Logo)
**File:** `src/app/views/home/public/public-details/public-details.component.ts`
**Change:** On job load, if `job.companyLogoUrl` exists, call `seoService.setPageMeta({ ..., ogImage: job.companyLogoUrl })`
**Impact:** LinkedIn/Facebook shares of job pages will show the company logo instead of the generic GetHired brand image. Much more clickable.
**Effort:** 1 line change. Low risk.
**Caveat:** Logos are usually square. Most platforms letterbox non-1200×630 images. Still better than generic.
**Same fix for:** `public-company-details.component.ts` — use company logo as og:image for company detail pages.

### SEO-2: Submit Sitemap to Google Search Console
**Manual action.** Go to Google Search Console → Sitemaps → Submit `https://gethiredonline.app/sitemap.xml`.
**Impact:** Google discovers new/updated URLs faster. Sitemap fetch can be triggered on demand.
**Effort:** 2 minutes manual.

### SEO-3: Run Rich Results Test After Publishing a Job
**Manual verification.** Once a real job is published on the platform, paste `https://gethiredonline.app/jobs/details/{id}` into https://search.google.com/test/rich-results.
**Expected:** "JobPosting" rich result eligible. Any missing/invalid fields will be flagged.
**Effort:** 5 minutes manual.

---

## P2 — Medium Value, Medium Effort

### SEO-4: Prerender Expansion
**File:** `angular.json` (prerender section)
**Change:** Add routes `/home`, `/jobs`, `/job-seekers`, `/employers` to the prerender routes list.
**Impact:** These pages are pre-built at deploy time — no SSR render latency for Googlebot on first crawl.
**Effort:** 5 minutes + build time.

### SEO-5: 410 Gone for Deleted/Expired Jobs
**Files:** `public-details.component.ts`, BE job detail controller
**Change:** When a job's status is expired or deleted, return HTTP 410 (Gone) instead of 404.
**Impact:** 410 signals to Google that the content is permanently gone → drops from index faster. 404 can take longer.
**Effort:** Medium — requires BE change to expose job status in error response + FE to distinguish.

### SEO-6: TransferState for SSR Hydration
**Files:** `public-list.component.ts`, `public-details.component.ts`
**Change:** Use Angular `TransferState` to pass SSR-fetched data to the client so the API call is not duplicated on hydration.
**Impact:** Faster LCP on real users (API result is embedded in HTML, not re-fetched). Also ensures Google sees the actual job data in the SSR HTML, not just page structure.
**Effort:** Medium — requires wrapping all public-page API calls in TransferState pattern.

### SEO-7: Add Image `width` + `height` to Job Card Images
**Impact:** Prevents CLS on job card image load. Google penalizes high CLS scores.
**Effort:** Audit all `<img>` tags in public components, add `width` and `height` attributes.

---

## P3 — Lower Priority / Future

### SEO-8: Blog / Content Marketing Pages
**Impact:** Long-tail keyword traffic — "how to write a Philippine CV", "top IT jobs in Manila", "how to post a job". Organic traffic from informational queries.
**Effort:** Significant — requires CMS or blog module, content creation.

### SEO-9: Hreflang Tags
**Condition:** Only implement if localized URL paths are confirmed (e.g., `/vi/jobs` for Vietnamese).
**Current state:** Language switcher exists but routes are English-only.
**Effort:** Add `<link rel="alternate" hreflang="en" href="...">` / `hreflang="vi"` in SeoService for each public page.

### SEO-10: Branded Dynamic OG Image Service
**Description:** Generate 1200×630 social preview images server-side with job title + company name + GetHired logo. Store in Firebase Storage, return URL via BE endpoint.
**Impact:** Best-in-class social sharing. Every job link shared on LinkedIn gets a unique, professional preview.
**Effort:** High — requires Puppeteer/Sharp image generation, storage, caching layer.

### SEO-11: Structured Data for Employer Marketing Page
**Schema:** SoftwareApplication
**Condition:** Only when marketing page has stable, accurate product feature copy.
**Effort:** Low once marketing copy is finalized.

### SEO-12: `nosniff` HTTP Header Verification
**Note:** `X-Content-Type-Options: nosniff` was flagged in SECURE audit as unverified.
**SEO relevance:** Not directly SEO. Security header.
**Effort:** nginx config check — 1 line.

---

## Never Do

- Never fake job data, applicant counts, or salary ranges in structured data
- Never add `noindex` to active published job pages
- Never include `/jobs/search/` URLs in the sitemap
- Never include private route URLs in the sitemap
- Never set `robots: "index"` on auth pages or dashboard pages
