# GETHIRED JOB INTERVIEW QUESTIONS OPTIONAL PUBLISH — FRONTEND FIX LOG V1

## Date: 2026-06-25

---

## FILES CHANGED

### 1. `src/app/job/job-create/components/create-interview/create-interview.component.html`

**What changed:**
- Added "Optional for publishing" badge (blue pill) next to the "Interview Questions" heading
- Added hint paragraph with approved copy about interview questions purpose, video answer privacy
- Added empty-state card (`*ngIf="questionsContainer.length === 0"`) with dashed border, icon, and guidance text
- Applied `[@animate]` to the card wrapper for section reveal

**Before:** Plain `<h5>Interview Questions</h5>` with no optional indicator, no empty state, no guidance.
**After:** Badge + hint + animated empty state when zero questions exist.

---

### 2. `src/app/job/job-create/components/create-interview/create-interview.component.scss`

**What changed:**
- `.interview-optional-badge` — blue pill badge with border, reduced-motion-safe entry transition
- `.interview-optional-hint` — muted small hint text
- `.interview-empty-state` — dashed-border card for empty state, reduced-motion-safe
- `.interview-empty-icon`, `.interview-empty-title`, `.interview-empty-subtitle` — empty-state typography
- `.btn-record:active { transform: scale(0.97) }` — micro-scale press effect, reduced-motion-safe

---

### 3. `src/app/job/job-create/components/preview-job-post-step/preview-job-post-step.component.html`

**What changed:**
- Added "Optional for publishing" badge next to "Interview Questions (Candidate view)" label in preview
- Wrapped `*ngFor` of questions in `*ngIf="interviewQuestions?.length > 0"` with `ng-template #noQuestions` fallback
- Empty-state fallback shows "No interview questions added yet. You can publish now and add questions later. Applicants can still apply to this job."

**Before:** Empty section when no questions (visually confusing in preview).
**After:** Clear empty-state message in preview, consistent with Step 3 experience.

---

### 4. `src/app/job/job-create/components/preview-job-post-step/preview-job-post-step.component.scss`

**What changed:**
- `.preview-optional-badge` — blue pill badge matching the one in Step 3
- `.preview-no-questions`, `.preview-no-questions-title`, `.preview-no-questions-sub` — empty-state styles

---

### 5. `src/app/job/job-create/job-create.component.scss`

**What changed:**
- `.btn-add-service:active { transform: scale(0.97) }` — micro-scale press effect on Publish/Next buttons, reduced-motion-safe

---

## FILES NOT CHANGED (CONFIRMED)

- `job-create.component.ts` — `publishJobPost()` already excludes interview questions. `interviewValid` already wired to jobInfo. No change needed.
- `job-create.component.html` — stepper structure correct. Step 3 label already reads "Create Interview (Optional)". No change needed.
- All application flow components — no change
- All employer review components — no change
- All BE files — no change

---

## BUILD RESULT

`npm run build-prod` → SUCCESS. Zero compile errors from these changes.
Pre-existing autoprefixer warning (unrelated, add-contact-group SCSS) remains.
