# GetHired MOBILEVIEW Verification Report V2
Commit base: 0ea0919 (closed BL-006/007/010/011/012/015)
Verified: 2026-06-25

---

## BL-006/007 — Mobile table card (reusable-table)

**Result: PASS**

Checks performed:
- Desktop container: `id="table-container"` uses `class="d-none d-md-inline w-100"` — hidden on mobile, shown on md+. PASS.
- Mobile container: `id="table-container-mobile"` uses `class="d-block d-md-none"` — hidden on desktop, shown on mobile only. PASS.
- Labels: Every data field renders `<span class="gh-mobile-card__label">{{ header?.title }}:</span>` before the value. No raw unlabelled data. PASS.
- Fixed widths at 320px: `.gh-mobile-card__label` has `min-width: 90px` as a flex item inside a `flex-wrap: wrap` container. It will wrap at 320px without overflowing. No hard pixel widths on the card container itself. PASS.
- Action button tap targets: `.gh-mobile-card__action-btn` has `min-width: 44px; min-height: 44px` — meets WCAG 2.5.5. PASS.
- Pagination: The NAVIGATOR DETAILS block (pagination-info + pagination-controls) lives outside both `#table-container` and `#table-container-mobile` and is guarded only by `*ngIf="listDataSource?.length > 0"`. It displays below whichever view is active. PASS.
- `overflow-x: hidden` added at `max-width: 767px` on `section` prevents horizontal bleed. PASS.

Breakpoints verified: 320px, 375px, 768px boundary

---

## BL-010 — Dialog bottom-sheet on mobile (styles.scss)

**Result: PASS**

Checks performed:
- `max-height: 90vh` present on `.mat-dialog-container, .dialog-responsive` inside `@media only screen and (max-width: 767px)`. PASS.
- `overflow-y: auto` present on the same rule — tall content scrolls. PASS.
- `border-radius: 16px 16px 0 0` produces rounded top corners for bottom-sheet feel. PASS.
- `height: auto` set so short-content dialogs shrink to their content. `.cdk-global-overlay-wrapper` is `align-items: flex-end` — short dialogs anchor to the bottom edge (correct bottom-sheet behaviour; empty space above is expected). PASS.
- `gh-sheet-reveal` animation (translateY 16px → 0) wired with `prefers-reduced-motion: no-preference` guard. PASS.
- BL-010 min-width override for `.dialog-responsive .mat-dialog-container` preventing component-level `min-width: 660px` from clipping at narrow viewports. PASS.

Breakpoints verified: 767px (boundary), 375px, 320px

---

## BL-011 — Focus trap (employer-panel)

**Result: PASS**

Checks performed:
- Close button: `<button class="gh-drawer-close-btn">` with `aria-label="Close navigation menu"` present inside the drawer header. PASS.
- `mobileNavOpen` property: Confirmed initialised as `false` in TS; `[class.gh-mobile-drawer--open]="mobileNavOpen"`, `[cdkTrapFocusAutoCapture]="mobileNavOpen"`, and `[attr.aria-expanded]="mobileNavOpen"` all bound to the same property. PASS.
- First focusable element: `#firstDrawerLink` template ref on the Dashboard `<a>` is the first interactive element inside the drawer `<ul>`. `cdkTrapFocusAutoCapture=true` (dynamically bound) moves focus to this element when the drawer opens. PASS.
- Escape handling: `@HostListener` in TS calls `closeMobileNav()` on Escape. `closeMobileNav()` returns focus to `#mobileMenuBtn`. PASS.

Breakpoints verified: 320px, 375px (below md threshold)

---

## BL-012 — Signin form on mobile (signin.component)

**Result: PASS**

Checks performed:
- Form column: `class="col-12 col-lg-6 order-first order-lg-last"` — full width below lg, reordered first in visual stacking. PASS.
- Carousel column: `class="col-lg-6 ... d-none d-lg-block"` — hidden below lg, preventing the 100vh background from pushing the form off-screen. PASS.
- At 320px: form column is `col-12`. `.bg-form` padding at `max-width:759px` is `80px 20px` (top/bottom 80px, sides 20px). With global `box-sizing: border-box` this is internal to the column — no horizontal overflow. Inner `.card` has `padding: 20px 40px` (sides 40px) which compresses content but does not overflow.
- `min-height: 100vh` on `.gh-signin-form-col` fills the viewport on all screen sizes — intentional, form is always visible on initial load. PASS.
- Safe-area padding added via `env(safe-area-inset-bottom)` at `max-width: 575px`. PASS.

