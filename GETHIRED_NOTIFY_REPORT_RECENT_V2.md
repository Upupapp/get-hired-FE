# NOTIFY / Copy & Aria Audit — Recent Commit 0ea0919
Generated: 2026-06-25

Build status after fixes: **PASS** (npm run build-dev — no errors, pre-existing autoprefixer warnings only)

---

## Files audited

| File | Area |
|------|------|
| shared/components/reusable-table/reusable-table.component.html | Mobile card rows + desktop action buttons |
| shared/components/confirmation-dialog/confirmation-dialog.component.html | Dialog copy |
| shared/components/subscription-alert/subscription-alert.component.html | CTA copy + keyboard accessibility |
| shared/components/success-dialog/success-dialog.component.html | Dialog copy + icon accessibility |
| shared/components/updated-dialog/updated-dialog.component.html | Dialog copy |
| auth/signin/signin.component.html | Form copy + carousel hide |
| recorder/recorder.component.html | Recording states + error state + button labels |
| recorder/recorder-setting/recorder-setting.component.html | Audio/video settings labels |
| application/.../record-interview/record-interview.component.html | Touch targets + button labels |
| views/home/.../record-interview/record-interview.component.html | Touch targets + button labels |

---

## 1. Mobile card rows (reusable-table)

**Status: PASS with one fix applied**

### What is good
- Each data field uses `{{ header?.title }}:` as a label prefix (e.g. "Email:", "Date:", "Status:") driven by the same column definition object used by the desktop header. Labels are clear and dynamic.
- Empty state (lines 78-91) renders an illustration + "List of {{componentTitle}} is currently empty." — visible on both desktop and mobile.
- Status badge rendered separately as a btn-status pill, same as desktop.
- Mobile action buttons already had `aria-label="Open menu"` and `aria-label="Delete"` from the previous commit.

### Issue found — desktop action img elements had no accessible name
Lines 124-128 used bare `<img>` tags with click handlers but no `aria-label` and no wrapping `<button>` — inaccessible to keyboard users and screen readers.

**Fix applied (NOTIFY-FIX-4):** Wrapped both `<img>` action elements in `<button>` tags with `aria-label` and `alt=""` on the images.

---

## 2. Dialog copy

### 2a. confirmation-dialog — PASS

- Heading: `{{ data.action }} Confirmation` — clear contextual title.
- Body: falls back to `"Would you like to save your progress in {{ data.action }}?"` or a caller-supplied `data.message` (e.g. "This action cannot be undone." for delete-job).
- Cancel button labelled via `DELETE_WARNING.CANCEL_BUTTON` translation key; has `cdkFocusInitial` (WCAG-safe cancel-first for destructive dialogs).
- Confirm button labelled via `DELETE_WARNING.CONTINUE_BUTTON` translation key; gets `aria-label="Confirm permanent deletion"` when `data.destructive=true`.
- No issues.

### 2b. subscription-alert — PASS

Both branches (error / warning):
- Clear heading "Subscription Limit Exceeded".
- Explanatory paragraph present.
- Primary CTA: "Upgrade Now" button — clear, `cdkFocusInitial`, keyboard focusable.
- Secondary CTA: "Cancel" (error) / "Continue" (warning) — implemented as `<span role="button" tabindex="0">`, which makes it keyboard accessible. Text is unambiguous.
- No issues.

### 2c. success-dialog — PASS with minor fix

Copy: `data.title || 'Message:'` heading + `data.subtitle || 'The data have been successfully updated'` body. Fallback text is clear and not an error string. Single "Continue" button with `cdkFocusInitial`. Clean.

**Fix applied (NOTIFY-FIX-5):** Decorative success icon `<img>` was missing `aria-hidden="true"` — added so screen readers skip it (heading already describes the success state).

### 2d. updated-dialog — PASS

All callers (audited across 5 components) pass plain success strings ('Job has been archived', 'Profile successfully updated', etc.) — no raw Error objects or stack traces can leak through. `{{ data }}` renders the string directly. Safe. "Close" button is clearly labelled with `cdkFocusInitial`. No issues.

---

## 3. Signin copy

**Status: PASS — no issues**

### Carousel hide
- Carousel column is hidden on mobile via `d-none d-lg-block`. The carousel is purely decorative (marketing screenshots + brand copy). All auth-flow content is in the form column.
- `aria-hidden="true"` on the carousel column — screen readers skip it on all screen sizes. Correct.

### Form column order
- Form column uses `order-first order-lg-last` so it is first in DOM tab order AND first visually on mobile. Correct.

