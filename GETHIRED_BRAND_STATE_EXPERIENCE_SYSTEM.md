# GETHIRED BRAND — State Experience System (Phase 3)
**BRAND v6 · 2026-06-27**

---

## State Taxonomy

Every UI state in GetHired answers: what's happening, why, what can I do next, is this temporary or final, did my action succeed, can I retry, is my data safe.

---

### 1. Loading (Page / Section)
- **Purpose:** Initial data fetch for a full page or major section.
- **Visual:** Skeleton shimmer matching final layout dimensions.
- **Motion:** Shimmer animation 1.4s linear infinite; `prefers-reduced-motion` → plain background, no animation.
- **Haptic:** None (page-load forbidden).
- **Text:** Screen-reader only: `<span aria-live="polite">Loading…</span>` (visually hidden).
- **Persistence:** Until data resolves or timeout (10s) → error state.
- **A11y:** `aria-busy="true"` on the loading region; skeleton blocks have `aria-hidden="true"`.
- **What not to do:** Never show blank white screen; never show GIF spinner alone for page-level loads.

### 2. Inline Loading (Action/Button)
- **Purpose:** Indicates an in-flight async action on a specific button/element.
- **Visual:** Spinner `spinner-border spinner-border-sm` + "Saving…" or action-specific text. Button disabled.
- **Motion:** Bootstrap spinner (already present); no additional animation needed.
- **Haptic:** None.
- **Text:** "Saving…", "Publishing…", "Uploading…", "Analysing…" — action-specific.
- **A11y:** `role="status"` on the loading container; `aria-disabled="true"` on disabled button.

### 3. Uploading
- **Purpose:** File upload progress.
- **Visual:** Progress bar with percentage. File name displayed. Cancel option if cancellable.
- **Motion:** Progress bar fills `0 → real%`, 200ms ease. No fake jump.
- **Haptic:** On upload accepted: `uploadComplete()` [10,20,10].
- **Text:** "Uploading [filename]…", "Upload complete." on finish.
- **A11y:** `aria-valuenow`, `aria-valuemin`, `aria-valuemax` on progress bar. Screen-reader text for completion.

### 4. Processing / Analysing (CV Doctor)
- **Purpose:** Long-running server analysis (CV scan, video processing).
- **Visual:** Step indicator (3–5 steps) with current step highlighted. Calm scan animation (not spinning indefinitely).
- **Motion:** Step transitions 200ms; scan loader pulse gentle; no fake progress.
- **Haptic:** On scan complete: `scanComplete()` [8,20,8].
- **Text:** "Reading your CV…", "Analysing your experience…", "Building your CV Health report…"
- **Persistence:** Until complete OR 60s timeout → error state with retry.
- **A11y:** `aria-live="polite"` on step text updates.
- **What not to do:** No fake progress bar jumping ahead; no "AI analysing…" framing.

### 5. Empty (First Use)
- **Purpose:** Feature never used, no data yet.
- **Visual:** Illustration (one of the brand SVGs) + headline + body + primary CTA.
- **Motion:** Fade-in on first appearance (200ms); illustration static by default.
- **Text:** "[Verb] your first [noun]" — e.g., "Post your first job to start receiving applicants."
- **A11y:** Illustration has `aria-hidden="true"` with text equivalent in body.

### 6. Empty (Zero Results — Search / Filter)
- **Purpose:** Search returned no matches.
- **Visual:** Icon/illustration + "No results for '[query]'" + suggestion to clear filters.
- **Text:** "No jobs match '[term]'" + "Try a different keyword or clear your filters."
- **A11y:** `role="status"` so screen reader announces count update.

### 7. Empty (Completed)
- **Purpose:** List is empty because the user completed all items.
- **Visual:** Positive icon (tick/check) + celebratory (but honest) copy.
- **Text:** "You're all caught up!" + "No pending reviews right now."
- **Haptic:** None (passive state, not user-initiated).

### 8. Success (Micro — Inline)
- **Purpose:** Small action confirmed (toggle, save-field, like).
- **Visual:** Icon swap (→ checkmark) + colour change. 1–2 seconds then revert if appropriate.
- **Motion:** Icon scale `1 → 1.15 → 1` over 200ms (`.gh-success-pulse`).
- **Haptic:** `success()` [12].
- **Text:** Optional tooltip "Saved" or aria-live polite.

### 9. Success (Task — Major Action)
- **Purpose:** Significant action confirmed (application submitted, job published, profile saved, CV uploaded).
- **Visual:** Banner / card overlay with checkmark + headline + next-action CTA.
- **Motion:** Slide down + fade in 250ms.
- **Haptic:** Appropriate method (applicationSubmitted, jobPublished, uploadComplete, actionComplete).
- **Text:** Specific to action — see UX Copy Guide.
- **Persistence:** Persistent until user dismisses or navigates. Never auto-dismiss without explicit timer (≥5s).

