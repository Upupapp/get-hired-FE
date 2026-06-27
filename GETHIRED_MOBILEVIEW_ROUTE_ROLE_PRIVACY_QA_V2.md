# GETHIRED MOBILEVIEW — Route & Role Privacy QA V2
Generated: 2026-06-25

## Route Guards — Not Modified

The following guards were NOT modified in this pass (correct per constraints):
- `AuthGuard` — verifies user is logged in; redirects to signin
- `AdminGuard` — verifies role '1'
- `EmployerGuard` — verifies role '2'
- `ApplicantGuard` — verifies role '3'
- `UnauthGuard` — for signin/signup (redirects logged-in users)

All guards remain as they were. Mobile nav additions do not bypass any guard.

---

## Role Isolation Verification

### Mobile Nav Links by Portal

**Employer Panel Drawer (`employer-panel.component.html`):**
- All links point to `/recruiter/*` only
- No admin or user routes present
- Guard enforces: `canActivate: [AuthGuard], data: { role: '2' }` on `/recruiter` route
- Even if a recruiter manually typed `/admin`, the AdminGuard would reject them

**Applicant Panel Drawer (`applicant-panel.component.html` — ADDED):**
- All links point to `/user/*` only
- No recruiter or admin routes present
- Guard enforces: `canActivate: [AuthGuard], data: { role: '3' }` on `/user` route

**Admin Panel Drawer (`admin-panel.component.html` — ADDED):**
- All links point to `/admin/*` only
- No recruiter or user routes present
- Guard enforces: `canActivate: [AuthGuard], data: { role: '1' }` on `/admin` route

**Conclusion:** Mobile nav drawers and bottom nav bars maintain complete role isolation. No cross-role links exist in any mobile nav component.

---

## Company Scoping

**Recruiter portal:** `employer-internal-authguard.ts` and company-scoping logic was not touched.
**Mobile nav links:** Only navigate to routes already accessible by the logged-in recruiter.
**Company profile link** (`/recruiter/company/details`) in drawer correctly scopes to the recruiter's own company based on backend session data — no change to this behavior.

---

## Data Privacy on Mobile

**localStorage access:**
```typescript
local = JSON.parse(localStorage.getItem('user'));
```
This is present in all panel components (applicant, employer, admin). `localStorage` is browser-only.

**SSR safety:** Panel components are only reached AFTER authentication (behind route guards), which is a client-side navigation. SSR renders the login page; authenticated panel routes are not server-rendered in a way that exposes user data. However, `localStorage.getItem('user')` without `isPlatformBrowser` guard could throw on SSR.

**Finding:** Pre-existing code — NOT introduced by this pass. All panel components use `localStorage.getItem('user')` in field initializers without `isPlatformBrowser`. This is a pre-existing SSR risk, not a MOBILEVIEW concern.

**Logged in backlog:** Add `isPlatformBrowser` guard to localStorage calls in all panel components.

---

## Mobile Nav Drawer and Role Data

Mobile nav drawers do NOT display user profile data, plan data, or company data. They only show static navigation links. No sensitive data is rendered in the drawer that could be exposed if CSS hid it (no data hidden behind display:none).

---

## Verification Matrix

| Guard | Modified | Works on Mobile |
|-------|---------|----------------|
| AuthGuard | No | Yes (unchanged) |
| AdminGuard | No | Yes (unchanged) |
| EmployerGuard | No | Yes (unchanged) |
| ApplicantGuard | No | Yes (unchanged) |
| UnauthGuard | No | Yes (unchanged) |

| Portal Nav | Cross-role Links | Isolation |
|------------|-----------------|-----------|
| Employer drawer/bottom-nav | None | Complete |
| Applicant drawer/bottom-nav | None | Complete |
| Admin drawer/bottom-nav | None | Complete |

**Overall verdict: PASS.** All route guards and role isolation are intact. MOBILEVIEW changes do not affect security or privacy.
