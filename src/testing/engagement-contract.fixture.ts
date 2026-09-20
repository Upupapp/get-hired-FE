import {
  BellListResponse, EngagementContextResponse, ListQueryError, MessageActionError, MessageActionNotFound,
  MessageActionResponse, NotificationItem, NotificationListResponse, Nudge,
} from '@main/shared/engagement/engagement-contract.models';
import { CandidatePlanRefusal, EmployerPlanLimitRefusal } from '@main/shared/plan-limit/plan-limit-refusal';

/**
 * The 11 tagged JSON examples of SUBSCRIPTION_ENGAGEMENT_API_CONTRACT.md at gh-be 0e4d647, in contract order,
 * with the same keys, order and values (parsed, then printed with two-space indentation).
 * gh-be's tests/engagementContract.test.js checks each example against the code that produces it, in both
 * directions. Typing each one here is the frontend's half: a field either side adds, drops or renames stops
 * the spec build. Regenerate from the contract; never edit a value by hand.
 *
 * Contract sha256 6e5a54d4518131fef58f1923093f63539f304e19e3fd3c44b4566391d69ecf42. Each block's sha256 (first 16 hex) is noted above its constant.
 */

/** contract:EngagementContextResponse · regenerated from backend E2.2 */
export const ENGAGEMENT_CONTEXT_RESPONSE: EngagementContextResponse = {
  "success": true,
  "context": {
    "status": "ok",
    "degraded": [],
    "generatedAt": "2026-09-13T07:00:00.000Z",
    "subscription": {
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
    },
    "usage": {
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
    },
    "prominent": {
      "id": "nudge:jobs.full",
      "kind": "LIMIT_REACHED",
      "ruleKey": "jobs.full",
      "trigger": "JOB_100",
      "meter": "jobs",
      "priority": "HIGH",
      "messageClass": "OPERATIONAL",
      "presentation": {
        "recommendedSurface": "CONTEXTUAL_NUDGE",
        "surfaces": [
          "CONTEXTUAL_NUDGE"
        ],
        "dismissible": true
      },
      "copy": {
        "eyebrow": "Active jobs",
        "title": "You've reached your active job limit",
        "body": "Your Free Trial plan includes 1 active job. Growth supports up to 15 active jobs. You can still save new jobs as drafts."
      },
      "usage": {
        "used": 1,
        "limit": 1,
        "unit": "active_jobs",
        "percentage": 100,
        "status": null
      },
      "recommendation": {
        "currentPlan": "free_trial",
        "targetPlan": "growth",
        "targetPlanName": "Growth",
        "reason": "JOB_CAPACITY",
        "benefit": {
          "unit": "active_jobs",
          "current": 1,
          "target": 15
        }
      },
      "escalation": null,
      "actions": [
        {
          "type": "PRIMARY",
          "label": "Close or archive a job",
          "action": "NAVIGATE",
          "intent": "MANAGE_JOBS",
          "url": "/recruiter/jobs/list"
        },
        {
          "type": "SECONDARY",
          "label": "Compare plans",
          "action": "NAVIGATE",
          "intent": "COMPARE_PLANS",
          "url": "/recruiter/subscription"
        }
      ]
    },
    "secondary": [
      {
        "id": "nudge:seats.full",
        "kind": "LIMIT_REACHED",
        "ruleKey": "seats.full",
        "trigger": "USER_100",
        "meter": "seats",
        "priority": "HIGH",
        "messageClass": "OPERATIONAL",
        "presentation": {
          "recommendedSurface": "CONTEXTUAL_NUDGE",
          "surfaces": [
            "CONTEXTUAL_NUDGE"
          ],
          "dismissible": true
        },
        "copy": {
          "eyebrow": "Team",
          "title": "Your team is at its user limit",
          "body": "Your Free Trial plan includes 1 employer user. Growth includes up to 5 employer users."
        },
        "usage": {
          "used": 1,
          "limit": 1,
          "unit": "employer_users",
          "percentage": 100,
          "status": null
        },
        "recommendation": {
          "currentPlan": "free_trial",
          "targetPlan": "growth",
          "targetPlanName": "Growth",
          "reason": "USER_CAPACITY",
          "benefit": {
            "unit": "employer_users",
            "current": 1,
            "target": 5
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
            "label": "Manage team",
            "action": "NAVIGATE",
            "intent": "MANAGE_TEAM",
            "url": "/recruiter/company/settings?tab=3"
          }
        ]
      },
      {
        "id": "nudge:storage.80",
        "kind": "USAGE_WARNING",
        "ruleKey": "storage.80",
        "trigger": "STORAGE_80",
        "meter": "storage",
        "priority": "WARNING",
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
          "title": "You're approaching your Recruitment Storage limit",
          "body": "You've used 0.8 GB of your 1 GB Recruitment Storage (84%). Growth includes 50 GB."
        },
        "usage": {
          "used": 0.8,
          "limit": 1,
          "unit": "GB",
          "percentage": 84,
          "status": "warning"
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
      }
    ],
    "banner": null,
    "dashboardCard": {
      "id": "nudge:storage.80",
      "kind": "USAGE_WARNING",
      "ruleKey": "storage.80",
      "trigger": "STORAGE_80",
      "meter": "storage",
      "priority": "WARNING",
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
        "title": "You're approaching your Recruitment Storage limit",
        "body": "You've used 0.8 GB of your 1 GB Recruitment Storage (84%). Growth includes 50 GB."
      },
      "usage": {
        "used": 0.8,
        "limit": 1,
        "unit": "GB",
        "percentage": 84,
        "status": "warning"
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
    "unreadCounts": {
      "total": 2,
      "byCategory": {
        "HIRING": 0,
        "APPLICATIONS": 1,
        "MESSAGES": 0,
        "SUBSCRIPTION": 0,
        "BILLING": 1,
        "ACCOUNT": 0
      },
      "bySource": {
        "engine": 0,
        "payment": 1,
        "other": 1
      }
    },
    "capabilities": {
      "features": {
        "customized_company_page": {
          "key": "customized_company_page",
          "name": "Customized company page",
          "allowed": true,
          "reason": null,
          "upgrade": null,
          "nudge": null
        },
        "video_interview_questions": {
          "key": "video_interview_questions",
          "name": "Video Screening questions",
          "allowed": true,
          "reason": null,
          "upgrade": null,
          "nudge": null
        },
        "dedicated_support": {
          "key": "dedicated_support",
          "name": "Dedicated support",
          "allowed": false,
          "reason": "FEATURE_NOT_INCLUDED",
          "upgrade": {
            "minimumPlan": "business",
            "recommendedPlan": "business"
          },
          "nudge": {
            "title": "Unlock Dedicated support",
            "body": "Dedicated support is available on Premium and higher plans.",
            "primaryCTA": {
              "type": "PRIMARY",
              "label": "Compare plans",
              "action": "NAVIGATE",
              "intent": "COMPARE_PLANS",
              "url": "/recruiter/subscription"
            }
          }
        }
      },
      "flags": {
        "storageWarnings": true,
        "storageAddOns": false,
        "featureGateUpgrade": true,
        "enterpriseSignals": false
      }
    }
  }
};

/** contract:Nudge · regenerated from backend E2.2 */
export const NUDGE: Nudge = {
  "id": "nudge:storage.80",
  "kind": "USAGE_WARNING",
  "ruleKey": "storage.80",
  "trigger": "STORAGE_80",
  "meter": "storage",
  "priority": "WARNING",
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
    "title": "You're approaching your Recruitment Storage limit",
    "body": "You've used 42 GB of your 50 GB Recruitment Storage (84%). Premium includes 200 GB."
  },
  "usage": {
    "used": 42,
    "limit": 50,
    "unit": "GB",
    "percentage": 84,
    "status": "warning"
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

/** contract:NotificationListResponse · regenerated from backend E2.2 */
export const NOTIFICATION_LIST_RESPONSE: NotificationListResponse = {
  "success": true,
  "notifications": [
    {
      "id": "NOTIF-26-48213907",
      "source": "engine",
      "category": "SUBSCRIPTION",
      "type": "storage.90",
      "priority": "HIGH",
      "surface": "IN_APP_NOTIFICATION",
      "title": "Your Recruitment Storage is almost full",
      "body": "You've used 46 GB of 50 GB. Your existing applications remain available. Premium includes 200 GB.",
      "cta": {
        "primary": {
          "type": "PRIMARY",
          "label": "Compare plans",
          "action": "NAVIGATE",
          "intent": "COMPARE_PLANS",
          "url": "/recruiter/subscription"
        },
        "secondary": {
          "type": "SECONDARY",
          "label": "View Premium",
          "action": "NAVIGATE",
          "intent": "VIEW_PLAN",
          "url": "/recruiter/subscription/upgrade/business"
        }
      },
      "metadata": {},
      "status": "DELIVERED",
      "isRead": false,
      "dismissible": true,
      "createdAt": "2026-09-13T06:12:40.000Z",
      "readAt": null,
      "clickedAt": null,
      "expiresAt": "2026-10-13T06:12:40.000Z"
    },
    {
      "id": "SUBN-42",
      "source": "payment",
      "category": "BILLING",
      "type": "payment_failed",
      "priority": "HIGH",
      "surface": "IN_APP_NOTIFICATION",
      "title": "We couldn't process your payment",
      "body": "Your payment did not go through.",
      "cta": {
        "primary": null,
        "secondary": null
      },
      "metadata": {},
      "status": "DELIVERED",
      "isRead": false,
      "dismissible": false,
      "createdAt": "2026-09-12T02:00:00.000Z",
      "readAt": null,
      "clickedAt": null,
      "expiresAt": null
    }
  ],
  "unreadCount": 2,
  "unreadByCategory": {
    "SUBSCRIPTION": 1,
    "BILLING": 1
  },
  "page": 1,
  "limit": 20,
  "hasMore": false,
  "degraded": false
};

/** contract:NotificationItem · regenerated from backend E2.2 */
export const NOTIFICATION_ITEM: NotificationItem = {
  "id": "NOTIF-26-48213907",
  "source": "engine",
  "category": "SUBSCRIPTION",
  "type": "storage.90",
  "priority": "HIGH",
  "surface": "IN_APP_NOTIFICATION",
  "title": "Your Recruitment Storage is almost full",
  "body": "You've used 46 GB of 50 GB. Your existing applications remain available. Premium includes 200 GB.",
  "cta": {
    "primary": {
      "type": "PRIMARY",
      "label": "Compare plans",
      "action": "NAVIGATE",
      "intent": "COMPARE_PLANS",
      "url": "/recruiter/subscription"
    },
    "secondary": {
      "type": "SECONDARY",
      "label": "View Premium",
      "action": "NAVIGATE",
      "intent": "VIEW_PLAN",
      "url": "/recruiter/subscription/upgrade/business"
    }
  },
  "metadata": {},
  "status": "DELIVERED",
  "isRead": false,
  "dismissible": true,
  "createdAt": "2026-09-13T06:12:40.000Z",
  "readAt": null,
  "clickedAt": null,
  "expiresAt": "2026-10-13T06:12:40.000Z"
};

/** contract:MessageActionResponse · regenerated from backend E2.2 */
export const MESSAGE_ACTION_RESPONSE: MessageActionResponse = {
  "success": true,
  "found": true,
  "status": "DISMISSED"
};

/** contract:MessageActionNotFound · regenerated from backend E2.2 */
export const MESSAGE_ACTION_NOT_FOUND: MessageActionNotFound = {
  "success": true,
  "found": false
};

/** contract:MessageActionError · regenerated from backend E2.2 */
export const MESSAGE_ACTION_ERROR: MessageActionError = {
  "success": false,
  "code": "NOT_DISMISSIBLE",
  "message": "This message stays until the issue is resolved."
};

/** contract:ListQueryError · regenerated from backend E2.2 */
export const LIST_QUERY_ERROR: ListQueryError = {
  "success": false,
  "code": "INVALID_QUERY",
  "field": "category",
  "message": "category must be one or more of SUBSCRIPTION, BILLING."
};

/** contract:BellListResponse · regenerated from backend E2.2 */
export const BELL_LIST_RESPONSE: BellListResponse = {
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "NOTIF-26-48213907",
        "type": "storage.90",
        "title": "Your Recruitment Storage is almost full",
        "body": "You've used 46 GB of 50 GB. Your existing applications remain available. Premium includes 200 GB.",
        "linkRoute": "/recruiter/subscription",
        "linkQuery": null,
        "relatedApplicationId": null,
        "relatedJobId": null,
        "isRead": false,
        "createdAt": "2026-09-13T06:12:40.000Z",
        "category": "SUBSCRIPTION",
        "priority": "HIGH",
        "cta": {
          "primary": {
            "type": "PRIMARY",
            "label": "Compare plans",
            "action": "NAVIGATE",
            "intent": "COMPARE_PLANS",
            "url": "/recruiter/subscription"
          },
          "secondary": {
            "type": "SECONDARY",
            "label": "View Premium",
            "action": "NAVIGATE",
            "intent": "VIEW_PLAN",
            "url": "/recruiter/subscription/upgrade/business"
          }
        },
        "dismissible": true,
        "expiresAt": "2026-10-13T06:12:40.000Z"
      },
      {
        "id": "NOTIF-26-11873420",
        "type": "application_shortlisted",
        "title": "You've been shortlisted!",
        "body": "An employer shortlisted you for a job.",
        "linkRoute": "/applicant/applications",
        "linkQuery": null,
        "relatedApplicationId": "APP-1",
        "relatedJobId": "JOB-1",
        "isRead": true,
        "createdAt": "2026-09-12T09:30:00.000Z",
        "category": "APPLICATIONS",
        "priority": null,
        "cta": null,
        "dismissible": true,
        "expiresAt": null
      }
    ],
    "unreadCount": 1,
    "unreadByCategory": {
      "HIRING": 0,
      "APPLICATIONS": 0,
      "MESSAGES": 0,
      "SUBSCRIPTION": 1,
      "BILLING": 0,
      "ACCOUNT": 0
    }
  }
};

