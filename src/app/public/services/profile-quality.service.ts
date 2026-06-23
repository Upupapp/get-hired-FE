import { Injectable } from '@angular/core';
import { Applicant } from '@app-applicant/applicant.model';
import { ProfileQualityResult } from './profile-quality.model';

/**
 * Deterministic, frontend-only profile-quality scoring. No equivalent
 * exists in the backend today (confirmed in PUBLIC_JOB_PORTAL_REDESIGN.md
 * §1.8) — this is net-new, not a reuse of existing logic.
 *
 * Weighting is intentionally simple and explainable: each missing item
 * removes a fixed number of points rather than using an opaque formula,
 * so "what would improve my score" suggestions map 1:1 to the deduction.
 */
const WEIGHTS = {
  basicInfo: 20,      // jobTitle, shortBio, contactNumber, city/country
  workSetupPrefs: 10, // workSetUpId, jobTypeId, jobLevelId
  salaryPrefs: 10,    // salaryMinimum/Maximum
  workExperience: 20,
  education: 15,
  skills: 15,
  photoOrVideo: 10,   // photoUrl or videoCVUrl
};

@Injectable({ providedIn: 'root' })
export class ProfileQualityService {

  evaluate(applicant: Applicant | null | undefined): ProfileQualityResult {
    if (!applicant) {
      return {
        score: 0,
        label: 'Just Started',
        missingFields: ['Create your profile to get started.'],
        suggestions: ['Create your free profile to unlock match grades.'],
      };
    }

    let score = 0;
    const missingFields: string[] = [];
    const suggestions: string[] = [];

    if (applicant.jobTitle && applicant.shortBio && applicant.contactNumber && applicant.city && applicant.country) {
      score += WEIGHTS.basicInfo;
    } else {
      missingFields.push('Basic profile info (title, bio, contact, location)');
      suggestions.push('Complete your basic profile info.');
    }

    if (applicant.workSetUpId && applicant.jobTypeId && applicant.jobLevelId) {
      score += WEIGHTS.workSetupPrefs;
    } else {
      missingFields.push('Work preferences (setup, job type, level)');
      suggestions.push('Add your preferred work setup and job level.');
    }

    if (applicant.salaryMinimum && applicant.salaryMaximum) {
      score += WEIGHTS.salaryPrefs;
    } else {
      missingFields.push('Salary expectations');
      suggestions.push('Add your expected salary range.');
    }

    if ((applicant.workExperience?.length ?? 0) > 0) {
      score += WEIGHTS.workExperience;
    } else {
      missingFields.push('Work experience');
      suggestions.push('Add at least one work experience entry.');
    }

    if ((applicant.educationalBackground?.length ?? 0) > 0) {
      score += WEIGHTS.education;
    } else {
      missingFields.push('Education');
      suggestions.push('Add your educational background.');
    }

    if ((applicant.skills?.length ?? 0) > 0) {
      score += WEIGHTS.skills;
    } else {
      missingFields.push('Skills');
      suggestions.push('Add skills to improve your match.');
    }

    if (applicant.photoUrl || applicant.videoCVUrl) {
      score += WEIGHTS.photoOrVideo;
    } else {
      missingFields.push('Profile photo or video CV');
      suggestions.push('Add a profile photo or short video introduction.');
    }

    return {
      score,
      label: this.labelFor(score),
      missingFields,
      suggestions,
    };
  }

  private labelFor(score: number): ProfileQualityResult['label'] {
    if (score >= 85) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 30) return 'Needs Work';
    return 'Just Started';
  }
}
