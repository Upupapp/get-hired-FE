# GETHIRED MOBILEVIEW — Frontend Haptics & Effects Log V3
Generated: 2026-06-26

---

## Haptic Design Contract

GetHired uses CSS-only scale compression to simulate haptic tap feedback on touchscreen devices.
No heavy animation libraries. No JavaScript-driven haptic API (not widely supported).
All effects are:
- Limited to :active state (fires only on user interaction)
- Guarded by `@media (prefers-reduced-motion: reduce)` which sets transform:none
- Using compositable CSS properties only (transform, opacity) — no layout reflow

---

## Global Touch Compression

**styles.scss `@media (hover: none) and (pointer: coarse)` block:**
```scss
.mat-raised-button:active,
.mat-flat-button:active,
.btn:active,
.gh-card:active {
  transform: scale($gh-scale-press);  // 0.985
}
```
Targets touchscreen-only devices (hover:none = no mouse hover available).

**`.gh-pressable` class (`_motion.scss`):**
```scss
.gh-pressable {
  transition: transform 100ms $motion-ease-standard;
  &:active { transform: scale(0.985); }
}
```
Applied to: signin CTA button, job list cards.

---

## Per-Component Haptic Effects

| Component | Element | Effect | Token | Reduced-motion |
|-----------|---------|--------|-------|----------------|
| employer-panel | .gh-mobile-menu-btn | scale(0.93) | custom | transform:none |
| employer-panel | .gh-drawer-close-btn | scale(0.9) | custom | transform:none |
| employer-panel | .gh-drawer-nav-item | scale(0.97) | custom | transform:none |
| applicant-panel | .gh-ap-mobile-menu-btn | scale(0.93) | custom | transform:none |
| applicant-panel | .gh-ap-drawer-close-btn | scale(0.9) | custom | transform:none |
| applicant-panel | .gh-ap-drawer-nav-item | scale(0.97) | custom | transform:none |
| admin-panel | .gh-admin-mobile-menu-btn | scale(0.93) | custom | transform:none |
| admin-panel | .gh-admin-drawer-close-btn | scale(0.9) | custom | transform:none |
| admin-panel | .gh-admin-drawer-nav-item | scale(0.97) | custom | transform:none |
| reusable-table | .gh-mobile-card | scale($gh-scale-press) | 0.985 | transform:none |
| reusable-table | .gh-mobile-card__action-btn | scale(0.9) | custom | transform:none |
| recorder | .gh-recorder-btn-primary | scale(0.93) | custom | transform:none |
| job-create | .btn-add-service / .btn-draft-save | scale(0.97) | custom | transform:none |
| job-create | .btn-back-cancel | scale(0.96) | custom | transform:none |
| company-dashboard | .emp-dash-action-card | translateY(-2px) | $gh-lift | transition:none |
| company-dashboard | .emp-dash-kpi-card | translateY(-2px) | $gh-lift | transition:none |
| styles.scss | .gh-card, .job-card, .mat-card | scale($gh-scale-press) :active | 0.985 | transform:none |

---

## Entry Animations (non-haptic)

| Animation | Applied to | Duration | Reduced-motion |
|-----------|-----------|----------|----------------|
| gh-card-reveal | .gh-mobile-card | 220ms | animation:none |
| gh-sheet-reveal | .mat-dialog-container (mobile) | 220ms | animation:none |
| emp-hero-reveal | .emp-dash-hero-inner | 500ms | animation:none |
| emp-card-reveal | .emp-dash-review-card, .emp-dash-onboarding-step | 220ms | animation:none |
| portal-hero-reveal | .portal-hero-copy, .portal-hero-visual | 280ms | opacity:1, transform:none |
| gh-trust-reveal | .gh-signin-form-col .card | 300ms | animation:none (via @include motion-safe) |
| success-pulse | .save-success-pulse (job create) | 400ms | animation:none |
| error-reveal | .save-error-alert (job create) | 250ms | animation:none |

---

## Recording Pulse (Ambient)

`.gh-recorder-recording-pulse`: `animation: gh-rec-pulse 1.4s ease-in-out infinite`
- opacity 1 → 0.4 → 1 — communicates "recording in progress" state
- Removed entirely under prefers-reduced-motion (not just slowed — ambient animations are always fully removed)

---

## Skeleton Shimmer (Ambient)

`.gh-skeleton`: `animation: gh-skeleton-shimmer 1.4s infinite linear`
- background-position sweep (not compositable, but skeleton components are brief)
- Reduced-motion: animation:none, static bg #ececec — still communicates "loading"

---

## Notes

- No `navigator.vibrate()` API usage (limited support, requires user gesture, not appropriate for navigation)
- No external animation libraries (no GSAP, no Framer Motion, no Lottie) — constraint respected
- All haptic effects are pure CSS — zero JS overhead
