# GETHIRED SWEEP — Recent Deployment Audit (V4)
**Generated:** 2026-06-26
**Scope:** Commits d3246b6, 70bc592, 172b2a9, f9bc996 (7 files)
**Auditor:** Claude SWEEP (read-only, no code changed)

---

## Executive Summary

The recent deployment covers two distinct concerns: (1) an employer-side applicant status-update flow via a modal (d3246b6), and (2) an extensive public portal UX/marketing polish (70bc592, 172b2a9, f9bc996). Both features are broadly functional and well-structured. No critical (data-loss or security) issues were found. Three medium findings and several low/info items are documented below. The most actionable items are the subscription leaks in `job-applicants.component.ts` and the missing `trackBy` in the modal template.

---

## Per-File Findings

---

### FILE 1: `job.service.ts`

**Purpose:** Service layer. New method `updateApplicationStatus(applicationId, newStatusId)` added — hits `PUT /application/status`.

| # | Severity | Finding |
|---|----------|---------|
| 1.1 | Info | `updateApplicationStatus` parameters are well-typed (`string`, `number`). Return type is `any` — acceptable for now, no model exists yet for the response shape. |
| 1.2 | Low | `changeJobStatus` parameters at line 19 are untyped (`status`, `jobId`). Pre-existing — not introduced by this commit, but worth noting since this is the pattern the new method improves on. |
| 1.3 | Info | No issues with the new endpoint URL (`/application/status`). Consistent with BE routing conventions. |

**Verdict for this file: CLEAN**

---

### FILE 2: `applicant-action-modal.component.ts`

**Purpose:** Modal for employer actions on a selected applicant — now includes a "Change Status" sub-view with PUT call.

| # | Severity | Finding |
|---|----------|---------|
| 2.1 | Medium | **Missing `OnDestroy` / subscription not unsubscribed.** `selectStatus()` calls `this.jobService.updateApplicationStatus(...).subscribe(...)` at line 104 without storing the subscription or using `takeUntil`. If the dialog is closed while the HTTP call is in flight (the user taps the X), the callback at line 106 will fire on a destroyed component, set `statusUpdating`, open a snackbar, and call `this.dialogRef.close(...)`. Angular Material dialogs survive component destruction in some edge cases via the overlay, so this is unlikely to throw but it is a leak. Fix: store subscription and unsubscribe in `ngOnDestroy`, or use `takeUntil(this.destroy$)`. |
| 2.2 | Medium | **`STATUS_OPTIONS` omits status id=1 (Pending Review).** The audit context confirms: 1=Pending Review, 2=Applied, 3=Under Review, 4=Shortlisted, 5=Rejected, 6=Hired. The modal starts at id=2. If an employer wants to move an applicant *back* to Pending Review this is impossible from the UI. This may be intentional (employers should not regress to Pending Review), but it is not documented and creates a permanent one-way gate. If it is intentional, add a code comment to that effect. |
| 2.3 | Low | **`parseInt(currentStatusId, 10)` at line 98 when `statusId` is already `number`.** `currentStatusId` comes from `this.data.data.jobApplicationStatusId` — its runtime type depends on what the API returns. If the API already sends a number, `parseInt` is redundant but harmless. If the API sends a string, this works correctly. The inconsistency between the explicit parse on `currentStatusId` vs the direct comparison to `statusId` (which is always typed as `number`) is worth making explicit: either parse both or cast once at the top of the method. |
| 2.4 | Low | **`@Inject(MAT_DIALOG_DATA) public data` is typed `any`.** This is fine for a quick build but means the entire `data.data.applicationId` chain is unchecked. A simple interface `{ data: { applicationId?: string; jobApplicationStatusId?: number; ... } }` would catch future regressions at compile time. |
| 2.5 | Low | **`ngOnInit()` is declared but empty (line 54).** Implementing `OnInit` with no body adds noise. Can be removed unless future logic is expected. |
| 2.6 | Info | The `openControlMenu` guard at line 68 (`if (menu && menu.route)`) will silently do nothing for the pre-existing menu items (none have `route`). That was pre-existing behaviour — this commit did not change it. |

**Verdict for this file: MEDIUM (2M, 2L)**

---

### FILE 3: `applicant-action-modal.component.html`

**Purpose:** Template for the action modal.

