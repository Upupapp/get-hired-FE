import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { UpdateQuestionComponent } from '@main/interview/update-question/update-question.component';
import { Subscription } from 'rxjs';
import * as InterviewModel from '@main/interview/interview.model';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';
import { InterviewFacade } from '../state/interview.facade';

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
  @Input() forJob: boolean = true;
  @Output() publishChanges = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() created = new EventEmitter();
  @Output() onDelete = new EventEmitter();
  @Output() onUpdate = new EventEmitter();


  questionsContainer = [];
  tempFormArray = new FormArray([]);
  interviewQuestions: FormArray;
  interviewForm: FormGroup;

  editDialogSubs$: Subscription;
  // TODO for job create
  // success$ = this.jobFacade.success$
  //   .pipe().subscribe(this.afterSubmit.bind(this))

  success$ = this.interviewFacade.success$
    .pipe().subscribe(this.afterSubmit.bind(this))

  constructor(
    private rootFormGroup: FormGroupDirective,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private interviewFacade: InterviewFacade
  ) { }

  ngOnInit(): void {
    console.log(this.forJob)
    if (this.formGroupName) {
      this.interviewForm = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
    } else {
      this.interviewForm = this.fb.group({
        templateName: [null, Validators.required],
        interviewQuestions: this.fb.array([]),
        interviewTemplateId: [null],
      });
    }
    this.interviewQuestions = this.interviewForm.get('interviewQuestions') as FormArray;
    this.questionsContainer = this.questions ? [...this.questions] : [...this.interviewQuestions.value]
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
        action: this.forJob ? 'Step 3' : 'Delete',
      },
    });

    ref
      .afterClosed()
      .pipe()
      .subscribe((result) => {
        if (result == 1) {
          this.questionsContainer.splice(index, 1);
          controlArray.removeAt(index);

          if (this.forJob) {
            this.onDelete.emit({ questionId, jobId: this.jobId });
          }
        }
      });
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
          if (this.forJob) {
            this.interviewFacade.updateJobInterview(result);
          } else {
            // TODO
          }
        }
      });


  }

  afterSubmit(event) {
    if (event == 'created') {
      this.snackBar.open(`Interview Question successfully created`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });

      this.created.emit();
    } else if (event == 'updated') {
      this.questionsContainer = [...this.questions];
      this.snackBar.open(`Interview Question successfully updated`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });

      if (this.forJob) {
        this.onUpdate.emit();
      }
    }
  }

  getBack() {
    this.cancel.emit();
  }

  submitForm() {
    if (this.interviewForm.valid) {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log(this.interviewForm.value);
      this.interviewFacade.saveQuestionTemplate({
        ...this.interviewForm.value,
        companyId: user.companyId
      });
    } else {
      this.interviewForm.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.editDialogSubs$) {
      this.editDialogSubs$.unsubscribe();
    }

    if (this.success$) {
      this.success$.unsubscribe();
    }
  }

  get templateName_validators() {
    return this.interviewForm.get('templateName');
  }

}
