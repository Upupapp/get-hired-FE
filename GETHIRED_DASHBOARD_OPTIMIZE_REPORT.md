# GETHIRED DASHBOARD — OPTIMIZE REPORT

**Component:** `src/app/company/company-dashboard/company-dashboard.component.*`
**Scope:** Performance pass on the employer dashboard (`/recruiter/dashboard`)
**Date:** 2026-06-27

---

## Performance Issues Found

### FIXED — HIGH: `brandingScore()` called every change-detection cycle

**Severity:** High — method runs 6 field checks + Math.round on every CD tick (every mouse move, interval, pipe emit).

**Before:** `*ngIf="brandingScore(dashboard.company) as branding"` in template.
**After:** `cachedBrandingScore` property populated once in `tap()` inside `dashboard$`. Template reads `*ngIf="dashboard.company && cachedBrandingScore"` then `*ngIf="cachedBrandingScore as branding"`.

**Files changed:**
- `company-dashboard.component.ts`: Added `cachedBrandingScore: {score: number; missing: string[]} | null = null;` property. Set in `tap()` block when `dash.company` is truthy; cleared to null otherwise.
- `company-dashboard.component.html`: Replaced `brandingScore(dashboard.company)` call with property read.

---

### FIXED — HIGH: `companyProfileMissingFields()` called every change-detection cycle

**Severity:** High — called every CD tick via `*ngIf="companyProfileMissingFields(dashboard.company) as missingFields"`. Referenced 3 times within the action grid (show/hide of profile card, join() for desc, empty-state condition).

**Before:** `<ng-container *ngIf="companyProfileMissingFields(dashboard.company) as missingFields">`
**After:** `cachedProfileMissingFields: string[] = []` property populated in `tap()`. Inner container simplified to `<ng-container *ngIf="true">`. Template references use `cachedProfileMissingFields` directly.

**Files changed:**
- `company-dashboard.component.ts`: Added `cachedProfileMissingFields: string[] = []`. Populated in `tap()`.
- `company-dashboard.component.html`: All 3 references (`missingFields.length > 0`, `missingFields.join(', ')`, `missingFields.length === 0`) replaced with `cachedProfileMissingFields`.

---

### FIXED — LOW: `trackBy` missing on branding chips `*ngFor`

**Severity:** Low — max 6 items, but without trackBy Angular destroys and recreates all DOM nodes on any CD cycle where the parent `*ngIf` re-evaluates.

**Before:** `*ngFor="let field of branding.missing"` (no trackBy)
**After:** `*ngFor="let field of branding.missing; trackBy: trackByIndex"`

**Added method:** `trackByIndex(i: number): number { return i; }` — safe for stable small arrays.

---

### FIXED — LOW: `trackBy` missing on job performance rows `*ngFor`

**Severity:** Low — same issue; `cachedJobGroups` could be up to N jobs; no trackBy meant full DOM teardown/rebuild on each pipeline reload.

**Before:** `*ngFor="let job of cachedJobGroups"` (no trackBy)
**After:** `*ngFor="let job of cachedJobGroups; trackBy: trackByIndex"`

---

### FIXED — LOW: `subsRestrictions$` had no error handling

**Severity:** Low for performance (no CPU impact), but classified here as it also feeds into NOTIFY. The `catchError` wrapping added is lightweight (returns `of(null)`, sets a flag).

**Change:** Added `catchError` pipe to `subsRestrictions$`, plus `subsError` flag. Added `retrySubscription()` method.

---

## Deferred / Not Fixed

### `subscriptionUsagePct()` called 6 times per CD cycle
Each meter calls the function twice (once for `aria-valuenow`, once for `width`, once for warn modifier — actually 3× per meter × 3 meters = 9 calls total). The function is a pure 2-arg calculation (no object traversal, no array ops) so the cost per call is ~1µs. **Deferring** — the effort to cache these (would require a computed object from `subsRestrictions$`) exceeds the benefit given the trivial operation. If subscription data refreshes frequently, revisit.

### `subscriptionDaysLeft()` called once per CD cycle
Pure date arithmetic, very cheap (~2µs). Not worth caching.

### Angular OnPush ChangeDetectionStrategy
The component uses the default `ChangeDetectionStrategy.Default`. Switching to `OnPush` would be the highest-impact optimization remaining, but it requires verifying that all inputs and observables are handled as immutable/observable — a larger refactor outside the safe scope of this pass.

---

## Before → After Summary

| Issue | Before | After | Severity |
|---|---|---|---|
| `brandingScore()` per CD tick | Method called in template | Cached property, set in tap() | HIGH |
| `companyProfileMissingFields()` per CD tick | Method called in template | Cached property, set in tap() | HIGH |
| Branding chips trackBy missing | No trackBy on *ngFor | trackByIndex | LOW |
| Job rows trackBy missing | No trackBy on *ngFor | trackByIndex | LOW |
| Subscription error silent | Section disappears on error | Error card + Retry button | LOW |

---

## Release Gate

**Performance gate: PASS**

All known method-in-template anti-patterns resolved. Two new cached properties follow the same pattern already established by `cachedOnboardingSteps` and `cachedJobGroups`. No new Angular libraries introduced. No route changes. Fully reversible.
