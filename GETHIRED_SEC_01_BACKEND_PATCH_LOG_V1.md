# GETHIRED_SEC_01_BACKEND_PATCH_LOG_V1

**Mission:** BOLA/IDOR fix for GET /applicant/userprofile — Backend Patch
**Date:** 2026-06-25

---

## File Changed

`get-hired-BE/controllers/applicantsController.js` — function `getUserProfile`

---

## What Was Changed

### Before (vulnerable)
```js
const getUserProfile = async (req, res) => {
  const { id } = req.query;   // ← reads client-supplied id
  try {
    const creds = await getUserProfileById(id);   // ← fetches ANY user's profile
    return res.status(status.success).json(successResponse(creds));
  } catch (error) {
    console.error('[applicantsController] error:', error);
    return res.status(status.error).json(errorResponse("Operation not successful. Please try again."));
  }
};
```

### After (secure)
```js
const getUserProfile = async (req, res) => {
  const tokenUid = req.user.uid;   // ← from verified Firebase JWT only

  // Case 5: IDOR attempt — supplied id differs from token uid
  if (req.query.id && req.query.id !== tokenUid) {
    const ts = new Date().toISOString();
    const redactUid = (u) => (typeof u === 'string' && u.length > 6)
      ? u.slice(0, 3) + '***' + u.slice(-3)
      : '***';
    console.warn(
      `[SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH] ${ts} ` +
      `endpoint=GET /applicant/userprofile ` +
      `authenticatedUid=${redactUid(tokenUid)} ` +
      `suppliedId=${redactUid(req.query.id)} ` +
      `action=blocked`
    );
    return res.status(403).json({ message: 'Unable to load profile for this session.' });
  }

  try {
    const creds = await getUserProfileById(tokenUid);  // ← always uses token uid
    return res.status(status.success).json(successResponse(creds));
  } catch (error) {
    console.error('[applicantsController] getUserProfile error:', error.message || error);
    return res.status(status.error).json(errorResponse("Operation not successful. Please try again."));
  }
};
```

---

## Changes Summary

| Change | Detail |
|---|---|
| Identity source | Switched from `req.query.id` to `req.user.uid` |
| DB call scoping | `getUserProfileById(tokenUid)` — never client-supplied |
| Mismatch detection | `if (req.query.id && req.query.id !== tokenUid)` |
| Mismatch response | HTTP 403, `{"message": "Unable to load profile for this session."}` |
| Security event log | `[SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH]` with redacted uids |
| No DB query on mismatch | Returns 403 before ever calling `getUserProfileById` |
| Error log improved | Logs `error.message || error` — not raw error object |

---

## Security Event Log Format

```
[SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH] 2026-06-25T14:00:00.000Z endpoint=GET /applicant/userprofile authenticatedUid=abc***xyz suppliedId=def***uvw action=blocked
```

Fields:
- `authenticatedUid`: First 3 + last 3 chars only (middle redacted)
- `suppliedId`: Same redaction
- `action`: Always `blocked` on mismatch

---

## What Was NOT Changed

- No other routes in `applicantsController.js` were modified
- `getUserProfileById` helper is unchanged
- `verifyAuth` middleware is unchanged
- `applicationRoute.js` route registration is unchanged
- All other applicant routes (workexp, cert, educbg, skills, docs, videocv, etc.) are unchanged
- Error response shape matches existing `errorResponse()` pattern

---

## Patch Classification

- **Type:** Security fix — BOLA/IDOR
- **Size:** Minimal and targeted (replaced ~4 lines, added ~20 lines)
- **Risk:** Low — only changes behavior when:
  1. `req.query.id` is absent (now uses token uid instead — same uid for all legitimate callers)
  2. `req.query.id` is present and mismatched (was an attack; now blocked)
  3. `req.query.id` matches token uid (behavior unchanged — profile returned)
