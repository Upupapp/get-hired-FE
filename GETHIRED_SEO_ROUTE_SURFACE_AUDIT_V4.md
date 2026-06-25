# GetHired SEO V4 — Route & Surface Audit

Generated: 2026-06-26

## Route Classification

### Public / Indexable Routes

| Route | Path | Guard | Index | Canonical | Sitemap | JSON-LD | Notes |
|-------|------|-------|-------|-----------|---------|---------|-------|
| Homepage | /home | none | YES | /home | YES | Organization + WebSite | MainPortalComponent |
| Jobs list | /jobs | none | YES | /jobs | YES | BreadcrumbList | PublicListComponent |
| Job detail (active) | /jobs/details/:id | none | YES (jobStatusId=2) | /jobs/details/:id | YES (per-job) | JobPosting + BreadcrumbList | PublicDetailsComponent |
| Job detail (inactive) | /jobs/details/:id | none | NO (noindex,nofollow) | /jobs/details/:id | NO | none | Same component, different meta branch |
| Job seeker portal | /job-seekers | none | YES | /job-seekers | YES | none | JobSeekerPortalComponent |
| Employer portal | /employers | none | YES | /employers | YES | none | EmployerPortalComponent |
| Company details | /companies/details?id=X | none | YES | /companies/details?id=X | NO (backlog) | BreadcrumbList | PublicCompanyDetailsComponent |

### Private / Noindex Routes

| Route | Path | Guard | Noindex method | Notes |
|-------|------|-------|----------------|-------|
| Admin | /admin/* | AuthGuard (role=1) | robots.txt Disallow | AdminPanelModule |
| Recruiter/Employer | /recruiter/* | AuthGuard (role=2) | robots.txt Disallow | EmployerPanelModule |
| Applicant | /user/* | AuthGuard (role=3) | robots.txt Disallow | ApplicantPanelModule |
| Sign in | /signin | UnauthGuard | robots.txt + component noindex,nofollow | SigninComponent |
| Sign up | /signup | UnauthGuard | robots.txt + component noindex,nofollow (FIXED V4) | SignupComponent |
| Reset password | /reset-password | UnauthGuard | robots.txt + component noindex,nofollow (FIXED V4) | ResetPasswordComponent |
| Change password | /change-password | UnauthGuard | robots.txt + component noindex,nofollow (FIXED V4) | ChangePwComponent |
| Email verify | /verify | UnauthGuard | robots.txt + component noindex,nofollow (FIXED V4) | AccountAuthenticationComponent |
| Search results | /jobs/search/:keyword | none | robots.txt Disallow + component noindex,follow | PublicSearchComponent |
| 404 | ** | none | component noindex,follow | ErrorNotFoundComponent |

### Dead Code Notes

- `isMobileViewAllowed: false` data annotations on /recruiter and /user routes are dead code — no guard reads them. Documented only; not fixed (harmless, out of SEO scope).
- `/owner/*` and `/investor/*` are Disallowed in robots.txt but no routes exist for them — defensive coverage only.

## Summary Counts

- Indexable routes: 7
- Noindex routes: 10
- Total classified: 17
