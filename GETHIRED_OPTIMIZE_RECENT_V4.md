# GETHIRED OPTIMIZE — Recent Deployment Audit V4
**Date:** 2026-06-26
**Scope:** 4 commits (d3246b6, 70bc592, 172b2a9, f9bc996) — 7 files
**Auditor:** Claude Code OPTIMIZE pass

---

## Summary of Fixes Applied

| # | File | Finding | Action |
|---|------|---------|--------|
| 1 | `job-applicants.component.ts` | `console.log(event)` left in `viewMenu()` | REMOVED |
| 2 | `applicant-action-modal.component.html` | `*ngFor="let s of statusOptions"` missing `trackBy` | ADDED `trackBy: trackById` |
| 3 | `applicant-action-modal.component.html` | `*ngFor="let menu of tableControls"` missing `trackBy` | ADDED `trackBy: trackById` |
| 4 | `applicant-action-modal.component.ts` | `trackById` method needed by fixes 2 & 3 | ADDED |

---

## Per-File Findings

---

### 1. `applicant-action-modal.component.ts`

**Memory leaks / subscriptions:**
The `subscribe()` call on `updateApplicationStatus` (line 104) has no `takeUntil` or `take(1)`. However, this is called on a dialog component — dialogs are destroyed when closed, and the service is an HTTP `PUT` that completes on its own (one-shot Observable). The subscription will complete and clean itself up before the user can interact with anything else. NOT a practical leak. No change needed.

**`statusUpdating` flag:**
Set to `true` before the HTTP call (line 103), cleared to `false` in both success (line 106) and error (line 111) paths. The template uses `[disabled]="statusUpdating"` to prevent double-submit. Guard is correctly wired.

**Double-submit edge case (no fix needed — noted):**
The same-status early-return at line 98-101 closes the dialog with `null` before calling the API — correct. The applicationId guard at line 93-96 returns early and shows a snackbar — correct.

**Unused imports:**
All 5 imports are used. No dead imports.

**`ngOnInit`:**
Empty (`ngOnInit(): void {}`). Implement `OnInit` is declared but the interface is satisfied by the empty method — Angular requires it be present. No action needed; empty lifecycle hooks are idiomatic Angular.

**Fix applied:** Added `trackById(_index, item) { return item.id; }` to support the template `trackBy` references.

---

### 2. `applicant-action-modal.component.html`

**`*ngFor` missing `trackBy`:**
- Line 29: `*ngFor="let s of statusOptions"` — no `trackBy`. `statusOptions` is a module-level constant (never mutated), but Angular still re-renders on every CD pass without `trackBy`. Fixed.
- Line 40: `*ngFor="let menu of tableControls"` — no `trackBy`. Same issue. Fixed.

**Images:**
- Line 3 (close icon, `remove-gray.png`): The linter wrapped this in a `<button>` with `aria-label="Close"` and added `aria-hidden="true"` to the inner image. That is correct. The icon itself is UI chrome, above-fold, and tiny — `loading="lazy"` is not appropriate here.
- Line 8 (`[src]="data?.data?.photoUrl"`): Dynamic avatar image. No `width`/`height` because the dimensions depend on CSS class `img-avatar`. No `loading="lazy"` needed — this is the first visible element in the modal, above-fold within the dialog. No change needed.
- Menu icon images (`menu.icon`) are loaded from icon paths — they are small above-fold icons in a dialog, not below-fold content images. `loading="lazy"` not appropriate.

**Accessibility note (not a safe-fix change):**
The menu action items in the `*ngFor` row are `<div>` elements with an `(click)` handler but no `role`, no `tabindex`, and no keyboard handler. These are not interactive for keyboard or screen reader users. **This is a backlog item** — refactoring the menu items to `<button>` elements would require verifying the `.side-sub-menu-container` styles don't depend on being a `<div>`. Out of scope for this safe-fixes pass.

---

### 3. `job-applicants.component.ts`

**`console.log(event)` in `viewMenu()`:**
Line 247 had `console.log(event)` left in production code. Removed.

**Subscriptions / memory leaks:**

