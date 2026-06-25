# GetHired SEO V4 — Expired Job Indexing Lifecycle Log

Generated: 2026-06-26

## Job Status Policy

| jobStatusId | Meaning | SEO treatment |
|-------------|---------|---------------|
| 2 | Active / Published | index, follow + JobPosting JSON-LD |
| Any other | Draft / Expired / Paused / Closed | noindex, nofollow + no JSON-LD |

## Lifecycle for Expired/Closed Jobs

When a job's status changes from 2 to any other value:

1. **Immediate effect (next page load):** PublicDetailsComponent reads jobStatusId from the API response; if not 2, it sets `robots: 'noindex, nofollow'` and does NOT emit JobPosting JSON-LD.

2. **Sitemap removal:** The BE sitemap endpoint queries `WHERE job_status_id = 2` — expired jobs are automatically excluded from the sitemap within 15 minutes (TTL).

3. **Google de-indexing:** Without Google Indexing API, de-indexing relies on Googlebot's next crawl (typically days to weeks). Google will see noindex and remove the URL from the index.

4. **No redirect needed:** Expired job URLs remain accessible (visitors get a page explaining the job is no longer available) — 410 Gone is not implemented (backlog). The noindex tag prevents the page from staying in the index.

## What Happens When Googlebot Visits an Expired Job URL

1. SSR returns `<meta name="robots" content="noindex, nofollow">` in HTML
2. No JobPosting JSON-LD in the HTML
3. Googlebot honors noindex → URL removed from index at next crawl cycle
4. No ranking signals are lost (the URL was never indexable with that status)

## Soft 404 Concern (Still Open from V3)

When a job URL that Googlebot knows about becomes expired, the server still returns HTTP 200 with noindex content. Google treats repeated 200+noindex as "drop from index" — this is acceptable behavior. However, a 410 Gone response would signal the removal faster.

Implementation of 410 would require:
- BE to expose job status via a fast-path endpoint OR
- Angular server.ts to query the job status before rendering

This remains a V5 backlog item (P3 — not blocking).

## Fast Removal with Google Indexing API

See: `GETHIRED_SEO_GOOGLE_INDEXING_API_PLAN_V4.md`

The Indexing API allows sending `URL_UPDATED` on publish and `URL_DELETED` on expiry to trigger immediate recrawl. This would reduce the de-indexing lag from days/weeks to hours.

## BE Sitemap Query Reference

```sql
SELECT job_id, updated_at
FROM [schema].jobs
WHERE job_status_id = 2
ORDER BY updated_at DESC
```
Located in: `get-hired-BE/server.js` (sitemap endpoint)
