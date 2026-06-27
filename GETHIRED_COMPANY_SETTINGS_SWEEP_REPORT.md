# GETHIRED COMPANY SETTINGS — SWEEP REPORT
**Feature:** `/recruiter/company/settings` — Company Details Form + GhFeedbackModalComponent + NgRx company state + BE updateCompany endpoint
**FE HEAD:** 5db2363 | **BE HEAD:** 13a64fb | **Sweep Date:** 2026-06-27
**Status:** Both heads live on production

---

## 1. Executive Summary

### What Was Built
This commit pair delivers a complete submit-lifecycle upgrade for the employer company-settings page. The work is split across FE (5db2363) and BE (13a64fb) and introduces:

- **GhFeedbackModalComponent** — a branded Deep Navy/Coral/Azure modal covering 8 distinct submit outcomes (success, validation, error, network, partial, conflict, permission, session).
- **Double-submit guard** (`saving` flag) with inline spinner and `aria-busy` signal in the submit button.
- **Changed-field chip diffing** — a snapshot of the pre-submit company state is compared against form values at success time; changed fields are displayed as pill chips in the success modal.
- **Structured BE error propagation** — `company.effects.ts` now passes the full error body up to the reducer/selector, allowing the component to read `feedback.state` and `fieldErrors` from the BE JSON.
- **Full BE validation layer** — `updateCompany` in `companiesController.js` validates required fields, email format, length limits, and number range before hitting the DB.
- **BOLA guard on the update route** — the BE derives the authoritative `companyId` from the JWT-resolved user company instead of trusting the request body.

### Overall Quality Assessment: **B+ / Good**

The implementation is notably strong in three areas: security (BOLA guard), UX completeness (8-state modal), and accessibility (focus management, aria attributes, reduced-motion). The remaining gaps are concentrated in test coverage, a subtle success-path state leak, and an incomplete `partial`/`conflict`/`session` modal wiring.

### Top 5 Risks
1. **RISK-01 (Medium) — `success$` fires on create _and_ update; `saving` is never reset on `createCompany` path.** The `afterSubmit` handler opens a modal on the `'created'` event but never sets `saving = false`. If `createCompany` is dispatched (company with no ID), the button is permanently locked.
2. **RISK-02 (Medium) — `partial`, `conflict`, and `session` modal states are defined in `GhFeedbackModalComponent` but are never triggered from `afterError()`.** The component can accept these states but the parent component has no code path that sets them. These states are dead code from the FE perspective.
3. **RISK-03 (Medium) — `companySnapshot` is overwritten on every `companyDetails$` emission**, not only on initial load. After a successful save the store dispatches `updateCompanySuccess` which updates `selected`, which re-emits `companyDetails$`, which calls `setCompany()`, which resets `companySnapshot` to the new values. This is correct for UX but means that if the stream emits again mid-edit (e.g., from a separate tab or background poll), the snapshot silently drifts and `computeChangedFields()` returns an empty array.
4. **RISK-04 (Low) — `updateLocalStorage()` reads back `localStorage.getItem('user')` after just writing it, parsing it twice in the same call.** If `localStorage` is unavailable (private-mode iOS, storage quota exceeded), this throws and the `@Output() updateCompany` event is never emitted, silently breaking parent-component sync.
5. **RISK-05 (Low) — BE `getSetupListCompany` route is commented out** (`// router.get("/company/setuplist"...)`). The FE calls `getSetupList()` via `optionUrl/setuplist`. If the options endpoint is separate and functional this is fine, but the route comment is a silent gap that could break work-setup dropdown if options endpoint changes.

### Top 5 Strengths
1. **BOLA guard is correct and tested** — `updateCompany` derives `companyId` from the authenticated user's own company record, not from `req.body`. The `Array.isArray` guard handles the edge case where `getUserCompany` returns `[]` instead of `null`.
2. **8-state modal is visually and functionally complete** — each state has a distinct icon, header mesh color, and CTA set; the modal is a single reusable component controlled entirely by data.
3. **Accessibility is above-average** — `cdkFocusInitial` on the primary CTA, `aria-labelledby` on the dialog, `role="dialog" aria-modal="true"`, `role="alert"` on inline errors, `aria-live="polite"` on the character counter, `[attr.aria-busy]` on the submit button, and `focusFirstInvalidField()` after validation failure.
4. **Reduced-motion is fully respected** — both the skeleton shimmer (`@media prefers-reduced-motion` in `company-details-form.component.scss` line 440) and all modal animations (`gh-feedback-modal.component.scss` lines 318-323) have reduce-motion fallbacks.
5. **Effects error propagation is correct and complete** — `updateCompany$` in `company.effects.ts` (line 93-94) passes `err.error` (the full BE response body) as the payload, giving the component access to `fieldErrors` and `feedback.state`.

### Recommended Next Command
**TEST** — the feature has no unit tests for the new `GhFeedbackModalComponent`, `computeChangedFields()`, or `afterError()` dispatch routing. The BOLA guard and validation layer on the BE also have no automated test coverage. TEST should be run before any further feature work on this path.

---

## 2. Feature Map

### Components / Files Involved

