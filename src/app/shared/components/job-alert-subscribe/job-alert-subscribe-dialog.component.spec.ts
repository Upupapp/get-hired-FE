import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { JobOpeningAlertsService } from '@main/jobs/job-opening-alerts.service';
import { JobAlertSubscribeDialogComponent } from './job-alert-subscribe-dialog.component';

describe('JobAlertSubscribeDialogComponent', () => {
  let fixture: ComponentFixture<JobAlertSubscribeDialogComponent>;
  let dialogRef: { close: jasmine.Spy; disableClose: boolean };
  let alerts: { create: jasmine.Spy };

  beforeEach(async () => {
    dialogRef = { close: jasmine.createSpy('close'), disableClose: false };
    alerts = { create: jasmine.createSpy('create').and.returnValue(of({ subscription: null, created: true })) };

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule],
      declarations: [JobAlertSubscribeDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: JobOpeningAlertsService, useValue: alerts },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JobAlertSubscribeDialogComponent);
    fixture.detectChanges();
  });

  it('asks for a position and does not call the API when it is blank', () => {
    fixture.nativeElement.querySelector('.gh-jam__submit').click();
    fixture.detectChanges();

    expect(alerts.create).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Enter a position to follow.');
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
  });

  it('subscribes and shows a success state with a link to manage alerts', () => {
    fixture.componentInstance.position.setValue('Registered Nurse');
    fixture.nativeElement.querySelector('.gh-jam__submit').click();
    fixture.detectChanges();

    expect(alerts.create).toHaveBeenCalledWith('Registered Nurse');
    expect(fixture.nativeElement.textContent).toContain('You\'ll be notified when new openings match "Registered Nurse".');
    const manage: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(manage.textContent).toContain('Manage alerts');
    expect(manage.getAttribute('href')).toBe('/job-alerts');
    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();
  });

  it('treats an existing subscription as success without claiming a new one', () => {
    alerts.create.and.returnValue(of({ subscription: { id: 1 }, created: false }));
    fixture.componentInstance.position.setValue('Nurse');
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('You\'re already getting alerts for "Nurse".');
  });

  it('keeps the form open and explains a jobseeker-only failure', () => {
    alerts.create.and.returnValue(throwError(() => ({
      status: 403,
      error: { status: 'error', error: 'Forbidden' },
    })));
    fixture.componentInstance.position.setValue('Nurse');
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(fixture.componentInstance.succeeded).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Job opening alerts are only available to job seekers.');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
