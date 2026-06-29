import {
  Component, Input, ChangeDetectionStrategy,
} from '@angular/core';
import { UpgradeComparison } from '../../services/subscription-upgrade-recommendation.service';

@Component({
  selector: 'app-plan-comparison-strip',
  template: `
    <div class="comparison-strip" aria-label="Plan comparison">
      <div class="comparison-strip__header">
        <span class="comparison-strip__col comparison-strip__col--label"></span>
        <span class="comparison-strip__col comparison-strip__col--current">{{ currentPlanName }}</span>
        <span class="comparison-strip__col comparison-strip__col--recommended">
          {{ recommendedPlanName }}
          <span class="comparison-strip__rec-badge" aria-label="Recommended">Recommended</span>
        </span>
      </div>

      <div class="comparison-strip__row" *ngFor="let row of rows">
        <span class="comparison-strip__col comparison-strip__col--label">{{ row.label }}</span>
        <span class="comparison-strip__col comparison-strip__col--current">
          <span [class.comparison-strip__val--bool-yes]="row.currentBool === true"
                [class.comparison-strip__val--bool-no]="row.currentBool === false"
                [class.comparison-strip__val--num]="row.currentBool === undefined">
            <ng-container *ngIf="row.currentBool === true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-label="Yes"><path d="M5 12l5 5L20 7" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/></svg>
            </ng-container>
            <ng-container *ngIf="row.currentBool === false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-label="No"><path d="M6 18L18 6M6 6l12 12" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/></svg>
            </ng-container>
            <ng-container *ngIf="row.currentBool === undefined">{{ row.current }}</ng-container>
          </span>
        </span>
        <span class="comparison-strip__col comparison-strip__col--recommended">
          <span [class.comparison-strip__val--bool-yes]="row.recBool === true"
                [class.comparison-strip__val--bool-no]="row.recBool === false"
                [class.comparison-strip__val--num]="row.recBool === undefined"
                [class.comparison-strip__val--upgrade]="row.isUpgrade">
            <ng-container *ngIf="row.recBool === true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-label="Yes"><path d="M5 12l5 5L20 7" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/></svg>
            </ng-container>
            <ng-container *ngIf="row.recBool === false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-label="No"><path d="M6 18L18 6M6 6l12 12" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/></svg>
            </ng-container>
            <ng-container *ngIf="row.recBool === undefined">{{ row.recommended }}</ng-container>
          </span>
        </span>
      </div>
    </div>
  `,
  styleUrls: ['./plan-comparison-strip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanComparisonStripComponent {
  @Input() comparison: UpgradeComparison | null = null;
  @Input() currentPlanName: string = 'Current';
  @Input() recommendedPlanName: string = 'Recommended';

  get rows(): Array<{
    label: string; current: string; recommended: string;
    currentBool?: boolean; recBool?: boolean; isUpgrade: boolean;
  }> {
    if (!this.comparison) return [];
    const c = this.comparison;
    return [
      {
        label: 'Active job posts',
        current: String(c.activeJobs.current),
        recommended: String(c.activeJobs.recommended),
        isUpgrade: Number(c.activeJobs.recommended) > Number(c.activeJobs.current),
      },
      {
        label: 'Admin users',
        current: String(c.adminUsers.current),
        recommended: String(c.adminUsers.recommended),
        isUpgrade: Number(c.adminUsers.recommended) > Number(c.adminUsers.current),
      },
      {
        label: 'Video responses',
        current: String(c.videoResponses.current),
        recommended: String(c.videoResponses.recommended),
        isUpgrade: Number(c.videoResponses.recommended) > Number(c.videoResponses.current),
      },
      {
        label: 'Company page',
        current: '', recommended: '',
        currentBool: c.customizedCompanyPage.current,
        recBool: c.customizedCompanyPage.recommended,
        isUpgrade: !c.customizedCompanyPage.current && c.customizedCompanyPage.recommended,
      },
      {
        label: 'Video interview questions',
        current: '', recommended: '',
        currentBool: c.videoInterviewQuestions.current,
        recBool: c.videoInterviewQuestions.recommended,
        isUpgrade: !c.videoInterviewQuestions.current && c.videoInterviewQuestions.recommended,
      },
      {
        label: 'Dedicated support',
        current: '', recommended: '',
        currentBool: c.dedicatedSupport.current,
        recBool: c.dedicatedSupport.recommended,
        isUpgrade: !c.dedicatedSupport.current && c.dedicatedSupport.recommended,
      },
    ];
  }
}
