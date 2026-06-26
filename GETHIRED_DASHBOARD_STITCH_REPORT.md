# GETHIRED_DASHBOARD_STITCH_REPORT.md
Generated: 2026-06-27

## §1 Contract Map — Dashboard Main (`GET /company/dashboard`)

### Route & Auth
- Route: `GET /company/dashboard` — **verifyAuth applied** (companiesRoute.js line 37)
- Controller: `getDashboard()` in `companiesController.js`

### Company Scoping
- Derives company via `getUserCompanyForRequest(req, uid)` — looks up `company_employees` by the JWT `uid`, not a query param
- All sub-queries (`charts`, `statistic`, `totalContacts`, `graph`, `cities`, `contactList`) receive the server-derived `companyId`
- **Verdict: correctly scoped to the authenticated user's company**

### Response Shape (from `getDashboard`)
```json
{
  "company": { ...mappedCompany fields... },
  "charts":  { "activeJobs": number, "applicants": number, "interviews": number },
  "statistic": { "contacts": string, "applicants": string },
  "graph": [ ...rows... ],
  "jobViews": [ ...rows... ],
  "cities": [ { "city": string, "count": string } ],
  "totalContacts": number
}
```

Note: `graph` and `jobViews` come from the `graph()` service function which uses `...graphList` spread. `cities` comes from `...cityList` spread. Both spreads produce top-level keys, confirmed in controller code lines 384-387.

### mappedCompany Fields (what `dashboard.company` contains)
Returned by `getUserCompanyForRequest` → `getUserCompany` → `mappedCompany` in controller:
- `companyId`, `companyLogoUrl`, `companyName`, `companyDetails`, `industryId`, `workSetupId`
- `numberOfEmployee`, `companyEmail`, `companyCity`, `companyContactNumber`
- `companyCountry`, `companyAddress`, `createdAt`, `createdBy`, `updatedAt`
- `companyIndustryName`, `companyState`, `companyMapUrl`, `companyTown`, `companyZip`
- `companyAddressOne`, `withActiveSubscription`

**Model gap:** The TypeScript `Company` model in `company.model.ts` does NOT declare:
`companyState`, `companyTown`, `companyZip`, `companyMapUrl`, `companyAddressOne`, `withActiveSubscription`, `companyIndustryName`

These fields arrive from the BE but TypeScript cannot check for them. The template does not use them directly, so no runtime bug — but any future template access will be untyped.

### FE Field Mapping Verification
FE `dashboard$` pipe maps:
| FE accesses | BE field | Status |
|---|---|---|
| `dash.company` | top-level `company` key | MATCH |
| `dash.charts` | top-level `charts` key | MATCH |
| `dash.graph` | top-level `graph` key (from `...graphList` spread) | MATCH |
| `dash.statistic` | top-level `statistic` key | MATCH |
| `dash.jobViews` | top-level `jobViews` key (from `...graphList` spread) | MATCH |
| `dash.totalContacts` | top-level `totalContacts` key (`contact.length`) | MATCH |
| `dash.cities` | top-level `cities` key (from `...cityList` spread) | MATCH |

All 7 mapped fields exist in the BE response. **Contract: STABLE**

### Field Naming Consistency
All fields returned in camelCase — consistent. DB column `company_logo` → `companyLogoUrl` (note: the DB stores it as `company_logo` but the FE field is named `companyLogoUrl`; the mapping is explicit and correct).

