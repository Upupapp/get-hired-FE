# GETHIRED STITCH RECENT V4 — Status Update Integration Audit
Generated: 2026-06-26

## Scope
Primary: `PUT /application/status` employer-side status update flow (commit d3246b6).
Secondary: main-portal analytics bindings.

---

## Data Flow (Text Diagram)

```
[Employer UI: ApplicantActionModalComponent]
  | selectStatus(statusId, statusName)
  | Guard: applicationId present? No → snackBar, return
  | Guard: statusId === parseInt(currentStatusId) ? Yes → snackBar "already has this status", close, NO HTTP call
  v
[JobService.updateApplicationStatus(applicationId, newStatusId)]
  | PUT ${environment.api_url}/application/status
  | Body: { applicationId: string, newStatusId: number }
  | Headers: Authorization: "Bearer <firebase-token>" (AuthInterceptor → localStorage["token"])
  v
[BE server.js: app.use("/api", applicationRoutes)]
  | Mounted at /api → full path is PUT /api/application/status
  | Rate limiters: globalLimiter (500/15m) + writeLimiter (100/15m) applied
  v
[applicationRoute.js: router.put("/application/status", verifyAuth, updateApplicationStatus)]
  | verifyAuth: checks Authorization header for "Bearer <token>",
  |   calls firebaseAdmin.auth().verifyIdToken() → sets req.user = decodedIdToken
  v
[applicationController.js: updateApplicationStatus]
  | Validates: applicationId present, newStatusId defined (not null/undefined)
  | Validates: parseInt(newStatusId) is integer 1–6
  | Fetches callerCompany = getUserCompanyForRequest(req, uid) [request-scoped cache]
  | Guard: !callerCompany || Array.isArray(callerCompany) → 403
  | Calls updateApplicationStatusService(applicationId, newStatusIdInt, callerCompany.companyId)
  v
[services/application.service.js: updateApplicationStatus]
  | SELECT job_applicants JOIN jobs WHERE job_application_id = $1 AND not archived
  | Guard: no rows → throws APPLICATION_NOT_FOUND
  | Guard: app.company_id !== callerCompanyId → throws FORBIDDEN
  | No-op check: oldStatusId === newStatusIdInt → returns { noop: true }
  | UPDATE job_applicants SET application_status_id = $1, updated_at = NOW()
  |   WHERE job_application_id = $2 AND not archived RETURNING *
  | Fire-and-forget: send(applicant.email, 'application_status_changed', {...}) [non-blocking]
  | Returns { noop: false, applicationId, oldStatusId, newStatusId, newStatusLabel, ... }
  v
[applicationController.js: response]
  | noop path: 200 { success: true, data: { updated: false, reason: 'no_change', applicationId } }
  | success path: 200 { success: true, data: { updated: true, applicationId, oldStatusId,
  |                      newStatusId, newStatusLabel } }
  | error paths: 400 (validation), 403 (auth/ownership), 404 (not found), 500 (generic)
  v
[FE: subscribe success callback]
  | statusUpdating = false
  | snackBar: 'Status updated to "<statusName>".'
  | dialogRef.close({ statusUpdated: true, newStatusId, newStatusName })
  v
[JobApplicantsComponent.viewMenu afterClosed]
  | result.statusUpdated → this.jobFacade.getApplicants(this.jobId)
  | Dispatches NgRx action → GET /job/applicants?id=<jobId> → full list reload
```

---

## API Contract

### 1. Request shape match (FE → BE)
**PASS**
- FE sends: `{ applicationId: string, newStatusId: number }` (job.service.ts line 78)
- BE reads: `const { applicationId, newStatusId } = req.body` (applicationController.js line 249)
- Field names match exactly. BE does parseInt(newStatusId) defensively so a string number also works.

### 2. Route path and prefix
**PASS**
- FE calls: `${environment.api_url}/application/status`
  - Dev: `https://api-dot-get-hired-363107.et.r.appspot.com/api/application/status`
  - Prod: `https://api.gethiredonline.app/api/application/status`
- BE mounts: `app.use("/api", applicationRoutes)` + `router.put("/application/status", ...)`
  - Full path: `PUT /api/application/status` — matches exactly.

### 3. BE success response shape
**PASS with note**
- BE returns 200 with `{ success: true, data: { updated: true/false, applicationId, ... } }`
- FE success callback ignores the response body entirely (line 105: `() => { ... }`)
- This is fine — FE gets what it needs from the local `statusName` variable it already holds.
- No risk of FE breaking on a response shape change.

