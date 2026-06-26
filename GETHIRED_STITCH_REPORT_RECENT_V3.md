# GETHIRED STITCH REPORT — Recent Deployment (homepage V2)
**Scope:** commit e817e2e — 6 FE files, no BE/API changes
**Date:** 2026-06-26
**Methodology:** all 6 files read in full before any finding written

---

## 1. PortalRevealDirective Integration Seams

### SharedModule declaration + export
VERIFIED CORRECT. `PortalRevealDirective` is imported at line 47 of `shared.module.ts`, added to the `declarations` array at line 102 (alongside the existing `ViewedOnceDirective`), and added to the `exports` array at line 106. The directive is therefore available to every NgModule that imports `SharedModule`.

### SSR platform guard (isPlatformBrowser)
VERIFIED CORRECT. `ngOnInit` opens with:

    if (!isPlatformBrowser(this.platformId) || typeof IntersectionObserver === 'undefined') {
      this.el.nativeElement.classList.add('is-revealed');
      return;
    }

On the server (SSR), `isPlatformBrowser` returns false, the early return fires immediately, `is-revealed` is added to the host element, and content is never permanently hidden. This is a strictly better fallback than the older `ViewedOnceDirective`, which simply never emits on SSR (no fallback class added). `@Inject(PLATFORM_ID)` is injected correctly via the constructor — the required Angular pattern for SSR-safe directives.

### IntersectionObserver typeof guard
VERIFIED CORRECT. The `typeof IntersectionObserver === 'undefined'` guard is present and checked before `new IntersectionObserver(...)` is ever called. The fallback (`is-revealed` added immediately) ensures content is always visible in unsupporting browsers.

### Observer disconnect in ngOnDestroy
VERIFIED CORRECT. `ngOnDestroy` calls `this.observer.disconnect()` and sets `this.observer = null`. The observer also self-disconnects inside the callback on first intersection. `ngOnDestroy` is a safe double-guard (checks `if (this.observer)` before disconnecting). No memory leak path exists.

### EventEmitter teardown
VERIFIED CORRECT. `EventEmitter` is consumed via Angular's `(revealed)` template binding only. No manual `.subscribe()` exists anywhere; Angular manages teardown. No action needed.

### Angular 13 incompatibilities
NONE FOUND. All APIs used (`@Directive`, `ElementRef`, `EventEmitter`, `@Output`, `OnInit`, `OnDestroy`, `@Inject`, `PLATFORM_ID`, `isPlatformBrowser`) are stable since Angular 8+. No Angular 14+ features (standalone, `inject()` function, etc.) used. Fully compatible with Angular 13.

---

## 2. MainPortalComponent Integration Seams

### [appPortalReveal] applied correctly on host sections
VERIFIED CORRECT. Applied to three `<section>` elements:
- `.portal-product-preview.portal-reveal-section` (line 171)
- `.portal-trust-safety.portal-reveal-section` (line 372)
- `.portal-employer-band.portal-reveal-section` (line 404)

In all three cases the directive is on the `<section>` tag itself — the same element that carries the `portal-reveal-section` class. The SCSS `.portal-reveal-section.is-revealed` rule targets that same element. Host element / CSS target alignment is correct.

### (revealed) output wired to correct analytics methods
VERIFIED CORRECT:
- Product preview: `(revealed)="onProductPreviewViewed()"` → `trackProductPreviewSectionViewed('home')`
- Trust section: `(revealed)="onTrustSectionViewed()"` → `trackTrustSafetySectionViewed('home')`
- Employer band: `(revealed)="onEmployerBandViewed()"` → `trackEmployerConversionBandViewed('home')`

All three analytics methods exist in `PublicPortalAnalyticsService`. No cross-wiring.

### [attr.aria-selected] — ARIA string output
VERIFIED CORRECT. Binding is `[attr.aria-selected]="activePreviewTab === 'seeker'"`. Angular's `[attr.*]` binding serializes a JS boolean to the DOM string `"true"` or `"false"`. ARIA 1.1 requires these as strings. All 5 tab buttons use this pattern. PASS.

