# GETHIRED MOBILEVIEW — Route Surface Audit V3
Generated: 2026-06-26

---

## Route Map (from app.routing.module.ts)

| Path | Module | Guard | Role |
|------|--------|-------|------|
| `/` | redirect → /home | none | public |
| `/home` | PublicModule | none | public (SSR) |
| `/jobs` | PublicModule | none | public (SSR) |
| `/jobs/details/:id` | PublicModule | none | public (SSR) |
| `/jobs/search/:kw` | PublicModule | none | public (SSR) |
| `/companies` | PublicModule | none | public |
| `/signin` | AuthModule | UnauthGuard | unauthenticated only |
| `/signup` | AuthModule | UnauthGuard | unauthenticated only |
| `/admin/**` | AdminPanelModule | AuthGuard (role=1) | admin only |
| `/recruiter/**` | EmployerPanelModule | AuthGuard (role=2) | recruiter only |
| `/user/**` | ApplicantPanelModule | AuthGuard (role=3) | applicant only |
| `**` | ErrorPageModule | none | 404 fallback |

---

## SSR Render Surface (routes that Angular Universal renders server-side)

| Route | Component | SSR Status |
|-------|-----------|------------|
| `/home` | banner.component.ts | GUARDED — localStorage in isPlatformBrowser |
| `/jobs` | job-posts-list.component.ts (public module) | GUARDED — window.innerWidth in isPlatformBrowser |
| `/jobs` | public-list.component.ts (wrapper) | GUARDED (V3-F4) — asyncLocalStorage typeof |
| `/jobs` | job-board-employer-cta.component.ts | GUARDED (V3-F5) — wasDismissed/dismiss typeof |
| `/jobs/search/:kw` | public-search.component.ts | GUARDED — localStorage + sessionStorage + window.innerWidth |
| `/jobs/details/:id` | job-posts-details.component.ts | GUARDED — HostListener resize isPlatformBrowser |
| All public routes | public.component.ts | GUARDED (V2-F3) — safeParseUser typeof |

---

## Guard Coverage by Portal

### Public portal — ALL GUARDED as of V3
All 5 SSR crash vectors from V2 RECENT_3 audit are now resolved:
- public.component.ts — fixed V2 (MV3-F3 in docs, was pre-existing in codebase)
- public-list.component.ts — fixed V3 (MV3-F4, this session)
- job-board-employer-cta.component.ts — fixed V3 (MV3-F5, this session)
- public-search.component.ts — already guarded
- job-posts-list.component.ts — already guarded

### Auth portal (/signin, /signup)
- UnauthGuard prevents logged-in users from accessing — CONFIRMED in app.routing.module.ts
- No SSR — auth routes are SPA-only

### Applicant portal (/user/**)
- AuthGuard with role=3 — CONFIRMED
- Not SSR rendered

### Recruiter portal (/recruiter/**)
- AuthGuard with role=2 — CONFIRMED
- Not SSR rendered

### Admin portal (/admin/**)
- AuthGuard with role=1 — CONFIRMED
- Not SSR rendered

---

## Legacy Unguarded Components (not in SSR path)

| Component | Location | Risk Level |
|-----------|----------|------------|
| job-post-details.component.ts | views/home legacy | LOW — uses static mock data, not in SSR routes |
| job-post-search-list.component.ts | views/home legacy | LOW — same as above |
| views/home/components/job-posts-list.component.ts | views/home legacy | LOW — same as above |

These components use `window.innerWidth` bare in ngOnInit but they are in the legacy `views/home` module which is not registered in the main SSR route config. Risk is low but they remain as technical debt.

---

## Role Isolation Verification

| Guard | File | Verified |
|-------|------|---------|
| AuthGuard | shared/guard/auth.guard.ts | Not modified in V3 — PASS |
| AdminGuard | shared/guard/admin.guard.ts | Not modified in V3 — PASS |
| EmployerGuard | shared/guard/employer.guard.ts | Not modified in V3 — PASS |
| ApplicantGuard | shared/guard/applicant.guard.ts | Not modified in V3 — PASS |
| UnauthGuard | shared/guard/unauth.guard.ts | Not modified in V3 — PASS |
