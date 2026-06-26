# GETHIRED SECURE AUDIT — RECENT DEPLOYMENT V4
**Date:** 2026-06-26
**Scope:** 4 commits (d3246b6, 70bc592, 172b2a9, f9bc996) — 7 FE files + BE endpoint
**Auditor:** SECURE automated review

---

## SUMMARY SCORECARD

| Check | Result |
|---|---|
| BE authentication (verifyAuth) | PASS |
| BE authorization / BOLA (ownership) | PASS |
| SQL injection | PASS |
| Input validation (range + null) | PASS |
| XSS — status picker | PASS |
| XSS — main portal | PASS |
| IDOR via FE | PASS |
| Analytics PII leak | PASS |
| Image onerror handler | PASS |
| Optional chaining / nullish coalescing in BE | PASS |
| console.log sensitive data leaks | PASS (minor note) |
| Public page sensitive data exposure | PASS |

**Release gate: GO WITH CAUTION** (one P2 and two P3 items below; no P0s)

---

## FINDINGS BY PRIORITY

### P0 — NONE

No P0 findings.

---

### P1 — NONE

No P1 findings.

---

### P2 — MINOR

#### P2-01: `snackBar.open` message for status-already-same differs between component snapshot and current file

**File:** `src/app/job/job-applicants/applicant-action-modal/applicant-action-modal.component.ts` lines 102-105

**Finding:** The read-back of the file shows the snack bar text for the same-status early-exit path is `'This applicant is already at that status — no change made.'` while the audit brief described the expected text as `'Applicant already has this status.'`. Neither text is a security issue — this is purely a UX/copy inconsistency note captured here for completeness since both the component header comment and the brief described different strings. No action required for security.

**Severity:** P2 — cosmetic/UX only, zero security impact.

---

### P3 — INFORMATIONAL

#### P3-01: BE `console.log` leaks non-sensitive but potentially observable internal identifiers

**File:** `get-hired-BE/services/application.service.js` lines 316-319, 351-352

**Finding:** The `updateApplicationStatus` service logs `applicationId`, `oldStatusId`, and `newStatusId` to `console.log` / `console.warn` on every status change event (both no-op and real). These are internal identifiers, not credentials or PII. However, on a shared-log infrastructure (e.g., Linode with syslog forwarding, or future log aggregation), these IDs would be visible in plain logs.

**Risk:** Low. Application IDs follow the `APPL-XXXXXX` format and are internal row keys — not passwords, not emails, not tokens. No immediate action required, but should be moved to a structured logger with log-level filtering before a public launch.

**Severity:** P3 — low risk, informational.

---

#### P3-02: `differentiators` array in main portal uses Unicode emoji directly in TypeScript source

**File:** `src/app/public/main-portal/main-portal.component.ts` lines 42-49

**Finding:** The `differentiators` array hardcodes Unicode emoji glyphs (📄, 📎, etc.) directly as string literals in TypeScript. These are rendered via Angular's safe `{{ item.icon }}` text interpolation (not innerHTML), so there is no XSS vector. However, some enterprise/firewall content scanners flag non-ASCII characters in JavaScript source files as suspicious. No security impact.

**Severity:** P3 — informational only.

---

## DETAILED FINDINGS PER CHECK

### Check 1: Authentication — PASS

**Route:** `applicationRoute.js` line 41
```
router.put("/application/status", verifyAuth, updateApplicationStatus)
```
`verifyAuth` middleware is present. An unauthenticated request is rejected before the handler runs. No P0.

---

### Check 2: Authorization / BOLA — PASS

**Controller:** `applicationController.js` lines 261-266
**Service:** `application.service.js` lines 285-309

The ownership chain is:
1. `updateApplicationStatus` controller calls `getUserCompanyForRequest(req, uid)` to derive the caller's company from the verified Firebase JWT — the request body cannot supply or override this.
2. The service (`updateApplicationStatus` in `application.service.js`) does an INNER JOIN between `job_applicants` and `jobs` to get the `company_id` for the application's job.
3. Line 305: `if (app.company_id !== callerCompanyId)` throws `FORBIDDEN` — Company A recruiter cannot update Company B's application.
4. The controller catches `FORBIDDEN` and returns HTTP 403.

This is a complete, correctly implemented ownership check. A recruiter from Company A cannot update an application belonging to Company B's job. BOLA: PASS.

---

### Check 3: SQL Injection — PASS

All queries in `application.service.js` and `applicationController.js` use parameterized queries exclusively:

- `updateApplicationStatus` service, select: `dbQuery.query(selectQuery, [applicationId])` — `applicationId` is a bound parameter `$1`.
- `updateApplicationStatus` service, update: `dbQuery.query(updateQuery, [newStatusIdInt, applicationId])` — both values are bound parameters `$1`, `$2`.
- `newStatusIdInt` is the result of `parseInt()` and range-checked `1–6` before reaching any query; it cannot contain SQL.
- No string interpolation of user-controlled values into any query.

