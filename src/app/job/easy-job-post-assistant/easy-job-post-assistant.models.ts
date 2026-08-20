export interface AssistantExtractionResult {
  jobTitle: string | null;
  jobCity: string | null;
  jobCountry: string;
  jobDescription: string | null;
  jobDuties: string | null;
  workSetupHint: string | null;
  jobTypeHint: string | null;
  jobLevelHint: string | null;
  salaryMinimum: number | null;
  salaryMaximum: number | null;
  salaryCurrency: string;
  requirements: string[];
  goodToHave: string[];
  skills: string[];
  confidence: Record<string, string>;
  missingRequiredFields: string[];
  warnings: string[];
  jobRoleId?: number | null;
  industryId?: number | null;
  interviewQuestions?: Array<{ question: string; answerDuration: number; retakes: number; sequence: number }> | null;
}

export interface AssistantUploadResponse {
  success: boolean;
  source: 'upload';
  filename: string;
  extractedFields: AssistantExtractionResult;
}

export interface AssistantLinkResponse {
  success: boolean;
  source: 'link';
  url: string;
  extractedFields: AssistantExtractionResult;
}

export type AssistantImportMode = 'upload' | 'link' | 'manual' | 'generate';

export type AssistantStep = 'choose' | 'upload' | 'link' | 'review' | 'generate' | 'generate_review';

// ── V4 Generate inputs ────────────────────────────────────────────────────────
export interface GenerateIntentInputs {
  jobTitle: string;
  location: string;
  workSetup: string;
  employmentType: string;
  companyName?: string;
  industry?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
}

// ── V4 Structured draft types ─────────────────────────────────────────────────
export interface ReviewFlag {
  key: string;
  severity: 'info' | 'warning' | 'blocking';
  section: string;
  message: string;
  blocksPublish: boolean;
}

export interface InstantJobDraftHiringIntent {
  roleFamily: string;
  likelyRoleOutcome: string;
  likelySeniority: string;
  intentConfidence: 'high' | 'medium' | 'low';
  clarificationQuestions: string[];
  possibleAlternativeIntents: string[];
}

export interface InstantJobDraftContent {
  roleSummary: string;
  responsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  skills: string[];
  tools: string[];
  benefits: string[];
}

export interface InstantJobDraftApplication {
  cvRequired: boolean;
  profileRequired: boolean;
  interviewQuestionSuggestions: string[];
  videoQuestionSuggestions: string[];
  applicationStepsPreview: string[];
}

export interface InstantJobDraftQuality {
  completeness: 'partial' | 'draft_ready' | 'needs_review' | 'blocked';
  reviewFlags: ReviewFlag[];
  variationProfile: string;
}

export interface InstantJobDraft {
  version: string;
  source: string;
  basics: {
    jobTitle: string;
    normalizedTitle: string;
    seniority: string;
    employmentType: string;
    workSetup: string;
    jobLocation: { city: string; province: string; country: string; label: string; };
  };
  hiringIntent: InstantJobDraftHiringIntent;
  content: InstantJobDraftContent;
  application: InstantJobDraftApplication;
  quality: InstantJobDraftQuality;
}

export interface GenerateIntentResponse {
  success: boolean;
  draft: InstantJobDraft;
  companyId: string;
  suggestedJobRoleId?: number | null;
}
