# GETHIRED COMPANY SETTINGS — STITCH REPORT
**Feature**: `/recruiter/company/settings` — Company Details Form + NgRx company state + BE updateCompany endpoint
**Session commits**: FE=5db2363, BE=13a64fb
**Report date**: 2026-06-27
**Scope**: FE-BE integration stability, API contract hardening, payload normalization

---

## 1. Executive Summary

**Integration health: YELLOW — Functional with two structural risks and one latent data-loss path.**

The session-under-review hardened the most critical seam (error propagation from catchError through NgRx state to the component) and added well-structured BE validation with a `fieldErrors` envelope. The happy path is stable. The critical risk areas remaining are:

- **RISK-1 (HIGH)**: `updateCompany` is routed as `PUT /company/update` with **no `:id` param in the URL**. The `companyId` travels in the request body. The BOLA guard is correct — it re-derives companyId from the JWT via `getUserCompanyForRequest` and compares — but the URL has no param to use for routing-level validation. This is safe as implemented but diverges from RESTful convention and the OpenAPI draft in the task brief.
- **RISK-2 (MEDIUM)**: The `Company` TypeScript model is missing `companyState`, `companyTown`, `companyZip`, `companyMapUrl`, `companyAddressOne`, and `shownPublicly`. These fields are written to the DB and read back correctly, but are untyped on the FE model interface, meaning they flow as `any` through NgRx.
- **RISK-3 (MEDIUM)**: `companyLogoFile` sent as base64 string via plain JSON body (`BaseService.put()`), yet `uploadInStorage` is called with this value directly. If the uploaded logo is large, this approach sends a large JSON payload and may hit Express body-size limits silently.
- **RISK-4 (LOW, latent)**: `parseInt()` on `workSetupId`/`industryId` in `onSubmit()` returns `NaN` when the control value is `null` (not selected). `parseInt(null)` = `NaN`. The DB column receives `NaN` which PostgreSQL will cast to `null` silently — not an error, but data loss if a user clears the field.

**Seams stabilized this session**: error body propagation (effects.ts catchError), afterError() payload normalization, BE validation 400 response shape, BOLA guard on updateCompany, success response feedback block.

**Seams still open**: Company model type gaps, logo upload size risk, parseInt(null) silent NaN, content-type assumed (no explicit Content-Type header set).

---

## 2. API Contract Documentation

### PUT /company/update

**Method**: `PUT`
**Path**: `/api/company/update` (no `:id` in URL — id is in body)
**Auth**: Firebase Bearer token via `verifyAuth` middleware — required, blocks with 401 if absent
**Role**: Any authenticated user who is an employee of the company being updated

**Request Shape**

| Field | Type | Required | Source (form control) | Notes |
|---|---|---|---|---|
| `companyId` | string | YES (implicit) | `this.company.companyId` (from store, not form) | Never from form value |
| `companyName` | string | YES | `companyName` | Max 200 chars. BE trims. |
| `companyEmail` | string | YES | `companyEmail` | Must be valid email. BE trims. |
| `companyContactNumber` | string | NO | `companyContactNumber` | |
| `companyAddress` | string | NO | `companyAddress` | Set via addressChange() event |
| `companyCity` | string | NO | `companyCity` | Set via addressChange() event |
| `companyCountry` | string | NO | `companyCountry` | Set via addressChange() event |
| `companyState` | string | NO | `companyState` | Set via addressChange() event |
| `companyTown` | string | NO | `companyTown` | Maps to `company_suburb` in DB |
| `companyZip` | string | NO | `companyZip` | |
| `companyMapUrl` | string | NO | `companyMapUrl` | Set via addressChange() event |
| `companyAddressOne` | string | NO | `companyAddressOne` | |
| `companyDetails` | string | NO | `companyDetails` | Max 1000 chars |
| `industryId` | int | NO | `industryId` (parseInt applied) | FE sends as integer via parseInt() |
| `workSetupId` | int | NO | `workSetupId` (parseInt applied) | FE sends as integer via parseInt() |
| `numberOfEmployee` | int | NO | `numberOfEmployee` | BE validates 0–1,000,000 |
| `companyLogoFile` | string/base64 | NO | `companyLogoFile` | base64 or file object; triggers uploadInStorage if non-empty |
| `companyLogoUrl` | string | NO | `companyLogoUrl` | Current logo URL, used as fallback when no new logo uploaded |
| `shownPublicly` | boolean | NO | `shownPublicly` | BE normalizes: `shownPublicly === true || shownPublicly === 'true'` |

