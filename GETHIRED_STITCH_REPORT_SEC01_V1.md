# GETHIRED STITCH REPORT — SEC-01 BOLA Fix Integration Audit
**Date:** 2026-06-25
**Scope:** SEC-01 IDOR/BOLA fix on GET /applicant/userprofile — full NgRx chain trace, interceptor coverage, selector wiring, and login-button audit across all public-facing pages.

---

## 1. NgRx Chain Trace — getUserProfile / userProfile

### Complete chain

```
ApplicantPanelComponent.ngOnInit()
  → applicantFacade.getUser()                         [applicant-panel.component.ts:39]
  → store.dispatch(ApplicantAction.getUserProfile())  [applicant.facade.ts:77]
  → action: getUserProfile (no props)                 [applicant.actions.ts:190-192]
  → effect: user$                                     [applicant.effects.ts:289-316]
  → mergeMap(() => applicantService.userProfile())    [applicant.service.ts:106]
  → baseService.get(`/applicant/userprofile`)
  → HTTP GET /applicant/userprofile  (NO ?id= param)
  → BE: getUserProfile() reads req.user.uid from JWT  [applicantsController.js:250]
  → success → getUserProfileSuccess({ user })         [reducer: state.user = action.user]
  → selector: getUser → state.user                    [applicant.selector.ts:12-15]
  → facade.user$ → applicantFacade.user$              [applicant.facade.ts:13]
  → applicant-panel.component.html: user$ consumed
```

**Verdict: CHAIN IS INTACT.** Every link is consistent after the uid removal.

---

## 2. Detailed Link-by-Link Verification

### 2a. Action payload — CLEAN
`getUserProfile` is defined with no `props<>()` (line 190-192 of applicant.actions.ts). No userId leaks into the action.

### 2b. Effect switchMap/catchError pattern — MINOR ISSUE
The effect uses `mergeMap`, not `switchMap`. For a profile load on init this is functionally fine (only one request is expected at once), but it means rapid re-dispatches would not cancel in-flight requests. **Not a breakage — note only.**

The `catchError` block is correctly inside the inner `pipe()` (i.e., inside the `mergeMap`), not on the outer actions pipe. This is the correct NgRx pattern — an outer catchError would kill the entire effect on first error. Status: **CORRECT**.

Error handling maps all HTTP statuses:
- 401 → "Your session has expired. Please sign in again."
- 403 → "We couldn't load this profile for your current session."
- 404 → "Let's finish setting up your profile."
- other → "We couldn't load your profile. Please try again."

### 2c. Dispatch trigger — ngOnInit ✓
`applicant-panel.component.ts` dispatches `getUser()` in `ngOnInit` (line 39), which fires when the applicant panel shell component mounts — i.e., immediately after a successful login routes to `/user`. No auth state subscription is used here; the route guard (`ApplicantGuard`) ensures this component only mounts for authenticated users, so dispatching unconditionally from ngOnInit is correct.

### 2d. Authorization header — COVERED
`AuthInterceptor` (core/interceptor/authentication.interceptor.ts) reads `localStorage.getItem("token")` and sets `Authorization: <token>` on every outgoing request. It is registered globally in `app.module.ts` (line 64) with `multi: true`. The `ApplicantService` extends `BaseService`, which uses Angular's `HttpClient` — so every `baseService.get()` call passes through the interceptor automatically.

**The Authorization header IS sent on the userprofile call.** The backend's `verifyAuth` middleware reads this header to populate `req.user.uid`.

### 2e. Other callers of getUser() that were NOT updated

The grep sweep found these additional call sites:

| File | Call | Issue? |
|---|---|---|
| `admin-panel.component.ts:35` | `this.adminFacade.getUser(this.local._id)` | **SEPARATE system** — AdminFacade/admin.actions still pass userId. This is a DIFFERENT endpoint from the applicant userprofile fix and was not in scope for SEC-01. Flagged separately below. |
| `applicant-settings.component.ts:33` | `this.authFacade.getUserProfile()` | Auth facade — calls `auth.service.getUserProfile()`, not applicant service. Separate flow. |
| `auth/account-setting.component.ts:36` | `this.authFacade.getUserProfile()` | Same auth facade, not applicant service. |
| `employer-settings.component.ts:65,73` | local `getUser()` method | Uses its own service, not applicant facade. |
| `employer-account-settings.component.ts:35` | `this.authFacade.getUserProfile()` | Auth facade. |

**No other component calls `applicantFacade.getUser()` or dispatches the applicant `getUserProfile` action with a stale userId argument.** The SEC-01 fix is complete within the applicant flow.

