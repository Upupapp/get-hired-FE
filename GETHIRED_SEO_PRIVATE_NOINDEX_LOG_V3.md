# GETHIRED SEO Private Route Noindex Log V3

Generated: 2026-06-25

## Strategy

Private routes are protected at two levels:
1. **robots.txt Disallow** — primary crawler exclusion at the file level (covers /admin/, /recruiter/, /user/, /owner/, /investor/, /api/, /payment/, /subscription/, /signin, /signup, /reset-password, /change-password, /verify).
2. **Component-level noindex** — applied to auth pages and 404.

The private panel components (AdminPanelComponent, EmployerPanelComponent, ApplicantPanelComponent) themselves are NOT modified with SeoService calls because:
- The route guards (AuthGuard + role checks) prevent unauthenticated access entirely.
- robots.txt Disallow covers the URL prefixes.
- Adding SeoService to panel root components is lower priority than the public-page and auth-page work, and carries modification risk.
- These pages would only ever be rendered to a logged-in user.

## Changes Made

### /signin — SigninComponent
`robots: 'noindex, nofollow'` set in ngOnInit.

### ** (404) — ErrorNotFoundComponent
`robots: 'noindex, follow'` set in ngOnInit (`follow` so crawlers can discover the recovery links).

### /jobs/search/:keyword — PublicSearchComponent
`robots: 'noindex, follow'` set in ngOnInit (parameterised search URLs should not be independently indexed — canonical points to /jobs).

### /jobs/details/:id for non-active jobs — PublicDetailsComponent
When `job.jobStatusId !== 2`, sets `robots: 'noindex, nofollow'` dynamically.

## Deferred (backlog)

| Route prefix | Recommended future action |
|-------------|--------------------------|
| /signup | Add SeoService noindex in SignupComponent (low priority — robots.txt covers) |
| /reset-password | Add SeoService noindex |
| /change-password | Add SeoService noindex |
| /verify | Add SeoService noindex |
| /recruiter/*, /user/*, /admin/* | Optional belt-and-suspenders noindex on panel root components |

## robots.txt Coverage
See `GETHIRED_SEO_ROBOTS_LOG_V3.md` for the full robots.txt content and placement.