/** contract:EmployerLimitRefusal · regenerated from backend E2.2 */
export const CONTRACT_EMPLOYER_LIMIT_REFUSAL: EmployerPlanLimitRefusal = {
  "success": false,
  "status": "error",
  "code": "PLAN_LIMIT_REACHED",
  "limitCode": "ACTIVE_JOB_LIMIT_REACHED",
  "reasonCode": "active_job_posts_limit_reached",
  "audience": "employer",
  "error": "Your Starter plan includes 5 active jobs, and all of them are in use. Close or archive a job, or upgrade to publish this one. You can still save it as a draft.",
  "message": "Your Starter plan includes 5 active jobs, and all of them are in use. Close or archive a job, or upgrade to publish this one. You can still save it as a draft.",
  "userMessage": "Your Starter plan includes 5 active jobs, and all of them are in use. Close or archive a job, or upgrade to publish this one. You can still save it as a draft.",
  "entitlementKey": "active_job_posts",
  "used": 5,
  "limit": 5,
  "requested": 1,
  "warningLevel": "at_limit",
  "upgradeRoute": "/recruiter/subscription/upgrade/growth",
  "recommendedPlanSlug": "growth",
  "recommendedPlanName": "Growth",
  "unlocks": [
    "15 active jobs",
    "5 team members",
    "50 GB Recruitment Storage",
    "5 video questions per job",
    "Unlimited applicants"
  ],
  "contactSalesRequired": false,
  "preserveWork": {
    "canSaveDraft": true,
    "draftSaved": false
  },
  "enforcementMode": "enforce"
};

/** contract:CandidateRefusal · regenerated from backend E2.2 */
export const CONTRACT_CANDIDATE_REFUSAL: CandidatePlanRefusal = {
  "success": false,
  "status": "error",
  "code": "JOB_NOT_ACCEPTING_APPLICATIONS",
  "error": "This job isn't accepting new applications right now. Please check back later.",
  "message": "This job isn't accepting new applications right now. Please check back later."
};
