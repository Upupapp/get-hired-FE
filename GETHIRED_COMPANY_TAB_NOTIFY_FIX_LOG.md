# GETHIRED COMPANY TAB — NOTIFY FIX LOG
**Scope:** Employer Portal › Company Tab
**Date:** 2026-06-26

---

## Applied Fixes

### NOT-01 — Company Description Character Counter
**File:** `src/app/company/company-details-form/company-details-form.component.html`
**Added:** Live `(current / 1000)` counter below `companyDetails` textarea with `aria-live="polite"` + turns red at 950+ chars
**Why:** Previously the textarea had no character limit or feedback. Recruiters could type arbitrarily long descriptions causing layout issues on public job cards.

### NOT-02 — Better Placeholder Copy for Company Description
**Before:** Long boilerplate legal contract text as placeholder
**After:** `"Describe your company — what you do, your culture, and what makes you a great place to work."`
**Why:** The old placeholder was confusing — it looked like real content and didn't guide the recruiter on what to write.

---

## Audit Findings (not fixed — product decisions)

### NOT-03 — Form Save Uses MatDialog, Not Inline Feedback
**Status:** Open
**Issue:** When a recruiter saves the company profile, a `SuccessDialogComponent` modal appears. This is modal-heavy UX — the recruiter must click to dismiss before continuing. Best practice: inline toast or button-state feedback (spinner → checkmark → label change).
**Recommendation:** Replace with `SnackbarService.success()` (already used in the invite dialog) + button loading state.

### NOT-04 — Error State Only Shows Generic Toast
**Status:** Open
**Issue:** `afterSubmit` only handles `'created'` and `'updated'` states. No explicit error branch — the form just silently fails if the API returns an error after the form was submitted.
**Recommendation:** Add `else if (event === 'error') { this.snackbarService.error('Could not save. Please try again.'); }` branch.

### NOT-05 — "Coming Soon" Sections Have No ETA or Progress Signal
**Status:** Open
**Issue:** Employer Brand and Benefits tabs show 4 "Coming soon" sections. Users don't know if these are 1 week or 1 year away.
**Recommendation:** Add tooltip or small note "Planned for future update" (already done) — acceptable for now.

### NOT-06 — Company Users: No Empty State When No Users Added
**Status:** Open
**Issue:** `app-reusable-table` with an empty array renders a blank table. No message like "No team members added yet."
**Recommendation:** Add `*ngIf="companyUserLists?.length === 0"` empty state before the table.

---

## State Coverage Matrix

| State | Profile Tab | Brand Tab | Benefits Tab |
|---|---|---|---|
| Loading | ✅ Custom loading dialog | ✅ Skeleton | ✅ Skeleton |
| Empty | ❌ (form shows empty fields) | ✅ Empty state w/ icon | ✅ Empty state w/ icon |
| Error | ❌ Silent (no branch) | N/A (read-only) | N/A (read-only) |
| Success | ✅ MatDialog | N/A | N/A |
| Validation | ⚠️ HTML5 only, no messages | N/A | N/A |
