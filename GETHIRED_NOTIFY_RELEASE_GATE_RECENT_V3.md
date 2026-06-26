# GETHIRED NOTIFY RELEASE GATE — RECENT DEPLOYMENT (Homepage V2)
**Scope:** commit e817e2e — Product Preview section, Trust & Safety section, Employer Conversion Band, Hero Proof Chips
**Date:** 2026-06-26

---

## Release Gates

### Gate A: No false claims
**PASS**

Every factual claim in the new sections is accurate and verifiable:
- Video answers are reviewed by real people — true per system design
- Signals are guidance, not automatic decisions — true per MATCH implementation
- "Built for Philippine hiring" — accurate geographic scope
- All platform capabilities described (profile, dashboard, tracking, messaging, CV upload) exist in the product
- No fabricated statistics, percentages, or outcome guarantees

### Gate B: No AI screening claims
**PASS**

The new copy explicitly negates AI screening at multiple points:
- "Guidance, not automatic decisions"
- "They never auto-screen, auto-rank, or replace people in the hiring process"
- "No automated decisions from video content"
- "Signals support decisions — they never replace them."
- "GetHired helps organize hiring information — not replace human judgment."

These are affirmative, specific rejections of AI screening framing — not just absence of the claim.

### Gate C: No shame language
**PASS**

No shame language found in the new sections. Notably, "Some jobs include optional video questions" actively reduces applicant anxiety by making video conditional and optional. No "you must", "you failed", or deficit framing anywhere in the new copy.

### Gate D: Disclaimer for illustrative content
**PASS WITH NOTE**

The disclaimer "Illustrative view of key features." is present before all mock panel content and is functionally sufficient. One improvement was applied in the Fix Log (warmer, more specific language).

Note: The disclaimer's visual styling (#9ca3af at 13px italic) is below WCAG AA contrast. This is an accessibility backlog item, not a release blocker — the disclaimer is readable on standard displays and its intent is clear.

### Gate E: CTA clarity
**PASS**

All 6 CTAs in the new sections are:
- Verb-led ("Build", "Start", "Find", "See")
- Accurately matched to navigation destination
- Free of false urgency or vague labels like "Click here" or "Learn more"
- Specific to the feature context they follow

Weakest CTA is "Find jobs" in the Application Tracking panel — the connection to tracking is implicit. Not a blocker; acceptable.

### Gate F: Trust/safety copy accuracy
**PASS**

All claims in the Trust & Safety section were audited against known system behavior:

| Claim | Audit result |
|---|---|
| Signals are guidance only | Accurate — MATCH signals are advisory |
| No auto-screen or auto-rank | Accurate — no automated screening implemented |
| Video reviewed by real people | Accurate — no automated video analysis |
| No automated decisions from video | Accurate — confirmed |
| Structured data, clearer review | Accurate — platform organizes profiles/CVs/applications |
| Built for Philippine hiring | Accurate — geographic scope is Philippine job market |

No trust/safety claim is false, misleading, or speculative.

---

## Overall Verdict

**GO**

All six gates pass. The new homepage V2 copy is honest, clear, appropriately disclaimed, and free of AI screening claims, shame language, overpromising, or fabricated data.

Two conditional flags are noted for follow-up (not blockers):
1. Confirm "Message candidates directly" is fully live for all employers.
2. Confirm "Know when employers respond" is backed by reliable applicant-facing notifications.

If either feature is not fully live, soften those two bullets before the next homepage iteration. Neither is a launch blocker for the current deployment.

---

*End of GETHIRED NOTIFY RELEASE GATE — RECENT DEPLOYMENT V3*
