# GETHIRED STITCH RELEASE GATE — Recent Deployment (homepage V2)
**Scope:** commit e817e2e — 6 FE files, no BE/API changes
**Date:** 2026-06-26

---

## Gate A: Contract Compatibility
**PASS**
No new HTTP calls in any of the 6 changed files. `PublicPortalAnalyticsService` has no `HttpClient` usage. No API contracts changed. No BE changes. Zero contract risk.

---

## Gate B: Auth / Authorization Safety
**PASS**
No auth changes. The redirect-if-logged-in logic in `MainPortalComponent.ngOnInit()` is unchanged — it reads `coreService.isLoggedIn()` and routes by role exactly as before. No new routes, guards, or permission checks added or removed.

---

## Gate C: SharedModule Safety
**PASS**
`PortalRevealDirective` was correctly added to both `declarations` and `exports` in `SharedModule`. The directive has no passive effect on existing consumers — it requires explicit `[appPortalReveal]` attribute placement to do anything. No existing component is at risk. Pre-existing duplicate entries in `classesToInclude` are benign and predate this PR.

---

## Gate D: Component Integration Correctness
**PASS**
- `[appPortalReveal]` is applied on the correct host `<section>` elements (same elements that carry `portal-reveal-section` class, which the SCSS targets)
- `(revealed)` outputs are wired to the correct analytics handler methods with no cross-wiring
- `[attr.aria-selected]` produces correct ARIA string values (`"true"` / `"false"`)
- `[id]="'panel-' + activePreviewTab"` correctly updates the tabpanel id on every tab switch; active tab's `aria-controls` always matches the live panel id
- `setPreviewTab()` fires analytics unconditionally on every click
- `TalentProofBadgeComponent` accepts `variant="strip"` and `placement="employer_portal_hero"` per its `@Input()` declarations

---

## Gate E: SSR Safety
**PASS**
`PortalRevealDirective` has a dual SSR guard:
1. `isPlatformBrowser(this.platformId)` — false on the server, directive falls through to the safe path
2. `typeof IntersectionObserver === 'undefined'` — catches browsers without support

On either condition, `is-revealed` is added immediately to the host element so content is never permanently invisible. This is the correct SSR-safe fallback pattern. `@Inject(PLATFORM_ID)` is injected via the constructor as Angular requires.

The older `ViewedOnceDirective` (used on the USP section) lacks a `PLATFORM_ID` guard — it only guards with `typeof IntersectionObserver === 'undefined'` and never emits on SSR. This is a pre-existing gap in the older directive, not introduced by this PR. `PortalRevealDirective` is actually safer than its predecessor.

---

## Gate F: Analytics Integration
**PASS**
- 6 new analytics methods follow the existing no-op-safe pattern (console.debug in non-prod, placeholder for future provider)
- All payloads are metadata-only: `page`, `tab`, `cta` strings — no user PII, no scores, no identifiers
- `trackProductPreviewTabClicked` receives the correct tab string values from `setPreviewTab()`
- `trackHeroCTAClicked` and `trackFinalCTAClicked` are defined but not yet wired — deferred, not a release blocker

---

## Overall Verdict

**GO**

All 6 gates pass. No integration bugs found. The homepage V2 deployment is correctly integrated across the directive, shared module, component, SCSS, and analytics layers. The two observations (unwired analytics methods, pre-existing SharedModule duplicates) are non-blocking and do not affect production behavior.

**Deferred items (not blockers):**
1. Wire `trackHeroCTAClicked` to hero CTA buttons (`Find jobs`, `Start hiring`) when analytics wiring is prioritized
2. Wire `trackFinalCTAClicked` to the final CTA band buttons
3. (Pre-existing) Clean up duplicate entries in `classesToInclude` in `shared.module.ts`
