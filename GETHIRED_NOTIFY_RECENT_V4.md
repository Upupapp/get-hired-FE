# GETHIRED NOTIFY — Recent Deployment Copy Audit (V4)

**Scope:** 4 commits (d3246b6, 70bc592, 172b2a9, f9bc996) — 7 files  
**Auditor:** NOTIFY communication-quality pass  
**Date:** 2026-06-26

---

## 1. Message Inventory

### A. applicant-action-modal.component.ts — Snackbar messages

| Trigger | Original copy | Fixed copy | Action |
|---|---|---|---|
| `applicationId` missing | `"Application ID not found."` | `"We couldn't find this application. Please close and try again."` | FIXED |
| Same status selected | `"Applicant already has this status."` | `"This applicant is already at that status — no change made."` | FIXED |
| Status update success | `"Status updated to \"${statusName}\".` | `"Application status updated to \"${statusName}\".` | FIXED |
| Status update error (fallback) | `"Failed to update status. Please try again."` | `"We couldn't update the status. Please try again."` | FIXED |

All four snackbar dismiss labels changed from `'OK'` → `'Dismiss'` where appropriate (keeps "OK" only on the success confirmation).

### B. applicant-action-modal.component.html — Status picker UI

| Element | Copy | Notes |
|---|---|---|
| Section heading | "Update Application Status" | Clear, appropriate for recruiters |
| Current status label | `Current: <strong>{{jobApplicationStatusName \|\| 'Unknown'}}</strong>` | "Unknown" is a reasonable fallback |
| Back button | "← Back" (HTML entity) | Functional, no change needed |
| Loading indicator | "Updating…" (via `&hellip;`) | Correct — present only while `statusUpdating === true` |
| Status option buttons | "Applied", "Under Review", "Shortlisted", "Rejected", "Hired" | Professional, unambiguous for recruiter context |
| Close button | Icon-only image with click handler (no accessible label) | FIXED — wrapped in `<button>` with `aria-label="Close"` |

### C. job-applicants.component.ts — Table fallback labels

| Element | Original copy | Fixed copy | Action |
|---|---|---|---|
| matchSignalLabel fallback | `"Match signals unavailable"` | `"No signal data"` | FIXED |
| hasAnyMatchSignal guard | Referenced old string | Updated to match new fallback | FIXED |

### D. main-portal.component.html — Public portal copy

| Section | Copy | Assessment |
|---|---|---|
| Hero headline | "Find your next job. Build your next team." | Clean, dual-audience, no inflated claims |
| Hero subtitle | "GetHired Online connects job seekers and employers through a modern platform for job search, applications, video answers, structured profiles, and hiring." | Accurate, honest, not marketing-inflated |
| Hero CTA buttons | "Find jobs" / "Start hiring" | Active voice, sentence case, clear |
| Secondary hero links | "Browse jobs without an account" / "Sign in" | Clear intent, no friction |
| Role card — seeker | "I'm looking for a job" / "Build one profile with CV, skills, applications, and video answers." | Honest, describes real features |
| Role card — employer | "I'm hiring" / "Review profiles, CVs, video responses, and compatibility signals in one hiring workspace." | Honest, no overstatement |
| USP section heading | "Not just a job board" | Accurate, backed by feature descriptions below |
| USP subtitle | "Structured profiles, video answers, and explainable signals help both sides decide with more confidence." | No guarantee language; "more confidence" is appropriately qualified |
| USP pillars | See below | All pass |
| Differentiators section | "What GetHired does" | Plain, appropriate heading |
| Job seeker journey heading | "For job seekers: build your profile once, apply with confidence." | Fine — "with confidence" is reasonable claim |
| Employer journey heading | "For employers: post jobs and manage hiring in one workspace." | Accurate |
| Product Preview disclaimer | "All previews below show example data — not real users or employers." | Good — proactive disclosure |
| Preview tab labels | "Job seeker profile", "Employer dashboard", "Application tracking", "Video answers", "Compatibility signals" | All clear, human-readable, no jargon |
| Trust section heading | "Built for clearer, more organized hiring" | Modest, accurate |
| Trust subtitle | "GetHired helps organize hiring information — not replace human judgment." | Excellent — correct expectations |
| Trust card 1 | "Guidance, not automatic decisions" | Strong, honest |
| Trust card 2 | "Video answers reviewed by real people" | Accurate, important trust signal |
| Trust card 3 | "Structured data, clearer review" | Honest |
| Trust card 4 | "Built for Philippine hiring" | Geographically honest, no over-claim |
| Employer band heading | "Ready to hire in the Philippines?" | Clear CTA context |
| Employer band copy | "Create your employer account, build your company page, and start managing applicants with GetHired." | Accurate process description |
| Final CTA heading | "Ready to get started?" | Neutral, no pressure |
| Final CTA subhead | "Choose your path and start moving forward with GetHired." | Appropriate |
| Final CTA buttons | "Find jobs" / "Start hiring" | Consistent with hero |

### D1. USP Pillar descriptions (from main-portal.component.ts)

| Pillar | Copy | Assessment |
|---|---|---|
| Stronger profiles | "Build one profile with your skills, CV, work history, and video answers." | Accurate |
| Video answers | "Some jobs include video questions, helping candidates explain their experience in their own words." | Correctly qualified with "Some jobs" |
| Explainable match signals | "Compatibility signals are guidance, not automatic decisions — they help teams understand fit without hiding decisions." | Excellent — proactively manages AI expectations |
| Higher hiring confidence | "Review richer candidate context — profiles, CVs, and video answers — before deciding who to move forward." | No guarantee; "before deciding" keeps human in loop |

