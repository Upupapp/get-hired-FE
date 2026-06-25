# GetHired SEO V4 — Sitemap Log

Generated: 2026-06-26

## Sitemap Implementation

**File:** `get-hired-BE/server.js` — `GET /sitemap.xml`
**Status:** PASS (implemented in V3, verified in V4)

## Configuration

| Setting | Value |
|---------|-------|
| Endpoint | GET /sitemap.xml |
| Auth | None (public) |
| Cache TTL | 15 minutes (in-process, single-server) |
| Cache-Control header | public, max-age=900 |
| On DB error | 503 with Retry-After: 3600 |
| XML charset | UTF-8 |
| XML escaping | xmlEscape() function applied to job_id and lastmod |

## Static Pages in Sitemap

| URL | changefreq | priority |
|-----|-----------|---------|
| /home | weekly | 1.0 |
| /jobs | daily | 0.9 |
| /job-seekers | monthly | 0.7 |
| /employers | monthly | 0.7 |

## Dynamic Job URLs

- Source: `SELECT job_id, updated_at FROM [schema].jobs WHERE job_status_id = 2`
- URL pattern: `https://gethiredonline.app/jobs/details/[job_id]`
- lastmod: `updated_at` (ISO date) or today if null
- changefreq: weekly
- priority: 0.8

## Missing from Sitemap (Backlog)

| URL | Priority | Notes |
|-----|----------|-------|
| /companies/details?id=X | P2 | Company pages not included — would require active company query |
| /job-seekers, /employers | included | ✓ already there |

## Robots.txt Reference

`Sitemap: https://gethiredonline.app/sitemap.xml` — present in robots.txt ✓

## Production Verification Command

```bash
curl -I https://gethiredonline.app/sitemap.xml
```
Expected: `Content-Type: application/xml; charset=utf-8`

If response is `text/html`: Nginx is serving the Angular SPA instead of proxying to the BE. Fix:
```nginx
location = /sitemap.xml {
    proxy_pass http://localhost:3000/sitemap.xml;
}
```

This was the one remaining verification item from V3. Status: user must run this check manually.

## robots.txt Sitemap Integration

The robots.txt `Sitemap:` directive is recognized by Googlebot and all major crawlers. No additional submission is needed once Search Console is verified — but explicitly submitting via Search Console → Sitemaps accelerates initial indexing.
