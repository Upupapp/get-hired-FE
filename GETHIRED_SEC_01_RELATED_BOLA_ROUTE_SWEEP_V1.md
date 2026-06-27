# GETHIRED_SEC_01_RELATED_BOLA_ROUTE_SWEEP_V1

**Mission:** Sweep related BE routes for similar BOLA patterns
**Date:** 2026-06-25

---

## Sweep Scope

Searched `get-hired-BE/controllers/` for: `req.query.uid`, `req.query.userId`, `req.query.applicantId`, `req.query.id`, `req.params.uid` — all patterns that could enable applicant horizontal privilege escalation.

---

## Route Findings

### 1. GET /applicant/userprofile — `getUserProfile` in applicantsController.js
**Status: FIXED (this mission)**
- Pre-patch: `const { id } = req.query` → fed directly to `getUserProfileById(id)`
- Post-patch: `const tokenUid = req.user.uid` → only token uid used

---

### 2. GET /applicant/profile — `getApplicantProfileById` in applicantsController.js
**Status: SELF-ROUTE SAFE (already fixed in prior BOLA pass)**
```js
const { uid } = req.user;  // ← correct, token only
const profile = await appplicantProfile(uid);
```
Comment in code: "SECURE fix (BOLA), found during the PROFILE re-run". No vulnerability.

---

### 3. GET /applicant/profile/completeness — `getApplicantProfileCompleteness` in applicantsController.js
**Status: SELF-ROUTE SAFE**
```js
const { uid } = req.user;  // ← correct, token only
const profile = await appplicantProfile(uid);
```
No client-supplied uid.

---

### 4. GET /applicant/dashboard — `getDashboard` in applicantsController.js
**Status: SELF-ROUTE SAFE**
```js
const { uid } = req.user;  // ← correct, token only
const userDetails = await getUserProfileById(uid);
```
No client-supplied uid.

---

### 5. POST /applicant/workexp, /educbg, /cert, /skills, /docs, PUT /savevideocv
**Status: SELF-ROUTE SAFE (already fixed in QA8/QA9 BOLA pass)**
All use `req.user.uid` + ownership check:
```js
SELECT 1 FROM applicants_profile WHERE applicant_profile_id=$1 AND user_id=$2
```
Where `$2 = req.user.uid`. No client-supplied uid.

---

### 6. GET /admin/userprofile — `getUserProfile` in adminController.js
**Status: ADMIN ROUTE WITH ROLE CHECK — INTENTIONAL DESIGN, NOT FIXED**
```js
const { id } = req.query;  // ← client-supplied, used for lookup
const callerRole = await getUserRoleById(req.user.uid);
if (callerRole !== ADMIN_ROLE) {
  return res.status(403).send("Forbidden");
}
const creds = await getUserProfileById(id);
```
The `id` query param is used for admin lookup of any user profile. This is an explicit admin feature — admins need to look up any user by id. The role check (`role === 1`) gates access. Classification: **admin route with proper role check**. This is an intended design pattern for admin tooling; it is NOT vulnerable to horizontal privilege escalation between regular applicants.

**Backlog note:** Admin lookup should ideally use a separate, more explicit admin controller with audit logging per lookup. See backlog document.

---

### 7. DELETE /auth/archive — `deleteAccountById` in userController.js
**Status: SELF-ROUTE SAFE — cross-check present**
```js
const { userId } = req.query;
if (userId !== req.user.uid) {
  return res.status(403).json({ message: "You don't have permission to do that." });
}
```
A user can only delete their own account. The client-supplied `userId` is checked against `req.user.uid`. This is safe — but could be simplified by just using `req.user.uid` directly (no need to accept userId from query at all). Documented in backlog as a hardening opportunity.

---

### 8. GET /auth/logout — `logout` in userController.js
**Status: LOW RISK — revokes another user's token, not data leak**
```js
const { uid } = req.query;
const revoke = await revokeTokenInFirebase(uid);
```
This calls `revokeTokenInFirebase(uid)` with a client-supplied uid. This does NOT expose data, but could allow one user to force-logout another user. **Risk:** Low-severity denial-of-service / session interference. The route is NOT behind verifyAuth (no auth token required to call it). Documented in backlog.

---

### 9. GET /jobs/details — `getJobDetails` in jobsController.js
**Status: SELF-ROUTE LOW RISK — applicant check is optional/informational**
```js
const { id, uid } = req.query;
if (uid) {
  const applied = await listOfJobAppliedByApplicant(uid);
  const filtered = applied.filter((item) => item.jobId == id);
  isApplied = filtered.length != 0;
}
const details = await jobDetails(id);
```
The `uid` is used to check IF the calling user has applied — a read of their own application status. Sending another user's uid would reveal whether that user applied to a specific job. Low-severity information disclosure (boolean). This is a public-facing job detail endpoint (no auth required for `details`). Documented in backlog.

---

### 10. CV endpoint — `getCvById` in cvController.js
**Status: SELF-ROUTE SAFE (already fixed in QA8 BOLA pass)**
```js
const { id } = req.query;  // cv_id, not uid
const searchQuery = `SELECT * from cv where cv_id = $1 AND user_id = $2;`;
await dbQuery.query(searchQuery, [id, req.user.uid]);  // ← ownership enforced
```
Owner check folds into the WHERE clause. No BOLA.

---

### 11. verifyRoles middleware — `get-hired-BE/middleware/verifyRoles.js`
**Status: UNKNOWN RISK — client-supplied uid used for role lookup**
```js
const uid = req.body.uid || req.query.uid;
const searchQuery = `SELECT uid, role FROM user_credentials where uid = $1;`;
```
This middleware reads uid from request body or query. If used on routes where an applicant can supply a spoofed uid matching an admin's uid, they could escalate privileges. **However:** The routes using `verifyRoles` must be audited to determine if this is exploitable. Not scoped to this SEC-01 fix. Documented in backlog as a separate investigation.

---

## Summary Table

| Route | Pattern | Classification | Fixed? |
|---|---|---|---|
| GET /applicant/userprofile | req.query.id → profile lookup | Self-route VULNERABLE | YES (this mission) |
| GET /applicant/profile | req.user.uid | Self-route SAFE | Pre-existing |
| GET /applicant/profile/completeness | req.user.uid | Self-route SAFE | Pre-existing |
| GET /applicant/dashboard | req.user.uid | Self-route SAFE | Pre-existing |
| POST /applicant/workexp etc. | req.user.uid + ownership check | Self-route SAFE | Pre-existing |
| GET /admin/userprofile | req.query.id + role=1 check | Admin route with role check | Not fixed (intended) |
| DELETE /auth/archive | req.query.userId == req.user.uid | Self-route SAFE (with check) | Backlog hardening |
| GET /auth/logout | req.query.uid → revoke | Low-risk session interference | Backlog |
| GET /jobs/details | req.query.uid → applied check | Low-risk info disclosure | Backlog |
| GET /cv/getcv | req.query.id + user_id=$2 | Self-route SAFE | Pre-existing |
| verifyRoles middleware | req.body.uid/req.query.uid | Unknown risk — needs audit | Backlog |
