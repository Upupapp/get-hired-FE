# GETHIRED COMPANY TAB — SWEEP REPORT V2 (Post-Fix)
**Scope:** Employer Portal › Company Tab (`/recruiter/company/details`)
**Date:** 2026-06-26
**Previous:** GETHIRED_COMPANY_TAB_SWEEP_REPORT.md (V1)

---

## Change Summary Since V1

| Item | V1 Status | V2 Status |
|---|---|---|
| `GET /company/details` crash without auth | ❌ Crash | ✅ Fixed — 401 guard added (BE 29bd809) |
| 5 `console.log` PII leaks | ❌ Open | ✅ Fixed (FE 6b25780) |
| `addCompanyUser` BOLA | ❌ Open (V1 thought it was unfixed) | ✅ Already fixed — QA9 FIX-3 (prior session) |
| `GET /company/getAllCompanies` unauthenticated | ❌ Open | ✅ Fixed — verifyAuth added (BE 5385af3) + mapper bug fixed |
| `/company/setuplist` commented out | ❌ Flagged | ✅ Non-issue — FE uses `/options/setuplist` which is live |
| Keyboard nav on subtab buttons | ❌ Missing | ✅ Fixed (FE 6b25780) |
| WCAG 44px touch targets on subtab | ❌ Missing | ✅ Fixed (FE 6b25780) |
| Char counter on company description | ❌ Missing | ✅ Fixed (FE 6b25780) |
| Mobile scroll fade mask | ❌ Missing | ✅ Fixed (FE 6b25780) |

---

## Current Open Items

### Medium
- `alert()` call in CSV `uploadListener` in `import-add-user.component.ts` — native browser alert is inaccessible (no role, no aria, blocks thread). Should be `SnackbarService.error()`.
- `company-users.component.ts` uses `setTimeout(() => this.loading = false, 1500)` — not tied to actual data arrival
- No empty state when company users list is empty

### Low
- `companyLogoFile` base64 upload has no client-side size limit (can send oversized payload)
- Company profile has no completion percentage indicator
- 5 "Coming soon" sections in Employer Brand + Benefits tabs have no ETA indicator

---

## Current Security Status

| Check | Status |
|---|---|
| `GET /company/details` crash guard | ✅ Fixed |
| `PUT /company/update` BOLA | ✅ Fixed (prior) |
| `DELETE /company/removecompanyuser` BOLA | ✅ Fixed (prior) |
| `POST /company/addcompanyuser` BOLA | ✅ Fixed (QA9 FIX-3, prior) |
| `GET /company/getAllCompanies` unauthenticated | ✅ Fixed (5385af3) |
| `GET /company/usercompany` auth | ✅ Secure |
| `GET /company/getsubscriptionrestrictions` BOLA | ✅ Fixed (prior) |
| PII console.log in company form | ✅ Fixed (6b25780) |
| No known open P0 security issues | ✅ Clean |

---

## Verdict: SECURE (no known P0/P1 security issues)
All auth guards in place. BOLA fixed on all company mutations. PII leaks removed. Unauthenticated list endpoint locked down.
