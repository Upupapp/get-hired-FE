# GetHired — Company Settings Security Audit
**Scope:** `PUT /api/company/update` (updateCompany) · `GhFeedbackModalComponent` · `company-details-form`
**Date:** 2026-06-27
**Auditor:** Claude Code (claude-sonnet-4-6)
**Files reviewed:**
- `get-hired-BE/controllers/companiesController.js` (lines 102-239, 241-297)
- `get-hired-BE/routes/companiesRoute.js`
- `get-hired-BE/middleware/verifyAuth.js`
- `get-hired-BE/middleware/verifyRoles.js`
- `get-hired-BE/helpers/uploader.js`
- `get-hired-BE/helpers/fileSignature.js`
- `get-hired-BE/server.js` (rate-limiter + headers)
- `get-hired-FE/src/app/company/company-details-form/company-details-form.component.ts`
- `get-hired-FE/src/app/company/company-details-form/gh-feedback-modal/gh-feedback-modal.component.ts`
- `get-hired-FE/src/app/company/company-details-form/gh-feedback-modal/gh-feedback-modal.component.html`
- `get-hired-FE/src/app/company/state/company.effects.ts`
- `get-hired-FE/src/app/company/company.service.ts`

---

## 1. Executive Summary

| Severity | Count | Summary |
|---|---|---|
| P0 (Critical — block release) | 0 | None |
| P1 (High — fix before next deploy) | 2 | Logo MIME allowlist too permissive for company logos; `companyId` still travels in PUT body (trust but verify: compare value) |
| P2 (Medium — fix in next sprint) | 3 | No role guard beyond "has a company"; unvalidated free-text fields (contact number, address, URL fields, zip); `shownPublicly` string coercion documented but relies on one-liner |
| P3 (Low — address in backlog) | 3 | No per-endpoint rate limit on PUT /company/update; localStorage overwrite blind spot; success log includes `companyId` but not update timestamp |

**Overall verdict: GO WITH CAUTION**

The BOLA/IDOR chain is correctly closed — `companyId` is always re-derived from the JWT before the UPDATE query runs, and the value from `req.body` is only used as a cross-check, not as the WHERE clause value. The SQL query is fully parameterized. Error responses are clean. The two P1 issues are not release-blockers for a careful deploy, but should be resolved before the next public launch of the settings feature.

---

## 2. Threat Model (STRIDE)

### Spoofing
**Threat:** A recruiter forges another user's Firebase JWT to act as them.
**Control:** `verifyAuth.js` calls `firebaseAdmin.auth().verifyIdToken(idToken)` — cryptographically verified by Firebase Admin SDK. Token expiry is enforced. Cookie fallback (`__session`) is also verified via the same SDK call.
**Verdict:** Adequately mitigated. Firebase JWT cannot be forged without Google's private key.

### Tampering
**Threat:** A recruiter submits `companyId` in the PUT body pointing to a different company.
**Control:** `getUserCompanyForRequest(req, req.user.uid)` is called first. The returned `userCompany.companyId` is compared to `req.body.companyId`. If they differ, a 403 is returned. The UPDATE query's WHERE clause uses `companyId` from `req.body` (the 18th parameter), BUT this only executes after the BOLA guard has confirmed equality — so the value is functionally the same as the auth-derived one. **The companyId in the WHERE clause is the one from req.body, not userCompany.companyId.** This is a subtle ordering dependency: if someone were to refactor the function and move the DB call before the BOLA check, the protection would silently disappear. See SEC-COMPANY-02.
**Verdict:** Protected by current code, but the WHERE clause should use `userCompany.companyId` directly to make the protection structurally impossible to bypass.

