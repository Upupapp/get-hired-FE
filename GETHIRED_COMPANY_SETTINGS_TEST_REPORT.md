# GetHired — Company Settings Quality Gate Report
**Scope:** `/recruiter/company/settings` — Company Details Form + GhFeedbackModalComponent + NgRx company state + BE updateCompany endpoint  
**Commits audited:** FE=5db2363, BE=13a64fb (LIVE)  
**Date:** 2026-06-27  
**Report type:** Manual code-read quality gate (no specs executed; see §2)

---

## 1. Executive Summary

The company settings feature shipped with well-structured code: a double-submit guard, five distinct error routing paths, a clean NgRx effects chain, and proper BE-side BOLA protection with four field validators. The implementation is functionally complete and correctly wired end-to-end.

**Testing posture: ZERO automated tests exist for this entire feature.** No spec files were found anywhere under `src/app/company/` — not for the form component, the feedback modal, the effects, the reducer, the facade, or the service. The BE `package.json` `test` script is a stub (`echo "Error: no test specified"`). All quality assurance is currently done entirely by manual runtime exercise.

**Critical gaps:**
1. No spec files — 0% automated coverage on both FE and BE
2. The `afterError` network branch (`err.status === 0`) reads `err.status` but the `error$` selector receives the raw NgRx payload — which is `err.error` (the parsed body), not the HttpErrorResponse object. The HTTP status code is stripped before it reaches the component. (See §4 and §11 Gate B detail.)
3. The BE `updateCompany` error catch path returns a generic 500; it does not emit a structured `feedback` block, meaning an unhandled DB exception produces a generic modal state rather than a traceable one.
4. `companyDetails` textarea has `maxlength="1000"` in the HTML but no `Validators.maxLength(1000)` on the Angular control — FE validation will never fire for that field; BE is the sole safety net.
5. `numberOfEmployee` has no FE validator — the form will pass as valid even with a value of `-5`, relying entirely on BE.
6. The `company.selector.ts` file was not found — the selector module appears to be missing from the FE repo or uses a non-standard path, which would cause a build failure if the module is ever regenerated.

**Release gate verdict: CONDITIONAL PASS** — The feature works correctly in the happy path and has BE BOLA protection. The network-error state routing gap (§11 Gate B) is the only behavioural defect; all other gaps are coverage/quality-of-life. Address the `err.status` routing bug before the next production push.

---

## 2. Test Tooling Inventory

### Frontend (Angular 13, `get-hired-FE`)
| Tool | Status | Notes |
|---|---|---|
| Angular CLI (`ng test`) | Available | `angular.json` wires to karma |
| Karma | Available | `karma.conf.js` present, Chrome launcher configured |
| Jasmine | Available | `frameworks: ['jasmine', '@angular-devkit/build-angular']` |
| `@ngrx/effects/testing` (`provideMockActions`) | Available (dependency present) | Not yet used |
| `@ngrx/store/testing` (`MockStore`) | Available (dependency present) | Not yet used |
| `MatDialogHarness` (CDK testing) | Available | Angular Material testing harnesses bundled |
| Jest | Not installed | Karma/Jasmine is the configured runner |
| Coverage reporter | Configured | Output dir: `./coverage/my-pet-go` (stale project name, non-blocking) |

### Backend (`get-hired-BE`)
| Tool | Status | Notes |
|---|---|---|
| Jest | Not installed | No jest in `package.json` |
| Mocha/Chai | Not installed | |
| Supertest | Not installed | |
| `npm test` | Stub only | Returns exit 1 with no-op message |
| Any test infrastructure | None | BE is completely untested |

---

## 3. Critical Flow Coverage Matrix

