# GetHired SEO Impact Report — SEC-01 BOLA Fix
**Scope:** SEC-01 deployment (applicant.service.ts, actions, effects, facade, applicant-panel.component.ts, applicant-profile-details.component.scss)
**Date:** 2026-06-25
**Verdict: NO SEO REGRESSION. All checks pass.**

---

## CHECK 1 — SEC-01 changes do not touch public-facing SEO routes

**Result: PASS**

Files changed by SEC-01:

| File | Module | Route |
|---|---|---|
| `src/app/applicant/applicant.service.ts` | applicant (lazy) | `/user/**` (auth-gated) |
| `src/app/applicant/state/applicant.actions.ts` | applicant state | `/user/**` (auth-gated) |
| `src/app/applicant/state/applicant.effects.ts` | applicant state | `/user/**` (auth-gated) |
| `src/app/applicant/state/applicant.facade.ts` | applicant state | `/user/**` (auth-gated) |
| `src/app/applicant-panel/applicant-panel.component.ts` | applicant-panel | `/user/**` (auth-gated) |
| `src/app/applicant-panel/applicant-profile/applicant-profile-details/applicant-profile-details.component.scss` | applicant-panel | `/user/profile/**` (auth-gated) |

None of these files are imported by or referenced in:
- `PublicListComponent` (`/jobs`) — confirms `public-list.component.ts` is untouched
- `PublicDetailsComponent` (`/jobs/details/:id`) — confirms `public-details.component.ts` is untouched
- `MainPortalComponent` (`/home`) — confirms `main-portal.component.ts` is untouched
- `PublicSearchComponent` (`/jobs/search/:keyword`) — untouched
- `JobSeekerPortalComponent` (`/job-seekers`) — untouched
- `EmployerPortalComponent` (`/employers`) — untouched

The applicant-panel module is only loaded at `/user/**`, which is protected by `ApplicantGuard`. The guard checks `localStorage['state'] === 'true'` and `role === '3'`; unauthenticated requests return `false` and are redirected to auth routes. No public SEO route is affected.

---

## CHECK 2 — Applicant profile page has correct noindex

**Result: PASS — protected by three independent layers**

The applicant profile (`/user/profile/...`) is gated at three levels:

1. **robots.txt** — `Disallow: /user/` and `Disallow: /user` are present (line 8–9 of `src/robots.txt`). Googlebot will not crawl `/user/` routes at all.

2. **ApplicantGuard (`canActivate`)** — unauthenticated requests to `/user/**` are rejected and redirected before any component renders. Crawlers without a valid session token never see the panel.

3. **No SeoService call in applicant-panel** — confirmed by grepping `seoService|SeoService|setPageMeta|setRobots` across all files in `src/app/applicant-panel/`. Zero matches. This means the applicant-panel carries no `robots: 'index, follow'` directive at all. The only robots meta it could inherit from `index.html` (`content="index, follow"`) would already be overridden by any public-page route's `setPageMeta` call on the previous navigation, and the guard prevents the panel from being reached by crawlers anyway.

The `ApplicantProfileDetailsComponent` (`applicant-profile-details.component.ts`) makes no `SeoService` call — it only reads `localStorage['user']` to populate a `userId` prop. No indexable meta is set or changed by this component.

**Note (non-blocking):** There is no explicit `setRobots(false, false)` call within the applicant panel itself. This is acceptable because:
- robots.txt `Disallow: /user/` is the primary crawl barrier
- The guard prevents rendering for unauthenticated clients
- Adding a defensive `setRobots(false, false)` call inside `ApplicantPanelComponent.ngOnInit()` would be belt-and-suspenders hardening for a future SSR improvement, not a current regression.

---

## CHECK 3 — SEC-01 error states (401/403/404/generic) do not expose indexable content

**Result: PASS**

SEC-01 error handling lives in `applicant.effects.ts` `user$` effect (lines 286–316). The error messages it dispatches are:

- 401: `"Your session has expired. Please sign in again."`
- 403: `"We couldn't load this profile for your current session."`
- 404: `"Let's finish setting up your profile."`
- other: `"We couldn't load your profile. Please try again."`

These strings are dispatched as `getUserProfileFail({ payload: safeMessage })` into the NgRx store. They are read by components inside the applicant panel only (behind `ApplicantGuard`). They are:
- Never rendered on a public-facing route
- Never passed to `SeoService` or meta tags
- Protected by robots.txt `Disallow: /user/` before a crawler could even reach them

The SEC-01 error states add user-facing feedback only within the authenticated shell. No SEO exposure.

---

## CHECK 4 — Skeleton/loading states and SSR (Angular Universal) compatibility

**Result: PASS — with one pre-existing caveat documented below**

