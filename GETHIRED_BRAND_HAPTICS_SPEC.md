# GETHIRED BRAND — Haptics Specification (Phase 10)
**BRAND v6 · 2026-06-27**

---

## Haptic Service: Current Implementation

**File:** `src/app/shared/services/haptic-feedback/haptic-feedback.service.ts`
**Status:** Implemented and available (see IMPLEMENTATION_LOG).

The service:
- Checks `navigator.vibrate` before calling — fails silently if unsupported
- Has `enabled` flag (default: `true`) — respects user preference
- Never throws; all vibration calls wrapped in try/catch

---

## V6 Additions Required

The existing service is missing `dashboardAction()`, `planAction()`, and `respectReducedMotion()`. These must be added.

### New Methods to Add

```typescript
dashboardAction(): void {
  this.vibrate([8]);
}

planAction(): void {
  this.vibrate([8]);
}

respectReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

And the `vibrate` method should check `respectReducedMotion()`:
```typescript
private vibrate(pattern: number[]): void {
  if (!this.enabled || !this.canVibrate()) { return; }
  if (this.respectReducedMotion()) { return; }
  try { navigator.vibrate(pattern); } catch { /* silent */ }
}
```

---

## Complete Method Reference

| Method | Pattern (ms) | Use When |
|---|---|---|
| `selection()` | [8] | Filter chip selected, tab switched, checkbox toggled |
| `press()` | [6] | Button pressed (touch device) |
| `success()` | [12] | Small action confirmed (field saved, toggle) |
| `warning()` | [20] | Warning banner surfaces (user-triggered reveal) |
| `error()` | [30] | Reserved (see forbidden list) |
| `uploadComplete()` | [10, 20, 10] | File upload accepted and stored |
| `scanComplete()` | [8, 20, 8] | CV Health analysis complete |
| `actionComplete()` | [8, 30, 8] | Profile step done, interview scheduled, message sent |
| `applicationSubmitted()` | [12, 30, 12] | Application confirmed submitted |
| `jobPublished()` | [12, 30, 12] | Job post goes live |
| `dashboardAction()` | [8] | Employer dashboard action card clicked |
| `planAction()` | [8] | Plan health CTA clicked |

---

## Allowed Haptic Triggers

| Trigger | Method | Notes |
|---|---|---|
| File accepted on upload | `uploadComplete()` | After server confirms receipt |
| CV Health scan complete | `scanComplete()` | After real analysis returns |
| Profile action item completed | `actionComplete()` | User-initiated step completion |
| Profile saved | `actionComplete()` | After API success |
| Filter chip selected (touch) | `selection()` | Touch devices only |
| Application submitted | `applicationSubmitted()` | After API confirms submission |
| Job published | `jobPublished()` | After API confirms publish |
| Employer dashboard action card clicked | `dashboardAction()` | User tap on action card |
| Plan health CTA clicked | `planAction()` | User tap on upgrade/billing button |
| Message opened after user click | `selection()` | First open of a thread |
| Interview scheduled | `actionComplete()` | After API confirms schedule |

---

## Forbidden Haptic Triggers (Never Implement)

| Trigger | Reason |
|---|---|
| Page load / route change | Intrusive; user didn't trigger anything |
| Scrolling | Extremely annoying |
| Hover states | Non-touch pattern; no hover on mobile |
| Low CV Health score reveal | Feels like punishment |
| Rejection-like states | Harmful, anxiety-inducing |
| Validation error per keystroke | Intrusive, prevents typing comfortably |
| Payment pressure / billing nag | Manipulative |
| Repeated notification loops | Background notifications forbidden |
| Background updates (real-time counts) | User didn't trigger |
| Privacy-sensitive decisions | Never associate haptics with sensitive data |
| Failed CV Doctor analysis | Error-adjacent — avoid haptic shame |
| Low match score | Implies judgement |
| Any state where user didn't initiate | Core rule: user-initiated only |

---

## Device & Browser Support

| Platform | `navigator.vibrate` support |
|---|---|
| Android Chrome | Supported |
| iOS Safari | Not supported (WebKit blocks) |
| Desktop Chrome/Firefox | Supported in some versions |
| Desktop Safari | Not supported |

Since iOS is a significant mobile platform and it doesn't support haptics via web, ALL haptic feedback must be paired with visual + text feedback. Haptics are enhancement-only — never the primary signal.

---

## `prefers-reduced-motion` Handling

The `respectReducedMotion()` method gates all vibration when the user has set `prefers-reduced-motion: reduce`. Rationale: reduced motion preference indicates sensory sensitivity; haptic vibration patterns share this concern for some users.

---

## Integration Notes

- Service is `providedIn: 'root'` — inject anywhere: `constructor(private haptic: HapticFeedbackService) {}`
- Call from template event handlers: `(click)="onActionCard(); haptic.dashboardAction()"`
- Or from component method: `this.haptic.uploadComplete()`
- Never call in `ngOnInit`, route guards, HTTP interceptors, or background tasks
