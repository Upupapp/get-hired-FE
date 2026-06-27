# GETHIRED SEO Frontend Haptics / Effects Log V3

Generated: 2026-06-25

## Phase 21 — Skeleton Loading + Job Card Effects

### Global CSS Added (src/styles.scss)

#### Skeleton Animation
```scss
@keyframes gh-skeleton-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.gh-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 800px 100%;
  animation: gh-skeleton-shimmer 1.4s infinite linear;
  border-radius: 4px;
  display: block;

  @media (prefers-reduced-motion: reduce) {
    animation: none;        // ← removed entirely, not slowed
    background: #ececec;    // static fallback colour
  }
}
```

#### Skeleton Card Composite
`.gh-skeleton-card` with child elements:
- `.gh-skeleton-title` — 20px height, 60% width
- `.gh-skeleton-subtitle` — 14px height, 40% width
- `.gh-skeleton-line` — 14px height, 90% width
- `.gh-skeleton-tag` — 24px height, 80px width, pill-shaped

#### Job Card Hover Lift
```scss
.gh-job-card-hover {
  transition: transform 160ms cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 160ms cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: background-color 120ms;
    &:hover { transform: none; }
  }
}
```

### prefers-reduced-motion Compliance
All new animations:
- Shimmer: removed entirely (not slowed) under reduced-motion.
- Hover lift: transform removed; only background-color transition remains (non-motion visual feedback).
- This aligns with `_motion.scss`'s `@mixin motion-safe` policy.

### How to Apply Skeleton Loading

In a job list template, while loading:
```html
<div *ngIf="loading">
  <div class="gh-skeleton-card" *ngFor="let i of [1,2,3,4,5]">
    <div class="gh-skeleton-title"></div>
    <div class="gh-skeleton-subtitle"></div>
    <div class="gh-skeleton-line"></div>
    <div class="d-flex mt-2">
      <div class="gh-skeleton-tag"></div>
      <div class="gh-skeleton-tag"></div>
    </div>
  </div>
</div>
```

How to apply hover lift on job cards:
```html
<div class="gh-job-card-hover">
  <!-- job card content -->
</div>
```

### Components That Should Apply Skeleton (backlog)
The `app-job-posts-list` component renders job cards. It should use `gh-skeleton-card` while the jobs API call is in flight. This requires reading that component's template/loading state — deferred to avoid scope creep. The CSS classes are now globally available.

## Existing Motion System (unchanged)
`src/assets/styles/_motion.scss` — all existing tokens and mixins preserved:
- `$motion-duration-micro`, `$motion-duration-card`, etc.
- `.gh-pressable` — already used across portal CTAs.
- `.gh-success-pulse` — used for success states.
The new Phase 21 skeleton classes complement the existing system without duplication.
