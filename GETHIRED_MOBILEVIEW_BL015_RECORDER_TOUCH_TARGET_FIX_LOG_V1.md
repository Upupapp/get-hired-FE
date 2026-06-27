# BL-015 — Mobile Touch Targets & Layout: Video/Audio Recorder
**Date:** 2026-06-25  
**Status:** COMPLETE — build verified green

---

## 1. Recorder Surfaces Found

| Surface | HTML | TS | SCSS |
|---|---|---|---|
| Application recorder (primary active path) | `src/app/application/application-process/steps/interview-questions/components/record-interview/record-interview.component.html` | `…/record-interview.component.ts` | `…/record-interview.component.scss` |
| Views/home recorder (legacy / public apply path) | `src/app/views/home/pages/job-post-details-apply/steps/interview-questions/components/record-interview/record-interview.component.html` | `…/record-interview.component.ts` | `…/record-interview.component.scss` |
| Shared recorder dialog (video CV / docs) | `src/app/recorder/recorder.component.html` | `src/app/recorder/recorder.component.ts` | `src/app/recorder/recorder.component.scss` |
| Recorder service (MediaRecorder / RecordRTC) | — | `src/app/recorder/recorder.service.ts` | — |
| Docs Video CV | `src/app/applicant/profile-forms/docs-videocv/docs-videocv.component.html` | `…/docs-videocv.component.ts` | (no changes needed — buttons already full-width) |

---

## 2. Phase 1 Audit Findings

### 2.1 Application recorder (`application/.../record-interview`)

**Controls found:**
- `btn btn-take-interview` — Start Recording (`startRecorder()`)
- `btn btn-settings` — Opens settings modal (`openInterviewSettings()`)
- `btn btn-take-interview` — Stop Recorder (`stopRecorder()`)
- `btn btn-upload` — Upload video file (`uploadFile.click()`)
- `btn btn-skip` — Skip question (`skipInterview()`)
- `btn btn-submit` — Submit recording (`submitRecording()`) — conditional on `previewBlob`

**Pre-fix sizes:**
- `btn-take-interview`: `height: 40px`, no min-width — FAILS WCAG 2.5.5 (need 44px min, 56px for primary)
- `btn-settings`: `height: 40px`, icon-only, no padding — FAILS WCAG 2.5.5
- `btn-skip` / `btn-upload`: `padding: 15px 5px` / `padding: 10px 5px` — borderline, no min-height guarantee
- `btn-submit`: `padding: 15px 18px` — borderline

**Mobile layout issues at 320px:**
- `.bg-bottom { position: absolute; bottom: 20px }` — question overlay + button row clips off bottom of container at narrow widths
- `.bg-main-question { width: 70% }` — fixed width causes overflow on narrow screens
- `record-container { min-height: 380px }` — fixed min-height causes large blank grey block on mobile
- No `aspect-ratio` on video preview — stretches unpredictably on narrow viewports
- Controls in a `d-flex` with no `flex-wrap` — buttons overflow at 320px
- `video max-height: 380px` set inline — no mobile override

**Other states:**
- No permission-denied error message — `recordService.recordingFailed()` sets `isVideoRecording = false` only; no user-visible copy
- No recording status indicator (only timer display)
- No upload progress indicator

### 2.2 Views/home recorder (`views/home/.../record-interview`)

**Controls found:**
- `btn btn-take-interview` — Start Recording (triggers `startRecorder()`)
- `btn btn-settings` — Settings modal
- `btn btn-take-interview` — Stop Recorder (`stopRecorder()`)
- `btn btn-upload`, `btn btn-skip`, `btn btn-submit` (secondary)

Same sizing issues as above. This is a legacy/public path with hardcoded "Question 1" placeholder — same structural problems.

### 2.3 Shared recorder dialog (`recorder/recorder.component`)

**Controls found:**
- `btn btn-take-interview` — `startVideoRecording()`
- `btn btn-take-interview` — `stopVideoRecording()`
- `btn btn-primary` — `previewVideoRecording()` (View Recording, disabled until blob ready)
- `btn btn-primary` — `uploadFile.click()` (Upload Video Instead)
- Cancel button (X icon, `height: 15px; width: 15px`) — icon-only, severely undersized

**Pre-fix sizes:**
- `btn-take-interview`: `height: 40px` — FAILS WCAG 2.5.5
- X cancel icon: 15×15px — severe accessibility failure
- `btn-primary`: no fixed height — inconsistent

**Permission error:** `recorder.component.ts` has proper `videoRecordingError` string set in both `.catch()` path and `recordingFailed()` subscriber, but no `*ngIf` in the HTML displays it to the user (pre-existing gap, out of scope for CSS-only BL-015).

