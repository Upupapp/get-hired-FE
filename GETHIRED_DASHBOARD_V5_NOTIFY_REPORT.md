# GetHired Dashboard V5 — Notify Report (User-Facing Text Audit)
**Date:** 2026-06-27 | **Component:** `company-dashboard`

---

## Empty States

| Element | Empty state text | Assessment |
|---------|-----------------|------------|
| Action inbox (all clear) | "You're all caught up. No urgent actions right now." | Good — friendly, clear |
| Hiring pipeline (no applicants) | "Applicants will appear here once candidates start applying to your jobs." + "Post a job" CTA | Good — explains cause + provides action |
| Job performance (no jobs) | "No jobs are currently awaiting applicant review." + "View all jobs" CTA | Good |
| Top applicant cities | "Cities will appear once applicants start applying to your jobs." | Good |
| Applicant overview (no contacts) | "Candidate insights will appear once applicants start applying." | Good |
| Chart area | "Activity trends will appear once your jobs receive views and applications." + "Manage jobs" | Good |
| Profile ring (incomplete) | "Almost there! Complete your profile to attract more candidates." | Good |
| Profile ring (complete) | "Profile complete!" | Good |
| Branding card (no missing) | "Your employer profile is complete. Candidates see your best face." | Good |

**No empty states found with missing copy.** All sections have appropriate fallback text.

---

## Error Messages

| Error | Text | Flags |
|-------|------|-------|
| Pipeline load failure | "Couldn't load action items right now." + Retry | **Flag:** No retry attempt count shown. After 3 failures, user gets no guidance to refresh the page |
| Pipeline card | "Couldn't load pipeline data." + Retry | Same as above |
| Job card | "Couldn't load job data." + Retry | Same as above |
| Subscription failure | "Couldn't load subscription details." + Retry | Same — no count |
| Main dashboard failure | *No error state* | **Flag:** If `dashboard$` errors, user sees infinite skeleton with no message and no retry |

**Fix priority:** Add retry attempt count after 3 failures (e.g., "Still failing — try refreshing the page"). Add error state for `dashboard$`.

---

## Chips and Status Labels

| Chip/label | Values | Assessment |
|------------|--------|------------|
| Hiring health chip | "Good" / "Needs attention" | **Fixed** — previously showed "Unknown" on initial load; now hidden until computed |
| Plan chip (hero) | "Free plan" / "Pro plan" / subscription name | Good |
| Branding health chip | "Good" / "Needs work" / "Incomplete" | Good — thresholds are 80 / 50 / <50 |
| Profile completeness chip | "Complete" / "Good" / "Needs work" | Good |
| Plan chip (health section) | Plan name / "Free plan" | Good |
| Pipeline bar-fill active state | None (visual only) | Good |

---

## CTAs

| CTA | Location | Assessment |
|-----|----------|------------|
| "Post a job" | Hero, pipeline empty, chart empty | Clear, consistent |
| "Review applicants" | Hero | Clear |
| "Complete profile →" | Hero (conditional), hero ring, health card | Good |
| "Improve branding →" / "View company profile →" | Branding card | Contextual — good |
| "Manage plan →" | Subscription card | Clear |
| "View all jobs →" | Job performance card | Clear |
| "Retry" | Error banners | Lowercase, consistent |
| Recommended step CTA | Inbox main card | Dynamic, matches step type — good |

---

## New Account Experience Flags

| Flag | Detail | Priority |
|------|--------|----------|
| Hero stats for new account | Shows "**0** active jobs · **0** applicants this month" — purely numeric, not welcoming | P3 — consider "Get started by posting your first job" for zero state |
| Profile ring 0% | Shows "0%" and "Almost there! Complete your profile..." — "Almost there!" is inaccurate at 0% | P3 — consider "Let's get started" for 0% case |

---

## Accessibility (Text-Level)

| Element | Text | Assessment |
|---------|------|------------|
| KPI card active jobs | aria-label: "Active jobs: X. Go to jobs list." | Good — action context included |
| KPI card applicants | aria-label: "Applicants this month: X" | Good |
| KPI card needs review | aria-label: "Needs review: X applicants" | Good |
| Profile ring div | aria-label: "Profile completeness: X%" + role="group" | Fixed — now valid |
| Branding bar | aria-label: "Employer branding score: X out of 100" | Good |
| Subscription meters | aria-label: "Job slots: X of Y used" etc. | Good |
| Trend tabs tablist | aria-label: "Chart time range" + title tooltip added | Good |

---

## Summary

- All empty states have copy ✓
- Hiring health chip flash fixed ✓
- Main `dashboard$` error has no user-visible message — P2 open item
- Retry messages lack count/escalation — P3 open item
- New-account "0%" ring says "Almost there!" — minor tone mismatch, P3
