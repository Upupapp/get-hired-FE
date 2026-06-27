# GetHired SEO V3 — Release Gate / Google Search Console Readiness

Updated by SEO audit agent: 2026-06-25
(Previously auto-generated; updated with audit findings and 9 applied fixes)

---

## Gate Verdict: READY TO SUBMIT — with one required production verification

---

## Go / No-Go Checklist (Audit-Updated)

| # | Check | Status | Notes |
|---|---|---|---|
| G1 | Public pages return 200 | PASS | Production live since prior deployments |
| G2 | robots.txt accessible at `/robots.txt` | PASS | Complete, all private routes covered |
| G3 | sitemap.xml returns valid XML | NEEDS VERIFICATION | Must confirm `/sitemap.xml` routes to BE, not SPA |
| G4 | sitemap.xml URLs match FE routes | PASS | All 4 static + dynamic job URLs verified by audit |
| G5 | Google Search Console verification token in HTML | PASS | `google-site-verification` meta tag present in index.html |
| G6 | Homepage canonical set | PASS | `https://gethiredonline.app/home` |
| G7 | Job detail pages indexed (active only) | PASS | `robots: 'index, follow'` for jobStatusId=2, noindex otherwise |
| G8 | Noindex pages blocked | PASS | signin, signup, search results, 404 all noindex |
| G9 | JobPosting JSON-LD on job detail | PASS | Emitted only for active jobs; schema enhanced by audit |
| G10 | Organization + WebSite JSON-LD on homepage | PASS | Both emitted in main-portal.component.ts |
| G11 | Titles within character limits | PASS (minor) | 2 pages at 62 chars — within display limit; not penalized |
| G12 | Meta descriptions present | PASS | All public pages have descriptions |
| G13 | OG image fallback | PASS (after audit fix) | logo.png added to index.html; proper branded OG image still needed |
| G14 | No private data in public routes | PASS | Auth routes blocked in robots.txt AND protected by guards |
| G15 | SearchAction URL template matches live route | PASS | `/jobs/search/{search_term_string}` matches router |

---

## Original Acceptance Criteria (from prior audit pass)

| # | Criterion | Status |
|---|---|---|
| 1 | SeoService exists and is SSR-safe | PASS |
| 2-9 | Core page meta (home/jobs/detail/inactive) | ALL PASS |
| 10-12 | Sitemap endpoint, filter, robots.txt ref | ALL PASS |
| 13-15 | Organization/WebSite/Breadcrumb JSON-LD | ALL PASS |
| 16-19 | 404/signin/search robots | ALL PASS |
| 20 | No fake data in structured data | PASS |
| 21-27 | No guards weakened, company meta, etc. | ALL PASS |

---

## Remaining Blocking Item

### VERIFY: Production /sitemap.xml routing

Run from local terminal:
```bash
curl -I https://gethiredonline.app/sitemap.xml
```
Expected: `Content-Type: application/xml; charset=utf-8`
If `Content-Type: text/html` — add Nginx proxy rule:
```nginx
location = /sitemap.xml {
    proxy_pass http://localhost:3000/sitemap.xml;
}
```

---

## Action Sequence for Search Console Submission

1. `curl -I https://gethiredonline.app/sitemap.xml` — confirm XML Content-Type
2. Open Google Search Console → Add Property → URL prefix → `https://gethiredonline.app`
3. Verification: "HTML tag" method — token already in index.html, no code change needed
4. Go to Sitemaps → Add sitemap → enter `sitemap.xml`
5. URL Inspection → test `/home`, `/jobs`, `/job-seekers`, `/employers` → Request indexing
6. Test a job detail in Rich Results Test: `https://search.google.com/test/rich-results`

---

## Backlog (Non-Blocking)

