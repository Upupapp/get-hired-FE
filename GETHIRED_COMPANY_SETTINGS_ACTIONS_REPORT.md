# GetHired — Company Settings Page: ACTIONS Report
**Scope:** `/recruiter/company/settings` — Company Details Form + GhFeedbackModalComponent + NgRx company state + BE `updateCompany` endpoint
**FE HEAD:** 5db2363 | **BE HEAD:** 13a64fb | **Date:** 2026-06-27

---

## 1. Executive Summary

The company settings page is in a strong post-shipping state. The submit flow has proper double-submit guard, snapshot-based changed-field diffing, 8-state branded feedback modal, haptic integration, BOLA protection, and standardised error shapes. No P0 security blockers were found.

However, **12 distinct gaps** remain across UX, validation, NgRx state, accessibility, and testing. The most impactful are:

- **Stale NgRx error on load** — `error$` emits the stored `getCompanyFail` error from a prior failed GET on every page visit before any user action, potentially opening the error modal immediately on load (P1).
- **Missing dirty-form navigation guard** — a recruiter can navigate away mid-edit with no warning; all unsaved changes are silently discarded (P1).
- **`afterSubmit` create-flow uses legacy dialog, not GhFeedbackModalComponent** — the create path still calls `UpdatedDialogComponent`, breaking brand consistency (P1).
- **BE missing validation for companyCity, companyCountry, companyContactNumber** — these fields pass through to the DB unchecked (P1).
- **`saving` flag not reset after create-company path** — `createCompany()` is dispatched without resetting `saving = false` in success/error path (P1).
- **Address chip gap** — `companyAddress`, `companyCity`, `companyCountry` are in the snapshot and `computeChangedFields` comparables, but `addressChange()` updates the form live, so the diff is correct — however the snapshot is only set at `setCompany()` time and is **never refreshed after a successful save**, causing every subsequent submit to report address as "changed" even when the user only clicked Save without touching the address (P2).
- **Zero unit tests** on the critical submit path (P2/P3).

**Action counts by priority:**
| Priority | Count |
|---|---|
| P0 (blockers) | 0 |
| P1 (high-value) | 6 |
| P2 (enhancements) | 5 |
| P3 (future/deferred) | 2 |

**Recommended first execution pack:** Validation Hardening (fixes P1 BE gaps + snapshot refresh + saving-flag reset).
**Recommended next command after this:** `/verify` — run the page in the live app and confirm P1 fixes hold before testing.

---

## 2. Finding Consolidation

### Security / Data Safety
- No P0 findings. BOLA guard is present and tested. SQL uses parameterised queries throughout.
- **Minor:** `companyContactNumber`, `companyCity`, `companyCountry` reach the DB with no server-side length/format check. An adversary can store arbitrarily long strings in these columns, potentially breaking display layers or hitting column size limits silently.

### FE Validation / UX
- `companyContactNumber` has no FE validator — no format, no max-length, not even `Validators.maxLength`. User sees no inline error.
- `numberOfEmployee` has no FE `min`/`max` validator — negative values or values >1,000,000 are blocked only server-side.
- The `companyDetailsForm` form is never marked pristine after a create-flow save (`afterSubmit` for `'created'` calls `router.navigate` without `markAsPristine()`).
- The "Unsaved changes" status label in the sticky bar shows correctly but there is no route-change guard to back it up.
- `saving` is set to `true` in `onSubmit()` for the create path (`createCompany()`) but is never reset to `false` on success or failure — the submit button stays permanently disabled if the user ever hits the create branch.

### BE Validation
- `companyCity` — no length or format check; raw string goes to DB.
- `companyCountry` — no length or format check.
- `companyContactNumber` — no length or format check (phone numbers can be arbitrarily long).
- `numberOfEmployee` is parsed with `parseInt(req.body.numberOfEmployee, 10)` but the validating block only checks the original `numberOfEmployee` variable before this coercion — so a non-numeric string passes the guard and then NaN goes to the query parameter.
- Partial-update semantics: if a field is `undefined` (not sent), it is passed as `undefined` to the pg query, which coerces to `null` in some pg versions and silently nulls out existing values in the DB. There is no "COALESCE to existing value" pattern.

