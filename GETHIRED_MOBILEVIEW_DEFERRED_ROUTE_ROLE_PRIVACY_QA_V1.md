# GETHIRED_MOBILEVIEW_DEFERRED_ROUTE_ROLE_PRIVACY_QA_V1

Command: GETHIRED_MOBILEVIEW_DEFERRED_BACKLOG_CLOSURE_BL006_BL007_BL010_BL011_BL012_BL015_V1
Date: 2026-06-25

This document verifies that none of the mobile view changes weaken route guards, expose data to wrong roles, or bypass privacy boundaries.

---

## Route Guard Inventory

Guards present in the codebase (from `src/app/shared/guard/`):

| Guard | Protects |
|---|---|
| `AuthGuard` (`auth.guard.ts`) | General authenticated-user routes |
| `UnAuthGuard` (`unauth.guard.ts`) | Redirects authenticated users away from sign-in/sign-up |
| `ApplicantGuard` (`applicant.guard.ts`, `auth/applicant.guard.ts`) | Applicant-only routes |
| `EmployerGuard` (`employer.guard.ts`) | Employer-only routes |
| `AdminGuard` (`admin.guard.ts`, `auth/admin.guard.ts`) | Admin-only routes |
| `CompanyGuard` (`auth/company.guard.ts`) | Company-scoped routes |
| `EmployerInternalAuthGuard` (`employer-internal-authguard.ts`) | Internal employer panel sub-routes |

None of the five backlog items touch `app.routing.module.ts` or any guard file. Verify after implementation.

---

## BL-006 / BL-007: Table Data — Role Boundary

- [ ] `ReusableTableComponent` does not perform its own data fetching. It receives `listDataSource` via `@Input()` from the parent. All data-fetching and access control occurs in the parent component (ngrx store selectors gated by the parent's guard). No change to this architecture.
- [ ] The card list template does not expose any new fields beyond what `selectedColumnsMobile` and `displayedColumns` already allow. The card template reads from `displayedColumns` for labels and `data[header.col_name]` for values — identical to the desktop table.
- [ ] `selectedColumnsMobile` is an `@Input()` from the parent. No default value in the shared component exposes hidden columns. Verify each caller sets `selectedColumnsMobile` to a restrictive subset.
- [ ] Action buttons (menu, delete) on cards are only rendered when `header.col_name === 'action'` — same condition as the desktop table. If the parent omits an action column from `displayedColumns`, no action button appears on the mobile card.
- [ ] The `exportAsXLSX()` method on the shared component is not accessible from the card list UI (no export button is rendered in the card list). Export remains desktop-only, unchanged.

---

## BL-010: Dialog Data — Role Boundary

- [ ] Changing dialog `width` config at the `dialog.open()` call site does not change what `MAT_DIALOG_DATA` is passed to the dialog. Data payloads are unchanged.
- [ ] `RecorderComponent` receives `data.title` only — no user credentials, no applicant ID, no private data. The recorded blob and file are returned via `dialogRef.close()` to the opener, not stored in a shared service accessible to other roles.
- [ ] `VideoPreviewComponent` receives a video URL via `MAT_DIALOG_DATA`. The URL is a blob URL (created by `URL.createObjectURL`) or a presigned URL from the backend. Neither is changed by this fix.
- [ ] `FileViewerComponent` receives a `fileurl` via `MAT_DIALOG_DATA` and uses `DomSanitizer.bypassSecurityTrustResourceUrl`. This is unchanged. The `bypassSecurityTrustResourceUrl` call is pre-existing; no new bypass is introduced.
- [ ] `ConfirmationDialogComponent` and `UpdatedDialogComponent` receive only UI state (action label, message, destructive flag). No private data is passed to them.
- [ ] Import/add dialogs (`ImportAddContactComponent`, `ImportAddCandidateComponent`, `ImportAddUserComponent`) are opened by employer-panel components that are already protected by `EmployerGuard` / `EmployerInternalAuthGuard`. Changing the dialog width does not alter this guard chain.

---

## BL-011: Focus Trap — No Auth Impact

- [ ] `cdkTrapFocus` is a pure UI directive. It does not affect routing, API calls, or token handling.
- [ ] Adding `cdkTrapFocus` to the employer panel mobile drawer (if missing) does not change what routes are accessible — it only controls keyboard focus within the already-rendered navigation.
- [ ] The hamburger button that opens the drawer is already rendered inside the employer panel component which is behind the employer guard. No new public surface is created.

---

## BL-012: Sign-in Carousel — Auth Bypass Check

- [ ] The carousel is in the left panel (`col-lg-6`) of `signin.component.html`. The form is in the right panel. They share no data binding.
- [ ] Disabling auto-advance (`data-bs-ride="false"`) has no effect on the sign-in form's `loginAdmin()` submit handler.
- [ ] Adding `aria-label` to indicator buttons does not change the form's Angular reactive form bindings.
- [ ] The `UnAuthGuard` on the sign-in route is not touched by these changes. Authenticated users are still redirected away.
- [ ] The `routerLink="/jobs"` on carousel images is pre-existing. It allows unauthenticated navigation to `/jobs` (the public job board). This is a pre-existing product decision, not introduced by this fix.
- [ ] Sign-up page (`signup.component.html`) carousel receives identical treatment. The `register($event)` submit handler is not touched.

---

## BL-015: Recorder — Video Privacy

- [ ] Recorded video blobs are created via `URL.createObjectURL(blob)` — they live in browser memory only, are not uploaded automatically, and are revoked when the dialog closes (by garbage collection or explicit `URL.revokeObjectURL`). No change to this lifecycle.
- [ ] The video blob is passed to the opener via `dialogRef.close({ blobUrl, file })`. The opener (`DocsVideocvComponent`) then calls `applicantFacade.saveVideo()` which sends the file to the backend. This upload path is unchanged.
- [ ] The recorded video is associated with the authenticated applicant's profile. No anonymous upload path exists — the `ApplicantFacade.saveVideo()` call requires a valid `applicantProfileId` passed as `@Input` from the parent, and the backend enforces ownership.
- [ ] The `<input type="file" hidden>` upload path (`upload($event)`) is equally guarded — it calls `dialogRef.close()` immediately with the file, and the same upload path applies.
- [ ] `RecorderComponent` opens with `MAT_DIALOG_DATA` containing only a `title` string. No API keys, no auth tokens, no presigned URLs are passed to it.
- [ ] The device-picker sub-component (`RecorderSettingComponent`) uses `navigator.mediaDevices.enumerateDevices()`. Device labels are only returned by the browser after the user grants camera/microphone permission. No change to this browser permission model.
- [ ] Changing button sizes and adding ARIA attributes does not alter the component's MediaRecorder usage, stream acquisition, or blob handling.

---

## Cross-Cutting: No Guard Weakening

- [ ] After all changes, run `git diff src/app/shared/guard/ src/app/app.routing.module.ts src/app/applicant-panel/applicant-panel.module.ts src/app/employer-panel/employer-panel.module.ts` — diff must show no changes to these files.
- [ ] No `canActivate` array is modified.
- [ ] No route path is changed to remove a guard.
- [ ] No new public (guard-free) route is introduced.
