# GETHIRED_PUBLIC_JOB_DETAIL_FIX_LOG_V8

Command: GETHIRED_PUBLIC_JOB_DETAIL_ACTUAL_PAGE_REMEDIATION_CONTENT_SCHEMA_APPLY_FULLSTACK_V8
Date: 2026-06-30
Branch: master (FE), main (BE)

## Pre-existing state (already implemented before V8)

The following V8 requirements were ALREADY shipped in prior commands and verified in code:

| Feature | Component | Status |
|---------|-----------|--------|
| Privacy boilerplate detection | `job-posts-details.component.ts:isPrivacyBoilerplate()` | ✅ Done |
| Empty section suppression (`*ngIf` guards) | `job-posts-details.component.html` | ✅ Done |
| Interview questions guard (`length > 0`) | `job-posts-details.component.html:318` | ✅ Done |
| Salary normalizer (no dangling dash on public page) | `public-job-normalizer.service.ts:formatSalary()` | ✅ Done |
| Sticky apply rail (desktop) | `job-posts-details.component.html:365–413` | ✅ Done |
| Mobile sticky bar (scroll > 300px) | `job-posts-details.component.html:417–436` | ✅ Done |
| Match panel | `app-job-match-panel` | ✅ Done |
| Company snapshot card | `app-company-snapshot` | ✅ Done |
| Video interview badge | `app-video-interview-badge` | ✅ Done |
| Save/Share actions | `toggleSave()`, `getShareableLink()` | ✅ Done |
| BOLA/UID probe guard | `jobsController.js:getJobDetails` | ✅ Done |
| SSR 404 for error pages | `job-posts-details.component.ts:response.status(404)` | ✅ Done |
| SEO canonical URL | `seoService.setCanonical()` | ✅ Done |
| Safety / no-fees notice | `job-posts-details.component.html:348–360` | ✅ Done |
| Logged-out returnUrl for apply | `toLogin()` → `localStorage.setItem('returnURL', url)` | ✅ Done |

## V8 code changes applied

### 1. Footer copyright year — `footer.component.html` + `footer.component.ts`
- **Before:** Hardcoded `Copyright © 2022 GetHired. All rights reserved.`
- **After:** Dynamic `Copyright © {{ currentYear }} GetHired. All rights reserved.` (currentYear = `new Date().getFullYear()`)
- **Risk:** None — additive property on FooterComponent
- **Verification:** Footer renders current year on any render

### 2. Admin sidebar copyright — `admin-sidebar.component.html`
- **Before:** `© 2022 Gethired`
- **After:** `© 2026 GetHired`
- **Risk:** None

### 3. Applicant sidebar copyright — `applicant-sidebar.component.html`
- **Before:** `© 2022 Gethired`
- **After:** `© 2026 GetHired`
- **Risk:** None

### 4. Employer sidebar copyright — `employer-sidebar.component.html`
- **Before:** `© 2024 GetHired`
- **After:** `© 2026 GetHired`
- **Risk:** None

### 5. Salary dangling dash — `job-details-sidecard.component.html`
- **Before:** `{{data?.salaryMinimum | currency}} - {{data?.salaryMaximum | currency}}` — no null guards, producing `₱80,000.00 -` when max is null
- **After:** Four `ng-container` branches: both present (range), min-only, max-only, neither → "Salary not listed"
- **Used in:** `job-post-details` and `job-post-details-apply` (application flow sidecard), NOT the main public `/jobs/details/:id` route
- **Risk:** Low — purely additive null-guard logic, same visual output when both values present
- **Verification:** Application flow sidecard no longer shows dangling dash

### 6. Privacy boilerplate markers — `job-posts-details.component.ts:isPrivacyBoilerplate()`
- **Before:** 14 markers (threshold: 2+ matches)
- **After:** 23 markers — added Philippine Data Privacy Act specifics: `pursuant to`, `implementing rules`, `confidential all personal`, `right to be informed`, `data subject`, `processing of personal`, `national privacy commission`, `privacy notice`, `lawful basis`
- **Why:** San Miguel Corporation's privacy policy contains Philippine-specific legal language that the original marker set may not have caught reliably at the 2-match threshold
- **Risk:** None — only suppresses description when 2+ markers match; legitimate job descriptions won't contain these phrases

## Files changed

| File | Type |
|------|------|
| `src/app/shared/components/footer/footer.component.html` | FE |
| `src/app/shared/components/footer/footer.component.ts` | FE |
| `src/app/admin-panel/admin-sidebar/admin-sidebar.component.html` | FE |
| `src/app/applicant-panel/applicant-sidebar/applicant-sidebar.component.html` | FE |
| `src/app/employer-panel/employer-sidebar/employer-sidebar.component.html` | FE |
| `src/app/jobs/job-details-sidecard/job-details-sidecard.component.html` | FE |
| `src/app/jobs/job-posts-details/job-posts-details.component.ts` | FE |

No BE changes required — BE salary formatting and DTO already correct.
