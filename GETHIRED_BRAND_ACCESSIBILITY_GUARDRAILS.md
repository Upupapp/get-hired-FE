# GETHIRED BRAND — Accessibility Guardrails (Phase 15)
**BRAND v6 · 2026-06-27**

---

## Checklist

### Reduced Motion
- [x] Global `@media (prefers-reduced-motion: reduce)` block in `styles.scss` — disables ALL animation/transition durations to 0.01ms.
- [x] `@include motion-safe` mixin in `_motion.scss` — per-component suppression.
- [x] `@include ambient-motion-safe` mixin — for continuous animations (shimmer, hero mesh).
- [x] All new BRAND v6 classes have `@include motion-safe` or are covered by the global block.
- [x] HapticFeedbackService: `respectReducedMotion()` suppresses vibration when preference is set (v6 addition).
- [ ] BACKLOG: CV Health score countup (JS-driven) needs explicit `prefers-reduced-motion` JS check to skip countup.
- [ ] BACKLOG: KPI countup JS animation needs same check.

### Visible Focus
- [x] Global `:focus-visible` outline: `2px solid $color-global-red-buttons; outline-offset: 2px` in `styles.scss`.
- [x] Sidebar items: `focus-visible` defined per `.gh-sidebar-item`, `.gh-sidebar-subitem`, `.gh-sidebar-settings`, `.gh-sidebar-logo`.
- [x] Dashboard (BRAND v5): focus styles on action cards, pipeline stages.
- [ ] VERIFY: All interactive elements in public portal, applicant flow, admin panel have visible focus (not suppressed by component CSS).
- [ ] BACKLOG: Standardise all `focus-visible` implementations to use a global custom property `--gh-focus-ring: 2px solid #FF7062` for consistency.

### Keyboard Navigation
- [x] Sidebar: keyboard navigable via `tabindex`, `role` attributes.
- [x] Modals: focus trap expected (check all Mat dialogs).
- [x] Employer dashboard: action cards, retry buttons, pipeline stages keyboard accessible.
- [ ] VERIFY: Filter chips keyboard selectable. Tab → Space to select.
- [ ] VERIFY: Modal close (Escape key) returns focus to trigger.
- [ ] BACKLOG: Dropdown menus need keyboard close (Escape) and arrow-key navigation.

### No Colour-Only Meaning
- [x] All state badges: icon + text (not just green/red background).
- [x] Success/warning/error toasts: icon + text label.
- [x] Focus ring uses `outline`, not just background change.
- [ ] VERIFY: Pipeline stage colours have text labels.
- [ ] VERIFY: Employer branding health completeness: progress bar has text percentage.

### No Flashing / Shake
- [x] Error states: no shake animation, no pulsing red loop.
- [x] Validation errors: no per-keystroke haptic, no shake.
- [ ] VERIFY: No `@keyframes` in codebase produces 3+ flashes per second.

### No Autoplay Decorative Loops (with reduced motion)
- [x] Skeleton shimmer: `@include ambient-motion-safe` disables under `prefers-reduced-motion`.
- [x] Dashboard hero mesh: ambient; reduced motion stops it.
- [ ] VERIFY: Video CV component — autoplay disabled by default.

### Text for Every Animated State
- [x] Loading states: visually-hidden `aria-live="polite"` text for SR users.
- [x] CV Doctor steps: `aria-live="polite"` on step description.
- [x] Success: text always paired with animation.
- [ ] BACKLOG: KPI countup — SR should announce final value, not intermediate numbers. Use `aria-label` with final value on the KPI element.

### Labeled Interactive Icons
- [x] Sidebar icon buttons: SVGs have `aria-hidden="true"`; label in `.gh-sidebar-label`.
- [x] Settings button: has visible label or `aria-label`.
- [ ] VERIFY: Topbar icon buttons (notifications, profile) have `aria-label`.
- [ ] VERIFY: All icon-only buttons have `aria-label` or `title`.

### Haptics Not Required
- [x] Haptic feedback is always paired with visible state change.
- [x] HapticFeedbackService fails silently.
- [x] No UI information is communicated only via haptic.

### Focus Equivalents for Hover-Only Effects
- [x] Card hover lift: also applies on `:focus-within`.
- [x] Button hover: focus-visible outline replaces/enhances hover style.
- [ ] VERIFY: Any `@media (hover: hover)` block has a focus equivalent.

### Mobile / Touch Equivalents
- [x] Global `.mat-raised-button:active, .btn:active, .gh-card:active` compress on touch.
- [x] WCAG 2.5.5: `.btn-primary`, `.btn-outline-primary` have `min-height: 44px`.
- [x] `.mat-icon-button, .icon-btn` have `min-width/min-height: 44px`.
- [x] Dropdown items: 48px height on mobile.
- [ ] VERIFY: Filter chips are ≥44px on mobile.

### No Focus Traps (except intentional modal)
- [x] Modals should trap focus (Angular Material MatDialog handles this).
- [ ] VERIFY: No accidental focus traps in custom-built panels.

### Readable Toast Duration
- [x] Global rule: success toasts ≥5s, warning ≥8s, errors non-auto-dismiss.
- [x] `danger-snackbar`, `warning-snackbar`, `error-snackbar`, `warn-snackbar` classes defined.
- [ ] VERIFY: Angular Material snackbar duration config matches this rule at call sites.

### Live Regions Not Overused
- [x] `role="alert"` (assertive) only for urgent, unexpected failures.
- [x] `role="status"` / `aria-live="polite"` for non-urgent updates.
- [ ] REVIEW: Ensure HTTP interceptor error snackbars don't fire `role="alert"` for every minor error (alert fatigue).

### Persistent Enough Errors
- [x] Critical errors (session expired, page error, submit failure): persist until user acts.
- [x] Error cards have retry buttons.
- [ ] VERIFY: No critical error is on an auto-dismiss timer.

---

## ARIA Pattern Reference

| Scenario | Pattern |
|---|---|
| Unexpected urgent error | `role="alert"` |
| Status update while user waits | `role="status"` or `aria-live="polite"` |
| Field validation error | `aria-describedby` + `aria-invalid="true"` |
| Loading region | `aria-busy="true"` |
| Skeleton blocks | `aria-hidden="true"` |
| Decorative icons/illustrations | `aria-hidden="true"` |
| Icon-only buttons | `aria-label="[action]"` |
| Progress bar | `role="progressbar"` + `aria-valuenow` + `aria-valuemin` + `aria-valuemax` |
| Count animation | `aria-live` on container; suppress intermediate values (update only at final) |
| Toast/snackbar | Angular Material handles; ensure duration ≥5s for success |
| Modal dialog | Angular Material handles focus trap; ensure escape closes |

---

## WCAG Coverage

| Criterion | Status |
|---|---|
| 1.1.1 Non-text content | PARTIAL — audit ongoing |
| 1.3.1 Info and relationships | PARTIAL — form labels present; heading hierarchy varies |
| 1.4.3 Contrast (minimum) | PARTIAL — coral on white fails at raw `#FF7062`; used as accent not text |
| 1.4.11 Non-text contrast | PARTIAL — focus rings present globally |
| 2.1.1 Keyboard | PARTIAL — main flows accessible; dropdowns need work |
| 2.4.7 Focus visible | PASS (global `:focus-visible` present) |
| 2.5.5 Target size | PASS (min 44px on interactive elements) |
| 3.3.1 Error identification | PARTIAL — field errors present in some forms |
| 3.3.2 Labels/instructions | PARTIAL — labels present; helper text inconsistent |
