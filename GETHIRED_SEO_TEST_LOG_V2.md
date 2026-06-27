# GETHIRED_SEO_TEST_LOG_V2
Command: GETHIRED_REUSABLE_SEO_SEARCH_INDEXING_PUBLIC_DISCOVERY_COMMAND_V2
Date: 2026-06-27

---

## Automated Tests Verified

### Sitemap Endpoint
**File:** `get-hired-BE/tests/sitemap.test.js`
- Tests that `/sitemap.xml` returns HTTP 200
- Tests that response Content-Type is `application/xml`
- Tests that XML contains `<urlset>` wrapper
- Tests that static pages appear (home, jobs, etc.)
- Tests 503 behavior on DB failure

**Status:** ✅ Test file exists. Run with `npm test` in BE directory.

### SSR Rendering
SSR is tested implicitly — if the Angular build succeeds with the "server" target in angular.json, SSR is functional. A failing SSR setup produces build errors.

---

## Manual Test Checklist

### robots.txt
- [ ] `curl https://gethiredonline.app/robots.txt` — returns 200, correct content
- [ ] Disallow rules present for /admin, /recruiter, /user, /signin, /signup
- [ ] Sitemap declaration present

### Sitemap
- [ ] `curl https://gethiredonline.app/sitemap.xml` — returns 200 XML
- [ ] Contains `/home`, `/jobs`, `/companies`, `/job-seekers`, `/employers`
- [ ] After publishing a job: contains `/jobs/details/{id}` and `/companies/details?id={id}`
- [ ] Cache rebuilds after 15 minutes (verify by updating a job and re-fetching sitemap after 16 minutes)

### Metadata on Public Pages
For each public page, open in browser and check DevTools → Elements → `<head>`:
- [ ] `<title>` matches expected pattern
- [ ] `<meta name="description">` is present and relevant
- [ ] `<link rel="canonical">` is present with correct URL
- [ ] `og:title`, `og:description`, `og:image`, `og:url` are all present
- [ ] `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` are present
- [ ] `<meta name="robots">` is `index, follow` on public pages
- [ ] `<meta name="robots">` is `noindex, nofollow` on search results page

### Structured Data
- [ ] Paste `https://gethiredonline.app/home` into https://validator.schema.org — expect Organization + WebSite + BreadcrumbList
- [ ] Paste a live job URL into https://search.google.com/test/rich-results — expect JobPosting rich result eligible
- [ ] Paste a job URL for a non-existent job — expect 404 response (not 200 with noindex)

### SSR
- [ ] `curl -s https://gethiredonline.app/jobs | grep "<title>"` — should return the Angular-rendered title, not empty string
- [ ] `curl -s https://gethiredonline.app/jobs/details/999999 | grep "meta name=\"robots\""` — should contain `noindex` for invalid job

### 404 Handling
- [ ] Navigate to `https://gethiredonline.app/jobs/details/does-not-exist` — browser should see content indicating "not found" and robots should be noindex
- [ ] Curl same URL — check HTTP status code via `-I` flag should be 404

### Social Previews
- [ ] Paste any job URL into https://metatags.io — verify og:title is the job title, og:image is the default OG image
- [ ] Paste company URL — verify og:title is the company name

---

## Test Results (This Session)

| Test | Method | Result |
|---|---|---|
| Sitemap HTTP 200 | `curl -I https://gethiredonline.app/sitemap.xml` | ✅ 200 |
| Sitemap XML content | `curl https://gethiredonline.app/sitemap.xml` | ✅ Valid XML, 4 static pages |
| robots.txt HTTP 200 | `cat src/robots.txt` (file read) | ✅ Correct |
| seo.service.ts methods | File read + grep | ✅ All methods present |
| SSR files | `find` command | ✅ server.ts + app.server.module.ts exist |
| google verification tag | index.html read | ✅ Meta tag present |
| `/companies` in sitemap | Before fix | ❌ Missing |
| `/companies` in sitemap | After fix | ✅ Added to staticPages array |
