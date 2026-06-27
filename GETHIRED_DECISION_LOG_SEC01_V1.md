# GETHIRED_DECISION_LOG_SEC01_V1
## Decision Log — SEC-01 BOLA/IDOR Fix Pass

**Mission:** GETHIRED_SEC_01_APPLICANT_USERPROFILE_BOLA_JWT_AUTHZ_FIX_P1_V1
**Date:** 2026-06-25
**Status:** COMPLETE — both repos committed

---

## What Was Fixed

### FIX-01 — BOLA/IDOR on GET /applicant/userprofile
**Severity:** High (OWASP A01 — Broken Object Level Authorization)
**File:** `get-hired-BE/controllers/applicantsController.js` — `getUserProfile`
**Commit:** BE `9173f0f`

**Pre-patch:** `const { id } = req.query` fed directly to `getUserProfileById(id)`. Any authenticated applicant could read any other applicant's full PII profile (name, email, phone, DOB, address, photo URL) by changing the `?id=` query parameter to any Firebase uid.

**Post-patch:**
- Controller reads `req.user.uid` (from Firebase JWT verified by verifyAuth middleware) — never touches query param for the DB call
- Mismatch guard: if `req.query.id` is present AND differs from `tokenUid` → HTTP 403 + security event log + DB call never made
- Information leakage on mismatch: zero — response body is a generic session message, no confirmation that the target uid exists

**Decision to keep mismatch guard (not just ignore query):** The guard catches any residual frontend or third-party callers still sending `?id=`. The log tag `[SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH]` allows alerting on automated IDOR scanning. Once monitoring confirms 0 mismatch events from legitimate sources, the guard can be simplified (see BACKLOG-10).

### FIX-02 — Frontend uid query param removed from call chain
**Files:** 5 FE files updated
**Commit:** FE `91caca0`

**Change:** `userProfile(userId: string)` → `userProfile()` across service, action, effect, facade, and component. The component no longer reads uid from localStorage and passes it to the API. The URL changed from `GET /applicant/userprofile?id=<uid>` to `GET /applicant/userprofile`.

**Decision to fix both ends:** Fixing only the backend provides the security guarantee, but leaving the FE sending the uid creates log noise (mismatch events for all legitimate users) and documents the insecure pattern as "still in use." Removing it from the FE closes the pattern completely and keeps logs meaningful.

### FIX-03 — Frontend error handling hardened
**File:** `get-hired-FE/src/app/applicant/state/applicant.effects.ts`

**Change:** HTTP error responses (401, 403, 404, generic) now map to safe, user-facing copy. No raw Firebase error text, no raw BE error text, no uids in messages.

---

## What Was Deferred

### DEFERRED-01 — /auth/logout uid Spoofing (BACKLOG-03)
**Severity assessed:** Medium (DoS / session interference)
**Why deferred:** Not a data disclosure vulnerability. Risk requires knowing the target's Firebase uid (possible from photoUrl or other surfaces, but not trivially available). Fixing correctly requires adding verifyAuth to the logout route, which touches auth flow — out of scope for a BOLA fix pass.
**Next action:** Fix in next SECURE pass (30 min, add verifyAuth to route, use req.user.uid).

### DEFERRED-02 — /jobs/details uid Boolean Disclosure (BACKLOG-04)
**Severity assessed:** Low (public endpoint, boolean only — whether uid X applied to job Y)
**Why deferred:** Low information value to an attacker. The job detail endpoint is intentionally public (no auth required for job details). The uid parameter is optional and only affects the `isApplied` boolean. Fixing it requires a conditional — if token is present use req.user.uid, else skip the isApplied check.
**Next action:** Fix in next SECURE pass (30 min).

### DEFERRED-03 — verifyRoles Middleware uid Source (BACKLOG-05)
**Severity assessed on investigation:** Not currently exploitable — confirmed dead code
**Findings:** `verifyRoles` is defined in `middleware/verifyRoles.js` but is NOT imported or used in any route file in the codebase (confirmed by grep across all .js files). The security concern is real but latent: if any developer wires `verifyRoles` to a route in future without fixing the uid source, privilege escalation would be possible.
**Decision:** Deferred from SEC-01 because the middleware is dead code with zero current attack surface. Classified as P1 debt (not P0) because exploitation requires a future code change to occur first.
**Prior documentation:** This risk is noted in `GETHIRED_ANTI_CORRUPTION_LAYER_GUIDE.md`, `GETHIRED_IDENTITY_AND_AUTHORIZATION_SEAMS.md`, `GETHIRED_ACTIONS_REPORT_RECENT_V2.md` (DEBT-03), and `GETHIRED_STITCH_REPORT.md` (R-04). It has been tracked across multiple passes.
**Recommended resolution:** Delete the file (`git rm middleware/verifyRoles.js`) or fix to `const uid = req.user?.uid` — either is a 15-minute task. Recommended to delete: it is dead code and in-place fix risks someone using the flawed pattern.

