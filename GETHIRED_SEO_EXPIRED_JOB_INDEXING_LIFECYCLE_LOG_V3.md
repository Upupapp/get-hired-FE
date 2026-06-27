# GETHIRED SEO Expired Job Indexing Lifecycle Log V3

Generated: 2026-06-25

## Job Status IDs (from job-list.component.ts getJobStatusName())

| jobStatusId | Status Name | Publicly visible | SEO Treatment |
|------------|-------------|-----------------|---------------|
| 1 | Draft | No (auth-only) | noindex, nofollow |
| 2 | Published | Yes (public) | index, follow + JobPosting JSON-LD |
| 3 | Expired | Yes (page renders) | noindex, nofollow (implemented) |
| 4 | Archived | Yes (page renders) | noindex, nofollow (implemented) |
| default | Draft fallback | No | noindex, nofollow |

## Current Behavior
- The public job detail page (`/jobs/details/:id`) will render any job regardless of status (backend `getJobDetails` endpoint doesn't check job_status_id — any job_id returns data).
- FE now dynamically sets `noindex, nofollow` when `jobStatusId !== 2` (Phase 4/6 implementation).
- **JobPosting JSON-LD is only emitted for jobStatusId === 2**.

## Gap: Backend Does Not Block Expired Job Detail Requests
The BE `getJobDetails` endpoint currently returns job data regardless of `job_status_id`. This is not a security issue (no private data), but means expired jobs are publicly accessible at their URL even after expiry.

**Policy decision (documented, no code change):**
- FE handles this via noindex meta.
- A future improvement: BE returns 404 for expired/archived jobs on the public `/job/details` endpoint, which enables proper HTTP 404 → Google de-indexing.

## Sitemap Strategy
The BE sitemap endpoint (`GET /sitemap.xml`, implemented Phase 11) only includes `job_status_id = 2` jobs. Expired/archived jobs are automatically excluded from future sitemap updates.

## Deindexing When Jobs Expire
Current approach (passive): noindex meta tag prevents NEW indexing. Previously indexed URLs will eventually be de-indexed by Google when it recrawls and sees noindex.

Recommended future approach (active):
- Use Google Search Console URL Inspection tool to manually remove specific expired high-traffic job URLs.
- See `GETHIRED_SEO_GOOGLE_INDEXING_API_PLAN_V3.md` for the Indexing API plan.

## No Backend Changes Made in This Pass
The expired job lifecycle management is a BE concern that requires careful testing of the public job detail endpoint. No BE changes were made beyond the sitemap endpoint.
