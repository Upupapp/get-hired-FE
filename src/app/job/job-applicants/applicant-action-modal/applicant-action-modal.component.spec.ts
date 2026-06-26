import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ApplicantActionModalComponent } from './applicant-action-modal.component';
import { JobService } from '@app-job/job.service';

/**
 * TEST GATE — d3246b6: ApplicantActionModalComponent
 *
 * Covers:
 *   - selectStatus() happy path: HTTP success → snack + dialog.close with statusUpdated
 *   - selectStatus() sad path: HTTP error → snack with backend message / fallback
 *   - No-op guard: same-status selection → no API call
 *   - Missing applicationId guard: no API call, shows snack
 *   - openControlMenu('change-status') → sets statusView = true
 */
describe('ApplicantActionModalComponent -- status picker (d3246b6)', () => {
  let component: ApplicantActionModalComponent;
  let fixture: ComponentFixture<ApplicantActionModalComponent>;

  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ApplicantActionModalComponent>>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockJobService: jasmine.SpyObj<JobService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const makeData = (applicationId: string, currentStatusId: string | number) => ({
    data: {
      applicationId,
      jobApplicationStatusId: currentStatusId,
      firstName: 'Jane',
      lastName: 'Doe',
      jobTitle: 'Dev',
      workSetupName: 'Remote',
      jobTypeName: 'Full-time',
    },
  });

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockJobService = jasmine.createSpyObj('JobService', ['updateApplicationStatus']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ApplicantActionModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: makeData('app-001', '3') },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: JobService, useValue: mockJobService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicantActionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------

  it('calls updateApplicationStatus with correct args on a new status', fakeAsync(() => {
    mockJobService.updateApplicationStatus.and.returnValue(of({}));

    component.selectStatus(4, 'Shortlisted');
    tick();

    expect(mockJobService.updateApplicationStatus).toHaveBeenCalledOnceWith('app-001', 4);
  }));

  it('shows success snack and closes dialog with statusUpdated on HTTP success', fakeAsync(() => {
    mockJobService.updateApplicationStatus.and.returnValue(of({}));

    component.selectStatus(4, 'Shortlisted');
    tick();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Status updated to "Shortlisted".', 'OK', { duration: 3000 }
    );
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      statusUpdated: true,
      newStatusId: 4,
      newStatusName: 'Shortlisted',
    });
  }));

  it('resets statusUpdating to false after success', fakeAsync(() => {
    mockJobService.updateApplicationStatus.and.returnValue(of({}));

    component.selectStatus(4, 'Shortlisted');
    expect(component.statusUpdating).toBeTrue();
    tick();
    expect(component.statusUpdating).toBeFalse();
  }));

  // -------------------------------------------------------------------------
  // Sad path — HTTP error
  // -------------------------------------------------------------------------

  it('shows backend error message from err.error.message on HTTP failure', fakeAsync(() => {
    mockJobService.updateApplicationStatus.and.returnValue(
      throwError(() => ({ error: { message: 'Application not found.' } }))
    );

    component.selectStatus(4, 'Shortlisted');
    tick();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Application not found.', 'OK', { duration: 4000 }
    );
  }));

  it('shows fallback message when err.error.message is absent', fakeAsync(() => {
    mockJobService.updateApplicationStatus.and.returnValue(
      throwError(() => ({}))
    );

    component.selectStatus(4, 'Shortlisted');
    tick();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Failed to update status. Please try again.', 'OK', { duration: 4000 }
    );
  }));

  it('resets statusUpdating to false after HTTP error', fakeAsync(() => {
    mockJobService.updateApplicationStatus.and.returnValue(
      throwError(() => ({}))
    );

    component.selectStatus(4, 'Shortlisted');
    expect(component.statusUpdating).toBeTrue();
    tick();
    expect(component.statusUpdating).toBeFalse();
  }));

  it('does NOT close the dialog on HTTP error', fakeAsync(() => {
    mockJobService.updateApplicationStatus.and.returnValue(
      throwError(() => ({}))
    );

    component.selectStatus(4, 'Shortlisted');
    tick();

    expect(mockDialogRef.close).not.toHaveBeenCalled();
  }));

  // -------------------------------------------------------------------------
  // No-op guard: same status selected
  // -------------------------------------------------------------------------

  it('does NOT call updateApplicationStatus when the selected status matches the current one', () => {
    // current status is '3' (from makeData above); selecting 3 again should no-op
    component.selectStatus(3, 'Under Review');

    expect(mockJobService.updateApplicationStatus).not.toHaveBeenCalled();
  });

  it('shows "already has this status" snack on no-op and closes dialog', () => {
    component.selectStatus(3, 'Under Review');

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Applicant already has this status.', 'OK', { duration: 2000 }
    );
    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });

  it('handles numeric currentStatusId — no API call when statusId matches as integer', () => {
    // Override data to use a numeric jobApplicationStatusId (not a string)
    component.data = { data: { applicationId: 'app-002', jobApplicationStatusId: 4 } };

    component.selectStatus(4, 'Shortlisted');

    expect(mockJobService.updateApplicationStatus).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Missing applicationId guard
  // -------------------------------------------------------------------------

  it('shows snack and returns early when applicationId is missing', () => {
    component.data = { data: { applicationId: null, jobApplicationStatusId: '3' } };

    component.selectStatus(4, 'Shortlisted');

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Application ID not found.', 'OK', { duration: 3000 }
    );
    expect(mockJobService.updateApplicationStatus).not.toHaveBeenCalled();
  });

  it('shows snack and returns early when data is entirely null', () => {
    component.data = null;

    component.selectStatus(4, 'Shortlisted');

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Application ID not found.', 'OK', { duration: 3000 }
    );
    expect(mockJobService.updateApplicationStatus).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // openControlMenu wiring
  // -------------------------------------------------------------------------

  it('sets statusView = true when "change-status" menu is opened', () => {
    expect(component.statusView).toBeFalse();
    component.openControlMenu({ id: 'change-status' });
    expect(component.statusView).toBeTrue();
  });
});
