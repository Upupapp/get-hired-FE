# GETHIRED_MOBILEVIEW_DEFERRED_ACCESSIBILITY_QA_V1

Command: GETHIRED_MOBILEVIEW_DEFERRED_BACKLOG_CLOSURE_BL006_BL007_BL010_BL011_BL012_BL015_V1
Date: 2026-06-25
Standard: WCAG 2.2 Level AA

Checklist format: each criterion is a verifiable binary test. Mark PASS or FAIL (with note) after implementation.

---

## BL-006 / BL-007: Tables → Card List

### Row relationships and data identity

- [ ] Each card's primary identifier (name, ID, or title) is rendered in a `<span>` or `<p>` with `class="gh-mobile-card__title"` and is visually distinct (font-weight 700 per SCSS).
- [ ] Label/value pairs use explicit text labels (`<span class="gh-mobile-card__label">Field name:</span> <span class="gh-mobile-card__value">value</span>`), not positional context.
- [ ] Boolean values (formerly `true`/`false` from the datasource) are converted to "Yes"/"No" in the card template, consistent with the desktop table logic.
- [ ] Date fields display in `dd-MM-yyyy` format (via Angular `date` pipe), consistent with desktop.
- [ ] Currency fields display with `$` prefix, consistent with desktop.
- [ ] Status badges on cards use both a visible class-based colour AND a visible text label. Color alone is not the only status indicator (WCAG 1.4.1 Use of Color).
- [ ] Empty state: when `listDataSource.length === 0` the card list renders the same empty-state block that the desktop table shows (the existing `*ngIf="listDataSource?.length === 0"` block).

### Row actions

- [ ] Menu (action) button on each card is a native `<button>` element, not a `<div>` or `<img>` with a click handler.
- [ ] Delete button on each card is a native `<button>` element.
- [ ] Both action buttons have `aria-label` attributes: `aria-label="Open actions for [row title]"` and `aria-label="Delete [row title]"`.
- [ ] Both action buttons meet 44 x 44 CSS px minimum (enforced by `.gh-mobile-card__action-btn` SCSS rule: `min-width: 44px; min-height: 44px`).
- [ ] Tap-compression `:active` transform is present for action buttons (`.gh-mobile-card__action-btn:active { transform: scale(0.9); }`).
- [ ] Focus-visible outline is present on action buttons (`.gh-mobile-card__action-btn:focus-visible { outline: 2px solid $color-blue-primary; outline-offset: 2px; }`).
- [ ] Action buttons are reachable by Tab key in logical DOM order (menu before delete within each card; cards ordered identically to the paginated datasource).

### Keyboard access

- [ ] Cards themselves are not keyboard-accessible unless they carry an explicit action (single-click select, double-click detail). If click is required, the `<div class="gh-mobile-card">` must have `tabindex="0"` and `role="button"` with `(keydown.enter)` and `(keydown.space)` handlers, or be wrapped in a `<button>`.
- [ ] If cards are selectable (via `selectRows(row)` on click), the selected state is announced: `aria-pressed="true/false"` when card acts as a button, or `aria-selected` if part of a listbox.
- [ ] Double-click to open detail (`viewDetailDialog(row)`) has a keyboard equivalent (Enter key if card is focusable).

### No hover-only actions

- [ ] No action is available only on hover with no equivalent keyboard/touch path. (Desktop table uses `hvr-grow` CSS on menu/delete images — these must not be the only action surface. The card buttons replace them on mobile.)

### Color is not the only meaning

- [ ] Status chips (`btn-status` class derivatives) include text label inside the chip, not just background color.
- [ ] Selected card state (`gh-mobile-card--selected`) uses both border-color change and background-color change, not color alone.

---

## BL-010: Dialogs / BL-011: Focus Trap

### All MatDialog-opened dialogs

- [ ] Angular Material `MatDialog` automatically applies `role="dialog"` to the overlay container. Verify the dialog host element has `role="dialog"` in the rendered DOM (DevTools check).
- [ ] Angular Material automatically sets `aria-modal="true"` on the dialog panel. Verify in rendered DOM.
- [ ] Each dialog has an accessible name. Method: pass `ariaLabel` in the dialog config, OR ensure the dialog template's first heading is linked via `aria-labelledby`. Audit each dialog listed in BL-010 matrix:
  - [ ] `ConfirmationDialogComponent` — heading "Confirmation" already present; add `ariaLabel` to `dialog.open()` config or `mat-dialog-title` directive.
  - [ ] `UpdatedDialogComponent` — add `ariaLabel`.
  - [ ] `RecorderComponent` — title is passed via `data.title`; wire to `mat-dialog-title` or `ariaLabel`.
  - [ ] `VideoPreviewComponent` — add `ariaLabel: 'Video answer preview'`.
  - [ ] `FileViewerComponent` — add `ariaLabel: 'Document preview'`.
  - [ ] All import/add form dialogs — add `ariaLabel` matching the dialog's heading.

### Focus trap

- [ ] Focus moves into the dialog immediately on open (Angular Material default behaviour; verify by tabbing in mobile browser).
- [ ] Tab/Shift+Tab cycles only within the dialog — focus does not escape to background content.
- [ ] Focus returns to the triggering element when the dialog closes. Angular Material handles this automatically via `MatDialogRef`. Verify for each dialog that the element which opened it is still in the DOM when the dialog closes.
- [ ] Pressing Escape closes the dialog. Angular Material default — verify `disableClose` is NOT set to `true` in any dialog config unless intentionally blocking escape (e.g., unsaved-changes gate).
- [ ] The close/cancel button in each dialog is the first or last focusable element so keyboard users can quickly exit.

