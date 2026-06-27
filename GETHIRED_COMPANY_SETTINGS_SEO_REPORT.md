# GetHired Company Settings SEO Report
**Scope:** `/recruiter/company/settings` (private) + Public Company Data Impact  
**Date:** 2026-06-27  
**Stack:** Angular 13 SSR (Angular Universal) + Node.js/Express BE

---

## 1. Executive Summary

The company settings page at `/recruiter/company/settings` is correctly protected from search engine indexing through two independent mechanisms: the `Disallow: /recruiter/` directive in `robots.txt` and the `AuthGuard` gating the entire `/recruiter` route tree. The page does **not** call `SeoService.setPageMeta()` — it has no explicit `noindex` meta tag — but the robots.txt directive is a sufficient crawl block and the SSR guard architecture prevents the page from rendering server-side for unauthenticated bots.

The public company data managed through this form powers four distinct indexed surfaces: the `/companies/details?id=X` public company profile page, job listing cards on `/jobs`, job detail pages at `/jobs/details/:id`, and the sitemap at `/sitemap.xml`. The quality of data entered here directly affects JobPosting structured data and the company page's canonical SEO metadata.

**Key gap:** The `hiringOrganization.logo` field in JobPosting JSON-LD is populated from `job.companyLogoUrl` but that field is **not returned by the job detail API** — the job API does not join the companies table to pull the logo URL. The `hiringOrganization.sameAs` (company website URL) field is entirely absent from the data model: there is no `companyUrl` or `companyWebsite` field in the form or the DB schema. These are gaps in Google for Jobs eligibility.

**Second key gap:** The public company profile page at `/companies/details?id=X` does not call `seoService.setJobPostingJsonLd()` or any Organization/EmployerAggregateRating structured data — it only sets page title, description, canonical, and breadcrumb. This is a missed rich-result opportunity for the company profile URL.

---

## 2. Settings Page SEO Audit (`/recruiter/company/settings`)

### 2.1 Private Page Protection

**robots.txt Disallow — PASS**  
`src/robots.txt` line 7–8 contains:
```
Disallow: /recruiter/
Disallow: /recruiter
```
This covers `/recruiter/company/settings` and the entire recruiter namespace. Both with-slash and bare forms are listed, which is correct.

**AuthGuard — PASS**  
`app.routing.module.ts` mounts the entire `EmployerPanelModule` under:
```typescript
{
  path: 'recruiter',
  loadChildren: () => import('./employer-panel/employer-panel.module').then(m => m.EmployerPanelModule),
  canActivate: [AuthGuard],
  data: { role: '2' }
}
```
`AuthGuard.checkUserLogin()` reads `localStorage.getItem('state')` — on the server (SSR context), `localStorage` is not available. The guard will not pass for any unauthenticated SSR render. The `EmployerPanelModule` is lazy-loaded, so Angular Universal will not even attempt to render it without a valid session state.

**`noindex` meta tag — MISSING (acceptable)**  
`EmployerSettingsComponent` and `CompanyDetailsFormComponent` do **not** call `SeoService.setPageMeta()` with `robots: 'noindex, nofollow'`. There is no explicit `<meta name="robots" content="noindex,nofollow">` injected for this route.

This is currently acceptable because:
1. `robots.txt` prevents crawling (`Disallow: /recruiter/`).
2. `AuthGuard` prevents SSR rendering — Googlebot sees a login redirect, not the form.

However, defence-in-depth best practice is to add `SeoService.setPageMeta({ title: '...', description: '...', robots: 'noindex, nofollow' })` on all auth-gated components to cover the scenario where a crawler somehow bypasses robots.txt (e.g., via a misconfigured reverse proxy stripping the disallow, or if robots.txt is temporarily removed during a deploy).

**Page title — NOT SET DYNAMICALLY**  
`EmployerSettingsComponent` does not call Angular's `Title` service or `SeoService`. The page inherits the global `index.html` title: `GetHired Online — Jobs and Hiring Platform in the Philippines`. This is not harmful for an auth-gated page, but it means Google Search Console would show this generic title for any accidentally-indexed recruiter page.

