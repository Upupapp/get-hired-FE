/**
 * Normalized shape every public-portal component should consume.
 *
 * Why this exists: the live backend (see PUBLIC_JOB_PORTAL_REDESIGN.md §1.6)
 * returns inconsistent field presence between /job/published and /job/details,
 * numeric salary fields as strings, badges/tags inconsistently typed across
 * the two existing FE model files (BasicJob.tags: Options[] vs Job.tags:
 * string[], while the wire format is always string[]), and several fields
 * that are either always null today or hard-coded placeholders
 * (companyRating is always 0). Nothing downstream of the normalizer should
 * ever touch a raw API response directly.
 */
export interface NormalizedBadge {
  id?: number;
  name: string;
  icon?: string;
}

export interface NormalizedCertificationRequirement {
  id?: string;
  name: string;
  type: 'certification' | 'license' | 'permit' | 'eligibility' | 'other';
  importance: 'required' | 'preferred';
  issuingAuthority: string | null;
  expiryRequired: boolean;
  verificationRequired: boolean;
}

export interface NormalizedJob {
  jobId: string;
  title: string;

  companyId: string;
  companyName: string;
  companyLogo: string | null;
  /** Only present on /job/details, not /job/published -- null on listing cards. */
  companyDetails: string | null;
  companyCity: string | null;
  companyCountry: string | null;
  /** Number of employees, if the company set it -- often null. */
  companyNumberOfEmployee: string | null;

  location: string | null;
  city: string | null;
  country: string | null;

  workSetupId: number | null;
  workSetup: string | null;

  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  /** Pre-formatted "PHP 40,000 - 60,000" or "Salary not listed" — never blank. */
  salaryDisplay: string;
  hasSalary: boolean;

  jobTypeId: number | null;
  jobType: string | null;
  jobLevelId: number | null;
  jobLevel: string | null;
  industryId: number | null;
  industry: string | null;
  categoryId: number | null;
  category: string | null;
  jobRoleId: number | null;
  jobRole: string | null;

  /** Raw backend integer; see job-status-id convention note in the redesign doc. */
  statusId: number | null;

  postedDate: Date | null;
  expirationDate: Date | null;

  description: string | null;
  responsibilities: string | null;
  requirements: string[];
  skills: string[];
  tags: string[];
  goodToHave: string[];
  educationalBackground: string[];
  benefits: string[];
  /** GETHIRED JOB CERTIFICATION REQUIREMENTS v1 -- structured, additive.
   * Display-only in this pass; not read by JobCompatibilityService. */
  certificationRequirements: NormalizedCertificationRequirement[];

  /** Derived — there is no isInterviewRequired field on the wire. */
  hasVideoInterview: boolean;
  interviewQuestionCount: number;

  companyProfileAvailable: boolean;
  badges: NormalizedBadge[];

  applyStatus: 'applied' | 'not_applied';
  savedStatus: 'saved' | 'not_saved' | 'unknown';
}
