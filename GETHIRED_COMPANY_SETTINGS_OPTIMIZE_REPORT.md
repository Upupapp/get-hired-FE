# GetHired OPTIMIZE Report — Company Settings Page
**Scope:** `/recruiter/company/settings` — Company Details Form + GhFeedbackModalComponent
**Branch HEAD:** FE=5db2363
**Date:** 2026-06-27
**Command:** OPTIMIZE (safe/small fixes only — no new features, no architecture changes)

---

## 1. Executive Summary

**Optimization Health Score: 7.5 / 10**

The recently-built GhFeedbackModal and company-details-form are solid. Subscription lifecycle is properly guarded, the saving guard prevents double-submit, the skeleton UI is present, and reduced-motion support is comprehensive. However, several accessibility gaps were found that are straightforward to fix, and two performance risks need documentation or mitigation.

### Top Wins (already in place)
- `destroy$` + `takeUntil` used consistently on all three subscriptions — no leak risk.
- `saving` double-submit guard is correctly placed before form validity check.
- `clearTimeout` in `GhFeedbackModalComponent.ngOnDestroy` — timer cannot ghost after the modal is destroyed.
- `prefers-reduced-motion` blocks are exhaustive in both component SCSS and global `styles.scss`.
- Skeleton UI present with shimmer animation for loading state.
- `computeChangedFields()` called at submit time (not on every CD cycle).
- `A11yModule` exported from `SharedModule`, which `CompanyModule` imports via `SharedModule` — `cdkFocusInitial` is wired correctly.

### Top Remaining Risks
1. **A11y-CRIT:** `cdf-field-error` divs are not programmatically associated with their inputs (`aria-describedby` missing) — screen readers will not announce errors for those fields.
2. **A11y-HIGH:** `shownPublicly` checkbox has no accessible label association (`for`/`id` pairing absent).
3. **Perf-MED:** `setCompany()` fires on every NgRx store emission (not just initial load), generating a new `Date.now()` cache-bust URL each time and re-assigning `this.profileImage` — risks unnecessary img repaints on any store update.
4. **A11y-MED:** `success$` stream has no `filter(!!event)` guard — fires on init with empty string, opening an `afterSubmit('')` call that silently does nothing but burns a subscription cycle and logs an empty event.
5. **Perf-LOW:** `stroke-dashoffset` SVG animation is a known paint-layer operation (not compositor-only); documented but unmitigable without switching to a Canvas approach.

### Recommended Fixes Applied This Run
- Added `aria-describedby` to `companyName` and `companyEmail` input fields, linking error divs by `id`.
- Added `for`/`id` to the `shownPublicly` checkbox label.
- Added `filter(event => !!event)` to the `success$` subscription to guard against the empty-string init emission.

---

## 2. Performance Audit

