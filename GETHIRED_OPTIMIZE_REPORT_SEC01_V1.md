# GetHired OPTIMIZE — SEC-01 Post-Deploy Cleanup
**Pass:** SEC-01 BOLA Fix — OPTIMIZE V1
**Date:** 2026-06-25
**Scope:** 5 FE TS files + 1 SCSS + 1 BE controller

---

## Checks Performed

### 1. Dead imports — FE TypeScript files

| File | Finding | Action |
|------|---------|--------|
| `applicant.service.ts` | `import { of } from 'rxjs'` — `of` is never called in the file body | **REMOVED** |
| `applicant.actions.ts` | `import * as InterviewModel from '@main/interview/interview.model'` — `InterviewModel` only appears in commented-out code; zero active references | **REMOVED** |
| `applicant.facade.ts` | `import * as InterviewModel from '@main/interview/interview.model'` — `InterviewModel` only appears inside a commented-out method; zero active references | **REMOVED** |
| `applicant.effects.ts` | No dead imports found. All imported symbols are used. | None |
| `applicant-panel.component.ts` | No dead imports found. All imported symbols are used. | None |

**Note:** `applicant.actions.ts` and `applicant.facade.ts` both imported `InterviewModel` for a now-commented block. These were pre-existing cruft exposed by the SEC-01 cleanup.

### 2. CSS — duplicate selectors / redundant declarations

- No duplicate selectors found in `applicant-profile-details.component.scss`.
- `.gh-profile-cta-btn` and `.gh-signin-cta` share similar flex layout declarations (`display:inline-flex; align-items:center; justify-content:center; cursor:pointer`). These are deliberate separate selectors for different semantic roles and are minor in size; consolidation would require a shared utility class and risks unintended side-effects. **Deferred** (not a regression, not introduced by SEC-01).
- `@media (prefers-reduced-motion: reduce) { transform: none; }` appears twice inside `:active` blocks (one each for `.gh-profile-cta-btn`/`.gh-profile-retry-btn` and `.gh-signin-cta`). These are redundant with the `@include motion-safe` already applied on the parent rule, but they are harmless overrides. Removing them could theoretically affect specificity. **Deferred.**

### 3. CSS — motion token compliance

All 7 new animation/transition declarations checked against `_motion.scss`:

| Selector / Keyframe | Duration used | Token? | Easing used | Token? |
|---|---|---|---|---|
| `gh-skeleton-shimmer` (on `.gh-profile-skeleton`) | `1.4s` | No token exists for skeleton shimmer | `ease-in-out` | No SCSS token | OK — shimmer is ambient/continuous; no appropriate token exists |
| `.gh-profile-card` | `240ms` | Close to `$motion-duration-card: 220ms` | `$motion-ease-decelerate` | Yes | Acceptable — 240ms is within the card spec range (180–280ms); within tolerance |
| `.gh-profile-error-banner` | `220ms` | `$motion-duration-card: 220ms` — exact match | `$motion-ease-decelerate` | Yes | Compliant |
| `.gh-session-expired-banner` | `240ms` | Within card range | `$motion-ease-decelerate` | Yes | Compliant |
| `.gh-profile-cta-btn`, `.gh-profile-retry-btn` transition | `100ms` | Below `$motion-duration-micro: 160ms` | `$motion-ease-standard` | Yes | 100ms for a press transition is intentional micro-interaction; within spirit of spec |
| `.gh-signin-cta` transition | `100ms` | Same as above | `$motion-ease-standard` | Yes | Compliant |

**Token drift note (non-blocking):** `.gh-profile-card` uses `240ms` rather than the literal `$motion-duration-card: 220ms` token. The value is within the spec range and is readable inline. Consider using `$motion-duration-card` in a future cleanup pass for strict token consistency. Not fixed here — the value is intentional and not a regression.

**Reduced-motion compliance:** All 7 effects are wrapped with `@include motion-safe` or `@include ambient-motion-safe`. Shimmer uses `ambient-motion-safe` (correct — it's a continuous background animation). Card/error/session reveals and button transitions use `motion-safe` (correct). Full compliance.

### 4. BE — `redactUid` helper extraction

`redactUid` is defined inline on lines 257–259 of `applicantsController.js` and is called exactly twice (lines 263 and 264) within the same `if` block. There are **no other call sites** anywhere in the BE codebase. Inline is the correct location. **No extraction performed.**

### 5. BE — console.warn vs console.error for security event

**Finding:** The UID mismatch security block at line 260 used `console.warn`. All other error/security events in this file use `console.error`. A mismatch detected and actively blocked (HTTP 403 returned) is a security event, not a warning.

**Fix applied:** Changed `console.warn` → `console.error` for `[SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH]`.

**Rationale:** Log aggregators (Logtail, Datadog, Papertrail) typically separate warn/error streams. BOLA attempt events should route to the error stream so alerts fire correctly. This does not change runtime behavior or security logic.

### 6. CSS performance — paint vs composite

| Property animated | Layer type | Verdict |
|---|---|---|
| `opacity` | Compositor-only | No paint |
| `transform: translateY()` | Compositor-only | No paint |
| `transform: scale()` | Compositor-only | No paint |
| `box-shadow` (transition on `.gh-profile-cta-btn`) | Triggers paint | Interaction-triggered only (not continuous) — acceptable |
| `background-color` (mobile active state) | Triggers paint | Touch-triggered only — acceptable |
| `background-position` (shimmer gradient) | Paint-driven (background-image) | Continuous on load, but skeleton is transient; no compositor path for gradient shimmer without `will-change`. Acceptable given skeleton is short-lived. |

All continuous (not interaction-triggered) animations use compositor-only properties except the gradient shimmer, which is unavoidable for a CSS-only approach. No `will-change` annotation needed given skeleton lifetime. No performance regressions introduced.

---

## Summary of Changes Applied

| File | Change |
|---|---|
| `get-hired-FE/src/app/applicant/applicant.service.ts` | Removed unused `import { of } from 'rxjs'` |
| `get-hired-FE/src/app/applicant/state/applicant.actions.ts` | Removed unused `import * as InterviewModel from '@main/interview/interview.model'` |
| `get-hired-FE/src/app/applicant/state/applicant.facade.ts` | Removed unused `import * as InterviewModel from '@main/interview/interview.model'` |
| `get-hired-BE/controllers/applicantsController.js` | Changed `console.warn` → `console.error` for SEC_01_APPLICANT_USERPROFILE_UID_MISMATCH security event |

**Security logic: untouched.** All BOLA checks, JWT derivation, 403 paths, and redaction logic are unchanged.

---

## Deferred (not fixed, not regressions)

| Item | Reason deferred |
|---|---|
| `$motion-duration-card` token not used inline for `240ms` values | Intentional and within spec range; cosmetic token alignment only |
| `.gh-profile-cta-btn` / `.gh-signin-cta` shared declarations | Minor, different semantic roles, consolidation needs a utility class and is out of this pass's scope |
| `@media(prefers-reduced-motion)` redundancy inside `:active` | Harmless belt-and-suspenders; touching specificity chain is risky for cosmetic gain |
| `const skillArr` and `const output` unused vars in BE | Pre-existing, not introduced by SEC-01; separate cleanup needed |
| `shimmer` animation not using a motion token | No shimmer token exists; adding one is a token system change, not a safe small fix |