| Flow | Risk | Current Coverage | Recommended Test Type | Priority |
|---|---|---|---|---|
| FE validation — companyName required | High | None | Jasmine unit (FormGroup) | P0 |
| FE validation — companyEmail required + email format | High | None | Jasmine unit (FormGroup) | P0 |
| FE double-submit guard (`saving=true` early return) | High | None | Jasmine unit (component) | P0 |
| FE snapshot diff → changed-field chips in modal | Medium | None | Jasmine unit (component) | P1 |
| NgRx `updateCompany$` dispatch on valid submit | High | None | NgRx effects test | P0 |
| `catchError` passes full BE error body (not just string) | High | None | NgRx effects test | P0 |
| 8 modal states rendered correctly | High | None | Jasmine component test | P1 |
| Auto-dismiss timer fires `close('auto')` | Medium | None | Jasmine unit (fakeAsync) | P1 |
| Modal focus trap (`cdkFocusInitial` on primary CTA) | Medium | None | CDK `MatDialogHarness` | P2 |
| Mobile bottom-sheet at ≤560px | Medium | None | E2E / visual regression | P2 |
| BE — missing companyName → 400 fieldErrors | Critical | None | Supertest integration | P0 |
| BE — invalid email format → 400 fieldErrors | Critical | None | Supertest integration | P0 |
| BE — companyDetails > 1000 chars → 400 | High | None | Supertest integration | P1 |
| BE — numberOfEmployee negative → 400 | Medium | None | Supertest integration | P1 |
| BE 403 standardised shape (`code: 'forbidden'`) | Critical | None | Supertest integration | P0 |
| BE success response includes `feedback` block | High | None | Supertest integration | P1 |
| BE auth protection on PUT `/company/update` | Critical | None | Supertest integration | P0 |
| BE BOLA — companyId from different user → 403 | Critical | None | Supertest integration | P0 |

---

## 4. Contract Test Checklist

| Contract Point | Status | Notes |
|---|---|---|
| FE service PUT path matches BE route | PASS | FE: `PUT /company/update` (company.service.ts:34). BE: `router.put("/company/update", verifyAuth, updateCompany)` (companiesRoute.js:36) |
| Request shape — form fields match BE body destructure | PASS | All 18 fields destructured in `updateCompany` (`companyId`, `companyEmail`, ..., `shownPublicly`) match the `companyDetailsForm` value spread plus `companyId` injected in `onSubmit()` |
| Success response: `{status:'success', data:{...}, feedback:{...}}` consumed correctly | PARTIAL | Effect reads `res.data` into `updateCompanySuccess` (company.effects.ts:86-88) and reducer sets `succesMsg:'updated'`. Facade exposes `success$`. Component subscribes. The `feedback` block from the BE is NOT consumed by the effect — it is discarded. The component constructs its own success modal data. This is intentional and safe, but means BE feedback text is silently ignored. |
| Validation response: `{status:'error', fieldErrors:{...}, feedback:{state:'validation_error',...}}` consumed correctly | PASS | Effect passes full `err.error` body as payload (company.effects.ts:93-94). Reducer stores it in `error`. Component reads `errObj.feedback.state` and `errObj.fieldErrors` correctly in `afterError()`. |
| 403 response: `{status:'error', error:'...', code:'forbidden'}` consumed correctly | BUG | Component checks `err.status === 403` (company-details-form.component.ts:317). But `err` at this point is the NgRx `error` state value, which equals `err.error` (the parsed HTTP body), NOT the `HttpErrorResponse`. The parsed body has no `.status` property — `.status` is on the outer `HttpErrorResponse`. The 403 branch will **never fire** via this path; all 403s will fall through to the generic error modal. |
| Network error (status 0) handled correctly | BUG | Same root cause as above. `err.status === 0` checks the body object, not `HttpErrorResponse.status`. Network errors produce a body of `null` or empty; the check always fails and falls through to generic error. |

---

## 5. FE Unit Test Plan — `company-details-form.component.ts`

The following test cases should be written in a new file: `src/app/company/company-details-form/company-details-form.component.spec.ts`

**Setup:** Use `TestBed` with `ReactiveFormsModule`, a `MockStore` (providing initial `CompanyState`), `MatDialogModule` with a spy for `dialog.open()`, a `RouterTestingModule`, and jasmine spies for `HapticFeedbackService` and `SnackbarService`.

### onSubmit() — double-submit guard
- **Test:** Set `component.saving = true`, call `onSubmit()`. Assert `companyFacade.updateCompany` was NOT called. Assert `dialog.open` was NOT called.

### onSubmit() — form invalid
- **Test:** Leave `companyName` empty (required). Call `onSubmit()`. Assert `companyDetailsForm.controls['companyName'].touched === true`. Assert `dialog.open` not called. Assert `saving` remains `false`.

### onSubmit() — email invalid format
- **Test:** Set `companyName` to `'Acme'`, set `companyEmail` to `'notanemail'`. Call `onSubmit()`. Assert form is invalid. Assert `companyFacade.updateCompany` not called.