### Accessibility
- `shownPublicly` checkbox has no `id`/`for` association — the `<label>` is adjacent but not programmatically linked.
- `numberOfEmployee` input has no `min="0"` attribute — screen reader users are not told the valid range.
- `industryId` and `workSetupId` selects have no `aria-required` and show no validation error state visually or via `aria-describedby` if left null.
- The skeleton loader uses `aria-busy="true"` (good) but the form container does not announce when loading completes (`aria-live`).

### Mobile / Responsive
- The sticky save bar uses `position: fixed; bottom: 0` with `padding: 12px 28px` — on iOS Safari with the home bar, the bar may be partially occluded by the browser chrome. No `env(safe-area-inset-bottom)` padding applied.
- The logo preview column (`col-12 col-lg-3`) has no max-width cap on mid-range viewports (tablet portrait), causing the 200x200px avatar to overflow its column at ~768px.

### Performance
- `setCompany()` appends `?v=<Date.now()>` cache-busting to the logo URL on every company state emission. Because `companyDetails$` is a live NgRx selector, any unrelated state change (e.g., `getSetupListSuccess`) re-runs the subscription and re-busts the URL, causing unnecessary image re-fetches.
- `getCompany()`, `getIndustry()`, `getSetup()` are all dispatched in `ngOnInit` without checking whether data is already in the store.

### Error Handling
- **Stale error on load:** `error$` subscription has a `filter(err => !!err)` guard, but `getCompanyFail` error (from a prior failed page load in the same session) is still in the NgRx store when the user navigates back to settings. `resetState` is only called in `ngOnDestroy` (which clears it on leaving) but NOT at the start of `ngOnInit` — so if a prior GET failed and the component was destroyed, the error is cleared; but if the component is reused within the same session without destroy (e.g., tab stays alive in a router outlet), stale error can fire `afterError` before any user action.
- Network error modal "Try again" calls `this.onSubmit()` directly. If `saving` was already `false` (reset at start of `afterError`), this is safe. But if another modal is open (stacked dialogs) the double-open is possible.
- The `'created'` branch in `afterSubmit` uses `UpdatedDialogComponent` — brand inconsistency with the new GhFeedbackModalComponent.

### Notification / Messaging
- `afterSubmit` for create-flow opens `UpdatedDialogComponent` (old). The success message for create does not include changed-field chips.
- `secondaryCta` ("Back to dashboard") in the success modal correctly navigates to `/recruiter/dashboard` via `afterClosed`. This is wired correctly.
- `autoDismissMs: 4000` timer is set in `GhFeedbackModalComponent.ngOnInit`. If the user clicks the primary CTA before 4 s, `close('primary')` calls `dialogRef.close()`, which triggers Angular CDK to destroy the component and call `ngOnDestroy` — which calls `clearTimeout`. So the timer IS properly cancelled. No issue here.

### Branding / Motion
- The create-flow success dialog (`UpdatedDialogComponent`) uses the old brand, not the GhFeedbackModal design system.
- The `gh-pressable` CSS class is on the submit button but no `@keyframes` press animation is defined in the component SCSS — the class likely resolves to a global style (check global styles).

### Testing / QA
- Zero spec files exist for `company-details-form.component.ts` or `gh-feedback-modal.component.ts`.
- `company.effects.ts` — `updateCompany$` passes the full error body correctly, but there are no effect tests.
- `company.reducer.ts` — no reducer unit tests.

### Technical Debt
- `companySnapshot` is not refreshed after a successful update. A second save in the same session will always report the same fields as changed (relative to the initial load snapshot, not the post-save state).
- `redirectToPreview()` is an empty stub on line 182 — dead code.
- `companyFacade.getCompany()` is called with no `companyId` argument, but the action type `getCompany` requires `props<{ companyId: string }>()`. The facade dispatches with `{ companyId: undefined }`. The effect ignores the action prop and calls `getUserCompany()` directly, so this works, but the type mismatch is misleading.
- The `getCompany` action in `company.actions.ts` accepts `companyId` but the effect (`getCompany$`) ignores it and always fetches the caller's own company. The action prop is dead weight.

---

## 3. Prioritized Backlog

### P0 — Immediate Blockers

No P0 items found. Security posture is sound (BOLA, parameterised queries, field validation for critical fields).

---

### P1 — High-Value Improvements

---