### 10. Warning
- **Purpose:** Something needs attention but hasn't failed (plan near limit, profile incomplete, interview time soon).
- **Visual:** Amber banner/badge with warning icon + text.
- **Motion:** No animation. Static visible.
- **Haptic:** `warning()` [20] only if user-initiated trigger surfaced the warning.
- **Text:** Specific + actionable: "Your job slot limit is almost reached. Upgrade your plan to post more jobs."
- **A11y:** `role="alert"` only if it interrupts a user task; otherwise `role="status"`.

### 11. Error (Field Level)
- **Purpose:** Validation failed on a specific form field.
- **Visual:** Red border on field + error text below field.
- **Motion:** None (no shake; no pulse).
- **Haptic:** None (error per-keystroke forbidden).
- **Text:** Specific to field: "Please enter a valid email address."
- **A11y:** `aria-describedby` linking field to error message; `role="alert"` on error element.

### 12. Error (Inline Section)
- **Purpose:** A section failed to load (e.g., action center error, pipeline error).
- **Visual:** Error card with icon + message + Retry button.
- **Motion:** Fade in on error reveal (200ms).
- **Haptic:** None.
- **Text:** "[Section] couldn't load. Check your connection and try again." + Retry button.
- **Persistence:** Persistent until retry succeeds.

### 13. Error (Page Level)
- **Purpose:** Full page failed to render (network, 500, auth expired).
- **Visual:** Full-page error layout with branded illustration + headline + retry/nav CTA.
- **Text:** See Error System doc.
- **A11y:** `role="alert"` in the page title region only; not on each error element.

### 14. Error (System Fallback / 500)
- **Purpose:** Unrecoverable server error.
- **Visual:** Minimal error page; no skeleton, no loading.
- **Text:** "Something went wrong on our end. We're looking into it." + "Go back to home."

### 15. Permission Denied / 403
- **Text:** "You don't have access to this page." + "Contact your administrator or go back."
- **Visual:** Lock icon + message. No details about what access is required (security).

### 16. Not Found / 404
- **Text:** "We couldn't find what you're looking for." + "Go back home" or "Search jobs."

### 17. Offline
- **Visual:** Top banner: "You're offline. Check your connection." Non-dismissible until connection restored.
- **Haptic:** None (background condition).
- **A11y:** `role="alert"` for the initial banner.

### 18. Timeout
- **Purpose:** Request exceeded expected time (typically 10–15s).
- **Visual:** Inline error panel with clock icon + "This is taking longer than expected. Try again?"
- **Haptic:** None.
- **Text:** Specific: "[Action] is taking longer than expected." + "Try again" button.

### 19. Maintenance
- **Visual:** Full-screen branded maintenance page. "We're updating GetHired. We'll be back shortly."
- **No countdown unless timing is confirmed.**

### 20. Degraded (Partial Data)
- **Visual:** Subtle banner: "[Section] has limited information right now."
- **Haptic:** None.
- **Persistence:** Until full data resolves.

### 21. Session Expired / 401
- **Visual:** Intercept modal or redirect to login. "Your session has expired. Sign in to continue."
- **Data safety note:** Preserve any unsaved form data in sessionStorage before redirect.

### 22. Forbidden (Action Blocked by Plan)
- **Visual:** Inline blocker with upgrade CTA. Never fake the limit — only show if real.
- **Text:** "Posting more jobs requires upgrading your plan." + "View plans."

### 23. Payment / Subscription Issue
- **Visual:** Persistent amber banner above dashboard. "There's an issue with your payment method. Update billing to continue posting jobs."
- **A11y:** `role="alert"`.
- **What not to do:** Never show arbitrary warnings not backed by real billing data.

### 24. File Upload Issue
- **Text:** "We couldn't upload [filename]. Please check the file is under 10 MB and try again."
- **Retry:** Inline retry button.

### 25. CV Doctor Issue
- **Text:** "We couldn't analyse your CV right now. Try again or contact support."
- **Visual:** Error card inside the CV Doctor step, not page-level.

### 26. Application Submit Issue
- **Text:** "Your application couldn't be submitted. Your answers have been saved — please try again."
- **Data safety:** Local storage preservation of answers.

### 27. Employer Dashboard — Zero Data
- **Visual:** Empty states per section (see Empty Fallback doc). No blank dashboard.
- **Text:** Per-section guidance (e.g., "Post your first job to see applicants here.").

### 28. Public Company Page — Unavailable
- **Text:** "This company profile isn't available right now." + "Browse other companies."

### 29. Job Expired / Unavailable
- **Text:** "This job is no longer accepting applications." + "Find similar jobs."

### 30. Plan Limit Blocked
- **Visual:** Modal or inline blocker. Real limit shown (e.g., "3/3 job slots used").
- **Text:** "You've reached your job posting limit. Upgrade to post more."
- **Never fabricate limits.**
