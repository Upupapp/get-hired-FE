# GetHired SEO V4 — 404, Redirect & Expired Content Log

Generated: 2026-06-26

## 404 Page — ErrorNotFoundComponent

File: `src/app/views/error-page/error-not-found/error-not-found.component.ts`

### Status: PASS

| Check | Status |
|-------|--------|
| noindex,follow robots | PASS |
| h1 tag | PASS — "Page Not Found" in h1.title-main |
| Crawlable recovery links | PASS — `<a href="/home">Homepage</a>` and `<a href="/jobs">Browse Jobs</a>` |
| Angular router recovery buttons | PASS — goHome() and goToJobs() methods |
| Useful description | PASS — "The page you are looking for doesn't seem to be available." |

### Soft 404 Issue (Still Open from V3 N1)

The server returns HTTP 200 for all Angular routes, including non-existent ones (the wildcard `**` route renders the 404 component). Google's response:
- "HTTP 200 + noindex" is honored — Google will drop the URL from index
- For job detail URLs that no longer exist, this means expired/deleted job URLs return 200+noindex (soft 404) rather than 410 Gone

Google does treat soft 404s correctly in most cases, but 410 Gone is a faster signal. Implementation would require Angular server.ts to check if a job ID exists before rendering. **Backlog V5, P3.**

### Wildcard Route Coverage

The `path: '**'` entry in app.routing.module.ts loads ErrorPageModule and renders ErrorNotFoundComponent. This covers all undefined routes.

**Known gap:** After login, guards call `router.resetConfig()` which may replace the route config without re-adding the wildcard. A 404 triggered while logged in may not show the 404 page. This is documented in the routing comment and is a V5 backlog item.

## Expired Job Pages

See: `GETHIRED_SEO_EXPIRED_JOB_INDEXING_LIFECYCLE_LOG_V4.md`

Summary:
- Expired jobs get `robots: 'noindex, nofollow'` from PublicDetailsComponent
- No JobPosting JSON-LD emitted
- Sitemap only includes active (job_status_id=2) jobs
- No 410 Gone — soft 404 only

## Redirect Coverage

| URL | Behavior |
|-----|----------|
| / | Redirects to /home (app-level route) |
| /home | Renders MainPortalComponent |
| /[unknown] | Wildcard → 404 page |

No trailing-slash redirect issues observed (Angular handles /home and /home/ the same way in standard routing). No www vs non-www redirect configured at FE level (should be handled by Nginx/hosting).

## Required Nginx/Hosting Redirects (Not in FE Code)

Verify at infrastructure level:
- www.gethiredonline.app → https://gethiredonline.app (301 redirect)
- http:// → https:// (301 redirect)
These are not Angular concerns but are important for canonical domain consolidation.
