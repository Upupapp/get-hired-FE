# GETHIRED COMPANY TAB — SWEEP REPORT
**Scope:** Employer Portal › Company Tab (`/recruiter/company/details`)
**Date:** 2026-06-26

---

## Executive Summary

The Company Tab is a 3-subtab workspace (Company Profile, Employer Brand, Benefits & Culture) built on a solid architectural pattern but carrying 4 issues that matter before production polish:

1. **CRASH BUG (Critical):** `GET /company/details` has no `verifyAuth` middleware — calling it without `?id` crashes the process because `req.user` is undefined. Fixed this session.
2. **PII LEAK (High):** 5 `console.log` calls in `company-details-form.component.ts` dump full company data and form state to the browser console. Fixed this session.
3. **BOLA RISK (High):** `addCompanyUser` (`saveCompanyUser`) sends `companyId` from localStorage — a user who edits localStorage can invite themselves to a different company.
4. **ACCESSIBILITY GAP (Medium):** Tab buttons had no keyboard navigation (Arrow keys) and no `min-height: 44px` touch target. Fixed this session.

The rest of the tab is well-structured: proper NgRx store, BOLA-guarded `updateCompany` (already fixed in a prior session), auth-guarded routes, SSR-safe localStorage access in the invite dialog.

---

## §1 Component / Route Map

| Route | Component | Module |
|---|---|---|
| `/recruiter/company/details` | `EmployerCompanyComponent` | `EmployerSettingsModule` |
| sub-tab 1: Profile | `CompanyDetailsFormComponent` | `CompanyModule` |
| sub-tab 2: Brand | reads `company$` from NgRx | `CompanyModule` |
| sub-tab 3: Benefits | reads `company$`, `workSetup$` | `CompanyModule` |

---

## §2 Backend API Map (Company Tab endpoints)

| Method | Path | Auth | Mutation | Risk |
|---|---|---|---|---|
| POST | `/company/createinitial` | ✅ verifyAuth | yes | Low |
| POST | `/company/createcompany` | ✅ verifyAuth | yes | Low |
| PUT | `/company/update` | ✅ verifyAuth + BOLA check | yes | Low (fixed) |
| GET | `/company/dashboard` | ✅ verifyAuth | no | Low |
| DELETE | `/company/removecompanyuser` | ✅ verifyAuth | yes | Low (fixed) |
| GET | `/company/industries` | ✅ verifyAuth | no | Low |
| POST | `/company/addcompanyuser` | ✅ verifyAuth | yes | **Medium — companyId from body (localStorage origin)** |
| GET | `/company/getallcompanyuser` | ✅ verifyAuth | no | Low |
| GET | `/company/usercompany` | ✅ verifyAuth | no | Low |
| GET | `/company/getsubscriptionrestrictions` | ✅ verifyAuth | no | Low |
| GET | `/company/details` | ❌ NO AUTH | no | **Critical — crashes without ?id** (fixed this session) |
| GET | `/company/featured` | ❌ NO AUTH | no | Low (intended public) |
| GET | `/company/sharelink` | ❌ NO AUTH | no | Low (intended public) |
| GET | `/company/getAllCompanies` | ❌ NO AUTH | no | Medium — lists all company data |

---

## §3 Data Model (Company fields used on this tab)

```
companies table:
  company_id, company_name, company_email, company_contact_number
  company_address, company_city, company_country, company_state
  company_town, company_zip, company_address_one, company_mapurl
  company_logo (URL), company_details (overview text)
  industry_id → industry.industry_name
  work_setup_id → work_setup.name
  number_of_employee
  shown_publicly (boolean)

company_employees table: employee_uuid, company_id, assigned_at
```

**Missing / backlogged fields visible in UI:**
- mission_and_values (not in DB)
- why_work_with_us (not in DB)
- health_insurance (not in DB)
- leave_flexibility (not in DB)
- learning_growth (not in DB)

---

