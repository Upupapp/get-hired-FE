# GetHired TEST Report — SEC-01 BOLA Fix
**Target:** SEC-01 BOLA / IDOR fix on `GET /applicant/userprofile`
**Date:** 2026-06-25
**Repos:** get-hired-BE (applicantsController.js) / get-hired-FE (applicant chain)

---

## Summary

| Check | Result |
|---|---|
| 1. `npm run build-dev` | PASS — exit 0, no errors |
| 2. TypeScript type chain alignment (no-arg pattern) | PASS with one caveat |
| 3. Mismatch guard covers all documented cases | PASS (discrepancy in case count spec vs code — see below) |
| 4. Only `getUserProfileById(tokenUid)` reaches the DB — no req.query.id fallback | PASS |
| 5. Effect error handler maps status codes to safe copy | PASS |

---

## Check 1 — Build (`npm run build-dev`)

**Result: PASS**

`ng build --configuration=staging` completed successfully.

- Exit code: **0**
- Warnings only: two autoprefixer `start` → `flex-start` warnings in `add-contact-group.component.scss` (pre-existing; unrelated to SEC-01)
- One CSS selector warning (`legend+*`) also pre-existing
- All applicant-panel, applicant-profile, and auth chunks compiled without error

---

## Check 2 — TypeScript Type Chain (no-arg pattern)

**Result: PASS with one caveat**

Traced the full call chain for the `getUserProfile` / `userProfile()` path:

| Layer | File | Signature | Correct? |
|---|---|---|---|
| Action | `applicant.actions.ts:190` | `createAction(…)` — no props | YES |
| Service | `applicant.service.ts:105` | `userProfile()` — no args, no `?id=` | YES |
| Effect | `applicant.effects.ts:291` | `mergeMap(() => this.applicantService.userProfile()` — no arg | YES |
| Facade | `applicant.facade.ts:76` | `getUser()` — no arg, dispatches `getUserProfile()` | YES |
| Component | `applicant-panel.component.ts:39` | `this.applicantFacade.getUser()` — no arg | YES |

All five layers are consistent with the no-arg pattern. No uid is passed at any point in the `userprofile` call chain.

**Caveat — separate `getApplicant()` method still has `?id=`:**

`applicant.service.ts:16–20` — the `getApplicant(userId: string)` method still sends `?id=${userId}` to `GET /applicant/profile`. This hits the separate `getApplicantProfileById` controller endpoint, not the SEC-01 `getUserProfile` endpoint. That endpoint has its own BOLA fix (derives `uid` from `req.user.uid` — see controller line 226). However the FE `getApplicant()` service method is still passing a caller-supplied `userId`, which means this secondary endpoint is still trusting a client-supplied id for routing. This is **out of scope for SEC-01** but flagged here as a residual BOLA risk on the `/applicant/profile` route.

---

## Check 3 — Mismatch Guard Logic

**Result: PASS — all documented cases correctly handled**

**Discrepancy in spec vs code:** The task spec references "7 cases" but `applicantsController.js` documents **6 cases** (Cases 1/2 combined as the upstream `verifyAuth` layer, Cases 3–6 in `getUserProfile` itself). No 7th case exists in the code or in the logic. The 6 documented cases are:

| Case | Description | Handling |
|---|---|---|
| 1 & 2 | No token / invalid token | Blocked upstream by `verifyAuth` middleware → 403 before `getUserProfile` is reached |
| 3 | Valid token, no `?id` query param | Falls through to `getUserProfileById(tokenUid)` — correct |
| 4 | Valid token, `?id` matches token uid | Guard condition `req.query.id !== tokenUid` is false → falls through — correct |
| 5 | Valid token, `?id` differs from token uid | Guard fires: logs redacted UIDs + `action=blocked`, returns 403 with safe message — correct |
| 6 | Profile not found | Error thrown by `getUserProfileById` is caught; returns generic 500-equivalent — correct |

Guard implementation audit (`controller lines 255–268`):

- Condition: `if (req.query.id && req.query.id !== tokenUid)` — correct; only triggers when query param is present AND differs
- Logging: redacts first 3 and last 3 chars of both UIDs with `***` in between — avoids leaking full identifiers to logs
- Response: returns 403 with `{ message: 'Unable to load profile for this session.' }` — safe, no information leakage
- No early return vulnerability: the `return` on the 403 path is correctly placed; the `try` block for `getUserProfileById` is unreachable after the 403

**No path exists where `req.query.id` can influence the DB query.** The mismatch guard blocks and returns before the `try` block; on all passing paths, `tokenUid` alone is passed to `getUserProfileById`.

---

## Check 4 — Single DB Call Path (no req.query.id fallback)

**Result: PASS**

In `getUserProfile` (controller lines 249–277):

1. `tokenUid = req.user.uid` — derived from JWT, not from request input
2. Mismatch guard fires → 403 (no DB call)
3. On clean path: `getUserProfileById(tokenUid)` — `tokenUid` is the only variable passed
4. `req.query.id` is **never** passed to any DB call or service helper in this function

`getUserProfileById` (`helpers/userDetails.js:28–38`) executes a single parameterized query:
```sql
SELECT * FROM <schema>.users WHERE uid = $1
```
with `$1 = uid` (the `tokenUid` from JWT). There is no fallback to `req.query.id` anywhere in this path.

---

## Check 5 — Effect Error Handler Maps Status Codes to Safe Copy

**Result: PASS**

`applicant.effects.ts:299–314` — the `catchError` block in the `user$` effect:

| HTTP Status | Safe Copy |
|---|---|
| `401` | `'Your session has expired. Please sign in again.'` |
| `403` | `"We couldn't load this profile for your current session."` |
| `404` | `"Let's finish setting up your profile."` |
| any other | `"We couldn't load your profile. Please try again."` |

All four branches return a `safeMessage` string (never the raw server error) via `getUserProfileFail({ payload: safeMessage })`. No raw error objects, stack traces, or server messages are exposed to the store or UI.

The 401/403/404 mapping matches the documented intent: 401 = session expired, 403 = session mismatch (the IDOR-attempt path), 404 = no profile yet (onboarding). The default case covers unexpected 5xx or network errors.

---

## Additional Observations (out of scope but flagged)

1. **`applicant.service.ts:16` `getApplicant(userId)` still sends `?id=`** — hits a different endpoint (`/applicant/profile`) that has a separate BOLA fix but the FE is still sending a client-supplied id. The BE endpoint already ignores it (reads from JWT), but the FE code is misleadingly still passing the param.

2. **`admin.service.ts:27`** — `userProfile(userId: string)` still sends `?id=${userId}` to the admin `userprofile` endpoint. This is a separate admin-panel BOLA issue unrelated to SEC-01 but the same class of vulnerability.

3. **`applicant-profile-details.component.ts`** — reads `localStorage.getItem('user')` and parses `._id` to set `this.userId` (line 20). This field is not used in any visible template binding or service call in the component, but `localStorage` identity is never authoritative — worth cleaning up.

4. **Build only, no runtime test.** This report covers static analysis and build verification. No live integration test was run against a backend instance.

---

## Verdict

SEC-01 fix is **correctly implemented** across all checked layers. The BOLA vector (client-supplied `?id` query param trusting) is closed on the `GET /applicant/userprofile` endpoint. Build is clean. Error handling is safe.
