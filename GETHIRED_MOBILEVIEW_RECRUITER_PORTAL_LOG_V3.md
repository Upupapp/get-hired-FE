# GETHIRED MOBILEVIEW — Recruiter Portal Log V3
Generated: 2026-06-26
Route: /recruiter/**  (AuthGuard, role=2)

---

## Shell (employer-panel.component)

**Mobile top bar:** `.gh-mobile-topbar` — sticky, 56px, `d-flex d-md-none`
**Drawer:** `.gh-mobile-drawer` — 280px, cdkTrapFocus, cdkTrapFocusAutoCapture, BL-011 resolved
**Scrim:** `.gh-mobile-scrim` — tap-to-close, aria-hidden
**Bottom nav:** `.gh-mobile-nav` — fixed, safe-area padding, 5 tabs
**Billing bar:** `.gh-billing-bar` — d-md-none, above bottom nav
**Content push:** #sub-company-component padding-bottom: calc(72px + env(safe-area-inset-bottom)) at 767px
**Body push:** #body-main-container padding-top: 56px at 767px

**Nav routes (drawer + bottom nav):**
- Dashboard, Jobs, Candidates (Contacts), Messages, Company, Subscription, Interview Hub

---

## Employer Dashboard (/recruiter/dashboard)

**company-dashboard.component.scss — FULLY RESPONSIVE:**
- emp-dash-hero: padding 40px 32px → 28px 20px at 767px
- emp-dash-hero-title: 28px → 22px at 767px
- emp-dash-hero-cta: flex-direction:column, align-items:stretch, full-width buttons, min-height:44px at 767px (BL-Pass2 CONFIRMED)
- emp-dash-kpi-card: flex 1 1 calc(50%-5px) at 767px → flex 1 1 100% at 575px
- emp-dash-pipeline: margin/padding reduced at 767px
- emp-dash-review-card: flex-wrap:wrap at 767px, CTA full-width
- Skeleton loaders: reduced-motion: animation:none, static bg
- Animations: emp-hero-reveal, emp-card-reveal — reduced-motion disabled

---

## Employer Jobs (/recruiter/jobs)

**employer-jobs.component.scss:** Empty — uses reusable-table. Mobile card view present.
**employer-joblist.component.scss:** Empty. Uses reusable-table.
**employer-jobview.component.scss:** Empty.
**employer-jobexpired.component.scss:** Not audited (likely empty too).

---

## Job Create (/recruiter/jobs/create)

**job-create.component.scss — CONFIRMED:**
- BL-005: .bg-upper-gray sticky top:0 at 767px
- .adjust-flex: position:static at 767px
- Multi-step buttons stack at 767px (flex-wrap:wrap, gap:8px)
- Action buttons: min-height:44px at 768px
- Focus-visible ring on draft/publish/back buttons

---

## Employer Contacts (/recruiter/contacts)

**employer-contacts.component.scss:** Empty — uses reusable-table.
- BL-006/BL-007: #table-container-mobile has full mobile card layout with .gh-mobile-card system
- Mobile cards: 44px action buttons, tap compression, reveal animation

---

## Employer Applicants (/recruiter/applicants)

**employer-applicants.component.scss:** Empty. Uses reusable-table.

---

## Employer Company (/recruiter/company)

**employer-company.component.scss:** Not audited in detail. Uses Bootstrap grid.

---

## Employer Settings (/recruiter/settings)

**employer-settings and sub-components:** Not audited in full detail — form-based pages,
form controls get global 44px min-height at 767px.

---

## Employer Subscription (/recruiter/subscription)

**employer-subscription.component.html:** Wraps `<app-subscriptions>` — thin wrapper.
**employer-subscription.component.scss:** Only 114 lines — subscription plan cards with Bootstrap grid.
- Cards: Bootstrap col-12 → single column on mobile
- .btn-subscribe, .btn-subscribe-active: padding:10px 20px — height ≈14+10+10 = 34px — AT RISK (below 44px)
- Added to V3 backlog (BL3-001)

---

## Recruiter Messages (/recruiter/messages)

**recruiter-messages.component.scss:** Not audited in detail.
- Messages widget deferred from GH1 checkpoint (no is_read column/all-threads endpoint)
- Mobile layout: assumed to use Bootstrap grid

---

## Issues Found

| ID | Component | Issue | Severity | Status |
|----|-----------|-------|----------|--------|
| REC-01 | employer-subscription | .btn-subscribe / .btn-subscribe-active ≈34px height — below 44px | Medium | V3 Backlog BL3-001 |
| REC-02 | employer-company | Not fully audited | Low | Deferred V4 |
| REC-03 | employer-settings | Not fully audited | Low | Deferred V4 |

---

## Critical Flow: Recruiter Create/Edit/Publish Job (Mobile)

1. Login → /recruiter/dashboard — hero responsive, CTAs full-width 44px
2. Tap Jobs in bottom nav → job list (reusable table mobile cards)
3. Tap "Create Job" (from bottom nav or dashboard CTA)
4. Multi-step form: BL-005 sticky controls bar — steps always visible
5. Publish: btn-publish-post min-height 44px at 768px
6. Review applicants: reusable table mobile card view with action buttons 44px

Flow status: PASS at primary breakpoints.
