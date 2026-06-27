# GETHIRED_MOBILEVIEW_DEFERRED_FRONTEND_HAPTICS_EFFECTS_LOG_V1

Command: GETHIRED_MOBILEVIEW_DEFERRED_BACKLOG_CLOSURE_BL006_BL007_BL010_BL011_BL012_BL015_V1
Date: 2026-06-25

This file specifies every haptic/motion effect that SHOULD be applied across all five backlog items. Implementation agents write code to match this spec. QA validates each row before shipping.

Column definitions:
- Effect: the specific animation or haptic behaviour
- Backlog Item: which BL item owns this effect
- Component / Element: where the effect lives in the codebase
- Screen Size: breakpoint at which this effect is active
- UX Purpose: why the effect exists
- Reduced-Motion Fallback: what happens under `prefers-reduced-motion: reduce`

---

| # | Effect | Backlog Item | Component / Element | Screen Size | UX Purpose | Reduced-Motion Fallback |
|---|---|---|---|---|---|---|
| 1 | Table-to-card row reveal (fade + translateY) | BL-006/007 | `reusable-table.component.scss` — `@keyframes gh-card-reveal` on `.gh-mobile-card` | Mobile only (< 768 px / `d-block d-md-none` breakpoint) | Communicates that data has arrived; gives each card spatial origin (slides up from slightly below) | `animation: none` — cards appear instantly with no motion. Rule already written in the SCSS `@media (prefers-reduced-motion: reduce)` block. |
| 2 | Row card tap compression (scale 0.985 on :active) | BL-006/007 | `reusable-table.component.scss` — `.gh-mobile-card:active { transform: scale(0.985); }` | Mobile only | Physical affordance — card "presses in" when tapped, confirming touch registration | `transform: none` — `:active` state produces no scale change. Rule already written. |
| 3 | Row action button micro-compression (scale 0.9 on :active) | BL-006/007 | `reusable-table.component.scss` — `.gh-mobile-card__action-btn:active { transform: scale(0.9); }` | Mobile only | Same — confirms button tap is registered. Tighter scale than card body to distinguish button from card interaction. | `transform: none` — Rule already written. |
| 4 | Row action menu slide/fade | BL-006/007 | Delegated to `TableControlModalComponent` or the existing `updateSelectedRowDialog` event handler. The dialog/dropdown that appears after tapping the menu button is the reveal animation (BL-010 effect below applies). | Mobile (triggers on mobile card; dialog is universal) | Smooth entrance for contextual action menu | See row 6 (dialog slide reveal) |
| 5 | Dialog / bottom-sheet slide reveal | BL-010 | Angular Material overlay — `MatDialogConfig`. Add `panelClass: 'gh-dialog-slide-in'` to dialog configs that benefit from an entrance animation. CSS: `.gh-dialog-slide-in .mat-dialog-container { animation: gh-dialog-enter 260ms cubic-bezier(0.0, 0.0, 0.2, 1) both; }` `@keyframes gh-dialog-enter { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }` | All screen sizes | Smooth transition from background to foreground signals the dialog is a new context, not an in-page change. Duration aligns with `$motion-duration-drawer: 260ms` in `_motion.scss`. | `animation: none !important` inside `@media (prefers-reduced-motion: reduce)` in global styles. Dialog appears instantly. |
| 6 | Backdrop fade | BL-010 | Angular Material applies `.cdk-overlay-backdrop` automatically. Add `.cdk-overlay-dark-backdrop { animation: gh-backdrop-fade 200ms ease both; }` in `styles.scss`. `@keyframes gh-backdrop-fade { from { opacity: 0; } to { opacity: 0.32; } }` | All screen sizes | Backdrop fade communicates that background content is deprioritised; softens the hard cut. Duration: 200ms (micro-to-card range). | `animation: none` — backdrop appears at full opacity instantly. |
| 7 | Sign-in trust card / carousel transition | BL-012 | `signin.component.scss` + `signup.component.scss` — `.carousel-item { transition: transform 600ms ease-in-out; }` (Bootstrap default). MOBILEVIEW fix: suppress this under reduced-motion: `.carousel-item { transition: none !important; }` | Left panel, all sizes where carousel is visible (desktop lg+) | Cross-slide transition communicates content sequence. Suppressed not replaced — reduced-motion users get instant slide swap. | `transition: none !important` — already specified in the implementation contract. Zero motion. |
| 8 | Recorder button micro-scale on :active | BL-015 | `recorder.component.scss` — `.btn-take-interview:active, .btn-primary:active { transform: scale(0.97); transition: transform 100ms; }` Also applies to the close button: `.gh-recorder-close-btn:active { transform: scale(0.92); }` | All screen sizes (recorder opens as a dialog; touch targets must be safe on any device) | Confirms button press; aligns with `$gh-scale-press: 0.985` token in `_motion.scss`. Slightly tighter on the close button (smaller target context). | `transform: none` inside `@media (prefers-reduced-motion: reduce)` |
| 9 | Recording state pulse (only while recording) | BL-015 | `recorder.component.scss` — `.gh-record-icon--active { animation: gh-record-pulse 1.2s ease-in-out infinite; }` `@keyframes gh-record-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }` Applied to the record dot/icon img only when `isVideoRecording === true` via `[class.gh-record-icon--active]="isVideoRecording"`. | All screen sizes | Communicates that recording is actively in progress — continuous ambient signal. Uses opacity, not scale or translate, to avoid vestibular trigger. | `animation: none !important` — icon is static. Recording state is communicated by button text and aria-live region instead. |
| 10 | Upload progress animation | BL-015 | `recorder.component.scss` (or parent `docs-videocv.component.scss`) — if the parent shows a progress bar or spinner after `applicantFacade.saveVideo()` is called, it should use `animation: gh-progress-bar-fill 650ms ease-out both` (aligns with `$motion-duration-meter-fill: 650ms` in `_motion.scss`). If no progress UI currently exists, this is a no-op for this command. | All screen sizes | Upload progress communicates that the system is working and the user should wait. | `animation: none` — progress bar appears at 100% or as a spinner with no fill animation. |
| 11 | Permission / error banner reveal | BL-015 | `recorder.component.html` — `videoRecordingError` span / `role="alert"` element. CSS: `[role="alert"] { animation: gh-banner-reveal 200ms ease both; }` `@keyframes gh-banner-reveal { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }` | All screen sizes | Error messages that slide in gently are less alarming than instant appearance; the brief motion draws attention. | `animation: none` — banner appears instantly. Alert role still fires. |
| 12 | Focus-visible glow on all interactive elements | BL-006/007, BL-010, BL-011, BL-012, BL-015 | Global `styles.scss` — `:focus-visible { outline: 2px solid #6160DC; outline-offset: 2px; border-radius: 4px; }` For `.gh-mobile-card__action-btn`, the rule is already written in the component SCSS. | All screen sizes | Keyboard and assistive-tech users need a clear, visible focus indicator (WCAG 2.4.7 / 2.4.11). The brand purple (`#6160DC`) matches the primary colour token. | Not applicable — focus-visible outline is not an animation; it has no motion component to suppress. |

---

## Implementation Notes

1. Effects 1, 2, 3 are already written in `reusable-table.component.scss`. The implementation agent needs to wire the HTML template to use the card classes.

2. Effect 5 (dialog slide reveal) requires a global CSS addition in `styles.scss` plus a `panelClass` config change at each `dialog.open()` call site. The `panelClass` approach avoids touching Angular Material internals.

3. Effect 6 (backdrop fade) is a global styles change only. No component changes required.

4. Effect 9 (recording pulse) requires a class binding in `recorder.component.html` and a keyframe in `recorder.component.scss`.

5. Effect 12 (focus-visible glow) should be audited against the current `styles.scss` to confirm no existing `:focus` override removes `outline: none` globally. The existing `input:focus { outline: 2px solid $color-global-red-buttons !important; }` in `signin.component.scss` is scoped to that component and is acceptable.

6. Haptic vibration (device vibration API): not specified for this command. The Web Vibration API is not currently used anywhere in the codebase. Adding it is out of scope for this backlog closure.
