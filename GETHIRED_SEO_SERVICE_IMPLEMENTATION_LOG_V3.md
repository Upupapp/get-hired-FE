# GETHIRED SEO Service Implementation Log V3

Generated: 2026-06-25

## File Created
`src/app/core/services/seo.service.ts`

## Prior State
No SeoService existed. Meta was set inconsistently:
- `Title` service used in MainPortalComponent, JobSeekerPortalComponent, EmployerPortalComponent (constructor only, no description/robots/OG).
- No other components set any meta.
- index.html had hardcoded (incorrect) meta that was never overridden per route.

## Methods Implemented

| Method | Purpose |
|--------|---------|
| `setPageMeta(config)` | Title + description + robots + OG + Twitter. Single call per route. |
| `setRobots(index, follow)` | Standalone robots directive setter. |
| `setCanonical(url)` | Injects/updates `<link rel="canonical">` in document.head. Browser-only. |
| `setOpenGraph(config)` | Standalone OG tag updater. |
| `setJsonLd(id, data)` | Inject/replace JSON-LD `<script>` block by ID. Browser-only. |
| `clearJsonLd(id)` | Remove JSON-LD block by ID. Browser-only. |
| `setJobPostingJsonLd(job)` | JobPosting schema from real job data only. Only safe fields. |
| `clearJobPostingJsonLd()` | Removes JobPosting block (called on ngOnDestroy of job detail). |
| `setOrganizationJsonLd()` | Organization schema for homepage. |
| `setWebsiteJsonLd()` | WebSite schema with SearchAction (public search confirmed available). |
| `setBreadcrumbJsonLd(items)` | BreadcrumbList schema. |
| `clearBreadcrumbJsonLd()` | Removes BreadcrumbList block. |
| `resetToDefaults()` | Resets title/description to GetHired defaults, clears JSON-LD blocks. |

## SSR Guards
All `document.*` access is wrapped:
```typescript
if (!this.isBrowser) return;
```
`this.isBrowser = isPlatformBrowser(platformId)` injected via `PLATFORM_ID`.

## Dependency
Injected as `providedIn: 'root'` — no NgModule registration needed.
Angular `Title` and `Meta` services are used under the hood (Angular Universal safe).

## JobPosting JSON-LD Field Policy
Fields INCLUDED (from real job data):
- title, description (HTML stripped), datePosted, url
- hiringOrganization.name (from companyName)
- jobLocation.address.addressCountry (always "PH"), addressLocality (from jobCity if present)
- validThrough (from expirationDate if present)
- employmentType (mapped from jobTypeName string, null if unrecognized)
- baseSalary (only when salaryMinimum, salaryMaximum, AND salaryCurrency all present)

Fields NEVER INCLUDED:
- rating, reviewCount, aggregateRating
- fake salary when data is missing
- hiringOrganization.logo (no reliable URL available)
- jobBenefits (not in data model)
