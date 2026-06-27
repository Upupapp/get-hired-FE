# GETHIRED CREATE JOB — BRAND REPORT
**Scope:** `/recruiter/jobs/create` — motion, states, microinteractions
**Date:** 2026-06-26

---

## Motion Inventory

| Element | Animation | Notes |
|---|---|---|
| Controls bar (`.bg-upper-gray`) | CSS `top 0.3s ease, opacity 0.3s ease` | Guards `prefers-reduced-motion` ✅ |
| Step panels | `[@animate]` entry (y, delay) per `mainAnimations` | All 4 steps use this ✅ |
| Form field sections | `[@animate]` staggered entrance | Professional feel ✅ |
| Publish button press | `transform: scale(0.97)` on `:active` | Guards `prefers-reduced-motion` ✅ |
| Draft button press | `transform: scale(0.97)` on `:active` | Guards `prefers-reduced-motion` ✅ |
| Cancel button press | `transform: scale(0.96)` on `:active` | Guards `prefers-reduced-motion` ✅ |
| Publish spinner | CSS `border-top-color` rotation 0.7s | Guards `prefers-reduced-motion` ✅ |
| Draft spinner | CSS `border-top-color` rotation 0.7s | Guards `prefers-reduced-motion` ✅ |
| Save success pulse | `success-pulse` keyframe (scale + opacity) | Guards `prefers-reduced-motion` ✅ |
| Error alert reveal | `error-reveal` keyframe (translateY + opacity) | Guards `prefers-reduced-motion` ✅ |
| Work setup button select | Conditional class swap (`active`) | No transition — could add `0.15s ease` |

---

## Applied Brand Fixes (this session)

### BRD-01 — SubscriptionAlert Dialog Mobile Width
Subscription limit alert was `34vw` — invisible on mobile. Changed to `min(560px, 95vw)`. Consistent with pattern across other dialogs.

---

## Brand Gaps (open)

| ID | Gap | Severity | Recommendation |
|---|---|---|---|
| B-01 | Work setup button has no transition on active state | Low | Add `transition: background 0.15s ease, border-color 0.15s ease` to `.btn-work-setup` |
| B-02 | Badge `<select>` + badge cards are mismatched in visual weight — select looks like plain HTML, cards look polished | Medium | Style the select with same border/radius as form-select components |
| B-03 | Requirements/goodToHave/educationalBackground chips (`requirement-badge`) have no enter/exit animation | Low | `[@fadeInOut]` or just `opacity 0.15s ease` on `*ngIf` removal |
| B-04 | Step 4 Preview panel has no loading state for when store data is being hydrated | Medium | Add skeleton loader for preview card |
| B-05 | Job Readiness Bar uses generic clipboard icon — no brand color variation | Low | Use GetHired red for the readiness bar fill |
| B-06 | "Next: Job Requirements" button copy is verbose at narrow widths — truncates awkwardly at 1281px breakpoint | Low | Use `Next →` with a short label below 900px |

---

## Haptics Integration

| Action | Current Haptic | Correct? |
|---|---|---|
| Publish success | `this.haptics.jobPublished()` | ✅ |
| Missing field warning | `this.haptics.warning()` | ✅ |
| Draft save | None | ⚠️ Could add `this.haptics.success()` on draft modal open |
| Banner upload | None | Low — file operation, haptic optional |

---

## Token Audit

| Token | Value | Consistency |
|---|---|---|
| `$color-global-red-buttons` | Used on `.btn-add-service` (Next/Publish) | ✅ |
| `$color-global-gray-cancel` | Used on `.btn-save-draft` (Prev/Draft) | ✅ |
| Stepper indicator color | `$color-global-red` (from main-stepper) | ✅ |
| Job Readiness bar fill | Component-specific (JobReadinessService) | ✅ |
