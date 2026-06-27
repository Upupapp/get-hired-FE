# GetHired Decision Log — Post-SEO V3 (V2)
**Date:** 2026-06-25
**Scope:** Key decisions made in or surfaced by the SEO V3 deployment

---

## DEC-01 — OG Image Strategy: Single Default PNG, Per-Job Deferred
**Decision:** Use a single `gethired-og-default.png` (1200×630) for all pages that do not have a job-specific image. Per-job OG images (using job banner/company logo) are deferred to backlog (P3-SEO-04).
**Rationale:** Per-job OG images require the job banner URL to be returned in the job detail API response. That field is not reliably populated in the current data model. A high-quality default image is better than broken images on every job detail page.
**Image placement:** `src/assets/brand/gethired-og-default.png` — already referenced in SeoService (`DEFAULT_OG_IMAGE`) and index.html. No code change required after the asset is created.
**Specifications:** 1200×630 pixels, PNG format. Recommended content: GetHired Online logo, brand colors (check existing brand guide), short tagline ("Find Jobs in the Philippines"). Keep text minimal — many social platforms crop to 1.91:1.
**Status:** Open — designer must create the asset. This is LB-03 (launch blocker).
**Future:** When job banner URL is reliably available in the API, update `setJobPostingJsonLd` caller in `public-details.component.ts` to pass `ogImage: job.bannerUrl` to `setPageMeta`.

---

## DEC-02 — Search Console Approach: Manual Submission, Indexing API Later
**Decision:** Submit the sitemap manually via Google Search Console UI as the first step (P1-SEO-02). The Google Indexing API is deferred to P3-SEO-01 as a future enhancement.
**Rationale:** Manual sitemap submission is immediate and requires no code. The Indexing API requires a GCP service account, oauth scopes, and Search Console property verification first — it is a prerequisite chain, not a fast path.
**Manual submission steps:**
  1. Log in to Google Search Console with the account that owns/verified `gethiredonline.app`.
  2. Select the property `https://gethiredonline.app`.
  3. Left nav → Sitemaps → Add a new sitemap → Enter `sitemap.xml` → Submit.
  4. Monitor Coverage report for crawl/index errors in 48-72 hours.
**Prerequisite check:** Confirm Search Console property is verified. The verification meta tag (`EYWOEFfXbR2hY6_iyAD0X8UXPX4fHysRFjxnOUJoEJo`) is present in `src/index.html` and deployed. If the property shows "Verified" in Search Console, proceed directly to sitemap submission.
**Ownership:** Platform owner (not a developer task — requires access to the Google account).

---

## DEC-03 — Sitemap Domain: Same-Domain Routing Required
**Decision:** The sitemap must be accessible at `https://gethiredonline.app/sitemap.xml` (main domain), not at `https://api.gethiredonline.app/sitemap.xml` (API subdomain).
**Rationale:** The `robots.txt` is served from the main domain (`gethiredonline.app/robots.txt`) and references `Sitemap: https://gethiredonline.app/sitemap.xml`. Googlebot expects the sitemap at the URL listed in robots.txt. If the sitemap is only on the api subdomain, the robots.txt Sitemap directive is a dead link.
**Options evaluated:**
  - **Option A (recommended):** Add an nginx proxy location block on the main domain that forwards `/sitemap.xml` and `/robots.txt` requests to the BE. This keeps all SEO-relevant URLs on the main domain.
  - **Option B:** Update `src/robots.txt` to point to `https://api.gethiredonline.app/sitemap.xml`. Not recommended — sitemaps on a different subdomain than the content receive less trust from Google.
**Required action:** On the Linode server (`ssh root@139.162.11.242`), add to nginx config for `gethiredonline.app`:
  ```nginx
  location = /sitemap.xml {
    proxy_pass http://localhost:<BE_PORT>/sitemap.xml;
    proxy_set_header Host $host;
  }
  ```
  Replace `<BE_PORT>` with the actual BE listen port. Reload nginx after the change.
