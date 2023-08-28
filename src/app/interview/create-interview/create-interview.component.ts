import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JobFacade } from '@app-job/state/job.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { UpdateQuestionComponent } from '@main/interview/update-question/update-question.component';
import { Subscription} from 'rxjs';
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
  @Input() allowedToEdit: boolean = true;
  @Input() forJob: boolean = false;
  @Output() publishChanges = new EventEmitter();
  @Output() cancel = new EventEmitter();

  questionsContainer = [];
  tempFormArray = new FormArray([]);
  interviewQuestions: FormArray;
  interviewForm: FormGroup;

  editDialogSubs$: Subscription;
  success$ = this.jobFacade.success$
    .pipe().subscribe(this.afterSubmit.bind(this))

  constructor(
    private rootFormGroup: FormGroupDirective,
    private dialog: MatDialog,
    private jobFacade: JobFacade,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    if(this.formGroupName) {
      this.interviewForm = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
    } else {
      this.interviewForm = this.fb.group({
        templateName: [null, Validators.required],
        interviewQuestions: this.fb.array([]),
        interviewTemplateId: [null],
      });
    }
    this.interviewQuestions = this.interviewForm.get('interviewQuestions') as FormArray;
    this.questionsContainer = this.questions ? [...this.questions]: [...this.interviewQuestions.value]
  }

  addQuestion(item) {
    this.interviewQuestions.push(new FormGroup({
      question: new FormControl(item.question),
      answerDuration: new FormControl(item.answerDuration),
      retakes: new FormControl(item.retakes),
      sequence: new FormControl(item.sequence),
    }));

    this.questionsContainer.push(item);
    console.log(this.questionsContainer);
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

  getBack() {
    this.cancel.emit();
  }

  submitForm() {
    if(this.interviewForm.valid) {
      console.log(this.interviewForm.value);
      // TODO Submit form
    } else {
      this.interviewForm.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if(this.editDialogSubs$) {
      this.editDialogSubs$.unsubscribe();
    }

    if(this.success$) {
      this.success$.unsubscribe();
    }
  }

  get templateName_validators() {
    return this.interviewForm.get('templateName');
  }

}
