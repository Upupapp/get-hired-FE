# GETHIRED COMPANY TAB — SECURE REPORT
**Scope:** Employer Portal › Company Tab
**Date:** 2026-06-26

---

## Critical / High Findings

### S-01 — CRITICAL — Crash on Unauthenticated GET /company/details
- **File:** `get-hired-BE/routes/companiesRoute.js:49`, `controllers/companiesController.js:240`
- **Issue:** `router.get("/company/details", getSpecificCompany)` has NO `verifyAuth`. When called without `?id`, `getSpecificCompany` does `const { uid } = req.user` — crashes with `TypeError: Cannot destructure property 'uid' of undefined`.
- **STRIDE:** Denial of Service (crash) + Information Disclosure
- **OWASP:** A05:2021 Security Misconfiguration
- **Exploit:** `curl https://api.gethiredonline.app/company/details` with no token → server crash
- **Fix applied:** Added `if (!req.user || !req.user.uid) return 401` guard before the UID access. ✅ FIXED

### S-02 — HIGH — PII Leak via Browser Console
- **File:** `get-hired-FE/src/app/company/company-details-form/company-details-form.component.ts`
- **Issue:** `console.log(company)` dumps full company record (name, email, address, contact number, logo URL) to browser dev tools. Visible to anyone with dev tools access on a shared machine.
- **STRIDE:** Information Disclosure
- **OWASP:** A09:2021 Security Logging and Monitoring Failures
- **Fix applied:** Removed all 5 `console.log` calls. ✅ FIXED

### S-03 — HIGH — BOLA in addCompanyUser (companyId from localStorage)
- **File:** `get-hired-FE/src/app/company/company-users/dialogs/import-add-user.component/import-add-user.component.ts:202`
- **Issue:** `saveCompanyUser` reads `companyId` from `this.localData.companyId` (localStorage) and sends it in the POST body. A user who edits localStorage can set a different `companyId` and invite users into a company they don't own.
- **BE:** `POST /company/addcompanyuser` — needs to re-derive companyId from `req.user.uid` via `getUserCompanyForRequest`, not trust the body.
- **STRIDE:** Elevation of Privilege
- **OWASP:** A01:2021 Broken Access Control (BOLA)
- **Fix required (not yet applied):** BE `addCompanyUser` should call `getUserCompanyForRequest(req, req.user.uid)` and use that companyId, ignoring the body value. ❌ OPEN

### S-04 — MEDIUM — GET /company/getAllCompanies — Unauthenticated, Returns All Companies
- **File:** `get-hired-BE/routes/companiesRoute.js:53`
- **Issue:** `router.get("/company/getAllCompanies", getAllCompanies)` — no verifyAuth. Returns all company records.
- **STRIDE:** Information Disclosure
- **OWASP:** A01:2021 Broken Access Control
- **Fix required:** Add `verifyAuth` + restrict to admin role, OR confirm this is intentionally public and limit the fields returned. ❌ OPEN

---

## Confirmed Secure (Company Tab)

| Check | Status |
|---|---|
| `PUT /company/update` BOLA guard | ✅ Secure (fixed in prior session) |
| `DELETE /company/removecompanyuser` auth | ✅ Secure (fixed in prior session) |
| Company logo upload via signed URL | ✅ Secure |
| Company form uses parameterized queries | ✅ Secure |
| `updateCompany` verifies caller owns company | ✅ Secure |
| SSR localStorage guard in invite dialog | ✅ Secure |

---

## Open Items (prioritized)

| Priority | Item | Owner |
|---|---|---|
| P0 | Fix `addCompanyUser` BE to re-derive companyId from JWT | BE |
| P1 | Add `verifyAuth` to `GET /company/getAllCompanies` or scope response | BE |
| P2 | Audit all other unauthenticated routes in companiesRoute.js | BE |
