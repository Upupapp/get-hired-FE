# GetHired TEST Report — Recent Deployment (Homepage V2)
**Scope:** Commit e817e2e — 6 FE files changed, BE untouched
**Date:** 2026-06-26

---

## 1. Build Verification

**Result: PASS**

`ng build` completed with 0 errors in this session. Pre-existing autoprefixer warnings were present (not introduced by this change). No new compilation errors were produced.

---

## 2. Static Analysis Findings

### TypeScript

**No new TypeScript errors detected (PASS).**

- `PortalRevealDirective` correctly imports `isPlatformBrowser` from `@angular/common` and `PLATFORM_ID` from `@angular/core`. Both are standard Angular 13 APIs. Constructor injection uses `@Inject(PLATFORM_ID)` which is the correct pattern.
- `MainPortalComponent` imports `PublicPortalAnalyticsService` using the `@main/public/services/...` path alias. This alias was already in use across the codebase before this commit; no new path was introduced.
- `PublicPortalAnalyticsService` uses `(window as any)?.__env?.production` with a `try/catch` to avoid SSR crashes — this is safe.
- `SharedModule` declares and exports both `ViewedOnceDirective` and `PortalRevealDirective`. No missing providers, no circular imports visible.
- **Minor pre-existing issue (not introduced by this commit):** `classesToInclude` in `SharedModule` contains two duplicate entries (`TabSelectorsComponent`, `EmptySectionComponent`, `DropdownSearchComponent`). This is a pre-existing condition, causes no runtime harm, and was not touched by this deployment.

### Template

**No errors detected (PASS).**

- `appPortalReveal` is applied to 3 sections: `.portal-product-preview`, `.portal-trust-safety`, `.portal-employer-band`. The directive is declared and exported in `SharedModule`, which is imported by the public module. The binding is correct.
- `appViewedOnce` is used on the `.portal-usp` section — this uses the pre-existing `ViewedOnceDirective`, unchanged by this deployment.
- `(revealed)="onProductPreviewViewed()"`, `(revealed)="onTrustSectionViewed()"`, `(revealed)="onEmployerBandViewed()"` — all three methods exist on `MainPortalComponent`. No missing method references.
- `activePreviewTab` is initialized to `'seeker'` in the class, and all 5 tab buttons use `[class.active]="activePreviewTab === '<tab>'"` correctly.
- `[id]="'panel-' + activePreviewTab"` and `[attr.aria-labelledby]="'tab-' + activePreviewTab"` on the tabpanel are correct dynamic bindings.
- `*ngFor` on `heroProofChips`, `uspPillars`, `differentiators`, `jobSeekerJourney`, `employerJourney` — all arrays are initialized in the class. No potential undefined iteration.
- All `(click)` bindings in the template (`goToJobs()`, `goToEmployerPortal()`, `goToJobSeekerPortal()`, `goToSignin()`, `setPreviewTab(...)`) resolve to methods on the component. No missing method.

### SCSS

**No errors detected (PASS).**

- `main-portal.component.scss` imports `src/assets/styles/colors`, `~assets/styles/motion`, and `../shared/portal-common`. The portal-common partial was confirmed to exist at `src/app/public/shared/_portal-common.scss`. Both `colors` and `motion` partials were pre-existing imports used by other portal pages.
- `$color-global-red-buttons` and `$color-global-red` are used extensively. Both variables are defined in the `colors` partial (used by other portal pages already).
- `$motion-ease-standard` is used in `portal-hero-copy` animation. Defined in the `motion` partial.
- `@keyframes portal-hero-reveal` is defined locally in this file and used on `.portal-hero-copy` and `.portal-hero-visual`. No naming collision risk with `_portal-common.scss` (that file contains no `@keyframes`).
- The `.portal-reveal-section` block provides `opacity: 0; transform: translateY(16px)` as the pre-revealed state, then `.is-revealed` transitions to `opacity: 1; transform: none`. The `@media (prefers-reduced-motion: reduce)` block correctly overrides both the initial hidden state and the transition, so content is immediately visible on reduced-motion systems even before the directive fires. This is the correct pattern.

---

## 3. Component Test Coverage — MainPortalComponent

**Coverage: ZERO (no spec file exists)**

