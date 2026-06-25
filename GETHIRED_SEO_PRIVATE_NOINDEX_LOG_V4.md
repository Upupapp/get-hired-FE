# GetHired SEO V4 — Private Page Noindex Log

Generated: 2026-06-26

## V3 Status (before this run)

V3 confirmed noindex on: /signin, 404 page.
V3 documented as backlog (N3): /signup, /reset-password, /change-password, /verify had NO component-level noindex (only robots.txt Disallow).

## V4 Changes Applied

All four missing auth pages now have component-level noindex, providing defense-in-depth beyond robots.txt.

### signup.component.ts
**Before:** No SeoService injection; no setPageMeta call.
**After:**
```ts
import { SeoService } from '@app-core/services/seo.service';
// in ngOnInit():
this.seoService.setPageMeta({
  title: 'Create Account | GetHired Online',
  description: 'Create your GetHired Online account...',
  robots: 'noindex, nofollow',
});
```
**SEO Impact:** If Googlebot somehow fetches /signup (unlikely given robots.txt), the rendered meta now explicitly says noindex.
**Risk:** NONE — purely additive. Form logic unchanged.

### reset-password.component.ts
**Before:** No SeoService; no meta.
**After:** `robots: 'noindex, nofollow'` set in ngOnInit.
**Risk:** NONE

### change-pw.component.ts
**Before:** No SeoService; no meta.
**After:** `robots: 'noindex, nofollow'` set in ngOnInit.
**Risk:** NONE

### account-authentication.component.ts (verify route)
**Before:** No SeoService; no meta.
**After:** `robots: 'noindex, nofollow'` set in ngOnInit.
**Risk:** NONE

## Complete Private Noindex Coverage (post-V4)

| Route | robots.txt Disallow | Component noindex |
|-------|---------------------|-------------------|
| /signin | YES | YES (V3) |
| /signup | YES | YES (V4) |
| /reset-password | YES | YES (V4) |
| /change-password | YES | YES (V4) |
| /verify | YES | YES (V4) |
| /admin/* | YES | No (guard prevents load) |
| /recruiter/* | YES | No (guard prevents load) |
| /user/* | YES | No (guard prevents load) |
| /jobs/search/:* | YES | YES (noindex,follow) |
| 404 (**) | N/A | YES (noindex,follow) |

## Why Both Layers Matter

robots.txt Disallow prevents crawl budget spent on these pages. Component-level noindex ensures that if a bot ignores robots.txt (some do), or if Google's renderer fetches the page anyway for indexing, the meta robots tag provides a final safety net.

The combination of both layers is the correct defense-in-depth posture for auth pages.
