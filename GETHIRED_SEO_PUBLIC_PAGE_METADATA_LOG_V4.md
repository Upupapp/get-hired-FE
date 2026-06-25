# GetHired SEO V4 — Public Page Metadata Log

Generated: 2026-06-26

## Status: All public pages PASS (no new changes required in V4)

All public page metadata was implemented in V3 and is confirmed present and correct in V4 code review.

## Page-by-Page Verification

### /home — MainPortalComponent
- Title: "GetHired Online — Jobs and Hiring Platform in the Philippines" ✓
- Description: "Find jobs, build your profile, post jobs, and manage hiring with GetHired Online — the modern hiring platform for the Philippines." ✓
- Canonical: https://gethiredonline.app/home ✓
- Robots: index, follow ✓
- OG title/description: set via setPageMeta ✓
- Organization JSON-LD: emitted ✓
- WebSite + SearchAction JSON-LD: emitted ✓

### /jobs — PublicListComponent
- Title: "Browse Jobs in the Philippines | GetHired Online" ✓
- Description: "Search thousands of job opportunities in the Philippines. Apply online and track your applications with GetHired Online." ✓
- Canonical: https://gethiredonline.app/jobs ✓
- Robots: index, follow ✓
- BreadcrumbList JSON-LD: Home > Jobs ✓
- Cleared on ngOnDestroy ✓

### /jobs/details/:id — PublicDetailsComponent (active job)
- Title: "[Job Title] at [Company] | GetHired Online" (from real data) ✓
- Description: "Apply for [Job Title] at [Company]. View job details, location, requirements, and apply on GetHired Online." ✓
- Canonical: https://gethiredonline.app/jobs/details/:id ✓
- Robots: index, follow (jobStatusId === 2) ✓
- OG type: article ✓
- JobPosting JSON-LD: emitted (active only) ✓
- BreadcrumbList JSON-LD: Home > Jobs > [Job Title] ✓
- Cleared on ngOnDestroy ✓

### /jobs/details/:id (inactive job)
- Robots: noindex, nofollow ✓
- JobPosting JSON-LD: NOT emitted ✓

### /job-seekers — JobSeekerPortalComponent
- Title: "Find Jobs in the Philippines | GetHired Online" ✓
- Description: "Discover job opportunities in the Philippines. Build a profile, upload your CV, and apply for jobs with GetHired Online." ✓
- Canonical: https://gethiredonline.app/job-seekers ✓
- Robots: index, follow ✓

### /employers — EmployerPortalComponent
- Title: "Post Jobs and Hire in the Philippines | GetHired Online" ✓
- Description: "Post jobs, review structured applicants, and manage your hiring process with GetHired Online — the modern hiring platform for the Philippines." ✓
- Canonical: https://gethiredonline.app/employers ✓
- Robots: index, follow ✓

### /companies/details — PublicCompanyDetailsComponent
- Title: "[Company Name] | GetHired Online" (from real data) ✓
- Description: "Explore [Company Name] on GetHired Online — view their company profile and open job positions in the Philippines." ✓
- Canonical: https://gethiredonline.app/companies/details?id=[id] ✓
- Robots: index, follow ✓
- BreadcrumbList JSON-LD: Home > Companies > [Company Name] ✓
- Note: /companies breadcrumb link points to /companies — route exists but returns empty list; minor UX issue, not an SEO bug.

### /jobs/search/:keyword — PublicSearchComponent
- Title: '"[keyword]" Jobs in the Philippines | GetHired Online' or generic ✓
- Canonical: https://gethiredonline.app/jobs (deduplication) ✓
- Robots: noindex, follow ✓

## OG Image Status

DEFAULT_OG_IMAGE = `https://gethiredonline.app/assets/images/logo.png`

`logo.png` confirmed to exist at `src/assets/images/logo.png`.

`src/assets/brand/gethired-og-default.png` does NOT exist — this is the P1 backlog OG image gap. The logo fallback is functional but not ideal for social sharing (logo is not 1200x630).

index.html comment correctly documents this gap and instructs future maintainer to replace the URL when the branded OG image is created.