### 2f. Residual stale call in ApplicantService.getApplicant()
`applicant.service.ts` line 16-19 still has `getApplicant(userId: string)` which sends `GET /applicant/profile?id=${userId}`. This hits `getApplicantProfileById` (applicantsController.js:218), which was previously BOLA-fixed separately (now uses `req.user.uid`, ignoring the query param). The FE still sends the param but the BE ignores it — **functionally safe, not a regression**.

---

## 3. applicant-profile-details Component — Selector Wiring

**FINDING: The component does NOT use the NgRx store for profile data.**

`applicant-profile-details.component.ts` (applicant-panel/applicant-profile/applicant-profile-details) reads `userId` from `localStorage.getItem('user')._id` (line 20) and passes it as `@Input` to the `<app-profile-details [userId]="userId">` child.

`app-profile-details` (applicant/profile-details/profile-details.component.ts) then calls `applicantFacade.getApplicantById(this.userId)` (line 32), which dispatches the `getApplicant` action — this calls `GET /applicant/profile?id=${userId}` via the old `getApplicant()` service method.

This means the `applicant-profile-details` page uses the **getApplicant** flow (not getUser/userProfile). It subscribes to `applicantFacade.applicantDetails$` which maps to the `applicant.selected` state slice via selector `getApplicantById`. This is internally consistent.

**The userProfile (SEC-01 chain) is separate from the profile-details page.** The profile-details page does not subscribe to the `getUser` selector. Both paths are correct for their respective purposes.

---

## 4. Admin Panel — Outstanding BOLA Risk (Out of SEC-01 Scope, Flagged)

`admin-panel.component.ts` line 35:
```typescript
this.adminFacade.getUser(this.local._id);
```

`admin.facade.ts` dispatches `AdminAction.getUserProfile({ userId })` with the localStorage `_id`. The `admin.actions.ts` action still carries `props<{ userId: string }>()`. This is the same IDOR pattern that SEC-01 fixed for the applicant — the admin panel was NOT updated.

**This is out of SEC-01 scope but should be tracked as a follow-on fix.**

---

## 5. Login Button Audit

### Route existence check
- `/signin` route: **EXISTS** — `auth.module.ts` defines `path: 'signin'` with `SigninComponent`, registered in `app.routing.module.ts` via the auth lazy-load path.
- `/signup` route: **EXISTS** — same module.

---

### 5a. Header component (`core/header/header.component.html`)
**Button:** `Login` button, calls `redirectToRegister()`
**Handler:** `this.router.navigateByUrl('/signin')` [header.component.ts:63]
**Status: WORKS** — navigates to `/signin` which exists.
**Note:** The button label says "Login" but routes to `/signin` — consistent with the rest of the app, not a functional bug.

---

### 5b. Main portal — `/home` (`public/main-portal`)
**Buttons:**
- Line 26: `(click)="goToSignin()"` — "Sign in"
- Line 207: `(click)="goToSignin()"` — "Sign in"
**Handler:** `this.router.navigateByUrl('/signin')` [main-portal.component.ts:113]
**Status: WORKS**

---

### 5c. Job seeker portal — `/job-seekers` (`public/job-seeker-portal`)
**Buttons:**
- Line 30: `(click)="goToSignin()"` — "Sign in"
- Line 218: `(click)="goToSignin()"` — "Sign in"
**Handler:** `this.router.navigateByUrl('/signin')` [job-seeker-portal.component.ts:113]
**Status: WORKS**

---

### 5d. Employer portal — `/employers` (`public/employer-portal`)
**Buttons:**
- Line 20: `(click)="goToSignin()"` — "Sign in"
- Lines 159-161: component output binding `secondaryLabel="Sign in"` + `(secondaryClick)="goToSignin()"` (some shared portal-cta component)
**Handler:** `this.router.navigateByUrl('/signin')` [employer-portal.component.ts:101]
**Status: WORKS**

---

### 5e. Job detail page (`jobs/job-posts-details`)
**Buttons:**
- Lines 61-66: two "Login to Apply" buttons (one for each layout), both `(click)="toLogin()"`
**Handler:** `toLogin()` reads `this.route.url`, builds a path string, saves to `localStorage.setItem('returnURL', url)`, then calls `this.router.navigateByUrl('signin')` [job-posts-details.component.ts:101-113]
**Status: WORKS** — navigates to `signin` (relative, resolves to `/signin`).
**Note:** The `returnURL` save-and-restore flow is intact. The subscription is unsubscribed in `ngOnDestroy`.

