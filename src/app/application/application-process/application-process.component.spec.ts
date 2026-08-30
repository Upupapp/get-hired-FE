import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';

import { ApplicationProcessComponent } from './application-process.component';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { ApplicationFacade } from '../state/application.facade';
import { CoreService } from '@app-core/services/core.service';
import { SnackbarService } from '@app-core/services/snackbar.service';

/**
 * Behavioural specs for the apply-flow controller.
 *
 * This component had no spec at all, only its child steps did, and it owns the
 * parts of applying that fail silently: the double-submit guard, what actually
 * gets sent to the backend, and the four different ways a submission can come
 * back. `submitResult$` carries success, error and errorCode in one emission
 * (LAUNCH-01), so every branch below is reachable from a single stream and a
 * regression in one arm looks identical to the user -- the form simply sits there.
 *
 * The component is created but never change-detected: these assert controller
 * behaviour, not the template.
 */
describe('ApplicationProcessComponent -- submit lifecycle', () => {
  let component: ApplicationProcessComponent;
  let fixture: ComponentFixture<ApplicationProcessComponent>;

  let submitResult$: Subject<any>;
  let mockApplicationFacade: any;
  let mockApplicantFacade: any;
  let mockSnackbar: jasmine.SpyObj<SnackbarService>;
  let mockDialog: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let dialogAfterClosed$: Subject<any>;

  const JOB: any = { jobId: 'JOB-1', interviewQuestions: [] };
  const JOB_WITH_QUESTIONS: any = { jobId: 'JOB-1', interviewQuestions: [{ question: 'Why this role?' }] };
  const USER: any = { applicantProfileId: 'APP-PROFILE-1' };

  beforeEach(async () => {
    submitResult$ = new Subject<any>();
    dialogAfterClosed$ = new Subject<any>();

    mockApplicationFacade = {
      submitResult$: submitResult$.asObservable(),
      submitApplication: jasmine.createSpy('submitApplication'),
      // ngOnDestroy calls this, and the TestBed tears components down after
      // every spec, so omitting it fails each one during cleanup rather than
      // in the assertion.
      resetApplication: jasmine.createSpy('resetApplication'),
    };
    mockApplicantFacade = {
      applicantDetails$: of(null),
      loading$: of(false),
      getApplicantById: jasmine.createSpy('getApplicantById'),
    };
    mockSnackbar = jasmine.createSpyObj('SnackbarService', ['success', 'error', 'warning', 'info']);
    mockDialog = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => dialogAfterClosed$.asObservable(),
      }),
      closeAll: jasmine.createSpy('closeAll'),
    };
    mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      declarations: [ApplicationProcessComponent],
      providers: [
        FormBuilder,
        { provide: MatDialog, useValue: mockDialog },
        { provide: ApplicantFacade, useValue: mockApplicantFacade },
        { provide: ApplicationFacade, useValue: mockApplicationFacade },
        { provide: SnackbarService, useValue: mockSnackbar },
        { provide: Router, useValue: mockRouter },
        { provide: CoreService, useValue: {
            isLoggedIn: () => true,
            getUserId: () => Promise.resolve('USER-1'),
        } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationProcessComponent);
    component = fixture.componentInstance;
    component.job = JOB;
    component.user = USER;
    component.userId = 'USER-1';
    component.initializedForm();
  });

  afterEach(() => TestBed.resetTestingModule());

  // -------------------------------------------------------------------------
  // Double-submit guard
  // -------------------------------------------------------------------------
  describe('submitApplication() double-submit guard', () => {

    it('submits once on the first call', () => {
      component.submitApplication();
      expect(mockApplicationFacade.submitApplication).toHaveBeenCalledTimes(1);
    });

    it('ignores a second call while the first is still in flight', () => {
      // The guard is the only thing standing between an impatient double-click
      // and two applications for the same job -- the backend rejects the second
      // with JOB_APPLICATION_ALREADY_EXISTS, so the applicant sees the duplicate
      // panel for their own successful application.
      component.submitApplication();
      component.submitApplication();
      component.submitApplication();
      expect(mockApplicationFacade.submitApplication).toHaveBeenCalledTimes(1);
    });

    it('allows a retry once the submission has failed', () => {
      component.submitApplication();
      component.afterSubmit({ error: 'Server exploded' });
      component.submitApplication();
      expect(mockApplicationFacade.submitApplication).toHaveBeenCalledTimes(2);
    });

    it('sets submitting state and clears any previous error', () => {
      component.submitError = 'a stale error from last time';
      component.submitApplication();
      expect(component.submitStatus).toBe('submitting');
      expect(component.isSubmitting).toBeTrue();
      expect(component.submitError).toBe('');
    });
  });

  // -------------------------------------------------------------------------
  // Payload composition
  // -------------------------------------------------------------------------
  describe('submitApplication() payload', () => {

    it('sends the job, candidate and applicant identifiers', () => {
      component.submitApplication();
      const payload = mockApplicationFacade.submitApplication.calls.mostRecent().args[0];
      expect(payload.jobId).toBe('JOB-1');
      expect(payload.candidateId).toBe('USER-1');
      expect(payload.applicantId).toBe('APP-PROFILE-1');
    });

    it('flattens profileDocs onto the payload rather than nesting them', () => {
      component.submitApplication();
      const payload = mockApplicationFacade.submitApplication.calls.mostRecent().args[0];
      expect(payload.profileDocs).toBeUndefined();
      expect(payload.resume).toBeDefined();
      expect(payload.coverLetter).toBeDefined();
      expect(payload.governmentFiles).toBeDefined();
    });

    it('includes interviewAnswers as a copied array', () => {
      component.submitApplication();
      const payload = mockApplicationFacade.submitApplication.calls.mostRecent().args[0];
      expect(Array.isArray(payload.interviewAnswers)).toBeTrue();
      // Copied, not the live FormArray value -- mutating the form afterwards
      // must not retroactively change what was submitted.
      expect(payload.interviewAnswers)
        .not.toBe(component.applicationForm.controls.interviewAnswers.value);
    });
  });

  // -------------------------------------------------------------------------
  // afterSubmit(): the four result shapes
  // -------------------------------------------------------------------------
  describe('afterSubmit()', () => {

    it('ignores an empty or meaningless result without changing state', () => {
      component.submitStatus = 'submitting';
      for (const noop of [null, undefined, {}, { success: null, error: null, errorCode: null }]) {
        component.afterSubmit(noop);
        expect(component.submitStatus)
          .withContext(`result=${JSON.stringify(noop)}`).toBe('submitting');
      }
    });

    it('is wired to submitResult$, not only callable directly', () => {
      submitResult$.next({ success: 'submitted' });
      expect(component.submitStatus).toBe('success');
    });

    describe('success', () => {
      beforeEach(() => component.afterSubmit({ success: 'submitted' }));

      it('moves to the success state and stops submitting', () => {
        expect(component.submitStatus).toBe('success');
        expect(component.isSubmitting).toBeFalse();
      });

      it('confirms with a success snack', () => {
        expect(mockSnackbar.success).toHaveBeenCalled();
      });

      it('does not report an error', () => {
        expect(component.submitError).toBe('');
        expect(mockSnackbar.error).not.toHaveBeenCalled();
      });
    });

    describe('duplicate application', () => {
      beforeEach(() => component.afterSubmit({ errorCode: 'JOB_APPLICATION_ALREADY_EXISTS' }));

      it('uses the dedicated duplicate state, not the generic error state', () => {
        // The duplicate panel explains the applicant already applied. Falling
        // through to 'error' would tell them to check their connection instead.
        expect(component.submitStatus).toBe('duplicate');
        expect(component.isSubmitting).toBeFalse();
      });
    });

    describe('payload too large', () => {

      it('sends the applicant back to the Answers tab of the interview step', () => {
        // A 413 is almost always an oversized recorded video. Landing anywhere
        // else leaves them with no way to find and remove the offending file.
        component.afterSubmit({ errorCode: 'PAYLOAD_TOO_LARGE' });
        expect(component.submitStatus).toBe('error');
        expect(component.stepper).toBe(3);
        expect(component.interviewTabOverride).toBe('answers');
      });

      it('explains that a file is too large when the backend gives no message', () => {
        component.afterSubmit({ errorCode: 'PAYLOAD_TOO_LARGE' });
        expect(component.submitError).toContain('too large');
      });

      it('prefers the backend message when there is one', () => {
        component.afterSubmit({ errorCode: 'PAYLOAD_TOO_LARGE', error: 'Video exceeds 6MB.' });
        expect(component.submitError).toBe('Video exceeds 6MB.');
      });
    });

    describe('generic failure', () => {

      it('surfaces the backend error text verbatim', () => {
        // This used to always show one generic string, which made every
        // failure -- validation, permission, server -- look identical.
        component.afterSubmit({ error: 'Your CV is required for this job.' });
        expect(component.submitStatus).toBe('error');
        expect(component.submitError).toBe('Your CV is required for this job.');
      });

      it('falls back to a generic message when the error is not usable text', () => {
        for (const err of [{ some: 'object' }, '   ', true]) {
          component.submitError = '';
          component.afterSubmit({ error: err });
          expect(component.submitError)
            .withContext(`error=${JSON.stringify(err)}`).toContain('couldn\'t submit');
        }
      });

      it('stops submitting so the applicant can retry', () => {
        component.afterSubmit({ error: 'nope' });
        expect(component.isSubmitting).toBeFalse();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Step navigation
  // -------------------------------------------------------------------------
  describe('changeStep()', () => {

    it('moves to the requested step', () => {
      component.changeStep(2);
      expect(component.stepper).toBe(2);
    });

    it('opens the interview notification when entering step 3 with interview questions', () => {
      component.job = JOB_WITH_QUESTIONS;
      component.changeStep(3);
      expect(mockDialog.open).toHaveBeenCalled();
      expect(component.stepper).toBe(3);
    });

    it('does not open the interview notification for other steps', () => {
      mockDialog.open.calls.reset();
      component.changeStep(2);
      component.changeStep(4);
      expect(mockDialog.open).not.toHaveBeenCalled();
    });

    // BUGFIX regression test: a job with no interview questions left Step 3
    // genuinely empty and still opened InterviewNotificationComponent with
    // no data, rendering as a blank panel. Entering step 3 must now skip
    // straight to Step 4 (Summary) instead, exactly like using the
    // existing "Skip Interview" escape hatch.
    it('skips step 3 entirely and goes to Summary when the job has no interview questions', () => {
      mockDialog.open.calls.reset();
      component.job = JOB; // interviewQuestions: []
      component.changeStep(3);
      expect(mockDialog.open).not.toHaveBeenCalled();
      expect(component.stepper).toBe(4);
    });

    it('skips step 3 entirely when job is not yet loaded at all', () => {
      mockDialog.open.calls.reset();
      component.job = undefined as any;
      component.changeStep(3);
      expect(mockDialog.open).not.toHaveBeenCalled();
      expect(component.stepper).toBe(4);
    });

    it('skips to the summary step when the interview notification is dismissed with skip', () => {
      component.job = JOB_WITH_QUESTIONS;
      component.changeStep(3);
      dialogAfterClosed$.next({ skip: true });
      expect(component.stepper).toBe(4);
    });

    it('stays on the interview step when the notification is closed without skipping', () => {
      component.job = JOB_WITH_QUESTIONS;
      component.changeStep(3);
      dialogAfterClosed$.next(undefined);
      expect(component.stepper).toBe(3);
    });
  });

  // -------------------------------------------------------------------------
  // Return-to-job after editing the profile
  // -------------------------------------------------------------------------
  describe('redirectToUpdate()', () => {

    beforeEach(() => localStorage.removeItem('returnURL'));
    afterEach(() => localStorage.removeItem('returnURL'));

    it('stores the job to come back to before navigating away', () => {
      // Without this the applicant finishes editing their profile and is
      // dropped somewhere unrelated, having lost the job they were applying for.
      component.redirectToUpdate();
      expect(localStorage.getItem('returnURL')).toBe('/jobs/details/JOB-1');
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('user/profile/edit');
    });

    it('still navigates when there is no job context to store', () => {
      component.job = undefined as any;
      component.redirectToUpdate();
      expect(localStorage.getItem('returnURL')).toBeNull();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('user/profile/edit');
    });
  });
});
