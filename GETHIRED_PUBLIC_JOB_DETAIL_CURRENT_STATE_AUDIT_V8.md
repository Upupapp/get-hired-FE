# GETHIRED_PUBLIC_JOB_DETAIL_CURRENT_STATE_AUDIT_V8

## Route

`/jobs/details/:id` → `public.module.ts` → `PublicDetailsComponent` → `app-job-posts-details` (`JobPostsDetailsComponent`)

## Component tree (public job detail)

```
PublicDetailsComponent (public-details.component.ts)
  └── app-job-posts-details (job-posts-details.component.ts)
        ├── app-inline-loading (loading state)
        ├── .job-detail-error-state (error state with retry)
        ├── .gh-detail-layout (two-column layout)
        │     ├── main.gh-detail-main
        │     │   ├── .gh-snapshot-grid (fact chips: type/setup/location/salary/level/industry/size)
        │     │   ├── badges row (*ngIf badges.length > 0)
        │     │   ├── app-video-interview-badge
        │     │   ├── app-job-match-panel
        │     │   ├── app-company-snapshot
        │     │   ├── sections card
        │     │   │   ├── "About this role" (*ngIf jobDescription — with privacy boilerplate guard)
        │     │   │   ├── "What you'll do" (*ngIf jobDuties)
        │     │   │   ├── "What you need" (*ngIf requirements.length > 0 || skills.length > 0)
        │     │   │   ├── "Education & background" (*ngIf educationalBackground.length > 0)
        │     │   │   ├── "Certifications & licenses" (*ngIf certificationRequirements.length > 0)
        │     │   │   ├── "Benefits & compensation" (*ngIf benefits.length > 0)
        │     │   │   └── "Nice to have" (*ngIf goodToHave.length > 0)
        │     │   ├── Tags (*ngIf tags.length > 0)
        │     │   ├── "How to apply" (always shown — CV requirement + video if hasVideoInterview)
        │     │   ├── "What happens next" (hiring timeline, video step conditional)
        │     │   ├── Interview questions (*ngIf interviewQuestions.length > 0)
        │     │   └── Safety / no-fees notice
        │     └── aside.gh-detail-rail (sticky right column)
        │           ├── Company logo / name
        │           ├── Salary (from normalizer — no dangling dash)
        │           ├── "Already applied" chip (*ngIf isApplied)
        │           ├── "Apply Now" CTA (*ngIf role === '3' && !isApplied)
        │           ├── "Sign In to Apply" CTA (*ngIf !userRole)
        │           ├── Register hint (*ngIf !userRole)
        │           └── Save / Share buttons
        └── .gh-mobile-sticky-bar (slides up after scroll > 300px)
```

## Backend

- Endpoint: `GET /job/details?id=:jobId` (via `jobsRoute.js`, middleware: `optionalVerifyAuth`)
- Controller: `jobsController.js:getJobDetails`
- Salary in DTO: `salaryMinimum`, `salaryMaximum`, `salaryCurrency` (raw numbers, formatted by FE normalizer)
- UID spoofing protection: BOLA guard rejects if `req.query.uid !== req.user.uid`
- No visibility guard on draft jobs: `jobDetails()` DB function needs verification

## Salary formatter

`PublicJobNormalizerService.formatSalary()`:
- Both null → "Salary not listed"
- Range (min ≠ max) → "PHP 60,000 - 80,000"
- Single value → "PHP 80,000" (no trailing dash)

## Privacy boilerplate detection

`JobPostsDetailsComponent.isPrivacyBoilerplate()`:
- 23 markers (threshold: 2+ matches)
- Suppresses description, shows: "The employer hasn't added a full job description yet."
- Does NOT show content to public candidates; no employer warning surfaced in public view

## Screenshot defects assessed

| Defect | Root cause | Status after V8 |
|--------|-----------|-----------------|
| San Miguel privacy text as description | Old markers may have missed Philippine DPA language | Fixed — 9 new markers added |
| Empty section headings | Old template had no `*ngIf` | Not present in current code — already fixed |
| Salary dangling dash (public page) | Old template | Not present in current code — normalizer handles it |
| Salary dangling dash (application sidecard) | `job-details-sidecard.component.html` missing null guard | Fixed in V8 |
| Empty interview questions card | Old template | Not present — already guarded with `*ngIf length > 0` |
| Footer 2022 copyright | Hardcoded in 4 files | Fixed in V8 — footer now dynamic, sidebars updated to 2026 |
| Apply CTA not visible | Old layout | Not present — sticky rail + mobile bar already in place |
