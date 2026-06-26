# GETHIRED_HOME_TRUST_SAFETY_SPEC
> Trust & Safety section specification for GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## Purpose
Build applicant and employer confidence by being transparent about what GetHired does and does not do. Especially important for:
- Job seekers concerned about automated rejection
- Employers concerned about AI decision liability
- Philippine job market context where hiring intermediaries are sometimes opaque

## Cards

### Card 1: Guidance, not automatic decisions
- **Icon:** 🛡️ (U+1F6E1, Shield)
- **Body:** Compatibility signals support review — they never auto-screen, auto-rank, or replace people in the hiring process.
- **Source:** Verified against MATCH system behavior — signals are displayed to employers as guidance only; no automated shortlisting or rejection flow exists

### Card 2: Video answers reviewed by real people
- **Icon:** 👥 (U+1F465, Silhouettes)
- **Body:** When employers review video answers, real hiring team members watch them. No automated decisions from video content.
- **Source:** Confirmed against VideoCV + MATCH system — no facial analysis, no automated sentiment scoring, no voice analysis. RecordRTC → Firebase Storage → employer playback only.

### Card 3: Structured data, clearer review
- **Icon:** 📋 (U+1F4CB, Clipboard)
- **Body:** Organized profiles, CVs, and application data make it easier for employers to compare candidates with full context.
- **Source:** Accurate description of the applicant profile + document upload system

### Card 4: Built for Philippine hiring
- **Icon:** 🇵🇭 (PH flag emoji)
- **Body:** GetHired is designed for the Philippine job market, connecting local job seekers and employers in one organized workspace.
- **Source:** Product scope verified; platform targets Philippine market (confirmed in SWEEP findings)

## Claims audit
- No guaranteed outcomes
- No "AI-powered" claims that could imply automated decision-making
- No testimonials or social proof from real users
- No automated screening claims

## Analytics
- `trust_safety_section_viewed { page: 'home' }` via `(revealed)` event

## Layout
- 4-column grid at 992px+
- 2-column at 576px–991px
- 1-column at <576px
