import { Component, EventEmitter, Input, OnInit, Output, HostListener } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { CoreService } from '@app-core/services/core.service';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { LoadingComponent } from '@app-shared/components/loading/loading.component';
import { Subject, takeUntil, tap } from 'rxjs';
import * as JobModel from '@main/job/job.model';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { ApplicationFacade } from '../state/application.facade';
import * as ApplicantModel from '@main/applicant/applicant.model';
import { RecordLoadingComponent } from '@app-shared/components/record-loading/record-loading.component';
import { TranslateService } from '@ngx-translate/core';
import { InterviewNotificationComponent } from './steps/interview-questions/components/interview-notification/interview-notification.component';
import { environment } from '@environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-application-process',
  templateUrl: './application-process.component.html',
  styleUrls: ['./application-process.component.scss'],
  animations: [mainAnimations]
})
export class ApplicationProcessComponent implements OnInit {
  @Input() job: JobModel.Job;
  @Output() apply = new EventEmitter();

  env = environment;

  private unsubscribe$ = new Subject<void>();
  isLoggedIn: boolean = false;
  userId: string;
  applicationForm: FormGroup;
  user: ApplicantModel.Applicant;
  isSubmitting: boolean;
  // LAUNCH-01: tracks submission lifecycle for inline feedback panels
  submitStatus: string = 'idle'; // idle | submitting | success | error | duplicate
  submitError: string = '';
  // Forces app-interview-questions to the Answers tab after a
  // PAYLOAD_TOO_LARGE submit failure, so the flagged oversized video is
  // immediately visible rather than the default Questions tab.
  interviewTabOverride: string = 'questions';

  stepperItems: any[] = [
    {
      id: 1,
      title: this.translate.instant('USER_APPLICATION_PAGE.USER_INFORMATION_SECTION'),
      valid: true
    },
    {
      id: 2,
      title: this.translate.instant('USER_APPLICATION_PAGE.EXTRA_DOCUMENTS_SECTION'),
      valid: true
    },

    {
      id: 3,
      title: this.translate.instant('USER_APPLICATION_PAGE.INTERVIEW_SECTION'),
      valid: true
    },

    {
      id: 4,
      title: this.translate.instant('USER_APPLICATION_PAGE.SUMMARY_SECTION'),
      valid: true
    },
  ];

  // public stepperItems: any[] = [
  //   {
  //     id: 1,
  //     // title: "Create Account",
  //   },
  //   {
  //     id: 2,
  //     // title: "Profile Details",
  //   },
  //   {
  //     id: 3,
  //     // title: "Skills and Experience",
  //     // disabled: false,
  //   },
  //   {
  //     id: 4,
  //     title: "Additional Documents",
  //     // valid: true
  //   },

  //   {
  //     id: 5,
  //     // title: "Interview",
  //     // valid: true
  //   },
  //   {
  //     id: 6,
  //     title: "Summary",
  //     valid: true
  //   }
  // ]

  public stepper: number = 1;


  profile$ = this.applicantFacade.applicantDetails$
    .pipe(
      tap(user => {
        this.user = user;

        this.stepperItems[1].disabled = !user;
        this.stepperItems[2].disabled = !user || this.job && this.job.interviewQuestions.length == 0;
        this.stepperItems[3].disabled = !user;
      })
    );

  pageLoad$ = this.applicantFacade.loading$
    .pipe().subscribe(this.formLoading.bind(this));

  // LAUNCH-01: subscribe to combined result (success + error + errorCode) in one handler
  success$ = this.applicationFacade.submitResult$
    .pipe().subscribe(this.afterSubmit.bind(this))

  constructor(
    private dialog: MatDialog,
    private coreService: CoreService,
    private applicantFacade: ApplicantFacade,
    private loadingDialog: MatDialog,
    private fb: FormBuilder,
    private snackbarService: SnackbarService,
    private applicationFacade: ApplicationFacade,
    private translate: TranslateService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log(this.user)

    // if (this.job && this.job.interviewQuestions.length == 0 && !this.user) {
    //   this.stepperItems[2].disabled = true;
    // }

    this.isLoggedIn = this.coreService.isLoggedIn();
    this.coreService.getUserId()
      .then(userId => {
        this.userId = userId;
        this.applicantFacade.getApplicantById(this.userId);
      });

    if (this.userId) {
      this.applicantFacade.getApplicantById(this.userId);
    }

    this.initializedForm();
  }

  initializedForm() {
    this.applicationForm = this.fb.group({
      profileDocs: this.fb.group({
        coverLetter: this.fb.array([]),
        resume: this.fb.array([]),
        governmentFiles: this.fb.array([])
      }),
      interviewAnswers: this.fb.array([])
    })
  }