### Non-MatDialog drawers (BL-011)

- [ ] Applicant panel mobile drawer: `cdkTrapFocus` present — ALREADY VERIFIED IN AUDIT.
- [ ] Admin panel mobile drawer: `cdkTrapFocus` present — ALREADY VERIFIED IN AUDIT.
- [ ] Employer panel mobile drawer: verify `cdkTrapFocus [cdkTrapFocusAutoCapture]="mobileNavOpen"` is present in `employer-panel.component.html`.
- [ ] On drawer close, focus returns to `#mobileMenuBtn` (the hamburger trigger). Verify the close handler calls `this.mobileMenuBtn.focus()` or equivalent.
- [ ] Backdrop click closes drawer AND returns focus. Verify `(click)="closeMobileNav()"` on the scrim also triggers focus return.

### Bottom-sheet treatment (if used for any dialog)

- [ ] If `MatBottomSheet` is used as the mobile treatment for any dialog, `role="dialog"` and `aria-label` must be set in the bottom-sheet config.
- [ ] Focus trap applies identically to bottom sheets via Angular Material's `FocusTrap`.

---

## BL-012: Sign-in Carousel

### Not trapping focus

- [ ] Carousel indicators (`<button data-bs-slide-to>`) are focusable individually. Tab key moves through them.
- [ ] Focus is NOT trapped inside the carousel panel — Tab key naturally exits to the form panel.
- [ ] Carousel does not steal focus on auto-advance. (Bootstrap data-api carousel never steals focus programmatically — verify no custom JS overrides this.)

### Reduced-motion respected

- [ ] `@media (prefers-reduced-motion: reduce) { .carousel-item { transition: none !important; } }` is present in `signin.component.scss` and `signup.component.scss`.
- [ ] Auto-advance is disabled (`data-bs-ride="false"` or `data-bs-interval="false"`) so the carousel does not move without user interaction.
- [ ] No transform or translate animations run on the carousel under `prefers-reduced-motion: reduce`.

### Accessible labels

- [ ] Each indicator button has `aria-label="Go to slide N"` (or equivalent).
- [ ] The active indicator has `aria-current="true"`.
- [ ] Carousel images have descriptive `alt` attributes (or `alt=""` if purely decorative).
- [ ] Heading text inside each slide is rendered in the DOM as heading elements (`h4`, `h5`), not as styled `<div>` — ALREADY CONFIRMED in the template audit.

### Sign-in form not affected

- [ ] The login form (email, password, submit button) tab order is not disrupted by carousel changes.
- [ ] Removing auto-advance does not affect the form's submit behaviour.
- [ ] `routerLink="/jobs"` on the logo image does not become the first tab stop — verify natural reading order places the form inputs first when the carousel is on the left panel.

---

## BL-015: Recorder

### Labeled controls

- [ ] Close button is a native `<button>` with `aria-label="Close recorder"`. The icon inside has `aria-hidden="true"`. Min 44 x 44 px.
- [ ] Start Recording button has an accessible label (button text "Start Recording" is already in the template — confirm it remains visible at all sizes, not truncated to icon-only).
- [ ] Stop Recorder button has an accessible label.
- [ ] View Recording button has an accessible label.
- [ ] Upload Video Instead button has an accessible label.
- [ ] Microphone `<select>` has a `<label>` element associated via `for`/`id` or wrapping. Current template uses a `<label>` above the select — verify the association is explicit (`for` matches `id`).
- [ ] Speaker/Audio Output `<select>` — same.
- [ ] Camera `<select>` — same.
- [ ] File upload `<input type="file" hidden>` has an `aria-label` on the triggering button ("Upload Video Instead" button text provides this — confirm it matches `accept` description).

### Text-based status (no color-only state)

- [ ] Recording state change ("recording" / "not recording") is announced via `aria-live="polite"` region with text content, not only a button label swap or icon change.
- [ ] Timer value (`{{display}}`, e.g. "01:23") is readable by screen readers. The containing element should not suppress it via `aria-hidden`.
- [ ] Error messages (`videoRecordingError`) render in an element with `role="alert"` so they are announced immediately.
- [ ] Initialising state (`isVideoInitialising`) — if a spinner or disabled state is shown, it must be communicated to screen readers (e.g., `aria-busy="true"` on the button, or a live region update "Requesting camera access…").

### Recording pulse (reduced-motion)

- [ ] If a CSS pulse animation is applied to the record icon while `isVideoRecording === true`, it is suppressed via `@media (prefers-reduced-motion: reduce) { animation: none; }`.
- [ ] The recording indicator does not rely on animation alone to communicate that recording is active — the button text and/or a live-region announcement also communicates this.

### Video element

- [ ] `<video #videoElement>` has `title` or `aria-label` describing its purpose ("Camera preview" while recording, "Recording playback" after stop).
- [ ] `controls` attribute is set correctly: `false` while recording (camera preview, no user controls needed), `true` after stop (playback controls needed). This is already implemented in the component — verify in rendered DOM.