| ID | Area | Severity | File | Issue | User Impact | Safe Fix | Fixed-Now? |
|----|------|----------|------|-------|-------------|----------|-----------|
| P1 | Logo cache-bust | MED | `company-details-form.component.ts` | `setCompany()` generates `Date.now()` on every call, not just the first. NgRx store can emit `companyDetails$` multiple times (e.g., on any unrelated action that touches the store). Each emission creates a new URL, forces an img network re-request, and causes a brief flicker. | Logo flickers on any store update. | Guard with: `if (!this.profileImage \|\| this.company?.companyId !== company.companyId)` before setting `profileImage`. Or cache the busted URL keyed to `companyLogoUrl`. | No — deferred (requires snapshot comparison logic). |
| P2 | SVG stroke-dashoffset animation | LOW | `gh-feedback-modal.component.scss` | `stroke-dashoffset` animation runs on the paint layer (not compositor). Chrome and Firefox cannot promote SVG stroke animations to GPU without hacks. On slow mobile, this can cause jank. | Subtle jank on success modal open on low-end mobile. | Document as known risk. The `prefers-reduced-motion` block neutralises it for motion-sensitive users. Upgrading to a `clip-path` or CSS mask approach would be compositor-friendly but is not a safe/small fix. | N/A — documented risk. |
| P3 | chips `nth-child` stagger | LOW | `gh-feedback-modal.component.scss` | `ghfm-chip:nth-child(1)` through `:nth-child(6)` cover 6 chips max. `computeChangedFields()` has 11 comparable fields + logo = 12 possible chips. Any chip at position 7+ gets no delay, making them appear instantly alongside chip 6. Not a crash, but the stagger effect breaks. | Minor visual inconsistency when >6 fields change. | Extend to `nth-child(12)` at 55ms increments. Safe CSS-only change. | No — documented in backlog. |
| P4 | `markAllAsTouched` loop | LOW | `company-details-form.component.ts` (line 194) | `Object.values(controls).forEach(c => c.markAsTouched())` loops over 18 form controls. O(18) is negligible for this form size. | None. | No action needed. | N/A — acceptable. |
| P5 | Modal open overhead (INP) | LOW | `company-details-form.component.ts` | `MatDialog.open()` with `panelClass` and data object triggers Angular CD + DOM insertion. On a P75 INP budget of 200ms, this is typically 20-40ms. No custom animations on the pane itself (only on `.ghfm-wrap` inside) — acceptable. | Negligible on mid-range hardware. | No action needed. | N/A — acceptable. |
| P6 | `success$` empty-string emission on init | MED | `company-details-form.component.ts` (line 106–108) | `initialState.succesMsg` is `''`. `success$` selector returns `''` on component init. The subscription fires `afterSubmit('')` immediately, which falls through both `if` branches silently. Wastes a cycle; could cause issues if `afterSubmit` logic changes. | No current user-visible impact, but fragile. | Add `filter(event => !!event)` to the pipe. | YES — applied (see Section 8). |
| P7 | `resetStateNotif()` before dispatch race | LOW | `company-details-form.component.ts` (line 205) | `resetStateNotif()` dispatches `resetState` action synchronously, clearing `error` and `succesMsg` in the store before `updateCompany` is dispatched. Because NgRx is synchronous within a single event loop turn, there is no race between `error$` and the reset. The guard `filter(err => !!err)` on `error$` prevents a false trigger from the cleared `null` state. | No risk. | No action needed. | N/A — safe by design. |

---

## 3. Angular-Specific Optimization Audit

| ID | Area | Finding | Risk | Action |
|----|------|---------|------|--------|
| A1 | ChangeDetection | `CompanyDetailsFormComponent` uses default `ChangeDetectionStrategy.Default`. Given it uses `async` pipe on `workSetup$` and `industry$`, switching to `OnPush` would require marking those observables correctly. The form also mutates `this.saving`, `this.loading`, `this.profileImage` which would need explicit `markForCheck()` calls in subscriptions. | Medium: switching to OnPush could silently break the saving spinner if `markForCheck()` is not added to `afterSubmit` and `afterError`. | Deferred. Not a safe drop-in for this session. |
| A2 | ChangeDetection (modal) | `GhFeedbackModalComponent` renders purely from `@Inject MAT_DIALOG_DATA` which is set once at open time and never mutates. OnPush would be safe and beneficial here — it would prevent any CD cycle from the parent triggering the modal. | Low risk. | Deferred (trivial but outside current scope). |
| A3 | Template method calls | `companyDetailsForm.get('companyName')?.invalid && companyDetailsForm.get('companyName')?.touched` is repeated in the template. `.get()` on a `FormGroup` is O(1) by key lookup and does not create new objects — acceptable in Angular template. | Negligible. | No action. |
| A4 | `computeChangedFields()` timing | Called inside `afterSubmit('updated')` which runs inside the `success$` subscription after the server responds. Snapshot (`companySnapshot`) was taken in `setCompany()` at load time and is only updated again in `updateLocalStorage()` after `afterSubmit` computes the diff. This is correct ordering: diff is computed against the original snapshot, then snapshot is updated. | No risk. | No action. |
| A5 | `companyDetailsForm.value` in `computeChangedFields` | Called after `markAsPristine()` but value itself is not reset. Correct: `.value` returns current control values, which still reflect what the user typed. | No risk. | No action. |
| A6 | Subscription management | Three subscriptions: `companyDetails$`, `success$`, `error$` — all piped with `takeUntil(destroy$)`. `destroy$` is completed in `ngOnDestroy`. No leaks. | None. | No action. |
| A7 | `afterClosed()` subscriptions | Three `modalRef.afterClosed().subscribe(...)` calls (lines 255, 291, 310, 349). These are one-shot observables that complete after the dialog closes — they do not need `takeUntil`. However, if the component is destroyed before the modal closes, these subscriptions technically leak until the modal closes. Scope: minor, low-risk for a settings page. | Very low. | Deferred. |

