# GETHIRED MOBILEVIEW — Modals, Popups & Drawers QA V3
Generated: 2026-06-26

---

## Dialog Bottom-Sheet (BL-010)

**Status: SHIPPED in styles.scss**

Implementation in styles.scss (lines 506-577):

### CSS rules applied at max-width: 767px:
- `.cdk-global-overlay-wrapper .cdk-overlay-pane`: max-width:100vw, width:100%
- `.mat-dialog-container, .dialog-responsive`:
  - width: 100%, max-width: 100vw
  - margin: 0, padding: 16px
  - height: auto, max-height: 90vh, overflow-y: auto
  - border-radius: 16px 16px 0 0 (top corners rounded, bottom flush to screen edge)
  - Animation: gh-sheet-reveal (opacity 0→1, translateY 16px→0, 220ms decelerate)
- `.cdk-global-overlay-wrapper`: align-items: flex-end (slides up from bottom)

### Reduced motion:
- `.mat-dialog-container, .mat-bottom-sheet-container`: animation:none

### Overlay pane min-width fix:
- `.dialog-responsive .mat-dialog-container`: min-width: unset at 767px
  (prevents component-level min-width:660px from clipping off-screen)

### Scope note:
- Only applies to `.cdk-global-overlay-wrapper` (MatDialog/MatBottomSheet)
- Does NOT affect `.cdk-overlay-connected-position-bounding-box` (autocomplete, mat-select, tooltip)
- 768px exact keeps standard dialog — bottom-sheet only for 767px and below

---

## Mobile Navigation Drawers (all 3 portals)

All three portal drawers (employer, applicant, admin):
- 280px fixed width, slides from translateX(-100%) to translateX(0)
- Transition: $motion-duration-drawer (260ms) $motion-ease-decelerate
- @include motion-safe — reduced-motion: transition:none!important
- z-index: 1001 (above scrim 1000, above bottom nav 999)
- Scrim: fixed, rgba(0,0,0,0.48), opacity 0 → 1 on open
- cdkTrapFocus: keyboard users cannot tab outside drawer when open (BL-011)
- Close button: 44×44px, focus-visible ring
- Nav items: 52px height

---

## Specific Modal Components

### Contact/Candidate Action Modals

- `dialog-responsive` class applied to modal containers in employer-contacts
- BL-010 overlay pane min-width fix ensures they don't clip off-screen on mobile
- Not individually audited for content layout

### Application Status / Confirmation Dialogs

- Standard MatDialog — converted to bottom-sheet on mobile via BL-010
- Short confirmation dialogs (yes/no) benefit most from bottom-sheet UX

---

## Issues Found

| ID | Component | Issue | Severity | Status |
|----|-----------|-------|----------|--------|
| MOD-01 | Complex form modals | Long forms in MatDialog at 767px: 90vh max-height + overflow-y:auto — works but may be suboptimal | Low | Monitor |
| MOD-02 | Nested dialogs | Not audited | Low | Deferred V4 |
