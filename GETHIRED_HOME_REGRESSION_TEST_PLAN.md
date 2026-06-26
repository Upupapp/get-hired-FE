# GETHIRED_HOME_REGRESSION_TEST_PLAN
> Regression test plan for GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## Manual test plan (browser)

### 1. Hero section (regression)
- [ ] H1 visible and readable
- [ ] "Find jobs" button → navigates to /jobs
- [ ] "Start hiring" button → navigates to /employers
- [ ] "Browse jobs without an account" link → /jobs
- [ ] "Sign in" link → /signin
- [ ] Talent proof badge visible with "500,000+" label
- [ ] Hero proof chips visible (4 chips)
- [ ] Animated mock cards visible on desktop
- [ ] Hero responsive: copy and visual stack vertically on mobile

### 2. Role selector (regression)
- [ ] Two role cards rendered
- [ ] "Continue as Job Seeker" → /job-seekers
- [ ] "Continue as Employer" → /employers
- [ ] Trust strip visible with badge and chips

### 3. Product Preview section (new)
- [ ] Section is initially invisible on load (opacity: 0) at all viewport sizes
- [ ] Section fades in as user scrolls to it
- [ ] Default active tab: "Job seeker profile"
- [ ] Clicking each tab switches the panel content
- [ ] All 5 tabs cycle correctly
- [ ] Mock cards render at desktop (2-column) and mobile (stacked)
- [ ] "Illustrative view of key features." subtitle visible
- [ ] CTA buttons in panels navigate to correct routes
- [ ] Section is visible with `prefers-reduced-motion: reduce`

### 4. Trust & Safety section (new)
- [ ] 4 cards rendered with correct emoji, heading, copy
- [ ] Grid: 4 cols at desktop, 2 at tablet, 1 at mobile
- [ ] Section fades in on scroll
- [ ] Section is visible with `prefers-reduced-motion: reduce`

### 5. Employer conversion band (new)
- [ ] Visible with gradient background
- [ ] Talent proof badge visible
- [ ] "Start hiring" → /employers
- [ ] Section fades in on scroll
- [ ] Section is visible with `prefers-reduced-motion: reduce`

### 6. Journey sections (regression)
- [ ] Job seeker journey: all steps rendered, CTA works
- [ ] Employer journey: all steps rendered, talent proof badge visible, dual CTA works

### 7. Final CTA band (regression)
- [ ] "Find jobs" → /jobs
- [ ] "Start hiring" → /employers
- [ ] Secondary links work

### 8. Authenticated user redirect (regression)
- [ ] Logged-in job seeker → /user
- [ ] Logged-in employer → /recruiter
- [ ] Logged-in admin → /admin

### 9. Angular build
- [ ] `ng build` completes without errors
- [ ] No type errors in `main-portal.component.ts`
- [ ] `PortalRevealDirective` importable from `SharedModule`

## What's NOT tested here
- Internal portal functionality (applicant profile, employer dashboard, MATCH, VideoCV) — these are untouched
- Payment/subscription flows — untouched
- Admin panel — untouched
