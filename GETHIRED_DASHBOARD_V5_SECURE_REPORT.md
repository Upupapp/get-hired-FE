# GetHired Dashboard V5 — Security Report
**Date:** 2026-06-27 | **Component:** `company-dashboard`

---

## Authentication Scope

### Route Guard ✓
The dashboard route is protected by the inherited auth guard (`company/` route group). No direct auth check inside the component is needed — this is correct for Angular guard-based auth.

### CompanyId Scope ✓
`ngOnInit` retrieves `companyId` from `localStorage.getItem('user')` and passes it only to `getCompanySubscription(companyId)`. The dashboard and pipeline endpoints are called without a companyId parameter — they derive the company from the authenticated session server-side. This is the correct pattern.

### Token / Session ✓
No JWT or session token is read or logged by this component. The facade/service layer handles token attachment in HTTP interceptors (verified in prior session; not changed here).

---

## Navigation Security

### `navigateTo(route: string)` ✓
```typescript
navigateTo(route: string): void {
  this.router.navigateByUrl(route);
}
```

This uses Angular's `Router.navigateByUrl()`. Angular's router does not navigate to external URLs (it ignores the domain part and only routes within the app). Even if a malicious `route` value were injected via `cachedSupportingActions` or `cachedRecommendedStep`, the router would either navigate to an internal route or do nothing — it cannot cause a JS URL redirect or open `javascript:` URIs.

All route strings are built statically in `_buildRecommendedStep()` and `_buildSupportingActions()` — they are compile-time constants like `'/recruiter/jobs/create'`. No user-controlled input flows into any route string. **No JS URL injection vector exists.**

### `router.navigate([...])` ✓
All other navigation methods use `router.navigate(['/path'])` with string array literals. No dynamic user input enters navigation paths.

---

## No PII Logged ✓

Checked `ngOnInit`, `loadPipelineOverview`, `dashboard$` tap, `_refreshV5Cache`, `_buildRecommendedStep`, `_buildSupportingActions`:
- No `console.log` calls found in any path
- No `localStorage.setItem` with user data
- `asyncLocalStorage.getItem('user')` reads and parses the stored user object but does not log it

---

## Template Output Escaping ✓

All dynamic values are rendered via Angular interpolation (`{{ }}`) or property bindings (`[attr.*]`). Angular escapes HTML by default. No `[innerHTML]` bindings found in this component.

Checked: company name, job titles, city names, candidate names (in `needsReview` items), stage labels — all via `{{ }}` interpolation. **No XSS vectors.**

---

## localStorage Access ✓

`asyncLocalStorage.getItem('user')` uses `localStorage.getItem` (read-only) and wraps it in a Promise. Only `companyId` is extracted and used. The full parsed user object is not forwarded to any API or stored in component state.

---

## Subscription Data ✓

Subscription limit values (`subs.jobPost`, `subs.admin`, `subs.videoResponse`) are used for arithmetic in `subscriptionUsagePct()` — a purely presentational calculation. If the server sends inflated numbers, the worst case is the meter shows 100% (capped). No access-granting logic runs in this component.

---

## Findings Summary

| Check | Result |
|-------|--------|
| Route guard / auth scope | ✓ Pass |
| companyId scoping | ✓ Pass |
| navigateTo() JS URL injection | ✓ Not possible (Angular router) |
| PII in console/localStorage | ✓ None found |
| Template XSS via innerHTML | ✓ No innerHTML bindings |
| User-controlled data in route strings | ✓ None — all static |
| Subscription arithmetic abuse | ✓ Presentation-only, capped at 100% |

**No security issues found in the V5 dashboard component.**