SQLi: PASS.

---

### Check 4: Input Validation (range + null) — PASS

**Controller:** `applicationController.js` lines 251-258

```javascript
if (!applicationId || newStatusId === undefined || newStatusId === null) {
  return res.status(status.bad).json(errorResponse('applicationId and newStatusId are required.'));
}

const newStatusIdInt = parseInt(newStatusId);
if (isNaN(newStatusIdInt) || newStatusIdInt < 1 || newStatusIdInt > 6) {
  return res.status(status.bad).json(errorResponse('Invalid status. Must be an integer between 1 and 6.'));
}
```

- `newStatusId = null` → caught by the `=== null` check → 400 Bad Request.
- `newStatusId = 999` → `parseInt(999)` = 999; `999 > 6` → 400 Bad Request.
- `newStatusId = undefined` → caught by `=== undefined` check → 400 Bad Request.
- `applicationId` missing → caught by `!applicationId` check → 400 Bad Request.

All four edge cases are handled at the controller level before any DB query runs. Input validation: PASS.

---

### Check 5: XSS — Status Picker — PASS

**File:** `applicant-action-modal.component.html` lines 29-33

The status buttons render `{{s.name}}` via Angular text interpolation. The `statusOptions` array is the module-level constant `STATUS_OPTIONS` defined at line 7-13 of the component TS file — all values are hardcoded string literals (`'Applied'`, `'Under Review'`, etc.). No user-supplied data flows into these strings.

The applicant's name rendered in the header (`{{data?.data?.firstName + ' ' + data?.data?.lastName}}`) uses Angular text interpolation, not `[innerHTML]`, so Angular's template engine HTML-encodes it automatically.

XSS (status picker): PASS.

---

### Check 6: XSS — Main Portal — PASS

**File:** `main-portal.component.html`

A full scan of the main portal template found:
- All dynamic content (`{{ item.title }}`, `{{ item.description }}`, `{{ chip }}`, `{{ step.title }}`, `{{ i + 1 }}`) uses Angular text interpolation — automatically HTML-encoded.
- No `[innerHTML]` binding anywhere in the file.
- No `bypassSecurityTrustHtml` or `DomSanitizer` calls in the component TS.
- The `portal-bento-icon` span renders `{{ item.icon }}` — the `icon` field contains Unicode emoji from a hardcoded TypeScript array, not user input.
- The `activePreviewTab` value flows into `[id]="'panel-' + activePreviewTab"` and `[attr.aria-labelledby]="'tab-' + activePreviewTab"` — it is constrained to values from the `previewTabs` readonly array (`['seeker', 'employer', 'tracking', 'video', 'signals']`), all hardcoded strings.

XSS (main portal): PASS.

---

### Check 7: IDOR via FE — PASS

The `applicationId` used in `selectStatus()` is derived as:
```
this.data && this.data.data && this.data.data.applicationId
```
`this.data` is populated from the NgRx store via the server response to `GET /job/applicants?id=<jobId>`. The `applicationId` in that response is a server-assigned value (`APPL-XXXXXX`). The recruiter does not type or construct this value — it flows server → store → dialog data. There is no URL parameter or form input the recruiter could manipulate to substitute a different application ID client-side.

Additionally, even if a recruiter somehow obtained a foreign `applicationId` and crafted a request directly, the BE BOLA check (Check 2 above) would reject it with 403.

IDOR via FE: PASS.

---

### Check 8: Analytics PII Leak — PASS

**File:** `public-portal-analytics.service.ts`

`trackHeroCTAClicked('find_jobs', 'home')` calls `this.track('hero_cta_clicked', { cta: 'find_jobs', page: 'home' })`. The payload contains only:
- `cta`: a typed literal union `'find_jobs' | 'start_hiring'` (hardcoded at call site).
- `page`: the string `'home'` (hardcoded at call site).

No user identifiers, no email addresses, no session tokens, no IP addresses, no names are sent. If `gtag` is present it receives only `{ cta, page }`.

The analytics service comment explicitly states: "Payload is always route/section/ctaId metadata only, never user input or PII." This is verified by inspection of all call sites in `main-portal.component.ts`.

Analytics PII: PASS.

---

### Check 9: Image onerror Handler — PASS

**File:** `main-portal.component.html` lines 116, 357

```html
(error)="$any($event.target).style.display='none'"
```

This is a style property assignment — `style.display='none'`. It does not write to `innerHTML`, `outerHTML`, `src`, `href`, or any attribute that could trigger code execution. The `$any()` cast is an Angular template type-cast helper with no runtime effect. No XSS vector. Safe.

Image onerror handler: PASS.

---

### Check 10: Optional Chaining / Nullish Coalescing in BE — PASS

The audit brief flags `?.` and `??` as P1 runtime risks on Node 14 / Acorn 6/7.

