# GETHIRED SEO Copy / Claims Content QA V3

Generated: 2026-06-25

## Scope
Public pages: /home, /jobs, /job-seekers, /employers, /jobs/details/:id.

## Forbidden Claims Check

### ✅ PASS — No fake AI claims
No "AI-powered" claims found. Match signals are consistently described as:
- "Explainable compatibility signals" ✓
- "Decision-support, never automatic decisions" ✓  
- "Never automatically reject or hide applicants" ✓
- "Guidance, not automatic decisions" ✓

### ✅ PASS — No fake guarantees
No "Get hired in X days" or "100% job placement" or "guaranteed interview" claims found.

### ✅ PASS — No fake reviews or ratings
No user reviews, star ratings, or testimonials in public page templates.
`Job.companyRating` field exists in the Job model (`job.model.ts`) but is not displayed on the public job detail page.

### ✅ PASS — No fake employer logos
No hardcoded company logos or featured employer displays found in public page templates.

### ✅ PASS — No fake talent numbers
The "talent proof badge" (`app-talent-proof-badge`) is used on the homepage. This was confirmed as acceptable in a prior session — the copy says "thousands" or uses verified language. No "500,000 talent" claim appears in the template copy directly reviewed.

### ✅ PASS — No fake video AI claims
Video analysis explicitly NOT claimed:
- "Video answers reviewed by real people" ✓
- "Not used for facial, voice, accent, emotion, or personality scoring" ✓ (employer FAQ)

## Page-by-Page Copy Review

### /home
Key copy claims (from main-portal.component.ts and template):
- "Find your next job. Build your next team." ✓ (factual)
- "connects job seekers and employers through a modern platform" ✓ (factual)
- "Explainable match signals" with caveat "help teams understand fit without hiding decisions" ✓
- "Higher hiring confidence" — subjective but not a guarantee ✓

### /job-seekers
- "Some jobs include video questions" (not all) ✓
- "Compatibility signals are guidance, not automatic decisions" ✓
- FAQ: "Are compatibility signals final decisions? No." ✓
- FAQ: "Are video answers required for every job? No." ✓

### /employers
- "Match signals are decision-support indicators... do not automatically reject or hide applicants" ✓
- FAQ: "hiring decisions stay human-led" ✓
- FAQ: "Video answers are reviewed by people and are not used for facial, voice, accent, emotion, or personality scoring" ✓

### /jobs (list)
- No marketing copy in template (list-only page) ✓

### /jobs/details/:id
- No hardcoded copy claims — all content from API data ✓

## SEO Meta Claims Review

### Homepage meta description
"Find jobs, build your profile, post jobs, and manage hiring with GetHired Online — the modern hiring platform for the Philippines."
→ All factual, verifiable claims ✓

### Jobs list meta description
"Search thousands of job opportunities in the Philippines."
→ "Thousands" — verify this is accurate. If job count is substantially less than 1,000, consider "hundreds of" instead.

### Job detail meta description
"{jobTitle} at {companyName}. View job details, location, requirements, and apply on GetHired Online."
→ All factual, from real data ✓

## Action Items

| Item | Priority |
|------|---------|
| Verify "thousands" in jobs meta description matches actual published job count | P2 |
| Monitor companyRating field — do not display without verified data | P1 |