### DEFERRED-04 — /auth/archive userId Query Param Redundancy (BACKLOG-02)
**Severity assessed:** None (behavior is safe — userId is checked against req.user.uid, cannot be used to delete another account)
**Why deferred:** Pure hardening, no security risk. Remove userId from query and use req.user.uid directly — removes unnecessary surface but does not change security posture.

### DEFERRED-05 — verifyAuth Raw Firebase Error in 403 Catch-All (BACKLOG-06)
**Severity assessed:** Low (403 response with Firebase Error object body)
**Why deferred:** The FE catches all 403 responses and shows a safe generic message — the Firebase error object is never displayed. The risk is that the raw error is available to anyone with dev tools or curl. Fix is 1 line: `res.status(403).send("Authentication failed.")` instead of `res.status(403).send(error)`.

### DEFERRED-06 — getUserProfile 500 on Missing DB Record (BACKLOG-07)
**Severity assessed:** None (safe generic message already shown, 500 is an UX issue not a security issue)
**Why deferred:** The 500 produces a generic error response. The FE shows "We couldn't load your profile. Please try again." A 404 with profile-setup message would be better UX but this is not a security concern.

### DEFERRED-07 — Security Monitoring Integration (BACKLOG-08)
**Why deferred:** Requires external platform (Datadog, Papertrail, etc.) — operational setup outside code scope. The log tag is in place; alerting is an operational step.

### DEFERRED-08 — Rate Limiting on Profile Endpoint (BACKLOG-09)
**Why deferred:** No rate limiting exists anywhere in the BE (known prior finding). The mismatch guard ensures uid enumeration attempts get 403 with no data, but with no rate limiting an attacker can enumerate many uids cheaply. Fixing requires adding express-rate-limit globally or per-route — tracked as a separate Tier 1 item.

### DEFERRED-09 — Admin Profile Lookup Audit Logging (BACKLOG-01)
**Why deferred:** Intentional admin design pattern. The role check (role=1) correctly gates access. Audit logging per-admin-lookup is a hardening step, not a vulnerability fix. Deferred to a future admin-portal hardening pass.

### DEFERRED-10 — Legacy ?id= Query Param Removal (BACKLOG-10)
**Why deferred:** The mismatch guard is the mechanism that makes ?id= safe. Once monitoring confirms no mismatch events from legitimate callers (i.e., the FE patch fully propagated), the guard can be simplified: drop the mismatch branch, just use tokenUid with no query check. This is a cleanup step, not a security fix.

---

## Related Route Sweep: 11 Routes Audited

| Route | Finding | Action |
|---|---|---|
| GET /applicant/userprofile | BOLA — client uid used for profile lookup | FIXED (this pass) |
| GET /applicant/profile | Safe — uses req.user.uid | Pre-existing fix (prior BOLA pass) |
| GET /applicant/profile/completeness | Safe — uses req.user.uid | Pre-existing fix |
| GET /applicant/dashboard | Safe — uses req.user.uid | Pre-existing fix |
| POST /applicant/workexp + 5 others | Safe — req.user.uid + ownership WHERE clause | Pre-existing fix (QA8/9) |
| GET /admin/userprofile | Intentional admin lookup with role=1 check | Not fixed — intended design |
| DELETE /auth/archive | Safe — cross-check req.query.userId === req.user.uid | Hardening deferred (BACKLOG-02) |
| GET /auth/logout | Session interference risk — req.query.uid | Deferred (BACKLOG-03) |
| GET /jobs/details | Boolean info disclosure — req.query.uid | Deferred (BACKLOG-04) |
| GET /cv/getcv | Safe — ownership WHERE clause in query | Pre-existing fix (QA8) |
| verifyRoles middleware | Dead code with latent privilege escalation flaw | Deferred (BACKLOG-05) |

---

## Build and Release State

| Check | Result |
|---|---|
| BE commit | `9173f0f` on main |
| FE commit | `91caca0` on main |
| FE build | 0 errors, hash 6eddd5bc3bc26a9e |
| Release gate | 16/16 criteria PASS |
| Regression sweep | 11/11 checks PASS |
| Prod deployment | Not confirmed — verify prod sync before relying on fix in production |

---

## Severity Classifications Used

| Level | Meaning in this pass |
|---|---|
| P0 | Beta blocker — do not launch with real users until resolved |
| P1 | Fix before first external user — latent critical risk or keys in git |
| P2 | Fix within first week of internal testing |
| P3 | Fix before scale / public promotion |
| Low/Informational | Safe to ship, track and fix opportunistically |