**SSR rendering of the settings route — SAFE**  
Angular Universal's server rendering uses the same `AppRoutingModule`. The `AuthGuard.canActivate()` method returns a `Promise<boolean>` that resolves `false` on the server (localStorage is unavailable), so the `EmployerPanelModule` lazy load is never initiated. The SSR output for `/recruiter/company/settings` will either render an empty router-outlet or a redirect to `/signin` — neither of which exposes the form content to Googlebot.

### 2.2 Page Metadata Summary

| Check | Status | Notes |
|---|---|---|
| robots.txt Disallow | PASS | Both `/recruiter/` and `/recruiter` covered |
| AuthGuard on route | PASS | JWT role-2 guard on entire `/recruiter` tree |
| Explicit noindex meta | MISSING | Not harmful today; add for defence-in-depth |
| Dynamic page title | NOT SET | Inherits generic global title |
| SeoService called | NO | Neither `EmployerSettingsComponent` nor `CompanyDetailsFormComponent` call `SeoService` |
| SSR exposure risk | NONE | Guard prevents SSR rendering without valid session |

---

## 3. Public Company Data Impact

### 3.1 Form Fields and Their Public SEO Impact

The settings form (`CompanyDetailsFormComponent`) manages these fields:

| Field | Form Control | DB Column | Public SEO Impact |
|---|---|---|---|
| Company name | `companyName` | `company_name` | H5 on company card; H5 on company detail page; `hiringOrganization.name` in JobPosting JSON-LD; page `<title>` on company profile |
| Company logo | `companyLogoFile` / `companyLogoUrl` | `company_logo` | Displayed as `<img>` on company detail and job cards; attempted as `hiringOrganization.logo` in JSON-LD (gap: not in job API response — see Section 5) |
| Company details / about | `companyDetails` | `company_details` | Displayed as body text on public company page; used as fallback for `hiringOrganization.name` in JSON-LD (misuse — see Section 5); **not used as meta description** |
| Industry | `industryId` | `industry_id` | Displayed as category on company card and profile; **not used in structured data** |
| Work setup | `workSetupId` | `work_setup_id` | Used in job listings; maps to `jobLocationType: 'TELECOMMUTE'` in JobPosting JSON-LD when work setup name matches `/remote/i` |
| Number of employees | `numberOfEmployee` | `number_of_employee` | Shown on company profile page; not used in structured data |
| Address fields | `companyAddress`, `companyCity`, `companyCountry`, etc. | `company_address`, `company_city`, etc. | Used in `jobLocation.address.addressLocality` in JobPosting JSON-LD via job city field (job city, not company city); address shown publicly only if `shownPublicly` checkbox is ticked |
| Publicly shown | `shownPublicly` | `shown_publicly` | Controls whether address is public; does **not** gate whether the company appears in search results or the sitemap |
| Company email | `companyEmail` | `company_email` | Internal only; not exposed on public company page HTML |
| Contact number | `companyContactNumber` | `company_contact_number` | Internal only |

**Notable absence:** There is no `companyUrl` / `companyWebsite` field anywhere in the form, the DB model (`mappedCompany()`), or the API response. This is the `hiringOrganization.sameAs` field in Schema.org's JobPosting spec — a meaningful Google for Jobs signal.

### 3.2 Company Name

The company name is the most SEO-critical field. It is used in:
- **Job detail page title:** `${job.jobTitle} at ${companyName} | GetHired Online` — dynamically set by `SeoService.setPageMeta()` in `PublicDetailsComponent` using `job.company_name || job.companyName`.
- **JobPosting JSON-LD:** `hiringOrganization.name` — same fallback chain.
- **Public company profile title:** `${company.companyName} | GetHired Online` — set by `SeoService.setPageMeta()` in `PublicCompanyDetailsComponent`.
- **Company card HTML:** Rendered in an `<h5>` in `company-card.component.html`.
- **Company detail page HTML:** Rendered in an `<h5>` in `public-company-details.component.html`.

The company name **is SSR-rendered** on the job detail page and company profile page because `PublicDetailsComponent` and `PublicCompanyDetailsComponent` are in `PublicModule` (no auth guard, no lazy-load guard). Angular Universal will render these pages with the correct company name in the initial HTML response — making them fully crawlable.

