# GETHIRED SEO Robots.txt Log V3

Generated: 2026-06-25

## File Created
`src/robots.txt`

## Contents
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

## angular.json Registration
Added `"src/robots.txt"` to the `assets` array in `architect.build.options`:
```json
"assets": [
  "src/favicon.ico",
  "src/assets",
  "src/robots.txt"
]
```
This copies robots.txt to the build output root so it is served at `/robots.txt`.

## Decisions

### Both with and without trailing slash
`/admin/` blocks paths under /admin, `/admin` blocks the exact path. Both included for belt-and-suspenders.

### /api/ blocked
The BE API runs on a separate origin (different port/server) in production, but blocking /api/ in the FE robots.txt prevents crawlers from following any API-shaped URLs that appear in the Angular SSR output.

### /owner/ and /investor/
These are documented in the platform context as role-gated routes. No actual components confirmed but blocked preemptively.

## Verification
After deploy: `curl https://gethiredonline.app/robots.txt` — should return the file above.
Check in Google Search Console → Settings → robots.txt tester.