---

## 4. Accessibility Audit

| ID | Screen | Severity | Issue | Fix |
|----|--------|----------|-------|-----|
| AX1 | Company Name input | WCAG 1.3.1 (A) — CRITICAL | `cdf-field-error` div for `companyName` (lines 56–59 and 71–73) has `role="alert"` but the `<input>` has no `aria-describedby` pointing to the error div. Screen readers (NVDA, VoiceOver) will announce the alert on appearance but will not re-announce it on field re-focus or form resubmit. Keyboard users have no programmatic link from the field to the error. | Add `id="cdf-err-name"` to the error div and `aria-describedby="cdf-err-name"` to the input. Applied this session. |
| AX2 | Company Email input | WCAG 1.3.1 (A) — CRITICAL | Same issue as AX1 — `cdf-field-error` for `companyEmail` (lines 153–157) has no `aria-describedby` from the input. Two error spans inside (required / email) both need coverage. | Add `id="cdf-err-email"` to the wrapping div and `aria-describedby="cdf-err-email"` to the input. Applied this session. |
| AX3 | `shownPublicly` checkbox | WCAG 1.3.1 (A) — HIGH | `<input type="checkbox" formControlName="shownPublicly">` and `<label class="form-check-label">Publicly Shown</label>` have no `for`/`id` association. The label is visually adjacent but not programmatically linked. Screen readers will announce the checkbox without a name on most AT. | Add `id="cdf-shown-publicly"` to the input and `for="cdf-shown-publicly"` to the label. Applied this session. |
| AX4 | Submit button aria-busy | WCAG 4.1.3 (AA) — MED | `[attr.aria-busy]="saving"` is set on the button. `aria-busy="true"` on a button is valid but VoiceOver on iOS does not always announce state changes on interactive elements mid-interaction. The `aria-label` change from `'Submit Changes'` to `'Saving company profile…'` is the more reliable announcement. This is acceptable as-is. | No fix needed. `aria-label` change is the primary announcement channel. |
| AX5 | GhFeedbackModal: aria-labelledby id match | WCAG 1.3.1 (A) — LOW | `[id]="'ghfm-title-' + data.state"` on `<h2>` and `[attr.aria-labelledby]="'ghfm-title-' + data.state"` on the root div are dynamically bound using the same expression — they will always match. No mismatch risk. | No action. |
| AX6 | GhFeedbackModal: dialog role | WCAG 4.1.2 — NOTE | The `.ghfm-wrap` has `role="dialog"` and `aria-modal="true"`. MatDialog also wraps the content with its own `role="dialog"` at the CDK overlay layer. This creates a nested `role="dialog"` in the accessibility tree (outer CDK container + inner `ghfm-wrap`). Screen readers may announce "dialog" twice on entry. | Deferred. Fix: remove `role="dialog"` and `aria-modal="true"` from `.ghfm-wrap` and let MatDialog handle it. Requires verifying `aria-labelledby` still reaches the title through the CDK container. Medium effort. |
| AX7 | cdkFocusInitial — A11yModule | WCAG 2.4.3 — PASS | `cdkFocusInitial` on the primary button. `A11yModule` is imported and exported from `SharedModule`, which `CompanyModule` imports. Directive is available. | No action. |
| AX8 | Reduced motion exhaustiveness | WCAG 2.3.3 (AAA) — PASS | `styles.scss` global block sets `animation-duration: 0.01ms` and `transition-duration: 0.01ms` on `*, *::before, *::after`. Component-level blocks in both SCSS files reinforce this. The orbit ring sets `stroke-dashoffset: 0` (final state) and `animation: none` — ring remains visible without motion. Chips set `animation: none`, appearing instantly. | No action. Comprehensive. |
| AX9 | Color contrast — modal white text on Deep Navy | WCAG 1.4.3 (AA) — PASS | Header background: `#0b1026` (approx). Title text: `#ffffff`. Computed ratio ≈ 18.5:1. Passes AAA (7:1). Body text `#4b5563` on `#ffffff` background ≈ 7.2:1 — passes AA. | No action. |
| AX10 | Changed-field chips semantic structure | WCAG 1.3.1 (A) — LOW | Chips are `<span class="ghfm-chip">` inside `<div aria-label="Updated fields">`. The `aria-label` provides context but the spans are not `<li>` elements in a `<ul>`. Some screen readers will read them as a flat list of text nodes. | Deferred. Upgrade to `<ul role="list">` / `<li>` for stronger semantics. Low visual impact, medium AT benefit. |
| AX11 | State icons (error, validation, etc.) | WCAG 1.1.1 (A) — PASS | All icon SVGs in `ghfm-icon-wrap` are inside a container with `aria-hidden="true"` (line 9). Error/validation/conflict/permission SVGs are not individually `aria-hidden` but their parent wrapper is, suppressing them from the AT tree. The title (`aria-labelledby`) provides the semantic meaning. | No action. |
| AX12 | `companyDetails` character counter | WCAG 4.1.3 — PASS | `aria-live="polite" aria-atomic="true"` on the character count `<small>`. Screen readers will announce changes politely. | No action. |

