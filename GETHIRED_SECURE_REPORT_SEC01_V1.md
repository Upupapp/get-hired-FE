# GetHired SEC-01 BOLA Fix — Security Verification Report
**Endpoint:** GET /applicant/userprofile  
**Controller:** `get-hired-BE/controllers/applicantsController.js` → `getUserProfile`  
**Date:** 2026-06-25  
**Reviewer:** Claude Code automated security verification

---

## Executive Summary

The SEC-01 fix is **correctly implemented and effective** for its primary target. The mismatch guard, redacted logging, and exclusive use of `tokenUid` for the DB call are all in place. Two additional findings were uncovered: a **P1** in `verifyRoles` middleware (uses client-supplied uid as the DB lookup key, never applied to applicant routes), and a **P2** in `deleteApplication` (applicationId-level IDOR with no pre-check, though candidateId ownership is enforced in the WHERE clause). No other paths bypass the guard in `getUserProfile`.

---

## CHECK 1 — getUserProfile: token-exclusive uid, no DB call on mismatch

**Status: PASS**

Lines 249–277 of `applicantsController.js`:

```js
const getUserProfile = async (req, res) => {
  const tokenUid = req.user.uid;                          // ← always from verified JWT

  if (req.query.id && req.query.id !== tokenUid) {        // ← mismatch guard
    // ... log, then:
    return res.status(403).json({ message: 'Unable to load profile for this session.' });
    // ← returns here — NO DB call on mismatch
  }

  try {
    const creds = await getUserProfileById(tokenUid);     // ← only tokenUid reaches DB
    return res.status(status.success).json(successResponse(creds));
  }
  ...
};
```

Execution paths:

| Case | Condition | Outcome |
|------|-----------|---------|
| No token / invalid token | Rejected by verifyAuth upstream | 403, controller never reached |
| Valid token, no query | Guard skipped (falsy `req.query.id`) | DB called with tokenUid ✓ |
| Valid token, matching query | Guard condition false | DB called with tokenUid ✓ |
| Valid token, mismatched query | Guard fires | 403 returned, NO DB call ✓ |

`req.query.id` is never used as a DB selector. The original BOLA vector is fully closed.

---

## CHECK 2 — verifyAuth middleware confirmed in route chain

**Status: PASS**

`get-hired-BE/routes/applicationRoute.js`, line 53:

```js
router.get("/applicant/userprofile", verifyAuth, getUserProfile);
```

`verifyAuth` (`middleware/verifyAuth.js`) calls `firebaseAdmin.auth().verifyIdToken(idToken)` and sets `req.user = decodedIdToken`. If the token is missing or invalid, it returns 403 before the controller is called. `req.user` (and therefore `req.user.uid`) is guaranteed to be the Firebase-verified decoded token by the time `getUserProfile` executes.

---

## CHECK 3 — 403 response: information leakage

**Status: PASS — no leakage**

The 403 response body on mismatch is:

```json
{ "message": "Unable to load profile for this session." }
```

This reveals nothing about:
- Whether the supplied `id` exists in the database
- Whether the authenticated user has a profile
- The authenticated user's uid
- Any profile data

The generic message is appropriate and does not enumerate users.

---

## CHECK 4 — Security log: uid/PII redaction

**Status: PASS — both UIDs redacted**

Log line (lines 257–266):

```js
const redactUid = (u) => (typeof u === 'string' && u.length > 6)
  ? u.slice(0, 3) + '***' + u.slice(-3)
  : '***';
console.warn(
  `[SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH] ${ts} ` +
  `endpoint=GET /applicant/userprofile ` +
  `authenticatedUid=${redactUid(tokenUid)} ` +   // ← e.g. "abc***xyz"
  `suppliedId=${redactUid(req.query.id)} ` +      // ← e.g. "def***uvw"
  `action=blocked`
);
```

Both the authenticated uid and the attacker-supplied id are redacted to first-3 + last-3 characters. Profile data, email, full token, and existence information are not logged. No raw uid or PII appears in the log line.

Minor note: if a uid is 6 characters or fewer, `redactUid` returns `'***'` (full redaction) which is safe but loses the first/last hint — acceptable.

---

## CHECK 5 — Alternate parameter bypass (req.query.userId, req.body.id, etc.)

**Status: PASS — no bypass path exists**

The guard only checks `req.query.id`. This is correct because:

1. The DB call exclusively uses `tokenUid` regardless of any other parameter.
2. Even if a caller sends `req.query.userId`, `req.body.id`, or `req.params.id`, none of these are read by `getUserProfile` at all. They are silently ignored.
3. The guard exists only to detect and log IDOR attempts via the known `?id=` vector (the original frontend pattern). Any other parameter names simply fall through to the always-safe `getUserProfileById(tokenUid)` call.

There is no bypass via alternate parameter names.

---

## CHECK 6 — SQL injection in getUserProfileById(tokenUid)

**Status: PASS — parameterized query**

`get-hired-BE/helpers/userDetails.js`, lines 28–37:

```js
const getUserProfileById = async (uid) => {
  const searchQuery = `Select * from ${dbSchema}.users where uid = $1`;
  const { rows } = await dbQuery.query(searchQuery, [uid]);
  ...
};
```

`tokenUid` is passed as `$1` — a PostgreSQL parameterized placeholder. The value is never string-interpolated into the query. SQL injection via the uid parameter is not possible. `dbSchema` is sourced from `env.schema` (server-side environment variable), not from any request input.

---

## CHECK 7 — verifyRoles middleware: uid source analysis

