/**
 * GetHired MATCH FACTORS v2/v3 -- structured Evidence Model, additive
 * alongside the existing JobCompatibilityResult.matchedFactors/
 * missingFactors (string[], unchanged, see job-compatibility.model.ts).
 *
 * Compatibility rule, as actually implemented (see
 * GETHIRED_MATCH_EVIDENCE_COMPATIBILITY_REPORT.md for the full reasoning):
 * matchedFactors/missingFactors are NOT derived from this evidence's
 * `label` field. Both are computed from the same underlying factors[]
 * array in job-compatibility.service.ts (one computation, two
 * presentations) -- evidence labels are full standalone sentences tuned
 * for chip/badge display, while the legacy fields are terse fragments
 * tuned for explanationFor()/suggestionsFor()'s sentence templates.
 * Deriving one from the other would change JobMatchPanelComponent's
 * literal rendered copy, which the non-negotiable compatibility rule
 * forbids.
 *
 * Scope note: the full registered taxonomy (145+ factor codes across 18+
 * groups) is defined here as types, but only the categories GetHired
 * actually has real data for today produce live evidence objects --
 * required_skill, preferred_skill, role_title, location, work_setup,
 * education, salary_preference, job_matchability, data_quality,
 * confidence, safety_not_used, and (v3 addendum) certification
 * presence-only (not requirement-matched -- no job-side certification
 * requirement field exists). Categories with no backing data yet
 * (license, tool_software, experience richness beyond level,
 * availability_schedule, language, video_status_only beyond
 * submitted/missing) are documented in GETHIRED_MATCH_FACTOR_REGISTRY.md
 * and GETHIRED_MATCH_FACTOR_ADVANCED_REGISTRY.md as specified-but-not-yet-
 * backed, not faked with placeholder evidence.
 */

export type MatchFactorCategory =
  | 'required_skill'
  | 'preferred_skill'
  | 'related_skill'
  | 'transferable_skill'
  | 'tool_software'
  | 'experience'
  | 'role_title'
  | 'job_function'
  | 'industry_domain'
  | 'location'
  | 'work_setup'
  | 'availability_schedule'
  | 'salary_preference'
  | 'education'
  | 'certification'
  | 'license'
  | 'language'
  | 'cv_profile'
  | 'document'
  | 'application_answer'
  | 'application_completeness'
  | 'video_status_only'
  | 'job_matchability'
  | 'data_quality'
  | 'confidence'
  | 'safety_not_used';

export type MatchFactorStatus =
  | 'matched'
  | 'missing'
  | 'unclear'
  | 'transferable'
  | 'blocked'
  | 'not_used'
  | 'conflict'
  | 'limited_data';

export type MatchFactorAudience = 'applicant' | 'employer' | 'both' | 'internal';

export type MatchFactorVisibility = 'primary' | 'secondary' | 'drawer' | 'debug_only' | 'hidden';

export type MatchFactorImportance = 'critical' | 'high' | 'medium' | 'low';

export type MatchFactorMatchType =
  | 'exact'
  | 'alias'
  | 'related'
  | 'transferable'
  | 'inferred_low_confidence'
  | 'missing'
  | 'unclear'
  | 'conflict'
  | 'not_applicable'
  | 'not_used';

export type MatchEvidenceSource =
  | 'profile_skill'
  | 'cv_summary'
  | 'work_experience'
  | 'education'
  | 'certification'
  | 'license'
  | 'application_answer'
  | 'document_status'
  | 'job_requirement'
  | 'job_description'
  | 'job_skill'
  | 'job_preference'
  | 'video_status_only'
  | 'employer_job_post'
  | 'system';

export interface MatchImprovementAction {
  label: string;
  helperText?: string;
  route?: string;
  actionType:
    | 'add_skill'
    | 'upload_cv'
    | 'update_profile'
    | 'add_experience'
    | 'add_certification'
    | 'add_license'
    | 'complete_application'
    | 'answer_question'
    | 'submit_document'
    | 'confirm_video_status'
    | 'improve_job_post'
    | 'review_full_application'
    | 'clear_filters'
    | 'learn_more';
}

export interface MatchFactorUiHint {
  badgeStyle:
    | 'strong_signal'
    | 'missing_signal'
    | 'transferable_signal'
    | 'limited_data'
    | 'required_blocker'
    | 'not_used'
    | 'neutral';
  icon:
    | 'check' | 'alert' | 'spark' | 'bridge' | 'document' | 'certificate'
    | 'location' | 'calendar' | 'briefcase' | 'shield' | 'info';
  colorToken: 'success' | 'warning' | 'info' | 'neutral' | 'critical' | 'brand';
  placement:
    | 'job_card' | 'job_detail_panel' | 'applicant_dashboard'
    | 'employer_applicant_list' | 'employer_applicant_detail'
    | 'evidence_drawer' | 'data_used_panel';
  motion: 'chip_reveal' | 'soft_pulse_once' | 'drawer_expand' | 'none';
}

