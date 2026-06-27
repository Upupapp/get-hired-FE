# GETHIRED COMPANY TAB — OPTIMIZE FIX LOG
**Scope:** Employer Portal › Company Tab
**Date:** 2026-06-26

---

## Applied Fixes

### OPT-01 — Remove 5 console.log PII Leaks (FE)
**File:** `src/app/company/company-details-form/company-details-form.component.ts`
**Removed:**
1. `console.log(!this.companyDetailsForm.valid && !this.addressFormValid)` — line 101
2. `console.log(company)` — dumped full company object on every store update
3. `console.log(this.router.config)` — leaked router config in dead code path
4. `console.log(event); console.log('dito lang')` — debug logs in afterSubmit
5. `console.log('Update LocalStorage')` — trace in localStorage write
**Impact:** Eliminates PII exposure via browser console. Zero behavior change.

### OPT-02 — Remove Dead Comment Block in ngOnInit (FE)
**File:** same as above
**Removed:** `//this.showSuccessDialog()` commented-out call

### OPT-03 — Replace Placeholder in companyDetails Textarea (FE)
**File:** `src/app/company/company-details-form/company-details-form.component.html`
**Before:** Lorem-ipsum-style contract boilerplate as placeholder
**After:** `"Describe your company — what you do, your culture, and what makes you a great place to work."`
**Impact:** Clearer guidance, no legal/contract text confusing recruiters.

### OPT-04 — Add Character Counter + maxlength to companyDetails (FE, NOTIFY)
**File:** same HTML
**Added:** `maxlength="1000"` on textarea + live char counter `(current / 1000)` with `aria-live="polite"`
**Impact:** Prevents oversized description, gives real-time feedback, improves accessibility.

---

## Deferred (not applied — needs BE change or product decision)

| ID | Issue | Why deferred |
|---|---|---|
| OPT-05 | `setTimeout(() => this.loading = false, 1500)` in company-users | Needs store subscription wired to actual data emission — product decision on loading UX |
| OPT-06 | `company$` store loaded twice (parent + form child) | Needs NgRx store refactor — out of scope for safe-fix pass |
| OPT-07 | Company logo `loading="lazy"` missing in form | Low value — form is private, not SEO path |

---

## Build Impact

Only FE files changed. No new dependencies. Build-safe.
