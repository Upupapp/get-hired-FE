import { Component, NO_ERRORS_SCHEMA, NgZone } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CompanyFacade } from '@app-company/state/company.facade';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
import { E2_SEATS_FULL_TEAM_ADMIN } from '../../../testing/engagement-e2-contextual.fixture';
import { EmployerSettingsComponent } from './employer-settings.component';

@Component({ template: '<router-outlet></router-outlet>' })
class HostComponent {}

/** F5: the MANAGE_TEAM action gh-be sends (658d0a5) opens Team & Access, tab 3, where the seats nudge sits. */
describe('EmployerSettingsComponent -- the MANAGE_TEAM url opens tab 3 (F5)', () => {
  let storedUser: string | null;

  beforeEach(() => {
    storedUser = localStorage.getItem('user');
    localStorage.setItem('user', JSON.stringify({ companyId: 'CO-1', companyName: 'Acme Hiring' }));
  });

  afterEach(() => {
    if (storedUser === null) { localStorage.removeItem('user'); } else { localStorage.setItem('user', storedUser); }
  });

  it('navigating to the action\'s url renders Team & Access with the team members list', fakeAsync(() => {
    const action = E2_SEATS_FULL_TEAM_ADMIN.actions.find(a => a.intent === 'MANAGE_TEAM')!;
    expect(action.url).toBe('/recruiter/company/settings?tab=3');
    TestBed.configureTestingModule({
      declarations: [HostComponent, EmployerSettingsComponent],
      imports: [RouterTestingModule.withRoutes([{ path: 'recruiter/company/settings', component: EmployerSettingsComponent }])],
      providers: [
        { provide: EmployeeFacade, useValue: {} },
        { provide: CompanyFacade, useValue: { companyDetails$: of(null) } },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } },
        { provide: TranslateService, useValue: { instant: (key: string) => key, get: (key: string) => of(key) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    const host = TestBed.createComponent(HostComponent);
    TestBed.inject(NgZone).run(() => { TestBed.inject(Router).navigateByUrl(action.url); });
    tick();
    host.detectChanges();
    const panel: HTMLElement | null = host.nativeElement.querySelector('#ebc-panel-3');
    expect(panel).not.toBeNull();
    expect(panel!.querySelector('app-employer-company-users')).not.toBeNull();
    expect(host.nativeElement.querySelector('#ebc-panel-1')).toBeNull();
  }));
});