**ACT-01**
| Field | Value |
|---|---|
| **Title** | Fix stale NgRx error opening error modal on page load |
| **Category** | Error handling / NgRx state |
| **Problem** | `error$` subscription fires whenever the NgRx `error` slice is non-null. If a prior `getCompanyFail` was stored in state (e.g., transient network issue on a previous session within the same tab), navigating back to the settings page runs `ngOnInit` which does NOT call `resetStateNotif()`, so the stored error immediately triggers `afterError()`, opening the GhFeedbackModal before the user has touched the form. |
| **Why it matters** | A recruiter who had a network blip on a prior visit would see an error modal every time they return to settings, degrading trust in the page. |
| **Affected files** | `src/app/company/company-details-form/company-details-form.component.ts` (ngOnInit) |
| **Risk** | Low — adding `this.companyFacade.resetStateNotif()` at the start of `ngOnInit` matches the existing `ngOnDestroy` pattern. |
| **Priority** | P1 |
| **Effort** | XS |
| **Acceptance criteria** | 1. Navigate away, simulate a network failure that stores an error in NgRx state. 2. Navigate back to settings. 3. No error modal opens before any user action. |
| **Dependencies** | None |

---

**ACT-02**
| Field | Value |
|---|---|
| **Title** | Reset `saving` flag on create-company success and failure paths |
| **Category** | FE validation / UX |
| **Problem** | `onSubmit()` sets `this.saving = true` before dispatching `createCompany()`. `afterSubmit()` only resets `saving = false` in the `'updated'` branch. If the company has no `companyId`, the create path runs and `saving` is never cleared. The submit button becomes permanently disabled for the rest of the session. |
| **Why it matters** | A recruiter with no company set up (onboarding) cannot retry after a transient failure. The form is bricked until page refresh. |
| **Affected files** | `src/app/company/company-details-form/company-details-form.component.ts` (afterSubmit, afterError) |
| **Risk** | Low |
| **Priority** | P1 |
| **Effort** | XS |
| **Acceptance criteria** | 1. Trigger create-company flow (company has no companyId). 2. On success: submit button is re-enabled. 3. On error: submit button is re-enabled and error modal appears. |
| **Dependencies** | None |

---

**ACT-03**
| Field | Value |
|---|---|
| **Title** | Replace `UpdatedDialogComponent` with `GhFeedbackModalComponent` on create-company success |
| **Category** | Branding / UX |
| **Problem** | `afterSubmit('created')` opens the old `UpdatedDialogComponent` legacy dialog instead of `GhFeedbackModalComponent`. The create-company success path uses inconsistent branding, lacks changed-field chips, and has no auto-dismiss. |
| **Why it matters** | Brand consistency — a recruiter completing onboarding via the create-company flow sees a jarring old-style dialog after experiencing the polished new form. |
| **Affected files** | `src/app/company/company-details-form/company-details-form.component.ts` (afterSubmit) |
| **Risk** | Low — the old dialog import can be kept as fallback or removed after migration. |
| **Priority** | P1 |
| **Effort** | S |
| **Acceptance criteria** | 1. Create-company success opens GhFeedbackModalComponent with state `'success'`. 2. Modal has correct title/body for creation context. 3. After close, navigates to `../details`. 4. `saving` is reset. |
| **Dependencies** | ACT-02 |

---

**ACT-04**
| Field | Value |
|---|---|
| **Title** | Add dirty-form navigation guard |
| **Category** | FE validation / UX |
| **Problem** | No `CanDeactivate` guard is registered on the company settings route. A recruiter who has edited fields can click any nav link or browser back and silently lose all unsaved changes. The sticky bar shows "Unsaved changes" but there is no enforcement. |
| **Why it matters** | Data loss. This is a standard expectation for any settings form — leaving without saving should prompt "You have unsaved changes. Leave anyway?" |
| **Affected files** | Route config for `/recruiter/company/settings`, new `DirtyFormGuard` service, `company-details-form.component.ts` (implement `CanDeactivate`) |
| **Risk** | Medium — requires a new guard and route registration; does not touch the submit logic. |
| **Priority** | P1 |
| **Effort** | M |
| **Acceptance criteria** | 1. Edit a form field without saving. 2. Click any nav link. 3. Confirmation dialog appears ("Leave without saving?"). 4. Choosing "Stay" cancels navigation. 5. Choosing "Leave" navigates and discards changes. 6. After a successful save, navigating away does NOT prompt (form is pristine). |
| **Dependencies** | None |

---

