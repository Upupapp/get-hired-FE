# GetHired SEO V3 — Comprehensive Audit

Audit date: 2026-06-25
Deployment: FE commit bf5bd08, BE commit 26ca25a
Production URL: https://gethiredonline.app
Auditor: SEO specialist audit agent

---

## 1. JobPosting Schema Completeness

**Detailed analysis in**: `GETHIRED_SEO_JOBPOSTING_SCHEMA_GAPS_V3.md`

**Summary before fixes**: ~65% complete
**Summary after applied fixes**: ~85% complete

**Issues fixed in this audit**:
- company_name snake_case fallback (P1 bug — was using company bio as company name)
- baseSalary unitText normalization (P1 bug — 'HOURLY' is invalid Schema.org)
- hiringOrganization.logo added from job.companyLogoUrl
- directApply: true added (enables "Apply on site" badge)
- identifier added using job.jobId
- mapEmploymentType returns 'OTHER' fallback instead of omitting the field

**Still missing** (Phase 2):
- Remote job support: jobLocationType + applicantLocationRequirements
- hiringOrganization.sameAs (company website URL)

---

## 2. Organization JSON-LD Quality

**Source**: `setOrganizationJsonLd()` in seo.service.ts, called from `main-portal.component.ts`

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GetHired Online",
  "url": "https://gethiredonline.app",
  "logo": "https://gethiredonline.app/assets/images/logo.png",
  "sameAs": [],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "availableLanguage": ["English", "Filipino"]
  }
}
```

**Issues**:
1. `sameAs: []` — empty array is valid JSON-LD but provides no value. Should contain social media profile URLs (LinkedIn, Facebook, etc.) when those accounts exist.
2. `logo` path (`/assets/images/logo.png`) — VERIFIED this file EXISTS. The logo path is correct.
3. No `email` or `telephone` in contactPoint — these are optional but would improve the knowledge panel.

**Assessment**: ACCEPTABLE. The Organization schema is minimal but valid. sameAs is the only gap worth improving.

---

## 3. WebSite JSON-LD + SearchAction

**Source**: `setWebsiteJsonLd()` in seo.service.ts

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "GetHired Online",
  "url": "https://gethiredonline.app",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://gethiredonline.app/jobs/search/{search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

**Verification**: Route `jobs/search/:keyword` exists in `public.module.ts`. The URL template matches the Angular route exactly.

**Assessment**: CORRECT and complete. Google Sitelinks Searchbox-eligible once the domain has sufficient authority.

---

## 4. BreadcrumbList Correctness

All breadcrumb items use absolute URLs starting with `https://gethiredonline.app/`. Summary by component:

| Component | Breadcrumb Chain | Absolute URLs? | Items correct? |
|---|---|---|---|
| `public-list.component.ts` | Home → Jobs | YES | CORRECT |
| `public-details.component.ts` | Home → Jobs → Job Title | YES | CORRECT |
| `public-company-details.component.ts` | Home → Companies → Company Name | YES | CORRECT |

**Issue — /home vs root**:
All breadcrumb "Home" items link to `https://gethiredonline.app/home`. The actual root URL is `https://gethiredonline.app/` (which redirects to `/home`). This is technically fine — the canonical of the homepage is `/home`, consistent with the sitemap entry.

**Issue — Companies breadcrumb route**:
The breadcrumb "Companies" links to `https://gethiredonline.app/companies`. Verify this route exists as a navigable page (not just a module path). From the companies.module.ts, `{ path: 'details', component: PublicCompanyDetailsComponent }` — there appears to be no companies LIST page under `/companies`. If `/companies` 404s, the second breadcrumb item is a broken link in the structured data.

**Assessment**: BreadcrumbList is well-implemented. The companies middle breadcrumb URL needs verification.

---

## 5. Title and Description Quality

### Character counts and assessment

