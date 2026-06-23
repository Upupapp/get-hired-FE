import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NormalizedJob } from '@main/public/services/public-job-normalizer.model';
import { PublicPortalAnalyticsService } from '@main/public/services/public-portal-analytics.service';

/**
 * "Who's hiring" trust layer on the job detail page (GH-ACT-023).
 *
 * Deliberately built entirely from fields already present on the
 * /job/details response (companyName/companyLogo/companyDetails/
 * companyCity/companyCountry/companyNumberOfEmployee) rather than making a
 * second call to /company/details -- avoids depending on an endpoint that
 * was, until this session's STITCH pass, broken for any company without an
 * industry set (see PUBLIC_JOB_PORTAL_REDESIGN.md §1.6). Degrades
 * gracefully field-by-field; never shows "null" or a broken layout when a
 * company hasn't filled in every field. Never adds a fake "verified" badge
 * -- companyRating is hard-coded to 0 server-side and is never surfaced
 * here as a real rating (same rule already documented in the normalizer).
 */
@Component({
  selector: 'app-company-snapshot',
  templateUrl: './company-snapshot.component.html',
  styleUrls: ['./company-snapshot.component.scss'],
})
export class CompanySnapshotComponent {
  @Input() job!: NormalizedJob;

  constructor(
    private router: Router,
    private analytics: PublicPortalAnalyticsService,
  ) {}

  get locationLine(): string | null {
    if (this.job?.companyCity && this.job?.companyCountry) {
      return `${this.job.companyCity}, ${this.job.companyCountry}`;
    }
    return this.job?.companyCity ?? this.job?.companyCountry ?? null;
  }

  viewCompany(): void {
    if (!this.job?.companyId) {
      return;
    }
    this.analytics.trackCompanyPreviewClicked(this.job.companyId);
    this.router.navigate(['/companies/details'], { queryParams: { id: this.job.companyId } });
  }
}