**ACT-05**
| Field | Value |
|---|---|
| **Title** | Add BE validation for companyCity, companyCountry, companyContactNumber |
| **Category** | BE validation |
| **Problem** | The `updateCompany` controller validates `companyName`, `companyEmail`, `companyDetails` (length), and `numberOfEmployee`, but `companyCity`, `companyCountry`, and `companyContactNumber` have no server-side checks. Arbitrarily long strings or injection-adjacent payloads can be stored. |
| **Why it matters** | Defence-in-depth. FE has no validator on phone number format. A bypassed FE can store garbage in these columns. |
| **Affected files** | `C:\Users\paulg\OneDrive\Desktop\Gethired\get-hired-BE\controllers\companiesController.js` (updateCompany, fieldErrors block) |
| **Risk** | Low — additive validation only; does not change the happy path. |
| **Priority** | P1 |
| **Effort** | S |
| **Acceptance criteria** | 1. `companyCity` > 100 chars → 400 with `fieldErrors.companyCity`. 2. `companyCountry` > 100 chars → 400 with `fieldErrors.companyCountry`. 3. `companyContactNumber` > 30 chars or contains non-phone characters → 400 with `fieldErrors.companyContactNumber`. 4. Valid values pass unchanged. |
| **Dependencies** | None |

---

**ACT-06**
| Field | Value |
|---|---|
| **Title** | Refresh `companySnapshot` after successful update |
| **Category** | FE validation / UX |
| **Problem** | `companySnapshot` is set once in `setCompany()` (called when company data arrives from the store). After a successful save, `setCompany()` is called again via the `companyDetails$` subscription (because `updateCompanySuccess` updates `state.selected`). However, the snapshot is reassigned inside `setCompany()` correctly — BUT `setCompany()` checks `if (company && company.companyId != null)`. After `updateCompanySuccess`, the reducer sets `selected: action.company`. This means the snapshot DOES refresh correctly via the subscription. **However**, the logo snapshot is missing from `companySnapshot` — `companyLogoFile` and `companyLogoUrl` are not in the snapshot. After a successful logo upload, `companyLogoFile` control still has a value, so `computeChangedFields` will always report "Company logo" changed on the next submit even if the user made no logo change. |
| **Why it matters** | Changed-field chips are inaccurate after a logo upload — the next save always incorrectly shows "Company logo" in the chip list. |
| **Affected files** | `src/app/company/company-details-form/company-details-form.component.ts` (afterSubmit, computeChangedFields) |
| **Risk** | Low |
| **Priority** | P1 |
| **Effort** | XS |
| **Acceptance criteria** | 1. Upload a logo and save. 2. Make a text-only change and save again. 3. The success modal does NOT show "Company logo" in changed-field chips on the second save. Fix: clear `companyLogoFile` control value in `afterSubmit` after `'updated'`. |
| **Dependencies** | None |

---

### P2 — Enhancements

---

**ACT-07**
| Field | Value |
|---|---|
| **Title** | Add FE validators for companyContactNumber and numberOfEmployee |
| **Category** | FE validation / UX |
| **Problem** | `companyContactNumber` has no validator (no format, no maxLength). `numberOfEmployee` has no `min`/`max` validator — only the BE rejects negative values. Users get no inline feedback before submit. |
| **Why it matters** | Reduces unnecessary round-trips; inline errors are faster feedback than a modal. |
| **Affected files** | `src/app/company/company-details-form/company-details-form.component.ts` (FormGroup definition), `company-details-form.component.html` (error messages) |
| **Risk** | Low |
| **Priority** | P2 |
| **Effort** | S |
| **Acceptance criteria** | 1. Phone field: `Validators.maxLength(30)`, `Validators.pattern(/^[0-9+\-\s()]*$/)`. Inline error: "Enter a valid phone number." 2. Employee count: `Validators.min(0)`, `Validators.max(1000000)`. Inline error: "Enter a value between 0 and 1,000,000." 3. Both errors appear on touch without requiring a submit attempt. |
| **Dependencies** | None |

---

