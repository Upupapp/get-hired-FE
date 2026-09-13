/**
 * The payloads gh-be's plan limit guard answers with (services/planLimitGuard.js).
 *
 * - EMPLOYER (A3, 6a3d9df): HTTP 402 with one body for every limit, carrying what the
 *   subscription limit modal renders. Only NEW actions are refused (publishing a job,
 *   putting video questions live, adding team members); a draft save never is.
 * - CANDIDATE (A3.1, d1103bb): HTTP 400 with a neutral code and a human message, the way a
 *   job that has stopped taking applications already answers. It names no plan, limit or
 *   enforcement, and the frontend adds none.
 */
export interface EmployerPlanLimitRefusal {
  success: false;
  status: 'error';
  code: 'PLAN_LIMIT_REACHED';
  limitCode: string;
  reasonCode: string;
  audience: 'employer';
  error: string;
  message: string;
  userMessage: string;
  entitlementKey: string;
  used: number;
  limit: number | null;
  requested: number;
  warningLevel: 'at_limit';
  upgradeRoute: string;
  recommendedPlanSlug: string | null;
  recommendedPlanName: string | null;
  unlocks: string[];
  contactSalesRequired: boolean;
  preserveWork: { canSaveDraft: boolean; draftSaved: boolean };
  enforcementMode: string;
}

export const PLAN_LIMIT_HTTP_STATUS = 402;

/** A3.1's candidate code: the same one a job that has stopped taking applications sends. */
export const JOB_NOT_ACCEPTING_APPLICATIONS = 'JOB_NOT_ACCEPTING_APPLICATIONS';
export const JOB_NOT_ACCEPTING_APPLICATIONS_MESSAGE = "This job isn't accepting new applications right now. Please check back later.";

/** What the employer chose in the limit modal. Dismissing it chooses nothing (undefined). */
export type PlanLimitChoice = 'upgrade' | 'plans' | 'draft';

/**
 * The employer refusal a failed HTTP call carries, or null for every other failure, so each
 * caller keeps its existing handling for anything that is not a plan limit.
 */
export function employerPlanLimitRefusal(err: unknown): EmployerPlanLimitRefusal | null {
  const failure = err as { status?: number; error?: unknown } | null;
  if (!failure || failure.status !== PLAN_LIMIT_HTTP_STATUS) { return null; }
  const body = failure.error as Partial<EmployerPlanLimitRefusal> | null;
  if (!body || typeof body !== 'object') { return null; }
  if (body.audience !== 'employer' || body.code !== 'PLAN_LIMIT_REACHED' || typeof body.userMessage !== 'string') { return null; }
  return body as EmployerPlanLimitRefusal;
}