**Content-Type**: `application/json` (sent via Angular `HttpClient.put()` with no custom options — default JSON). No multipart form — logo is base64-encoded string in JSON body.

**Response Shapes**

Success 200:
```json
{
  "status": "success",
  "data": {
    "companyId": "string",
    "companyLogoUrl": "string",
    "companyName": "string",
    "companyDetails": "string",
    "industryId": "number",
    "workSetupId": "number",
    "numberOfEmployee": "number",
    "companyEmail": "string",
    "companyCity": "string",
    "companyContactNumber": "string",
    "companyCountry": "string",
    "companyAddress": "string",
    "createdAt": "Date",
    "createdBy": "string",
    "updatedAt": "Date",
    "companyIndustryName": "string",
    "companyState": "string",
    "companyMapUrl": "string",
    "companyTown": "string",
    "companyZip": "string",
    "companyAddressOne": "string",
    "withActiveSubscription": "boolean",
    "shownPublicly": "boolean"
  },
  "feedback": {
    "state": "success",
    "title": "Company profile updated",
    "body": "Your company details are saved and ready for your hiring workspace.",
    "syncNote": "Changes synced across your recruiter dashboard and company profile.",
    "primaryCta": "Continue editing",
    "secondaryCta": "Back to dashboard"
  }
}
```

Validation Error 400:
```json
{
  "status": "error",
  "error": "Please review the highlighted fields.",
  "fieldErrors": {
    "companyName": "Company name is required.",
    "companyEmail": "Enter a valid email address.",
    "companyDetails": "About section must be 1000 characters or fewer.",
    "numberOfEmployee": "Enter a valid number of employees (0 – 1,000,000)."
  },
  "feedback": {
    "state": "validation_error",
    "title": "Some details need a quick check",
    "body": "We found fields that need to be fixed before saving.",
    "primaryCta": "Review fields"
  }
}
```

Forbidden 403 (BOLA guard):
```json
{
  "status": "error",
  "error": "You don't have permission to update this company profile.",
  "code": "forbidden"
}
```

Server Error 500:
```json
{
  "status": "error",
  "error": "Operation not successful. Please try again."
}
```

**Error Shape Inconsistencies**:
- The 403 shape from `updateCompany` uses `{ status, error, code }` — correctly standardized.
- The 403 shape from `removeCompanyUser` and `addCompanyUser` uses `{ message }` only (no `status`, no `code`) — inconsistent with updateCompany's 403.
- The FE `afterError()` checks `err.status === 403` (HTTP status code on the HttpErrorResponse object, not `err.code`) — so this works at HTTP level regardless of body shape.

---

## 3. Seam Inventory

