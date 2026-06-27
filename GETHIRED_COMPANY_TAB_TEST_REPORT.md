# GETHIRED COMPANY TAB — TEST REPORT
**Scope:** Employer Portal › Company Tab
**Date:** 2026-06-26

---

## Current Test Coverage

| Component | Unit Tests | Notes |
|---|---|---|
| `EmployerCompanyComponent` | ❌ None | 3-subtab workspace, keyboard nav |
| `CompanyDetailsFormComponent` | ❌ None | Core save flow, validation |
| `ImportAddUserComponent` | ✅ Partial spec exists (`import-add-user.component.spec.ts`) | Content unknown |
| `CompanyFacade` | ❌ None | NgRx facade |
| `companiesController.js` | ❌ None | Critical — contains the crash bug fixed today |

---

## Required Test Cases

### T-01 — `getSpecificCompany` Unauthenticated Path (BE, HIGH)
```javascript
// Without ?id and without auth token → must return 401, not crash
GET /company/details
Expected: 401 { error: "Authentication required." }
```

### T-02 — `getSpecificCompany` With ?id (BE, LOW)
```javascript
// Public lookup by company ID
GET /company/details?id=COM123456
Expected: 200 { success: true, data: { companyId, companyName, ... } }
```

### T-03 — `updateCompany` BOLA Guard (BE, HIGH)
```javascript
// Authenticated as company A, trying to update company B
PUT /company/update { companyId: 'COM_OTHER' }
Expected: 403 { message: "You don't have permission to do that." }
```

### T-04 — `EmployerCompanyComponent` Tab Switching (FE unit)
```typescript
// Default tab is 1 (Company Profile)
expect(component.activeTab).toBe(1);
// Click tab 2
component.selectTab(2);
expect(component.activeTab).toBe(2);
// Click same tab → no change
component.selectTab(2);
expect(component.activeTab).toBe(2); // no re-assignment
```

### T-05 — Keyboard Navigation (FE unit)
```typescript
// ArrowRight from tab 1 → goes to tab 2
const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
component.onTabKeydown(event);
expect(component.activeTab).toBe(2);
// ArrowLeft from tab 1 → wraps to tab 3
component.activeTab = 1;
const eventL = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
component.onTabKeydown(eventL);
expect(component.activeTab).toBe(3); // wraps
```

### T-06 — Character Counter Reactive (FE unit)
```typescript
const ctrl = component.companyDetailsForm.get('companyDetails');
ctrl.setValue('a'.repeat(950));
// Counter should show 950/1000 and be yellow
ctrl.setValue('a'.repeat(1000));
// Should be blocked by maxlength — value capped at 1000
expect(ctrl.value.length).toBeLessThanOrEqual(1000);
```

### T-07 — `saveCompanyUser` Without CompanyId (FE unit)
```typescript
// If localStorage has no companyId, payload should not send undefined
component.localData = null;
component.saveCompanyUser([{ email: 'test@test.com' }]);
// Check dispatched action payload
expect(dispatchedPayload.companyId).toBeUndefined(); // not a random value
```

---

## Test Pyramid Recommendation

```
E2E Smoke (1):     Company profile update → save → refresh → fields persist
Integration (2):   BE: getSpecificCompany with/without auth | updateCompany BOLA
Component (3):     Tab switching, keyboard nav, char counter, empty states
Unit (4):          companiesController functions in isolation
```

---

## Priority

| Priority | Test | Risk if Missing |
|---|---|---|
| P0 | T-01 — auth crash regression | Future removal of guard undetected |
| P0 | T-03 — BOLA regression | Prior SECURE fix undetected |
| P1 | T-04 + T-05 — tab navigation | Keyboard regression |
| P1 | T-06 — char counter cap | Description overflow |
| P2 | T-02 + T-07 — edge cases | Low |
