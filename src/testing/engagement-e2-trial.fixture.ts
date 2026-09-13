import { EngagementSubscription, EngagementUsage } from '@main/shared/engagement/engagement-contract.models';

/**
 * The trial and usage blocks gh-be's engagement context serves at 658d0a5, serialised by running gh-be's own
 * ctx.buildSubscriptionBlock(summary, plan, viewer, now) and ctx.buildUsageBlock(plan, usageAll, storageRead) in a scratch
 * archive (never its working tree). Inputs follow tests/engagementContract.test.js's EngagementContextResponse: a billing
 * viewer, now = 2026-09-13T07:00:00Z, the catalog's free_trial plan (growth for SUB_ACTIVE).
 *
 * SUB_TRIALING             trialing, ends 2026-09-17T06:40Z (the contract example)
 * SUB_TRIAL_ENDING         trial_ending, ends 2026-09-14T06:40Z
 * SUB_TRIAL_ENDS_TODAY     trial_ending, ends at now (daysRemaining 0)
 * SUB_TRIAL_EXPIRED        trial_expired, ended 2026-09-12T06:40Z
 * SUB_TRIAL_END_UNREADABLE trialing with no trialEndsAt: endsAt and daysRemaining come back null
 * SUB_ACTIVE               active, Growth: trial null
 * USAGE_CONFIRMED          1 job, 1 member, 0 video responses, 901943132 bytes, every read confirmed
 * USAGE_UNCONFIRMED        the job read unavailable, the member read an error, no video read, storage unavailable
 * USAGE_NO_PLAN            no plan (every limit 0), reads confirmed: storage no_plan
 * Dump sha256 9f371c3ece91b68eb50cf1eebd1b8f3f04b4d4e8d646ddec50e68e6f3fe73ae5. Regenerate; never edit a value by hand.
 */

export const E2_SUB_TRIALING: EngagementSubscription = {
  "planSlug": "free_trial",
  "planName": "Free Trial",
  "status": "trialing",
  "billingCycle": "monthly",
  "periodEnd": null,
  "trial": {
    "status": "trialing",
    "endsAt": "2026-09-17T06:40:00.000Z",
    "daysRemaining": 4,
    "lengthDays": 7
  }
};

export const E2_SUB_TRIAL_ENDING: EngagementSubscription = {
  "planSlug": "free_trial",
  "planName": "Free Trial",
  "status": "trial_ending",
  "billingCycle": "monthly",
  "periodEnd": null,
  "trial": {
    "status": "trial_ending",
    "endsAt": "2026-09-14T06:40:00.000Z",
    "daysRemaining": 1,
    "lengthDays": 7
  }
};

export const E2_SUB_TRIAL_ENDS_TODAY: EngagementSubscription = {
  "planSlug": "free_trial",
  "planName": "Free Trial",
  "status": "trial_ending",
  "billingCycle": "monthly",
  "periodEnd": null,
  "trial": {
    "status": "trial_ending",
    "endsAt": "2026-09-13T07:00:00.000Z",
    "daysRemaining": 0,
    "lengthDays": 7
  }
};

export const E2_SUB_TRIAL_EXPIRED: EngagementSubscription = {
  "planSlug": "free_trial",
  "planName": "Free Trial",
  "status": "trial_expired",
  "billingCycle": "monthly",
  "periodEnd": null,
  "trial": {
    "status": "trial_expired",
    "endsAt": "2026-09-12T06:40:00.000Z",
    "daysRemaining": 0,
    "lengthDays": 7
  }
};

export const E2_SUB_TRIAL_END_UNREADABLE: EngagementSubscription = {
  "planSlug": "free_trial",
  "planName": "Free Trial",
  "status": "trialing",
  "billingCycle": "monthly",
  "periodEnd": null,
  "trial": {
    "status": "trialing",
    "endsAt": null,
    "daysRemaining": null,
    "lengthDays": 7
  }
};