**SSR is active.** `server.ts` is present and wired up via `@nguniversal/express-engine`. `AppServerModule` imports `ServerModule` and bootstraps `AppComponent`. `angular.json` confirms the SSR builder (`@angular-devkit/build-angular:server`) and `prerender`/`serve-ssr` targets are configured.

**SeoService is already SSR-safe.** Every `document`/`window` access in `seo.service.ts` is guarded by `isPlatformBrowser(platformId)` (lines 53, 131, 153, 191). The `setCanonical`, `clearCanonical`, `setJsonLd`, `clearJsonLd`, and `stripHtml` methods all return early on the server. This was not changed by SEC-01 and remains intact.

**SEC-01 SCSS (`applicant-profile-details.component.scss`)** — CSS-only animations (`@keyframes gh-skeleton-shimmer`, `gh-profile-reveal`, `gh-error-reveal`, `gh-session-banner-slide`). These are pure CSS, no JavaScript, no `document` access. The `@include motion-safe` / `@include ambient-motion-safe` mixins suppress animation when `prefers-reduced-motion: reduce` is set. No SSR risk.

**Pre-existing caveat (not introduced by SEC-01):** `ApplicantPanelComponent` calls `localStorage.getItem('user')` at class field initialisation (line 16 of `applicant-panel.component.ts`) and `ApplicantProfileDetailsComponent` does the same at line 10. `localStorage` is not available in SSR context and would throw `ReferenceError: localStorage is not defined` if this component were rendered server-side. However, this is a **pre-existing issue** and is not a regression introduced by SEC-01. Furthermore, the `/user/**` routes are blocked by robots.txt before a search engine crawler reaches them, so SSR rendering of the applicant panel has no SEO impact. The correct fix (wrapping `localStorage` in `isPlatformBrowser`) is a separate hardening task.

---

## CHECK 5 — Home page (main-portal) SEO title/meta/canonical/JSON-LD integrity

**Result: PASS — all intact, unchanged by SEC-01**

`MainPortalComponent` (`src/app/public/main-portal/main-portal.component.ts`) calls `SeoService` in `ngOnInit()`:

```typescript
this.seoService.setPageMeta({
  title: 'GetHired Online — Jobs and Hiring Platform in the Philippines',
  description: 'Find jobs, build your profile, post jobs, and manage hiring with GetHired Online — the modern hiring platform for the Philippines.',
  canonical: 'https://gethiredonline.app/home',
  robots: 'index, follow',
});
this.seoService.setOrganizationJsonLd();
this.seoService.setWebsiteJsonLd();
```

This file was **not changed by SEC-01**. Confirmed:
- Title: correct, unchanged
- Description: correct, unchanged
- Canonical: `https://gethiredonline.app/home` — correctly set
- robots: `index, follow` — correct
- JSON-LD: Organization + WebSite (with SearchAction pointing to `/jobs/search/{search_term_string}`) — intact

`index.html` base meta tags (fallback for first paint before Angular hydrates) also remain correct:
- `<title>GetHired Online — Jobs and Hiring Platform in the Philippines</title>`
- `<meta name="robots" content="index, follow">`
- OG/Twitter tags present and correct
- Google Search Console verification tag present

---

## Summary Table

| Check | Status | Notes |
|---|---|---|
| SEC-01 files touch public SEO routes | PASS | Zero overlap. All changes are inside `/user/**` (auth-gated) module. |
| Applicant profile has noindex protection | PASS | robots.txt Disallow, ApplicantGuard, no SeoService call in panel. Three layers. |
| Error states (401/403/404) expose indexable content | PASS | Error strings stay inside NgRx store, behind auth guard, never reach public routes. |
| Skeleton/CSS states interfere with SSR | PASS | Pure CSS animations, no JS/document access. SeoService already has isPlatformBrowser guards. |
| Home page SEO title/meta/canonical/JSON-LD intact | PASS | MainPortalComponent unchanged, calls setPageMeta/setOrganizationJsonLd/setWebsiteJsonLd correctly. |

---

## One Non-Blocking Finding (Pre-Existing, Not Introduced by SEC-01)

**`localStorage` called at class-field level in `ApplicantPanelComponent` and `ApplicantProfileDetailsComponent`**
- Files: `applicant-panel.component.ts:16`, `applicant-profile-details.component.ts:10`
- These call `localStorage.getItem(...)` outside `ngOnInit`, making them unsafe if Angular Universal ever renders the applicant panel server-side.
- **Not a current SEO risk** because robots.txt `Disallow: /user/` prevents crawlers from reaching these routes.
- **Not introduced by SEC-01** — pre-existing code.
- **Recommended fix (future hardening):** Wrap `localStorage` access in `isPlatformBrowser` or move it into `ngOnInit()` with a browser check.

---

## Conclusion

**SEC-01 does not regress SEO.** All five checks pass. The deployment can proceed with no SEO remediation required.
