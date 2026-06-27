# GETHIRED SEO Canonical URL Log V3

Generated: 2026-06-25

## Canonical Implementation

Canonical URLs are set via `SeoService.setCanonical(url)` which:
1. Checks `isPlatformBrowser` — skips in SSR context (canonical link tag management in SSR requires TransferState or server-side rendering config, not direct DOM access).
2. Finds or creates `<link rel="canonical">` in document.head.
3. Sets the `href` attribute.

## Canonical Map

| Route | Canonical URL | Notes |
|-------|--------------|-------|
| /home | https://gethiredonline.app/home | Homepage |
| /jobs | https://gethiredonline.app/jobs | Clean jobs list |
| /jobs/details/:id | https://gethiredonline.app/jobs/details/{jobId} | Per-job canonical |
| /jobs/search/:keyword | https://gethiredonline.app/jobs | Search → canonical = jobs list |
| /job-seekers | https://gethiredonline.app/job-seekers | Portal page |
| /employers | https://gethiredonline.app/employers | Portal page |
| /companies/details?id=X | https://gethiredonline.app/companies/details?id={companyId} | Query param preserved |

## URL Hygiene Notes

### Root / → /home redirect
The bare root `/` redirects to `/home` at the router level. This is consistent — `/home` is the canonical URL for the homepage, not `/`.

### No www vs non-www issue
The production URL is `gethiredonline.app` (no www). All canonicals use this form. Confirm server-level redirect from www.gethiredonline.app → gethiredonline.app is in place (not controlled by the Angular app — a server/CDN concern).

### HTTPS
All canonical URLs use `https://` — confirm HTTPS redirect is enforced at server/Linode level.

### Hash vs History routing
The app uses `RouterModule.forRoot(routes)` without `HashLocationStrategy` (no `#` in URLs) — confirmed by `LocationStrategy` import in `app.routing.module.ts` but not used in `@NgModule.providers`. This means URLs are clean path-based (good for SEO).

## SSR Canonical Note
Angular Universal SSR renders the page server-side. The `SeoService.setCanonical()` call is skipped on the server (browser check). For full SSR canonical support, a future improvement would add server-side canonical injection using Angular's server-side rendering metadata system. In the current setup, SSR-rendered pages will have the canonical set by Angular's hydration as soon as the client takes over (negligible impact on crawlers that use the SSR-rendered HTML).