### [id]="'panel-' + activePreviewTab" dynamic update
VERIFIED CORRECT. The single tabpanel `<div>` updates its `id` on every `setPreviewTab()` call, and `aria-labelledby` updates in sync. Each tab button has a static `aria-controls` pointing to its own panel id (e.g. `aria-controls="panel-seeker"`). Since only one `ng-container` panel is rendered at a time via `*ngIf`, the active tab's `aria-controls` always matches the live panel's `id`. Single-roving-panel-with-dynamic-id is a valid ARIA tablist pattern. No bug.

### setPreviewTab() — fires on every click including same-tab re-click
VERIFIED CORRECT. No `if (tab !== this.activePreviewTab)` guard is present. Analytics fires unconditionally. PASS.

### heroProofChips ngFor — trackBy
4 static items, never async-updated. No `trackBy` needed. PASS.

### TalentProofBadge — variant="strip" and placement="employer_portal_hero"
VERIFIED CORRECT. `TalentProofBadgeComponent` declares:

    @Input() variant: 'pill' | 'card' | 'strip' = 'pill';
    @Input() placement: string = 'unspecified';

`variant="strip"` is a valid enum value. `placement="employer_portal_hero"` is a valid free-form string. The employer band usage `<app-talent-proof-badge variant="strip" placement="employer_portal_hero">` is correct. The badge calls `getDisplayCopy('long')` for strip variant — verified in the component source. PASS.

---

## 3. Analytics Service Integration Seams

### 6 new methods follow existing pattern
VERIFIED. All 6 new methods under the `// HOME V2` comment delegate to `private track()` with an event string and metadata payload. Pattern matches every prior method in the file. PASS.

### No PII in any payload
VERIFIED CLEAN. All payloads are: `{ page: 'home' }`, `{ tab: <string>, page: 'home' }`, `{ cta: 'find_jobs'|'start_hiring', page: 'home' }`. No user identifiers, input text, scores, or session data. PASS.

### trackProductPreviewTabClicked — tab strings match template
VERIFIED. The 5 possible values passed to `setPreviewTab()` are `'seeker'`, `'employer'`, `'tracking'`, `'video'`, `'signals'`. These match the `activePreviewTab` comparisons in all `*ngIf` expressions and the `aria-controls` suffixes. No string constant mismatch.

### trackHeroCTAClicked and trackFinalCTAClicked — not yet wired
OBSERVATION (not a bug). Both methods are defined but not called from the component — hero CTA buttons route via `goToJobs()` / `goToEmployerPortal()` without analytics. Prepared methods for future wiring. No dead-call risk; the service is tree-shaken at call-site level.

---

## 4. SharedModule Consumer Safety

`PortalRevealDirective` exported from `SharedModule` introduces zero passive risk to existing consumers. The directive does nothing unless `[appPortalReveal]` is explicitly placed on a template element. No existing component is affected. PASS.

Pre-existing: `classesToInclude` array has duplicate entries for `TabSelectorsComponent`, `EmptySectionComponent`, and `DropdownSearchComponent`. These predate this deployment; Angular deduplicates them at compile time. Not introduced by this PR.

---

## 5. Contract Seams

### No new HTTP calls
VERIFIED. `PublicPortalAnalyticsService` has no `HttpClient` usage — it is a `console.debug` wrapper. `MainPortalComponent` makes no new HTTP calls. Gate A confirmed clean.

---

## Summary

| # | Severity | Finding |
|---|----------|---------|
| 1 | INFO | `trackHeroCTAClicked`/`trackFinalCTAClicked` defined but not wired to buttons — intentional, not a bug |
| 2 | INFO | Pre-existing duplicate entries in `classesToInclude` in shared.module.ts — predates this PR |
| — | PASS | All other integration seams verified clean — no bugs found |
