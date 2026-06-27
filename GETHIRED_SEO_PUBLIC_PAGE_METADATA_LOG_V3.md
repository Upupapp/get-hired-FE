# GETHIRED SEO Public Page Metadata Log V3

Generated: 2026-06-25

## Changes Made

### /home — MainPortalComponent
File: `src/app/public/main-portal/main-portal.component.ts`

**Before:** `this.titleService.setTitle('GetHired Online | Jobs and Hiring Platform')` in constructor only. No description, no robots, no canonical, no OG.

**After (ngOnInit):**
```
title:       "GetHired Online — Jobs and Hiring Platform in the Philippines"
description: "Find jobs, build your profile, post jobs, and manage hiring with GetHired Online — the modern hiring platform for the Philippines."
canonical:   "https://gethiredonline.app/home"
robots:      "index, follow"
```
Also calls: `setOrganizationJsonLd()`, `setWebsiteJsonLd()`.

---

### /jobs — PublicListComponent
File: `src/app/public/public-list/public-list.component.ts`

**Before:** No meta at all. Empty constructor.

**After (ngOnInit):**
```
title:       "Browse Jobs in the Philippines | GetHired Online"
description: "Search thousands of job opportunities in the Philippines. Apply online and track your applications with GetHired Online."
canonical:   "https://gethiredonline.app/jobs"
robots:      "index, follow"
```
Also calls: `setBreadcrumbJsonLd([Home, Jobs])`.

---

### /jobs/details/:id — PublicDetailsComponent
File: `src/app/public/public-details/public-details.component.ts`

**Before:** No meta at all.

**After (once job data arrives via details$ observable):**
```
title:       "{jobTitle} at {companyName} | GetHired Online"
description: "Apply for {jobTitle} at {companyName}. View job details, location, requirements, and apply on GetHired Online."
canonical:   "https://gethiredonline.app/jobs/details/{jobId}"
robots:      "index, follow" (only when jobStatusId === 2)
             "noindex, nofollow" (for unpublished/expired/deleted jobs)
ogType:      "article"
```
Also calls: `setBreadcrumbJsonLd([Home, Jobs, {jobTitle}])`.
Also calls: `setJobPostingJsonLd(job)` when jobStatusId === 2.
ngOnDestroy: clears JobPosting and BreadcrumbList JSON-LD.

---

### /jobs/search/:keyword — PublicSearchComponent
File: `src/app/public/public-search/public-search.component.ts`

**After (ngOnInit):**
```
title:       '"{keyword}" Jobs in the Philippines | GetHired Online' (or generic if no keyword)
description: Dynamic based on keyword
canonical:   "https://gethiredonline.app/jobs" (canonical points to clean jobs page — no search params)
robots:      "noindex, follow"
```

---

### /job-seekers — JobSeekerPortalComponent
File: `src/app/public/job-seeker-portal/job-seeker-portal.component.ts`

**Before:** `this.titleService.setTitle('Find Jobs Online | GetHired Online')` in constructor only.

**After (ngOnInit):**
```
title:       "Find Jobs in the Philippines | GetHired Online"
description: "Discover job opportunities in the Philippines. Build a profile, upload your CV, and apply for jobs with GetHired Online."
canonical:   "https://gethiredonline.app/job-seekers"
robots:      "index, follow"
```

---

### /employers — EmployerPortalComponent
File: `src/app/public/employer-portal/employer-portal.component.ts`

**Before:** `this.titleService.setTitle('Hire Employees Online | GetHired for Employers')` in constructor only.

**After (ngOnInit — class now implements OnInit):**
```
title:       "Post Jobs and Hire Online in the Philippines | GetHired Online"
description: "Post jobs, review structured applicants, and manage your hiring process with GetHired Online — the modern hiring platform for the Philippines."
canonical:   "https://gethiredonline.app/employers"
robots:      "index, follow"
```

---

### /companies/details?id=... — PublicCompanyDetailsComponent
File: `src/app/companies/public-company-details/public-company-details.component.ts`

**Before:** No meta at all.

**After (once company data arrives):**
```
title:       "{companyName} | GetHired Online"
description: "Learn about {companyName} and view their open jobs on GetHired Online."
canonical:   "https://gethiredonline.app/companies/details?id={companyId}"
robots:      "index, follow"
```
Also calls: `setBreadcrumbJsonLd([Home, Companies, {companyName}])`.

---

### /signin — SigninComponent
File: `src/app/auth/signin/signin.component.ts`

**After (ngOnInit):**
```
title:       "Sign In | GetHired Online"
description: "Sign in to your GetHired Online account."
robots:      "noindex, nofollow"
```

---

### ** (404) — ErrorNotFoundComponent
File: `src/app/views/error-page/error-not-found/error-not-found.component.ts`

**After (ngOnInit):**
```
title:       "Page Not Found | GetHired Online"
description: "The page you are looking for could not be found. Browse available jobs or return to the GetHired Online homepage."
robots:      "noindex, follow"
```

## index.html Default Meta (Updated)
The `<head>` defaults in `src/index.html` are the last-resort fallback before Angular hydrates.
Updated title and description to match the homepage values. Removed the duplicate viewport meta.
Google Search Console verification tag preserved as-is.
