# GETHIRED_MOBILEVIEW_DEFERRED_RELEASE_GATE_V1

Command: GETHIRED_MOBILEVIEW_DEFERRED_BACKLOG_CLOSURE_BL006_BL007_BL010_BL011_BL012_BL015_V1
Date: 2026-06-25

Release gate for the BL-006/007/010/011/012/015 mobile view deferred backlog closure.
All criteria must be PASS before merging to main. Mark each PASS or FAIL (with a note describing what failed and which file).

---

## BL-006 / BL-007: Table Conflict

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-001 | The mobile `<table mat-table>` block has been removed from `reusable-table.component.html` and replaced with an `*ngFor` card list that uses NO `mat-table`, `matColumnDef`, `matCellDef`, `matHeaderCellDef`, `mat-header-row`, or `mat-row` directives | | |
| RG-002 | The desktop `<table mat-table>` block is unchanged and renders correctly on viewports >= 768 px | | |
| RG-003 | `@ViewChild(MatSort) sort` is bound only to the single desktop mat-table. No second `matSort` binding exists in the template. | | |
| RG-004 | The mobile card list shows the correct data for all four callers: Job List, Contact List, Candidate List, Company Users | | |
| RG-005 | Action buttons (menu, delete) on mobile cards emit the correct events (`updateSelectedRowDialog`, `deleteSelectedRow`) | | |
| RG-006 | Mobile card action buttons have `min-width: 44px; min-height: 44px` in the rendered DOM (computed style check) | | |
| RG-007 | Mobile card action buttons have `aria-label` attributes | | |
| RG-008 | Empty state renders on mobile when `listDataSource.length === 0` | | |
| RG-009 | Pagination controls work correctly on mobile — next/prev page changes the card list data | | |
| RG-010 | Card reveal animation runs on first render and is suppressed under `prefers-reduced-motion: reduce` | | |
| RG-011 | Status badges on cards display text label AND colour (not colour alone) | | |

---

## BL-010: Dialogs Mobile Safe

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-012 | `ConfirmationDialogComponent` renders without horizontal overflow at 320 px viewport width | | |
| RG-013 | `UpdatedDialogComponent` renders without horizontal overflow at 320 px | | |
| RG-014 | `RecorderComponent` (opened from DocsVideocv, `width: '70vw'`) renders usably at 320 px — both columns stack vertically, no content clipped | | |
| RG-015 | `RecorderComponent` (opened from interview path, `minWidth: '30vw'`) renders usably at 320 px | | |
| RG-016 | `VideoPreviewComponent` renders without horizontal overflow at 320 px; video element is not clipped | | |
| RG-017 | `ApplicantActionModalComponent`, `ImportAddContactComponent`, `ImportAddCandidateComponent`, `ImportAddUserComponent`, `AddContactGroupComponent`, `CompanyBasicComponent`, `UpdateQuestionComponent`, `WorkExperienceComponent`, `EducationalBackgroundComponent`, `AwardsComponent`, `SubscriptionAlertComponent`, `SubscriptionSummaryComponent` — all render without horizontal overflow at 320 px | | |
| RG-018 | Desktop dialog experience at 1280 px is not regressed — dialogs are not excessively wide or narrow | | |

---

## BL-011: Focus Trap

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-019 | Applicant panel mobile drawer: Tab key does not escape the drawer while it is open | | |
| RG-020 | Admin panel mobile drawer: same | | |
| RG-021 | Employer panel mobile drawer: `cdkTrapFocus` is present and verified in the rendered DOM | | |
| RG-022 | On drawer close, focus returns to the hamburger button that opened it (all three panels) | | |
| RG-023 | All `MatDialog`-opened overlays: Tab key cycles within the dialog only | | |
| RG-024 | Pressing Escape closes every dialog that does not intentionally block escape (no unintended `disableClose: true` added) | | |

---

## BL-012: Sign-in Carousel Risk Contained

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-025 | Sign-in carousel does not auto-advance on page load (`data-bs-ride="false"` or `data-bs-interval="false"` applied) | | |
| RG-026 | Sign-up carousel: same | | |
| RG-027 | Carousel slide transition is suppressed under `prefers-reduced-motion: reduce` (`transition: none !important` in signin/signup component SCSS) | | |
| RG-028 | Carousel indicator buttons have `aria-label="Go to slide N"` on all three buttons in both components | | |
| RG-029 | Sign-in form (email, password, submit) functionality is unchanged — login still works end-to-end | | |
| RG-030 | Sign-up form (`register($event)`) functionality is unchanged | | |

---

## BL-015: Recorder Touch Targets Fixed

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-031 | Close button is a native `<button>` with `aria-label="Close recorder"` and computed size >= 44 x 44 px | | |
| RG-032 | Start Recording button has computed height >= 44 px | | |
| RG-033 | Stop Recorder button has computed height >= 44 px | | |
| RG-034 | View Recording button has computed height >= 44 px | | |
| RG-035 | Upload Video Instead button has computed height >= 44 px | | |
| RG-036 | `isVideoRecording` state change is announced via `aria-live="polite"` region | | |
| RG-037 | `videoRecordingError` is rendered in a `role="alert"` element | | |
| RG-038 | Recording pulse animation is suppressed under `prefers-reduced-motion: reduce` | | |

---