### Null / Missing Field Handling
- `companyLogoUrl = null` when no logo uploaded — FE uses `*ngIf="dashboard.company"` then optional chain `dashboard.company?.companyName || 'Your company'`. Logo not directly rendered in dashboard header so null is safe.
- `charts` returns `{ activeJobs:0, applicants:0, interviews:0 }` when no data (BE explicitly sets 0 for empty rows). FE fallback `|| 0` is additionally defensive.
- `statistic` returns `{ contacts:"0", applicants:"0" }` with `toPrecision(3)` strings. FE passes to `<app-dashboard-statistics>` — no null crash risk.
- `graph` and `jobViews` return `0` (not `[]`) when empty (BE: `applicants.rows ? applicants.rows : 0`). **Issue:** if no rows, the value is the number `0` not an array `[]`. `<app-dashboard-charts>` receives `{ graph: 0, statistic: ..., jobViews: 0 }`. If that child component iterates over `graph`, it will iterate over nothing (0 is not iterable in `*ngFor`), but this depends on the child component's null guard. **Risk: LOW** — child component likely handles it.
- `cities` returns `{ cities: 0 }` (same pattern as graph) when no rows — same caveat.
- `totalContacts` is always a number (sum of two counts defaulting to 0).

### Error Handling
- BE returns `{ message: "Operation not successful. Please try again." }` with status 500 on any thrown error
- FE: NgRx effect catches error → dispatches `companyDashboardFail` → `loading$` presumably stays true or error state shown
- FE uses `*ngIf="!(loading$ | async); else dashSkeleton"` — the skeleton shows during loading; if the action fails, the observable may emit `null` or the store stays in `loading:false, dashboard:null`
- **Gap:** The FE has no explicit `error$` display for the main dashboard (only pipeline has a retry/error card). If `GET /company/dashboard` fails, the user sees an empty screen with no skeleton and no error message (the `ng-container *ngIf="dashboard$ | async as dashboard"` simply renders nothing)

---

## §2 Contract Map — Pipeline Overview (`GET /company/dashboard/pipeline-overview`)

### Route & Auth
- Route: `GET /company/dashboard/pipeline-overview` — **verifyAuth applied** (companiesRoute.js line 38)
- Controller: `getDashboardPipelineOverview()` in `companiesController.js`

### Company Scoping
- Uses `getUserCompanyForRequest(req, uid)` — same JWT-derived pattern as main dashboard
- Explicitly guards against no-company: returns 401 if `Array.isArray(userCompany)`
- **Verdict: correctly scoped**

### Response Envelope
BE `pipelineOverview()` returns:
```json
{
  "byStage": [{ "statusId": number, "label": string, "count": number }],
  "needsReview": [{ "applicationId": string, "jobId": string, "candidateName": string, "jobTitle": string, "statusId": number, "submittedDate": date }]
}
```
This is wrapped by `successResponse()` into `{ data: { byStage, needsReview } }`.

FE accesses `res?.data?.byStage` and `res?.data?.needsReview` — **MATCH**

### `byStage` Shape
- `statusId`: `application_status_id` from DB (integer)
- `label`: `job_applicant_status_name` from `job_applicant_status` table, or `"Unknown"` if null — **from DB, not hard-coded**
- `count`: integer count, parsed with `parseInt(r.count, 10)`
- All fields are camelCase — consistent with FE `PipelineStage` interface

### `needsReview` Shape
- `applicationId`: `job_application_id` (string)
- `jobId`: `job_id` (string)
- `candidateName`: computed `[firstname, lastname].filter(Boolean).join(' ') || "Candidate"` — safe even if names are null
- `jobTitle`: `job_title` string
- `statusId`: `application_status_id` (integer 1 or 3)
- `submittedDate`: `date_applied` (date object from Postgres)
- All camelCase — **MATCH** with FE `NeedsReviewItem` interface

### Null Safety
- `byStage` defaults to `[]` if DB returns no rows (FE: `res?.data?.byStage || []`)
- `needsReview` defaults to `[]` similarly
- `pipelineBarMax = Math.max(1, ...byStage.map(s => s.count))` — the `Math.max(1, ...)` ensures no divide-by-zero even with empty array

### Contract Stability
**STABLE** — the query is clean, all fields explicitly selected, no `SELECT *`. The `label` field comes from DB lookup so it's stable as long as the status name isn't renamed in the DB.

---

## §3 Contract Map — Subscription Restrictions (`GET /company/getsubscriptionrestrictions`)

