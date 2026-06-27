# GETHIRED DASHBOARD BRAND — Effects Library

**Scope:** All visual effects on `/recruiter/dashboard`

---

## Effect 1 — Hero Ambient Mesh (existing)

**Element:** `.gh-hero-mesh`

**Type:** CSS radial-gradient background, `aria-hidden="true"`, `pointer-events: none`

**Definition:**
```scss
background:
  radial-gradient(ellipse 60% 60% at 80% 50%, rgba(254,111,97,0.12) 0%, transparent 70%),
  radial-gradient(ellipse 40% 50% at 20% 80%, rgba(91,70,189,0.15) 0%, transparent 70%);
```

**Effect:** Coral glow on the right side of the hero, purple glow on the lower-left. Creates depth and brand colour without being distracting.

**Motion:** None — static gradient. Future enhancement: subtle CSS animation from subtle to refined on data load (deferred to backlog).

---

## Effect 2 — Skeleton Shimmer (existing)

**Element:** All `%sk` extended classes

**Type:** `background-position` animation on a gradient

**Definition:**
```scss
@keyframes gh-shimmer {
  0%   { background-position: -800px 0; }
  100% { background-position:  800px 0; }
}

background: linear-gradient(90deg, #f0edf8 25%, #e6e2f2 50%, #f0edf8 75%);
background-size: 1600px 100%;
animation: gh-shimmer 1.4s ease-in-out infinite;
```

**Effect:** Wave of lighter colour moves left-to-right across placeholder shapes, communicating loading without a spinner.

**Reduced motion:** `animation: none; background: #f0edf8` — static solid lavender, no movement.

---

## Effect 3 — Card Entrance Reveal (existing)

**Element:** `.gh-card`, `.gh-inbox-main`, `.gh-inbox-card`, `.gh-kpi-card`, `.gh-hero`, `.gh-dash-error-panel`

**Type:** opacity + translateY

**Definition:**
```scss
@keyframes gh-reveal {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
animation: gh-reveal 0.4s $motion-ease-standard both;
```

**Effect:** Each card fades up from 10px below its final position. Creates a sense of content materialising from below.

---

## Effect 4 — KPI Card Entrance Stagger (NEW — this pass)

**Element:** `.gh-kpi-strip > *:nth-child(1–8)`

**Type:** `animation-delay` on existing `gh-reveal` animation

**Effect:** The 8 KPI cards don't all appear simultaneously — they cascade from 0ms to 210ms. Visual impression: cards populating one after another from left to right.

---

## Effect 5 — Inbox Card Entrance Stagger (NEW — this pass)

**Element:** `.gh-inbox-cards .gh-inbox-card:nth-child(1–4)`

**Type:** `animation-delay` (50ms steps) on existing `gh-reveal` animation

**Effect:** Supporting action cards in the 2×2 inbox grid appear in sequence rather than simultaneously.

---

## Effect 6 — SVG Ring Fill Animation (NEW — this pass)

**Elements:** `.gh-profile-ring svg circle:last-child`, `.gh-profile-comp-ring svg circle:last-child`

**Type:** `stroke-dashoffset` keyframe animation

**Definitions:**
```scss
@keyframes gh-ring-hero-fill { from { stroke-dashoffset: 188.5; } }
@keyframes gh-ring-comp-fill { from { stroke-dashoffset: 213.6; } }
```

**Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — spring (overshoot curve for natural deceleration)

**Effect:** The donut rings appear to draw themselves from empty (fully undrawn) to the current percentage value. The "from" is always 100% empty (dashoffset = circumference); the "to" is the inline style value set by Angular binding. `animation-fill-mode: both` ensures the ring starts at empty on the first frame.

**Technical constraint:** Required `[attr.stroke-dashoffset]` → `[style.stroke-dashoffset]` migration for CSS animations to animate from the keyframe to the inline style target.

---

## Effect 7 — Bar Grow Animation (NEW — this pass)

**Elements:** Pipeline bars (active), branding bar, subscription meter fills, insight bars

**Type:** `width` keyframe animation

**Definition:**
```scss
@keyframes gh-bar-grow { from { width: 0; } }
```

**Effect:** Each bar appears to grow from the left edge to its final width on first render. Existing `transition: width 600ms` handles subsequent reactive updates.

**Duration variation by context:**
- Pipeline: 600ms (quick, data-dense section)
- Branding: 700ms (slower — single prominent bar, premium feel)
- Subscription meters: 650ms (mid)
- Insight bars: 600ms (fast)

---

## Effect 8 — Button Press Scale (existing, from _motion.scss)

**Element:** Any `.gh-pressable` on `:active`

**Type:** CSS `transform: scale(...)` from `_motion.scss`

**Effect:** Immediate tactile press-down feedback on click/tap.

---

## Effect 9 — Hire Health + Branding Chip Colour System (existing)

**Elements:** `.gh-chip`, `.gh-chip--good/warn/poor/plan/neutral`

**Type:** Background colour + border-colour variants

**Effect:** Hiring health, plan, and branding health chips use colour to communicate status at a glance — no text parsing required.

---

## Effect 10 — KPI/Table Row Hover Lift (existing)

**Elements:** Interactive KPI cards, inbox cards, table rows

**Type:** `box-shadow` + `transform: translateY(-2px)` on hover

**Effect:** Cards appear to lift off the surface on hover, confirming interactivity.
