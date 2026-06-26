# GetHired ACTIONS — Recent Deployment Audit V4
> Scope: 4 commits, 7 FE files (status update flow + main portal polish)
> Generated: 2026-06-26
> FE HEAD: see GETHIRED_OPEN_BACKLOG.md | BE HEAD: see GETHIRED_OPEN_BACKLOG.md

---

## Executive Summary

Two independent workstreams landed in this deployment:

**Status update flow (d3246b6)** — A full employer-side application-status picker was wired end-to-end: new `updateApplicationStatus()` service method, a `selectStatus()` handler in the modal with no-op guard and error surfacing, dialog close with a structured `{ statusUpdated, newStatusId, newStatusName }` result, and a list refresh in `job-applicants.component.ts`. The BE already had company-ownership checks, idempotency suppression, and a non-blocking status-change email in place (LAUNCH-02). The flow is functionally complete for the happy path.

**Main portal polish (70bc592/172b2a9/f9bc996)** — Keyboard navigation (Arrow/Home/End) for the tablist ARIA pattern, analytics tracking for all section interactions, hero and final-CTA sections, `(error)` image guards on USP and signals mock cards, and mobile-responsive touch target sizing.

**What remains:** The status flow is functional but has several UX and technical gaps that will surface immediately in real recruiter use (no optimistic row update, no visual badge on the status column, raw `MatSnackBar` instead of the `SnackbarService` pattern adopted elsewhere, the status name visible to the applicant via email is not shown to the recruiter before confirming). The portal has an active-tab contrast failure that is a WCAG AA blocker, and two main-portal CTAs that are non-crawlable `<button>` elements where `<a routerLink>` is required.

**Item count:** 4 P1, 5 P2, 4 P3.

---

## P1 — High Priority (should ship before this feature is considered done)

