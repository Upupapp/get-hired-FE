# GETHIRED_SEO_PUBLIC_DISCOVERY_CONTENT_LOG_V2
Command: GETHIRED_REUSABLE_SEO_SEARCH_INDEXING_PUBLIC_DISCOVERY_COMMAND_V2
Date: 2026-06-27

---

## Public Discovery Surface

GetHired's publicly discoverable content lives on these routes. Each entry shows what content Google can crawl and index.

---

### `/home` — Homepage / Job Seeker & Employer Portal
**What Google sees:**
- Page title: "GetHired Online — Jobs and Hiring Platform in the Philippines"
- Description about connecting Philippine job seekers with top employers
- Organization + WebSite JSON-LD (eligible for Sitelinks Searchbox)
- Navigation links to all public sections

**Discovery path:** Direct, from sitemap, from homepage links

---

### `/jobs` — Job Board
**What Google sees:**
- List of published jobs (rendered server-side via Angular Universal)
- Job titles, company names, locations, tags
- Breadcrumb: Home > Jobs

**Discovery path:** Sitemap (priority 0.9, daily) + linked from homepage
**Note:** Job board content is SSR-rendered — Google sees a full HTML page, not a blank Angular shell.

---

### `/jobs/details/:id` — Job Detail Pages
**What Google sees:**
- Full job description (SSR-rendered)
- JobPosting structured data (eligible for Google Jobs results)
- Breadcrumb: Home > Jobs > {jobTitle}
- Canonical URL

**Discovery path:** Sitemap (priority 0.8), job board links
**Google Jobs eligibility:** ✅ JobPosting schema with required fields present
**Invalid job handling:** HTTP 404 response (Google drops from index)

---

### `/companies` — Companies Listing
**What Google sees:**
- List of companies with published jobs
- Company names, logos, descriptions
- Breadcrumb: Home > Companies

**Discovery path:** Sitemap (priority 0.7, weekly) — NEWLY ADDED
**Note:** Was not in sitemap before this session. Google was discovering it only via crawl.

---

### `/companies/details?id=:id` — Company Detail Page
**What Google sees:**
- Company profile: name, description, logo, industry, size, location
- Open roles from this company
- Breadcrumb: Home > Companies > {companyName}
- Dynamic title: "{companyName} — Careers and Jobs — GetHired Online"

**Discovery path:** Sitemap (via company URL list derived from active jobs), company listing links

---

### `/job-seekers` — Job Seeker Marketing Page
**What Google sees:**
- Marketing copy explaining GetHired's value proposition for job seekers
- Links to sign up / browse jobs
- Breadcrumb: Home > For Job Seekers

**Discovery path:** Sitemap (priority 0.6, monthly)
**Keyword targets:** "find jobs Philippines", "job seeker platform Philippines"

---

### `/employers` — Employer Marketing Page
**What Google sees:**
- Marketing copy explaining hiring workspace features
- Links to employer signup / post jobs
- Breadcrumb: Home > For Employers

**Discovery path:** Sitemap (priority 0.6, monthly)
**Keyword targets:** "post jobs Philippines", "employer hiring platform Philippines", "recruit in the Philippines"

---

## Content Not Indexed (Correct)

| Route | Why Not Indexed |
|---|---|
| `/jobs/search/:keyword` | Search result pages → duplicate content risk. `noindex + robots.txt Disallow` |
| `/user/**` | Private applicant workspace. AuthGuard + robots.txt Disallow |
| `/recruiter/**` | Private employer workspace. AuthGuard + robots.txt Disallow |
| `/admin/**` | Admin panel. AuthGuard + robots.txt Disallow |
| `/signin`, `/signup` | Auth pages. `noindex` + robots.txt Disallow |

---

## Content Discovery Gaps

| Gap | Impact | Action |
|---|---|---|
| No blog or editorial content | Missing informational/long-tail keyword coverage | Backlog: career advice blog, employer guides |
| Job board relies on dynamic SSR only | Googlebot must fully execute SSR render | Monitor Core Web Vitals and GSC Crawl Stats |
| No `/sitemap-index.xml` | Single sitemap only — fine at current scale | If >50,000 URLs emerge, split into sitemap index |

---

## Crawl Budget Notes

- `disallow: /jobs/search/` protects crawl budget from search result page explosion
- Static pages have priority rankings signaling which pages to re-crawl most frequently
- Sitemap `changefreq: "daily"` for `/jobs` encourages Google to check for new listings daily
- `max-age=900` on sitemap allows CDN/proxy caching while still refreshing every 15 minutes
