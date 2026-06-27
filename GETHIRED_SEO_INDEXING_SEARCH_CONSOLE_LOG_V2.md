# GETHIRED_SEO_INDEXING_SEARCH_CONSOLE_LOG_V2
Command: GETHIRED_REUSABLE_SEO_SEARCH_INDEXING_PUBLIC_DISCOVERY_COMMAND_V2
Date: 2026-06-27

---

## Google Search Console Verification

**Verification Method:** Meta tag in `index.html`
```html
<meta name="google-site-verification" content="[token]">
```
**Status:** ✅ Tag is present in index.html.

**Backup verification:** `google8d5e93b3a9106865.html` is in angular.json assets — deployed to dist root, accessible at `https://gethiredonline.app/google8d5e93b3a9106865.html`.

---

## Sitemap Submission

**Sitemap URL:** `https://gethiredonline.app/sitemap.xml`

**Action required (manual — cannot be automated):**
1. Go to Google Search Console → Sitemaps
2. Enter `sitemap.xml`
3. Click Submit
4. Monitor status over 24–72 hours

**Current sitemap state after this session:**
- 5 static pages: /home, /jobs, /companies (newly added), /job-seekers, /employers
- 0 dynamic job URLs (no published jobs in DB)
- 0 dynamic company URLs
- Sitemap returns HTTP 200 ✅

---

## Indexing Verification Steps

### Verify the homepage is indexed
```
site:gethiredonline.app
```
Search this on Google. If results appear, indexing is active.

### Verify job detail pages are indexed
```
site:gethiredonline.app/jobs/details
```

### Verify private routes are NOT indexed
```
site:gethiredonline.app/recruiter
site:gethiredonline.app/admin
```
These should return 0 results.

---

## Expected Google Crawl Timeline

After sitemap submission and deploy of BE fix (companies URL added):

| Day | Expected |
|---|---|
| 0–2 | Googlebot fetches updated sitemap |
| 2–7 | Static pages verified/recrawled |
| 7–30 | Dynamic job pages discovered and indexed as jobs are published |
| 30–90 | Company pages indexed as job volume grows |

---

## Search Console Reports to Monitor

| Report | What to Watch |
|---|---|
| Coverage | "Valid" URLs increasing; "Excluded" not growing unexpectedly |
| Sitemaps | Sitemap URL listed, status "Success", discovered URL count correct |
| Core Web Vitals | Mobile/Desktop LCP, CLS, FID/INP |
| Rich Results > Job Postings | Job count, any errors in JobPosting schema |
| Links | Internal linking between public pages |
| Performance | Impressions + clicks on job-related queries |

---

## GSC Enhancements — Job Postings

Once live job postings exist and their pages are indexed, Google Search Console should show a "Job Posting" enhancement report. Target keywords for SERP feature eligibility:
- "jobs Philippines"
- "IT jobs Philippines"
- "remote jobs Philippines"
- "{City} jobs Philippines"

---

## Index Control Architecture (No Changes)

| Mechanism | Status |
|---|---|
| robots.txt (crawl budget) | ✅ Complete |
| Per-page `<meta name="robots">` | ✅ Per-route via SeoService |
| HTTP 404 for invalid job URLs | ✅ Via SSR RESPONSE token |
| AuthGuard on private routes | ✅ Guards redirect to /signin |
| No auth cookies = no private data | ✅ SSR renders only public data for unauthenticated requests |

---

## Outstanding Manual Actions

| # | Action | Who | Platform |
|---|---|---|---|
| 1 | Submit sitemap.xml in GSC | User | Google Search Console |
| 2 | Verify site ownership in GSC | User | Google Search Console |
| 3 | Deploy BE (companies sitemap fix) | User | Linode / SSH |
| 4 | Monitor GSC Coverage after deploy | User | Google Search Console |
| 5 | Run Rich Results Test on a live job URL | User | search.google.com/test/rich-results |
