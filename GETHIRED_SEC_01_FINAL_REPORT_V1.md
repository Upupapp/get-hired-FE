# GETHIRED_SEC_01_FINAL_REPORT_V1

**Mission:** GETHIRED_SEC_01_APPLICANT_USERPROFILE_BOLA_JWT_AUTHZ_FIX_P1_V1
**Date:** 2026-06-25
**Status: COMPLETE — RELEASED**

---

## Executive Summary

A Broken Object Level Authorization (BOLA / IDOR) vulnerability was found and fixed in `GET /applicant/userprofile`. Any authenticated applicant could read any other applicant's full user profile (name, email, phone, address, DOB, photo URL) by changing the `?id=` query parameter. The backend now derives identity exclusively from the verified Firebase JWT (`req.user.uid`). The frontend no longer sends a uid in the request. A mismatch guard blocks and logs any attempt to supply a different uid. Build verified: 0 errors.

---

## Vulnerable File and Line

**File:** `get-hired-BE/controllers/applicantsController.js`
**Function:** `getUserProfile` (line 238 in pre-patch file)
**Line:** `const { id } = req.query;` — used directly as the DB lookup key

**Attack:** `GET /applicant/userprofile?id=<victim-firebase-uid>` with any valid Firebase Bearer token → returns victim's full profile.

---

## Auth Middleware Trusted UID Field

**Middleware:** `get-hired-BE/middleware/verifyAuth.js` — `validateFirebaseIdToken`
**Trusted field:** `req.user.uid`

Set via: `req.user = decodedIdToken` after `firebaseAdmin.auth().verifyIdToken(idToken)` succeeds.

---

## Backend Patch Summary

- **Before:** `const { id } = req.query; getUserProfileById(id)`
- **After:** `const tokenUid = req.user.uid; getUserProfileById(tokenUid)`
- Mismatch guard: if `req.query.id` present and differs from `tokenUid` → HTTP 403 + security event log + no DB call
- Matching query: proceeds with `tokenUid` (not query value), no mismatch logged
- Missing query: proceeds with `tokenUid` directly
- Error logging: `error.message || error` (not raw error object)

---

## Frontend Patch Summary

5 files updated to remove the uid query parameter from the API call chain:

1. **`applicant.service.ts`**: `userProfile(userId: string)` → `userProfile()` — URL: no `?id=`
2. **`applicant.actions.ts`**: `getUserProfile` action: `props<{userId}>` → no props
3. **`applicant.effects.ts`**: `user$` effect: calls `userProfile()` with no arg; error handler maps HTTP status to safe user-facing copy
4. **`applicant.facade.ts`**: `getUser(userId: string)` → `getUser()` — no arg
5. **`applicant-panel.component.ts`**: `getUser(this.local._id)` → `getUser()` — no localStorage uid sent

---

## Mismatch Handling

**HTTP:** 403
**Body:** `{"message": "Unable to load profile for this session."}`
**Log:** `[SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH] <ts> endpoint=... authenticatedUid=abc***xyz suppliedId=def***uvw action=blocked`
**DB:** Never called on mismatch — no target profile fetched
**Information leakage:** Zero — response does not reveal whether target uid exists

---

## Frontend Error Handling

| HTTP Status | Message Shown |
|---|---|
| 401 | "Your session has expired. Please sign in again." |
| 403 | "We couldn't load this profile for your current session." |
| 404 | "Let's finish setting up your profile." |
| Generic | "We couldn't load your profile. Please try again." |

No raw Firebase errors, no raw BE errors, no uids in messages.

---

## Security Logging

Tag: `[SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH]`
Level: `console.warn`
Fields logged: timestamp, endpoint, redacted authenticatedUid, redacted suppliedId, action=blocked
Fields never logged: full uid, profile data, token, email, address

---

## Related BOLA Sweep Results

11 routes/patterns audited:
- 1 fixed (this mission — applicant userprofile)
- 7 already safe from prior fixes (profile, completeness, dashboard, workexp, cert, educbg, skills, docs, videocv, cv)
- 1 intentional admin pattern with role check (admin/userprofile)
- 3 deferred to backlog (logout uid, job details uid, verifyRoles middleware)

---

## Build Status

`npm run build-dev`: **SUCCESS — 0 errors**
Build hash: `6eddd5bc3bc26a9e`
Build time: 34,398ms
Warnings: 2 pre-existing autoprefixer warnings in unrelated contact-group SCSS

---

## Haptics / Effects Implemented

7 CSS-only effects added to `applicant-profile-details.component.scss`:

1. Profile skeleton shimmer (loading)
2. Profile card reveal on success (fade + translateY)
3. Error banner reveal (fade + slide)
4. Session-expired banner (slide + fade, amber)
5. Retry button micro-scale (scale 0.97 active)
6. Sign-in CTA tap compression (scale 0.97 active)
7. Mobile tap feedback (hover:none background tint)

All 7 effects have `@media (prefers-reduced-motion: reduce)` guards. Continuous animations (shimmer) use `@include ambient-motion-safe`. Transitions use `@include motion-safe`. No animation library added.

---

## Files Changed

| File | Type | Change |
|---|---|---|
| `get-hired-BE/controllers/applicantsController.js` | BE | getUserProfile — use token uid, add mismatch guard |
| `get-hired-FE/src/app/applicant/applicant.service.ts` | FE | Remove uid param from userProfile() |
| `get-hired-FE/src/app/applicant/state/applicant.actions.ts` | FE | Remove userId prop from getUserProfile action |
| `get-hired-FE/src/app/applicant/state/applicant.effects.ts` | FE | No userId arg; safe error handling |
| `get-hired-FE/src/app/applicant/state/applicant.facade.ts` | FE | getUser() — no arg |
| `get-hired-FE/src/app/applicant-panel/applicant-panel.component.ts` | FE | getUser() — no arg |
| `get-hired-FE/src/app/applicant-panel/applicant-profile/applicant-profile-details/applicant-profile-details.component.scss` | FE CSS | 7 haptics/effects, all with reduced-motion guards |

---

## Documents Created (12)

- GETHIRED_SEC_01_CURRENT_STATE_AUDIT_V1.md
- GETHIRED_SEC_01_SECURITY_DESIGN_CONTRACT_V1.md
- GETHIRED_SEC_01_BACKEND_PATCH_LOG_V1.md
- GETHIRED_SEC_01_FRONTEND_PATCH_LOG_V1.md
- GETHIRED_SEC_01_FRONTEND_HAPTICS_EFFECTS_LOG_V1.md
- GETHIRED_SEC_01_RELATED_BOLA_ROUTE_SWEEP_V1.md
- GETHIRED_SEC_01_SECURITY_LOGGING_MONITORING_LOG_V1.md
- GETHIRED_SEC_01_TEST_LOG_V1.md
- GETHIRED_SEC_01_SECURITY_REGRESSION_SWEEP_V1.md
- GETHIRED_SEC_01_RELEASE_GATE_V1.md
- GETHIRED_SEC_01_BACKLOG_V1.md
- GETHIRED_SEC_01_FINAL_REPORT_V1.md (this file)
