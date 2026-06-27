# GETHIRED CREATE JOB — SEO REPORT
**Scope:** `/recruiter/jobs/create` (private, auth-gated) + downstream public job page impact
**Date:** 2026-06-26

---

## SEO Context

The Create Job page is private (behind auth) and will be excluded from indexing. Its SEO impact is entirely upstream — the quality of data entered here directly determines how well individual job detail pages (`/jobs/details?id=...`) rank in search engines.

---

## Private Page Meta (route itself)

| Check | Status |
|---|---|
| `<meta name="robots" content="noindex">` on private routes | ✅ Confirmed (NOINDEX block on private routes set globally in prior audit) |
| Page title | Should be "Create Job — GetHired" but likely generic; low priority since noindex |

---

## Content Quality Impact on Public SEO

| Create Job Field | Powers Public Job Page | SEO Impact |
|---|---|---|
| `jobTitle` | `<title>`, `<h1>`, og:title, JobPosting `title` in JSON-LD | **Critical** — primary search signal |
| `jobDescription` | Meta description source, indexed body, `description` in JSON-LD | **Critical** — content relevance |
| `jobDuties` | Indexed page body, `responsibilities` | High |
| `jobCity` + `jobCountry` | `jobLocation.addressLocality` in JSON-LD, local search | High |
| `workSetupId` | `jobLocationType` in JSON-LD (TELECOMMUTE vs IN_PERSON) | Medium |
| `jobTypeId` | `employmentType` in JSON-LD | Medium |
| `requirements` | Indexed body text | Medium — keyword density |
| `salaryMinimum` + `salaryMaximum` | `baseSalary` in JSON-LD | Medium — salary display in Google |
| `expirationDate` | `validThrough` in JSON-LD — without this, Google may delist | **High** — missing from FE |
| `bannerFile` | `image` in og:image | Low |

---

## Critical SEO Gap: expirationDate Never Set

`POST /job/create` sends `expirationDate: undefined`. The `jobs` table has this column but it's always NULL for newly created jobs. Google's `JobPosting` schema requires `validThrough` for best ranking in Google for Jobs. Without it, posts are treated as never-expiring and Google may suppress them in freshness scoring.

**Recommendation:** Add an optional "Job Expiration Date" field in Step 1 (or default to +90 days from creation on the BE).

---

## Placeholder Impact on SEO

The old Lorem ipsum placeholder in `jobDescription` did NOT get submitted — it was placeholder text, not form value. However, it discouraged recruiters from writing good descriptions, indirectly lowering content quality. This session's placeholder fix ("Describe the role...") should improve description quality over time.

---

## Recommendations

| Priority | Action |
|---|---|
| High | Add `expirationDate` (validThrough) to Step 1 form — either user-selectable or defaulting to now + 90 days |
| Medium | Add character minimum guidance for Job Description ("minimum 150 characters recommended for Google indexing") |
| Low | Add preview of how the job title will appear in Google search results (30-char truncation warning) |
