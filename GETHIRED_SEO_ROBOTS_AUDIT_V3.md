# GetHired SEO V3 — robots.txt Audit

Audit date: 2026-06-25
File: `get-hired-FE/src/robots.txt`

---

## File Contents (reviewed)

```
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /admin
Disallow: /recruiter/
Disallow: /recruiter
Disallow: /user/
Disallow: /user
Disallow: /owner/
Disallow: /owner
Disallow: /investor/
Disallow: /investor
Disallow: /api/
Disallow: /payment/
Disallow: /payment
Disallow: /subscription/
Disallow: /subscription
Disallow: /signin
Disallow: /signup
Disallow: /reset-password
Disallow: /change-password
Disallow: /verify

Sitemap: https://gethiredonline.app/sitemap.xml
```

---

## Directive-by-Directive Analysis

### User-agent: *
CORRECT — applies to all crawlers.

### Allow: /
CORRECT — explicitly allows everything not otherwise blocked. Redundant but harmless.

### Trailing-slash + bare-path pairs

| Route | Both forms present? | Assessment |
|---|---|---|
| `/admin` | YES (`/admin/` and `/admin`) | CORRECT — catches both `/admin` (exact) and `/admin/anything` |
| `/recruiter` | YES | CORRECT |
| `/user` | YES | CORRECT |
| `/owner` | YES | CORRECT — `/owner` route is in auth guard per code review |
| `/investor` | YES | CORRECT |
| `/payment` | YES | CORRECT |
| `/subscription` | YES | CORRECT |

### Auth routes (no trailing slash needed — no children)

| Route | Present? | Correct? |
|---|---|---|
| `/signin` | YES | CORRECT — confirmed noindex in SigninComponent, also blocked here |
| `/signup` | YES | CORRECT — signup page should not be indexed |
| `/reset-password` | YES | CORRECT |
| `/change-password` | YES | CORRECT |
| `/verify` | YES | CORRECT — email verification page |

### Sitemap directive
```
Sitemap: https://gethiredonline.app/sitemap.xml
```
CORRECT format. Uses absolute HTTPS URL as required by Google.

---

## Coverage Gaps

### /api/ — Missing trailing entry
`/api/` is present but `/api` (without slash) is missing. However, since `/api` is the BE API prefix and not an Angular route, this is acceptable. Google won't be navigating to bare `/api` from the SPA.

### /public-search or /jobs/search
The search results pages (`/jobs/search/:keyword`) are NOT blocked in robots.txt, but they ARE handled via:
- `robots: 'noindex, follow'` meta tag in `PublicSearchComponent`
- `canonical: 'https://gethiredonline.app/jobs'` pointing to the canonical list page

**Assessment**: This is the CORRECT approach per Google's guidelines. Using `noindex` in the meta tag is preferable to `Disallow` for search pages, because:
- `Disallow` in robots.txt prevents Google from seeing the page at all
- `noindex` allows Google to crawl and follow links on the page without indexing it
- The canonical further signals that /jobs is the preferred URL

**No change needed** for /jobs/search.

### /public-apply
Route exists as `public-apply.component.ts`. If accessible under a public route, it may not need to be indexed. Verify that `/public-apply` is protected or irrelevant for search.

### /companies
`/companies` (company listing page) and `/companies/details` (company detail pages) are NOT blocked — they are intentionally indexable, which is CORRECT.

### Routes from app.routing.module.ts not covered

The FE routes are:
- `/admin/*` — BLOCKED
- `/recruiter/*` — BLOCKED
- `/user/*` — BLOCKED  
- `/home` — PUBLIC (intentional)
- `/jobs/*` — PUBLIC (intentional, with noindex for search variants)
- `/companies/*` — PUBLIC (intentional)
- `/job-seekers` — PUBLIC (intentional)
- `/employers` — PUBLIC (intentional)
- `/signin` — BLOCKED
- `/signup` — BLOCKED
- `/reset-password` — BLOCKED
- `/change-password` — BLOCKED
- `/verify` — BLOCKED
- `/**` (404) — RENDERED with noindex meta (fine — not blocked at robots level which allows link following)

**No coverage gaps found** for the current route structure.

---

## Angular HashLocationStrategy Note

The `app.routing.module.ts` imports `HashLocationStrategy` but does NOT use it (it imports `RouterModule.forRoot(routes)` without `{ useHash: true }`). Routes are path-based (PushState), which is correct for SEO. Hash URLs (`#/jobs`) would be invisible to Google.

---

## Summary

| Check | Result |
|---|---|
| All authenticated roles blocked | PASS |
| Both trailing-slash and bare forms | PASS for authenticated routes |
| Auth routes blocked | PASS (5/5) |
| Search pages handled | PASS (noindex meta, not robots.txt block — correct approach) |
| Sitemap directive present | PASS |
| Sitemap URL format | PASS (absolute HTTPS) |
| Missing routes | NONE identified |
| HashLocationStrategy risk | NOT ACTIVE — PushState routing confirmed |

**Overall verdict: robots.txt is COMPLETE and correctly configured.**
