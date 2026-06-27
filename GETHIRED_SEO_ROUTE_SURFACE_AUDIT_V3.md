# GETHIRED SEO Route & Surface Audit V3

Generated: 2026-06-25

## Route Inventory

### Public Routes (should be indexed)

| Path | Component | Module | SEO State Before | Action Taken |
|------|-----------|--------|-----------------|--------------|
| / | redirect → /home | AppRoutingModule | No meta | Redirect only |
| /home | MainPortalComponent | PublicModule | Only `Title` set via TitleService | SeoService wired in Phase 4 |
| /jobs | PublicListComponent | PublicModule | No meta | SeoService wired in Phase 4 |
| /jobs/details/:id | PublicDetailsComponent | PublicModule | No meta | SeoService + JobPosting JSON-LD wired |
| /jobs/search/:keyword | PublicSearchComponent | PublicModule | No meta | SeoService wired, noindex set (search results) |
| /companies/details | PublicCompanyDetailsComponent | CompaniesModule | No meta | SeoService wired in Phase 9 |
| /job-seekers | JobSeekerPortalComponent | PublicModule | Only `Title` set | SeoService wired |
| /employers | EmployerPortalComponent | PublicModule | Only `Title` set | SeoService wired |

### Auth Routes (noindex)

| Path | Component | Module | SEO Action |
|------|-----------|--------|-----------|
| /signin | SigninComponent | AuthModule | noindex wired via SeoService |
| /signup | SignupComponent | AuthModule | Not modified (deferred — same treatment as signin) |
| /reset-password | ResetPasswordComponent | AuthModule | Not modified (deferred) |
| /change-password | ChangePwComponent | AuthModule | Not modified (deferred) |
| /verify | AccountAuthenticationComponent | AuthModule | Not modified (deferred) |

### Private Routes (guarded, noindex by robots.txt)

| Path | Guard | SEO Action |
|------|-------|-----------|
| /admin/** | AuthGuard, role=1 | Blocked by robots.txt Disallow |
| /recruiter/** | AuthGuard, role=2 | Blocked by robots.txt Disallow |
| /user/** | AuthGuard, role=3 | Blocked by robots.txt Disallow |

### 404 / Error

| Path | Component | SEO Action |
|------|-----------|-----------|
| ** (wildcard) | ErrorNotFoundComponent | noindex set, navigation links added |

## Key Findings

1. **No SeoService existed** before this pass — all meta was set inconsistently via Angular `Title` service only, with no description, robots, canonical, or OG tags.
2. **Private routes** rely on guard authentication + robots.txt Disallow; they don't individually set noindex in their components (high-risk to touch), but robots.txt covers crawler exclusion.
3. **PublicSearchComponent** uses `/jobs/search/:keyword` — these are noindex since each keyword produces a unique URL that could be seen as duplicate content.
4. **CompaniesModule** route is `companies/details` (query param `?id=`), not `companies/:id` (path param). Unusual pattern but functional.
5. **No /companies root list page** exists — CompaniesComponent is declared but has no route that renders it as a standalone page.
