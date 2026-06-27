# GetHired NOTIFY Report — SEC-01 Deployment QA
**Date:** 2026-06-25
**Scope:** SEC-01 BOLA fix — error handling in applicant profile load, login button copy audit, accessible CTAs

---

## 1. Template Verification — Error State Rendering

### Finding: CRITICAL GAP (fixed this pass)

**Problem:** The SEC-01 error messages (`safeMessage` strings dispatched via `getUserProfileFail`) were stored in the NgRx `state.error` field but **never rendered in any template**. The `applicant-panel.component.html` wrapped the entire panel in `*ngIf="user$ | async as user"`. When `getUser()` failed (401, 403, 404, or generic), `user$` stayed `null` and the **entire applicant panel disappeared with no visible feedback** — blank screen.

The four SCSS classes (`gh-profile-error-banner`, `gh-session-expired-banner`, `gh-profile-cta-btn`, `gh-signin-cta`) were authored in `applicant-profile-details.component.scss` but no corresponding HTML template nodes existed.

**Fix applied:**
- Added `error$ = this.applicantFacade.error$` to `applicant-panel.component.ts`
- Changed `*ngIf="user$ | async as user"` to `*ngIf="user$ | async as user; else profileLoadError"` in `applicant-panel.component.html`
- Added `<ng-template #profileLoadError>` at the bottom of the template that renders an accessible error banner with the safe message and a "Sign In" CTA

**Note on 401/403 path:** The `UnAuthorizedInterceptor` already catches 401 and 403, shows a snackbar ("Your session has expired. Please sign in again to continue."), and navigates to `/signin` before the effect stores the error. The panel fallback will therefore only render visibly for 404 (no profile yet) and generic errors. The 401/403 snackbar copy is slightly different from the effects copy — this is acceptable since they fire at different layers; no change made to security logic.

---

## 2. Raw Firebase Error String Leakage Audit

**Result: NONE FOUND**

Searched all `.html` templates for `auth/`, `Firebase:`, and `.code` patterns. Zero matches for Firebase SDK error codes. The `.message` bindings found in contact/candidate import dialogs and the CV builder are domain-level status fields from BE responses, not Firebase SDK strings. Clean.

---

## 3. Login Button Copy Audit

### 3a. Global Header (`header.component.html`)
| Before | After | Issue |
|--------|-------|-------|
| `Login` | `Sign In` | Inconsistent label (rest of app uses "Sign in"); no `aria-label` |

**Fix applied:** Label changed to `Sign In`, added `aria-label="Sign in to your account"`.

**Note:** The click handler is `redirectToRegister()` — misleading method name but the implementation correctly navigates to `/signin`. Method name not changed (not a copy/aria fix).

### 3b. Account Authentication (`account-authentication.component.html`)
Two buttons used "Login" with no `aria-label`.

| Location | Before | After |
|----------|--------|-------|
| `isResent` state button | `Login` | `Sign In` + `aria-label="Sign in to your account"` |
| `#verified` template button | `Login` | `Sign In` + `aria-label="Sign in to your account"` |
| Surrounding body text | "Please verify and login again." | "Please verify and sign in again." |

### 3c. Reset Password (`reset-password.component.html`)
| Before | After |
|--------|-------|
| `Back to Login` (no aria-label) | `Back to Sign In` + `aria-label="Back to sign in"` |

### 3d. Job Posts Details — Public Job Detail Page (`jobs/job-posts-details/job-posts-details.component.html`)
**Critical bug found:** The "Login to Apply" button was **rendered twice** — two identical `<button>` elements with the same `*ngIf="!userRole"` condition. Both appeared side-by-side for guest users, creating a duplicate accessible element and a confusing UI.

| Before | After |
|--------|-------|
| Two identical `Login to Apply` buttons, no `aria-label` | One `Sign In to Apply` button, `aria-label="Sign in to apply for this job"` |

**Fix:** Removed the duplicate. Remaining button uses `Sign In to Apply` with descriptive aria-label.

`toLogin()` correctly sets `returnURL` in localStorage and navigates to `/signin` — implementation unchanged.

### 3e. Employer Portal
No login/sign-in buttons found in any employer portal HTML template. Employer portal is gated behind auth — correct.

### 3f. Public Job List / Banner
No login/sign-in buttons in `job-posts-list.component.html` or `banner.component.html`. Public job list does not have an auth CTA — browsing is open.

---

## 4. Session-Expired State — Accessible CTA Audit

**Before:** No visible CTA rendered when session expired. The interceptor's snackbar fires, navigates to `/signin`, but if navigation failed or the user stayed on the route, the panel showed blank.

**After fix:** The `#profileLoadError` ng-template now shows:
- The safe message string from the store (e.g., "Your session has expired. Please sign in again.")
- A `<a routerLink="/signin">` styled as a button with class `gh-signin-cta` and `aria-label="Sign in to your account"`
- `role="alert"` + `aria-live="assertive"` on the banner container so screen readers announce the error immediately

The `gh-signin-cta` class is already defined in `applicant-profile-details.component.scss` with `focus-visible` outline and `@media (hover: none)` tap feedback — no additional CSS changes needed.

---

## 5. Retry Button Audit

The effects layer has no explicit retry mechanism — errors are terminal (the effect dispatches `getUserProfileFail` and stops). The generic error case ("We couldn't load your profile. Please try again.") implies a retry but no retry button is wired. A full retry button (dispatching `getUserProfile()` again) would require a method on the panel component — that is functional work beyond copy/aria scope.

**Recommendation (not applied this pass):** Add a retry method to `applicant-panel.component.ts` and wire a retry `<button>` in the `#profileLoadError` template for the generic error case. For 401/403, the interceptor already redirects; retry makes no sense there.

---

## 6. Files Modified

| File | Change |
|------|--------|
| `src/app/core/header/header.component.html` | `Login` → `Sign In` + `aria-label` |
| `src/app/auth/account-authentication/account-authentication.component.html` | 2x `Login` → `Sign In` + `aria-label`; body copy "login again" → "sign in again" |
| `src/app/auth/reset-password/reset-password.component.html` | `Back to Login` → `Back to Sign In` + `aria-label` |
| `src/app/jobs/job-posts-details/job-posts-details.component.html` | Remove duplicate button; `Login to Apply` → `Sign In to Apply` + `aria-label` |
| `src/app/applicant-panel/applicant-panel.component.ts` | Add `error$ = this.applicantFacade.error$` |
| `src/app/applicant-panel/applicant-panel.component.html` | Add `; else profileLoadError` + `<ng-template #profileLoadError>` with accessible error banner |

---

## 7. Not Changed (Out of Scope)

- `UnAuthorizedInterceptor` snackbar copy — security logic, not touched
- `auth.effects.ts` / `applicant.effects.ts` — no changes to error dispatch logic
- `redirectToRegister()` method name in header TS — functional rename, not copy/aria
- BE code — not in scope
- i18n translation files — `SIGNIN.LOGIN_TEXTBOX` key (used on the actual sign-in submit button) left as-is; translation value may read "Sign In" already
