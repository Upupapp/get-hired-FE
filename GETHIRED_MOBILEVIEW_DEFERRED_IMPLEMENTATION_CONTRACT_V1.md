# GETHIRED_MOBILEVIEW_DEFERRED_IMPLEMENTATION_CONTRACT_V1

Command: GETHIRED_MOBILEVIEW_DEFERRED_BACKLOG_CLOSURE_BL006_BL007_BL010_BL011_BL012_BL015_V1
Date: 2026-06-25

This document records the implementation approach decided for each backlog item — what was chosen, what was ruled out, and why. Implementation agents must follow these decisions unless a constraint discovered during coding makes a deviation necessary, in which case the deviation must be logged in the backlog document.

---

## BL-006 / BL-007: Responsive Table — Card-List Pattern

### Decision: Replace the mobile mat-table with a pure Angular card list

**Chosen pattern: *ngFor card list (no Angular Material table directives on mobile)**

The mobile `<table mat-table>` block in `reusable-table.component.html` is removed and replaced with an `*ngFor` loop over `dataSource.data` that renders each row as a `<div class="gh-mobile-card">`. The desktop `mat-table` block is untouched.

**Why this pattern:**
- Eliminates the dual-`MatSort` conflict at the root. There is only one `mat-table` in the DOM at any time.
- The card list uses no Angular Material table directives, so there are no `matColumnDef`, `matHeaderCellDef`, `matCellDef`, or `mat-header-row` elements that could interfere with `MatSort`.
- Cards are semantically neutral (div-based) and can expose row data with explicit `<span class="gh-mobile-card__label">` / `<span class="gh-mobile-card__value">` pairs that are naturally accessible without requiring `<thead>`/`<tbody>` relationships.
- The existing `selectedColumnsMobile` input already restricts which columns appear on mobile — the card list reads this input to decide which fields to render, maintaining the same filtering contract callers already set.

**What was ruled out:**
- CSS-only table-to-card approach (display:block on td): rejected because it does not solve the `MatSort` conflict — the second `mat-table` would still be mounted.
- A separate `MatTable` with its own `MatSort` instance: rejected because it duplicates the datasource and pagination logic.
- A third-party responsive table library: rejected because it adds a dependency and is not needed.

**Card SCSS location:**
`src/app/shared/components/reusable-table/reusable-table.component.scss`
Block starts at `// MOBILEVIEW BL-006/BL-007` comment (approximately line 964). The styles are already written; the HTML replacement is the outstanding work.

**Action buttons on cards:**
Each card renders menu (action) and delete buttons as `<button class="gh-mobile-card__action-btn">` with `min-width: 44px; min-height: 44px` per the SCSS, satisfying WCAG 2.5.5. The `openDialog('menu', data)` and `openDialog('delete', data)` calls are preserved identically.

**Pagination:**
The custom paginator below the table is not changed. It already works independently of the table DOM.

---

## BL-010: Dialog Mobile Safety — Transformation Matrix

Each dialog is classified into one of three treatments. The classification is based on content complexity, user task type, and screen width at 320 px.

### Treatment definitions

| Treatment | Mechanism | When to use |
|---|---|---|
| KEEP | No change needed; dialog is already safe or low-risk on mobile | Short content, single CTA, low overflow risk |
| RESPONSIVE-WIDTH | Add `width: '95vw', maxWidth: '480px'` at the `dialog.open()` call site | Standard forms and confirmations that are currently unset |
| FULL-SCREEN | Replace dialog with a `MatBottomSheet` or add `panelClass: 'gh-dialog-fullscreen-mobile'` with CSS that sets width/height to 100% below 600 px | Complex multi-panel content or media-heavy dialogs |

### Transformation matrix

| Dialog | Treatment | Rationale |
|---|---|---|
| `ConfirmationDialogComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '420px'`) | Short card with two buttons. No scroll needed. Already fits; just needs width guard. |
| `UpdatedDialogComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '420px'`) | Same — simple success card. |
| `RecorderComponent` (video CV, `width: '70vw'`) | FULL-SCREEN — change to `width: '95vw', maxWidth: '700px', height: 'auto'` | Two-column layout collapses to one column via Bootstrap grid on mobile. The `.col-md-8` / `.col-md-4` split already stacks on `< md`. Width change prevents 224 px squeeze at 320 px. |
| `RecorderComponent` (interview path, `minWidth: '30vw'`) | RESPONSIVE-WIDTH — change to `width: '95vw', maxWidth: '700px'` | `minWidth: '30vw'` is only a lower bound; replaces it with a sensible upper bound too. |
| `VideoPreviewComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '700px'`) | Single video element; needs width guard only. |
| `FileViewerComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '700px'`) | iFrame viewer; width guard prevents off-screen render. |
| `ApplicantActionModalComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '600px'`) | Action form; standard treatment. |
| `ImportAddContactComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '560px'`) | Multi-field form. |
| `ImportAddCandidateComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '560px'`) | Same. |
| `ImportAddUserComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '560px'`) | Same. |
| `AddContactGroupComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '480px'`) | Simple name/description form. |
| `CompanyBasicComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '700px'`) | Larger form; needs more width headroom. |
| `UpdateQuestionComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '560px'`) | Standard form. |
| `WorkExperienceComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '560px'`) | Standard form. |
| `EducationalBackgroundComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '560px'`) | Same. |
| `AwardsComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '560px'`) | Same. |
| `SubscriptionAlertComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '420px'`) | Informational only. |
| `SubscriptionSummaryComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '560px'`) | Summary card. |
| `TableControlModalComponent` (both) | KEEP | Toggle list; low content density; already acceptable. |
| `SettingsModalComponent` | RESPONSIVE-WIDTH (`width: '95vw', maxWidth: '480px'`) | Three device-select dropdowns. |
| `InterviewNotificationComponent` | KEEP | Informational card; minimal content. |

