# GETHIRED_SEO_REPORT_RECENT_V5
Targeted re-audit against HEAD=41b5920 (FE) / HEAD=6a7755c (BE).
Covers commits 94e4d39 (backlog polish) and 41b5920 (visual breadcrumb + error-state noindex).
Date: 2026-06-26

---

## EXECUTIVE SUMMARY

| Finding | Status |
|---|---|
| SeoService DOCUMENT injection (SSR-safe JSON-LD) | PASS |
| No duplicate JSON-LD scripts across route changes | FAIL — see §1 (P1 blocker) |
| clearJsonLd / clearBreadcrumbJsonLd called on destroy | PASS (public-details); N/A (job-posts-details uses separate service) |
| sameAs: [] removed from Organization JSON-LD | PASS |
| Visual breadcrumb HTML — aria-label="Breadcrumb" on nav | PASS |
| Visual breadcrumb HTML — aria-current="page" on last item | PASS |
| Visual breadcrumb — Home/Jobs/JobTitle matches BreadcrumbList JSON-LD | PASS |
| Error-state noindex: meta robots = noindex on jobError$ | PASS |
| Valid job resets robots to index,follow | PASS |
| Signup noindex | PASS |
| Reset-password noindex | PASS |
| Change-password noindex | PASS |
| Account-authentication (verify) noindex | PASS |
| Browse jobs CTAs in job-seeker-portal as crawlable `<a>` | PARTIAL — see §5 |
| DEFAULT_OG_IMAGE fixed to existing asset | PASS |

---

## 1. CRITICAL: DUPLICATE JOBPOSTING JSON-LD ON JOB DETAIL PAGE

**Severity: P1 — must fix before claiming SEO complete**

### Root cause

The public job detail route `/jobs/details/:id` resolves to `PublicDetailsComponent`.
`PublicDetailsComponent` embeds `<app-job-posts-details>` as a child component (`[withBanner]="false"`).

On every job detail page visit, **two separate JobPosting JSON-LD blocks** are injected into `<head>`:

| Source | Injected by | Script element id |
|---|---|---|
| `public-details.component.ts` line 62 | `seoService.setJobPostingJsonLd(job)` | `gh-jsonld-jobposting` |
| `job-posts-details.component.ts` line 84 | `structuredData.apply(job)` (JobStructuredDataService) | `job-posting-structured-data` |

Because the two services use **different DOM `id` values**, neither replace the other — both coexist in `<head>` as separate `<script type="application/ld+json">` elements.

Google's structured data guidelines warn that multiple conflicting `JobPosting` objects for the same URL may confuse the indexer and can trigger a "items with issues" warning in Rich Results Test.

### Secondary issue within the same bug

`job-posts-details.component.ts` (child) calls `structuredData.apply(job)` on **every emission from `normalizedJob$`** with no check that `job.statusId === 2`. In the parent (`public-details`), `seoService.setJobPostingJsonLd()` is gated on `job.jobStatusId === 2`. This means for an inactive job the parent correctly withholds JobPosting JSON-LD via `clearJobPostingJsonLd()`, but the child's `JobStructuredDataService.apply()` injects one anyway (no `statusId` guard exists in `JobStructuredDataService.buildSchema()` or in its caller).

### Fix (recommended)

Option A — Preferred: **Remove JobPosting structured data from `job-posts-details.component.ts` entirely.** The parent `PublicDetailsComponent` already handles it correctly (with `jobStatusId` guard, correct field mapping, and proper cleanup in `ngOnDestroy`). The child component should only handle its own meta (page title + robots via `Meta` service), and delegate all JSON-LD to the parent.

Changes needed:
- `job-posts-details.component.ts`: remove `JobStructuredDataService` import and injection; remove `structuredData.apply(job)` call (line 84); remove `structuredData.remove()` call (line 168).
- Leave `titleService.setTitle(...)` and `meta.updateTag(robots)` in place — those are correct.

Option B: Remove `seoService.setJobPostingJsonLd()` from `public-details.component.ts` and let `JobStructuredDataService` in the child own it — but then the parent's `jobStatusId === 2` guard is lost, requiring it to be re-added inside the child.

Option A is the smaller, safer change and preserves the existing guard.

---

## 2. SEOSERVICE DOCUMENT INJECTION — VERIFIED

**File:** `src/app/core/services/seo.service.ts`

All four SSR-critical methods now use `@Inject(DOCUMENT) private doc: Document` rather than the bare global:

