import { Injectable } from '@angular/core';
import { BaseService } from '@main/core/services/base.service';
import { environment } from 'environments/environment';

/**
 * Applicant's own "My Applications" list (GH-ACT applicant-experience
 * work). Calls the existing /candidates/appliedjobslist endpoint -- it
 * lives under the recruiter-shaped "candidates" route group in the
 * backend, but had zero frontend consumers anywhere in the repo before
 * this, so it's being adopted here as the applicant-self-view, scoped
 * server-side to the authenticated caller's own uid (fixed alongside this
 * change -- see GETHIRED_APPLICANT_IMPLEMENTATION_LOG.md).
 *
 * Reads from job_applicants/job_applicant_status, both of which are
 * confirmed to exist in the live schema (unlike the applicant profile
 * tables) -- this is genuinely functional today, not blocked.
 */
@Injectable({ providedIn: 'root' })
export class ApplicantApplicationsService {
  private applicationsUrl = `${environment.api_url}/candidates/appliedjobslist`;

  constructor(private baseService: BaseService) {}

  getMyApplications() {
    return this.baseService.get<any>(this.applicationsUrl);
  }
}
