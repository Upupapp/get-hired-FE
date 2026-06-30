# GETHIRED_EMPLOYER_PORTAL_CONTEXT_HEADER_FIX_LOG_V1

Command: GETHIRED_EMPLOYER_PORTAL_CONTEXT_HEADER_SUBTAB_INFORMATION_ARCHITECTURE_FULLSTACK_V1
Date: 2026-06-30
Branch: master (FE)

---

## Phase 0 — Repo Safety

- Working directory: `C:\Users\paulg\OneDrive\Desktop\Gethired\get-hired-FE`
- Branch: `master`
- Pre-existing uncommitted files: `GETHIRED_PUBLIC_JOBS_PORTAL_FINAL_REPORT_V3.md` (untracked, unrelated)
- No staged changes at command start
- HEAD: 27a25fe feat(autosave): wire real background draft save for job edit mode

---

## Files Changed

### 1. `src/app/employer-panel/employer-panel.component.ts`

**Reason:** `pageTitle` getter returned only the parent module label ("Jobs", "Candidates") for all sub-routes. Added `parentLabel` and `pageSubtitle` getters. Updated `pageTitle` to return the active leaf/subtab label.

**Before:** `pageTitle` returned "Jobs" for all `/jobs/*` routes, "Candidates" for all `/contacts/*` routes.

**After:** Returns specific labels — "Job Posts" for `/jobs/list`, "Expired Jobs" for `/jobs/expired`, "Contact List" for `/contacts/list`, "Applicants" for `/contacts/candidates`, etc.

**New getters added:**
- `parentLabel`: returns parent module name ("Jobs", "Candidates", "Hiring Workspace", "Account") or `''` for Dashboard
- `pageSubtitle`: returns page-specific contextual subtitle for each route

**Risk:** Low — getters are read-only, no side effects, no state change.

**Verification:** Build passed (2026-06-30T15:41:19.098Z).

---

### 2. `src/app/employer-panel/employer-panel.component.html`

**Reason:** Topbar showed only `<h1>{{ pageTitle }}</h1>` — no parent context, no subtitle. Mobile topbar hardcoded "GetHired" instead of current page.

**Before:**
```html
<div class="gh-topbar-left">
  <h1 class="gh-topbar-title">{{ pageTitle }}</h1>
</div>
```
Mobile: `<span aria-hidden="true">GetHired</span>`

**After:**
```html
<div class="gh-topbar-left">
  <div class="gh-topbar-context">
    <span class="gh-topbar-eyebrow" *ngIf="parentLabel">{{ parentLabel }}</span>
    <h1 class="gh-topbar-title">{{ pageTitle }}</h1>
    <p class="gh-topbar-subtitle" *ngIf="pageSubtitle">{{ pageSubtitle }}</p>
  </div>
</div>
```
Mobile: `<span class="gh-mobile-topbar-title">{{ pageTitle }}</span>`

**Risk:** Low — additive HTML only, no logic changes, no route or state changes.

---

### 3. `src/app/employer-panel/employer-panel.component.scss`

**Reason:** Topbar was fixed at 68px height — cannot accommodate eyebrow + title + subtitle. Added new CSS classes.

**Changes:**
- `height: 68px` → `min-height: 68px` + `padding: 10px 28px`
- `.gh-topbar-left`: `align-items: center` → `align-items: flex-start`
- Added `.gh-topbar-context` (column flex)
- Added `.gh-topbar-eyebrow` (10px, uppercase, muted coral-gray)
- Added `.gh-topbar-subtitle` (11.5px, gray, truncates at 480px)
- `.gh-topbar-right`: added `flex-shrink: 0`

**Risk:** Low — additive SCSS classes. Existing topbar layout is preserved.

---

### 4. `src/app/job/job-list/job-list.component.html`

**Reason:** Inner card had `<span class="main-title">Job Posts</span>` + a "New Job" button, duplicating the topbar title "Job Posts" and the topbar "Post a job" action.

**Before:** Card with "Job Posts" title + "New Job" button + talent-proof-badge, then a `<br>`, then the table card.

**After:** Slim `.gh-job-list-topbar` bar with talent-proof-badge on left and "Post a job" button on right, then the table card directly.

**Why "Post a job" retained here:** The topbar "Post a job" button is only visible on desktop (`d-none d-md-flex`). On mobile, the page-level button is the only reachable CTA. The label was changed from "New Job" to "Post a job" for consistency.

**Risk:** Low — same `getCompanyRestrictions()` handler retained. Table card is untouched.

---

### 5. `src/app/job/job-list/job-list.component.scss`

**Reason:** Added `.gh-job-list-topbar` and `.gh-job-list-post-btn` to style the new slim bar.

**Risk:** Additive only.

---

### 6. `src/app/employer-panel/employer-contacts/contact-list/contact-list.component.html`

**Reason:** Inner card had `<span class="main-title mt-3">Contact List</span>` duplicating the topbar title, plus a separate "Add Contact" button card.

**Before:** Card with "Contact List" title + float-right "Add Contact" button.

**After:** Slim `.gh-contact-list-topbar` with "Add Contact" button (right-aligned), directly before the data card. No duplicate title.

**Risk:** Low — same `addContacts()` handler retained. Data card untouched.

---

### 7. `src/app/employer-panel/employer-contacts/contact-list/contact-list.component.scss`

**Reason:** Added `.gh-contact-list-topbar` for right-aligned action bar.

**Risk:** Additive only.

---

### 8. `src/app/employer-panel/recruiter-interview-hub/recruiter-interview-hub.component.html`

**Reason:** Component had its own `.ih-header` section with `<h1>Interviews</h1>` + subtitle, creating two H1 elements on the same page (topbar H1 + page H1). WCAG 2.2 AA: one H1 per page.

**Before:** `.ih-header` block with `<h1 class="ih-title">Interviews</h1>` + `<p class="ih-subtitle">...`

**After:** Section removed. Topbar provides the single H1. Subtitle is provided by `pageSubtitle` getter in topbar.

**Risk:** Low — no logic removed. Filter chips, cards, empty state, error state all preserved.

---

### 9. `src/app/employer-panel/recruiter-messages/recruiter-messages.component.html`

**Reason:** Component had `.rm-page-header` with `<h1>Messages</h1>` + subtitle, creating two H1 elements.

**Before:** `.rm-page-header` block with `<h1 class="rm-page-title">Messages</h1>` + subtitle paragraph.

**After:** Section removed. Topbar provides the single H1. Subtitle provided by topbar.

**Risk:** Low — no logic removed. Filter chips, split pane, thread list, thread detail all preserved.

---

## Build Result

`npm run build-dev`: ✅ Success at 2026-06-30T15:41:19.098Z — no TypeScript errors, no new warnings.
