# GETHIRED MOBILEVIEW — Applicant Portal Log V2
Generated: 2026-06-25

## Overview

The applicant portal (/user/*) was previously missing ALL mobile navigation. The sidebar
was `d-none d-md-block` with no mobile alternative. This has been fully fixed.

---

## Components Audited and Fixed

### 1. ApplicantPanelComponent (shell)
**Files:** src/app/applicant-panel/applicant-panel.component.{html,scss,ts}
**Status: FIXED**

See NAVIGATION_LOG for full detail. Summary:
- Added sticky mobile top bar with GetHired branding
- Added animated hamburger → X drawer toggle
- Added 280px slide-in drawer (left) with 5 nav items + settings
- Added 5-tab bottom nav bar with SVG icons and labels
- All items: routerLinkActive active state, aria-current, 44px touch targets
- Escape key closes drawer; NavigationEnd auto-closes
- `env(safe-area-inset-bottom)` for iPhone X/11/12/13/14/15

---

### 2. ApplicantDashboardComponent
**Files:** src/app/applicant-panel/applicant-dashboard/applicant-dashboard.component.{html,scss}
**Status: PARTIALLY FIXED**

**HTML structure:**
```
<app-profile-readiness-panel>
<app-recommended-jobs>
<section *ngIf="profile$">
  <app-applicant-panel-banner>
  <app-applicant-stat-chart>
```

**Fix applied:** Alert snackbar repositioned above bottom nav on mobile (bottom: 76px).
**Remaining:** Profile readiness panel, recommended jobs, stat chart — these are sub-components. No source was modified as their internal responsiveness was not assessed within file limit. Logged in backlog.

---

### 3. ApplicantProfileComponent
**Files:** src/app/applicant-panel/applicant-profile/
**Status: ASSESSED — NO CHANGE**

Profile uses form-heavy multi-tab pattern. Key concerns:
- Multi-column form rows likely use Bootstrap grid (col-md-6 pairs) — these stack correctly
- Tab bar: Angular Material tabs — horizontal scroll at mobile is the default behavior; adequate for this portal
- CV upload section: file input accessible on mobile

**Recommendation:** Add `white-space: nowrap; overflow-x: auto` to tab container if tab labels overflow. Logged in backlog.

---

### 4. ApplicantApplicationsComponent
**Files:** src/app/applicant-panel/applicant-applications/
**Status: ASSESSED**

Application list uses a table/list to show job applications. 
- Reusable table component at mobile: cards with data-label pattern available via `.gh-responsive-table`
- Not yet applied to this specific component (would require adding class to HTML and data-label to cells)
**Logged in backlog.**

---

### 5. Video Answer Flow
**Files:** src/app/applicant-panel/, src/app/recorder/
**Status: ASSESSED — NOT MODIFIED**

Video recording requires:
- Camera access via browser API
- Recording controls must be accessible
- `isPlatformBrowser` guard required for any `window.navigator.mediaDevices` access

**Observations:**
- Not modified in this pass (video AI/emotion analysis explicitly excluded per MOBILEVIEW constraints)
- Touch targets on recording controls should be ≥ 44px
- Video element: `max-width: 100%` applied globally via styles.scss

---

### 6. CV/Document Upload
**Files:** Within applicant-profile/
**Status: ASSESSED**

File upload inputs on mobile: standard `<input type="file">` is touch-accessible on iOS/Android. No changes needed.

---

## Mobile Content Padding Summary

At `max-width: 767px`, `#sub-applicant-component` has:
```scss
padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px)) !important;
```
And `#body-main-container` has:
```scss
padding-top: 56px; // clears sticky top bar
```

This ensures all content is reachable above the bottom nav and below the sticky top bar.

---

## Pass 2 Changes Shipped (2026-06-25)

### ApplicantPanelComponent (shell) — BL-002
- Added `@ViewChild('mobileMenuBtn') mobileMenuBtn: ElementRef` to TS
- Added `setTimeout(() => this.mobileMenuBtn?.nativeElement?.focus(), 50)` in `closeMobileNav()`
- Added `#mobileMenuBtn` template ref on hamburger `<button>` in HTML
- Focus now returns to hamburger button when drawer closes (WCAG 2.4.3)

### ApplicantProfileForm — BL-008
- `src/app/applicant/profile-forms/profile-forms.component.scss`
- `.bg-upper-gray` becomes `position: sticky; top: 0` on mobile
- `.submit-container` repositioned to `fixed; bottom: 80px; left: 12px; right: 12px` with white bg + shadow
- Save/Next buttons get `min-height: 44px; flex: 1`

---

## Backlog for Applicant Portal

2. Applications table: apply `.gh-responsive-table` class for cards-at-mobile (deferred — reusable table already has mobile view)
3. Stat chart: ensure chart is mobile-scrollable or switches to simpler mobile view
4. Tab overflow: SHIPPED globally via styles.scss BL-014 (mat-tab-header overflow-x: auto)
5. Signin carousel: hide left panel on xs/sm breakpoints (HIGH RISK — deferred)
