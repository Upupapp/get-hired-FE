# Subscription engagement — frontend integration

Owner master command §58. Written by `gh-fe`, 2026-09-13.

> ## Status: BLOCKED on the backend contract. No engagement UI has been built.
>
> **needs: gh-be :: an FE-consumable engagement endpoint and its payload contract.**
>
> The command says *"use the backend DTO exactly once finalized"* and *"do not invent backend
> endpoints"*. Neither precondition is met, measured against gh-be's own
> `SUBSCRIPTION_ENGAGEMENT_CHECKLIST.md` (uncommitted, 2026-09-13 11:20):
>
> - `GET /api/employer/engagement/context` — **not started**
> - dismiss endpoint, click endpoint — **not started**
> - machine-readable nudge payload format — **not started**
> - `SUBSCRIPTION_ENGAGEMENT_API_CONTRACT.md` — **not started**
>
> Everything the engine does have — the enums, collision ranking, the storage journey, the
> extended notification row — is **uncommitted** in gh-be's working tree and served by no route.
> Building the UI now would mean the frontend authoring the contract and reworking it when the
> real one lands.
>
> This document is therefore the frontend's **plan and requirements input**, not a record of
> work done. It maps what exists, what gh-be is building, and exactly what the frontend needs
> from the contract so that, once it is committed, the build is mechanical.

---

## 1. What exists today, committed — safe to rely on

Measured against `get-hired-BE` `origin/main` @ `ad3b007`.

| Endpoint | Returns | FE consumer today |
|---|---|---|
| `GET /api/subscriptions/lifecycle/status` | `lifecycle { status, planSlug, billingCycle, periodStart, periodEnd, trialEndsAt, amountPaid, isPaid, subscriptionName, statusCopy }` | `SubscriptionLifecycleService` — used by checkout return only |
| `GET /api/subscriptions/notifications` · `POST …/:id/read` | unread subscription notifications `{ id, type, title, body, isRead, metadata, createdAt }` | service method exists; **nothing renders it** |
| `GET /api/subscriptions/upgrade-recommendation?trigger&surface` | `{ showPrompt, trigger, priority (numeric), recommendedSlug, copyKey, primaryCta, secondaryCta }` | employer dashboard nudge (`company-dashboard`) |
| `POST /api/subscriptions/upgrade-analytics` | event sink, whitelisted event names | dashboard nudge |
| `GET /api/subscriptions/employer/summary` | usage for `active_job_posts`, `admin_users` only | subscription page |
| `GET /api/notifications` · read · read-all · `DELETE` | user-scoped `AppNotification { id, type, title, body, linkRoute, linkQuery, isRead, createdAt }` — **no category, priority or company scope** | header bell (`header.component`), polled every 45 s |
| Entitlement guard | `middleware/subscriptionGuardrailsMiddlewareV4.js` → `checkEntitlement()` → `reasonCode: '<key>_limit_reached'` | **nothing** — `job-create` handles 401/403 generically |

## 2. Frontend pieces that already exist — reuse before building

**Six components built for the V4 endpoints are wired into zero templates.** The command says
to reuse existing components first; these are the first candidates.

| Component | Input | Maps to surface |
|---|---|---|
| `app-billing-status-banner` | `lifecycle: LifecycleStatus` | `BILLING_ALERT`, `PAGE_BANNER` (payment) |
| `app-subscription-status-banner` | `planStatus`, `trialEndsAt` | `PAGE_BANNER` (account state) |
| `app-trial-days-remaining-badge` | `trialEndsAt` | `TRIAL_STATUS_WIDGET` (part) |
| `app-subscription-usage-meter` | `label`, `usage: EntitlementUsageV4` | usage metrics, storage meter |
| `app-upgrade-prompt-card` | `recommendation`, `title`, `body`, CTAs, `variant` | `INLINE_CARD`, `DASHBOARD_CARD`, `CONTEXTUAL_NUDGE` |
| `app-subscription-limit-modal` | `SubscriptionLimitModalData { entitlementKey, used, limit, warningLevel, userMessage, upgradeRoute, recommendedPlanSlug, recommendedPlanName, unlocks[] }` | `LIMIT_MODAL` |

