# GETHIRED MOBILEVIEW — Backlog V3
Generated: 2026-06-26

---

## Status Summary from V2

All V2 backlog items have been resolved or formally deferred:
- BL-001 through BL-009: SHIPPED (Pass 1 + Pass 2)
- BL-010: SHIPPED (dialog bottom-sheet)
- BL-011: RESOLVED (cdkTrapFocus in place)
- BL-012: SHIPPED (signin carousel hidden via d-none d-lg-block)
- BL-013, BL-014: SHIPPED
- BL-015: SHIPPED (recorder mobile touch targets)

---

## V3 New Backlog Items

---

### BL3-001: Subscription button touch targets

**File:** `src/app/employer-panel/employer-subscription/employer-subscription.component.scss`
**Elements:** `.btn-subscribe` (≈41px), `.btn-subscribe-active` (≈41px), `.btn-get-started` (≈43px)
**Fix:** Add `min-height: 44px` to all three classes in an `@media (max-width: 767px)` block.
**Risk:** LOW — CSS only, mobile breakpoint only. NOT touching PayMongo payment logic.
**Impact:** Medium — subscription is a conversion-critical page.
**Priority:** Medium

```scss
// Example fix:
@media (max-width: 767px) {
  .btn-get-started,
  .btn-subscribe,
  .btn-subscribe-active {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
```

---

### BL3-002: Recorder .btn-take-interview touch target

**File:** `src/app/recorder/recorder.component.scss`
**Element:** `.btn-take-interview` — `height: 40px` hardcoded, no min-height
**Fix:** Add `min-height: 44px` to `.btn-take-interview` (global, not just mobile — 40px is below threshold everywhere)
**Risk:** LOW — CSS only. Recorder functionality not affected by height change.
**Impact:** Medium — recorder is business-critical; the trigger button must be reliably tappable.
**Priority:** Medium

```scss
// Example fix:
.btn-take-interview {
  min-height: 44px; // was: height: 40px
  height: auto;     // allow button to grow if content wraps
}
```

---

### BL3-003: Billing bar link touch target

**File:** `src/app/employer-panel/employer-panel.component.scss`
**Element:** `.gh-billing-bar-link` — padding:4px 8px + ~11px font = ≈23px total
**Fix:** Add `min-height: 44px; align-items: center;` to `.gh-billing-bar-link`
**Risk:** LOW — CSS only. The billing bar is mobile-only (d-md-none).
**Impact:** Low — billing bar is a secondary nav, not a primary action.
**Priority:** Low

---

### BL3-004: Subscription page bg-pink bottom padding

**File:** `src/app/employer-panel/employer-subscription/employer-subscription.component.scss`
**Element:** `.bg-pink` — `padding: 60px 30px 150px 30px` — 150px bottom padding is very tall on mobile
**Fix:** Reduce at mobile breakpoint: `@media (max-width: 767px) { .bg-pink { padding: 32px 16px 60px; } }`
**Risk:** LOW — visual padding only.
**Impact:** Low — aesthetic improvement.
**Priority:** Low

---

### BL3-005: Skip to main content link (WCAG 2.4.1)

**File:** Global — likely `src/app/app.component.html` or each portal shell HTML
**Change:** Add `<a href="#main-content" class="sr-only sr-only-focusable">Skip to main content</a>` before the nav
**Risk:** LOW — HTML only. Requires adding an `id="main-content"` to the main content area.
**Impact:** Medium — WCAG 2.4.1 Level A bypass block mechanism for keyboard users.
**Priority:** Medium

---

### BL3-006 (DEFERRED): Signup page mobile audit

**Status:** Not audited in V1/V2/V3.
**Action:** Full mobile audit of /signup in V4.
**Risk:** MEDIUM — auth flow; test thoroughly.

---

### BL3-007 (DEFERRED): Language selector mobile behavior

**Status:** Not audited.
**Action:** Check if language switcher is accessible and tappable on mobile.
**Risk:** LOW.

---

### BL3-008 (DEFERRED): /companies page mobile audit

**Status:** Not audited.
**Action:** Bootstrap grid should handle it; confirm no horizontal overflow.

---

### BL3-009 (DEFERRED): Signin .btn-social touch target (≈41px)

**File:** `src/app/auth/signin/signin.component.scss`
**Fix:** Add `min-height: 44px` to `.btn-social`
**Risk:** LOW — CSS only.
**Priority:** Low

---

### BL3-010 (DEFERRED): Heading hierarchy audit

**Action:** Audit h1/h2/h3 structure across all pages for correct nesting.
**Risk:** LOW — WCAG 1.3.1 (Level A), HTML only if needing fixes.

---

## Summary Table

| ID | Description | Priority | Risk | Files |
|----|-------------|----------|------|-------|
| BL3-001 | Subscription buttons 44px | Medium | Low | employer-subscription.component.scss |
| BL3-002 | Recorder .btn-take-interview 44px | Medium | Low | recorder.component.scss |
| BL3-003 | Billing bar link 44px | Low | Low | employer-panel.component.scss |
| BL3-004 | Subscription bg-pink bottom padding | Low | Low | employer-subscription.component.scss |
| BL3-005 | Skip to main content link | Medium | Low | app.component.html (new) |
| BL3-006 | Signup page mobile audit | Low | Medium | auth/signup |
| BL3-007 | Language selector mobile | Low | Low | TBD |
| BL3-008 | /companies mobile audit | Low | Low | TBD |
| BL3-009 | .btn-social 44px (signin) | Low | Low | signin.component.scss |
| BL3-010 | Heading hierarchy | Low | Low | Multiple pages |
