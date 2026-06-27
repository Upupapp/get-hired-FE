# GETHIRED MOBILEVIEW — Tables, Lists & Dashboards QA V3
Generated: 2026-06-26

---

## Reusable Table Mobile Card System

**Status: FULLY IMPLEMENTED**

The `app-reusable-table` component has a dual-display approach:
- Desktop: `#table-container` with mat-table + mat-sort (d-none d-md-block)
- Mobile: `#table-container-mobile` with `.gh-mobile-card` list (d-block d-md-none)

Mobile cards feature:
- White card, 10px radius, soft shadow
- gh-card-reveal animation (220ms, disabled under reduced-motion)
- Tap compression :active scale(0.985) (disabled under reduced-motion)
- 44×44px action buttons with focus-visible ring
- Field label (90px) + value layout
- Selected state: blue tint

Used in:
- Recruiter contacts / candidates
- Recruiter jobs list
- Admin users, jobs, companies tables
- Applicant applications list

---

## Pagination (BL-013)

`.pagination-info` and `.pagination-controls` classes added to reusable-table.component.html.
Global rule at 575px: `display:block; text-align:center; float:none!important; width:100%`.
Also applies to `.dataTables_info` and `.dataTables_paginate`.

---

## Employer Dashboard KPI Cards

**emp-dash-kpis:**
- flex-wrap: wrap, gap:14px — adapts to viewport width
- emp-dash-kpi-card: flex 1 1 180px desktop → 1 1 calc(50%-5px) at 767px → 1 1 100% at 575px
- emp-dash-kpi-value: 28px → 22px at 767px

---

## Employer Dashboard Pipeline

**emp-dash-pipeline-rail:** flex, height:120px, align-items:flex-end
- Pipeline labels: font-size:10px → 9px at 767px
- Pipeline bar: transition:background (compositable, no layout reflow)

---

## Employer Dashboard Action Center

**emp-dash-action-card:** full-width flex row with icon + body + count badge
- Wraps cleanly on mobile (width:100%)
- Tap target: full card is interactive (min-height ≈ 68px — above 44px)

---

## Applicant Dashboard

- Stat cards: not individually audited
- Use Bootstrap grid — expected col-12 on mobile

---

## Job List (Public)

**job-posts-list (public module):**
- Bootstrap col-12 col-md-6 col-lg-3 (grid) / col-12 col-md-12 col-lg-6 (list)
- Single column on mobile — CLEAN

---

## Issues Found

| ID | Component | Issue | Severity | Status |
|----|-----------|-------|----------|--------|
| TBL-01 | Applicant dashboard stats | Not individually audited | Low | Deferred V4 |
| TBL-02 | Pipeline bar at very narrow (280px) | 5 stage bars at 280px may be very narrow | Low | Monitor |