| # | Area | File | Risk | Current State | Safe Strategy | Changed This Session? |
|---|---|---|---|---|---|---|
| 1 | NgRx effect error data flow | `company.effects.ts` L90-96 | HIGH | FIXED: `const errBody = (err && err.error) ? err.error : null; const payload = errBody \|\| ...` — full BE error body passed to action payload | Correct. `err.error` is Angular HttpErrorResponse's parsed response body. No further change needed. | YES |
| 2 | Payload normalization in afterError() | `company-details-form.component.ts` L267 | MEDIUM | Fixed: `const errObj = (err && typeof err === 'object') ? err : { error: err }` | Robust for string/object duality. One edge: if BE returns an array (unexpected), `typeof [] === 'object'` is true and `errObj.feedback` will be undefined — falls through to generic error branch safely. | YES |
| 3 | fieldErrors to modal | `company-details-form.component.ts` L273-278 | LOW | `Object.entries(errObj.fieldErrors).map(([field, message]) => ({ field: FIELD_LABELS[field] \|\| field, message }))` — uses FIELD_LABELS for human labels, falls back to raw key | BE fieldErrors keys are camelCase (`companyName`, `companyEmail`, `companyDetails`, `numberOfEmployee`) — all present in FIELD_LABELS. `workSetupId` and `industryId` are NOT in FIELD_LABELS but also not currently validated by BE, so no risk now. | NO (stable) |
| 4 | Success feedback block | `companiesController.js` L225-234 | LOW | `Object.assign({}, successResponse(dbResponse), { feedback: {...} })` merges correctly. `successResponse(dbResponse)` returns `{ status: 'success', data: dbResponse }`. Result: `{ status: 'success', data: {...}, feedback: {...} }`. FE reads `res.data` from top-level for company, ignores `feedback`. | CORRECT. `Object.assign` with distinct keys (`data`, `feedback`, `status`) — no collision. FE success path reads `res.data` in the effect and stores it as company; `feedback` block is informational only (not read by FE effect). | YES |
| 5 | companyId source | `company-details-form.component.ts` L207-209 | HIGH | `companyId: this.company.companyId` — sourced from store-loaded company object, NOT from form value. Confirmed: `companyDetailsForm` has no `companyId` control. | Safe. BOLA guard on BE cross-validates this against the JWT-derived company anyway. | NO (stable) |
| 6 | workSetupId/industryId parseInt | `company-details-form.component.ts` L210-211 | MEDIUM | `parseInt(this.companyDetailsForm.controls.workSetupId.value)` — if value is `null` (nothing selected), `parseInt(null)` returns `NaN`. PostgreSQL will receive `NaN` via pg driver and may silently null the column or throw. | Add a guard: `parseInt(x) \|\| null` — but this converts 0 to null too. Better: `(v != null && v !== '') ? parseInt(v, 10) : null`. Not fixed this session. | NO |
| 7 | Logo upload | `companiesController.js` L187-195 + `company.service.ts` L33-35 | MEDIUM | Logo sent as base64/string field in JSON body via `PUT` (no multipart). `uploadInStorage` receives the base64 string. Works, but large logos will inflate JSON payload size significantly (a 500KB image = ~667KB base64). No body-size limit guard visible. | Confirm Express `express.json({ limit })` setting. Consider presigned-URL or separate upload endpoint for logos > ~200KB. Not a crash path today but a latency/rejection risk in production. | NO |
| 8 | Address fields mapping | `company-details-form.component.ts` L167-175 + `companiesController.js` L209-214 | LOW | FE sets all 8 address fields via `addressChange()` event correctly. BE query maps: `companyTown` → `company_suburb` (DB column name differs). `mappedCompany()` correctly reverses: `companyTown: raw.company_suburb`. Round-trip is consistent. | Stable. The suburb/town aliasing is encapsulated in mappedCompany. | NO |
| 9 | shownPublicly field | `companiesController.js` L214 | LOW | BE: `shownPublicly === true \|\| shownPublicly === 'true'` handles both boolean and string form. `mappedCompany` returns `shownPublicly: raw.shown_publicly === true` (strict boolean). FE form control has no validators or explicit type — value from checkbox would be boolean. | Stable. BE normalizes both representations. | NO |
| 10 | NgRx state clearing — resetStateNotif() | `company.facade.ts` L25-27 + `company.reducer.ts` L38-45 | LOW | `resetState` action sets `succesMsg: ''`, `error: null`, `loading: false`. Clears BOTH success and error. Called in `onSubmit()` before dispatch AND in `ngOnDestroy()`. | Correct. Stale success/error state is cleared before each new attempt. | NO (stable) |

---

## 4. OpenAPI-Style Draft

```
PUT /api/company/update
Auth: Bearer <Firebase ID token>   (verifyAuth middleware, 401 if missing/invalid)
Content-Type: application/json

Request Body:
{
  companyId:            string   (required, sourced from store — never form)
  companyName:          string   (required, max 200 chars, trimmed)
  companyEmail:         string   (required, valid email, trimmed)
  companyContactNumber: string?
  companyAddress:       string?
  companyCity:          string?
  companyCountry:       string?
  companyState:         string?
  companyTown:          string?  (stored as company_suburb in DB)
  companyZip:           string?
  companyMapUrl:        string?
  companyAddressOne:    string?
  companyDetails:       string?  (max 1000 chars)
  industryId:           int?     (parseInt applied FE-side; null if not selected)
  workSetupId:          int?     (parseInt applied FE-side; null if not selected)
  numberOfEmployee:     int?     (0–1,000,000)
  companyLogoFile:      string?  (base64 or file ref; triggers uploadInStorage if non-empty)
  companyLogoUrl:       string?  (existing URL, used as logo fallback when no new file)
  shownPublicly:        bool?    (BE accepts boolean or string "true"/"false")
}

Responses:

200 OK:
{
  "status": "success",
  "data": { ...mappedCompany fields (camelCase) },
  "feedback": {
    "state": "success",
    "title": "Company profile updated",
    "body": "...",
    "syncNote": "...",
    "primaryCta": "Continue editing",
    "secondaryCta": "Back to dashboard"
  }
}

400 Bad Request (validation):
{
  "status": "error",
  "error": "Please review the highlighted fields.",
  "fieldErrors": {
    "<fieldName>": "<human-readable error message>"
  },
  "feedback": {
    "state": "validation_error",
    "title": "Some details need a quick check",
    "body": "We found fields that need to be fixed before saving.",
    "primaryCta": "Review fields"
  }
}

403 Forbidden (BOLA guard):
{
  "status": "error",
  "error": "You don't have permission to update this company profile.",
  "code": "forbidden"
}

500 Internal Server Error:
{
  "status": "error",
  "error": "Operation not successful. Please try again."
}
```