| # | Severity | Finding |
|---|----------|---------|
| 3.1 | High | **Close button has no accessible label.** Line 3-4: `<img src="...remove-gray.png" style="..." (click)="dialogRef.close()">`. The click target is a raw `<img>` with no `alt` text, no `role="button"`, no `aria-label`, and no keyboard binding. Screen reader users cannot find or activate the close button. Also not keyboard-reachable (no `tabindex`, no `<button>` wrapper). Fix: wrap in `<button type="button" aria-label="Close dialog">` and give the img `alt=""`. |
| 3.2 | High | **Action menu items are `<div>` elements with only `(click)` — not keyboard accessible.** Lines 41-44: `.side-sub-menu-container` divs are clickable via `(click)="openControlMenu(menu)"` but are `<div>` elements with no `role="button"`, no `tabindex`, no `(keydown)` handler. Keyboard-only users cannot activate these controls. Fix: change to `<button type="button">` or add `role="button" tabindex="0" (keydown.enter)="openControlMenu(menu)" (keydown.space)="openControlMenu(menu)"`. |
| 3.3 | Medium | **Missing `trackBy` on `*ngFor` in the status picker (line 29).** `*ngFor="let s of statusOptions"` has no `trackBy`. `statusOptions` is a static module-level constant so Angular will never actually mutate it at runtime — but adding `trackBy` is the correct practice and consistent with how the main portal template handles its lists. Low risk in practice. |
| 3.4 | Medium | **Missing `trackBy` on `*ngFor` for `tableControls` (line 40).** Same as above — static array, but no `trackBy`. |
| 3.5 | Low | **Status option buttons display the new status name but do not indicate the current status visually.** The current status is shown as text (`Current: <strong>...</strong>`) above the list, but there is no visual differentiation (highlight, checkmark, disabled appearance) on the button that corresponds to the *current* status. The `selectStatus` guard will show a snackbar and close the dialog if the same status is chosen — a subtle UX friction. Low severity since the close is fast, but a visual indicator would be more standard. |
| 3.6 | Info | Applicant name concatenation at line 11 (`firstName + ' ' + lastName`) will render "null null" if either field is null. Pre-existing pattern in this codebase — not introduced by this commit. |

**Verdict for this file: HIGH (2H), MEDIUM (2M), LOW (1L)**

---

### FILE 4: `job-applicants.component.ts`

**Purpose:** Parent component for the employer applicant list. This commit wired up the `statusUpdated` result from the modal dialog to trigger a list refresh.

| # | Severity | Finding |
|---|----------|---------|
| 4.1 | Medium | **Three subscriptions are never unsubscribed, no `ngOnDestroy`.** The component subscribes at: (a) `loading$` field initializer (line 95-96, subscribes directly), (b) `this.route.queryParams.subscribe(...)` in constructor (line 151), (c) `openDialog.afterClosed()...subscribe(...)` in `viewMenu` — this one is called on every menu open (line 260-286). While (c) is safe because the dialog stream completes when it closes, (a) and (b) are long-lived subscriptions that leak on navigation if the component is not destroyed. Fix: implement `OnDestroy`, create a `destroy$ = new Subject<void>()`, and pipe `takeUntil(this.destroy$)` on both subscriptions. `takeUntil` is already imported (line 8) — it was added but never used. |
| 4.2 | Low | **Dead imports: `takeUntil`, `tap`, `switchMap` are imported from rxjs (line 8) but never used in the file.** The dead imports suggest an earlier refactor intent that was not completed. Remove them to keep the import line clean. |
| 4.3 | Low | **`loadSnapshotSummary` and `loadMatchSignals` subscriptions (lines 173, 192) are fire-and-forget** with no unsubscription. These are HTTP calls (complete-on-response), so they self-complete and the leak is minimal in practice. However, if the component is destroyed before the HTTP response arrives, the callback will run against a destroyed component. Because these are `catchError(of(null))` patterns, Angular will not throw — it just sets a property on the dead component. Low severity. |
| 4.4 | Low | **`formLoading` (line 222) opens a `LoadingComponent` dialog via `loadingDialog.open(...)` but does not store the ref.** Then on line 231, `this.loadingDialog.closeAll()` is called — which closes *every* open dialog in the app, including any other open dialogs (e.g., `VideoPreviewComponent` or `ApplicantActionModalComponent`) if loading somehow fires concurrently. Pre-existing pattern — not introduced by this commit. |
| 4.5 | Low | **`inviteApplicant()` is a stub with a `// TODO` comment (line 217-219).** The method is presumably wired to the template. If so, clicking "Invite Applicant" silently does nothing. Pre-existing, but worth confirming no UI button is wired to it that would confuse users. |
| 4.6 | Info | **`statusUpdated` handling (lines 283-285)** is correct: on status update confirmation from the modal, `this.jobFacade.getApplicants(this.jobId)` refreshes the list. The status name in the table will update after the next load — no optimistic update, so there is a brief stale display while the request completes. Acceptable. |
| 4.7 | Info | The `loadingDialog` and `dialog` are two injected `MatDialog` instances (lines 146, 147). This works but is unusual — typically one `MatDialog` can open both dialogs. Not a bug, just an observation. |