  submitApplication() {
    if (this.submitStatus === 'submitting') return;
    this.submitStatus = 'submitting';
    this.isSubmitting = true;
    this.submitError = '';
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    const application = {
      ...this.applicationForm.controls.profileDocs.value,
      interviewAnswers: [...this.applicationForm.controls.interviewAnswers.value],
      jobId: this.job.jobId,
      candidateId: this.userId,
      applicantId: this.user.applicantProfileId
    }

    this.applicationFacade.submitApplication(application);
  }

  // LAUNCH-01: handles the combined submitResult$ emission (success + error + errorCode)
  afterSubmit(result: any) {
    if (!result || (!result.success && !result.error && !result.errorCode)) return;

    if (result.success === 'submitted') {
      this.submitStatus = 'success';
      this.isSubmitting = false;
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      this.snackbarService.success('Application submitted! Check your email for confirmation.', '', 5000);
      return;
    }

    if (result.errorCode === 'JOB_APPLICATION_ALREADY_EXISTS') {
      this.submitStatus = 'duplicate';
      this.isSubmitting = false;
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }

    // BUGFIX: a 413 gave the applicant a dead-end generic error with no way
    // to tell which upload was the problem. Sends them straight back to the
    // Answers tab, where each recorded answer now shows its size and a
    // Remove button (interview-questions.component.ts/.html) so they can
    // drop the oversized video and re-record it instead of restarting.
    if (result.errorCode === 'PAYLOAD_TOO_LARGE') {
      this.submitStatus = 'error';
      this.isSubmitting = false;
      this.submitError = (typeof result.error === 'string' && result.error.trim())
        ? result.error
        : 'One of your uploaded files is too large -- this is most often a recorded video interview answer.';
      this.stepper = 3;
      this.interviewTabOverride = 'answers';
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }

    if (result.error) {
      this.submitStatus = 'error';
      this.isSubmitting = false;
      // Surface the backend's actual error text when it's a real, user-safe
      // message (application.effects.ts already extracts errBody.error/
      // message from the failed response) -- this used to always show a
      // generic "check your connection" string regardless of the real
      // cause (validation failure, permission issue, server error, etc.),
      // which made every submission failure look identical and undiagnosable.
      this.submitError = (typeof result.error === 'string' && result.error.trim())
        ? result.error
        : 'We couldn\'t submit your application. Please check your connection and try again.';
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }

  changeStep(step: number): void {
    this.stepper = step;

    if (step === 3) {
      this.openInterviewNotification()
    }
  }

  // Convenience "Next" buttons (top + bottom of each step, steps 1-2) reuse
  // this same changeStep() advance logic -- no separate validation path.
  goToNextStep(): void {
    if (this.stepper < 4) {
      this.changeStep(this.stepper + 1);
    }
  }

  openInterviewNotification(data?: any) {
    let dialogModal = this.dialog.open(
      InterviewNotificationComponent,
      {
        width: '37vw',
        data: data,
      }
    );

    dialogModal
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {
        if (result?.skip) {
          this.changeStep(4);
        }
      });
  }

  formLoading(loading: boolean) {
    if (loading) {
      const ref = this.loadingDialog.open(RecordLoadingComponent, {
        disableClose: true,
        data: {
          selfClose: false
        }
      });
    } else {
      setTimeout(() => this.loadingDialog.closeAll(), 5000);
    }
  }

  /**
   * PROFILE-SETUP PHASE 1 FIX (confirmed P1): previously a bare
   * navigateByUrl with no job context at all -- after completing/updating
   * their profile, the applicant was never returned to the job they were
   * trying to apply for. Reuses the existing `returnURL` localStorage
   * mechanism (already established for the job-detail "log in to apply"
   * flow -- see job-posts-details.component.ts toLogin() /
   * signin.component.ts) rather than inventing a parallel one. Consumed
   * once on the profile-edit side (read + immediately removed) so it can
   * never leak into a later, unrelated session.
   */
  redirectToUpdate() {
    if (this.job && this.job.jobId) {
      localStorage.setItem('returnURL', `/jobs/details/${this.job.jobId}`);
    }
    this.router.navigateByUrl('user/profile/edit')
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.success$) {
      this.success$.unsubscribe();
    }

    if (this.pageLoad$) {
      this.pageLoad$.unsubscribe();
    }

    this.applicationFacade.resetApplication();

  }


  public showEvaluateButton: boolean = true;

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event) {
    let scrollPosition = window.pageYOffset;
    let mainHeight = window.innerHeight - 100;
    if (scrollPosition <= mainHeight) {
      this.showEvaluateButton = false;
    }

    else {
      this.showEvaluateButton = true;
    }
    console.debug("Scroll Event", window.pageYOffset, window.innerHeight);
  }
}