**ACT-08**
| Field | Value |
|---|---|
| **Title** | Fix shownPublicly checkbox accessibility (label association) |
| **Category** | Accessibility |
| **Problem** | The "Publicly Shown" checkbox uses `formControlName="shownPublicly"` but its `<label>` has no `for` attribute and the `<input>` has no `id`. The label is visually adjacent but not programmatically associated — screen readers may not announce the label when the checkbox receives focus. |
| **Why it matters** | WCAG 2.1 SC 1.3.1 (Info and Relationships) and SC 4.1.2 (Name, Role, Value) require programmatic label association. |
| **Affected files** | `src/app/company/company-details-form/company-details-form.component.html` |
| **Risk** | None — purely additive HTML attribute change. |
| **Priority** | P2 |
| **Effort** | XS |
| **Acceptance criteria** | `<input id="shownPublicly" ...>` and `<label for="shownPublicly">` are associated. Screen reader announces "Publicly Shown, checkbox, not checked" (or checked). |
| **Dependencies** | None |

---

**ACT-09**
| Field | Value |
|---|---|
| **Title** | Fix iOS safe-area overlap on sticky save bar |
| **Category** | Mobile / Responsive |
| **Problem** | The sticky save bar uses `position: fixed; bottom: 0; padding: 12px 28px`. On iOS Safari with the home indicator bar, the bottom 34px of the bar is obscured by browser chrome. No `env(safe-area-inset-bottom)` padding is applied. |
| **Why it matters** | The submit button may be partially hidden on iPhones (X and later), preventing taps on the bottom portion of the button. |
| **Affected files** | `src/app/company/company-details-form/company-details-form.component.scss` (.submit-container) |
| **Risk** | None |
| **Priority** | P2 |
| **Effort** | XS |
| **Acceptance criteria** | `.submit-container` has `padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px))`. Submit button is fully tappable on iPhone X/14/15 in Safari. |
| **Dependencies** | None |

---

**ACT-10**
| Field | Value |
|---|---|
| **Title** | Prevent excessive logo cache-busting on unrelated state changes |
| **Category** | Performance |
| **Problem** | `companyDetails$` subscription calls `setCompany()` which appends `?v=<Date.now()>` to the logo URL on every emission. Any state change that touches the NgRx company slice (getSetupListSuccess, getIndustryListSuccess, etc.) triggers the subscription and re-fetches the logo image. |
| **Why it matters** | Unnecessary network requests for an image that did not change, wasting bandwidth and potentially flickering the logo display. |
| **Affected files** | `src/app/company/company-details-form/company-details-form.component.ts` (setCompany) |
| **Risk** | Low — only needs a `distinctUntilKeyChanged('companyLogoUrl')` or URL comparison before re-busting. |
| **Priority** | P2 |
| **Effort** | XS |
| **Acceptance criteria** | The logo image URL only changes (with new ?v= timestamp) when `companyLogoUrl` actually changes between emissions. Unrelated state updates do not re-fetch the logo. |
| **Dependencies** | None |

---

**ACT-11**
| Field | Value |
|---|---|
| **Title** | Add GhFeedbackModal for logo-upload-only saves |
| **Category** | Notification / Messaging |
| **Problem** | `GhFeedbackModalComponent` is opened in `afterSubmit('updated')` in all cases — including logo-only saves. This is already handled correctly. However: the success modal body reads "Your company details are saved and ready for your hiring workspace" regardless of whether only a logo was uploaded. No logo-specific messaging. |
| **Why it matters** | Minor UX clarity — when only a logo was uploaded, the message could reflect that ("Your company logo has been updated"). |
| **Affected files** | `src/app/company/company-details-form/company-details-form.component.ts` (afterSubmit) |
| **Risk** | None |
| **Priority** | P2 |
| **Effort** | XS |
| **Acceptance criteria** | If `changedFields` contains only "Company logo", the modal body reads "Your company logo is updated and visible on your company profile." Otherwise uses the current generic message. |
| **Dependencies** | ACT-06 |

---

### P3 — Future / Deferred

---

**ACT-12**
| Field | Value |
|---|---|
| **Title** | Unit test suite for onSubmit, afterSubmit, afterError, modal states |
| **Category** | Testing / QA |
| **Problem** | No spec file exists for `company-details-form.component.ts` or `gh-feedback-modal.component.ts`. The submit flow, error normalisation, computeChangedFields, and focusFirstInvalidField are untested. |
| **Why it matters** | Regressions to the submit flow are invisible until a user reports them. |
| **Affected files** | New: `company-details-form.component.spec.ts`, `gh-feedback-modal.component.spec.ts` |
| **Risk** | None — tests only. |
| **Priority** | P3 |
| **Effort** | L |
| **Acceptance criteria** | Tests cover: (a) double-submit guard, (b) FE validation blocks submit, (c) afterSubmit 'updated' opens modal with correct data, (d) afterSubmit 'created' opens GhFeedbackModal (after ACT-03), (e) afterError normalises string vs object errors, (f) network error "Try again" re-calls onSubmit, (g) computeChangedFields returns correct labels, (h) autoDismiss timer clears on ngOnDestroy. |
| **Dependencies** | ACT-02, ACT-03 |

