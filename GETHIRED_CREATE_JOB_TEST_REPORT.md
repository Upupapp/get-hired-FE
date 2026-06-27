# GETHIRED CREATE JOB — TEST REPORT
**Scope:** `/recruiter/jobs/create`
**Date:** 2026-06-26

---

## Current Coverage

| Component / Function | Spec File | Notes |
|---|---|---|
| `JobCreateComponent` | `job-create.component.spec.ts` — unclear if exists | Check |
| `JobPostDetailStepComponent` | `job-post-detail-step.component.spec.ts` | Exists — content unknown |
| `CreateJobPostStepComponent` | `create-job-post-step.component.spec.ts` | Exists |
| `PreviewJobPostStepComponent` | `preview-job-post-step.component.spec.ts` | Exists |
| `createJobs` (BE) | ❌ None | Critical — BOLA fix unprotected |
| `updateJob` (BE) | ❌ None | BOLA fix unprotected |

---

## Required Test Cases

### T-01 — createJobs BOLA Guard (BE, P0)
```javascript
// Authenticated employer tries to create job attributed to another company
// by passing companyId in body — BE must use JWT company, not body
POST /job/create { companyId: 'COM_OTHER', jobTitle: 'Fake', ... }
Expected: job created under caller's real company, not COM_OTHER
// The body companyId is now ignored (QA8 FIX-2)
```

### T-02 — updateJob BOLA Guard (BE, P0)
```javascript
// Employer from company A tries to update job belonging to company B
PUT /job/updatejobs { jobId: 'JB_FROM_COMPANY_B', jobTitle: 'Hacked' }
Expected: 403 { message: "You don't have permission to update this job." }
```

### T-03 — publishJobPost() Validation Gate (FE component, P1)
```typescript
// Publish blocked when required fields missing
component.jobForm.patchValue({ initialData: { jobTitle: null } });
component.publishJobPost();
expect(jobFacade.saveJob).not.toHaveBeenCalled();
expect(snackbarService.warning).toHaveBeenCalledWith(
  jasmine.stringContaining("can't be published yet"), '', 5000
);
```

### T-04 — saveAsDraft() Dual-Submit Guard (FE component, P1)
```typescript
// Clicking "Save as Draft" twice while first save is in-flight must not send two requests
component.savingDraft = true;
component.saveAsDraft();
expect(jobFacade.saveJob).not.toHaveBeenCalled(); // guarded by [disabled]
```

### T-05 — afterSubmit 'published' → navigate to dashboard (FE component, P1)
```typescript
// After published event, should navigate to job dashboard with jobId param
component.jobId = 'JB123456';
component.afterSubmit('published');
// after dialog closed
expect(router.navigate).toHaveBeenCalledWith(
  ['/recruiter/jobs/dashboard'], { queryParams: { id: 'JB123456' } }
);
```

### T-06 — Banner Size Limit (FE component, P2)
```typescript
// File over 300MB shows warning and does NOT push to bannerSelected
const oversizedEvent = [{ size: 300000001, file: 'data', filename: 'big.jpg', type: 'image/jpeg' }];
component.getBanner(oversizedEvent);
expect(component.bannerSelected.length).toBe(0);
expect(snackbarService.warning).toHaveBeenCalledWith('Banner size too large', '');
```

### T-07 — addBadge Max 3 (FE component, P2)
```typescript
// Adding 4th badge shows warning and does NOT push
// Pre-populate 3 badges
component.badges = ... // 3 items
component.addBadge({ id: 4, name: 'Extra', icon: 'icon.png' });
expect(component.badges.length).toBe(3);
expect(snackbarService.warning).toHaveBeenCalled();
```

### T-08 — setFormGroup subscription leak guard (FE component, P1)
```typescript
// Calling setFormGroup() twice must not accumulate duplicate statusChanges listeners
component.setFormGroup();
component.setFormGroup(); // second call (simulates editJob$ emitting twice)
// formSubs should have been unsubscribed and re-created, not doubled
// Verify via spy on Subscription.unsubscribe
```

---

## Test Pyramid

```
E2E Smoke (1):    Create job step 1→4 → publish → lands on job dashboard
Integration (2):  BE: createJobs BOLA | updateJob BOLA
Component (3):    publishJobPost gate | afterSubmit nav | draft guard | badge max
Unit (4):         formatJob() output shape | formatBadgesGetId()
```

---

## Priority

| Priority | Test | Risk if missing |
|---|---|---|
| P0 | T-01, T-02 — BOLA regressions | Ownership fix reverted silently |
| P1 | T-03 — publish gate | Missing fields accepted silently |
| P1 | T-05 — publish nav | Broken flow after success |
| P1 | T-08 — subscription leak | Memory leak on long edit sessions |
| P2 | T-04, T-06, T-07 | UX edge cases |
