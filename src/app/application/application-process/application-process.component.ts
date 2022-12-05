import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { CoreService } from '@app-core/services/core.service';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { LoadingComponent } from '@app-shared/components/loading/loading.component';
import { InterviewNotificationComponent } from '@main/views/home/pages/job-post-details-apply/steps/interview-questions/components/interview-notification/interview-notification.component';
import { Subject, takeUntil, tap } from 'rxjs';
import * as JobModel from '@main/job/job.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicationFacade } from '../state/application.facade';

@Component({
  selector: 'app-application-process',
  templateUrl: './application-process.component.html',
  styleUrls: ['./application-process.component.scss'],
  animations: [mainAnimations]
})
export class ApplicationProcessComponent implements OnInit {
  @Input() job: JobModel.Job;
  @Output() apply = new EventEmitter();

  private unsubscribe$ = new Subject<void>();
  isLoggedIn: boolean = false;
  userId: string;
  applicationForm: FormGroup;
  user: any;

  stepperItems: any[] = [
    {
      id: 1,
      title: "My Details",
      valid: true
    },

    {
      id: 2,
      title: "Additional Documents",
      valid: true
    },

    {
      id: 3,
      title: "Interview",
      valid: true
    },

    {
      id: 4,
      title: "Summary",
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
      tap(user => this.user = user)
    );

  pageLoad$ = this.applicantFacade.loading$
    .pipe().subscribe(this.formLoading.bind(this));

  success$ = this.applicationFacade.success$
    .pipe().subscribe(this.afterSubmit.bind(this))

  constructor(
    private dialog: MatDialog,
    private coreService: CoreService,
    private applicantFacade: ApplicantFacade,
    private loadingDialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private applicationFacade: ApplicationFacade
  ) { }

  ngOnInit(): void {
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
      })
    })
  }

  submitApplication() {
    const application = {
      ...this.applicationForm.controls.profileDocs.value,
      jobId: this.job.jobId,
      candidateId: this.userId
    }

    this.applicationFacade.submitApplication(application)
  }

  afterSubmit(event) {
    if (event == 'submitted') {
      this.snackBar.open(`You have been successfully Applied to this job`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
      });

      this.apply.emit(false);
    }
  }

  changeStep(step: number): void {
    console.log(4);
    this.stepper = step;

    if (step === 3) {
      this.openInterviewNotification()
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
        console.log(result)

        if (result?.skip) {
          this.changeStep(4);
        }
      });
  }

  formLoading(loading: boolean) {
    if (loading) {
      const ref = this.loadingDialog.open(LoadingComponent, {
        disableClose: true,
        data: {
          selfClose: false
        }
      });
    } else {
      setTimeout(() => this.loadingDialog.closeAll(), 2000);
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if(this.success$) {
      this.success$.unsubscribe();
    }
  }

}
