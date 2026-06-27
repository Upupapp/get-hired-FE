# GETHIRED STITCH REPORT — SEO V3 Recent Deployment Audit
**Mode:** Recent deployment audit (commits bf5bd08 FE, 26ca25a BE)
**Date:** 2026-06-25
**Scope:** 8 integration seams introduced by SEO V3

---

## SEAM 1 — JobFacade → SeoService field mapping

**Status: ACCEPTABLE (documented gaps, all safe)**

`SeoService.setJobPostingJsonLd(job)` receives `state.job` (type `Model.Job | null`) from the NgRx store.
`state.job` is populated by `getJobSuccess` which stores `res.data` from the BE `/api/job/details` endpoint.
The `mappedJob()` function in `job.service.js` maps all SQL columns to camelCase properties.

**Fields available in `Model.Job` and confirmed returned by BE:**

| Schema.org field | Source property | BE SQL column | Status |
|---|---|---|---|
| `title` | `job.jobTitle` | `j.job_title` | PRESENT |
| `description` | `job.jobDescription` | `j.job_description` | PRESENT |
| `datePosted` | `job.createdAt` | `j.created_at` | PRESENT |
| `hiringOrganization.name` | `job.companyName` | `c.company_name` (JOIN) | PRESENT — see Seam 2 |
| `jobLocation.addressLocality` | `job.jobCity` | `j.job_city` | PRESENT |
| `baseSalary.currency` | `job.salaryCurrency` | `j.salary_currency` | PRESENT |
| `baseSalary.minValue` | `job.salaryMinimum` | `j.salary_minimum` | PRESENT |
| `baseSalary.maxValue` | `job.salaryMaximum` | `j.salary_maximum` | PRESENT |
| `employmentType` | `job.jobTypeName` | `jt.job_type_name` (JOIN) | PRESENT |

**Fields intentionally omitted (documented in SeoService):**
- `validThrough` — only emitted when `job.expirationDate` is truthy; `expiration_date` is nullable in DB; safe
- `employmentType` — only emitted when `mapEmploymentType()` returns a non-null match; safe

**Fields that fall back to empty string (not undefined):**
- `hiringOrganization.name` uses `job.companyName || job.companyDetails || ''` — never emits a broken property
- `title` uses `job.jobTitle || ''` — jobTitle is required in the interface and non-null in BE, safe
- `description` uses `this.stripHtml(job.jobDescription || '')` — defensive

**Finding:** `Model.Job` does NOT have a `companyName` property in its TypeScript interface definition. The property is present on the raw BE response (`mappedJob` emits `companyName: raw.company_name`) and stored as-is in the NgRx store as `any`. The SeoService uses `(job as any).companyName` in `setJobPostingJsonLd`, which correctly reads the runtime value. TypeScript just doesn't see it statically. This is pre-existing technical debt, not a V3 regression.

---

## SEAM 2 — company_name JOIN in BE `/api/job/details`

**Status: CONFIRMED CORRECT**

`getJobDetails` controller calls `jobDetails(id)` from `job.service.js`.

`jobDetails()` runs:
```sql
SELECT j.company_id, c.company_name, ...
FROM jobs j
LEFT JOIN companies c ON c.company_id = j.company_id
WHERE j.job_id = $1
```

`mappedJob()` then returns `companyName: raw.company_name`.

The FE public-details component uses:
```typescript
const companyName = (job as any).company_name || (job as any).companyName || 'GetHired Company';
```

- `(job as any).company_name` — will be `undefined` because `mappedJob()` maps it to camelCase `companyName`, not the raw snake_case
- `(job as any).companyName` — will be the correct value from `mappedJob()`
- Fallback `'GetHired Company'` — fires if both above are falsy (company has no name in DB)

**Finding:** The snake_case fallback `company_name` is dead code — it can never match because the store always holds the camelCase-mapped object. This is harmless (second fallback covers it), but is misleading. The `SeoService.setJobPostingJsonLd(job)` is similarly written with `job.companyName || job.companyDetails || ''`, which is correct because `companyName` (camelCase) is what the store contains.

