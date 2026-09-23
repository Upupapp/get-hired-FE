import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { JobOpeningAlertsService } from '@main/jobs/job-opening-alerts.service';

/**
 * Dashboard entry for seeker job alerts. Sits above Recommended jobs and
 * sends "Add alert" to the existing /job-alerts manage page with the
 * Position field focused. Seekers only — this panel is already role-gated.
 */
@Component({
  selector: 'app-job-alerts-entry',
  templateUrl: './job-alerts-entry.component.html',
  styleUrls: ['./job-alerts-entry.component.scss'],
})
export class JobAlertsEntryComponent implements OnInit, OnDestroy {
  subscriptionCount = 0;
  private listSub: Subscription | null = null;

  constructor(private alerts: JobOpeningAlertsService) {}

  ngOnInit(): void {
    this.listSub = this.alerts.list().subscribe({
      next: (rows) => {
        this.subscriptionCount = rows.length;
      },
      error: () => {
        this.subscriptionCount = 0;
      },
    });
  }

  ngOnDestroy(): void {
    if (this.listSub) this.listSub.unsubscribe();
  }

  get primaryLabel(): string {
    return this.subscriptionCount > 0 ? 'Add another' : 'Add alert';
  }

  /** Scroll the manage page to the list once the seeker already follows a position. */
  get manageFragment(): string | undefined {
    return this.subscriptionCount > 0 ? 'positions' : undefined;
  }
}
