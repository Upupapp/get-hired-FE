# GetHired STITCH — LAUNCH-01/02 P0 Integration Report
**Commits:** BE `072b88a`, FE `e549cdc`
**Date:** 2026-06-26

---

## Integration Verdict: PASS

All contracts verified. New endpoint wired BE↔FE via existing application NgRx flow.

---

## API Contract — POST /application/apply (enriched)

### Request (unchanged)
`POST /application/apply`  
Auth: `verifyAuth` JWT

### Response (new fields added)
```json
{
  "data": {
    "jobApplicantionId": "uuid",
    "jobId": 123,
    "jobTitle": "Senior Developer",
    "companyName": "Acme Corp",
    "dateApplied": "2026-06-26T...",
    "candidateId": "firebase-uid",
    "applicationStatusId": 1,
    "statusLabel": "Application received"
  }
}
```

**New fields**: `jobTitle`, `companyName`, `statusLabel`  
**Backwards compatible**: all existing fields preserved

---

## API Contract — PUT /application/status (new)

### Request
```
PUT /application/status
Authorization: Bearer <JWT>
Content-Type: application/json

{ "applicationId": "uuid", "newStatusId": 3 }
```

### Response — update
```json
{
  "data": {
    "updated": true,
    "applicationId": "uuid",
    "oldStatusId": 2,
    "newStatusId": 3,
    "newStatusLabel": "Under review"
  }
}
```

### Response — no-op
```json
{
  "data": {
    "updated": false,
    "reason": "no_change",
    "applicationId": "uuid"
  }
}
```

### Error responses
- 400: `{ "error": "applicationId and newStatusId are required." }`
- 400: `{ "error": "Invalid status. Must be an integer between 1 and 6." }`
- 403: `{ "error": "Forbidden." }`
- 404: `{ "error": "Application not found." }`
- 500: `{ "error": "Unable to update application status. Please try again." }`

---

## NgRx Integration

### Action shape — `submitApplicationFail`
```typescript
{ payload: string, errorCode?: string }
```
`errorCode = 'JOB_APPLICATION_ALREADY_EXISTS'` when HTTP 409.

### Selector contract — `getSubmitResult`
```typescript
{ success: string | null, error: string | null, errorCode: string | null }
```

### `submitResult$` emission pattern
Initial state emits `{ success: null, error: null, errorCode: null }` — filtered in `afterSubmit()` before acting.

---

## Email Integration Contract

| Event | Template | Safe data only |
|-------|----------|---------------|
| Application confirmed | `application` | job_name, company_name, first_name, status_label, app_url |
| Status changed | `application_status_changed` | job_name, company_name, first_name, status_label, app_url |

Both non-blocking: `.catch()` after `send()`.

---

## Known Integration Gap

`PUT /application/status` is live on BE but not yet wired to the employer portal FE. Employer must call it via direct HTTP for now (A-05 in ACTIONS backlog).
