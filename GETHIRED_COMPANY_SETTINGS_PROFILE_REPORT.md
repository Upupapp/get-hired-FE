# GetHired Company Settings / Profile Audit
**Report type:** Company Profile Data Model, Visibility & Cross-Platform Sync Audit
**Scope:** `/recruiter/company/settings` — company-details-form, NgRx store, BE controller, cross-platform placements
**Date:** 2026-06-27

---

## 1. Executive Summary

The company settings form is well-structured and mostly complete. Thirteen fields are collected in the form, all thirteen are sent to the BE on save, and the BE `updateCompany` SQL covers all of them (17 column SET). The NgRx store is updated optimistically on success (`updateCompanySuccess` sets `state.selected = action.company`), and `companyFacade.companyDetails$` propagates the new data to the topbar and sidebar without a page reload.

**Key findings:**

- **`shownPublicly` is saved to the DB and returned by `mappedCompany()`, but no public-facing query filters on it.** The `companyList` service query and `companyDetailsById` have no `WHERE shown_publicly = true` guard. Any company — regardless of this flag — appears in `/company/featured` and is accessible at `/company/details?id=...`.
- **`company.model.ts` (FE company module) is missing 6 fields** that exist on the DB and are used in the form: `companyState`, `companyTown`, `companyZip`, `companyMapUrl`, `companyAddressOne`, `shownPublicly`. These are present on `EmployeeCompany` (employee.model.ts) but not on the shared `Company` interface.
- **`companies.model.ts` (public module) is also missing** the new address fields and `shownPublicly`, causing type drift between recruiter and public views.
- **`company.service.js` (BE)** `mappedCompany()` does NOT include `shownPublicly` in its output — only the controller's `mappedCompany()` in `companiesController.js` does. The service function used by `companyDetailsById` (public company page) omits it.
- **Dashboard branding score** (existing in `company-dashboard.component.ts`) already calculates a 6-field completeness score, but it is not surfaced to the recruiter on the settings form itself.
- **localStorage sync** only updates 3 fields (`companyName`, `companyId`, `companyLogoUrl`) — all other saved fields do not refresh localStorage.
- **No completeness indicator on the settings form.** Recruiters receive no nudge to fill optional fields.

---

## 2. Company Data Model Audit

### 2a. Form Controls vs Backend

| Field | Form Control | DB Column | Type | Required (FE) | Validated (BE) | Publicly Shown? | Notes |
|---|---|---|---|---|---|---|---|
| companyName | companyName | company_name | varchar | Yes (Validators.required) | Yes (required + max 200) | Yes | Core identity |
| companyEmail | companyEmail | company_email | varchar | Yes (Validators.email) | Yes (required + format) | No (contact only) | |
| companyContactNumber | companyContactNumber | company_contact_number | varchar | No | No | No | |
| companyAddress | companyAddress | company_address | varchar | No | No | No | Filled by address component |
| companyCity | companyCity | company_city | varchar | No | No | Yes (job cards) | Used in NormalizedJob |
| companyCountry | companyCountry | company_country | varchar | No | No | Yes (job cards) | Used in NormalizedJob |
| companyState | companyState | company_state | varchar | No | No | No | |
| companyTown | companyTown | company_suburb | varchar | No | No | No | **DB column is `company_suburb`, FE key is `companyTown`** |
| companyZip | companyZip | company_zip | varchar | No | No | No | |
| companyMapUrl | companyMapUrl | company_mapurl | varchar | No | No | No | |
| companyAddressOne | companyAddressOne | company_address_one | varchar | No | No | No | |
| companyDetails | companyDetails | company_details | text | No | No (max 1000 check in BE) | Yes (job detail page) | maxlength=1000 in HTML |
| industryId | industryId | industry_id | integer | No | No | Yes (job cards/detail) | parseInt on submit |
| workSetupId | workSetupId | work_setup_id | integer | No | No | Yes (job cards/detail) | parseInt on submit |
| numberOfEmployee | numberOfEmployee | number_of_employee | integer | No | Yes (0–1,000,000) | Limited | In NormalizedJob as companyNumberOfEmployee |
| companyLogoUrl | companyLogoUrl | company_logo | varchar | No | No | Yes | Firebase Storage URL |
| companyLogoFile | companyLogoFile | — | File | No | No | — | Uploaded to Firebase; URL stored in company_logo |
| shownPublicly | shownPublicly | shown_publicly | boolean | No | No | — | See Section 5 |

