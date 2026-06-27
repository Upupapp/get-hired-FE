# GetHired Microinteractions Audit — SEO V3 Deployment
**Date:** 2026-06-25
**Scope:** Hover lift + skeleton shimmer added in SEO Phase 21

---

## Hover Lift Assessment

### The utility class `.gh-job-card-hover` (styles.scss)

| Property | Value | Assessment |
|---|---|---|
| translateY | -2px | Too subtle for a card. Acceptable for inline text/buttons, not cards. |
| box-shadow lift | `0 4px 16px rgba(0,0,0,0.1)` | Moderate. Feels mid-tier. |
| transition duration | 160ms | Correct — this is the micro token value. |
| easing | `cubic-bezier(0.4,0,0.2,1)` | Material standard ease. Appropriate. |
| reduced-motion | transform suppressed, bg transition kept | Correct pattern, but bg tint has no target colour |

**Rating: GOOD (class definition quality). NOT WIRED (not applied to any template).**

### The actual `.job-card` hover (job-card.component.scss)

| Property | Value | Assessment |
|---|---|---|
| translateY | -4px | Premium. Perceptible but not jumpy. |
| box-shadow lift | `0 12px 24px rgba(16,24,40,0.08)` | Deep, blue-tinted shadow. Feels premium. |
| transition duration | 220ms (`$motion-duration-card`) | Correct — card token, more relaxed than micro. |
| easing | `$motion-ease-standard` | Correct token usage. |
| focus-within | Yes — `&:hover, &:focus-within` | Excellent — keyboard accessible hover. |
| reduced-motion | `@include motion-safe` → `transition: none !important` | Correct — full suppression. |

**Rating: EXCELLENT. This is the live implementation. Premium feel, token-correct, accessible.**

### Conflict note
Both `.gh-job-card-hover` and `.job-card` could theoretically be applied to the same element. Since `.gh-job-card-hover` is a utility class and `.job-card` is a component selector, if both were applied, `.job-card`'s hover rules would win (more specific in some cases, or `!important` via `motion-safe` would dominate). Not a current issue since `.gh-job-card-hover` is unused.

---

## Skeleton Shimmer Assessment

### Animation technique quality

```css
@keyframes gh-skeleton-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.gh-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 800px 100%;
  animation: gh-skeleton-shimmer 1.4s infinite linear;
}
```

| Property | Value | Assessment |
|---|---|---|
| Technique | background-position shift on fixed background-size | Correct. Industry standard (used by Facebook, LinkedIn, YouTube). |
| Background-size | 800px | Should be at least 2x the travel range (−400 to +400 = 800px travel). Exactly matches. Correct. |
| Stop contrast | #f0f0f0 / #e0e0e0 / #f0f0f0 (~6% luminance diff) | Subtle but intentional. On white cards the shimmer is clearly visible. |
| Duration | 1.4s | Standard. 1.2–1.6s is the industry norm. Correct. |
| Timing | linear | Correct for shimmer — ease in/out creates a flash effect, linear is smoother. |
| Keyframe travel | -400px → +400px | The shimmer light appears to sweep left-to-right across any element up to 800px wide. Correct. |
| Reduced motion | `animation: none; background: #ececec` | Correct — full removal, static fallback. |

**Rating: EXCELLENT technique. Animation math is correct.**

### Skeleton element sizing

| Class | Height | Width | Assessment |
|---|---|---|---|
| `.gh-skeleton-title` | 20px | 60% | Good — typical title height |
| `.gh-skeleton-subtitle` | 14px | 40% | Good |
| `.gh-skeleton-line` | 14px | 90% | Good — body text representation |
| `.gh-skeleton-tag` | 24px | 80px | Good — pill tag shape with `border-radius: 12px` |
| Card container | 12px border-radius, 20px padding | — | Premium card feel |

**Rating: GOOD. Proportions match the actual job card layout.**

### Wiring gap
The skeleton system is defined but not applied to the public job list loading state. Users see a GIF camera animation instead. The skeleton should replace `<app-inline-loading>` in `job-posts-list.component.html` for the public-facing job board.

---

## Recommended Safe Changes (Applied)

See `GETHIRED_BRAND_IMPLEMENTATION_LOG_RECENT_V1.md` for what was actually changed.

1. **styles.scss**: Refactor `.gh-job-card-hover` to use `$motion-duration-micro` and `$motion-ease-standard` tokens (instead of hardcoded values), and use `@include motion-safe` mixin (instead of inline `@media`). Also fix the empty hover tint by adding a brand-tint background.

2. **styles.scss**: Use `@include ambient-motion-safe` in `.gh-skeleton`'s reduced-motion guard for consistency — the existing inline `@media` is functionally equivalent but inconsistent with the established mixin pattern.

Note: Skeleton wiring to the public job list template is a larger change (requires modifying `job-posts-list.component.html` and the component's loading logic) and is deferred — it is a P2 enhancement, not a brand bug.
