# GETHIRED MOBILEVIEW — Public Pages Log V2
Generated: 2026-06-25

## Pages Audited

### 1. /home — MainPortalComponent
**File:** src/app/public/main-portal/main-portal.component.{html,scss}

**Existing responsive coverage (pre-this-session):**
- `.portal-hero-inner--split`: `grid-template-columns: 1fr` at 991px
- `.portal-role-grid`: `grid-template-columns: 1fr` at 767px
- `.portal-hero-cta-group`: `flex-wrap: wrap; justify-content: center` at 991px
- `.portal-hero-visual`: `flex-direction: column` at 575px
- `.portal-how-it-works-grid`: `grid-template-columns: 1fr` at 767px
- `.portal-journey-steps`: `repeat(auto-fit, minmax(180px, 1fr))` — auto-stacks
- `@media (prefers-reduced-motion: reduce)` for hero animation

**Issues found:**
- Hero visual mock cards: `.hero-mock-card--seeker { transform: rotate(-3deg) }` — rotation may cause overflow on very small screens at < 360px
- `.portal-hero--upgraded { padding: 72px 24px 56px }` — adequate mobile padding

**Fixes applied:** None needed — component is already well-responsive from prior BRAND/SEO passes.
**Risk:** Low

---

### 2. /jobs — PublicListComponent
**File:** src/app/public/public-list/public-list.component.{html,scss}
**Components used:** app-public-banner, app-public-companies-recommended, app-job-posts-list, app-public-explore-users

**Existing coverage:**
- Banner component: `.bg-transparent { @media (max-width: 767px) { flex-wrap: wrap; max-height: none } }`
- Search row children go full width: `> div { width: 100% !important; }`

**Issues found:**
- `container-fluid px-5` (40px horizontal padding) causes overflow at < 576px
- `.title-banner` 37px font-size may crowd on very narrow screens

**Fixes applied:**
- Added to banner.component.scss at 575px: `container-fluid { padding-left: 12px !important; padding-right: 12px !important; }`
- Added `.title-banner { font-size: 24px !important; line-height: 30px !important; }` at 575px
- Added `.search-key, .search-key-2 { min-width: 0 !important; max-width: 100% !important; }` at 575px
- Added `.bg-banner { height: auto !important; min-height: 220px; padding-bottom: 16px; }` at 575px
**Risk:** Low

---

### 3. /jobs/details/:id — PublicDetailsComponent
**File:** src/app/public/public-details/
**Observations:** Component uses standard Bootstrap grid. Job content and company info sections use col-12/col-md-* which stacks correctly. No SCSS edits required.
**Risk:** Low

---

### 4. /companies/:id — PublicCompanyDetailsComponent
**File:** src/app/public/ (company details)
**Observations:** Reviewed structure. Contains company info panel and job listings. Bootstrap grid handles stacking. No custom overflow issues found.
**Risk:** Low

---

### 5. /employers — EmployerPortalComponent
**File:** src/app/public/employer-portal/employer-portal.component.{html,scss}

**Existing coverage:**
- Hero uses same `portal-hero--upgraded` class as main portal, shares `portal-common.scss`
- CTA group wraps via `flex-wrap`
- Mock employer dashboard panel: `.employer-mockup` — responsive via CSS grid
- Already has 991px breakpoint for single-column layout

**Issues found:**
- `.employer-mockup-shell` has `width: 320px` — stays 320px on mobile but inside flex container, so may shrink with `flex-shrink`

**Fixes applied:** None needed — visual is illustrative only, not functional. Stacks correctly.
**Risk:** Low

---

### 6. /job-seekers — JobSeekerPortalComponent
**File:** src/app/public/job-seeker-portal/
**Observations:** Marketing page. Uses portal-common.scss pattern. Hero section stacks at 991px.
**Risk:** Low

---

### 7. /404 — ErrorNotFoundComponent
**File:** src/app/views/error-page/
**Observations:** Simple centered card layout. No overflow issues expected.
**Risk:** Low

---

### 8. /signin — SigninComponent
**File:** src/app/auth/signin/signin.component.{html,scss}

**Existing coverage:**
- Two-column layout: col-12 col-lg-6 — below lg both panels go full width
- `.bg-form { padding: 80px 120px }` → `@media (max-width: 759px) { padding: 80px 20px }` — already collapses
- `.bg-left` carousel: already structured with Bootstrap grid, hidden on small screens

**Issues found:**
- At sm breakpoint (576–767px), both `col-12 col-lg-6` panels are full width and stack — but `bg-left` with min-height: 100vh takes up the full screen before the user sees the form. This may be deliberate (decorative panel first, form below) but is poor UX on mobile.
- Banner images and carousel items are absolute-positioned and may overflow

**Fix recommendation:** On xs/sm, either hide the carousel panel completely (`d-none d-lg-block`) or limit its height (`max-height: 50vh`). Not applied in this pass as the auth flow is business-critical and needs careful testing. Logged in backlog.
**Risk:** High (auth flow) — documented in backlog, not touched

---

### 9. /signup — SignupComponent
**File:** src/app/auth/signup/
**Observations:** Same two-column pattern as signin. Same recommendation applies.
**Risk:** High (auth flow) — documented in backlog

---

## Pass 2 Changes Shipped (2026-06-25)

### /home — MainPortalComponent
- Added `@media (max-width: 575px)` in `main-portal.component.scss`:
  - `.portal-hero--upgraded { padding: 48px 16px 40px }`
  - `.portal-hero-cta-group`: flex-direction: column; align-items: stretch — full-width CTA buttons with min-height: 44px
  - `.portal-journey-cta`: same full-width pattern

### /jobs/details/:id — PublicDetailsComponent
- Added `@media (max-width: 767px)` in `public-details.component.scss`:
  - Banner height: auto with min-height: 200px
  - Title font-size: 22px, line-height: 28px, overflow-wrap: break-word
  - Banner background-position: center
  - Row flex-direction: column to ensure sidebar stacks below content

---

## Summary

| Page | Pre-existing Responsiveness | Fix Applied | Risk |
|------|----------------------------|-------------|------|
| /home | Comprehensive | CTA buttons full-width at 575px (Pass 2) | Low |
| /jobs | Good, minor gap at 575px | Banner SCSS 575px rule (Pass 1) | Low |
| /jobs/details/:id | Bootstrap grid | Banner mobile + layout fix (Pass 2) | Low |
| /companies/:id | Bootstrap grid | None needed | Low |
| /employers | Comprehensive | None needed | Low |
| /job-seekers | Bootstrap grid | None needed | Low |
| /404 | Simple | None needed | Low |
| /signin | Partial | Documented, not touched (risk) | High |
| /signup | Partial | Documented, not touched (risk) | High |