## Critical Actions Not Removed

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-039 | Job list: create job, view job detail, change job status (publish/archive), delete job — all actions reachable on mobile | | |
| RG-040 | Contact list: view contact, add contact, delete contact — all reachable on mobile | | |
| RG-041 | Candidate list: view candidate, add candidate, table controls — all reachable on mobile | | |
| RG-042 | Company users: view user, invite user — all reachable on mobile | | |
| RG-043 | Video CV recorder: record video, upload video, submit video — full flow works on mobile | | |
| RG-044 | Application interview questions: record answer, preview answer, submit application — full flow works on mobile | | |

---

## Mobile Overflow at 320 px

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-045 | `<section>` wrapper in `reusable-table.component.html` has `overflow-x: auto` (pre-existing inline style) — no horizontal page scroll introduced by card list | | |
| RG-046 | `@media (max-width: 767px) { section { overflow-x: hidden; } }` rule in component SCSS does not clip card action buttons | | |
| RG-047 | No component introduces `width: 100vw` or `min-width` that exceeds the viewport without wrapping | | |

---

## Desktop Regression Check

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-048 | Desktop job list table sorts correctly by clicking column headers | | |
| RG-049 | Desktop job list table search works | | |
| RG-050 | Desktop contact list and candidate list tables: same | | |
| RG-051 | Desktop company users table: same | | |
| RG-052 | All dialogs render correctly at 1280 px | | |
| RG-053 | Sign-in / sign-up pages render correctly at 1440 px — carousel layout unchanged on desktop | | |
| RG-054 | Recorder dialog renders correctly at 1280 px | | |

---

## Focus Behavior Verified

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-055 | Tab order through the sign-in page is logical: carousel indicators → form inputs → submit button → forgot password → register link (or equivalent natural order) | | |
| RG-056 | Tab order through the mobile card list is: first card → card actions → second card → etc. (no focus-invisible elements) | | |
| RG-057 | Focus-visible outlines are visible on all interactive elements when using keyboard navigation (2 px solid purple `#6160DC` or system default — no `outline: none` override without alternative) | | |

---

## Sign-in Works

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-058 | Employer can sign in with valid credentials and is redirected to the employer panel | | |
| RG-059 | Invalid credentials show the error alert with correct text | | |
| RG-060 | "Forgot password?" link navigates to `/reset-password` | | |
| RG-061 | "Register" link navigates to `/signup` | | |

---

## Recorder Works

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-062 | Start Recording requests camera/microphone permission (browser prompt appears) | | |
| RG-063 | After permission granted, camera feed appears in the video element | | |
| RG-064 | Stop Recorder stops the feed and enables View Recording | | |
| RG-065 | View Recording closes the dialog and returns blob URL to the opener | | |
| RG-066 | Upload Video Instead opens the file picker and returns the file to the opener | | |
| RG-067 | Cancel closes the dialog with `null` (no video saved) | | |

---

## Video-Answer Flow Preserved

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-068 | Applicant can open recorder from the interview-questions step during an application | | |
| RG-069 | Recorded answer blob is stored and shown as a preview after recording | | |
| RG-070 | Application can be submitted with recorded video answers intact | | |
| RG-071 | Employer can view applicant video answers in the job-applicants panel | | |

---

## Haptics / Effects Implemented

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-072 | Card reveal animation (fade + translateY) fires on mobile card list population | | |
| RG-073 | Card tap compression (scale 0.985) fires on card `:active` | | |
| RG-074 | Card action button micro-scale (scale 0.9) fires on button `:active` | | |
| RG-075 | Recording pulse animation fires while `isVideoRecording === true` | | |
| RG-076 | Recording pulse animation is absent while `isVideoRecording === false` | | |
| RG-077 | Focus-visible glow is present on mobile card action buttons | | |

---

## Reduced-Motion Respected

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-078 | Under `prefers-reduced-motion: reduce`: card reveal animation is `none` | | |
| RG-079 | Under `prefers-reduced-motion: reduce`: card tap compression transform is `none` | | |
| RG-080 | Under `prefers-reduced-motion: reduce`: carousel slide transition is `none` | | |
| RG-081 | Under `prefers-reduced-motion: reduce`: recording pulse animation is `none` | | |
| RG-082 | Under `prefers-reduced-motion: reduce`: dialog entrance animation is `none` (if dialog slide effect was added) | | |

---

## Performance Protected

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-083 | `ng build --configuration production` exits with code 0 | | |
| RG-084 | No new entries in `package.json` `dependencies` or `devDependencies` | | |
| RG-085 | Main bundle size increase is <= 5 KB (gzip) compared to the pre-change build | | |

---

## Route / Privacy Boundaries Preserved

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-086 | `git diff src/app/shared/guard/ src/app/app.routing.module.ts` shows no changes | | |
| RG-087 | `git diff src/app/applicant-panel/applicant-panel.module.ts src/app/employer-panel/employer-panel.module.ts` shows no guard changes | | |
| RG-088 | Unauthenticated user cannot access employer panel, applicant panel, or admin panel after these changes | | |

---

## Build Passes

| # | Criterion | Result | Notes |
|---|---|---|---|
| RG-089 | `ng build --configuration production` PASS | | |
| RG-090 | No TypeScript compilation errors in modified files | | |
| RG-091 | No Angular template binding errors in modified files | | |

---

## Gate Summary

Total criteria: 91
Required for PASS: all 91 PASS
Any single FAIL blocks the merge.