Breakpoints verified: 320px, 375px, 991px boundary

---

## BL-015 — Recorder on mobile (3 components)

### recorder.component (main dialog recorder)

**Result: FIX APPLIED**

Issues found and fixed:

1. **gh-recorder-preview class missing on video wrapper** (HTML):
   The SCSS defined `.gh-recorder-preview { width:100%; aspect-ratio:16/9; ... }` for mobile, but the video wrapper div `<div [hidden]="!isVideoRecording || !videoBlobUrl">` had no class. The CSS was dead for this component on mobile.
   Fix: Added `class="gh-recorder-preview"` to that div.
   File: `src/app/recorder/recorder.component.html`

2. **gh-recorder-controls absolute position not cancelled on mobile** (SCSS):
   The first `.gh-recorder-controls` div in the template carries `style="position: absolute; right: 0; top: 0"` for the desktop overlay layout. On mobile the CSS `display: flex; flex-wrap: wrap` was applied but the element remained absolutely positioned, causing the Start/Stop buttons to float over the video area at narrow viewports rather than flowing below it.
   Fix: Added `position: static !important;` inside the `@media (max-width: 767px)` `.gh-recorder-controls` block.
   File: `src/app/recorder/recorder.component.scss`

Other checks:
- `gh-recorder-btn-primary` applied to Start/Stop buttons — PASS.
- `gh-recorder-btn-secondary` applied to View Recording / Upload Video buttons — PASS.
- Second `.gh-recorder-controls` (secondary button group) uses `style="flex-direction: column; align-items: stretch;"` — this is in the right-column (not the video overlay area) so no conflict with mobile positioning fix. PASS.

### application/.../record-interview.component

**Result: PASS**

Checks:
- `<div class="gh-recorder-preview">` wraps `<video>` elements at lines 15 and 19 — div wrapper ensures `aspect-ratio: 16/9` works correctly. PASS.
- `<div class="d-flex align-items-center gh-recorder-controls">` contains all primary/secondary buttons. PASS.
- `gh-recorder-btn-primary` on Start/Stop recording buttons. PASS.
- `gh-recorder-btn-secondary` on Upload, Skip, and Submit buttons. PASS.
- Mobile SCSS: `position: static` not needed here because no inline `position: absolute` on the controls div. PASS.
- `record-container .bg-bottom { position: static; }` prevents question overlay from clipping at 320px. PASS.

### views/.../record-interview.component (public portal)

**Result: PASS**

Checks:
- `<div class="gh-recorder-preview">` wraps an `<img>` placeholder (pre-recording state) — SCSS covers `video, img { width:100%; height:100%; object-fit:cover }`, so both img and video are handled. PASS.
- `<div class="d-flex gh-recorder-controls">` contains Start/Stop buttons. PASS.
- `gh-recorder-btn-primary` on Start/Stop buttons. PASS.
- `gh-recorder-btn-secondary` on Upload, Skip, Submit buttons. PASS.

---

## Fixes Applied

| File | Change |
|------|--------|
| `src/app/recorder/recorder.component.html` | Added `class="gh-recorder-preview"` to video wrapper div |
| `src/app/recorder/recorder.component.scss` | Added `position: static !important` to `.gh-recorder-controls` in `@media (max-width: 767px)` block |

---

## Build Verification

`npm run build-dev` completed successfully after fixes.
Build time: ~60s. No new errors. Pre-existing autoprefixer warnings (unrelated `start` value in contact-group SCSS) present before and after — not introduced by these changes.

---

## Surface Summary

| Surface | Status |
|---------|--------|
| BL-006/007 Mobile table cards | PASS |
| BL-010 Dialog bottom-sheet | PASS |
| BL-011 Focus trap (employer nav drawer) | PASS |
| BL-012 Signin form mobile order | PASS |
| BL-015 recorder.component | FIX APPLIED |
| BL-015 application/.../record-interview | PASS |
| BL-015 views/.../record-interview | PASS |

---

## Overall Mobile Readiness: READY

All BL-006/007/010/011/012/015 items are confirmed correct. Two small defects in `recorder.component` (missing class, un-cancelled absolute position on mobile) were fixed and the build verified clean.