**No bug.** The fallback chain is correct even if the first check is permanently dead.

---

## SEAM 3 — Sitemap endpoint dynamic import + circular dependency

**Status: NO CIRCULAR DEPENDENCY — WORKS CORRECTLY**

The sitemap handler uses `await import("./db/dbQuery.js")` and `await import("./env.js")`.

**Circular dependency analysis:**
- `server.js` imports `env.js` statically at the top (line 4: `import env from "./env.js"`)
- `dbQuery.js` imports `env.js` statically
- Neither `env.js` nor `dbQuery.js` imports from `server.js`

So the graph is: `server.js → env.js` and `server.js → dbQuery.js → env.js`. No cycle.

The dynamic `import()` inside the sitemap handler re-uses the already-resolved ES module from the module cache — it does not re-execute the module. This is fine.

**Babel transpilation:** The project uses `babel-polyfill` (line 2 of server.js). Babel transpiles `import()` to `require()` with a promise wrapper when targeting CommonJS. Since `dbQuery.js` and `env.js` are already loaded (they were statically imported at boot), the dynamic `require()` hits Node's module cache synchronously, then wraps the result in a resolved promise. This works correctly.

**Result:** No circular dependency, no Babel issue. Dynamic imports are redundant (the modules are already cached) but not harmful. Could be simplified to direct references.

**In-memory cache added:** The current server.js already has `_sitemapCache` with 1-hour TTL — the DB is only queried on first request per server process or after cache expiry. This is good.

---

## SEAM 4 — Sitemap URL format vs FE routing

**Status: CONFIRMED MATCH**

Sitemap generates: `https://gethiredonline.app/jobs/details/${row.job_id}`

FE route in `public.module.ts` line 41: `{ path: 'jobs/details/:id', component: PublicDetailsComponent }`

The PublicModule is mounted at the empty path `''` in `app.routing.module.ts`, so the full route resolves to `/jobs/details/:id` — matching the sitemap URL exactly.

**Static pages in sitemap:**

| Sitemap URL | FE route | Exists? |
|---|---|---|
| `/home` | `{ path: 'home', component: MainPortalComponent }` | YES |
| `/jobs` | `{ path: 'jobs', component: PublicListComponent }` | YES |
| `/job-seekers` | `{ path: 'job-seekers', component: JobSeekerPortalComponent }` | YES |
| `/employers` | `{ path: 'employers', component: EmployerPortalComponent }` | YES |

All 4 static pages confirmed. No broken sitemap entries.

---

## SEAM 5 — robots.txt serving

**Status: CONFIRMED CORRECT, BUT SPLIT-BRAIN ARCHITECTURE NOTE**

`src/robots.txt` and `dist/get-hired/robots.txt` are identical (both updated).

`angular.json` shows `outputPath: "dist/get-hired"` — robots.txt is copied into the dist root on build, which is what nginx serves as static files.

**robots.txt content:**
```
User-agent: *
Allow: /
Disallow: /admin/, /recruiter/, /user/, /signin, /signup, etc.
Sitemap: https://gethiredonline.app/sitemap.xml
```

**Split-brain architecture:** robots.txt is served by the FE nginx (from `dist/get-hired/`), but the sitemap it references is served by the BE Node.js process. Both must be alive for the bot-crawl chain to work. This is a coupling that needs to be documented in ops runbooks — if BE goes down, robots.txt still serves but sitemap returns 500.

**Nginx serving from dist/get-hired:** Cannot verify the nginx config without SSH access. Based on prior session notes, the Linode server serves files from the dist path. The `dist/get-hired/robots.txt` is present and correct.

---

## SEAM 6 — SeoService JSON-LD script injection (duplicate check)

**Status: CORRECT — NO DUPLICATES POSSIBLE**

