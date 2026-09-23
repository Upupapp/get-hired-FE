import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { SeoService } from '@app-core/services/seo.service';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { SearchService } from '@app-core/services/search.service';
import { JOB_ALERT_MODAL_SESSION_KEY } from '@main/jobs/job-opening-alerts.service';
import { PublicListComponent } from './public-list.component';

describe('PublicListComponent job alerts hero', () => {
  let fixture: ComponentFixture<PublicListComponent>;
  let router: { navigate: jasmine.Spy; navigateByUrl: jasmine.Spy };
  let dialog: { open: jasmine.Spy };
  let snackbar: { info: jasmine.Spy; error: jasmine.Spy };
  let route: { queryParams: any; snapshot: { queryParamMap: any } };

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    route = {
      queryParams: of({}),
      snapshot: { queryParamMap: convertToParamMap({}) },
    };
    router = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
      navigateByUrl: jasmine.createSpy('navigateByUrl'),
    };
    dialog = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(null) }),
    };
    snackbar = { info: jasmine.createSpy('info'), error: jasmine.createSpy('error') };

    await TestBed.configureTestingModule({
      declarations: [PublicListComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
        { provide: SnackbarService, useValue: snackbar },
        { provide: SeoService, useValue: {
          setPageMeta: () => undefined,
          setBreadcrumbJsonLd: () => undefined,
          clearBreadcrumbJsonLd: () => undefined,
        } },
        { provide: SearchService, useValue: { searchPublic: () => of({}) } },
      ],
    }).overrideComponent(PublicListComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(PublicListComponent);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  function init(): Promise<void> {
    fixture.detectChanges();
    return fixture.whenStable();
  }

  it('sends a guest to seeker sign-in and remembers the modal', () => {
    fixture.componentInstance.onJobAlertsClick();

    expect(dialog.open).not.toHaveBeenCalled();
    expect(localStorage.getItem('returnURL')).toBe('/jobs?openJobAlertModal=1');
    expect(sessionStorage.getItem(JOB_ALERT_MODAL_SESSION_KEY)).toBe('1');
    expect(router.navigate).toHaveBeenCalledWith(['/signin'], { queryParams: { role: 3 } });
    expect(snackbar.info).toHaveBeenCalled();
  });

  it('opens the subscribe modal for a signed-in job seeker', () => {
    localStorage.setItem('state', 'true');
    localStorage.setItem('token', 'Bearer token');
    localStorage.setItem('role', '3');

    fixture.componentInstance.onJobAlertsClick();

    expect(dialog.open).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(localStorage.getItem('returnURL')).toBeNull();
  });

  it('does not open the modal for a signed-in employer', () => {
    localStorage.setItem('state', 'true');
    localStorage.setItem('token', 'Bearer token');
    localStorage.setItem('role', '2');

    fixture.componentInstance.onJobAlertsClick();

    expect(dialog.open).not.toHaveBeenCalled();
    expect(snackbar.error).toHaveBeenCalledWith('Job opening alerts are only available to job seekers.');
  });

  it('reopens the modal after a seeker returns to the jobs browse URL', async () => {
    localStorage.setItem('state', 'true');
    localStorage.setItem('token', 'Bearer token');
    localStorage.setItem('role', '3');
    sessionStorage.setItem(JOB_ALERT_MODAL_SESSION_KEY, '1');
    route.snapshot.queryParamMap = convertToParamMap({ openJobAlertModal: '1' });

    await init();

    expect(dialog.open).toHaveBeenCalled();
    expect(sessionStorage.getItem(JOB_ALERT_MODAL_SESSION_KEY)).toBeNull();
    expect(router.navigate).toHaveBeenCalled();
    const args = router.navigate.calls.mostRecent().args;
    expect(args[1].queryParams.openJobAlertModal).toBeNull();
    expect(args[1].replaceUrl).toBe(true);
  });

  it('drops the resume flag for an employer and does not open the modal', async () => {
    localStorage.setItem('state', 'true');
    localStorage.setItem('token', 'Bearer token');
    localStorage.setItem('role', '2');
    sessionStorage.setItem(JOB_ALERT_MODAL_SESSION_KEY, '1');

    await init();

    expect(dialog.open).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(JOB_ALERT_MODAL_SESSION_KEY)).toBeNull();
  });

  it('keeps the resume flag when a guest lands on the return URL', async () => {
    route.snapshot.queryParamMap = convertToParamMap({ openJobAlertModal: '1' });

    await init();

    expect(dialog.open).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(JOB_ALERT_MODAL_SESSION_KEY)).toBe('1');
  });
});
