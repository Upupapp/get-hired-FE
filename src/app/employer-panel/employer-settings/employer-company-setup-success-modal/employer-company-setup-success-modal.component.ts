import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { catchError, filter, take, takeUntil, timeout } from 'rxjs/operators';
import { of } from 'rxjs';
import { CompanyFacade } from '@app-company/state/company.facade';
import { HapticFeedbackService } from '@app-shared/services/haptic-feedback/haptic-feedback.service';

export interface SetupSuccessModalData {
  companyId: string;
  companyName: string;
  companySlug: string;
  profileCompleteness: number;
}

type TrialBadgeState = 'checking' | 'trial' | 'paid' | 'unknown';

@Component({
  selector: 'app-employer-company-setup-success-modal',
  templateUrl: './employer-company-setup-success-modal.component.html',
  styleUrls: ['./employer-company-setup-success-modal.component.scss']
})
export class EmployerCompanySetupSuccessModalComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  companyId: string = '';
  companyName: string = '';
  companySlug: string = '';
  profileCompleteness: number = 0;

  // Never assumed active just because company setup succeeded -- backend
  // trial activation (createCompanySubscription) is fire-and-forget and can
  // silently no-op (see companiesController.js comment: "subscription table
  // may not exist yet on this environment. Company creation succeeds
  // regardless"). This reads the actual persisted state via the existing
  // getCompanySubscription facade call (same one company-users.component.ts
  // already uses) rather than trusting the happy path.
  trialState: TrialBadgeState = 'checking';
  trialEndsAt: Date | null = null;

  get checklist(): { label: string; done: boolean }[] {
    return [
      { label: 'Company created', done: true },
      { label: this.trialChecklistLabel, done: this.trialState === 'trial' || this.trialState === 'paid' },
      { label: 'Post your first job', done: false },
      { label: 'Complete company profile', done: this.profileCompleteness >= 90 },
    ];
  }

  get trialChecklistLabel(): string {
    if (this.trialState === 'trial') { return 'Free trial activated — 7 days full access'; }
    if (this.trialState === 'paid') { return 'Subscription active'; }
    if (this.trialState === 'checking') { return 'Checking trial status…'; }
    return 'Trial status unavailable — check billing';
  }

  get trialBadgeText(): string {
    if (this.trialState === 'trial') {
      if (this.trialEndsAt) {
        const formatted = this.trialEndsAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `Trial active until ${formatted}`;
      }
      return 'Trial active';
    }
    if (this.trialState === 'paid') { return 'Subscription active'; }
    if (this.trialState === 'checking') { return "We're checking your trial status"; }
    return "We're checking your trial status";
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SetupSuccessModalData,
    private dialogRef: MatDialogRef<EmployerCompanySetupSuccessModalComponent>,
    private router: Router,
    private companyFacade: CompanyFacade,
    private haptic: HapticFeedbackService,
  ) {}

  ngOnInit(): void {
    this.companyId = (this.data && this.data.companyId) ? this.data.companyId : '';
    this.companyName = (this.data && this.data.companyName) ? this.data.companyName : 'Your company';
    this.companySlug = (this.data && this.data.companySlug) ? this.data.companySlug : '';
    this.profileCompleteness = (this.data && this.data.profileCompleteness) ? this.data.profileCompleteness : 0;

    try {
      sessionStorage.setItem('gh_company_setup_success_seen', '1');
    } catch (_) {}

    if (this.companyId) {
      this.companyFacade.getCompanySubscription(this.companyId);
      this.companyFacade.subsRestrictions$.pipe(
        filter(subs => !!subs),
        take(1),
        timeout(6000),
        catchError(() => of(null)),
        takeUntil(this.unsubscribe$)
      ).subscribe(subs => {
        if (!subs) {
          this.trialState = 'unknown';
          return;
        }
        if (subs.subscriptionId === 1) {
          this.trialState = 'trial';
          this.trialEndsAt = subs.endAt ? new Date(subs.endAt) : null;
        } else if (subs.isPaid) {
          this.trialState = 'paid';
        } else {
          this.trialState = 'unknown';
        }
      });
    } else {
      this.trialState = 'unknown';
    }
  }

  postFirstJob(): void {
    this.haptic.selection();
    this.dialogRef.close('post_job');
    this.router.navigate(['/recruiter/jobs/create']);
  }

  completeProfile(): void {
    this.haptic.selection();
    this.dialogRef.close('complete_profile');
    this.router.navigate(['/recruiter/company/settings']);
  }

  goToDashboard(): void {
    this.haptic.selection();
    this.dialogRef.close('dashboard');
    this.router.navigate(['/recruiter/dashboard']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
