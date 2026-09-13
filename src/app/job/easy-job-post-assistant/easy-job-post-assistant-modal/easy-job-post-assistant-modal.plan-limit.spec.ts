import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { EasyJobPostAssistantModalComponent } from './easy-job-post-assistant-modal.component';
import { EasyJobPostAssistantService } from '../easy-job-post-assistant.service';
import { HapticFeedbackService } from '@main/shared/services/haptic-feedback/haptic-feedback.service';
import { AiCreateDraftService } from '@app-job/services/ai-create-draft.service';
import { JobService } from '@app-job/job.service';
import { JobFacade } from '@app-job/state/job.facade';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { PlanLimitDialogService } from '@main/shared/plan-limit/plan-limit-dialog.service';
import { PlanLimitChoice } from '@main/shared/plan-limit/plan-limit-refusal';
import { EMPLOYER_REFUSAL, httpFailure } from '../../../../testing/plan-limit-refusal.fixture';

/**
 * B5: the AI assistant's "Post now" (POST /job/create, jobStatusId 2) refused by a plan limit.
 * The template is not under test and is replaced; these drive the failure handler that the
 * publish request's error callback delegates to.
 */
describe('EasyJobPostAssistantModalComponent -- "Post now" refused by a plan limit (B5)', () => {
  let component: EasyJobPostAssistantModalComponent;
  let choice$: Subject<PlanLimitChoice | undefined>;
  let planLimitDialog: { open: jasmine.Spy };
  let jobService: jasmine.SpyObj<JobService>;
  let jobFacade: jasmine.SpyObj<JobFacade>;
  let dialogRef: { close: jasmine.Spy; afterClosed: jasmine.Spy };
  let router: jasmine.SpyObj<Router>;
  let snackbar: jasmine.SpyObj<SnackbarService>;

  const JOB: any = { jobTitle: 'Chef', companyId: 'CO-1', jobStatusId: 2 };

  beforeEach(() => {
    choice$ = new Subject<PlanLimitChoice | undefined>();
    planLimitDialog = { open: jasmine.createSpy('open').and.returnValue(choice$.asObservable()) };
    jobService = jasmine.createSpyObj<JobService>('JobService', ['saveJob']);
    jobFacade = jasmine.createSpyObj<JobFacade>('JobFacade', ['getBasicList']);
    dialogRef = { close: jasmine.createSpy('close'), afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(undefined)) };
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    snackbar = jasmine.createSpyObj<SnackbarService>('SnackbarService', ['success', 'error', 'warning', 'info']);

    TestBed.overrideComponent(EasyJobPostAssistantModalComponent, { set: { template: '' } });
    TestBed.configureTestingModule({
      declarations: [EasyJobPostAssistantModalComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MatDialog, useValue: {} },
        { provide: EasyJobPostAssistantService, useValue: {} },
        { provide: Router, useValue: router },
        { provide: HapticFeedbackService, useValue: jasmine.createSpyObj('HapticFeedbackService', ['warning', 'success', 'selection', 'impact', 'error']) },
        { provide: AiCreateDraftService, useValue: jasmine.createSpyObj('AiCreateDraftService', ['save', 'load', 'clear']) },
        { provide: JobService, useValue: jobService },
        { provide: JobFacade, useValue: jobFacade },
        { provide: SnackbarService, useValue: snackbar },
        { provide: PlanLimitDialogService, useValue: planLimitDialog },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    component = TestBed.createComponent(EasyJobPostAssistantModalComponent).componentInstance;
  });

  it('opens the limit modal with A3\'s refusal and publishes nothing', () => {
    component.onPostNowFailed(httpFailure(402, EMPLOYER_REFUSAL), JOB, 'CO-1');
    expect(planLimitDialog.open).toHaveBeenCalledOnceWith(EMPLOYER_REFUSAL);
    expect(component.errorMsg).toBeNull();
    expect(jobService.saveJob).not.toHaveBeenCalled();
  });

  it('"Save as draft" saves the same job as a draft and returns to the jobs list', () => {
    jobService.saveJob.and.returnValue(of({ data: { jobId: 'JOB-9' } }) as any);
    component.onPostNowFailed(httpFailure(402, EMPLOYER_REFUSAL), JOB, 'CO-1');
    choice$.next('draft');
    expect(jobService.saveJob).toHaveBeenCalledOnceWith({ ...JOB, jobStatusId: 1 });
    expect(jobFacade.getBasicList).toHaveBeenCalledOnceWith('CO-1');
    expect(snackbar.success).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledOnceWith({ navigateTo: '/recruiter/jobs/list', published: false });
    expect(router.navigate).toHaveBeenCalledOnceWith(['/recruiter/jobs/list']);
  });

  it('upgrading, or closing the modal, saves nothing', () => {
    component.onPostNowFailed(httpFailure(402, EMPLOYER_REFUSAL), JOB, 'CO-1');
    choice$.next('upgrade');
    choice$.next(undefined);
    expect(jobService.saveJob).not.toHaveBeenCalled();
  });

  it('every other failure keeps its message and opens no modal', () => {
    component.onPostNowFailed(httpFailure(422, { message: 'Some required fields are missing.', missing: ['City'] }), JOB, 'CO-1');
    expect(planLimitDialog.open).not.toHaveBeenCalled();
    expect(component.errorMsg).toBe('Some required fields are missing. (City)');
  });
});
