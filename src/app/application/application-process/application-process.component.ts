import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { CoreService } from '@app-core/services/core.service';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { LoadingComponent } from '@app-shared/components/loading/loading.component';
import { InterviewNotificationComponent } from '@main/views/home/pages/job-post-details-apply/steps/interview-questions/components/interview-notification/interview-notification.component';
import { Subject, takeUntil } from 'rxjs';
import * as JobModel from '@main/job/job.model';

@Component({
  selector: 'app-application-process',
  templateUrl: './application-process.component.html',
  styleUrls: ['./application-process.component.scss'],
  animations: [mainAnimations]
})
export class ApplicationProcessComponent implements OnInit {
  @Input() job: JobModel.Job;

  private unsubscribe$ = new Subject<void>();
  isLoggedIn: boolean = false;
  userId: string;
  applicationForm: FormGroup;

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

  profile$ = this.applicantFacade.applicantDetails$;

  pageLoad$ = this.applicantFacade.loading$
    .pipe().subscribe(this.formLoading.bind(this));

  constructor(
    private dialog: MatDialog,
    private coreService: CoreService,
    private applicantFacade: ApplicantFacade,
    private loadingDialog: MatDialog,
    private fb: FormBuilder
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

}
