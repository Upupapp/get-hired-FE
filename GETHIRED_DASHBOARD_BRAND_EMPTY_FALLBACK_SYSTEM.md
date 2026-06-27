# GETHIRED DASHBOARD BRAND — Empty & Fallback System

**Scope:** All empty states on `/recruiter/dashboard`

---

## Empty State Inventory

| Section | Condition | Copy | CTA |
|---------|-----------|------|-----|
| Views & Applications chart | `applicants === 0 && jobViewsThisMonth === 0` | "Activity trends will appear once your jobs receive views and applications." | "Manage jobs" → `/recruiter/jobs/list` |
| Hiring Pipeline Health | `byStage.length === 0` (no error) | "Applicants will appear here once candidates start applying to your jobs." | "Post a job" → `/recruiter/jobs/create` |
| Job Performance Table | `cachedJobGroups.length === 0` (no error) | "No jobs are currently awaiting applicant review." | "View all jobs" → `/recruiter/jobs/list` |
| Top applicant cities | `cachedCities.length === 0` | "Cities will appear once applicants start applying to your jobs." | None |
| Applicant overview | `totalContacts === 0` | "Candidate insights will appear once applicants start applying." | None |
| Action Inbox (all caught up) | `cachedSupportingActions.length === 0` | "You're all caught up. No urgent actions right now." | None (inbox area) |
| Hiring health chip | `cachedHiringHealth === 'unknown'` | Chip hidden (`*ngIf="cachedHiringHealth !== 'unknown'"`) | N/A |
| KPI — Job views | `cachedJobViewsThisMonth === 0` | Shows "—" number, "no views yet" ctx | N/A |
| KPI — Conversion rate | `cachedConversionRate === null` | Shows "—" number, "no views yet" ctx | N/A |
| KPI — Messages | Always | Shows "—" (no BE endpoint for unread count) | "view inbox" |

---

## Empty State Visual Patterns

### Pattern A — Text + CTA (pipeline, job perf, chart)
```scss
.gh-pipeline-empty, .gh-jobperf-empty, .gh-chart-empty {
  padding: 24–32px 0 8px;
  text-align: center;
  color: $gh-muted;
  font-size: 13px;
  p { margin: 0 0 10–12px; }
}
```
Followed by a `gh-btn-link gh-pressable` CTA.

### Pattern B — Inline text only (cities, applicant overview)
```scss
.gh-empty-text {
  color: $gh-muted;
  font-size: 13px;
  margin: 8px 0 0;
}
```
No CTA — these sections have no meaningful action to take.

### Pattern C — All-caught-up green bar (inbox)
```scss
.gh-inbox-all-clear {
  background: rgba(34,197,94,0.06);
  border: 1px solid rgba(34,197,94,0.2);
  color: $gh-green;
  // checkmark icon + message
}
```

### Pattern D — KPI dash fallback
KPI cards that have no data render `—` as the number value. The `gh-kpi-ctx` sub-label changes to provide context ("no views yet", "view inbox"). No separate empty component needed.

---

## Fallback Values

| Binding | Fallback |
|---------|----------|
| `dashboard.charts?.activeJobs` | `\|\| 0` |
| `dashboard.charts?.applicants` | `\|\| 0` |
| `dashboard.charts?.interviews` | `\|\| 0` |
| `dashboard.stat?.totalContacts` | `\|\| 0` |
| `dashboard.company?.companyName` | `\|\| 'Your company'` |
| `cachedJobViewsThisMonth` | `0` (init) → `> 0 ? (value \| number) : '—'` |
| `cachedConversionRate` | `null` → `\|\| '—'` |
| `cachedInterviewsScheduled` | `0` (init) |
| `cachedPipelineTotal` | `0` (init) |
| `subscriptionDaysLeft` | returns `0` if endAt null/invalid |

---

## New Account Journey

A new employer with no jobs, no applicants, no subscription would see:

1. **Hero:** Company name + "0 active jobs · 0 applicants this month" — no job views chip
2. **Action Inbox:** Recommended step = "Complete your company profile" (if profile incomplete) or "Post your first job" (if profile complete). Supporting cards empty → "all caught up" bar.
3. **KPI Strip:** All zeros or "—" values. Functional (not blank).
4. **Chart:** Empty state with "Manage jobs" CTA.
5. **Pipeline:** Empty state with "Post a job" CTA.
6. **Job Performance:** Empty state with "View all jobs" CTA.
7. **Branding Health:** Shows score (likely low) + missing fields chips.
8. **Profile Completeness:** Shows ring at partial fill + checklist.
9. **Subscription:** Shows Free plan or loading.
10. **Cities/Insights:** Empty text states.

The recommended step system (`_buildRecommendedStep`) guides the user through the correct next action, so the empty-screen experience is actionable rather than confusing.
