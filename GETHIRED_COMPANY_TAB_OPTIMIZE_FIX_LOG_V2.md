# GETHIRED COMPANY TAB — OPTIMIZE FIX LOG V2
**Scope:** Employer Portal › Company Tab
**Date:** 2026-06-26

---

## All Applied Fixes (this session + previous)

| ID | Fix | Commit |
|---|---|---|
| OPT-01 | Remove `console.log(company)` PII leak in company form | 6b25780 |
| OPT-02 | Remove 4 additional debug console.logs in company form | 6b25780 |
| OPT-03 | Remove commented dead code `//this.showSuccessDialog()` | 6b25780 |
| OPT-04 | Better company description placeholder | 6b25780 |
| OPT-05 | `maxlength=1000` + aria-live char counter on description | 6b25780 |
| OPT-06 | `GET /company/getAllCompanies` mapper bug fix (`row.companyName` → `row.company_name`) | 5385af3 |
| OPT-07 | `GET /company/details` crash guard (unauthenticated 401) | 29bd809 |
| OPT-08 | `GET /company/getAllCompanies` verifyAuth added | 5385af3 |

---

## Remaining Deferred Items

| ID | Issue | Why deferred |
|---|---|---|
| OPT-09 | `setTimeout(() => this.loading = false, 1500)` in company-users | Needs store subscription to actual data — product decision |
| OPT-10 | `company$` loaded twice (parent + form child) | NgRx refactor needed |
| OPT-11 | Logo base64 upload has no client-side size limit | Needs product max-size decision |
| OPT-12 | `alert()` in CSV import uploadListener | Replace with SnackbarService.error() — 30min fix |
| OPT-13 | Empty state when company users list is empty | Product UI decision |

---

## Quick Win Available (OPT-12)

The `uploadListener` in `import-add-user.component.ts` uses a native `alert()` call for invalid CSV validation. This is accessible to zero screen readers and blocks the browser thread. Replacing it with `SnackbarService.error()` is a 5-line change with zero risk.

Recommended fix:
```typescript
// Before:
alert('Invalid CSV format. Please check your file.');

// After:
this.snackbarService.error('Invalid CSV format. Please check your file.');
```