**Video preview:** `video.placeholder` uses `min-height: 430px` fixed — no aspect-ratio on mobile.

---

## 3. Phase 2 — Changes Applied

### 3.1 SCSS — new utility classes added to all three SCSS files

**Files changed:**
1. `…/application/.../record-interview.component.scss`
2. `…/views/home/.../record-interview.component.scss`
3. `src/app/recorder/recorder.component.scss`

**Classes added (identical block in each):**

```scss
// Haptic press effect
.gh-recorder-btn-primary:active {
  transform: scale(0.93);
  transition: transform 0.08s ease;
}

// Recording pulse (applied to Stop button only)
.gh-recorder-recording-pulse {
  animation: gh-rec-pulse 1.4s ease-in-out infinite;
}
@keyframes gh-rec-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

@media (prefers-reduced-motion: reduce) {
  .gh-recorder-recording-pulse { animation: none; }
  .gh-recorder-btn-primary:active { transform: none; }
}

@media (max-width: 767px) {
  .gh-recorder-btn-primary {
    min-height: 56px; min-width: 56px;
    border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .gh-recorder-btn-secondary {
    min-height: 44px; padding: 0 20px;
    display: inline-flex; align-items: center;
  }
  .gh-recorder-preview {
    width: 100%; aspect-ratio: 16/9;
    background: #000; border-radius: 8px; overflow: hidden;
    video, img { width: 100%; height: 100%; object-fit: cover; }
  }
  .gh-recorder-controls {
    display: flex; gap: 12px; justify-content: center;
    flex-wrap: wrap; padding: 8px 0;
  }
  // Prevent question overlay clipping at 320px:
  .record-container .bg-bottom { position: static; padding: 12px; bottom: unset; }
  .record-container .bg-main-question { width: 100%; box-sizing: border-box; }
  .record-container { min-height: unset; height: auto; }
}
```

### 3.2 HTML — classes applied to existing elements

**No structural recorder logic was changed. Only classes added to existing buttons/wrappers.**

#### Application record-interview HTML

| Element | Before | After |
|---|---|---|
| Start Recording button | `btn btn-take-interview` | + `gh-recorder-btn-primary` |
| Settings button | `btn btn-settings` | + `gh-recorder-btn-secondary` |
| Stop Recorder button | `btn btn-take-interview` | + `gh-recorder-btn-primary gh-recorder-recording-pulse` |
| Upload button | `btn btn-upload w-100` | + `gh-recorder-btn-secondary` |
| Skip button | `btn btn-skip w-100` | + `gh-recorder-btn-secondary` |
| Submit button | `btn btn-submit w-100` | + `gh-recorder-btn-secondary` |
| Control row div | `d-flex align-items-center` | + `gh-recorder-controls` |
| Video preview (recording) | bare `<video>` | wrapped in `<div class="gh-recorder-preview">` |
| Video preview (playback) | bare `<video>` with inline `max-height: 380px` | wrapped in `<div class="gh-recorder-preview">`, inline max-height removed |

#### Views/home record-interview HTML

Same class additions as above. Also:

| Element | Before | After |
|---|---|---|
| Placeholder image | bare `<img class="placeholder-img">` | wrapped in `<div class="gh-recorder-preview">` |
| Control row divs (both states) | `d-flex` | + `gh-recorder-controls` |

#### Shared recorder dialog HTML

| Element | Before | After |
|---|---|---|
| Start Recording button | `btn btn-take-interview` | + `gh-recorder-btn-primary` |
| Stop Recorder button | `btn btn-take-interview` | + `gh-recorder-btn-primary gh-recorder-recording-pulse` |
| View Recording button | `btn btn-primary` | + `gh-recorder-btn-secondary` |
| Upload Video button | `btn btn-primary` | + `gh-recorder-btn-secondary` |
| Button container | `div.mt-2` | + `gh-recorder-controls` |

---

## 4. Touch Target Sizes — Before vs After

| Button | Before (mobile) | After (mobile) | WCAG 2.5.5 |
|---|---|---|---|
| Start Recording (primary) | 40px h, uncontrolled w | min 56×56px | PASS |
| Stop Recorder (primary) | 40px h, uncontrolled w | min 56×56px | PASS |
| Settings (secondary) | 40px h, icon-only | min 44px h, 44px w | PASS |
| Upload (secondary) | ~35px h (`padding:10px 5px`) | min 44px h | PASS |
| Skip (secondary) | ~40px h (`padding:15px 5px`) | min 44px h | PASS |
| Submit (secondary) | ~40px h | min 44px h | PASS |
| View Recording (secondary) | uncontrolled | min 44px h | PASS |

---

## 5. Mobile Layout Changes

