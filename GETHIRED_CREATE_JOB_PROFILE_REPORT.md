# GETHIRED CREATE JOB — PROFILE REPORT
**Scope:** `/recruiter/jobs/create` — how job data quality affects applicant profile matching and discovery
**Date:** 2026-06-26
**Note:** PROFILE is primarily applicant-side. This report covers how the job creation form data feeds into applicant match signals.

---

## Job Data → Applicant Profile Match Chain

```
Job Create Form Fields
  └→ MATCH ENGINE (deterministic scoring)
       ├─ jobTitle → matched against applicant.job_target, experience.job_title
       ├─ requirements[] → matched against applicant skills/experience
       ├─ goodToHave[] → secondary match signals (non-blocking)
       ├─ educationalBackground[] → matched against applicant education
       ├─ certificationRequirements[] → matched against applicant certifications
       ├─ salaryMinimum/Maximum → matched against applicant.salary_expectation
       ├─ workSetupId → matched against applicant.work_preference
       ├─ jobCity/jobCountry → matched against applicant.location
       └─ industryId/jobRoleId → topic classification for relevance ranking
```

---

## Field Completeness Impact on Match Quality

| Field | Match Engine Use | Impact if Empty |
|---|---|---|
| `jobTitle` | Primary title match | Missing = poor title match |
| `requirements` | Explicit skill signals | Missing = fuzzy matching only |
| `goodToHave` | Secondary signal | Missing = no preference ordering |
| `educationalBackground` | Education threshold | Missing = no education filter |
| `certificationRequirements` | Credential gate | Missing = applicants without certs aren't filtered |
| `salaryMinimum` / `salaryMaximum` | Salary range match | Missing = no salary signal, candidates can't self-filter |
| `workSetupId` | Remote/hybrid/onsite preference | Missing = all preferences match equally |
| `industryId` | Industry alignment | Missing = weakens topic relevance |
| `skills` (Step 2) | Explicit skill requirements | Missing = fuzzy matching only |
| `jobCity` + `jobCountry` | Location proximity | Missing = breaks local job discovery |

---

## Job Readiness Bar (B13) Integration

The Job Readiness Bar is already integrated — it reads form values in real-time via `debounceTime(300)` and evaluates:
- Required fields: jobTitle, jobCity, jobCountry, jobDescription, workSetupId, jobTypeId, jobLevelId, jobBanner
- Optional enrichment: requirements, goodToHave, skills, salary, industry, certifications

This means recruiters already get live feedback on profile-affecting fields. The integration is complete and working.

**One gap:** `certificationRequirements` is NOT currently included in `JobReadinessService.evaluate()`. Since this is the most differentiating signal for healthcare/legal/engineering roles, it should contribute to the readiness score.

---

## Recommended Additions to JobReadinessService

```typescript
// Add to evaluate() method — reward for adding certification requirements
if (data.certificationRequirements && data.certificationRequirements.length > 0) {
  score += 10; // adds 10 pts to readiness
  chips.push({ id: 'certifications', label: 'Certifications', status: 'complete', section: 'certificationRequirements' });
} else {
  chips.push({ id: 'certifications', label: 'Add certifications/licenses', status: 'missing', section: 'certificationRequirements' });
}
```

---

## Applicant-Facing Impact Summary

| Recruiter Action | Applicant Experience |
|---|---|
| Fills requirements | Applicants see exact match signals on job card |
| Sets salary range | Applicants can self-filter; salary shown on job detail |
| Sets workSetupId | Job card shows "Remote" / "Hybrid" / "On-site" badge |
| Adds certificationRequirements | Only qualified applicants apply → better signal-to-noise |
| Sets expiration date (currently missing) | Job doesn't appear stale in "posted X days ago" signal |
