import * as TeamModel from './team-access.model';

// Pure UI categorization -- has no bearing on authorization (the backend
// never reads or trusts this). Maps role_key -> display group, and
// permission category -> display label, for the accordion/matrix UI.
export const ROLE_GROUPS: TeamModel.RoleGroup[] = [
  { key: 'general', label: 'General Roles', roleKeys: ['owner', 'company_admin', 'viewer'] },
  { key: 'recruiting', label: 'Recruiting Roles', roleKeys: ['recruiter', 'sourcer', 'recruiting_coordinator'] },
  { key: 'job_access', label: 'Job Access Roles', roleKeys: ['hiring_manager'] },
  { key: 'interview_review', label: 'Interview & Review Roles', roleKeys: ['interviewer', 'reviewer'] },
  { key: 'billing', label: 'Billing Roles', roleKeys: ['billing_admin'] },
  { key: 'reports', label: 'Reports & Analytics Roles', roleKeys: ['reports_viewer'] },
  { key: 'company_profile', label: 'Company Profile Roles', roleKeys: ['company_profile_manager'] },
];

export const CUSTOM_ROLE_GROUP: TeamModel.RoleGroup = { key: 'custom', label: 'Custom Roles', roleKeys: [] };

export function groupKeyForRole(role: TeamModel.TeamRole): string {
  if (role.roleType === 'custom') { return 'custom'; }
  const found = ROLE_GROUPS.find(g => g.roleKeys.includes(role.roleKey));
  return found ? found.key : 'general';
}

export function groupLabelFor(groupKey: string): string {
  if (groupKey === 'custom') { return CUSTOM_ROLE_GROUP.label; }
  const found = ROLE_GROUPS.find(g => g.key === groupKey);
  return found ? found.label : 'Other';
}

// Permission category -> display label + short description, for the
// permission matrix UI. Categories come from the real backend catalog
// (GET /company/team/permissions) -- this only supplies presentation.
export const PERMISSION_CATEGORY_LABELS: { [category: string]: string } = {
  jobs: 'Jobs',
  applicants: 'Applicants',
  cv: 'CVs & Documents',
  messages: 'Messaging',
  interviews: 'Interviews',
  company: 'Company Profile',
  team: 'Team & Access',
  billing: 'Billing',
};
