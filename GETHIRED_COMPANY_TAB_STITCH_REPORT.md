# GETHIRED COMPANY TAB — STITCH REPORT
**Scope:** Employer Portal › Company Tab (API contracts, FE↔BE integration)
**Date:** 2026-06-26

---

## API Contract Map

### Contract 1: Load Company Profile
- **FE call:** `CompanyFacade.getCompany()` → dispatches `GET_COMPANY` action → `CompanyService.getSpecificCompany()`
- **BE:** `GET /company/usercompany` (verifyAuth) → `getSpecificCompany` → `getUserCompanyForRequest`
- **Response shape (mapped):** `{ companyId, companyName, companyEmail, companyDetails, industryId, workSetupId, numberOfEmployee, companyLogoUrl, companyAddress, companyCity, companyCountry, ... shownPublicly }`
- **Risk:** `shownPublicly` is camelCase in FE but `shown_publicly` in DB — mapped in `mappedCompany`. ✅ Consistent
- **Risk:** `workSetupId` is number in FE but may arrive as string from DB via `pg` driver — parseInt in `onSubmit` prevents issue. ✅ Handled

### Contract 2: Update Company Profile
- **FE call:** `CompanyFacade.updateCompany(payload)` → `PUT /company/update`
- **FE sends:** Full form object including `companyId`
- **BE:** verifies caller owns company via JWT, then updates
- **Risk:** `companyLogoFile` is sent as base64 string — size limit not enforced client-side (could send enormous payload). ⚠️ Medium risk
- **Risk:** `companyAddressOne` is not in the mapped response fields from `mappedCompany` — verify it round-trips correctly. ⚠️ Needs verification

### Contract 3: Add Company User (invite)
- **FE call:** dispatches `SAVE_COMPANY_USER` with `{ companyId, emails: [...] }`
- **BE:** `POST /company/addcompanyuser` → `addCompanyUser`
- **CONTRACT BREAK RISK:** FE sends `companyId` from localStorage. BE should ignore this and re-derive from JWT. ❌ Mismatch — BOLA vector
- **Response shape:** `{ emails: [{ email, status, msg }] }` — matched in `import-add-user.component.ts:87-88`. ✅ Shape matches

### Contract 4: Get Company Users
- **FE call:** `CompanyFacade.getCompanyUsers(companyId)` — passes companyId
- **BE:** `GET /company/getallcompanyuser` — derives companyId from JWT internally
- **Risk:** FE passes companyId in call but BE ignores it (good). Consistent. ✅

### Contract 5: Get Industry List
- **FE call:** `CompanyFacade.getIndustry()` → `GET /company/industries`
- **Response:** `[{ id, name, ... }]` — FE uses `item.id` and `item.name`. ✅ Consistent

### Contract 6: Get Work Setup List
- **FE call:** `CompanyFacade.getSetup()` → maps to some endpoint
- **Risk:** Work setup endpoint is `router.get("/company/setuplist", ...)` — **COMMENTED OUT** in both routes and controller. `workSetup$` in FE may never load. ⚠️ Investigate

---

## Contract Mismatch Summary

| ID | Type | Description | Severity |
|---|---|---|---|
| CM-01 | BOLA | `addCompanyUser` body has companyId from localStorage | High |
| CM-02 | Missing field | `companyAddressOne` round-trip not verified | Medium |
| CM-03 | Endpoint disabled | `/company/setuplist` commented out — workSetup$ may silently fail | Medium |
| CM-04 | No size guard | `companyLogoFile` base64 has no client-side size limit | Medium |
| CM-05 | Timeout-driven loading | `company-users` loading state based on setTimeout, not data | Low |

---

## Recommended Integration Fixes

1. **CM-01:** BE `addCompanyUser` should call `getUserCompanyForRequest(req, req.user.uid)` and use that companyId
2. **CM-03:** Verify work setup options route — if `getSetupListCompany` is needed, uncomment and add `verifyAuth`; alternatively use the `optionsRoute.js` endpoint already serving work setup
3. **CM-04:** Add 2MB client-side size check before converting to base64 in `onUpload`
