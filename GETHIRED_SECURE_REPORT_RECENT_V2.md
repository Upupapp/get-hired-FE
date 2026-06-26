# GETHIRED SECURE REPORT — RECENT DEPLOYMENT (Homepage V2)

**Deployment:** commit e817e2e — Homepage V2 (2026-06-26)
**Audit scope:** 6 FE files changed; NO BE changes
**Auditor:** Claude Code (GETHIRED SECURE command, "RECENT DEPLOYMENT" mode)
**Date:** 2026-06-26

---

## Files audited (all 6 changed files read directly)

| # | File | Type |
|---|------|------|
| 1 | `src/app/shared/directives/portal-reveal.directive.ts` | NEW |
| 2 | `src/app/shared/shared.module.ts` | MODIFIED |
| 3 | `src/app/public/services/public-portal-analytics.service.ts` | MODIFIED |
| 4 | `src/app/public/main-portal/main-portal.component.ts` | MODIFIED |
| 5 | `src/app/public/main-portal/main-portal.component.html` | MODIFIED |
| 6 | `src/app/public/main-portal/main-portal.component.scss` | MODIFIED |

---

## 1. XSS Risks

### 1a. `[innerHTML]` bindings
**VERIFIED: None present.**
Grep over all three main-portal files returned zero matches for `innerHTML`, `bypassSecurityTrust`, and `DomSanitizer`. No raw HTML injection surface.

### 1b. Angular interpolations `{{ }}`
**VERIFIED: Safe — all interpolated values are module-level constants.**
The following `{{ }}` bindings exist in the template:

- `{{ chip }}` — iterates `heroProofChips`, which is a hardcoded `string[]` defined in the component TS: `['Structured profiles', 'Video answers', 'Employer dashboard', 'Application tracking']`. Never populated from user input or API responses.
- `{{ item.title }}` and `{{ item.description }}` — iterate `uspPillars`, `differentiators`, `jobSeekerJourney`, `employerJourney`, all hardcoded string arrays in the component TS.
- `{{ item.icon }}` — renders Unicode emoji strings (e.g. `'📄'`) defined in the `differentiators` array in TS; no user input path.
- `{{ step.title }}`, `{{ step.description }}` — same pattern as above.
- `{{ i + 1 }}` — arithmetic on the loop index, no user data.

Angular's default template binding escapes all interpolated values. No `{{ }}` binding touches user-supplied, API-supplied, or URL-parameter-derived data. All values are compile-time constants.

### 1c. `DomSanitizer.bypassSecurityTrust*`
**VERIFIED: Not used in any of the 6 changed files.** Grep returned no matches.

### 1d. Dynamic `style=""` attribute
**VERIFIED: One instance — static value.**
`<div class="preview-completeness-fill" style="width: 82%"></div>` (HTML line 233)
This is a hardcoded literal `"width: 82%"` in the template source. It is NOT a property binding (`[style.width]`), NOT derived from any variable, NOT user-controllable. It is the same as any other hardcoded CSS value. No XSS risk.

### 1e. Dynamic `[id]` and `[attr.aria-labelledby]` bindings
The template uses:
```html
[id]="'panel-' + activePreviewTab"
[attr.aria-labelledby]="'tab-' + activePreviewTab"
```
`activePreviewTab` is initialized to `'seeker'` (string literal) and updated only via `setPreviewTab(tab: string)`, which is called from `(click)` handlers on hardcoded `<button>` elements that pass the string literals `'seeker'`, `'employer'`, `'tracking'`, `'video'`, `'signals'`. These are not user-typed inputs. Angular escapes attribute values. No XSS risk.

### 1f. `[src]` attribute on images
```html
<img [src]="item.icon" ...>
```
`item.icon` iterates `uspPillars`, where each `icon` is a hardcoded local asset path string (e.g. `'/assets/brand/gethired-wow/candidate-profile-card.svg'`). Angular's `[src]` binding is safe for local paths (no javascript: protocol, no data: URI). No XSS risk.

---

## 2. Fake / Manipulated Data Risks

### 2a. Mock card data
**VERIFIED: Safe.**
All mock data visible in the Product Preview section is hardcoded directly in the HTML template:
- "Maria D." — initials "MD" in CSS avatar, name as literal string
- "Juan P." — literal string in the video mock (`preview-video-meta`)
- "ABC Company", "XYZ Corp", "Sunrise BPO" — literal strings in tracking mock
- "12 applicants", "8 applicants", "3 new" — literal strings in employer dashboard mock
- "2 min 14 sec" — literal string in video mock

