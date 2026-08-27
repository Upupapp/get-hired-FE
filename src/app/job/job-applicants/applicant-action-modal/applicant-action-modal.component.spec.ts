import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
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
 *
 * The component has since moved its snacks from raw MatSnackBar.open() to
 * SnackbarService, which attaches panelClass and an aria-live politeness level
 * per severity, and several message strings were rewritten. The expectations
 * below track the component's current behaviour; the spy still sits on
 * MatSnackBar because SnackbarService calls straight through to it, so these
 * assertions also pin the accessibility config.
 */
const SUCCESS_SNACK: MatSnackBarConfig = { duration: 3000, panelClass: ['success-snackbar'], politeness: 'polite' };
const ERROR_SNACK: MatSnackBarConfig   = { duration: 4000, panelClass: ['danger-snackbar'], politeness: 'assertive' };
const INFO_SNACK: MatSnackBarConfig    = { duration: 3000, panelClass: ['info-snackbar'], politeness: 'polite' };
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
      'Application status updated to "Shortlisted".', 'OK', SUCCESS_SNACK
    );
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      statusUpdated: true,
      newStatusId: 4,
      newStatusName: 'Shortlisted',
      applicationId: 'app-001',
    });
  }));

  it('resets statusUpdating to false after success', fakeAsync(() => {
    // A Subject, not of({}): of() emits on subscribe, so the flag would be back
    // to false before the first assertion could observe it being set.
    const gate = new Subject<any>();
    mockJobService.updateApplicationStatus.and.returnValue(gate.asObservable());

    component.selectStatus(4, 'Shortlisted');
    expect(component.statusUpdating).toBeTrue();

    gate.next({});
    gate.complete();
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
      'Application not found.', 'OK', ERROR_SNACK
    );
  }));

  it('shows fallback message when err.error.message is absent', fakeAsync(() => {
    mockJobService.updateApplicationStatus.and.returnValue(
      throwError(() => ({}))
    );

    component.selectStatus(4, 'Shortlisted');
    tick();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      "We couldn't update the status. Please try again.", 'OK', ERROR_SNACK
    );
  }));

  it('resets statusUpdating to false after HTTP error', fakeAsync(() => {
    // Same reason as the success case: throwError() fires synchronously.
    const gate = new Subject<any>();
    mockJobService.updateApplicationStatus.and.returnValue(gate.asObservable());

    component.selectStatus(4, 'Shortlisted');
    expect(component.statusUpdating).toBeTrue();

    gate.error({});
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
      'This applicant is already at that status — no change made.', 'Dismiss', INFO_SNACK
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
      "We couldn't find this application. Please close and try again.", 'Dismiss', ERROR_SNACK
    );
    expect(mockJobService.updateApplicationStatus).not.toHaveBeenCalled();
  });

  it('shows snack and returns early when data is entirely null', () => {
    component.data = null;

    component.selectStatus(4, 'Shortlisted');

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      "We couldn't find this application. Please close and try again.", 'Dismiss', ERROR_SNACK
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