**Verdict for this file: MEDIUM (1M), LOW (3L)**

---

### FILE 5: `main-portal.component.ts`

**Purpose:** Public landing page controller — role-selection, redirect-if-logged-in, SEO, tab keyboard nav.

| # | Severity | Finding |
|---|----------|---------|
| 5.1 | Medium | **No `isPlatformBrowser` guard around `coreService.isLoggedIn()` at line 101.** The component's `ngOnInit` calls `this.coreService.isLoggedIn()` unconditionally. This is an SSR (Angular Universal) component — the project context confirms SSR is used. If `isLoggedIn()` internally reads `localStorage`, `sessionStorage`, `window`, or `document`, it will throw on the server. Requires inspecting `CoreService.isLoggedIn()` to confirm. Given the project uses `isPlatformBrowser` guards elsewhere (confirmed in `portal-reveal.directive.ts`), this omission is a gap. If `coreService` already handles the SSR case internally, severity drops to Info. |
| 5.2 | Low | **`goToJobSeekerPortal()` and `goToEmployerPortal()` call `this.haptics.selection()` (lines 140, 144) with no SSR guard.** `HapticFeedbackService` likely calls the Vibration API (`navigator.vibrate`), which does not exist on the server. If the service has its own guard, this is harmless. Check `HapticFeedbackService` before deploying to server-side. |
| 5.3 | Low | **`trackByIndex` returns `index` (line 196).** Using the array index as the `trackBy` key is correct for static arrays (which these all are — `uspPillars`, `differentiators`, `jobSeekerJourney`, `employerJourney` are all module-level constants). If any of these arrays ever become dynamic (sorted, filtered), index tracking will cause incorrect DOM reuse. For now this is fine and consistent with what the comment says. |
| 5.4 | Info | **`activePreviewTab` initializes to `'seeker'` (line 69).** This is consistent with the first tab in `previewTabs` (line 71) and with the ARIA `aria-selected` bindings in the template. No issue. |
| 5.5 | Info | The `onTabKeydown` handler (lines 117-137) implements the full ARIA tab pattern: ArrowRight, ArrowLeft, Home, End, `event.preventDefault()`, and programmatic focus via `tablistRef`. This is a high-quality accessibility implementation and is commendable. |
| 5.6 | Info | Role=3 routes to `/user`, role=2 to `/recruiter`, role=1 to `/admin` in the redirect switch (lines 104-108). No default case — if `role` is any other value (null, undefined, '4'), the user stays on the landing page, which is the correct safe fallback. |

**Verdict for this file: MEDIUM (1M), LOW (2L)**

---

### FILE 6: `main-portal.component.html`

**Purpose:** Template for the public portal landing page.