### Route & Auth
- Route: `GET /company/getsubscriptionrestrictions` — **verifyAuth applied** (companiesRoute.js line 47)
- Controller: `getSubscriptionRestrictions()` in `companiesController.js`

### Security: BOLA Risk Assessment — RESOLVED
The FE still sends `?companyId=` as a query param (in `company.service.ts` line 20: `checkCompanySubscription(companyId)` → URL includes `?companyId=${companyId}`).

**However:** The BE controller (lines 665-687) was fixed: it **ignores the query param entirely** and derives `companyId` from `getUserCompanyForRequest(req, req.user.uid)`. The `companyId` query param is accepted by the FE call but silently ignored by the BE.

**Verdict: BOLA risk is CLOSED at the BE level.** The `?companyId=` query param is dead weight — the BE doesn't use it. This is safe but misleading; a future developer might re-introduce the bug by reading the service call.

**Recommendation (P2):** Remove `?companyId=${companyId}` from the `checkCompanySubscription` URL in `company.service.ts`. The BE ignores it. The FE passes the companyId from localStorage into the URL unnecessarily. Removing it makes the contract clearer and prevents a future developer from thinking the param is required.

### Response Shape
`companySubscriptions()` returns an array; `getSubscriptionRestrictions` takes `[0]` (most recent subscription).

Full object returned per subscription:
```json
{
  "companyId": string,
  "createdAt": Date,
  "isPaid": boolean,
  "paymentDate": Date,
  "subscriptionId": number,
  "jobPost": number,
  "admin": number,
  "videoResponse": number,
  "withCustomerCare": boolean,
  "price": number,
  "priceCurrency": string,
  "subscriptionName": string,
  "paymentOccurence": string,
  "jobPostCount": number,
  "adminCount": number,
  "videoResponseCount": number,
  "endAt": Date
}
```

### FE Field Usage Verification
| FE accesses | BE field | Status |
|---|---|---|
| `subs.isPaid` | `isPaid` | MATCH |
| `subs.subscriptionName` | `subscriptionName` | MATCH |
| `subs.endAt` | `endAt` (computed) | MATCH |
| `subs.jobPost` | `jobPost` | MATCH |
| `subs.jobPostCount` | `jobPostCount` | MATCH |
| `subs.admin` | `admin` | MATCH |
| `subs.adminCount` | `adminCount` | MATCH |
| `subs.videoResponse` | `videoResponse` | MATCH |
| `subs.videoResponseCount` | `videoResponseCount` | MATCH |

All 9 fields used by the FE template are present in the BE response. **Contract: STABLE**

### No-Subscription Case
If `companySubscriptions()` returns an empty array (no subscription), `getSubscriptionRestrictions` throws `"Company is not subscribed to any plan"` → BE returns 500. FE NgRx effect catches this via `catchError` → dispatches `getCompanySubscriptionFail`. The `subsRestrictions$` selector returns `null` or `undefined`. Template: `*ngIf="subsRestrictions$ | async as subs"` — section simply doesn't render. **No crash, but no error message to the user either.**

### `endAt` Computation
The BE computes `endAt` from `created_at + 7 days` (subscription_id=1, free trial) or `created_at + 30 days` (paid). This is a hardcoded business rule, not stored in DB. If the subscription period changes, the BE code must be updated.

---

## §4 Null Safety Analysis

