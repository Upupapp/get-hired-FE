# GETHIRED NOTIFY — SEO V3 Messaging Quality Gates
**Session:** 2026-06-25

---

## Gate Results

| Gate | Requirement | Status |
|------|-------------|--------|
| G1 | All indexed pages have meta descriptions 120–160ch | PASS (after fixes) |
| G2 | All public page titles include "GetHired Online" | PASS |
| G3 | All public page titles include "Philippines" or are contextually specific | PASS |
| G4 | No indexed pages missing canonical URL | PASS |
| G5 | All auth/private routes noindexed or robots.txt disallowed | PASS |
| G6 | Job detail page sets robots based on job status (noindex for non-published) | PASS |
| G7 | 404 page is noindex, follow | PASS |
| G8 | sitemap.xml returns 503 + Retry-After on error | PASS (after fix) |
| G9 | robots.txt disallows all authenticated route prefixes | PASS |
| G10 | JSON-LD JobPosting only fires for job_status_id === 2 | PASS |
| G11 | JSON-LD uses real API data only (no fabricated fields) | PASS |
| G12 | Organization + WebSite JSON-LD set on homepage | PASS |
| G13 | BreadcrumbList JSON-LD cleared on component destroy | PASS |
| G14 | JobPosting JSON-LD cleared on component destroy | PASS |
| G15 | OG/Twitter meta tags updated on every route change | PASS |
| G16 | og:image asset exists at declared path | FAIL — `gethired-og-default.png` not found |
| G17 | Static index.html og:image fallback present | FAIL — no static og:image in index.html |
| G18 | No duplicate or conflicting title calls (constructor vs ngOnInit) | PASS |
| G19 | Social share copy is accurate (no fabricated claims) | PASS |
| G20 | Sitemap includes only published jobs (job_status_id = 2) | PASS |

**Summary: 18/20 gates PASS | 2/20 FAIL (both related to missing OG image asset)**

---

## P0 Risks (must fix before social campaign or paid media)

### RISK-01: Missing OG image — social shares show no image card
- Declared path: `https://gethiredonline.app/assets/brand/gethired-og-default.png`
- File exists: NO
- Impact: When any GetHired page is shared on Facebook, LinkedIn, or Twitter/X, no image card appears. This substantially reduces click-through on social shares.
- Fix: Create a 1200x630px branded PNG and place at `src/assets/brand/gethired-og-default.png`. Add to `angular.json` assets. Add static `<meta property="og:image" content="https://gethiredonline.app/assets/brand/gethired-og-default.png">` to index.html.

---

## P1 Risks (should fix before Google Search Console audit)

### RISK-02: JSON-LD `description: ""` for null jobDescription
- When `job.jobDescription` is null, the JobPosting JSON-LD emits `"description": ""`.
- Google's Rich Results Test accepts this but will not show enhanced job result for posts with empty description.
- Fix: Conditionally omit `description` key when empty:
  ```typescript
  ...(job.jobDescription ? { description: this.stripHtml(job.jobDescription) } : {}),
  ```

### RISK-03: Authenticated job-posts-details uses stale title format
- `job-posts-details.component.ts` calls `this.titleService.setTitle('${job.title} at ${job.companyName} | GetHired')` — uses "GetHired" not "GetHired Online"
- Also uses a completely different title on reset: `'Get Hired - Hire experts or be hired for any job, any time.'`
- Not a public SEO issue (auth-gated) but creates brand inconsistency in browser tab titles for logged-in users.

---

## P2 Risks (nice-to-have)

### RISK-04: Skeleton CSS classes defined but unused in public templates
- `.gh-skeleton-card`, `.gh-skeleton-title` etc. are declared in styles.scss but no public template uses them.
- The loading state on public job list / job detail falls back to whatever the existing spinner/loading pattern is.
- Fix: Wire skeleton markup into public-list and public-details loading states for better perceived performance.

### RISK-05: robots.txt does not explicitly disallow /jobs/search/
- Currently: /jobs/search/:keyword is allowed by robots.txt but noindexed by SeoService.
- Best practice: If a page is noindex, also Disallow in robots.txt to avoid crawl budget waste on infinite keyword variants.
- Add: `Disallow: /jobs/search/` to robots.txt (Disallow doesn't prevent noindex pages from being followed via links — it just stops crawlers from discovering them via robots.txt).

### RISK-06: Company detail canonical URL uses query param format
- Canonical: `https://gethiredonline.app/companies/details?id={companyId}`
- Query-param canonicals are valid but fragment-based/path-based URLs are cleaner for Google indexing.
- Low priority — query param canonicals work fine.

---

## Quality Summary

**Meta description quality:** Good (all public indexed pages 120–160ch after fixes)  
**Title format consistency:** Good (consistent `[Descriptor] | GetHired Online` across all non-homepage pages)  
**OG/social sharing readiness:** Blocked by missing og:image asset  
**robots.txt quality:** Good  
**sitemap.xml:** Good (503+Retry-After after fix, in-memory cache present)  
**JSON-LD quality:** Good (real data only, conditional rich results fields, proper cleanup on destroy)  
**noindex decisions:** Correct across all 4 noindexed routes  

