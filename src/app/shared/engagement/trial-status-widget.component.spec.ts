import { Component, NgZone } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'environments/environment';
import { STORAGE_NOTES, SubscriptionUsageMeterComponent } from '@main/employer-panel/employer-subscription/components/subscription-usage-meter/subscription-usage-meter.component';
import { TrialDaysRemainingBadgeComponent } from '@main/employer-panel/employer-subscription/components/trial-days-remaining-badge/trial-days-remaining-badge.component';
import { SubscriptionUpgradeRecommendationService } from '@main/employer-panel/employer-subscription/services/subscription-upgrade-recommendation.service';
import { ENGAGEMENT_CONTEXT_RESPONSE } from '../../../testing/engagement-contract.fixture';
import {
  E2_SUB_ACTIVE, E2_SUB_TRIALING, E2_SUB_TRIAL_ENDING, E2_SUB_TRIAL_ENDS_TODAY, E2_SUB_TRIAL_END_UNREADABLE, E2_SUB_TRIAL_EXPIRED,
  E2_USAGE_CONFIRMED, E2_USAGE_NO_PLAN,
} from '../../../testing/engagement-e2-trial.fixture';
import { EngagementContext, EngagementSubscription, EngagementUsage } from './engagement-contract.models';
import { SubscriptionEngagementService } from './subscription-engagement.service';
import { TrialStatusWidgetComponent } from './trial-status-widget.component';

@Component({ template: '' })
class BlankComponent {}

function contextWith(subscription: EngagementSubscription, usage: EngagementUsage = E2_USAGE_CONFIRMED): EngagementContext {
  const context: EngagementContext = JSON.parse(JSON.stringify(ENGAGEMENT_CONTEXT_RESPONSE.context));
  context.subscription = JSON.parse(JSON.stringify(subscription));
  context.usage = JSON.parse(JSON.stringify(usage));
  return context;
}

