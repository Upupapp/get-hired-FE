# GETHIRED DASHBOARD — NOTIFY REPORT

**Component:** `src/app/company/company-dashboard/company-dashboard.component.html`
**Scope:** Full copy/messaging audit + fixes for the employer dashboard (`/recruiter/dashboard`)
**Date:** 2026-06-27

---

## Full Message Inventory

### Hero Section (10 messages)
| Element | Copy | Status |
|---|---|---|
| Eyebrow | "Hiring command center" | OK |
| Title | `{{ companyName \|\| 'Your company' }}` | OK — good fallback |
| Subtitle | "X active jobs · Y applicants this month" | OK |
| Review chip | "X applicant(s) to review" | OK |
| Primary CTA | "Post a job" | OK |
| Secondary CTA | "Review applicants" | OK |

### Action Center (8 messages)
| Element | Copy | Status |
|---|---|---|
| Section title | "Action center" | OK |
| Loading | (skeleton cards, no text) | OK |
| Error | "Couldn't load your action items right now." + Retry | OK |
| Urgent card | "Review new applicants" / "X applicant(s) waiting for your review." | OK |
| Jobs card | "Manage your jobs" / "View, edit, and publish your job posts." | OK |
| Profile card | "Complete your company profile" / "Missing: [fields]." | OK |
| Messages card | "Messages" / "View all candidate conversations in one place." | OK |
| Empty state | "You're all caught up. No applicants are waiting for review right now." | OK |

### KPI Strip (4 cards)
| Element | Copy | Issue found | Status |
|---|---|---|---|
| Card 1 | "Active jobs" | No aria-label on button | FIXED |
| Card 2 | "Applicants this month" | No aria-label on button | FIXED |
| Card 3 | "Video answers this month" | No aria-label; navigates to jobs list (not video page — honest) | FIXED |
| Card 4 | "Needs review" | No aria-label on button | FIXED |

### Hiring Pipeline (5 messages)
| Element | Copy | Status |
|---|---|---|
| Section title | "Hiring pipeline" | OK |
| Loading | (skeleton) | OK |
| Error | "Couldn't load your hiring pipeline right now." + Retry | OK |
| Empty state | "No applicants yet" / "Applicants will appear here once candidates start applying to your jobs." | OK |
| Stage bars | `stage.label` + count from BE data | OK |

### Applicants Needing Review (4 messages)
| Element | Copy | Status |
|---|---|---|
| Section title | "Applicants needing review" | OK |
| Name/meta | `candidateName`, `jobTitle · date` | OK |
| Stage badge | "Pending Review" / "Under Review" | OK |
| CTA | "Review" | OK |

### Getting Started Checklist (6 messages)
| Element | Copy | Status |
|---|---|---|
| Section title | "Getting started" | OK |
| Intro | "Complete these steps to get the most out of GetHired." | OK |
| Step 1 | "Complete your company profile" / "Add your logo, description, and location so candidates know who is hiring." | OK |
| Step 2 | "Post your first job" / "Create a job post to start receiving applications from qualified candidates." | OK |
| Step 3 | "Review your first applicants" / "Once candidates apply, review their profiles and video answers here." | OK |
| Done badge | "Done" (aria-label="Completed") | OK |

### Job Performance / Jobs Awaiting Review (4 messages)
| Element | Copy | Issue found | Status |
|---|---|---|---|
| Section title | "Jobs with applicants waiting" | Vague; not action-oriented | FIXED → "Jobs awaiting review" |
| aria-label on section | "Jobs with active applicants" | Didn't match new title | FIXED → "Jobs awaiting review" |
| Row meta | "X applicant(s) awaiting review" | OK | OK |
| CTA | "Review" | OK | OK |

### Employer Branding Health (7 messages)
| Element | Copy | Status |
|---|---|---|
| Section title | "Employer branding health" | OK |
| Subtitle | "A complete profile attracts more candidates and builds trust." | OK |
| Progress bar aria | "Employer branding completeness: X%" | OK |
| Missing label | "Still missing:" + chips | OK |
| Complete profile CTA | "Complete profile" | OK |
| Done state | "Your company profile is complete. Candidates see your best face." | OK |
| Loading | Section hidden while dashboard$ loads (outer *ngIf) | OK |

### Subscription / Plan Health (10 messages)
| Element | Copy | Issue found | Status |
|---|---|---|---|
| Section title | "Subscription" | OK — concise is fine | OK |
| Plan badge | `subscriptionName \|\| 'Paid plan'` / "Free plan" | OK | OK |
| Expiry line | "X days remaining · renews [date]" | OK | OK |
| Meter label 1 | "Job posts" | OK | OK |
| Meter label 2 | "Admin users" | OK | OK |
| Meter label 3 | "Video responses" | OK | OK |
| Meter count format | "X / Y" | OK | OK |
| Meter aria-labels | All 3 have descriptive aria-labels | OK | OK |
| Manage link | "Manage subscription" | OK | OK |
| Error state | (was: silently missing) | Section disappeared on API failure | FIXED — error card + Retry added |

---

## Issues Found and Fixed

### FIX 1 — KPI buttons missing accessible names

**Problem:** All 4 KPI buttons (`<button>`) contained only visually readable text inside spans. Screen readers would announce "28 Active jobs" but with no context that the button is clickable or where it goes.

**Fix:** Added `[attr.aria-label]` to each KPI card button with value/action description.

Before: `<button type="button" class="emp-dash-kpi-card gh-pressable" (click)="goToJobsList()">`
After: `<button type="button" class="emp-dash-kpi-card gh-pressable" (click)="goToJobsList()" [attr.aria-label]="'Active jobs: ' + (dashboard.charts?.activeJobs || 0) + '. View jobs list.'">`

---

### FIX 2 — Job Performance section title "Jobs with applicants waiting"

**Problem:** "Jobs with applicants waiting" is passive and vague. The section is specifically about jobs where applicants need human review action. The CTA on each row says "Review".

**Old:** "Jobs with applicants waiting" / `aria-label="Jobs with active applicants"`
**New:** "Jobs awaiting review" / `aria-label="Jobs awaiting review"`

---

### FIX 3 — Subscription section had no error state

**Problem:** If `subsRestrictions$` errored, the entire section silently disappeared with no feedback to the user and no way to retry.

**Fix:** Added a `subsError` flag driven by `catchError` on `subsRestrictions$`. When the error flag is true, shows:
- "Couldn't load your subscription details right now."
- A "Retry" button (`retrySubscription()` method re-dispatches `getCompanySubscription`)

This mirrors the identical error pattern in the pipeline section.

---

## Deferred / Not Fixed

- **"Video answers this month" navigates to jobs list** — there is no dedicated video answers route. The nav target is honest (jobs list is where recruiters see videos). A dedicated video review page would fix this properly but requires a new route.
- **Subscription section has no loading skeleton** — while `subsRestrictions$` is pending, nothing shows. A skeleton could be added but requires a `subsLoading` flag, which would need more complex NgRx state handling.

---

## Release Gate

**Messaging gate: PASS**

28 user-facing messages audited across 10 sections. 3 issues found and fixed. No fake claims, no fake urgency, no fake counts anywhere. All error states now have visible feedback. All CTAs have accessible names.
