# GETHIRED_HOME_ROUTE_SAFETY_REVIEW
> Route safety review for GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## Routes used by new sections

| Route | Method | Section |
|-------|--------|---------|
| `/job-seekers` | `goToJobSeekerPortal()` | Preview panel CTAs (seeker, tracking, video) |
| `/employers` | `goToEmployerPortal()` | Preview panel CTAs (employer, signals), employer band |
| `/jobs` | `goToJobs()` | Preview panel CTA (tracking tab) |

All three routes existed before V2. Navigation calls are the same component methods already used by the hero, role selector, and journey sections. No new routes were added.

## Authenticated routes
None. All CTAs on this public marketing page navigate to public routes (/jobs, /job-seekers, /employers) or the sign-in page (/signin). The employer and job-seeker portals handle their own auth guards internally.

## Login redirect (preserved)
`ngOnInit` still checks `isLoggedIn()` and redirects authenticated users to their dashboard:
- role `1` → `/admin`
- role `2` → `/recruiter`
- role `3` → `/user`

This redirect runs before any marketing content is visible to authenticated users.

## Verdict: no new routes, no route safety issues
