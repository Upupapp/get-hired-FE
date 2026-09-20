import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EngagementDashboardCardComponent } from './engagement-dashboard-card.component';
import { SubscriptionEngagementService } from './subscription-engagement.service';
import { ENGAGEMENT_CONTEXT_RESPONSE } from '../../../testing/engagement-contract.fixture';
import { E2_JOBS_80_OWNER, E2_STORAGE_FULL_OWNER } from '../../../testing/engagement-e2-code.fixture';

@Component({selector: 'app-upgrade-prompt-card', template: '{{message?.copy.title}}'})
class CardStub { @Input() message: any; }

describe('Backend dashboard placement', () => {
  it('renders only the backend card; a major banner takes its place, and refreshed empty context removes it', () => {
    const context$ = new BehaviorSubject<any>({ ...ENGAGEMENT_CONTEXT_RESPONSE.context, banner: null, dashboardCard: E2_JOBS_80_OWNER });
    TestBed.configureTestingModule({ declarations: [EngagementDashboardCardComponent, CardStub], imports: [CommonModule], providers: [{ provide: SubscriptionEngagementService, useValue: {context$} }] });
    const fixture = TestBed.createComponent(EngagementDashboardCardComponent); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(E2_JOBS_80_OWNER.copy.title);
    context$.next({ ...context$.value, banner: E2_STORAGE_FULL_OWNER }); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-upgrade-prompt-card')).toBeNull();
    context$.next(null); fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});
