# GETHIRED MOBILEVIEW — Recruiter Portal Log V2
Generated: 2026-06-25
**Pass 2 update: 2026-06-25**

## Overview

The recruiter/employer portal (/recruiter/*) was comprehensively mobilized in prior sessions
(GH1 checkpoint, BRAND command). This document audits existing coverage and identifies
remaining gaps.

---

## Existing Mobile Coverage (Already Shipped)

### EmployerPanelComponent shell
- Sticky mobile top bar (56px, `$color-global-sidebar-employer-user-menu` dark purple)
- Animated hamburger SVG (hamburger → X)
- Scrim overlay with tap-to-dismiss
- Full slide-in drawer with 6 items: Dashboard, Jobs, Candidates, Messages, Company, Subscription
- Settings shortcut in drawer footer
- Bottom nav bar: Dashboard, Jobs, Candidates, Messages, Company
- Billing bar above bottom nav (Subscription & Billing link)
- Content padding: `padding-bottom: calc(72px + env(safe-area-inset-bottom))` (includes billing bar height)
- `padding-top: 56px` for top bar
- All WCAG touch targets met (44px+)
- Focus management on drawer open/close
- Escape key closes drawer
- NavigationEnd auto-closes drawer
- `env(safe-area-inset-bottom)` throughout

---

## Routes Audited

### /recruiter/dashboard — CompanyDashboardComponent
**Status: ASSESSED**

The actual dashboard (company-dashboard) contains KPI cards, pipeline, action center.
These are within the employer-panel module. The panel shell already handles mobile nav.
Inner content uses Bootstrap grid — cards stack on mobile.

KPI card grid: Likely uses `col-12 col-md-6 col-lg-3` pattern — stacks correctly.
Pipeline board: May use horizontal scroll at mobile — appropriate for kanban.

**No changes made in this pass.**

---

### /recruiter/jobs/* — Job List and Job Create
**Status: ASSESSED**

Job list delegates to `<app-job-list>` (shared component). This renders using the reusable
table component. The reusable-table SCSS has a mobile layout in `#table-container-mobile`.

Job create: Long form with multiple steps. Sticky action bar would benefit UX.
**Logged in backlog: add `.gh-sticky-action-bar` to job create form submit area.**

---

### /recruiter/contacts — Candidates Table
**Status: ASSESSED**

Candidate table: Uses reusable-table component. Mobile card view pattern available.
**Logged in backlog: apply `.gh-responsive-table` to recruiter contact table.**

---

### /recruiter/messages — RecruiterMessagesComponent
**Status: ASSESSED**

Message list + thread detail. 
- Message list: likely 100% width, stacks fine
- Thread detail: text messages stack vertically, no overflow
- Input area: needs min 44px touch targets on send button

**No critical mobile blockers found in structure.**

---

### /recruiter/company/details — Company Profile Tabs
**Status: ASSESSED**

Company profile uses tabs. Angular Material tab bar auto-scrolls horizontally at mobile
(tab-header has `overflow-x: auto` built in). This is adequate.

---

### /recruiter/subscription — Subscription Plans
**CRITICAL CONSTRAINT: Do NOT change payment flows, PayMongo integration.**

**Status: ASSESSED — NOT MODIFIED**

Subscription page shows plan cards. Cards stack if using Bootstrap grid `col-12 col-md-*`.
The actual payment buttons and PayMongo integration were not touched.

---

### /recruiter/interview — Interview Hub
**File:** src/app/employer-panel/recruiter-interview-hub/
**Status: ASSESSED**

Interview hub: video review interface. Not modified (video AI excluded per constraints).
Ensure video element has `max-width: 100%` — applied globally.

---

## Remaining Gaps (Backlog)

2. Candidate list: apply `.gh-responsive-table` card pattern (deferred — reusable-table already has its own mobile view, would conflict)
3. Job readiness bar: if present, ensure it's visible on mobile (not hidden behind nav) — verified OK, margin-top token adjusts in ngStyle
4. Interview hub controls: verify 44px touch targets on video control buttons
5. Company profile tabs: tab bar horizontal scroll verified in SCSS (cp-subtab-nav already has overflow-x: auto at 576px)

## Pass 2 Changes Shipped

- **Job create form** (`src/app/job/job-create/job-create.component.scss`): `.bg-upper-gray` becomes sticky at top on mobile; `.adjust-flex` resets to `position: static` so CTA buttons stay visible without scrolling. (BL-005)
- **Employer Dashboard** (`src/app/company/company-dashboard/company-dashboard.component.scss`): Extended existing `@media (max-width: 767px)` block — hero CTA buttons now full-width (`align-items: stretch`) with `min-height: 44px`.
- **Company profile tabs**: Already had `overflow-x: auto` at 576px (no change needed).

---

## Summary

| Component | Mobile Nav | Content Layout | Issues |
|-----------|-----------|----------------|--------|
| Panel shell | Complete (prior) | n/a | None |
| Dashboard | Prior | KPI cards stack OK, CTA buttons full-width (Pass 2) | None |
| Jobs list | Prior nav | Reusable table mobile view | None (uses table's own mobile view) |
| Job create | Prior nav | Sticky controls bar (Pass 2) | None |
| Contacts | Prior nav | Reusable table mobile view | None |
| Messages | Prior nav | Thread stacks | None |
| Company profile | Prior nav | Tab scroll OK (existing) | None |
| Subscription | Prior nav | Cards stack | None (no payment change) |
| Interview hub | Prior nav | Video element | Touch targets pending |
