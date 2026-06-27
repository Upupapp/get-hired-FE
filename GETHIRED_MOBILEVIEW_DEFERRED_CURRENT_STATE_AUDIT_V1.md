# GETHIRED_MOBILEVIEW_DEFERRED_CURRENT_STATE_AUDIT_V1

Command: GETHIRED_MOBILEVIEW_DEFERRED_BACKLOG_CLOSURE_BL006_BL007_BL010_BL011_BL012_BL015_V1
Audit date: 2026-06-25
Auditor role: Documentation / QA (read-only; no source files were modified)

---

## BL-006 / BL-007: Mobile Table Conflict

### Problem description

The `ReusableTableComponent` renders two separate `<table mat-table>` blocks from the same `MatTableDataSource`. The desktop block (`#table-container`) is shown via `d-none d-md-inline`. The mobile block (`#table-container-mobile`) is shown via `d-block d-md-none`. Both bind `matSort` to the same `@ViewChild(MatSort)` sort instance.

Angular Material's `MatSort` directive can only be bound to a single table at a time. When two `mat-table` elements share one `MatSort`, the sort arrow, `aria-sort` attributes, and keyboard sort events fire against whichever table Angular registered last, leaving the other table in a permanently unsorted, incorrectly labelled state. At viewport widths between 768 px (the Bootstrap `md` breakpoint) and 960 px (Angular Material's default `md`), both tables can be simultaneously mounted in the DOM during breakpoint transitions, compounding the conflict.

Additionally, the mobile block re-uses `mat-table`/`mat-row`/`mat-cell` directives but omits `mat-header-row`, producing a table with cells that have no column headers. Screen readers receive data cells with no accessible name, violating WCAG 1.3.1 (Info and Relationships).

### Tables found and their callers

| Parent component | Data shown | File |
|---|---|---|
| `JobListComponent` | Employer's published/draft job posts (ID, title, date, city, work-setup, type, salary, status, action) | `src/app/job/job-list/job-list.component.ts` |
| `ContactListComponent` | Employer contacts (full name, email, mobile, address, job ID, job title, creation date, group, action) | `src/app/employer-panel/employer-contacts/contact-list/contact-list.component.ts` |
| `CandidateListComponent` | Employer recruiter candidate pool (columns from `candidate-model-interface`) | `src/app/employer-panel/employer-contacts/candidate-list/candidate-list.component.ts` |
| `CompanyUsersComponent` | Company team members (employee ID, full name, email, assigned date) | `src/app/company/company-users/company-users.component.ts` |

All four callers pass `displayedColumns`, `selectedColumns`, and `selectedColumnsMobile` to `<app-reusable-table>`. The shared component is the single source of the conflict; fixing it fixes all callers.

### Fix path

Replace the second `mat-table` block in `reusable-table.component.html` with a pure Angular `*ngFor` card list that does not use any Angular Material table directives, avoiding the `MatSort` conflict entirely. The SCSS file (`reusable-table.component.scss`) already contains the card styles under the `// MOBILEVIEW BL-006/BL-007` comment block (lines 964–1102), indicating the implementation agent has started this work.

---

## BL-010: Dialog Mobile Safety

### All dialogs found

