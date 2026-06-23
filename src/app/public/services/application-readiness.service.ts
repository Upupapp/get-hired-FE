import { Injectable } from '@angular/core';
import { Applicant } from '@app-applicant/applicant.model';
import { NormalizedJob } from './public-job-normalizer.model';
import { ProfileQualityService } from './profile-quality.service';
import { DocumentQualityService } from './document-quality.service';
import { ApplicationReadinessResult, ApplicationReadinessState } from './application-readiness.model';

/**
 * Combines profile quality + document quality + this job's video-interview
 * requirement into a single "am I ready to apply" read, per
 * PUBLIC_JOB_PORTAL_REDESIGN.md Phase 10 rules:
 *   - Low match never blocks applying.
 *   - Missing optional items never block applying.
 *   - Only a job-required item the applicant truly lacks blocks applying
 *     (today, that's only "this job needs a video answer and you have no
 *     way to record one yet" — there is no other backend-enforced required
 *     field today, so blocksApply is rare by design).
 */
@Injectable({ providedIn: 'root' })
export class ApplicationReadinessService {

  constructor(
    private profileQuality: ProfileQualityService,
    private documentQuality: DocumentQualityService,
  ) {}

  evaluate(applicant: Applicant | null | undefined, job: NormalizedJob): ApplicationReadinessResult {
    if (!applicant) {
      return {
        state: 'incomplete_application',
        label: 'Create your profile first',
        description: 'Create a free profile to apply with confidence.',
        reasons: ['No profile found yet.'],
        blocksApply: false,
        ctaLabel: 'Create free profile',
      };
    }

    const profile = this.profileQuality.evaluate(applicant);
    const documents = this.documentQuality.evaluate(applicant);
    const needsVideoPrep = job.hasVideoInterview;

    if (profile.score < 30) {
      return this.build('needs_profile_update', 'Needs Profile Update',
        'A few more profile details will strengthen this application.',
        profile.suggestions, false, 'Improve profile');
    }

    if (documents.documentCount === 0) {
      return this.build('missing_required_documents', 'Missing Required Documents',
        'Upload your resume once and use it across applications.',
        documents.suggestions, false, 'Upload resume');
    }

    if (needsVideoPrep) {
      return this.build('video_answer_required', 'Video Answer Required',
        'This job includes short video questions — prepare when you\'re ready.',
        ['Prepare your video answers before submitting.'], false, 'Prepare video answer');
    }

    if (profile.score < 70 || documents.score < 70) {
      return this.build('almost_ready', 'Almost Ready',
        'You can apply now, but a couple of quick updates may strengthen your application.',
        [...profile.suggestions, ...documents.suggestions], false, 'Apply now');
    }

    return this.build('ready', 'Ready to Apply',
      'Your profile and documents look great — you\'re ready to apply.',
      [], false, 'Apply now');
  }

  private build(
    state: ApplicationReadinessState,
    label: string,
    description: string,
    reasons: string[],
    blocksApply: boolean,
    ctaLabel: string,
  ): ApplicationReadinessResult {
    return { state, label, description, reasons, blocksApply, ctaLabel };
  }
}
