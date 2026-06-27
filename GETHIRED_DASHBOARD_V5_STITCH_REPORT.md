# GetHired Dashboard V5 — STITCH Report (API Contract Verification)
**Date:** 2026-06-27 | **Component:** `company-dashboard`

---

## BE Response Shape — `/company/dashboard`

Verified from `companiesController.js` lines 380-387:

```javascript
const dbResponse = {
  company: userCompany,              // object
  charts: chart,                     // { activeJobs, applicants, interviews }
  statistic: statistics,             // { contacts: "30.0", applicants: "70.0" }
  ...graphList,                      // SPREAD → graph: rows[], jobViews: rows[]  (top-level)
  ...cityList,                       // SPREAD → cities: rows[]                    (top-level)
  totalContacts: contact.length,     // number
};
```

Top-level keys on `dash`: `company`, `charts`, `statistic`, `graph` (array), `jobViews` (array), `cities` (array), `totalContacts`.

---

## Contract Verification

### Chart Data Shape ✓

**FE mapping** (`dashboard$` map, `.ts` lines 60-75):
```typescript
graph: {
  graph: dash.graph,          // rows[] → app-dashboard-charts @Input details.graph
  statistic: dash.statistic,  // { contacts, applicants } → details.statistic
  jobViews: dash.jobViews,    // rows[] → details.jobViews
}
```

**dashboard-charts.component.ts** reads:
- `this.details.statistic` → `{ contacts, applicants }` — matches `dash.statistic` ✓
- `this.details.graph` → rows[] — matches `dash.graph` (the array) ✓
- `this.details.jobViews` → rows[] — matches `dash.jobViews` (the array) ✓

**Verdict: PASS** — No STITCH issue with chart data.

### Pipeline Overview — `/company/dashboard/pipeline-overview` ✓

**BE response shape** (from `companyService.getDashboardPipelineOverview()`):
```json
{ "data": { "byStage": [...], "needsReview": [...] } }
```

**FE consumption** (`loadPipelineOverview()`, `.ts` lines 198-209):
```typescript
this.byStage = res?.data?.byStage ?? [];
this.needsReview = res?.data?.needsReview ?? [];
```

Safe null coalescing, defensive access. **Verdict: PASS**

### Subscription Data — `subsRestrictions$` ✓

**FE template reads:**
- `subs.isPaid` — boolean
- `subs.subscriptionName` — string
- `subs.endAt` — Date/string for days-left calc
- `subs.jobPost`, `subs.jobPostCount` — number pair for meters
- `subs.admin`, `subs.adminCount` — number pair
- `subs.videoResponse`, `subs.videoResponseCount` — number pair

All accessed with `|| 0` fallback or `|| '—'` fallback. **Verdict: PASS**

### Cities Normalization ✓

The BE may return `cities` as either a flat `row[]` or a nested `{ cities: row[] }` object depending on query path. `_computeCitiesCache()` handles both:

```typescript
if (Array.isArray(raw)) {
  this.cachedCities = raw;                          // flat: ✓
} else if (raw && Array.isArray(raw.cities)) {
  this.cachedCities = raw.cities;                   // nested: ✓
} else {
  this.cachedCities = [];                           // unknown: safe fallback ✓
}
```

**Verdict: PASS**

### jobViews Month Filter ✓

`_computeJobViewsCache()` filters rows by matching `row.date` to current month + year:
```typescript
const d = new Date(row.date);
if (d.getFullYear() === cy && d.getMonth() === cm) { total += ...; }
```

Note from prior session audit: the BE SQL bug (video answers missing month filter) is in a **different** endpoint. The job views month filter in `_computeJobViewsCache()` is applied correctly on the FE side using the full `graph.jobViews` array returned by the BE.

**Verdict: PASS** (FE side; BE SQL bug for video answers month filter is tracked separately)

### statistic vs stat — naming clarification ✓

The BE key is `statistic` (top-level). The FE `dashboard$` map wraps it as `{ graph: { ..., statistic: dash.statistic } }`. The template accesses `dashboard.stat?.totalContacts` (from a separate `stat` wrapper: `{ totalContacts: dash.totalContacts, cities: dash.cities }`). This is not a mismatch — `statistic` and `stat` serve different purposes:
- `dashboard.graph.statistic` → pie chart percentages (contacts/applicants split)
- `dashboard.stat` → sidebar totals (totalContacts, cities)

**Verdict: PASS** — intentional separation, not a bug.

---

## Summary

| Contract | Verified | Notes |
|----------|----------|-------|
| Chart data shape | ✓ | graph/statistic/jobViews all correctly wired |
| Pipeline overview response | ✓ | byStage + needsReview both defensive |
| Subscription data | ✓ | All fields accessed with fallbacks |
| Cities normalization | ✓ | Handles flat + nested shapes |
| jobViews month filter | ✓ | FE-side filter is correct |
| statistic vs stat naming | ✓ | Intentional, not a mismatch |
