import { Component, NgZone, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from 'environments/environment';
import { SubscriptionStatusBannerComponent } from '@main/employer-panel/employer-subscription/components/subscription-status-banner/subscription-status-banner.component';
import { UpgradePromptCardComponent } from '@main/employer-panel/employer-subscription/components/upgrade-prompt-card/upgrade-prompt-card.component';
import { ENGAGEMENT_CONTEXT_RESPONSE } from '../../../testing/engagement-contract.fixture';
import { E2_PLACED_WITH_BANNER } from '../../../testing/engagement-e2-code.fixture';
import { EngagementContextResponse } from './engagement-contract.models';
import { EngagementShellBannerComponent } from './engagement-shell-banner.component';

@Component({ template: '' })
class BlankComponent {}

const CONTEXT_URL = `${environment.api_url}/subscriptions/engagement/context`;

function served(): EngagementContextResponse {
  return JSON.parse(JSON.stringify(ENGAGEMENT_CONTEXT_RESPONSE));
}

/** F2: the banner slot in the employer shell. It reads and renders only inside /recruiter, and only a banner. */
describe('EngagementShellBannerComponent -- the banner above every employer page (F2)', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<EngagementShellBannerComponent>;

  function setUp(platform: 'browser' | 'server', url: string): void {
    TestBed.configureTestingModule({
      declarations: [EngagementShellBannerComponent, SubscriptionStatusBannerComponent, UpgradePromptCardComponent, BlankComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'recruiter/dashboard', component: BlankComponent },
          { path: 'user/home', component: BlankComponent },
          { path: 'home', component: BlankComponent },
        ]),
      ],
      providers: [{ provide: PLATFORM_ID, useValue: platform }],
    });
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(NgZone).run(() => { TestBed.inject(Router).navigateByUrl(url); });
    tick();
    fixture = TestBed.createComponent(EngagementShellBannerComponent);
    fixture.detectChanges();
  }

  const element = (): HTMLElement => fixture.nativeElement;

  afterEach(() => {
    fixture.destroy();
    http.verify();
  });

  ['/user/home', '/home'].forEach(url => {
    it(`at ${url} (outside /recruiter) it reads nothing and renders nothing`, fakeAsync(() => {
      setUp('browser', url);
      http.expectNone(CONTEXT_URL);
      expect(element().querySelector('app-subscription-status-banner')).toBeNull();
      expect(element().textContent!.trim()).toBe('');
    }));
  });

  it('on the server it reads nothing and renders nothing', fakeAsync(() => {
    setUp('server', '/recruiter/dashboard');
    http.expectNone(CONTEXT_URL);
    expect(element().textContent!.trim()).toBe('');
  }));

  it('inside /recruiter it renders context.banner (gh-be placement: storage.full) as a CRITICAL alert, and no card', fakeAsync(() => {
    setUp('browser', '/recruiter/dashboard');
    const body = served();
    Object.assign(body.context, E2_PLACED_WITH_BANNER);
    http.expectOne(CONTEXT_URL).flush(body);
    fixture.detectChanges();
    expect(element().querySelectorAll('app-subscription-status-banner').length).toBe(1);
    expect(element().querySelector('.sub-banner')!.getAttribute('role')).toBe('alert');
    expect(element().querySelector('.sub-banner__title')!.textContent!.trim()).toBe('Your Recruitment Storage is full');
    expect(element().querySelector('app-upgrade-prompt-card')).toBeNull();
  }));

  it('with no banner (the contract example carries a dashboard card), the shell renders nothing: the card is not the shell\'s', fakeAsync(() => {
    setUp('browser', '/recruiter/dashboard');
    http.expectOne(CONTEXT_URL).flush(served());
    fixture.detectChanges();
    expect(element().textContent!.trim()).toBe('');
  }));

  it('a failed read (500) renders nothing', fakeAsync(() => {
    setUp('browser', '/recruiter/dashboard');
    http.expectOne(CONTEXT_URL).flush({ success: false }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(element().textContent!.trim()).toBe('');
  }));
});