No `main-portal.component.spec.ts` was found. This is a pre-existing condition — there are no spec files anywhere in `src/app/public/main-portal/` or `src/app/public/services/`. The following behaviors have no automated test coverage:

- `ngOnInit` redirect logic (authenticated user role switch)
- `setPreviewTab` updates `activePreviewTab` and calls analytics
- `goToJobs`, `goToEmployerPortal`, `goToJobSeekerPortal`, `goToSignin` navigate correctly
- `onUspSectionViewed`, `onProductPreviewViewed`, `onTrustSectionViewed`, `onEmployerBandViewed` fire correct analytics events

**Risk level for untested code:** Low-medium. The redirect logic in `ngOnInit` is the highest-value missing test (role 1/2/3 switch). The `setPreviewTab` and navigation methods are simple one-liners with low risk. Analytics calls are no-op safe if the service is wrong.

---

## 4. Directive Test Coverage — PortalRevealDirective

**Coverage: ZERO (no spec file exists)**

No `portal-reveal.directive.spec.ts` was found. Key behaviors without automated coverage:

| Behavior | Risk if broken |
|---|---|
| SSR path: adds `is-revealed` immediately when `!isPlatformBrowser` | High — content permanently invisible on SSR if this regresses |
| Fallback path: adds `is-revealed` when `IntersectionObserver` is undefined | Medium — old browsers see no content |
| Observer path: adds `is-revealed` + emits `revealed` when intersecting | Medium — scroll reveal never fires |
| Disconnect after first fire | Low — minor memory leak only |
| `ngOnDestroy` disconnects observer | Low — minor memory leak only |

Comparison with pre-existing `ViewedOnceDirective`: that directive also has no spec file and is not SSR-safe (no `PLATFORM_ID` injection, no `isPlatformBrowser` guard). `PortalRevealDirective` is strictly more robust — it is SSR-safe. The SSR path in `PortalRevealDirective` (`if (!isPlatformBrowser(...) || typeof IntersectionObserver === 'undefined')`) is correct Angular SSR practice. However, the SSR fallback is untestable without a unit test in a non-browser platform.

---

## 5. Analytics Service Test Coverage — PublicPortalAnalyticsService

**Coverage: ZERO (no spec file exists)**

The 4 new methods added to `PublicPortalAnalyticsService` (`trackProductPreviewSectionViewed`, `trackProductPreviewTabClicked`, `trackTrustSafetySectionViewed`, `trackEmployerConversionBandViewed`, `trackHeroCTAClicked`, `trackFinalCTAClicked`) follow the exact same pattern as all other methods in the file. The underlying `track()` method is private and is a no-op in production. Risk of regression is very low: the service has no real side effects until an analytics provider is wired in.

---

## 6. Contract Impact

**PASS — no API contract changes.**

No HTTP service calls were added or modified. `PublicPortalAnalyticsService` calls no backend endpoints. `MainPortalComponent` already called the backend only via `CoreService.isLoggedIn()` and `CoreService.getRole()` (both pre-existing, unchanged). No new API dependencies were introduced.

---

## 7. Accessibility Findings

**Result: MOSTLY PASS — two items flagged**

### Passes
- Hero `<h1>` present and unique on the page.
- Section landmarks use `aria-label` on all major `<section>` elements.
- Decorative images use `aria-hidden="true"` and empty `alt=""` consistently.
- Trust & safety emoji icons (`🛡️`, `👥`, `📋`, `🇵🇭`) use `<span aria-hidden="true">` — correct.
- CTA buttons all have visible text labels. All `type="button"` set (no accidental form submission).
- Tablist in Product Preview uses `role="tablist"`, `role="tab"`, `role="tabpanel"`, `[attr.aria-selected]`, `id`/`aria-controls`/`aria-labelledby` wiring. This is correct ARIA tabs pattern.
- `.btn-cta-primary` and `.portal-preview-tab` have `:focus-visible` outlines defined.
- `app-role-card` uses `ariaLabel` input — passed in template for both role cards.
- Hero proof chips container uses `aria-label="Key features"` — readable by screen reader.
- All hero and USP `<img>` elements have `width`/`height` and `loading="lazy"` (no CLS).

### Flagged items

