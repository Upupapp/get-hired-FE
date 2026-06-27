# GETHIRED DASHBOARD BRAND — QA Checklist

**Scope:** Manual QA items for `/recruiter/dashboard` after BRAND v5 pass

---

## Build & Smoke

- [x] `npm run build-dev` completes with 0 errors
- [ ] `npm run build -- --configuration=production` (or equivalent) completes with 0 errors
- [ ] No console errors on page load in Chrome DevTools
- [ ] No console errors related to Angular binding or template expressions

---

## Loading States

- [ ] Navigate to `/recruiter/dashboard` — skeleton renders immediately before data arrives
- [ ] Hero skeleton (220px shimmer) visible during load
- [ ] KPI strip skeleton (8 shimmer cards) visible during load
- [ ] Inbox skeleton (main card + 3 cards) visible during load
- [ ] Pipeline card shows inline skeleton independently of main dashboard load
- [ ] Subscription card shows inline skeleton until subscription data arrives
- [ ] Skeleton shimmer animation plays (moving left-to-right wave)
- [ ] After data loads: skeleton disappears and content renders smoothly

---

## Error State (P1 — Critical)

- [ ] Simulate `dashboard$` emitting null (can mock in CompanyFacade or block the network request via DevTools)
- [ ] Error panel appears: centered card with warning icon
- [ ] Title: "We couldn't load your dashboard"
- [ ] Body: "There was a problem loading your hiring data. This is usually temporary — please try again."
- [ ] "Retry" button visible and clickable
- [ ] Clicking Retry re-triggers `getCompanyDashboard()` (loading skeleton shows again)
- [ ] After retry succeeds: full dashboard renders
- [ ] `role="alert"` present on error panel element (inspect DOM)
- [ ] Pipeline error banner shows independently when pipeline API fails (does not trigger main error panel)

---

## Ring Fill Animation (GAP 2)

- [ ] On page load: hero profile ring animates from empty (0%) to current percentage value
- [ ] Profile completeness ring (health grid) animates from empty to current percentage
- [ ] Animation duration feels smooth (~900ms), decelerates at the end (spring feel)
- [ ] With `prefers-reduced-motion: reduce` active: rings appear instantly at final value (no animation)

---

## Bar Grow Animation (GAP 4)

- [ ] Hiring pipeline bar fills grow from left edge to computed width on first render
- [ ] Branding health bar grows from left edge to score % on first render
- [ ] Subscription meter fills grow from left edge on first render
- [ ] Insight bars (top cities) grow from left edge on first render
- [ ] With `prefers-reduced-motion: reduce` active: all bars appear at final width instantly

---

## KPI Card Stagger (GAP 5)

- [ ] On page load: KPI cards appear sequentially (1st card → 2nd card → ... → 8th card) with visible delay between each
- [ ] Total stagger visible: first card appears before last card by ~210ms
- [ ] With `prefers-reduced-motion: reduce` active: all KPI cards appear simultaneously (no stagger)

---

## Inbox Card Stagger (GAP 5)

- [ ] Inbox supporting action cards appear in sequence (not simultaneously)
- [ ] Stagger visible: 50ms steps between cards
- [ ] With `prefers-reduced-motion: reduce` active: all inbox cards appear simultaneously

---

## Subscription Usage Cache (GAP 3)

- [ ] Subscription meters display correct values (test with known data)
- [ ] When usage < 80%: purple fill, no warn/danger class
- [ ] When usage >= 80%: amber fill (`--warn` class)
- [ ] When usage >= 100%: red fill (`--danger` class) — for job slots only
- [ ] Verify (in Angular DevTools or by adding console.log): `subscriptionUsagePct()` is NOT called during change detection cycles — only called once when subscription data emits
- [ ] `cachedJobPostPct`, `cachedAdminPct`, `cachedVideoPct` hold correct values after subscription loads

---

## Reduced Motion (WCAG 2.3.3)

- [ ] In Chrome DevTools: Rendering → Emulate CSS media feature: `prefers-reduced-motion: reduce`
- [ ] Skeleton shimmer: no animation (solid #f0edf8 background)
- [ ] Ring animations: none (rings appear at final value instantly)
- [ ] Bar grow animations: none (bars appear at final width instantly)
- [ ] Card reveals (`gh-reveal`): effectively instant (0.001ms duration)
- [ ] KPI stagger: no delay (all appear simultaneously)
- [ ] Inbox card stagger: no delay
- [ ] Error panel: appears instantly

---

## Keyboard & Accessibility

- [ ] Tab through hero: "Post a job" → "Review applicants" → "Complete profile" (if visible) — all keyboard accessible
- [ ] Tab to KPI card buttons: focus ring visible (purple outline)
- [ ] Tab to inbox action cards: focus ring visible (coral outline)
- [ ] Tab to trend tabs: Enter selects active tab
- [ ] Error panel Retry button: keyboard accessible, activates on Enter
- [ ] Screen reader test: navigate to error panel — `role="alert"` announces error immediately
- [ ] Screen reader test: pipeline screen-reader summary announced when pipeline loads

---

## Interactive Elements

- [ ] "Post a job" coral button navigates to `/recruiter/jobs/create`
- [ ] "Review applicants" outline button navigates to `/recruiter/jobs/list`
- [ ] KPI card "Active jobs" click navigates to `/recruiter/jobs/list`
- [ ] KPI card "Video answers" click navigates to `/recruiter/jobs/list`
- [ ] KPI card "Messages" click navigates to `/recruiter/messages`
- [ ] Inbox card click navigates to respective route
- [ ] Recommended step CTA navigates to `cachedRecommendedStep.route`
- [ ] "Retry" (pipeline) re-calls `loadPipelineOverview()`
- [ ] "Retry" (subscription) re-calls `retrySubscription()`

---

## Mobile (Responsive)

- [ ] At 375px: hero stacks vertically (ring card below identity)
- [ ] At 375px: KPI cards wrap to 2-column grid
- [ ] At 375px: error panel margin reduces to 40px 16px
- [ ] At 767px: insight grid, health grid go to 1-column
- [ ] At 900px: hero layout switches from row to column

---

## Haptics

- [ ] Haptic calls are NOT present in the current code (HapticFeedbackService not implemented this pass — spec only)
- [ ] No `navigator.vibrate` calls in the dashboard component
- [ ] Confirm no haptic errors in console
