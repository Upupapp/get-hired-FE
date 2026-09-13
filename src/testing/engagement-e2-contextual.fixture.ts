import { EngagementContext, Nudge } from '@main/shared/engagement/engagement-contract.models';

/**
 * The jobs and seats contextual nudges gh-be's engagement context serves at 658d0a5, serialised by running gh-be's own
 * code at that SHA in a scratch archive (never its working tree), built the way tests/engagementContract.test.js builds its
 * Nudge (getRuleByKey, viewerFromAccess, shapeForViewer, buildNudge) on the Free Trial plan. Placements are ctx.placeMessages.
 *
 * JOBS_FULL_OWNER        jobs.full, 1 of 1, a billing viewer (billing.view, billing.manage, team.manage, jobs.publish)
 * JOBS_FULL_RECRUITER    jobs.full for a viewer holding only jobs.publish: no recommendation, no plan action
 * SEATS_FULL_OWNER       seats.full, 1 of 1, the billing viewer
 * SEATS_FULL_TEAM_ADMIN  seats.full for a viewer holding only team.manage: no recommendation, no plan action
 * STORAGE_80_OWNER       storage.80 at 84%, the billing viewer (an INLINE_CARD message, not a contextual one)
 * PLACED_*               placeMessages over those, in the order named
 * Dump sha256 83110e41a4b9479a5347cf384fadf20087493fba73c68fa7deb2bdae616b87ec. Regenerate; never edit a value by hand.
 */

export const E2_JOBS_FULL_OWNER: Nudge = {
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
};

export const E2_JOBS_FULL_RECRUITER: Nudge = {
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
    "body": "Your Free Trial plan includes 1 active job. You can still save new jobs as drafts. Your account owner can review plan options."
  },
  "usage": {
    "used": 1,
    "limit": 1,
    "unit": "active_jobs",
    "percentage": 100,
    "status": null
  },
  "recommendation": null,
  "escalation": "ask_billing_owner",
  "actions": [
    {
      "type": "PRIMARY",
      "label": "Close or archive a job",
      "action": "NAVIGATE",
      "intent": "MANAGE_JOBS",
      "url": "/recruiter/jobs/list"
    }
  ]
};

export const E2_SEATS_FULL_OWNER: Nudge = {
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
};

export const E2_SEATS_FULL_TEAM_ADMIN: Nudge = {
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
    "body": "Your Free Trial plan includes 1 employer user. Your account owner can review plan options."
  },
  "usage": {
    "used": 1,
    "limit": 1,
    "unit": "employer_users",
    "percentage": 100,
    "status": null
  },
  "recommendation": null,
  "escalation": "ask_billing_owner",
  "actions": [
    {
      "type": "PRIMARY",
      "label": "Manage team",
      "action": "NAVIGATE",
      "intent": "MANAGE_TEAM",
      "url": "/recruiter/company/settings?tab=3"
    }
  ]
};

export const E2_STORAGE_80_OWNER: Nudge = {
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
};

export const E2_PLACED_JOBS_SEATS_STORAGE: Pick<EngagementContext, 'prominent' | 'secondary' | 'banner' | 'dashboardCard'> = {
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
  }
};

export const E2_PLACED_JOBS_SEATS: Pick<EngagementContext, 'prominent' | 'secondary' | 'banner' | 'dashboardCard'> = {
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
    }
  ],
  "banner": null,
  "dashboardCard": null
};

export const E2_PLACED_RECRUITER: Pick<EngagementContext, 'prominent' | 'secondary' | 'banner' | 'dashboardCard'> = {
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
      "body": "Your Free Trial plan includes 1 active job. You can still save new jobs as drafts. Your account owner can review plan options."
    },
    "usage": {
      "used": 1,
      "limit": 1,
      "unit": "active_jobs",
      "percentage": 100,
      "status": null
    },
    "recommendation": null,
    "escalation": "ask_billing_owner",
    "actions": [
      {
        "type": "PRIMARY",
        "label": "Close or archive a job",
        "action": "NAVIGATE",
        "intent": "MANAGE_JOBS",
        "url": "/recruiter/jobs/list"
      }
    ]
  },
  "secondary": [],
  "banner": null,
  "dashboardCard": null
};

export const E2_PLACED_TEAM_ADMIN: Pick<EngagementContext, 'prominent' | 'secondary' | 'banner' | 'dashboardCard'> = {
  "prominent": {
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
      "body": "Your Free Trial plan includes 1 employer user. Your account owner can review plan options."
    },
    "usage": {
      "used": 1,
      "limit": 1,
      "unit": "employer_users",
      "percentage": 100,
      "status": null
    },
    "recommendation": null,
    "escalation": "ask_billing_owner",
    "actions": [
      {
        "type": "PRIMARY",
        "label": "Manage team",
        "action": "NAVIGATE",
        "intent": "MANAGE_TEAM",
        "url": "/recruiter/company/settings?tab=3"
      }
    ]
  },
  "secondary": [],
  "banner": null,
  "dashboardCard": null
};