`setJsonLd(id, data)` in `SeoService`:
```typescript
let script = doc.getElementById(id) as HTMLScriptElement;
if (!script) {
  script = doc.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  doc.head.appendChild(script);
}
script.text = JSON.stringify(data);   // always REPLACES content in place
```

The script element is identified by ID (`gh-jsonld-jobposting`). On the first call it is created and appended. On every subsequent call `getElementById` finds the existing element and only updates `.text`. No duplicates are ever appended.

`public-details.component.ts` also calls `clearJobPostingJsonLd()` in `ngOnDestroy`, which calls `clearJsonLd('gh-jsonld-jobposting')` → `document.getElementById(id).remove()`. This is correct.

**`take(1)` operator** is applied to the subscription, so the SEO call runs at most once per component lifetime, and the subscription auto-completes. `ngOnDestroy` also unsubscribes defensively. No leak possible.

---

## SEAM 7 — SSR/Universal guard on document access

**Status: CORRECT**

`SeoService` injects `PLATFORM_ID` (not `DOCUMENT`) in the constructor:
```typescript
constructor(
  @Inject(PLATFORM_ID) platformId: Object,
  private titleService: Title,
  private meta: Meta,
  private router: Router,
) {
  this.isBrowser = isPlatformBrowser(platformId);
}
```

Every method that touches `document` is gated with `if (!this.isBrowser) return;` or equivalent.

Methods reviewed:
- `setCanonical()` — guarded, returns early on server
- `setJsonLd()` / `clearJsonLd()` — guarded, return early on server
- `stripHtml()` — has explicit server branch using regex instead of DOM

**Note:** The service does NOT use Angular's `DOCUMENT` injection token. Instead it uses bare `document`. This is only safe because all `document` access is behind `isPlatformBrowser`. Using Angular's `DOCUMENT` token would be more idiomatic, but this approach works correctly given the guard. This is a style issue, not a bug.

**`Title` and `Meta` services** (`@angular/platform-browser`) are SSR-safe natively — they abstract over the platform. `setPageMeta()` is safe to call server-side without additional guards.

---

## SEAM 8 — Sitemap contract vs existing API routes

**Status: NO CONFLICT**

All existing routes are mounted under `/api/...`. The sitemap is mounted directly on `/sitemap.xml` — no path collision.

The `globalLimiter` (500 req / 15 min) applies to all routes including `/sitemap.xml` since it is registered before route mounting. For a legitimate Google/Bing crawler, 500 requests in 15 minutes is extremely unlikely for a single sitemap file — crawlers fetch a sitemap once and then stop.

**No auth middleware on sitemap:** Correct by design — sitemaps must be publicly accessible. The query only returns `job_id` and `updated_at` from published jobs (status_id=2), no PII exposed.

**Potential XML injection via job_id:** `job_id` is a `varchar` inserted from the client FE. The sitemap template string does not XML-encode the value. If a job_id were to contain XML special characters (`<`, `>`, `&`, `"`, `'`), the sitemap XML would be malformed. In practice, inspecting `createJobs` controller, the `jobId` comes from `req.body.jobId`, which is set by the FE job-create form. The FE sends a client-generated ID (likely a UUID or similar), but this is not enforced by the server. **This is a P3 hardening gap** — not exploitable for XSS (XML parsers reject malformed XML rather than parsing partial tags), but could produce a malformed sitemap for search engines.

---

## Summary of Seams

| # | Seam | Status | Risk |
|---|---|---|---|
| 1 | Job.model → SeoService field mapping | Acceptable | Low — all fields present, gaps documented |
| 2 | BE company_name JOIN | Correct | Low — dead first fallback is harmless |
| 3 | Dynamic import + Babel | Correct | None |
| 4 | Sitemap URL vs FE route | Confirmed match | None |
| 5 | robots.txt serving | Correct | Low — split-brain architecture documented |
| 6 | JSON-LD dedup via ID | Correct | None |
| 7 | SSR/Universal guard | Correct | None |
| 8 | Sitemap vs API contract | No conflict | P3 — job_id not XML-encoded in sitemap |