### 3.3 Company Details / About (1000 character field)

`companyDetails` is shown on the public company profile page as body text inside a `<h5>` tag (line 44 of `public-company-details.component.html`):
```html
<h5 class="title-company-description">
  {{details?.companyDetails}}
</h5>
```

This text **is indexed by Google** as page body content. It is effectively the only unique textual content on the company profile page. However, it is **not used as the meta description** — the meta description is currently hardcoded to:
> `Explore ${company.companyName} on GetHired Online — view their company profile and open job positions in the Philippines.`

This is a missed opportunity: the first 155 characters of `companyDetails` would make a far more compelling and keyword-rich meta description than the generic template string.

The field also has a **misuse in JobPosting JSON-LD** (seo.service.ts line 253):
```typescript
hiringOrganization: {
  '@type': 'Organization',
  name: (job as any).company_name || job.companyName || (job as any).companyDetails || '',
```
`companyDetails` is used as a last-resort fallback for the organization **name**. This is semantically wrong — a 1000-character company biography is not a name. If `company_name` is missing and `companyDetails` is used as the name, the resulting JSON-LD will be invalid for Google for Jobs. This should be fixed by removing `companyDetails` from the name fallback chain and using an empty string or omitting the name entirely if neither `company_name` nor `companyName` is available.

### 3.4 Company Logo

The logo URL is stored in Firebase Storage. Firebase Storage URLs are publicly crawlable (no auth on the asset CDN).

The logo appears as:
- An `<img>` in `company-card.component.html`: `<img [src]="company.companyLogo" class="img img-fluid company-image">` — **no `alt` attribute**. This is an a11y and SEO issue.
- An `<img>` in `public-company-details.component.html`: `<img [src]="details.companyLogoUrl" class="company-logo mt-3">` — **no `alt` attribute**. Same issue.
- An `<img>` in `employer-settings.component.html`: `<img *ngIf="companyLogoUrl" [src]="companyLogoUrl" class="ebc-hero-logo" alt="Company logo">` — has alt text but it is generic, not the company name.

The logo is **not reaching the JobPosting JSON-LD** as `hiringOrganization.logo` in practice (see Section 5 for the full gap analysis).

A cache-busting `?v=<timestamp>` query string is appended to the logo URL in `CompanyDetailsFormComponent.setCompany()`. This defeats browser caching and will also defeat Firebase Storage CDN caching for the recruiter's own session. For the public-facing pages this does not apply — the logo URL stored in the DB does not carry the cache-buster suffix.

### 3.5 Industry and Work Setup

`industryId` and `workSetupId` are integer foreign keys. The industry name is joined in `getUserCompany()` SQL and returned as `companyIndustryName`. Work setup name is returned on job objects as `workSetupName`.

Work setup is leveraged in SEO: `SeoService.setJobPostingJsonLd()` applies `jobLocationType: 'TELECOMMUTE'` when `workSetupName` matches `/remote/i`. This is a correct and valuable Google for Jobs signal.

Industry is shown on the company card and profile page but is **not mapped to any structured data** (e.g., no `naicsCode` or `industryCode` in the Organization or JobPosting schema). This is a low-priority gap.

---

## 4. Public Company Profile SEO Assessment

### 4.1 Route and Accessibility

The public company profile lives at `/companies/details?id=<companyId>`. It is declared in `CompaniesModule` (`companies.module.ts`) and loaded via `public.module.ts`:
```typescript
{
  path: 'companies',
  loadChildren: () => import('@main/companies/companies.module').then(m => m.CompaniesModule),
}
```
This route has **no auth guard** — it is publicly accessible without login. It is included in the sitemap (see Section 6) with `priority=0.6`.

**URL structure issue:** The canonical URL uses a query parameter (`/companies/details?id=COMPANY_ID`) rather than a path segment (`/companies/COMPANY_ID` or `/companies/COMPANY_SLUG`). Query-parameter URLs are valid for Google to crawl and index, but they are less clean, less shareable, and rank lower in click-through perception than path-segment URLs. The sitemap test file confirms the format: `https://gethiredonline.app/companies/details?id=${row.company_id}`.

