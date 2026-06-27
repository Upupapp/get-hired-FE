# GETHIRED MOBILEVIEW — Performance QA V3
Generated: 2026-06-26

---

## Build Metrics (Production)

| Metric | V3 Value | V2 Value | Trend |
|--------|---------|---------|-------|
| Build time | 23,100ms | 31,332ms | Faster (production build vs dev) |
| Build errors | 0 | 0 | No change |
| Build warnings | 2 | 2 | No change (pre-existing autoprefixer) |
| Main bundle (initial) | 2.65 MB raw / 542.25 kB transfer | — | In line with Angular SPA norm |

**Lazy chunks (key ones):**
- employer-panel: 505.68 kB raw — largest chunk (expected for recruiter portal)
- public module: 147.65 kB raw — SSR-rendered public routes
- applicant-profile: 112.35 kB raw
- auth module: 85.29 kB raw

---

## SSR Performance Impact

All typeof localStorage guards add negligible overhead (single typeof check per render).
No new network calls, subscriptions, or observables introduced in V3.

---

## CSS Performance Notes

### Eliminated in V2/V3:
- `transition: all` on job create bg-upper-gray (replaced with specific properties in V2 BRAND fix)
- Pipeline bar transition was only `background` (compositable property) — no layout reflow on hover

### Remaining concerns:
- reusable-table.scss has `min-height: 400px` duplicated on `#table-container` (lines 562, 566) — minor
- `.gh-card, .job-card, .mat-card` hover transitions in styles.scss: `transform` and `box-shadow` both compositable — OK

---

## Animation Budget

| Animation | Duration | Compositable | Notes |
|-----------|----------|-------------|-------|
| gh-sheet-reveal (dialog) | 220ms | Yes (opacity + transform) | PASS |
| emp-hero-reveal | 500ms | Yes | PASS |
| emp-card-reveal | 220ms | Yes | PASS |
| gh-card-reveal | 220ms | Yes | PASS |
| gh-skeleton-shimmer | 1.4s infinite | No (background-position) | Ambient only, removed under reduced-motion |
| drawer slide | 260ms | Yes (transform) | PASS |
| gh-recorder-recording-pulse | 1.4s infinite | Yes (opacity) | Ambient only, removed under reduced-motion |
| publish-spin / draft-spin | 0.7s infinite | Yes (transform rotate) | Loading indicator only |

All infinite/ambient animations are removed entirely under `prefers-reduced-motion: reduce` (not just slowed).

---

## trackByJobId

Confirmed in job-posts-list.component.ts: `trackByJobId` function prevents full DOM rebuild
on store re-emissions. This reduces layout/paint work on mobile.

---

## Lazy Loading

All portal modules are lazy-loaded:
- AdminPanelModule: only loaded when /admin is navigated to
- EmployerPanelModule: only loaded when /recruiter is navigated to
- ApplicantPanelModule: only loaded when /user is navigated to
- AuthModule: loaded when /signin or /signup navigated to

Public module loads on first page view (SSR pre-renders the initial HTML, then hydrates).

---

## Issues Found

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| PERF-01 | min-height:400px duplicated in reusable-table.scss (lines 562 and 566) | Very Low | Deferred V4 (trivial, no runtime impact) |
| PERF-02 | Public module 147KB — could be split further if needed | Low | Monitor |
