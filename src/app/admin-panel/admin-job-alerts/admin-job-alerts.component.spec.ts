import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminJobAlertsComponent } from './admin-job-alerts.component';
import { AdminTimeFilterComponent } from '../admin-time-filter/admin-time-filter.component';
import { AdminPagerComponent } from '../admin-pager/admin-pager.component';
import { AdminStatusComponent } from '../admin-status/admin-status.component';
import { AdminService } from '../admin.service';
import { AdminJobAlertQuery } from '../admin.model';
import { fixtureJobAlerts, fixtureJobAlertUser, JOA_FIXTURE_PANEL_UID } from '../admin.fixtures';
import { configureComponentTestingModule } from '../../../testing/component-harness';

class JobAlertStub {
  lists: AdminJobAlertQuery[] = [];
  details: string[] = [];

  listJobOpeningAlerts(query: AdminJobAlertQuery) {
    this.lists.push(query);
    return of(fixtureJobAlerts(query));
  }

  getJobOpeningAlertUser(uid: string, shot?: AdminJobAlertQuery['fixtureShot']) {
    this.details.push(uid);
    const detail = fixtureJobAlertUser(uid, shot);
    if (!detail) {
      return throwError(() => ({ status: 404, error: 'missing' }));
    }
    return of(detail);
  }
}

describe('AdminJobAlertsComponent', () => {
  let stub: JobAlertStub;

  beforeEach(async () => {
    stub = new JobAlertStub();
    await configureComponentTestingModule({
      declarations: [
        AdminJobAlertsComponent,
        AdminTimeFilterComponent,
        AdminPagerComponent,
        AdminStatusComponent,
      ],
      imports: [CommonModule],
      providers: [{ provide: AdminService, useValue: stub }],
    }).compileComponents();
  });

  async function setup(query = ''): Promise<ComponentFixture<AdminJobAlertsComponent>> {
    stub.lists = [];
    stub.details = [];
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/' + (query ? `?${query}` : ''));
    const fixture = TestBed.createComponent(AdminJobAlertsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('defaults to Last 7 days and Active, and keeps send ids off the list', async () => {
    const fixture = await setup();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Job Alerts');
    expect(text).toContain('Last 7 days');
    expect(text).toContain('Subscribed at');
    expect(text).toContain('Last digest');
    const pressed = fixture.nativeElement.querySelector('.admin-status-chip[aria-pressed="true"]');
    expect(pressed.textContent).toContain('Active');
    const search = fixture.nativeElement.querySelector('input[name="job-alert-search"]');
    expect(search.getAttribute('placeholder')).toBe('Seeker email, name, or position');
    expect(stub.lists[0].active).toBeTrue();
    expect(stub.lists[0].range).toBe('7d');

    const table = fixture.nativeElement.querySelector('table');
    const tableText = table.textContent as string;
    expect(tableText).toContain('Ada Cruz');
    expect(tableText).toContain('Employer');
    expect(tableText).toContain('Archived');
    expect(tableText).toContain('Marketing Manager');
    expect(tableText).not.toContain('marketing manager');
    expect(tableText).not.toContain('joa-msg-');
    expect(tableText).not.toContain('Lease');
    const detail = fixtureJobAlertUser(JOA_FIXTURE_PANEL_UID);
    const week = detail && detail.subscriptions.map(row => row.lastDigestWeek).find(value => !!value);
    expect(week).toBeTruthy();
    expect(tableText).not.toContain(week as string);
  });

  it('sends active=all for All and active=false for Inactive', async () => {
    const fixture = await setup();
    const chips = fixture.nativeElement.querySelectorAll('.admin-status-chip');
    chips[2].click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(stub.lists[stub.lists.length - 1].active).toBe('all');
    expect(stub.lists[stub.lists.length - 1].range).toBe('7d');

    chips[1].click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(stub.lists[stub.lists.length - 1].active).toBeFalse();
  });

  it('opens the seeker panel with every subscription, send ids, and the lease', async () => {
    const fixture = await setup();
    const button = Array.from(fixture.nativeElement.querySelectorAll('.admin-row-button'))
      .find((node: HTMLElement) => node.textContent && node.textContent.indexOf('Ada Cruz') !== -1) as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('aside');
    expect(panel).toBeTruthy();
    const panelText = panel.textContent as string;
    expect(panelText).toContain('Ada Cruz');
    expect(panelText).toContain('ada.cruz@example.com');
    expect(panelText).toContain('Jobseeker');
    expect(panelText).toContain('active /');
    expect(panelText).toContain('Marketing Manager');
    expect(panelText).toContain('marketing manager');
    expect(panelText).toContain('Kitchen Lead');
    expect(panelText).toContain('Nurse');
    expect(panelText).toContain('joa-msg-instant-ada-marketing');
    expect(panelText).toContain('joa-msg-digest-ada-marketing');
    expect(panelText).toContain('Lease');
    expect(fixture.nativeElement.querySelector('tr.admin-row--selected')).toBeTruthy();

    const close = Array.from(panel.querySelectorAll('button'))
      .find((node: HTMLElement) => node.textContent && node.textContent.trim() === 'Close') as HTMLButtonElement;
    close.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('aside')).toBeFalsy();
  });

  it('deep-links the panel from ?user=', async () => {
    const fixture = await setup(`user=${JOA_FIXTURE_PANEL_UID}`);
    const panel = fixture.nativeElement.querySelector('aside');
    expect(panel.textContent).toContain('3 active / 4 total');
    expect(stub.details).toContain(JOA_FIXTURE_PANEL_UID);
  });

  it('uses the Active empty copy, the other empty copy, and the unavailable card', async () => {
    const empty = await setup('shot=empty');
    expect(empty.nativeElement.textContent).toContain('No active Job Alert subscriptions in this range.');
    expect(empty.nativeElement.textContent).not.toContain('Job Alert subscriptions aren\u2019t available yet.');
    empty.destroy();

    const inactive = await setup('status=inactive&shot=empty');
    expect(inactive.nativeElement.textContent).toContain('No Job Alert subscriptions in this range.');
    expect(inactive.nativeElement.textContent).not.toContain('No active Job Alert subscriptions in this range.');
    inactive.destroy();

    const unavailable = await setup('shot=unavailable');
    expect(unavailable.nativeElement.textContent).toContain('Job Alert subscriptions aren’t available yet.');
    expect(unavailable.nativeElement.querySelector('table')).toBeFalsy();
    expect(stub.lists[stub.lists.length - 1].fixtureShot).toBe('unavailable');
  });
});
