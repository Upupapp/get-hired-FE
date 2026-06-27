# GETHIRED MOBILEVIEW — Public Pages Log V3
Generated: 2026-06-26

---

## /home (MainPortalComponent)

**Hero section:**
- portal-hero--upgraded: overflow:hidden, padding: 72px 24px 56px desktop → 48px 16px 40px at 575px
- portal-hero-inner--split: grid 2-col desktop → 1-col at 991px (text-align center)
- portal-hero-cta-group: flex-wrap → column + stretch at 575px, min-height 44px on CTAs
- portal-hero-visual: flex-direction column at 575px
- Hero mesh + glow: pointer-events:none, purely decorative — fine

**Animations:**
- portal-hero-copy: opacity 0 → 1, translateY(10px) → 0, 280ms
- portal-hero-reveal reduced-motion: opacity:1, transform:none — CONFIRMED

**Journey sections:**
- portal-journey-steps: auto-fit minmax(180px, 1fr) — flows naturally
- portal-journey-cta: flex-wrap → column + stretch at 575px, min-height 44px — CONFIRMED

**Bento grid:**
- portal-bento-grid (assumed, not audited directly this round): 2-col at 991px per V2 docs

**Issues:** None critical. Banner at main-portal is the role-selector, not the search banner.

---

## /jobs (PublicListComponent + job-posts-list)

**SSR:** FULLY GUARDED as of V3 (MV3-F4 + MV3-F5 applied this session)

**Layout:**
- Cards: col-12 col-md-6 col-lg-3 (grid view) / col-12 col-md-12 col-lg-6 (list view) — single column on mobile
- Job board employer CTA banner: d-flex above job list — dismissible, non-blocking

**Issues:** None.

---

## /jobs/search/:kw (PublicSearchComponent + banner.component)

**SSR:** GUARDED — localStorage, sessionStorage, window.innerWidth all in isPlatformBrowser

**Banner (banner.component.scss):**
- bg-banner: height 360px desktop → auto + min-height 220px at 575px
- title-banner: 37px → 24px at 575px
- Decorative elements (banner-person, banner-float-*): width: 0px at 860px — invisible on mobile
- search-key / search-key-2: min-width 0, width 100% at 575px — CONFIRMED

**Search bar (bg-transparent):**
- flex-wrap: wrap, max-height: none at 767px — CONFIRMED
- All children div: width 100% at 767px — CONFIRMED
- btn-find-jobs: height: 44px — CONFIRMED

**Overflow at 280px/360px:** search-key min-width issue from V2 RESOLVED — banner.component.scss overrides to min-width:0/width:100% at 575px.

---

## /jobs/details/:id (JobPostsDetailsComponent)

**SSR:** GUARDED — @HostListener isPlatformBrowser, localStorage in user action only

**Banner:**
- public-details: bg-banner height 260px → auto + min-height 200px + padding 24px 16px at 767px
- title-banner: 37px → 22px at 767px, overflow-wrap: break-word

**Breadcrumbs:**
- gh-breadcrumb-nav: min-height 2rem, contain: layout (prevents CLS)
- Links: min-height 44px + inline-flex
- Current item: max-width min(240px, 50vw), ellipsis

**Apply CTA (.btn-apply-now):** min-height 44px, w-100 — CONFIRMED

**Error state:** role="alert", aria-live="assertive", flex-wrap on CTA row

---

## /companies (CompaniesComponent)

Not audited in detail this round (no specific mobile issues raised in V2 backlog).
Uses Bootstrap grid — expected to be clean. Deferred to V4.

---

## SEO Coverage

| Route | Title | Description | Canonical | OG Image |
|-------|-------|-------------|-----------|----------|
| /home | Set by SeoService | Set | Set | gethired-og-default.png |
| /jobs | Set (jobs list) | Set | https://gethiredonline.app/jobs | Default OG |
| /jobs/details/:id | Job title + company | Job description | /jobs/details/:id | Default OG |
| /jobs/search/:kw | Dynamic | Dynamic | /jobs/search/:kw | Default OG |

All public routes confirmed to have SEO meta. JSON-LD BreadcrumbList confirmed on /jobs and /jobs/details/:id.

---

## Critical Flow: Browse Jobs → View → Apply (Mobile)

1. /jobs — card grid single column, job list renders cleanly at 360px
2. Job card tap → /jobs/details/:id — banner responsive, breadcrumb 44px, content readable
3. Apply button: min-height 44px, w-100 on mobile — reachable with thumb
4. Not logged in → redirected to signin → returnURL saved in localStorage (user action, no SSR risk)
5. Signin form → .gh-signin-form-col: safe-area padding, form centered

Flow status: VERIFIED CLEAN at mobile breakpoints.