### 2b. Model Interface Gaps

**`src/app/company/company.model.ts` — Company interface** is missing:
- `companyState`
- `companyTown`
- `companyZip`
- `companyMapUrl`
- `companyAddressOne`
- `shownPublicly`

These fields DO exist on `EmployeeCompany` in `src/app/employee/employee.model.ts` (which `company-details-form` uses via its type annotation). The missing fields on the core `Company` interface mean typed service calls, reducers, and effects that reference `Model.Company` will not see these fields at compile time.

**`src/app/companies/companies.model.ts` — public Company interface** is missing:
- All address sub-fields (companyState, companyTown, companyZip, companyMapUrl, companyAddressOne)
- `shownPublicly`
- `companyLogoUrl` (uses `companyLogo` instead — naming discrepancy)

**`services/company.service.js` — `mappedCompany()`** (used for public page) is missing:
- `companyState`, `companyTown`, `companyZip`, `companyMapUrl`, `companyAddressOne`, `shownPublicly`
- `companyIndustryName` (returned as `companyIndustry`, not `companyIndustryName`)

Only `companiesController.js`'s `mappedCompany()` includes all address sub-fields and `shownPublicly`.

---

## 3. Cross-Platform Visibility Map

| Placement | Data Shown | Source | Updated on Save? | Risk if Stale |
|---|---|---|---|---|
| **Topbar (employer panel)** | companyName | `companyFacade.companyDetails$` (NgRx store) | Yes — updateCompanySuccess updates `state.selected` | Low — live stream |
| **Sidebar (employer panel)** | companyName | `companyFacade.companyDetails$` with localStorage fallback | Yes | Low |
| **Recruiter dashboard company card** | companyLogoUrl, companyName, companyDetails, companyCity, industryId, numberOfEmployee | `companyFacade.dashboard$` (updateCompanySuccess patches these 6 fields into dashboard state) | Partial — only 6 fields patched, not full reload | Medium — other fields (email, address) in dashboard widget would be stale until next getCompanyDashboard() |
| **Job creation preview** | companyName, companyLogoUrl | localStorage (`user.companyName`, `user.companyLogoUrl`) | Yes (updateLocalStorage() called after save) | Low for name/logo; medium for other fields |
| **Public job card** | companyName, companyLogo, companyCity, companyCountry, industryId | Job record (joined at publish time from companies table) | No — job must be re-published or job service re-queries company | High — logo/name change does not auto-propagate to already-published job cards unless job is re-fetched |
| **Public job detail page (company snapshot)** | companyName, companyLogo, companyDetails, companyCity, companyCountry, companyNumberOfEmployee | Job detail API response (joined from companies table) | Same as above — live join at request time | Low — BE joins company fresh on each request |
| **Public company directory (`/companies`)** | companyName, companyLogo, companyIndustry, job opening count | `companyList()` via `/company/featured` | No filter on shownPublicly | High — any company appears regardless of shownPublicly |
| **Public company page (`/companies/details?id=`)** | Full company record | `companyDetailsById()` via `/company/details` | Live on each load | Medium — shownPublicly not enforced |
| **Applicant application detail** | companyName, companyLogoUrl | Job record or store | Not tracked in scope | Medium |

### Topbar and Sidebar Update Flow
```
onSubmit() -> companyFacade.updateCompany()
  -> effects: PUT /company/update
  -> updateCompanySuccess({ company })
  -> reducer: state.selected = company
  -> companyFacade.companyDetails$ emits
  -> employer-panel.component.ts.companyNameForTopbar$ updates
  -> employer-sidebar.component.ts.companyName$ updates
```
This is the fully connected path confirmed in source code. Both topbar and sidebar use `companyFacade.companyDetails$` live — no page reload needed.

---

## 4. Profile Completeness Scoring Spec