None of these are fetched from an API, stored in a database, or derived from user input. The section is explicitly labeled "Illustrative view of key features." in the template subtitle and carries an HTML comment: `<!-- PRODUCT PREVIEW SECTION — tabbed CSS-only mockups; all data is illustrative only, no real user data, no fake testimonials. -->`. These are purely illustrative wireframe numbers, not claims.

### 2b. `heroProofChips` array
**VERIFIED: Safe.**
```typescript
heroProofChips = [
  'Structured profiles',
  'Video answers',
  'Employer dashboard',
  'Application tracking',
];
```
Four static feature label strings. No user input. No counts. No promises of outcomes. Accurately describe features that exist in the platform.

### 2c. `activePreviewTab` state
**VERIFIED: Safe.**
String field initialized to `'seeker'`. Updated only by `setPreviewTab()` called from button click handlers with literal string arguments. No user-typed input path. No security surface.

---

## 3. Claims / Misinformation Risk

### 3a. AI claims
**VERIFIED: None in changed files.**
The compatibility signals section explicitly states: "Signals support decisions — they never replace them." and "guidance · not automatic · human review". No AI claims, no automated screening claims, no emotion analysis claims.

### 3b. Fake counts or fake employer logos
**VERIFIED: None.**
No hardcoded user counts, applicant counts, or success metrics are presented as real platform data. No employer logos are used. The TalentProofBadge component is used for the "500K" claim context — it is delegated to the existing `app-talent-proof-badge` component with `variant="pill"` and `variant="strip"` and `placement` metadata. This was already audited in prior SECURE passes; this deployment adds no new claims.

### 3c. Compatibility signals described as guidance only
**VERIFIED: Accurate.**
Multiple sections reinforce this explicitly:
- USP pillar: "Compatibility signals are guidance, not automatic decisions -- they help teams understand fit without hiding decisions."
- Preview panel: "Signals support decisions — they never replace them."
- Trust & Safety section: "Compatibility signals support review — they never auto-screen, auto-rank, or replace people in the hiring process."
- Video answers trust card: "When employers review video answers, real hiring team members watch them. No automated decisions from video content."

These are correctly qualified and not overstated.

---

## 4. Privacy Risks

### 4a. Analytics payloads — no PII
**VERIFIED: No PII.**
New analytics methods added in `public-portal-analytics.service.ts`:

| Method | Payload |
|--------|---------|
| `trackProductPreviewSectionViewed(page)` | `{ page: 'home' }` |
| `trackProductPreviewTabClicked(tab, page)` | `{ tab: 'seeker'/'employer'/etc, page: 'home' }` |
| `trackTrustSafetySectionViewed(page)` | `{ page: 'home' }` |
| `trackEmployerConversionBandViewed(page)` | `{ page: 'home' }` |
| `trackHeroCTAClicked(cta, page)` | `{ cta: 'find_jobs'/'start_hiring', page: 'home' }` |
| `trackFinalCTAClicked(cta, page)` | `{ cta: 'find_jobs'/'start_hiring', page: 'home' }` |

All payloads contain page/section/tab/CTA metadata only. No user identifiers, no email, no name, no job IDs. The service itself has zero HTTP calls — it console.debug's in non-prod and is a no-op in prod (the `track()` method body is intentionally empty pending a real provider). Confirmed by reading lines 16-22 of the service: the real provider integration point is an empty stub.

### 4b. Mock data — not real user data
**VERIFIED: Cannot be mistaken for real data.**
"Maria D.", "Juan P.", "ABC Company", "XYZ Corp", "Sunrise BPO" are generic placeholder names in a clearly labeled "Illustrative view of key features" section. No profile photos, no real email addresses, no real phone numbers, no job IDs. These are CSS wireframe elements.

### 4c. No real user data fetched
**VERIFIED: No HTTP calls in changed files.**
The component TS imports no `HttpClient`, makes no service calls that return Observables or Promises with user data. `ngOnInit` only calls `seoService.setPageMeta()`, `seoService.setOrganizationJsonLd()`, `seoService.setWebsiteJsonLd()`, and the auth role check via `coreService` (for redirect purposes only — no PII written to analytics). No new data fetching whatsoever.

---

## 5. Authentication / Authorization

### 5a. New protected routes
**VERIFIED: None added.**
The component adds no new `canActivate` guards, no new route declarations. No new protected paths.