### onSubmit() — valid form with company loaded
- **Test:** Patch form with valid data. Set `component.company = { companyId: 'COM123', ... }`. Spy on `companyFacade.updateCompany`. Call `onSubmit()`. Assert `saving === true`. Assert `companyFacade.updateCompany` called once with payload containing `companyId: 'COM123'`. Assert `companyFacade.resetStateNotif()` called before dispatch. Assert `haptic.press()` called.

### afterSubmit('updated') — success modal opens
- **Test:** Spy on `dialog.open`. Call `afterSubmit('updated')`. Assert `dialog.open` called with `GhFeedbackModalComponent`. Assert `data.state === 'success'`. Assert `saving === false`. Assert `haptic.success()` called. Assert `companyDetailsForm.pristine === true`.

### afterSubmit('updated') — changedFields chips reflect actual diff
- **Test:** Set `component.companySnapshot = { companyName: 'OldName', companyEmail: 'old@test.com', ... }`. Patch form with `companyName: 'NewName'`, same email. Call `afterSubmit('updated')`. Assert `dialog.open` was called with `data.changedFields` containing `'Company name'` but NOT `'Contact email'`.

### afterSubmit('updated') — secondary CTA navigates to dashboard
- **Test:** Spy on `dialog.open` returning an `afterClosed` that emits `'secondary'`. Spy on `router.navigate`. Call `afterSubmit('updated')`. Assert `router.navigate(['/recruiter/dashboard'])` called.

### afterError — validation (fieldErrors present)
- **Test:** Call `afterError({ feedback: { state: 'validation_error' }, fieldErrors: { companyName: 'Required.' } })`. Assert `dialog.open` called with `data.state === 'validation'`. Assert `data.fieldErrors[0].field === 'Company name'`. Assert `saving === false`. Assert `haptic.warning()` called.

### afterError — network error (status 0)
- **Note:** This test exposes the current bug. Currently `afterError` receives the parsed body, not the `HttpErrorResponse`. Until the bug is fixed, pass a mock `HttpErrorResponse`-like object with `{ status: 0, error: null }` to the component directly to test the intended branch. Document in the test that the NgRx chain strips the `.status` field.
- **Test:** Call `afterError({ status: 0 })`. Assert `dialog.open` called with `data.state === 'network'`. Assert `haptic.error()` called.

### afterError — permission error (403)
- **Test:** Call `afterError({ status: 403, code: 'forbidden' })`. Assert `dialog.open` called with `data.state === 'permission'`. Assert `router.navigate(['/recruiter/company/details'])` called after modal close.

### afterError — generic server error
- **Test:** Call `afterError({ status: 500 })`. Assert `dialog.open` called with `data.state === 'error'`. Assert primary CTA re-calls `onSubmit` on close with `'primary'`.

### ngOnDestroy — cleanup
- **Test:** Spy on `destroy$.complete`. Call `ngOnDestroy()`. Assert `destroy$.next()` and `destroy$.complete()` called. Assert `companyFacade.resetStateNotif()` called.

---

## 6. FE Unit Test Plan — `GhFeedbackModalComponent`

Create `src/app/company/company-details-form/gh-feedback-modal/gh-feedback-modal.component.spec.ts`.

**Setup:** Use `TestBed` with `MatDialogModule`. Provide `MatDialogRef` as a spy object (`jasmine.createSpyObj('MatDialogRef', ['close'])`). Inject `MAT_DIALOG_DATA` with fixture data for each test.

### Renders success state correctly
- **Test:** Provide `data = { state: 'success', title: 'Updated', body: '...', changedFields: ['Company name', 'About'], primaryCta: 'OK' }`. Compile. Assert orbit ring SVG is present (`.ghfm-orbit-ring` exists). Assert checkmark SVG present. Assert `.ghfm-chips` contains two `<span>` elements. Assert `role="dialog"` on host. Assert `aria-labelledby` matches `'ghfm-title-success'`.

### Renders validation state — field error list visible
- **Test:** Provide `data = { state: 'validation', fieldErrors: [{ field: 'Company name', message: 'Required.' }], primaryCta: 'Fix' }`. Assert `.ghfm-field-errors` renders one `<li>`. Assert `<strong>Company name:</strong>` present. Assert validation triangle SVG present. Assert orbit ring is NOT present.

