# GETHIRED SEO Sitemap Log V3

Generated: 2026-06-25

## Implementation

**Strategy chosen: Dynamic BE endpoint** (not static FE file).
Reason: Job IDs are dynamic and change frequently; a static sitemap would go stale immediately.

## BE Endpoint Added
**File:** `get-hired-BE/server.js`
**Route:** `GET /sitemap.xml` (mounted at the root, not under `/api/`)

## Endpoint Behavior
- Queries `${schema}.jobs WHERE job_status_id = 2` for all active published jobs.
- Returns XML with static pages + all active job URLs.
- No authentication required (public endpoint).
- Cache-Control header: `public, max-age=3600` (1-hour cache to reduce DB load).
- On error: returns empty valid XML (silent fail — does not crash the server).

## Static Pages Included
| URL | changefreq | priority |
|-----|-----------|---------|
| https://gethiredonline.app/home | weekly | 1.0 |
| https://gethiredonline.app/jobs | daily | 0.9 |
| https://gethiredonline.app/job-seekers | monthly | 0.7 |
| https://gethiredonline.app/employers | monthly | 0.7 |

## Dynamic Pages
All active job URLs:
`https://gethiredonline.app/jobs/details/{job_id}`
- `lastmod`: job's `updated_at` date
- `changefreq`: weekly
- `priority`: 0.8

## Pages Excluded (by design)
- `/signin`, `/signup`, `/reset-password` — auth pages
- `/admin/*`, `/recruiter/*`, `/user/*` — private routes
- `/jobs/search/*` — parameterized search results
- `/companies/details?id=*` — company pages (not in this sitemap pass; backlog item)
- Expired/archived/draft jobs (`job_status_id != 2`)

## robots.txt Reference
`Sitemap: https://gethiredonline.app/sitemap.xml`

## Backlog
- Add company detail pages to sitemap once company page SEO is mature
- Add X-Robots-Tag or HTTP 404 for expired job URLs to complement sitemap exclusion
- Consider sitemap index file if total URLs exceed 50,000

## Verification Steps
1. After deploy: `curl https://gethiredonline.app/sitemap.xml` — should return XML.
2. Submit to Google Search Console: `https://gethiredonline.app/sitemap.xml`.
3. Monitor coverage report for errors.