Also existing: the header notification panel (bell, unread badge, mark-read, mark-all-read — no
filtering or categories); `SnackbarService` (`success`/`error`/`warning`/`info`, each with an
aria-live politeness) for `TOAST`; `MatDialog` throughout (204 references) — **no bottom-sheet
framework**, so mobile limit modals stay dialogs, per command §40; and `gtag` in `app.component`
plus `PublicPortalAnalyticsService`.

**No frontend feature-flag mechanism exists.** See §8.

## 3. What gh-be is building — uncommitted, not a contract

From `services/engagementRulesService.js`, `db/20260913d_engagement_foundation.sql`,
`services/storedMediaService.js` and gh-be's audit. Recorded so the contract can be checked
against it, not built against.

- `PRIORITY` — `INFO · NOTICE · WARNING · HIGH · CRITICAL`
- `SURFACE` — `IN_APP_NOTIFICATION · INLINE_CARD · PAGE_BANNER · CONTEXTUAL_NUDGE · LIMIT_MODAL ·
  TOAST · EMAIL · BILLING_ALERT · ADMIN_ALERT · SALES_SIGNAL`
- `MESSAGE_CLASS` — `OPERATIONAL` (bypasses the activation gate) · `EXPANSION`
- `rankCandidates()` — one prominent message plus the rest as secondary, ordered payment → hard
  limit → imminent limit → trial → contextual upgrade → recommendation
- Notification row gains `company_id, category, priority, status, template_key, surface,
  cta (jsonb), metadata (jsonb), dedupe_key, rule_key, delivered_at, read_at, clicked_at,
  dismissed_at, expires_at`
- Storage usage: `{ usedBytes, limitBytes, availableBytes, percentage, status, fileCount, breakdown }`
- Dismissal cooldown scales with priority; **CRITICAL is exempt**; expansion messaging is silent
  for 14 days after an upgrade

## 4. Surface mapping — and the gap already visible

| Command surface | gh-be `SURFACE` | FE component | Placement |
|---|---|---|---|
| `IN_APP_NOTIFICATION` | ✅ same | header notification panel (extend) | global |
| `INLINE_CARD` | ✅ same | `app-upgrade-prompt-card` | subscription page, job create |
| `PAGE_BANNER` | ✅ same | `app-subscription-status-banner` | employer shell, top |
| `CONTEXTUAL_NUDGE` | ✅ same | `app-upgrade-prompt-card` (compact) | next to the constrained action |
| `LIMIT_MODAL` | ✅ same | `app-subscription-limit-modal` | on a blocked action |
| `TOAST` | ✅ same | `SnackbarService` | transient confirmations |
| `BILLING_ALERT` | ✅ same | `app-billing-status-banner` | shell + subscription page |
| `DASHBOARD_CARD` | ❌ **no counterpart** | `app-upgrade-prompt-card` in dashboard | employer dashboard |
| `LOCKED_FEATURE_STATE` | ❌ **no counterpart** | new `gh-feature-lock` | in place of a gated feature |
| `TRIAL_STATUS_WIDGET` | ❌ **no counterpart** | trial badge + usage meters | dashboard / shell |

**Three of the command's ten surfaces have no value in gh-be's enum.** gh-be's `EMAIL`,
`ADMIN_ALERT` and `SALES_SIGNAL` are backend-only and correctly absent from the frontend. The
three gaps need enum values or an agreed mapping before the contract is written — otherwise the
backend has no way to ask for them and the frontend no rule for when to show them.

## 5. What the frontend needs from the contract

Requirements, derived from the command. **Field names are the backend's to choose** — the
command forbids renaming without coordination; this lists what must be *expressible*.

### 5a. Engagement context — one call per page load

- **one prominent message** (already ranked — the frontend must not re-rank; ranking is a
  commercial rule and the backend owns it) and **the secondary list**
- **subscription snapshot**: current plan slug, lifecycle status, trial end date, period end,
  billing cycle
- **usage** per entitlement, in the `EntitlementUsageV4` shape the frontend already renders
  (`used, limit, remaining, percentUsed, warningLevel`), **including storage** in bytes
