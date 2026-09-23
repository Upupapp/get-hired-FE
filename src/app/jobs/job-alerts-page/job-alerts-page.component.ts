import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { SeoService } from '@app-core/services/seo.service';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';
import {
  JOB_OPENING_ALERT_LIMIT,
  JobOpeningAlertSubscription,
  JobOpeningAlertsService,
  jobOpeningAlertErrorMessage,
  normalizeJobRoleId,
} from '../job-opening-alerts.service';

@Component({
  selector: 'app-job-alerts-page',
  templateUrl: './job-alerts-page.component.html',
  styleUrls: ['./job-alerts-page.component.scss'],
})
export class JobAlertsPageComponent implements OnInit, OnDestroy {
  readonly limit = JOB_OPENING_ALERT_LIMIT;

  position = new FormControl('', [Validators.required, Validators.maxLength(120)]);
  subscriptions: JobOpeningAlertSubscription[] = [];
  loading = true;
  loaded = false;
  loadError: string | null = null;
  formError: string | null = null;
  submitting = false;
  removingId: string | number | null = null;

  private linkedJobRoleId: number | undefined;
  private prefilledPosition = '';
  private listSub: Subscription | null = null;

  constructor(
    private alerts: JobOpeningAlertsService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackbar: SnackbarService,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.setPageMeta({
      title: 'Job opening alerts | GetHired Online',
      description: 'Manage the positions you want job opening alerts for.',
      robots: 'noindex, nofollow',
    });

    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      const position = (params.get('position') || '').trim();
      if (!position) return;
      this.prefilledPosition = position;
      this.linkedJobRoleId = normalizeJobRoleId(params.get('jobRoleId'));
      this.position.setValue(position);
      this.position.markAsPristine();
    });

    this.load();
  }

  ngOnDestroy(): void {
    if (this.listSub) this.listSub.unsubscribe();
  }

  get atCap(): boolean {
    return this.loaded && !this.loadError && this.subscriptions.length >= this.limit;
  }

  load(): void {
    if (this.listSub) this.listSub.unsubscribe();
    this.loading = true;
    this.loadError = null;
    this.listSub = this.alerts.list().subscribe({
      next: (subscriptions) => {
        this.subscriptions = subscriptions;
        this.loading = false;
        this.loaded = true;
      },
      error: (err) => {
        this.loading = false;
        this.loaded = true;
        this.loadError = jobOpeningAlertErrorMessage(err);
      },
    });
  }

  add(): void {
    this.formError = null;
    const value = (this.position.value || '').trim();
    if (!value) {
      this.position.markAsTouched();
      this.formError = 'Enter a position to follow.';
      return;
    }
    if (value.length > 120) {
      this.position.markAsTouched();
      this.formError = 'Use 120 characters or fewer.';
      return;
    }
    if (this.atCap) {
      this.formError = `You can follow up to ${this.limit} positions. Unsubscribe from one to add another.`;
      return;
    }
    if (this.submitting) return;

    const jobRoleId = value === this.prefilledPosition ? this.linkedJobRoleId : undefined;
    this.submitting = true;
    this.alerts.create(value, jobRoleId).subscribe({
      next: (result) => {
        this.submitting = false;
        this.position.reset('');
        this.prefilledPosition = '';
        this.linkedJobRoleId = undefined;
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { position: null, jobRoleId: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
        this.snackbar.success(result.created
          ? `Alerts on for "${value}". We emailed the newest matching jobs.`
          : `You're already getting alerts for "${value}".`);
        this.load();
      },
      error: (err) => {
        this.submitting = false;
        this.formError = jobOpeningAlertErrorMessage(err);
      },
    });
  }

  confirmUnsubscribe(item: JobOpeningAlertSubscription): void {
    if (this.removingId != null) return;
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Unsubscribe from this position?',
        message: `Stop alerts for "${item.position}"? You will no longer get the weekly email for this position.`,
        confirmLabel: 'Unsubscribe',
        cancelLabel: 'Keep alerts',
        destructive: true,
      },
    }).afterClosed().subscribe((answer) => {
      if (answer !== 1) return;
      this.remove(item);
    });
  }

  trackById(_index: number, item: JobOpeningAlertSubscription): string {
    return String(item.id);
  }

  private remove(item: JobOpeningAlertSubscription): void {
    this.removingId = item.id;
    this.alerts.unsubscribe(item.id).subscribe({
      next: () => {
        this.removingId = null;
        this.subscriptions = this.subscriptions.filter((row) => row.id !== item.id);
        this.snackbar.success(`Unsubscribed from "${item.position}".`);
      },
      error: (err) => {
        this.removingId = null;
        this.snackbar.error(jobOpeningAlertErrorMessage(err));
      },
    });
  }
}