The most significant issue is on line 96:
```typescript
loading$ = this.jobFacade.getJobLoading$
  .pipe().subscribe(this.formLoading.bind(this));
```
This subscription is created as a class field initializer — it fires immediately on construction and is never stored in a variable that could be unsubscribed. The `loading$` property name is misleading (it's not an Observable after `.subscribe()` — it holds a `Subscription`). There is no `ngOnDestroy` and no `takeUntil` pattern.

**Severity:** MEDIUM. In practice the component lives for the page session — but if the user navigates away and back multiple times, and Angular's router recreates the component, each construction creates a new subscription to the global facade store Observable that never gets torn down.

**Not a safe fix for this pass** (requires adding `OnDestroy`, a `destroy$` Subject, and ensuring the `loading$` assignment is moved into `ngOnInit` with `takeUntil`). Logged below in the backlog.

**Other subscriptions:**
- `this.route.queryParams.subscribe(...)` in the constructor (line 151) — also has no unsubscribe. Same pattern. `ActivatedRoute` subscriptions do auto-complete when the router destroys the route, so this is lower risk, but it's the same code smell.
- `loadMatchSignals()` and `loadSnapshotSummary()` both use one-shot HTTP calls that complete naturally — no leak risk.
- `viewMenu()` → `openDialog.afterClosed().pipe().subscribe(...)` — `afterClosed()` completes automatically after one emission. No leak.

**`loadingDialog` vs `dialog` — two `MatDialog` instances injected:**
Lines 146 and 147 inject `MatDialog` twice as `loadingDialog` and `dialog`. Angular's DI will return the same singleton for both. This is not a bug, but it's misleading — the two could be collapsed into one. Not a safe fix (might affect `closeAll()` intent).

**`inviteApplicant()` is a TODO stub (line 217-219):**
Not a bug but worth noting — the method exists with a comment, no implementation, and no UI currently calls it. No action needed.

**`OnPush` change detection:**
This component uses `combineLatest` with facade Observables and manual `BehaviorSubject` updates. It is a good candidate for `ChangeDetectionStrategy.OnPush`, but the `formLoading` callback imperatively opens/closes dialogs (side effects that would need to be triggered differently with OnPush). Not a safe change for this pass.

---

### 4. `job.service.ts`

**No issues found.**
- No `console.log` statements.
- No subscriptions (service layer returns Observables — correct).
- No unused imports or dead methods.
- All methods are used by components in scope.
- The `_companyId?` unused parameter pattern on `getJobBasicList` and `getJobExpiredList` is intentional (the parameter is intentionally ignored per the P2-01 fix comment). The underscore prefix is idiomatic TypeScript for "kept for API compat, deliberately unused."

---

### 5. `main-portal.component.ts`

**No memory leaks:**
No subscriptions in this component. All data is synchronous (static arrays). The `coreService.isLoggedIn()` and `getRole()` call in `ngOnInit` — `getRole()` returns a Promise, not an Observable, so no subscription to manage.

**`@ViewChild('tablistRef')`:**
Used in `onTabKeydown()` to focus the next tab button — correct SSR-safe pattern (the `@ViewChild` is only accessed inside an event handler triggered by user interaction, which cannot occur server-side). No `isPlatformBrowser` guard needed here.

**`trackByIndex` is present:**
All `*ngFor` loops in the template use `trackBy: trackByIndex`. Good.

**`OnPush` opportunity:**
This component has no Observables, no subscriptions, all data is static after `ngOnInit`. It is an excellent candidate for `ChangeDetectionStrategy.OnPush`. However, child components (`app-role-card`, `app-talent-proof-badge`, etc.) would need to be verified as compatible. Logged as a low-priority backlog item.

**No `console.log`:** None found.

**Unused imports:** All 6 imports are used.

---

### 6. `main-portal.component.html`

**`trackBy` coverage:**
All six `*ngFor` loops in the template use `trackBy: trackByIndex`. Complete.

**Images:**
- Line 2: `portal-gradient-mesh.svg` — `width="400" height="300" loading="lazy" aria-hidden="true"`. Correct. Hero background image, lazy-loading is acceptable here since it's decorative.
- Line 112: `gethired-connection-bridge.svg` — `width="320" height="80" loading="lazy" aria-hidden="true"`. Correct.
- Line 115: `item.icon` in USP grid — `loading="lazy" aria-hidden="true"`. No `width`/`height` because dimensions depend on CSS class `.portal-usp-icon`. Acceptable — the USP section is below the fold and the images are decorative with `aria-hidden`.
- Line 355: `match-signal-rings.svg` in signals preview panel — `width="96" height="96" loading="lazy" aria-hidden="true"`. Correct.
- Role card icons (lines 81, 93): Passed as `[icon]` attribute to `app-role-card` child component — how those are rendered is controlled by the `RoleCardComponent` template, not in scope here.

**ARIA / a11y:**
The ARIA tablist pattern (lines 180-212) is well implemented:
- `role="tablist"` on the container.
- `role="tab"`, `[attr.aria-selected]`, `[attr.tabindex]` on each tab button.
- `aria-controls` pointing to the panel id.
- `[id]="'panel-' + activePreviewTab"` and `[attr.aria-labelledby]` on the panel.
- Keyboard navigation (`ArrowLeft`/`ArrowRight`/`Home`/`End`) implemented in `onTabKeydown`.
This is a complete ARIA tab pattern. No issues found.

**Role-card secondary buttons:**
Lines 85 and 97 have a "Browse jobs"/"Start hiring" `<button>` below each role card with `class="btn-link-cta"`. These are visually de-emphasized secondary actions. No a11y issues — they are `type="button"`, have descriptive text content, and have click handlers.

---

### 7. `main-portal.component.scss`

**`prefers-reduced-motion` coverage:**
Two animation systems exist:

1. **Hero reveal animation** (lines 136-139, 197-200):
   `.portal-hero-copy` and `.portal-hero-visual` have `animation: portal-hero-reveal 280ms ...` with `opacity: 0; transform: translateY(10px)` as starting state.
   Covered at lines 472-479 — both elements get `animation: none; opacity: 1; transform: none` under `prefers-reduced-motion: reduce`. COMPLETE.

2. **Scroll reveal transitions** (lines 483-499):
   `.portal-reveal-section` has `transition: opacity 500ms ..., transform 500ms ...` on the base class, and an `is-revealed` state.
   Covered at lines 494-498 — `opacity: 1; transform: none; transition: none` under `prefers-reduced-motion: reduce`. COMPLETE.

3. **Tab button transitions** (line 576):
   `.portal-preview-tab` has `transition: border-color 150ms ease, color 150ms ease, background 150ms ease, box-shadow 150ms ease, transform 80ms ease` with an `:active { transform: scale(0.96) }` micro-interaction.
   **NOT covered** by the existing `prefers-reduced-motion` blocks. The existing blocks only target `.portal-hero-copy`, `.portal-hero-visual`, and `.portal-reveal-section`. The tab button transitions and scale transform are missing reduced-motion coverage.
   **Fix applied** — see below.

**Dead rules:**
`.portal-role-proof` (lines 38-41) — `.portal-role-proof` class selector exists in the SCSS but no element in the template uses `class="portal-role-proof"`. The template has `.portal-trust-strip` for the trust strip section, and `.portal-hero-proof` for the hero section. This class is unused dead CSS.
**Not a safe remove** — `portal-role-proof` could be used in a child component template (e.g., `app-role-card`) or by a dynamic binding. Logged as a backlog cleanup.

**Duplicate declarations:** None found.

**Overly specific selectors:**
`portal-preview-panel` grid uses direct `grid-template-columns: 1fr 1fr` at root and then `1fr` in a media query — straightforward, not overly specific.
SCSS nesting (e.g., `.portal-journey-step h3 { }`) is acceptable specificity.

---

## SCSS Fix Applied: Tab Button Reduced Motion

Added to `main-portal.component.scss` inside the existing `@media (prefers-reduced-motion: reduce)` block at line 472:

```scss
@media (prefers-reduced-motion: reduce) {
  .portal-hero-copy,
  .portal-hero-visual {
    animation: none;
    opacity: 1;
    transform: none;
  }

  /* NEW: disable tab button scale + transition under reduced motion */
  .portal-preview-tab {
    transition: none;
    &:active { transform: none; }
  }
}
```

---

## Deferred Backlog (not safe to fix in this pass)

| Priority | File | Issue |
|----------|------|-------|
| MEDIUM | `job-applicants.component.ts` | `loading$` field subscription never unsubscribed — add `OnDestroy` + `takeUntil(destroy$)` pattern |
| MEDIUM | `job-applicants.component.ts` | `queryParams.subscribe()` in constructor — same `takeUntil` pattern should be applied |
| LOW | `applicant-action-modal.component.html` | Menu action `<div>` items have `(click)` but no `role="button"`, `tabindex="0"`, or `keydown` handler — keyboard/a11y gap |
| LOW | `main-portal.component.ts` | Add `ChangeDetectionStrategy.OnPush` (no Observables, all static after init) — verify child component compatibility first |
| LOW | `main-portal.component.scss` | `.portal-role-proof` class is defined in SCSS but not used in the template — dead rule, safe to remove after confirming child component templates don't use it |

---

## Performance / A11y Impact Summary

**Performance:**
- `trackBy` added to both `*ngFor` loops in the action modal prevents Angular from destroying and recreating DOM nodes on every change detection pass (e.g., when `statusUpdating` flips). Direct impact on modal responsiveness during the status update flow.
- All USP grid, bento grid, journey step, and hero chip lists in `main-portal` already had `trackBy`. No gaps found.
- `loading="lazy"` correctly applied to all below-fold images in `main-portal`. No gaps.
- No CLS risk found: images with known dimensions have explicit `width`/`height`. Dynamic images (avatars) are sized by CSS class.

**Accessibility:**
- `prefers-reduced-motion` now covers the tab button `:active` scale transform — users who have reduced motion enabled will no longer see the 80ms scale-down micro-interaction on tab presses.
- The linter's auto-fix on the close button (wrapping the bare `<img>` in a `<button>` with `aria-label="Close"`) corrected a click target that was previously an image element with no accessible role or label.

**Console noise:**
- `console.log(event)` removed from `viewMenu()` — no longer leaks application data (applicant event payload) to the browser console in production.

---

## Release Gate

**GO WITH CAUTION**

All fixes are small, targeted, and reversible. No business logic, API contracts, or routes were changed.

Cautions to verify before deploy:
1. The `loadingDialog` subscription on `loading$` (class field initializer with no unsubscribe) has existed in prior commits — this is pre-existing tech debt, not introduced by this deployment. It will not regress anything new.
2. The `trackBy: trackById` references in the action modal template require the `trackById` method to be present on the component class. Confirm the method is present in the build (it was added in this pass).
3. The `prefers-reduced-motion` SCSS addition is additive only — it disables the tab transition and scale for users who have that OS setting enabled. No visual regression for other users.
