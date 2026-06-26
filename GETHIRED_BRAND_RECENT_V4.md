# GETHIRED BRAND AUDIT — Recent Deployment (V4)

**Scope:** 4 commits · 7 files audited  
**Date:** 2026-06-26  
**Auditor:** Claude Code BRAND pass  
**Commits:** d3246b6 (status update flow) · 70bc592 · 172b2a9 · f9bc996 (main portal polish)

---

## 1. Status Picker Loading State (applicant-action-modal)

### Findings

| Check | Result |
|---|---|
| `statusUpdating = true` — spinner visible? | **FAIL** before fix; text-only "Updating…" with no spinner |
| Status buttons disabled while updating? | PASS — `[disabled]="statusUpdating"` was already present |
| Back button disabled while updating? | **FAIL** before fix — Back was always clickable, could navigate away mid-request |
| Visual feedback beyond post-hoc snackbar? | FAIL before fix; text only, no icon/spinner |
| Error state messaging? | PASS — error path calls snackBar with the server message or a fallback copy |
| Success state messaging? | PASS — snackBar fires with `Status updated to "X"` then dialog closes |
| Empty state (no applicationId)? | PASS — early return with "Application ID not found." snackbar |
| "Already has this status" guard? | PASS — early return with "Applicant already has this status." |
| Idempotent status guard communicates gracefully? | PASS — snackbar + close, no silent failure |

### Fixes Applied

**BRAND-FIX-2** (`applicant-action-modal.component.html`):  
Added `[disabled]="statusUpdating"` to the Back button. Previously the user could click Back during an in-flight PUT, navigating back to the action menu while the request was still pending — the snackbar then fired on the now-closed picker view with no matching UI context.

**BRAND-FIX-3** (`applicant-action-modal.component.html`):  
Replaced plain `Updating…` text with a Bootstrap `spinner-border spinner-border-sm` + `role="status"` wrapper. The spinner uses Bootstrap's existing CSS (no new dependency). `aria-hidden="true"` on the spinner itself + `role="status"` on the container ensures screen readers announce the loading state once without repeating the visual glyph.

Before:
```html
<div *ngIf="statusUpdating" class="text-center text-muted small mt-2">Updating&hellip;</div>
```

After:
```html
<div *ngIf="statusUpdating" class="text-center text-muted small mt-2" role="status">
  <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
  Updating&hellip;
</div>
```

---

## 2. Main Portal Motion Audit (main-portal.component.scss)

### `.portal-preview-tab` — Transition Check

The tab element had:
```scss
transition: border-color 150ms ease, color 150ms ease, background 150ms ease,
            box-shadow 150ms ease, transform 80ms ease;
```

`transform 80ms ease` covers the `:active { transform: scale(0.96) }` press state — the press animation IS smooth. No fix needed here.

### `prefers-reduced-motion` Coverage

| Animation / Transition | Reduced-motion covered? |
|---|---|
| `.portal-hero-copy` animation (portal-hero-reveal) | PASS — `animation: none; opacity: 1; transform: none` block present |
| `.portal-hero-visual` animation (portal-hero-reveal, 80ms delay) | PASS — same block |
| `.portal-reveal-section` scroll reveal transition | PASS — `transition: none; opacity: 1; transform: none` in reduced-motion block |
| `.portal-preview-tab` transform on `:active` | PARTIAL — `transform 80ms ease` is in the general transition; NO reduced-motion override for the tab's own transitions |
| `.gh-pressable` press scale on buttons | PASS — `@include motion-safe` is called inside `.gh-pressable` in `_motion.scss`, which sets `transition: none !important` |
| `.portal-usp-card` hover translateY in `_portal-common.scss` | PASS — wrapped in `@media (prefers-reduced-motion: no-preference)` block |
| `.btn-cta-primary` hover translateY in `_portal-common.scss` | PASS — wrapped in `@media (prefers-reduced-motion: no-preference)` block |
| `.btn-cta-outline` hover background tint | **FAIL before fix** — transition had no reduced-motion override |

### `.btn-cta-outline` Missing Transition

