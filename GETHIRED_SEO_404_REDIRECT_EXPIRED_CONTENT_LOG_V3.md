# GETHIRED SEO 404 / Redirect / Expired Content Log V3

Generated: 2026-06-25

## 404 Page

### Component
`src/app/views/error-page/error-not-found/error-not-found.component.ts`
`src/app/views/error-page/error-not-found/error-not-found.component.html`

### Route
Wildcard `path: '**'` in root AppRoutingModule → lazy loads ErrorPageModule → renders ErrorNotFoundComponent at `path: ''`.

### Changes Made

**TypeScript (component):**
- Added `SeoService` injection.
- `ngOnInit()` sets: `title: "Page Not Found | GetHired Online"`, `robots: "noindex, follow"`.
- Added `goHome()` → `/home` and `goToJobs()` → `/jobs` methods.
- Added `Router` injection.

**HTML (template):**
- Changed `<h3>` to `<h1>` (proper heading hierarchy for a standalone page).
- Replaced "Contact Now" buttons (which had no action) with functional "Browse Jobs" and "Go to Homepage" buttons.
- Added crawlable anchor tags:
  ```html
  <a href="/home">Homepage</a>
  <a href="/jobs">Browse Jobs</a>
  ```
- These anchor tags ensure Googlebot can follow them even without JavaScript execution.

## Redirect Strategy

### Current State
No server-level redirect rules beyond Angular's own routing.
The Angular SSR server.ts serves all `*` routes via Universal engine — a 404 URL gets SSR-rendered with the ErrorNotFoundComponent but returns HTTP 200 (soft 404 issue).

### Soft 404 Issue
The Angular server.ts uses:
```javascript
server.get('*', (req, res) => {
  res.render(indexHtml, { req, ... });
});
```
This returns HTTP 200 for all URLs including 404s. Google may or may not treat soft 404s appropriately.

**Recommended fix (backlog):** Configure the SSR server to return HTTP 404 status for wildcard routes:
```javascript
server.get('*', (req, res) => {
  res.status(404).render(indexHtml, { req, ... });
});
```
But this requires verifying that ALL legitimate Angular routes are handled by the router before the wildcard fires — otherwise legitimate pages return 404.

## Expired Job URLs

### Policy
When `jobStatusId !== 2`, the job detail page:
1. Renders (does not 404).
2. Sets `robots: "noindex, nofollow"` via SeoService.
3. Does NOT emit JobPosting JSON-LD.

### Future Improvement
Return HTTP 410 (Gone) from BE for deleted jobs and HTTP 404 for not-found jobs. This signals to Google that the URL is permanently removed and speeds up deindexing.