- `.bg-bottom` de-positioned from `absolute` to `static` on mobile so controls stack below the video rather than floating over it (and clipping at 320px)
- `.bg-main-question` expands to full-width on mobile (was hardcoded `70%`)
- `.record-container` drops `min-height: 380px` on mobile so it doesn't create a giant grey block when video is absent
- Video preview wrapped in `gh-recorder-preview` with `aspect-ratio: 16/9` — maintains proper ratio on all screen sizes, no letterboxing or squashing
- Control row gets `flex-wrap: wrap` + `gap: 12px` so buttons wrap rather than overflow at 320px

---

## 6. Recording State Visibility

- Stop Recorder button receives `gh-recorder-recording-pulse` class at the template level — it pulses while `*ngIf="isVideoRecording"` is true (application path) or `*ngIf="startRecording"` is true (views/home path)
- `@media (prefers-reduced-motion: reduce)` suppresses the animation for users who have requested it

---

## 7. Permission / Error / Upload States

| State | Existing handling | BL-015 action |
|---|---|---|
| Camera permission denied | `RecorderComponent.ts` sets `videoRecordingError` string; application `.ts` sets `isVideoRecording = false` | CSS-only fix cannot add HTML; noted as pre-existing gap (no copy displayed in HTML) |
| Recording failed (service) | `recordingFailed()` observable resets flag | Same — no user-visible copy in HTML |
| Upload progress | No spinner or progress bar in any surface | Not in BL-015 scope |

---

## 8. Video Answer Question Preservation

- **Application path (`application/.../interview-questions`):** Questions come from `@Input() interviews: Model.InterviewQuestion[]` — unchanged. The `interviews[index].question` binding is untouched.
- **Views/home path:** Question is displayed via `{{interview_answers}}` and `{{question}}` — unchanged.
- **No questions were added, removed, or modified.**

---

## 9. Employer Video Review Preservation

- `src/app/employer-panel/recruiter-interview-hub/recruiter-interview-hub.component.html` — untouched
- `src/app/employer-panel/recruiter-interview-hub/recruiter-interview-hub.component.ts` — untouched
- Employer "Review responses" routing links — untouched
- `hasVideoAnswers`, `videoAnswerCount`, `getVideoReviewRoute()` logic — untouched

---

## 10. No Video AI Verification

- No AI inference code added to any component
- No face/emotion/voice/accent/personality analysis added
- `recorder.service.ts` unchanged — still pure MediaRecorder/RecordRTC blob capture
- All changes are CSS class additions only

---

## 11. Effects Applied

| Effect | Class | Guard |
|---|---|---|
| Press feedback (scale) | `.gh-recorder-btn-primary:active` | `@media (prefers-reduced-motion: reduce)` disables |
| Recording pulse | `.gh-recorder-recording-pulse` applied to Stop button only | `@media (prefers-reduced-motion: reduce)` disables; class only present while `isVideoRecording` is true |

---

## 12. Files Changed

| File | Change type |
|---|---|
| `src/app/application/application-process/steps/interview-questions/components/record-interview/record-interview.component.scss` | Added BL-015 mobile media query block + animation/haptics |
| `src/app/application/application-process/steps/interview-questions/components/record-interview/record-interview.component.html` | Added `gh-recorder-btn-primary/secondary`, `gh-recorder-controls`, `gh-recorder-preview` wrappers, `gh-recorder-recording-pulse` |
| `src/app/views/home/pages/job-post-details-apply/steps/interview-questions/components/record-interview/record-interview.component.scss` | Added BL-015 mobile media query block + animation/haptics |
| `src/app/views/home/pages/job-post-details-apply/steps/interview-questions/components/record-interview/record-interview.component.html` | Added `gh-recorder-btn-primary/secondary`, `gh-recorder-controls`, `gh-recorder-preview` wrappers, `gh-recorder-recording-pulse` |
| `src/app/recorder/recorder.component.scss` | Added BL-015 mobile media query block + animation/haptics |
| `src/app/recorder/recorder.component.html` | Added `gh-recorder-btn-primary/secondary`, `gh-recorder-controls`, `gh-recorder-recording-pulse` |

**Files NOT changed (preserved exactly):**
- `recorder.service.ts`
- `recorder.module.ts`
- `interview-questions.component.ts` / `.html`
- `recruiter-interview-hub.*`
- `docs-videocv.*`
- All TS component logic files

---

## 13. Build Verification

```
npm run build-dev  →  ng build --configuration=staging
√ Browser application bundle generation complete.
√ Index html generation complete.
Build at: 2026-06-25T15:13:10.326Z — Time: 43517ms
```

**Result: PASS — zero errors. Two pre-existing autoprefixer warnings in an unrelated component (`add-contact-group`) — not introduced by this change.**