### 4. BE error response shape vs FE error handler
**PASS**
- BE errors: `{ success: false, message: "..." }` (via `errorResponse()` helper)
  OR for 403 auth: plain string `"Unauthorized"` / `"Token Expired. Login again."` from verifyAuth
- FE error handler: `(err.error && err.error.message) || 'Failed to update status. Please try again.'`
- Covers `errorResponse()` path. For 403 from verifyAuth (plain string body), `err.error.message`
  will be undefined → falls back to the generic message. Acceptable; no crash.

---

## Authorization Chain

### 1. Firebase auth middleware
**PASS**
- `verifyAuth` is applied to the route (applicationRoute.js line 41).
- Checks `Authorization: Bearer <token>` header.
- Calls `firebaseAdmin.auth().verifyIdToken()` → verified server-side with Firebase Admin SDK.
- Token is injected by AuthInterceptor reading `localStorage["token"]` which is stored as
  `"Bearer " + firebaseToken` at sign-in (signin.component.ts line 66). Format matches exactly.

### 2. Company ownership verification
**PASS**
- Controller fetches `callerCompany` via `getUserCompanyForRequest(req, uid)` — derives company
  from the authenticated UID only, never from the request body.
- Guards: `!callerCompany || Array.isArray(callerCompany)` → 403 if user has no company.
- Service does a second check: `app.company_id !== callerCompanyId` → throws FORBIDDEN.
- Company ID is fetched from the jobs table via JOIN in the service, not from the request.

### 3. Cross-company IDOR protection
**PASS**
- The service JOINs `job_applicants` to `jobs` in a single query:
  `SELECT ja.*, j.company_id FROM job_applicants ja INNER JOIN jobs j ON j.job_id = ja.job_id WHERE ja.job_application_id = $1`
- Then checks `app.company_id !== callerCompanyId`.
- A recruiter from Company B submitting a valid applicationId belonging to Company A gets a
  FORBIDDEN error (code 'FORBIDDEN' → 403 from controller). No data leakage.
- Controller also uses a distinct enumeration-safe pattern: uses the same FORBIDDEN error code
  for both "not found" and "wrong company" paths (APPLICATION_NOT_FOUND → 404, FORBIDDEN → 403).
  Note: 404 vs 403 is technically distinguishable but the application_id itself is not exposed
  in the error body — acceptable risk.

---

## No-op Detection

### FE-side
**PASS**
- FE checks `statusId === parseInt(currentStatusId, 10)` before making the HTTP call.
- `currentStatusId` comes from `this.data.data.jobApplicationStatusId` which is `application_status_id`
  from `mappedBasicApplicantDetails()` in job.service.js (confirmed line 660).
- Same-status click → snackBar "already has this status", dialog close, no HTTP call fired.

### BE-side
**PASS**
- BE independently re-reads `application_status_id` from DB (fresh read, not trusting FE).
- `if (oldStatusId === newStatusIdInt) return { noop: true }` (application.service.js line 314).
- Controller returns 200 `{ updated: false, reason: 'no_change' }` on no-op.
- Email is suppressed on no-op (the no-op return is before the email code).
- Both sides have independent no-op guards: defense in depth.

---

## Status Email

### Email on status change
**PASS**
- Email is sent via `send(applicant.email, 'application_status_changed', emailData)` after the DB
  UPDATE commits successfully.
- Non-blocking: `.catch()` handler logs the failure; a SendGrid error never reverts the DB update.
- Template `application_status_changed` is registered in `gethiredSendgrid` in mailer.js line 27.
  Current value reuses the `application` template ID (d-9775084a27d44a36834f0b43c8abe1fc).
  Noted in a comment as a P0 shortcut; dedicated template is deferred.

### Email on no-op
**PASS**
- No-op guard fires before the UPDATE and before the email block.
- No email is sent when status is unchanged.

### Applicant email lookup
**PASS with note**
- Service fetches applicant via `getUserProfileById(app.candidate_id)`.
- If `applicant.email` is missing or falsy, email is suppressed with a console.warn
  (`APPLICATION_STATUS_CHANGE_EMAIL_SUPPRESSED_NO_EMAIL`), not an error.
- The status update still completes and returns success even if email is unavailable.

---

## Data Integrity

### Column updated
**PASS**
- UPDATE sets `application_status_id = $1` on `job_applicants` table.
- DB column is `application_status_id int4 NULL` with FK to `job_applicant_status(job_applicant_status_id)`.
- FE reads this column back as `jobApplicationStatusId` via `mappedBasicApplicantDetails()`.
- After success, FE triggers `getApplicants(jobId)` → full reload → fresh `application_status_id`
  from DB → `jobApplicationStatusId` and `jobApplicationStatusName` both refreshed in the list.

