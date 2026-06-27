# GETHIRED BRAND — Offline & Degraded System (Phase 8)
**BRAND v6 · 2026-06-27**

---

## Pattern Overview

Offline and degraded states share a core principle: **preserve what the user has, tell them what's missing, offer recovery.**

---

## 1. Offline — Full

**Trigger:** `navigator.onLine === false` OR network request fails with no response.

**Visual:** Persistent amber/grey top banner (not a full-page error unless the app is completely non-functional offline).
```
[⚠ icon] You're offline. Check your internet connection.
```
- Banner position: below topbar (never over content).
- `role="alert"` on initial appearance. `aria-live="assertive"` acceptable since it's a sudden connectivity loss.
- Non-dismissible while offline.
- On reconnect: banner changes to "Back online." (`role="status"`, polite) → auto-dismisses after 3s.

**Form data preservation:** Before showing offline state on a form page, attempt `sessionStorage` save of current form values. If saved, surface note: "Your progress has been saved locally."

**Retry:** If user presses Retry on a failed action while offline: show "You're still offline. Connect to the internet and try again."

---

## 2. API Timeout / Server Unreachable

**Trigger:** Request returns no response within 10–15s OR network layer timeout.

**Visual:** Inline section error (Level 2) — NOT a page-level error unless the entire page data failed.
```
Headline: "Taking longer than expected"
Body: "[Section] is taking longer than expected. Check your connection and try again."
Action: "Try again" button
```
- Retry up to 2× automatically (with 3s/6s backoff) before showing error.
- After 2 failed retries: show permanent error with manual retry.

---

## 3. Partial Data (Degraded)

**Trigger:** Some sections of a page load successfully; others fail.

**Visual:** Subtle amber banner at top of the degraded section(s):
```
[⚠ icon] Some information couldn't load right now.
```
- Not `role="alert"` (non-urgent); `role="status"` acceptable.
- Each failed section shows its own inline error card with retry.
- Successfully loaded sections remain interactive — never freeze the whole page for one section failure.

**Example:** Employer dashboard — pipeline section fails, but hero/KPI/branding sections load. Show pipeline error card; rest of dashboard is fully functional.

---

## 4. Maintenance

**Trigger:** API returns 503 with maintenance flag OR CDN returns maintenance page.

**Visual:** Full branded maintenance page.
```
Headline: "GetHired is undergoing maintenance."
Body: "We're making improvements. We'll be back shortly."
Optional: Estimated time only if confirmed server-side — never guess.
Action: "Check our status page" (link to status page if available).
```
- No countdown unless real ETA is available from API.
- Refresh button: "Refresh page" — checks if maintenance has ended.

---

## 5. Chunk Load Failure (Angular Lazy-Loading)

**Trigger:** Angular lazy-loaded route chunk 404s (CDN cache bust, deploy mid-session).

**Visual:** Intercept error page (not just a blank screen):
```
Headline: "A new version of GetHired is available."
Body: "Please refresh to get the latest version."
Action: "Refresh now" button (calls `window.location.reload()`).
```
- Never show raw Angular error to users.
- Implement via Angular ErrorHandler or global error boundary.

---

## 6. Version Mismatch

**Trigger:** API returns version header that doesn't match FE version expectation.

**Visual:** Subtle non-blocking banner:
```
"GetHired has been updated. Refresh for the best experience."
[Refresh button]
```
- `role="status"` (polite, non-urgent).
- Non-dismissible but non-blocking.

---

## 7. Payment / Billing Unavailable

**Trigger:** Billing API unavailable or times out.

**Visual:** Inline error in plan health section:
```
"Plan health couldn't load right now. Your access isn't affected."
[Try again] button
```
- Never display plan as expired/cancelled if billing API timed out — unknown ≠ expired.
- Never restrict functionality based on a billing timeout.

---

## 8. Upload / Storage Unavailable

**Trigger:** File upload endpoint returns 5xx or is unreachable.

**Visual:** Upload area error state:
```
"File uploads are temporarily unavailable. Try again in a moment."
[Try again] button
```
- Form data preserved.
- Never clear the selected file on upload failure.

---

## 9. CV Doctor Unavailable

**Trigger:** CV analysis service unavailable.

**Visual:** CV Doctor step error (inside the stepper flow):
```
Headline: "CV analysis is temporarily unavailable."
Body: "Your CV has been saved. Try again later."
Actions: "Try again" | "Skip for now"
```
- Never mark the CV as low-quality due to service unavailability.
- Never show a score of 0 or "N/A" score due to an outage.

---

## 10. Dashboard Partial Data Unavailable

**Trigger:** One or more dashboard API endpoints fail while others succeed.

**Visual:** Per-section approach (not page-level error):
- Hero: fallback to cached company name, no live counts.
- Action center: error card with retry.
- KPI: show 0 with note "Couldn't load latest counts. Retrying…"
- Pipeline: error card with retry.
- Employer health: cached previous score if available; else skeleton + "Couldn't load health data."

**A11y:** `aria-live="polite"` on KPI regions when they update from 0 to real values.

---

## 11. Subscription / Plan Health Unavailable

- **Never** restrict features based on a billing service timeout.
- Show degraded state in plan health section only.
- Headline: "Plan health is temporarily unavailable." — not "Your plan has expired."

---

## Summary Table

| Scenario | Pattern | Role | Dismissible |
|---|---|---|---|
| Full offline | Persistent top banner | `role="alert"` | No (until online) |
| Reconnected | Polite status banner | `role="status"` | Auto 3s |
| API timeout | Inline section error + retry | `role="status"` | Yes after retry |
| Partial data | Per-section error card | `role="status"` | Yes after retry |
| Maintenance | Full page | No ARIA override | No |
| Chunk failure | Intercept page | No ARIA override | No |
| Version mismatch | Non-blocking banner | `role="status"` | No (user must refresh) |
| Billing unavailable | Section error | `role="status"` | Yes after retry |
| Upload unavailable | Upload area error | `role="status"` | Yes after retry |
| CV Doctor unavailable | Stepper step error | `role="status"` | Yes / Skip |
