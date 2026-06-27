# GETHIRED MOBILEVIEW — Video Interview QA V3
Generated: 2026-06-26

---

## Recorder Component (recorder.component.scss)

**Location:** `src/app/recorder/recorder.component.scss`
**Status:** BL-015 SHIPPED — mobile touch targets and layout present

### Mobile rules at max-width: 767px:
- `.gh-recorder-btn-primary`: min-height:56px, min-width:56px, border-radius:50%, inline-flex centered
- `.gh-recorder-btn-secondary`: min-height:44px, padding: 0 20px, inline-flex
- `.gh-recorder-preview`: width:100%, aspect-ratio:16/9, border-radius:8px, overflow:hidden
  - video inside: width/height:100%, object-fit:cover
- `.gh-recorder-controls`: flex, gap:12px, justify-content:center, flex-wrap:wrap, position:static!important
  - Overrides desktop absolute positioning so controls flow in document on mobile
- `.video-placeholder`: min-height:unset, aspect-ratio:16/9, width:100%

### Haptics / Motion:
- `.gh-recorder-btn-primary:active`: transform:scale(0.93), transition:0.08s
- `.gh-recorder-recording-pulse`: animation gh-rec-pulse 1.4s infinite (opacity 1→0.4→1)
- Reduced-motion: `gh-recorder-recording-pulse { animation:none }`, btn:active `{ transform:none }`

### Legacy styles (not yet migrated to gh-recorder-* classes):
- `.btn-take-interview`: height:40px — below 44px — AT RISK
  - This class is on the recorder component but does not use the new gh-recorder-* naming
  - Needs migration to gh-recorder-btn-secondary or explicit min-height: 44px
  - Added to backlog BL3-002

---

## Employer Interview Hub (/recruiter/interview-hub)

**recruiter-interview-hub.component.scss:** Not audited in detail.
**employer-interview.component.scss:** Empty (just @import colors).
Uses Bootstrap grid — expected single-column on mobile.

---

## Video in Job Cards / Detail Pages

- `.gh-recorder-preview video` and `video { border-radius:7px }` in recorder — responsive
- Global `img, video, iframe { max-width:100%; height:auto }` ensures no overflow

---

## Recording Flow (Mobile)

1. Applicant goes to interview questions
2. Recording controls displayed via gh-recorder-controls (static position on mobile)
3. Primary record button: 56×56px circular — large tap target for key action
4. Secondary buttons (stop, retake): min-height:44px
5. Preview: aspect-ratio:16/9, full-width
6. Camera permission prompt: native browser dialog — outside FE control

---

## Issues Found

| ID | Component | Issue | Severity | Status |
|----|-----------|-------|----------|--------|
| VID-01 | recorder | .btn-take-interview height:40px, below 44px | Medium | Backlog BL3-002 |
| VID-02 | employer-interview-hub | Not audited | Low | Deferred V4 |
| VID-03 | recorder | Old .btn-primary override in recorder.component.scss conflicts with global .btn-primary min-height | Low | Monitor |
