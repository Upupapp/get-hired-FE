# GetHired Regression Checklist — SEO V3 Verification
**Date:** 2026-06-25  
**Deployment:** FE bf5bd08, BE 26ca25a  
**Tester:** _______________

Mark each item: [x] Pass | [!] Fail | [-] Skip/N/A

---

## A. robots.txt

- [ ] GET https://gethiredonline.app/robots.txt returns HTTP 200
- [ ] Content-Type is `text/plain`
- [ ] Contains `User-agent: *`
- [ ] Contains `Disallow: /admin/`
- [ ] Contains `Disallow: /api/`
- [ ] Contains `Disallow: /signin`
- [ ] Contains `Disallow: /signup`
- [ ] Contains `Sitemap: https://gethiredonline.app/sitemap.xml`
- [ ] File is NOT behind authentication

---

## B. sitemap.xml

- [ ] GET https://gethiredonline.app/sitemap.xml returns HTTP 200
- [ ] Content-Type includes `application/xml`
- [ ] Response contains `Cache-Control: public, max-age=3600`
- [ ] Response starts with `<?xml version="1.0" encoding="UTF-8"?>`
- [ ] `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` present
- [ ] Contains `<loc>https://gethiredonline.app/home</loc>`
- [ ] Contains `<loc>https://gethiredonline.app/jobs</loc>`
- [ ] Contains `<loc>https://gethiredonline.app/job-seekers</loc>`
- [ ] Contains `<loc>https://gethiredonline.app/employers</loc>`
- [ ] At least one `<loc>https://gethiredonline.app/jobs/details/` entry (published jobs exist)
- [ ] Job URL format is `/jobs/details/:id` (NOT `/jobs/detail/` or `/job/`)
- [ ] File is NOT behind authentication (no 401/403)
- [ ] No database error details leak into response body

---

## C. Homepage (/)

- [ ] `<title>` is "GetHired Online — Jobs and Hiring Platform in the Philippines"
- [ ] `<meta name="description">` is populated
- [ ] `<meta property="og:type">` = `website`
- [ ] `<meta property="og:title">` matches page title
- [ ] `<meta name="robots">` = `index, follow`
- [ ] `<script type="application/ld+json" id="gh-jsonld-org">` present in DOM
- [ ] JSON-LD `@type` = `Organization`
- [ ] `<script type="application/ld+json" id="gh-jsonld-website">` present in DOM
- [ ] JSON-LD `@type` = `WebSite` with SearchAction

---

## D. Jobs List (/jobs)

- [ ] `<title>` contains "Browse Jobs" or "Jobs in the Philippines"
- [ ] `<meta property="og:url">` = `https://gethiredonline.app/jobs`
- [ ] `<link rel="canonical">` href = `https://gethiredonline.app/jobs`
- [ ] `<meta name="robots">` = `index, follow`
- [ ] `<script id="gh-jsonld-breadcrumb">` present with BreadcrumbList schema

---

## E. Job Detail Page (/jobs/details/:id — published job)

- [ ] `<title>` = "{jobTitle} at {companyName} | GetHired Online"
- [ ] If company name is missing from API, title uses "GetHired Company" fallback
- [ ] `<meta name="robots">` = `index, follow`
- [ ] `<link rel="canonical">` href = `https://gethiredonline.app/jobs/details/{id}`
- [ ] `<meta property="og:type">` = `article`
- [ ] `<script id="gh-jsonld-jobposting">` present in DOM
- [ ] JSON-LD `@type` = `JobPosting`
- [ ] JSON-LD `url` = `https://gethiredonline.app/jobs/details/{id}`
- [ ] JSON-LD `hiringOrganization.name` is populated (not empty)
- [ ] JSON-LD `description` has no raw HTML tags (`<p>`, `<b>`, etc.)
- [ ] `<script id="gh-jsonld-breadcrumb">` present with 3-item breadcrumb
- [ ] Navigating AWAY from this page removes the `gh-jsonld-jobposting` script
- [ ] Navigating AWAY removes the `gh-jsonld-breadcrumb` script

---

## F. Job Detail Page — inactive/draft job

- [ ] `<meta name="robots">` = `noindex, nofollow`
- [ ] `<script id="gh-jsonld-jobposting">` is NOT present in DOM

---

## G. Job Search Results (/jobs/search/:keyword)

- [ ] `<meta name="robots">` = `noindex, follow`
- [ ] `<link rel="canonical">` = `https://gethiredonline.app/jobs` (canonical points to list, not search)
- [ ] No JobPosting JSON-LD injected on this page

---

## H. Sign In (/signin)

- [ ] `<meta name="robots">` = `noindex, nofollow`
- [ ] `<title>` = "Sign In | GetHired Online"

---

## I. 404 Page

- [ ] `<meta name="robots">` = `noindex, follow`
- [ ] `<title>` = "Page Not Found | GetHired Online"
- [ ] No JobPosting JSON-LD on 404 page

---

## J. Job Seeker Portal (/job-seekers)

- [ ] `<title>` = "Find Jobs in the Philippines | GetHired Online"
- [ ] `<meta name="robots">` = `index, follow`
- [ ] `<link rel="canonical">` = `https://gethiredonline.app/job-seekers`

---

## K. Employer Portal (/employers)

- [ ] `<meta name="robots">` = `index, follow`
- [ ] `<link rel="canonical">` = `https://gethiredonline.app/employers`

---

## L. SSR / Angular Universal safety (if SSR is enabled)

- [ ] Server-side render of homepage does NOT crash with "document is not defined"
- [ ] Server-side render of job detail page does NOT crash
- [ ] JSON-LD tags appear in SSR HTML source (or are correctly absent — depends on SSR config)

---

## M. Regression: Pre-existing features

- [ ] Job list (/jobs) still loads and paginates correctly
- [ ] Job application flow still works end-to-end
- [ ] Employer dashboard still loads
- [ ] Sign in still works
- [ ] Sign up still works
- [ ] robots.txt did NOT accidentally break the homepage route (both served from same domain)

---

## N. Google Search Console (post-deploy, 1-2 days after deploy)

- [ ] Submit sitemap.xml in Search Console
- [ ] Fetch and render tool shows correct page titles for homepage and a job detail
- [ ] No "Blocked by robots.txt" errors for public pages
- [ ] No "Noindex" errors for pages that should be indexed

---

## Sign-off

| Check | Result | Notes |
|---|---|---|
| robots.txt | | |
| sitemap.xml | | |
| Homepage SEO | | |
| Job Detail SEO | | |
| SSR safety | | |
| Regression | | |

Signed off by: _______________ Date: _______________
