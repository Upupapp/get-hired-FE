# GETHIRED DASHBOARD BRAND — Visual Direction

**Scope:** `/recruiter/dashboard` employer command center

---

## Core Visual Theme

The dashboard uses a **dark navy hero / coral action / white card** system. The hero section establishes brand authority with a deep navy gradient (`#1a1830 → #2a2348 → #1e1b3a`) overlaid with a coral-tinted radial mesh. White cards on a light lavender-grey background (`#f4f5f9`) provide the data workspace.

---

## Section-by-Section Visual Structure

### Hero — Hiring Command Center
- Full-bleed dark gradient header with glassmorphism profile card (right)
- Ambient radial mesh: coral at 80% x (right glow), purple at 20% x (bottom-left glow)
- Company avatar (56×56, rounded 12px) with coral initial fallback
- White H1 company name, coral-tinted eyebrow text
- Coral CTA button, white outline secondary, ghost text tertiary
- Profile completeness ring: 96px SVG donut, coral fill, `88.5 * pct/100` dash math
- Hero chips: frosted-glass on dark (plan chip purple-tinted, health chip green/amber)

### Action Inbox
- Full-width section below hero on `#f4f5f9`
- Flex layout: large recommended-step card (left) + 2×2 supporting action grid (right)
- Main card: white, border highlights by priority (`--high` = coral border+glow, `--success` = green border)
- 3 wow SVG brand assets wired to action types
- Inlet card grid: white cards with coral urgent border variant

### KPI Strip
- Horizontal flex wrap of 8 cards, `flex: 1 1 130px`
- White cards, 14px border-radius, 26px bold metric numbers
- Colour-coded icon badges (8 distinct colours)
- No border between strip and insight grid — seamless white workspace

### Main Insight Grid (3-column)
- Views & Applications chart card: line chart + trend tabs (7d/30d/90d)
- Hiring Pipeline Health: stage bars in purple, grey for inactive stages
- Job Performance Table: compact table with status badges and review chips

### Employer Health Grid (3-column)
- Branding Health: 36px score number + colour-coded bar (green/amber/red)
- Profile Completeness: 80px SVG ring + 6-item checklist
- Subscription/Plan: 3 stacked meter bars (purple → amber → red progression)

### Candidate Insights (2-column)
- Top Cities: insight bar visualization (purple bars scaled to top city)
- Applicant Overview: 2×2 stat grid with large numbers

---

## Colour Usage

| Token | Hex | Usage |
|-------|-----|-------|
| `$gh-navy` | `#1a1830` | Hero gradient start, body text |
| `$gh-coral` | variable | Primary CTAs, urgent indicators, ring fill |
| `$gh-purple` | variable | Bar fills, plan chip, KPI purple icon |
| `$gh-green` | variable | Success states, good health chips |
| `$gh-amber` | `#f59e0b` | Warning states (>80% usage, needs attention) |
| `$gh-red` | `#ef4444` | Danger states (100% usage, poor branding score) |
| `$gh-bg` | `#f4f5f9` | Page background |
| `$gh-card-bg` | `#ffffff` | Card surfaces |
| `$gh-border` | `#ebe7f5` | Card borders, dividers |
| `$gh-muted` | `#6b6887` | Secondary text, labels |

---

## Typography Scale

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| Hero company name | 26px | 800 | H1 in hero |
| Section title | 16px | 700 | Section headings |
| Card title | 14px | 700 | Card headers |
| KPI number | 26px | 800 | Metric values |
| Branding score | 36px | 900 | Hero stat |
| Body | 13px | 400 | Descriptions |
| Label/eyebrow | 10–11px | 700 | Uppercase labels |

---

## Layout Principles

- Max content width: 1240px, centred, 28px side padding (16px mobile)
- 3-column at 1100px+, 2-column at 767–1100px, 1-column below 767px
- All cards use 16px border-radius (smaller cards: 12–14px)
- 16px gap between grid cells, 12px between KPI cards
- Consistent 22–24px card padding