## §4 UI/UX Heuristic Review

| # | Issue | Severity | Nielsen Principle |
|---|---|---|---|
| 1 | Form save only shows a MatDialog — no inline success/error state | Medium | Visibility of system status |
| 2 | `companyDetails` textarea had no character limit or counter | Medium | User control |
| 3 | Tab keyboard navigation not wired (no Arrow key support) | Medium | Accessibility |
| 4 | "Publicly Shown" checkbox has no explanation tooltip | Low | Help & documentation |
| 5 | Brand/Benefits tabs show "Coming soon" for most fields — may feel incomplete | Low | User expectations |
| 6 | Address change uses Google Maps widget — no fallback for slow connections | Low | Error prevention |

---

## §5 Security Review

| ID | Severity | Issue | File | Fixed? |
|---|---|---|---|---|
| S-01 | Critical | `GET /company/details` no auth → crash without ?id | companiesRoute.js | ✅ Fixed |
| S-02 | High | 5 `console.log` calls leaking full company data to browser console | company-details-form.component.ts | ✅ Fixed |
| S-03 | High | `saveCompanyUser` sends companyId from localStorage (BOLA) | import-add-user.component.ts | ❌ Open |
| S-04 | Medium | `GET /company/getAllCompanies` — unauthenticated, returns all companies | companiesRoute.js | ❌ Open (needs scope review) |
| S-05 | Low | `updateLocalStorage` stores company data (name, id) in localStorage | company-details-form.component.ts | N/A (accepted) |

---

## §6 Accessibility Review

| ID | Severity | Issue | Fixed? |
|---|---|---|---|
| A-01 | High | Subtab buttons: no Arrow key keyboard navigation | ✅ Fixed |
| A-02 | High | Subtab buttons: no `min-height: 44px` touch target (WCAG 2.5.5) | ✅ Fixed |
| A-03 | Medium | Subtab buttons: `tabindex` not managed (roving tabindex pattern needed) | ✅ Fixed |
| A-04 | Medium | `companyDetails` textarea: no character count feedback | ✅ Fixed (char counter added) |
| A-05 | Low | "Coming soon" sections: no `aria-disabled` or structured announcement | ❌ Open |

---

## §7 Performance Review

| Issue | Impact | Priority |
|---|---|---|
| `setTimeout(() => loading = false, 1500)` in company-users — arbitrary delay | UX flicker | Medium |
| `company$` loaded twice: once in parent `EmployerCompanyComponent.ngOnInit`, once in `CompanyDetailsFormComponent.ngOnInit` | Extra API call | Low |
| Company logo loaded eagerly (no `loading="lazy"`) in the profile form | Minor | Low |

---

## §8 Brand / Benefits Tab State

**Fully wired (reads from DB):**
- Company logo preview
- Company overview (companyDetails)
- Work arrangement (workSetupId)
- Team size (numberOfEmployee)

**Coming soon (no DB column):**
- Mission & Values
- Why Work With Us
- Health & Insurance
- Leave & Flexibility
- Learning & Growth

---

## Top 5 Immediate Concerns

1. ~~Critical crash bug on `GET /company/details` without ?id~~ **FIXED**
2. ~~PII: `console.log(company)` dumps full company record to browser console~~ **FIXED**
3. `saveCompanyUser` BOLA: companyId comes from localStorage — BE must re-derive it from JWT
4. `GET /company/getAllCompanies` unauthenticated and returns all company data
5. `setTimeout` artificial loading in company-users is fragile

## Top 5 Best Opportunities

1. Add inline save feedback (spinner + checkmark on the Profile tab save button)
2. Wire Mission/Why Work With Us fields with new DB columns
3. Add company website and LinkedIn URL fields (trust signals for public jobs page)
4. Add completion percentage indicator showing how much of the company profile is filled
5. Show a live preview panel of how the company appears on public job listings

**Recommended next command:** TEST → then OPTIMIZE (safe fixes already applied this session)