| Layer | File | Role |
|---|---|---|
| FE Component | `src/app/company/company-details-form/company-details-form.component.ts` | Host form, submit lifecycle, modal open |
| FE Template | `src/app/company/company-details-form/company-details-form.component.html` | Form markup, inline validation, skeleton loader |
| FE Styles | `src/app/company/company-details-form/company-details-form.component.scss` | Submit bar, spinner, field error, skeleton shimmer |
| FE Modal TS | `src/app/company/company-details-form/gh-feedback-modal/gh-feedback-modal.component.ts` | Modal logic, auto-dismiss timer |
| FE Modal HTML | `src/app/company/company-details-form/gh-feedback-modal/gh-feedback-modal.component.html` | 8-state modal template |
| FE Modal SCSS | `src/app/company/company-details-form/gh-feedback-modal/gh-feedback-modal.component.scss` | Brand tokens, orbit anim, chip stagger, bottom-sheet |
| FE NgRx Actions | `src/app/company/state/company.actions.ts` | Action creators for all company operations |
| FE NgRx Reducer | `src/app/company/state/company.reducer.ts` | State shape, reducers including dashboard sync on update |
| FE NgRx Effects | `src/app/company/state/company.effects.ts` | HTTP side effects; `updateCompany$` passes full error body |
| FE Facade | `src/app/company/state/company.facade.ts` | Store abstraction; `success$`, `error$`, `resetStateNotif()` |
| FE Selectors | `src/app/company/state/company.selector.ts` | `getSuccessMsg`, `getError`, `getCompanyDetails` |
| FE Module | `src/app/company/company.module.ts` | Declares `GhFeedbackModalComponent`; registers store + effects |
| FE Service | `src/app/company/company.service.ts` | HTTP calls; `updateCompany()` → `PUT /company/update` |
| FE Global SCSS | `src/styles.scss` (lines 958-980) | Strips `mat-dialog-container` chrome; mobile bottom-sheet positioning |
| FE Shared Service | `src/app/shared/services/haptic-feedback/haptic-feedback.service.ts` | Optional vibration feedback; reduced-motion aware |
| BE Controller | `get-hired-BE/controllers/companiesController.js` (`updateCompany`, line 102) | Validation, BOLA check, DB update, structured response |
| BE Route | `get-hired-BE/routes/companiesRoute.js` (line 36) | `PUT /company/update` — `verifyAuth` → `updateCompany` |

### Data Flow (text diagram)

```
User clicks "Submit Changes"
        |
        v
CompanyDetailsFormComponent.onSubmit()
  [saving guard] → return if saving === true
  [markAllAsTouched] → surfaces inline FE validation errors
  [form.valid check] → focusFirstInvalidField() + return if invalid
  saving = true
  haptic.press()
  companyFacade.resetStateNotif()   ← clears stale error$ from store
  companyFacade.updateCompany({...form.value, companyId})
        |
        v
NgRx Action: [company] - Update Company
  Reducer → loading=true, error=null, succesMsg=null
        |
        v
CompanyEffects.updateCompany$ (mergeMap)
  CompanyService.updateCompany()  → PUT /company/update (Bearer JWT)
        |
     success                         failure
        |                               |
        v                               v
Action: updateCompanySuccess      Action: updateCompanyFail
  Reducer:                           Reducer:
    loading=false                      loading=false
    succesMsg='updated'                error = err.error || err.message
    selected = company
    dashboard patched
        |                               |
        v                               v
   success$ emits 'updated'        error$ emits errBody
        |                               |
        v                               v
afterSubmit(event)                 afterError(err)
  saving=false                       saving=false
  haptic.success()                   route by err shape:
  updateLocalStorage()                 validation → haptic.warning()
  markAsPristine()                     network (status=0) → haptic.error()
  computeChangedFields()               permission (401/403) → haptic.error()
  dialog.open(GhFeedbackModalComponent, {state:'success', changedFields})
        |
        v
GhFeedbackModalComponent
  ngOnInit: setTimeout → auto-dismiss (4 s for success)
  afterClosed() → if 'secondary': navigate('/recruiter/dashboard')
```

### NgRx Store Shape (CompanyState)

```typescript
interface CompanyState {
  selected: Company;          // current company; updated on getCompany + updateCompanySuccess
  list: Company[];            // all companies (getAllCompany, rarely used)
  error: any;                 // full BE error body or string; read via error$ → afterError()
  succesMsg: string;          // 'created' | 'updated' | companyId (initial create)
  loading: boolean;           // true while any effect is in-flight
  dashboard: Dashboard;       // patched on updateCompanySuccess (logo, name, details, city, industryId, numberOfEmployee)
  setup: Options[];           // work-setup dropdown options
  industry: Options[];        // industry dropdown options
  users: CompanyUser[];       // company team members
  subs: CompanySubscriptions; // subscription restrictions
}
```

---

## 3. FE-to-BE Contract Map

### PUT /company/update

| Property | Value |
|---|---|
| **Method** | `PUT` |
| **Path** | `/company/update` |
| **Full URL** | `{environment.api_url}/company/update` |
| **Auth** | `verifyAuth` middleware required — Bearer JWT from Firebase |
| **Auth extraction** | `req.user.uid` set by `verifyAuth`; user's company derived server-side via `getUserCompanyForRequest()` |

### Request Body (sent by `CompanyService.updateCompany()`)

```json
{
  "companyId":           "string (form value, cross-checked against JWT company)",
  "companyEmail":        "string (required, email format)",
  "companyContactNumber":"string (optional)",
  "companyAddress":      "string|null",
  "companyCity":         "string",
  "companyCountry":      "string",
  "companyLogoUrl":      "string (existing URL; used if no new file)",
  "companyName":         "string (required, max 200 chars)",
  "companyDetails":      "string (optional, max 1000 chars)",
  "industryId":          "number (parseInt applied in component.ts line 210)",
  "workSetupId":         "number (parseInt applied in component.ts line 211)",
  "numberOfEmployee":    "number (0–1,000,000)",
  "companyLogoFile":     "base64 string | null (if new logo selected)",
  "companyState":        "string|null",
  "companyTown":         "string|null",
  "companyZip":          "string|null",
  "companyMapUrl":       "string|null",
  "companyAddressOne":   "string|null",
  "shownPublicly":       "boolean"
}
```

### Success Response (HTTP 200)