| # | Severity | Finding |
|---|----------|---------|
| 6.1 | Info | **`aria-hidden="true"` on all decorative images and visual mock elements.** Correctly applied throughout (lines 2, 35, 113, 115, 220, 259, 297, 332, 354-358). No screen-reader content leaked from purely decorative elements. |
| 6.2 | Info | **`trackBy: trackByIndex` on all `*ngFor` loops** (lines 25, 114, 126, 137, 153). Correct. |
| 6.3 | Info | **ARIA tablist pattern is complete.** `role="tablist"`, `role="tab"`, `aria-selected`, `tabindex` roving, `aria-controls`, and `id` are all wired correctly on the preview tabs (lines 180-212). Excellent. |
| 6.4 | Low | **`aria-label="Product feature preview"` on the tablist (line 181) is redundant** given the surrounding `<section aria-label="See how GetHired works">` (line 175). The tablist label should differentiate the tablist from the section, so it is not strictly wrong — just slightly verbose. Minor. |
| 6.5 | Low | **`portal-preview-content` div has `role="tabpanel"` and a dynamic `[id]` and `[attr.aria-labelledby]` (lines 214-215), but the tab panel does not have `tabindex="0"`.** ARIA spec recommends `tabindex="0"` on the active tabpanel so keyboard users can Tab into the panel content after navigating tabs. Without it, pressing Tab from the tab row would skip the panel content and jump to the next focusable element. |
| 6.6 | Low | **The `(error)="$any($event.target).style.display='none'"` error handlers** on USP icons (line 116) and the signals rings image (line 357) use `$any()` to escape TypeScript. This is an Angular template hack — acceptable short-term but `$any()` suppresses type safety. A directive would be cleaner long term. Low priority. |
| 6.7 | Info | All `<button>` elements have explicit `type="button"` throughout — correct, prevents form submission. |
| 6.8 | Info | Decorative connector dots in the hero (lines 51-55) are `<span>` elements with `aria-hidden` on the parent `.portal-hero-visual` (line 35). Correctly hidden. |

**Verdict for this file: LOW (3L)**

---

### FILE 7: `main-portal.component.scss`

**Purpose:** Styles for the public portal landing page.

| # | Severity | Finding |
|---|----------|---------|
| 7.1 | Info | **`@media (prefers-reduced-motion: reduce)` is present and correct** for both the hero animations (lines 472-479) and the `portal-reveal-section` scroll animations (lines 493-498). Both disable opacity transitions and set transforms to none. Commendable. |
| 7.2 | Low | **`.portal-role-proof` (lines 38-41) is defined in the SCSS but never used in the template.** The template uses `.portal-hero-proof` (line 171 in component), `.portal-trust-strip`, and `.portal-employer-band-proof` — but `.portal-role-proof` does not appear anywhere in the HTML. This is dead CSS. Can be removed. |
| 7.3 | Low | **`backdrop-filter: blur(4px)` on `.portal-hero-chip` (line 525).** `backdrop-filter` is not supported on Firefox (without a flag). The chip still renders correctly without the backdrop blur — just loses the frosted glass effect. Acceptable as progressive enhancement but should be noted. |
| 7.4 | Info | **`portal-hero-reveal` keyframe animation is defined once at line 329.** Both `.portal-hero-copy` and `.portal-hero-visual` reference it with different delays (0ms and 80ms). Correct — no duplicate keyframe. |
| 7.5 | Info | **`$motion-ease-standard` from `~assets/styles/motion` import** is used in hero animation (line 138). This is a project-wide token — correct usage. |
| 7.6 | Info | No vendor prefixes used — all properties used (`grid`, `gap`, `backdrop-filter`, `animation`, `transition`) are broadly supported in the target browser matrix for a modern Angular 13 app. Acceptable. |
| 7.7 | Low | **Inline `style="width: 82%"` on the completeness bar fill in the template (HTML line 240)** creates a hardcoded 82% width. This is illustrative/mock data (confirmed by the disclaimer in the template), so it is not a data issue. Worth noting in case this is copy-pasted into a real data context. |

**Verdict for this file: LOW (3L)**

---

## Consolidated Severity Table

