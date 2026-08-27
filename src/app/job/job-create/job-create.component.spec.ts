import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';

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
import { FREELANCE_JOB_TYPE_SENTINEL } from '../utils/job-field-resolvers';

/**
 * Behavioural specs for the job-create stepper.
 *
 * Two things here have already caused real, silent data loss and are pinned
 * deliberately:
 *
 *  1. Simplified mode hides Step 3 entirely. Forward, back and every
 *     changeStep() caller must route around it -- landing on Step 3 leaves the
 *     Employer on a step with no visible content and no way forward.
 *  2. changeStep() saves the form group of the step being LEFT, not the
 *     destination. Using the destination silently saved the wrong group on
 *     backward and non-linear navigation, dropping edits from the NgRx store
 *     that the Preview step actually renders.
 *
 * ngOnInit is never called: it resolves companyId from localStorage and kicks
 * off facade loads. These exercise the controller's own logic against a form
 * built by setFormGroup(), which is what ngOnInit would have done.
 */
describe('JobCreateComponent -- stepper navigation and save mapping', () => {
  let component: JobCreateComponent;
  let fixture: ComponentFixture<JobCreateComponent>;

  let mockJobFacade: any;
  let mockDialog: any;
  let dialogAfterClosed$: Subject<any>;
  let mockHaptics: jasmine.SpyObj<HapticFeedbackService>;
  let queryParams$: Subject<any>;

  /** Build the component in either post mode, mirroring the ?postMode= param. */
  function createWith(postMode?: string) {
    queryParams$ = new Subject<any>();
    fixture = TestBed.createComponent(JobCreateComponent);
    component = fixture.componentInstance;
    queryParams$.next({ postMode });
    component.postMode = postMode === 'simplified' ? 'simplified' : 'comprehensive';
    component.setFormGroup();
  }

  beforeEach(async () => {
    dialogAfterClosed$ = new Subject<any>();
    queryParams$ = new Subject<any>();

    mockJobFacade = {
      jobDetails$: of(null),
      subsRestrictions$: of(null),
      loading$: of(false),
      saveInitialForm: jasmine.createSpy('saveInitialForm'),
      saveJobInfo: jasmine.createSpy('saveJobInfo'),
      saveInterview: jasmine.createSpy('saveInterview'),
      getIndustry: jasmine.createSpy('getIndustry'),
      getJobRole: jasmine.createSpy('getJobRole'),
      resetFormState: jasmine.createSpy('resetFormState'),
    };
    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => dialogAfterClosed$.asObservable(),
        close: () => {},
      }),
      closeAll: jasmine.createSpy('closeAll'),
    };
    mockHaptics = jasmine.createSpyObj('HapticFeedbackService',
      ['warning', 'success', 'selection', 'impact', 'error']);

    await TestBed.configureTestingModule({
      declarations: [JobCreateComponent],
      providers: [
        FormBuilder,
        { provide: JobFacade, useValue: mockJobFacade },
        { provide: MatDialog, useValue: mockDialog },
        { provide: HapticFeedbackService, useValue: mockHaptics },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']) },
        { provide: ActivatedRoute, useValue: { queryParams: queryParams$.asObservable() } },
        { provide: SnackbarService, useValue:
            jasmine.createSpyObj('SnackbarService', ['success', 'error', 'warning', 'info']) },
        { provide: ChangeDetectorRef, useValue: { detectChanges: () => {}, markForCheck: () => {} } },
        { provide: TalentProofService, useValue: {} },
        { provide: PublicPortalAnalyticsService, useValue: jasmine.createSpyObj(
            'PublicPortalAnalyticsService', ['trackHeroCTAClicked', 'trackFinalCTAClicked']) },
        { provide: JobReadinessService, useValue: { evaluate: () => null } },
        { provide: EasyJobPostAssistantService, useValue: { getExtractionResult: () => null } },
        { provide: AiCreateDraftService, useValue: jasmine.createSpyObj(
            'AiCreateDraftService', ['save', 'load', 'clear', 'hasDraft']) },
        { provide: JobService, useValue: jasmine.createSpyObj('JobService', ['getJobLevels']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  // -------------------------------------------------------------------------
  // Simplified mode hides Step 3
  // -------------------------------------------------------------------------
  describe('Simplified mode step visibility', () => {

    it('hides Step 3 from the visible stepper', () => {
      createWith('simplified');
      expect(component.visibleStepperItems.map(i => i.id)).toEqual([1, 2, 4]);
    });

    it('shows all four steps in Comprehensive mode', () => {
      createWith();
      expect(component.visibleStepperItems.map(i => i.id)).toEqual([1, 2, 3, 4]);
    });

    it('leaves the underlying stepperItems array untouched in Simplified mode', () => {
      // changeStep() and the template do index-based lookups
      // (stepperItems[this.stepper - 1]); filtering the real array would
      // silently shift every one of them.
      createWith('simplified');
      void component.visibleStepperItems;
      expect(component.stepperItems.map(i => i.id)).toEqual([1, 2, 3, 4]);
    });

    it('relabels Step 2 as Benefits in Simplified mode only', () => {
      createWith('simplified');
      expect(component.getStepTitle(2)).toBe('Benefits');
      createWith();
      expect(component.getStepTitle(2)).toBe('Requirements & Benefits');
    });
  });

  // -------------------------------------------------------------------------
  // Next/Back button labels must name the step actually landed on
  // -------------------------------------------------------------------------
  describe('next/back step titles', () => {

    it('names Step 4 as the next step from Step 2 in Simplified mode', () => {
      // Naive stepper + 1 would label the button with the hidden Step 3.
      createWith('simplified');
      component.stepper = 2;
      expect(component.nextStepTitle).toBe('Preview & Publish');
    });

    it('names Step 3 as the next step from Step 2 in Comprehensive mode', () => {
      createWith();
      component.stepper = 2;
      expect(component.nextStepTitle).toBe('Screening & Interview');
    });

    it('names Step 2 as the previous step from Step 4 in Simplified mode', () => {
      createWith('simplified');
      component.stepper = 4;
      expect(component.backStepTitle).toBe('Benefits');
    });

    it('names Step 3 as the previous step from Step 4 in Comprehensive mode', () => {
      createWith();
      component.stepper = 4;
      expect(component.backStepTitle).toBe('Screening & Interview');
    });
  });

  // -------------------------------------------------------------------------
  // Step gating
  // -------------------------------------------------------------------------
  describe('onNextStep() validation gating', () => {

    it('refuses to leave Step 1 while it is invalid', () => {
      createWith();
      component.stepper = 1;
      component.initialFormValid = false;

      component.onNextStep();

      expect(component.stepper).toBe(1);
      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockHaptics.warning).toHaveBeenCalled();
    });

    it('marks Step 1 fields as touched so the errors become visible', () => {
      createWith();
      component.stepper = 1;
      component.initialFormValid = false;

      component.onNextStep();

      expect(component.jobForm.controls['initialData'].touched).toBeTrue();
    });

    it('refuses to leave Step 2 while it is invalid', () => {
      createWith();
      component.stepper = 2;
      component.jobInfoValid = false;

      component.onNextStep();

      expect(component.stepper).toBe(2);
      expect(component.jobForm.controls['jobInfo'].touched).toBeTrue();
    });

    it('advances from Step 1 once it is valid', () => {
      createWith();
      component.stepper = 1;
      component.initialFormValid = true;

      component.onNextStep();

      expect(component.stepper).toBe(2);
    });
  });

  // -------------------------------------------------------------------------
  // The Step-3 skip
  // -------------------------------------------------------------------------
  describe('onNextStep() Step-3 skip in Simplified mode', () => {

    beforeEach(() => {
      createWith('simplified');
      component.stepper = 2;
      component.jobInfoValid = true;
    });

    it('jumps from Step 2 straight to Step 4, never landing on the hidden step', () => {
      component.onNextStep();
      expect(component.stepper).toBe(4);
    });

    it('still saves the Step 2 data it is leaving', () => {
      // The skip is done by hand rather than via changeStep(4) precisely so
      // this save is not lost -- changeStep()'s lookup assumes the step being
      // left is always (target - 1), which is false for this jump.
      component.onNextStep();
      expect(mockJobFacade.saveJobInfo).toHaveBeenCalled();
    });

    it('loads the reference data Step 4 needs', () => {
      component.onNextStep();
      expect(mockJobFacade.getIndustry).toHaveBeenCalled();
      expect(mockJobFacade.getJobRole).toHaveBeenCalled();
    });

    it('goes to Step 3 in Comprehensive mode instead', () => {
      createWith();
      component.stepper = 2;
      component.jobInfoValid = true;
      component.onNextStep();
      expect(component.stepper).toBe(3);
    });
  });

  describe('onBackStep() mirror of the skip', () => {

    it('goes from Step 4 back to Step 2 in Simplified mode', () => {
      createWith('simplified');
      component.stepper = 4;
      component.onBackStep();
      expect(component.stepper).toBe(2);
    });

    it('goes from Step 4 back to Step 3 in Comprehensive mode', () => {
      createWith();
      component.stepper = 4;
      component.onBackStep();
      expect(component.stepper).toBe(3);
    });
  });

  // -------------------------------------------------------------------------
  // Unsaved interview question guard
  // -------------------------------------------------------------------------
  describe('onNextStep() unsaved-question guard', () => {

    beforeEach(() => {
      createWith();
      component.stepper = 3;
      component.createInterviewRef = { hasPendingQuestion: () => true } as any;
    });

    it('does not advance while a question is still being typed', () => {
      component.onNextStep();
      expect(component.stepper).toBe(3);
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('advances when the Employer chooses to continue without adding it', () => {
      component.onNextStep();
      dialogAfterClosed$.next('continue');
      expect(component.stepper).toBe(4);
    });

    it('stays put when the Employer chooses to keep editing', () => {
      component.onNextStep();
      dialogAfterClosed$.next('close');
      expect(component.stepper).toBe(3);
    });

    it('advances normally when there is no pending question', () => {
      component.createInterviewRef = { hasPendingQuestion: () => false } as any;
      component.onNextStep();
      expect(component.stepper).toBe(4);
    });
  });

  // -------------------------------------------------------------------------
  // changeStep saves the step being LEFT
  // -------------------------------------------------------------------------
  describe('changeStep() save mapping', () => {

    it('saves Step 1 data when leaving Step 1', () => {
      createWith();
      component.stepper = 1;
      component.changeStep(2);
      expect(mockJobFacade.saveInitialForm).toHaveBeenCalled();
      expect(mockJobFacade.saveJobInfo).not.toHaveBeenCalled();
    });

    it('saves Step 3 data when navigating backwards from Step 3 to Step 2', () => {
      // The original bug: it used stepperItems[event - 2], which pointed at
      // Step 1's group here, so Step 3's edits were silently dropped from the
      // store that the Preview step renders.
      createWith();
      component.stepper = 3;
      component.changeStep(2);
      expect(mockJobFacade.saveInterview).toHaveBeenCalled();
      expect(mockJobFacade.saveInitialForm).not.toHaveBeenCalled();
    });

    it('saves Step 2 data on an arbitrary jump from Step 2 to Step 4', () => {
      createWith();
      component.stepper = 2;
      component.changeStep(4);
      expect(mockJobFacade.saveJobInfo).toHaveBeenCalled();
    });

    it('redirects a forward request for the hidden Step 3 to Step 4', () => {
      createWith('simplified');
      component.stepper = 2;
      component.changeStep(3);
      expect(component.stepper).toBe(4);
    });

    it('redirects a backward request for the hidden Step 3 to Step 2', () => {
      createWith('simplified');
      component.stepper = 4;
      component.changeStep(3);
      expect(component.stepper).toBe(2);
    });

    it('allows Step 3 in Comprehensive mode', () => {
      createWith();
      component.stepper = 2;
      component.changeStep(3);
      expect(component.stepper).toBe(3);
    });
  });

  // -------------------------------------------------------------------------
  // formatJob(): the Freelance sentinel must never reach the backend
  // -------------------------------------------------------------------------
  describe('formatJob() Freelance handling', () => {

    beforeEach(() => {
      createWith();
      component.companyId = 'COM-1';
      component.jobId = 'JOB-1';
    });

    it('converts the Freelance sentinel to null', () => {
      // gethired.job_type has no Freelance row and job_type_id is a real FK --
      // sending the sentinel string, or any invented number, breaks the insert.
      component.jobForm.controls['initialData'].patchValue({
        jobTypeId: FREELANCE_JOB_TYPE_SENTINEL,
      });

      expect(component.formatJob(1).jobTypeId).toBeNull();
    });

    it('passes a real job type id through untouched', () => {
      component.jobForm.controls['initialData'].patchValue({ jobTypeId: 2 });
      expect(component.formatJob(1).jobTypeId).toBe(2);
    });

    it('carries the requested status, company and job id', () => {
      const result = component.formatJob(2);
      expect(result.jobStatusId).toBe(2);
      expect(result.companyId).toBe('COM-1');
      expect(result.jobId).toBe('JOB-1');
    });

    it('merges both form groups into one flat payload', () => {
      component.jobForm.controls['initialData'].patchValue({ jobTitle: 'Engineer' });
      component.jobForm.controls['jobInfo'].patchValue({ salaryMinimum: 1000 });

      const result = component.formatJob(1);

      expect(result.jobTitle).toBe('Engineer');
      expect(result.salaryMinimum).toBe(1000);
    });
  });
});
