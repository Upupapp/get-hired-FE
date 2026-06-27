# GETHIRED SEO Internal Linking & Breadcrumb Log V3

Generated: 2026-06-25

## BreadcrumbList JSON-LD Implementation

Implemented via `SeoService.setBreadcrumbJsonLd(items)` and cleared via `clearBreadcrumbJsonLd()`.

### Pages with BreadcrumbList

| Page | Breadcrumb path |
|------|----------------|
| /jobs | Home → Jobs |
| /jobs/details/:id | Home → Jobs → {jobTitle} |
| /companies/details?id= | Home → Companies → {companyName} |

## HTML Breadcrumb (Visual)
No visual breadcrumb component has been added — the JSON-LD is structured data only.
A visual breadcrumb component would improve UX and provide additional crawlable internal links. Deferred to backlog.

## Internal Linking Audit

### /home (main-portal.component.html)
- "Find jobs" button → `/jobs` (navigateByUrl)
- "Start hiring" button → `/employers` (navigateByUrl)
- "Browse jobs without an account" link → `/jobs`
- "Sign in" link → `/signin`
- Role portal cards → `/job-seekers`, `/employers`

These are Angular router navigations — rendered as button clicks, not `<a href>` tags. **This is a crawlability concern.** Googlebot does not execute JavaScript reliably for all internal link discovery. Key public internal links should use `<a href="...">` elements.

### /jobs (public-list.component.html)
- Job cards presumably link to `/jobs/details/{id}` (inside app-job-posts-list component — not read).
- "Browse jobs" → job detail via job card clicks.

### /jobs/details/:id (public-details.component.html)
- No explicit "back to jobs" `<a>` link observed — only the router `goBack()` method.

### 404 Page (error-not-found.component.html)
- **Updated (Phase 18):** Added recovery `<a href="/home">Homepage</a>` and `<a href="/jobs">Browse Jobs</a>` text links — these are crawlable anchor tags.

## Backlog — Internal Linking Improvements

| Item | Priority | Benefit |
|------|---------|---------|
| Add `<a href="/jobs">` links in hero sections (not just button clicks) | P1 | Crawlable internal links |
| Add "Back to jobs" `<a>` link on job detail page | P2 | Crawlable navigation |
| Visual breadcrumb component | P2 | UX + crawlable internal links |
| Job category tag links on job detail → /jobs?category=X | P3 | Topical internal linking |
| "More jobs from this company" section on job detail page | P3 | Context + crawlable links |
