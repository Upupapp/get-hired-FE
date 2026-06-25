import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JobFacade } from '@app-job/state/job.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { UpdateQuestionComponent } from '@main/interview/update-question/update-question.component';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as InterviewModel from '@main/interview/interview.model';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-create-interview-questions',
  animations: [mainAnimations],
  templateUrl: './create-interview.component.html',
  styleUrls: ['./create-interview.component.scss']
})
export class CreateInterviewComponent implements OnInit {
  @Input() formGroupName: any;
  @Input() jobId: string;
  @Input() questions: InterviewModel.InterviewQuestion[];
  @Output() publishChanges = new EventEmitter();

  questionsContainer = [];
  tempFormArray = new FormArray([]);
  interviewQuestions: FormArray;
  interviewForm: FormGroup;

  private unsubscribe$ = new Subject<void>();
  editDialogSubs$: Subscription;
  success$ = this.jobFacade.success$
    .pipe().subscribe(this.afterSubmit.bind(this))

  constructor(
    private rootFormGroup: FormGroupDirective,
    private dialog: MatDialog,
    private jobFacade: JobFacade,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {

    this.interviewForm = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
    this.interviewQuestions = this.interviewForm.get('interviewQuestions') as FormArray;
    this.questionsContainer = this.questions ? [...this.questions]: [...this.interviewQuestions.value];

    // QA10 FIX-9: surface delete/update interview question 403 errors to the user.
    // updateJobQuestionFail and deleteJobQuestionFail both write to jobError$ in
    // the job store. Without this subscription the errors are written to state but
    // never displayed.
    this.jobFacade.jobError$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((err) => {
        if (err) {
          const msg = (err && (err.message || err.error)) || 'An error occurred. Please try again.';
          this.snackBar.open(msg, '', {
            duration: 4000,
            panelClass: ['danger-snackbar'],
          });
        }
      });
  }

  addQuestion(item) {
    this.interviewQuestions.push(new FormGroup({
      question: new FormControl(item.question),
      answerDuration: new FormControl(item.answerDuration),
      retakes: new FormControl(item.retakes),
      sequence: new FormControl(item.sequence),
    }));

    this.questionsContainer.push(item);
  }

  removeItem(index: number, controlArray: FormArray) {
    const questionId = this.questionsContainer[index].questionId;
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        action: 'Step 3',
      },
    });

    ref
      .afterClosed()
      .pipe()
      .subscribe((result) => {
        if (result == 1) {
          this.jobFacade.deleteJobInterview(questionId, this.jobId);

          this.questionsContainer.splice(index, 1);
          controlArray.removeAt(index);
          // this.publishChanges.emit();
        }
      });

      // console.log(this.interviewQuestions);

  }

  editItem(index: number) {
    const ref = this.dialog.open(UpdateQuestionComponent, {
      disableClose: true,
      data: {
        index: index + 1,
        interviewQuestion: this.interviewQuestions.value[index]
      },
    });

    this.editDialogSubs$ = ref
      .afterClosed()
      .pipe()
      .subscribe((result) => {
        if (result) {
          console.log(result);
          this.jobFacade.updateJobInterview(result);
        }
      });

  }

  afterSubmit(event) {
    if (event == 'updated') {
      this.questionsContainer = [...this.questions];

      this.snackBar.open(`Interview Question successfully updated`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });

      this.jobFacade.resetSuccessMsg();
    }

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if(this.editDialogSubs$) {
      this.editDialogSubs$.unsubscribe();
    }

    if(this.success$) {
      this.success$.unsubscribe();
    }
  }

}
