# GETHIRED_HOME_KNOWN_GAPS
> Open gaps and deferred items from GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## P2 — Accessibility: Tab keyboard navigation
**Gap:** Product Preview tabs do not support keyboard arrow navigation (ArrowLeft/ArrowRight/Home/End per ARIA Tabs pattern).
**Impact:** Keyboard users must Tab through each button; they can still access all tabs, just not with arrow keys.
**Fix:** Add `(keydown)` handler to each tab button that routes arrow key presses to adjacent tabs.
**Effort:** ~30 lines of TS, 20 lines of HTML event binding.

## P2 — Accessibility: Preview tab button touch target
**Gap:** Preview tab buttons have `min-height: 38px`, below the 44px iOS guideline.
**Impact:** Minor on mobile — tabs are still tappable; most fingertip precision is within 38px.
**Fix:** Increase to `min-height: 44px` in SCSS.
**Effort:** 1 line.

## P3 — Analytics: Hero and final CTA click events
**Gap:** `trackHeroCTAClicked` and `trackFinalCTAClicked` methods exist in the analytics service but are not called from the template. Hero and final CTA button clicks are not tracked.
**Impact:** Low — analytics SDK isn't wired anyway. When SDK is wired, these events would be missing.
**Fix:** Add `(click)` bindings on hero and final CTA buttons that call analytics before navigating.
**Effort:** 4 template lines, 0 new methods.

## P3 — Product preview: Empty/error state for assets
**Gap:** The signals tab loads `match-signal-rings.svg`. If this file is missing in production, the `<img>` fails silently.
**Impact:** Minor visual only; no functional regression.
**Fix:** Add `(error)="onSignalImageError($event)"` handler or an `onerror` attribute.
**Effort:** 5 lines.

## P3 — Tab panel: `ng-content` vs `*ngIf` performance
**Gap:** Each preview panel uses `*ngIf` which destroys and recreates the DOM on every tab switch. For mock-only panels this is fine. If panels ever have components with their own `ngOnInit` (e.g., live data), recreation cost would matter.
**Impact:** None currently.
**Fix when needed:** Switch to `[hidden]` binding or `*ngIf; else` pattern with `@ViewChild`.

## Deferred: Video preview section
The command listed a "Video answers section" with a richer visual (orb SVG, motion effects). The current implementation uses a simple dark-background mock player. A fuller video preview with the `video-answer-orb.svg` floating animation could be added in a follow-up.

## Out of scope (explicitly)
- Employer-facing homepage (`/employers`) redesign — untouched
- Job seeker portal homepage (`/job-seekers`) redesign — untouched
- New routes or API endpoints — none needed or created
