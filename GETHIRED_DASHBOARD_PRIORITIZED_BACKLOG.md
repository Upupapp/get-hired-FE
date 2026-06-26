# GETHIRED_DASHBOARD_PRIORITIZED_BACKLOG.md
Generated: 2026-06-27
Source: ACTIONS DASHBOARD + STITCH DASHBOARD findings

## Priority Matrix

| ID | Title | P | MoSCoW | Effort | Owner | Stage |
|----|-------|---|--------|--------|-------|-------|
| ACT-DASH-001 | Remove dead `?companyId=` param from subscription service | P0 | Must | XS | FE | 0 |
| ACT-DASH-002 | Add error state + retry for main dashboard failure | P1 | Should | S | FE | 1 |
| ACT-DASH-003 | Fix BE graph/cities returning `0` instead of `[]` | P1 | Should | XS | BE | 1 |
| ACT-DASH-004 | Subscription section: show fallback state when no subscription | P1 | Should | S | FE | 1 |
| ACT-DASH-005 | Fix `industryId === 0` false-negative in branding score | P1 | Should | XS | FE | 1 |
| ACT-DASH-006 | Fix KPI card routes (Video answers + Needs review) | P1 | Should | S | FE | 1 |
| ACT-DASH-007 | Add missing fields to `Company` TypeScript model | P1 | Should | XS | FE | 1 |
| ACT-DASH-008 | Add upgrade CTA when subscription limit reached | P2 | Could | XS | FE | 2 |
| ACT-DASH-009 | Show job status (published/expired) in job performance section | P2 | Could | S | BE+FE | 2 |
| ACT-DASH-010 | Branding CTA: pre-select correct settings tab | P2 | Could | XS | FE | 2 |
| ACT-DASH-011 | Pipeline bar chart: add baseline and scale | P2 | Could | S | FE | 2 |
| ACT-DASH-012 | `subscriptionDaysLeft()`: guard against NaN | P2 | Could | XS | FE | 2 |
| ACT-DASH-013 | Getting Started: show "all set" state instead of vanishing | P2 | Could | XS | FE | 2 |
| ACT-DASH-014 | Per-job view analytics on dashboard | P3 | Won't | M | BE+FE | 3 |
| ACT-DASH-015 | Candidate city/geography section | P3 | Won't | S | FE | 3 |
| ACT-DASH-016 | Recent activity feed | P3 | Won't | L | BE+FE | 3 |
| ACT-DASH-017 | Unread message count badge | P3 | Won't | M | BE+FE | 3 |
| ACT-DASH-018 | Trend arrows on KPI metrics | P3 | Won't | L | BE+FE | 3 |
| ACT-DASH-019 | Export/share dashboard summary | P3 | Won't | XL | BE+FE | 3 |

## Top 5 Immediate Actions

1. **ACT-DASH-001** (XS, FE) — Remove the dead `?companyId=` param. One-line change in `company.service.ts`. No risk.

2. **ACT-DASH-003** (XS, BE) — Fix `graph()` and `cities()` to return `[]` instead of `0` when rows are empty. Prevents silent render bugs in child components for new companies.

3. **ACT-DASH-005** (XS, FE) — Change `!company.industryId` to `company.industryId == null` in `brandingScore()`. Prevents false "missing industry" on any company with `industryId = 0`.

4. **ACT-DASH-007** (XS, FE) — Add 7 missing fields to the `Company` TypeScript model. Zero behavior change, improves type safety for all future work.

5. **ACT-DASH-002** (S, FE) — Add error state + retry button for when the main dashboard API call fails. Currently the dashboard goes silently blank.

## Effort Distribution

- XS items (0.5h each): ACT-DASH-001, 003, 005, 007, 008, 010, 012, 013
- S items (1-2h each): ACT-DASH-002, 004, 006, 009, 011, 015
- M items (half-day): ACT-DASH-014, 017
- L items (full day): ACT-DASH-016, 018
- XL items: ACT-DASH-019

## Stage 0 (Security) — 1 item
1. ACT-DASH-001

## Stage 1 (Resilience) — 6 items
1. ACT-DASH-002
2. ACT-DASH-003
3. ACT-DASH-004
4. ACT-DASH-005
5. ACT-DASH-006
6. ACT-DASH-007

## Stage 2 (UX) — 6 items
1. ACT-DASH-008
2. ACT-DASH-009
3. ACT-DASH-010
4. ACT-DASH-011
5. ACT-DASH-012
6. ACT-DASH-013

## Stage 3 (Future) — 6 items
ACT-DASH-014 through ACT-DASH-019