export const E2_SUB_ACTIVE: EngagementSubscription = {
  "planSlug": "growth",
  "planName": "Growth",
  "status": "active",
  "billingCycle": "monthly",
  "periodEnd": null,
  "trial": null
};

export const E2_USAGE_CONFIRMED: EngagementUsage = {
  "active_job_posts": {
    "key": "active_job_posts",
    "used": 1,
    "limit": 1,
    "remaining": 0,
    "percentUsed": 100,
    "warningLevel": "at_limit",
    "countSource": "jobs.status",
    "countConfidence": "confirmed"
  },
  "admin_users": {
    "key": "admin_users",
    "used": 1,
    "limit": 1,
    "remaining": 0,
    "percentUsed": 100,
    "warningLevel": "at_limit",
    "countSource": "company_employees.not_suspended",
    "countConfidence": "confirmed"
  },
  "video_responses": {
    "key": "video_responses",
    "used": 0,
    "limit": 5,
    "remaining": 5,
    "percentUsed": 0,
    "warningLevel": "none",
    "countSource": "video_responses.job_ids",
    "countConfidence": "confirmed"
  },
  "recruitment_storage": {
    "key": "recruitment_storage",
    "used": 901943132,
    "limit": 1073741824,
    "remaining": 171798692,
    "percentUsed": 84,
    "warningLevel": "near_70",
    "countSource": "stored_media.active",
    "countConfidence": "confirmed",
    "storageStatus": "warning"
  }
};

export const E2_USAGE_UNCONFIRMED: EngagementUsage = {
  "active_job_posts": {
    "key": "active_job_posts",
    "used": 0,
    "limit": 1,
    "remaining": 1,
    "percentUsed": 0,
    "warningLevel": "none",
    "countSource": "jobs.status",
    "countConfidence": "unavailable"
  },
  "admin_users": {
    "key": "admin_users",
    "used": 0,
    "limit": 1,
    "remaining": 1,
    "percentUsed": 0,
    "warningLevel": "none",
    "countSource": "company_employees.not_suspended",
    "countConfidence": "error"
  },
  "video_responses": {
    "key": "video_responses",
    "used": 0,
    "limit": 5,
    "remaining": 5,
    "percentUsed": 0,
    "warningLevel": "none",
    "countSource": "unknown",
    "countConfidence": "unavailable"
  },
  "recruitment_storage": {
    "key": "recruitment_storage",
    "used": 0,
    "limit": 1073741824,
    "remaining": 1073741824,
    "percentUsed": 0,
    "warningLevel": "none",
    "countSource": "stored_media.active",
    "countConfidence": "unavailable",
    "storageStatus": null
  }
};

export const E2_USAGE_NO_PLAN: EngagementUsage = {
  "active_job_posts": {
    "key": "active_job_posts",
    "used": 0,
    "limit": 0,
    "remaining": 0,
    "percentUsed": null,
    "warningLevel": "at_limit",
    "countSource": "jobs.status",
    "countConfidence": "confirmed"
  },
  "admin_users": {
    "key": "admin_users",
    "used": 1,
    "limit": 0,
    "remaining": 0,
    "percentUsed": null,
    "warningLevel": "at_limit",
    "countSource": "company_employees.not_suspended",
    "countConfidence": "confirmed"
  },
  "video_responses": {
    "key": "video_responses",
    "used": 0,
    "limit": 0,
    "remaining": 0,
    "percentUsed": null,
    "warningLevel": "at_limit",
    "countSource": "video_responses.job_ids",
    "countConfidence": "confirmed"
  },
  "recruitment_storage": {
    "key": "recruitment_storage",
    "used": 0,
    "limit": 0,
    "remaining": 0,
    "percentUsed": null,
    "warningLevel": "at_limit",
    "countSource": "stored_media.active",
    "countConfidence": "confirmed",
    "storageStatus": "no_plan"
  }
};
