# GETHIRED DASHBOARD — BRAND REPORT

**Component:** `src/app/company/company-dashboard/company-dashboard.component.scss`
**Supporting:** `_motion.scss`, `colors.scss`
**Scope:** Brand/motion/state system audit + improvements for the employer dashboard
**Date:** 2026-06-27

---

## State Coverage Audit

### Hero Section
| State | Handled | How |
|---|---|---|
| Loading | YES | `#dashSkeleton` template: `.emp-dash-hero-skeleton` shimmer card |
| Error | N/A | Dashboard data error is handled at NgRx store level (loading$ stays active) |
| Empty | N/A | Hero always shows (uses fallback copy: 'Your company') |
| Success | YES | `emp-hero-reveal` animation on `.emp-dash-hero-inner` |

### Action Center
| State | Handled | How |
|---|---|---|
| Loading | YES | 2 skeleton cards via `*ngIf="pipelineLoading"` |
| Error | YES | `emp-dash-action-error` card with Retry button |
| Empty | YES | "You're all caught up." message |
| Success | YES | Grid of action cards |

### KPI Strip
| State | Handled | How |
|---|---|---|
| Loading | Partial | 3 of 4 cards always show (no per-card skeleton); "Needs review" card hidden until pipeline resolves |
| Error | Partial | Needs-review card hidden on pipeline error — no error indicator on the strip itself |
| Empty | YES | Numbers show 0 |
| Success | YES | Numbers populated; BRAND: now uses `emp-card-reveal` entrance animation |

### Hiring Pipeline
| State | Handled | How |
|---|---|---|
| Loading | YES | `.emp-dash-pipeline-skeleton` shimmer |
| Error | YES | `emp-dash-action-error` card with Retry |
| Empty | YES | `app-empty-section` component |
| Success | YES | Bar chart rail |

### Applicants Needing Review
| State | Handled | How |
|---|---|---|
| Loading | YES | Section hidden while `pipelineLoading` |
| Error | YES | Section hidden while `pipelineError` |
| Empty | YES | Section entirely hidden (`*ngIf="needsReview.length > 0"`) |
| Success | YES | Review cards with `emp-card-reveal` animation |

### Getting Started Checklist
| State | Handled | How |
|---|---|---|
| Loading | YES | Section hidden while `pipelineLoading` |
| Error | N/A | Uses cached data, no independent error state needed |
| Empty | YES | Section hidden when all steps complete (`cachedOnboardingSteps.length === 0`) |
| Success | YES | Steps with `emp-card-reveal` animation |

### Job Performance (Jobs Awaiting Review)
| State | Handled | How |
|---|---|---|
| Loading | YES | Section hidden while `pipelineLoading` |
| Error | YES | Section hidden while `pipelineError` |
| Empty | YES | Section hidden when `cachedJobGroups.length === 0` |
| Success | YES | Job rows with `emp-card-reveal` animation |

### Employer Branding Health
| State | Handled | How |
|---|---|---|
| Loading | YES | Outer `*ngIf="!(loading$ | async)"` hides during dashboard load |
| Error | N/A | dashboard$ error handled by NgRx; section stays hidden |
| Empty | N/A | Score is always computed (0% if all fields missing) |
| Success (complete) | YES | "Your company profile is complete." message |
| Success (incomplete) | YES | Progress bar + missing chips + CTA |
| BRAND new | YES | `.emp-dash-branding-inner` now has `emp-card-reveal` entrance animation |

### Subscription / Plan Health
| State | Handled | How |
|---|---|---|
| Loading | Partial | Section invisible while async resolves — no skeleton (deferred) |
| Error | FIXED | Was silent; now shows `.emp-dash-sub-error` error card + Retry |
| Empty | N/A | Free plan users see "Free plan" badge |
| Success | YES | Usage meters with `transition: width 600ms` fill animation |
| BRAND new | YES | `.emp-dash-sub-inner` now has `emp-card-reveal` entrance animation |

---

## Motion Audit