### 4.2 Metadata on the Company Profile Page

`PublicCompanyDetailsComponent.ngOnInit()` calls:
```typescript
this.seoService.setPageMeta({
  title: `${company.companyName} | GetHired Online`,
  description: `Explore ${company.companyName} on GetHired Online — view their company profile and open job positions in the Philippines.`,
  canonical: `https://gethiredonline.app/companies/details?id=${this.companyId}`,
  robots: 'index, follow',
});
this.seoService.setBreadcrumbJsonLd([...]);
```

| Metadata | Status | Quality |
|---|---|---|
| Page title | SET | `${companyName} \| GetHired Online` — good |
| Meta description | SET | Generic template — does not use `companyDetails` content; missed keyword opportunity |
| Canonical URL | SET | Query-parameter format — functional but not ideal |
| robots | `index, follow` | Correct |
| Open Graph title/desc | SET via setPageMeta() | Same values as above |
| Breadcrumb JSON-LD | SET | Home > Companies > companyName |
| Organization JSON-LD | NOT SET | No `@type: Organization` structured data for the company |
| EmployerAggregateRating | NOT SET | Rating stars shown in HTML are static placeholders (hardcoded 4.5) — not structured data |

### 4.3 SSR Rendering of Company Profile

`PublicCompanyDetailsComponent` is in `PublicModule` with no auth guard. However, the component calls `this.companiesFacade.getCompany(this.companyId)` in `ngOnInit()` which dispatches an NgRx action that makes an HTTP call to the BE. In SSR, this HTTP call runs server-side, but the `companyId` is read from `this.route.queryParams` — a subscription that uses `constructor()` timing. The `ngOnInit()` subscription on `details$` uses `filter` and `take(1)`, which should resolve during server-side rendering if the HTTP call completes synchronously within Angular Universal's transfer-state window.

In practice: Angular Universal with `@nguniversal/express-engine` will SSR-render the company name and companyDetails into the initial HTML only if the HTTP request to `/api/company/details?id=X` completes within the SSR timeout. The `SeoService.setPageMeta()` call happens inside the `details$` subscription — if the HTTP call resolves in time, the `<title>` and `<meta name="description">` tags will be in the server-rendered HTML. If not, they will be set client-side (still functional for crawlers that run JavaScript, but unreliable for instant indexing).

---

## 5. SEO Readiness for Company Data as JobPosting Structured Data

### 5.1 Current `hiringOrganization` Implementation

In `seo.service.ts` `setJobPostingJsonLd()`:
```typescript
hiringOrganization: {
  '@type': 'Organization',
  name: (job as any).company_name || job.companyName || (job as any).companyDetails || '',
  ...(job.companyLogoUrl ? { logo: job.companyLogoUrl } : {}),
},
```

### 5.2 Field Availability Assessment

| Field | Schema.org Property | Available in DB | In Job API Response | Validated | SEO Use | Status |
|---|---|---|---|---|---|---|
| Company name | `hiringOrganization.name` | YES (`company_name`) | YES (joined as `company_name`) | YES (required, max 200) | Used in JSON-LD name | PASS |
| Company logo | `hiringOrganization.logo` | YES (`company_logo`) | **NOT JOINED** in job API | No | Conditional in JSON-LD | GAP — logo field absent from job API join |
| Company website | `hiringOrganization.sameAs` | **NOT IN DB** | **NOT IN DB** | N/A | Not used | GAP — field does not exist |
| Company address | `jobLocation.address` | YES (multiple fields) | Via `jobCity` on job row | No | `addressLocality` used | PARTIAL — city only, no full address |
| Work setup | `jobLocationType` | YES (`work_setup_id`) | YES (as `workSetupName`) | No | `TELECOMMUTE` when remote | PASS |
| Job type | `employmentType` | YES (`job_type_name`) | YES | No | Mapped via `mapEmploymentType()` | PASS |
| Salary | `baseSalary` | YES | YES | No | Conditional on min+max+currency | PASS (conditional) |

### 5.3 Specific Gaps

**Gap 1 — Logo not in job API response:**  
`hiringOrganization.logo` is conditionally included as `...(job.companyLogoUrl ? { logo: job.companyLogoUrl } : {})`. But `job.companyLogoUrl` will always be `undefined` because the jobs query in the BE does not join the `companies` table on `company_logo`. The company logo URL never reaches `setJobPostingJsonLd()`. **Fix:** add `c.company_logo AS company_logo_url` to the job detail query in `jobsController.js` (or whichever service provides the job-by-id data), and pass it through the job model mapper.

**Gap 2 — No `companyUrl` / `sameAs`:**  
The `hiringOrganization.sameAs` field requires a company website URL. No such field exists in the form, the DB schema (as seen in `mappedCompany()`), or any API response. **Fix:** add a `company_url` varchar column to the `companies` table, a `companyUrl` field to the settings form, and wire it through the API and JSON-LD generator.

**Gap 3 — `companyDetails` misused as fallback name:**  
The third fallback in `name: ... || (job as any).companyDetails || ''` would insert a 1000-character biography string as the organization name in the JSON-LD. Google's Rich Results validator would reject this as an invalid name. **Fix:** remove `(job as any).companyDetails` from the name fallback chain.

**Gap 4 — No Organization JSON-LD on company profile page:**  
The public company profile page (`/companies/details?id=X`) sets breadcrumb JSON-LD but no `@type: Organization` structured data. This page is the natural place to emit an Organization block with the company's name, logo, and (once available) website URL. **Fix:** add a call to a new `SeoService.setOrganizationForCompanyJsonLd(company)` method from `PublicCompanyDetailsComponent`.

---

## 6. robots.txt / Sitemap Assessment

### 6.1 robots.txt

File: `src/robots.txt`

```
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /admin
Disallow: /recruiter/
Disallow: /recruiter
Disallow: /user/
Disallow: /user
...
Disallow: /jobs/search/