export interface MatchFactorEvidence {
  factorId: string;
  factorCode: string;
  label: string;
  shortLabel: string;
  category: MatchFactorCategory;
  subcategory: string;
  status: MatchFactorStatus;
  audience: MatchFactorAudience;
  visibility: MatchFactorVisibility;
  importance: MatchFactorImportance;
  matchType: MatchFactorMatchType;
  source: MatchEvidenceSource;
  sourceLabel: string;
  sourceVisibility: 'applicant_only' | 'employer_visible' | 'both' | 'internal_only';
  evidenceStrength: 'high' | 'medium' | 'low' | 'limited';
  confidenceImpact: number;
  scoreImpact: number;
  maxScoreImpact?: number;
  weightGroup?: string;
  confidenceReason: string;
  explanation: string;
  applicantCopy: string;
  employerCopy: string;
  dataQualityNotes?: string[];
  warnings?: string[];
  relatedSignals?: string[];
  normalizedValue?: string | null;
  matchedValue?: string | null;
  requiredByJob?: boolean;
  preferredByJob?: boolean;
  isApplicationRequirement?: boolean;
  isRequiredBlocker?: boolean;
  improvementAction?: MatchImprovementAction | null;
  uiHint?: MatchFactorUiHint;
  createdBy: 'rules_engine' | 'taxonomy_mapper' | 'compatibility_adapter' | 'manual_fallback';
  modelVersion: string;
}

export interface MatchRequiredBlocker {
  blockerId: string;
  label: string;
  reason: string;
  requiredBy: 'job' | 'application' | 'system';
  factorCategory: MatchFactorCategory;
  fixActionLabel: string;
  fixRoute?: string;
  blocksSubmission: boolean;
  doesNotAffectMatchScore: boolean;
}

export interface MatchDataUsed {
  key: string;
  label: string;
  source: MatchEvidenceSource;
  visibleToApplicant: boolean;
  visibleToEmployer: boolean;
  summary: string;
}

export interface MatchDataNotUsed {
  key: string;
  label: string;
  reason: string;
  visibleToApplicant: boolean;
  visibleToEmployer: boolean;
}

export interface MatchFactorSummary {
  topMatched: string[];
  topMissing: string[];
  topTransferable: string[];
  topBlockers: string[];
  confidenceExplanation: string;
  applicantSummary: string;
  employerSummary: string;
}

export interface MatchFactorUiHints {
  primaryBadgeLabel: string;
  primaryBadgeStyle: string;
  confidenceBadgeLabel: string;
  showNumericScore: boolean;
  showEvidenceDrawer: boolean;
  showDataUsedPanel: boolean;
}

// ── MATCH FACTORS v3 addendum -- requirement hierarchy + evidence pedigree ──
// Types only (additive). Not yet wired into JobCompatibilityResult's main
// evidence objects -- see GETHIRED_MATCH_FACTOR_V3_IMPLEMENTATION_LOG.md
// for exactly what is/isn't connected to live code this pass.

export type RequirementImportance =
  | 'application_required'
  | 'job_required'
  | 'strongly_preferred'
  | 'preferred'
  | 'optional'
  | 'inferred_low_confidence'
  | 'unclear';

export interface MatchEvidencePedigree {
  evidenceId: string;
  source: MatchEvidenceSource;
  sourceLabel: string;
  sourceType:
    | 'structured_profile'
    | 'uploaded_document'
    | 'parsed_cv'
    | 'application_answer'
    | 'employer_job_post'
    | 'system_taxonomy'
    | 'provider_import'
    | 'manual_entry';
  reliability:
    | 'confirmed_multiple_sources'
    | 'structured_high'
    | 'document_extracted_medium'
    | 'single_source_medium'
    | 'inferred_low'
    | 'unclear_limited';
  visibility: 'applicant_only' | 'employer_visible' | 'both' | 'internal_only';
  displayMode: 'summary_only' | 'source_label_only' | 'full_safe_context' | 'hidden';
  extractedAt?: string;
  updatedAt?: string;
  confidenceContribution: number;
  scoreContribution: number;
  safeSnippet?: string;
}

/** Internal-only explanation, never rendered to applicant or employer --
 * debug/audit use only (v3 addendum's "audience transform" 3rd tier). */
export interface MatchFactorInternalCopy {
  technicalSummary: string;
  requirementSource: RequirementImportance | 'not_applicable';
  evidenceSearched: string[];
}

export const MATCH_FACTOR_MODEL_VERSION = 'match_factors_v3_addendum_1';
