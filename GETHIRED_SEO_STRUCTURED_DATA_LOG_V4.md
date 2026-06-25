# GetHired SEO V4 — Structured Data Log

Generated: 2026-06-26

## Inventory of All JSON-LD Types

### 1. Organization (id: gh-jsonld-org)
**Location:** /home (MainPortalComponent.ngOnInit)
**Fields:**
- @context: https://schema.org
- @type: Organization
- name: GetHired Online
- url: https://gethiredonline.app
- logo: https://gethiredonline.app/assets/images/logo.png
- sameAs: [] (empty — social URLs unknown, not fabricated)
- contactPoint.@type: ContactPoint
- contactPoint.contactType: customer support
- contactPoint.availableLanguage: [English, Filipino]

**Status:** PASS. V4 SSR fix means this now appears in SSR HTML.

### 2. WebSite + SearchAction (id: gh-jsonld-website)
**Location:** /home (MainPortalComponent.ngOnInit)
**Fields:**
- @context: https://schema.org
- @type: WebSite
- name: GetHired Online
- url: https://gethiredonline.app
- potentialAction.@type: SearchAction
- target.urlTemplate: https://gethiredonline.app/jobs/search/{search_term_string}
- query-input: required name=search_term_string

**Status:** PASS. SearchAction URL template confirmed to match live route (`/jobs/search/:keyword`).

### 3. JobPosting (id: gh-jsonld-jobposting)
**Location:** /jobs/details/:id (PublicDetailsComponent) — ONLY when jobStatusId === 2
**Fields:** see GETHIRED_SEO_JOB_DETAIL_JOBPOSTING_LOG_V4.md
**Status:** PASS. V4 SSR fix means this now appears in SSR HTML for active jobs.

### 4. BreadcrumbList (id: gh-jsonld-breadcrumb)
**Locations:**
- /jobs: Home > Jobs
- /jobs/details/:id: Home > Jobs > [Job Title]
- /companies/details: Home > Companies > [Company Name]

**Status:** PASS. V4 SSR fix means breadcrumb JSON-LD now in SSR HTML.

## Duplicate JSON-LD Check

Each JSON-LD type has a unique DOM id (`gh-jsonld-org`, `gh-jsonld-website`, `gh-jsonld-jobposting`, `gh-jsonld-breadcrumb`). The `setJsonLd(id, data)` method replaces in-place if already present — no accumulation of duplicate blocks is possible.

## What is Intentionally Absent

- **Rating/Review** — No real data. NEVER add.
- **FAQPage** — FAQs on /job-seekers and /employers portal pages exist in templates but are not marked up with JSON-LD. This is a V5 enhancement opportunity.
- **Event** — Not applicable.
- **Product / Offer** — Not applicable (hiring platform, not e-commerce).

## FAQPage Backlog Note

The /job-seekers and /employers pages both have FAQ sections (`faqItems` arrays). Adding `FAQPage` JSON-LD would give Google eligibility for FAQ rich snippets in search results. This is safe to implement because:
- Content is static copy (not from API) — no data fabrication risk
- All answers are honest, verified claims

Implementation would be a new `setFaqJsonLd(items: {question: string, answer: string}[])` method in SeoService, with the same `setJsonLd('gh-jsonld-faq', ...)` pattern. Priority: P2 backlog.
