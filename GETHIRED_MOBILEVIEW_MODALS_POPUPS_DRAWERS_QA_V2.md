# GETHIRED MOBILEVIEW — Modals, Popups & Drawers QA V2
Generated: 2026-06-25

## Modal / Dialog Behavior

### Global Mat-Dialog Mobile Fix (styles.scss — pre-existing)
```scss
@media only screen and (max-width: 768px) {
  .mat-dialog-container, .dialog-responsive {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    height: auto;
    overflow: auto !important;
  }
}
```

**Effect:** Dialogs go full-width at mobile. This is a sheet-style modal — visually appropriate. However, dialogs still appear at center of screen (default Material positioning) rather than sliding up from bottom (true bottom-sheet UX). This is acceptable for the current state.

**Issues:**
- `border-radius: 12px` on `.mat-dialog-container` creates rounded corners on a full-width box — on mobile with `margin: 0`, this looks odd at edges. Should be `border-radius: 12px 12px 0 0` for bottom-sheet style.
- Dialogs may have internal padding that creates white space at edges

**Fix recommendation (backlog):** Override border-radius at mobile:
```scss
@media (max-width: 767px) {
  .mat-dialog-container {
    border-radius: 12px 12px 0 0 !important;
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
  }
}
```
This is a significant change affecting all dialogs — requires regression testing. **Deferred to backlog.**

---

## Drawers (Navigation)

### Employer Panel Drawer
**Status:** Complete (prior session). See Navigation Log.
- 280px slide-in from left
- Scrim overlay
- Escape key + NavigationEnd close
- 260ms decelerate ease
- Focus management

### Applicant Panel Drawer
**Status:** Added in this pass. See Navigation Log.
- Same architecture as employer
- 5 items + settings

### Admin Panel Drawer
**Status:** Added in this pass. See Navigation Log.
- Same architecture as employer
- 5 items (no settings link — admin role doesn't need settings shortcut)

---

## Dropdowns (Bootstrap + Angular Material)

### Bootstrap Dropdowns (ReusableTable filter)
```html
<button class="dropdown dropdown-toggle" data-bs-toggle="dropdown">
  Status
</button>
<ul class="dropdown-menu">...</ul>
```
**Mobile behavior:** Bootstrap dropdown opens below/above button depending on space. Touch-accessible.
**Issues:** Dropdown items may be < 44px height at 13px font + 8px padding = ~29px.
**Recommendation:** At mobile, increase dropdown-item padding to `padding: 12px 13px` for 44px+ targets.
**Status:** Logged in backlog.

### Angular Material mat-select
**Behavior:** Opens full-screen overlay on mobile (Material default behavior for touch devices). Touch-friendly by default.
**Status:** No changes needed.

### Angular Material mat-menu
**Behavior:** Opens as overlay panel. Touch-accessible.
**Status:** No changes needed.

---

## Popups / Snackbars

### Angular Material Snackbar
**Current position:** Default (bottom-center)
**Issue at mobile:** Bottom nav bar (56–72px) overlaps snackbar
**Recommended fix:** Inject `MatSnackBar` with config `{ verticalPosition: 'top' }` for mobile, or set `{ panelClass: 'gh-snackbar-above-nav' }` and CSS-position above nav
**CSS approach:**
```scss
.gh-snackbar-above-nav.mat-snack-bar-container {
  @media (max-width: 767px) {
    margin-bottom: 80px; // above bottom nav
  }
}
```
**Status:** Not applied in this pass — requires finding all MatSnackBar.open() calls. Logged in backlog.

---

## Confirmation Dialogs
**File:** src/app/shared/components/confirmation-dialog/
**Assessment:** Standard Material dialog. Inherits the global mobile full-width override.
**Issues:** None identified beyond global dialog border-radius issue noted above.

---

## Add-Access Modal
**File:** src/app/shared/components/add-access-modal/
**Assessment:** Standard Material dialog. Inherits mobile override.
**Issues:** None identified.

---

## Summary

| Component | Mobile Behavior | Issues | Status |
|-----------|----------------|--------|--------|
| mat-dialog global | Full-width at 768px | border-radius not bottom-sheet | Backlog |
| Employer drawer | Complete | None | Done (prior) |
| Applicant drawer | Added | None | Done (this pass) |
| Admin drawer | Added | None | Done (this pass) |
| Bootstrap dropdown | Touch accessible | Item height < 44px | Backlog |
| mat-select | Native full-screen | None | OK |
| Snackbar | Overlaps bottom nav | Position override needed | Backlog |
| Confirmation dialog | Inherits global | None beyond global | Backlog |
