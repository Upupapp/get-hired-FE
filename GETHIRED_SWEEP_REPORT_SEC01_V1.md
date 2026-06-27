# GetHired SEC-01 SWEEP Audit Report

**Date:** 2026-06-25
**Scope:** SEC-01 BOLA fix on GET /applicant/userprofile (BE + FE changes)
**Build status:** PASS (no errors, 2 pre-existing autoprefixer warnings unrelated to this change)

---

## 1. Security — BE (applicantsController.js)

**Result: PASS with one observation**

`getUserProfile` (GET /applicant/userprofile) correctly:
- Derives identity exclusively from `req.user.uid` (Firebase JWT via `verifyAuth` middleware)
- Blocks mismatch case: if `req.query.id` is supplied and differs from `tokenUid`, returns 403 and logs a redacted security event (`[SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH]`)
- Never returns data keyed to the supplied query param

All other handler functions in `applicantsController.js` derive identity from JWT (`req.user.uid`) or enforce ownership checks before acting on caller-supplied IDs. No other self-profile route trusts `req.query` for identity.

**Observation (out of SEC-01 scope, pre-existing):**
`adminController.js` `getUserProfile` still uses `req.query.id` to look up any user's profile. This is intentionally gated by a server-side role check (`callerRole !== ADMIN_ROLE` → 403), so it is a legitimate admin-only pattern, not a BOLA. Noted for completeness.

---

## 2. Security — FE remaining ?id= calls

**Result: PASS for userprofile; existing gap on /applicant/profile**

- `ApplicantService.userProfile()` correctly sends no query param: `GET /applicant/userprofile`
- `ApplicantService.getApplicant(userId)` still sends `?id=${userId}` to `GET /applicant/profile`. This endpoint (`getApplicantProfileById`) was already fixed in a prior SECURE pass to ignore the supplied id and use `req.user.uid` instead, so the param is sent but never trusted. The dead param is cosmetic noise; no BOLA risk.
- `admin.service.ts` `userProfile(userId)` still sends `?id=${userId}` to `GET /admin/userprofile` — admin route, intentionally role-gated as above.

---

## 3. NgRx Chain Integration

**Result: PASS**

The full action → effect → service → action chain for the user profile flow is intact:

- `getUserProfile` action (actions.ts line 190): no payload — correct, uid not needed
- `user$` effect (effects.ts line 289): dispatches on `getUserProfile`, calls `applicantService.userProfile()` with no args, maps response to `getUserProfileSuccess({ user })`, handles 401/403/404 with differentiated safe messages
- `ApplicantFacade.getUser()` (facade.ts line 76): dispatches `ApplicantAction.getUserProfile()` with no args — correct
- `ApplicantPanelComponent.ngOnInit()` (applicant-panel.component.ts line 39): calls `this.applicantFacade.getUser()` with no args — correctly removed the old `local._id` argument

No broken links. The uid is never passed through the NgRx chain.

---

## 4. Pre-existing Bug (not introduced by SEC-01)

**actions.ts — Duplicate action type string**

`applicantDashboard`, `applicantDashboardSuccess`, and `applicantDashboardFail` all use the same enum value `AllFeatureActionTypes.GetApplicantDashboard` as their type string. This means NgRx will match all three actions against any `ofType(applicantDashboard)` check. This is pre-existing, was not introduced by SEC-01, and the build does not error on it. It is a logic bug in the dashboard flow, not in the user-profile flow.

---

## 5. Unused Imports

**Result: Pre-existing, not introduced by SEC-01**

Both `applicant.actions.ts` and `applicant.facade.ts` import `* as InterviewModel` from `@main/interview/interview.model`. The import is only referenced inside commented-out code. TypeScript does not error on unused namespace imports (`import * as X`), so the build passes. This is cosmetic dead code from a prior refactor.

---

## 6. CSS / SCSS

**Result: PASS**

The task description references `applicant-profile-details.component.scss` as the file receiving 7 haptic effects. No file by that exact name exists in the repo. The closest match is `applicant-panel.component.scss`, which contains the full MOBILEVIEW motion system (drawer, scrim, hamburger, bottom nav, top bar). Audit of that file:

- Imports `src/assets/styles/motion` and `src/assets/styles/colors` — both are existing shared partials
- Uses `$motion-duration-micro`, `$motion-duration-drawer`, `$motion-ease-standard`, `$motion-ease-decelerate`, `$color-global-red-buttons`, `$color-global-gray-cancel`, `$color-global-sidebar-applicant-gray`, `$color-global-sidebar-applicant-route-active` — all are motion/color token variables, no literals
- `@include motion-safe` mixin present in multiple rules — reduces motion when `prefers-reduced-motion: reduce` applies
- No duplicate selectors detected
- `profile-details.component.scss` (under `profile-details/`) contains pre-SEC-01 styles only (no haptic effects) — confirms the new effects landed in `applicant-panel.component.scss`
- Build compiled all SCSS with no errors; 2 autoprefixer warnings (`start` vs `flex-start`) are in a pre-existing `add-contact-group` component, unrelated to SEC-01

---

## 7. Build Verification

```
npm run build-dev  →  ng build --configuration=staging
RESULT: SUCCESS (Time: 19338ms)
```

- No TypeScript errors
- No SCSS compilation errors
- 2 autoprefixer warnings (pre-existing, unrelated component)
- 1 CSS selector parse notice (`legend+*`) — pre-existing, no impact

---

## 8. Related Routes Audit — Other identity-from-query patterns

| Route | Controller | Pattern | Safe? |
|---|---|---|---|
| GET /admin/userprofile | adminController | `req.query.id` | Yes — admin role check gates it |
| GET /auth/getprofile | userController | `req.user.uid` | Yes — JWT only |
| GET /applicant/profile | applicantsController | `req.user.uid` | Yes — SECURE-fixed earlier |
| GET /applicant/userprofile | applicantsController | `req.user.uid` + mismatch guard | Yes — SEC-01 fix |
| DELETE /auth/deleteaccount | userController | `req.query.userId` checked against `req.user.uid` | Yes — ownership verified |

No other applicant self-profile routes trust `req.query` for identity without an ownership check.

---

## Summary

| Check | Status | Notes |
|---|---|---|
| BOLA: userprofile endpoint fixed | PASS | JWT-only, mismatch 403+log |
| No other self-profile query-trusting routes | PASS | All others JWT or ownership-gated |
| NgRx action/effect/facade chain | PASS | uid removed end-to-end |
| Unused imports | INFO | `InterviewModel` import pre-existing, not introduced |
| SCSS compilation | PASS | No errors; motion system tokens correct |
| Duplicate CSS selectors | PASS | None detected |
| Build (npm run build-dev) | PASS | Clean, 19.3s |
| Pre-existing bug (dashboard actions) | INFO | Duplicate action type string, pre-existing, unrelated to SEC-01 |

**No regressions introduced by SEC-01. Build is clean.**