---

**ACT-13**
| Field | Value |
|---|---|
| **Title** | Remove dead code: redirectToPreview() stub and unused getCompany companyId prop |
| **Category** | Technical debt |
| **Problem** | `redirectToPreview()` on line 182 is an empty function — never called from the template or elsewhere. The `getCompany` NgRx action accepts `companyId` but the effect always ignores it and fetches by JWT uid. The prop is misleading dead weight. |
| **Why it matters** | Code clarity; reduces confusion for future maintainers. |
| **Affected files** | `company-details-form.component.ts` (redirectToPreview), `company.actions.ts` (getCompany props), `company.effects.ts` (getCompany$ effect) |
| **Risk** | Low — no behaviour change. |
| **Priority** | P3 |
| **Effort** | XS |
| **Acceptance criteria** | `redirectToPreview` is removed. `getCompany` action has no props (or props are used consistently). `getCompany$` effect is consistent with the action signature. |
| **Dependencies** | None |

---

## 4. Roadmap

### Stage 1 — Reliability & Validation Hardening (Sprint 1)
Deliver ACT-01, ACT-02, ACT-05, ACT-06.
Goal: eliminate the stale-error UX bug, fix the create-flow broken saving flag, add missing BE validation, and correct the logo changed-field chip false positive. All XS/S effort, no structural changes.

### Stage 2 — Brand Consistency & UX Completeness (Sprint 1–2)
Deliver ACT-03, ACT-04, ACT-07.
Goal: migrate create-flow to GhFeedbackModal, add the dirty-form guard, and add FE phone/employee validators. These are the highest UX-impact items.

### Stage 3 — Accessibility & Mobile Polish (Sprint 2)
Deliver ACT-08, ACT-09.
Goal: fix the checkbox label association and iOS safe-area padding. Small, non-breaking, high accessibility value.

### Stage 4 — Performance & Messaging Polish (Sprint 2–3)
Deliver ACT-10, ACT-11.
Goal: prevent unnecessary logo re-fetches; contextualise the logo-upload success message.

### Stage 5 — Testing Foundation (Sprint 3)
Deliver ACT-12.
Goal: unit test coverage for the entire submit flow and modal states.

### Stage 6 — Debt Cleanup (Backlog / On-demand)
Deliver ACT-13.
Goal: remove dead code once all functional work is stable.

---

## 5. Execution Packs

### Pack 1 — Validation Hardening
**Scope:** BE missing validators, FE phone/employee validators, logo chip false positive, `saving` flag fix
**Items:** ACT-01, ACT-02, ACT-05, ACT-06, ACT-07
**Files touched:**
- `company-details-form.component.ts` — add `resetStateNotif()` in ngOnInit; reset `saving` in create path; clear `companyLogoFile` after update success
- `company-details-form.component.html` — add inline errors for phone and employee count
- `companiesController.js` — add `companyCity`, `companyCountry`, `companyContactNumber` validation to fieldErrors block

**Can run independently:** Yes. No design/routing changes. All additive.

---

### Pack 2 — UX Polish
**Scope:** Dirty-form guard, create-flow modal migration, iOS safe area, checkbox a11y, logo-contextual message
**Items:** ACT-03, ACT-04, ACT-08, ACT-09, ACT-11
**Files touched:**
- `company-details-form.component.ts` — replace UpdatedDialogComponent with GhFeedbackModal in create branch; implement `CanDeactivate`
- Route config for company settings — register `DirtyFormGuard`
- New file: `src/app/shared/guards/dirty-form.guard.ts`
- `company-details-form.component.html` — add `id`/`for` to checkbox
- `company-details-form.component.scss` — add safe-area padding

**Can run independently:** Yes, but ACT-11 depends on ACT-06 (from Pack 1) being done first.

---

### Pack 3 — QA Foundation
**Scope:** Unit tests for the submit flow and modal component
**Items:** ACT-12
**Files touched:**
- New: `src/app/company/company-details-form/company-details-form.component.spec.ts`
- New: `src/app/company/company-details-form/gh-feedback-modal/gh-feedback-modal.component.spec.ts`