### Renders error state — error/network icon visible
- **Test:** Provide `data = { state: 'error', ... }`. Assert error circle SVG present. Assert `.ghfm-chips` NOT present. Assert `.ghfm-field-errors` NOT present.

### Renders permission state — lock icon visible
- **Test:** Provide `data = { state: 'permission', ... }`. Assert lock rect SVG present.

### Renders session state — same icon as permission
- **Test:** Provide `data = { state: 'session', ... }`. Assert lock rect SVG present (shared `*ngIf` with `'permission'`).

### Auto-dismiss — timer fires close('auto')
- **Test (fakeAsync):** Provide `autoDismissMs: 3000`. Spy on `dialogRef.close`. Use `fakeAsync`/`tick(3000)`. Assert `dialogRef.close('auto')` was called.

### Auto-dismiss — no timer when autoDismissMs is absent
- **Test (fakeAsync):** Omit `autoDismissMs`. Tick 99999ms. Assert `dialogRef.close` never called.

### ngOnDestroy — timer cleared
- **Test (fakeAsync):** Provide `autoDismissMs: 3000`. Call `component.ngOnDestroy()` before tick. Tick 3000. Assert `dialogRef.close` NOT called (timer was cancelled).

### secondary() closes with 'secondary'
- **Test:** Spy on `dialogRef.close`. Call `component.secondary()`. Assert `dialogRef.close('secondary')` called.

### close('primary') closes with 'primary'
- **Test:** Spy on `dialogRef.close`. Call `component.close()` (no arg). Assert `dialogRef.close('primary')` called.

### Sync note only shows on success state
- **Test:** Provide `data = { state: 'success', syncNote: 'Synced.' }`. Assert `.ghfm-sync-note` visible. Reprovide with `state: 'error'`. Assert `.ghfm-sync-note` NOT present.

---

## 7. NgRx Effects Test Plan

Create `src/app/company/state/company.effects.spec.ts`.

**Setup:** Use `provideMockActions()` from `@ngrx/effects/testing`. Mock `CompanyService` with `jasmine.createSpyObj`. Use `TestBed`.

### updateCompany$ — success path dispatches updateCompanySuccess with full response
- **Test:** Service `updateCompany` returns `of({ data: { companyId: 'COM1', companyName: 'Acme' } })`. Dispatch `CompanyActions.updateCompany({ company: mockCompany })`. Assert effect emits `updateCompanySuccess({ company: { companyId: 'COM1', companyName: 'Acme' } })`. Assert `company.companyId` equals `'COM1'` (i.e., `res.data` was used, not the whole response).

### updateCompany$ — error path dispatches updateCompanyFail with full err.error body
- **Test:** Service `updateCompany` returns `throwError(() => ({ error: { status: 'error', fieldErrors: { companyName: 'Required.' }, feedback: { state: 'validation_error' } } }))`. Assert effect emits `updateCompanyFail({ payload: { status: 'error', fieldErrors: { companyName: 'Required.' }, feedback: { state: 'validation_error' } } })`. Critically: assert `payload` is the full object, NOT the string `'Required.'` or `'An error occurred'`.

### updateCompany$ — error path when err.error is null (network error)
- **Test:** Service returns `throwError(() => ({ error: null, message: 'Http failure response...' }))`. Assert payload equals the message string (fallback path in catchError). This documents the current behaviour where the network state detection is broken.

### createCompany$ — error path only extracts error string (legacy pattern)
- **Test:** Verify that `createCompany$` catchError extracts `err.error.error` (string) — NOT the full body — confirming the asymmetry with `updateCompany$` is intentional.

---

## 8. BE Test Plan — `companiesController.js` `updateCompany`

Install Supertest + Jest (or Mocha/Chai). Create `tests/companiesController.test.js`.

**Setup:** Mock `verifyAuth` middleware to inject a known `req.user.uid`. Mock `getUserCompany` to return a known company record. Mock `dbQuery.query` to return a valid `rows` array for success cases.

### BE — missing companyName → 400 with fieldErrors.companyName
- **Test:** POST body: `{ companyEmail: 'test@test.com', companyId: 'COM1', companyName: '' }`.
  Assert response status `400`. Assert `body.status === 'error'`. Assert `body.fieldErrors.companyName === 'Company name is required.'`. Assert `body.feedback.state === 'validation_error'`.