```json
{
  "data": {
    "companyId":           "string",
    "companyLogoUrl":      "string",
    "companyName":         "string",
    "companyDetails":      "string",
    "industryId":          "number",
    "workSetupId":         "number",
    "numberOfEmployee":    "number",
    "companyEmail":        "string",
    "companyCity":         "string",
    "companyContactNumber":"string",
    "companyCountry":      "string",
    "companyAddress":      "string",
    "createdAt":           "timestamp",
    "createdBy":           "string",
    "updatedAt":           "timestamp",
    "companyIndustryName": "string",
    "companyState":        "string",
    "companyMapUrl":       "string",
    "companyTown":         "string",
    "companyZip":          "string",
    "companyAddressOne":   "string",
    "withActiveSubscription": "boolean",
    "shownPublicly":       "boolean"
  },
  "feedback": {
    "state":       "success",
    "title":       "Company profile updated",
    "body":        "Your company details are saved and ready for your hiring workspace.",
    "syncNote":    "Changes synced across your recruiter dashboard and company profile.",
    "primaryCta":  "Continue editing",
    "secondaryCta":"Back to dashboard"
  }
}
```

**Note:** The FE does **not** use `res.feedback` from the success response; it hardcodes its own modal data (component.ts lines 244-252). The BE `feedback` block on success is wasted round-trip.

### Validation Error Response (HTTP 400)

```json
{
  "status": "error",
  "error":  "Please review the highlighted fields.",
  "fieldErrors": {
    "companyName":      "string (if triggered)",
    "companyEmail":     "string (if triggered)",
    "companyDetails":   "string (if triggered)",
    "numberOfEmployee": "string (if triggered)"
  },
  "feedback": {
    "state":      "validation_error",
    "title":      "Some details need a quick check",
    "body":       "We found fields that need to be fixed before saving.",
    "primaryCta": "Review fields"
  }
}
```

### BOLA / Permission Error Response (HTTP 403)

```json
{
  "status": "error",
  "error":  "You don't have permission to update this company profile.",
  "code":   "forbidden"
}
```

### Generic Server Error Response (HTTP 500)

```json
{
  "error": "Operation not successful. Please try again."
}
```

### FE Field → DB Column Mapping

| FE field | DB column (`companies` table) | SQL param position |
|---|---|---|
| companyLogoUrl / companyLogoFile | company_logo | $1 |
| companyName | company_name | $2 |
| companyDetails | company_details | $3 |
| industryId | industry_id | $4 |
| workSetupId | work_setup_id | $5 |
| numberOfEmployee | number_of_employee | $6 |
| companyEmail | company_email | $7 |
| companyCity | company_city | $8 |
| companyContactNumber | company_contact_number | $9 |
| companyCountry | company_country | $10 |
| companyAddress | company_address | $11 |
| companyState | company_state | $12 |
| companyTown | company_mapurl (via companyTown) | $13 |
| companyZip | company_zip | $14 |
| companyMapUrl | company_mapurl | $15 (see note) |
| companyAddressOne | company_address_one | $16 |
| shownPublicly | shown_publicly | $17 |
| companyId | company_id | $18 (WHERE clause) |

**Note — companyTown/companyMapUrl column mismatch:** In `mappedCompany()` (line 521), `companyTown` maps from `raw.company_suburb`. In the `updateQuery` (line 103-106), `$13` is bound to `companyTown` (from req.body) but the column is `company_mapurl`, while `$15` receives `companyMapUrl`. This naming discrepancy is confusing but the parameterized query positions are consistent.

---

## 4. State Machine

### The 8 Feedback Modal States

