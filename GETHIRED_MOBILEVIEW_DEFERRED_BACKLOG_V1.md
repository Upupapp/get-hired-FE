# GETHIRED_MOBILEVIEW_DEFERRED_BACKLOG_V1

Command: GETHIRED_MOBILEVIEW_DEFERRED_BACKLOG_CLOSURE_BL006_BL007_BL010_BL011_BL012_BL015_V1
Date: 2026-06-25

Items that are not fully resolved by this command and must be tracked for future work. Each item has a priority, a reason it was not done here, and a recommended fix approach.

---

## OPEN-001: Sign-in carousel pause button (WCAG 2.2.2)

**Priority:** P2 — accessibility compliance gap; not launch-blocking if `prefers-reduced-motion` treatment is applied and auto-advance is disabled, but a pause button is the fully compliant solution.

**Reason not done in this command:** Adding a pause button requires a product/design decision on visual placement and branding within the marketing panel. The BL-012 treatment (disable auto-advance via `data-bs-ride="false"`) satisfies the practical outcome but a visible pause control is the WCAG-recommended path.

**Recommended fix:**
Add a `<button aria-label="Pause slideshow" aria-pressed="false">` inside the `.carousel-indicators` container in both `signin.component.html` and `signup.component.html`. Wire `(click)` to toggle Bootstrap's `carousel.pause()` / `carousel.cycle()` API or toggle `data-bs-interval="false"`. Style the button to match existing indicators (10 x 10 px dot, brand colour). Update `aria-pressed` dynamically.

---

## OPEN-002: Employer panel mobile drawer focus trap (BL-011 partial)

**Priority:** P2 — accessibility; consistent with the applicant and admin panel fixes already shipped.

**Reason not done in this command:** The employer panel mobile drawer was not confirmed to have `cdkTrapFocus` by the time documentation was written. Other implementation agents may have covered this. If not, it is a separate one-file fix.

**Recommended fix:**
In `employer-panel.component.html`, add `cdkTrapFocus [cdkTrapFocusAutoCapture]="mobileNavOpen"` to the mobile drawer nav element, and add `#mobileMenuBtn` ViewChild reference to the hamburger button. In the `closeMobileNav()` handler, call `this.mobileMenuBtn.nativeElement.focus()` after setting `mobileNavOpen = false`. Pattern is identical to `applicant-panel.component.html`.

---

## OPEN-003: Upload progress UI in Recorder / DocsVideocv

**Priority:** P3 — UX improvement; not a bug.

**Reason not done in this command:** No upload progress UI exists today. Adding one requires a backend change (streaming progress headers or a polling endpoint) and a new UI component. Out of scope for this mobile-view backlog closure.

**Recommended fix:**
In `docs-videocv.component.ts`, capture the `HttpUploadProgressEvent` from `applicantFacade.saveVideo()` and display a progress bar in the component template. Use `reportProgress: true` on the `HttpClient` request. Apply `$motion-duration-meter-fill: 650ms` animation to the bar per the haptics log effect #10.

---

## OPEN-004: Carousel accessibility on signup page — duplicate of signin fix

**Priority:** P2 — the `signup.component.html` contains an identical Bootstrap carousel with identical missing `aria-label` on indicators and no reduced-motion suppression.

**Reason not done explicitly:** Both files were identified in the audit and the implementation contract covers both. This item is a reminder that the fix must be applied to BOTH files, not just `signin.component.html`. If only one file was fixed, this remains open.

**Recommended fix:** Identical to BL-012 treatment in both `signup.component.html` and `signup.component.scss`.

---

## OPEN-005: Video element accessible label in RecorderComponent

**Priority:** P2 — WCAG 1.1.1 (Non-text Content) and 4.1.2 (Name, Role, Value).

**Reason not done in this command:** The template fix (adding `aria-label` or `title` to the `<video>` element) is small but requires validation that it does not interfere with the `controls` attribute toggling. Noted for the implementation agent but tracked here in case it was missed.

**Recommended fix:**
Add `[attr.aria-label]="isVideoRecording ? 'Camera preview' : (videoBlobUrl ? 'Recording playback' : 'Video preview'"` to the `<video #videoElement>` element in `recorder.component.html`.

---

## OPEN-006: FileViewerComponent iFrame height overflow on mobile

**Priority:** P3 — cosmetic; content is viewable via scroll.

**Reason not done in this command:** The `FileViewerComponent` template was not read in this audit pass. The RESPONSIVE-WIDTH dialog config fix addresses the width overflow but internal iFrame height may still be fixed.

**Recommended fix:**
In `file-viewer.component.html`, set `style="width: 100%; height: 80vh; border: none;"` on the `<iframe>` element and remove any fixed-pixel height. Ensure the dialog itself does not set a fixed `height` in its config — use `height: 'auto'` or omit it.

---

## OPEN-007: Hover-only action images in desktop mat-table (pre-existing)

**Priority:** P3 — desktop-only; touch users never reach the desktop table view.

**Reason not done in this command:** The desktop `mat-table` block uses `<img (click)="openDialog('menu', data)">` elements with `class="hvr-grow"` for menu and delete actions. These have no focus-visible state and are not reachable by keyboard navigation (`<img>` with a click handler is not in the tab order). This is a pre-existing accessibility gap in the desktop view, not introduced by this command.

**Recommended fix:**
Replace `<img (click)="...">` action elements in the desktop table with `<button>` elements that wrap the `<img>` (with `aria-hidden="true"` on the img) and carry `aria-label` and natural focus behaviour. This is a separate desktop accessibility task, not a mobile view item.

---

## OPEN-008: Re-evaluate auto-advance suppression after marketing review

**Priority:** P3 — product decision.

**Reason not done in this command:** The decision to disable `data-bs-ride` (auto-advance) was made as a conservative accessibility-first choice. The marketing team may wish to re-enable auto-advance with a pause button (OPEN-001) instead of disabling it entirely.

**Recommended fix:** Once OPEN-001 (pause button) is implemented, change `data-bs-ride="false"` back to `data-bs-ride="carousel"` in both auth component templates.
