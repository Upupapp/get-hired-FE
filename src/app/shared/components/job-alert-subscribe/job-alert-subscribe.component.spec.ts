import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { CoreService } from '@app-core/services/core.service';
import { JobOpeningAlertsService } from '@main/jobs/job-opening-alerts.service';
import { JobAlertSubscribeComponent } from './job-alert-subscribe.component';

describe('JobAlertSubscribeComponent', () => {
  let fixture: ComponentFixture<JobAlertSubscribeComponent>;
  let router: { navigate: jasmine.Spy };
  let snackbar: { info: jasmine.Spy; success: jasmine.Spy; error: jasmine.Spy };
  let alerts: { create: jasmine.Spy };
  let core: { getRole: jasmine.Spy };

  beforeEach(async () => {
    localStorage.clear();
    router = { navigate: jasmine.createSpy('navigate') };
    snackbar = {
      info: jasmine.createSpy('info'),
      success: jasmine.createSpy('success'),
      error: jasmine.createSpy('error'),
    };
    alerts = { create: jasmine.createSpy('create').and.returnValue(of({ subscription: null, created: true })) };
    core = { getRole: jasmine.createSpy('getRole').and.returnValue(Promise.resolve('3')) };

    await TestBed.configureTestingModule({
      declarations: [JobAlertSubscribeComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: SnackbarService, useValue: snackbar },
        { provide: JobOpeningAlertsService, useValue: alerts },
        { provide: CoreService, useValue: core },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JobAlertSubscribeComponent);
    fixture.componentInstance.position = 'Accountant';
    fixture.componentInstance.jobRoleId = 4;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('sends a logged-out visitor to sign-in and remembers the position', () => {
    fixture.nativeElement.querySelector('button').click();

    expect(alerts.create).not.toHaveBeenCalled();
    expect(localStorage.getItem('returnURL')).toBe('/job-alerts?position=Accountant&jobRoleId=4');
    expect(router.navigate).toHaveBeenCalledWith(['/signin'], { queryParams: { role: 3 } });
    expect(snackbar.info).toHaveBeenCalled();
  });

  it('subscribes immediately for a signed-in job seeker', async () => {
    localStorage.setItem('state', 'true');
    localStorage.setItem('token', 'Bearer token');

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();

    expect(alerts.create).toHaveBeenCalledWith('Accountant', 4);
    expect(snackbar.success).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