### BE — companyName too long → 400
- **Test:** Body with `companyName: 'A'.repeat(201)`. Assert `body.fieldErrors.companyName` contains `'200 characters'`.

### BE — empty companyEmail → 400
- **Test:** Body with `companyEmail: ''`. Assert `body.fieldErrors.companyEmail === 'Contact email is required.'`.

### BE — invalid email format → 400
- **Test:** Body with `companyEmail: 'not-an-email'`. Assert `body.fieldErrors.companyEmail === 'Enter a valid email address.'`. Test boundary: `'user@domain'` (no TLD) — should also fail per the `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` regex.

### BE — companyDetails > 1000 chars → 400
- **Test:** Body with `companyDetails: 'x'.repeat(1001)`. Assert `body.fieldErrors.companyDetails` contains `'1000 characters'`.

### BE — numberOfEmployee negative → 400
- **Test:** Body with `numberOfEmployee: -1`. Assert `body.fieldErrors.numberOfEmployee` contains `'valid number'`.

### BE — numberOfEmployee exceeds 1,000,000 → 400
- **Test:** Body with `numberOfEmployee: 1000001`. Assert `body.fieldErrors.numberOfEmployee`.

### BE — multiple validation errors batched
- **Test:** Body with both empty `companyName` and invalid `companyEmail`. Assert `body.fieldErrors.companyName` AND `body.fieldErrors.companyEmail` both present in a single 400 response (the code uses `var fieldErrors = {}` accumulation).

### BE — BOLA: caller's company !== request's companyId → 403
- **Test:** Mock `getUserCompany` to return `{ companyId: 'COM-OTHER' }`. Body with `companyId: 'COM-TARGET'`. Assert response status `403`. Assert `body.code === 'forbidden'`. Assert `body.status === 'error'`. This is the critical BOLA test.

### BE — BOLA: getUserCompany returns array (no company) → 403
- **Test:** Mock `getUserCompany` to return `[]`. Assert response status `403` (the `Array.isArray(userCompany)` guard fires).

### BE — valid request → 200 with feedback block
- **Test:** All fields valid, BOLA passes. Assert response status `200`. Assert `body.status === 'success'`. Assert `body.data.companyId` present. Assert `body.feedback.state === 'success'`. Assert `body.feedback.primaryCta === 'Continue editing'`.

### BE — unauthenticated request → 401 (middleware test)
- **Test:** Call `PUT /company/update` without a JWT. Assert `verifyAuth` middleware blocks with 401 before `updateCompany` is ever reached.

### BE — `shownPublicly` boolean coercion
- **Test:** Body with `shownPublicly: 'true'` (string). Assert DB query receives boolean `true` (the expression `shownPublicly === true || shownPublicly === 'true'` handles this). Body with `shownPublicly: false` (boolean). Assert DB receives `false`.

---

## 9. Accessibility Test Checklist

| Check | Finding |
|---|---|
| Modal has `role="dialog"` | PASS — present on `.ghfm-wrap` (gh-feedback-modal.component.html:2) |
| Modal has `aria-modal="true"` | PASS — present on `.ghfm-wrap` (gh-feedback-modal.component.html:2) |
| Modal has `aria-labelledby` | PASS — `[attr.aria-labelledby]="'ghfm-title-' + data.state"` (line 2) matching `[id]="'ghfm-title-' + data.state"` on `<h2>` (line 56) |
| `cdkFocusInitial` on primary CTA | PASS — present on `.ghfm-btn--primary` button (line 102) |
| Submit button has `aria-busy` when saving | PASS — `[attr.aria-busy]="saving"` on submit button (company-details-form.component.html:15) |
| Submit button has descriptive `aria-label` when saving | PASS — toggles between `'Saving company profile…'` and `'Submit Changes'` (line 16) |
| Validation errors have `role="alert"` | PASS — `companyName` and `companyEmail` inline error `<div>` elements have `role="alert"` (lines 56, 72 and 153) |
| Inline field errors linked to inputs via `aria-describedby` | FAIL — `<input>` elements have no `aria-describedby` pointing to the error `<div>` ids. The error divs also have no `id` attributes. Screen readers may not associate the error text with the field. |
| Loading skeleton has `aria-busy` | PASS — `aria-busy="true"` on `.cdf-loading-skeleton` (line 1) |
| Character counter has `aria-live` | PASS — `aria-live="polite" aria-atomic="true"` on companyDetails counter (line 96) |
| Field error list in modal has `role="list"` | PASS — `.ghfm-field-errors` has `role="list"` (modal HTML line 80) |
| Field error items have `role="listitem"` | PASS — each `<li>` has `role="listitem"` (line 81) |
| SVG decorative elements hidden from AT | PASS — all decorative SVGs have `aria-hidden="true"` |
| Form controls have visible labels | PARTIAL — most fields have `<label>` elements but none use `for`/`id` pairs or `aria-labelledby`; they rely on DOM proximity, which is fragile with screen readers |

