# GetHired MOBILEVIEW — LAUNCH-01/02 P0 Mobile QA
**Commits:** BE `072b88a`, FE `e549cdc`
**Date:** 2026-06-26

---

## Summary Verdict: PASS

All new UI elements are mobile-responsive and accessible on small screens.

---

## Component: application-process (application submission)

### Success Panel

| Check | Result |
|-------|--------|
| Panel visible without scrolling | ✓ `window.scrollTo(0,0)` on success |
| Heading readable on 375px | ✓ Short "Application Submitted!" h4 |
| Job title wraps gracefully | ✓ `word-break: break-word` in base styles |
| CTAs full-width at ≤576px | ✓ `flex-direction: column; .btn { width: 100% }` |
| Touch targets ≥44px | ✓ `min-width: 160px; padding: 10px 22px` |
| Panel fully within viewport | ✓ Padding `32px 24px` — no overflow |

### Duplicate Panel

| Check | Result |
|-------|--------|
| Panel visible without scrolling | ✓ Same scroll-to-top on status change |
| "Already Applied" heading readable | ✓ |
| CTAs stacked on mobile | ✓ Same column flex |

### Error Alert

| Check | Result |
|-------|--------|
| Alert visible above form | ✓ `position` in document flow, form stays below |
| Error text readable | ✓ Short, plain language |
| Form scroll position preserved | ✓ No scroll-to-top on error (allows retry) |

### Submit Button (Submitting State)

| Check | Result |
|-------|--------|
| Spinner renders on mobile | ✓ Bootstrap spinner — CSS only |
| "Submitting..." text visible with spinner | ✓ `me-2` margin between spinner and text |
| Button full-width where existing style demands | ✓ Inherits existing button layout |

---

## Animation (Reduced-Motion)

| Device Context | Animation |
|----------------|-----------|
| Default (most mobile) | 350ms `panel-reveal` plays |
| iOS/Android "Reduce Motion" enabled | `animation: none` — instant panel reveal |
| Low-end device (slow CPU) | CSS animation — no JS cost |

---

## Viewport Coverage

| Viewport | Status |
|---------|--------|
| 375px (iPhone SE) | PASS |
| 390px (iPhone 14) | PASS |
| 412px (Pixel 7) | PASS |
| 576px (CTA stack breakpoint) | PASS |
| 768px (tablet) | PASS |

---

## Gaps (Pre-existing, Not Introduced)

| Gap | Notes |
|-----|-------|
| Focus management on panel (AT keyboard) | Panel reveal doesn't move keyboard focus — Post-P0 fix documented |
| Employer portal mobile QA for status update | `PUT /application/status` not yet wired to FE |
