# GETHIRED BRAND — Empty & Fallback System (Phase 7)
**BRAND v6 · 2026-06-27**

---

## Empty State Anatomy

Every GetHired empty state must include:
1. **Illustration** (optional, from brand SVG set) — `aria-hidden="true"`
2. **Headline** — concise, specific, positive or neutral
3. **Body message** — explains why it's empty + what to do
4. **Primary CTA** — most valuable next action
5. **Optional secondary CTA** — alternative action
6. **Optional contextual tip** — helpful hint if relevant

Illustrations should be static by default (`prefers-reduced-motion: no-preference` can enable subtle loop on hover).

---

## 6 Empty State Types

### Type 1: First Use (Never Used Feature)
- **Tone:** Welcoming, encouraging
- **Headline pattern:** "[Feature] starts here."
- **Body pattern:** "[Verb] your first [noun] to [benefit]."

### Type 2: Zero Results (Search / Filter Returned Nothing)
- **Tone:** Helpful, non-blaming
- **Headline pattern:** "No results for '[term]'"
- **Body pattern:** "Try different keywords or clear your filters."

### Type 3: Completed (Everything Done)
- **Tone:** Positive, brief
- **Headline pattern:** "You're all caught up!"
- **Body pattern:** "No pending [items] right now."

### Type 4: Permission Denied (Can't See This Content)
- **Tone:** Neutral, informative
- **Headline:** "You don't have access to this."
- **Body:** "Contact your administrator for access."

### Type 5: Deleted / Unavailable
- **Tone:** Informative, helpful redirect
- **Headline:** "[Content] is no longer available."
- **Body:** "It may have been removed or expired."

### Type 6: Error as Empty (Failed to Load, No Cached Data)
- **Visual:** Use section error state (not a blank empty state)
- **Headline:** "[Section] couldn't load."
- **Body + Retry** (see Error System).

---

## Per-Module Empty States

### Applicant Module

| Screen | Empty State Type | Headline | Body | CTA |
|---|---|---|---|---|
| No CV uploaded | First Use | "Your CV starts here." | "Upload your CV to start applying to jobs." | "Upload CV" |
| No work experience | First Use | "Add your work history." | "Your experience helps employers understand your background." | "Add experience" |
| No skills | First Use | "Tell employers what you know." | "Add your skills to improve your profile completeness." | "Add skills" |
| No education | First Use | "Share your education." | "Your educational background strengthens your profile." | "Add education" |
| No certifications | First Use | "Showcase your certifications." | "Add certifications to stand out to employers." | "Add certification" |
| No applications | First Use | "Start applying to jobs." | "You haven't applied to any jobs yet. Browse available positions." | "Browse jobs" |
| No saved jobs | First Use | "Save jobs you're interested in." | "Bookmark jobs to revisit them later." | "Browse jobs" |
| No video CV | First Use | "Record your video introduction." | "A short video helps employers get to know you." | "Record video" |
| No action items | Completed | "You're all caught up!" | "No action items right now. Keep your profile up to date." | "View profile" |
| No job preferences | First Use | "Set your job preferences." | "Tell us what you're looking for so we can show relevant jobs." | "Set preferences" |
| No CV Health report | First Use | "Get your CV Health score." | "Analyse your CV to see how it performs against job requirements." | "Analyse CV" |

### Recruiter / Employer Module

| Screen | Empty State Type | Headline | Body | CTA |
|---|---|---|---|---|
| No jobs posted | First Use | "Post your first job." | "Attract candidates by listing your open positions." | "Post a job" |
| No applicants | First Use | "No applicants yet." | "Once you post a job, applicants will appear here." | "Post a job" |
| No interviews scheduled | First Use | "No interviews scheduled." | "Review your applicants and move them to interview stage." | "Review applicants" |
| No contacts | First Use | "Build your candidate network." | "Add or import candidates to your contacts." | "Add contact" |
| No candidates | First Use | "No candidates found." | "Import candidates or adjust your search criteria." | "Import candidates" |
| No contact groups | First Use | "Organise your candidates." | "Create groups to manage candidates by role or stage." | "Create group" |
| No company users | First Use | "Add your team." | "Invite colleagues to help manage your hiring." | "Invite user" |
| No dashboard job views | Zero Results | "No views recorded yet." | "Job view analytics appear after your jobs go live." | "Post a job" |
| No employer branding data | First Use | "Complete your company profile." | "A complete profile attracts more quality candidates." | "Edit profile" |
| No plan health data | Loading → Error | (handled by plan health loading/error state) | — | — |
| No video answers | First Use | "No video answers received." | "Enable video questions on your job posting to collect video answers." | "Edit job" |
| No candidate messages | First Use | "No messages yet." | "Messages from candidates will appear here once you start conversations." | "Browse applicants" |

### Public Module

| Screen | Empty State | Headline | Body | CTA |
|---|---|---|---|---|
| No jobs on job board | Zero Results | "No jobs match your search." | "Try different keywords, location, or clear your filters." | "Clear filters" |
| No jobs on company profile | First Use | "No open positions right now." | "Check back soon or set up a job alert." | "Browse all jobs" |
| Expired job | Unavailable | "This job is no longer accepting applications." | "The position has been filled or the listing has expired." | "Find similar jobs" |
| Company not found | Not Found | "This company profile isn't available." | "It may have been removed or the URL is incorrect." | "Browse companies" |
| Company profile not ready | First Use | "This company hasn't set up their profile yet." | "Check back later." | "Browse jobs" |

### Admin Module

| Screen | Empty State | Headline | Body | CTA |
|---|---|---|---|---|
| No users | First Use | "No users found." | "User accounts will appear here once registered." | "Invite user" |
| No reports | Zero Results | "No reports available." | "Reports generate when user activity is recorded." | — |
| No activity | Zero Results | "No recent activity." | "System activity will appear here as users interact with the platform." | — |

---

## Brand Illustration Style

GetHired's empty state illustration vocabulary (from `src/assets/brand/gethired-wow/`):

- **Job-map grid** — hiring-pipeline-lines.svg — use for jobs-related empty states
- **Profile-card outline** — candidate-profile-card.svg — use for applicant profile empties
- **Application-pipeline line** — application-status-path.svg — use for application history empty
- **Signal dots / match rings** — match-signal-rings.svg — use for match/search empty
- **Interview waveform** — interview-waveform.svg — use for interview-related empty
- **Skill-chip constellation** — (custom SVG pending) — for skills/experience empty
- **Empty-inbox tray** — (custom SVG pending) — for messages/actions empty
- **Document scan** — (custom SVG or video-answer-orb.svg adapted) — for CV/document empty
- **Search radar** — (custom SVG pending) — for search-zero-results

For screens without a matching illustration: use a simple 32–40px icon chip in brand coral.

---

## Fallback Pages (Full Page Errors)

See `GETHIRED_BRAND_ERROR_SYSTEM.md` for 404 / 403 / 401 / 500 / Offline page specs.
These are handled by the `.gh-fallback-page` class (defined in `_motion.scss` as a reserved class).