The dashboard already has a 6-field `brandingScore()` function in `company-dashboard.component.ts`. Below is the recommended formal spec for use if a completeness widget is added to the settings form.

| Section | Fields | Weight | Score Logic |
|---|---|---|---|
| Company identity | companyName (required), companyLogoUrl, companyEmail | 30% | 10% each |
| Company description | companyDetails (1–1000 chars) | 20% | All or nothing |
| Industry + work setup | industryId, workSetupId | 15% | 7.5% each |
| Contact info | companyContactNumber, companyAddress | 15% | 7.5% each |
| Team size | numberOfEmployee > 0 | 10% | All or nothing |
| Public visibility | shownPublicly = true | 10% | All or nothing |

**Total: 100%**

Currently the dashboard computes a simpler 6-field score (logo, details, city, industry, teamSize, contactNumber) with equal weight = ~16.7% per field. Recommend aligning on the spec above and adding the indicator to the settings form as well.

---

## 5. `shownPublicly` Field Audit

### What it controls (intended)
`shownPublicly` is a boolean (`shown_publicly` in DB) intended to control whether the company appears in public-facing directories and listings.

### Is it enforced on the BE?

**No.** This is a confirmed gap.

- `companyList()` in `services/company.service.js` — no `WHERE shown_publicly = true`. All companies appear in `/company/featured`.
- `companyDetailsById()` in `services/company.service.js` — no check; returns any company by ID.
- `getSpecificCompany()` in `companiesController.js` — no check; the public route `GET /company/details` has no `verifyAuth` middleware and returns any company by ID.
- The only place `shown_publicly` is written is in `updateCompany()`. It is never read back in a public-facing filter.

**Result: `shownPublicly = false` has no actual effect.** Companies are always publicly accessible.

### FE visibility indicator
The form shows a checkbox labelled "Publicly Shown" next to the address section. There is:
- No current-state label ("You are currently visible to the public" / "Your profile is hidden")
- No confirmation dialog before setting `shownPublicly = false`
- No explanation of what the field controls

### Risk
A recruiter who unchecks "Publicly Shown" expecting to hide their company from the public directory will see no change in behavior. This is a silent contract break.

---

## 6. Logo Upload / Display Audit

### Storage
Logos are uploaded to Firebase Storage via `uploadInStorage("Company-Logo", "{companyId}-Logo", file)` in the BE. The resulting URL is stored in `company_logo` (varchar). The BE always uses the same storage key per company (`{companyId}-Logo`), so re-uploading replaces the previous logo at the same path.

### Cache-bust mechanism
The FE appends `?v=<timestamp>` to the logo URL in `setCompany()`:
```
companyLogoUrl + '?v=' + Date.now()
```
This is applied every time the store emits (on load and on save). It defeats browser caching after a re-upload. This is correct.

### Form display
- Logo is displayed in a `<img [src]="profileImage">` inside `col-12 col-lg-3` **only if `profileImage` is truthy**.
- If a company has no logo, the image block is not shown at all — there is no fallback placeholder or avatar initial.
- `companyName` input also conditionally renders inside `*ngIf="profileImage"` (see line 51 in HTML), meaning the name field appears in two different column positions depending on whether a logo exists. This is a minor layout inconsistency.

### Size / dimension recommendation
No size or dimension guidance is shown in the form. No FE validation on image dimensions or file size is implemented. The `app-file-upload` component is used without a `maxSize` or `acceptedTypes` constraint visible in the template.

### Public display
- Logo appears on the public company page (`/companies/details`) via `companyLogoUrl`.
- Logo appears in the company snapshot widget on the job detail page via `NormalizedJob.companyLogo`.
- Logo appears in job cards via `companyLogoUrl` joined from the companies table in job queries (confirmed in `job.service.js` lines 470, 696, 747).
- The public company model (`companies.model.ts`) uses `companyLogo` (not `companyLogoUrl`); the controller `mappedCompany()` maps `company_logo -> companyLogoUrl`, not `companyLogo`. There is a **field name mismatch** between the public model and the controller mapping.

---

## 7. NgRx Store Consistency

