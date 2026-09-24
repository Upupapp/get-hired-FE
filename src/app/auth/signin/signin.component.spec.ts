import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { JOB_ALERT_MODAL_SESSION_KEY } from '@main/jobs/job-opening-alerts.service';
import { SeoService } from '@app-core/services/seo.service';
import { AuthFacade } from '../state/auth.facade';
import { GoogleAuthService } from '../services/google-auth.service';
import { AuthRoleTabsComponent } from '../auth-role-tabs/auth-role-tabs.component';
import { SigninComponent } from './signin.component';

describe('SigninComponent role tabs', () => {
  let query: Record<string, string>;
  let jobAlerts: boolean;

  beforeEach(() => {
    query = {};
    jobAlerts = false;
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  async function render(): Promise<{ fixture: ComponentFixture<SigninComponent>; navigate: jasmine.Spy }> {
    TestBed.resetTestingModule();
    if (jobAlerts) {
      sessionStorage.setItem(JOB_ALERT_MODAL_SESSION_KEY, '1');
    }
    const paramMap = convertToParamMap(query);
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
        MatCheckboxModule,
        TranslateModule.forRoot(),
      ],
      declarations: [SigninComponent, AuthRoleTabsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useValue: {
          snapshot: { queryParamMap: paramMap },
          queryParamMap: of(paramMap),
        } },
        { provide: AuthFacade, useValue: { credentials$: of(null), error$: of(null) } },
        { provide: SeoService, useValue: { setPageMeta: () => undefined } },
        { provide: GoogleAuthService, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SigninComponent);
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.detectChanges();
    return { fixture, navigate };
  }

  it('defaults to Job seekers without a role query and without the modal', async () => {
    const { fixture, navigate } = await render();
    const root: HTMLElement = fixture.nativeElement;

    expect(fixture.componentInstance.activeRole).toBe(3);
    expect(fixture.componentInstance.showRoleTabs).toBeTrue();
    expect(navigate).not.toHaveBeenCalled();
    expect(root.querySelector('app-auth-role-prompt')).toBeNull();
    expect(root.querySelector('.gh-role-chip')).toBeNull();
    expect(root.querySelector('.gh-role-switch')).toBeNull();
    expect(root.textContent).not.toContain('What brings you here today?');
    expect(root.textContent).toContain('Welcome back, Job Seeker');
    expect(root.textContent).toContain('Sign in to continue your job search');
    expect(root.querySelector('#signin-tab-3').getAttribute('aria-selected')).toBe('true');
    expect(root.querySelector('#signin-tab-2').getAttribute('aria-selected')).toBe('false');
    expect(root.querySelector('form').getAttribute('role')).toBe('tabpanel');
    expect(root.querySelector('form').getAttribute('aria-labelledby')).toBe('signin-tab-3');
    expect(fixture.componentInstance.registerQuery).toEqual({ role: 3 });
  });

  it('honors ?role=2 and rewrites employer alias to the numeric query', async () => {
    query = { role: '2' };
    const employer = await render();
    expect(employer.fixture.componentInstance.activeRole).toBe(2);
    expect(employer.navigate).not.toHaveBeenCalled();
    expect(employer.fixture.nativeElement.textContent).toContain('Welcome back, Employer');
    expect(employer.fixture.nativeElement.querySelector('#signin-tab-2').getAttribute('aria-selected')).toBe('true');
    expect(employer.fixture.componentInstance.registerQuery).toEqual({ role: 2 });

    query = { role: 'employer' };
    const alias = await render();
    expect(alias.fixture.componentInstance.activeRole).toBe(2);
    expect(alias.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { role: 2 },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    }));
  });

  it('updates ?role= from the tablist and moves with the arrow keys', async () => {
    const { fixture, navigate } = await render();
    fixture.debugElement.query(By.css('#signin-tab-3')).triggerEventHandler('keydown', new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    }));
    fixture.detectChanges();

    expect(fixture.componentInstance.activeRole).toBe(2);
    expect(navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { role: 2 },
      replaceUrl: true,
    }));
    expect(fixture.nativeElement.querySelector('#signin-tab-2').getAttribute('aria-selected')).toBe('true');
    expect(fixture.nativeElement.querySelector('#signin-tab-2').getAttribute('tabindex')).toBe('0');
    expect(fixture.nativeElement.querySelector('#signin-tab-3').getAttribute('tabindex')).toBe('-1');
    expect(fixture.nativeElement.querySelector('form').getAttribute('aria-labelledby')).toBe('signin-tab-2');
  });

  it('hides the tablist on the Job Alerts continue path', async () => {
    query = { role: '3' };
    jobAlerts = true;
    const { fixture, navigate } = await render();
    const root: HTMLElement = fixture.nativeElement;

    expect(fixture.componentInstance.continueJobAlerts).toBeTrue();
    expect(fixture.componentInstance.showRoleTabs).toBeFalse();
    expect(fixture.componentInstance.activeRole).toBe(3);
    expect(navigate).not.toHaveBeenCalled();
    expect(root.querySelector('[role="tablist"]')).toBeNull();
    expect(root.querySelector('[role="tab"]')).toBeNull();
    expect(root.querySelector('form').getAttribute('role')).toBeNull();
    expect(root.textContent).toContain('Sign in to choose a position and start getting job alerts.');
    expect(root.textContent).not.toContain('Employers');
    expect(root.querySelector('.gh-role-switch')).toBeNull();
  });
});