### ACT-P1-01 | Active preview tab contrast fails WCAG AA
**Problem:** `.portal-preview-tab.active` sets `background: $color-global-red-buttons` (#FF7062) with `color: #fff` at 13px non-bold font. Contrast ratio is approximately 2.7:1. WCAG AA requires 4.5:1 for normal text under 18px/14px-bold. This was noted in the known-context supplied to this audit and is confirmed in the SCSS at `.portal-preview-tab.active`.

**Files:**
- `src/app/public/main-portal/main-portal.component.scss` (`.portal-preview-tab.active`, line ~592–597)

**Fix approach:** Two options:
1. Darken the active tab background to a WCAG-passing red: `#C0392B` (5.14:1 — already used for `.error-snackbar` in this sprint, contrast confirmed passing). Keep white text.
2. Keep `#FF7062` background but switch active-tab text to `#1a1a1a` dark (contrast ~6.8:1 on that background).

Option 1 is consistent with the snackbar contrast fixes already shipped.

**Priority:** P1 | **Effort:** S

**Acceptance criteria:**
- `.portal-preview-tab.active` passes WCAG AA contrast check (>=4.5:1) in WebAIM Contrast Checker
- Active tab is still visually distinct from inactive tabs
- No other portal tab styles regressed

---

### ACT-P1-02 | Hero and final-CTA buttons are non-crawlable `<button>` elements
**Problem:** Every CTA in the hero section and final CTA section uses `<button type="button" (click)="...">` bound to `router.navigateByUrl()`. Google cannot follow these to `/jobs` or `/employers`. The job-seeker public portal already fixed this pattern (commit 94e4d39, BL-P2-06). The employer info page fix was also logged in BL-P2-06 of the open backlog. The main portal is the same gap.

Specifically affected CTAs:
- "Find jobs" hero → `/jobs`
- "Start hiring" hero → `/employers` (via `goToEmployerPortal()`)
- "Browse jobs without an account" (hero secondary) → `/jobs`
- "Sign in" (hero secondary) → `/signin`
- "Find jobs" (job-seeker journey section) → `/jobs`
- "Start hiring" (employer journey section) → `/employers`
- "Start hiring" (employer band) → `/employers`
- "Find jobs" / "Start hiring" (final CTA band, rendered in `app-portal-cta-band` child component — check whether that component also uses buttons internally)

**Files:**
- `src/app/public/main-portal/main-portal.component.html` (all affected buttons above)
- `src/app/public/main-portal/main-portal.component.ts` (the analytics wrapper methods can be kept as-is via `(click)` on `<a>` tags)

**Fix approach:** Replace each with `<a routerLink="/jobs">` or `<a routerLink="/employers">`. For CTAs that call analytics methods first, keep `(click)="heroCTAFindJobs()"` on the `<a>` tag — the analytics call fires, then Angular handles the navigation, and Googlebot still follows the `href`. For haptic-triggering CTAs, same pattern.

Do NOT replace the role-card `(activated)` outputs — those use a child component's event and are already correct.

**Priority:** P1 | **Effort:** M

**Acceptance criteria:**
- `curl -A "Googlebot" https://gethiredonline.app/` shows `<a href="/jobs">` and `<a href="/employers">` in raw HTML
- `ng build` succeeds with no router errors
- All analytics events still fire (verify in browser dev tools Network tab filtering on analytics domain)
- `app-portal-cta-band` component verified: if it also uses `<button>` internally for primary/secondary clicks, apply the same fix there

---

### ACT-P1-03 | `applicant-action-modal` uses raw `MatSnackBar`, not `SnackbarService`
**Problem:** The new status-picker injects `private snackBar: MatSnackBar` and calls `this.snackBar.open(...)` directly with raw duration values (2000ms, 3000ms, 4000ms). The codebase has a `SnackbarService` (confirmed at `src/app/core/services/snackbar.service.ts`) that standardizes durations, ARIA politeness (assertive for errors, polite for success), and panel classes. Three `snackBar.open()` calls in the modal bypass all of that: the "already has this status" and "Application ID not found" toasts use no error panel class, so they will not render with the error color/contrast that was fixed in the RECENT_4 sprint.

Additionally, `applicant-action-modal.component.ts` is now the 22nd component directly injecting `MatSnackBar` — it adds to the already-tracked migration debt.

**Files:**
- `src/app/job/job-applicants/applicant-action-modal/applicant-action-modal.component.ts` (lines 94–99, 107, 113)

**Fix approach:**
1. Replace `private snackBar: MatSnackBar` injection with `private snackbarService: SnackbarService`
2. Replace `this.snackBar.open(msg, 'OK', { duration: 4000 })` (error case) with `this.snackbarService.error(msg)`
3. Replace `this.snackBar.open('Status updated to...', 'OK', { duration: 3000 })` with `this.snackbarService.success(...)`
4. Replace `this.snackBar.open('Applicant already has this status.', ...)` with `this.snackbarService.info(...)` or `this.snackbarService.warning(...)` depending on `SnackbarService`'s API

**Priority:** P1 | **Effort:** S

**Acceptance criteria:**
- `applicant-action-modal.component.ts` no longer imports `MatSnackBar`
- Error toast renders with the error panel class and assertive ARIA live region
- Success toast renders with the success panel class
- MatSnackBar direct-injection count in the codebase drops by 1

---

### ACT-P1-04 | `console.log(event)` left in production code
**Problem:** `job-applicants.component.ts` line 247 has `console.log(event)` inside `viewMenu()`. The `event` argument is the raw applicant row object from the table, which includes `firstName`, `lastName`, `salary`, `dateApplied`, `address`, `videoCVUrl`, and `applicationId`. This is a PII leak to the browser console in production. The RECENT_4 sprint already fixed two similar console leaks (JWT token in signin, `this.data` in import-add-contact). This one was introduced in the same commit as the status picker and was missed.

**Files:**
- `src/app/job/job-applicants/job-applicants.component.ts` (line 247)

**Fix approach:** Delete line 247 (`console.log(event);`).

**Priority:** P1 | **Effort:** S

**Acceptance criteria:**
- `console.log(event)` is removed from `viewMenu()`
- `grep -r "console.log(event)" src/app/job/job-applicants/` returns no results
- Opening the action modal no longer logs applicant data to the browser console

---

## P2 — Architectural / UX Debt

### ACT-P2-01 | No optimistic row update — status column lags until full list refresh
**Problem:** After `selectStatus()` succeeds, `job-applicants.component.ts` calls `this.jobFacade.getApplicants(this.jobId)` to refresh the full applicant list. This fires a new GET, processes the NgRx store pipeline, and re-renders the entire table before the recruiter sees the updated status in the "Status" column. On a job with many applicants or a slow connection, the recruiter sees the stale status for 1–3 seconds before the table refreshes, or may click "Change Status" again thinking the first update failed.

The dialog closes and passes `{ statusUpdated: true, newStatusId, newStatusName }` — all the information needed for an optimistic update is already in the close event.

**Files:**
- `src/app/job/job-applicants/job-applicants.component.ts` (line 283–285, `result.statusUpdated` branch)
- `src/app/job/state/job.facade.ts` (would need a new action or mutation method)
- `src/app/job/state/job.reducer.ts` (would need an `updateApplicantStatus` case)

**Fix approach (option A — optimistic NgRx action, preferred):**
1. Add `updateApplicantStatusLocally(applicationId, newStatusId, newStatusName)` action to the job state
2. In the reducer, find the applicant in the `applicants` array by `applicationId` and update `jobApplicationStatusId` and `jobApplicationStatusName` in place
3. In `viewMenu()` afterClosed handler, dispatch this action instead of (or before) `getApplicants()` — skip the server refetch entirely since the server already confirmed the update

**Fix approach (option B — inline mutation, simpler):**
If touching the NgRx state is out of scope, the `applicants$` stream can be replaced with a `BehaviorSubject<any[]>` that is seeded from the store and locally patched on status change. This avoids the NgRx change but is less idiomatic.

**Priority:** P2 | **Effort:** M (option A) / S (option B)

**Acceptance criteria:**
- Status column updates immediately (<100ms) in the applicant table after the modal closes successfully
- No full-list refetch network call is made after a successful status update
- If the status update API call fails, the row remains unchanged (no false optimistic state)

---

### ACT-P2-02 | Status picker shows no visual indication of currently active status
**Problem:** The status picker renders all 5 options as identical `btn btn-outline-secondary` buttons. The current status is shown as text above the list ("Current: **Under Review**"), but none of the option buttons is visually highlighted. A recruiter moving quickly could click the same status again — the BE no-op suppression will prevent a DB update and the FE already has a same-status guard, but the recruiter will still see a snackbar telling them "Applicant already has this status", which is confusing UX. Better: visually disable or highlight the current status button.

**Files:**
- `src/app/job/job-applicants/applicant-action-modal/applicant-action-modal.component.html` (status-options button loop, line ~28–34)
- `src/app/job/job-applicants/applicant-action-modal/applicant-action-modal.component.ts` (to read current statusId for comparison)

**Fix approach:**
Add `[class.active]="s.id === currentStatusId"` and `[disabled]="s.id === currentStatusId || statusUpdating"` to the button. Define `currentStatusId` as a getter: `get currentStatusId() { return parseInt(this.data?.data?.jobApplicationStatusId, 10); }`. Add a brief SCSS style for `.status-options .btn.active` (e.g. `background: #f3f4f6; font-weight: 700; cursor: default`).

**Priority:** P2 | **Effort:** S

**Acceptance criteria:**
- Current status button is visually distinct (styled differently) from selectable options
- Current status button cannot be clicked/submitted
- Screen reader receives the disabled state via `aria-disabled="true"` or native `[disabled]`

---

### ACT-P2-03 | Dialog width `34vw` breaks on mobile/tablet; status picker not tested at narrow widths
**Problem:** `viewMenu()` opens `ApplicantActionModalComponent` with `width: '34vw'`. At 768px viewport this is ~260px — enough for the action grid. But the status picker view adds "Update Application Status" text, "Current: **Name**" text, and 5 full-width buttons, all inside a 260px-wide modal with no `maxWidth` or responsive override. On actual tablet (768–1024px) and the existing breakpoint in the SCSS (`.dialog-responsive .mat-dialog-container` targeting 768px), the modal becomes cramped.

**Files:**
- `src/app/job/job-applicants/job-applicants.component.ts` (line 249–256, `dialog.open()` config)
- `src/app/job/job-applicants/applicant-action-modal/applicant-action-modal.component.scss` (`.dialog-responsive`)

**Fix approach:**
Change the dialog open config to:
```typescript
{
  width: '34vw',
  maxWidth: '480px',
  minWidth: '300px',
  data: { ... }
}
```
This keeps the desktop appearance unchanged while preventing collapse on narrow screens. No SCSS change needed if the existing `.dialog-responsive` override stays.

**Priority:** P2 | **Effort:** S

**Acceptance criteria:**
- Modal is usable (all buttons visible, no horizontal scroll) at 375px, 768px, and 1440px viewport widths
- Status picker "Back" button and all 5 status options are fully visible at 375px

---

### ACT-P2-04 | `inviteApplicant()` is a public stub in `job-applicants.component.ts`
**Problem:** Line 217–219 of `job-applicants.component.ts` declares:
```typescript
inviteApplicant() {
  // TODO
}
```
This is a named public method, presumably wired to a template button (or was at some point). If the button still exists in the template, clicking it is a silent no-op. If the button was already removed, the dead method should be cleaned up to avoid confusion for the next dev. Either way, it needs resolution.

**Files:**
- `src/app/job/job-applicants/job-applicants.component.ts` (line 217–219)
- `src/app/job/job-applicants/job-applicants.component.html` (check whether `(click)="inviteApplicant()"` appears)

**Fix approach:**
Check the template. If `inviteApplicant()` is not called from the template, remove the method. If it is called, either implement it (scope decision — see BL-FEAT-01 pattern for messaging) or replace the button with a disabled state with tooltip "Coming soon".

**Priority:** P2 | **Effort:** S

**Acceptance criteria:**
- Either `inviteApplicant()` is fully implemented with a real action, or the dead stub is removed and no template references it
- `grep "(click)=\"inviteApplicant"` in job-applicants HTML returns either 0 results or a result with a disabled/tooltip guard

---

### ACT-P2-05 | Applicant not notified of which status they're being moved to before recruiter confirms
**Problem:** The current flow is: recruiter clicks a status button → API call fires immediately → toast confirms. There is no confirmation step. If a recruiter accidentally clicks "Rejected" instead of "Shortlisted", the application status-change email is already queued to the candidate before the recruiter even sees their own toast. The BE sends the email non-blocking post-commit — it cannot be recalled.

The BE already returns `newStatusLabel` in its success response but the FE discards it. The modal should surface a one-step confirm ("You are about to set this applicant's status to Rejected. Continue?") for irreversible statuses (Rejected=5, Hired=6).

**Files:**
- `src/app/job/job-applicants/applicant-action-modal/applicant-action-modal.component.ts` (`selectStatus()` method)
- `src/app/job/job-applicants/applicant-action-modal/applicant-action-modal.component.html` (status picker section)

**Fix approach:**
Add an intermediate confirmation state. When the recruiter clicks a status button:
1. Set `pendingStatus = { id: s.id, name: s.name }`
2. Template switches to a confirm view: "Set status to **Rejected**? This will notify the applicant by email. [Confirm] [Back]"
3. Only on "Confirm" does `selectStatus()` actually call the API
4. "Back" resets `pendingStatus = null` and shows the status list again

For low-risk statuses (Applied=2, Under Review=3, Shortlisted=4) this is optional — confirm is most important for terminal statuses (Rejected, Hired).

**Priority:** P2 | **Effort:** M

**Acceptance criteria:**
- Clicking "Rejected" or "Hired" shows a confirmation view before calling the API
- Confirmation view names the status and mentions that the applicant will be notified
- "Back" from confirm returns to the status list without calling the API
- Applied/Under Review/Shortlisted can optionally skip the confirm step

---

## P3 — Polish / DX / Test Coverage

### ACT-P3-01 | Applicant avatar `[src]` has no `(error)` fallback in the modal header
**Problem:** The modal header renders `<img [src]="data?.data?.photoUrl" class="img-avatar">` with no `(error)` handler. If `photoUrl` is null, empty, or a broken URL (a common case for applicants who haven't uploaded a photo), the browser renders a broken image icon inside the 46px avatar circle. The USP card icons and signals mock card in the portal already use `(error)="$any($event.target).style.display='none'"` — the same pattern should be applied here, or an initials fallback shown instead.

**Files:**
- `src/app/job/job-applicants/applicant-action-modal/applicant-action-modal.component.html` (line 8)

**Fix approach:**
Add `(error)="$any($event.target).style.display='none'"` to hide the broken image, and add a sibling `<span class="img-avatar-fallback">{{data?.data?.firstName?.[0]}}{{data?.data?.lastName?.[0]}}</span>` with CSS that only shows when the image fails. Simplest approach: always render an initials badge in a `<span>` behind the `<img>` so a broken image reveals it.

**Priority:** P3 | **Effort:** S

**Acceptance criteria:**
- Modal header never shows a broken image icon
- If `photoUrl` is null/empty/broken, initials or a placeholder background are shown instead

---

### ACT-P3-02 | Portal preview tracking panel has no `aria-live` on tab panel content
**Problem:** The product preview tabpanel (`role="tabpanel"`) uses `*ngIf` to swap panel content when `activePreviewTab` changes. Angular destroys and recreates the panel DOM. A screen reader user navigating with Arrow keys activates a new tab, `focus()` moves to the new tab button (correct), but the panel content change is not announced — there is no `aria-live` region wrapping the `.portal-preview-content` div, and the tabpanel itself is not focused. The ARIA authoring practice for tabs recommends either auto-focusing the panel or using `aria-live="polite"` on the panel container so content changes are announced.

**Files:**
- `src/app/public/main-portal/main-portal.component.html` (`.portal-preview-content` div, line ~214)

**Fix approach:**
Add `aria-live="polite"` to the `.portal-preview-content` wrapper div. This is non-breaking: sighted users are unaffected, and screen readers will announce the new panel heading when the tab changes.

**Priority:** P3 | **Effort:** S

**Acceptance criteria:**
- `aria-live="polite"` present on `.portal-preview-content`
- NVDA/VoiceOver announces the panel's `<h3>` heading when Arrow key tab change fires
- No regression in keyboard tab navigation (Arrow/Home/End still work)

---

### ACT-P3-03 | `loadMatchSignals()` subscription in `job-applicants.component.ts` has no `takeUntil` / unsubscription
**Problem:** `loadMatchSignals()` subscribes to `this.jobService.getJobApplicantSignals()` with no `takeUntil(this.destroy$)` or stored subscription for cleanup. If the recruiter navigates away before the signals response arrives, the subscription is live against a destroyed component — Angular will log a warning, and the `matchSignalsByUserId$.next()` call may trigger a second change detection pass on a destroyed view. The same applies to `loadSnapshotSummary()`.

This is the same class of leak that was flagged as BL-P3 debt in earlier sprints.

**Files:**
- `src/app/job/job-applicants/job-applicants.component.ts` (lines 167–182 `loadMatchSignals()`, lines 184–196 `loadSnapshotSummary()`)

**Fix approach:**
1. Add `private destroy$ = new Subject<void>();` to the class
2. Implement `ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }`
3. Pipe `.pipe(takeUntil(this.destroy$))` before `.subscribe()` in both methods
4. Import `Subject` and `takeUntil` from `rxjs` and `rxjs/operators`

Also note: `loading$` (line 95–96) is a direct `.subscribe()` on an NgRx observable stored as a class field — it also lacks cleanup. Address in the same pass.

**Priority:** P3 | **Effort:** S

**Acceptance criteria:**
- `ngOnDestroy` implemented and calls `destroy$.next()`
- `loadMatchSignals()` and `loadSnapshotSummary()` both pipe `takeUntil(this.destroy$)`
- `loading$` subscription is stored and unsubscribed in `ngOnDestroy`
- No Angular `ExpressionChangedAfterItHasBeenCheckedError` or `ObjectUnsubscribedError` in console when navigating away from the applicant list

---

### ACT-P3-04 | No unit tests for `selectStatus()` or the status-change close-event path
**Problem:** The new status-picker logic in `applicant-action-modal.component.ts` has multiple branches (applicationId missing, same-status no-op, API success, API failure) and the `result.statusUpdated` branch in `job-applicants.component.ts` dispatches a list refresh. None of these are covered by any spec file. The `applicant-action-modal` directory has no `.spec.ts`. The pattern is the same debt flagged in BL-P3-04 for the import dialogs.

**Files:**
- `src/app/job/job-applicants/applicant-action-modal/` (no spec file)
- `src/app/job/job-applicants/` (no spec for the status-updated afterClosed branch)

**Fix approach:**
Create `applicant-action-modal.component.spec.ts` covering:
- TC-01: `selectStatus()` with no `applicationId` → snackbar, no API call
- TC-02: `selectStatus()` with same statusId → snackbar, dialog closed with null
- TC-03: `selectStatus()` success → dialog closed with `{ statusUpdated: true, newStatusId, newStatusName }`
- TC-04: `selectStatus()` API error → error snackbar, no dialog close, `statusUpdating` reset to false

And in `job-applicants.component.spec.ts`:
- TC-05: `afterClosed` with `result.statusUpdated = true` → `getApplicants` dispatched

**Priority:** P3 | **Effort:** M

**Acceptance criteria:**
- 5 test cases above pass with `ng test`
- No coverage gaps in the `selectStatus()` method branches
- Tests use `jasmine.createSpyObj` or `TestBed` providers for `JobService` and `MatDialogRef`

---

## Effort / Priority Matrix

| ID | Title | Priority | Effort |
|----|-------|----------|--------|
| ACT-P1-01 | Active tab WCAG AA contrast | P1 | S |
| ACT-P1-02 | Hero/CTA buttons non-crawlable | P1 | M |
| ACT-P1-03 | Raw MatSnackBar in action modal | P1 | S |
| ACT-P1-04 | console.log(event) PII leak | P1 | S |
| ACT-P2-01 | No optimistic row update | P2 | M |
| ACT-P2-02 | No current-status highlight | P2 | S |
| ACT-P2-03 | Dialog 34vw breaks on mobile | P2 | S |
| ACT-P2-04 | inviteApplicant() dead stub | P2 | S |
| ACT-P2-05 | No confirm for Rejected/Hired | P2 | M |
| ACT-P3-01 | Avatar broken-image fallback | P3 | S |
| ACT-P3-02 | Tabpanel no aria-live | P3 | S |
| ACT-P3-03 | No takeUntil on subscriptions | P3 | S |
| ACT-P3-04 | No unit tests for selectStatus | P3 | M |

**Effort key:** S = <1 hour | M = 1–4 hours | L = 4+ hours

---

## Recommended Next Steps

**Immediate (same session):**
1. ACT-P1-04 — Delete one line (`console.log(event)` in `job-applicants.component.ts:247`). Zero risk, eliminates PII leak.
2. ACT-P1-03 — Swap `MatSnackBar` for `SnackbarService` in the action modal (3 call sites). Keeps ARIA behavior consistent with the rest of the app.
3. ACT-P2-02 + ACT-P2-03 + ACT-P3-01 — Three S-effort UX improvements, all in the same 2 files (action-modal TS + HTML). Good to batch.

**Next session:**
4. ACT-P1-01 — One CSS value change, immediate WCAG compliance for the portal tab bar.
5. ACT-P1-02 — Convert main-portal CTAs to `<a routerLink>`. Medium effort but high SEO impact; mirrors what was already done for the job-seeker portal and employer info page.
6. ACT-P2-05 — Add status-change confirmation for Rejected/Hired. Prevents accidental candidate email sends and is the most visible recruiter UX gap.

**Backlog (plan, don't block on):**
7. ACT-P2-01 — Optimistic row update. Requires NgRx state work; plan the action + reducer alongside any other planned state work.
8. ACT-P3-03 — Subscription cleanup (`takeUntil`). Low urgency but accumulates.
9. ACT-P3-04 — Unit tests for the new status-update flow.
10. ACT-P2-04 — Resolve `inviteApplicant()` stub — decision needed on whether this becomes a real feature (tied to BL-FEAT-01 messages work).

---

## Items NOT Raised (confirmed intentional or already tracked)

| Issue | Disposition |
|---|---|
| "Pending Review" (status 1) absent from picker | Intentional — recruiters cannot manually set Pending Review; only the system sets it on submission |
| Status update returns full success on no-op | BE returns `{ updated: false, reason: 'no_change' }` and FE triggers a list refresh anyway — covered by ACT-P2-01 |
| Email to candidate triggers immediately on status change | By design (LAUNCH-02). The confirmation step in ACT-P2-05 is the correct mitigation |
| SnackbarService migration (21 components) | Pre-existing tracked debt; ACT-P1-03 is the new addition from this sprint only |
| BL-P2-06 employer info page CTAs | Pre-existing backlog item; not introduced by this sprint |
| `prefers-reduced-motion` portal reveal already guarded | Confirmed correct in SCSS — no item raised |
| `trackByIndex` on static lists | Confirmed correct use (arrays never mutate) |

---

*GETHIRED ACTIONS RECENT V4 | Status update flow + main portal polish | 2026-06-26*
