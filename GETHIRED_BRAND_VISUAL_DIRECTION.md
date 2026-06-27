# GETHIRED BRAND — Visual Direction System (Phase 1)
**BRAND v6 · 2026-06-27**

---

## Brand Personality

GetHired feels: modern, techy, advanced, fast, precise, clean, trustworthy, applicant-friendly, recruiter-friendly, employer-friendly, professional, guided, premium-but-not-flashy, responsive, high-tech-but-human, simple-even-when-powerful.

GetHired must NOT feel: childish, gimmicky, noisy, slow, cluttered, casino-like, cyberpunk-overload, over-animated, manipulative, confusing, inaccessible, emotionally pressuring, fake-AI, fake-activity, fake-urgency, visually exhausting.

---

## Brand Promise Statement

"Every state gives clear, modern feedback. Every movement has a purpose. Every loading, success, error, and fallback moment reinforces that GetHired is advanced, reliable, and simple."

---

## Core Colour Surfaces

| Surface | Value | Usage |
|---|---|---|
| Dark navy hero | `#1a1830` | Employer dashboard hero, sidebar background |
| Deep purple mid | `#2a2348` | Sidebar gradient, hero overlays |
| Coral primary | `#FF7062` | CTAs, active states, accents |
| Coral hover | `rgba(#FF7062, 0.9)` | Button hover, link hover |
| Page background | `#f4f5f9` | All authenticated page backgrounds |
| Card background | `#ffffff` | All content cards |
| Border subtle | `#ebe7f5` | Card borders, section dividers |
| Text primary | `#1a1830` | Body/heading text |
| Text secondary | `#6b6887` | Sub-labels, helper text |
| Text muted | `rgba(255,255,255,0.6)` | Sidebar secondary text |
| Pipeline accent | `#7c83fd` | Pipeline bars, avatar gradients |
| Teal accent | `#2dd4bf` | Avatar gradient, success secondary |
| Success green | `#04A08B` | Success indicators |
| Warning amber | `#b45309` | Warning states (a11y: 5.02:1) |
| Error red | `#C0392B` | Error states (a11y: 5.14:1) |
| Analytics purple | `#7c83fd` | Charts, analytics elements |

---

## Approved Employer Dashboard Visual Basis (V5, commit cba5120)

The approved north-star employer dashboard is a modern SaaS command-center. Key visual elements that are LIVE and must be preserved:

**Hero section:** dark navy/purple gradient (`#1a1830` → `#2a2348`), coral CTAs, greeting with avatar initials ring, animated SVG hero-ring with profile completeness, `emp-hero-reveal` animation on entry.

**Action Center / Recommended Next Step:** Grid of action cards — high-priority highlighted with coral border/accent. Empty state: "You're all caught up." Pipeline error state: retry button.

**KPI Strip:** Compact 4-card strip (Active Jobs, Total Applicants, Pending Review, Interviews). Numbers display real data; "Needs Review" card hidden while pipeline resolves.

**Hiring Pipeline:** Horizontal bar chart rail with animated `.gh-bar-grow`. Loading: `.emp-dash-pipeline-skeleton`. Error: retry card. Empty: `app-empty-section`.

**Job Performance (Jobs Awaiting Review):** Table-style rows per job showing applicant counts and review CTA. Hidden when `cachedJobGroups.length === 0`.

**Employer Branding Health:** Progress ring + missing-fields chips + CTA. Complete state: "Your company profile is complete." Entry: `emp-card-reveal` animation.

**Subscription / Plan Health:** Real plan badge, usage meters. Never fake plan limits or payment status.

**Sidebar (employer, V5):** `.gh-sidebar` — dark `#444152` background, 252px wide, `Gethired-horizontal-logo.png` (38px height, contain), inline SVG icons, `.gh-sidebar-footer` at bottom with user avatar/name/company, Manrope font.

**Topbar (employer, V5):** `.gh-employer-topbar` — 68px sticky, white background, coral accents.

---

## Applicant Experience Direction

- Clear progress at every stage of application
- CV Doctor loading: calm, stepwise — "Analysing your CV…" — no fake progress bars
- Profile readiness: factual completeness score only, no shaming zero states
- Errors: never accusatory; always offer next step
- Success: confirm what happened; never imply hiring outcome
- Empty states: explain why + guide first action

---

## Recruiter / Employer Direction

- Operational command center feel
- Clear next actions at all times
- Plan health always visible, never surprising
- Candidate pipeline clarity: every stage labelled
- Employer branding support: company profile completeness visible
- Error states: operational/informative, not alarming

---

## Admin Direction

- Clean operational interface
- No flashy motion — stability signals trust
- Data-heavy tables: calm, readable, no animation on rows
- Status messages: polite live regions, not urgent alerts

---

## Visual Guardrails (Hard Rules)

| Forbidden | Rationale |
|---|---|
| Fake AI activity (typing indicators, fake "analysing" without real process) | Damages trust |
| Fake urgency ("Only 3 slots left!" fabricated) | Manipulative |
| Fake applicant/recruiter interest signals | Dishonest |
| Cyberpunk / excessive glow on large surfaces | Visual noise |
| Large animated gradients that repaint constantly | Performance |
| Generic "No data available" empty states | Unhelpful |
| Broken zero states (numbers show null/undefined) | Brand damage |
| Confetti or celebrations implying hiring outcome | Misleading |
| Red pulsing loops on error states | Anxiety-inducing |
| Haptics on page load, scrolling, low scores | Intrusive |
| Color-only meaning (red = error with no text) | WCAG failure |

---

## Asset Reference

| Asset | Path | Usage |
|---|---|---|
| Horizontal logo | `src/assets/brand/Gethired-horizontal-logo.png` | Employer sidebar, primary identity |
| Square logo | `src/assets/brand/gethired-square-logo.png` | Favicon, icon-only contexts |
| Mesh gradient SVG | `src/assets/brand/gethired-wow/portal-gradient-mesh.svg` | Public portal hero background |
| Pipeline lines SVG | `src/assets/brand/gethired-wow/hiring-pipeline-lines.svg` | Empty state / decorative |
| Candidate profile card SVG | `src/assets/brand/gethired-wow/candidate-profile-card.svg` | Empty applicant states |
| Connection bridge SVG | `src/assets/brand/gethired-wow/gethired-connection-bridge.svg` | Zero-match empty states |
| Interview waveform SVG | `src/assets/brand/gethired-wow/interview-waveform.svg` | Interview empty states |
| Match signal rings SVG | `src/assets/brand/gethired-wow/match-signal-rings.svg` | Match/CV Doctor states |
| Video answer orb SVG | `src/assets/brand/gethired-wow/video-answer-orb.svg` | Video CV empty state |
| Video CV orb SVG | `src/assets/brand/video-cv-orb.svg` | CV upload empty |