| Page | Title | Chars | Assessment | Description | Chars | Assessment |
|---|---|---|---|---|---|---|
| Homepage (`/home`) | `GetHired Online — Jobs and Hiring Platform in the Philippines` | 62 | SLIGHTLY LONG (ideal <60) | `Find jobs, build your profile, post jobs, and manage hiring with GetHired Online — the modern hiring platform for the Philippines.` | 131 | GOOD (under 160) |
| Jobs list (`/jobs`) | `Browse Jobs in the Philippines \| GetHired Online` | 49 | GOOD | `Search thousands of job opportunities in the Philippines. Apply online and track your applications with GetHired Online.` | 119 | GOOD |
| Job detail | `{jobTitle} at {companyName} \| GetHired Online` | Variable | GOOD pattern | `Apply for {jobTitle} at {companyName}. View job details, location, requirements, and apply on GetHired Online.` | Variable | GOOD |
| Job seekers | `Find Jobs in the Philippines \| GetHired Online` | 47 | GOOD | `Discover job opportunities in the Philippines. Build a profile, upload your CV, and apply for jobs with GetHired Online.` | 119 | GOOD |
| Employers | `Post Jobs and Hire Online in the Philippines \| GetHired Online` | 62 | SLIGHTLY LONG | `Post jobs, review structured applicants, and manage your hiring process with GetHired Online — the modern hiring platform for the Philippines.` | 140 | GOOD |
| Sign in | `Sign In \| GetHired Online` | 26 | FINE (noindex) | `Sign in to your GetHired Online account.` | 41 | FINE (noindex) |
| 404 | `Page Not Found \| GetHired Online` | 33 | GOOD | `The page you are looking for could not be found. Browse available jobs or return to the GetHired Online homepage.` | 112 | GOOD |
| Search results | Dynamic (`"{kw}" Jobs in the Philippines \| GetHired Online`) | Variable | GOOD | Dynamic | Variable | GOOD |

**Issues**:
1. Homepage title at 62 chars is 2 over the soft limit. Not critical — Google truncates but doesn't penalize. Optional trim: `GetHired Online — Jobs & Hiring in the Philippines` (50 chars).
2. Employers title at 62 chars. Optional trim: `Hire Online in the Philippines \| GetHired Online` (49 chars).
3. Job detail description uses "apply" twice in one sentence — minor copy issue.

**Assessment**: GOOD overall. Titles and descriptions are keyword-rich for the Philippine job board market.

---

## 6. Canonical URL Strategy

| Page | Canonical set? | Value | Correct? |
|---|---|---|---|
| `/home` | YES | `https://gethiredonline.app/home` | CORRECT |
| `/jobs` | YES | `https://gethiredonline.app/jobs` | CORRECT |
| `/jobs/details/:id` | YES | `https://gethiredonline.app/jobs/details/${jobId}` | CORRECT |
| `/jobs/search/:kw` | YES | `https://gethiredonline.app/jobs` | CORRECT — points to canonical list page |
| `/job-seekers` | YES | `https://gethiredonline.app/job-seekers` | CORRECT |
| `/employers` | YES | `https://gethiredonline.app/employers` | CORRECT |
| `/companies/details?id=...` | YES | `https://gethiredonline.app/companies/details?id=${companyId}` | ACCEPTABLE but query-param canonicals are weaker than path-based |
| `/signin` | NO explicit canonical | — | OK — noindex page, canonical not required |
| `/signup` | NO canonical set | — | MINOR ISSUE — no canonical, but signup has noindex via robots.txt, not meta |
| `/**` (404) | NO canonical | — | CORRECT — noindex page |

**Key finding — setCanonical is browser-only**:
`setCanonical()` in seo.service.ts has `if (!this.isBrowser) return;` — the canonical link element is only injected in the browser, not during SSR. If Angular Universal is active, Googlebot SSR renders won't have canonical tags in the HTML. They rely on the meta robots tag and the Link header instead.

For CSR-only (current production setup), this is fine. But if SSR is ever activated, canonicals will be missing server-side.

**Assessment**: GOOD. All indexable public pages have correct canonicals. The SSR canonical gap is noted for future reference.

---

## 7. Robots Meta Decisions

| Page | robots meta | Assessment |
|---|---|---|
| `/home` | `index, follow` | CORRECT |
| `/jobs` | `index, follow` | CORRECT |
| `/jobs/details/:id` (active, jobStatusId=2) | `index, follow` | CORRECT |
| `/jobs/details/:id` (inactive) | `noindex, nofollow` | CORRECT |
| `/jobs/search/:kw` | `noindex, follow` | CORRECT — avoids duplicate content from search variations |
| `/job-seekers` | `index, follow` | CORRECT |
| `/employers` | `index, follow` | CORRECT |
| `/companies/details` | `index, follow` | CORRECT |
| `/signin` | `noindex, nofollow` | CORRECT |
| `/signup` | NOT SET in component | MINOR ISSUE — signup has no SeoService call; blocked in robots.txt but no meta tag |
| `/reset-password` | NOT SET in component | MINOR ISSUE — same as signup |
| `/change-password` | NOT SET in component | MINOR ISSUE — same |
| `/verify` | NOT SET in component | MINOR ISSUE — same |
| `/**` (404) | `noindex, follow` | CORRECT |

