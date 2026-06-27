# GETHIRED BRAND — Benchmark Research (Phase 2)
**BRAND v6 · 2026-06-27**

---

## Platform Benchmarks

### Material Design 3 (Google)
- **Pattern borrowed:** Emphasis hierarchy — primary/secondary/tertiary buttons with clear visual weight. Ripple on interactive elements (angular Material already present).
- **Borrow:** State layers (hover/pressed/focused overlays as opacity over base colour). Skeleton shimmer with gradient shift.
- **Avoid:** Heavy colour tinting of card surfaces — GetHired uses white cards, not tinted containers.
- **A11y note:** Material mandates 4.5:1 minimum on interactive elements. GetHired already meets this on primary coral via accessible red fallback (`#C0392B`).
- **Perf note:** Avoid Material ripple animations on every card row in large tables — too much paint.

### Apple Human Interface Guidelines
- **Borrow:** Haptics only on user-initiated moments. Clarity over cleverness — every animation has a reason. Layering / depth via shadow, not heavy colour.
- **Avoid:** iOS-specific patterns that don't translate to web (rubber-band scroll, spring physics on large surface transitions).
- **A11y note:** `prefers-reduced-motion` must disable all decorative motion, not just slow it down. Already implemented in GetHired global SCSS.

### IBM Carbon Design System
- **Borrow:** Structured skeleton loading — skeletons match the exact final layout. Inline loading states that don't hijack page. Error messages that explain cause and offer action.
- **Avoid:** Carbon's strict grey-scale card system — GetHired uses colour-accented cards for status signals.
- **A11y note:** Carbon's pattern for inline errors (field-level + form-level summary for long forms) should be adopted in GetHired form screens.

### Shopify Polaris
- **Borrow:** Toast taxonomy — only non-critical info in toasts; critical errors are persistent in-page. Empty states with illustration + headline + body + CTA.
- **Avoid:** Polaris's opinionated admin branding (green primary). GetHired is coral.
- **Relevance:** Employer dashboard has similar admin-tool patterns.

### Salesforce Lightning
- **Borrow:** Page-level error banners that persist above content. Record-level skeletons that match field layout exactly. Inline status badges with icon + text (never colour-only).
- **Avoid:** Heavy sidebar chrome — GetHired sidebar is intentionally lean.
- **A11y note:** Lightning uses `role="status"` for live updates. GetHired should adopt this for KPI updates and pipeline count changes.

### Atlassian Design System
- **Borrow:** Progressive loading — skeleton → real content without layout shift. Tab-panel animations limited to opacity, not position (avoids motion sickness).
- **Avoid:** Atlassian's overuse of modal dialogs for simple confirmations — snackbar/toast preferred for most GetHired success states.
- **Perf note:** Atlassian's token-based design reduces CSS bundle size by eliminating per-component hardcoded values — GetHired should move toward CSS custom properties (`_tokens.scss`).

### Microsoft Fluent 2
- **Borrow:** Mica/acrylic principles for sidebar — subtle depth via transparency, not aggressive gradients. Compact command bar (GetHired topbar).
- **Avoid:** Heavy blur effects on translucent surfaces — GPU expensive, not needed.
- **A11y note:** Fluent enforces visible focus on all interactive elements — `focus-visible` outlines are non-negotiable.

### GitHub Primer
- **Borrow:** Inline loading spinners that don't shift layout. Persistent error banners for auth/network failures. Compact, dense information display.
- **Relevance:** Admin panel patterns.

### GOV.UK Design System
- **Borrow:** Plain language in all error messages — specific, constructive, non-blaming. "Summary of errors" at top of long forms. Never generic "something went wrong".
- **A11y note:** GOV.UK's mandatory error-summary component is the gold standard for long-form validation UX. GetHired forms should adopt: field-level message + `<ul role="list">` summary at form top.

### ServiceNow / Modern SaaS Job Platforms
- **Borrow:** Command-center dashboard with KPI strip + action inbox pattern. Real-time counts that animate in on load (countup). Sidebar-nav that collapses to icons. Profile completeness rings.
- **Avoid:** Overloaded dashboards — GetHired should prioritise 1-3 primary actions per session, not 20+ widgets.

### WCAG 2.1 / 2.2
- **Required borrowings:** 4.5:1 body text contrast; 3:1 large text; 3:1 interactive element boundary. Visible focus indicator (non-outline method acceptable if equivalent). No flashing 3+ times per second. All non-text content has text alt. No colour as the only differentiator.
- **GetHired status:** Focus ring implemented globally. Contrast: primary coral on white fails at `#FF7062` (~3.1:1) — functional text must use accessible alternatives. Coral used as accent/background, not on text over white.

### Web Haptics (navigator.vibrate)
- **Borrow:** iOS/Android convention: 8–12ms for selection, 12–30ms for success/action, 30ms for warning, pattern `[pulse, gap, pulse]` for compound events.
- **Progressive enhancement only:** `navigator.vibrate` check required. Already implemented in `HapticFeedbackService`.
- **Avoid:** Haptics on page load, scroll, errors, low scores, repeated notifications.

---

## Required Conclusions (Binding for GetHired)

1. **Loading reduces uncertainty** — blank screens are never acceptable. Every loading state must render visible skeleton or progress in ≤100ms of trigger.
2. **Skeletons mimic final layout** — skeleton dimensions should match real content dimensions to prevent layout shift on reveal.
3. **Long processes need steppers** — CV Doctor scan and application submit need step-indicator progress, not a spinner alone.
4. **Empty states explain why + guide next** — "No jobs" must say why (e.g., no jobs posted) and what to do (e.g., Post your first job).
5. **Errors are specific, constructive, respectful, and persistent** — never auto-dismiss critical errors; never generic copy.
6. **Toasts never carry critical info alone** — application submitted confirmation must also appear on-page.
7. **Success confirms + guides next** — profile saved → "Profile saved." → "Preview your profile →"
8. **Haptics are subtle, optional, paired with visual** — never fire without a visible state change.
9. **Motion is brief, purposeful, reduced-motion-safe** — max useful duration: 400ms for transitions, 900ms for countup/chart fill.
10. **Never fake** — no fake activity, AI, urgency, recruiter interest, match scores, or effects implying a process happened when it didn't.
