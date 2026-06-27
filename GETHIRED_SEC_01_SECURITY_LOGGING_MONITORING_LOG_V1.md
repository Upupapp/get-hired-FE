# GETHIRED_SEC_01_SECURITY_LOGGING_MONITORING_LOG_V1

**Mission:** Security logging implementation for SEC-01 mismatch events
**Date:** 2026-06-25

---

## What Is Logged (Mismatch Events — Case 5)

**Log level:** `console.warn`
**Log tag:** `[SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH]`

**Format:**
```
[SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH] <ISO timestamp> endpoint=GET /applicant/userprofile authenticatedUid=<redacted> suppliedId=<redacted> action=blocked
```

**Fields:**

| Field | Value | Notes |
|---|---|---|
| Log tag | `[SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH]` | Machine-parseable prefix for log aggregation |
| Timestamp | ISO 8601 (`new Date().toISOString()`) | UTC |
| endpoint | `GET /applicant/userprofile` | Static string |
| authenticatedUid | First 3 + `***` + last 3 chars of `req.user.uid` | Redacted |
| suppliedId | First 3 + `***` + last 3 chars of `req.query.id` | Redacted |
| action | `blocked` | Always `blocked` for this event |

**Redaction function:**
```js
const redactUid = (u) => (typeof u === 'string' && u.length > 6)
  ? u.slice(0, 3) + '***' + u.slice(-3)
  : '***';
```

UIDs shorter than 7 chars are fully redacted to `***`.

---

## What Is Never Logged

| Data | Reason |
|---|---|
| Full uid (token or supplied) | PII / security indicator; partial redaction is sufficient for investigation |
| Profile name, email, address, phone, DOB | PII; never fetched on mismatch path |
| CV content or document URLs | Not accessed on mismatch path |
| Raw Firebase ID token | Credential; logging would create a token theft vector in logs |
| Firebase token claims (beyond uid) | Not needed for security event |
| Error stack traces to client | Would expose internal implementation |
| `req.query` dump | Could contain other user-supplied data |

---

## When Is the Security Event Fired

Condition: `req.query.id` is present AND `req.query.id !== req.user.uid`

This covers:
- Deliberate IDOR probe (attacker supplies victim uid)
- Stale frontend code that still sends `?id=` (will be identical to token uid for legitimate users → not fired)
- Automated scanners

NOT fired when:
- `req.query.id` is absent (normal post-patch behavior)
- `req.query.id === req.user.uid` (degenerate case; proceeds normally)
- No token / expired token (handled upstream by verifyAuth middleware before controller)

---

## Log Aggregation Integration

**Current implementation:** `console.warn` — picked up by PM2 logs, Docker stdout/stderr, Linode syslog depending on the deployment environment.

**Recommended future integration:** Forward to a log aggregation platform (e.g. Datadog, Papertrail, Loggly) and create an alert rule on tag `SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH` with threshold > N events per minute. See backlog document.

**Log format is designed to be grep-friendly:**
```bash
# On production server — find all mismatch events
grep "SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH" /var/log/pm2/app.log
```

---

## Rate and Volume Considerations

A burst of mismatch events from the same IP or authenticated uid would indicate:
- Automated scanning
- A frontend bug where the wrong uid is being sent

Neither case should return profile data. The current implementation logs every mismatch. If log volume becomes a concern, a future pass can add per-uid debounce (e.g., log once per uid per 60 seconds). See backlog.