Full scan of `applicationController.js` and `application.service.js` found **zero** occurrences of `?.` or `??` in the new `updateApplicationStatus` handler or the service function it calls.

All defensive checks use the compatible form:
- `error && error.code` (not `error?.code`)
- `err && err.message ? err.message.substring(0, 80) : 'unknown'` (not `err?.message`)
- `!callerCompany || Array.isArray(callerCompany)` (not `callerCompany?.companyId`)

Optional chaining / nullish coalescing: PASS.

---

### Check 11: console.log Sensitive Data — PASS (minor note)

**Main portal component:** Zero `console.log` calls.

**BE `application.service.js`:** The `updateApplicationStatus` service logs:
- `APPLICATION_STATUS_CHANGE_EMAIL_SUPPRESSED_NOOP` — contains `applicationId`, `statusId`. Not PII, not a credential.
- `APPLICATION_STATUS_CHANGE_EMAIL_QUEUED` — contains `applicationId`, `oldStatusId`, `newStatusId`, `newStatusLabel`. Not PII.
- `APPLICATION_STATUS_CHANGE_EMAIL_SUPPRESSED_NO_EMAIL` — contains `applicationId`. Not PII.
- Error paths truncate `err.message` to 80 chars before logging — no raw stack with secrets.

No passwords, tokens, emails, or secrets are logged. Logged identifiers are internal DB keys. See P3-01 for the log-aggregation consideration.

---

### Check 12: Public Page Sensitive Data — PASS

`main-portal.component.ts` contains only:
- `uspPillars` — hardcoded marketing copy and local SVG paths.
- `differentiators` — hardcoded feature descriptions and Unicode emoji.
- `jobSeekerJourney` / `employerJourney` — hardcoded step descriptions.
- `heroProofChips` — hardcoded string labels.
- `previewTabs` — hardcoded tab IDs.

No API calls, no user data, no tokens, no server-side data is rendered on this page. The `ngOnInit` calls `coreService.isLoggedIn()` only to redirect authenticated users to their dashboard — no user data is rendered on the public page. The SEO calls (`setPageMeta`, `setOrganizationJsonLd`, `setWebsiteJsonLd`) write only static SEO metadata.

Public page sensitive data: PASS.

---

## BE AUTHORIZATION CHAIN SUMMARY

```
PUT /application/status
  └─ verifyAuth middleware       → rejects if token missing/invalid (401)
  └─ updateApplicationStatus()   → extracts uid from verified JWT only
      └─ validates applicationId + newStatusId (null/range guard)
      └─ getUserCompanyForRequest(req, uid)
          └─ getUserCompany(uid)  → derives companyId from DB via uid (JWT-sourced)
          → rejects if caller has no company (403)
      └─ updateApplicationStatusService(applicationId, newStatusIdInt, callerCompanyId)
          └─ SELECT ja.* JOIN jobs j ON j.job_id = ja.job_id WHERE ja.job_application_id = $1
          → throws APPLICATION_NOT_FOUND if applicationId does not exist (404)
          └─ if (app.company_id !== callerCompanyId) → throws FORBIDDEN (403)
          └─ no-op check: if oldStatusId === newStatusIdInt → return noop (200, no DB write)
          └─ UPDATE job_applicants SET application_status_id = $1 WHERE job_application_id = $2
```

**Result: PASS.** The ownership chain is complete and cannot be bypassed via request body manipulation.

---

## FIXES APPLIED

None. No code changes were needed — all checks passed. The audit is read-only.

---

## EXTERNAL ACTIONS REQUIRED

1. **(P3-01) Structured logging for production:** Before public launch, replace `console.log` in `application.service.js` with a structured logger (e.g., `pino` or `winston`) that supports log-level filtering. This prevents internal application IDs from appearing in aggregated logs at `INFO` level. Affects: BE `services/application.service.js` lines ~316–355.

2. **(Operational) Rate limiting on PUT /application/status:** Not audited in this pass, but the endpoint is authenticated and ownership-checked — rate limiting would add defense-in-depth against an authenticated recruiter hammering the endpoint. Existing BE `writeLimiter` middleware should be confirmed as applied to this route in `server.js`.

3. **(Operational) Nosniff / security headers:** Confirm `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY` are set at the Linode/nginx layer for all API responses. Not in scope of this code audit but should be verified before public launch.

---

## RELEASE GATE

**GO WITH CAUTION**

- No P0s (authentication bypass, BOLA, SQLi, XSS).
- No P1s (runtime crashes, Node 14 incompatible syntax).
- Two P3 items (log verbosity, emoji in source) are informational and do not block release.
- One P2 item (snack bar copy inconsistency) is cosmetic.

The `PUT /application/status` endpoint is correctly gated by `verifyAuth`, validates input, checks ownership, and uses parameterized SQL throughout. The FE status picker is safe (hardcoded options, no innerHTML). The main portal is fully static with no user data rendered. This deployment is safe to go live as-is; address P3-01 before any log aggregation infrastructure is introduced.
