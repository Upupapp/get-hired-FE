# GETHIRED BRAND — Success System (Phase 6)
**BRAND v6 · 2026-06-27**

---

## Success Level Hierarchy

### Level 1: Micro Success (Inline)
- **Scope:** Toggle, field save, star/save job, mark complete, chip selection.
- **Visual:** Icon swap to checkmark. Subtle colour change. Returns to normal state after 2s (if transient).
- **Motion:** `.gh-success-pulse` — `scale(1 → 1.04 → 1)` over 300ms. `prefers-reduced-motion` → opacity-only.
- **Haptic:** `success()` [12] if user-initiated.
- **Duration:** 1–2 seconds visible; then reverts or persists based on action permanence.
- **Text:** Optional tooltip "Saved" or SR-only `aria-live="polite"` announcement.

### Level 2: Task Success (Action Complete)
- **Scope:** Profile section saved, filter applied, interview scheduled, message sent, annotation added.
- **Visual:** Toast notification (bottom of screen): checkmark icon + specific message.
- **Motion:** Slide up 200ms on appear; auto-dismiss after 5s; swipe/click to dismiss early.
- **Haptic:** `actionComplete()` [8,30,8].
- **Toast rules:** Never carry critical info that isn't also visible on-page. Never stack more than 2 toasts.
- **Text:** See UX Copy Guide for specific messages.

### Level 3: Major Success (Significant Milestone)
- **Scope:** Application submitted, CV uploaded, job published, account verified, company profile completed.
- **Visual:** Full success card/panel (not just toast). Checkmark icon + headline + body + next-action CTA.
- **Motion:** Slide down + fade in 250ms. Checkmark draws/scales in 300ms. No confetti by default.
- **Haptic:** Appropriate method: `applicationSubmitted()`, `jobPublished()`, `uploadComplete()`.
- **Persist:** Persistent until user takes a next action or explicitly dismisses.
- **Text:** Specific, confirming only what happened. Never imply hiring outcome.

---

## Required Success States

### Application Submitted
- **Headline:** "Application sent!"
- **Body:** "Your application for [Job Title] at [Company] has been submitted."
- **Next action:** "View your applications" + "Browse more jobs."
- **Haptic:** `applicationSubmitted()` [12,30,12].
- **Never say:** "Good luck!" (implies outcome) or "Recruiters can now see your profile" (implies activity).

### Profile Saved
- **Toast:** "Profile saved."
- **Haptic:** `actionComplete()`.
- **Next (if applicable):** "Preview your profile →" link.

### CV Uploaded
- **Toast:** "CV uploaded successfully."
- **Haptic:** `uploadComplete()` [10,20,10].
- **If CV Doctor available:** "Analyse your CV →" CTA appears inline.

### CV Health Report Complete
- **Full success card:** "Your CV Health report is ready."
- **Body:** "See your score and recommendations below."
- **Never:** Show score before real analysis; never imply score will guarantee interviews.

### Job Published
- **Full success panel:** "Your job is live!"
- **Body:** "Candidates can now find and apply for [Job Title]."
- **Next action:** "View your job listing" + "Go back to dashboard."
- **Haptic:** `jobPublished()` [12,30,12].

### Company Profile Completed (100%)
- **Inline success:** "Your company profile is complete." (inside Employer Branding Health section).
- **Visual:** Green progress ring fully filled + completion text.
- **Haptic:** None (passive discovery, not user-triggered action).

### Account Verified
- **Full page success:** "Your email address is verified."
- **Next action:** "Go to your dashboard."

---

## A11y Rules for Success

- Toast notifications must persist ≥5 seconds to allow SR users time to hear them.
- Success cards: H2 headline, not just a bold span.
- SR users who can't see animations must receive text confirmation via `aria-live="polite"`.
- Never rely on colour alone (e.g., green toast) — always include icon and/or text label.

---

## Anti-Patterns (Never Do)

| Anti-Pattern | Why |
|---|---|
| Confetti or fireworks by default | Too casual; can feel patronising |
| "Congratulations! Recruiters are viewing your profile!" | Fake activity — massive trust damage |
| Auto-dismiss success toast in <3s | SR users can't read it |
| Success that implies hiring outcome | Misleading, legally sensitive |
| Success message when action actually partially failed | Dishonest |
| No success feedback on significant actions (job published) | User left uncertain |