**BRAND-FIX-1** (`main-portal.component.scss`):  
`.btn-cta-outline` had hover/focus styles (`background: rgba(...)`) but no `transition` — the background tint snapped in immediately. Added:
```scss
transition: background 150ms ease;

@media (prefers-reduced-motion: reduce) {
  transition: none;
}
```

### Tab Transition — Panel Content Swap

Tab panels swap via `*ngIf` (Angular structural directive), which is an instant DOM replace — no CSS transition. This is correct BRAND behavior: animating between tabpanel content could be disorienting and is not required by WCAG. The tab button state itself (background/border/shadow) transitions smoothly via the existing 150ms ease values.

---

## 3. Tab Interaction Accessibility

### `:focus-visible` State

```scss
&:focus-visible {
  outline: 2px solid $color-global-red-buttons;
  outline-offset: 2px;
}
```
PASS — clear focus ring present. Uses `:focus-visible` (not `:focus`), so keyboard focus is visible without showing the ring on mouse click.

### ARIA Keyboard Pattern

PASS — `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, roving `tabindex` (0 / -1), and `onTabKeydown` implement ArrowLeft/ArrowRight/Home/End correctly. Focus is programmatically moved to the target button.

### P2 — Active Tab Contrast (Known Issue, Do Not Fix Without Design Approval)

Active tab state: `color: #fff` on `background: $color-global-red-buttons` (`#FF7062`).

