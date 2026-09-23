import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { CoreService } from '@app-core/services/core.service';
import {
  JobOpeningAlertsService,
  buildJobAlertsReturnUrl,
  hasJobAlertSession,
  isJobSeekerRole,
  jobAlertEntryVisible,
  jobOpeningAlertErrorMessage,
  normalizeJobRoleId,
} from '@main/jobs/job-opening-alerts.service';
import { rememberReturnUrl } from '@app-shared/utils/auth-return-url.util';

/**
 * "Get alerts for this position" for guests and job seekers (role 3).
 * Guests are sent to sign-in and returned to /job-alerts with the position
 * prefilled. Signed-in employers and admins do not see the button.
 */
@Component({
  selector: 'app-job-alert-subscribe',
  templateUrl: './job-alert-subscribe.component.html',
  styleUrls: ['./job-alert-subscribe.component.scss'],
  host: {
    '[class.gh-job-alert-subscribe--inline]': '!block',
    '[class.gh-job-alert-subscribe--hidden]': '!visible',
  },
})
export class JobAlertSubscribeComponent implements OnInit {
  @Input() position: string | null | undefined = null;
  @Input() jobRoleId: number | null | undefined = null;
  @Input() label = 'Get alerts for this position';
  @Input() block = true;

  busy = false;
  visible = jobAlertEntryVisible();

  constructor(
    private alerts: JobOpeningAlertsService,
    private router: Router,
    private snackbar: SnackbarService,
    private core: CoreService,
  ) {}

  ngOnInit(): void {
    if (!hasJobAlertSession()) {
      this.visible = true;
      return;
    }
    this.visible = jobAlertEntryVisible();
    this.core.getRole().then((role) => {
      this.visible = isJobSeekerRole(role);
    }).catch(() => {
      this.visible = false;
    });
  }

  onClick(event: Event): void {
    event.stopPropagation();
    if (this.busy) return;

    const position = (this.position || '').trim();
    if (!position) {
      this.snackbar.error('This job has no position title to follow.');
      return;
    }

    if (!hasJobAlertSession()) {
      rememberReturnUrl(buildJobAlertsReturnUrl(position, this.jobRoleId), 3);
      this.snackbar.info('Sign in to get alerts for this position.');
      this.router.navigate(['/signin'], { queryParams: { role: 3 } });
      return;
    }

    this.busy = true;
    this.core.getRole().then((role) => {
      if (!isJobSeekerRole(role)) {
        this.busy = false;
        this.visible = false;
        this.snackbar.error(jobOpeningAlertErrorMessage({ status: 403 }));
        return;
      }
      this.alerts.create(position, normalizeJobRoleId(this.jobRoleId)).subscribe({
        next: (result) => {
          this.busy = false;
          this.snackbar.success(result.created
            ? `Alerts on for "${position}". We emailed the newest matching jobs.`
            : `You're already getting alerts for "${position}".`);
        },
        error: (err) => {
          this.busy = false;
          this.snackbar.error(jobOpeningAlertErrorMessage(err));
        },
      });
    }).catch(() => {
      this.busy = false;
      this.snackbar.error('Could not confirm your account. Please sign in again.');
    });
  }
}
