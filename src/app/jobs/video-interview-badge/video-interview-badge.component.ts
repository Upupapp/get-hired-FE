import { Component, Input } from '@angular/core';
import { NormalizedJob } from '@main/public/services/public-job-normalizer.model';
import { PublicPortalAnalyticsService } from '@main/public/services/public-portal-analytics.service';

/**
 * Video interview badge/explainer (GH-ACT-022). Shown only when
 * job.hasVideoInterview is true -- never fabricated, derived from real
 * interviewQuestions/interviewTemplateId data (see public-job-normalizer).
 * Surfaces the existing RecordRTC-backed recorder's existence to set
 * expectations before the applicant starts applying -- does not rebuild or
 * simulate the recorder itself.
 */
@Component({
  selector: 'app-video-interview-badge',
  templateUrl: './video-interview-badge.component.html',
  styleUrls: ['./video-interview-badge.component.scss'],
})
export class VideoInterviewBadgeComponent {
  @Input() job!: NormalizedJob;
  expanded = false;

  constructor(private analytics: PublicPortalAnalyticsService) {}

  toggle(): void {
    this.expanded = !this.expanded;
    if (this.expanded && this.job) {
      this.analytics.trackVideoInterviewBadgeClicked(this.job.jobId);
    }
  }
}
