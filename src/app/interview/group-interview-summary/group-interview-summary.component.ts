import { Component, Input, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '../interview.model';
import { InterviewFacade } from '../state/interview.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingComponent } from '@app-shared/components/loading/loading.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-group-interview-summary',
  templateUrl: './group-interview-summary.component.html',
  styleUrls: ['./group-interview-summary.component.scss'],
  animations: [mainAnimations]
})
export class GroupInterviewSummaryComponent implements OnInit {
  @Input() details: Model.GroupInterview;

  templateQuestions$ = this.interviewFacade.interviewTemplateQuestions$;
  recipientsEmail: string[] = [];
  recipientDisplay: string[] = [];
  interview: Model.GroupInterview;

  success$ = this.interviewFacade.success$
    .pipe().subscribe(this.afterSubmit.bind(this))

  loading$ = this.interviewFacade.loading$
    .pipe().subscribe(this.formLoading.bind(this));

  constructor(
    private interviewFacade: InterviewFacade,
    private router: Router,
    private route: ActivatedRoute,
    private loadingDialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    if (this.details && this.details.interviewTemplateQuestionId) {
      this.interviewFacade.getInterviewTemplateQuestions(this.details.interviewTemplateQuestionId)
    }

    this.interview = {
      groupInterviewName: this.details.groupInterviewName,
      interviewTemplateQuestionId: this.details.interviewTemplateQuestionId,
      interviewTemplateQuestionName: this.details.interviewTemplateQuestionName,
      jobId: this.details.jobId,
      externalJobLink: this.details.externalJobLink,
      recipients: this.details.recipients,
      groupIds: this.details.groups.map(group => group.group_id),
      companyId: this.details.companyId,
      groups: this.details.groups
    }

  }

  publishInterview() {
    this.interviewFacade.saveInterview(this.interview);
  }

  afterSubmit(event) {
    if (event == 'created') {
      this.interview = null;
      this.snackBar.open(`Your group interview has been sent`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
      });
      this.router.navigate(['../'], { relativeTo: this.route });
    }
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
      setTimeout(() => this.loadingDialog.closeAll(), 3000);
    }
  }

}