### After `updateCompany` success
The `updateCompanySuccess` reducer does two things:
1. Sets `state.selected = action.company` — the full updated company object returned by the BE.
2. Patches 6 fields into `state.dashboard.company` (companyLogoUrl, companyName, companyDetails, companyCity, industryId, numberOfEmployee).

The BE `updateCompany` handler returns `mappedCompany(rows[0])` from the UPDATE query's `RETURNING *`, which is the full row including all 18 updated fields. So `state.selected` receives the complete up-to-date company record.

### Success flow summary
```
PUT /company/update -> RETURNING * -> mappedCompany() -> res.data
  -> effects: updateCompanySuccess({ company: res.data })
  -> reducer:
      state.selected = company  (full record, all fields)
      state.dashboard.company (6 fields patched)
  -> companyDetails$ (= selected) emits -> form re-populates via setCompany()
  -> topbar / sidebar update
  -> localStorage updated (companyName, companyId, companyLogoUrl only)
```

### Stale-data risk
- **Form itself:** No stale risk. `companyDetails$` re-populates `setCompany()` on `updateCompanySuccess`, which calls `patchValue()` with the latest store state.
- **Dashboard:** Partial patch only (6 of 18 fields). If the recruiter navigates to the dashboard without triggering `getCompanyDashboard()`, address/email/phone fields in dashboard widgets would be stale until the next full dashboard load.
- **localStorage:** Only 3 fields refreshed. Any component reading `user.companyEmail` or `user.companyContactNumber` from localStorage will see stale values.
- **Public job cards:** No connection. Public job cards cached at request-time; stale until job is re-fetched.

---

## 8. Data Privacy / Security Boundary

### Current BE boundary analysis

| Field | Recruiter (authenticated) | Public (unauthenticated) | Notes |
|---|---|---|---|
| companyName | Yes | Yes | In all public queries |
| companyLogoUrl | Yes | Yes | In all public queries |
| companyDetails | Yes | Yes | On job detail + public company page |
| companyCity | Yes | Yes | In job cards |
| companyCountry | Yes | Yes | In job cards |
| companyIndustry(Id) | Yes | Yes | In job cards |
| numberOfEmployee | Yes | Partial | In NormalizedJob but labelled as optional |
| companyEmail | Yes | **YES (gap)** | Returned by `companyDetailsById()` on the public route — no filter |
| companyContactNumber | Yes | **YES (gap)** | Same — returned in full company record on public company page |
| companyAddress | Yes | **YES (gap)** | Same |
| companyState | Yes | **YES (gap)** | Same |
| companyTown/Zip/etc | Yes | **YES (gap)** | Same |
| companyMapUrl | Yes | **YES (gap)** | Same |
| shownPublicly | Yes | **YES (gap)** | Returned in mappedCompany(), exposed on public route |
| createdBy (user UID) | Yes | **YES (gap)** | `createdBy` is mapped in `mappedCompany()` and returned on public company page |

