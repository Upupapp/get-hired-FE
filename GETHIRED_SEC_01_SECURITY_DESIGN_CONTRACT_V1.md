# GETHIRED_SEC_01_SECURITY_DESIGN_CONTRACT_V1

**Mission:** BOLA/IDOR fix for GET /applicant/userprofile
**Date:** 2026-06-25

---

## 1. Trusted Identity Source

**Exact field path:** `req.user.uid`

This field is set by the `validateFirebaseIdToken` middleware in `get-hired-BE/middleware/verifyAuth.js` after successfully calling `firebaseAdmin.auth().verifyIdToken(idToken)`. It cannot be spoofed from the client because it is derived from the cryptographically-verified Firebase ID token.

---

## 2. Forbidden Identity Sources

The following MUST NOT be used to select which profile is returned:

| Source | Why Forbidden |
|---|---|
| `req.query.uid` | Client-controlled — IDOR vector |
| `req.query.id` | Client-controlled — IDOR vector (the actual bug found) |
| `req.query.userId` | Client-controlled — IDOR vector |
| `req.query.applicantId` | Client-controlled — IDOR vector |
| `req.params.uid` | Client-controlled — IDOR vector |
| `req.body.uid` | Client-controlled — IDOR vector |
| `localStorage` value (FE) | Client-controlled, can be tampered |
| Frontend role claim | Client-controlled, unverified |

---

## 3. Route Behavior Matrix — All 7 Cases

| Case | Condition | HTTP Status | Response | Notes |
|---|---|---|---|---|
| 1 | No Authorization token | 403 | "Unauthorized" | Handled by verifyAuth middleware before controller |
| 2 | Invalid or expired token | 403 | "Token Expired. Login again." or error string | Handled by verifyAuth middleware |
| 3 | Valid token, no id query | 200 | Own profile data | Controller uses `req.user.uid` |
| 4 | Valid token, `?id=` matches token uid | 200 | Own profile data | Controller uses `req.user.uid`, query ignored |
| 5 | Valid token, `?id=` MISMATCHED uid | 403 | `{"message": "Unable to load profile for this session."}` | Security event logged; no target profile data returned |
| 6 | Valid token, no profile found in DB | 500 error path | Error response | `getUserProfileById` throws if `rows[0]` undefined; handled by catch |
| 7 | Valid token, wrong role (future) | N/A | N/A | Applicant self-profile has no role restriction currently |

---

## 4. Mismatch Policy

When `req.query.id` is present AND differs from `req.user.uid`:

1. Return HTTP 403 immediately
2. Response body: `{"message": "Unable to load profile for this session."}`
3. Log security event (see Section 6)
4. DO NOT call `getUserProfileById` — no DB query for the target uid
5. DO NOT reveal whether the supplied id exists in the database
6. DO NOT return any profile data, even partial

---

## 5. Frontend Compatibility Policy

The frontend action `getUserProfile` previously carried `{ userId: string }` and the service sent `?id=userId`.

**After fix:**
- Action: no payload (`createAction(type)` — no props)
- Service: `userProfile()` — no param, no query string
- Effect: dispatches no uid, handles errors by HTTP status code
- Component: calls `facade.getUser()` with no arg
- No URL change to other endpoints

All existing profile EDIT, CV upload, workexp, educbg, certifications, skills, documents, video endpoints are UNAFFECTED — they were already using `req.user.uid` or ownership checks.

---

## 6. Logging Policy

**Logged on mismatch (Case 5):**
- Timestamp (ISO 8601)
- Endpoint identifier
- Authenticated uid (first 3 + last 3 chars, middle replaced with `***`)
- Supplied id (same redaction)
- Action: "blocked"
- Log level: `console.warn`
- Log tag: `[SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH]`

**Never logged:**
- Full uid (token or supplied)
- Profile data (name, email, address, phone, photo)
- Raw Firebase token or token claims beyond uid
- Any CV or document content

---

## 7. Acceptance Criteria

- [x] `req.user.uid` is the ONLY selector for the DB query
- [x] `req.query.id` cannot select a different profile
- [x] Mismatched id → 403, no data, security event
- [x] No uid in frontend URL
- [x] 401/403/404 handled with safe user-friendly copy
- [x] No raw error, raw token, or raw Firebase error exposed to client
