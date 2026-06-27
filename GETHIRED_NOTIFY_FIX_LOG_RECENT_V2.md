# GETHIRED NOTIFY — SEO V3 Fix Log
**Session:** 2026-06-25  
**Commit basis:** bf5bd08 (FE), 26ca25a (BE)

---

## FE Changes (5 files, 5 fixes)

### FIX-01: public-search description too short
**File:** `src/app/public/public-search/public-search.component.ts`  
**Before:**
```
description: kw ? `Search results for "${kw}" jobs in the Philippines on GetHired Online.` : 'Search and browse job opportunities in the Philippines on GetHired Online.'
```
- With keyword: 70ch (below 120ch threshold)
- Without keyword: 74ch (below 120ch threshold)

**After:**
```
description: kw ? `Find "${kw}" jobs in the Philippines on GetHired Online. Browse matching roles, filter by work setup and job type, and apply online.` : 'Search and filter thousands of job opportunities in the Philippines on GetHired Online. Browse by role, work setup, and job type.'
```
- With keyword: ~131ch (OK)
- Without keyword: ~131ch (OK)

**Rationale:** Descriptions under 80ch are frequently rewritten by Google with arbitrary page content, losing keyword control. These pages are noindex anyway (so crawler display is rare) but search previews can still appear in Discover and social shares.

---

### FIX-02: company-details description too short
**File:** `src/app/companies/public-company-details/public-company-details.component.ts`  
**Before:** `Learn about ${company.companyName} and view their open jobs on GetHired Online.` — 78ch typical

**After:** `Explore ${company.companyName} on GetHired Online — view their company profile and open job positions in the Philippines.` — ~108ch typical

**Rationale:** Company pages are indexed (robots: 'index, follow'). A 78ch description is thin and Google will often substitute its own copy. The improved version adds geographic context ("Philippines") and a second keyword surface ("open job positions").

---

### FIX-03: signin description too short
**File:** `src/app/auth/signin/signin.component.ts`  
**Before:** `Sign in to your GetHired Online account.` — 40ch

**After:** `Sign in to your GetHired Online account to access your dashboard, manage applications, and continue your job search.` — ~120ch

**Rationale:** The signin page is noindex, nofollow so this does not affect SERP display. However, the description populates og:description — which IS displayed when the signin URL is shared socially (e.g., in a company onboarding email, someone might share the signin link). A fuller description makes the social card more informative.

---

### FIX-04: Report files created
**Files created:**
- `GETHIRED_NOTIFY_REPORT_RECENT_V2.md`
- `GETHIRED_NOTIFY_FIX_LOG_RECENT_V2.md` (this file)
- `GETHIRED_NOTIFY_RELEASE_GATE_RECENT_V2.md`

---

## BE Changes (1 file, 1 fix)

### BE-FIX-01: sitemap.xml error returns 503 + Retry-After instead of 500
**File:** `server.js` (catch block of `/sitemap.xml` route)  
**Before:**
```javascript
res.status(500).send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset ...>");
```

**After:**
```javascript
res.setHeader("Retry-After", "3600");
res.status(503).send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset ...>");
```

**Rationale:**
- HTTP 500 (Internal Server Error) signals an unexpected server crash. Google may reduce crawl frequency and eventually log "Sitemap could not be read" in Search Console.
- HTTP 503 (Service Unavailable) is the correct signal for a temporary outage. Combined with `Retry-After: 3600`, it explicitly tells Googlebot "come back in 1 hour" — Google will hold the existing sitemap state and retry rather than treating existing indexed URLs as potentially removed.
- The empty urlset body is preserved to keep XML parsers happy even at error status.

---

## Changes NOT Applied (require manual action or out-of-scope)

| Issue | Reason not applied |
|-------|-------------------|
| Missing `gethired-og-default.png` asset | Requires graphic design work; cannot auto-create |
| No static `og:image` in index.html | Depends on asset above |
| JSON-LD `description: ""` when job.jobDescription is null | Requires Rich Results Test validation before shipping; low urgency (no indexing harm) |
| Dead code: `Title` import in employer-portal and job-seeker-portal | Files have been modified by linter; avoiding double-edit churn; low priority cleanup |
| Skeleton CSS classes unused in public templates | Not a messaging issue; UX/performance backlog item |
| Authenticated job-posts-details uses `| GetHired` not `| GetHired Online` | Auth-gated page, no public SEO impact |