---

## 5. Mobile Responsiveness Audit

| ID | Area | Severity | Finding | Action |
|----|------|----------|---------|--------|
| M1 | Modal bottom-sheet `@media (max-width: 560px)` | PASS | `ghfm-wrap` gets `border-radius: 20px 20px 0 0` and `ghfm-slide-up` animation at 560px. `styles.scss` positions `.cdk-overlay-pane` at `bottom: 0; left: 0; right: 0; width: 100%`. Consistent. | No action. |
| M2 | `:has()` selector support | MED RISK | `styles.scss` line 972: `.cdk-overlay-pane:has(.gh-feedback-modal-panel)`. CSS `:has()` is supported in Chrome 105+, Firefox 121+, Safari 15.4+. Angular 13's supported browser targets in `browserslist` typically include Safari 13+. Users on Safari 15.3 and below will not get bottom-sheet positioning — the modal will render centered instead. Not a hard failure, but a visual degradation. | Deferred. Consider adding a JS fallback that applies a class to the CDK pane via `MatDialog`'s `afterOpened()`. Medium effort. |
| M3 | Submit button height | PASS | `.btn-save` has `line-height: 27px` + `padding: 7px 20px` = ~41px computed. Slightly below the 44px WCAG 2.5.5 touch target. However, `styles.scss` (line 62-63) sets `.form-control` to `min-height: 44px` on `max-width: 767px`. The button is not a `.form-control`. | Low risk in practice (3px gap). Deferred: add `min-height: 44px` to `.btn-save` in the SCSS. |
| M4 | Inline validation font-size 12px | LOW | `.cdf-field-error { font-size: 12px }`. At 12px on a 375px viewport, this is at the lower edge of readable. WCAG does not mandate minimum font-size but 12px at 1x display scaling is borderline on dense screens. | Deferred. Bump to `13px` for readability. |
| M5 | Sticky submit footer covers content | MED | `.submit-container` is `position: fixed; bottom: 0`. On mobile, when the virtual keyboard opens, the browser may not reposition the fixed footer, causing it to overlap the email/phone fields. `form { padding-bottom: 80px }` helps for the visual push but not for the footer bar itself when the keyboard is open. | Deferred. Known mobile keyboard/fixed-footer interaction issue. Mitigation: switch to `env(safe-area-inset-bottom)` in padding. Medium effort. |
| M6 | Company logo upload area | UNKNOWN | `<app-file-upload>` component touch-friendliness depends on its internal implementation, which is outside the current scope. | Not audited. Recommend separate pass on `app-file-upload`. |
| M7 | Address autocomplete mobile | UNKNOWN | `<app-google-address-search>` — same caveat as M6. Not audited here. | Not audited. |

