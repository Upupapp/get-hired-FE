# GetHired SEO V4 — Validation & Testing Log

Generated: 2026-06-26

## Automated Checks (run post-deploy)

### 1. SSR Title Verification (confirmed working in V3)
```bash
curl -sA "Googlebot/2.1" https://gethiredonline.app/ | grep "<title>"
# Expected: <title>GetHired Online — Jobs and Hiring Platform in the Philippines</title>
```

### 2. SSR Canonical Verification (NEW in V4 — should now work)
```bash
curl -sA "Googlebot/2.1" https://gethiredonline.app/home | grep "canonical"
# Expected: <link rel="canonical" href="https://gethiredonline.app/home">
# V3: this would return empty (canonical was browser-only)
# V4: should return the canonical tag in SSR HTML
```

### 3. SSR JSON-LD Verification (NEW in V4 — should now work)
```bash
curl -sA "Googlebot/2.1" https://gethiredonline.app/jobs/details/[active-id] | grep "application/ld+json"
# Expected: one or more <script type="application/ld+json" lines
# V3: would return empty (JSON-LD was browser-only)
# V4: should return JobPosting + BreadcrumbList in SSR HTML
```

### 4. robots.txt Accessibility
```bash
curl https://gethiredonline.app/robots.txt
# Expected: complete robots.txt content with Disallow rules and Sitemap line
```

### 5. Sitemap XML Verification
```bash
curl -I https://gethiredonline.app/sitemap.xml
# Expected: Content-Type: application/xml; charset=utf-8
# If text/html: add Nginx proxy rule (see GETHIRED_SEO_SITEMAP_LOG_V4.md)

curl -s https://gethiredonline.app/sitemap.xml | head -5
# Expected: <?xml version="1.0" encoding="UTF-8"?>
# <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
```

### 6. Noindex on Auth Pages (NEW in V4)
```bash
curl -sA "Googlebot/2.1" https://gethiredonline.app/signup | grep "robots"
# Expected: <meta name="robots" content="noindex, nofollow">
# V3: no meta robots on /signup (only robots.txt Disallow)
# V4: component-level noindex present

curl -sA "Googlebot/2.1" https://gethiredonline.app/reset-password | grep "robots"
# Expected: <meta name="robots" content="noindex, nofollow">
```

### 7. Noindex on 404
```bash
curl -sA "Googlebot/2.1" https://gethiredonline.app/this-page-does-not-exist | grep "robots"
# Expected: <meta name="robots" content="noindex, follow">
```

### 8. Google Search Console Rich Results Test
URL: https://search.google.com/test/rich-results
Test URL: https://gethiredonline.app/jobs/details/[active-job-id]
Expected result: JobPosting detected, no errors

### 9. Google Structured Data Testing
URL: https://validator.schema.org/
Paste SSR HTML from curl for /home
Expected: Organization, WebSite, BreadcrumbList all valid, no errors

## Manual Checks

| Check | Method | Expected |
|-------|--------|---------|
| Social preview (Facebook) | https://developers.facebook.com/tools/debug/ — test /home | Title, description, logo image shown |
| Social preview (job detail) | Same tool, test /jobs/details/[id] | Job title, description |
| Mobile usability | https://search.google.com/test/mobile-friendly — test /home, /jobs | Mobile friendly |
| PageSpeed /home | https://pagespeed.web.dev/ | Performance > 70 mobile |
| PageSpeed /jobs | Same | Performance > 70 mobile |

## Known Pass/Fail Before Verification

| Test | V3 status | V4 expected |
|------|-----------|-------------|
| SSR title | PASS | PASS |
| SSR canonical | FAIL (browser-only) | PASS (V4 fix) |
| SSR JSON-LD | FAIL (browser-only) | PASS (V4 fix) |
| robots.txt accessible | PASS | PASS |
| Sitemap XML content-type | NEEDS VERIFICATION | NEEDS VERIFICATION |
| noindex on /signup | FAIL (missing component meta) | PASS (V4 fix) |
| noindex on /reset-password | FAIL | PASS (V4 fix) |
| noindex on /change-password | FAIL | PASS (V4 fix) |
| noindex on /verify | FAIL | PASS (V4 fix) |
| noindex on /signin | PASS | PASS |
| noindex on 404 | PASS | PASS |
| Rich Results Test | PASS (JS-rendered) | PASS (now SSR too) |