- `setCanonical()` — V4 fix confirmed (line 138: `this.doc.querySelector(...)`)
- `clearCanonical()` — V4 fix confirmed (line 154: `this.doc.querySelector(...)`)
- `setJsonLd()` — V4 fix confirmed (line 199: `this.doc.getElementById(...)`)
- `clearJsonLd()` — V4 fix confirmed (line 212: `this.doc.getElementById(...)`)

The previous `if (!this.isBrowser) return` guard that silently skipped JSON-LD on SSR is gone.

`JobStructuredDataService` (the child's service) also uses `@Inject(DOCUMENT)` — SSR-safe in isolation.

**Verdict: PASS for SSR safety. The duplicate issue is independent of SSR-safety.**

---

## 3. SEOSERVICE — sameAs REMOVAL

**File:** `src/app/core/services/seo.service.ts`

Commit 94e4d39 removed `sameAs: []` from `setOrganizationJsonLd()`.

Before (line 329):
```typescript
logo: `${BASE_URL}/assets/images/logo.png`,
sameAs: [],   // removed
contactPoint: { ... }
```

After: `sameAs` field absent entirely when no real social-profile URLs exist. Google's Rich Results validator (and schema.org spec) treat an empty `sameAs` array as a schema violation — the fix is correct.

**Verdict: PASS.**

---

## 4. BREADCRUMB — HTML CORRECTNESS

**File:** `src/app/jobs/job-posts-details/job-posts-details.component.html` (commit 41b5920)

### 4a. `aria-label="Breadcrumb"` on `<nav>`

PASS. Line 15: `<nav aria-label="Breadcrumb" class="gh-breadcrumb-nav">`. Correct.

### 4b. `aria-current="page"` on last item

PASS. Line 19: `<li class="gh-breadcrumb-item gh-breadcrumb-item--current" aria-current="page">`. Correct.

### 4c. Breadcrumb only renders when job loaded

PASS. The `<nav>` is inside `<section *ngIf="details$ | async as selectedJobPost">` so it only renders when data is available. The job title displayed is the real `selectedJobPost?.jobTitle`, not a placeholder.

### 4d. Matches BreadcrumbList JSON-LD

The BreadcrumbList JSON-LD in `public-details.component.ts` (via `seoService.setBreadcrumbJsonLd`) is:
```
[ Home → /home, Jobs → /jobs, {job.jobTitle} → /jobs/details/{id} ]
```
The visual breadcrumb in `job-posts-details.component.html` is:
```
Home (routerLink="/home") > Jobs (routerLink="/jobs") > {selectedJobPost.jobTitle} (aria-current)
```
These match. Position labels, ordering, and URLs are consistent.

### 4e. Crawlable anchor elements

PASS. `Home` and `Jobs` items use `<a routerLink="...">` — Angular's router renders these as `<a href="...">` in the DOM, which Google can follow as internal links. The current-page item is plain text (correct — no `<a>` on the active item per WCAG 2.1).

### 4f. `withBanner=false` does not hide breadcrumb

PASS. The `*ngIf="withBanner"` guard only wraps the banner `<div>` (lines 23-41). The `<nav aria-label="Breadcrumb">` is sibling to the banner, not inside it. When `public-details` embeds `<app-job-posts-details [withBanner]="false">`, the breadcrumb still renders.

**Verdict: All breadcrumb checks PASS.**

---

## 5. ERROR-STATE NOINDEX

**File:** `src/app/jobs/job-posts-details/job-posts-details.component.ts` (commit 41b5920)

### 5a. noindex fires on error

PASS. `jobErrorSub` (line 90) subscribes to `jobError$`. When `err` is truthy:
```typescript
this.meta.updateTag({ name: 'robots', content: 'noindex' });
```
This sets `<meta name="robots" content="noindex">` — Googlebot will see this and not index the page.

Note: the value is `'noindex'` (no `follow`/`nofollow` qualifier). This is valid; Google interprets it as `noindex, follow`. Whether links on the error page should be followed is a minor policy question. Using `'noindex, nofollow'` would be marginally more conservative but the current value is not wrong.

### 5b. Resets to index,follow on valid job

PASS. In `normalizedJobSub` (line 80), when `job` is truthy:
```typescript
this.meta.updateTag({ name: 'robots', content: 'index, follow' });
```

### 5c. Subscription unsubscribed in ngOnDestroy

PASS. Lines 163-165:
```typescript
if (this.jobErrorSub) {
  this.jobErrorSub.unsubscribe();
}
```

### 5d. Conflict with parent (public-details) robots tag

NOTE. `PublicDetailsComponent` also sets `robots` via `seoService.setPageMeta()` conditioned on `jobStatusId === 2`. This is set once, via a `take(1)` subscription, when job data arrives. The child's `normalizedJobSub` also sets `robots` on every emission. Because `Meta.updateTag` replaces (not accumulates) the robots tag, the last writer wins. In normal successful load flow:
1. Parent `setPageMeta({ robots: 'index, follow' })` fires once.
2. Child `meta.updateTag({ robots: 'index, follow' })` also fires — same result, no conflict.

In error flow: `details$` emits nothing (job not found), so the parent's subscription never fires. The child's `jobErrorSub` fires and sets `noindex`. This is correct.

There is no functional conflict, but the parent and child both writing the same meta tag is a code smell. The child's `meta.updateTag` call could be removed if the parent already handles it — but only after fixing the duplicate JSON-LD issue (see §1) as part of the same cleanup pass.

**Verdict: PASS.**

---

## 6. AUTH PAGES NOINDEX

### 6a. signup — PASS (upgraded in V4 → now FULL PASS)

`src/app/auth/signup/signup.component.ts`: SeoService injected, `setPageMeta({ robots: 'noindex, nofollow' })` called in `ngOnInit()`. No longer relying solely on robots.txt Disallow.

### 6b. reset-password — PASS

`src/app/auth/reset-password/reset-password.component.ts`: same pattern, `robots: 'noindex, nofollow'`.

### 6c. change-password — PASS

`src/app/auth/change-pw/change-pw.component.ts`: same pattern, `robots: 'noindex, nofollow'`.

### 6d. account-authentication (verify) — PASS

`src/app/auth/account-authentication/account-authentication.component.ts`: same pattern, `robots: 'noindex, nofollow'`.

### 6e. signin — PASS (V3)

`src/app/auth/signin/signin.component.ts`: `robots: 'noindex, nofollow'`.

All five auth pages now have meta-robots defense-in-depth in addition to robots.txt Disallow.

---

## 7. JOB-SEEKER PORTAL — CRAWLABLE "BROWSE JOBS" LINKS

**File:** `src/app/public/job-seeker-portal/job-seeker-portal.component.html` (commit 94e4d39)

Commit 94e4d39 converted 3 `<button (click)="goToJobs()">` elements to `<a routerLink="/jobs">`:
- Line 123: Workspace section "Browse jobs" button → `<a routerLink="/jobs" class="btn-link-cta">Browse jobs</a>` ✓
- Line 176: Fallback (no jobs) "Browse all jobs" → `<a routerLink="/jobs" class="btn-cta-primary gh-pressable">Browse all jobs</a>` ✓
- Line 180: Jobs present "Browse all jobs" → `<a routerLink="/jobs" class="btn-link-cta">Browse all jobs</a>` ✓

**PARTIAL: 4 remaining button-based `/jobs` links not converted:**

The `<app-portal-cta-band>` component (bottom CTA band, line 209-216) still uses:
```html
(primaryClick)="goToJobs()"
```
Which renders as `<button type="button">Browse jobs</button>` — not a crawlable anchor. This is one remaining uncrawlable CTA. Not a blocker, but it means Google cannot follow this particular "Browse jobs" CTA as an internal link.

The `main-portal.component.html` was not in scope for this commit and still has 6 button-based `goToJobs()` calls. That is a separate backlog item.

**Verdict: PARTIAL — seeker portal improved (3 CTAs fixed), 1 CTA band button remains uncrawlable. main-portal.component.html out of scope for this change.**

---

## 8. DEFAULT_OG_IMAGE — NOW RESOLVED

V4 report flagged FAIL: `DEFAULT_OG_IMAGE` pointed to `/assets/brand/gethired-og-default.png` (missing file).

**Current state (HEAD):** Line 34 of `seo.service.ts`:
```typescript
const DEFAULT_OG_IMAGE = `${BASE_URL}/assets/images/logo.png`;
```
`src/assets/images/logo.png` exists in the repo. Social sharing previews will now show the logo rather than a broken image.

The dedicated 1200x630px OG image (`gethired-og-default.png`) is still absent as a design asset. The logo is a stopgap — not the optimal OG image, but functional.

**Verdict: PASS (improved from FAIL to functional stopgap).**

---

## 9. STRUCTURAL DATA — SCHEMA FIELD ACCURACY

No new fields added. Verified constraints maintained:
- No `sameAs: []` (removed) ✓
- No fabricated job data ✓
- `directApply: true` present (SeoService) ✓
- `baseSalary` only emitted when `salaryMinimum && salaryMaximum && salaryCurrency` (SeoService) ✓
- `JobStructuredDataService.buildSchema()` omits `baseSalary` when `job.hasSalary` is false ✓
- No `JobPosting` on list pages ✓

---

## 10. NEW SEO GAPS INTRODUCED BY RECENT CHANGES

### 10a. (P1 — existing latent) Duplicate JobPosting JSON-LD

See §1. This was a latent bug introduced when `job-posts-details.component.ts` added `JobStructuredDataService` in a previous commit, before the parent `public-details.component.ts` was also injecting JobPosting JSON-LD. The breadcrumb commit (41b5920) did not cause this, but it is newly visible in this audit.

### 10b. (P3 — minor) `noindex` without `nofollow` on job error

`meta.updateTag({ name: 'robots', content: 'noindex' })` — missing `nofollow`. Not a real problem (Google defaults to `follow` when nofollow is absent) but inconsistent with the rest of the codebase which uses `'noindex, nofollow'` for all error/auth states.

### 10c. (P3) `portal-cta-band` primary button still a `<button>`

The `PortalCtaBandComponent` template renders `<button>` for its primary action. When used as `(primaryClick)="goToJobs()"` in `job-seeker-portal`, this CTA is uncrawlable. Fix: add a `[primaryRouterLink]` `@Input()` to `PortalCtaBandComponent` and render `<a routerLink="...">` when that input is provided.

---

## PASS/FAIL SUMMARY (V5)

| # | Check | Status | Notes |
|---|---|---|---|
| S1 | SeoService DOCUMENT injection (setJsonLd SSR-safe) | PASS | V4 fix confirmed |
| S2 | No duplicate JSON-LD script blocks | FAIL P1 | gh-jsonld-jobposting + job-posting-structured-data both present |
| S3 | clearJsonLd called on route destroy | PASS | public-details.ngOnDestroy calls clear{JobPosting,Breadcrumb}JsonLd |
| S4 | JobPosting JSON-LD only for active jobs (parent) | PASS | jobStatusId===2 guard in public-details |
| S5 | JobPosting JSON-LD only for active jobs (child) | FAIL P2 | JobStructuredDataService.apply() has no statusId check |
| S6 | sameAs:[] removed from Organization JSON-LD | PASS | Commit 94e4d39 |
| S7 | Visual breadcrumb — aria-label="Breadcrumb" on nav | PASS | |
| S8 | Visual breadcrumb — aria-current="page" on last item | PASS | |
| S9 | Visual breadcrumb — matches BreadcrumbList JSON-LD | PASS | Home/Jobs/JobTitle match |
| S10 | Breadcrumb visible when withBanner=false | PASS | nav outside banner ngIf |
| S11 | Error noindex fires on jobError$ | PASS | meta.updateTag({robots:'noindex'}) |
| S12 | robots resets to index,follow on valid job | PASS | meta.updateTag({robots:'index, follow'}) |
| S13 | jobErrorSub unsubscribed in ngOnDestroy | PASS | |
| S14 | noindex on signup | PASS | V4 fix |
| S15 | noindex on reset-password | PASS | V4 fix |
| S16 | noindex on change-password | PASS | V4 fix |
| S17 | noindex on account-authentication | PASS | V4 fix |
| S18 | noindex on signin | PASS | V3 |
| S19 | Browse jobs CTAs crawlable in job-seeker-portal | PARTIAL | 3/4 converted; portal-cta-band still a button |
| S20 | DEFAULT_OG_IMAGE points to existing file | PASS | /assets/images/logo.png exists |
| S21 | No JobPosting on list pages | PASS | |
| S22 | No fake structured data | PASS | |

---

## ACTION ITEMS

### P1 — Fix before next indexing pass
1. **Remove `JobStructuredDataService` from `job-posts-details.component.ts`** — eliminate the duplicate JobPosting JSON-LD. The parent (`public-details.component.ts`) already handles it correctly. Remove: import, constructor injection, `structuredData.apply(job)` call, `structuredData.remove()` call. (Estimated: 4 lines deleted, 0 lines added.)

### P2 — Fix soon
2. **Add `statusId === 2` guard in `job-posts-details.component.ts`** — until P1 is fixed, the child should at minimum guard: `if (job && job.statusId === 2) { this.structuredData.apply(job); } else { this.structuredData.remove(); }`. This prevents inactive job structured data leakage from the child's code path.

### P3 — Backlog
3. Change `'noindex'` to `'noindex, nofollow'` in `job-posts-details.component.ts` jobErrorSub for consistency.
4. Add `[primaryRouterLink]` input to `PortalCtaBandComponent` to enable crawlable anchor rendering for "Browse jobs" CTA band.
5. Branded 1200x630px OG image at `/assets/brand/gethired-og-default.png` (design asset, non-blocking).
6. Convert remaining `goToJobs()` buttons in `main-portal.component.html` to `<a routerLink="/jobs">`.