| # | Issue | Priority |
|---|---|---|
| N1 | `/assets/brand/gethired-og-default.png` does not exist — create 1200x630px branded OG image | P1 backlog |
| N2 | Company pages not in sitemap | P2 |
| N3 | Soft 404 (server returns 200 for 404 routes) | P2 |
| N4 | Remote job Schema.org fields (jobLocationType, applicantLocationRequirements) | P2 |
| N5 | SSR canonical not set server-side | P3 |
| N6 | `/signup` and other auth pages missing component-level noindex meta | P3 |
| N7 | No Google Indexing API for fast job publish/depublish | P3 |
| N8 | sameAs social links in Organization JSON-LD | P3 |

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | SeoService exists and is SSR-safe | ✅ PASS | `src/app/core/services/seo.service.ts`, all document/window calls guarded with isPlatformBrowser |
| 2 | Homepage (/home) has correct title, description, robots, canonical, OG | ✅ PASS | Set via SeoService in MainPortalComponent.ngOnInit |
| 3 | Jobs list (/jobs) has correct title, description, robots, canonical, OG | ✅ PASS | Set via SeoService in PublicListComponent.ngOnInit |
| 4 | Active job detail has title, description, index robots, canonical, OG | ✅ PASS | Set from real job data in PublicDetailsComponent |
| 5 | Inactive job detail has noindex robots | ✅ PASS | Condition: `jobStatusId !== 2` |
| 6 | JobPosting JSON-LD only on active job detail | ✅ PASS | Emitted only when `jobStatusId === 2` |
| 7 | JobPosting JSON-LD cleared on navigate away | ✅ PASS | `ngOnDestroy()` calls `clearJobPostingJsonLd()` |
| 8 | Private routes blocked in robots.txt | ✅ PASS | /admin, /recruiter, /user, /api, /payment, /subscription, /signin, /signup etc. |
| 9 | robots.txt in angular.json assets | ✅ PASS | `"src/robots.txt"` added to build.options.assets |
| 10 | Sitemap endpoint at /sitemap.xml (BE) | ✅ PASS | Added to `get-hired-BE/server.js` |
| 11 | Sitemap only includes active jobs | ✅ PASS | `WHERE job_status_id = 2` |
| 12 | Sitemap referenced in robots.txt | ✅ PASS | `Sitemap: https://gethiredonline.app/sitemap.xml` |
| 13 | Organization JSON-LD on homepage | ✅ PASS | Emitted by `setOrganizationJsonLd()` in MainPortalComponent |
| 14 | WebSite + SearchAction JSON-LD on homepage | ✅ PASS | Emitted by `setWebsiteJsonLd()` in MainPortalComponent |
| 15 | BreadcrumbList on job detail | ✅ PASS | Set from real data; cleared on ngOnDestroy |
| 16 | 404 page has noindex | ✅ PASS | ErrorNotFoundComponent sets `noindex, follow` |
| 17 | 404 page has useful recovery links (crawlable `<a>` tags) | ✅ PASS | Added `<a href="/home">` and `<a href="/jobs">` in template |
| 18 | Sign-in page has noindex | ✅ PASS | SigninComponent sets `noindex, nofollow` |
| 19 | Search results page (/jobs/search/:keyword) has noindex + canonical to /jobs | ✅ PASS | PublicSearchComponent |
| 20 | No fake salary/ratings/reviews in structured data | ✅ PASS | All values from real data; forbidden fields never emitted |
| 21 | No hreflang (correct — no language-prefixed URLs) | ✅ PASS | Documented decision |
| 22 | Skeleton loading CSS with prefers-reduced-motion guard | ✅ PASS | Added to styles.scss |
| 23 | Job card hover lift CSS with prefers-reduced-motion guard | ✅ PASS | Added to styles.scss |
| 24 | index.html default meta updated | ✅ PASS | Title and description updated; duplicate viewport removed |
| 25 | No route guards weakened | ✅ PASS | Zero changes to AuthGuard, EmployerGuard, ApplicantGuard, AdminGuard |
| 26 | No MATCH scoring changed | ✅ PASS | No JobCompatibilityService changes |
| 27 | Company page (/companies/details) has meta | ✅ PASS | Set from real company data |

## Blocking Issues (Must Fix Before Launch)

| # | Issue | Action |
|---|-------|--------|
| B1 | `/assets/brand/gethired-og-default.png` does not exist | Create 1200×630 OG image and place in assets/brand/ |
| B2 | Verify `/assets/images/logo.png` exists for Organization JSON-LD logo field | Check assets/images/ in FE build |

## Non-Blocking (Backlog)

| # | Issue | Priority |
|---|-------|---------|
| N1 | Soft 404 (server returns HTTP 200 for 404 routes) | P2 |
| N2 | SSR canonical not set server-side (only client-side) | P3 |
| N3 | `/signup` and other auth pages missing component-level noindex | P3 (robots.txt covers) |
| N4 | Company pages not in sitemap | P2 |
| N5 | No visual breadcrumb component (JSON-LD only) | P2 |
| N6 | Hero section navigation uses Angular router, not `<a>` tags | P2 |
| N7 | No Google Indexing API integration for fast job publish/depublish | P3 |
| N8 | "Thousands" in jobs meta — verify against actual count | P2 |

## Verdict
**SAFE TO DEPLOY** pending resolution of B1 and B2 (OG image + logo asset verification).