### Content still visible on mobile
- `<h4>` heading driven by `SIGNIN.WELCOME_MESSAGE` translation key — present and visible.
- Email + password inputs with labels visible.
- "Remember me" checkbox visible.
- "Forgot password" link visible.
- Submit button visible.
- Signup prompt: `SIGNIN.REGISTRATION_PROMPT` + `<a [routerLink]="'/signup'">SIGNIN.REGISTER</a>` — still visible.
- Password toggle (show/hide) icons work independently of carousel.
- Nothing was hidden that users need.

---

## 4. Recorder copy

### 4a. recorder.component — FIXES APPLIED

**Critical issue — permission-denied state was silent (NOTIFY-FIX-2):**
The TS component sets `videoRecordingError` in two places:
- `getUserMedia` rejection: `'Could not access camera. Please check permissions.'`
- `recordingFailed()` observable: `'Could not start recording. Please check camera permissions and try again.'`

But `videoRecordingError` was **never rendered in the template**. A user whose camera permission is blocked sees nothing — no feedback, no recovery path.

**Fix applied:** Added an `alert-danger` panel (`role="alert"`) that appears when `videoRecordingError` is truthy, displaying the error message and a recovery hint ("Check your browser's camera permission (usually in the address bar) and try again.").

**Close button had no accessible name (NOTIFY-FIX-1):**
The `<img>` with `(click)="cancel()"` was not in a `<button>` and had no `aria-label`.

**Fix applied:** Wrapped in `<button aria-label="Close recorder">` with `aria-hidden="true"` on the img.

**Recording state communicated in text — PASS:**
- "Start Recording" / "Stop Recording" labels on the buttons (text-based, not just color/icon).
- Timer display `{{display}}` (e.g. "01:23") next to a "3 Minutes" duration label.

**"Upload Video Instead" label — PASS:** Clear text label with upload icon (decorative).

**Fix applied (NOTIFY-FIX-3):** Decorative `alt=""` on record/stop icon imgs since button text is present.

### 4b. record-interview (application-process) — PASS with fix

- Start recording: `INTERVIEW_PAGE_SECTION.START_BUTTON` i18n key (translated).
- Stop recording: "Stop Recorder" text label.
- Upload: `INTERVIEW_PAGE_SECTION.UPLOAD_VIDEO_BUTTON` i18n key.
- Skip: `INTERVIEW_PAGE_SECTION.SKIP_INTERVIEW_BUTTON` i18n key.
- Submit Recording: conditional on `previewBlob` — appears after recording.
- Timer + duration text present.

**Issue:** Settings button (icon-only gear icon) had no accessible name.

**Fix applied (NOTIFY-FIX-7):** Added `aria-label="Open recording settings"` + `aria-hidden="true"` on the img.

### 4c. record-interview (views/home) — PASS with fix

Same structure as above. Settings button also icon-only.

**Fix applied (NOTIFY-FIX-6):** Same `aria-label="Open recording settings"` fix.

---

## 5. Aria labels audit summary

| Element | Before | After |
|---------|--------|-------|
| Desktop table menu img | No button, no aria-label | `<button aria-label="Open menu">` |
| Desktop table delete img | No button, no aria-label | `<button aria-label="Delete">` |
| Mobile table menu button | aria-label="Open menu" | No change (already correct) |
| Mobile table delete button | aria-label="Delete" | No change (already correct) |
| Recorder close img | No button, no aria-label | `<button aria-label="Close recorder">` |
| Recorder start/stop imgs | No alt | alt="" (decorative, button has text) |
| Success dialog icon img | No aria-hidden | aria-hidden="true" added |
| Settings button (both record-interview) | Icon-only, no label | aria-label="Open recording settings" |
| Recorder error state | Not rendered in template | Added alert panel with recovery copy |

---

## Files changed

1. src/app/recorder/recorder.component.html — NOTIFY-FIX-1 (close button), NOTIFY-FIX-2 (error state panel), NOTIFY-FIX-3 (icon alt)
2. src/app/shared/components/reusable-table/reusable-table.component.html — NOTIFY-FIX-4 (desktop action buttons)
3. src/app/shared/components/success-dialog/success-dialog.component.html — NOTIFY-FIX-5 (icon aria-hidden)
4. src/app/views/home/pages/job-post-details-apply/steps/interview-questions/components/record-interview/record-interview.component.html — NOTIFY-FIX-6 (settings button label)
5. src/app/application/application-process/steps/interview-questions/components/record-interview/record-interview.component.html — NOTIFY-FIX-7 (settings button label)

## Build result
npm run build-dev: PASS — Hash ce1089e713f44c5b, Time 54114ms, no errors
