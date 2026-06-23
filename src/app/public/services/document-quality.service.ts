import { Injectable } from '@angular/core';
import { Applicant } from '@app-applicant/applicant.model';
import { DocumentQualityResult } from './document-quality.model';

/**
 * Deterministic, frontend-only document-readiness scoring. Net-new — no
 * backend equivalent exists today.
 *
 * Note: Applicant.documents[] has no category/type discriminator in the
 * current data model (Documents.type is a raw MIME type, e.g.
 * "application/pdf", not a "resume" vs "cover letter" label) — confirmed by
 * repo-wide search, no such discriminator is used anywhere in the applicant
 * module. So "hasResume" here is a best-effort proxy ("has at least one
 * uploaded document"), not a verified resume detection. Do not present this
 * to the user as "resume detected" — use "document uploaded" framing instead.
 */
const WEIGHTS = {
  anyDocument: 70,
  videoCV: 30,
};

@Injectable({ providedIn: 'root' })
export class DocumentQualityService {

  evaluate(applicant: Applicant | null | undefined): DocumentQualityResult {
    const documentCount = applicant?.documents?.length ?? 0;
    const hasVideoCV = !!applicant?.videoCVUrl;
    const hasResume = documentCount > 0;

    let score = 0;
    const missingFields: string[] = [];
    const suggestions: string[] = [];

    if (hasResume) {
      score += WEIGHTS.anyDocument;
    } else {
      missingFields.push('Resume or supporting document');
      suggestions.push('Upload your resume once and use it across applications.');
    }

    if (hasVideoCV) {
      score += WEIGHTS.videoCV;
    } else {
      missingFields.push('Video introduction (optional)');
      suggestions.push('Add a short video CV to stand out — optional, but helpful.');
    }

    return {
      score,
      label: this.labelFor(score),
      hasResume,
      hasVideoCV,
      documentCount,
      missingFields,
      suggestions,
    };
  }

  private labelFor(score: number): DocumentQualityResult['label'] {
    if (score >= 70) return 'Ready';
    if (score >= 40) return 'Almost Ready';
    return 'Needs Documents';
  }
}