**Status: P1 FINDING (not currently exploitable, but latent)**

`get-hired-BE/middleware/verifyRoles.js`, lines 18–19:

```js
const verifyRoles = (allowedRoles) => async(req, res, next) => {
    const uid = req.body.uid || req.query.uid;   // ← CLIENT-SUPPLIED uid
```

`verifyRoles` derives the uid to look up from `req.body.uid` or `req.query.uid` — both client-controlled values — instead of `req.user.uid` (the verified JWT uid set by `verifyAuth`).

**Current exposure:** Searching every route file for `verifyRoles` usage returns **zero results** — the middleware is imported only in its own definition file and is never actually applied to any route. It is dead code. There is no immediate exploitability.

**Risk if it were applied:** Any route using `verifyRoles(allowedRoles)` would be vulnerable to privilege escalation — a low-privilege attacker could supply the uid of an admin user in `req.body.uid`, causing the role lookup to retrieve the admin's role and grant access. This is a **latent P1** that becomes a P0 the moment any route adopts this middleware.

**Recommended action:** Fix `verifyRoles` to use `req.user.uid` before this middleware is deployed to any route. See recommended fix below.

---

## CHECK 8 — Remaining client-supplied ID use in applicantsController.js

**Status: 1 finding (P2)**

All profile-mutation endpoints (`saveWorkExp`, `saveEducBg`, `saveCert`, `saveSkillsArray`, `saveDocuments`, `saveVideoCV`) correctly perform an ownership pre-check via:

```js
SELECT 1 FROM applicants_profile WHERE applicant_profile_id=$1 AND user_id=$2
```

where `$2` is `req.user.uid`. These are clean.

**`deleteApplication` (lines 62–78) — P2:**

```js
const deleteApplication = async (req, res) => {
  const { applicationId } = req.body;   // ← client-supplied application ID
  const candidateId = req.user.uid;

  const deleteQuery = `DELETE FROM application WHERE application_id=$1 AND candidate_id=$2`;
  await dbQuery.query(deleteQuery, [applicationId, candidateId]);
```

The DELETE is anchored to `AND candidate_id=$2` (the JWT uid), so a caller cannot delete another user's application — the WHERE clause acts as an implicit ownership check. However, there is no pre-check that `applicationId` exists and belongs to this user _before_ issuing the DELETE. An attacker can brute-force-probe application IDs by issuing DELETE requests and observing whether applications disappear (the API returns the remaining application list either way). This is an application-ID enumeration / data-integrity risk, not a data-read BOLA.

**`updateApplication` (lines 80–110) — same pattern, same P2 classification.**

Both are lower severity than SEC-01 because no data is _read_ from another user's record, but they warrant an explicit ownership pre-check for defense-in-depth.

---

## Findings Summary

| ID | Severity | Location | Description | Status |
|----|----------|----------|-------------|--------|
| SEC-01 | CLOSED | `applicantsController.getUserProfile` | BOLA/IDOR via `?id=` query param | Fixed ✓ |
| SEC-07 | **P1** | `middleware/verifyRoles.js:19` | uid sourced from `req.body.uid\|req.query.uid` instead of `req.user.uid`; latent privilege escalation if deployed to any route | Not exploitable now (dead code); fix before use |
| SEC-08 | **P2** | `applicantsController.deleteApplication` (line 68) | No pre-check confirming `applicationId` belongs to caller before DELETE; WHERE clause limits damage but allows ID enumeration via delete-probe | Partial mitigation; add pre-check |
| SEC-09 | **P2** | `applicantsController.updateApplication` (line 81) | Same pattern as SEC-08 for UPDATE | Partial mitigation; add pre-check |
| NOTE-01 | INFO | `adminController.getUserProfile` | Accepts caller-supplied `req.query.id` to look up any user profile, guarded by server-side role check (`callerRole !== ADMIN_ROLE`). Legitimate admin use case; guard is correct. | Acceptable; monitor for role escalation |

---

## Recommended Fixes

### SEC-07 (P1) — Fix verifyRoles uid source
```js
// middleware/verifyRoles.js — BEFORE (vulnerable)
const uid = req.body.uid || req.query.uid;

// AFTER (fixed) — always use verified JWT uid
const uid = req.user?.uid;
if (!uid) {
  return res.status(403).json(errorResponse('Authentication required'));
}
```
Note: `verifyRoles` must always be placed _after_ `verifyAuth` in the middleware chain.

### SEC-08 / SEC-09 (P2) — Add ownership pre-check in deleteApplication / updateApplication
```js
// Add before the DELETE/UPDATE query:
const ownerCheck = await dbQuery.query(
  `SELECT 1 FROM ${dbSchema}.application WHERE application_id=$1 AND candidate_id=$2`,
  [applicationId, candidateId]
);
if (!ownerCheck.rows || ownerCheck.rows.length === 0) {
  return res.status(403).json({ message: "You don't have permission to do that." });
}
```

---

## Conclusion

**SEC-01 is verified closed.** The `getUserProfile` function correctly:
- Derives identity exclusively from `req.user.uid` (Firebase-verified JWT)
- Blocks and logs any `?id=` mismatch before making any DB call
- Returns a non-leaking 403 message
- Uses only redacted UIDs in the security log
- Passes the parameterized query check

Two additional findings require attention before the next deployment: **SEC-07** (fix `verifyRoles` before deploying it to any route — it is currently dead but unsafe) and **SEC-08/09** (add pre-checks to `deleteApplication`/`updateApplication` for defense-in-depth).
