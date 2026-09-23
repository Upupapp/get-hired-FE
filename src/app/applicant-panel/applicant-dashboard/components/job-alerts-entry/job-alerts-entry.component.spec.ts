import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { JobOpeningAlertSubscription, JobOpeningAlertsService } from '@main/jobs/job-opening-alerts.service';
import { JobAlertsEntryComponent } from './job-alerts-entry.component';

describe('JobAlertsEntryComponent', () => {
  let fixture: ComponentFixture<JobAlertsEntryComponent>;
  let list$: Subject<JobOpeningAlertSubscription[]>;

  const subscription = (position: string): JobOpeningAlertSubscription => ({
    id: position,
    position,
    jobRoleId: null,
    active: true,
    instantSentAt: null,
    createdAt: null,
    updatedAt: null,
  });

  beforeEach(async () => {
    list$ = new Subject<JobOpeningAlertSubscription[]>();
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [JobAlertsEntryComponent],
      providers: [
        { provide: JobOpeningAlertsService, useValue: { list: () => list$.asObservable() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JobAlertsEntryComponent);
    fixture.detectChanges();
  });

  function text(): string {
    return fixture.nativeElement.textContent;
  }

  function href(selector: string): string {
    return fixture.debugElement.query(By.css(selector)).nativeElement.getAttribute('href');
  }

  it('renders the locked card copy above the actions', () => {
    expect(text()).toContain('Job Alerts');
    expect(text()).toContain('Get emailed when new openings match positions you follow.');
    expect(text()).toContain('Up to 30 positions · Tuesday digest 9PM PH');
    expect(text()).toContain('Add alert');
    expect(text()).toContain('Manage');
    expect(text()).not.toContain('Manage job alerts');
  });

  it('sends Add alert to the manage page focused on the position field', () => {
    list$.next([]);
    fixture.detectChanges();

    expect(href('.job-alerts-entry__primary')).toContain('/job-alerts');
    expect(href('.job-alerts-entry__primary')).toContain('focus=add');
    expect(href('.job-alerts-entry__secondary')).toBe('/job-alerts');
    expect(fixture.nativeElement.querySelector('.job-alerts-entry__primary').textContent).toContain('Add alert');
  });

  it('switches the primary label and points Manage at the list once alerts exist', () => {
    list$.next([subscription('Registered Nurse')]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.job-alerts-entry__primary').textContent).toContain('Add another');
    expect(href('.job-alerts-entry__primary')).toContain('focus=add');
    expect(href('.job-alerts-entry__secondary')).toBe('/job-alerts#positions');
  });

  it('keeps Add alert when the subscription list cannot be loaded', () => {
    list$.error(new Error('offline'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.job-alerts-entry__primary').textContent).toContain('Add alert');
    expect(href('.job-alerts-entry__secondary')).toBe('/job-alerts');
  });
});
