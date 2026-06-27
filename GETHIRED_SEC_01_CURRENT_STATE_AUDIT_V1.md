# GETHIRED_SEC_01_CURRENT_STATE_AUDIT_V1

**Mission:** BOLA/IDOR fix for GET /applicant/userprofile
**Date:** 2026-06-25
**Auditor:** SEC-01 execution pass

---

## 1. Vulnerable Endpoint

**File:** `get-hired-BE/controllers/applicantsController.js`
**Function:** `getUserProfile` (line 238 in pre-patch file)
**Route:** `GET /applicant/userprofile` (registered in `get-hired-BE/routes/applicationRoute.js` line 53)

### Exact Vulnerable Code (pre-patch)
```js
const getUserProfile = async (req, res) => {
  const { id } = req.query;       // ← VULNERABLE: reads id from client-supplied query
  try {
    const creds = await getUserProfileById(id);  // ← fetches profile for whatever id was sent
    return res.status(status.success).json(successResponse(creds));
  } catch (error) { ... }
};
```

**Attack vector:** Any authenticated applicant can call `GET /applicant/userprofile?id=<victim-uid>` and receive the victim's full user profile including name, email, phone, address, photo URL, DOB, etc.

---

## 2. Auth Middleware

**File:** `get-hired-BE/middleware/verifyAuth.js`
**Function:** `validateFirebaseIdToken`

**Trusted uid field:** `req.user.uid` (set at line 31: `req.user = decodedIdToken`)

The middleware:
1. Requires `Authorization: Bearer <token>` header OR `__session` cookie
2. Calls `firebaseAdmin.auth().verifyIdToken(idToken)`
3. Sets `req.user = decodedIdToken` — the full decoded Firebase token
4. Returns 403 for missing token (line 9) or expired token (line 36)

**Route uses verifyAuth:** YES — line 53 of applicationRoute.js: `router.get("/applicant/userprofile", verifyAuth, getUserProfile)`

---

## 3. DB Query That Reads the Profile

**File:** `get-hired-BE/helpers/userDetails.js`
**Function:** `getUserProfileById(uid)` (line 28)

```js
const getUserProfileById = async (uid) => {
  const searchQuery = `Select * from ${dbSchema}.users where uid = $1`;
  const { rows } = await dbQuery.query(searchQuery, [uid]);
  const dbResponse = userMap(rows[0]);
  return dbResponse;
};
```

**Fields returned** (via `userMap`): uid, firstName, middleName, lastName, createdDate, dateOfBirth, email, gender, phoneNumber, cellNumber, photoUrl, address, zip, city, isProfileUpdated, lastUpdate, addressB.

This is PII-rich — making the IDOR high-severity.

---

## 4. Frontend Service That Calls the Endpoint

**File:** `get-hired-FE/src/app/applicant/applicant.service.ts`
**Method (pre-patch):**
```ts
userProfile(userId: string) {
  return this.baseService.get<any>(`${this.applicantUrl}/userprofile?id=${userId}`);
}
```

**Call chain:**
1. `applicant-panel.component.ts:36` → `this.applicantFacade.getUser(this.local._id)` (reads uid from localStorage)
2. `applicant/state/applicant.facade.ts:75` → dispatches `ApplicantAction.getUserProfile({ userId })`
3. `applicant/state/applicant.effects.ts:288` → calls `this.applicantService.userProfile(action.userId)`
4. Service → `GET /applicant/userprofile?id=<userId>`

The `userId` value comes from `localStorage.getItem('user')._id`, which is a client-controlled value and therefore untrusted.

---

## 5. Response Shape

From `userMap()` in `helpers/userDetails.js`:
```json
{
  "uid": "firebase-uid",
  "firstName": "...",
  "middleName": "...",
  "lastName": "...",
  "createdDate": "...",
  "dateOfBirth": "...",
  "email": "...",
  "gender": "...",
  "phoneNumber": "...",
  "cellNumber": "...",
  "photoUrl": "...",
  "address": "...",
  "zip": "...",
  "city": "...",
  "isProfileUpdated": true,
  "lastUpdate": "...",
  "addressB": "..."
}
```

---

## 6. Existing Tests

No test files found for `getUserProfile` in `applicantsController.js`. Search confirmed no `*.spec.js` or `*.test.js` files exist in the BE matching this route or controller function.

---

## 7. Related Routes / Admin Variant

**Admin variant:** `GET /admin/userprofile` — `get-hired-BE/controllers/adminController.js`
- Also uses `req.query.id` BUT has a role check: `getUserRoleById(req.user.uid)` — only role=1 (admin) can proceed.
- This is an intentional admin lookup endpoint (different threat model).
- Not fixed here — documented in backlog.

**verifyRoles middleware:** `get-hired-BE/middleware/verifyRoles.js` line 19:
```js
const uid = req.body.uid || req.query.uid;
```
This middleware reads uid from request, not from token — but it is used for role verification, not profile data lookup. Documented in backlog sweep.