- **unread counts by category** (`subscription`, `billing`, and the existing hiring categories)
- **capabilities** — which features this employer may use, so a gated feature renders
  `LOCKED_FEATURE_STATE` from data rather than from a hardcoded plan list (see §8)

### 5b. Each message

- stable `id`; `ruleKey` / kind; `priority`; `messageClass`
- recommended `surface`, and `dismissible` — **the backend decides, not the UI** (§38)
- **resolved copy** — eyebrow, title, body. The frontend must not assemble commercial copy
  from a template key: engagement copy quotes plan names and capacities, and gh-be has already
  flagged (its blocker B1) that copy built from the wrong numbers would advertise prices that
  do not exist
- optional `usage` — `used, limit, unit, percentage, status`
- optional `recommendation` — `currentPlan, targetPlan, reason`, and the **benefit deltas**
  (`+10 active jobs`), computed server-side from the catalog
- `actions[]` — each with a label and **an intent** the frontend maps to a route (§7), not a
  free-form URL
- `createdAt`, `expiresAt`

### 5c. Write endpoints

- dismiss (by id) — honours the backend's `dismissible`; CRITICAL never offers it
- click (by id, with the action intent) — for attribution
- mark read (exists on `/notifications`; must cover subscription rows once they are unified)

### 5d. Limit rejections

The committed guard returns `reasonCode: '<key>_limit_reached'`. The frontend needs **the HTTP
status and the full response body shape** for each gated action — publish, reopen, invite
member, add video question, upload media — including whether a draft was kept (§9 requires
draft creation to survive a job limit) and whether the actor may see billing (§10 requires a
neutral message for non-billing recruiters).

## 6. Priority rendering

The frontend renders the priority it is given and **never recalculates thresholds** (§6).

| Priority | Treatment | Tokens to confirm at build time |
|---|---|---|
| `INFO` | neutral, low emphasis | surface / border defaults |
| `NOTICE` | subtle brand highlight | brand-soft surface |
| `WARNING` | warm warning | `--gh-warning`, `--gh-sf-state-warning-surface`, `--gh-color-warning-accessible` for text |
| `HIGH` | stronger warning | warning border + accessible warning text |
| `CRITICAL` | account-risk state | critical/danger token — to be confirmed in `_tokens.scss` |

Colour is never the only signal (§39): every level also carries an icon and text.

**Collision rule (§3):** exactly one major surface per screen — the backend's prominent message.
Everything else goes to the notification centre. The frontend enforces *placement*, not
*ranking*.

## 7. CTA routing — intents mapped to routes that exist

| Intent | Route | Exists? |
|---|---|---|
| Compare plans | `/recruiter/subscription` | ✅ |
| View / choose a plan | `/recruiter/subscription/upgrade/:slug` (catalog `upgradeRoute`) | ✅ |
| Update payment method · View billing | `/recruiter/subscription` → billing tab | ✅ |
| Manage jobs | `/recruiter/jobs` | ✅ |
| Manage team | a team screen — **two exist**: `EmployerCompanyUsersComponent` (employer-settings module) and `CompanyUsersComponent` (company module) | ✅ — which one is live, and its route, to confirm |
| **Manage storage · Free up storage** | `/recruiter/subscription/storage` (named in the command) | ❌ **no storage screen exists** |
| **Add storage** | — | ❌ no add-on purchase path (pricing doc BE-P4) |
| **Talk to sales** | — | ❌ no enterprise contact flow; only a support mailto |

**Three CTAs have no destination.** Per the command's no-dead-CTA rule they will not render
until each has a real screen or flow.

## 8. Feature flags

There is no frontend flag system, and the command's flags (`storageWarnings`, `storageAddOns`,
`featureGateUpgrade`, `enterpriseSignals` …) are about **backend capability**, not frontend
readiness. Recommendation: carry them as a `capabilities` block in the engagement context
(§5a) rather than building a parallel frontend flag system that would have to be kept in step
with the backend by hand.

## 9. Analytics