Sitemap: https://gethiredonline.app/sitemap.xml
```

**Company settings exclusion — PASS.** `/recruiter/` covers `/recruiter/company/settings` and every other recruiter sub-route.

**No leak of company data through `Allow` overrides — PASS.** There are no `Allow: /recruiter/...` directives that would re-open a recruiter sub-path.

**Sitemap declared — PASS.** `Sitemap: https://gethiredonline.app/sitemap.xml` points to the dynamic BE endpoint.

### 6.2 Sitemap

The sitemap is generated dynamically by `server.js` at `/sitemap.xml`. It includes:
- Static pages: `/home` (1.0), `/jobs` (0.9), `/job-seekers` (0.7), `/employers` (0.7)
- Published job pages: `/jobs/details/:jobId` (0.8, `changefreq=weekly`)
- Company pages: `/companies/details?id=:companyId` (0.6, `changefreq=weekly`) — included only for companies that have at least one published job

**Company settings page exclusion from sitemap — PASS.** The sitemap only includes paths that are explicitly added; `/recruiter/*` paths are never added.

**Company profile sitemap inclusion — PASS.** Companies with published jobs appear in the sitemap at `priority=0.6` with a `lastmod` derived from `MAX(job.updated_at)` across the company's active listings.

**Sitemap TTL — 15 minutes in-memory cache.** This means a newly created company or a newly published job will appear in the sitemap within 15 minutes. Acceptable for a platform of this size.

**Sitemap not submitted via Google Search Console API.** There is a `SEO_GOOGLE_INDEXING_API_RUNBOOK.md` and `SEO_SEARCH_CONSOLE_AND_SITEMAP_RUNBOOK.md` in the BE suggesting this work was planned. Manual submission required if not yet done.

---

## 7. Core Web Vitals Impact on Company Settings Page

The company settings page is auth-gated and not indexed, so CWV metrics here do not directly affect search ranking. However, they affect recruiter user experience. Relevant observations:

### 7.1 INP (Interaction to Next Paint)

`CompanyDetailsFormComponent` is not particularly heavy — it has one reactive form, two `async` pipe subscriptions (industry and work setup dropdowns), an embedded `app-google-address-search` component (Google Maps Places), and one file upload component. The Google Maps JavaScript API (`maps.googleapis.com`) is loaded globally in `index.html` with `defer`. INP risk is low from the form itself, but the Places autocomplete widget can cause layout thrashing on first keystroke.

