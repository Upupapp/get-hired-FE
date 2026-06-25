/**
 * B13 — JobReadinessService
 *
 * Pure, deterministic, unit-testable service.
 * No AI, no MATCH, no external HTTP calls.
 * canPublish mirrors the ACTUAL publishJobPost() gate in job-create.component.ts
 * (jobTypeId + jobLevelId + jobCity + jobCountry + jobDescription + workSetupId
 *  + banner + companyId).
 *
 * B04 preservation: interview/video questions NEVER block publish.
 * Certifications / licenses NEVER block publish.
 * Company brand/benefits NEVER block publish.
 * Salary/benefits NEVER block publish.
 */
import { Injectable } from '@angular/core';

// ─────────────────────────────────────────────────────────────────────────────
// Public interfaces
// ─────────────────────────────────────────────────────────────────────────────

export type JobReadinessLevel = 'draft' | 'basic' | 'strong' | 'excellent';

export interface JobReadinessItem {
  key: string;
  label: string;
  /** 'blocking' | 'recommended' | 'complete' | 'optional' */
  kind: 'blocking' | 'recommended' | 'complete' | 'optional';
  /** section id for jump-to scroll */
  sectionId?: string;
  /** icon name (bootstrap icons class suffix without 'bi-') */
  icon: string;
}

export interface JobReadinessSectionStatus {
  sectionId: string;
  label: string;
  complete: boolean;
  blocking: boolean;
}

export interface JobReadinessAction {
  label: string;
  sectionId?: string;
  routerLink?: string;
}

export interface JobReadinessResult {
  canPublish: boolean;
  readinessLevel: JobReadinessLevel;
  readinessPercent: number;
  requiredTotal: number;
  requiredComplete: number;
  recommendedTotal: number;
  recommendedComplete: number;
  blockingItems: JobReadinessItem[];
  recommendationItems: JobReadinessItem[];
  completedItems: JobReadinessItem[];
  optionalItems: JobReadinessItem[];
  sectionStatuses: JobReadinessSectionStatus[];
  publicDisplayWarnings: JobReadinessItem[];
  nextBestAction: JobReadinessAction | null;
}

