# GetHired SEO V4 — Robots.txt Log

Generated: 2026-06-26

## File: `src/robots.txt`
## Status: PASS — no changes made in V4

## Current Content (verified)

```
User-agent: *
Allow: /

# Private/authenticated-only routes — do not index
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

# Prevent indexing paginated/filtered search result pages (duplicate content).
Disallow: /jobs/search/

# Sitemap location
Sitemap: https://gethiredonline.app/sitemap.xml
```

## Build Integration

Confirmed in `angular.json`:
```json
"assets": [
  "src/favicon.ico",
  "src/assets",
  "src/robots.txt",
  "src/google8d5e93b3a9106865.html"
]
```
robots.txt is included in the build output and served as a static file.

## Coverage Analysis

| Route | Disallowed | Notes |
|-------|-----------|-------|
| /admin/* | YES | Both /admin and /admin/ covered |
| /recruiter/* | YES | Both variants |
| /user/* | YES | Both variants |
| /owner/* | YES | Defensive — no current route |
| /investor/* | YES | Defensive — no current route |
| /api/* | YES | BE API routes |
| /payment/* | YES | Payment flows |
| /subscription/* | YES | Subscription flows |
| /signin | YES | |
| /signup | YES | |
| /reset-password | YES | |
| /change-password | YES | |
| /verify | YES | |
| /jobs/search/* | YES | Prevents keyword URL indexing |

## What Is Allowed (by design)

- /home
- /jobs
- /job-seekers
- /employers
- /companies/details
- /jobs/details/:id

All public-facing pages are crawlable. The `Allow: /` directive plus specific Disallow rules gives Google explicit permission to crawl the public surface.

## No Changes Needed in V4

The V4 fix for auth pages (signup, reset-password, change-password, verify) is at the component level — these routes were already in robots.txt. The V4 component-level noindex adds defense-in-depth; it doesn't require any robots.txt change.