### 5b. New API endpoints called
**VERIFIED: None.**
No HTTP service calls are made in any of the 6 changed files.

### 5c. `ngOnInit` auth redirect logic
**VERIFIED: Unchanged in behavior.**
The auth redirect block (lines 97-105 of component TS) is present in the prior version and unchanged:
```typescript
if (this.coreService.isLoggedIn()) {
  this.coreService.getRole().then((role: string) => {
    switch (role) {
      case '1': this.router.navigateByUrl('/admin'); break;
      case '2': this.router.navigateByUrl('/recruiter'); break;
      case '3': this.router.navigateByUrl('/user'); break;
    }
  });
}
```
Authenticated users continue to be redirected to their respective dashboards. The new homepage sections are never shown to logged-in users (they are redirected before the DOM is visible). This is correctly noted in the component's JSDoc comment: "Redirect-if-logged-in... is handled here in ngOnInit."

---

## 6. Supply Chain

### 6a. New npm packages
**VERIFIED: None added.**
`package.json` was read directly. No entries under `dependencies` or `devDependencies` correspond to this deployment. The `PortalRevealDirective` imports only `@angular/core` (`Directive`, `ElementRef`, `EventEmitter`, `Inject`, `OnDestroy`, `OnInit`, `Output`, `PLATFORM_ID`) and `@angular/common` (`isPlatformBrowser`) — both already present in the project.

### 6b. PortalRevealDirective dependency surface
**VERIFIED: Minimal and safe.**
The directive uses:
- `IntersectionObserver` (native browser API, no polyfill added)
- `ElementRef.nativeElement.classList.add()` — DOM classList manipulation only, no innerHTML, no event handler injection
- `EventEmitter<void>` — emits void, no data payload that could carry PII or attacker-controlled values
- SSR fallback: adds `is-revealed` class immediately when `isPlatformBrowser` returns false or `IntersectionObserver` is undefined — safe fallback
- `ngOnDestroy` disconnects the observer — no memory leak

---

## 7. CSP / Content Security

### 7a. `backdrop-filter: blur(4px)` on hero chips
**VERIFIED: CSS only.**
`.portal-hero-chip` uses `backdrop-filter: blur(4px)` (SCSS line 570). This is a purely cosmetic CSS property. No script execution, no network request. Safe.

### 7b. Inline `<script>` tags in template
**VERIFIED: None.**
Full template read — zero `<script>` tags. Angular's template compiler rejects inline scripts by design, and none are present regardless.

### 7c. External image URLs
**VERIFIED: All images are local assets.**
All `<img src="...">` and `[src]="..."` values in the changed HTML resolve to `/assets/...` paths:
- `/assets/brand/gethired-wow/portal-gradient-mesh.svg`
- `/assets/brand/gethired-wow/gethired-connection-bridge.svg`
- `/assets/brand/gethired-wow/match-signal-rings.svg`
- `/assets/images/placeholder/icons/card-applicant-icon.png` (via `app-role-card` component, not new)
- `/assets/images/placeholder/icons/card-interview-icon.png` (via `app-role-card` component, not new)

No external CDN URLs, no `http://` or `https://` external image sources in any new HTML.

### 7d. No `<iframe>` or `<object>` tags
**VERIFIED: None** in the changed template.

---

## 8. Observations (Non-Security, FYI Only)

These are not security issues. Noted for completeness:

- The `setPreviewTab(tab: string)` method accepts an unconstrained `string` parameter. In practice this is only ever called with the five literal strings from button click handlers in the template. A TypeScript union type (`'seeker' | 'employer' | 'tracking' | 'video' | 'signals'`) would make this more self-documenting, but there is no runtime security implication since Angular escapes all attribute values and the string only affects CSS class toggling and `*ngIf` comparisons.

- `shared.module.ts` contains duplicate entries in `classesToInclude`: `TabSelectorsComponent` appears twice (lines 56 and 63) and `DropdownSearchComponent` appears twice (lines 71 and 75), and `EmptySectionComponent` appears twice (lines 58 and 72). These preexist this deployment and have no security relevance.

---

## Summary

This deployment adds a public marketing page with static content. All new code was verified by direct file read. No XSS vectors, no PII leakage, no fake claims, no new API calls, no new dependencies, no new auth surfaces, no external resources. The IntersectionObserver directive is SSR-safe and uses no unsafe DOM APIs. The analytics service sends only section/tab/page metadata with no user identifiers. The auth redirect is preserved intact.

**Risk classification: LOW — public static marketing content, no attack surface expansion.**
