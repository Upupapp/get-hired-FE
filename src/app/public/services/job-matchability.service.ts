import { Injectable } from '@angular/core';
import { NormalizedJob } from './public-job-normalizer.model';

export type MatchabilityLabel = 'Highly Matchable' | 'Matchable' | 'Limited Matching Clarity' | 'Needs Clearer Job Details';

export interface MatchabilityFactor {
  key: string;
  label: string;
  weight: number;
  met: boolean;
  cta?: string;
}

export interface JobMatchabilityResult {
  score: number;
  label: MatchabilityLabel;
  factors: MatchabilityFactor[];
  topActions: string[];
}

/**
 * MATCH v3 -- Job Post Matchability Score (Layer 1). Deterministic,
 * frontend-only, scores a job POST's own clarity/completeness -- never the
 * applicant. A weak job post lowers match confidence for applicants
 * viewing it; it never penalizes the applicant's own score (see
 * GETHIRED_MATCH_V3_SCORING_MODEL.md Layer 1).
 *
 * Deliberately has zero dependency on applicant data, CV data, or any of
 * the missing backend tables -- it only reads fields already present on a
 * NormalizedJob, so it can run today, including live in the job-creation
 * preview step before a job is even published.
 *
 * Weights match the registered spec exactly (=100 total).
 */
@Injectable({ providedIn: 'root' })
export class JobMatchabilityService {

  evaluate(job: NormalizedJob): JobMatchabilityResult {
    if (!job) {
      return { score: 0, label: 'Needs Clearer Job Details', factors: [], topActions: ['Add job details to see your matchability score.'] };
    }

    const factors: MatchabilityFactor[] = [
      this.titleFactor(job),
      this.responsibilitiesFactor(job),
      this.requiredSkillsFactor(job),
      this.preferredSkillsFactor(job),
      this.experienceLevelFactor(job),
      this.locationWorkSetupFactor(job),
      this.educationFactor(job),
      this.scheduleSalaryFactor(job),
      this.applicationRequirementsFactor(job),
      this.requiredPreferredSeparationFactor(job),
    ];

    const score = factors.reduce((sum, f) => sum + (f.met ? f.weight : 0), 0);
    const topActions = factors
      .filter(f => !f.met && f.cta)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map(f => f.cta!);

    return { score, label: this.labelFor(score), factors, topActions };
  }

  private labelFor(score: number): MatchabilityLabel {
    if (score >= 85) return 'Highly Matchable';
    if (score >= 70) return 'Matchable';
    if (score >= 50) return 'Limited Matching Clarity';
    return 'Needs Clearer Job Details';
  }

  private titleFactor(job: NormalizedJob): MatchabilityFactor {
    const met = !!job.title && job.title !== 'Untitled role' && job.title.trim().length >= 3;
    return { key: 'title', label: 'Clear job title', weight: 10, met, cta: met ? undefined : 'Add a clear job title.' };
  }

  private responsibilitiesFactor(job: NormalizedJob): MatchabilityFactor {
    const met = !!job.responsibilities && job.responsibilities.trim().length >= 20;
    return { key: 'responsibilities', label: 'Responsibilities present', weight: 15, met, cta: met ? undefined : 'Add clearer responsibilities to improve match signals.' };
  }

  private requiredSkillsFactor(job: NormalizedJob): MatchabilityFactor {
    const met = (job.skills?.length ?? 0) > 0;
    return { key: 'required_skills', label: 'Required skills present', weight: 20, met, cta: met ? undefined : 'Add required skills to improve applicant match signals.' };
  }

  private preferredSkillsFactor(job: NormalizedJob): MatchabilityFactor {
    const met = (job.goodToHave?.length ?? 0) > 0;
    return { key: 'preferred_skills', label: 'Preferred skills present', weight: 10, met, cta: met ? undefined : 'Add preferred (good-to-have) skills.' };
  }

  private experienceLevelFactor(job: NormalizedJob): MatchabilityFactor {
    const met = job.jobLevelId != null;
    return { key: 'experience_level', label: 'Experience level present', weight: 10, met, cta: met ? undefined : 'Add an experience level.' };
  }

  private locationWorkSetupFactor(job: NormalizedJob): MatchabilityFactor {
    const met = job.workSetupId != null && !!job.location;
    return { key: 'location_work_setup', label: 'Location/work setup present', weight: 10, met, cta: met ? undefined : 'Add work setup and location.' };
  }

  private educationFactor(job: NormalizedJob): MatchabilityFactor {
    const met = (job.educationalBackground?.length ?? 0) > 0;
    return { key: 'education', label: 'Education/certification clarity', weight: 10, met, cta: met ? undefined : 'Add education or certification requirements if relevant.' };
  }

  private scheduleSalaryFactor(job: NormalizedJob): MatchabilityFactor {
    const met = job.jobTypeId != null || job.hasSalary;
    return { key: 'schedule_salary', label: 'Employment type/schedule/salary if available', weight: 5, met };
  }

  private applicationRequirementsFactor(job: NormalizedJob): MatchabilityFactor {
    // Every published job already has an implicit application path -- this
    // factor is about whether job-specific requirements (skills, badges)
    // are present to evaluate against, not whether applying is possible.
    const met = (job.skills?.length ?? 0) > 0 || (job.requirements?.length ?? 0) > 0;
    return { key: 'application_requirements', label: 'Application requirements clear', weight: 5, met };
  }

  private requiredPreferredSeparationFactor(job: NormalizedJob): MatchabilityFactor {
    const met = (job.skills?.length ?? 0) > 0 && (job.goodToHave?.length ?? 0) > 0;
    return { key: 'required_preferred_separation', label: 'Required vs preferred separation', weight: 5, met, cta: met ? undefined : 'Separate required and preferred skills for fairer matching.' };
  }
}