| Component | Purpose | Opens from | Mobile concern |
|---|---|---|---|
| `ConfirmationDialogComponent` | Destructive-action confirm (delete job, delete contact, delete group, leave form) | `JobListComponent`, `ContactListComponent`, `ContactGroupComponent`, `SkillsExperienceComponent`, `ProfileFormsComponent`, `DocsVideocvComponent`, `CreateInterviewComponent` | Fixed width not set; relies on browser default. On narrow viewports the card can overflow or be partially off-screen. No `data-*` breakpoints. |
| `UpdatedDialogComponent` | Success/save confirmation after a write operation | `AccountSettingComponent`, `ApplicantSettingsComponent`, `CompanyDetailsFormComponent`, `JobListComponent`, `JobCreateComponent`, `EmployerSettingsComponent`, `EmployerAccountSettingsComponent` | Same as above — no responsive width. |
| `RecorderComponent` | Full camera/microphone video recorder for video CV or interview answers | `DocsVideocvComponent` opened with `width: '70vw'` | 70 vw on a 320 px device = 224 px. The two-column internal layout (`.col-md-8` / `.col-md-4`) collapses correctly at Bootstrap `md` but the dialog chrome itself has no `max-height` and no scroll, risking content overflow below the fold. |
| `VideoPreviewComponent` | Plays back a recorded or uploaded video answer | `JobApplicantsComponent`, `InterviewQuestionsComponent` (application path), `ApplicationPreviewComponent` | No explicit width. Video element has no `max-height`. Can overflow on small screens. |
| `FileViewerComponent` | Embeds a PDF/image via iframe for applicant document preview | `AvatarComponent` (applicant profile photo) | No responsive dimensions. iFrame has fixed height risk. |
| `TableControlModalComponent` (job-list) | Column visibility toggler for the job list table | `JobListComponent` | Low risk — content is a list of toggles. |
| `TableControlModalComponent` (candidate-list) | Column visibility toggler for the candidate list | `CandidateListComponent` | Low risk — same as above. |
| `ApplicantActionModalComponent` | Employer action on an applicant (pipeline stage change, note, etc.) | `JobApplicantsComponent` | No width set at call site; depends on dialog default (80 vw). Can be usable on phone but layout needs verification. |
| `ImportAddContactComponent` | Form to add or import a contact | `ContactListComponent` | No width set. Multi-field form on 320 px risk. |
| `ImportAddCandidateComponent` | Form to add or import a candidate | `CandidateListComponent` | Same as above. |
| `ImportAddUserComponent` | Form to invite a company user | `CompanyUsersComponent` | Same. |
| `AddContactGroupComponent` | Form to create a contact group | `ContactGroupComponent` | Same. |
| `CompanyBasicComponent` | Edit company basic details (opened as dialog in employer settings) | `EmployerSettingsComponent` | Large form; no responsive width. |
| `UpdateQuestionComponent` | Edit an interview question's text/type | `CreateInterviewComponent` | No width set. |
| `WorkExperienceComponent` | Add/edit a work experience entry | `SkillsExperienceComponent` | No width set. |
| `EducationalBackgroundComponent` | Add/edit an educational background entry | `SkillsExperienceComponent` | No width set. |
| `AwardsComponent` | Add/edit an award/certification entry | `SkillsExperienceComponent` | No width set. |
| `SubscriptionAlertComponent` | Warns employer when job-post or team-member limit is reached | `JobListComponent`, `JobCreateComponent`, `CompanyUsersComponent` | No width. Informational; low overflow risk. |
| `SubscriptionSummaryComponent` | Shows current plan details and limits | `SubscriptionsListComponent` | No width. |

### Interview-flow dialogs (application path)

| Component | Purpose | Opens from |
|---|---|---|
| `RecorderComponent` (application path) | Records video answer for an interview question | `record-interview.component.ts` (application process) opened with `minWidth: '30vw'` |
| `RecorderComponent` (public path) | Same but opened from the public job-details-apply flow | `record-interview.component.ts` (views/home) opened with `minWidth: '30vw'` |
| `SettingsModalComponent` | Device selection for recording (audio/video inputs) | `record-interview.component.ts` (both paths) |
| `InterviewNotificationComponent` | Pre-interview permission/instruction banner | `record-interview.component.ts` (both paths) |

---

## BL-011: Focus Trap Status

### cdkTrapFocus currently applied

| File | Element | Condition |
|---|---|---|
| `src/app/applicant-panel/applicant-panel.component.html` | `<nav id="gh-ap-mobile-drawer">` | `cdkTrapFocus [cdkTrapFocusAutoCapture]="mobileNavOpen"` |
| `src/app/admin-panel/admin-panel.component.html` | `<nav id="gh-admin-mobile-drawer">` | `cdkTrapFocus [cdkTrapFocusAutoCapture]="mobileNavOpen"` |

### Gaps

The employer panel mobile drawer (if it exists) has not been audited in this pass; check `employer-panel.component.html` for a corresponding `cdkTrapFocus` annotation.

Angular Material's own `MatDialog` service applies a focus trap automatically to every dialog via `FocusMonitor` and `FocusTrap`. All `MatDialog`-opened overlays above therefore have an automatic focus trap. The risk area is any non-MatDialog overlay — custom drawers, dropdowns, bottom sheets — that opens modally and does not use `cdkTrapFocus`.

