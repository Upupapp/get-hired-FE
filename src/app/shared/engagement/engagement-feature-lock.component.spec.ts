import { Component, NgZone } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'environments/environment';
import { SubscriptionUpgradeRecommendationService } from '@main/employer-panel/employer-subscription/services/subscription-upgrade-recommendation.service';
import { ENGAGEMENT_CONTEXT_RESPONSE } from '../../../testing/engagement-contract.fixture';
import {
  E2_CAPABILITIES_FREE_TRIAL_OWNER, E2_CAPABILITIES_NO_PLAN_OWNER, E2_CAPABILITIES_NO_PLAN_RECRUITER,
} from '../../../testing/engagement-e2-capabilities.fixture';
import { EngagementContext, LockableFeature } from './engagement-contract.models';
import { EngagementFeatureLockComponent } from './engagement-feature-lock.component';
import { SubscriptionEngagementService } from './subscription-engagement.service';

@Component({ template: '' })
class BlankComponent {}

function contextWith(capabilities: EngagementContext['capabilities']): EngagementContext {
  const context: EngagementContext = JSON.parse(JSON.stringify(ENGAGEMENT_CONTEXT_RESPONSE.context));
  context.capabilities = JSON.parse(JSON.stringify(capabilities));
  return context;
}

/** F7: LOCKED_FEATURE_STATE from context.capabilities.features, as gh-be serves it at 658d0a5. */
describe('EngagementFeatureLockComponent -- a display of the served allowed flag (F7)', () => {
  let context$: BehaviorSubject<EngagementContext | null>;
  let navigateByUrl: jasmine.Spy;
  let recordEvent: jasmine.Spy;

  function setUp(context: EngagementContext | null): void {
    context$ = new BehaviorSubject<EngagementContext | null>(context);
    navigateByUrl = jasmine.createSpy('navigateByUrl');
    recordEvent = jasmine.createSpy('recordEvent');
    TestBed.configureTestingModule({
      declarations: [EngagementFeatureLockComponent],
      providers: [
        { provide: SubscriptionEngagementService, useValue: { context$ } },
        { provide: Router, useValue: { navigateByUrl } },
        { provide: SubscriptionUpgradeRecommendationService, useValue: { recordEvent } },
      ],
    });
  }

  function mount(feature: LockableFeature | null): ComponentFixture<EngagementFeatureLockComponent> {
    const fixture = TestBed.createComponent(EngagementFeatureLockComponent);
    fixture.componentInstance.feature = feature;
    fixture.detectChanges();
    return fixture;
  }

  const text = (fixture: ComponentFixture<EngagementFeatureLockComponent>, selector: string): string =>
    ((fixture.nativeElement.querySelector(selector) || { textContent: '' }).textContent || '').trim();

  it('allowed: true leaves the feature untouched: nothing renders and nothing is recorded, for both mounted features', () => {
    setUp(contextWith(E2_CAPABILITIES_FREE_TRIAL_OWNER));
    (['video_interview_questions', 'customized_company_page'] as LockableFeature[]).forEach(feature => {
      expect(E2_CAPABILITIES_FREE_TRIAL_OWNER.features[feature]!.allowed).withContext(feature).toBeTrue();
      expect(mount(feature).nativeElement.textContent.trim()).withContext(feature).toBe('');
    });
    // Not served (allowed features come with nudge: null), and still not a lock: allowed wins over any copy.
    const planted = JSON.parse(JSON.stringify(E2_CAPABILITIES_NO_PLAN_OWNER));
    planted.features.video_interview_questions.allowed = true;
    planted.features.customized_company_page.allowed = true;
    context$.next(contextWith(planted));
    expect(mount('video_interview_questions').nativeElement.textContent.trim()).toBe('');
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it("allowed: false renders the backend's nudge copy word for word, with its served action", () => {
    setUp(contextWith(E2_CAPABILITIES_NO_PLAN_OWNER));
    const served = E2_CAPABILITIES_NO_PLAN_OWNER.features.video_interview_questions!;
    const lock = mount('video_interview_questions');
    expect(lock.nativeElement.querySelector('.gh-feature-lock')!.getAttribute('data-feature')).toBe('video_interview_questions');
    expect(text(lock, '.gh-feature-lock__title')).toBe(served.nudge!.title);
    expect(text(lock, '.gh-feature-lock__body')).toBe(served.nudge!.body);
    expect(text(lock, '.gh-feature-lock__cta')).toBe(served.nudge!.primaryCTA!.label);
  });

  it('primaryCTA: null (a viewer who is not a billing viewer) means no button, only the served words', () => {
    setUp(contextWith(E2_CAPABILITIES_NO_PLAN_RECRUITER));
    const served = E2_CAPABILITIES_NO_PLAN_RECRUITER.features.customized_company_page!;
    expect(served.nudge!.primaryCTA).toBeNull();
    const lock = mount('customized_company_page');
    expect(text(lock, '.gh-feature-lock__title')).toBe(served.nudge!.title);
    expect(lock.nativeElement.querySelector('button')).toBeNull();
  });

  it('never redirects: rendering and refetching navigate nowhere, and the action goes, on click, only to the served url (ESC-09)', () => {
    setUp(contextWith(E2_CAPABILITIES_NO_PLAN_OWNER));
    const lock = mount('video_interview_questions');
    context$.next(contextWith(E2_CAPABILITIES_NO_PLAN_OWNER));
    lock.detectChanges();
    expect(navigateByUrl).not.toHaveBeenCalled();
    lock.nativeElement.querySelector('.gh-feature-lock__cta').click();
    const servedUrl = E2_CAPABILITIES_NO_PLAN_OWNER.features.video_interview_questions!.nudge!.primaryCTA!.url;
    expect(navigateByUrl.calls.allArgs()).toEqual([[servedUrl]]);
    expect(recordEvent).toHaveBeenCalledWith('feature_gate_upgrade_clicked', { feature: 'video_interview_questions' });
  });

  it('feature_gate_impression carries properties.feature, once per render', () => {
    setUp(contextWith(E2_CAPABILITIES_NO_PLAN_OWNER));
    const lock = mount('customized_company_page');
    context$.next(contextWith(E2_CAPABILITIES_NO_PLAN_OWNER));
    lock.detectChanges();
    expect(recordEvent.calls.allArgs()).toEqual([['feature_gate_impression', { feature: 'customized_company_page' }]]);
    context$.next(contextWith(E2_CAPABILITIES_FREE_TRIAL_OWNER));
    lock.detectChanges();
    context$.next(contextWith(E2_CAPABILITIES_NO_PLAN_OWNER));
    lock.detectChanges();
    expect(recordEvent.calls.allArgs().map(args => args[1].feature)).toEqual(['customized_company_page', 'customized_company_page']);
  });

  it('no context, no feature, or a served lock without copy renders nothing', () => {
    setUp(null);
    expect(mount('video_interview_questions').nativeElement.textContent.trim()).toBe('');
    context$.next(contextWith(E2_CAPABILITIES_NO_PLAN_OWNER));
    expect(mount(null).nativeElement.textContent.trim()).toBe('');
    const noCopy = JSON.parse(JSON.stringify(E2_CAPABILITIES_NO_PLAN_OWNER));
    noCopy.features.video_interview_questions.nudge = null;
    context$.next(contextWith(noCopy));
    expect(mount('video_interview_questions').nativeElement.textContent.trim()).toBe('');
  });
});

describe('EngagementFeatureLockComponent -- outside /recruiter (F7)', () => {
  it('at /user/home it reads nothing, renders nothing and records nothing', fakeAsync(() => {
    const recordEvent = jasmine.createSpy('recordEvent');
    TestBed.configureTestingModule({
      declarations: [EngagementFeatureLockComponent, BlankComponent],
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: 'user/home', component: BlankComponent }])],
      providers: [{ provide: SubscriptionUpgradeRecommendationService, useValue: { recordEvent } }],
    });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(NgZone).run(() => { TestBed.inject(Router).navigateByUrl('/user/home'); });
    tick();
    const fixture = TestBed.createComponent(EngagementFeatureLockComponent);
    fixture.componentInstance.feature = 'video_interview_questions';
    fixture.detectChanges();
    http.expectNone(`${environment.api_url}/subscriptions/engagement/context`);
    expect(fixture.nativeElement.textContent.trim()).toBe('');
    expect(recordEvent).not.toHaveBeenCalled();
    fixture.destroy();
    http.verify();
  }));
});
