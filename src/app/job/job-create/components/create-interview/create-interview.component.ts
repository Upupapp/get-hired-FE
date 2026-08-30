import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { JobFacade } from '@app-job/state/job.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { UpdateQuestionComponent } from '@main/interview/update-question/update-question.component';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as InterviewModel from '@main/interview/interview.model';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';
import { CreateQuestionComponent } from '@main/interview/create-question/create-question.component';

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
  @ViewChild(CreateQuestionComponent) createQuestionRef: CreateQuestionComponent;

  hasPendingQuestion(): boolean {
    if (!this.createQuestionRef) return false;
    const ctrl = this.createQuestionRef.questionsForm && this.createQuestionRef.questionsForm.get('question');
    return !!(ctrl && ctrl.value && ctrl.value.toString().trim());
  }

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
    private snackbarService: SnackbarService,
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
          this.snackbarService.error(msg, '');
        }
      });
  }

  addQuestion(item) {
    // BUG #4 FIX (root cause): CreateQuestionComponent's own `sequence`
    // control is set once in its ngOnInit() from the questionIndex @Input
    // and never recomputed -- Angular doesn't re-run ngOnInit just because
    // an @Input value changes on a static (non-*ngFor) component instance,
    // and questionsForm.reset() after each add() restores that same
    // original value. So every question added after the first one in a
    // session emitted the SAME item.sequence. patchInterviewQuestionsFromResponse()
    // in job-create.component.ts matches newly-created questions back to
    // form controls by sequence -- colliding sequences meant multiple new
    // questions were misattributed to the same persisted questionId, so
    // most of them never learned their real id and kept getting
    // recreated as duplicates on every autosave. Compute the sequence here
    // instead, from the live container, ignoring whatever sequence the
    // child emitted.
    const nextSequence = this.questionsContainer.length
      ? Math.max(...this.questionsContainer.map((q) => q.sequence || 0)) + 1
      : 1;

    this.interviewQuestions.push(new FormGroup({
      question: new FormControl(item.question),
      answerDuration: new FormControl(item.answerDuration),
      retakes: new FormControl(item.retakes),
      sequence: new FormControl(nextSequence),
    }));

    this.questionsContainer.push({ ...item, sequence: nextSequence });
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
          // BUGFIX: a question added in this session (e.g. AI Assistant
          // prefill, or "Add question" before the job is first saved) has
          // no questionId yet -- it was never persisted. Dispatching
          // deleteJobInterview(undefined, jobId) sent a bogus backend
          // request that surfaced as a spurious error toast via jobError$
          // even though the local removal below is all that's needed.
          if (questionId) {
            this.jobFacade.deleteJobInterview(questionId, this.jobId);
          }

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
          // BUGFIX: neither interviewQuestions (the FormArray) nor
          // questionsContainer (what the template actually renders) was
          // ever patched with the edited fields -- this only dispatched to
          // the backend and waited for afterSubmit()'s broad 'updated'
          // reset, which itself rebuilds from interviewQuestions.value, so
          // the dialog closed but the old question text/duration/retakes
          // kept showing until an unrelated full form reload happened to
          // occur. Apply the edit locally now, matching removeItem()'s
          // existing optimistic-update pattern, so it reflects immediately.
          const group = this.interviewQuestions.at(index) as FormGroup;
          if (group) {
            group.patchValue(result);
          }
          this.questionsContainer[index] = { ...this.questionsContainer[index], ...result };

          // A question added this session (no questionId yet, never
          // persisted) has nothing to update on the backend -- same
          // unsaved-question guard as removeItem().
          if (result.questionId) {
            this.jobFacade.updateJobInterview(result);
          }
        }
      });

  }

  afterSubmit(event) {
    if (event == 'updated') {
      // BUGFIX: this.questions is a static @Input() snapshot from the
      // parent, never refreshed live -- resetting questionsContainer from
      // it could resurrect an already-deleted question (parent hadn't
      // re-emitted yet) and desync questionsContainer's indexes from the
      // live interviewQuestions FormArray, causing a later delete to pick
      // up the wrong questionId. Resync from the FormArray itself instead,
      // since that's the array removeItem()/editItem() actually operate on.
      this.questionsContainer = [...this.interviewQuestions.value];

      this.snackbarService.success(`Interview Question successfully updated`, '');

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
