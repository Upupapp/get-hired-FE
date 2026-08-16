import * as TeamModel from '../../../team-access.model';

export interface RoleRecommendationAnswers {
  reviewApplicants: boolean;
  editJobs: boolean;
  scheduleInterviews: boolean;
  messageApplicants: boolean;
  manageBilling: boolean;
  manageTeamAccess: boolean;
  manageCompanyProfile: boolean;
  needsCvAccess: boolean;
  jobScope: 'all_jobs' | 'assigned_jobs';
}

export interface RoleRecommendationResult {
  roleKey: string;
  scope: TeamModel.AccessScope;
  explanation: string;
  sensitiveWarnings: string[];
}

/**
 * Deterministic, rules-based recommendation -- not AI, not a black box.
 * Always requires explicit user confirmation before anything is applied
 * (enforced by the calling component, not here).
 */
export function recommendRole(a: RoleRecommendationAnswers): RoleRecommendationResult {
  const sensitiveWarnings: string[] = [];
  if (a.needsCvAccess) { sensitiveWarnings.push('This role will be able to view candidate CVs and documents.'); }
  if (a.manageBilling) { sensitiveWarnings.push('This role will be able to view and manage billing.'); }
  if (a.manageTeamAccess) { sensitiveWarnings.push('This role will be able to manage other team members\' access.'); }

  // Billing/profile-only intents take priority -- they imply no_job_access.
  if (a.manageBilling && !a.reviewApplicants && !a.editJobs && !a.scheduleInterviews) {
    return {
      roleKey: 'billing_admin',
      scope: 'no_job_access',
      explanation: 'Billing Admin can manage billing and subscription but has no access to jobs or applicants.',
      sensitiveWarnings,
    };
  }
  if (a.manageCompanyProfile && !a.reviewApplicants && !a.editJobs && !a.scheduleInterviews) {
    return {
      roleKey: 'company_profile_manager',
      scope: 'no_job_access',
      explanation: 'Company Profile Manager can edit the company profile and public page, with no applicant or job access by default.',
      sensitiveWarnings,
    };
  }
  if (a.manageTeamAccess) {
    return {
      roleKey: 'company_admin',
      scope: 'all_jobs',
      explanation: 'Managing team access requires Company Admin -- the only role (besides Owner) that can invite, remove, and change other members\' access.',
      sensitiveWarnings,
    };
  }

  // Job/applicant-facing intents.
  if (a.editJobs) {
    return {
      roleKey: 'recruiter',
      scope: a.jobScope,
      explanation: `Recruiter can create, edit, and publish job posts, review applicants, and ${a.messageApplicants ? 'message candidates' : 'manage the hiring pipeline'}${a.jobScope === 'assigned_jobs' ? ', limited to the jobs you assign' : ', across all company jobs'}.`,
      sensitiveWarnings,
    };
  }
  if (a.scheduleInterviews && !a.reviewApplicants) {
    return {
      roleKey: 'recruiting_coordinator',
      scope: a.jobScope,
      explanation: `Recruiting Coordinator schedules and manages interviews${a.jobScope === 'assigned_jobs' ? ' for the jobs you assign' : ' across all company jobs'}, with limited candidate data visibility.`,
      sensitiveWarnings,
    };
  }
  if (a.reviewApplicants && (a.messageApplicants || a.scheduleInterviews)) {
    return {
      roleKey: 'hiring_manager',
      scope: a.jobScope,
      explanation: `Hiring Manager reviews applicants and can ${a.messageApplicants ? 'message candidates and ' : ''}update application status${a.jobScope === 'assigned_jobs' ? ' for the jobs you assign' : ' across all company jobs'}, but can't create or edit job posts.`,
      sensitiveWarnings,
    };
  }
  if (a.reviewApplicants) {
    return {
      roleKey: 'reviewer',
      scope: a.jobScope,
      explanation: 'Reviewer can view assigned candidates and applications, read-only -- no messaging or status changes.',
      sensitiveWarnings,
    };
  }

  // Fallback: nothing selected implies a read-only observer.
  return {
    roleKey: 'reports_viewer',
    scope: a.jobScope,
    explanation: 'No specific tasks were selected, so a read-only Reports Viewer role is suggested. You can pick a different role manually if this isn\'t right.',
    sensitiveWarnings,
  };
}