### Response shape
**PASS**
- BE returns the new status info in the response body, but FE does not need it since it reloads
  the list. No optimistic-update mismatch risk.

### updated_at column
**PASS with note**
- UPDATE sets `updated_at = NOW()`. The DDL shows `job_applicants` did not originally have
  `updated_at` (only 6 columns listed in the snapshot audit). The query uses `RETURNING *` and
  does not fail if the column doesn't exist — it would throw a Postgres column-not-found error.
  Verify `updated_at` column exists on the production `job_applicants` table before relying on it.
  Status-update itself will fail if column is absent.

### List refresh
**PASS**
- `this.jobFacade.getApplicants(this.jobId)` dispatches `getJobApplicants` NgRx action.
- JobFacade.getApplicants dispatches `JobAction.getJobApplicants({ jobId })` (job.facade.ts line 48).
- This re-fetches `GET /job/applicants?id=<jobId>` which re-runs the full `jobApplicants()` query
  in job.service.js including the status JOIN. Full refresh, no stale state.

---

## BE Syntax Constraint Check (Node 14 / Acorn 6/7 — no `?.` or `??`)

**PASS**
- Zero `?.` occurrences in applicationController.js (grep confirmed).
- Zero `?.` occurrences in application.service.js (grep confirmed).
- Zero `??` occurrences in either file (grep confirmed).
- All null guards use `&&`, `||`, explicit `=== null`, `Array.isArray()`.

---

## Main Portal Integration Check

### Analytics bindings (main-portal.component.ts)
**PASS**
- `heroCTAFindJobs()`, `heroCTAStartHiring()`, `finalCTAFindJobs()`, `finalCTAStartHiring()`
  all call `this.analytics.track*()` then navigate. No async calls that could fail visibly.
- `PublicPortalAnalyticsService` is injected; if it throws, navigation still occurs (method calls
  are fire-and-forget, not awaited).

### Hero/final CTA bindings (main-portal.component.html)
**PASS**
- `(click)="heroCTAFindJobs()"` → method exists in TS.
- `(click)="heroCTAStartHiring()"` → method exists in TS.
- `trackBy: trackByIndex` on `heroProofChips` loop → `trackByIndex` defined in TS.
- No broken template bindings found in the first 100 lines reviewed.

---

## Findings Summary

| # | Severity | Item | Status |
|---|----------|------|--------|
| F1 | INFO | `application_status_changed` email reuses the `application` SendGrid template (same template ID as "application received" email). Applicant email copy may be confusing. | Known/deferred per inline comment |
| F2 | WARN | `updated_at = NOW()` in the UPDATE query — this column may not exist on the live `job_applicants` table. If absent, ALL status updates will fail with a Postgres error at runtime. Must verify column exists in production schema before go-live. | Needs verification |
| F3 | INFO | Dev `environment.ts` `api_url` points to `api-dot-get-hired-363107.et.r.appspot.com` (App Engine), not `api.gethiredonline.app` (Linode). Not a bug — dev env pointed at staging BE — but local testing goes to a different server than production. Expected, but worth noting. |
| F4 | INFO | FE error handler falls back to generic message for raw-string 403 responses from `verifyAuth` (no `err.error.message` field). Employer sees "Failed to update status. Please try again." instead of "Token Expired. Login again." Minor UX gap; not a bug. |
| F5 | INFO | `selectStatus()` doesn't disable the status buttons via a loading state visible to the user (only the "Updating..." text appears, buttons remain in DOM). The `[disabled]="statusUpdating"` IS present in the template — this is correct, not a bug. |

---

## Release Gate

**GO WITH CAUTION**

The integration is structurally sound:
- API contract matches exactly (path, method, body shape, auth).
- Authorization chain is solid: Firebase token verified server-side, company ownership double-checked in both controller and service.
- No-op detection is present on both FE and BE sides independently.
- Email is non-blocking and suppressed on no-op.
- Full list reload after success prevents stale state.
- No optional chaining (`?.` / `??`) in BE files.

**Single blocker to verify before relying on this endpoint in production:**
- F2: Confirm that `updated_at` column exists on `gethired.job_applicants` in the live Postgres DB.
  The UPDATE query will throw if this column is missing. Run:
  `SELECT column_name FROM information_schema.columns WHERE table_schema='gethired' AND table_name='job_applicants';`
  If absent, add it: `ALTER TABLE gethired.job_applicants ADD COLUMN updated_at TIMESTAMPTZ;`

Everything else is informational. Ship after confirming the column.