**Status:** Open — LB-04.

---

## DEC-04 — hreflang Strategy: Not Applicable (Philippines English Market)
**Decision:** No hreflang tags are emitted. This is intentional and documented.
**Rationale:** The platform serves the Philippines market in English. No URL-based language routing exists (no `/tl/jobs` or `/en/jobs` prefixes). Google's hreflang spec requires that alternate language versions have distinct URLs. Without URL-based language separation, hreflang tags cannot be correctly implemented and adding them would be incorrect.
**Condition to revisit:** If a future feature adds Tagalog (Filipino) language toggle with URL prefixes, add `hreflang="en-PH"` and `hreflang="tl-PH"` pairs with `x-default` pointing to the English version.
**Status:** Decided — no action required.

---

## DEC-05 — Expired Job Indexing Strategy: Client-Side noindex + Manual Console Removal
**Decision:** Expired/inactive jobs (jobStatusId !== 2) receive `noindex, nofollow` via SeoService (already shipped). The Google Indexing API for proactive `URL_DELETED` signals is deferred to P3-SEO-01.
**Rationale:** The noindex approach is correct and immediately effective — on next Googlebot crawl of an expired job page, it will be removed from the index. For urgent cases (employer complaint, incorrect job listing), the Google Search Console URL removal tool can manually de-index specific URLs within hours.
**Manual removal:** Search Console → Removals → New Request → enter specific job URL → Request Removal. This is a temporary removal that expires after 6 months; the permanent solution is the noindex tag already shipped.
**Future:** When Google Indexing API is integrated (P3-SEO-01), the BE's `updateStatusOfJob` function should fire `URL_DELETED` when job_status_id changes to 3 (expired) or 4 (archived), and `URL_UPDATED` when it changes to 2 (published). The plan is in `GETHIRED_SEO_GOOGLE_INDEXING_API_PLAN_V3.md`.
**Status:** Decided for now — no action required until Indexing API work begins.

---

## DEC-06 — BOLA Fix Approach on /applicant/userprofile: Use JWT uid, Remove Query Param
**Decision:** Fix SEC-01 by replacing `req.query.id` with `req.user.uid` in `applicantsController.js:getUserProfile`. Remove the `id` query parameter from any FE calls to this endpoint.
**Rationale:** The FE should not need to pass a user ID when requesting "my own profile" — the JWT already encodes the caller's uid. The current pattern where any client-supplied ID is used for the DB lookup is a textbook BOLA.
**Risk of fix:** Low. The `getDashboard` function in the same file (line 252) already uses `req.user.uid` for the same `getUserProfileById` call, confirming the pattern is safe. The FE will need to stop sending `?id=...` on this endpoint, or the BE should simply ignore the query param.
**Verification after fix:** Confirm FE's applicant profile page still loads correctly. Test that passing `?id=<different_uid>` now returns the caller's own profile, not the target's.
**Status:** Open — LB-01.

---

## DEC-07 — Canonical URL Strategy: Client-Side Only (No SSR)
**Decision:** Canonical URLs are set client-side via `SeoService.setCanonical()` which injects or updates the `<link rel="canonical">` tag in the browser DOM. Server-side canonical injection is not implemented (deferred to P3-SEO-02).
**Rationale:** The app is currently an Angular SPA without Angular Universal SSR enabled. Googlebot crawls JavaScript SPAs with the Chrome-based Web Rendering Service, which executes JavaScript and sees the dynamically-injected canonical. This is sufficient for organic indexing.
**Known limitation:** If SSR is added later, `setCanonical()` returns early in non-browser environments (`isPlatformBrowser` guard). The canonical tag would be absent from server-rendered HTML. The service already has a comment documenting this.
**Condition to revisit:** If Angular Universal SSR is enabled, update `setCanonical()` to use Angular's renderer or TransferState to inject the `<link>` server-side.
**Status:** Decided — no action required until SSR is introduced.

---

*Decision log generated 2026-06-25. These decisions should be reviewed if the project architecture changes significantly.*
