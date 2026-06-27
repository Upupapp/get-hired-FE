# GETHIRED BRAND — Release Gate (Phase 21)
**BRAND v6 · 2026-06-27**

---

## Gate A — State Coverage

| Criterion | Status | Evidence | Blocker |
|---|---|---|---|
| All page states have defined patterns | PASS | 30 states documented in State Experience System | — |
| Employer dashboard V5 states: all covered | PASS | BRAND_DASHBOARD_REPORT.md; hero/action/KPI/pipeline/branding/subscription all present | — |
| Applicant flow states documented | PASS | Screen audit + state system | — |
| Error pages defined (404/403/401/500) | DOCUMENTED | Defined in Error System; implementation deferred to BACKLOG | Implement before next major deploy |
| Loading states: no blank screens possible | PARTIAL | Dashboard skeleton present; public job list still uses GIF spinner | P2 backlog item |

**Gate A Result: PASS WITH NOTES** — critical employer dashboard states covered; public loading P2 backlog.

---

## Gate B — Brand Fit

| Criterion | Status | Evidence |
|---|---|---|
| Visual direction documented | PASS | VISUAL_DIRECTION.md complete |
| Copy follows tone guide | PASS | UX_COPY_GUIDE.md complete; all example copy reviewed |
| No fake AI, urgency, activity | PASS | Hard rule enforced throughout; no fake data in any spec |
| Employer dashboard matches approved visual basis | PASS | V5 live at cba5120; audit confirms alignment |
| CV Doctor / CV Health naming correct | PASS | Used consistently throughout all docs |
| Employer branding direction covered | PASS | Company profile states / branding health documented |
| Subscription / plan health direction covered | PASS | Plan health states, loading, error all documented |
| No confetti / false hiring signals | PASS | Explicitly forbidden in success system |

**Gate B Result: PASS**

---

## Gate C — Behaviour Preservation

| Criterion | Status | Evidence |
|---|---|---|
| No routing changes | PASS | Zero routing changes in this pass |
| No API changes | PASS | Zero API changes |
| No component logic changes | PASS | Only haptic service additions (additive, not breaking) |
| Existing animations preserved | PASS | `_motion.scss` extends; original tokens/classes untouched |
| Job posting flow intact | PASS | No changes to job-create/edit components |
| Applicant review flow intact | PASS | Applicant-action-modal fixes (V4) already merged; no new changes |
| Application flow intact | PASS | No changes to application-process components |
| Video answer / recording intact | PASS | No changes to record-interview components |
| Subscription / billing gates intact | PASS | No changes |
| CV upload / analysis flow intact | PASS | No changes to CV builder components |

**Gate C Result: PASS**

---

## Gate D — Accessibility

| Criterion | Status | Evidence |
|---|---|---|
| `prefers-reduced-motion` covered globally | PASS | styles.scss global block + _motion.scss block + new v6 block |
| All new BRAND classes suppressed under reduced motion | PASS | `@media (prefers-reduced-motion: reduce)` block in _motion.scss covers all v6 classes |
| Haptics gated on `respectReducedMotion()` | PASS | BRAND-V6-02 |
| Visible focus on all interactive elements | PARTIAL | Global `:focus-visible` present; needs verification per module |
| No colour-only meaning | PASS (spec) | PARTIAL verification — requires manual test |
| Touch targets ≥44px | PASS | Enforced via existing global styles |
| SR text for all animated states | DOCUMENTED | Implementation of SR text in templates deferred to backlog for non-dashboard screens |
| `role="alert"` / `role="status"` used correctly | DOCUMENTED | Pattern defined; implementation per-component varies |

**Gate D Result: GO WITH CAUTION** — accessibility spec complete; some per-component implementation is backlogged.

---

## Gate E — Haptics Safety

| Criterion | Status | Evidence |
|---|---|---|
| Haptics paired with visual | PASS | All haptic calls in spec are paired |
| Never on page load | PASS | Spec enforced; service is call-site controlled |
| Never on rejection/low-score | PASS | Explicitly forbidden in haptics spec |
| Never on background updates | PASS | Explicitly forbidden |
| `navigator.vibrate` check | PASS | `canVibrate()` method present |
| Fail silently | PASS | try/catch in `vibrate()` |
| `prefers-reduced-motion` gate | PASS | `respectReducedMotion()` added in BRAND-V6-02 |
| iOS / desktop non-support handled | PASS | `canVibrate()` returns false; no throw |

**Gate E Result: PASS**

---

## Gate F — Performance

| Criterion | Status | Evidence |
|---|---|---|
| No new heavy animation library | PASS | No Lottie/Rive/GSAP added |
| All animations use `transform`/`opacity` | MOSTLY PASS | Plan meter uses `width` (flagged) |
| No animated `box-shadow` loops | PASS | Publish glow is one-shot only |
| No JS animation loops | PASS | All animations CSS-driven |
| CSS bundle addition ≤10KB | PASS | Estimated +5.5KB total |
| No new npm packages | PASS | — |

**Gate F Result: PASS** — plan meter `width` animation flagged as technical debt; low risk at current scale.

---

## Gate G — Product Trust

| Criterion | Status | Evidence |
|---|---|---|
| No fake plan limits | PASS | Spec explicitly forbids it |
| No fake match scores | PASS | Spec explicitly forbids it |
| No fake CV Doctor results | PASS | Spec explicitly forbids it |
| No fake applicant/recruiter interest | PASS | Spec explicitly forbids it |
| No fake AI framing | PASS | Copy guide: "Reading your CV…" not "AI analysing…" |
| No fake urgency | PASS | No countdown timers without real data |
| No fabricated hiring signals | PASS | Success copy never implies hiring outcome |

**Gate G Result: PASS**

---

## Gate H — Recovery

| Criterion | Status | Evidence |
|---|---|---|
| All error states have retry | PARTIALLY | Dashboard section errors have retry; some public/applicant screens don't yet |
| Offline state handled | DOCUMENTED | Pattern defined; banner implementation deferred |
| Form data preserved on error/offline | DOCUMENTED | Pattern defined; `sessionStorage` implementation deferred |
| Timeout states handled | DOCUMENTED | 10–15s timeout defined; per-component implementation deferred |
| Session expiry redirects to login | PARTIAL | HTTP interceptor handles 401; SR message deferred |

**Gate H Result: GO WITH CAUTION** — critical recovery paths documented; implementation of offline banner, sessionStorage, and timeout states deferred to backlog.

---

## Final Release Gate Result

```
Gate A — State Coverage:         PASS WITH NOTES
Gate B — Brand Fit:              PASS
Gate C — Behaviour Preservation: PASS
Gate D — Accessibility:          GO WITH CAUTION
Gate E — Haptics Safety:         PASS
Gate F — Performance:            PASS
Gate G — Product Trust:          PASS
Gate H — Recovery:               GO WITH CAUTION
```

**OVERALL RESULT: GO WITH CAUTION**

**Conditions:**
1. Resolve P1 backlog items before next major feature release: 404/403/401 error pages, CV Doctor step indicator, public job list skeleton wiring.
2. Manual SR test of focus management and `aria-live` regions before accessibility-critical features ship.
3. Offline banner implementation recommended before launch marketing push.
4. KPI countup `prefers-reduced-motion` JS check required before implementing countup.
