# GETHIRED CREATE JOB — NOTIFY FIX LOG
**Scope:** `/recruiter/jobs/create`
**Date:** 2026-06-26

---

## Applied Fixes

### NOT-01 — Better Job Description Placeholder (FE)
**File:** `job-post-detail-step.component.html`
**Before:** "Lorem ipsum dolor sit amet..." — Latin filler text gave no guidance
**After:** "Describe the role: what the team does, how this position fits in, and what the day-to-day looks like."
**Why:** Recruiters were more likely to skip or paste generic text, reducing job card quality.

### NOT-02 — Correct Banner Error Message (FE)
**File:** `job-post-detail-step.component.ts`
**Before:** "Banner size too large." — when problem was wrong file count
**After:** "Please upload a single image file for the banner."
**Why:** User saw "size too large" even when size wasn't the issue, causing confusion.

---

## Audit Findings (not fixed — need product/design input)

### NOT-03 — Missing "next" progression feedback between steps
**Status:** Open
**Issue:** After clicking "Next: Job Requirements", there's no transition indication. The stepper just jumps. A brief `@animate` entrance on the new step panel would reduce disorientation.
**Recommendation:** Already uses `mainAnimations` — ensure `[@animate]` is on the outermost section of each step component.

### NOT-04 — "Save as Draft" result confirmed via modal only
**Status:** Accepted (uses existing `UpdatedDialogComponent` pattern)
**Issue:** After saving draft, a modal appears. For a quick save action, a snackbar is a lighter touch.
**Recommendation:** Could switch to `SnackbarService.success()` — but this would be a product UX decision as it changes the flow (currently modal forces navigation confirmation).

### NOT-05 — Missing field labels on error
**Status:** Open
**Issue:** `publishJobPost()` builds a comma-separated `missingJob` string and shows it in a snackbar. "Missing: job type job level" — no comma separation, poor readability.
**Current:** `missingJob += 'job type '` → joined with space
**Recommended fix:** Use an array and join with ", " for cleaner message:
```typescript
const missing: string[] = [];
if (!job.jobTypeId) missing.push('Job Type');
if (!job.jobLevelId) missing.push('Job Level');
// ...
if (missing.length > 0) {
  this.snackbarService.warning(`Please complete: ${missing.join(', ')}.`, '', 5000);
}
```

### NOT-06 — No save-progress indicator on long multi-step form
**Status:** Open
**Issue:** Users filling out a 4-step form on a slow connection have no indication whether step data is saved between navigating steps. The NgRx store holds it in memory but on page refresh, all data is lost.
**Recommendation:** Note in the UI: "Your draft is auto-saved when you click Save as Draft."

### NOT-07 — Job Description textarea has no character limit or counter
**Status:** Open
**Issue:** The BE inserts jobDescription directly into the DB column (likely TEXT, unbounded). A recruiter could paste an enormous description.
**Recommendation:** Add `maxlength="5000"` + live counter (same pattern as company description char counter).

### NOT-08 — "Duties & Responsibilities" textarea has generic placeholder
**Status:** Open
**Issue:** Placeholder says "As a Product Designer, you will work within a Product Delivery Team..." — this is a specific example that may mislead non-designer job posts.
**Recommendation:** "List the key responsibilities and day-to-day tasks for this role."

---

## State Coverage Matrix

| State | Step 1 | Step 2 | Step 3 | Step 4 |
|---|---|---|---|---|
| Loading options | ✅ (async pipe) | ✅ (async pipe) | ✅ | ✅ |
| Validation errors | ⚠️ HTML5 only | ⚠️ HTML5 only | ✅ snackbar | ✅ snackbar |
| Save in-flight | ✅ draft spinner | N/A | N/A | ✅ publish spinner |
| Success | ✅ modal + navigate | N/A | N/A | ✅ modal + navigate |
| Error (API fail) | ✅ error alert div | N/A | N/A | ✅ error alert div |
| Subscription limit | ✅ dialog | N/A | N/A | ✅ ! icon |