---

## 5. Identity and Authorization Seams

**Where does companyId come from on the BE?**
- `companyId` arrives in `req.body` (FE sends it as a JSON body field).
- The BOLA guard calls `getUserCompanyForRequest(req, req.user.uid)` which executes a DB query joining `company_employees` to `companies` on `employee_uuid = uid`. This returns the company the JWT-authenticated user actually belongs to.
- The guard then checks `userCompany.companyId !== companyId`. If they differ — or if `userCompany` is an array (no company row) — it returns 403 immediately without touching the UPDATE query.
- The `companyId` used in the actual `UPDATE WHERE company_id=$18` is the one from `req.body`, not the JWT-derived one. However, this is only reached if they match, so there is no injection path.

**Does getUserCompanyForRequest fetch from DB or token?**
- It fetches from DB. It calls `getUserCompany(uid)` which runs a `SELECT` against `company_employees JOIN companies`. The result is not from the Firebase token claims — it is authoritative from the database.
- It has a request-scoped singleflight cache (on `req.getHiredRequestCache`) to avoid a second DB round-trip if called multiple times within the same request handler chain.

**What happens if a recruiter has no company?**
- `getUserCompany()` returns `[]` (empty array) if no row exists — not `null`.
- The guard checks `Array.isArray(userCompany) || !userCompany` first — so an empty array triggers a 403 response. This is correct.

**Is there any path where FE-supplied companyId could be used on the BE without validation?**
- No, not for `updateCompany`. The BOLA guard fires before the UPDATE query is executed.
- The `companyId` from `req.body` is only used as the `$18` parameter in the `UPDATE WHERE company_id=$18` clause, and this is only reached after the guard confirms it matches the JWT-derived company.
- One theoretical gap: the guard compares `userCompany.companyId !== companyId` (string comparison). If there were any type coercion issue (e.g., `companyId` arriving as an integer from a malformed request), the comparison could fail silently. The current FE always sends it as a string from `this.company.companyId`, so this is low risk in practice.

---

## 6. Payload Normalization Guide

**Current normalization: afterError() in the component**

```typescript
// company-details-form.component.ts L267
const errObj = (err && typeof err === 'object') ? err : { error: err };
```

This normalizes the payload received from NgRx `error$` selector, which is set from `updateCompanyFail({ payload })`.

The payload shape from the effect (effects.ts L93-94):
```typescript
const errBody = (err && err.error) ? err.error : null;
const payload = errBody || (err && err.message) || 'An error occurred';
```

So `payload` can be:
- **Full BE error object** (most cases): `{ status: 'error', error: '...', fieldErrors: {...}, feedback: {...} }` — via `err.error`
- **String** (legacy / network error message): `err.message` — via fallback
- **String** (hardcoded fallback): `'An error occurred'`

The component's `errObj` normalization converts string to `{ error: string }`. This is correct.

**Should normalization be in a service or effect instead?**

Recommended: Move normalization to the effect. The component should receive a guaranteed-shape object from `error$`, not a union of string | object. Proposed shape for the effect payload:

```typescript
// Recommended (not yet implemented)
interface CompanyUpdateErrorPayload {
  error: string;
  fieldErrors?: { [key: string]: string };
  feedback?: { state: string; title: string; body: string; primaryCta: string };
  httpStatus?: number;
}
```

This would eliminate the string/object union and remove the normalization burden from the component. Low priority if the component stays as-is.

**Field name consistency**

The BE and FE both use `camelCase` throughout. The DB uses `snake_case`, and `mappedCompany()` converts at the boundary. There are no known field name mismatches in the update flow.

One exception: the DB column is `company_suburb`, mapped to/from `companyTown` in both FE and BE. This alias is internal to the BE and does not affect the API contract.

**Response envelope**

BE: `successResponse(dbResponse)` = `{ status: 'success', data: dbResponse }`.

FE effect reads: `const company: Model.Company = res.data;` (effects.ts L87).