/** Minimal shape the service needs from the job form value */
export interface JobReadinessInput {
  jobTitle?: string | null;
  jobTypeId?: number | null;
  jobLevelId?: number | null;
  jobCity?: string | null;
  jobCountry?: string | null;
  jobDescription?: string | null;
  jobDuties?: string | null;
  workSetupId?: number | null;
  jobBanner?: string | null;
  bannerFile?: any[];
  companyId?: string | null;
  skills?: any[];
  requirements?: any[];
  goodToHave?: any[];
  educationalBackground?: any[];
  certificationRequirements?: any[];
  interviewQuestions?: any[];
  interviewTemplateId?: string | null;
  // company context (passed separately, may be missing early in flow)
  companyLogoUrl?: string | null;
  companyDetails?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class JobReadinessService {
  /**
   * Evaluate job readiness. Pure function — no side effects, no subscriptions.
   * Safe to call in every form-value-changes emission (debounced externally).
   */
  evaluate(input: JobReadinessInput): JobReadinessResult {
    // ── Required-to-publish checks (mirrors publishJobPost() exactly) ──
    const hasTitle      = !!input.jobTitle?.trim();
    const hasJobType    = !!input.jobTypeId;
    const hasJobLevel   = !!input.jobLevelId;
    const hasCity       = !!(input.jobCity?.trim());
    const hasCountry    = !!(input.jobCountry?.trim());
    const hasDesc       = !!(input.jobDescription?.trim());
    const hasWorkSetup  = !!input.workSetupId;
    const hasBanner     = !!(input.bannerFile?.[0] || input.jobBanner?.trim());
    const hasCompany    = !!input.companyId;

    // Derived blocking items
    const blockingItems: JobReadinessItem[] = [];
    const completedRequired: JobReadinessItem[] = [];

    const pushRequired = (
      key: string, label: string, passed: boolean, sectionId: string, icon: string
    ) => {
      if (passed) {
        completedRequired.push({ key, label, kind: 'complete', sectionId, icon });
      } else {
        blockingItems.push({ key, label, kind: 'blocking', sectionId, icon });
      }
    };

    pushRequired('jobTitle',     'Job title',          hasTitle,     'section-job-title',     'card-heading');
    pushRequired('jobType',      'Employment type',    hasJobType,   'section-employment',    'briefcase');
    pushRequired('jobLevel',     'Job level',          hasJobLevel,  'section-job-level',     'bar-chart');
    pushRequired('jobCity',      'Job location (city)',hasCity,      'section-location',      'geo-alt');
    pushRequired('jobCountry',   'Job location (country)', hasCountry, 'section-location',    'geo-alt');
    pushRequired('description',  'Job description',    hasDesc,      'section-description',   'file-text');
    pushRequired('workSetup',    'Work setup',         hasWorkSetup, 'section-work-setup',    'building');
    pushRequired('banner',       'Job banner image',   hasBanner,    'section-banner',        'image');
    pushRequired('company',      'Company profile',    hasCompany,   'section-company',       'buildings');

    // ── Recommended checks (non-blocking) ──
    const hasJobDuties          = !!(input.jobDuties?.trim());
    const hasSkills             = (input.skills?.length ?? 0) > 0;
    const hasRequirements       = (input.requirements?.length ?? 0) > 0;
    const hasCompanyLogo        = !!(input.companyLogoUrl?.trim());
    const hasCompanyOverview    = !!(input.companyDetails?.trim());
    const hasInterviewQuestions = (input.interviewQuestions?.length ?? 0) > 0;
    const hasJobTypeDetail      = !!(input.jobTypeId || input.jobLevelId);
    const hasEducation          = (input.educationalBackground?.length ?? 0) > 0;

    const recommendationItems: JobReadinessItem[] = [];
    const completedRecommended: JobReadinessItem[] = [];

    const pushRec = (
      key: string, label: string, passed: boolean, sectionId: string, icon: string
    ) => {
      if (passed) {
        completedRecommended.push({ key, label, kind: 'complete', sectionId, icon });
      } else {
        recommendationItems.push({ key, label, kind: 'recommended', sectionId, icon });
      }
    };

    pushRec('duties',           'Responsibilities section',   hasJobDuties,        'section-duties',        'list-task');
    pushRec('skills',           'Skills',                     hasSkills,           'section-skills',        'tools');
    pushRec('requirements',     'Required qualifications',    hasRequirements,     'section-requirements',  'check2-square');
    pushRec('companyLogo',      'Company logo',               hasCompanyLogo,      'section-company',       'image');
    pushRec('companyOverview',  'Company overview',           hasCompanyOverview,  'section-company',       'info-circle');
    pushRec('interview',        'Interview questions',        hasInterviewQuestions,'section-interview',    'mic');
    pushRec('education',        'Educational background',     hasEducation,        'section-education',     'mortarboard');

    // ── Optional items (never block, purely informational) ──
    const optionalItems: JobReadinessItem[] = [
      { key: 'videoQuestions',   label: 'Video questions optional',   kind: 'optional', icon: 'camera-video' },
      { key: 'brandDetails',     label: 'Brand details optional',     kind: 'optional', icon: 'palette' },
      { key: 'certifications',   label: 'Certifications optional',    kind: 'optional', icon: 'patch-check' },
      { key: 'benefits',         label: 'Benefits optional',          kind: 'optional', icon: 'heart' },
    ];

    // ── Totals and percentages ──
    const requiredTotal     = blockingItems.length + completedRequired.length;
    const requiredComplete  = completedRequired.length;
    const recommendedTotal  = recommendationItems.length + completedRecommended.length;
    const recommendedComplete = completedRecommended.length;

    const canPublish = blockingItems.length === 0;

    const totalWeight = requiredTotal + recommendedTotal;
    const totalDone   = requiredComplete + recommendedComplete;
    const readinessPercent = totalWeight === 0 ? 0
      : Math.min(100, Math.round((totalDone / totalWeight) * 100));

    // ── Readiness level ──
    let readinessLevel: JobReadinessLevel;
    if (!canPublish) {
      readinessLevel = 'draft';
    } else if (recommendedComplete < 3) {
      readinessLevel = 'basic';
    } else if (recommendedComplete < recommendedTotal) {
      readinessLevel = 'strong';
    } else {
      readinessLevel = 'excellent';
    }

    // ── Section statuses ──
    const sectionStatuses: JobReadinessSectionStatus[] = [
      {
        sectionId: 'section-job-title',
        label: 'Job title',
        complete: hasTitle,
        blocking: !hasTitle,
      },
      {
        sectionId: 'section-employment',
        label: 'Employment type',
        complete: hasJobType && hasJobLevel,
        blocking: !hasJobType || !hasJobLevel,
      },
      {
        sectionId: 'section-location',
        label: 'Location',
        complete: hasCity && hasCountry,
        blocking: !hasCity || !hasCountry,
      },
      {
        sectionId: 'section-description',
        label: 'Description',
        complete: hasDesc,
        blocking: !hasDesc,
      },
      {
        sectionId: 'section-work-setup',
        label: 'Work setup',
        complete: hasWorkSetup,
        blocking: !hasWorkSetup,
      },
      {
        sectionId: 'section-banner',
        label: 'Banner image',
        complete: hasBanner,
        blocking: !hasBanner,
      },
      {
        sectionId: 'section-company',
        label: 'Company',
        complete: hasCompany,
        blocking: !hasCompany,
      },
      {
        sectionId: 'section-duties',
        label: 'Responsibilities',
        complete: hasJobDuties,
        blocking: false,
      },
      {
        sectionId: 'section-skills',
        label: 'Skills',
        complete: hasSkills,
        blocking: false,
      },
      {
        sectionId: 'section-requirements',
        label: 'Qualifications',
        complete: hasRequirements,
        blocking: false,
      },
      {
        sectionId: 'section-interview',
        label: 'Interview questions',
        complete: hasInterviewQuestions,
        blocking: false, // B04: NEVER blocking
      },
    ];

    // ── Public display warnings (things missing that affect candidate-facing quality) ──
    const publicDisplayWarnings: JobReadinessItem[] = [];
    if (!hasSkills) {
      publicDisplayWarnings.push({
        key: 'skills', label: 'Add skills to help candidates understand requirements',
        kind: 'recommended', sectionId: 'section-skills', icon: 'tools'
      });
    }
    if (!hasDesc) {
      publicDisplayWarnings.push({
        key: 'description', label: 'Job description is required for candidates to evaluate this role',
        kind: 'blocking', sectionId: 'section-description', icon: 'file-text'
      });
    }

    // ── Next best action ──
    let nextBestAction: JobReadinessAction | null = null;
    if (blockingItems.length > 0) {
      const first = blockingItems[0];
      nextBestAction = {
        label: `Add ${first.label.toLowerCase()} to enable publishing`,
        sectionId: first.sectionId,
      };
    } else if (recommendationItems.length > 0) {
      const first = recommendationItems[0];
      nextBestAction = {
        label: `Add ${first.label.toLowerCase()} to strengthen your job post`,
        sectionId: first.sectionId,
      };
    }

    // ── All completed items (required + recommended) ──
    const allCompleted = [...completedRequired, ...completedRecommended].map(
      item => ({ ...item, kind: 'complete' as const })
    );

    return {
      canPublish,
      readinessLevel,
      readinessPercent,
      requiredTotal,
      requiredComplete,
      recommendedTotal,
      recommendedComplete,
      blockingItems,
      recommendationItems,
      completedItems: allCompleted,
      optionalItems,
      sectionStatuses,
      publicDisplayWarnings,
      nextBestAction,
    };
  }

  /** Convenience: return a CSS color class for a readiness level */
  getLevelClass(level: JobReadinessLevel): string {
    switch (level) {
      case 'draft':      return 'jrb-level--draft';
      case 'basic':      return 'jrb-level--basic';
      case 'strong':     return 'jrb-level--strong';
      case 'excellent':  return 'jrb-level--excellent';
    }
  }

  /** Convenience: return display copy for a readiness level */
  getLevelLabel(level: JobReadinessLevel): string {
    switch (level) {
      case 'draft':      return 'Draft — required fields missing';
      case 'basic':      return 'Required fields complete';
      case 'strong':     return 'Strong job post';
      case 'excellent':  return 'Excellent readiness';
    }
  }
}