### Summary
The `GET /company/details?id=` route has **no `verifyAuth` middleware** and returns the full `mappedCompany()` output, which includes `companyEmail`, `companyContactNumber`, `companyAddress`, `companyMapUrl`, `companyAddressOne`, `shownPublicly`, and even `createdBy` (the recruiter's Firebase UID). These should be restricted.

**Recommended fix:** Strip contact/private fields from the public company response. The public endpoint should return only: companyId, companyName, companyLogoUrl, companyDetails, companyCity, companyCountry, industryId, companyIndustryName, workSetupId, numberOfEmployee. Remove: companyEmail, companyContactNumber, companyAddress, companyState, companyTown, companyZip, companyMapUrl, companyAddressOne, companyMapUrl, createdBy, shownPublicly.

---

## 9. Company Profile Completeness UX

### Current state
- No completeness indicator on `/recruiter/company/settings`.
- The dashboard (`company-dashboard.component.ts`) computes a `brandingScore()` percentage and `companyProfileMissingFields()` but only shows it in the dashboard Action Inbox widget — not on the settings form.
- The Action Inbox "recommended step" points recruiter to `/recruiter/company/settings` when `missingCount >= 2`, but the settings form does not receive this signal.

### What a completeness indicator could look like
A simple `0–100%` progress bar at the top of the settings form with a list of missing sections would close the feedback loop. The `brandingScore()` logic in the dashboard is already the right computation — it just needs to be exposed on the form page.

### Commonly missing fields
Based on the brandingScore() and companyProfileMissingFields() implementation, the 6 fields most commonly missing are:
1. companyLogoUrl (logo)
2. companyDetails (description)
3. companyCity (location)
4. industryId (industry)
5. numberOfEmployee (team size)
6. companyContactNumber (contact number)

### Empty state
If a recruiter's `companyId` is null (no company created yet), `setCompany()` does not call `patchValue()` and the form stays blank. There is no empty-state UI explaining that the recruiter must create a company first. The `createCompany` path exists in the facade and the submit handler, but there is no "Create your company" heading or call-to-action for new recruiters.

---

## 10. Address Fields Audit

The form captures 8 address-related fields via the `app-google-address-search` component. All 8 are populated by the `addressChange()` handler.

| FE Field | DB Column | Sent on Save? | Returned on GET? (controller) | Returned on GET? (service) | In Form? | In HTML patchValue? |
|---|---|---|---|---|---|---|
| companyAddress | company_address | Yes | Yes | Yes | Yes (via address component) | No (not in patchValue list) |
| companyCity | company_city | Yes | Yes | Yes | Yes | Yes |
| companyCountry | company_country | Yes | Yes | Yes | Yes | Yes |
| companyState | company_state | Yes | Yes | No | Yes (via address component) | No |
| companyTown | company_suburb | Yes | Yes (as companyTown) | No | Yes (via address component) | No |
| companyZip | company_zip | Yes | Yes | No | Yes (via address component) | No |
| companyMapUrl | company_mapurl | Yes | Yes | No | Yes (via address component) | No |
| companyAddressOne | company_address_one | Yes | Yes | No | Yes (via address component) | No |

### Key findings
1. **patchValue() in setCompany() does not include the 5 address sub-fields** (companyAddress, companyState, companyTown, companyZip, companyMapUrl, companyAddressOne). They are loaded into `this.rawAddress` and passed to the `app-google-address-search` component instead. This is correct by design — the address component owns its own display. However, if the address component re-initializes on each `companyDetails$` emission (not verified), users could lose unsaved address edits when the store emits mid-edit.
2. **`rawAddress` initialization** happens on every `setCompany()` call, so every store emit (including the success emit after save) will re-initialize `rawAddress` — potentially resetting the address widget if it does a full re-render on `[rawAddress]` input change.
3. **`services/company.service.js` `mappedCompany()`** does not map any address sub-fields (state, town, zip, mapUrl, addressOne). This means the public company page endpoint returns these fields as `undefined`. Only the controller's `mappedCompany()` maps them.
4. **Address autocomplete** (Google address search) populates all 8 fields via the `(addressChange)` event. There is no fallback for users without Google Maps API access.

---

## 11. Backlog

| ID | Title | Area | Priority | Files | Dependency |
|---|---|---|---|---|---|
| CS-001 | Enforce `shownPublicly` in public company queries | BE privacy | P0 | `services/company.service.js` companyList(), companyDetailsById() | None |
| CS-002 | Strip private fields from public GET /company/details response | BE privacy | P0 | `companiesController.js` getSpecificCompany(), mappedCompany() in service | None |
| CS-003 | Add missing fields to `company.model.ts` Company interface | FE types | P1 | `src/app/company/company.model.ts` | None |
| CS-004 | Add missing fields to `companies.model.ts` public Company interface | FE types | P1 | `src/app/companies/companies.model.ts` | None |
| CS-005 | Add `shownPublicly` + address sub-fields to `services/company.service.js` mappedCompany() | BE data | P1 | `services/company.service.js` | None |
| CS-006 | Surface completeness score on the settings form | FE UX | P2 | `company-details-form.component.ts/html` | brandingScore() already exists in dashboard |
| CS-007 | Fix `companyLogo` vs `companyLogoUrl` naming mismatch between public model and controller | FE types | P2 | `companies.model.ts`, `companiesController.js` | None |
| CS-008 | Add confirmation dialog when setting `shownPublicly = false` | FE UX | P2 | `company-details-form.component.html` | None |
| CS-009 | Add current-state label for `shownPublicly` toggle ("Currently visible / hidden") | FE UX | P2 | `company-details-form.component.html` | None |
| CS-010 | Show logo upload size/dimension guidance in form | FE UX | P3 | `company-details-form.component.html` | None |
| CS-011 | Add logo fallback / placeholder for companies with no logo | FE UX | P3 | `company-details-form.component.html` | None |
| CS-012 | Extend localStorage sync to cover all 18 company fields (or remove reliance on localStorage for anything beyond companyId/name/logo) | FE sync | P2 | `company-details-form.component.ts` updateLocalStorage() | None |
| CS-013 | Add empty-state "Create your company" UI for new recruiters with no companyId | FE UX | P2 | `company-details-form.component.html` | None |
| CS-014 | Investigate whether `rawAddress` re-init on every store emit resets the address widget | FE bug | P1 | `company-details-form.component.ts` setCompany() | Needs runtime test |
| CS-015 | Full dashboard refresh (not partial 6-field patch) on updateCompanySuccess | FE sync | P3 | `company.reducer.ts` updateCompanySuccess | None |

---

## 12. Release Gate

### Gate A — Data Model Correctness
| Check | Status | Notes |
|---|---|---|
| All form fields reach the DB on save | PASS | All 18 fields in UPDATE query |
| DB response mapped to camelCase correctly | PASS (controller) / PARTIAL (service) | service.js mappedCompany() missing 6 fields |
| FE Company model interface matches all saved fields | FAIL | company.model.ts missing 6 fields |
| Public Company model matches API response | FAIL | companies.model.ts missing address/shownPublicly; logo field name mismatch |
| `companyTown` mapped from `company_suburb` | PASS (controller) | Naming is confusing but consistent in controller |

**Gate A: FAIL**

### Gate B — Cross-Platform Sync
| Check | Status | Notes |
|---|---|---|
| Topbar updates after save without reload | PASS | companyFacade.companyDetails$ live stream |
| Sidebar updates after save without reload | PASS | Same |
| Form re-populates with saved values after save | PASS | setCompany() called on success emit |
| Dashboard company widget patches 6 fields on save | PASS | Partial — only 6 of 18 |
| localStorage updated for logo/name/id | PASS | 3 fields only |
| Public job cards reflect updated company name/logo | UNKNOWN | Depends on BE join timing; no cache invalidation |

**Gate B: PARTIAL / UNKNOWN**

### Gate C — Privacy / Visibility
| Check | Status | Notes |
|---|---|---|
| shownPublicly enforced in public company list query | FAIL | No WHERE clause |
| shownPublicly enforced on public company detail endpoint | FAIL | No check |
| Contact details (email, phone, address) hidden from public endpoint | FAIL | Full record returned on unauthenticated route |
| `createdBy` (recruiter UID) hidden from public endpoint | FAIL | Mapped and returned |

**Gate C: FAIL**

### Gate D — Completeness
| Check | Status | Notes |
|---|---|---|
| Required fields enforced FE + BE | PASS | companyName + companyEmail validated both sides |
| Completeness score surfaced to recruiter on settings form | FAIL | Only on dashboard |
| Missing-field nudge on settings form | FAIL | Not implemented |
| Logo upload guidance | FAIL | No size/type guidance |

**Gate D: FAIL**

---

## 13. Recommended Next Command

**Run SECURE** targeting the company profile endpoints.

Three P0 issues were found:
1. `shownPublicly` flag is not enforced — any company appears publicly regardless.
2. Private fields (email, phone, address, recruiter UID) are returned by the public unauthenticated `/company/details` endpoint.
3. `companyList()` (featured companies) has no public/private filter.

These are data-exposure issues that should be fixed before any UX completeness work begins. After SECURE addresses the privacy boundary, the highest-value next step is a targeted fix sprint:
- CS-001 + CS-002 (enforce shownPublicly, strip private fields) — 1–2 hours of BE work
- CS-003 + CS-004 + CS-005 (model interface alignment) — 30 minutes of type-sync
- CS-006 (completeness indicator on settings form) — surface the existing brandingScore() logic to the form
