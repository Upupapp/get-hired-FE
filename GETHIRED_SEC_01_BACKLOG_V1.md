# GETHIRED_SEC_01_BACKLOG_V1

**Mission:** Deferred items from SEC-01 BOLA fix pass
**Date:** 2026-06-25

---

## BACKLOG-01 — Admin Profile Lookup Separation

**Context:** `GET /admin/userprofile` currently uses `req.query.id` + role=1 check. This is an intended design (admin needs to look up any user). However, admin lookup operations should be:
1. Logged with the admin's uid + lookup target uid + timestamp (audit trail)
2. Rate-limited to prevent bulk extraction
3. Potentially restricted to specific admin sub-roles if roles are added

**Priority:** Medium
**Risk:** Low (role check already gates access)
**Action:** Add per-lookup audit logging in `adminController.js:getUserProfile`. Consider a separate `GET /admin/user/lookup?id=` endpoint with stricter controls.

---

## BACKLOG-02 — /auth/archive uid Redundancy Hardening

**Context:** `deleteAccountById` in `userController.js` accepts `req.query.userId` and checks `userId !== req.user.uid`. This is safe but unnecessarily exposes the uid in the URL.

**Recommendation:** Remove `userId` from query; use `req.user.uid` directly. The comparison is redundant once the query param is removed.

**Priority:** Low
**Risk:** None (behavior unchanged)

---

## BACKLOG-03 — /auth/logout uid Spoofing (Session Interference)

**Context:** `logout` in `userController.js` calls `revokeTokenInFirebase(uid)` with a client-supplied `req.query.uid`. Route is NOT behind verifyAuth. An unauthenticated or authenticated attacker can force-logout any user by sending their uid.

**Recommendation:** Either:
a. Put the route behind `verifyAuth` and use `req.user.uid` only, OR
b. Remove the uid param entirely and derive from session

**Priority:** Medium
**Severity:** Denial of Service (session disruption)

---

## BACKLOG-04 — /jobs/details uid Boolean Disclosure

**Context:** `getJobDetails` in `jobsController.js` accepts `req.query.uid` to check if the caller applied to a job. If a different uid is passed, it reveals whether that uid applied to the job (boolean).

**Recommendation:** Derive uid from `req.user.uid` (if token present) rather than query param for the `isApplied` check.

**Priority:** Low
**Severity:** Low information disclosure (boolean only, public job endpoint)

---

## BACKLOG-05 — verifyRoles Middleware uid Source Audit

**Context:** `get-hired-BE/middleware/verifyRoles.js` reads `uid = req.body.uid || req.query.uid` from client input for role lookup. Routes using this middleware must be audited: if a caller can supply an admin uid as `body.uid` or `query.uid`, they may be able to pass the role check as admin.

**Recommendation:** Audit all routes using `verifyRoles` to determine which use it alongside `verifyAuth`. If `verifyAuth` runs first and sets `req.user.uid`, `verifyRoles` should read `req.user.uid`, not client-supplied body/query.

**Priority:** High — needs investigation
**Severity:** Potentially critical if privilege escalation is possible

---

## BACKLOG-06 — verifyAuth: Raw Firebase Error Sent to Client

**Context:** `verifyAuth` middleware line 39: `res.status(403).send(error)` — sends the raw Firebase error object in the catch-all.

**Recommendation:** Replace with `res.status(403).send("Authentication failed.")` to avoid leaking Firebase internal error details.

**Priority:** Low (403 response, but message could reveal implementation details)

---

## BACKLOG-07 — getUserProfile 404 Handling

**Context:** When a valid token holder has no record in the `users` table, `getUserProfileById` throws because `userMap(undefined)` crashes. This produces a 500. The frontend effect maps this to the generic "We couldn't load your profile" message.

**Recommendation:** In `getUserProfileById`, check `rows.length === 0` and throw a distinct error (or return null), then in the controller, detect the null/not-found case and return 404 explicitly. The FE would then show "Let's finish setting up your profile."

**Priority:** Low (safe generic message already shown, 500 is ugly but not a security issue)

---

## BACKLOG-08 — Security Monitoring Integration

**Context:** Mismatch events log to `console.warn` with tag `[SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH]`. This is grep-able but not alertable without a log aggregation platform.

**Recommendation:** Integrate with a log aggregation service (Datadog, Papertrail, Loggly, etc.) and create an alert rule on the tag. A burst of mismatch events is a strong indicator of automated IDOR scanning.

**Priority:** Medium (operational security)

---

## BACKLOG-09 — Rate Limiting on Mismatch Events

**Context:** An attacker could enumerate uids by repeatedly calling the endpoint with different `?id=` values. Each gets 403, no data, and a log entry. With no rate limiting anywhere in the BE, this is cheap.

**Recommendation:** Add `express-rate-limit` per-IP on the applicant userprofile endpoint (or globally). See existing note: no rate-limiting middleware exists anywhere in the BE.

**Priority:** High (referenced in prior GetHired security notes)

---

## BACKLOG-10 — Consider Removing Legacy id Query Acceptance

**Context:** Post-patch, the backend accepts `?id=` but ignores it if it matches the token uid. This creates a "degenerate case" (Cases 3 and 4) that could be simplified: just ignore any `?id=` entirely and only use token uid, with no mismatch logic needed. This would simplify the guard to a deprecation warning only.

**Current decision:** Keep the mismatch guard for now to detect any residual frontend callers that still send `?id=`. Once confirmed clean, remove the guard and simply use `req.user.uid` without any query param check.

**Priority:** Low (future cleanup after monitoring confirms no mismatch events from legitimate callers)
