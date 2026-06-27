# GETHIRED MOBILEVIEW — Backlog V2
Generated: 2026-06-25
**Pass 2 update: 2026-06-25 — BL-001 through BL-009 and BL-013, BL-014 SHIPPED**

Prioritized backlog of mobile improvements not shipped in this pass.

---

## Priority 1 — High Impact, Low Risk

### ✅ MOBILE-BL-001: form-control min-height 44px at mobile — SHIPPED Pass 2
**File:** src/styles.scss
**Status:** Done. Added min-height: 44px for .form-control, mat-form-field-infix input, mat-select-trigger at max-width 767px.

### ✅ MOBILE-BL-002: Applicant panel — close drawer returns focus to hamburger button — SHIPPED Pass 2
**File:** src/app/applicant-panel/applicant-panel.component.ts + .html
**Status:** Done. ViewChild + setTimeout focus return implemented.

### ✅ MOBILE-BL-003: Admin panel — close drawer returns focus to hamburger button — SHIPPED Pass 2
**File:** src/app/admin-panel/admin-panel.component.ts + .html
**Status:** Done. Same pattern as BL-002.

### ✅ MOBILE-BL-004: Snackbar — position above bottom nav on mobile — SHIPPED Pass 2
**File:** src/styles.scss
**Status:** Done. margin-bottom: 80px !important at max-width 767px.

### ✅ MOBILE-BL-005: Sticky publish CTA on job create form — SHIPPED Pass 2
**File:** src/app/job/job-create/job-create.component.scss
**Status:** Done. .bg-upper-gray becomes position: sticky; top: 0 on mobile. .adjust-flex reset to static so buttons stay in view.

---

## Priority 2 — Medium Impact, Low Risk

### MOBILE-BL-006: Apply `.gh-responsive-table` to recruiter contacts table
**File:** src/app/employer-panel/employer-contacts/employer-contacts.component.html
**Status:** Deferred — contacts use app-reusable-table which already has its own mobile layout (#table-container-mobile). The gh-responsive-table pattern would conflict with the existing dual-table approach. No change needed.
**Risk:** Medium if forced — would break existing mobile table.

### MOBILE-BL-007: Apply `.gh-responsive-table` to admin tables (users, jobs, companies)
**Status:** Deferred — same reason as BL-006. Reusable table already has mobile layout built in.

### ✅ MOBILE-BL-008: Profile edit — sticky save button — SHIPPED Pass 2
**File:** src/app/applicant/profile-forms/profile-forms.component.scss
**Status:** Done. .submit-container repositioned to fixed bottom: 80px on mobile with white background and shadow.

### ✅ MOBILE-BL-009: Dropdown item touch targets — SHIPPED Pass 2
**File:** src/styles.scss
**Status:** Done. padding-top/bottom: 12px on .dropdown-item; min-height: 48px on .mat-option at max-width 767px.

### MOBILE-BL-010: Dialog bottom-sheet style at mobile
**File:** styles.scss
**Change:** At max-width 767px, override `mat-dialog-container` border-radius to `16px 16px 0 0` and position at bottom
**Risk:** Medium — affects all dialogs app-wide; needs regression testing across all dialog-using components
**Impact:** More native-feeling modal UX on mobile

---

## Priority 3 — Low Impact or High Risk (deferred)

### MOBILE-BL-011: Focus trap within nav drawer
**Change:** Create `FocusTrapDirective` or use CDK `A11yModule`'s `cdkTrapFocus`
**Risk:** Medium — requires new Angular CDK dependency or custom directive + declaration in module
**Impact:** Keyboard users cannot tab outside drawer when open (WCAG 2.1 AA)
**Note:** Angular CDK provides `FocusTrap` — but adding `A11yModule` import needs care

### MOBILE-BL-012: Signin/signup — hide carousel panel on mobile
**File:** src/app/auth/signin/signin.component.html
**Change:** Add `d-none d-lg-block` to left carousel column
**Risk:** HIGH — auth flow; signin/signup used by all users; visual regression if done incorrectly
**Decision:** Deferred. Requires dedicated testing session.

### ✅ MOBILE-BL-013: Pagination controls stack on mobile — SHIPPED Pass 2
**Files:** src/styles.scss + src/app/shared/components/reusable-table/reusable-table.component.html
**Status:** Done. Added .pagination-info and .pagination-controls class names to table HTML; global rule stacks them at max-width 575px.

### ✅ MOBILE-BL-014: Profile tabs overflow at mobile — SHIPPED Pass 2
**File:** src/styles.scss
**Status:** Done. .mat-tab-header { overflow-x: auto } + .mat-tab-label-container { overflow: visible } added at max-width 767px.

### MOBILE-BL-015: Recorder controls touch targets
**File:** src/app/recorder/ (recording buttons)
**Change:** Ensure Record, Stop, Retake buttons all have min 44×44px
**Risk:** Medium — recorder is business-critical; visual changes need careful testing

---

## Summary by Category

| Category | Count | Highest Priority |
|----------|-------|-----------------|
| Focus/A11y | 3 | BL-002, BL-003, BL-011 |
| Form UX | 3 | BL-001, BL-005, BL-008 |
| Table responsiveness | 2 | BL-006, BL-007 |
| UI polish | 4 | BL-004, BL-009, BL-010, BL-013 |
| High risk (deferred) | 3 | BL-012, BL-014, BL-015 |