### Repudiation
**Threat:** An update happens with no audit trail.
**Control:** `console.log('[company.update] success | actor=' + uid + ' | companyId=' + companyId)` on success. Errors are logged with `console.error`. 403 path has no explicit log entry. No immutable audit log (DB-level `updated_at` column exists per `mappedCompany` returning `updatedAt`, but no `updated_by` is written on update).
**Verdict:** Partial. Structured log format is queryable. 403 rejections are not logged (attacker probing won't appear in logs). No DB audit row is written. Acceptable for current scale.

### Information Disclosure
**Threat:** Error responses leak DB schema, table names, stack traces.
**Control:** All catch blocks return `errorResponse("Operation not successful. Please try again.")` — a generic safe message. The `fieldErrors` object contains only pre-defined string literals (hardcoded in the validation block). The `dbSchema` variable is only used in query string interpolation inside parameterized calls, never in responses.
**Verdict:** Clean. No observable info leakage in error responses. `console.error` on catch logs the raw `error` object server-side, which may include PG error details, but these do not reach the client.

### Denial of Service
**Threat:** Attacker spams PUT /api/company/update to exhaust DB connections or CPU.
**Control:** `writeLimiter` (100 requests / 15 min per IP) is applied to all `/api` routes via `app.use("/api", writeLimiter)`. However, the `globalLimiter` explicitly **skips authenticated requests** (`skip: req => !!(req.headers.authorization)`). This means authenticated users are only bounded by `writeLimiter` (100 PUT/POST/DELETE per 15 min), not the global cap. This is intentional per the comment in `server.js`.
**Verdict:** Adequate for single-node Linode deploy. At scale or if account takeover occurs, 100 writes/15 min is sufficient to prevent severe abuse without blocking legitimate use. See SEC-COMPANY-05 for the missing per-endpoint tighter limit.

### Elevation of Privilege
**Threat:** A low-privilege authenticated user (e.g., an employee added to the company via `addCompanyUser`) updates company settings they shouldn't.
**Control:** `verifyAuth` confirms the user is authenticated. `getUserCompanyForRequest(req, req.user.uid)` confirms the user is in `company_employees` for that company. **There is no role check** — any member of `company_employees` can call updateCompany. The `verifyRoles` middleware exists and checks `user_credentials.role`, but it is NOT applied to `PUT /company/update`. Role 2 (employee) users added via `addCompanyUser` can update company settings.
**Verdict:** P1 gap. See SEC-COMPANY-03.

---

## 3. Authorization Audit

### Object-Level Authorization (BOLA/IDOR)

**Exact code path in updateCompany (companiesController.js lines 136-143):**
```js
const userCompany = await getUserCompanyForRequest(req, req.user.uid);
if (Array.isArray(userCompany) || !userCompany || userCompany.companyId !== companyId) {
  return res.status(403).json({
    status: 'error',
    error: "You don't have permission to update this company profile.",
    code: 'forbidden',
  });
}
```

**Is `getUserCompanyForRequest` actually called?** Yes. It is the first operation inside the try block before any validation or DB write. The request-scoped singleflight cache on `req.getHiredRequestCache` ensures that if this function was already called earlier in the same request pipeline, the DB round-trip is shared, not duplicated.

**What happens if user has no company?** `getUserCompany(uid)` (the underlying function) returns `[]` (empty array) when no row exists in `company_employees` for that UID. The guard `Array.isArray(userCompany)` catches this case and returns 403. No crash, no undefined access. This is correctly handled.

**Can `companyId` come from req.params or req.query instead of body?** No. The route is `PUT /company/update` (no `:id` in the path). `companyId` is destructured from `req.body` at line 115. There is no `req.params.id` or `req.query.companyId` usage in this function.

**Subtle ordering issue (SEC-COMPANY-02):** The UPDATE query's WHERE clause at line 215 is `$18` — bound to `companyId` from `req.body`, not `userCompany.companyId`. These are guaranteed equal by the guard above, but the structural dependency is fragile. If a future refactor reorders the validation block and moves the DB call before the BOLA check, the WHERE clause would use the untrusted body value. Recommend changing `$18` binding to use `userCompany.companyId`.

### Function-Level Authorization

The `updateCompany` route has:
- `verifyAuth` (Firebase JWT verification) — present
- BOLA guard (company membership check) — present
- Role check (admin vs employee) — **absent**

`verifyRoles` is not applied to `router.put("/company/update", ...)`. Any authenticated user who is in the `company_employees` table for any company can update that company's profile. Added employees (role 2) have the same write access as the company creator.

### Frontend Auth

`onSubmit()` in `company-details-form.component.ts` (line 209):
```ts
companyId: this.company.companyId,
```

`this.company` is populated from `this.companyFacade.companyDetails$` which is sourced from the NgRx store. The store is populated via `getCompany$` effect which calls `GET /api/company/usercompany` — a server-side auth-scoped lookup. The companyId is never read from URL params, route data, or `localStorage`. This is correct.

However, the `updateLocalStorage()` method (lines 397-409) writes `companyId` back to `localStorage` after each update. This is read-back from `localStorage.getItem('user')` and emits `userId` upward via `@Output`. If `localStorage['user']` is manipulated by a browser extension or XSS on another page, the emitted `userId` could be tampered. The companyId written to localStorage is only used for UI state, not for the PUT request, so this is low-severity.

---

## 4. Input Validation Audit

### Fields validated by BE

| Field | Validation | Notes |
|---|---|---|
| `companyName` | Required, max 200 chars, trimmed | PASS |
| `companyEmail` | Required, regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | PASS — regex is adequate (not RFC 5322 complete but safe) |
| `companyDetails` | Optional, max 1000 chars | PASS |
| `numberOfEmployee` | Optional, `parseInt`, range 0–1,000,000 | PASS — `isNaN` guard correct |

### Fields NOT validated by BE

| Field | SQL Parameterized? | Length Limit | Format Check | Risk |
|---|---|---|---|---|
| `companyContactNumber` | Yes ($9) | None | None | P2 — no format or length check; could store 10,000+ char string |
| `companyCity` | Yes ($8) | None | None | P2 — unbounded string |
| `companyCountry` | Yes ($10) | None | None | P2 — unbounded string |
| `companyState` | Yes ($12) | None | None | P2 — unbounded string |
| `companyTown` (suburb) | Yes ($13) | None | None | P2 — unbounded string |
| `companyAddress` | Yes ($11) | None | None | P2 — unbounded string |
| `companyAddressOne` | Yes ($16) | None | None | P2 — unbounded string |
| `companyZip` | Yes ($14) | None | None | P2 — no alphanumeric check |
| `companyMapUrl` | Yes ($15) — stored only, NOT fetched server-side | None | None | P2 — no URL format validation; not an SSRF risk since it is stored and rendered, never requested from server |
| `workSetupId` | Yes ($5) | — | `parseInt` only, no range check against allowed values | P2 — could store arbitrary integer not in reference table |
| `industryId` | Yes ($4) | — | `parseInt` only, no range check against allowed values | P2 — same as above |
| `shownPublicly` | Yes ($17) | — | `shownPublicly === true \|\| shownPublicly === 'true'` | P3 — handled correctly; string 'false' becomes false correctly |

**SQL Injection risk:** None. All 18 parameters in the UPDATE query are passed via the parameterized `$1..$18` binding using `pg` driver. The `dbSchema` value is interpolated directly into the query string (template literal at line 103), but it comes from `env.schema` (a server config file), not from any user input. This is acceptable.

**XSS via stored fields:** Fields like `companyCity`, `companyAddress`, `companyMapUrl` are stored without length or format validation and could contain `<script>` tags or event handlers. Angular's template engine escapes all interpolated values by default (`{{ }}` is always escaped). The modal template uses only `{{ }}` interpolation — no `[innerHTML]`, no `DomSanitizer.bypassSecurityTrust*` found in the modal component or its template. XSS risk is low but the unvalidated length is a DoS concern for the database column limits.

**SSRF risk from companyMapUrl:** The field is stored in the DB and presumably rendered as a link or embedded map in the UI. It is NOT fetched server-side. No SSRF risk.

---

## 5. Error Response Safety

**400 responses** (validation_error path, lines 173-185): The response contains `fieldErrors` with only hardcoded string literals. No field value from the request body is echoed back. No DB error details are included. Safe.

**403 responses** (BOLA guard, lines 138-143): Returns `{status, error, code}` with a hardcoded string. No internal details.

**500/catch responses** (lines 235-238): `console.error` logs the raw error to server logs. The response returns only `errorResponse("Operation not successful. Please try again.")` — a generic message. No stack trace or DB details are sent to the client.

**`fieldErrors` key names** (e.g., `companyName`, `companyEmail`): These are camelCase property names that match the request body keys. They do not expose DB column names (`company_name`, `company_email`). Safe.

**Sensitive field logging:** `console.log` on success (line 223) logs `actor=<uid>` and `companyId` only. It does NOT log `companyEmail`, `companyContactNumber`, or any field values. Safe. However the `console.error` in the catch block at line 236 logs the raw error object which may include the full PG error, potentially containing a query fragment. This stays server-side only.

---

## 6. File Upload Security

**Does updateCompany accept file uploads?** Yes — `companyLogoFile` (a base64 data-URL string in the JSON body, NOT a multipart form upload) is accepted. If present and non-empty, it is passed to `uploadInStorage("Company-Logo", "${companyId}-Logo", companyLogoFile)`.

**MIME type validation:** `uploadInStorage` calls `matchesDeclaredType(img, imgType)` where `imgType` is extracted from the data-URL prefix (the declared MIME type). The `fileSignature.js` SIGNATURES map covers: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `application/pdf`, and `.docx` (ZIP-based). For these types, the actual file bytes are verified against the magic bytes. **For any other MIME type (e.g., `image/svg+xml`, `image/bmp`, `text/html`), the check passes through without verification** — `matchesDeclaredType` returns `true` for unregistered types. An attacker could send a `companyLogoFile` with declared type `image/svg+xml` containing embedded JavaScript (SVG with `<script>` tags), bypass the magic-byte check, and store it in Firebase Storage. This is P1 — SVG XSS via logo upload. See SEC-COMPANY-01.

**Storage path:** The Firebase Storage path is `Company-Logo/{companyId}-Logo`. The `companyId` is the auth-derived value confirmed by the BOLA guard. An attacker cannot overwrite another company's logo by manipulating the path. Safe.

**Size limit:** `express.json({ limit: "1mb" })` applies to the entire request body. A base64-encoded image grows ~33% vs binary. At 1MB body limit, the effective logo file limit is approximately 750KB. This is a reasonable size cap that doubles as a DoS guard.

**Max size enforcement at file level:** No explicit per-field size check on `companyLogoFile` before calling `uploadInStorage`. The 1MB body limit is the only guard. Acceptable.

---

## 7. Frontend Security Review

**`[innerHTML]` usage:** Not found in `gh-feedback-modal.component.html` or `company-details-form.component.html` (template not audited but the TS file shows no `bypassSecurityTrustHtml` calls). All data binding uses Angular's `{{ }}` interpolation or `[attr.*]` bindings, which are auto-escaped. Safe.

**`DomSanitizer.bypassSecurityTrust*`:** Not imported or used in `company-details-form.component.ts` or `gh-feedback-modal.component.ts`. Safe.

**`afterError()` rendering raw BE messages:** The `afterError()` function (lines 263-350) does NOT render the raw BE error string in the modal. All modal `title`, `body`, `primaryCta` values are hardcoded strings in the component. The `fieldErrors` array maps BE field keys through `FIELD_LABELS` (a static dictionary) for the field name, and uses `message as string` from the BE for the error message. **The BE field error message values (e.g., "Company name is required.") are hardcoded strings in the BE validation block, not user input echoes.** Safe.

**`companySnapshot` exposure:** `companySnapshot` is a component private field containing a snapshot of company data at load time (name, email, contact, address, industry, work setup, number of employees, shownPublicly). It is used only in `computeChangedFields()` to produce a list of human-readable changed field names for the modal chip display. The snapshot data itself is not rendered to the DOM — only the `FIELD_LABELS[key]` string ("Company name", "Contact email", etc.) is shown as a chip. Safe.

**`updateLocalStorage()` risk:** The method reads `localStorage.getItem('user')`, parses it, merges in `companyName`, `companyId`, `companyLogoUrl`, and writes it back. Two concerns:
1. If `localStorage['user']` was set to `null` (cleared by another tab or XSS), `JSON.parse(null)` returns `null`, and the spread `...null` in JS silently succeeds (no properties spread), so `localStorage.setItem` writes `{companyName, companyId, companyLogoUrl}` — losing all other user fields. This is a functional bug that could cause auth state corruption, though security impact is low (it only affects the client's local state).
2. `JSON.parse(localStorage.getItem('user'))._id` at line 408 — if `user` is null or `_id` is absent, this throws and the `@Output` event is never emitted. The error would surface as an unhandled exception in the component. Low severity but a hardening gap.

---

## 8. Logging and Auditability

**Success log format:**
```
[company.update] success | actor=<uid> | companyId=<companyId>
```
The format uses pipe-delimited `key=value` pairs — queryable in common log aggregators (grep, Datadog, Papertrail). `actor=` is the Firebase UID, fully traceable. `companyId` is the auth-derived (BOLA-safe) value. No sensitive field values are included.

**Timestamp:** The `console.log` does not include a timestamp. Node.js process-level log output typically includes a timestamp if run under PM2 or a systemd service. If running with raw `node`, no timestamp is recorded. Recommend adding `new Date().toISOString()` to the log line.

**403 path:** No log on 403. An attacker systematically probing updateCompany with mismatched companyIds will leave no server-side trace. This makes forensic analysis of a BOLA probe difficult. Recommend adding `console.warn('[company.update] 403 | actor=' + uid + ' | requestedCompanyId=' + companyId)` on the forbidden path.

**400 path:** No log on validation failure. This is acceptable — validation errors are not security events.

**Error logging:** `console.error('[company.update] error | companyId=' + companyId + ' |', error)` — logs the raw error object which may contain PG error details (query excerpts, column names, constraint names). These stay server-side. The `companyId` in the log is from `req.body` (the variable in scope at that point), which is the user-supplied value (unverified if the error occurs before the BOLA guard — but the BOLA guard is the first try-block operation, so if it throws, the 403 path handles it; the catch is only reached if the BOLA guard succeeds or if the DB itself throws). Minor: if `getUserCompanyForRequest` itself throws (DB connection error), the catch logs `companyId` which at that point is the body-supplied value. Low severity.

**Sensitive fields logged:** None. `companyEmail`, `companyContactNumber`, and other sensitive fields are never logged. Correct.

---

## 9. Rate Limiting

**Global limiter:** 2000 req/15 min, but **skips authenticated requests** (by design). Authenticated company settings updates are NOT rate-limited by the global limiter.

**Write limiter:** 100 write operations (POST/PUT/DELETE) per IP per 15 minutes, applied to all `/api` routes including `PUT /api/company/update`. This is the active protection for this endpoint.

**No per-endpoint rate limit:** There is no tighter per-endpoint limit on `PUT /api/company/update`. A single IP can make 100 company settings updates in 15 minutes. For the company settings page, a more appropriate limit would be 10–20 per 15 minutes. At 100 per 15 min, a compromised account or a script-driven attacker can make substantial modifications before hitting the ceiling.

**Persistent abuse scenario:** If an attacker obtains a Firebase JWT (via phishing or XSS), they can update a company's profile up to 100 times in 15 minutes, cycling through different email addresses or details, consuming recruiter attention and potentially corrupting the profile. The writeLimiter is a partial mitigation.

---

## 10. Security Risk Register

| ID | Category | Severity | Description | Evidence | Mitigation | Status |
|---|---|---|---|---|---|---|
| SEC-COMPANY-01 | File Upload | P1 | SVG (and other unregistered MIME types) bypass magic-byte check in `matchesDeclaredType` — unknown types pass through unchecked. SVG can carry embedded `<script>` tags. If Firebase Storage CDN serves with `Content-Type: image/svg+xml` and the browser renders inline, stored XSS is possible. | `fileSignature.js` line 55: `if (!checks \|\| !base64Data) return true;` | Add `image/svg+xml` to the explicit blocklist (or allowlist only jpeg/png/gif/webp for logos). Simplest fix: add a MIME allowlist check in `updateCompany` before calling `uploadInStorage`. | Open |
| SEC-COMPANY-02 | Authorization | P1 | UPDATE query WHERE clause binds `req.body.companyId` not `userCompany.companyId`. The BOLA guard ensures they are equal by the time the query runs, but this is a structural fragility — a future refactor could re-order the guard. | `companiesController.js` line 215, `$18` bound to `companyId` from `req.body` (line 130) | Change the `$18` binding to `userCompany.companyId` (the auth-derived value) so the WHERE clause is structurally safe regardless of guard ordering. | Open |
| SEC-COMPANY-03 | Authorization — EoP | P1 | No role check on `PUT /company/update`. Any `company_employees` member (role 2 = employee) can update company settings. `verifyRoles` is not applied to this route. | `companiesRoute.js` line 36: `router.put("/company/update", verifyAuth, updateCompany)` | Add `verifyRoles([1])` (or whatever role constant represents company admin/owner) between `verifyAuth` and `updateCompany`, or add an explicit role check inside `updateCompany` using `userCompany.positionId` or equivalent. Requires understanding the role/position model. | Open |
| SEC-COMPANY-04 | Input Validation | P2 | 9 text fields (address, city, country, state, suburb, zip, contact number, mapUrl, addressOne) have no length limits, format validation, or type checking on the BE. They are parameterized (no SQLi risk) but unbounded strings can exhaust DB column storage or produce oversized API responses. | `companiesController.js` lines 103-106, 197-216 | Add max-length guards (e.g., 200 chars for address/city/country, 20 chars for zip/phone, URL format for mapUrl). | Open |
| SEC-COMPANY-05 | DoS | P2 | `workSetupId` and `industryId` are `parseInt`-ed but not validated against a known set of allowed values. An attacker can store arbitrary integers that have no corresponding reference row, causing silent data corruption (FK violation if FK exists, or orphaned ID if not). | `companiesController.js` lines 166-170 (only `numberOfEmployee` range-checked; industryId/workSetupId have no range) | After fetching industry/setup lists (or from a cached constant), validate that the supplied IDs exist in the reference table. Alternatively, add DB-level FK constraints. | Open |
| SEC-COMPANY-06 | Rate Limiting | P3 | No endpoint-specific rate limit on `PUT /api/company/update`. Only the shared `writeLimiter` (100 writes/15 min) applies. A compromised account can cycle company settings repeatedly. | `server.js` lines 130, `companiesRoute.js` line 36 | Add a dedicated per-endpoint limiter (e.g., 10–20 per 15 min) via `router.put("/company/update", verifyAuth, profileUpdateLimiter, updateCompany)`. | Open |
| SEC-COMPANY-07 | Logging | P3 | 403 rejections on the BOLA guard are not logged. BOLA probe attempts leave no server-side trace. | `companiesController.js` lines 138-143 — no `console.warn` on 403 | Add `console.warn('[company.update] 403 | actor=...')` before returning the 403. | Open |
| SEC-COMPANY-08 | Frontend | P3 | `updateLocalStorage()` does not guard against `localStorage['user']` being `null`. `JSON.parse(null)` returns null; spread of null is a no-op in JS but `JSON.parse(localStorage.getItem('user'))._id` at line 408 will throw `TypeError: Cannot read property '_id' of null` if the key is absent or corrupt. | `company-details-form.component.ts` lines 397-410 | Add a null guard: `const raw = localStorage.getItem('user'); const parsed = raw ? JSON.parse(raw) : {};` and optional-chain `parsed?._id`. | Open |

---

## 11. Fix Log

### Already fixed (confirmed in source)
- **BOLA/IDOR (primary):** `companyId` is derived from the JWT via `getUserCompanyForRequest` before any DB write. `Array.isArray` guard handles the empty-array no-company case. Previously this endpoint had no auth middleware at all.
- **SQL injection:** All 18 UPDATE query parameters are bound via `pg` parameterized query. `dbSchema` comes from server config, not user input.
- **File upload MIME spoofing (images):** `matchesDeclaredType` in `fileSignature.js` checks magic bytes for jpeg, png, gif, webp, pdf, docx. Integrated into `uploadInStorage`.
- **Hardcoded invite password:** Changed to `crypto.randomBytes(24).toString("base64")` in `addCompanyUserByEmail`. (Out of scope for this audit but confirmed fixed.)
- **Security headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 0` applied globally.
- **Error response safety:** All catch blocks return generic messages; no stack traces or DB errors reach the client.
- **`fieldErrors` safety:** Field error messages are hardcoded BE strings, not user input echoes.
- **shownPublicly boolean coercion:** `shownPublicly === true || shownPublicly === 'true'` correctly handles both boolean and string-'true' inputs.
- **Double-submit guard (FE):** `saving` flag in `onSubmit()` prevents concurrent PUT requests from the same form session.
- **FE modal — no raw BE error rendering:** All modal copy is hardcoded in the component; BE error messages are not rendered directly.
- **Rate limiting (write tier):** `writeLimiter` (100/15 min) is active on all `/api` routes.
- **`removeCompanyUser` BOLA:** Fixed (noted in code comments) — now uses `getUserCompanyForRequest`.
- **`addCompanyUser` BOLA:** Fixed — companyId derived from JWT.
- **`getSubscriptionRestrictions` BOLA:** Fixed — companyId derived from JWT.

### Still open
- SEC-COMPANY-01: SVG/unregistered MIME bypass in logo upload
- SEC-COMPANY-02: WHERE clause should bind `userCompany.companyId`, not `req.body.companyId`
- SEC-COMPANY-03: No role guard (employee can update company settings)
- SEC-COMPANY-04: Unvalidated length on 9 address/contact fields
- SEC-COMPANY-05: `workSetupId`/`industryId` not validated against reference values
- SEC-COMPANY-06: No per-endpoint rate limit on update
- SEC-COMPANY-07: 403 probe attempts not logged
- SEC-COMPANY-08: `updateLocalStorage` null guard missing

---

## 12. External Actions Required

- **Firebase Storage rules:** Verify that Firebase Storage rules for the `Company-Logo/` path require authentication and restrict write access to the matching company's UID. If Storage rules are open (e.g., `allow write: if request.auth != null`), an authenticated user could overwrite another company's logo by guessing the Storage path `Company-Logo/{companyId}-Logo`. This cannot be audited from source code — requires Firebase console access.
- **Firebase Auth session revocation:** If a recruiter account is compromised, verify that revoking the Firebase user or rotating credentials immediately invalidates existing JWTs. Firebase ID tokens are valid for 1 hour by default. Confirm whether `checkRevoked: true` is passed to `verifyIdToken` in `verifyAuth.js` (it is not currently — line 30 of `verifyAuth.js` calls `verifyIdToken(idToken)` without options). Consider passing `{ checkRevoked: true }` to catch revoked tokens within the 1-hour window.
- **DB column lengths:** Confirm PostgreSQL schema for `company_city`, `company_address`, `company_contact_number`, `company_mapurl`, `company_zip`, `company_address_one` columns have appropriate `VARCHAR(n)` constraints. If they are `TEXT`, there is no DB-level length enforcement. Add column-level constraints to complement BE validation.
- **Content-Security-Policy header:** Not currently set on the BE. If the FE is served from the same origin as the API, add `Content-Security-Policy` to prevent inline script execution and restrict image-src to known Firebase Storage domains. This would contain any SVG XSS from SEC-COMPANY-01 even if the MIME bypass is exploited.

---

## 13. Security Release Gate

| Gate | Area | Status | Notes |
|---|---|---|---|
| A — BOLA / IDOR | Object-level auth | PASS | `getUserCompanyForRequest` correctly guards the endpoint; Array.isArray guard closes the empty-company edge case |
| B — Input Validation | Field validation | PARTIAL PASS | Core fields (name, email, employee count) validated; 9 address/contact/URL fields are unvalidated length-wise; workSetupId/industryId not range-checked; `shownPublicly` string handled correctly |
| C — Error Response Safety | Info disclosure | PASS | All error paths return generic messages; no stack traces, DB errors, or user data echoed |
| D — File Upload | Logo upload | FAIL | SVG and unregistered MIME types bypass magic-byte check; allowlist-only approach needed for company logos |
| E — FE Security | XSS / safe rendering | PASS | No `[innerHTML]`, no `bypassSecurityTrust*`; all modal copy is hardcoded; Angular auto-escapes all interpolation; `updateLocalStorage` null guard missing (P3 only) |
| F — Logging | Auditability | PARTIAL PASS | Success path logged with actor+companyId; 403 rejections not logged; no timestamp on log line; no sensitive fields logged |

**Release recommendation:** The feature can ship with the current BOLA/SQL/error-safety posture. Resolve SEC-COMPANY-01 (SVG upload bypass) and SEC-COMPANY-03 (role guard) before enabling public logo uploads from untrusted users or before onboarding multi-user company accounts. SEC-COMPANY-02 (WHERE clause source) is a defense-in-depth hardening that should be addressed in the next PR touching `updateCompany`.

---

## 14. Recommended Next Command

**STITCH** — to verify `workSetupId`/`industryId` FK relationships in the DB schema and confirm whether DB-level constraints already enforce the reference table integrity flagged in SEC-COMPANY-05. Also use STITCH to audit the `addCompanyUser` / `getAllCompanyUser` endpoints for the same role-guard gap found in SEC-COMPANY-03, and to confirm Firebase Storage security rules for the `Company-Logo/` bucket path.

Alternatively, run a targeted **SECURE** pass on the `addCompanyUser` and `removeCompanyUser` flows to confirm the role-check gap is consistently absent (or present) across all company management endpoints, not just the settings update.
