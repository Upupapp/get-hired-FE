# GETHIRED BRAND — UX Copy Guide (Phase 16)
**BRAND v6 · 2026-06-27**

---

## Copy Principles

1. **Sentence case** — not Title Case. "Post your first job" not "Post Your First Job".
2. **Specific** — name the thing that happened or failed. "Your application for Product Designer at Acme was submitted" not "Action completed".
3. **Calm** — no exclamation marks on errors; measured tone on success.
4. **Next action always** — every state tells the user what to do next.
5. **Never blame** — errors are system problems, not user mistakes (unless it genuinely is, e.g., wrong password).
6. **Never overpromise** — don't imply hiring outcomes or recruiter interest.
7. **Never fake AI** — don't say "AI is scanning your CV" if it's a rule-based parser.
8. **Never shame** — low scores, incomplete profiles: constructive language only.
9. **Never urgency fabricate** — don't add urgency that isn't real.

---

## Loading Copy

| Context | Copy |
|---|---|
| App loading | "Loading GetHired…" (SR only) |
| Employer dashboard | "Loading your hiring command center…" (SR only) |
| Plan health | "Checking plan health…" (SR only) |
| Job list | SR: "Loading jobs…" — no visible text needed if skeleton shown |
| Profile loading | SR: "Loading your profile…" |
| CV Doctor step 1 | "Reading your CV…" |
| CV Doctor step 2 | "Analysing your experience…" |
| CV Doctor step 3 | "Building your CV Health report…" |
| Application submit | "Submitting your application…" |
| Job publishing | "Publishing your job…" |
| File upload | "Uploading [filename]…" |
| Profile saving | "Saving…" |
| Retry button (in-flight) | "Retrying…" |

---

## Success Copy

| Context | Copy |
|---|---|
| Application submitted | "Application sent!" → "Your application for [Job Title] at [Company] has been submitted." |
| Profile saved | "Profile saved." |
| CV uploaded | "CV uploaded successfully." |
| CV Health complete | "Your CV Health report is ready." |
| Job published | "Your job is live!" → "Candidates can now find and apply for [Job Title]." |
| Company profile complete | "Your company profile is complete." |
| Account verified | "Your email address is verified." |
| Status updated | "Status updated to '[New Status]'" |
| Interview scheduled | "Interview scheduled." |
| Message sent | "Message sent." |
| Action item complete | "[Item] marked as complete." |
| File accepted on upload | "Upload complete." |
| Filter applied | (SR: "Showing [N] results") |
| Settings saved | "Settings saved." |

---

## Error Copy

| Context | Copy |
|---|---|
| Generic network error | "Something went wrong. Check your connection and try again." |
| 404 — page not found | "We couldn't find that page." |
| 403 — access denied | "You don't have access to this page." |
| 401 — session expired | "Your session has expired. Sign in again to continue." |
| 500 — server error | "Something went wrong on our end. We're looking into it." |
| Offline | "You're offline. Check your internet connection." |
| Reconnected | "Back online." |
| API timeout | "[Section] is taking longer than expected. Try again?" |
| Form field required | "This field is required." |
| Invalid email | "Please enter a valid email address." |
| Invalid password | "Password must be at least 8 characters." |
| File too large | "This file is too large. Please upload a file under 10 MB." |
| Wrong file type | "This file type isn't supported. Please upload a [accepted types] file." |
| Upload failed | "We couldn't upload [filename]. Please try again." |
| CV analysis failed | "We couldn't analyse your CV right now. Try again or contact support." |
| Application failed | "Your application couldn't be submitted. Your answers have been saved — please try again." |
| Job publish failed | "We couldn't publish your job. Please try again." |
| Payment issue | "There's an issue with your billing. Update your payment method to continue." |
| Plan limit reached | "You've reached your job posting limit. Upgrade to post more." |
| Duplicate application | "You've already applied for this job." |
| Already has status | "Applicant already has this status." |
| Application ID missing | "Application ID not found." |
| Loading error (section) | "[Section] couldn't load. Check your connection and try again." |

---

## Empty State Copy

| Context | Copy |
|---|---|
| No jobs posted | Headline: "Post your first job." · Body: "Attract candidates by listing your open positions." |
| No applicants | Headline: "No applicants yet." · Body: "Once you post a job, applicants will appear here." |
| No interviews | Headline: "No interviews scheduled." · Body: "Review your applicants and schedule interviews." |
| No contacts | Headline: "Build your candidate network." · Body: "Add or import candidates to your contacts." |
| No CV uploaded | Headline: "Your CV starts here." · Body: "Upload your CV to start applying to jobs." |
| No applications | Headline: "Start applying to jobs." · Body: "You haven't applied to any jobs yet." |
| No saved jobs | Headline: "Save jobs you're interested in." · Body: "Bookmark jobs to revisit them later." |
| No work experience | Headline: "Add your work history." · Body: "Your experience helps employers understand your background." |
| No skills | Headline: "Tell employers what you know." · Body: "Add your skills to improve your profile." |
| Action center empty | Headline: "You're all caught up!" · Body: "No pending reviews right now." |
| No dashboard job views | Headline: "No views recorded yet." · Body: "Job view analytics appear after your jobs go live." |
| No messages | Headline: "No messages yet." · Body: "Messages from candidates will appear here once you start conversations." |
| Expired job | Headline: "This job is no longer accepting applications." · Body: "The position has been filled or the listing has expired." |
| Company not found | Headline: "This company profile isn't available." |
| Search zero results | Headline: "No results for '[term]'" · Body: "Try different keywords or clear your filters." |
| No admin users | Headline: "No users found." |

---

## Warning Copy

| Context | Copy |
|---|---|
| Trial ending soon | "Your trial ends in [N] days. Upgrade now to keep all features." |
| Near job slot limit | "You're approaching your job posting limit. Upgrade to post more jobs." |
| Near slot limit (urgent) | "You've used [N] of [M] job slots. Upgrade before your next posting." |
| Plan usage at 80% | "You've used 80% of your [resource]. Consider upgrading." |
| Profile incomplete | "Your profile is [N]% complete. A complete profile gets more attention from employers." |
| Company profile incomplete | "[N]% of your company profile is complete. Add [field] to attract more candidates." |

---

## Branded Feature Names

| Name | Usage |
|---|---|
| CV Doctor | The feature/engine name. "Analyse your CV with CV Doctor." |
| CV Health | The score/result. "Your CV Health score is [X]." |
| Hiring Command Center | Marketing name for employer dashboard (hero copy only). |
| Match Explorer | Match feature browser (if implemented). |
| Surgical Review | CV Doctor detailed feedback mode (if implemented). |

---

## Tone Examples — Before / After

| Before (wrong) | After (correct) |
|---|---|
| "LOADING…" in all caps | "Loading jobs…" (SR-only, sentence case) |
| "Error!" | "We couldn't load your jobs. Try again?" |
| "Congratulations! Recruiters are viewing your profile!" | (Delete — fake activity) |
| "AI is scanning your resume now" | "Reading your CV…" |
| "Job posted successfully!" | "Your job is live!" |
| "No data available" | "Post your first job to see applicants here." |
| "Something went wrong." | "We couldn't submit your application. Your answers have been saved — please try again." |
| "Please fix the errors above" | (Point directly to the fields with inline messages; form summary links to specific fields) |
