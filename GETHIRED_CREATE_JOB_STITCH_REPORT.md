# GETHIRED CREATE JOB — STITCH REPORT
**Scope:** `/recruiter/jobs/create` — FE↔BE API contracts
**Date:** 2026-06-26

---

## Contract 1: Create Job

- **FE call:** `JobFacade.saveJob(job)` → `JobService.saveJob()` → `POST /job/create`
- **FE sends:** `formatJob(status)` = merge of `initialData + jobInfo + interview + companyId (localStorage) + jobStatusId + jobId`
- **BE reads:** destructures from `req.body`, ignores `req.body.companyId` (uses JWT-derived companyId instead — QA8 FIX-2) ✅
- **Key field alignments:**

| FE field | BE destructure | DB column | Aligned? |
|---|---|---|---|
| `jobTitle` | `jobTitle` | `job_title` | ✅ |
| `jobTypeId` | `jobTypeId` | `job_type_id` | ✅ |
| `jobLevelId` | `jobLevelId` | `job_level_id` | ✅ |
| `jobCategoryId` | `jobCategoryId` | `job_category_id` | ✅ |
| `workSetupId` | `workSetupId` | `work_setup_id` | ✅ |
| `jobAddress` | `jobAddress` | `job_address` | ✅ |
| `jobCity` | `jobCity` | `job_city` | ✅ |
| `jobCountry` | `jobCountry` | `job_country` | ✅ |
| `jobDescription` | `jobDescription` | `job_description` | ✅ |
| `jobDuties` | `jobDuties` | `job_duties` | ✅ |
| `bannerFile` (array FormGroup) | `bannerFile` → `bannerFile[0].file` | `job_banner` (URL after upload) | ✅ |
| `salaryMinimum` | `salaryMinimum` | `salary_minimum` | ✅ |
| `salaryMaximum` | `salaryMaximum` | `salary_maximum` | ✅ |
| `salaryCurrency` | `salaryCurrency` | `salary_currency` | ✅ |
| `rate` | `rate` | `rate` | ✅ |
| `badges` (array of IDs after `formatBadgesGetId`) | `badges` | `job_badges` (via `saveJobArray`) | ✅ |
| `requirements` (array of strings) | `requirements` | `job_requirements` | ✅ |
| `goodToHave` | `goodToHave` | `job_good_to_have` | ✅ |
| `educationalBackground` | `educationalBackground` | `job_educational_background` | ✅ |
| `skills` | `skills` | `job_skills` | ✅ |
| `tags` | `tags` | `job_tags` | ✅ |
| `certificationRequirements` | `certificationRequirements` | `job_certification_requirements` | ✅ |
| `interviewQuestions` | `interviewQuestions` | template → questions | ✅ |
| `companyId` (from localStorage) | **IGNORED** — JWT-derived | `company_id` | ✅ (BOLA safe) |
| `jobStatusId` | `jobStatusId` | `job_status_id` | ✅ |
| `jobId` | `jobId` | used for UPDATE only | ✅ |

---

## Contract 2: Update Job

- **FE call:** same `JobFacade.saveJob(job)` — same payload
- **BE:** `PUT /job/updatejobs` → `updateJob`
- **BOLA:** `getJobCompanyId(jobId)` confirms caller's company owns the job before updating ✅
- **Concern:** `jobId` comes from `?id` query param, set in `ngOnInit`: `this.jobId = params.id` — no validation that this is a real job ID. If absent, `PUT /job/updatejobs { jobId: null }` will either fail the ownership check or match nothing.

---

## Contract 3: Load Job for Edit

- **FE call:** `JobFacade.getJobById(this.jobId)` → `GET /job/...` (endpoint not read in this pass)
- **BE maps response via `mappedJob()`** — FE reconstructs FormArrays from the mapped job in `setFormGroup(data)`
- **Concern:** `certificationRequirements` must arrive as `[{ id, name, type, importance, issuingAuthority, expiryRequired, verificationRequired }]` for the FE FormGroup builder to populate it. If BE returns different casing, the checkboxes (`expiryRequired`, `verificationRequired`) will silently be `null`.

---

## Contract Mismatch Summary

| ID | Type | Description | Severity |
|---|---|---|---|
| CM-01 | Missing field | `expirationDate` destructured in BE but never sent by FE | Low (nullable, jobs never auto-expire) |
| CM-02 | Unvalidated param | `jobId` from query param — no client-side validation format | Low |
| CM-03 | Potential casing | `certificationRequirements` subfields must match exactly between `mappedJob()` and FE FormGroup | Medium — verify in BE `saveJobArray` response |
| CM-04 | Base64 size | `bannerFile[0].file` is base64 — no client-side size limit means up to 400MB in the body | High (see SECURE report S-01) |

---

## Recommended Integration Fixes

1. **CM-04 (High):** Add `event[0].size <= 5 * 1024 * 1024` client-side check in `getBanner()`
2. **CM-03 (Medium):** Verify `mappedJob()` in `jobsController.js` returns camelCase subfields for `certificationRequirements`
3. **CM-01 (Low):** Add `expirationDate` field to Step 1 form or remove the destructure in the BE
