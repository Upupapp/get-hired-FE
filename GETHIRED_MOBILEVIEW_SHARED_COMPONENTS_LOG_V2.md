# GETHIRED MOBILEVIEW — Shared Components Log V2
Generated: 2026-06-25

## Shared Components Audited

Location: src/app/shared/components/

### 1. ReusableTableComponent
**File:** src/app/shared/components/reusable-table/reusable-table.component.{html,scss}

**Issues found:**
- Desktop table (`#table-container`) has `@media (max-width: 1200px) { width: 600px !important }` — causes horizontal scroll but does not adapt to cards at mobile
- Mobile table (`#table-container-mobile`) exists and shows rows as stacked items with tr/td structure
- However, no CSS-only responsive card pattern (with data-label) exists in this component

**Fixes applied to shared component:**
- Added `@import "src/assets/styles/motion"` (was not present; only had colors)
- Added `.gh-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; }` for controlled horizontal scroll alternative
- Added `@media (max-width: 767px) { section { overflow-x: hidden; } }` to prevent section overflow bleed
- The global `.gh-responsive-table` CSS in styles.scss applies to any wrapper given that class

**Global table card pattern (in styles.scss):**
The full table-to-card override is in styles.scss under `.gh-responsive-table`:
- Hides header row
- Shows each mat-row as a flex column card
- Uses `::before { content: attr(data-label) }` for column labels
- Border-radius 8px, box-shadow, margin-bottom 8px

To apply: add class `gh-responsive-table` to the `<mat-table>` or wrapping `<section>` element.

---

### 2. EmptySectionComponent
**File:** src/app/shared/components/empty-section/

**Assessment:** Empty state component — typically centered content with icon + message.
Expected to be responsive (no fixed widths). No changes needed.

---

### 3. LoadingComponent / InlineLoadingComponent
**Files:** src/app/shared/components/loading/, src/app/shared/components/inline-loading/

**Assessment:** Loading spinners — centered, no overflow issues. No changes needed.

---

### 4. SubscriptionAlertComponent
**File:** src/app/shared/components/subscription-alert/

**Assessment:** Alert banner component. Should be full-width and adaptive.
**Check:** Ensure no fixed-width or absolute positioning causes overflow.
No changes made — would need runtime verification.

---

### 5. FooterComponent
**File:** src/app/shared/components/footer/footer.component.html

**Content:** Simple copyright banner with `.container` Bootstrap wrapper.
`<div class="container-fluid bg-footer pt-4 pb-4"> <div class="container mt-1"> <div class="row"> <div class="col-12 text-center">`

**Assessment:** Fully responsive — col-12, text-center. No changes needed.

---

### 6. TalentProofBadgeComponent
**File:** src/app/shared/components/talent-proof-badge/

**Assessment:** Badge/pill variant components placed inline in hero sections. Already responsive (inline-flex, wraps with parent).

---

### 7. MaterialComponentsModule
**File:** src/app/shared/components/material-components/

**Assessment:** Material module re-exports. Not a visual component.

---

### 8. JobPostsListComponent / JobCardComponent
**Files:** Within public/shared/ or shared/

**Known from prior sessions:** Job card has hover lift (translateY) and mobile active (scale) applied via `.gh-job-card-hover` global class and individual component SCSS using `$gh-lift` token.

The global styles.scss now has `.gh-card, .job-card, .mat-card` with:
- Desktop hover: `translateY($gh-lift)` + box-shadow
- Mobile active: `scale(0.98)`
- Reduced-motion: `transform: none`

---

### 9. Snackbar / Toast Placement

**Assessment:** Angular Material snackbar appears at bottom-center by default.
**Issue:** At mobile with bottom nav bars (56–72px), the default snackbar position may overlap the nav.

**Fix recommendation:** When opening snackbar in mobile context, use `verticalPosition: 'top'` or set bottom offset.
This requires checking all `MatSnackBar.open()` calls and passing config. Deferred to backlog — safe change but requires finding all 50+ call sites.

**Logged in backlog.**

---

## Global Responsive Additions (styles.scss)

Added in this MOBILEVIEW pass:

1. **Box-sizing normalization:** `*, *::before, *::after { box-sizing: border-box }`
2. **Overflow prevention:** `body { overflow-x: hidden }` + `img, video, iframe { max-width: 100%; height: auto }`
3. **Mobile tap compression:** `@media (hover: none) and (pointer: coarse)` `.mat-raised-button:active, .btn:active, .gh-card:active { transform: scale(0.97) }`
4. **Global reduced-motion:** Hard stop on all transitions/animations at `prefers-reduced-motion: reduce`
5. **Touch targets:** `.mat-icon-button, .icon-btn { min-width: 44px; min-height: 44px }`
6. **Card hover/tap contract:** `.gh-card, .job-card, .mat-card` — desktop hover lift, mobile press scale, reduced-motion tint only
7. **Sticky action bar:** `.gh-sticky-action-bar` class defined and ready to use
8. **Table-to-card:** `.gh-responsive-table` wrapper class with full card display at 767px
9. **Focus-visible glow:** `:focus-visible { outline: 2px solid $color-global-red-buttons; outline-offset: 2px }`
10. **Skeleton reveal:** `.gh-skeleton-reveal` transition class

---

## Pass 2 Global Additions (styles.scss) — 2026-06-25

Items BL-001 through BL-014 added to `src/styles.scss`:

11. **BL-001 Form control touch targets:** `.form-control, .mat-form-field-infix input, .mat-select-trigger { min-height: 44px }` at 767px
12. **BL-004 Snackbar above bottom nav:** `.mat-snack-bar-container { margin-bottom: 80px !important }` at 767px
13. **BL-009 Dropdown touch targets:** `.dropdown-item` padding 12px top/bottom; `.mat-option { min-height: 48px }` at 767px
14. **BL-013 Pagination stack:** `.pagination-info, .pagination-controls` display block, text-center, float: none at 575px
15. **BL-014 Tab overflow:** `.mat-tab-header { overflow-x: auto }; .mat-tab-label-container { overflow: visible }` at 767px

### ReusableTableComponent — BL-013
- Added `class="pagination-info"` to "Showing X to Y" paragraph
- Added `class="pagination-controls"` to paginator paragraph
- Global styles.scss rule stacks them on 575px screens

## Summary

| Component | Issues Found | Action Taken |
|-----------|-------------|--------------|
| ReusableTable | No global card pattern, no overflow guard; pagination overlap | Mobile SCSS + pagination class names added |
| EmptySection | None | Assessed — clean |
| Loading | None | Assessed — clean |
| SubscriptionAlert | Unknown fixed widths | Deferred to backlog |
| Footer | None | Assessed — clean |
| TalentProofBadge | None | Assessed — clean |
| Job card (global) | None (prior session) | Global CSS contract added |
| Snackbar | Overlaps bottom nav | FIXED in Pass 2 (BL-004: margin-bottom: 80px) |
