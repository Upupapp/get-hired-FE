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

export type AssistantImportMode = 'upload' | 'link' | 'manual';

export type AssistantStep = 'choose' | 'upload' | 'link' | 'review';
