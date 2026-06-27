# GETHIRED_SEO_SITEMAP_ROBOTS_CONTRACT_V2
Command: GETHIRED_REUSABLE_SEO_SEARCH_INDEXING_PUBLIC_DISCOVERY_COMMAND_V2
Date: 2026-06-27

---

## Sitemap

**Endpoint:** `GET https://api.gethiredonline.app/sitemap.xml`
**Served from:** Node/Express BE (`server.js` lines 155–253)
**Frontend nginx:** Proxy passes `/sitemap.xml` requests to BE
**Cache:** In-memory, 15-minute TTL, `Cache-Control: public, max-age=900`
**Format:** `application/xml; charset=utf-8`
**XML escaping:** `xmlEscape()` function — all dynamic values sanitized

### Static URL Inventory (updated 2026-06-27)

| URL | changefreq | priority |
|---|---|---|
| `https://gethiredonline.app/home` | weekly | 1.0 |
| `https://gethiredonline.app/jobs` | daily | 0.9 |
| `https://gethiredonline.app/companies` | weekly | 0.7 ← ADDED |
| `https://gethiredonline.app/job-seekers` | monthly | 0.6 |
| `https://gethiredonline.app/employers` | monthly | 0.6 |

### Dynamic Job URLs
- **Query:** `SELECT job_id, updated_at FROM {schema}.jobs WHERE job_status_id = 2 ORDER BY updated_at DESC`
- **URL pattern:** `https://gethiredonline.app/jobs/details/{job_id}`
- **changefreq:** weekly | **priority:** 0.8
- **lastmod:** `job.updated_at` (ISO date, UTC)
- **Exclusions:** draft jobs (status ≠ 2), expired jobs, unpublished jobs

### Dynamic Company URLs
- **Query:** `SELECT company_id, MAX(updated_at) FROM jobs WHERE job_status_id = 2 GROUP BY company_id`
- **URL pattern:** `https://gethiredonline.app/companies/details?id={company_id}`
- **changefreq:** weekly | **priority:** 0.6
- **lastmod:** MAX(updated_at) across company's active jobs
- **Exclusions:** companies with no active published jobs

### Excluded URL Patterns
- `/recruiter/**` — private, auth-gated
- `/user/**` — private, auth-gated
- `/admin/**` — private, auth-gated
- `/jobs/search/**` — search results (duplicate content)
- `/signin`, `/signup`, `/reset-password` — auth pages
- Draft, expired, or unpublished jobs
- Private company settings
- Payment/billing pages
- Messages, interviews, application management

---

## Robots.txt

**Location:** `src/robots.txt` → `dist/get-hired/robots.txt` (via angular.json assets)
**Live URL:** `https://gethiredonline.app/robots.txt`

```
User-agent: *
Allow: /

# Private authenticated routes
Disallow: /admin/
Disallow: /recruiter/
Disallow: /user/
Disallow: /owner/
Disallow: /investor/
Disallow: /api/
Disallow: /payment/
Disallow: /subscription/
Disallow: /signin
Disallow: /signup
Disallow: /reset-password
Disallow: /change-password
Disallow: /verify

# Duplicate content prevention
Disallow: /jobs/search/

Sitemap: https://gethiredonline.app/sitemap.xml
```

**Note:** Robots.txt is a crawl-budget tool, not a privacy mechanism. Backend authentication guards remain the primary data protection layer.

---

## Error Behavior

| Scenario | Response | Effect |
|---|---|---|
| Sitemap with active jobs | 200 XML | Google indexes jobs |
| Sitemap with no active jobs | 200 XML (4 static pages) | Static pages indexed |
| Sitemap DB error | 503 XML (empty urlset) | Google retries, does not de-index |
| Invalid job detail URL | 404 (via SSR RESPONSE token) | Google drops URL from index |
| Expired/removed job | Should return 410 | **BACKLOG** — currently returns 404 or noindex |
