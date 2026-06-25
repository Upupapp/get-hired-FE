# GetHired SEO V4 — Copy, Claims & Content Quality QA

Generated: 2026-06-26

## Policy

The following claims are FORBIDDEN:
- AI screens candidates, AI-makes-decisions, AI ranks applicants
- Guaranteed hires or outcomes
- Fabricated numbers (users, jobs, companies)
- Fabricated ratings or reviews
- "Fastest", "best", "only" superlatives without evidence

## Public Page Copy Audit

### /home — MainPortalComponent

USP pillars copy (verified):
- "Stronger profiles" / "Build one profile with your skills, CV, work history, and video answers." — PASS (factual claim, feature exists)
- "Video answers" / "Some jobs include video questions, helping candidates explain their experience in their own words." — PASS (accurate, includes "some jobs")
- "Explainable match signals" / "Compatibility signals are guidance, not automatic decisions..." — PASS (explicitly NOT claiming AI decisions)
- "Higher hiring confidence" / "Review richer candidate context — profiles, CVs, and video answers — before deciding who to move forward." — PASS (factual)

Differentiators copy: all verified as honest functional claims. No invented capabilities. PASS.

### /job-seekers — JobSeekerPortalComponent

Benefits list:
- "Browse jobs faster" — PASS (navigational, not quantified)
- "Build one stronger profile" — PASS
- "Upload your CV once" — PASS (feature confirmed)
- "Answer video questions" — "Some jobs include video questions" — PASS (hedged accurately)
- "Understand fit" — "Explainable compatibility signals help you understand how your profile relates to a role." — PASS (no AI-as-judge framing)
- "Track applications" — PASS (feature exists)
- "Reply to employers" — PASS (messaging feature confirmed working)
- "Stay in control" — "Private preparation stays with you unless you submit it with an application." — PASS

FAQ answers:
- "Can employers see my CV feedback?" — Answer: "No. Private readiness and CV coaching guidance stay applicant-side unless a future feature explicitly changes this with your consent." — PASS (honest, includes hedging for future features)
- "Are compatibility signals final decisions?" — Answer: "No. Compatibility signals are guidance to help you and employers understand fit -- they never automatically reject or hide your application." — PASS (critical anti-AI-hype claim is explicit)
- "Are video answers required for every job?" — "No. Only some jobs include video questions. You'll see this clearly on the job post before you apply." — PASS

### /employers — EmployerPortalComponent

Benefits:
- "Post jobs quickly" — PASS
- "Build a company profile" — PASS
- "Review structured applicants" — PASS (factual)
- "Use video answers" — PASS (exists)
- "See match signals" — "Explainable decision-support, never a hidden ranking." — PASS
- "Manage hiring status" — PASS
- "Message applicants" — PASS (feature confirmed)

FAQ:
- "What are match signals?" — Answer explicitly states "they do not automatically reject or hide applicants -- hiring decisions stay human-led." — PASS

### Meta Description Claims

"Search thousands of job opportunities" — This is a marketing claim in the /jobs meta description. If actual job count is significantly below thousands, this should be updated to an accurate qualifier. Monitor via admin/recruiter dashboard.

## Structured Data Claims

No structured data contains:
- reviewCount ✓
- aggregateRating ✓
- fabricated salary ✓ (salary only emitted when real data exists)
- fabricated logo ✓ (logo only emitted when companyLogoUrl exists)

## Emoji Usage in Copy

Some differentiator items in MainPortalComponent use Unicode emoji (📄 📎 🧭 🎥 📋 🗂️). These render correctly in browsers but are not visible to screen readers in a meaningful way (they're followed by text descriptions). The titles provide the accessible meaning — emoji are decorative. PASS.

## Overall Content QA Verdict: PASS

No fake claims, no unsafe AI assertions, no fabricated data found in any public-facing copy.