### 7.2 CLS (Cumulative Layout Shift)

**Risk: MODERATE.**

The form uses `*ngIf="!loading"` to gate rendering, and shows a skeleton loader while loading. This is correct CLS mitigation — the skeleton prevents the form from "popping in" below content.

However, the company logo `<img>` in `company-card.component.html` has no `width` or `height` attribute:
```html
<img [src]="company.companyLogo" class="img img-fluid company-image">
```
Without intrinsic dimensions, the browser cannot reserve space before the image loads, causing layout shift as the image appears. This affects the **public** `/jobs` and `/companies` pages, not the settings page itself.

On the settings page, the logo `<img>` preview (`<img [src]="profileImage" class="avatar-image">`) similarly has no `width`/`height` attributes, but since this is auth-gated the CLS does not affect CWV scores.

### 7.3 LCP (Largest Contentful Paint)

The company logo in the banner of `public-company-details.component.html` may be the LCP element if it is the largest image in the viewport. It lacks `loading="eager"` or `fetchpriority="high"` hints and has no `width`/`height` attributes. Firebase Storage URLs do not support `srcset` for responsive images.

---

## 8. SEO Backlog

| ID | Area | Issue | Priority | Effort | Public Impact |
|---|---|---|---|---|---|
| SEO-CS-01 | Settings page | Add `SeoService.setPageMeta({ robots: 'noindex, nofollow' })` to `EmployerSettingsComponent.ngOnInit()` for defence-in-depth | P2 | XS (5 lines) | None (private page) |
| SEO-CS-02 | JobPosting JSON-LD | Remove `(job as any).companyDetails` from `hiringOrganization.name` fallback chain in `seo.service.ts` line 253 | P1 | XS (1 line) | High — prevents invalid JSON-LD name field |
| SEO-CS-03 | JobPosting JSON-LD | Add `company_logo` to job API response (join `companies` table) so `hiringOrganization.logo` is populated | P1 | Small (BE join + FE model) | High — enables Google for Jobs logo in SERP |
| SEO-CS-04 | Company data model | Add `company_url` field to `companies` table, settings form, and API to enable `hiringOrganization.sameAs` | P2 | Medium (migration + form field + API + JSON-LD) | Medium — improves Google for Jobs eligibility |
| SEO-CS-05 | Company profile page | Use first 155 characters of `companyDetails` as meta description in `PublicCompanyDetailsComponent` instead of generic template | P2 | XS (5 lines) | Medium — improves SERP snippet quality |
| SEO-CS-06 | Company profile page | Add `@type: Organization` JSON-LD block to `PublicCompanyDetailsComponent` | P2 | Small (new SeoService method) | Medium — enables Organization rich results |
| SEO-CS-07 | Company logo | Add `alt="{{company.companyName}}"` to `<img>` in `company-card.component.html` and `public-company-details.component.html` | P1 | XS | Medium — a11y + image SEO |
| SEO-CS-08 | Company logo | Add `width` and `height` attributes to logo `<img>` on public pages to eliminate CLS | P2 | XS | Medium — CWV improvement |
| SEO-CS-09 | URL structure | Consider migrating `/companies/details?id=X` to `/companies/:id` or `/companies/:slug` path-segment URLs | P3 | Large (routing + BE + sitemap + canonicals) | Low-Medium — cleaner URLs, marginal ranking benefit |
| SEO-CS-10 | Sitemap | Submit sitemap to Google Search Console manually if not yet done (see `SEO_SEARCH_CONSOLE_AND_SITEMAP_RUNBOOK.md`) | P1 | XS (manual step) | High — enables sitemap crawl |
| SEO-CS-11 | Company profile | Add `companyDetails` text to `EmployerBrand` subtab description on settings page (already shown in `public-company-details.component.html`) to help recruiters understand the SEO impact of this field | P3 | XS | None (editorial) |

---

## 9. Release Gate

### Gate A — Private Page Excluded from Index

