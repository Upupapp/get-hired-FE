# GetHired SEO V4 — Canonical & URL Hygiene Log

Generated: 2026-06-26

## V4 Key Fix: SSR Canonical Now Works

**V3 Issue:** `setCanonical()` had `if (!this.isBrowser) return;` — canonical `<link>` tags were never written to SSR HTML. Googlebot got the SSR page without a canonical tag.

**V4 Fix:** `setCanonical()` and `clearCanonical()` now use `this.doc` (Angular DOCUMENT injection token). The canonical tag is now emitted in SSR HTML.

**Impact:** All pages with `canonical:` in their `setPageMeta()` call will now have the `<link rel="canonical">` present in the SSR-rendered HTML that Googlebot sees on first HTTP fetch.

## Canonical URL Map

| Page | Canonical URL | Method |
|------|--------------|--------|
| /home | https://gethiredonline.app/home | setPageMeta({canonical}) |
| /jobs | https://gethiredonline.app/jobs | setPageMeta({canonical}) |
| /jobs/details/:id | https://gethiredonline.app/jobs/details/:id | setPageMeta({canonical}) |
| /job-seekers | https://gethiredonline.app/job-seekers | setPageMeta({canonical}) |
| /employers | https://gethiredonline.app/employers | setPageMeta({canonical}) |
| /companies/details | https://gethiredonline.app/companies/details?id=X | setPageMeta({canonical}) |
| /jobs/search/:keyword | https://gethiredonline.app/jobs (deduplication canonical) | setPageMeta({canonical}) |
| /signin | none (clearCanonical) | noindex page |
| /signup | none (clearCanonical) | noindex page |
| /reset-password | none (clearCanonical) | noindex page |
| /change-password | none (clearCanonical) | noindex page |
| /verify | none (clearCanonical) | noindex page |
| 404 | none (clearCanonical) | noindex page |

## URL Hygiene Issues

### Query-parameter company URLs
`/companies/details?id=123` is not a clean URL. SEO best practice is `/companies/123`. However, changing this requires routing changes and may break existing shareable links. Backlog V5.

### /home vs / disambiguation
The root `/` redirects to `/home`. The canonical for the homepage is explicitly set to `/home`. This prevents any confusion between `/` and `/home` in Google's index. Both URLs serve the same content, but only `/home` gets the canonical — correct approach.

### hashbang routing check
The app uses `RouterModule.forRoot(routes)` without HashLocationStrategy — standard HTML5 History API routing. No `#!` URLs. Good for SEO.

## index.html Default Canonical

index.html does NOT have a static canonical tag (by design — the comment says "Canonical handled dynamically by SeoService per route"). This is correct: a static canonical in index.html would apply to every SSR-rendered page before the component-level canonical overwrites it, potentially sending conflicting signals.

Post-V4, components set the canonical via `this.doc` in SeoService which writes it to the server-side DOM during SSR — so each page's canonical is correct from the first server response.