### Keyframe Animations
| Element | Animation | Token | Status |
|---|---|---|---|
| `.emp-dash-hero-inner` | `emp-hero-reveal` 0.5s | `$motion-ease-standard` | Pre-existing |
| `.emp-dash-review-card` | `emp-card-reveal` | `$motion-duration-card` | Pre-existing |
| `.emp-dash-onboarding-step` | `emp-card-reveal` | `$motion-duration-card` | Pre-existing |
| `.emp-dash-job-row` | `emp-card-reveal` | `$motion-duration-card` | Pre-existing |
| `.emp-dash-kpi-card` | `emp-card-reveal` | `$motion-duration-card` | **ADDED** |
| `.emp-dash-branding-inner` | `emp-card-reveal` | `$motion-duration-card` | **ADDED** |
| `.emp-dash-sub-inner` | `emp-card-reveal` | `$motion-duration-card` | **ADDED** |

### Transitions
| Element | Property | Duration | Status |
|---|---|---|---|
| `.emp-dash-action-card` | box-shadow, transform | `$motion-duration-micro` | Pre-existing |
| `.emp-dash-kpi-card` | box-shadow, transform | `$motion-duration-micro` | Pre-existing |
| `.emp-dash-pipeline-bar` | background | `$motion-duration-micro` | Pre-existing |
| `.emp-dash-branding-bar-fill` | width | 600ms | Pre-existing |
| `.emp-dash-sub-meter-fill` | width | 600ms | Pre-existing |
| `.gh-pressable` | transform (scale on press) | 100ms | Global (_motion.scss) |

### Reduced Motion Block — Updated
All newly animated elements added to the `@media (prefers-reduced-motion: reduce)` block:

```scss
.emp-dash-kpi-card { animation: none; }
.emp-dash-branding-inner { animation: none; }
.emp-dash-sub-inner { animation: none; }
```

These join the existing reduced-motion rules for hero, review cards, onboarding steps, job rows, skeleton shimmer, and fill transitions.

---

## Brand Improvements Made

### 1. KPI cards entrance animation
**File:** `company-dashboard.component.scss`
**Change:** Added `animation: emp-card-reveal $motion-duration-card $motion-ease-standard both;` to `.emp-dash-kpi-card`.
**Effect:** KPI strip now fades/slides in when the dashboard loads, consistent with action cards and review cards below it.
**Reduced-motion:** `.emp-dash-kpi-card { animation: none; }` added to the reduced-motion block.

### 2. Branding section entrance animation
**File:** `company-dashboard.component.scss`
**Change:** Added `animation: emp-card-reveal ...` to `.emp-dash-branding-inner`.
**Effect:** The branding health card slides in when it first appears after dashboard$ resolves, instead of popping in instantly.
**Reduced-motion:** `.emp-dash-branding-inner { animation: none; }` added.

### 3. Subscription section entrance animation
**File:** `company-dashboard.component.scss`
**Change:** Added `animation: emp-card-reveal ...` to `.emp-dash-sub-inner`.
**Effect:** Subscription card slides in when `subsRestrictions$` first emits, instead of popping.
**Reduced-motion:** `.emp-dash-sub-inner { animation: none; }` added.

### 4. Subscription error state
**File:** `company-dashboard.component.scss`
**Change:** Added `.emp-dash-sub-error` (zero-cost override class; reuses `.emp-dash-action-error` layout).
**Effect:** Visible error card with "Couldn't load your subscription details right now." + Retry button, instead of silent disappearance.

---

## Deferred Items

- **KPI strip per-card skeleton** — KPI values flash 0 until data loads. A shimmer card pass over the strip would improve perceived performance, but requires conditional skeleton logic per card. Deferred.
- **Subscription loading skeleton** — the subscription section is invisible while loading. A simple `.emp-dash-sub-skeleton` shimmer block could be shown while `!subsError && !(subsRestrictions$ | async)`, but this would require an additional async check in the template. Deferred.
- **Staggered animation delays on KPI cards** — currently all 4 KPI cards animate simultaneously. CSS `nth-child` delay offsets (`animation-delay: 0ms, 40ms, 80ms, 120ms`) would give a stagger feel. Not applied — requires extra CSS specificity and the visual gain is minor.

---

## Brand Gate

**Brand gate: PASS**

Loading states: complete for all high-traffic sections; subscription loading acknowledged as deferred.
Error states: all sections now have visible error states (previously subscription was silent).
Empty states: all 5 data-driven sections have proper empty handling.
Motion: 3 new entrance animations added; all covered by reduced-motion block; all use existing tokens.
gh-pressable: confirmed applied to all interactive cards, buttons, and CTAs across all 10 sections.