---

## 10. Regression Checklist

Items that must still work after the changes introduced in FE=5db2363/BE=13a64fb:

| Item | Mechanism | Risk of Regression |
|---|---|---|
| Logo upload still works | `onUpload()` sets `companyLogoFile` control; BE branches on `companyLogoFile != ""` before calling `uploadInStorage` | Low — untouched code path, but no test |
| Address autocomplete still works | `app-google-address-search` emits `addressChange` event; `addressChange()` patches 8 form controls | Low — untouched; no test |
| Company creation (not update) flow | `onSubmit()` falls to `companyFacade.createCompany()` when `company.companyId` is null | Medium — `afterSubmit('created')` opens `UpdatedDialogComponent` (old dialog), not `GhFeedbackModalComponent`. This path is untouched but the new saving flag and `resetStateNotif()` were added before the `if/else` branch. Verify `resetStateNotif()` does not corrupt creation state. |
| Navigation to `/recruiter/dashboard` after secondary CTA | `modalRef.afterClosed().subscribe(action => { if (action === 'secondary') router.navigate(['/recruiter/dashboard']) })` | Low — straightforward subscription |
| Industry/work-setup dropdowns populated | `companyFacade.getIndustry()` / `getSetup()` called in `ngOnInit`; `industry$` / `workSetup$` async pipes in template | Low — untouched; selector file not found locally but built artefact works live |
| `saving` flag reset on error | `afterError()` sets `this.saving = false` at top of method before any branch | Pass — verified in source |
| `saving` flag reset on success | `afterSubmit('updated')` sets `this.saving = false` | Pass — verified in source |
| `destroy$` completed on destroy | `ngOnDestroy` calls `destroy$.next()` then `destroy$.complete()` | Pass — verified in source |
| `companyFacade.resetStateNotif()` called on destroy | Called in `ngOnDestroy` | Pass — clears stale error on navigation away |

---

## 11. Release Quality Gates

### Gate A: Double-submit guard confirmed
**Verdict: PASS (code-verified, not test-verified)**
`onSubmit()` returns immediately when `this.saving === true` (line 191). The submit button is also `[disabled]="saving"` in the HTML. Both guards are present. No test exists to confirm this.

### Gate B: FE validation fires before dispatch
**Verdict: PASS for required/email; FAIL for length/range**
`companyName` has `Validators.required`. `companyEmail` has `Validators.required` and `Validators.email`. Both fire before `companyFacade.updateCompany` is called because `if (!this.companyDetailsForm.valid) { ... return; }` gates the dispatch (line 196).

However, `companyDetails` has `maxlength="1000"` in the HTML template but no `Validators.maxLength(1000)` on the `FormControl` (line 90). The HTML `maxlength` attribute prevents typing beyond 1000 chars but cannot catch programmatically patched values or API-level abuse. `numberOfEmployee` has no range validator. For both fields, BE is the sole programmatic safety net.

Additionally: the `err.status` network/permission routing bug (§4) means the `afterError` 403 and network branches never fire via the NgRx chain. The generic error modal shows instead.

### Gate C: BE validation catches missing/invalid fields
**Verdict: PASS (code-verified, not test-verified)**
Four validators are implemented: companyName required + 200-char max, companyEmail required + regex, companyDetails 1000-char max, numberOfEmployee 0–1,000,000 range. All emit structured `fieldErrors` with a `feedback` block. Field errors are batched (not short-circuit), so a single request can return multiple errors.