**F-A1 (LOW): Product Preview video mock — decorative play button has no accessible label.**
The `<div class="preview-video-play-btn">▶</div>` inside `aria-hidden="true"` parent `.preview-video-player` is itself not `aria-hidden`. Since the grandparent `.preview-mock-card--video` is not `aria-hidden`, screen readers may encounter the `▶` character. The `▶` Unicode glyph is announced as "black right-pointing triangle" by some screen readers which is awkward but not harmful.
**Recommended fix:** Add `aria-hidden="true"` to `.preview-video-player` (it is already purely decorative).

**F-A2 (LOW): Hero visual mock cards have no `aria-hidden` on the outer container `.portal-hero-visual`.**
The mock UI cards (`hero-mock-card--seeker`, `hero-mock-card--employer`) contain text like "Application submitted" and "3 new applicants". These are decorative illustrations, not real data. The outer `.portal-hero-visual` div has `aria-hidden="true"` in the template (line 35) — this is **correct**, the entire visual is hidden from AT. No action needed; the finding from initial review is resolved by inspection.

**F-A3 (INFO): `portal-journey-proof` wraps `<app-talent-proof-badge>` in a `<p>` tag.**
This is a minor semantic issue: `<p>` should not contain block-level children. `app-talent-proof-badge` renders as a component; if it emits a `<div>` internally, this is an HTML validity issue. Low impact, no functional regression.

---

## 8. Regression Risk

**What could break that was not directly changed:**

| Area | Risk | Rationale |
|---|---|---|
| Other SharedModule consumers | LOW | `PortalRevealDirective` was added to declarations/exports. Angular module compilation would have caught any conflict at build time. The build passed. |
| `/job-seekers` and `/employers` portal pages | LOW | Both import the same `_portal-common.scss` partial and use `.btn-cta-primary`, `.btn-link-cta`, `.portal-usp-*` classes. No styles in those classes were changed. |
| `ViewedOnceDirective` consumers | NONE | The directive was not modified. It was already declared/exported in SharedModule before this commit. |
| `PublicPortalAnalyticsService` existing callers | NONE | Existing methods were not modified. Only new methods were added. |
| Angular router at empty path `/` | LOW | The comment in `MainPortalComponent` documents that a canActivate guard at this route breaks Angular 13's router. The redirect is still handled in `ngOnInit` exactly as before — no change to this logic. |
| SEO / SSR head tags | LOW | `ngOnInit` sets title, description, canonical, and two JSON-LD schemas. These were confirmed present in the prior session's SEO V4 work. No changes to `SeoService` calls. |
| CSS specificity conflicts | LOW-MEDIUM | `main-portal.component.scss` adds many new utility classes (`.portal-trust-*`, `.portal-employer-band-*`, `.portal-preview-*`). These are scoped to Angular's view encapsulation and are highly specific class names. Collision risk with global styles is very low. |
| `portal-reveal-section` class on SSR | LOW | On the server, `PortalRevealDirective` falls through to the immediate `classList.add('is-revealed')` path. So sections render fully visible in SSR HTML. The CSS `.portal-reveal-section` sets `opacity: 0` as default — this means SSR-rendered HTML will flash hidden until the directive fires, except the `@media (prefers-reduced-motion: reduce)` block overrides this to `opacity: 1` immediately. This is expected behavior and acceptable. |

---

## 9. Release Quality Gate Summary

| Gate | Status | Notes |
|---|---|---|
| Build passes | PASS | Clean `ng build`, 0 errors |
| No new TypeScript errors | PASS | Static analysis clean |
| No API contract regressions | PASS | No BE changes, no service changes |
| Auth flows preserved | PASS | `ngOnInit` redirect logic unchanged |
| Payment flows preserved | PASS | No payment-related changes |
| Accessibility baseline | PASS WITH NOTE | One minor decorative element improvement recommended (F-A1); no blocking failures |
| SSR safety | PASS | `PortalRevealDirective` explicitly handles SSR via `isPlatformBrowser` |
| Performance regression | LOW RISK | New SCSS is component-scoped; no new JS dependencies; no new HTTP calls; lazy-loaded images with width/height present |
| No security regressions | PASS | No BE changes, no auth changes, no new inputs, no user data handled |
| No false claims introduced | PASS | All copy confirmed against GETHIRED_HOME_SECURITY_CLAIMS_AUDIT.md |

**Overall: GO**
