# GETHIRED DASHBOARD BRAND — Microinteractions Library

**Scope:** All microinteractions on `/recruiter/dashboard`

---

## Interaction 1 — KPI Card Hover/Lift (existing)

**Element:** `.gh-kpi-card:is(button)`

**Trigger:** `:hover` or `:focus-visible`

**Effect:**
```scss
box-shadow: 0 4px 18px rgba(26, 24, 48, 0.08);
transform: translateY(-2px);
outline: 2px solid rgba($gh-purple, 0.4);
outline-offset: 2px;
```

**Timing:** `transition: box-shadow $motion-duration-micro $motion-ease-standard, transform $motion-duration-micro $motion-ease-standard`

**Note:** Non-button KPI cards (`div.gh-kpi-card`) have `cursor: default` and no hover lift — only actionable cards lift.

---

## Interaction 2 — Inbox Action Card Hover/Lift (existing)

**Element:** `button.gh-inbox-card`

**Trigger:** `:hover` or `:focus-visible`

**Effect:**
```scss
box-shadow: 0 4px 18px rgba(26, 24, 48, 0.1);
transform: translateY(-2px);
outline: 2px solid $gh-coral;
outline-offset: 2px;
```

**Timing:** `transition: box-shadow $motion-duration-micro, transform $motion-duration-micro` (same ease)

---

## Interaction 3 — gh-pressable Button Press (existing)

**Element:** Any `.gh-pressable`

**Trigger:** `:active`

**Effect (from `_motion.scss`):** Scale down slightly, immediate feedback.

**Usage on dashboard:** All coral CTAs, white outline CTAs, ghost CTAs, inbox cards, KPI cards, job table review buttons.

---

## Interaction 4 — Trend Tab Active State (existing)

**Element:** `.gh-trend-tab--on`

**Trigger:** Click → `setTrendRange()` → class binding updates

**Effect:**
```scss
background: $gh-white;
color: $gh-text;
box-shadow: 0 1px 4px rgba(0,0,0,0.08);
```

**Note:** The tabs switch the `trendRange` state but currently do not filter the chart data — chart always shows the same data. Deferred to backlog.

---

## Interaction 5 — KPI Card Entrance Stagger (NEW — this pass)

**Element:** `.gh-kpi-strip > *` (all 8 KPI cards)

**Trigger:** Dashboard data loads, `ng-container` mounts all 8 cards simultaneously

**Effect:** Each card has `animation: gh-reveal 0.4s` (inherited from `.gh-kpi-card`). Stagger delays:
```scss
:nth-child(1) { animation-delay: 0ms; }
:nth-child(2) { animation-delay: 30ms; }
...
:nth-child(8) { animation-delay: 210ms; }
```

**Result:** Cards cascade in from left to right (visually), staggered by 30ms. Total sequence: 0–610ms (0ms start + 210ms delay + 400ms animation).

**Reduced motion:** Delays reset to `0ms !important`.

---

## Interaction 6 — Inbox Action Card Entrance Stagger (NEW — this pass)

**Element:** `.gh-inbox-cards .gh-inbox-card` (up to 4 supporting action cards)

**Trigger:** Pipeline data loads, action cards mount

**Effect:** Each card inherits `animation: gh-reveal 0.4s` from `.gh-inbox-card`. Stagger delays:
```scss
:nth-child(1) { animation-delay: 50ms; }
:nth-child(2) { animation-delay: 100ms; }
:nth-child(3) { animation-delay: 150ms; }
:nth-child(4) { animation-delay: 200ms; }
```

**Result:** Cards cascade in, 50ms steps. Total sequence: 50–600ms.

**Reduced motion:** Delays reset to `0ms !important`.

---

## Interaction 7 — SVG Ring Fill Animation (NEW — this pass)

**Elements:** `.gh-profile-ring svg circle:last-child`, `.gh-profile-comp-ring svg circle:last-child`

**Trigger:** Dashboard data loads, `stroke-dashoffset` is set via `[style.stroke-dashoffset]`

**Effect:**
```scss
animation: gh-ring-hero-fill 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
// from { stroke-dashoffset: 188.5; }   →   to: the bound inline style value
```

The ring appears to draw itself from empty (0%) to the current completeness percentage. Spring easing creates a natural deceleration.

**Technical note:** Uses `[style.stroke-dashoffset]` (not `[attr.stroke-dashoffset]`) so the CSS animation can reference the element's inline style as its "to" value via CSS `animation-fill-mode: both`.

**Reduced motion:** `animation: none !important`.

---

## Interaction 8 — Bar Grow Animation (NEW — this pass)

**Elements:** `.gh-pipeline-bar-fill--active`, `.gh-branding-bar`, `.gh-sub-meter-fill`, `.gh-insight-bar`

**Trigger:** Section data loads, `[style.width.%]` is set to the computed value

**Effect:**
```scss
animation: gh-bar-grow 600-700ms $motion-ease-standard both;
// from { width: 0; }   →   to: the bound inline style value
```

Each bar type has a slightly different duration:
- Pipeline bars: 600ms
- Branding bar: 700ms (slightly slower — premium feel for score)
- Subscription meters: 650ms
- Insight bars: 600ms

**Relationship to `transition: width`:** Both are declared. The `animation` (from `gh-bar-grow`) plays once on mount. The `transition` handles any subsequent width changes (e.g., if data updates without page reload). This is intentional — they serve different moments.

**Reduced motion:** `animation: none !important` on all 4 bar elements.
