# GETHIRED MOBILEVIEW — Route, Role & Privacy QA V3
Generated: 2026-06-26

---

## Route Guards (not modified in V3)

| Guard | Role | Check |
|-------|------|-------|
| AuthGuard | All protected routes | Checks JWT token and role |
| AdminGuard | /admin/** | role=1 only |
| EmployerGuard | /recruiter/** | role=2 only |
| ApplicantGuard | /user/** | role=3 only |
| UnauthGuard | /signin, /signup | Redirects logged-in users away |

**No guard files were touched in V3. All guards remain as-is.**

---

## Role Isolation in Mobile Nav

| Portal | Drawer items | Bottom nav items |
|--------|-------------|-----------------|
| Employer | Dashboard, Jobs, Candidates, Messages, Company, Subscription, Interview Hub | Dashboard, Jobs, Post, Applicants, Company |
| Applicant | Dashboard, My Jobs, Applications, Profile, Settings | Dashboard, Jobs, Applications, Profile, Settings |
| Admin | Dashboard, Users, Jobs, Companies, Reports | Dashboard, Users, Jobs, Companies |

Each portal's drawer only exposes its own role's routes. No cross-role items visible.

---

## Company Scoping (BOLA)

BOLA fixes in employer-panel are not in SCSS files — they're in the guards and services.
Not touched in V3. The recruiter portal correctly scopes all job/applicant queries to
the authenticated company's ID via the backend.

---

## Privacy Checks (data exposed on mobile)

| Check | Status |
|-------|--------|
| JWT token not logged | CONFIRMED — console.log(user) JWT leak removed in NOTIFY sprint |
| PII (contact import) not logged | CONFIRMED — console.log(this.data) removed in NOTIFY sprint |
| localStorage not exposed in SSR logs | CONFIRMED — all typeof guards now in place (V3 completes this) |
| User data in snackbar | Not exposed — snackbar shows status messages only |
| Admin pages behind auth | CONFIRMED — AuthGuard + AdminGuard |

---

## Public Data Exposure (correct exposure)

Public pages intentionally expose:
- Job title, company name, location, description, salary range (if set)
- Company profile (if public)

This is correct behavior. No private data (applicant contact info, recruiter email, salary of specific users) is exposed on public routes.

---

## SSR Privacy

SSR renders public routes on the server. After V3 fixes, no SSR render logs:
- localStorage values (user tokens, role, returnURL) — all typeof-guarded
- User PII — not in server-rendered HTML on public routes
- Session tokens — only in localStorage, not in SSR output

---

## Issues Found

None. All guards, BOLA fixes, and privacy-sensitive code paths remain intact and untouched by V3.