The `feedback` block sits at the top level alongside `data` — not inside `data`. The FE effect does not read `feedback`; it is only informational (success path uses hardcoded strings in the component's `afterSubmit()`). The BE-supplied `feedback` on success is currently unused by the FE, which uses its own hardcoded strings instead. These are in sync as of this session (same copy), but they could drift. Low risk.

---

## 7. Fix Log

| ID | File | Issue | Status | Risk | Next-command |
|---|---|---|---|---|---|
| FIX-01 | `company.effects.ts` L90-95 | catchError previously extracted only `err.message` (string), discarding `fieldErrors` and `feedback.state` from 400 responses. Fixed to pass `err.error` (full BE body). | FIXED (this session) | Was HIGH, now LOW | — |
| FIX-02 | `company-details-form.component.ts` L267 | `afterError()` received string or object from NgRx error$; no normalization. Fixed with `errObj = (err && typeof err === 'object') ? err : { error: err }`. | FIXED (this session) | Was HIGH, now LOW | — |
| FIX-03 | `companiesController.js` L174-185 | No validation on `updateCompany` — any garbage values would reach the DB. Fixed: added field-level validation for companyName, companyEmail, companyDetails length, numberOfEmployee range, with structured 400 response. | FIXED (this session) | Was MEDIUM, now LOW | — |
| FIX-04 | `companiesController.js` L225-234 | Success response lacked `feedback` block — component had no signal from BE on success quality. Fixed: `Object.assign` merges feedback block onto successResponse. | FIXED (this session) | Was LOW, now NONE | — |
| OPEN-01 | `company-details-form.component.ts` L210-211 | `parseInt(null)` = NaN when workSetupId or industryId not selected. Silent data loss in DB. | NOT FIXED | MEDIUM | MATCHED / OPTIMIZE |
| OPEN-02 | `company.model.ts` | Company interface missing: `companyState`, `companyTown`, `companyZip`, `companyMapUrl`, `companyAddressOne`, `shownPublicly`, `withActiveSubscription`. These flow as `any` through NgRx. | NOT FIXED | LOW (type-safety only) | OPTIMIZE |
| OPEN-03 | `company.service.ts` L33-35 | Logo sent as base64 in JSON body with no content-length guard or Express limit. Large logos may be silently rejected. | NOT FIXED | MEDIUM (production) | SECURE |
| OPEN-04 | Multiple BE routes (`removeCompanyUser`, `addCompanyUser`) | 403 response uses `{ message }` instead of `{ status, error, code }` — inconsistent with updateCompany's standardized 403 shape. FE checks HTTP status code, not body shape, so no current bug — but contract inconsistency. | NOT FIXED | LOW | STITCH (global) |

---

## 8. Backend Optional Contract Fixes

| # | Endpoint | Risk | Proposed Fix | Priority | Launch-blocker? |
|---|---|---|---|---|---|
| BE-OPT-01 | `PUT /company/update` | `parseInt(industryId)` / `parseInt(workSetupId)` is done on the FE, but BE does not re-validate that they are valid integer IDs. A NaN or negative value passes through to the DB. | Add BE validation: `if (industryId !== undefined && industryId !== null && (isNaN(parseInt(industryId, 10)) || parseInt(industryId, 10) < 1)) { fieldErrors.industryId = '...'; }` | LOW | NO |
| BE-OPT-02 | `PUT /company/update` | No validation of `companyContactNumber`, `companyCity`, `companyCountry` field lengths. A 100KB string could be inserted. | Add max-length guards for text fields. | LOW | NO |
| BE-OPT-03 | `PUT /company/update` | `companyId` from `req.body` is used in the `UPDATE WHERE` clause. While the BOLA guard prevents misuse, explicitly using the JWT-derived `companyId` for the UPDATE itself (instead of `req.body.companyId`) would be a belt-and-suspenders hardening. | Replace `$18` / `companyId` with `userCompany.companyId` after the BOLA guard passes. | LOW | NO |
| BE-OPT-04 | `DELETE /company/removecompanyuser`, `POST /company/addcompanyuser` | 403 shape `{ message }` inconsistent with `updateCompany`'s `{ status, error, code }`. FE is not affected (checks HTTP status), but breaks any contract-testing tool. | Standardize to `{ status: 'error', error: '...', code: 'forbidden' }`. | LOW | NO |
| BE-OPT-05 | `PUT /company/update` | `uploadInStorage` is called before the DB UPDATE query. If the DB query fails after upload, the logo is orphaned in storage (no rollback). | Move logo upload after DB write, or implement a cleanup on DB failure. | LOW | NO |

---

## 9. Release Gate

### Gate A — Contract Compatibility

| Check | Result | Notes |
|---|---|---|
| FE effect reads `res.data` for company object | PASS | `company.effects.ts` L87: `const company = res.data` |
| FE effect passes full `err.error` body to action | PASS | Fixed this session. `errBody = err.error` |
| BE 200 response has `status`, `data`, `feedback` top-level keys | PASS | `Object.assign({}, successResponse(dbResponse), { feedback: {...} })` |
| BE 400 response has `status`, `error`, `fieldErrors`, `feedback` | PASS | All four keys present in validation branch |
| BE 403 response has `status`, `error`, `code` | PASS | Matches; FE checks HTTP status code not body |
| Field names consistent camelCase FE ↔ BE | PASS | All camelCase throughout; snake_case only at DB layer |
| `companyTown` → `company_suburb` aliasing consistent | PASS | mappedCompany handles both directions |

**Gate A: PASS**

### Gate B — Auth/Authorization

| Check | Result | Notes |
|---|---|---|
| `PUT /company/update` has `verifyAuth` middleware | PASS | companiesRoute.js L36 |
| BOLA guard re-derives companyId from JWT | PASS | getUserCompanyForRequest + comparison |
| No-company (empty array) returns 403 | PASS | `Array.isArray(userCompany)` check |
| FE sends companyId from store, not form | PASS | `this.company.companyId` in onSubmit() |
| Logo upload — no separate auth gap (same endpoint) | PASS | Logo handled inside authenticated updateCompany |

**Gate B: PASS**

### Gate C — Payload Safety

| Check | Result | Notes |
|---|---|---|
| companyName validated (required, max 200) | PASS | BE validation L150-153 |
| companyEmail validated (required, valid format) | PASS | BE validation L156-160 |
| companyDetails length capped | PASS | BE validation L162-164 |
| numberOfEmployee range validated | PASS | BE validation L166-171 |
| shownPublicly boolean normalized | PASS | `=== true \|\| === 'true'` |
| parseInt(null) on workSetupId/industryId | FAIL | NaN passes to DB silently — OPEN-01 |
| Logo base64 size limit | UNKNOWN | No Express body-size limit visible in scope |
| SQL injection — parameterized queries | PASS | All values use `$N` placeholders |

**Gate C: FAIL** (OPEN-01: parseInt(null) NaN risk)

### Gate D — Must-Not-Break Flow Safety

| Check | Result | Notes |
|---|---|---|
| Double-submit guard (`this.saving`) | PASS | onSubmit() line 191 |
| `resetStateNotif()` before new submit | PASS | onSubmit() line 205 |
| resetState clears both `error` AND `succesMsg` | PASS | reducer L38-45 |
| `ngOnDestroy` calls `resetStateNotif()` | PASS | prevents error$ subscription firing on re-entry |
| Success path: `saving = false` reset | PASS | afterSubmit() L235 |
| Error path: `saving = false` reset | PASS | afterError() L264 |
| Network retry path: calls `onSubmit()` again | PASS | afterClosed subscription L310 |
| Permission error: navigates away | PASS | afterClosed subscription L330 |

**Gate D: PASS**

---

## 10. Recommended Next Command

**Immediate (before next deploy):**
- Fix OPEN-01 (`parseInt(null)` NaN) in `company-details-form.component.ts` onSubmit() — 2-line fix, low risk.

**Next session commands in priority order:**

1. **OPTIMIZE** — Address `parseInt(null)` NaN, add Company model type completeness for missing fields (`companyState`, `companyTown`, `companyZip`, `companyMapUrl`, `companyAddressOne`, `shownPublicly`, `withActiveSubscription`), and audit Express body-size limits for logo upload.

2. **SECURE** — Logo upload approach (base64 in JSON body) needs a size cap or migration to a presigned upload endpoint to prevent large payload rejections in production. Also: confirm `nosniff` header and Express `express.json({ limit })` config.

3. **STITCH (global)** — Standardize 403 response shapes across all company routes (`removeCompanyUser`, `addCompanyUser`) to match the `{ status, error, code }` shape established in `updateCompany`.

4. **TEST** — Integration tests for the update company flow: (a) valid payload → 200, (b) invalid companyName → 400 with fieldErrors, (c) mismatched companyId → 403, (d) no-company user → 403, (e) null industryId/workSetupId → verify DB column behavior.