Current status:
- Applicant panel mobile drawer: FIXED — `cdkTrapFocus` + `cdkTrapFocusAutoCapture` present.
- Admin panel mobile drawer: FIXED — same.
- Employer panel mobile drawer: NEEDS VERIFICATION.
- All `MatDialog` overlays: automatic focus trap via Angular Material.
- Bootstrap carousel indicators (signin/signup): no focus trap needed — these are not modal overlays.

---

## BL-012: Sign-in Carousel

### Component: `SigninComponent`

File: `src/app/auth/signin/signin.component.html`

The left panel (`col-lg-6`) contains a **Bootstrap 5 data-api carousel** (`<div class="carousel slide" data-bs-ride="carousel">`). It auto-advances through three `carousel-item` panels. Each panel contains a marketing image and headline copy for the employer sign-in page. The same pattern is duplicated in `src/app/auth/signup/signup.component.html`.

### Carousel type details

- Library: Bootstrap 5 CSS/JS carousel (data-bs-ride attribute — no Angular library, no ngu-carousel, no swiper)
- Auto-advances: yes, via `data-bs-ride="carousel"` which starts immediately on page load
- Controls present: carousel indicators only (three `<button data-bs-slide-to="N">` elements). No prev/next chevron buttons.
- Pause on hover: Bootstrap default (pauses on `mouseenter`, resumes on `mouseleave`). Does not pause on keyboard focus.
- Reduced motion: not implemented in the component or its SCSS. The `_motion.scss` mixin is not applied here.
- Mobile layout: at screen widths below `lg` (992 px), the left panel (`col-lg-6`) collapses below the right form panel in Bootstrap's 12-column grid. The carousel is still rendered but takes full width and can add unwanted vertical space on small phones.
- Accessibility issues: indicator buttons have no accessible label beyond `data-bs-slide-to` — a screen reader cannot identify them. `aria-current="true"` is only set on the first slide button statically; Bootstrap JS updates this dynamically but only in browsers with JS enabled.

### Risks

1. Auto-advancing content violates WCAG 2.2 SC 2.2.2 (Pause, Stop, Hide) if users cannot pause it — no pause control is present.
2. Users with vestibular disorders may experience discomfort from horizontal slide transitions.
3. On 320 px devices the left-panel image and heading can be excessively tall, pushing the login form far down.

---

## BL-015: Recorder Component

### Files

- `src/app/recorder/recorder.component.ts` — main dialog component
- `src/app/recorder/recorder.component.html` — template
- `src/app/recorder/recorder-setting/recorder-setting.component.html` — device-picker sub-component
- `src/app/recorder/recorder.service.ts` — MediaRecorder wrapper

### Controls inventory

| Control | Element | Touch target (as-is) | Issue |
|---|---|---|---|
| Close / cancel | `<img ... (click)="cancel()">` | 15 x 15 px | Far below the WCAG 2.5.5 minimum of 44 x 44 px |
| Start Recording | `<button class="btn btn-take-interview">` | Unknown — class-based; no explicit size | Bootstrap `.btn` default is approximately 38 px tall. Fails 44 px. |
| Stop Recorder | `<button class="btn btn-take-interview">` | Same as above | Same failure. |
| View Recording | `<button class="btn btn-primary w-100">` | Full width, approximately 38 px tall | Width acceptable; height marginal. |
| Upload Video Instead | `<button class="btn btn-primary w-100">` | Full width, approximately 38 px tall | Same. |
| Microphone select | `<select>` | Browser default | Acceptable on most mobile browsers but not verified. |
| Speaker/Audio Output select | `<select>` | Browser default | Same. |
| Camera select | `<select>` | Browser default | Same. |

### State indication

- Recording state: displayed via `isVideoRecording` boolean, which toggles button text/icon. No `role="status"` or `aria-live` region announces the state change to screen readers.
- Timer: displayed as text (`{{display}}`). Not announced live.
- Errors: `videoRecordingError` string is set but must be audited in the template to confirm it is rendered with an accessible role.
- Recording pulse animation (if any): not found in the current template — the timer icon is a static `<img>` not an animated indicator.

### Dialog invocation

- From `DocsVideocvComponent`: `this.dialog.open(RecorderComponent, { width: '70vw', data: { title: '...' } })` — 70 vw on mobile = ~224 px at 320 px viewport.
- From `record-interview.component.ts` (application path and public path): `minWidth: '30vw'` — 30 vw = ~96 px at 320 px, which is insufficient.