| ID | File | Severity | Summary |
|----|------|----------|---------|
| 3.1 | applicant-action-modal.component.html | **High** | Close button: no accessible label, not keyboard-reachable |
| 3.2 | applicant-action-modal.component.html | **High** | Action menu divs not keyboard accessible (no role/tabindex/keydown) |
| 2.1 | applicant-action-modal.component.ts | **Medium** | HTTP subscription not unsubscribed; callback fires on destroyed component |
| 2.2 | applicant-action-modal.component.ts | **Medium** | STATUS_OPTIONS omits id=1 (Pending Review) — gap or intentional, undocumented |
| 3.3 | applicant-action-modal.component.html | **Medium** | Missing trackBy on status options *ngFor |
| 3.4 | applicant-action-modal.component.html | **Medium** | Missing trackBy on tableControls *ngFor |
| 4.1 | job-applicants.component.ts | **Medium** | loading$ and queryParams subscriptions never unsubscribed; takeUntil imported but unused |
| 5.1 | main-portal.component.ts | **Medium** | `isLoggedIn()` called with no isPlatformBrowser guard — possible SSR crash |
| 2.3 | applicant-action-modal.component.ts | Low | parseInt inconsistency on status ID comparison |
| 2.4 | applicant-action-modal.component.ts | Low | `data` typed as `any` — no interface for dialog data |
| 2.5 | applicant-action-modal.component.ts | Low | Empty `ngOnInit` on component that implements `OnInit` |
| 3.5 | applicant-action-modal.component.html | Low | No visual indicator for current status in status picker |
| 4.2 | job-applicants.component.ts | Low | Dead imports: takeUntil, tap, switchMap imported but unused |
| 4.3 | job-applicants.component.ts | Low | loadSnapshotSummary and loadMatchSignals subscriptions fire-and-forget (HTTP, low risk) |
| 4.4 | job-applicants.component.ts | Low | formLoading calls closeAll() — closes all dialogs, not just the loading one |
| 4.5 | job-applicants.component.ts | Low | inviteApplicant() is a stub TODO — silently does nothing |
| 5.2 | main-portal.component.ts | Low | haptics.selection() called with no SSR guard |
| 5.3 | main-portal.component.ts | Low | trackByIndex uses array index — fine for static arrays, fragile if arrays become dynamic |
| 6.4 | main-portal.component.html | Low | aria-label on tablist is redundant with parent section aria-label |
| 6.5 | main-portal.component.html | Low | Active tabpanel missing `tabindex="0"` — keyboard users can't Tab into panel |
| 6.6 | main-portal.component.html | Low | `$any()` escape hatch on image error handlers |
| 7.2 | main-portal.component.scss | Low | `.portal-role-proof` CSS class defined but never used in template (dead CSS) |
| 7.3 | main-portal.component.scss | Low | `backdrop-filter: blur` not supported on Firefox without flag |
| 7.7 | main-portal.component.scss | Low | Hardcoded 82% width in mock completeness bar (HTML inline style) |

---

## Recommended Fixes (Priority Order)

### Immediate (High)
1. **applicant-action-modal.component.html — Close button (3.1):** Wrap the close img in `<button type="button" aria-label="Close dialog" (click)="dialogRef.close()">` and set `alt=""` on the img.
2. **applicant-action-modal.component.html — Action menu keyboard access (3.2):** Replace `.side-sub-menu-container` divs with `<button type="button">` elements (remove inline background from attribute to style if needed), or at minimum add `role="button" tabindex="0" (keydown.enter)="openControlMenu(menu)" (keydown.space)="openControlMenu(menu)"`.

### Next Sprint (Medium)
3. **job-applicants.component.ts — Subscription cleanup (4.1):** Add `ngOnDestroy`, create `private destroy$ = new Subject<void>()`, pipe `takeUntil(this.destroy$)` onto the `loading$` subscriber and the `route.queryParams` subscriber. Remove dead imports (4.2).
4. **applicant-action-modal.component.ts — Subscription cleanup (2.1):** Store the `updateApplicationStatus` subscription and unsubscribe in `ngOnDestroy`.
5. **STATUS_OPTIONS — Document or add id=1 (2.2):** Either add `{ id: 1, name: 'Pending Review' }` to the list, or add a comment: `// id=1 (Pending Review) intentionally omitted — employers cannot regress status to Pending`.
6. **main-portal.component.ts — SSR guard (5.1):** Wrap `this.coreService.isLoggedIn()` and the subsequent `getRole()` call in an `isPlatformBrowser(this.platformId)` guard. Inject `PLATFORM_ID` if not already available.
7. **applicant-action-modal.component.html — trackBy (3.3, 3.4):** Add `trackBy` functions for `statusOptions` and `tableControls` loops. Can use index-based: `trackByIndex(i: number) { return i; }`.

### Backlog (Low)
8. Remove `.portal-role-proof` dead CSS class from `main-portal.component.scss`.
9. Add `tabindex="0"` to `.portal-preview-content[role="tabpanel"]` in `main-portal.component.html`.
10. Add a visual indicator (e.g., disabled state or checkmark) on the current status button in the status picker.
11. Remove empty `ngOnInit` from `applicant-action-modal.component.ts`.
12. Type the dialog `data` input with an interface in `applicant-action-modal.component.ts`.

---

## SWEEP verdict: NEEDS ATTENTION — 0C / 2H / 5M / 15L