---

## 6. Loading / Empty / Error State Polish

| ID | Area | Finding | Risk | Action |
|----|------|---------|------|--------|
| LS1 | Loading skeleton | PASS | `*ngIf="loading"` shows `.cdf-loading-skeleton` with 4 shimmer rows. The form is hidden with `*ngIf="!loading"`. Skeleton has `aria-busy="true" aria-label="Loading company profile"`. | No action. |
| LS2 | Logo load failure | GAP | `<img [src]="profileImage" class="avatar-image">` has no `onerror` fallback and no `alt` attribute. If the URL is broken or S3 returns 403, the browser renders a broken-image icon inside the circular avatar border. | Add `alt="Company logo"` (always required) and `(error)="onLogoError()"` with a fallback to a placeholder SVG or initials. Not applied this session — requires adding a method. Deferred. |
| LS3 | `success$` fires on init | FIXED | `initialState.succesMsg = ''`. Without the `filter(!!event)` guard, `afterSubmit('')` was called on component init. Added `filter(event => !!event)` to fix (Section 8, Fix F2). | Applied. |
| LS4 | `error$` fires on init | PASS | `initialState.error = null`. The `filter(err => !!err)` guard on line 112 correctly prevents the null initial emission from triggering `afterError`. | No action. |
| LS5 | Company not found state | GAP | If `getCompany()` returns an empty/null result (no company set up), `setCompany()` silently no-ops (`if (company && company.companyId != null)`). The form remains hidden with `loading = false` set unconditionally — but `*ngIf="!loading"` will show an empty form with no company data. No empty-state messaging is shown. | Deferred. Existing `CompanyNotSetupComponent` presumably handles the outer shell routing logic, so this may be handled at a higher level. Verify routing guards. |

---

## 7. Backend Efficiency Audit

| ID | Area | Finding | Risk | Action |
|----|------|---------|------|--------|
| BE1 | `updateCompany` ownership check | PASS (assumed) | The effects file calls `companyService.updateCompany(action.company)`. The BE returns 403/401 errors which the form handles via `afterError`. The modal will display the permission state. Whether the BE verifies ownership before updating is a BE concern, not visible from the FE effects file. The 403 path is handled correctly on the FE. | Verify BE controller performs `companyId` ownership check against the authenticated user. |
| BE2 | N+1 risk | NOT VISIBLE | Effects use `mergeMap` (not `switchMap`). If `updateCompany` is dispatched twice before the first completes, two concurrent requests could land. The `saving` double-submit guard on the FE prevents a second dispatch while the first is in flight, so N+1 is not reachable from the UI. | No action on FE. |
| BE3 | Trimmed values in response | UNKNOWN | `workSetupId: parseInt(...)` and `industryId: parseInt(...)` are sent in the payload. Whether the BE returns trimmed `companyName`/`companyEmail` values in `res.data` depends on BE implementation. If it does, `setCompany()` (called via `companyDetails$` on `getCompanySuccess`) would update the form with trimmed values on next load. The current update path goes through `updateCompanySuccess` which updates the store's `selected` field — `companyDetails$` selector should re-emit, updating the form. | No FE action needed. Verify BE trims and returns cleaned values in response. |

---

## 8. Safe Fix Log