---

## BL-011: Focus Trap — Standard

### Decision: cdkTrapFocus + cdkTrapFocusAutoCapture on all non-MatDialog modal drawers

Angular Material `MatDialog` applies focus trap automatically. No action required for any dialog in the BL-010 list.

For custom drawer/panel overlays:
1. Add `cdkTrapFocus [cdkTrapFocusAutoCapture]="isOpen"` to the drawer `<nav>` or `<div>` element.
2. Import `A11yModule` from `@angular/cdk/a11y` in the host module.
3. On close, return focus to the element that opened the drawer (the hamburger button). Store a `@ViewChild` ref to the trigger and call `.focus()` in the close handler.

Pattern already established in:
- `applicant-panel.component.html` — drawer with `cdkTrapFocus [cdkTrapFocusAutoCapture]="mobileNavOpen"` and `#mobileMenuBtn` ViewChild.
- `admin-panel.component.html` — same pattern.

The employer panel mobile drawer must follow the same pattern if it does not already.

---

## BL-012: Sign-in Carousel — Chosen Option

### Decision: Option B — Pause on reduced-motion + suppress auto-advance + add hidden pause button

**Option A** (remove carousel entirely and replace with static trust content) was considered but rejected because the carousel is visible on desktop where it provides marketing value. Removing it is a product decision outside the scope of this backlog closure.

**Option C** (replace Bootstrap data-api carousel with an Angular carousel library) was rejected because it introduces a new dependency and the Bootstrap carousel already auto-initialises from the existing Bootstrap JS bundle. Swapping libraries is a higher-risk change.

**Chosen: Option B — Minimal safe treatment**

1. Add `@media (prefers-reduced-motion: reduce) { .carousel-item { transition: none !important; } }` to `signin.component.scss` and `signup.component.scss`.
2. Add `data-bs-interval="false"` to the carousel `<div>` to disable auto-advance (the marketing animation can be re-enabled per-slide if needed, but auto-advance is the compliance risk). Alternatively, swap `data-bs-ride="carousel"` for `data-bs-ride="false"` so it does not auto-start.
3. Add `aria-label` to each indicator button: `aria-label="Go to slide 1"` etc.
4. Collapse the carousel panel below `lg` breakpoint is already handled by Bootstrap grid (`col-lg-6` becomes `col-12` below 992 px). No additional layout change needed.
5. No pause button is added to the desktop view (the marketing team owns that) but the reduced-motion suppression satisfies SC 2.2.2 for users who have declared their preference.

**Note:** If auto-advance must be kept for business reasons, a visually-styled pause button (`aria-label="Pause slideshow"`) must be added adjacent to the indicators and the `data-bs-pause` API wired to it. This is logged as a follow-on in the backlog document.

---

## BL-015: Recorder — Touch Target Policy

### Decision: WCAG 2.5.5 minimum 44 x 44 CSS px for all interactive controls

**Close button:**
The `<img ... (click)="cancel()">` element (currently 15 x 15 px) must be replaced with a `<button>` element that wraps the icon. The button receives `min-width: 44px; min-height: 44px; padding: 14px; background: none; border: none;`. The `<img>` inside is kept for visual appearance with `aria-hidden="true"`. The `<button>` receives `aria-label="Close recorder"`.

**Start/Stop Recording buttons:**
The `.btn-take-interview` buttons must receive `min-height: 44px` and `min-width: 44px` in the component SCSS.

**View Recording / Upload Video buttons:**
These are `w-100` buttons. Height must be raised to `min-height: 44px`.

**Recording state announcements:**
Add `aria-live="polite"` `aria-atomic="true"` to a visually-hidden span that receives text updates when `isVideoRecording` changes: "Recording started" / "Recording stopped". The timer display should receive `aria-label="Recording time: {{display}}"` on the containing element.

**Error announcements:**
The `videoRecordingError` string should be rendered inside an element with `role="alert"` so errors are immediately announced without requiring focus movement.

**Recording pulse:**
A CSS pulse animation on the record icon should only run while `isVideoRecording === true`. It must be suppressed via `@media (prefers-reduced-motion: reduce) { animation: none; }`.
