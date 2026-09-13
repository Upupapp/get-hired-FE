import { EngagementContext, Nudge } from '@main/shared/engagement/engagement-contract.models';

/**
 * Messages gh-be's engagement context serves at 658d0a5 that SUBSCRIPTION_ENGAGEMENT_API_CONTRACT.md shows no example of,
 * serialised by running gh-be's own code at that SHA in a scratch archive (never its working tree). Each is built the way
 * tests/engagementContract.test.js builds its Nudge: rules.getRuleByKey(ruleKey), ctx.viewerFromAccess(uid, { permissions }),
 * recipients.shapeForViewer({ ruleKey, send: true, context, priority }, rule, viewer), ctx.buildNudge(view, rule, { planSlug,
 * planName, viewer }). Placement is ctx.placeMessages([storage.full, storage.90]).
 *
 * STORAGE_FULL_OWNER       storage.full, Free Trial, 1 GB of 1 GB (100%, full); billing.view, billing.manage, team.manage, jobs.publish
 * STORAGE_FULL_TEAM_ADMIN  the same message for a viewer holding only team.manage (redacted: no recommendation, no actions)
 * STORAGE_90_OWNER         storage.90, Growth, 46 GB of 50 GB (92%, critical); the owner
 * JOBS_80_OWNER            jobs.80, Growth, 12 of 15 active jobs; the owner
 * Dump sha256 2fc01532706122af6cb0dbb4f135f2b1aa7be58027000aade2e33f264a635862. Regenerate; never edit a value by hand.
 */

export const E2_STORAGE_FULL_OWNER: Nudge = {
  "id": "nudge:storage.full",
  "kind": "LIMIT_REACHED",
  "ruleKey": "storage.full",
  "trigger": "STORAGE_100",
  "meter": "storage",
  "priority": "CRITICAL",
  "messageClass": "OPERATIONAL",
  "presentation": {
    "recommendedSurface": "PAGE_BANNER",
    "surfaces": [
      "PAGE_BANNER"
    ],
    "dismissible": false
  },
  "copy": {
    "eyebrow": "Recruitment Storage",
    "title": "Your Recruitment Storage is full",
    "body": "You've used 1 GB of your 1 GB Recruitment Storage. Existing applications remain safe, and new applications still arrive. Growth includes 50 GB."
  },
  "usage": {
    "used": 1,
    "limit": 1,
    "unit": "GB",
    "percentage": 100,
    "status": "full"
  },
  "recommendation": {
    "currentPlan": "free_trial",
    "targetPlan": "growth",
    "targetPlanName": "Growth",
    "reason": "STORAGE_CAPACITY",
    "benefit": {
      "unit": "GB",
      "current": 1,
      "target": 50
    }
  },
  "escalation": null,
  "actions": [
    {
      "type": "PRIMARY",
      "label": "Compare plans",
      "action": "NAVIGATE",
      "intent": "COMPARE_PLANS",
      "url": "/recruiter/subscription"
    },
    {
      "type": "SECONDARY",
      "label": "View Growth",
      "action": "NAVIGATE",
      "intent": "VIEW_PLAN",
      "url": "/recruiter/subscription/upgrade/growth"
    }
  ]
};

export const E2_STORAGE_FULL_TEAM_ADMIN: Nudge = {
  "id": "nudge:storage.full",
  "kind": "LIMIT_REACHED",
  "ruleKey": "storage.full",
  "trigger": "STORAGE_100",
  "meter": "storage",
  "priority": "CRITICAL",
  "messageClass": "OPERATIONAL",
  "presentation": {
    "recommendedSurface": "PAGE_BANNER",
    "surfaces": [
      "PAGE_BANNER"
    ],
    "dismissible": false
  },
  "copy": {
    "eyebrow": "Recruitment Storage",
    "title": "Your Recruitment Storage is full",
    "body": "You've used 1 GB of your 1 GB Recruitment Storage. Existing applications remain safe, and new applications still arrive. Your account owner can review storage options."
  },
  "usage": {
    "used": 1,
    "limit": 1,
    "unit": "GB",
    "percentage": 100,
    "status": "full"
  },
  "recommendation": null,
  "escalation": "ask_billing_owner",
  "actions": []
};

