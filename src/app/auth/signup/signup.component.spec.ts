import { Component, forwardRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { JOB_ALERT_MODAL_SESSION_KEY } from '@main/jobs/job-opening-alerts.service';
import { SeoService } from '@app-core/services/seo.service';
import { AuthService } from '../auth.service';
import { GoogleAuthService } from '../services/google-auth.service';
import { AuthFacade } from '../state/auth.facade';
import { AuthRoleTabsComponent } from '../auth-role-tabs/auth-role-tabs.component';
import { SignupComponent } from './signup.component';

@Component({
  selector: 're-captcha',
  template: '',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RecaptchaStubComponent),
    multi: true,
  }],
})
class RecaptchaStubComponent implements ControlValueAccessor {
  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}
}

describe('SignupComponent role tabs', () => {
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

  async function render(): Promise<{ fixture: ComponentFixture<SignupComponent>; navigate: jasmine.Spy }> {
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
      declarations: [SignupComponent, AuthRoleTabsComponent, RecaptchaStubComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useValue: {
          snapshot: { queryParamMap: paramMap },
          queryParamMap: of(paramMap),
        } },
        { provide: AuthFacade, useValue: {
          getSuccess$: of(null),
          loading$: of(false),
          error$: of(null),
          signUp: () => undefined,
        } },
        { provide: AuthService, useValue: {} },
        { provide: GoogleAuthService, useValue: {} },
        { provide: SeoService, useValue: { setPageMeta: () => undefined } },
        { provide: MatDialog, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SignupComponent);
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.detectChanges();
    return { fixture, navigate };
  }

  it('defaults to Job seekers and keeps the role on the sign-in link', async () => {
    const { fixture, navigate } = await render();
    const root: HTMLElement = fixture.nativeElement;

    expect(fixture.componentInstance.activeRole).toBe(3);
    expect(fixture.componentInstance.registerForm.get('role').value).toBe(3);
    expect(navigate).not.toHaveBeenCalled();
    expect(root.querySelector('app-auth-role-prompt')).toBeNull();
    expect(root.querySelector('#signup-role')).toBeNull();
    expect(root.textContent).not.toContain('What brings you here today?');
    expect(root.querySelector('#signup-tab-3').getAttribute('aria-selected')).toBe('true');
    expect(root.querySelector('form').getAttribute('role')).toBe('tabpanel');
    expect(root.querySelector('form').getAttribute('aria-labelledby')).toBe('signup-tab-3');
    expect(fixture.componentInstance.signinQuery).toEqual({ role: 3 });
    expect(root.textContent).toContain('Create');
    expect(root.textContent).toContain('your account');
  });

  it('honors ?role=2 and the employer alias', async () => {
    query = { role: '2' };
    const employer = await render();
    expect(employer.fixture.componentInstance.activeRole).toBe(2);
    expect(employer.navigate).not.toHaveBeenCalled();
    expect(employer.fixture.nativeElement.textContent).toContain('your employer account');
    expect(employer.fixture.nativeElement.querySelector('#signup-tab-2').getAttribute('aria-selected')).toBe('true');
    expect(employer.fixture.componentInstance.signinQuery).toEqual({ role: 2 });

    query = { role: 'seeker' };
    const alias = await render();
    expect(alias.fixture.componentInstance.activeRole).toBe(3);
    expect(alias.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { role: 3 },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    }));
  });

  it('hides the tablist while continuing Job Alerts signup', async () => {
    query = { role: '3' };
    jobAlerts = true;
    const { fixture } = await render();
    const root: HTMLElement = fixture.nativeElement;

    expect(fixture.componentInstance.continueJobAlerts).toBeTrue();
    expect(fixture.componentInstance.activeRole).toBe(3);
    expect(root.querySelector('[role="tablist"]')).toBeNull();
    expect(root.querySelector('#signup-role')).toBeNull();
    expect(root.textContent).toContain('Create your');
    expect(root.textContent).toContain('job seeker account');
    expect(root.textContent).not.toContain('Employers');
    expect(root.querySelector('form').getAttribute('role')).toBeNull();
  });
});
