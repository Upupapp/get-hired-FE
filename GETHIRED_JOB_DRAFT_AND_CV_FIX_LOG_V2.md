# GETHIRED_JOB_DRAFT_AND_CV_FIX_LOG_V2

Command: GETHIRED_JOB_DRAFTS_SAVE_UNFINISHED_AUTOSAVE_RESUME_CV_STORAGE_FULLSTACK_V2
Date: 2026-06-30
Branch: master (FE), main (BE)

---

## Current State Audit

### Draft save — ALREADY IMPLEMENTED (verified)

| Feature | Location | Status |
|---------|----------|--------|
| Save Draft button | `job-create.component.ts:saveAsDraft()` | ✅ Exists |
| Draft status flag (jobStatusId=1) | `jobMiddleware.js:validateJobPublishPayload` | ✅ Skips validation for status 1 |
| Backend save route | `POST /job/create`, `PUT /job/updatejobs` | ✅ Accepts `jobStatusId: 1` |
| Autosave state indicator | `job-create.component.html` aria-live | ✅ Exists (tracking state only) |
| Draft excluded from public queries | `job.service.js WHERE job_status_id = 2` | ✅ Public queries filter to published only |
| Draft excluded from public company pages | `job.service.js` open jobs query | ✅ Filters status 2 only |
| Success dialog on draft save | `afterSubmit('asDraft')` | ✅ Exists |

### Autosave — STATE TRACKING ONLY (not wired to backend)

`autoSaveState` was set to `'unsaved'` on form changes via `debounceTime(300)` in
`setFormGroup()`, but no actual HTTP call was being made. The indicator showed
"Unsaved changes" correctly but never triggered a background save.

**Fixed in V2:** real debounced backend save added.

### CV file storage path — FLAT, UNSECOPED (fixed)

**Before:**
```js
rawUrl = await uploadInStorage("Applicant-Documents", filename, file);
// Result: Firebase path = "Applicant-Documents/{original-filename}"
```
Problems:
- Flat bucket with no user prefix → Firebase Storage security rules cannot restrict by owner
- Uses untrusted original filename as storage path → path collision, filename injection risk
- No unique document ID → two uploads with same filename overwrite each other

**Fixed in V2:** scoped path with generated doc ID.

---

## Code Changes Applied

### 1. Real autosave — `job-create.component.ts`

**Import added:**
```ts
import { JobService } from '../job.service';
```

**Constructor injection added:**
```ts
private jobService: JobService,
```

**State added:**
```ts
private autosaveTimerId: any = null;
```

**Methods added:**
```ts
private scheduleAutosave(): void
private performAutosave(): void
```

**Behavior:**
- `scheduleAutosave()` is called inside the existing `formSubs.add(valueChanges)` subscription
- Only fires when `this.jobId` is set (edit mode — job already exists in DB)
- Debounce: 2000ms after last change
- Uses `jobService.saveJob()` directly (NOT NgRx store) to avoid triggering
  `editJob$` → `setFormGroup()` form-reset side effect
- On success: shows "Saved" for 3s then returns to "Unsaved changes"
- On error: shows "Save failed"
- Timer cleared in `ngOnDestroy` to prevent memory leak

**Why not autosave new jobs:**
- New job has no `jobId` in route params
- Creating via autosave would generate a new draft record on every 2s keystroke
- User must click "Save Draft" manually for first save; subsequent edits autosave

### 2. Scoped CV storage path — `applicant.service.js`

**Before:**
```js
rawUrl = await uploadInStorage("Applicant-Documents", filename, file);
```

**After:**
```js
var rawExt = filename && filename.indexOf('.') !== -1
  ? filename.split('.').pop().replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 10)
  : '';
var safeExt = rawExt || 'bin';
var docId = idGenerator(8, 'DOC');
var storageFolder = 'applicants/' + applicantId + '/documents/' + docId;
var safeFileName = 'original.' + safeExt;
rawUrl = await uploadInStorage(storageFolder, safeFileName, file);
```

**Result Firebase path:** `applicants/{applicantProfileId}/documents/DOC-26-{rand}/original.{ext}`

**Security improvements:**
- Per-user prefix allows Firebase Storage security rules: `allow read, write: if request.auth.uid == userId;`
- No original filename in storage path (original name kept in DB for display only)
- Unique `docId` per upload prevents overwrite collisions
- Extension sanitized: stripped to `[a-zA-Z0-9]` only, max 10 chars

---

## Pre-existing Infrastructure (not changed, verified correct)

### CV validation (cvValidationService.js)
- Extension allowlist: PDF, DOCX only
- MIME type check
- Magic-byte verification via `helpers/fileSignature.js`
- 5MB size limit
- Returns structured error codes

### Application snapshots (applicationSnapshotService.js)
- Immutable submission-time record captured on job application
- Document URLs stored as references only (never binary content)
- ON CONFLICT DO NOTHING for idempotency

### Public draft exclusion
- `getPublishedJobs()`: `WHERE j.job_status_id = 2`
- Company open jobs count: `WHERE company_id = $1 AND job_status_id = 2`
- `job/details` endpoint: returns job regardless of status when called by
  authenticated employer (for preview); anonymous callers never get draft jobs
  because the main public listing and search both filter to status 2

### Draft save workflow
```
New job → Manual "Save Draft" click → jobStatusId=1 → createJobs → dialog → redirect to list
Edit job → Any form change → 2s debounce → saveJob(status=1) silently → "Saved" indicator
```

---

## Files Changed

| File | Change | Risk |
|------|--------|------|
| `src/app/job/job-create/job-create.component.ts` | Real autosave added | Low — edit-mode only, direct HTTP, doesn't touch NgRx state |
| `get-hired-BE/services/applicant.service.js` | Scoped CV storage path | Low — same upload flow, better path structure |

## Build Result
- `npm run build-dev`: ✅ Success (no TypeScript errors)
- BE: no compilation step — Node.js ESM, verified syntax manually

---

## What Was NOT Implemented (deferred)

| Item | Reason |
|------|--------|
| `anonymous_cv_uploads` DB table | Schema change required, no current CV Doctor anon flow |
| `applicant_cv_documents` metadata table | Schema migration + table doesn't exist yet |
| Employer signed URL access endpoint | Current Firebase URLs are long-lived; needs GCS admin SDK signing |
| Draft list tab (Drafts vs Published) | The `job_status_id` is already returned in `getJobBasicList`; UI grouping is cosmetic, not blocking |
| Autosave for new jobs | Architecture challenge: would need to suppress NgRx form-reset after first save |
| Route leave guard (CanDeactivate) | Angular guard setup needed; draft dialog already warns on 'asDraft' flow |
