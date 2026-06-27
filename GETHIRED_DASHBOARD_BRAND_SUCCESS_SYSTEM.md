# GETHIRED DASHBOARD BRAND — Success System

**Scope:** Success states on `/recruiter/dashboard`

---

## Overview

The dashboard is a **read-only data view** — it displays aggregated hiring state but does not initiate mutations (no forms, no saves, no deletes). Therefore there are no post-action success toasts or confirmation states originating from this page. Success is expressed as **ambient completion states**: sections that visually communicate a healthy or complete condition.

---

## Success State 1 — Profile Complete Ring (Hero)

**Condition:** `cachedProfilePct >= 100`

**Visual changes:**
- Ring fill: 100% coral donut (full circle)
- Sub-text changes: `gh-profile-ring-sub--done` → "Profile complete!" in `#86efac` (green)
- "Complete profile →" link button hides (`*ngIf="cachedProfilePct < 100"`)
- "Complete profile" hero CTA ghost button hides

**A11y:** `aria-label="Profile completeness: 100%"` on the group element.

---

## Success State 2 — All Caught Up (Action Inbox)

**Condition:** `cachedRecommendedStep.type === 'all_caught_up'` and `cachedSupportingActions.length === 0`

**Visual changes (main card):**
- Border: `rgba(34,197,94,0.35)` — green
- Background: `linear-gradient(135deg, #fff 60%, rgba(34,197,94,0.04) 100%)` — subtle green tint
- Priority class: `gh-inbox-main--success`
- No badge count
- No brand SVG (no image wired to `all_caught_up` type — intentional blank space)
- Title: "All caught up"
- Reason: "Your hiring workspace has no urgent tasks right now. Keep it up!"
- CTA: "View jobs →"

**Visual changes (supporting cards area):**
- `gh-inbox-all-clear` renders: green-tinted bar with checkmark icon and "You're all caught up. No urgent actions right now."

---

## Success State 3 — Employer Branding Complete

**Condition:** `branding.missing.length === 0` (all 6 branding fields filled)

**Visual changes (branding health card):**
- Score chip: `gh-chip--good` → green tinted
- Score number: `gh-branding-score--good` → `$gh-green` colour
- Bar: `gh-branding-bar--good` → green fill (`$gh-green`)
- Body copy: "You're building a strong brand!" (positive reinforcement)
- Missing chips section: hidden (`*ngIf="branding.missing.length > 0"` → false)
- Completion text: `gh-branding-done` → "Your employer profile is complete. Candidates see your best face." (green)
- CTA: changes to "View company profile →"

---

## Success State 4 — Profile Completeness Complete

**Condition:** `cachedProfilePct >= 100`

**Visual changes (profile completeness health card):**
- Chip: `gh-chip--good` → "Complete" in green
- Ring fill: full `$gh-green` circle (ring stroke changes to `#22c55e`)
- All 6 checklist items show `gh-profile-check--done` with green ✓
- CTA: "View profile →" (instead of "Complete profile →")

---

## Success State 5 — Subscription Healthy

**Condition:** `subs.isPaid === true` and all meters below 80%

**Visual changes (subscription card):**
- Chip: `gh-chip--good` → plan name in green
- All 3 meter fills: `$gh-purple` (no warn/danger class)
- Renew date shown in muted grey
- CTA: "Manage plan →"

No explicit "all good" panel — healthy subscription communicates itself through the absence of warning colours.

---

## Success Animation

No dedicated success animation was added in this pass. The existing `gh-success-pulse` class (from `_motion.scss`) is available for future use when post-mutation success states are added (e.g., after posting a job from this page). See `GETHIRED_DASHBOARD_BRAND_BACKLOG.md` for the deferred upgrade CTA / success flash item.