### F1 — `aria-describedby` for companyName error
- **File:** `src/app/company/company-details-form/company-details-form.component.html`
- **Issue:** `companyName` input has no `aria-describedby` linking to its error div. Screen readers will not reliably associate the error with the field.
- **Change:** Added `id="cdf-err-name"` to both `cdf-field-error` divs (the form has two branches for with/without logo) and `aria-describedby="cdf-err-name"` to both `companyName` inputs.
- **Why Safe:** Pure HTML attribute additions. No TS, no logic change.
- **Risk:** None.
- **Test Needed:** Tab to companyName, submit without filling — NVDA/VoiceOver should announce error text when field regains focus.
- **Status:** APPLIED

### F2 — `filter(!!event)` guard on `success$`
- **File:** `src/app/company/company-details-form/company-details-form.component.ts`
- **Issue:** `initialState.succesMsg = ''` causes `success$` to emit `''` on component init, calling `afterSubmit('')` which is a no-op but wastes a cycle and is a latent bug if logic changes.
- **Change:** Added `filter(event => !!event)` to the `success$` pipe.
- **Why Safe:** The two valid values are `'created'` and `'updated'`. Empty string `''` is falsy and was never a valid state — filtering it out is behavior-preserving.
- **Risk:** None.
- **Test Needed:** Open page — confirm no spurious modal appears. Submit update — confirm success modal still opens.
- **Status:** APPLIED

### F3 — `aria-describedby` for companyEmail error
- **File:** `src/app/company/company-details-form/company-details-form.component.html`
- **Issue:** `companyEmail` input has no `aria-describedby` linking to its error div.
- **Change:** Added `id="cdf-err-email"` to the `cdf-field-error` div and `aria-describedby="cdf-err-email"` to the email input.
- **Why Safe:** Pure HTML attribute addition.
- **Risk:** None.
- **Test Needed:** Tab to email, clear value, tab out — AT should announce error.
- **Status:** APPLIED

### F4 — `for`/`id` on `shownPublicly` checkbox
- **File:** `src/app/company/company-details-form/company-details-form.component.html`
- **Issue:** Checkbox and label are visually co-located but not programmatically linked. Screen readers announce unlabeled checkbox.
- **Change:** Added `id="cdf-shown-publicly"` to the checkbox input and `for="cdf-shown-publicly"` to the label.
- **Why Safe:** Pure HTML attribute additions. Label text `Publicly Shown` is correct.
- **Risk:** None.
- **Test Needed:** Navigate to checkbox with screen reader — should announce "Publicly Shown, checkbox".
- **Status:** APPLIED

---

## 9. Optimization Backlog