Computed contrast ratio: approximately **2.7:1** (white on #FF7062).  
WCAG 2.1 AA requires **4.5:1** for normal text (13px 600-weight falls below the 18px/14px bold threshold for large-text treatment).

**This is a P2 issue.** The active tab is identifiable by both color AND text change (inactive tabs read as dark `#4b5563` on white; active reads as white on coral) so the color difference is supplementary — the tab state change is also announced via `aria-selected="true"`. The failure is purely a contrast ratio failure for the text within the active tab, not a sole-color-conveyance failure.

**Do not change `$color-global-red-buttons` or the active tab background without explicit design approval.** Options to address in a future pass (for design review):
- Darken the active tab background to ~`#E5503F` (contrast ~3.8:1 — still not AA, but improved)
- Use dark text `#1a1a1a` on a lighter coral tint for the active state
- Accept and document the deviation with a note in the a11y log

---

## 4. Image Error Handling — USP Icons

```html
<img ... (error)="$any($event.target).style.display='none'">
```

When SVG assets under `/assets/brand/gethired-wow/` fail to load:

- The `<img>` collapses to `display: none` — the card still renders with `<h3>` and `<p>` intact.
- The `.portal-usp-card` is `text-align: center` — removing the 48x48 icon leaves the card reading fine (title + description, both always present).
- No layout shift — the card does not have a reserved height for the icon slot, so it simply becomes shorter.

PASS — graceful degradation is in place. A future improvement (P3) would be to render a fallback icon via CSS `::before` content, but this is not required for launch.

The same error handler appears on the signals panel mock image:
```html
<img ... class="preview-signals-rings" (error)="$any($event.target).style.display='none'">
```
The signals card still shows `.preview-signals-label` and `.preview-signals-note` text below, so the panel remains informative. PASS.

---

## 5. Haptics Audit

`HapticFeedbackService.selection()` is called in `goToJobSeekerPortal()` and `goToEmployerPortal()`. Both are triggered by explicit user-initiated button clicks (role card CTAs).

No haptics on page load. No haptics on passive scroll events. PASS per BRAND safety rule: haptics only on user-initiated actions.

---

## 6. Motion Token File (`_motion.scss`)

The motion token file exists at `src/assets/styles/_motion.scss` and is imported in both `main-portal.component.scss` and `_portal-common.scss`.

| Token / Mixin | Purpose | Reduced-motion covered? |
|---|---|---|
| `$motion-duration-micro: 160ms` | Tab hover, chip interactions | Via `@include motion-safe` on `.gh-pressable` |
| `$motion-duration-card: 220ms` | Card enter | Callers' responsibility |
| `$motion-duration-drawer: 260ms` | Drawer/dialog | Callers' responsibility |
| `$motion-ease-standard` | All easing | Token only |
| `@mixin motion-safe` | Zaps `transition`+`animation` on reduce | PASS — well-authored |
| `@mixin ambient-motion-safe` | Zaps `animation` only (ambient) | PASS |
| `.gh-pressable` | Press scale 0.985 | PASS — `@include motion-safe` applied |
| `.gh-success-pulse` | Success burst 400ms | PASS — `@include motion-safe` applied |

No ambient/continuous animations (shimmer, pulsing loops) are used on the pages in scope. The `portal-hero-reveal` keyframe fires once on load and is covered by the reduced-motion block in `main-portal.component.scss`.

---

## 7. State Coverage Summary

### applicant-action-modal

| State | Before | After Fix |
|---|---|---|
| Loading (statusUpdating) | Text-only, Back still clickable | Spinner + text, Back disabled |
| Error | Snackbar with server message or fallback | Unchanged (PASS) |
| Success | Snackbar + dialog close | Unchanged (PASS) |
| Empty (no applicationId) | Snackbar early return | Unchanged (PASS) |
| Already-same-status | Snackbar early return | Unchanged (PASS) |

### main-portal (public page)

| State | Coverage |
|---|---|
| Page loading | Redirect-if-logged-in in ngOnInit; no loading skeleton (acceptable — this is a static marketing page) |
| Error (USP icons fail) | display:none graceful collapse — PASS |
| Error (signals SVG fails) | display:none graceful collapse — PASS |
| Empty (no jobs data) | Not applicable — page is fully static, no live data fetches |
| Success (CTA clicked) | Router navigation — no success state needed |

---

## 8. Fixes Applied (Summary)

| Fix ID | File | Change |
|---|---|---|
| BRAND-FIX-1 | `main-portal.component.scss` | Added `transition: background 150ms ease` + `prefers-reduced-motion: reduce { transition: none }` to `.btn-cta-outline` |
| BRAND-FIX-2 | `applicant-action-modal.component.html` | Added `[disabled]="statusUpdating"` to Back button |
| BRAND-FIX-3 | `applicant-action-modal.component.html` | Replaced plain "Updating…" text with Bootstrap spinner + `role="status"` for screen-reader announcement |

---

## 9. Recommended (Not Applied — Need Design/Dev Decision)

| ID | File | Recommendation | Priority |
|---|---|---|---|
| REC-1 | `main-portal.component.scss` | `.portal-preview-tab` transitions are not explicitly covered by `prefers-reduced-motion: reduce` — the `:active` scale and hover border/color/background will still transition. Add `@media (prefers-reduced-motion: reduce) { .portal-preview-tab { transition: none; } }` inside the existing reduced-motion block. | P2 |
| REC-2 | `applicant-action-modal.component.scss` | `.side-sub-menu-container:hover img { transition: transform 0.4s ease }` is defined on the hover rule only, not the base element — means the exit transition (hover-off) is instant (no reverse transition). Move `transition` to the base `img` rule for a smooth hover-off. | P3 |
| REC-3 | (Design review) | Active tab WCAG contrast issue (~2.7:1). Document in a11y log. No CSS change without design approval. | P2 |
| REC-4 | `main-portal.component.scss` | `.portal-preview-tab` has no `cursor: pointer` on `:active` — already has it at default level. Confirm cursor does not revert during press. | P3 |

---

## 10. Release Gate

**GO WITH CAUTION**

All blocking issues found in scope are fixed (BRAND-FIX-1, -2, -3). No regressions introduced — all changes are additive (CSS transition addition, HTML attribute binding, HTML element addition using existing Bootstrap classes).

Caution items (non-blocking):

1. **P2 — Active tab contrast (~2.7:1):** Does not trigger a NO-GO because tab state is also indicated by `aria-selected`, text color change, and border change. The contrast failure is the WCAG text-contrast ratio, not a sole-color-conveyance failure. Needs design review before the next a11y audit.

2. **P2 — `.portal-preview-tab` transitions not fully guarded:** Tab hover color/border transitions still run under `prefers-reduced-motion: reduce`. Functionally harmless (hover border/color tint at 150ms is not vestibular-risk motion), but is technically out of spec. Fix in next BRAND pass with REC-1.

3. **P3 — Hover-off flicker on `.side-sub-menu-container img`:** Existing behavior, not introduced by recent commits. Flag for cleanup.
