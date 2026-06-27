# GETHIRED MOBILEVIEW — Pass 2 Fix Log
Generated: 2026-06-25

All changes are SCSS/HTML/TS only. Zero npm packages added. Build verified clean.

---

## BL-001 — Form control min-height 44px
**File:** `src/styles.scss`
**Change:** Added `@media (max-width: 767px)` block setting `min-height: 44px` on `.form-control`, `.mat-form-field-infix input`, `.mat-select-trigger`.
**Risk:** Low — visual only, isolated to mobile.

---

## BL-002 — Applicant panel: close drawer returns focus to hamburger
**Files:** `src/app/applicant-panel/applicant-panel.component.ts`, `.html`
**Changes:**
- Added `@ViewChild('mobileMenuBtn') mobileMenuBtn: ElementRef;` in TS.
- Added `setTimeout(() => this.mobileMenuBtn?.nativeElement?.focus(), 50)` in `closeMobileNav()`.
- Added `#mobileMenuBtn` template ref on the hamburger `<button>`.
**Risk:** Negligible — focus management only.

---

## BL-003 — Admin panel: close drawer returns focus to hamburger
**Files:** `src/app/admin-panel/admin-panel.component.ts`, `.html`
**Changes:** Same pattern as BL-002 applied to admin hamburger button and `closeMobileNav()`.
**Risk:** Negligible.

---

## BL-004 — Snackbar above bottom nav
**File:** `src/styles.scss`
**Change:** Added `@media (max-width: 767px) { .mat-snack-bar-container { margin-bottom: 80px !important; } }`
**Risk:** Low — vertical position only.

---

## BL-005 — Sticky controls bar on job create (mobile)
**File:** `src/app/job/job-create/job-create.component.scss`
**Change:** Added `@media (max-width: 767px)` block: `.bg-upper-gray` becomes `position: sticky; top: 0; width: 100%; z-index: 110; min-height: auto`. Also resets `.adjust-flex` to `position: static` so buttons don't escape the card on mobile.
**Risk:** Low — only affects mobile breakpoint.

---

## BL-008 — Sticky save button on applicant profile form
**File:** `src/app/applicant/profile-forms/profile-forms.component.scss`
**Change:** Added `@media (max-width: 767px)`: `.bg-upper-gray` becomes sticky at top; `.submit-container` repositioned to `bottom: 80px; left: 12px; right: 12px` (above bottom nav bar) with white background + shadow + border-radius. Buttons get `min-height: 44px; flex: 1`.
**Risk:** Low — SCSS only, mobile breakpoint only.

---

## BL-009 — Dropdown touch targets
**File:** `src/styles.scss`
**Change:** Added `@media (max-width: 767px)` block: `.dropdown-item { padding-top: 12px; padding-bottom: 12px; }` and `.mat-option { min-height: 48px; }`.
**Risk:** Low — visual padding only.

---

## BL-013 — Pagination controls stack on mobile
**Files:** `src/styles.scss`, `src/app/shared/components/reusable-table/reusable-table.component.html`
**Changes:**
- Added `.pagination-info` and `.pagination-controls` class names to the pagination `<p>` elements in the reusable-table HTML.
- Added `@media (max-width: 575px)` global rule targeting those classes: `display: block; text-align: center; float: none !important; width: 100%`.
**Risk:** Low — visual layout only.

---

## BL-014 — Profile tabs overflow at mobile
**File:** `src/styles.scss`
**Change:** Added `@media (max-width: 767px)` block: `.mat-tab-header { overflow-x: auto; }` and `.mat-tab-label-container { overflow: visible; }`.
**Risk:** Low — Material tab overflow only.

---

## DEEPER: Employer Dashboard (company-dashboard) — mobile CTA buttons
**File:** `src/app/company/company-dashboard/company-dashboard.component.scss`
**Change:** Extended the existing `@media (max-width: 767px)` block: `.emp-dash-hero-cta` now uses `align-items: stretch; width: 100%` so CTA buttons are full-width and have `min-height: 44px`.
**Risk:** Low — extends existing mobile block.

---

## DEEPER: Public Job Detail — mobile banner + layout
**File:** `src/app/public/public-details/public-details.component.scss`
**Change:** Added `@media (max-width: 767px)` block: banner height becomes `auto`, title font-size reduced, `overflow-wrap: break-word` added, banner background-position centred.
**Risk:** Low — SCSS only.

---

## DEEPER: Main Portal — hero CTA full-width on mobile
**File:** `src/app/public/main-portal/main-portal.component.scss`
**Change:** Added `@media (max-width: 575px)` block: `.portal-hero-cta-group` and `.portal-journey-cta` stack vertically with full-width buttons (`min-height: 44px`). Hero padding reduced.
**Risk:** Low — small-screen breakpoint only.

---

## Build result
`npm run build-dev` — PASSED. No errors. Pre-existing autoprefixer warnings only (unrelated to Pass 2).