/** F4: TRIAL_STATUS_WIDGET from context.subscription.trial and context.usage. */
describe('TrialStatusWidgetComponent -- the trial status widget (F4)', () => {
  let context$: BehaviorSubject<EngagementContext | null>;
  let recordEvent: jasmine.Spy;
  let fixture: ComponentFixture<TrialStatusWidgetComponent>;

  function render(initial: EngagementContext | null): void {
    context$ = new BehaviorSubject<EngagementContext | null>(initial);
    recordEvent = jasmine.createSpy('recordEvent');
    TestBed.configureTestingModule({
      declarations: [TrialStatusWidgetComponent, TrialDaysRemainingBadgeComponent, SubscriptionUsageMeterComponent],
      providers: [
        { provide: SubscriptionEngagementService, useValue: { context$ } },
        { provide: SubscriptionUpgradeRecommendationService, useValue: { recordEvent } },
      ],
    });
    fixture = TestBed.createComponent(TrialStatusWidgetComponent);
    fixture.detectChanges();
  }

  function push(context: EngagementContext | null): void {
    context$.next(context);
    fixture.detectChanges();
  }

  const root = (): HTMLElement => fixture.nativeElement;
  const badge = (): string => ((root().querySelector('.trial-badge') || { textContent: '' }).textContent || '').replace(/\s+/g, ' ').trim();

  const TRIALS: Array<[string, EngagementSubscription, string | null]> = [
    ['trialing, 4 days left', E2_SUB_TRIALING, '4 days left in your free trial'],
    ['trial_ending, 1 day left', E2_SUB_TRIAL_ENDING, '1 day left in your free trial'],
    ['trial_ending on its last day (daysRemaining: 0)', E2_SUB_TRIAL_ENDS_TODAY, 'Your free trial ends today'],
    ['trial_expired (daysRemaining: 0)', E2_SUB_TRIAL_EXPIRED, 'Your free trial has ended'],
    ['trialing with an unreadable end (daysRemaining: null)', E2_SUB_TRIAL_END_UNREADABLE, null],
  ];

  TRIALS.forEach(([name, subscription, text]) => {
    it(`${name}: the widget renders and its badge says ${text ? `"${text}"` : 'nothing, rather than guess'}`, () => {
      render(contextWith(subscription));
      expect(root().querySelector('.gh-trial-widget')).not.toBeNull();
      if (text) {
        expect(badge()).toBe(text);
      } else {
        expect(root().querySelector('.trial-badge')).toBeNull();
      }
    });
  });

  it('trial: null (an active plan) and a null context render nothing and record nothing', () => {
    render(contextWith(E2_SUB_ACTIVE));
    expect(root().textContent!.trim()).toBe('');
    push(null);
    expect(root().textContent!.trim()).toBe('');
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it('renders the served number and does no date math: the same words whatever today is and whatever lengthDays says', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2030-01-01T00:00:00Z'));
    try {
      const subscription: EngagementSubscription = JSON.parse(JSON.stringify(E2_SUB_TRIALING));
      subscription.trial!.lengthDays = 30;
      render(contextWith(subscription));
      expect(badge()).toBe('4 days left in your free trial');
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it("shows the context's meters in order, with Recruitment Storage in storage mode", () => {
    render(contextWith(E2_SUB_TRIALING));
    const meters = Array.from(root().querySelectorAll('app-subscription-usage-meter'));
    expect(meters.map(m => m.querySelector('.usage-meter__label')!.textContent!.trim()))
      .toEqual(['Active jobs', 'Team members', 'Video responses', 'Recruitment Storage']);
    expect(meters[3].querySelector('.usage-meter')!.classList).toContain('usage-meter--storage');
  });

  it('a degraded usage part (usage: {}) shows the trial with no meters', () => {
    render(contextWith(E2_SUB_TRIALING, {}));
    expect(badge()).toBe('4 days left in your free trial');
    expect(root().querySelectorAll('app-subscription-usage-meter').length).toBe(0);
  });

  it('storageStatus no_plan renders the choose-a-plan note with no figures, and nothing full', () => {
    render(contextWith(E2_SUB_TRIAL_EXPIRED, E2_USAGE_NO_PLAN));
    const storage = root().querySelectorAll('app-subscription-usage-meter')[3];
    expect(storage.querySelector('.usage-meter__note')!.textContent!.trim()).toBe(STORAGE_NOTES.no_plan!);
    expect(storage.querySelector('.usage-meter__count')).toBeNull();
    expect(storage.querySelector('.usage-meter__note--full')).toBeNull();
    expect(storage.textContent).not.toContain(STORAGE_NOTES.full!);
  });

  it('trial_notice_impression is sent once per render: not again on a refetch of the same trial, again when the status changes or the widget returns', () => {
    render(contextWith(E2_SUB_TRIALING));
    fixture.detectChanges();
    push(contextWith(E2_SUB_TRIALING));
    expect(recordEvent.calls.allArgs()).toEqual([
      ['trial_notice_impression', { surface: 'dashboard', lifecycleStatus: 'trialing', currentPlan: 'free_trial' }],
    ]);
    push(contextWith(E2_SUB_TRIAL_ENDING));
    push(null);
    push(contextWith(E2_SUB_TRIAL_ENDING));
    expect(recordEvent.calls.allArgs().map(args => args[0])).toEqual(['trial_notice_impression', 'trial_notice_impression', 'trial_notice_impression']);
    expect(recordEvent.calls.allArgs().map(args => args[1].lifecycleStatus)).toEqual(['trialing', 'trial_ending', 'trial_ending']);
  });
});

describe('TrialStatusWidgetComponent -- outside /recruiter (F4)', () => {
  it('at /user/home it reads nothing, renders nothing and records nothing', fakeAsync(() => {
    const recordEvent = jasmine.createSpy('recordEvent');
    TestBed.configureTestingModule({
      declarations: [TrialStatusWidgetComponent, TrialDaysRemainingBadgeComponent, SubscriptionUsageMeterComponent, BlankComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([{ path: 'user/home', component: BlankComponent }, { path: 'recruiter/dashboard', component: BlankComponent }]),
      ],
      providers: [{ provide: SubscriptionUpgradeRecommendationService, useValue: { recordEvent } }],
    });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(NgZone).run(() => { TestBed.inject(Router).navigateByUrl('/user/home'); });
    tick();
    const widget = TestBed.createComponent(TrialStatusWidgetComponent);
    widget.detectChanges();
    http.expectNone(`${environment.api_url}/subscriptions/engagement/context`);
    expect(widget.nativeElement.textContent.trim()).toBe('');
    expect(recordEvent).not.toHaveBeenCalled();
    widget.destroy();
    http.verify();
  }));
});
