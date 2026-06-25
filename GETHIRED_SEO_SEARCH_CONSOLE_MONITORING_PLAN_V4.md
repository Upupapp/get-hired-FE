# GetHired SEO V4 — Search Console & Monitoring Plan

Generated: 2026-06-26

## Current Verification Status

Google Search Console verification tag is present in index.html:
```html
<meta name="google-site-verification" content="EYWOEFfXbR2hY6_iyAD0X8UXPX4fHysRFjxnOUJoEJo">
```

**Action required:** A human must log into Google Search Console and complete the property claim for `https://gethiredonline.app`. The HTML tag is in place — verification takes 30 seconds in the GSC UI.

## Search Console Setup Checklist

- [ ] Open https://search.google.com/search-console/
- [ ] Add property → URL prefix → https://gethiredonline.app
- [ ] Choose "HTML tag" verification method (tag already in index.html — no code change needed)
- [ ] Click Verify
- [ ] Go to Sitemaps → Add sitemap → enter `sitemap.xml` → Submit
- [ ] URL Inspection → test /home, /jobs, /jobs/details/[active-id] → Request indexing

## Weekly Monitoring Dashboard

### Coverage Report
- Check "Valid" URL count (should grow as new jobs are indexed)
- Check "Excluded" → "noindex" (should include /signin, /signup, 404 — expected)
- Alert if any public pages appear in "Excluded" unexpectedly

### Performance Report
- Track impressions and clicks for job-related queries
- Key queries to monitor: "jobs in philippines", "hiring philippines", "[city] jobs philippines"
- Track CTR for job detail pages (these have rich results via JobPosting JSON-LD)

### Rich Results Status
- Go to: https://search.google.com/test/rich-results
- Test URL: https://gethiredonline.app/jobs/details/[active-job-id]
- Expected: JobPosting rich result eligible
- Also test /home for Organization and WebSite rich results

### Core Web Vitals Report
- Check "Mobile" CWV report monthly
- Target: All URLs in "Good" band (LCP < 2.5s, CLS < 0.1, INP < 200ms)

## Alert Thresholds

| Metric | Alert if |
|--------|---------|
| Crawl errors (4xx) | > 10 new per week |
| Valid URLs drop | > 20% week-over-week |
| Sitemap errors | Any error |
| Mobile usability issues | Any new issue |

## Post-V4 Deploy Verification Sequence

1. Deploy FE (noindex fixes + SSR canonical fix)
2. Deploy BE (sitemap already deployed in V3)
3. `curl -A Googlebot https://gethiredonline.app/jobs/details/[id]` — confirm `<link rel="canonical">` and `<script type="application/ld+json">` in response HTML
4. `curl -I https://gethiredonline.app/sitemap.xml` — confirm `Content-Type: application/xml`
5. `curl -A Googlebot https://gethiredonline.app/signup` — confirm `<meta name="robots" content="noindex, nofollow">`
6. Rich Results Test on an active job detail URL
7. Complete GSC property claim + sitemap submission

## Indexing Timeline Expectations

- Initial sitemap crawl: 1-7 days after GSC submission
- First job detail indexed: 3-14 days
- Google for Jobs listing: 1-4 weeks after JobPosting JSON-LD is live
- Full coverage of active jobs: 4-8 weeks