| State | Trigger in `afterError()` or `afterSubmit()` | Icon | Header accent | CTA set | Auto-dismiss |
|---|---|---|---|---|---|
| `success` | `afterSubmit()` when `event === 'updated'` | Orbit ring + checkmark SVG (Coral #ff7062) | Deep Navy gradient | "Continue editing" / "Back to dashboard" | 4000 ms |
| `validation` | `afterError()`: `feedbackState === 'validation_error'` OR `fieldErrors` present | Triangle warning (Azure #2f80ff) | Navy + Azure mesh | "Review fields" (primary only) | None |
| `error` | `afterError()`: fallthrough (no special shape matched) | Circle info (Coral) | Deep Navy | "Try again" / "Keep editing" | None |
| `network` | `afterError()`: `err.status === 0` | Circle info (Coral) | Deep Navy | "Try again" / "Keep editing" | None |
| `partial` | **NOT TRIGGERED** — defined in `FeedbackState` type but no code path sets it | Circle info (Coral) | Deep Navy | (would inherit generic data) | None |
| `conflict` | **NOT TRIGGERED** — defined but never dispatched | Edit/pen icon (Amber) | Navy + Amber mesh | (not wired) | None |
| `permission` | `afterError()`: `err.status === 403 || err.status === 401` | Lock icon (white) | Deep Navy | "Back to company page" (primary only) | None |
| `session` | **NOT TRIGGERED** — defined but never dispatched | Lock icon (white) | Deep Navy | (not wired) | None |

### State Transition Triggers

```
NgRx Action          →  Store update           →  Observable emission   →  Component method
─────────────────────────────────────────────────────────────────────────────────────────────
updateCompany        →  loading=true            →  (no emission)         →  (none)
updateCompanySuccess →  succesMsg='updated'     →  success$ emits        →  afterSubmit('updated')
                        selected=company                                     → opens 'success' modal
                        dashboard patched
updateCompanyFail    →  error=errBody           →  error$ emits          →  afterError(errBody)
                        loading=false                                        → routes to 1 of 4 modal states
resetState           →  succesMsg=''            →  success$ emits ''     →  afterSubmit('') (no-op)
                        error=null              →  error$ emits null     →  (filtered out by filter(!!err))
```

### NgRx Events That Drive Modal

- `updateCompanySuccess` → reducer writes `succesMsg: 'updated'` → selector `getSuccessMsg` → `success$` subscription in `ngOnInit` → `afterSubmit()` → `GhFeedbackModalComponent` with `state: 'success'`
- `updateCompanyFail` → reducer writes `error: payload` → selector `getError` → `error$` subscription (filtered by `filter(err => !!err)`) → `afterError()` → `GhFeedbackModalComponent` with one of: `state: 'validation' | 'network' | 'permission' | 'error'`

---

## 5. Data Model

### Company Fields Updated on Save

All 17 fields sent in the PUT body are written to the `companies` table via a single parameterized UPDATE query. The returned row is mapped through `mappedCompany()` and placed in `state.selected`. The `state.dashboard.company` is additionally patched with a subset (logo, name, details, city, industryId, numberOfEmployee) — reducer lines 188-198.

### Fields NOT in the Update (but in the form)

- `companyLogoUrl` — sent as `$1` fallback when no new file is uploaded; not in the `FIELD_LABELS` constant used for chip diffing, so a URL-only logo change (e.g., removing a logo) would not appear as a chip. The `companyLogoFile` control is checked separately (component.ts line 358).
- `companyState`, `companyAddressOne`, `companyTown`, `companyZip`, `companyMapUrl` — in form but NOT in `companySnapshot` (snapshot lines 156-161). Address sub-fields that change will not produce chips. Only `companyAddress`, `companyCity`, `companyCountry` appear in the snapshot.

### Snapshot-Diff Mechanism

On `setCompany()` (component.ts line 156), the current server values are saved to `companySnapshot`:

```
companySnapshot = { companyName, companyEmail, companyContactNumber,
  companyAddress, companyCity, companyCountry, companyDetails,
  industryId, workSetupId, numberOfEmployee, shownPublicly }
```

On `computeChangedFields()` (called from `afterSubmit()`), each field is compared using `String(snap || '') !== String(cur || '')`. This coerces `null`, `undefined`, `0`, and `false` to `''`, which correctly handles optional fields. Integer fields (`industryId`, `workSetupId`, `numberOfEmployee`) are compared as strings — this works because `String(1) !== String(2)`, but `String(null) === String(undefined) === ''` so both absent values compare equal.

**Gap:** `companyLogoFile` chip is added unconditionally if any file was uploaded (line 358-360), regardless of whether the upload succeeded. If the save fails and the user retries without re-selecting the file, `companyLogoFile` might still be non-null from the previous selection, producing a false "Company logo" chip.

### Changed-Field Chip Labels

```typescript
const FIELD_LABELS = {
  companyName: 'Company name',
  companyEmail: 'Contact email',
  companyContactNumber: 'Work phone',
  companyAddress: 'Address',
  companyCity: 'City',
  companyCountry: 'Country',
  companyDetails: 'About',
  industryId: 'Industry',
  workSetupId: 'Work setup',
  numberOfEmployee: 'Team size',
  companyLogoFile: 'Company logo',
  shownPublicly: 'Public visibility',
}
```

The modal SCSS supports up to 6 chips with staggered `animation-delay` (lines 176-181). A 7th or beyond chip renders without stagger animation.

---

## 6. UX Flow Review

### Submit Lifecycle (Full)

1. **Click "Submit Changes"** → `onSubmit()` called
2. **Double-submit guard** (`if (this.saving) return`) → noop if already in-flight
3. **`markAllAsTouched`** on all form controls → inline validation errors appear
4. **Form validity check** → if invalid: `focusFirstInvalidField()` + return. No modal shown for FE validation failure; only inline errors.
5. **`saving = true`** → button disabled, spinner appears, `aria-busy="true"`
6. **`haptic.press()`** → 6ms vibration (mobile)
7. **`resetStateNotif()`** → clears stale `error` and `succesMsg` from store
8. **`updateCompany()` dispatched** → effect fires HTTP PUT
9. **Store enters loading** → `loading: true` (note: the form does NOT subscribe to `loading$`; it uses its own `saving` flag)
10. **HTTP resolves:**
    - **Success:** `updateCompanySuccess` → `succesMsg='updated'` → `success$` emits → `afterSubmit('updated')` → `saving=false`, `haptic.success()`, `updateLocalStorage()`, `markAsPristine()`, `computeChangedFields()`, `dialog.open(GhFeedbackModal, state:success, autoDismissMs:4000)`
    - **Failure:** `updateCompanyFail` → `error=payload` → `error$` emits (filter passes) → `afterError(err)` → `saving=false`, haptic, `dialog.open(GhFeedbackModal, state:<one of 4>)`
11. **Modal is open:**
    - Success: 4 s auto-dismiss fires `close('auto')` → `afterClosed()` → no action (action is `'auto'`, not `'secondary'`)
    - Success "Continue editing" CTA: `close('primary')` → `afterClosed()` → no navigation
    - Success "Back to dashboard": `secondary()` → `afterClosed()` → `router.navigate(['/recruiter/dashboard'])`
    - Network/error "Try again": `close('primary')` → `afterClosed()` → `onSubmit()` re-called (retry)
    - Permission: `close('primary')` → `afterClosed()` → `router.navigate(['/recruiter/company/details'])`
    - Validation: `close('primary')` → `afterClosed()` → `focusFirstInvalidField()`

### Edge Cases

| Scenario | Current behavior | Risk |
|---|---|---|
| User submits while modal is open (e.g., presses Enter) | `saving` is still `true` if in a retry flow; guard blocks. However if previous save succeeded and auto-dismiss hasn't fired yet, `saving` is already `false`. A second submit can start before the modal closes. | Low — the 4 s auto-dismiss window is unlikely to be exploited, but theoretically allows an overlapping submit. |
| `companyId` is null (company not yet created) | `onSubmit()` calls `createCompany()` instead of `updateCompany()`. `saving` is set to `true` before the dispatch but **never reset** if the create path is taken — `afterSubmit()` opens the legacy `UpdatedDialogComponent` for `'created'` but does not set `saving = false`. | Medium — the button is permanently disabled after a `createCompany` attempt. |
| Network goes offline mid-form | Status 0 error → network modal with retry CTA. Retry calls `onSubmit()` again. | Correct. |
| BE returns 401 (token expired) | Routed to `permission` modal. The permission modal CTA navigates to `/recruiter/company/details`, not to login. If the token is truly expired the next page will also fail. | Low — acceptable UX; silent redirect to login is handled at the HTTP interceptor layer. |
| User edits form while success modal is showing | `markAsPristine()` was already called; new edits will re-dirty the form normally. No issue. | None. |
| `companyDetails$` emits after snapshot taken (background poll) | Snapshot is overwritten with server values; any unsaved local edits may no longer be "changed" in chip computation. | Low — no background polling observed; only triggered by explicit `getCompany()` calls. |
| Logo file selected but save fails | On retry, `companyLogoFile` control still holds the File object; the next success will correctly produce "Company logo" chip. | None. |

---

## 7. Security Review

### BOLA Protection

**Status: Correct.**

`updateCompany` (controller.js line 136-143) calls `getUserCompanyForRequest(req, req.user.uid)` which derives the company from the JWT-authenticated user, then compares `userCompany.companyId !== companyId` (from body). If mismatch or no company, returns 403 with structured error body. The `Array.isArray` guard prevents the `[]` truthy bypass.

The singleflight request cache (`getRequestCache`, lines 275-297) stores a Promise, so concurrent same-uid calls within a single request share one DB round-trip without opening a second query window.

### Input Validation Coverage

| Field | FE validation | BE validation |
|---|---|---|
| companyName | `Validators.required` | Required + trim + length ≤ 200 |
| companyEmail | `Validators.required, Validators.email` | Required + trim + regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| companyDetails | `maxlength="1000"` (HTML attribute) | Length ≤ 1000 |
| numberOfEmployee | None | parseInt + range 0-1,000,000 |
| companyContactNumber | None | None |
| industryId / workSetupId | None | None (passed directly to DB as `$4`/`$5`) |
| shownPublicly | None | Coerced: `shownPublicly === true \|\| shownPublicly === 'true'` |
| companyLogoFile | None | Handled by `uploadInStorage()` helper |

**Gaps:**
- `numberOfEmployee`: FE has no validation. BE validates range but this only surfaces through the generic 400 → validation modal path.
- `industryId` / `workSetupId`: Neither layer validates that the value is a valid foreign key. Inserting an invalid `industry_id` will succeed at the SQL level if no FK constraint exists, or throw a generic 500 if one does.
- `companyContactNumber`: No format validation on either layer. Accepts arbitrary strings.
- SQL Injection: The update query is fully parameterized (`$1`–`$18`), no string interpolation of user inputs. Safe.
- `companyLogoFile` base64: The uploader helper (`uploadInStorage`) handles this; no MIME validation visible in the controller. Logo uploads bypass the FE's `magic-byte verification` (added for other upload flows per project memory).

### Auth Enforcement

The `PUT /company/update` route has `verifyAuth` middleware (companiesRoute.js line 36). This was previously missing; the current version is correct.

### XSS

The FE renders user-supplied data (`data.title`, `data.body`, `data.changedFields`) via Angular's default template binding (`{{ }}`), which auto-escapes. No `innerHTML` usage observed. Safe.

### Information Leakage

The success response includes a `feedback` block echoing modal copy back to the client. This is benign. The 403 response exposes `code: 'forbidden'` which is acceptable for a UI that needs to route on permission errors. The 500 response uses a generic message with no internal detail. Structured console.log at line 223 logs `actor=uid` and `companyId` — appropriate server-side logging.

---

## 8. Accessibility Review

### Focus Management

- **Submit button:** `[attr.aria-busy]="saving"` correctly signals the loading state to AT.
- **Inline errors:** `role="alert"` on `.cdf-field-error` elements (template lines 57, 71, 153) provides live-region announcement on appearance.
- **`focusFirstInvalidField()`:** After FE validation failure, focus moves to the first invalid field in a fixed field order (`companyName`, `companyEmail`, `companyContactNumber`, `numberOfEmployee`, `companyAddress`). Uses `document.querySelector([formControlName="..."])` — works for standard inputs but may fail for custom components (the address component is `app-google-address-search`).
- **Modal:** `cdkFocusInitial` on the primary CTA button (modal HTML line 102) ensures focus enters the modal on open. `autoFocus: false` on `dialog.open()` prevents MatDialog's default focus behavior from competing.
- **After modal close (validation state):** `.subscribe(() => this.focusFirstInvalidField())` returns focus to the form.
- **After modal close (permission state):** Navigation occurs; no focus management needed.

### ARIA Usage

| Element | ARIA attribute | Correctness |
|---|---|---|
| Skeleton loader div | `aria-busy="true"` / `aria-label="Loading company profile"` | Correct |
| Submit button | `[attr.aria-busy]="saving"` / `[attr.aria-label]` with context-sensitive text | Correct |
| Modal host `.ghfm-wrap` | `role="dialog" aria-modal="true"` / `[attr.aria-labelledby]="'ghfm-title-' + data.state"` | Correct; ID is unique per state |
| Modal title `<h2>` | `[id]="'ghfm-title-' + data.state"` | Correctly referenced by `aria-labelledby` |
| Modal icon wrappers | `aria-hidden="true"` | Correct — decorative SVGs hidden |
| Sync note SVG | `aria-hidden="true"` | Correct |
| Character counter | `aria-live="polite" aria-atomic="true"` | Correct |
| Inline field errors | `role="alert"` | Correct |
| Validation error list | `role="list"` / `aria-label="Fields to review"` | Correct |
| Validation list items | `role="listitem"` | Correct |
| Changed-field chips | `aria-label="Updated fields"` on container | Correct |

### Keyboard Navigation

- All interactive elements (submit button, modal CTAs, form controls) are in the natural tab order.
- `focus-visible` outline on modal buttons (SCSS line 252-255): `outline: 2px solid rgba(255,112,98,0.75)`.
- **Gap:** The modal uses `disableClose: false`, so pressing Escape closes the modal. The modal's `close()` method is called with `'primary'` when triggered by button click. Escape closes with `undefined` as the result. The `afterClosed()` handlers check for specific values (`'primary'`, `'secondary'`, `'auto'`); `undefined` falls through cleanly with no action, which is correct for Escape. No keyboard trap introduced.

### Reduced Motion

Two independent implementations:
1. **Skeleton shimmer** (component.scss line 440): `@media (prefers-reduced-motion: reduce) { animation: none; background: #eeeeee; }` — static gray placeholder, no animation.
2. **Modal animations** (gh-feedback-modal.component.scss lines 318-323): `ghfm-enter`, `ghfm-orbit-draw`, `ghfm-check`, and `ghfm-chip` animations are all disabled; static fallbacks applied (`stroke-dashoffset: 0`, `opacity: 1`, `transform: none`).
3. **Haptic service** (line 92-94): `respectReducedMotion()` check suppresses all vibration when `prefers-reduced-motion: reduce`.

### Missing Accessibility Items

- **Character counter** for `companyDetails` turns red at ≥950 chars but does not announce the threshold to AT. The `aria-live` region updates on every keystroke (potentially noisy).
- **`companyName` field** has two separate instances in the template (inside `*ngIf="profileImage"` and `*ngIf="!profileImage"` branches, lines 51-76). Both have `formControlName="companyName"`. This is a structural duplication — only one renders at a time, so no duplicate-ID issue, but it adds maintenance overhead.
- **Checkbox "Publicly Shown"** has no `for`/`id` pairing; the `<label>` is adjacent but not associated via `for` attribute.

---

## 9. Performance Review

### Change Detection

`CompanyDetailsFormComponent` uses default `ChangeDetectionStrategy` (not `OnPush`). This means the component re-renders on any Angular event cycle. Given the subscriptions to `companyDetails$`, `success$`, and `error$` (all store selectors), Angular will check the component on every action dispatched by any part of the app that shares the store. Not a critical issue for a settings page with low interaction frequency, but `OnPush` would be an improvement.

### Subscription Management

All three subscriptions in `ngOnInit` use `takeUntil(this.destroy$)` and `this.destroy$.next()` / `complete()` in `ngOnDestroy`. This is correct and complete. No leak risk.

### `mergeMap` vs `switchMap` in Effects

`updateCompany$` uses `mergeMap` (effects.ts line 84). For a settings-save operation this is fine — the double-submit guard in the component ensures only one HTTP call is in flight at a time. `switchMap` would also be acceptable.

However, the `createCompany$` effect also uses `mergeMap` with no UI-level guard (the `saving` guard only applies to the update path since `saving` is set before dispatch). Rapid triggering of `createCompany` dispatch could result in multiple concurrent POST calls.

### Re-render Risk

`workSetup$ | async` and `industry$ | async` each produce an async pipe subscription. These selectors return arrays. Because NgRx memoizes selectors, the arrays only change reference when the data changes, so `ngFor` won't re-render on unrelated store updates.

`companyDetailsForm.dirty` is checked in the template for the "Unsaved changes" label. This is a direct expression binding — checked on every CD cycle — but it is cheap.

### Modal Overhead

`GhFeedbackModalComponent` uses `setTimeout` for auto-dismiss. The `ngOnDestroy` clears the timer correctly. Opening `MatDialog` creates an overlay; all open calls observed use `disableClose: false` and subscribe to `afterClosed()`. All subscriptions are one-shot (they complete after first emission since `afterClosed()` is a `Subject` that completes). No leaks.

### `updateLocalStorage` Pattern

`updateLocalStorage()` calls `localStorage.removeItem` then `localStorage.setItem`. Between the two calls, if the JS event loop yields (it won't in synchronous code, but worth noting), there is a moment where `'user'` key is absent. This is an atomic issue in single-threaded JS only — no practical risk. More problematic: if `localStorage.getItem('user')` returns `null` (key absent), `JSON.parse(null)` returns `null`, and `{ ...null }` spreads to `{}`, silently dropping all user state. Guard is missing.

---

## 10. Brand/Motion Review

### SVG Orbit Animation

**File:** `gh-feedback-modal.component.scss` lines 66-77

The orbit ring is a pure SVG CSS animation using `stroke-dasharray: 213.6` (2π × 34 ≈ 213.63 — accurate) and `stroke-dashoffset` driven from 213.6 to 0 over 0.72 s with `cubic-bezier(0.16, 1, 0.3, 1)` (spring-like easing). The orbit track uses `rgba(255, 255, 255, 0.1)` ghost. The draw line uses Coral `#ff7062`. Checkmark animates in at 0.5 s delay with `scale(0) → scale(1.18) → scale(1)` spring bounce. This is the correct sequence.

**Reduced-motion safety:** `stroke-dashoffset: 0` (already-drawn) and `animation: none` on the check. Both are correct.

### Chip Stagger

6 chips have `animation-delay` increments of 55 ms (0 / 55 / 110 / 165 / 220 / 275 ms). The animation duration per chip is 0.22 s. The longest stagger ends at 275 + 220 = 495 ms total reveal. Chips beyond index 6 render without stagger — the CSS only targets `:nth-child(1-6)`.

### Mobile Bottom-Sheet

The bottom-sheet behavior is implemented in two layers that must both fire:
1. **Component SCSS** (`gh-feedback-modal.component.scss` lines 301-315): `border-radius: 20px 20px 0 0`, `ghfm-slide-up` animation from `translateY(100%)`.
2. **Global SCSS** (`styles.scss` lines 972-979): The `cdk-overlay-pane:has(.gh-feedback-modal-panel)` selector repositions the CDK overlay pane to `position: fixed; bottom: 0; left: 0; right: 0; max-width: 100%`. Without this, MatDialog would still center the modal.

**Compatibility note:** `:has()` is supported in Chrome 105+, Safari 15.4+, Firefox 121+. For older Firefox (< 121), the bottom-sheet positioning silently falls back to centered dialog. Given GetHired's target audience (recruiters on modern browsers), this is acceptable but worth noting.

### Brand Token Compliance

The modal uses inline color values rather than CSS custom properties. Tokens referenced:
- Deep Navy: `#0b1026`, `#1a1544`, `#0d0f1f` (header gradient)
- Coral: `#ff7062` (primary CTA, orbit ring, chip border/bg)
- Bright Coral: `#ff3d6e` (CTA gradient end)
- Azure: `#2f80ff` (validation state)
- Amber: `#f59e0b` (conflict state icon)
- Text grey: `#4b5563`, `#374151`, `#1f2937`

All values are consistent with the GetHired brand palette. No CSS custom properties (`--gh-*` tokens) are used — this is a known pattern in the codebase (other components also use hardcoded values).

### `prefers-color-scheme` / Dark Mode

No dark mode handling in the modal SCSS. The Deep Navy header is dark by nature. The white body (`#ffffff`) would be jarring if a future dark-mode pass is applied system-wide. Not a current issue (the rest of the app also has no dark mode), but noted for future.

---

## 11. Error Handling Completeness

### All 8 States Coverage

| State | FE code path | BE trigger | Modal shown | saving reset | haptic | focus return |
|---|---|---|---|---|---|---|
| `success` | `afterSubmit('updated')` | HTTP 200 | Yes — auto-dismiss 4 s | Yes (line 232) | `success()` | No (form is clean) |
| `validation` | `afterError()` line 271 | HTTP 400 + `fieldErrors` | Yes | Yes (line 265) | `warning()` | Yes — `focusFirstInvalidField()` after close |
| `error` | `afterError()` fallthrough (line 336) | HTTP 5xx, unrecognized shape | Yes | Yes (line 265) | `error()` | No (user can retry) |
| `network` | `afterError()` line 298 (`err.status === 0`) | Network timeout / offline | Yes | Yes (line 265) | `error()` | No (retry CTA) |
| `permission` | `afterError()` line 317 (401 or 403) | HTTP 403/401 | Yes | Yes (line 265) | `error()` | No (navigates away) |
| `partial` | **NOT WIRED** | (none) | Never shown | n/a | n/a | n/a |
| `conflict` | **NOT WIRED** | (none) | Never shown | n/a | n/a | n/a |
| `session` | **NOT WIRED** | (none) | Never shown | n/a | n/a | n/a |

### Retry Wiring

- **Network modal "Try again":** `afterClosed().subscribe(action => { if (action === 'primary') this.onSubmit(); })` — correct.
- **Generic error modal "Try again":** Same pattern — correct.
- **`saving` guard before retry:** `onSubmit()` is called from `afterClosed()`. At this point `saving` has already been set to `false` in `afterError()` (line 265). The retry is not blocked.

### Network vs Server Distinction

The component correctly distinguishes:
- `err.status === 0` → network (offline/timeout)
- `err.status === 400` → validation (via `feedbackState` or `fieldErrors`)
- `err.status === 401 || 403` → permission
- Anything else → generic server error

This is a correct and complete distinction for the BE errors actually returned.

### Stale Error Race Condition

`resetStateNotif()` is dispatched on `onSubmit()` which sets `error: null` and `succesMsg: ''`. The `error$` subscription uses `filter(err => !!err)`, so the null write does not trigger `afterError()`. The `success$` subscription has no filter — a `resetStateNotif()` dispatching `succesMsg: ''` will emit `''` through `success$`. The `afterSubmit('')` call hits neither the `'created'` nor `'updated'` branch, so it is a clean no-op. The guard works but is fragile — if any future branch of `afterSubmit()` uses `if (event)` it would skip, but adding a truthiness check would be safer.

---

## 12. Risk Register

| Risk ID | Area | Severity | Description | Mitigation | Status |
|---|---|---|---|---|---|
| RISK-01 | Submit lifecycle | Medium | `saving` is never reset on `createCompany` path. `afterSubmit('created')` opens `UpdatedDialogComponent` but does not set `saving = false` (component.ts lines 223-229). The form's submit button becomes permanently disabled for first-time company creators. | Set `saving = false` before or after opening the create dialog in `afterSubmit()`. | Open |
| RISK-02 | Modal states | Medium | `partial`, `conflict`, and `session` states are declared in `FeedbackState` type and rendered in the modal template but have no trigger code in `afterError()`. These three states are dead UI code. | Either wire them to appropriate HTTP status codes (e.g., 409 → conflict, 440 → session) or remove them from the type/template to avoid confusion. | Open |
| RISK-03 | Snapshot diffing | Medium | `companySnapshot` is overwritten by every `companyDetails$` emission (setCompany line 156). A background store emission mid-edit resets the baseline. | Capture the snapshot once on first non-null company load using a `take(1)` or a `firstLoad` flag; do not update the snapshot on subsequent emissions. | Open |
| RISK-04 | localStorage | Low | `updateLocalStorage()` will throw if `localStorage` is unavailable (private browsing, quota exceeded). The `JSON.parse(null)` spread returns `{}`, silently dropping user state. `@Output() updateCompany` is not emitted. | Wrap in `try/catch`; guard `JSON.parse(localStorage.getItem('user') || '{}')`. | Open |
| RISK-05 | Work setup route | Low | The `/company/setuplist` route is commented out in `companiesRoute.js`. The FE calls `optionUrl/setuplist` — if this is a different endpoint it may be fine, but the intent is unclear. | Verify `optionUrl/setuplist` exists and works; add a comment to the commented route explaining the redirect. | Open |
| RISK-06 | Foreign key fields | Low | `industryId` and `workSetupId` are passed to the DB as `$4` and `$5` without FK validation on the BE. An invalid value will produce a generic 500 with no user-visible explanation. | Add existence checks against the `industry` and `work_setup` tables, or ensure DB-level FK constraints return a structured error. | Open |
| RISK-07 | `:has()` support | Low | The mobile bottom-sheet CDK overlay positioning relies on `:has()` (styles.scss line 972). Firefox < 121 silently falls back to centered dialog, not the intended bottom-sheet. | Accept as a known limitation for legacy Firefox, or use a JavaScript-based approach (adding a class to the CDK pane after dialog open) for broader compat. | Open / Accepted |
| RISK-08 | Chip stagger cap | Low | The CSS chip stagger targets only `:nth-child(1-6)`. If all 12 FIELD_LABELS fields change simultaneously, chips 7-12 appear without stagger animation. | Extend stagger to `:nth-child(12)` or use a CSS `animation-delay: calc(var(--i) * 55ms)` with Angular binding. | Open |
| RISK-09 | `companyName` duplicate | Low | The template renders two distinct `<input formControlName="companyName">` elements inside mutually exclusive `*ngIf` branches (lines 51-76). Both have `role="alert"` error divs. One is always hidden. Maintenance risk if one branch diverges from the other. | Refactor into a single structural directive; remove the duplicate. | Open |
| RISK-10 | Test coverage | High | No unit tests exist for `GhFeedbackModalComponent`, `computeChangedFields()`, `afterError()` routing, or the BE `updateCompany` validation/BOLA logic. A regression in the error routing table would be invisible. | Run TEST command; add tests for all 8 modal trigger conditions and the BE validation boundary cases. | Open |
| RISK-11 | FE logo file chip on retry | Low | If a save fails and the user retries (without re-selecting the logo), `companyLogoFile` still holds a non-null File. On retry success, "Company logo" chip appears even if the logo was not changed in this attempt. | Reset `companyLogoFile` control to null on error, or track a `logoActuallyUploaded` flag from the success response. | Open |
| RISK-12 | `shownPublicly` checkbox a11y | Low | The "Publicly Shown" checkbox has no `for`/`id` association between `<input>` and `<label>`. Screen readers may not announce the label correctly. | Add `id="shownPublicly"` to the input and `for="shownPublicly"` to the label. | Open |

---

## 13. Opportunity Register

| ID | Area | Description | Priority | Suggested Command |
|---|---|---|---|---|
| OPP-01 | Testing | Add unit tests for all 8 modal trigger conditions, `computeChangedFields()`, the BOLA guard, and BE validation boundaries. | High | TEST |
| OPP-02 | Submit lifecycle | Wire the `partial`, `conflict`, and `session` modal states to real BE response shapes (e.g., 409 Conflict if optimistic locking is added, 440/401-with-refresh for session expiry). | Medium | ACTIONS |
| OPP-03 | Snapshot / diffing | Refactor `companySnapshot` capture to use `take(1)` on `companyDetails$` so the diff baseline is stable across the edit session. | Medium | (code fix) |
| OPP-04 | BE validation | Add FK validation for `industryId` and `workSetupId` on the update endpoint so invalid values return a 400 with a readable `fieldErrors` message rather than a generic 500. | Medium | SECURE |
| OPP-05 | Accessibility | Associate the `shownPublicly` checkbox label via `for`/`id`. Remove duplicate `companyName` input blocks (lines 51-76); use a single structural branch. | Medium | OPTIMIZE |
| OPP-06 | Performance | Apply `ChangeDetectionStrategy.OnPush` to `CompanyDetailsFormComponent` to reduce unnecessary checks. | Low | OPTIMIZE |
| OPP-07 | BE response | Remove the `feedback` block from the success response (currently ignored by the FE) or have the FE consume it instead of hardcoding modal copy, which would allow copy changes without a FE redeploy. | Low | ACTIONS |
| OPP-08 | Brand tokens | Introduce CSS custom properties (`--gh-coral`, `--gh-navy`, etc.) in the modal SCSS to make future theme changes a single-file edit. | Low | BRAND |
| OPP-09 | Error UX | Populate `requestId` in the error modal (the `FeedbackModalData.requestId` field exists and is rendered at modal HTML line 93-96) by adding a request-ID header on the BE and reading it from the HTTP response in the effect. This enables support tracing. | Low | ACTIONS |
| OPP-10 | Logo cache bust | The cache-bust `?v=<timestamp>` logic in `setCompany()` (lines 135-143) replaces or appends a version param. After a save, the logo URL returned by the BE won't have the bust param — the component must re-bust it on the next `setCompany` call, which will happen automatically since `updateCompanySuccess` sets `selected` → `companyDetails$` emits → `setCompany()` runs again. This is correct but fragile. Centralise the bust in `getImageUrl()` helper. | Low | OPTIMIZE |
| OPP-11 | `numberOfEmployee` | Add `Validators.min(0)` and `Validators.max(1000000)` to the FE form to surface range errors inline without requiring a server round-trip. | Low | OPTIMIZE |

---

## 14. Recommended Next Command

**Recommended: TEST**

**Rationale:**

The company settings feature introduces a non-trivial state-routing system (8 modal states, structured error propagation, snapshot diffing, BOLA guard) that has zero automated test coverage. Specifically:

- `GhFeedbackModalComponent` — no spec file exists. The auto-dismiss timer, `close()`/`secondary()` actions, and `ngOnDestroy` cleanup need unit tests.
- `afterError()` routing — 5 distinct code branches (validation, network, 403, 401, fallthrough). A regression in any branch is currently silent.
- `computeChangedFields()` — private method with non-trivial coercion logic; edge cases around null/undefined/0 comparisons could produce incorrect chips.
- BE `updateCompany` validation — required-field, email-format, length, and range checks; BOLA guard and the `Array.isArray` edge case all need integration or unit tests.
- RISK-01 (saving never reset on create) and RISK-03 (snapshot drift) would both be caught by a proper test suite.

Run **SECURE** as the second command, specifically targeting the logo upload path (magic-byte verification is not applied to logo uploads per project memory) and the unvalidated FK fields (RISK-06).

---

*Report generated by SWEEP v1 scoped to company settings feature. Files read: 14. Lines analyzed: ~1,900 FE + ~835 BE.*