### Gate D: All 8 modal states reachable
**Verdict: PARTIAL**
All 8 states (`success`, `error`, `validation`, `network`, `partial`, `conflict`, `permission`, `session`) are defined in the `FeedbackState` type and handled in the modal HTML. However, only 4 states are actually opened by `afterError`: `validation`, `network` (bug: unreachable via NgRx), `permission` (bug: unreachable via NgRx), and `error`. The `partial`, `conflict`, and `session` states exist in the type union but have no callers in this component. They are reachable only if called directly with explicit data.

### Gate E: Auth/BOLA protection on PUT endpoint
**Verdict: PASS (code-verified, not test-verified)**
`verifyAuth` middleware is applied to `router.put("/company/update", verifyAuth, updateCompany)`. Inside `updateCompany`, `getUserCompanyForRequest` derives the authoritative company from the JWT. The BOLA guard (`userCompany.companyId !== companyId`) fires before any field validation or DB write. The `Array.isArray` guard handles the empty-company case. Return is a consistent `{ status: 'error', code: 'forbidden' }` shape.

### Gate F: Mobile bottom-sheet renders at ≤560px
**Verdict: UNKNOWN**
The `GhFeedbackModalComponent` uses `panelClass: 'gh-feedback-modal-panel'`. The SCSS for that class is in `gh-feedback-modal.component.scss` (not read — scss was out of scope). Whether a `@media (max-width: 560px)` bottom-sheet rule exists cannot be confirmed from the TS/HTML alone. Requires manual visual QA on a 375px viewport or a browser resize test.

### Gate G: No memory leaks (destroy$.complete, timer clearTimeout)
**Verdict: PASS (code-verified)**
`CompanyDetailsFormComponent.ngOnDestroy()` calls `this.destroy$.next()` then `this.destroy$.complete()` (line 413-415). All `companyFacade.*$` subscriptions use `takeUntil(this.destroy$)`. `GhFeedbackModalComponent.ngOnDestroy()` calls `clearTimeout(this.timer)` if the timer was set (line 60). No dangling subscriptions or timer leaks detected by code inspection.

---

## 12. Recommended Next Steps

### Highest priority: fix the `err.status` routing bug (P0)
The `afterError` method checks `err.status` but the NgRx `error$` stream carries the parsed body object (`err.error`), not the `HttpErrorResponse`. The HTTP status is dropped in the effects chain. Fix options:

**Option A (minimal, recommended):** In `company.effects.ts` `updateCompany$` catchError, pass a richer object:
```typescript
catchError((err) => {
  const errBody = (err && err.error) ? err.error : null;
  const payload = errBody
    ? { ...errBody, httpStatus: err.status }
    : { httpStatus: err && err.status, message: (err && err.message) || 'An error occurred' };
  return of(CompanyActions.updateCompanyFail({ payload }));
})
```
Then update `afterError` to check `errObj.httpStatus` instead of `err.status`.

**Option B:** Store `HttpErrorResponse` directly as the payload (wider change, affects reducer type).

### Second priority: add FE validators for companyDetails and numberOfEmployee (P1)
Add `Validators.maxLength(1000)` to `companyDetails` control and `Validators.min(0), Validators.max(1000000)` to `numberOfEmployee`. Add inline error divs for both. This closes the gap between FE UI (maxlength attribute) and FE form validation.

### Third priority: write the spec files (P0 for any future CI gate)
Recommended order:
1. `gh-feedback-modal.component.spec.ts` — smallest surface area, highest ROI, no NgRx
2. `company.effects.spec.ts` — verifies the catchError full-body pass-through
3. `company-details-form.component.spec.ts` — tests double-submit guard, error routing, snapshot diffing
4. BE Supertest suite starting with BOLA and validation tests

Run: `cd get-hired-FE && ng test --include="**/company/**" --code-coverage`

### Third priority: add `aria-describedby` to form inputs (A11y P1)
Give each error `<div>` a stable `id` (e.g., `id="err-companyName"`) and add `[attr.aria-describedby]="companyDetailsForm.get('companyName')?.invalid ? 'err-companyName' : null"` to the matching `<input>`. This is the only remaining accessibility gap flagged in §9.

### Deferred: install BE test framework
`npm install --save-dev jest supertest @babel/preset-env` in `get-hired-BE`. Update `package.json` `test` script to `jest`. Create `tests/` directory with the BOLA and validation tests from §8.
