# GETHIRED_HOME_FAIR_HIRING_QA
> Fair hiring quality assurance for GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## What this audit checks

Does the homepage imply, suggest, or enable discriminatory hiring practices? Does it create false expectations about automated decision-making that could cause harm to job seekers?

## Trust & Safety section — QA

### Card: "Guidance, not automatic decisions"
- Explicitly states signals never auto-screen or auto-rank
- Protects job seekers from believing their application will be rejected by an algorithm without human review
- Accurate: confirmed by reading MATCH system code — no automated rejection pipeline exists

### Card: "Video answers reviewed by real people"
- Explicitly negates automated video analysis
- Protects job seekers from concerns about face/voice/accent scoring
- Accurate: VideoCV goes to Firebase Storage; employers watch via player; no automated analysis code in the codebase

### Card: "Structured data, clearer review"
- Frames structured profiles as a tool for employers, not as an automatic filtering layer
- Neutral framing

### Card: "Built for Philippine hiring"
- Geographic framing only; no discriminatory implication

## Product Preview — QA

### Compatibility Signals panel
- Includes explicit disclaimer: "Signals support decisions — they never replace them."
- Guidance framing: "Signals help teams understand candidate fit" — not "Signals automatically rank applicants"
- All three bullets describe signals as informational, not decisional

### Video Answers panel
- "Reviewed by real hiring team members" — human agency clearly stated
- "No automated decisions from video content" — in Trust section (not repeated in Preview, but no contradicting claim in Preview)

## Mock data review
- No demographic information in mock cards (no gender, age, nationality, religion, ethnicity)
- Mock names are generic abbreviated forms ("Maria D.", "Juan P.") — no inference of nationality, religion, or ethnicity beyond the Philippine context already stated
- Skill chips are professional competencies only

## Verdict: PASSED — no fair hiring concerns identified