| Scenario | Handling | Status |
|---|---|---|
| `dashboard.company` is null | `dashboard.company?.companyName \|\| 'Your company'`; `brandingScore(null)` returns `{score:0,missing:[]}` | SAFE |
| `dashboard.charts` is null | `dashboard.charts?.activeJobs \|\| 0` throughout template | SAFE |
| `GET /company/dashboard` errors | NgRx error action fires, `dashboard$` emits null, `*ngIf="dashboard$ \| async as dashboard"` hides section silently — no user-facing error | GAP |
| Pipeline fails | `pipelineError=true` → error card with Retry button shown | SAFE |
| Subscription never arrives | `*ngIf="subsRestrictions$ \| async as subs"` hides section — no error shown | ACCEPTABLE |
| `brandingScore(null)` | Returns `{score:0,missing:[]}` explicitly | SAFE |
| `subscriptionUsagePct(undefined, undefined)` | `if (!limit \|\| limit===0) return 0` — returns 0 | SAFE |
| `subscriptionDaysLeft(null)` | `if (!endAt) return 0` | SAFE |
| `graph/jobViews = 0` (empty rows BE bug) | Passed to child `<app-dashboard-charts>` — depends on child null guard | UNKNOWN |
| `cities = 0` (empty rows BE bug) | Passed to child `<app-dashboard-statistics>` — depends on child null guard | UNKNOWN |

**Key null safety gap:** BE `graph()` and `cities()` service functions return numeric `0` instead of `[]` when rows are empty (e.g., `graph: applicants.rows ? applicants.rows : 0`). The type should be `[]` not `0`.

---

## §5 Contract Stability Assessment

| Contract | Stability | Risk if BE changes shape |
|---|---|---|
| `GET /company/dashboard` | STABLE | All 7 top-level keys explicitly set; changing any key name breaks FE |
| `GET /company/dashboard/pipeline-overview` | STABLE | Typed interfaces `PipelineStage` and `NeedsReviewItem` on FE catch shape drift at compile time |
| `GET /company/getsubscriptionrestrictions` | STABLE | All 9 template-used fields present; `endAt` computed BE-side, not from DB |
| `successResponse` envelope `{ data: ... }` | STABLE | All three calls access `.data` consistently |

**Fragile points:**
1. `graph` and `jobViews` fields: if BE changes the `...graphList` spread or renames the function, both fields break silently (no TypeScript check catches it since `Dashboard.graph` is typed as `any`)
2. `statistic` field names (`contacts`, `applicants`) are string percentages with `toPrecision(3)` — if BE changes to integers, the child component display changes
3. The `successResponse` wrapper pattern is used universally — if any endpoint switches to a raw response, the `.data` access breaks
4. `subscriptionId === 1` hard-coded in BE for 7-day trial period — coupling between subscription seed data and business logic

**Recommendation:** Add a typed interface for the pipeline response (`PipelineOverviewResponse`) to `company.model.ts`. The current FE interface is only defined locally in the component file.

---

## §6 Findings Summary

| ID | Type | Severity | Description |
|---|---|---|---|
| ST-01 | Bug (BE) | P2 | `graph()` and `cities()` return `0` not `[]` when rows empty — type inconsistency |
| ST-02 | Gap | P1 | No user-facing error state when `GET /company/dashboard` fails — screen silently blank |
| ST-03 | Info | P2 | Dead query param: `?companyId=` sent by FE but ignored by BE in `getsubscriptionrestrictions` — misleading |
| ST-04 | Model gap | P3 | `Company` TypeScript model missing 7 fields that exist in BE response |
| ST-05 | Business logic | P2 | `endAt` computed from hardcoded 7/30-day offsets in BE — not stored in DB |
| ST-06 | Info | CLOSED | BOLA risk in `getsubscriptionrestrictions` — FIXED: BE ignores query param, derives companyId from JWT |

---

## Release Gate

| Gate | Status |
|---|---|
| All 3 data flows have verifyAuth middleware | PASS |
| Dashboard main: company scoping correct | PASS |
| Pipeline: company scoping correct | PASS |
| Subscription: BOLA risk closed | PASS |
| All FE field mappings verified against BE | PASS |
| Null safety (template level) | PASS with caveat (graph/cities = 0) |
| Error handling: pipeline | PASS |
| Error handling: main dashboard failure | FAIL — no user-facing error |
| TypeScript model completeness | FAIL — 7 undeclared fields |
| Typed pipeline response model | FAIL — interfaces are component-local only |
