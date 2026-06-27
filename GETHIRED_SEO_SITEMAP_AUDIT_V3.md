# GetHired SEO V3 — Sitemap Audit

Audit date: 2026-06-25
Source: `get-hired-BE/server.js` lines 146–205

---

## XML Format

### Valid XML Declaration
```xml
<?xml version="1.0" encoding="UTF-8"?>
```
CORRECT.

### Namespace
```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
```
CORRECT — uses the canonical sitemaps.org namespace.

### Structure
Template-literal string construction. Produces well-formed XML for valid inputs. No special characters are escaped in job_id values — this is safe IF job_id is a UUID or integer (no `&`, `<`, `>` in the value). VERIFIED — PostgreSQL UUID format contains only hex and hyphens.

---

## Static Page URLs

| URL | In Sitemap | Actual Route | Match? | Notes |
|---|---|---|---|---|
| `/home` | YES | `{ path: 'home', component: MainPortalComponent }` | CORRECT | Route exists in public.module.ts |
| `/jobs` | YES | `{ path: 'jobs', component: PublicListComponent }` | CORRECT | Route exists |
| `/job-seekers` | YES | `{ path: 'job-seekers', component: JobSeekerPortalComponent }` | CORRECT | Route exists |
| `/employers` | YES | `{ path: 'employers', component: EmployerPortalComponent }` | CORRECT | Route exists |

All 4 static pages match actual Angular routes.

---

## Dynamic Job URLs

### URL Pattern
Sitemap generates: `https://gethiredonline.app/jobs/details/${row.job_id}`

FE route definition (public.module.ts): `{ path: 'jobs/details/:id', component: PublicDetailsComponent }`

**Pattern match: CORRECT** — `/jobs/details/UUID` matches the route pattern.

### DB Query
```sql
SELECT job_id, updated_at FROM ${schema}.jobs WHERE job_status_id = 2 ORDER BY updated_at DESC;
```
- Filters to `job_status_id = 2` (published/active only) — CORRECT
- Uses `updated_at` for `lastmod` — CORRECT (reflects last edit)
- Falls back to `today` if `updated_at` is null — sensible

### Missing: Company Detail Pages
`/companies/details?id=UUID` is a public indexable page (serves full company profiles with open jobs). It is NOT in the sitemap. This is a missed opportunity for link equity and crawl coverage.

---

## Priority Scheme

| Page | Priority | Assessment |
|---|---|---|
| `/home` | 1.0 | Correct for homepage |
| `/jobs` | 0.9 | Correct — second most important page |
| `/job-seekers` | 0.7 | Reasonable |
| `/employers` | 0.7 | Reasonable |
| Per-job detail | 0.8 | Appropriate |

**Issue**: Individual job pages (0.8) rank higher than /job-seekers and /employers (0.7). This is intentional and sensible — job content is the primary search intent target.

---

## changefreq Values

| Page | changefreq | Assessment |
|---|---|---|
| `/home` | `weekly` | MINOR ISSUE — homepage content changes more than weekly (job counts, featured jobs) but less than daily. `daily` would be more accurate. |
| `/jobs` | `daily` | CORRECT — job list changes daily as new jobs post |
| `/job-seekers` | `monthly` | CORRECT — marketing page, infrequent changes |
| `/employers` | `monthly` | CORRECT — marketing page, infrequent changes |
| Per-job | `weekly` | ACCEPTABLE — jobs change infrequently once posted, but `monthly` might be more accurate after initial posting |

**Note**: `changefreq` is only a hint to crawlers, not a binding directive. Google largely ignores it and uses its own crawl frequency signals.

---

## Cache Strategy

### BE In-Memory Cache
- TTL: 1 hour (`SITEMAP_TTL_MS = 60 * 60 * 1000`)
- Per-process: resets on server restart
- Mechanism: stores `xml` string and `builtAt` timestamp

### HTTP Cache-Control
```
Cache-Control: public, max-age=3600
```
This means both the BE process cache AND reverse-proxies/CDN can cache for 1 hour.

### Assessment for a Live Job Board
**Acceptable with caveats:**
- A job posted at 10:00 AM won't appear in the sitemap until 11:00 AM at the earliest (both caches must expire)
- A job expired/deleted at 10:00 AM will still appear in the sitemap for up to 1 hour (and potentially longer if CDN caches are involved)
- For a Philippine SMB job board with moderate posting frequency, 1 hour is reasonable
- For high-frequency boards (100+ jobs/day), consider 15 minutes (900s)

**Recommendation**: Reduce to `max-age=900` (15 minutes) to make new job pages discoverable faster, while still protecting the DB from bot hammering.

---

## Expired Job Handling Gap

**Current behavior**: When a job's `job_status_id` changes from 2 to another value, it disappears from the next sitemap rebuild. BUT:
1. Google may have already indexed the URL
2. The FE renders the job detail page with `robots: 'noindex, nofollow'` for inactive jobs — CORRECT
3. However, there is no `410 Gone` HTTP response for expired job URLs

**Gap**: Google will eventually re-crawl the URL, receive a 200 response (Angular SPA renders), see `noindex`, and deindex. But this process can take weeks. A proper `410 Gone` from the server (when `job_status_id !== 2`) would signal immediate removal.

**This is a Phase 2 improvement** — the current approach (noindex on inactive) is functionally correct and Google-compliant, just slow to deindex.

---

## sitemap.xml Accessibility

The endpoint is at `/sitemap.xml` on the BE server. For this to be discoverable:
- The FE's `robots.txt` directive `Sitemap: https://gethiredonline.app/sitemap.xml` must resolve correctly
- The BE must be accessible at that URL (i.e., the production server must route `/sitemap.xml` requests to the BE, not serve a 404)

**RISK**: If the production setup serves the FE as a static SPA and proxies `/api/*` to the BE, but does NOT proxy `/sitemap.xml` to the BE, the sitemap will return 404 or serve the Angular index.html.

**Action required**: Verify that the production Nginx/Apache config routes `/sitemap.xml` to the BE process, not the SPA.

---

## Summary

| Check | Result |
|---|---|
| Valid XML namespace | PASS |
| Static URLs match FE routes | PASS (4/4) |
| Job detail URL pattern matches router | PASS |
| DB filter (published only) | PASS |
| lastmod uses updated_at | PASS |
| Priority scheme sensible | PASS |
| Cache-Control | ACCEPTABLE (recommend 900s) |
| Company pages in sitemap | MISSING |
| Expired job 410 handling | NOT IMPLEMENTED (noindex used instead — acceptable) |
| Production routing verified | UNVERIFIED — must confirm |
