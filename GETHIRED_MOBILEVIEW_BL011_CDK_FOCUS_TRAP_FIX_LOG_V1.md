# BL-011 CDK Focus Trap Fix Log V1

**Date:** 2026-06-25
**Build result:** PASS (zero errors)

---

## Pre-fix State Audit

### Mobile drawers (nav overlays)

| Panel | File | cdkTrapFocus present | cdkTrapFocusAutoCapture | Focus-return to hamburger | Escape closes | A11yModule imported |
|---|---|---|---|---|---|---|
| Admin panel | `admin-panel/admin-panel.component.html` | YES | YES (`[cdkTrapFocusAutoCapture]="mobileNavOpen"`) | YES (closeMobileNav → mobileMenuBtn.focus()) | YES (@HostListener) | YES (admin-panel.module.ts) |
| Applicant panel | `applicant-panel/applicant-panel.component.html` | YES | YES | YES (closeMobileNav → mobileMenuBtn.focus()) | YES (@HostListener) | YES (applicant-panel.module.ts) |
| Employer panel | `employer-panel/employer-panel.component.html` | **MISSING** | **MISSING** | YES (closeMobileNav → mobileMenuBtnRef.focus()) | YES (@HostListener) | **MISSING** |

### MatDialog dialogs

Angular Material's `MatDialog` provides focus management automatically:
- Focus enters on open (CDK FocusTrap is built in to MatDialogContainer)
- Focus stays inside via the built-in `FocusTrap`
- `restoreFocus: true` is the MatDialog default — focus returns to the trigger element after close
- `role="dialog"` + `aria-modal="true"` are set by Angular Material automatically on the overlay

**Issue found:** No `cdkFocusInitial` attribute was used on any dialog button. This means Angular Material's default first-tabbable-element heuristic determined focus destination (usually the first button or input). For dialogs with multiple buttons, this was not always the most meaningful element.

---

## Fixes Applied

### Fix 1 — Employer panel: Add A11yModule + cdkTrapFocus

**File:** `src/app/employer-panel/employer-panel.module.ts`

Added import:
```typescript
import { A11yModule } from '@angular/cdk/a11y';
```

Added to `imports` array:
```typescript
A11yModule,
```

**File:** `src/app/employer-panel/employer-panel.component.html`

Added to `<nav id="gh-mobile-drawer">`:
```html
cdkTrapFocus
[cdkTrapFocusAutoCapture]="mobileNavOpen"
```

**Why `cdkTrapFocusAutoCapture` instead of only `cdkTrapFocus`:**
- `cdkTrapFocus` alone creates the trap region but does not automatically move focus into it when `mobileNavOpen` becomes true.
- `cdkTrapFocusAutoCapture="true"` (bound to `mobileNavOpen`) moves focus into the first tabbable element inside the drawer as soon as the drawer opens — this supplements the existing `setTimeout → firstDrawerLink.focus()` in `openMobileNav()`.
- The two approaches are complementary: the explicit `setTimeout` targets the first nav link (bypassing the close button), while `cdkTrapFocusAutoCapture` is the CDK fallback.

---

### Fix 2 — ConfirmationDialogComponent: cdkFocusInitial on Cancel button

**File:** `src/app/shared/components/confirmation-dialog/confirmation-dialog.component.html`

Added `cdkFocusInitial` to the Cancel button.

**Rationale:** WCAG 2.4.3 (Focus Order) and destructive-action accessibility best practice: for confirm/cancel dialogs, especially with `data.destructive=true`, focusing the Cancel button first prevents accidental confirmation by keyboard users who press Enter immediately. Angular Material's default would focus the first tabbable element, which is Cancel anyway (it appears first in DOM), but marking it explicitly prevents future DOM reordering from breaking this.

---

### Fix 3 — UpdatedDialogComponent: cdkFocusInitial on Close button

**File:** `src/app/shared/components/updated-dialog/updated-dialog.component.html`

Added `cdkFocusInitial` to the only action button (Close).

**Rationale:** Single-button dialogs — there is only one focusable element, so this is explicit rather than relying on default heuristic. Keyboard users can press Enter/Space immediately to dismiss.

---

### Fix 4 — SuccessDialogComponent: cdkFocusInitial on Continue button

**File:** `src/app/shared/components/success-dialog/success-dialog.component.html`

Added `cdkFocusInitial` to the Continue button.

**Rationale:** Same as Fix 3 — single action, make it explicit.

---

### Fix 5 — SubscriptionAlertComponent: cdkFocusInitial + keyboard access for Cancel span

**File:** `src/app/shared/components/subscription-alert/subscription-alert.component.html`

1. Added `cdkFocusInitial` to the "Upgrade Now" button (primary CTA gets initial focus).
2. Added `role="button" tabindex="0"` to the Cancel/Continue `<span>` elements.

**Rationale for the span fix:** The Cancel and Continue links were `<span>` elements with a `(click)` handler but no `role` or `tabindex`. This made them unreachable by keyboard-only users. Now they are focusable and announced as buttons by screen readers.

---

## Drawer focus trap — full behavior summary (post-fix)

| Panel | Open behavior | Tab cycle | Escape | Close button | Focus on close |
|---|---|---|---|---|---|
| Admin | cdkTrapFocusAutoCapture moves focus into drawer → setTimeout moves to first nav link | Focus cycles only within drawer | @HostListener closes + focus → hamburger | Close button inside drawer | Returns to hamburger (#mobileMenuBtn) |
| Applicant | Same | Same | Same | Same | Returns to hamburger (#mobileMenuBtn) |
| **Employer (fixed)** | **cdkTrapFocusAutoCapture now active** — focus moves into drawer | **Now cycles only within drawer** | @HostListener closes + focus → hamburger | Same | Returns to hamburger (#mobileMenuBtnRef) |

---

## Dialog focus trap — behavior summary (post-fix)

All `MatDialog` dialogs in this project inherit Angular Material's built-in FocusTrap. Verified behaviors:
- Focus enters dialog on open via CDK FocusTrap (built into MatDialogContainer)
- Tab/Shift+Tab cycles within dialog only
- Escape closes dialog and returns focus to trigger element (MatDialog `restoreFocus: true` is the default)
- `aria-modal="true"` and `role="dialog"` applied by Material automatically

| Dialog | cdkFocusInitial button | disableClose | Manual close mechanism | Status |
|---|---|---|---|---|
| ConfirmationDialogComponent | Cancel button | Sometimes true (job-list delete) | Cancel + Continue buttons both close via `dialogRef.close()` | OK |
| UpdatedDialogComponent | Close button | Sometimes true (auto-closes in 2s) | Close button + auto-timeout | OK |
| SuccessDialogComponent | Continue button | Not used | Continue button | OK |
| SubscriptionAlertComponent | Upgrade Now button | Not used | Cancel/Continue close | OK |
| TableControlModalComponent | None (tile grid, not form) | Not used | Close icon in header | Acceptable — Mat default focuses first tabbable (close icon) |
| ApplicantActionModalComponent | None (tile grid) | Not used | Close icon in header | Acceptable |
| VideoPreviewComponent | Not changed | Not used | Component-provided close | Kept as-is (complex media) |
| RecorderComponent | Not changed | Not used | Component-provided close | Kept as-is (complex media) |

---

## What was NOT changed

- Route guards or auth
- Desktop dialog open behavior
- Dialog dimensions at ≥768px
- Any TS component logic
- Any lazy-loaded module that already had correct behavior