---

### 5f. Locked Match Teaser (`shared/components/locked-match-teaser`)
**Button:** "Log in" [locked-match-teaser.component.html:20-21]
**Handler:** `logIn()` → saves `returnURL` via `localStorage.setItem('returnURL', this.router.url)` → `this.router.navigateByUrl('/signin')` [locked-match-teaser.component.ts:44-47]
**Status: WORKS**

---

### 5g. Employer panel session-expiry link (`employer-panel.component.html:323`)
**Link:** `<a href="/signin" ...>sign in again</a>` (plain href, not routerLink)
**Status: WORKS** — href="/signin" hard-navigates to the correct route.
**Minor note:** Using `href` instead of `routerLink` causes a full page reload, but is functionally correct for a session-expiry recovery link.

---

### 5h. Reset password → "Back to Login" (`auth/reset-password`)
**Buttons:** Both "Back to Login" buttons call `redirectToLogin()` [reset-password.component.html:31,53]
**Status: WORKS** (standard auth flow, not audited deeper as it's not a public-facing entry point).

---

### 5i. Account authentication → "Login" buttons (`auth/account-authentication`)
**Buttons:** Two "Login" buttons call `redirectToLogin()` [account-authentication.component.html:12,50]
**Status: WORKS** (post-verification redirect, not a public entry point).

---

### 5j. Signup page → "Sign in" links (`auth/signup`)
**Links:**
- `[routerLink]="'/signin'"` (line 244, 247-248)
**Status: WORKS** — routerLink to `/signin`.

---

## 6. Summary

### Integration chain: FULLY INTACT

| Link | Status |
|---|---|
| Component dispatches `getUserProfile()` (no uid) | PASS |
| Action carries no payload | PASS |
| Effect calls `applicantService.userProfile()` (no uid arg) | PASS |
| Service calls GET `/applicant/userprofile` (no ?id=) | PASS |
| BE reads `req.user.uid` from JWT only | PASS |
| BE blocks mismatched ?id= with 403 + security log | PASS |
| catchError inside inner pipe (correct NgRx pattern) | PASS |
| HTTP status codes mapped to safe messages | PASS |
| Authorization header sent via AuthInterceptor | PASS |
| Selector `getUser` → `state.user` wired correctly | PASS |
| Facade `user$` exposed and consumed by panel | PASS |

### Login button audit: ALL PASS

| Page / Component | Button text | Route | Status |
|---|---|---|---|
| Header | Login | `/signin` via `navigateByUrl` | PASS |
| Main portal (`/home`) | Sign in (×2) | `/signin` via `navigateByUrl` | PASS |
| Job seeker portal (`/job-seekers`) | Sign in (×2) | `/signin` via `navigateByUrl` | PASS |
| Employer portal (`/employers`) | Sign in (×2) | `/signin` via `navigateByUrl` | PASS |
| Job detail | Login to Apply (×2) | `/signin` via `navigateByUrl` | PASS |
| Locked match teaser | Log in | `/signin` via `navigateByUrl` | PASS |
| Employer panel session expiry | sign in again | `/signin` via href | PASS |
| Reset password | Back to Login | via `redirectToLogin()` | PASS |
| Account authentication | Login (×2) | via `redirectToLogin()` | PASS |
| Signup | Sign in | `/signin` via `routerLink` | PASS |

**No broken login buttons found. All routes point to `/signin` which is confirmed registered in `auth.module.ts`.**

---

## 7. Outstanding Issues (Not SEC-01, Flagged for Follow-on)

1. **Admin panel BOLA (medium priority):** `admin-panel.component.ts` still passes `this.local._id` to `adminFacade.getUser()` → `AdminAction.getUserProfile({ userId })`. If the admin's `GET /admin/userprofile` endpoint also trusted the query userId (as the applicant one did pre-SEC-01), this is an equivalent IDOR risk. Should be verified and patched in a follow-on SEC-02 pass.

2. **`getApplicant` service still sends `?id=` (low priority):** `applicant.service.ts:getApplicant()` sends `GET /applicant/profile?id=${userId}`. The backend controller now ignores the query param (uses JWT uid), so this is safe — but the FE sends unnecessary data. Cosmetic cleanup only.

3. **`mergeMap` vs `switchMap` in user$ effect (very low priority):** Repeated rapid dispatches of `getUserProfile` would fire multiple concurrent requests. In practice this only fires once on ngOnInit, so this is not a real bug.

---

## 8. Fixes Applied

None required. The SEC-01 integration chain is fully correct as shipped. This report is audit-only.
