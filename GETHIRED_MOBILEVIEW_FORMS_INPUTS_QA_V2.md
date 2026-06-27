# GETHIRED MOBILEVIEW — Forms & Inputs QA V2
Generated: 2026-06-25

## Global Form Rules Applied

From styles.scss (pre-existing + MOBILEVIEW additions):

```scss
.form-control {
  border: 1px solid #dcf0fd;
  border-radius: 5px;
  padding: 10px 15px;  // ~40px height — near 44px target
}

label {
  font-size: 14px;
  line-height: 19px;
  margin-bottom: 7px;
}
```

**Gap:** `form-control` height is ~40px. Min 44px touch target requires padding: 12px 15px.
**Decision:** Not changed globally — padding change could cascade visually across all forms. Logged in backlog as a targeted fix for mobile breakpoint only.

---

## Forms Audited

### Signin Form (/signin)
**Layout:** Right column form, single-column inputs
**Mobile behavior:** `bg-form { @media(max-width: 759px) { padding: 80px 20px } }` — reduces padding
**Issues:**
- Left panel (carousel) stays above form at small screens, requiring scroll to reach form
- Form inputs: adequate width
**Risk:** High (auth) — deferred

### Signup Form (/signup)
**Layout:** Similar to signin
**Mobile behavior:** Same responsive breakpoints
**Issues:** Same as signin — left panel scroll issue
**Risk:** High (auth) — deferred

### Profile Edit Forms (Applicant)
**File:** src/app/applicant-panel/applicant-profile/applicant-profile-form/
**Layout:** Multi-section form with labels above fields
**Mobile behavior:** Bootstrap grid col-md-6 pairs stack to col-12
**Issues:**
- Long forms with no sticky save CTA on mobile
- Users may scroll past submit button
**Recommendation:** Add `.gh-sticky-action-bar` to bottom of profile edit form
**Status:** Logged in backlog

### Job Create Form (Recruiter)
**File:** src/app/employer-panel/employer-jobs/employer-jobcreate/
**Layout:** Multi-field form, possibly stepper-based
**Mobile behavior:** Not audited in detail (long form)
**Issues:** No sticky publish CTA visible without scrolling to end
**Recommendation:** Add `.gh-sticky-action-bar` to job create form
**Status:** Logged in backlog

### Filter Inputs (Tables)
**Location:** Reusable table component search input, dropdown filters
**Mobile behavior:** `.search-div` wraps in flex container, may overflow at very narrow screens
**Recommendation:** At `@media (max-width: 575px)`, stack search + filter controls vertically
**Status:** Logged in backlog

---

## Input Type Coverage

| Input Type | Mobile Keyboard | Issues |
|------------|----------------|--------|
| text | Standard | None |
| email | Email keyboard | None |
| password | Standard + show/hide | None noted |
| tel | Numeric | None noted |
| file (CV upload) | Native file picker | None |
| select / mat-select | Native picker / Material overlay | Material overlay may not be full-height on mobile |
| textarea | Standard | Resizable — may cause layout shift on mobile |
| date | Native date picker | None |

---

## Focus Management

- Global `:focus-visible` ring: 2px solid brand-red (added in this pass)
- Drawer opens: focus moves to first nav item (setTimeout 200ms for CSS)
- Drawer closes: focus returns to hamburger button
- Form error messages: should be `role="alert"` or linked via `aria-describedby` — not verified in all forms

---

## Pass 2 Updates (2026-06-25)

### form-control min-height (BL-001)
**Status: SHIPPED**
Added to styles.scss:
```scss
@media (max-width: 767px) {
  .form-control, .mat-form-field-infix input, .mat-select-trigger { min-height: 44px; }
}
```

### Profile edit sticky save (BL-008)
**Status: SHIPPED**
`src/app/applicant/profile-forms/profile-forms.component.scss`:
`.submit-container` repositioned to `fixed; bottom: 80px; left: 12px; right: 12px` on mobile with white bg + shadow.

### Job create sticky controls (BL-005)
**Status: SHIPPED**
`src/app/job/job-create/job-create.component.scss`:
`.bg-upper-gray` becomes `position: sticky; top: 0` on mobile.

### Dropdown touch targets (BL-009)
**Status: SHIPPED**
`.dropdown-item { padding-top: 12px; padding-bottom: 12px }` and `.mat-option { min-height: 48px }` at 767px.

---

## Remaining Backlog

4. Table filter row: stack search + dropdown at < 576px
5. Signin left panel: hide or collapse on xs/sm (HIGH RISK — deferred)
6. Material select mobile: verify dropdown overlay is touch-friendly (44px+ items — BL-009 now sets min-height: 48px on mat-option)