export const E2_STORAGE_90_OWNER: Nudge = {
  "id": "nudge:storage.90",
  "kind": "USAGE_WARNING",
  "ruleKey": "storage.90",
  "trigger": "STORAGE_90",
  "meter": "storage",
  "priority": "HIGH",
  "messageClass": "OPERATIONAL",
  "presentation": {
    "recommendedSurface": "INLINE_CARD",
    "surfaces": [
      "INLINE_CARD"
    ],
    "dismissible": true
  },
  "copy": {
    "eyebrow": "Recruitment Storage",
    "title": "Your Recruitment Storage is almost full",
    "body": "You've used 46 GB of 50 GB. Your existing applications remain available. Premium includes 200 GB."
  },
  "usage": {
    "used": 46,
    "limit": 50,
    "unit": "GB",
    "percentage": 92,
    "status": "critical"
  },
  "recommendation": {
    "currentPlan": "growth",
    "targetPlan": "business",
    "targetPlanName": "Premium",
    "reason": "STORAGE_CAPACITY",
    "benefit": {
      "unit": "GB",
      "current": 50,
      "target": 200
    }
  },
  "escalation": null,
  "actions": [
    {
      "type": "PRIMARY",
      "label": "Compare plans",
      "action": "NAVIGATE",
      "intent": "COMPARE_PLANS",
      "url": "/recruiter/subscription"
    },
    {
      "type": "SECONDARY",
      "label": "View Premium",
      "action": "NAVIGATE",
      "intent": "VIEW_PLAN",
      "url": "/recruiter/subscription/upgrade/business"
    }
  ]
};

export const E2_JOBS_80_OWNER: Nudge = {
  "id": "nudge:jobs.80",
  "kind": "PLAN_UPGRADE",
  "ruleKey": "jobs.80",
  "trigger": "JOB_80",
  "meter": "jobs",
  "priority": "INFO",
  "messageClass": "EXPANSION",
  "presentation": {
    "recommendedSurface": "INLINE_CARD",
    "surfaces": [
      "INLINE_CARD",
      "CONTEXTUAL_NUDGE"
    ],
    "dismissible": true
  },
  "copy": {
    "eyebrow": "Active jobs",
    "title": "12 of your 15 active job slots are in use.",
    "body": "Premium supports up to 40 active jobs."
  },
  "usage": {
    "used": 12,
    "limit": 15,
    "unit": "active_jobs",
    "percentage": 80,
    "status": null
  },
  "recommendation": {
    "currentPlan": "growth",
    "targetPlan": "business",
    "targetPlanName": "Premium",
    "reason": "JOB_CAPACITY",
    "benefit": {
      "unit": "active_jobs",
      "current": 15,
      "target": 40
    }
  },
  "escalation": null,
  "actions": [
    {
      "type": "PRIMARY",
      "label": "View plans",
      "action": "NAVIGATE",
      "intent": "COMPARE_PLANS",
      "url": "/recruiter/subscription"
    },
    {
      "type": "SECONDARY",
      "label": "View Premium",
      "action": "NAVIGATE",
      "intent": "VIEW_PLAN",
      "url": "/recruiter/subscription/upgrade/business"
    }
  ]
};

