# GETHIRED_SEC_01_TEST_LOG_V1

**Mission:** Test documentation for SEC-01 BOLA fix
**Date:** 2026-06-25
**Note:** Real HTTP requests cannot be executed in this environment. Tests are documented as static analysis / scenarios. Code is proven correct by reading the patch. Build verified: 0 errors.

---

## Test Environment Note

No test users can be created in this environment. No live Firebase tokens are available. All test scenarios below document what the test would do and provide static-analysis proof that the patch produces the correct behavior.

---

## Test Scenario 1 — Unauthenticated → 401/403

**Setup:** Call `GET /applicant/userprofile` with no `Authorization` header.

**Expected:** HTTP 403, body: `"Unauthorized"`

**Proof (static analysis):**
- `verifyAuth` middleware runs before `getUserProfile` (line 53 of applicationRoute.js)
- `validateFirebaseIdToken` checks `(!req.headers.authorization || !req.headers.authorization.startsWith("Bearer "))`
- If true → `res.status(403).send("Unauthorized")` → never reaches `getUserProfile`
- PASS (unchanged middleware behavior)

---

## Test Scenario 2 — User A own profile, no query → 200, own data

**Setup:** Call `GET /applicant/userprofile` with valid Firebase token for User A (uid="A"). No query params.

**Expected:** HTTP 200, profile data for User A.

**Proof (static analysis):**
```js
const tokenUid = req.user.uid;  // = "A"
// req.query.id is undefined → condition is false
if (req.query.id && req.query.id !== tokenUid) { /* skipped */ }
const creds = await getUserProfileById(tokenUid);  // getUserProfileById("A")
return res.status(200).json(successResponse(creds));
```
- DB query: `SELECT * FROM users WHERE uid = $1` with `$1 = "A"`
- Returns User A's profile only
- PASS

---

## Test Scenario 3 — User A with matching id query → 200, own data, token uid used

**Setup:** Call `GET /applicant/userprofile?id=A` with valid Firebase token for User A (uid="A").

**Expected:** HTTP 200, profile data for User A (token uid used, query has no effect on output).

**Proof (static analysis):**
```js
const tokenUid = req.user.uid;  // = "A"
if (req.query.id && req.query.id !== tokenUid) {
  // req.query.id = "A", tokenUid = "A" → "A" !== "A" is FALSE → skipped
}
const creds = await getUserProfileById(tokenUid);  // getUserProfileById("A")
```
- DB query uses `"A"` (from token), not from query
- Response is User A's profile
- PASS

---

## Test Scenario 4 — User A with mismatched id query (userB) → 403, no userB data

**Setup:** Call `GET /applicant/userprofile?id=B` with valid Firebase token for User A (uid="A").

**Expected:** HTTP 403, body: `{"message": "Unable to load profile for this session."}`, security event logged, NO profile data for User B returned.

**Proof (static analysis):**
```js
const tokenUid = req.user.uid;  // = "A"
if (req.query.id && req.query.id !== tokenUid) {
  // req.query.id = "B", tokenUid = "A" → "B" !== "A" is TRUE → enters block
  console.warn(`[SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH] ... authenticatedUid=A** suppliedId=B** action=blocked`);
  return res.status(403).json({ message: 'Unable to load profile for this session.' });
  // ← RETURNS HERE. getUserProfileById() is NEVER called. No DB query.
}
```
- User B's profile is never fetched
- Response contains no profile data
- Security event is logged
- PASS

---

## Test Scenario 5 — User A with alternate param names (userId=B, applicantId=B)

**Setup:** Call `GET /applicant/userprofile?userId=B` or `?applicantId=B` with valid Firebase token for User A.

**Expected:** HTTP 200, User A's own profile (alternate param names are not the IDOR vector here — only `?id=` was the bug, and only `?id=` is checked in the mismatch guard).

**Proof (static analysis):**
```js
// req.query.id is undefined (only userId= and applicantId= were sent)
if (req.query.id && req.query.id !== tokenUid) { /* req.query.id is falsy → skipped */ }
const creds = await getUserProfileById(tokenUid);  // uses token uid regardless
```
- `userId` and `applicantId` query params are completely ignored by the controller
- Token uid is used for the DB query
- User B's profile is never accessed
- PASS

---

## Test Scenario 6 — Invalid/expired token → 403

**Setup:** Call `GET /applicant/userprofile` with expired Firebase token.

**Expected:** HTTP 403, body: `"Token Expired. Login again."`

**Proof (static analysis):**
- `verifyAuth` middleware calls `verifyIdToken(idToken)` → throws `auth/id-token-expired`
- Catches: `if (error.code === "auth/id-token-expired") { res.status(403).send("Token Expired. Login again."); }`
- Never reaches `getUserProfile`
- PASS

---

## Test Scenario 7 — Valid token, no profile in DB → safe behavior

**Setup:** Call `GET /applicant/userprofile` with valid Firebase token for a user who has no record in `users` table.

**Expected:** Error response (500 equivalent), safe message, no crash.

**Proof (static analysis):**
```js
const creds = await getUserProfileById(tokenUid);
```
In `getUserProfileById`, if `rows[0]` is undefined, `userMap(undefined)` will throw a TypeError (cannot read property 'uid' of undefined). This is caught by:
```js
} catch (error) {
  console.error('[applicantsController] getUserProfile error:', error.message || error);
  return res.status(status.error).json(errorResponse("Operation not successful. Please try again."));
}
```
**Current behavior:** Returns 500 with generic error message. **Safe** — no raw error exposed to client. The FE effect maps this to "We couldn't load your profile. Please try again." via the generic `else` branch in the catchError handler.

**Improvement opportunity (backlog):** Backend could return 404 explicitly when profile not found, allowing FE to show "Let's finish setting up your profile." See backlog document.

---

## Test Scenario 8 — Response field safety — no unexpected sensitive fields

**Expected fields in response:** uid, firstName, middleName, lastName, createdDate, dateOfBirth, email, gender, phoneNumber, cellNumber, photoUrl, address, zip, city, isProfileUpdated, lastUpdate, addressB.

**Analysis:** The `userMap` function in `helpers/userDetails.js` only maps the fields listed above — it does NOT include: password hashes, Firebase token, raw DB row dump beyond the mapped fields. The `successResponse` wrapper does not add any extra fields. PASS.

---

## Frontend Error Handling Verification

**File:** `applicant/state/applicant.effects.ts` (post-patch)

| HTTP Status | Safe Message Shown | Correct? |
|---|---|---|
| 401 | "Your session has expired. Please sign in again." | YES |
| 403 | "We couldn't load this profile for your current session." | YES |
| 404 | "Let's finish setting up your profile." | YES |
| Other | "We couldn't load your profile. Please try again." | YES |

None of these messages include: raw Firebase error text, raw BE error text, uid values, token values, stack traces. PASS.

---

## Build Verification

`npm run build-dev` result: **SUCCESS — 0 errors**

```
Build at: 2026-06-25T14:30:34.495Z - Hash: 6eddd5bc3bc26a9e - Time: 34398ms
```

TypeScript types verified correct:
- `getUserProfile` action: no props → `createAction(type)` — no props parameter needed
- `userProfile()`: no param → called as `this.applicantService.userProfile()`
- `getUser()`: no param in facade → called as `this.applicantFacade.getUser()`
- `ApplicantPanelComponent`: calls `this.applicantFacade.getUser()` — no arg
