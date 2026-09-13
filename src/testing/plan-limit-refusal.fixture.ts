import { HttpErrorResponse } from '@angular/common/http';
import { EmployerPlanLimitRefusal } from '@main/shared/plan-limit/plan-limit-refusal';

/**
 * Refusals copied from gh-be's committed wiring test, tests/planLimitWiring.test.js,
 * serialised by running gh-be's own guard at the named SHA (never its working tree).
 *
 * EMPLOYER_REFUSAL: A3 6a3d9df, and byte-identical at A3.1 d1103bb.
 *   actualGuard.buildEmployerRefusal({ entitlementKey: 'active_job_posts', used: 1, limit: 1,
 *   requested: 1, currentSlug: 'free_trial' }). The wiring test answers every employer action
 *   with this one refusal (job create, update and status, the question template, team
 *   members), always as HTTP 402.
 * CANDIDATE_REFUSAL: A3.1 d1103bb, actualGuard.buildCandidateRefusal(), sent as HTTP 400.
 */
export const EMPLOYER_REFUSAL: EmployerPlanLimitRefusal = {
  "success": false,
  "status": "error",
  "code": "PLAN_LIMIT_REACHED",
  "limitCode": "ACTIVE_JOB_LIMIT_REACHED",
  "reasonCode": "active_job_posts_limit_reached",
  "audience": "employer",
  "error": "Your Free Trial plan includes 1 active job, and all of them are in use. Close or archive a job, or upgrade to publish this one. You can still save it as a draft.",
  "message": "Your Free Trial plan includes 1 active job, and all of them are in use. Close or archive a job, or upgrade to publish this one. You can still save it as a draft.",
  "userMessage": "Your Free Trial plan includes 1 active job, and all of them are in use. Close or archive a job, or upgrade to publish this one. You can still save it as a draft.",
  "entitlementKey": "active_job_posts",
  "used": 1,
  "limit": 1,
  "requested": 1,
  "warningLevel": "at_limit",
  "upgradeRoute": "/recruiter/subscription/upgrade/starter",
  "recommendedPlanSlug": "starter",
  "recommendedPlanName": "Starter",
  "unlocks": [
    "5 active jobs",
    "2 team members",
    "10 GB Recruitment Storage",
    "3 video questions per job",
    "Unlimited applicants"
  ],
  "contactSalesRequired": false,
  "preserveWork": {
    "canSaveDraft": true,
    "draftSaved": false
  },
  "enforcementMode": "enforce"
};

export const CANDIDATE_REFUSAL = {
  "success": false,
  "status": "error",
  "code": "JOB_NOT_ACCEPTING_APPLICATIONS",
  "error": "This job isn't accepting new applications right now. Please check back later.",
  "message": "This job isn't accepting new applications right now. Please check back later."
};

export function httpFailure(status: number, body: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, statusText: String(status), error: body, url: 'http://api.test/api' });
}
