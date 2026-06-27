/**
 * GETHIRED_EMPLOYER_JOB_POST_CREATE_FULL_REVAMP_V1 — Phase 12
 * TypeScript view-model interfaces for the job create/edit flow.
 * These are UI-layer types only; they do not replace the domain models in job.model.ts.
 */

// ─── Draft view model ─────────────────────────────────────────────────────────

/** Shape of the assembled draft while the recruiter is filling in the form. */
export interface JobPostingDraftViewModel {
  // Step 1 — Job Basics
  jobTitle: string | null;
  jobTypeId: number | null;
  jobLevelId: number | null;
  jobCategoryId: number | null;
  workSetupId: number | null;
  jobAddress: string | null;
  jobCity: string | null;
  jobCountry: string | null;
  jobBanner: string | null;
  bannerFile: BannerFileEntry[];
  badges: BadgeEntry[];

  // Step 2 — Compensation, Requirements & Benefits
  industryId: number | null;
  jobRoleId: number | null;
  jobDescription: string | null;
  jobDuties: string | null;
  requirements: string[];
  goodToHave: string[];
  educationalBackground: string[];
  certificationRequirements: CertificationRequirementEntry[];
  skills: string[];
  tags: string[];
  rate: string | null;
  salaryMinimum: number | null;
  salaryMaximum: number | null;
  salaryCurrency: string | null;

  // Step 3 — Screening & Interview
  interviewQuestions: InterviewQuestionEntry[];
  interviewTemplateId: string | null;

  // Meta
  companyId: string | null;
  jobStatusId: 1 | 2; // 1 = draft, 2 = published
  jobId: string | null;
}

export interface BannerFileEntry {
  file: string; // base64 data URL
  filename: string;
  size: number;
  type: string;
}

export interface BadgeEntry {
  id: string | number;
  name: string;
  icon: string;
}

export interface CertificationRequirementEntry {
  id: string | number | null;
  name: string;
  type: 'certification' | 'license' | 'permit' | 'eligibility' | 'other';
  importance: 'required' | 'preferred';
  issuingAuthority: string | null;
  expiryRequired: boolean;
  verificationRequired: boolean;
}

export interface InterviewQuestionEntry {
  questionId?: string | number;
  question: string;
  answerDuration: number;
  retakes?: number;
  sequence?: number;
}

// ─── Publish readiness ────────────────────────────────────────────────────────

/** Summary of what's needed before a job post can be published. */
export interface JobPublishReadiness {
  canPublish: boolean;
  missingRequired: string[];
  percentComplete: number;
  statusLabel: 'Draft' | 'Missing required fields' | 'Ready to publish' | 'Published';
}

// ─── Autosave state ────────────────────────────────────────────────────────────

export type AutoSaveState = 'unsaved' | 'saving' | 'saved' | 'failed';

// ─── Step error item ──────────────────────────────────────────────────────────

export interface StepValidationError {
  fieldId: string;
  label: string;
}
