# GETHIRED BRAND — QA Checklist (Phase 20)
**BRAND v6 · 2026-06-27**

---

## Global

- [ ] All new CSS classes compile without SCSS errors (`ng build`)
- [ ] `_motion.scss` imports correctly in `styles.scss`
- [ ] `_tokens.scss` imports correctly (once added to `styles.scss`)
- [ ] No duplicate CSS variable declarations between `_tokens.scss` and existing files
- [ ] No existing classes broken by new additions
- [ ] `HapticFeedbackService` compiles without TypeScript errors
- [ ] New `dashboardAction()`, `planAction()`, `respectReducedMotion()` methods present in compiled service

---

## Loading States

- [ ] Employer dashboard: skeleton renders before data arrives (no blank dashboard)
- [ ] Employer dashboard skeleton: hero block + action cards + KPI strip + pipeline + health cards visible
- [ ] Plan health section: "Checking plan health…" SR text present while loading
- [ ] Public job list: skeleton or spinner present during load (currently GIF — acceptable P2 backlog)
- [ ] CV Doctor: step indicators show correct step during analysis
- [ ] Upload: progress bar (or at minimum spinner + file name) shown during upload
- [ ] Application submit: button disabled + "Submitting…" text during in-flight request
- [ ] All loading states have visible non-blank content within 100ms of trigger

---

## Success States

- [ ] Application submitted: success card visible (not just toast)
- [ ] Job published: "Your job is live!" panel or clear success message
- [ ] Profile saved: toast "Profile saved." appears; auto-dismisses after ≥5s
- [ ] CV uploaded: toast "CV uploaded successfully." appears
- [ ] Status updated: snackbar "Status updated to '[X]'" fires
- [ ] Back button disabled during status update (BRAND-FIX-2 verified)
- [ ] Spinner shows during status update (BRAND-FIX-3 verified)

---

## Error States

- [ ] No critical error auto-dismisses before user can act
- [ ] Field validation errors: inline below field with specific message
- [ ] Network error: section-level error card with Retry button
- [ ] Session expired: redirects to login with message
- [ ] Upload failed: inline retry with specific file/size message
- [ ] CV Doctor failed: error card inside stepper (not page-level)
- [ ] Application submit failed: answers preserved confirmation shown
- [ ] No error uses generic "Something went wrong" alone without next action

---

## Empty States

- [ ] No jobs posted: empty state with "Post your first job." CTA
- [ ] No applicants: empty state (not blank section)
- [ ] Action center empty: "You're all caught up!" displayed
- [ ] No CV uploaded: empty state with "Upload CV" CTA
- [ ] No applications: empty state with "Browse jobs" CTA
- [ ] Search zero results: "No results for '[term]'" shown

---

## Employer Dashboard (V5)

- [ ] Dashboard skeleton: dark hero block shimmer present during load
- [ ] KPI strip: shows 0 or skeleton while loading; no undefined/null values
- [ ] KPI zero states: explained (e.g., "0 Active Jobs") not left blank
- [ ] Employer Branding Health: complete state shows "Your company profile is complete."
- [ ] Employer Branding Health: incomplete state shows progress ring + missing chips + CTA
- [ ] Subscription/Plan Health: shows real plan badge; no fake data
- [ ] Subscription/Plan Health: near-limit indicator only if real data confirms it
- [ ] Candidate Insights: empty state shows no fake cities or fake candidate data
- [ ] Action center: error card shows with Retry if pipeline fails
- [ ] Hiring pipeline: skeleton then real chart (no blank section)

---

## Haptics

- [ ] `dashboardAction()` fires on employer action card tap (touch device)
- [ ] `planAction()` fires on plan health CTA tap (touch device)
- [ ] Haptics NOT fired on page load
- [ ] Haptics NOT fired on low scores or error states
- [ ] Haptics NOT fired on rejection-like states
- [ ] Haptics NOT fired on repeated notification loops
- [ ] `respectReducedMotion()` returns true on device with preference set
- [ ] Haptics suppressed when `prefers-reduced-motion: reduce` is set
- [ ] `canVibrate()` returns false on desktop/iOS (no throw, no console error)

---

## Accessibility

- [ ] `:focus-visible` outline visible on all interactive elements (keyboard test)
- [ ] No focus lost after modal closes
- [ ] All icon-only buttons have `aria-label`
- [ ] All decorative SVGs have `aria-hidden="true"`
- [ ] Skeleton containers have `aria-hidden="true"` or `aria-busy="true"` on parent
- [ ] Loading SR text fires via `aria-live="polite"` when data is loading
- [ ] Toast notifications persist ≥5s for success
- [ ] Errors do not auto-dismiss
- [ ] `role="alert"` not used for non-urgent updates
- [ ] No colour-only meaning in any state indicator
- [ ] Touch targets ≥44px on all interactive elements (mobile audit)

---

## Performance

- [ ] `ng build` completes without errors after BRAND v6 SCSS additions
- [ ] Lighthouse score on `/jobs` not degraded vs. baseline
- [ ] Lighthouse score on employer dashboard not degraded vs. baseline
- [ ] No new npm packages introduced
- [ ] Skeleton shimmer: no jank on 6+ simultaneous skeletons (test on Android)
- [ ] Plan meter animation: no layout jank (check for reflow in DevTools)

---

## Reduced Motion

- [ ] All `.gh-dashboard-card` animations suppressed under `prefers-reduced-motion`
- [ ] All `.gh-dashboard-kpi` animations suppressed
- [ ] All `.gh-plan-meter` animations suppressed (meter shows at final value)
- [ ] All `.gh-dashboard-skeleton` shimmer suppressed
- [ ] All `.gh-plan-health-skeleton` shimmer suppressed
- [ ] Skeleton shimmer (global `@keyframes gh-shimmer-v6`) suppressed
- [ ] Card hover lift suppressed (transform: none)
- [ ] Button press scale suppressed
- [ ] All existing animations from prior BRAND passes still suppressed
- [ ] Haptics suppressed when `prefers-reduced-motion: reduce` is set

---

## Regression

- [ ] Public portal: job card hover still works
- [ ] Public portal: search still functional
- [ ] Employer dashboard: all V5 functionality intact (pipeline, action center, KPI, branding health, subscription)
- [ ] Applicant profile: save still works
- [ ] Application flow: video recording still accessible
- [ ] Application flow: application submission still works end-to-end
- [ ] Admin panel: user management still accessible
- [ ] Sidebar: all nav links still navigate correctly
- [ ] No routes broken by any changes in this pass
- [ ] No APIs changed
- [ ] No component logic changed (only CSS/token additions + haptic service methods added)
