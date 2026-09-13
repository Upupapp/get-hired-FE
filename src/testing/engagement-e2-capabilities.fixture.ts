import { EngagementContext } from '@main/shared/engagement/engagement-contract.models';

/**
 * context.capabilities as gh-be's engagement context serves it at 658d0a5, serialised by running gh-be's own
 * ctx.buildCapabilities(plan, viewer) in a scratch archive (never its working tree).
 *
 * CAPABILITIES_FREE_TRIAL_OWNER   the Free Trial plan, a billing viewer: both page features allowed, dedicated_support locked
 * CAPABILITIES_NO_PLAN_OWNER      no plan, a billing viewer: every feature locked, each with a Compare plans action
 * CAPABILITIES_NO_PLAN_RECRUITER  no plan, a viewer holding jobs.publish and jobs.edit: locked, no upgrade and no action
 *
 * Every catalog plan at 658d0a5 includes customized_company_page and video_interview_questions, so the backend locks those
 * two only for an employer with no plan.
 * Dump sha256 9cd37e6422598dfe72ab4fad5d9bbb7e68e9dd0849230191381a05094c924bd0. Regenerate; never edit a value by hand.
 */

export const E2_CAPABILITIES_FREE_TRIAL_OWNER: EngagementContext['capabilities'] = {
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
};

export const E2_CAPABILITIES_NO_PLAN_OWNER: EngagementContext['capabilities'] = {
  "features": {
    "customized_company_page": {
      "key": "customized_company_page",
      "name": "Customized company page",
      "allowed": false,
      "reason": "FEATURE_NOT_INCLUDED",
      "upgrade": {
        "minimumPlan": "free_trial",
        "recommendedPlan": "free_trial"
      },
      "nudge": {
        "title": "Unlock Customized company page",
        "body": "Customized company page is available on Free Trial and higher plans.",
        "primaryCTA": {
          "type": "PRIMARY",
          "label": "Compare plans",
          "action": "NAVIGATE",
          "intent": "COMPARE_PLANS",
          "url": "/recruiter/subscription"
        }
      }
    },
    "video_interview_questions": {
      "key": "video_interview_questions",
      "name": "Video Screening questions",
      "allowed": false,
      "reason": "FEATURE_NOT_INCLUDED",
      "upgrade": {
        "minimumPlan": "free_trial",
        "recommendedPlan": "free_trial"
      },
      "nudge": {
        "title": "Unlock Video Screening questions",
        "body": "Video Screening questions is available on Free Trial and higher plans.",
        "primaryCTA": {
          "type": "PRIMARY",
          "label": "Compare plans",
          "action": "NAVIGATE",
          "intent": "COMPARE_PLANS",
          "url": "/recruiter/subscription"
        }
      }
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
};

export const E2_CAPABILITIES_NO_PLAN_RECRUITER: EngagementContext['capabilities'] = {
  "features": {
    "customized_company_page": {
      "key": "customized_company_page",
      "name": "Customized company page",
      "allowed": false,
      "reason": "FEATURE_NOT_INCLUDED",
      "upgrade": null,
      "nudge": {
        "title": "Customized company page isn't included in your plan",
        "body": "Your account owner can review plan options.",
        "primaryCTA": null
      }
    },
    "video_interview_questions": {
      "key": "video_interview_questions",
      "name": "Video Screening questions",
      "allowed": false,
      "reason": "FEATURE_NOT_INCLUDED",
      "upgrade": null,
      "nudge": {
        "title": "Video Screening questions isn't included in your plan",
        "body": "Your account owner can review plan options.",
        "primaryCTA": null
      }
    },
    "dedicated_support": {
      "key": "dedicated_support",
      "name": "Dedicated support",
      "allowed": false,
      "reason": "FEATURE_NOT_INCLUDED",
      "upgrade": null,
      "nudge": {
        "title": "Dedicated support isn't included in your plan",
        "body": "Your account owner can review plan options.",
        "primaryCTA": null
      }
    }
  },
  "flags": {
    "storageWarnings": true,
    "storageAddOns": false,
    "featureGateUpgrade": true,
    "enterpriseSignals": false
  }
};
