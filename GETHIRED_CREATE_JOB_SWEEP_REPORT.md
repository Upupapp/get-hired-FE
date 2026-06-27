# GETHIRED CREATE JOB — SWEEP REPORT
**Scope:** `/recruiter/jobs/create` (Create/Edit Job flow, 4-step wizard)
**Date:** 2026-06-26

---

## Architecture Map

| Layer | Component | Module |
|---|---|---|
| Route shell | `EmployerJobcreateComponent` (wrapper) | `EmployerSettingsModule` |
| Wizard host | `JobCreateComponent` | `JobModule` |
| Step 1 — Job Details | `JobPostDetailStepComponent` | `JobModule` |
| Step 2 — Rates & Roles | `CreateJobPostStepComponent` | `JobModule` |
| Step 3 — Create Interview | `CreateInterviewComponent` | `JobModule` |
| Step 4 — Preview | `PreviewJobPostStepComponent` | `JobModule` |
| State | `JobFacade` → NgRx store | `JobModule` |
| BE | `POST /job/create` → `createJobs` | `jobsController.js` |
| BE (edit) | `PUT /job/updatejobs` → `updateJob` | `jobsController.js` |

---

## Functional Flow

```
ngOnInit
  ├─ localStorage.getItem('user') → companyId (for subscription check)
  ├─ jobFacade.getCompanySubscription(companyId) → restrictions$
  ├─ if ?id → getJobById() (edit mode)
  └─ setFormGroup() → builds reactive form + statusChanges subscriptions

publishJobPost()
  ├─ formatJob(2) → collects all step values + companyId from localStorage
  ├─ validates required fields inline
  └─ jobFacade.saveJob(job) → POST /job/create or PUT /job/updatejobs

afterSubmit(event)
  ├─ 'asDraft' → UpdatedDialogComponent → navigate to jobs list
  └─ 'published' → UpdatedDialogComponent → navigate to /recruiter/jobs/dashboard?id=...
```

---

## Step-by-Step Field Inventory

### Step 1 — Job Details (initialData group)
| Field | Required for Publish | Validation |
|---|---|---|
| jobTitle | ✅ (form Validators.required) | required |
| jobTypeId | ✅ (publishJobPost check) | select |
| jobLevelId | ✅ (publishJobPost check) | select |
| jobCategoryId | ❌ | select |
| workSetupId | ✅ (publishJobPost check) | button toggle |
| jobAddress | ❌ | text |
| jobCity | ✅ (Validators.required + publishJobPost) | text |
| jobCountry | ✅ (Validators.required + publishJobPost) | text |
| jobBanner | ✅ (publishJobPost: bannerFile[0] or jobBanner != "") | file upload, 300MB limit |
| jobDescription | ✅ (publishJobPost check) | textarea |
| jobDuties | ❌ | textarea |
| badges (FormArray) | ❌ | max 3 |
| requirements (FormArray) | ❌ | max 5 |
| goodToHave (FormArray) | ❌ | max 5 |
| educationalBackground (FormArray) | ❌ | max 5 |
| certificationRequirements (FormArray) | ❌ | max 10, name required per item |

### Step 2 — Rates & Roles (jobInfo group)
| Field | Required for Publish | Validation |
|---|---|---|
| industryId | ❌ | select |
| jobRoleId | ❌ | select |
| rate | ❌ | button toggle |
| salaryMinimum | ❌ | number |
| salaryMaximum | ❌ | number |
| salaryCurrency | ❌ | select |
| skills (FormArray) | ❌ | max 5 |
| tags (FormArray) | ❌ | max 5 |

### Step 3 — Interview (interview group, optional)
| Field | Required for Publish | Notes |
|---|---|---|
| interviewQuestions (FormArray) | ❌ | Made optional per B04 V5 |
| interviewTemplateId | ❌ | from templates |

---

## Issues Found

### Critical
- None (BE BOLA already fixed: `createJobs` derives `companyId` from JWT — QA8 FIX-2)

### High
- **CONSOLE LOGS:** 3 `console.log` calls leaking form data, file events, badge selections in `job-post-detail-step.component.ts` — **FIXED this session**

### Medium
- **Banner size limit:** `event[0].size <= 300000000` = 300MB — grossly overlarge for a job banner image. Should be 5MB. Currently any image under 300MB is accepted; the server will receive an enormous base64 payload.
- **Banner error message:** wrong-file-count branch showed "Banner size too large" even when size wasn't the issue — **FIXED this session** (changed to "Please upload a single image file")
- **`companyId` from localStorage:** `ngOnInit` still reads `companyId` from `localStorage.getItem('user')` for the subscription check. BE always re-derives companyId from JWT, so the FE localStorage value only controls which subscription plan is fetched on mount. Stale or spoofed localStorage data won't affect actual job ownership. Accepted.
- **Lorem ipsum placeholder** on Job Description textarea — **FIXED this session**

### Low
- Badge `<select>` uses `(click)` on `<option>` elements — unreliable in Firefox/Safari and not keyboard accessible
- `SubscriptionAlertComponent` dialog was `width: '34vw'` — **FIXED this session** → `min(560px, 95vw)`
- `setTimeout(() => this.delayControl = false, 900)` — 900ms arbitrary delay before fixed controls bar kicks in; should be tied to scroll/viewport readiness
- No `expirationDate` field visible in form but it's destructured in the BE `createJobs`

---

## Backend API Review

| Endpoint | Auth | BOLA | Notes |
|---|---|---|---|
| POST /job/create | ✅ verifyAuth | ✅ companyId from JWT (QA8 FIX-2) | Secure |
| PUT /job/updatejobs | ✅ verifyAuth | ✅ ownership check via getJobCompanyId | Secure |
| GET /job/basiclist | ✅ verifyAuth | ✅ companyId from JWT | Secure |

---

## Top 5 Immediate Concerns

1. Banner 300MB size limit — should be 5MB
2. ~~3 console.log PII leaks~~ **FIXED**
3. ~~Lorem ipsum placeholder on Job Description~~ **FIXED**  
4. Badge `<select>` keyboard accessibility (option click not keyboard-accessible)
5. `expirationDate` field missing from FE form but present in BE destructure
