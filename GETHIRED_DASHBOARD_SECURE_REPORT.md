# GetHired Employer Dashboard — Security Report
**Scope:** `/recruiter/dashboard` (FE: CompanyDashboardComponent + sub-components; BE: companiesController.js endpoints used by the dashboard)
**Date:** 2026-06-27

---

## Executive Summary

The dashboard's security posture is **strong**. All three BE endpoints are protected by `verifyAuth` middleware and derive the company scope from the Firebase-verified JWT — no client-supplied companyId is trusted for data access. One PII finding (P2) was found and fixed in the `dashboard-banner` sub-component. No P0 or P1 findings are specific to the dashboard. A previously documented P0 (`addCompanyUser` BOLA) has already been closed.

---

## §1 Auth / Authorization Review

### FE Route Guard
The `/recruiter` prefix is protected by `AuthGuard` at the top-level routing module (`app.routing.module.ts` line 37–43). `AuthGuard.checkUserLogin()` reads `state` from localStorage; if it is not `'true'` the user is redirected to `/signin`. It also enforces that the user's stored role is `'2'` (employer); any other role is redirected to their correct panel.

**Note:** `InternalEmployerGuard` is commented out on the `dashboard` child route inside `employer-panel.module.ts` (line 27). However, the parent `EmployerPanelComponent` has its own auth check via `coreService.isLoggedIn()` in `ngOnInit`, and the `AuthGuard` on the `recruiter` parent still fires before the child route loads. The commented-out guard is a defence-in-depth gap (LOW — does not bypass the outer guard).

### Null-company state in FE
The component wraps the entire template body in `*ngIf="!(loading$ | async); else dashSkeleton"` and the inner content in `*ngIf="dashboard$ | async as dashboard"`. If the NgRx store holds `null`, the skeleton/nothing is rendered — no crash, no data exposure.

### BE: `GET /company/dashboard`
`getDashboard()` (line 369): reads `uid` from `req.user` (populated by `verifyAuth`). Calls `getUserCompanyForRequest(req, uid)` — this queries `company_employees` by the authenticated uid, returning only the company owned/joined by that user. All downstream queries use the derived `companyId`. **Safe — no client-supplied id trusted.**

### BE: `GET /company/dashboard/pipeline-overview`
`getDashboardPipelineOverview()` (line 402): same pattern. Derives `companyId` from JWT uid. Guards against the empty-array case (`Array.isArray(userCompany)` check). **Safe.**

### BE: `GET /company/getsubscriptionrestrictions`
`getSubscriptionRestrictions()` (line 665): derives `companyId` from JWT via `getUserCompanyForRequest`. The client-supplied `companyId` query parameter that used to be trusted was replaced in QA10 FIX-11. **Safe — BOLA closed.**

### FE localStorage use for subscription dispatch
`ngOnInit` reads `localStorage.getItem('user')` to extract `companyId`, then calls `this.companyFacade.getCompanySubscription(user.companyId)`. This `companyId` is passed as a query parameter to the BE, but the BE **ignores the query param** and re-derives from the JWT (`QA10 FIX-11`). So a tampered `companyId` in localStorage does not grant access to another company's subscription data. **Safe — BE is authoritative.**

---

## §2 Data Exposure Review

| Field / Section | Exposed to user | Assessment |
|---|---|---|
| `jobPostCount`, `adminCount`, `videoResponseCount` | Yes (own plan data) | Appropriate — recruiter's own usage |
| `brandingScore()` fields: logo, description, city, industry, teamSize, contactNumber | Yes (own company fields) | Appropriate — completion checker |
| `needsReview` items: candidateName, jobTitle, submittedDate | Yes | Appropriate for a recruiter dashboard |
| `companyName` in hero H1 | Yes | Own company — appropriate |
| `subscriptionName`, `isPaid`, `endAt` | Yes | Own plan metadata — appropriate |

No raw API response fields are rendered that would leak sensitive data. The `mappedCompany()` helper in the controller explicitly excludes fields not mapped to the response object.

**`companyEmail` and `companyContactNumber`** are present in the subscription/branding data but the dashboard template does not render them directly in any insecure way — they are only used for completeness scoring booleans.

---

## §3 XSS Review

- **`[innerHTML]` usage:** Zero instances found in `company-dashboard.component.html` or `company-dashboard.component.ts`. No `DomSanitizer` bypass (`bypassSecurityTrustHtml`, `bypassSecurityTrustUrl`, etc.) used anywhere in the component files.
- **All displayed values use Angular `{{ }}` interpolation**, which HTML-encodes output by default.
- **`dashboard.company?.companyName`** is interpolated via `{{ }}` — Angular escapes it. A company name containing `<script>` would be rendered as literal text.
- **`missingFields.join(', ')`** is `{{ }}`-bound — safe.
- **`aria-label` bindings** use `[attr.aria-label]="'string: ' + value"` — Angular encodes attribute values, safe against attribute injection.

**XSS assessment: PASS**

---

## §4 Console Log / PII Review

**Finding (FIXED — SEC-DASH-01, P2):**
`dashboard-banner.component.ts` line 20 contained:
```
console.log(this.details);
```
`this.details` receives the full company object from the dashboard, which includes `companyEmail`, `companyContactNumber`, `companyName`, `companyCity`, and other profile fields. This was a PII leak via the browser console visible to anyone with DevTools open.

**Fix applied:** Removed the `console.log` call from `DashboardBannerComponent.ngOnInit()`.

No other `console.log` calls were found in the dashboard component files (`company-dashboard.component.ts`, the HTML, or SCSS). The BE controller uses only `console.error` and `console.warn` (no PII in log messages — only error codes and generic strings).

---

## §5 FE Security — localStorage Dependency

The dashboard reads localStorage in two places:

1. **`ngOnInit` → `asyncLocalStorage.getItem('user')`** — reads `companyId` to dispatch `getCompanySubscription()`. BE ignores this value and re-derives from JWT (closed by QA10 FIX-11). **Safe.**
2. **`EmployerPanelComponent` constructor** — reads `localStorage.getItem('user')` synchronously to populate `this.user`, then calls `this.employeeFacade.getEmployeeProfile(this.user._id)`. This is the user's own `_id` for their employee profile — not used for authorization on the BE dashboard endpoints. **No BOLA risk for the dashboard endpoints.**

localStorage is not used for any authorization decision that the BE trusts. All BE authorization flows through the Firebase JWT in the `Authorization: Bearer` header.

---

## Findings Table

| ID | Severity | Area | Description | Status | Action Needed |
|---|---|---|---|---|---|
| SEC-DASH-01 | P2 | PII / Console | `dashboard-banner.component.ts` logged the full company object (email, phone, etc.) to console | FIXED | None — `console.log` removed |
| SEC-DASH-02 | LOW / Info | Auth | `InternalEmployerGuard` is commented out on the dashboard child route; outer `AuthGuard` still protects the route | OPEN | Optional: re-enable inner guard for defence in depth |
| P0-BOLA-addCompanyUser | CLOSED | BE BOLA | `addCompanyUser` previously trusted `companyId` from req.body | CLOSED | QA9 FIX-3 applied |
| P1-getAllCompanies-unauth | INFO | BE | `GET /company/getAllCompanies` — requires `verifyAuth` per routes (line 53), confirmed | CLOSED | No action |

---

## Release Gate

| Gate | Result |
|---|---|
| Auth protection (route + BE) | PASS |
| Data exposure (own data only) | PASS |
| XSS safety (no innerHTML, all `{{ }}`) | PASS |
| PII handling (console.log removed) | PASS (fix applied) |
| FE localStorage security (BE ignores client id) | PASS |
