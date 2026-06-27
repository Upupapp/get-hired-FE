# GETHIRED BRAND — Microinteractions Library (Phase 9)
**BRAND v6 · 2026-06-27**

---

## Principles

1. Every microinteraction answers: did my action register?
2. Durations: press/select = 80–120ms; transition = 160–260ms; scan/reveal = 300–720ms.
3. `prefers-reduced-motion`: disable transforms and animations; allow opacity changes.
4. No colour-only or motion-only meaning — text/icon always paired.
5. No dark patterns — no urgency fabrication, no misleading loading hints.

---

## Button Press (`.gh-pressable`)
- **Trigger:** `:active` state
- **Effect:** `scale(0.985)` over 100ms `cubic-bezier(0.4, 0, 0.2, 1)`
- **Reduced motion:** No transform; allow opacity flicker optional.
- **Haptic:** `press()` [6] on touch devices.
- **Class:** `.gh-pressable` (already in `_motion.scss`)

## Primary CTA Hover / Focus
- **Hover:** Background lightens (`rgba(#FF7062, 0.9)`)
- **Focus-visible:** `outline: 2px solid #FF7062; outline-offset: 2px`
- **Duration:** 150ms ease
- **No translateY on CTA buttons** (reserve lift for cards)

## Save Button — Loading State
- **Trigger:** Click submit/save
- **Effect:** Spinner `spinner-border-sm` replaces icon; button disabled; label changes to action verb + "ing"
- **Duration:** Until response resolves
- **On success:** Spinner out → checkmark icon → "Saved" 1.5s → revert to default
- **On error:** Spinner out → error icon → error text near button
- **Haptic:** `actionComplete()` on success

## Apply Button (Application Submit)
- **Trigger:** Click "Apply"
- **Effect:** Full loading state on button; page transitions to submit confirmation
- **Haptic:** `applicationSubmitted()` on success
- **Never:** Progress bar faking upload before API call

## Job Card Hover / Focus
- **Hover:** `translateY(-4px)` + `box-shadow: 0 12px 24px rgba(16,24,40,0.08)` over 220ms
- **Focus-within:** Same as hover (keyboard accessible)
- **Reduced motion:** Background tint only, `transform: none`
- **Class:** Already implemented in `job-card.component.scss`

## Filter Chip Select
- **Trigger:** User clicks a filter chip
- **Effect:** Background fills to active colour; border changes; checkmark icon appears
- **Duration:** 120ms ease
- **Haptic:** `selection()` [8] on touch devices
- **Deselect:** Reverse animation same duration

## Search Field Focus
- **Trigger:** Input receives focus
- **Effect:** Border glow (`box-shadow: 0 0 0 3px rgba(#FF7062, 0.15)`) + border colour intensifies
- **Duration:** 150ms ease
- **Reduced motion:** Border colour change only, no glow

## Profile Action Item Complete
- **Trigger:** User marks an item complete (profile checklist, onboarding step)
- **Effect:** Item scales down `scale(0.985)` → strikethrough text → checkmark → item fades out (200ms) → list reflows
- **Haptic:** `actionComplete()` [8,30,8]
- **A11y:** `aria-live="polite"` announces "Step completed."

## Upload Dropzone
- **Hover / drag-over:** Border changes from dashed grey to solid coral; background: `rgba(#FF7062, 0.04)` tint; subtle scale `scale(1.01)` on the zone
- **Duration:** 160ms
- **Drag-leave:** Reverses
- **On file accepted:** Brief flash of coral + icon swap to check → transition to upload progress bar
- **Haptic:** `uploadComplete()` on final accept

## CV Doctor Stepper
- **Step transition:** Current step label fades + icon swaps (200ms cross-fade)
- **Active step:** Coral underline / highlight
- **Completed step:** Checkmark icon replaces step number
- **Step text updates:** `aria-live="polite"` on the step description region
- **No fake progress:** Only advance when server confirms step complete

## CV Health Score Reveal
- **Trigger:** Analysis complete
- **Effect:** Score ring animates from 0% to real score over 720ms (`--gh-motion-analysis: 720ms`)
- **Score number:** Countup animation 0 → real value over 900ms (`--gh-motion-countup: 900ms`)
- **Haptic:** `scanComplete()` [8,20,8] at reveal moment
- **Reduced motion:** Score appears immediately at final value; no ring animation; no countup

## Recruiter Job Publish
- **Trigger:** Click "Publish"
- **Effect:** Button loading → "Publishing…" → success banner: "Your job is live!"
- **Haptic:** `jobPublished()` [12,30,12]
- **Dashboard update:** Job moves to active list (no animation — list reloads)

## Dashboard Action Card Click
- **Trigger:** User clicks an action card in the Action Center
- **Effect:** Card press scale `scale(0.985)` (100ms) → release → navigate or trigger action
- **Haptic:** `dashboardAction()` [8]

## Dashboard KPI Card Hover / Focus
- **Hover:** Subtle lift `translateY(-2px)` + box-shadow intensifies (160ms)
- **Focus:** `focus-visible` outline
- **Numbers:** Countup animation on initial reveal (0 → value, 900ms); no animation on hover

## Dashboard Pipeline Stage Hover / Focus
- **Hover:** Stage label highlights (background tint); bar underline
- **Focus:** Keyboard focus ring on stage button
- **Duration:** 120ms

## Dashboard Plan Health Meter Animation
- **Trigger:** Plan health section reveals
- **Effect:** Usage meter bars animate from 0% to real usage value once (600ms ease-out)
- **Never:** Animate meters on hover; never fake usage percentage; never animate to values above real usage

## Employer Branding Recommendation Completion
- **Trigger:** Employer completes a profile section
- **Effect:** Missing chip for that section disappears (fade + scale out, 200ms); completion ring increments; progress bar advances
- **Haptic:** `actionComplete()` if triggered by user action

## Subscription Plan Health CTA
- **Trigger:** User clicks "Upgrade" or "Update billing"
- **Effect:** Button press scale → navigate to billing
- **Haptic:** `planAction()` [8]

## Table Row Expand
- **Trigger:** Click chevron/expand button on a collapsed row
- **Effect:** Row expands downward (height transition 200ms ease-out); chevron rotates 180° (200ms)
- **Reduced motion:** Instant expand/collapse; no chevron rotation

## Modal / Dialog Open + Close
- **Open:** Overlay fades in (150ms); dialog slides up from 8px below (200ms)
- **Close:** Dialog fades + slides down (150ms); overlay fades out
- **Reduced motion:** Instant appear/disappear; only opacity transition (0.01ms per global rule)
- **Focus:** Focus trap to dialog on open; return focus to trigger on close

## Toast / Snackbar Appear
- **Appear:** Slide up from bottom 8px (200ms ease-out) + fade in
- **Dismiss:** Fade out (150ms)
- **Auto-dismiss:** 5s minimum for success; 8s for warning; never auto-dismiss errors
- **Reduced motion:** Appear/disappear with opacity only

## Empty State CTA
- **Hover:** Button hover state (standard)
- **Illustration:** Static. On `hover: hover` + `prefers-reduced-motion: no-preference` — optional 1px float keyframe every 4s (very slow, subtle)

## Error Retry Button
- **Trigger:** Click Retry
- **Effect:** Loading state on retry button → request fires → success (section loads) OR error (error card updates)
- **Haptic:** None (error retry is not a completion)

## Offline Retry
- **Trigger:** Click "Try again" while offline
- **Effect:** Brief spinner → "Still offline. Check your connection." — no haptic
