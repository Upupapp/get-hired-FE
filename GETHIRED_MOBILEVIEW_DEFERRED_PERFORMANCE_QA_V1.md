# GETHIRED_MOBILEVIEW_DEFERRED_PERFORMANCE_QA_V1

Command: GETHIRED_MOBILEVIEW_DEFERRED_BACKLOG_CLOSURE_BL006_BL007_BL010_BL011_BL012_BL015_V1
Date: 2026-06-25

Checklist format: each criterion is a verifiable binary test. Mark PASS or FAIL (with note) after implementation.

---

## General Constraints (all backlog items)

- [ ] No new npm packages added. All changes use existing Angular CDK, Angular Material, Bootstrap 5, and framework APIs already in the bundle. Verify with `git diff package.json` — no new entries under `dependencies` or `devDependencies`.
- [ ] Angular build passes without errors: `ng build --configuration production`. Verify exit code 0.
- [ ] No new circular imports. Verify build output does not warn of circular dependency chains involving modified modules.
- [ ] `ng lint` passes on modified files (or lint warnings are pre-existing and unchanged).

---

## BL-006 / BL-007: Table → Card Performance

### No layout shift from table-to-card transition

- [ ] The card list occupies approximately the same vertical space as the mat-table rows it replaces. The transition from 0 rows (loading skeleton or spinner) to populated cards does not cause a large Cumulative Layout Shift (CLS).
- [ ] The `animation: gh-card-reveal 220ms ease-out both` on `.gh-mobile-card` uses `opacity` and `translateY` only. Neither property triggers a layout recalculation (both are compositor-only). Verify no `height`, `width`, `margin`, or `padding` is animated.
- [ ] The pagination controls below the table are not repositioned by the card list render. The `border-top: solid 1px #c9c9c9` spacer div is unaffected.
- [ ] No `*ngFor` in the card list creates more DOM nodes than the paginated row count (`maxRows`, default 5). The card list iterates `dataSource.data` which is already sliced to `maxRows`.
- [ ] The `@keyframes gh-card-reveal` is defined inside the component's SCSS (scoped), not in `styles.scss`. Verify no global keyframe pollution.

### No expensive operations on scroll

- [ ] The card list does not attach any `scroll` or `resize` event listeners. All data is already paginated via `dataSource.data` slicing in the component TypeScript.
- [ ] No `IntersectionObserver` or virtual scroll is introduced by the card change. The existing manual pagination is retained.
- [ ] The sort mechanism (`MatSort` on the desktop table) does not trigger any re-render of the card list. The card list reads `dataSource.data` which is the already-sorted, paginated snapshot; it does not subscribe to `MatSort.sortChange` independently.

### Image assets in cards

- [ ] Profile images (`header.col_name === 'profile_image'`) in cards use the same `<img [src]="data?.profile_image">` binding already used in the desktop table. No additional HTTP requests are triggered by the mobile view.
- [ ] Images in cards are not loaded via JavaScript `fetch` or `HttpClient` — they are standard `<img>` src bindings, deferred by the browser naturally.

---

## BL-010: Dialog Performance

### No layout shifts from dialog transitions

- [ ] `MatDialog` opens with an Angular-Material-managed overlay. The overlay is absolutely positioned and does not reflow document content. Verify by observing CLS in Chrome DevTools Performance tab when opening any dialog.
- [ ] Changing dialog `width` config from an unset value to `95vw` does not produce a visible layout jump — the dialog was previously rendered at browser default (80 vw) and the change is <= 15 vw.
- [ ] `maxWidth: '480px'` (or similar cap) prevents the dialog from stretching excessively on tablets. No regression on 768 px viewport.

### Dialog DOM cleanup

- [ ] `MatDialogRef.afterClosed()` subscriptions in parent components are unsubscribed. Existing code uses `.subscribe()` and stores the subscription in a variable (e.g., `recording$`, `confirmation$`). Confirm these are cleaned up in `ngOnDestroy` or use `takeUntil(this.unsubscribe$)`.
- [ ] No `MatDialog` reference leaks: confirm dialog components do not hold subscriptions beyond `afterClosed()`. `RecorderComponent` uses `RecordService` observables — confirm `stopRecording()` is called in `ngOnDestroy` (already present in the component).

---

## BL-011: Focus Trap Performance

- [ ] `cdkTrapFocus` from `@angular/cdk/a11y` is already imported in `A11yModule` which is already in `SharedModule`. Adding the directive to the employer panel (if missing) adds zero bundle weight.
- [ ] `[cdkTrapFocusAutoCapture]="mobileNavOpen"` only activates the trap when the drawer is open. When `mobileNavOpen === false`, no focus monitoring overhead is incurred.

---

## BL-012: Carousel Performance

### No transition cost under reduced-motion

- [ ] With `transition: none !important` applied under `prefers-reduced-motion: reduce`, the browser skips all compositor work for the carousel slide animation.
- [ ] With auto-advance disabled (`data-bs-ride="false"`), no `setInterval` runs in Bootstrap's Carousel JS while the user is on the sign-in page. This reduces unnecessary JS timer activity.

### No new image requests

- [ ] No carousel images are added or changed. The three existing `login-object-new-*.png` assets are retained. No additional HTTP requests.
- [ ] Images inside carousel items already have no `loading="lazy"` attribute; they load eagerly as the sign-in page is a first-paint critical page. This is acceptable and unchanged.

---

## BL-015: Recorder Performance

### No additional media API overhead

- [ ] The only change to `RecorderComponent` is cosmetic (button sizing, ARIA attributes, `role="alert"` span, `aria-live` span). No new streams, subscriptions, or `MediaRecorder` calls are added.
- [ ] `aria-live` regions are empty when not in use and receive text content only on state transitions (`isVideoRecording` changes). No polling or timer-driven updates to the live region.
- [ ] The CSS recording pulse animation (if added) uses `animation: gh-record-pulse Ns ease-in-out infinite` with `transform: scale()` only — compositor layer, no layout cost. It runs only while `isVideoRecording === true` (controlled by `[class.gh-recording]="isVideoRecording"` or equivalent class binding).

### Build output

- [ ] `ng build --configuration production` succeeds with no increase in main bundle size beyond ± 2 KB (the changes are template text and ARIA attributes, not new logic).
- [ ] Lazy-loaded module containing `RecorderModule` is not affected in chunk size beyond ± 2 KB.
