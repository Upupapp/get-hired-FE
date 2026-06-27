# GETHIRED SEO Validation Test Log V3

Generated: 2026-06-25

## Validation Checklist

### Route Metadata Validation

| Route | Title Set | Description Set | robots Set | Canonical Set | OG Tags Set |
|-------|-----------|----------------|-----------|--------------|-------------|
| /home | ✅ SeoService | ✅ SeoService | ✅ index,follow | ✅ /home | ✅ |
| /jobs | ✅ SeoService | ✅ SeoService | ✅ index,follow | ✅ /jobs | ✅ |
| /jobs/details/:id (active) | ✅ dynamic | ✅ dynamic | ✅ index,follow | ✅ per-job | ✅ |
| /jobs/details/:id (inactive) | ✅ dynamic | ✅ dynamic | ✅ noindex | ✅ per-job | ✅ |
| /jobs/search/:keyword | ✅ dynamic | ✅ dynamic | ✅ noindex | ✅ /jobs | ✅ |
| /job-seekers | ✅ SeoService | ✅ SeoService | ✅ index,follow | ✅ /job-seekers | ✅ |
| /employers | ✅ SeoService | ✅ SeoService | ✅ index,follow | ✅ /employers | ✅ |
| /companies/details?id= | ✅ dynamic | ✅ dynamic | ✅ index,follow | ✅ per-company | ✅ |
| /signin | ✅ SeoService | ✅ SeoService | ✅ noindex | — | — |
| ** (404) | ✅ SeoService | ✅ SeoService | ✅ noindex | — | — |

### Structured Data Validation

| Schema Type | Page | Conditional | Status |
|------------|------|------------|--------|
| Organization | /home | Always | ✅ Implemented |
| WebSite + SearchAction | /home | Always | ✅ Implemented |
| JobPosting | /jobs/details/:id | jobStatusId===2 only | ✅ Implemented |
| BreadcrumbList | /jobs | Always | ✅ Implemented |
| BreadcrumbList | /jobs/details/:id | Once job data loads | ✅ Implemented |
| BreadcrumbList | /companies/details | Once company data loads | ✅ Implemented |

### robots.txt Validation

| Path | Expected | Disallow in robots.txt |
|------|---------|----------------------|
| /admin | Blocked | ✅ |
| /recruiter | Blocked | ✅ |
| /user | Blocked | ✅ |
| /api/ | Blocked | ✅ |
| /signin | Blocked | ✅ |
| /signup | Blocked | ✅ |
| /home | Allowed | ✅ (only listed Allow: /) |
| /jobs | Allowed | ✅ |
| /jobs/details/ | Allowed | ✅ |

### Sitemap Validation

| Requirement | Status |
|------------|--------|
| Endpoint exists at /sitemap.xml | ✅ Added to BE server.js |
| Only jobStatusId===2 jobs included | ✅ WHERE job_status_id = 2 |
| Static pages included | ✅ /home, /jobs, /job-seekers, /employers |
| Sitemap referenced in robots.txt | ✅ |
| Valid XML format | ✅ (code review — not runtime verified) |

## Manual Verification Steps (Post-Deploy)

1. `curl -s https://gethiredonline.app/robots.txt | head -30` — check Disallow rules present
2. `curl -s https://gethiredonline.app/sitemap.xml | head -50` — check XML + active job URLs
3. Open `/home` in Chrome → View Source → check `<title>`, `<meta name="description">`, `<meta name="robots">`
4. Open `/signin` → View Source → check `robots: noindex`
5. Open an active job detail page → use Google Rich Results Test
6. Open a non-existent URL → verify 404 page has "Browse Jobs" and "Homepage" links
7. Check `/jobs/details/{expired-job-id}` → View Source → check `robots: noindex`

## Known Gaps (not blocking release)

| Gap | Impact | Priority |
|-----|--------|---------|
| SSR does not set canonical via link element server-side | Minor — client hydration handles it | P3 |
| Server returns HTTP 200 for 404 routes (soft 404) | Google may take longer to de-index non-existent pages | P2 |
| `/signup`, `/reset-password` etc. missing component-level noindex | Covered by robots.txt, not a code issue | P3 |
| OG image file not created yet | Social shares use no image | P1 (design task) |
| Organization JSON-LD logo path not verified | Rich results may not show logo | P2 |
