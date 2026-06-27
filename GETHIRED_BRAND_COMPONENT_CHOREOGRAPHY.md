# GETHIRED BRAND — Component Choreography (Phase 13)
**BRAND v6 · 2026-06-27**

---

## Choreography Rules

1. **Parent before child** — container animates in first, then content children stagger.
2. **Important status before supporting detail** — primary information appears before secondary.
3. **Short sequences** — max 3 stagger steps; total sequence ≤400ms.
4. **No queued animation during rapid filtering/typing** — animations are cancelled/skipped if a new filter arrives before previous completes.
5. **No delayed task actions** — interactive elements (buttons, inputs) must be immediately usable. Never delay interactivity for animation.
6. **Motion supports mental model** — up = new content arriving; down = dismissing; left/right = navigation between siblings.
7. **Avoid competing movement** — never animate two large elements simultaneously on the same plane.
8. **Keep lists calm** — long lists (>5 items) stagger only first 3 items; rest appear immediately.
9. **Static fallback always** — every sequence works without animation (opacity=1, transform=none).

---

## Sequences

### App Shell Load
1. Sidebar fades in (150ms, no transform — already mounted)
2. Topbar fades in (150ms, simultaneous)
3. Main content area: skeleton shimmer begins (if data loading) OR page content fades in (200ms)
- No stagger between sidebar/topbar — they mount together.

### Page Load (Route Navigation)
1. Route change triggers: old content fades out (100ms)
2. Page skeleton begins shimmer (instant — no gap)
3. When data resolves: skeleton fades out (150ms) + real content fades in + rises (translateY(-8px)→0, 220ms)
- Total felt sequence: ~350ms

### Tab Switch (e.g., applicant profile sections)
1. Current tab content fades out (80ms)
2. New tab content fades in (120ms) — no translateY (avoid disorientation on adjacent tabs)
- No skeleton needed for tab switch if content was previously loaded and cached.

### Modal Open
1. Backdrop overlay fades in (150ms)
2. Dialog rises from 8px below + fades in (200ms, `--gh-ease-emphasized`)
3. First interactive element receives focus
- Total: ~200ms (concurrent)

### Modal Close
1. Dialog fades out + sinks 4px (150ms, `--gh-ease-exit`)
2. Backdrop fades out (150ms, concurrent)
3. Focus returns to trigger element

### Dropdown Open/Close
1. Dropdown panel fades in + translateY(-4px → 0) (160ms)
2. Close: fade out + translateY(0 → -4px) (120ms)

### Job List Load
1. Page skeleton shows immediately
2. First 3 job cards enter: `gh-card` class — translateY(-8px)→0 + fade, 220ms, staggered 40ms each
3. Remaining cards: instant appear (no stagger)
4. Filter controls: already visible; no animation on filter bar

### Search / Filter Update
1. Results area shows skeleton (80ms after filter change — debounced)
2. Results appear: instant (no entrance animation on filter results — avoids motion sickness on rapid filtering)
- Only use entrance animation on the initial page load, not on filter-driven refreshes.

### Profile Save
1. Button → "Saving…" inline loading (spinner)
2. API resolves
3. Button → checkmark (200ms icon swap + `.gh-success-pulse` scale)
4. Toast: "Profile saved." (slide up 200ms)
5. Button returns to default state after 1.5s

### Document Upload
1. Dropzone: coral glow on drag-over
2. File accepted: icon swap to check + progress bar appears
3. Progress bar fills to real %
4. Complete: progress bar → green + "Upload complete." + haptic `uploadComplete()`
5. Toast: "CV uploaded successfully."

### CV Doctor Scan
1. Step 1 activates: step label highlights + scan loader starts
2. Server confirms step 1 complete: step 1 checkmark, step 2 activates
3. Server confirms step 2 complete: step 2 checkmark, step 3 activates
4. Analysis complete: score ring fills (720ms `--gh-motion-analysis`) + countup (900ms)
5. Haptic: `scanComplete()` at reveal moment
6. Reduced motion: ring appears at final value; no countup

### CV Health Score Reveal
1. Score card fades in (200ms)
2. Ring animates 0 → real score (720ms `--gh-ease-scan`)
3. Number countup 0 → real score (900ms)
4. Recommendation chips appear: `scale(0.85→1) + opacity(0→1)` staggered 30ms each
5. Haptic: `scanComplete()` paired with ring start

### Application Submit / Success
1. Submit button → "Submitting…" + disabled
2. Back navigation disabled
3. API confirms → success card replaces form content (fade in 250ms)
4. Checkmark draws in (200ms stroke animation)
5. Haptic: `applicationSubmitted()`
6. Next action CTAs appear (150ms after success card)

### Recruiter Job Publish Confirmation
1. Publish button → "Publishing…" + disabled
2. API confirms → success panel: "Your job is live!" (fade in 250ms)
3. Brief coral glow on success panel (400ms one-shot)
4. Haptic: `jobPublished()`

### Employer Dashboard Action Click
1. Action card: press scale `scale(0.985)` (100ms)
2. Release: scale back (80ms)
3. Navigate or trigger action
4. Haptic: `dashboardAction()`

### Employer Dashboard — Partial Loading
1. Dashboard skeleton renders (full layout)
2. As sections resolve, each section's skeleton fades out + content fades in
3. Sections that fail: error card appears (fade in 150ms) — rest of dashboard unaffected
4. KPI numbers: countup from 0 after reveal (see KPI reveal below)

### Dashboard KPI Number Countup
1. KPI section reveals (`.gh-dashboard-kpi` class)
2. JS-driven countup: 0 → real value over 900ms
3. Reduced motion: shows final value immediately (requires JS check for `prefers-reduced-motion`)

### Subscription / Plan Health Update
1. Plan health section reveals (`.gh-brand-health-card` class entrance)
2. Plan badge fades in
3. Meter fills: `.gh-plan-meter` class (0 → real usage, 600ms)
4. Near-limit: colour change is instant (no animated colour transition)

### Employer Branding Recommendation Completion
1. User completes a profile section → completion API call
2. On success: missing chip for that section fades + scales out (200ms)
3. Progress bar advances (width transition 300ms)
4. If 100%: completion message fades in
5. Haptic: `actionComplete()`

### Public Company Profile Loading
1. Company hero skeleton
2. Company details card skeleton
3. Jobs section skeleton
4. As data resolves: each section transitions (fade in 200ms)
5. If no jobs: empty state appears (no animation — static)

### Error Fallback
1. Error card fades in (200ms) — no transform (error states are calm, not animated)
2. Retry button is immediately interactive
3. On retry: loading spinner on retry button (inline loading)

### Offline Retry
1. Retry button spinner
2. Network check fails: "Still offline." message replaces spinner
3. No haptic; no animation on the failure message

### Empty → Data Transition
1. Empty state is visible
2. Data arrives (e.g., user posts first job from another tab)
3. Empty state fades out (150ms)
4. Content fades in (200ms) with `gh-card` entrance class
- This transition is uncommon; don't over-engineer. Simple opacity crossfade is sufficient.
