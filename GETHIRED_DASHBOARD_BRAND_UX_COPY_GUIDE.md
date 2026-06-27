# GETHIRED DASHBOARD BRAND — UX Copy Guide

**Scope:** All state copy on `/recruiter/dashboard`

---

## Loading State Copy

Currently the skeleton has **no loading message** — it relies purely on the shimmer animation. A recommended (deferred) enhancement:

> **Recommended (not yet added):** In the `#ghDashSkeleton`, add `<p class="gh-visually-hidden" aria-live="polite">Loading your hiring command center…</p>` so screen readers announce the loading state.

---

## Error State Copy

### Primary Dashboard Error (NEW)
```
Title: We couldn't load your dashboard
Body:  There was a problem loading your hiring data. This is usually temporary — please try again.
CTA:   Retry
```
**Tone:** Empathetic, non-technical, non-blaming. "Usually temporary" manages expectations without making a false promise.

### Action Inbox Error
```
"Couldn't load action items right now."
[Retry]
```

### Pipeline Card Error
```
"Couldn't load pipeline data."
[Retry]
```

### Job Performance Card Error
```
"Couldn't load job data."
[Retry]
```

### Subscription Card Error
```
"Couldn't load subscription details."
[Retry]
```

---

## Empty State Copy

### Views & Applications Chart
```
"Activity trends will appear once your jobs receive views and applications."
[Manage jobs]
```

### Hiring Pipeline Health
```
"Applicants will appear here once candidates start applying to your jobs."
[Post a job]
```

### Job Performance Table
```
"No jobs are currently awaiting applicant review."
[View all jobs]
```

### Top Applicant Cities
```
"Cities will appear once applicants start applying to your jobs."
```
(No CTA — no action to take here)

### Applicant Overview
```
"Candidate insights will appear once applicants start applying."
```

### Action Inbox — All Caught Up
```
[✓ icon]  "You're all caught up. No urgent actions right now."
```

### KPI — No Job Views
```
Number: —
Context: "no views yet"
```

### KPI — No Conversion Rate
```
Number: —
Context: "no views yet"
```

### KPI — Messages (no BE data)
```
Number: —
Context: "view inbox"
```

---

## Success State Copy

### Profile Complete (Hero Ring)
```
"Profile complete!"    [green]
```
(Replaces "Almost there! Complete your profile to attract more candidates.")

### Profile Complete (Completeness Card)
```
Chip: "Complete"
CTA: "View profile →"
```

### Branding Score Complete
```
"You're building a strong brand!"
"Your employer profile is complete. Candidates see your best face."
CTA: "View company profile →"
```

### All Caught Up (Action Inbox — main card)
```
Recommended next step
Title: "All caught up"
Body:  "Your hiring workspace has no urgent tasks right now. Keep it up!"
CTA:   "View jobs"
```

---

## Chip Labels

| Condition | Chip text | Colour |
|-----------|-----------|--------|
| Paid plan | Plan name or "Pro plan" | Purple |
| Free plan | "Free plan" | Purple |
| Hiring health good | "Hiring health: Good" | Green |
| Hiring health needs attention | "Hiring health: Needs attention" | Amber |
| Branding ≥80 | "Good" | Green |
| Branding ≥50 <80 | "Needs work" | Amber |
| Branding <50 | "Incomplete" | Red |
| Profile 100% | "Complete" | Green |
| Profile ≥50% <100% | "Good" | Amber |
| Profile <50% | "Needs work" | Red |

---

## Recommended Step Copy (Action Inbox)

| Type | Title | Body | CTA |
|------|-------|------|-----|
| `complete_company_profile` | "Complete your company profile" | "Candidates are more likely to apply when they can see who is hiring." | "Complete profile" |
| `post_first_job` | "Post your first job" | "Create a job post to start receiving applications from qualified candidates." | "Post a job" |
| `review_applicants` | "Review new applicants" | "New applicants match your recent job posts and are waiting for your review." | "Review applicants" |
| `review_video_answers` | "Review video answers" | "Candidates have submitted video answers to your interview questions." | "Review videos" |
| `improve_employer_brand` | "Strengthen your employer brand" | "A stronger profile helps you stand out and attract more qualified candidates." | "Improve branding" |
| `all_caught_up` | "All caught up" | "Your hiring workspace has no urgent tasks right now. Keep it up!" | "View jobs" |

---

## Supporting Action Card Copy

| Type | Label | Description pattern | CTA |
|------|-------|--------------------|----|
| `review_applicants` | "Review applicants" | "{n} applicant(s) waiting for review." | "Review applicants" |
| `review_videos` | "Review video answers" | "{n} video answer(s) need review." | "Review videos" |
| `messages` | "Reply to candidate messages" | "View all candidate conversations in one place." | "Open messages" |
| `complete_profile` | "Complete company profile" | "Missing: {field1}, {field2}." | "Complete profile" |

---

## Hero Stats Copy Pattern

```
{activeJobs} active job(s) · {applicants} applicant(s) this month [· {jobViews | number} job views this month]
```

The job views segment only renders when `cachedJobViewsThisMonth > 0`.

Pluralisation: `job{{ dashboard.charts?.activeJobs === 1 ? '' : 's' }}` and `applicant{{ dashboard.charts?.applicants === 1 ? '' : 's' }}`.