### D2. Differentiator descriptions (from main-portal.component.ts)

All 6 differentiators accurately describe real features. "Job compatibility signals" correctly framed as "Explainable job signals help people understand fit without hiding decisions." No fake claims found.

---

## 2. Issues Found

### HIGH — Accessibility

**H1 — Close button is not keyboard-accessible or screen-reader-labeled**  
File: `applicant-action-modal.component.html`  
Original: `<span class="close">` wrapping a clickable `<img>` with no `aria-label`.  
A screen reader user would hear nothing meaningful. Keyboard users cannot Tab to it.  
Status: **FIXED** — replaced with `<button type="button" aria-label="Close">` wrapping the image (now `aria-hidden="true"`).

---

### MEDIUM — Message clarity / NOTIFY principles

**M1 — "Application ID not found." is a technical internal error message**  
File: `applicant-action-modal.component.ts` line 94  
Violates NOTIFY principle: answer what happened, why, and what to do next.  
A recruiter does not know what an "Application ID" is or why it might be missing.  
Status: **FIXED** → `"We couldn't find this application. Please close and try again."`

**M2 — "Applicant already has this status." doesn't confirm no change was made**  
File: `applicant-action-modal.component.ts` line 99  
The dialog closes immediately after, so recruiters may wonder if the update happened anyway.  
Status: **FIXED** → `"This applicant is already at that status — no change made."`

**M3 — "Failed to update status." uses passive-deficiency framing**  
File: `applicant-action-modal.component.ts` line 112  
"Failed" is blunter than necessary; NOTIFY prefers "We couldn't…"  
Status: **FIXED** → `"We couldn't update the status. Please try again."`

**M4 — "Status updated to…" is slightly ambiguous (which status? which entity?)**  
File: `applicant-action-modal.component.ts` line 107  
Minor: the snackbar appears immediately after the action so context is clear, but "Application status updated to…" is more precise.  
Status: **FIXED** → `"Application status updated to \"${statusName}\"."`

---

### LOW — Copy / UX

**L1 — matchSignalLabel fallback "Match signals unavailable" is 4 words and passive**  
File: `job-applicants.component.ts` line 90  
In a compact table column, this is longer than necessary and reads like an error.  
Status: **FIXED** → `"No signal data"` (shorter, neutral, factual; guard string also updated)

**L2 — Tracking preview shows "Interview scheduled" status**  
File: `main-portal.component.html` line 311  
The illustrative mock in the "Application tracking" product preview tab shows "Interview scheduled" as a status, but the real `STATUS_OPTIONS` in the app are: Applied, Under Review, Shortlisted, Rejected, Hired. "Interview scheduled" is not a real status.  
This is inside clearly labeled illustrative mock data (`aria-hidden="true"`, disclaimer present), so it does not mislead users functionally. However, it could confuse job seekers who see this on the public portal and then never see "Interview scheduled" in their actual application tracking.  
Status: **RECOMMENDED FIX (not applied)** — change "Interview scheduled" to "Shortlisted" in the tracking mock panel to match real statuses. Safe to apply but requires product team sign-off on which real status to illustrate.

---

## 3. Safe Fixes Applied

| # | File | Change |
|---|---|---|
| F1 | `applicant-action-modal.component.ts` | "Application ID not found." → "We couldn't find this application. Please close and try again." |
| F2 | `applicant-action-modal.component.ts` | "Applicant already has this status." → "This applicant is already at that status — no change made." |
| F3 | `applicant-action-modal.component.ts` | "Status updated to…" → "Application status updated to…" |
| F4 | `applicant-action-modal.component.ts` | "Failed to update status. Please try again." → "We couldn't update the status. Please try again." |
| F5 | `applicant-action-modal.component.html` | Close button: `<span>` + bare `<img click>` → `<button aria-label="Close">` + `<img aria-hidden>` |
| F6 | `job-applicants.component.ts` | matchSignalLabel fallback "Match signals unavailable" → "No signal data" |
| F7 | `job-applicants.component.ts` | `hasAnyMatchSignal()` guard string updated to match new fallback |

**Not applied (portal copy):** No changes needed. All hero, CTA, USP, and trust copy is honest, clear, and NOTIFY-compliant. No fake claims, no guarantees, no "Oops", no technical jargon exposed to users.

---

## 4. No-Action Items

- "Updating…" loading indicator during `statusUpdating === true` — present and correct.
- Status options ("Applied", "Under Review", "Shortlisted", "Rejected", "Hired") — professional, clear for recruiter audience.
- "← Back" navigation — functional, appropriate.
- Current status display (`data?.data?.jobApplicationStatusName || 'Unknown'`) — fallback is acceptable.
- All portal section headings — clear, no inflated claims.
- Trust & Safety section — strongly NOTIFY-compliant. Does not claim AI, does not claim guarantees, proactively disclaims automation.
- Product preview tab labels — all human-readable, none are raw internal IDs.

---

## 5. Release Gate

### GO WITH CAUTION

**Blockers cleared:** All 7 safe fixes applied. No business logic, API contracts, routes, or architecture changed.

**Remaining item before ship:**
- L2 (tracking preview "Interview scheduled"): Minor illustrative mismatch — not a launch blocker, but worth scheduling for the next copy pass. Recommended fix: change to "Shortlisted" to match real status options.

**What's good:**
- Portal copy is honest, qualified, and meets NOTIFY principles throughout.
- No fake AI claims, no guaranteed outcomes, no shame language.
- Trust & Safety section is one of the stronger sections of the public portal.
- Status picker UX is solid: loading indicator present, current status displayed, back navigation clear.
