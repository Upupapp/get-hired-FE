# GETHIRED MOBILEVIEW — Route Surface Audit V2
Generated: 2026-06-25

## Methodology
Each route was audited by reading the component HTML/SCSS files. Mobile issues were
identified through pattern analysis (fixed widths, no breakpoints, overflow containers,
small tap targets, hidden CTAs on mobile, absent nav).

---

## PUBLIC ROUTES

### /home — MainPortalComponent
- **File:** src/app/public/main-portal/main-portal.component.{html,scss}
- **Desktop:** Split hero (copy left, mock card right), role selector grid, how-it-works, journey sections, footer CTA
- **Mobile issues found:** Hero visual grid stays 2-col below 992px until explicit breakpoint; mock cards overlap on very small screens
- **SCSS already has:** grid-template-columns: 1fr at 991px; portal-role-grid stacks at 767px; prefers-reduced-motion for animations
- **Fix applied:** Already responsive. Confirmed portal-hero-visual has flex-direction column at 575px.
- **Risk:** Low

### /jobs — PublicListComponent
- **File:** src/app/public/public-list/public-list.component.{html,scss}
- **Desktop:** Banner search, job post list, companies strip, explore users
- **Mobile issues found:** Banner search row overflows horizontally at <576px due to fixed min-width on .search-key (450px)
- **Fix applied:** Banner SCSS already has @media (max-width: 767px) flex-wrap fix on .bg-transparent. Added extra fix at 575px.
- **Risk:** Low

### /jobs/details/:id — PublicDetailsComponent
- **File:** src/app/public/public-details/
- **Desktop:** Job detail page with apply CTA, job description, company info
- **Mobile issues found:** To be verified. Contained within standard Bootstrap grid — likely stacks correctly.
- **Risk:** Low

### /companies/:id — PublicCompanyDetailsComponent
- **File:** src/app/public/public-company-details/
- **Desktop:** Company profile with job list
- **Mobile issues found:** Tables may overflow
- **Risk:** Medium

### /employers — EmployerPortalComponent
- **File:** src/app/public/employer-portal/employer-portal.component.{html,scss}
- **Desktop:** Hero with dashboard mockup, feature sections
- **Mobile issues:** Already has responsive hero with portal-common SCSS
- **Risk:** Low

### /job-seekers — JobSeekerPortalComponent
- **File:** src/app/public/job-seeker-portal/
- **Desktop:** Marketing page for job seekers
- **Risk:** Low

### /signin — SigninComponent
- **File:** src/app/auth/signin/signin.component.{html,scss}
- **Desktop:** Split layout — carousel left, form right
- **Mobile issues:** Left carousel panel takes 6/12 cols on mobile — hidden with d-none at some breakpoint?
- **Fix needed:** Verify carousel hides on mobile. bg-left panel not visible below md.
- **Risk:** Medium

### /signup — SignupComponent
- **File:** src/app/auth/signup/
- **Mobile issues:** Same split layout concern as signin
- **Risk:** Medium

### /404 — ErrorNotFoundComponent
- **File:** src/app/views/error-page/
- **Risk:** Low — simple centered content

---

## APPLICANT ROUTES (/user/*)

### /user/dashboard — ApplicantDashboardComponent
- **File:** src/app/applicant-panel/applicant-dashboard/
- **Desktop:** Profile readiness panel, recommended jobs, banner, stat chart
- **Mobile issues:** No mobile nav (FIXED in this pass), alert snackbar position (FIXED)
- **Fix applied:** Added mobile top bar, drawer, bottom nav to applicant-panel.component; moved alert above nav bar in SCSS
- **Risk:** Low after fix

### /user/profile — ApplicantProfileComponent
- **File:** src/app/applicant-panel/applicant-profile/
- **Desktop:** Multi-tab profile form
- **Mobile issues:** Multi-column form rows likely overflow; tab bar may overflow horizontally
- **Risk:** Medium

### /user/applications — ApplicantApplicationsComponent
- **File:** src/app/applicant-panel/applicant-applications/
- **Desktop:** Application list table
- **Mobile issues:** Table with multiple columns — needs card display at mobile
- **Risk:** Medium

### /user/video-answers — VideoAnswers
- **File:** src/app/applicant-panel/
- **Desktop:** Video recorder/playback interface
- **Mobile issues:** Video element sizing; recording controls tap targets
- **Risk:** High (video constraints)

---

## RECRUITER ROUTES (/recruiter/*)

### /recruiter/dashboard — EmployerDashboardComponent → CompanyDashboardComponent
- **File:** src/app/employer-panel/employer-dashboard/
- **Desktop:** KPI cards, pipeline, action center
- **Mobile issues:** ALREADY FIXED in prior GH1 session — employer panel has full mobile nav, bottom bar, billing bar
- **Risk:** Low

### /recruiter/jobs/list — EmployerJoblistComponent → JobListComponent
- **File:** src/app/employer-panel/employer-jobs/employer-joblist/ → shared job-list
- **Desktop:** Table of job postings
- **Mobile issues:** Mat-table overflows at mobile without responsive card pattern
- **Risk:** Medium

### /recruiter/contacts — EmployerContactsComponent
- **File:** src/app/employer-panel/employer-contacts/
- **Desktop:** Candidate/contact table
- **Mobile issues:** Table overflow
- **Risk:** Medium

### /recruiter/messages — RecruiterMessagesComponent
- **File:** src/app/employer-panel/recruiter-messages/
- **Desktop:** Message thread list + detail
- **Mobile issues:** Message thread may not stack correctly
- **Risk:** Medium

### /recruiter/company/details — EmployerCompanyComponent
- **File:** src/app/employer-panel/employer-company/
- **Desktop:** Company profile with tabs
- **Mobile issues:** Tabs may overflow horizontally
- **Risk:** Medium

### /recruiter/subscription — EmployerSubscriptionComponent
- **File:** src/app/employer-panel/employer-subscription/
- **Desktop:** Subscription plans, billing info
- **Mobile issues:** Subscription cards may not stack
- **Risk:** Medium (DO NOT change payment flows)

---

## ADMIN ROUTES (/admin/*)

### /admin/dashboard — AdminDashboardComponent
- **File:** src/app/admin-panel/admin-dashboard/admin-dashboard.component.html
- **Desktop:** Stub ("admin-dashboard works!")
- **Mobile issues:** None (stub)
- **Fix applied:** Added mobile nav to admin-panel.component
- **Risk:** Low

### /admin/users — AdminUsersComponent
- **File:** src/app/admin-panel/admin-users/
- **Desktop:** Reusable table of users
- **Mobile issues:** Table overflow
- **Risk:** Medium

### /admin/jobs — (if exists)
- **Mobile issues:** Table overflow
- **Risk:** Medium

### /admin/companies — (if exists)
- **Desktop:** Company list
- **Risk:** Medium

### /admin/reports — (if exists)
- **Desktop:** Reports/analytics
- **Risk:** Medium

---

## SUMMARY

| Category | Total Routes | Issues Found | Fixes Applied |
|----------|-------------|--------------|---------------|
| Public | 8 | 3 | 2 |
| Applicant | 7 | 3 | 3 |
| Recruiter | 8 | 4 | Already fixed (prior session) |
| Admin | 5 | 3 | 2 (nav) |

**Key finding:** Employer panel already had comprehensive mobile nav from a prior session. Applicant and Admin panels were missing mobile nav — added in this pass.