**Can run independently:** Yes. Should be done after Pack 1 and Pack 2 since ACT-12 tests the corrected behaviour.

---

## 6. Decision Log

| # | Decision | Options | Recommended | Owner |
|---|---|---|---|---|
| D-01 | Which BE fields should be validated server-side? | (a) Only companyName + companyEmail (current); (b) Add city/country/phone maxLength; (c) Add full format/regex validation including address sub-fields | Recommend (b) as minimum — length guards without strict regex, to avoid rejecting valid international formats | Backend lead |
| D-02 | Should a dirty-form navigation guard be added? | (a) Yes, browser confirm dialog; (b) Yes, custom Angular Material dialog matching the GhFeedbackModal brand; (c) No (rely on the "Unsaved changes" label only) | Recommend (b) for brand consistency, (a) as quick win | Product/UX |
| D-03 | Should address sub-field changes be shown as separate chips? | (a) Show single "Address" chip when any address field changes (current behaviour); (b) Show separate chips for City, Country, Address line | Recommend (a) — fewer chips, cleaner modal; address is treated as one logical field | Product |
| D-04 | Should `companyLogoFile` be cleared from the form after a successful upload/save? | (a) Yes — clear the file control after save so subsequent saves don't report logo as changed (recommended); (b) No — keep it so user knows a file was attached | Recommend (a) — clears the false positive and aligns with form-reset-after-save pattern | Frontend lead |
| D-05 | Should the create-company path stay in this component or be split to an onboarding wizard? | (a) Keep create + update in one component (current); (b) Extract create to a separate onboarding component | Recommend (a) for now — the create path is rarely hit (only on first login); revisit if onboarding scope expands | Product |

---

## 7. Definition of Done

The company settings submit flow is fully complete when ALL of the following are true:

**Functional**
- [ ] Submitting with a missing or invalid `companyName` or `companyEmail` is blocked at FE and BE with consistent error messages
- [ ] Submitting with an invalid phone number or out-of-range employee count is blocked at FE with an inline error and at BE with a fieldError
- [ ] `companyCity`, `companyCountry`, `companyContactNumber` are length-validated at BE
- [ ] The create-company path uses `GhFeedbackModalComponent` for success feedback and resets `saving` correctly
- [ ] The update-company path resets `saving = false` on both success and error
- [ ] Logo changed-field chip does not appear on a subsequent save after the logo was already uploaded in the same session
- [ ] Navigating away from a dirty form prompts the user to confirm

**State / NgRx**
- [ ] `resetStateNotif()` is called at the start of `ngOnInit` to prevent stale errors from firing on page entry
- [ ] `success$` emits only `'updated'` or `'created'` — never a stale value from a prior action
- [ ] `error$` is guarded by `filter(err => !!err)` AND a page-entry reset so it never fires before a user action

**Accessibility**
- [ ] `shownPublicly` checkbox has programmatic `id`/`for` label association
- [ ] `numberOfEmployee` input has `min="0"` HTML attribute
- [ ] Form skeleton announces load completion to screen readers

**Mobile**
- [ ] Sticky save bar is fully visible and tappable on iPhone X+ (iOS Safari) with safe-area padding

**Testing**
- [ ] Component spec covers: double-submit guard, FE validation blocks, `afterSubmit` for both create and update paths, `afterError` for network/403/400/generic, `computeChangedFields` accuracy, autoDismiss timer teardown
- [ ] Effect spec covers: `updateCompany$` success and error paths, error payload shape

**Code quality**
- [ ] `redirectToPreview()` stub is removed or implemented
- [ ] No TypeScript type errors introduced by any of the above changes

---

## 8. Recommended Next Command

**Run next:** `/verify`
**Pack to start with:** Execution Pack 1 (Validation Hardening)

Rationale: Pack 1 items are all XS/S effort, non-structural, and fix the highest-risk runtime bugs (stale error modal on load, broken `saving` flag on create flow, BE validation gaps, logo chip false positive). After Pack 1 is coded, run `/verify` to confirm the page loads without a spurious error modal, a logo save + second text-field save shows correct chips, and BE rejects oversized city/country/phone fields. Once verified, proceed to Pack 2 (UX Polish), then Pack 3 (QA Foundation).
