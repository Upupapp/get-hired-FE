import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { JobCreateComponent } from './job-create.component';
import { JobFacade } from '@app-job/state/job.facade';
import { JobService } from '../job.service';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { TalentProofService } from '@main/public/services/talent-proof.service';
import { PublicPortalAnalyticsService } from '@main/public/services/public-portal-analytics.service';
import { HapticFeedbackService } from '@main/shared/services/haptic-feedback/haptic-feedback.service';
import { JobReadinessService } from '../services/job-readiness.service';
import { EasyJobPostAssistantService } from '../easy-job-post-assistant/easy-job-post-assistant.service';
import { AiCreateDraftService } from '../services/ai-create-draft.service';
import { JobCreateRecoveryService } from '../services/job-create-recovery.service';
import { CoreService } from '@app-core/services/core.service';
import { PlanLimitDialogService } from '@main/shared/plan-limit/plan-limit-dialog.service';
import { EmployerPlanLimitRefusal, PlanLimitChoice } from '@main/shared/plan-limit/plan-limit-refusal';
import { EMPLOYER_REFUSAL, httpFailure } from '../../../testing/plan-limit-refusal.fixture';

/**
 * B5: the job page's Publish, refused by a plan limit. The page opens the limit modal with
 * gh-be A3's payload, and "Save as draft" in it saves this job as a draft. ngOnInit is never
 * called (see job-create.component.spec.ts); the refusal stream is attached directly.
 */
describe('JobCreateComponent -- a publish refused by a plan limit (B5)', () => {
  let component: JobCreateComponent;
  let fixture: ComponentFixture<JobCreateComponent>;
  let refusal$: Subject<EmployerPlanLimitRefusal | null>;
  let choice$: Subject<PlanLimitChoice | undefined>;
  let mockJobFacade: any;
  let planLimitDialog: { open: jasmine.Spy };
  let jobService: jasmine.SpyObj<JobService>;

  beforeEach(async () => {
    refusal$ = new Subject<EmployerPlanLimitRefusal | null>();
    choice$ = new Subject<PlanLimitChoice | undefined>();
    mockJobFacade = {
      jobDetails$: of(null),
      subsRestrictions$: of(null),
      loading$: of(false),
      planLimitRefusal$: refusal$.asObservable(),
      saveJob: jasmine.createSpy('saveJob'),
      clearPlanLimitRefusal: jasmine.createSpy('clearPlanLimitRefusal'),
      saveInitialForm: jasmine.createSpy('saveInitialForm'),
      saveJobInfo: jasmine.createSpy('saveJobInfo'),
      saveInterview: jasmine.createSpy('saveInterview'),
      getIndustry: jasmine.createSpy('getIndustry'),
      getJobRole: jasmine.createSpy('getJobRole'),
      resetFormState: jasmine.createSpy('resetFormState'),
    };
    planLimitDialog = { open: jasmine.createSpy('open').and.returnValue(choice$.asObservable()) };
    // Untyped, as in job-create.component.spec.ts: getJobLevels is not on JobService's type.
    jobService = jasmine.createSpyObj('JobService', ['getJobLevels', 'saveJob']) as jasmine.SpyObj<JobService>;

    await TestBed.configureTestingModule({
      declarations: [JobCreateComponent],
      providers: [
        FormBuilder,
        { provide: JobFacade, useValue: mockJobFacade },
        { provide: PlanLimitDialogService, useValue: planLimitDialog },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open'), closeAll: jasmine.createSpy('closeAll') } },
        { provide: HapticFeedbackService, useValue: jasmine.createSpyObj('HapticFeedbackService', ['warning', 'success', 'selection', 'impact', 'error']) },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']) },
        { provide: ActivatedRoute, useValue: { queryParams: new Subject<any>().asObservable() } },
        { provide: SnackbarService, useValue: jasmine.createSpyObj('SnackbarService', ['success', 'error', 'warning', 'info']) },
        { provide: ChangeDetectorRef, useValue: { detectChanges: () => {}, markForCheck: () => {} } },
        { provide: TalentProofService, useValue: {} },
        { provide: PublicPortalAnalyticsService, useValue: jasmine.createSpyObj('PublicPortalAnalyticsService', ['trackHeroCTAClicked', 'trackFinalCTAClicked']) },
        { provide: JobReadinessService, useValue: { evaluate: () => null } },
        { provide: EasyJobPostAssistantService, useValue: { getExtractionResult: () => null } },
        { provide: AiCreateDraftService, useValue: jasmine.createSpyObj('AiCreateDraftService', ['save', 'load', 'clear', 'hasDraft']) },
        { provide: JobService, useValue: jobService },
        { provide: JobCreateRecoveryService, useValue: jasmine.createSpyObj('JobCreateRecoveryService', ['save', 'load', 'clear']) },
        { provide: CoreService, useValue: { authState$: of(false) } },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(JobCreateComponent);
    component = fixture.componentInstance;
    component.setFormGroup();
    (component as any).watchPlanLimitRefusals();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('opens the limit modal with A3\'s refusal, clears it from the store, and saves nothing yet', () => {
    component.isReadyToPublish = true;
    refusal$.next(EMPLOYER_REFUSAL);
    expect(planLimitDialog.open).toHaveBeenCalledOnceWith(EMPLOYER_REFUSAL);
    expect(mockJobFacade.clearPlanLimitRefusal).toHaveBeenCalledTimes(1);
    expect(component.isReadyToPublish).toBeFalse();
    expect(mockJobFacade.saveJob).not.toHaveBeenCalled();
  });

  it('"Save as draft" in the modal saves this job as a draft', async () => {
    refusal$.next(EMPLOYER_REFUSAL);
    choice$.next('draft');
    await fixture.whenStable();
    expect(mockJobFacade.saveJob).toHaveBeenCalledTimes(1);
    expect(mockJobFacade.saveJob.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ jobStatusId: 1 }));
  });

  it('upgrading, or closing the modal, saves nothing', () => {
    refusal$.next(EMPLOYER_REFUSAL);
    choice$.next('upgrade');
    choice$.next(undefined);
    expect(mockJobFacade.saveJob).not.toHaveBeenCalled();
  });

  it('a background autosave refused by a plan limit shows the backend\'s reason on the save pill, not a connection error', () => {
    component.jobId = 'JOB-1';
    component.status = 2;
    jobService.saveJob.and.returnValue(throwError(httpFailure(402, EMPLOYER_REFUSAL)));
    (component as any).performAutosave();
    expect(component.autoSaveState).toBe('failed');
    expect(component.saveErrorMsg).toBe(EMPLOYER_REFUSAL.userMessage);
  });
});
