import { Component, NgZone } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { environment } from 'environments/environment';
import { UpgradePromptCardComponent } from '@main/employer-panel/employer-subscription/components/upgrade-prompt-card/upgrade-prompt-card.component';
import { ENGAGEMENT_CONTEXT_RESPONSE } from '../../../testing/engagement-contract.fixture';
import { E2_JOBS_80_OWNER } from '../../../testing/engagement-e2-code.fixture';
import {
  E2_JOBS_FULL_OWNER, E2_PLACED_JOBS_SEATS, E2_PLACED_JOBS_SEATS_STORAGE, E2_PLACED_RECRUITER, E2_PLACED_TEAM_ADMIN, E2_SEATS_FULL_OWNER,
} from '../../../testing/engagement-e2-contextual.fixture';
import { EngagementContext, NudgeMeter } from './engagement-contract.models';
import { EngagementContextualNudgeComponent } from './engagement-contextual-nudge.component';
import { majorSurfaces } from './engagement-message.presentation';
import { SubscriptionEngagementService } from './subscription-engagement.service';

@Component({ template: '' })
class BlankComponent {}

type Placement = Pick<EngagementContext, 'prominent' | 'secondary' | 'banner' | 'dashboardCard'>;

function contextWith(placement: Placement): EngagementContext {
  return JSON.parse(JSON.stringify({ ...ENGAGEMENT_CONTEXT_RESPONSE.context, ...placement }));
}

/** F5: CONTEXTUAL_NUDGE beside the action it concerns, by meter, from gh-be's own placement (658d0a5). */
describe('EngagementContextualNudgeComponent -- a message beside the action it concerns (F5)', () => {
  let context$: BehaviorSubject<EngagementContext | null>;

  function setUp(context: EngagementContext | null): void {
    context$ = new BehaviorSubject<EngagementContext | null>(context);
    TestBed.configureTestingModule({
      declarations: [EngagementContextualNudgeComponent, UpgradePromptCardComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: SubscriptionEngagementService, useValue: { context$, click: () => EMPTY, dismiss: () => EMPTY } },
        { provide: Router, useValue: { navigateByUrl: jasmine.createSpy('navigateByUrl'), events: EMPTY, url: '/recruiter/jobs/list', navigated: true } },
      ],
    });
  }

  function mount(meter: NudgeMeter | null): ComponentFixture<EngagementContextualNudgeComponent> {
    const fixture = TestBed.createComponent(EngagementContextualNudgeComponent);
    fixture.componentInstance.meter = meter;
    fixture.detectChanges();
    return fixture;
  }

  const titles = (fixture: ComponentFixture<EngagementContextualNudgeComponent>): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.upgrade-prompt__title')).map((e: any) => e.textContent.trim());
  const buttons = (fixture: ComponentFixture<EngagementContextualNudgeComponent>): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('button')).map((e: any) => e.textContent.trim());

  it('each action shows only its own meter\'s message: jobs beside Post and Publish, seats beside adding a member', () => {
    setUp(contextWith(E2_PLACED_JOBS_SEATS_STORAGE));
    expect(titles(mount('jobs'))).toEqual([E2_JOBS_FULL_OWNER.copy.title]);
    expect(titles(mount('seats'))).toEqual([E2_SEATS_FULL_OWNER.copy.title]);
    expect(titles(mount('storage'))).toEqual([]);
  });

  it('jobs.full renders beside the job actions, as a compact card, and is never the card slot\'s message', () => {
    const withCard = contextWith(E2_PLACED_JOBS_SEATS_STORAGE);
    const withoutCard = contextWith(E2_PLACED_JOBS_SEATS);
    expect(majorSurfaces(withCard).card!.id).toBe('nudge:storage.80');
    expect(majorSurfaces(withoutCard).card).toBeNull();
    setUp(withoutCard);
    const jobs = mount('jobs');
    expect(titles(jobs)).toContain(E2_JOBS_FULL_OWNER.copy.title);
    expect(jobs.nativeElement.querySelector('.upgrade-prompt')!.classList).toContain('upgrade-prompt--compact');
  });

  it('seats.full renders beside adding a member', () => {
    setUp(contextWith(E2_PLACED_TEAM_ADMIN));
    const seats = mount('seats');
    expect(titles(seats)).toEqual(['Your team is at its user limit']);
    expect(seats.nativeElement.querySelector('.upgrade-prompt')!.getAttribute('data-priority')).toBe('HIGH');
  });

  it('a viewer who is not a billing viewer sees no plan action: a recruiter gets only "Close or archive a job", a team admin only "Manage team"', () => {
    setUp(contextWith(E2_PLACED_RECRUITER));
    const jobs = mount('jobs');
    expect(buttons(jobs)).toEqual(['Close or archive a job', 'Dismiss']);
    expect(jobs.nativeElement.textContent).not.toContain('Compare plans');
    context$.next(contextWith(E2_PLACED_TEAM_ADMIN));
    const seats = mount('seats');
    expect(buttons(seats)).toEqual(['Manage team', 'Dismiss']);
    expect(seats.nativeElement.textContent).not.toMatch(/Compare plans|View /);
  });

  it('D3: jobs.80, which the backend also allows as a card, still renders beside the job actions', () => {
    setUp(contextWith({ prominent: E2_JOBS_80_OWNER, secondary: [], banner: null, dashboardCard: E2_JOBS_80_OWNER }));
    expect(titles(mount('jobs'))).toEqual([E2_JOBS_80_OWNER.copy.title]);
  });

  it('a null context, or no meter, renders nothing', () => {
    setUp(null);
    expect(mount('jobs').nativeElement.textContent.trim()).toBe('');
    context$.next(contextWith(E2_PLACED_JOBS_SEATS));
    expect(mount(null).nativeElement.textContent.trim()).toBe('');
  });
});

describe('EngagementContextualNudgeComponent -- outside /recruiter (F5)', () => {
  ['/user/home', '/jobs'].forEach(url => {
    it(`at ${url} it reads nothing and renders nothing`, fakeAsync(() => {
      TestBed.configureTestingModule({
        declarations: [EngagementContextualNudgeComponent, UpgradePromptCardComponent, BlankComponent],
        imports: [
          HttpClientTestingModule,
          RouterTestingModule.withRoutes([{ path: 'user/home', component: BlankComponent }, { path: 'jobs', component: BlankComponent }]),
        ],
      });
      const http = TestBed.inject(HttpTestingController);
      TestBed.inject(NgZone).run(() => { TestBed.inject(Router).navigateByUrl(url); });
      tick();
      const fixture = TestBed.createComponent(EngagementContextualNudgeComponent);
      fixture.componentInstance.meter = 'jobs';
      fixture.detectChanges();
      http.expectNone(`${environment.api_url}/subscriptions/engagement/context`);
      expect(fixture.nativeElement.textContent.trim()).toBe('');
      fixture.destroy();
      http.verify();
    }));
  });
});