**Assessment**: Core public and detail pages are correctly handled. Auth flow pages (signup, reset-password, etc.) rely only on robots.txt for protection, not meta robots — acceptable but defense-in-depth would add noindex to those components.

---

## 8. sitemap.xml Audit

**Detailed analysis in**: `GETHIRED_SEO_SITEMAP_AUDIT_V3.md`

**Summary**: XML format valid, static URLs correct (all 4 match actual FE routes), job URLs match router pattern. Fixed cache TTL from 60min to 15min. Key gap: company detail pages not in sitemap.

---

## 9. robots.txt Audit

**Detailed analysis in**: `GETHIRED_SEO_ROBOTS_AUDIT_V3.md`

**Summary**: COMPLETE. All authenticated routes covered, both with and without trailing slashes. Sitemap directive correct.

---

## 10. OG Image

**`assets/brand/gethired-og-default.png`**: DOES NOT EXIST

This is the file referenced by `DEFAULT_OG_IMAGE` in seo.service.ts. The service injects this URL into `og:image` and `twitter:image` on every page call to `setPageMeta()`. However, `index.html` had NO `og:image` tag at all (before this audit), meaning:
- Social crawlers (Facebook, Twitter, Slack, LinkedIn) fetching the raw HTML see no image
- If social crawlers hydrate JavaScript (some do, most don't), they pick up the dynamic tag but it 404s

**Fix applied**: Added `og:image` and `twitter:image` to `index.html` pointing to the existing `assets/images/logo.png` as a temporary fallback.

**Action required**: Create a proper 1200x630px OG image at `src/assets/brand/gethired-og-default.png` and update the two meta tags in index.html to reference it once available.

---

## 11. hreflang

GetHired serves Philippines market (English + Filipino). Currently NO hreflang tags are set.

**Assessment**: OPTIONAL for this deployment phase.

Rationale: Google does not penalize for missing hreflang — it only uses it to choose between multiple language variants of the same content. Since GetHired currently serves a single-language version (English), hreflang provides no benefit. If a Filipino-language version is ever added, `hreflang="en-PH"` for English and `hreflang="fil-PH"` for Filipino should be added via `<link rel="alternate">` tags.

---

## 12. SSR Implications

`SeoService` uses `isPlatformBrowser(platformId)` to guard all `document.*` access. Two methods have browser-only behavior:

1. `setCanonical()` — returns early if `!isBrowser`. During SSR, canonical link element is never injected. This is a gap if SSR is active (Angular renders the page on the server and Google sees that HTML).

2. `setJsonLd()` and `clearJsonLd()` — browser-only. During SSR, JSON-LD is never injected into the server-rendered HTML.

3. `setPageMeta()` — calls Angular's `Title` and `Meta` services which ARE SSR-safe and DO inject into the server-rendered HTML. So titles and meta descriptions work in SSR.

4. `stripHtml()` — has a server-safe regex fallback when `!isBrowser`. CORRECT.

**Current production status**: If the app is NOT using Angular Universal SSR (i.e., pure CSR), these gaps are irrelevant — Googlebot will see JavaScript-rendered content. If SSR is configured, JSON-LD and canonical tags will be missing from the initial server response.

**Action**: Confirm whether Angular Universal is active. If yes, SSR JSON-LD injection requires using Angular's `DOCUMENT` injection token instead of raw `document`, which works in both server and browser contexts.

---

## 13. Google Search Console Readiness

**Verification already in place**: `index.html` contains:
```html
<meta name="google-site-verification" content="EYWOEFfXbR2hY6_iyAD0X8UXPX4fHysRFjxnOUJoEJo">
```

This is a Search Console meta tag verification token. The account is already verified (or the verification is pending).

**What's needed before submitting the sitemap**:
1. Confirm https://gethiredonline.app/sitemap.xml returns valid XML (verify production routing)
2. Confirm the site is accessible to Google (not behind a login wall for public pages)
3. Submit sitemap URL in Search Console: `https://gethiredonline.app/sitemap.xml`
4. Request indexing for key pages: /home, /jobs, /job-seekers, /employers

**Assessment**: Ready to submit to Google Search Console. Verification token is already in the HTML.