export const E2_PLACED_WITH_BANNER: Pick<EngagementContext, 'prominent' | 'secondary' | 'banner' | 'dashboardCard'> = {
  "prominent": {
    "id": "nudge:storage.full",
    "kind": "LIMIT_REACHED",
    "ruleKey": "storage.full",
    "trigger": "STORAGE_100",
    "meter": "storage",
    "priority": "CRITICAL",
    "messageClass": "OPERATIONAL",
    "presentation": {
      "recommendedSurface": "PAGE_BANNER",
      "surfaces": [
        "PAGE_BANNER"
      ],
      "dismissible": false
    },
    "copy": {
      "eyebrow": "Recruitment Storage",
      "title": "Your Recruitment Storage is full",
      "body": "You've used 1 GB of your 1 GB Recruitment Storage. Existing applications remain safe, and new applications still arrive. Growth includes 50 GB."
    },
    "usage": {
      "used": 1,
      "limit": 1,
      "unit": "GB",
      "percentage": 100,
      "status": "full"
    },
    "recommendation": {
      "currentPlan": "free_trial",
      "targetPlan": "growth",
      "targetPlanName": "Growth",
      "reason": "STORAGE_CAPACITY",
      "benefit": {
        "unit": "GB",
        "current": 1,
        "target": 50
      }
    },
    "escalation": null,
    "actions": [
      {
        "type": "PRIMARY",
        "label": "Compare plans",
        "action": "NAVIGATE",
        "intent": "COMPARE_PLANS",
        "url": "/recruiter/subscription"
      },
      {
        "type": "SECONDARY",
        "label": "View Growth",
        "action": "NAVIGATE",
        "intent": "VIEW_PLAN",
        "url": "/recruiter/subscription/upgrade/growth"
      }
    ]
  },
  "secondary": [
    {
      "id": "nudge:storage.90",
      "kind": "USAGE_WARNING",
      "ruleKey": "storage.90",
      "trigger": "STORAGE_90",
      "meter": "storage",
      "priority": "HIGH",
      "messageClass": "OPERATIONAL",
      "presentation": {
        "recommendedSurface": "INLINE_CARD",
        "surfaces": [
          "INLINE_CARD"
        ],
        "dismissible": true
      },
      "copy": {
        "eyebrow": "Recruitment Storage",
        "title": "Your Recruitment Storage is almost full",
        "body": "You've used 46 GB of 50 GB. Your existing applications remain available. Premium includes 200 GB."
      },
      "usage": {
        "used": 46,
        "limit": 50,
        "unit": "GB",
        "percentage": 92,
        "status": "critical"
      },
      "recommendation": {
        "currentPlan": "growth",
        "targetPlan": "business",
        "targetPlanName": "Premium",
        "reason": "STORAGE_CAPACITY",
        "benefit": {
          "unit": "GB",
          "current": 50,
          "target": 200
        }
      },
      "escalation": null,
      "actions": [
        {
          "type": "PRIMARY",
          "label": "Compare plans",
          "action": "NAVIGATE",
          "intent": "COMPARE_PLANS",
          "url": "/recruiter/subscription"
        },
        {
          "type": "SECONDARY",
          "label": "View Premium",
          "action": "NAVIGATE",
          "intent": "VIEW_PLAN",
          "url": "/recruiter/subscription/upgrade/business"
        }
      ]
    }
  ],
  "banner": {
    "id": "nudge:storage.full",
    "kind": "LIMIT_REACHED",
    "ruleKey": "storage.full",
    "trigger": "STORAGE_100",
    "meter": "storage",
    "priority": "CRITICAL",
    "messageClass": "OPERATIONAL",
    "presentation": {
      "recommendedSurface": "PAGE_BANNER",
      "surfaces": [
        "PAGE_BANNER"
      ],
      "dismissible": false
    },
    "copy": {
      "eyebrow": "Recruitment Storage",
      "title": "Your Recruitment Storage is full",
      "body": "You've used 1 GB of your 1 GB Recruitment Storage. Existing applications remain safe, and new applications still arrive. Growth includes 50 GB."
    },
    "usage": {
      "used": 1,
      "limit": 1,
      "unit": "GB",
      "percentage": 100,
      "status": "full"
    },
    "recommendation": {
      "currentPlan": "free_trial",
      "targetPlan": "growth",
      "targetPlanName": "Growth",
      "reason": "STORAGE_CAPACITY",
      "benefit": {
        "unit": "GB",
        "current": 1,
        "target": 50
      }
    },
    "escalation": null,
    "actions": [
      {
        "type": "PRIMARY",
        "label": "Compare plans",
        "action": "NAVIGATE",
        "intent": "COMPARE_PLANS",
        "url": "/recruiter/subscription"
      },
      {
        "type": "SECONDARY",
        "label": "View Growth",
        "action": "NAVIGATE",
        "intent": "VIEW_PLAN",
        "url": "/recruiter/subscription/upgrade/growth"
      }
    ]
  },
  "dashboardCard": null
};
