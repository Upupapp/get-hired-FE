# GETHIRED MOBILEVIEW — Applicant Portal Log V3
Generated: 2026-06-26
Route: /user/**  (AuthGuard, role=3)

---

## Shell (applicant-panel.component)

**Mobile top bar:** `.gh-ap-mobile-topbar` — sticky, 56px, `d-flex d-md-none`
**Drawer:** `.gh-ap-mobile-drawer` — 280px, cdkTrapFocus, cdkTrapFocusAutoCapture
**Bottom nav:** `.gh-ap-mobile-nav` — fixed, safe-area padding
**Focus management:** #mobileMenuBtn ViewChild, setTimeout focus return on close (BL-002)
**Content push:** #sub-applicant-component padding-bottom: calc(70px + env(safe-area-inset-bottom)) at 767px
**Body push:** #body-main-container padding-top: 56px at 767px

**Nav routes (drawer + bottom nav):**
- Dashboard, My Jobs, Applications, Profile, Settings

---

## Applicant Dashboard (/user/dashboard)

**Banner component (`applicant-dashboard/components/banner`):**
- Not audited in V2/V3 detail — appears to be a welcome banner, not full-screen hero
- Safe: padding adjustments not blocked

**Stat cards / stat charts:**
- applicant-dashboard.component.scss, stat-chart.component.scss — not audited in detail
- Uses Bootstrap grid — expected col-12 on mobile

**Snackbar:** positioned 80px above bottom nav via BL-004 (styles.scss) — CONFIRMED

---

## Applicant Profile (/user/profile)

**profile-forms.component.scss:**
- BL-008: sticky save bar at bottom — CONFIRMED
  - .bg-upper-gray: sticky top:0 at 767px
  - .submit-container: fixed bottom:80px (above bottom nav), full-width, white bg+shadow
  - .btn-save, .btn-save-draft: min-height: 44px, flex:1

**Profile tabs:**
- BL-014: .mat-tab-header overflow-x:auto at 767px — CONFIRMED

---

## Applicant Jobs (/user/jobs)

**applicant-jobs.component.scss:** Empty (just @import). Uses parent styles.
- Bootstrap grid handles single column on mobile — expected clean
- Reusable table used — has mobile card view (#table-container-mobile) with .gh-mobile-card

---

## Applicant Applications (/user/applications)

**applicant-applications.component.scss:** Empty. Same as above.

---

## Applicant Application Detail (/user/applications/:id)

**applicant-application-detail.component.scss:** Not audited in detail this round.

---

## Applicant Settings (/user/settings)

**applicant-settings.component.scss:** Empty. Uses global styles.

---

## Video Interview (/user — recorder component)

See GETHIRED_MOBILEVIEW_VIDEO_INTERVIEW_QA_V3.md for full recorder audit.

---

## Issues Found

| ID | Component | Issue | Severity | Status |
|----|-----------|-------|----------|--------|
| AP-01 | applicant-dashboard banner | Banner height not audited — may have fixed height | Low | Deferred V4 |
| AP-02 | applicant-application-detail | Not audited in V3 | Low | Deferred V4 |

---

## Critical Flow: Applicant Browse + Apply (Mobile)

1. Login → /user/dashboard — top bar visible, bottom nav accessible
2. Browse jobs from dashboard → /jobs public route → see Public Pages log
3. Apply → returnURL redirected back after auth
4. View applications → reusable table shows mobile card view
5. Edit profile → sticky save bar above bottom nav — reachable
6. View interviews → recorder component — touch targets adequate

Flow status: PASS at primary breakpoints.
