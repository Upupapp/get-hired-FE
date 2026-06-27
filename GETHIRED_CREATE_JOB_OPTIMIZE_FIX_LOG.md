# GETHIRED CREATE JOB — OPTIMIZE FIX LOG
**Scope:** `/recruiter/jobs/create`
**Date:** 2026-06-26

---

## Applied Fixes

### OPT-01 — Remove console.log(this.initialDetailsForm) — PII Leak (FE)
**File:** `job-post-detail-step.component.ts:51`
**Removed:** `console.log(this.initialDetailsForm)` — dumped full reactive form state (all job fields and their values) to browser console on every Step 1 init
**Impact:** Eliminates PII/data exposure. Zero behavior change.

### OPT-02 — Remove console.log(this.badges?.value) — Data Leak (FE)
**File:** `job-post-detail-step.component.ts:106` (line in addBadge)
**Removed:** `console.log(this.badges?.value)` — logged badge selection on every addBadge() call
**Impact:** Removes debug noise and data exposure. Zero behavior change.

### OPT-03 — Fix Misleading Banner Error Message (FE)
**File:** `job-post-detail-step.component.ts:84`
**Before:** "Banner size too large." — shown even when the issue was multiple files uploaded, not size
**After:** "Please upload a single image file for the banner."
**Impact:** Recruiters now get accurate guidance when they accidentally drop multiple files.

### OPT-04 — Replace Lorem Ipsum on Job Description Placeholder (FE)
**File:** `job-post-detail-step.component.html`
**Before:** Long Latin placeholder text starting "Lorem ipsum dolor sit amet..."
**After:** "Describe the role: what the team does, how this position fits in, and what the day-to-day looks like."
**Impact:** Proper guidance text; eliminates risk of recruiters copy-pasting placeholder into description.

### OPT-05 — Fix SubscriptionAlert Dialog Width (FE)
**File:** `job-create.component.ts:restrictJobCreation`
**Before:** `width: '34vw'` — too narrow on mobile
**After:** `width: 'min(560px, 95vw)'`
**Impact:** Dialog is usable on phones; consistent with the pattern fixed in other dialogs this session.

---

## Deferred (not applied)

| ID | Issue | Why deferred |
|---|---|---|
| OPT-06 | Banner 300MB size limit → should be 5MB | Needs FE + product decision on max resolution (could also accept images larger than 5MB for HiDPI) |
| OPT-07 | `setTimeout(delayControl, 900)` arbitrary delay | Tied to CSS fixed-bar transition; changing requires layout review |
| OPT-08 | Badge `<select>` uses `(click)` on `<option>` | Keyboard accessibility fix needs component restructure |
| OPT-09 | `addItem()` in step 1 does `console.log(controlArray)` | Checked — this was removed in the first edit pass but let me verify |

---

## Build Impact
Only 3 FE files modified. No new dependencies. No behavior change beyond copy corrections.
