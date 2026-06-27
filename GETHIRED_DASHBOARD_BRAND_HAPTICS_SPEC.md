# GETHIRED DASHBOARD BRAND — Haptics Specification

**Scope:** Dashboard-specific haptic feedback patterns  
**Status:** SPECIFICATION ONLY — HapticFeedbackService implementation is pending (not safe to implement in this pass without confirming the service structure)

---

## Haptic Philosophy

Haptic feedback on the employer dashboard is **progressive enhancement** — it adds tactile confirmation to navigation actions without ever being the sole indicator of an action succeeding. All actions have full visual feedback. Haptics are silent-fail: if the device does not support vibration or the API call throws, the user experience is identical.

---

## Pattern 1 — Inbox Card Navigation

**Element:** `button.gh-inbox-card` (supporting action cards in the Action Inbox)

**Trigger:** Click / tap

**Intent:** User is navigating to a detail view (applicants, messages, profile)

**Haptic type:** `selection` (lightest weight — navigation, not commit)

**Platform mapping:**
- iOS: `UISelectionFeedbackGenerator.selectionChanged()`
- Android: `HapticFeedbackConstants.KEYBOARD_TAP` or equivalent 10ms pulse
- Web (Vibration API): `navigator.vibrate(10)` — single 10ms pulse

**Implementation call (future):**
```typescript
// In navigateTo() or on (click) handler:
this.hapticService.dashboardAction();
```

---

## Pattern 2 — Recommended Step CTA

**Element:** `button.gh-btn-coral` in `.gh-inbox-main` calling `onRecommendedStepCta()`

**Trigger:** Click / tap on primary CTA (e.g., "Post a job", "Review applicants")

**Intent:** User is initiating a significant hiring workflow action

**Haptic type:** `impactLight` (slightly heavier than selection — action initiation)

**Platform mapping:**
- iOS: `UIImpactFeedbackGenerator(style: .light).impactOccurred()`
- Android: `HapticFeedbackConstants.VIRTUAL_KEY`
- Web: `navigator.vibrate(15)` — 15ms pulse

**Implementation call (future):**
```typescript
// In onRecommendedStepCta():
this.hapticService.planAction();
this.navigateTo(this.cachedRecommendedStep.route);
```

---

## Pattern 3 — Error Panel Retry

**Element:** `button.gh-btn-coral` in `.gh-dash-error-panel` calling `retryDashboard()`

**Trigger:** User taps Retry after dashboard load failure

**Intent:** Acknowledging the error and re-triggering load

**Haptic type:** `impactLight` — same as action initiation (user is taking a deliberate step)

**Implementation call (future):**
```typescript
// In retryDashboard():
this.hapticService.planAction();
this.companyFacade.getCompanyDashboard();
```

---

## Patterns Explicitly NOT Added

| Element | Reason |
|---------|--------|
| KPI card navigation (buttons) | These are low-intent navigation taps — haptic would feel noisy |
| Trend tab clicks | UI-only state change, no navigation, no haptic warranted |
| Subscription "Manage plan →" | Low-intent link, haptic unnecessary |
| Error recovery (pipeline retry) | Inline retry, already has visual feedback |

---

## HapticFeedbackService Interface (expected)

```typescript
// Expected service signature (not yet verified safe to implement):
interface HapticFeedbackService {
  dashboardAction(): void;   // ~10ms light pulse — navigation
  planAction(): void;         // ~15ms light impact — action initiation
  successPulse(): void;       // ~[10,50,10]ms — success pattern (not used on dashboard)
}
```

---

## Implementation Gate

Before implementing `HapticFeedbackService`:
1. Confirm whether any haptic service already exists in the GetHired codebase (search for `vibrate`, `HapticFeedback`, `haptic`)
2. Confirm Angular module injection setup
3. Confirm Capacitor/Cordova plugin availability if targeting native wrappers
4. Add silent `try/catch` around all `navigator.vibrate()` calls

This spec is documented here for the next engineering pass. Do not implement in this BRAND pass.