Existing: `gtag` page views, and `POST /api/subscriptions/upgrade-analytics`, which answers
`400 Unknown event` to any name not on a **server-side whitelist of 29 events**
(`controllers/subscriptionUpgradeRecommendationControllerV4.js`, committed).

**None of the command's 14 event names (§36) is on it**, so each would be rejected as sent.
Four have a whitelisted near-equivalent, which makes those a naming decision for the contract
rather than new plumbing:

| Command event | Already whitelisted |
|---|---|
| `subscription_nudge_impression` | `upgrade_prompt_shown` |
| `subscription_nudge_dismissed` | `upgrade_prompt_dismissed` |
| `storage_warning_impression` | `limit_warning_shown` (generic, not storage-specific) |
| `trial_notice_impression` | `trial_ending_prompt_shown`, `trial_expired_prompt_shown` |

The other ten — `subscription_nudge_clicked`, `storage_manage_clicked`, `storage_upgrade_clicked`,
`trial_plan_clicked`, `feature_gate_impression`, `feature_gate_upgrade_clicked`,
`billing_alert_impression`, `billing_payment_update_clicked`, `upgrade_success_viewed`,
`upgrade_feature_explored` — have no counterpart. Either the whitelist grows, or those events move
to the click endpoint in §5c. The frontend will not add a second analytics path (§36). No candidate
PII in any payload.

## 10. Frontend commitments once unblocked

Independent of the contract; stated so they are part of the plan:

- **Loading** — no stale recommendation flashes before the context arrives; stable skeletons.
- **Failure** — a failed engagement call shows **no** nudge and never blocks the dashboard (§42–43).
- **Formatting** — never render `undefined`, `NaN` or `null GB`. The pricing page already enforces
  this: an absent entitlement renders nothing, an explicit null renders "Custom".
- **Refresh** — re-fetch context after upgrade, downgrade, payment update, storage deletion,
  job close, member removal, and checkout return (§34); clear stale alerts on the response,
  never from a local cache.
- **Mobile** — cards stack, banners stay compact, no full-screen interruption for anything below
  `HIGH`, no horizontal overflow (§40, §57).
- **Accessibility** — `role="alert"` for `HIGH`/`CRITICAL`, focus trap + Escape (when dismissible)
  in modals, `aria-valuenow` on meters, reduced-motion respected (§39).
- **Empty** — no empty "upgrade suggestions" box; the section is simply absent (§41).

## 11. Build order once the contract is committed

1. `SubscriptionEngagementService` — one fetch, one cache, the refresh triggers in §10.
2. **Billing alert + payment failure** — highest priority, and three of its four pieces already exist.
3. **Limit modals** (job, seat, video) against the §5d rejection shape.
4. **Trial status widget** — lifecycle plus usage meters.
5. **Notification centre** — category filter, subscription and billing rows, dismiss.
6. **Dashboard and inline nudges** — `app-upgrade-prompt-card`, prominent message only.
7. **Feature locks** — from `capabilities`.
8. **Storage UI** — last, because it also needs a storage screen and an add-on path that do not
   exist.

## 12. The alternative, and why it is not recommended

A thin interim layer could be wired now against the committed V4 endpoints in §1 — billing
banner from lifecycle, trial badge, the limit modal on `_limit_reached`, the dormant six
components. **Not recommended.** gh-be's engine redefines the notification row, ranking and
surfaces, so interim wiring would target shapes the engine replaces. The command's own collision
rule would then need a second arbiter to reconcile the two. That is the duplicate work the hub
exists to prevent. It remains available if the owner wants something visible before gh-be commits.

## 13. Open questions — for the owner, via the hub

1. **Contract ownership and timing.** When does gh-be commit the engagement endpoint and
   `SUBSCRIPTION_ENGAGEMENT_API_CONTRACT.md`? The frontend build starts from that commit.
2. **The three missing surfaces** (§4) — backend enum values, or a mapping?
3. **The three dead-end CTAs** (§7) — a storage screen, an add-on purchase path and an
   enterprise contact flow are each a product decision before they are frontend work.
4. **Interim layer** (§12) — wait for the contract (recommended), or build on V4 now and accept
   the rework?