| ID | Title | Issue | Priority | Files | Effort | Reason Deferred |
|----|-------|-------|----------|-------|--------|-----------------|
| BL1 | Logo URL cache-bust flickering | `setCompany()` re-generates cache-bust URL on every store emission, causing img re-request and flicker | MED | `company-details-form.component.ts` | S | Requires snapshot-keyed guard; low-risk change but warrants a separate focused pass |
| BL2 | Modal double `role="dialog"` | `ghfm-wrap` has `role="dialog"` but CDK overlay already adds one — nested roles confuse AT | MED | `gh-feedback-modal.component.html` | S | Requires verifying `aria-labelledby` still works after removal; regression risk |
| BL3 | Chip stagger capped at 6 | nth-child stagger only covers 6 chips; 7th+ chip has no delay | LOW | `gh-feedback-modal.component.scss` | XS | Minor visual polish; low priority |
| BL4 | Logo `alt` + `onerror` fallback | `<img>` has no `alt` attribute and no broken-image fallback | HIGH (a11y) | `company-details-form.component.html` | S | Requires new TS method + template binding; needs design decision on fallback |
| BL5 | Chip semantic structure | Changed-field chips are `<span>` not `<li>` — weaker AT tree structure | LOW | `gh-feedback-modal.component.html` + SCSS | S | Low user impact; visual refactor risk to chip gap/layout |
| BL6 | `:has()` CSS fallback for bottom-sheet | Safari 15.3 and below miss bottom-sheet positioning | MED | `src/styles.scss` | M | Requires JS-side dialog class injection via `MatDialog.afterOpened()` |
| BL7 | `btn-save` touch target 41px vs 44px | 3px gap below WCAG 2.5.5 minimum | LOW | `company-details-form.component.scss` | XS | Add `min-height: 44px` to `.btn-save` |
| BL8 | Sticky footer + virtual keyboard | Fixed footer may obscure fields when mobile keyboard opens | MED | `company-details-form.component.scss` | M | Requires `env(safe-area-inset-bottom)` and testing across iOS/Android browsers |
| BL9 | `OnPush` for GhFeedbackModal | Pure data-in component would benefit from OnPush | LOW | `gh-feedback-modal.component.ts` | XS | Safe but out of current scope |
| BL10 | `afterClosed()` subscription leak | Dialog afterClosed subscriptions not piped with `takeUntil` | LOW | `company-details-form.component.ts` | S | Acceptable risk (one-shot observables); low urgency |
| BL11 | Validation error font 12px | 12px error text borderline readable on mobile | LOW | `company-details-form.component.scss` | XS | Bump to 13px; safe but cosmetic |
| BL12 | Empty company state UI | If `getCompany()` returns null/no company, form shows empty with no messaging | MED | `company-details-form.component.html` | S | May be handled by outer routing guard — verify before fixing |

---

## 10. Release Gate

### Gate A — Behavior Preservation
**Status: PASS**
- All fixes are additive HTML attribute additions or a RxJS filter addition that removes an already-silent no-op path.
- No form validation logic, submission logic, modal state machine, or animation code was changed.
- The `filter(!!event)` on `success$` removes the empty-string emission that was always a no-op — existing `created` and `updated` paths are unaffected.

### Gate B — Performance
**Status: PASS (with known risks documented)**
- No new subscriptions, no new computed values in templates, no new CD cycles introduced.
- Logo flickering risk (BL1) documented but not worsened by this session's fixes.
- SVG stroke-dashoffset paint-layer risk documented (P2). Reduced-motion coverage confirmed exhaustive.

### Gate C — Accessibility / Mobile
**Status: PASS (improvements applied)**
- AX1 (companyName aria-describedby), AX2 (companyEmail aria-describedby), AX3 (shownPublicly label association) — all applied.
- Remaining deferred items (AX6 nested dialog role, AX10 chip semantics, BL4 logo alt, M2 :has() fallback) do not block release — they are improvements, not hard failures.
- Reduced-motion support: PASS. Color contrast: PASS. cdkFocusInitial wiring: PASS.

### Gate D — Maintainability
**Status: PASS**
- No dead code introduced. No commented-out code added.
- Fix F2 (`filter(!!event)`) makes the `success$` subscription intent clearer — any future developer can see that the stream should only produce meaningful string values.
- `FIELD_LABELS` constant and `computeChangedFields()` remain clean and correctly scoped.

---

## 11. Recommended Next Command

**Run: `/verify` or `/MATCHED`**

The company settings feature is now accessibility-improved and performance-documented. Before shipping:

1. **Manual verify pass** (`/verify`) — open `/recruiter/company/settings`, submit changes with all error states (validation, network, permission), and confirm:
   - Screen reader announces field errors when form is submitted without required fields.
   - `shownPublicly` checkbox is announced with its label by VoiceOver/NVDA.
   - Success modal opens, auto-dismisses after 4s, and chips render correctly.
   - No double-submit occurs on fast clicks.
   - Mobile bottom-sheet slides up on 560px viewport.

2. If any BE-related state issues surface, run **`/STITCH`** to check the NgRx action → effect → reducer → selector chain for `updateCompany` specifically.

3. If broader QA is needed across the recruiter dashboard after this change: run **`/MATCHED`** to cross-check the company state changes don't affect dashboard widgets that also consume `companyDetails$`.
