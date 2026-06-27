# GETHIRED_SEO_METADATA_CONTRACT_V2
Command: GETHIRED_REUSABLE_SEO_SEARCH_INDEXING_PUBLIC_DISCOVERY_COMMAND_V2
Date: 2026-06-27

---

## Title Patterns

| Route | Title Pattern | Example |
|---|---|---|
| Home | `GetHired Online — Jobs and Hiring Platform in the Philippines` | (static) |
| Job board | `Find Jobs in the Philippines — GetHired Online` | (static) |
| Job detail | `{jobTitle} at {companyName} — GetHired Online` | Senior Dev at ACME — GetHired Online |
| Job search | `{keyword} Jobs in the Philippines — GetHired Online` | React Jobs in the Philippines… |
| Companies | `Browse Companies Hiring in the Philippines — GetHired Online` | (static) |
| Company detail | `{companyName} — Careers and Jobs — GetHired Online` | ACME Corp — Careers… |
| Job seekers | `Find Your Next Career Opportunity — GetHired Online` | (static) |
| Employers | `Hire Better with GetHired — Employer Hiring Workspace` | (static) |
| Auth pages | `Sign In — GetHired Online` / `Create Account — GetHired` | noindex |
| 404 | `Page Not Found — GetHired Online` | noindex |

**Rule:** All titles ≤ 60 characters preferred; never generic "GetHired" alone; brand suffix always ` — GetHired Online`.

---

## Meta Description Patterns

| Route | Pattern | Max Length |
|---|---|---|
| Home | Value proposition covering employers + job seekers, Philippines focus | 155 chars |
| Job board | "Browse {N}+ jobs in the Philippines across all industries. Find your next opportunity on GetHired." | 155 chars |
| Job detail | "{jobTitle} at {companyName} in {location}. {employmentType}. Apply now on GetHired Online." | 155 chars |
| Companies | "Discover top companies hiring in the Philippines. Browse company profiles, open roles, and apply on GetHired." | 155 chars |
| Company detail | "{companyName} is hiring in the Philippines. Browse open roles and learn about the team on GetHired." | 155 chars |
| Job seekers | "GetHired connects Filipino job seekers with top employers. Build your profile, upload your CV, and get hired faster." | 155 chars |
| Employers | "Post jobs, review applicants, schedule interviews, and build your employer brand with GetHired's all-in-one hiring workspace." | 155 chars |

---

## Canonical URL Rules

1. All canonical URLs use `https://gethiredonline.app` as base (hardcoded in SeoService — correct for production).
2. Job board canonical: `/jobs` (search results `/jobs/search/:keyword` always canonicalize to `/jobs`).
3. Job detail canonical: `/jobs/details/{jobId}` (exact, no trailing slash).
4. Company detail canonical: `/companies/details?id={companyId}` (query param retained — consistent with actual URL).
5. Auth pages, search results: **no canonical set** (noindex pages).
6. SeoService removes stale canonical links on navigation via `removeCanonical()`.

---

## Robots Directives

| Route Pattern | Directive |
|---|---|
| Public pages (home, jobs, companies, job-seekers, employers) | `index, follow` |
| Job detail (active job) | `index, follow` |
| Job detail (invalid/not found) | `noindex, nofollow` |
| Job search results | `noindex, nofollow` |
| Auth pages | `noindex, nofollow` (robots.txt Disallow) |
| Private dashboard pages | `noindex, nofollow` (robots.txt Disallow + AuthGuard) |
| Admin/recruiter/user shells | `noindex, nofollow` |

---

## Open Graph Tag Requirements

| Tag | Required | Source |
|---|---|---|
| `og:type` | Always `website` | SeoService default |
| `og:site_name` | Always `GetHired Online` | SeoService default |
| `og:title` | Per route | Same as `<title>` |
| `og:description` | Per route | Same as meta description |
| `og:url` | Per route | Same as canonical URL |
| `og:image` | Per route with fallback | `/assets/brand/gethired-og-default.jpg` (1200×630) |
| `og:image:width` | 1200 | Static |
| `og:image:height` | 630 | Static |
| `og:image:type` | `image/jpeg` | Static |

**OG image fallback hierarchy:**
1. Per-job/per-company dynamic image (BACKLOG — not yet implemented)
2. Category image (e.g., employer portal OG) (BACKLOG)
3. Default `/assets/brand/gethired-og-default.jpg` ← **current level**

---

## Twitter/X Card Requirements

| Tag | Value |
|---|---|
| `twitter:card` | `summary_large_image` |
| `twitter:title` | Same as og:title |
| `twitter:description` | Same as og:description |
| `twitter:image` | Same as og:image |

---

## Language / Locale

- Currently: English (default) + language switcher (Vietnamese/other)
- `lang="en"` set on `<html>` in index.html ✅
- **Hreflang:** Not yet implemented. Backlog: add `<link rel="alternate" hreflang="vi" href="...">` if localized routes exist.

---

## Implementation Authority

All metadata is managed by `src/app/core/services/seo.service.ts`.  
Call pattern: `this.seoService.setPageMeta({ title, description, canonical, ogImage, robots })`.  
JSON-LD: `this.seoService.setJobPostingJsonLd(job)` / `this.seoService.setOrganizationJsonLd()`.
