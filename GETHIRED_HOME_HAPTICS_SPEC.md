# GETHIRED_HOME_HAPTICS_SPEC
> Haptic feedback specification for GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## Existing haptic usage (unchanged)

`goToJobSeekerPortal()` and `goToEmployerPortal()` call `this.haptics.selection()` before navigating. This was already wired in the component before V2.

## New haptic coverage (V2 additions)

### Product Preview tabs
`setPreviewTab()` does NOT add haptic feedback. Rationale: tab switches are micro-interactions with potentially rapid repeated clicks. Adding haptic feedback to every tab switch would create a noisy, spammy vibration pattern on mobile. The `.gh-pressable` class on product preview CTA buttons provides subtle press feedback via CSS `transform: scale(0.97)`.

### Product preview CTAs
All `<button class="btn-cta-primary gh-pressable">` elements inside preview panels link to `goToJobSeekerPortal()` or `goToEmployerPortal()` — both of which already fire `this.haptics.selection()`.

### Employer conversion band CTA
`(click)="goToEmployerPortal()"` → fires `this.haptics.selection()`.

## HapticFeedbackService
- `HapticFeedbackService.selection()` — light selection haptic (iOS Taptic Engine + Android vibration API)
- No-op on desktop; SSR-safe (checks `isPlatformBrowser` internally)

## Decision: no haptic on scroll-reveal
Scroll-reveal events (`(revealed)` output) are not user-initiated. No haptic is appropriate for passive scroll events.
