import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmployerPlanLimitRefusal, PlanLimitChoice } from '@main/shared/plan-limit/plan-limit-refusal';

const ENTITLEMENT_LABELS: Record<string, string> = {
  active_job_posts: 'Active job posts',
  admin_users: 'Team members',
  video_questions_per_job: 'Video questions per job',
  recruitment_storage_bytes: 'Recruitment Storage',
  applicants: 'Applicants',
  video_responses: 'Video responses',
};

/**
 * Renders gh-be A3's employer refusal (HTTP 402) exactly as sent. It never claims the work
 * was saved unless the backend says so: a refused publish saved nothing, so the draft is
 * offered as a choice, and the screen that opened the modal carries it out.
 */
@Component({
  selector: 'app-subscription-limit-modal',
  template: `
    <div class="limit-modal" [attr.aria-label]="title">
      <div class="limit-modal__header">
        <div class="limit-modal__icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="#FF7062" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 9v4M12 17h.01" stroke="#FF7062" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <button class="limit-modal__close" type="button" mat-dialog-close aria-label="Close dialog">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="limit-modal__body">
        <h2 class="limit-modal__title">{{ title }}</h2>
        <p class="limit-modal__message">{{ data.userMessage }}</p>

        <div class="limit-modal__meter" *ngIf="hasMeter" role="img" [attr.aria-label]="entitlementLabel + ': ' + data.used + ' of ' + data.limit + ' used'">
          <div class="limit-modal__meter-track">
            <div class="limit-modal__meter-fill" [style.width.%]="fillPercent"></div>
          </div>
          <div class="limit-modal__meter-label">
            <span>{{ data.used }} used</span>
            <span>{{ data.limit }} included</span>
          </div>
        </div>

        <div class="limit-modal__unlocks" *ngIf="data.recommendedPlanName && data.unlocks?.length">
          <p class="limit-modal__unlocks-label">{{ data.recommendedPlanName }} plan includes:</p>
          <ul class="limit-modal__unlocks-list" aria-label="Plan features">
            <li *ngFor="let item of data.unlocks">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="limit-modal__preserve" *ngIf="data.preserveWork?.draftSaved">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Your work has been saved as a draft.</span>
        </div>
      </div>

      <div class="limit-modal__actions">
        <button class="limit-modal__btn limit-modal__btn--primary" type="button" (click)="choose(primaryChoice)">{{ primaryLabel }}</button>
        <button *ngIf="canSaveDraft" class="limit-modal__btn limit-modal__btn--ghost" type="button" (click)="choose('draft')">Save as draft</button>
        <button *ngIf="!canSaveDraft" class="limit-modal__btn limit-modal__btn--ghost" type="button" mat-dialog-close>Close</button>
      </div>
    </div>
  `,
  styleUrls: ['./subscription-limit-modal.component.scss']
})
export class SubscriptionLimitModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EmployerPlanLimitRefusal,
    private dialogRef: MatDialogRef<SubscriptionLimitModalComponent, PlanLimitChoice>,
    private router: Router
  ) {}

  get entitlementLabel(): string {
    return ENTITLEMENT_LABELS[this.data.entitlementKey] || this.data.entitlementKey;
  }

  get title(): string {
    if (this.data.reasonCode === 'no_subscription_found') { return 'Choose a plan to continue'; }
    return this.entitlementLabel + ' limit reached';
  }

  /** Enterprise and a missing subscription send no numeric limit: there is nothing to measure. */
  get hasMeter(): boolean {
    return typeof this.data.limit === 'number' && this.data.limit > 0;
  }

  get fillPercent(): number {
    return this.hasMeter ? Math.min(100, (this.data.used / (this.data.limit as number)) * 100) : 0;
  }

  /** Offered only when the action can be a draft and the backend has not already saved one. */
  get canSaveDraft(): boolean {
    const work = this.data.preserveWork;
    return !!(work && work.canSaveDraft && !work.draftSaved);
  }

  /** No self-serve plan fits: the plans page, where Enterprise offers Contact Sales. */
  get primaryChoice(): PlanLimitChoice {
    return this.data.contactSalesRequired ? 'plans' : 'upgrade';
  }

  get primaryLabel(): string {
    if (this.data.contactSalesRequired) { return 'View plans'; }
    return this.data.recommendedPlanName ? 'Upgrade to ' + this.data.recommendedPlanName : 'Upgrade plan';
  }

  choose(choice: PlanLimitChoice): void {
    this.dialogRef.close(choice);
    if (choice === 'upgrade' || choice === 'plans') {
      this.router.navigateByUrl(this.data.upgradeRoute || '/recruiter/subscription');
    }
  }
}
