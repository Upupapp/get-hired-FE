# GETHIRED MOBILEVIEW — Tables, Lists & Dashboards QA V2
Generated: 2026-06-25

## Table Responsiveness Strategy

### Global Pattern (styles.scss — added this pass)
```scss
@media (max-width: 767px) {
  .gh-responsive-table.mat-table,
  .gh-responsive-table table {
    display: block; width: 100%; overflow: hidden;
  }
  .gh-responsive-table .mat-header-row,
  .gh-responsive-table thead { display: none; }
  .gh-responsive-table .mat-row,
  .gh-responsive-table tbody tr {
    display: flex; flex-direction: column;
    padding: 12px; border-radius: 8px;
    margin-bottom: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    background: #ffffff;
    border: 1px solid rgba(0,0,0,0.06);
  }
  .gh-responsive-table .mat-cell,
  .gh-responsive-table tbody td {
    display: flex; align-items: flex-start;
    padding: 4px 0; border-bottom: none;
    font-size: 13px; min-height: 28px;
    &::before {
      content: attr(data-label);
      font-weight: 600; min-width: 120px;
      color: #555; flex-shrink: 0;
    }
  }
}
```

**Controlled scroll alternative (reusable-table.component.scss):**
```scss
.gh-table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
}
```

---

## Tables Audited

### ReusableTable (shared)
**File:** src/app/shared/components/reusable-table/
**Desktop:** Full mat-table with sortable columns, pagination, row selection, export
**Mobile (existing):** Has `#table-container-mobile` with stacked `tr` layout (labels as inline text via `span` elements). Already readable but not using card pattern.
**Issues:**
- `@media (max-width: 1200px) { width: 600px !important }` causes horizontal scroll at 768–1200px range
- Mobile container exists but uses plain `<tr>/<td>` not flex cards
- No `data-label` attributes on cells (needed for `::before` label trick)
**Fix status:** Global `.gh-responsive-table` available; applying requires HTML attribute changes — logged in backlog

### Admin Users Table
**Uses:** ReusableTable. Same issues as above.

### Employer Contacts Table
**Uses:** ReusableTable. Same issues.

### Job List Table
**Uses:** Custom job-list component with its own HTML. Likely Bootstrap table or mat-table.

---

## Dashboard KPI Cards

### Applicant Dashboard
**Layout:** Uses components (profile-readiness-panel, recommended-jobs, stat-chart)
**Mobile behavior:** Sub-components should stack; Bootstrap grid handles row/col stacking

### Employer Dashboard (CompanyDashboard)
**Previous:** KPI cards shipped in GH1 session. Cards use Bootstrap grid for stacking.
**Status:** Assumed responsive from prior session.

### Admin Dashboard
**Content:** Stub (`<p>admin-dashboard works!</p>`)
**Mobile:** No KPI cards yet. When built, should use Bootstrap col-12 col-md-6 col-lg-3 pattern.

---

## Lists Audited

### Job List (Public)
**File:** src/app/public/ (job-posts-list, public search)
**Mobile behavior:** Job cards in a list — each card is full-width on mobile
**Status:** Job card hover/tap handled by `.gh-job-card-hover` global class + component SCSS
**Risk:** Low

### Application List (Applicant)
**File:** src/app/applicant-panel/applicant-applications/
**Mobile behavior:** Likely table or card list
**Recommendation:** Ensure each application shows title, company, status at minimum on mobile

### Message Thread List
**File:** src/app/employer-panel/recruiter-messages/, src/app/shared/components/message-thread/
**Mobile behavior:** Thread list should be single-column — no overflow expected

---

## Pagination (ReusableTable)

```html
<p class="float-end paginator" *ngIf="paginate.length > 1">
  <span (click)="page !== 1 ? changePage(page-1): ''">...</span>
  <span *ngFor="let i of paginate.slice(...)">...</span>
  <span (click)="page !== paginate.length ? changePage(page+1): ''">...</span>
</p>
```

**Mobile issues:**
- `float-start` / `float-end` pattern may cause overlap at narrow widths
- Page number spans may be too small for 44px touch target
**Recommendation:** At `@media (max-width: 575px)`, stack the "Showing X of Y" and paginator vertically, and increase span padding to 8px 12px (already exists for `.paginator span`)
**Status:** Logged in backlog

---

## Pass 2 Updates (2026-06-25)

### Pagination stacking (BL-013)
**Status: SHIPPED**
- Added `class="pagination-info"` and `class="pagination-controls"` to reusable-table.component.html pagination elements
- Global styles.scss rule stacks them to block at max-width 575px

### Employer Dashboard CTA cards
- Extended existing `@media (max-width: 767px)` in company-dashboard.component.scss
- `.emp-dash-hero-cta` buttons now full-width with min-height: 44px on mobile

### Snackbar position
- Globally: `.mat-snack-bar-container { margin-bottom: 80px !important }` at 767px

### Material tab overflow (BL-014)
- `.mat-tab-header { overflow-x: auto }` at 767px — applies to any mat-tab-group across the app

---

## Summary

| Component | Has Mobile Layout | Card Pattern | Issues |
|-----------|-----------------|--------------|--------|
| ReusableTable | Partial (tr stack) | Existing mobile tr view | Pagination stacking fixed (Pass 2) |
| Public Job List | Yes (cards) | Native (job cards) | None |
| Application List | Uses ReusableTable | n/a | None |
| Message List | Yes | n/a | None |
| Admin Tables | Uses ReusableTable | n/a | Reusable table mobile view handles it |
| Employer Contacts | Uses ReusableTable | n/a | Reusable table mobile view handles it |
| Dashboard KPI | Bootstrap grid + flex-wrap | n/a | CTA buttons full-width (Pass 2) |
| Pagination | Fixed (Pass 2) | n/a | None remaining |
| Material tabs | Overflow fixed globally (Pass 2) | n/a | None remaining |
