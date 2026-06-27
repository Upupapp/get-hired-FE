# GETHIRED SEO Search Console Monitoring Plan V3

Generated: 2026-06-25

## Current Verification Status
Google site verification tag present in `index.html`:
```html
<meta name="google-site-verification" content="EYWOEFfXbR2hY6_iyAD0X8UXPX4fHysRFjxnOUJoEJo">
```
Property: `https://gethiredonline.app` (assumed verified, tag present).

## Immediate Actions After Deploy

### 1. Submit Sitemap
URL: `https://gethiredonline.app/sitemap.xml`
Steps:
1. Search Console → Sitemaps → Add sitemap URL
2. Click Submit
3. Monitor "Discovered URLs" vs "Indexed URLs"

### 2. Request Indexing for Key Pages
Use URL Inspection tool to request indexing for:
- https://gethiredonline.app/home
- https://gethiredonline.app/jobs
- https://gethiredonline.app/job-seekers
- https://gethiredonline.app/employers

### 3. Verify robots.txt Is Correct
Search Console → Settings → robots.txt tester

## Ongoing Monitoring (Weekly)

### Coverage Report
- Monitor "Error" URLs — fix 404s that should not exist.
- Monitor "Excluded — noindex" — verify only private/auth pages are excluded.
- Monitor "Valid" count — should increase as jobs are published and indexed.

### Rich Results Test
After deploy, test 3-5 active job detail pages:
https://search.google.com/test/rich-results?url=https://gethiredonline.app/jobs/details/{job_id}

Expected result: JobPosting card in rich results.

### Core Web Vitals Report
Monitor CWV in Search Console → Core Web Vitals tab.
Priority: improve /jobs LCP (API response time is the main factor).

## Action Triggers

| Trigger | Action |
|---------|--------|
| Indexed URL count drops | Check for accidental noindex or sitemap error |
| Rich result errors | Check JobPosting JSON-LD via Rich Results Test |
| robots.txt blocks | Review robots.txt file for accidental broad Disallow |
| 404 spike | Investigate broken links or deleted job URLs |
| CWV degradation | Profile API response time, check bundle size |

## Monitoring Tools (no external integrations needed)
- Google Search Console (already verified)
- Google Rich Results Test (https://search.google.com/test/rich-results)
- Google robots.txt Tester (in Search Console)
- PageSpeed Insights (https://pagespeed.web.dev) for CWV