| Check | Status | Evidence |
|---|---|---|
| robots.txt `Disallow: /recruiter/` | PASS | `src/robots.txt` lines 7–8 |
| AuthGuard on `/recruiter` route | PASS | `app.routing.module.ts` |
| SSR renders safely (auth redirect, not form) | PASS | Guard reads localStorage; undefined on server |
| Explicit `noindex` meta tag | FAIL | Not set; acceptable given robots.txt + guard, but not best practice |

**Gate A: PASS (with advisory)** — The page is effectively excluded. Adding explicit noindex is recommended for defence-in-depth.

### Gate B — Public Company Data Quality

| Check | Status | Evidence |
|---|---|---|
| Company name in job detail page title | PASS | `public-details.component.ts` line 62 |
| Company name in company profile title | PASS | `public-company-details.component.ts` line 54 |
| `shownPublicly` flag functional | PASS | `updateCompany` SQL `shown_publicly=$17`, returned in mapped response |
| Company profile page canonicalized | PASS | `canonical` param set in `setPageMeta()` |
| Company profile page indexed (`robots: index, follow`) | PASS | Hardcoded in `PublicCompanyDetailsComponent` |
| Meta description uses company-specific content | FAIL | Generic template — `companyDetails` not used |
| Company logo has alt text on public pages | FAIL | No `alt` attribute on logo `<img>` in card and detail templates |

**Gate B: FAIL** — Meta description is generic and logo alt text is missing. Both are fixable in under 30 minutes.

### Gate C — Structured Data Readiness

| Check | Status | Evidence |
|---|---|---|
| `hiringOrganization.name` in JobPosting JSON-LD | PASS | `company_name` joined in job query |
| `hiringOrganization.logo` in JobPosting JSON-LD | FAIL | `companyLogoUrl` not in job API response |
| `hiringOrganization.sameAs` in JobPosting JSON-LD | FAIL | No `companyUrl` field in data model |
| `companyDetails` not misused as fallback name | FAIL | Line 253 of `seo.service.ts` includes it |
| Organization JSON-LD on company profile page | FAIL | Not implemented |
| Breadcrumb JSON-LD on company profile page | PASS | `setBreadcrumbJsonLd()` called |

**Gate C: FAIL** — Three structural gaps in JobPosting JSON-LD. `companyDetails` misuse is a P1 fix (one line). Logo gap requires a BE join.

### Gate D — CWV Risk

| Check | Status | Evidence |
|---|---|---|
| Form skeleton prevents CLS on settings page load | PASS | `*ngIf="loading"` skeleton block in form template |
| Logo `<img>` dimensions set on public pages | FAIL | No `width`/`height` on card and detail templates |
| LCP image has `fetchpriority="high"` | UNKNOWN | Banner/logo images have no priority hints |
| Google Maps `defer` loading | PASS | `script defer` in `index.html` |

**Gate D: FAIL** — Logo images without dimensions are a confirmed CLS risk on public pages. LCP priority unknown without field measurement.

---

## 10. Recommended Next Command

**Immediate fix run (SEO-CS-02 + SEO-CS-07 + SEO-CS-05):** These three items are all under 10 lines each and remove the two Gate B/C failures that are easiest to fix:
1. Remove `(job as any).companyDetails` from the `hiringOrganization.name` fallback chain in `seo.service.ts`.
2. Add `[attr.alt]="company.companyName"` to the company logo `<img>` in `company-card.component.html` and `alt="{{details?.companyName}} logo"` in `public-company-details.component.html`.
3. Update `PublicCompanyDetailsComponent` to use `company.companyDetails?.slice(0, 155)` as the meta description with a fallback to the current template.

**Medium effort (SEO-CS-03):** Add `company_logo` to the job detail API response by joining the companies table — this unlocks `hiringOrganization.logo` in all JobPosting JSON-LD and is the single highest-impact structured data fix.

**Deferred (SEO-CS-04 + SEO-CS-09):** Adding a `companyUrl` field and migrating to path-segment company URLs are schema/routing changes that require broader planning and should be scoped as a dedicated sprint item.

The most valuable next command for this feature area would be **/code-review** targeting `seo.service.ts` (lines 239–260), `company-card.component.html`, and `public-company-details.component.ts` to validate the three immediate fixes before applying them.
